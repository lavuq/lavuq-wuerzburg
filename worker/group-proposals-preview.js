// LAVUQ – read-only 4er-Gruppen-Vorschläge
// Liest freigegebene Bewerber und berechnet mögliche Gruppen.
// Schreibt NICHTS nach Airtable, erstellt keine Gruppen und verschickt keine Einladungen.

import { profileFromAirtableFields, scoreProfilePairWithDistance } from "./gruppenfinder-profile-scoring.js";
import { weightedPairScore, evaluateFourPersonGroup } from "./gruppenfinder.js";

const BASE_ID = "apphnIBhuAbmMTUtY";
const APPLICANTS_TABLE = "tblzLtbR5Yh4nR5aQ";
const MEMBERS_TABLE = "tbl4QX0NIB3tUKtF4";

const APPLICANT_ACTIVE = "fld3AfxsslBlRpG4B";
const APPLICANT_READY = "fld3fw7Siu6ePkbjN";
const APPLICANT_GENDER = "fldQ7YMAFTABnbrLo";
const APPLICANT_GROUP_WISH = "fld49bquWX3QtAGur";

const MEMBER_APPLICANT = "fldcV8kd6KF7zdScE";
const MEMBER_STATUS = "fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS = "fldUmjMa2j7MLG5RA";

const MAX_ELIGIBLE_APPLICANTS = 40;
const MIN_PAIR_SCORE = 65;

// Ausschließlich kontrollierte Testprofile A-F. Diese IDs dürfen nur im expliziten
// geschützten Testmodus ihre bestehende Gruppenbindung für die Berechnung ignorieren.
const CONTROLLED_TEST_APPLICANT_IDS = new Set([
  "recD0pbzMvStrQmCs", // A
  "recHH6a21SFbu2Y2C", // B
  "recLH985oQTy0uh2q", // C
  "rec2qyfv3hvpOGexa", // D
  "recDJTxYsYc3KCoX6", // E
  "recnO4MtDO0cJlgcL", // F
]);

function firstLink(value) {
  return Array.isArray(value) && value.length ? value[0] : null;
}

function fieldText(value) {
  if (value == null) return "";
  if (typeof value === "object" && !Array.isArray(value) && value.name) return String(value.name).trim();
  return String(value).trim();
}

