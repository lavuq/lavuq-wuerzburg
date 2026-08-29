// LAVUQ Gruppenfinder – automatische Ersatzkandidaten-Bewertung v1
// Berechnet nach einer Absage den bestgeeigneten Ersatzkandidaten.
// Diese Datei verändert KEINE Airtable-Daten, erzeugt KEINE Tokens und versendet KEINE Einladungen.

import { weightedPairScore, rankReplacementCandidates } from "./gruppenfinder.js";
import {
  profileFromAirtableFields,
  scoreProfilePairWithDistance,
} from "./gruppenfinder-profile-scoring.js";

const FIELD_ACTIVE_PROFILE = "fld3AfxsslBlRpG4B";
const FIELD_MATCHING_READY = "fld3fw7Siu6ePkbjN";

function isTrue(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function candidateIsPoolEligible(candidate) {
  const fields = candidate?.fields || {};
  return isTrue(fields[FIELD_ACTIVE_PROFILE]) && isTrue(fields[FIELD_MATCHING_READY]);
}

async function calculateCandidatePairScores(candidate, remainingMembers, fetchImpl) {
  const candidateProfile = profileFromAirtableFields(candidate.fields || {});
  const pairResults = [];

  for (const member of remainingMembers) {
    const memberProfile = profileFromAirtableFields(member.fields || {});
    const profileResult = await scoreProfilePairWithDistance(
      candidateProfile,
      memberProfile,
      fetchImpl
    );

    if (!profileResult.hardFilterPassed) {
      return {
        eligible: false,
        reason: profileResult.exclusionReason || "Hard-Filter nicht bestanden.",
        pairResults,
      };
    }

    const weighted = weightedPairScore(profileResult.scores, {
      hardFilterPassed: profileResult.hardFilterPassed,
    });

    if (!weighted.eligible || weighted.score == null) {
      return {
        eligible: false,
        reason: "Paar-Score konnte nicht vollständig berechnet werden.",
        pairResults,
      };
    }

    pairResults.push({
      memberApplicantId: member.id,
      score: weighted.score,
      recommendation: weighted.recommendation,
      distanceKm: profileResult.distance?.km ?? null,
      components: profileResult.scores,
    });
  }

  return {
    eligible: true,
    pairResults,
    pairScores: pairResults.map((item) => item.score),
  };
}

// Eingaben:
// - remainingMembers: genau 3 Bewerberdatensätze der verbleibenden Gruppe
// - existingPairScores: genau 3 bestehende Paar-Scores zwischen diesen 3 Personen
// - candidates: Bewerberpool
// - excludedApplicantIds: z. B. bereits/zuletzt in der Gruppe befindliche Bewerber
// - committedApplicantIds: Bewerber, die bereits verbindlich einer anderen Gruppe zugeordnet sind
//
// Ausgabe: sortierte Vorschläge + bester Vorschlag. Keine Schreiboperationen.
export async function findBestReplacementCandidate({
  remainingMembers,
  existingPairScores,
  candidates,
  excludedApplicantIds = [],
  committedApplicantIds = [],
  fetchImpl = fetch,
}) {
  if (!Array.isArray(remainingMembers) || remainingMembers.length !== 3) {
    throw new Error("Für die Ersatzsuche werden genau 3 verbleibende Gruppenmitglieder benötigt.");
  }

  const excluded = new Set(excludedApplicantIds);
  const committed = new Set(committedApplicantIds);

  const evaluated = [];

  for (const candidate of Array.isArray(candidates) ? candidates : []) {
    if (!candidate?.id || !candidate?.fields) continue;
    if (excluded.has(candidate.id)) continue;
    if (committed.has(candidate.id)) continue;
    if (!candidateIsPoolEligible(candidate)) continue;

    const pairEvaluation = await calculateCandidatePairScores(
      candidate,
      remainingMembers,
      fetchImpl
    );

    if (!pairEvaluation.eligible) {
      evaluated.push({
        applicantId: candidate.id,
        eligible: false,
        reason: pairEvaluation.reason,
        pairResults: pairEvaluation.pairResults,
      });
      continue;
    }

    evaluated.push({
      applicantId: candidate.id,
      pairScores: pairEvaluation.pairScores,
      pairResults: pairEvaluation.pairResults,
    });
  }

  const rankable = evaluated.filter((item) => Array.isArray(item.pairScores));
  const ranked = rankReplacementCandidates(rankable, existingPairScores);
  const ineligible = evaluated.filter((item) => !Array.isArray(item.pairScores));
  const allResults = [...ranked, ...ineligible];

  const best = ranked.find((item) => item.eligible) || null;

  return {
    best,
    ranked: allResults,
    evaluatedCandidates: evaluated.length,
    suitableCandidates: ranked.filter((item) => item.eligible).length,
  };
}