async function airtableRequest(env, path) {
  const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${path}`, {
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.error?.type || body?.error?.message || "";
    } catch (_) {}
    throw new Error(detail || `Airtable HTTP ${response.status}`);
  }

  return response.json();
}

async function listAll(env, tableId) {
  const records = [];
  let offset = null;

  do {
    const query = new URLSearchParams({
      pageSize: "100",
      returnFieldsByFieldId: "true",
    });
    if (offset) query.set("offset", offset);

    const page = await airtableRequest(env, `${tableId}?${query.toString()}`);
    records.push(...(page.records || []));
    offset = page.offset || null;
  } while (offset);

  return records;
}

function applicantIdFromMember(member) {
  return firstLink(member?.fields?.[MEMBER_APPLICANT]);
}

function isCommittedMembership(member) {
  const status = fieldText(member?.fields?.[MEMBER_STATUS]);
  const invite = fieldText(member?.fields?.[MEMBER_INVITE_STATUS]);

  if (["Abgelehnt", "Abgelaufen"].includes(invite)) return false;
  return status === "Aktiv" || status === "Vorgeschlagen";
}

function groupCompositionSatisfied(records) {
  const genders = records.map((record) => fieldText(record?.fields?.[APPLICANT_GENDER])).filter(Boolean);
  const wishes = records.map((record) => fieldText(record?.fields?.[APPLICANT_GROUP_WISH]));

  // "Nur Männer" / "Nur Frauen" werden bereits paarweise durch die Profil-Scoring-Hard-Filter geprüft.
  // "Gemischte Gruppe" ist dagegen eine Gruppenbedingung: mindestens zwei unterschiedliche Geschlechter.
  if (wishes.includes("Gemischte Gruppe") && new Set(genders).size < 2) return false;
  return true;
}

function pairKey(a, b) {
  return [a, b].sort().join("|");
}

async function scorePairCached(a, b, cache, fetchImpl = fetch) {
  const key = pairKey(a.id, b.id);
  if (cache.has(key)) return cache.get(key);

  const scored = await scoreProfilePairWithDistance(a.profile, b.profile, fetchImpl);
  const weighted = weightedPairScore(scored.scores, { hardFilterPassed: scored.hardFilterPassed });
  const result = {
    hardFilterPassed: scored.hardFilterPassed,
    score: weighted.score,
    recommendation: weighted.recommendation,
  };
  cache.set(key, result);
  return result;
}

function pairAllowed(a, b, cache) {
  const pair = cache.get(pairKey(a.id, b.id));
  return Boolean(
    pair
    && pair.hardFilterPassed
    && Number.isFinite(pair.score)
    && pair.score >= MIN_PAIR_SCORE
  );
}

async function buildSafePairPrefilter(eligible, pairCache, fetchImpl = fetch) {
  let scoredPairs = 0;
  let allowedPairs = 0;

  for (let i = 0; i < eligible.length - 1; i += 1) {
    for (let j = i + 1; j < eligible.length; j += 1) {
      const pair = await scorePairCached(eligible[i], eligible[j], pairCache, fetchImpl);
      scoredPairs += 1;
      if (pair.hardFilterPassed && Number.isFinite(pair.score) && pair.score >= MIN_PAIR_SCORE) {
        allowedPairs += 1;
      }
    }
  }

  return { scoredPairs, allowedPairs };
}

export async function buildGroupProposalsPreview(env, { limit = 10, controlledTest = false } = {}) {
  if (!env?.AIRTABLE_TOKEN) throw new Error("AIRTABLE_TOKEN fehlt.");

  const [allApplicants, allMemberships] = await Promise.all([
    listAll(env, APPLICANTS_TABLE),
    listAll(env, MEMBERS_TABLE),
  ]);

  const committedApplicantIds = new Set(
    allMemberships
      .filter(isCommittedMembership)
      .map(applicantIdFromMember)
      .filter(Boolean),
  );

  let applicantPool = allApplicants
    .filter((record) => record?.fields?.[APPLICANT_ACTIVE] === true)
    .filter((record) => record?.fields?.[APPLICANT_READY] === true);

  if (controlledTest) {
    applicantPool = applicantPool.filter((record) => CONTROLLED_TEST_APPLICANT_IDS.has(record.id));
  } else {
    applicantPool = applicantPool.filter((record) => !committedApplicantIds.has(record.id));
  }

  const eligible = applicantPool.map((record) => ({
    id: record.id,
    record,
    profile: profileFromAirtableFields(record.fields || {}),
  }));

  if (eligible.length > MAX_ELIGIBLE_APPLICANTS) {
    return {
      ok: false,
      code: "TOO_MANY_ELIGIBLE_APPLICANTS",
      eligibleApplicants: eligible.length,
      maximumSupported: MAX_ELIGIBLE_APPLICANTS,
    };
  }

  if (eligible.length < 4) {
    return {
      ok: true,
      mode: controlledTest ? "read-only-controlled-multi-test" : "read-only",
      eligibleApplicants: eligible.length,
      evaluatedGroups: 0,
      suitableGroups: 0,
      proposals: [],
      state: "NOT_ENOUGH_ELIGIBLE_APPLICANTS",
      pairScoresComputed: 0,
      allowedPairs: 0,
      prefilteredGroupsSkipped: 0,
    };
  }

  const pairCache = new Map();
  const { scoredPairs, allowedPairs } = await buildSafePairPrefilter(eligible, pairCache, fetch);
  const proposals = [];
  let evaluatedGroups = 0;
  let prefilteredGroupsSkipped = 0;

  // Streaming-Auswertung statt vorheriger Materialisierung aller 4er-Kombinationen.
  for (let a = 0; a < eligible.length - 3; a += 1) {
    for (let b = a + 1; b < eligible.length - 2; b += 1) {
      if (!pairAllowed(eligible[a], eligible[b], pairCache)) continue;

      for (let c = b + 1; c < eligible.length - 1; c += 1) {
        if (!pairAllowed(eligible[a], eligible[c], pairCache)
          || !pairAllowed(eligible[b], eligible[c], pairCache)) continue;

        for (let d = c + 1; d < eligible.length; d += 1) {
          const group = [eligible[a], eligible[b], eligible[c], eligible[d]];

          // Sichere Vorfilterung: Eine zulässige Gruppe benötigt alle sechs Paar-Scores >= 65.
          if (!pairAllowed(eligible[a], eligible[d], pairCache)
            || !pairAllowed(eligible[b], eligible[d], pairCache)
            || !pairAllowed(eligible[c], eligible[d], pairCache)) {
            prefilteredGroupsSkipped += 1;
            continue;
          }

          const rawRecords = group.map((item) => item.record);
          if (!groupCompositionSatisfied(rawRecords)) {
            prefilteredGroupsSkipped += 1;
            continue;
          }

          const pairScores = [
            pairCache.get(pairKey(group[0].id, group[1].id)).score,
            pairCache.get(pairKey(group[0].id, group[2].id)).score,
            pairCache.get(pairKey(group[0].id, group[3].id)).score,
            pairCache.get(pairKey(group[1].id, group[2].id)).score,
            pairCache.get(pairKey(group[1].id, group[3].id)).score,
            pairCache.get(pairKey(group[2].id, group[3].id)).score,
          ];

          evaluatedGroups += 1;
          const evaluation = evaluateFourPersonGroup(pairScores);
          if (!evaluation.suitable) continue;

          proposals.push({
            applicantIds: group.map((item) => item.id),
            groupAverage: evaluation.average,
            weakestPair: evaluation.weakestPair,
            recommendation: evaluation.recommendation,
          });
        }
      }
    }
  }

  proposals.sort((a, b) =>
    b.groupAverage - a.groupAverage
    || b.weakestPair - a.weakestPair,
  );

  const safeLimit = Math.max(1, Math.min(25, Number(limit) || 10));

  return {
    ok: true,
    mode: controlledTest ? "read-only-controlled-multi-test" : "read-only",
    eligibleApplicants: eligible.length,
    evaluatedGroups,
    suitableGroups: proposals.length,
    proposals: proposals.slice(0, safeLimit),
    pairScoresComputed: scoredPairs,
    allowedPairs,
    prefilteredGroupsSkipped,
    prefilterMinimumPairScore: MIN_PAIR_SCORE,
  };
}
