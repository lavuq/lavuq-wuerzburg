// LAVUQ Gruppenfinder – Scoring-Kern v1
// Reine Berechnungslogik: erzeugt nur Bewertungen/Vorschläge.
// Keine Einladungen, keine Gruppenänderungen, keine Kontaktfreigabe.

export const GRUPPENFINDER_WEIGHTS = Object.freeze({
  freundschaftswerte: 20,
  interessen: 15,
  freundschaftsziel: 15,
  kontaktfrequenz: 10,
  gemeinsameZeit: 10,
  persoenlichkeit: 10,
  planung: 7.5,
  lebenssituation: 5,
  alter: 5,
  entfernung: 2.5,
});

export const PAIR_THRESHOLDS = Object.freeze({
  sehrStark: 86,
  gut: 75,
  grundsaetzlichPassend: 65,
});

export const GROUP_THRESHOLDS = Object.freeze({
  minimumAverage: 75,
  minimumWeakestPair: 65,
});

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, n));
}

export function classifyPair(score) {
  const n = clampScore(score);
  if (n === null) return "Nicht berechnet";
  if (n >= PAIR_THRESHOLDS.sehrStark) return "Sehr stark";
  if (n >= PAIR_THRESHOLDS.gut) return "Gut";
  if (n >= PAIR_THRESHOLDS.grundsaetzlichPassend) return "Grundsätzlich passend";
  return "Zu schwach";
}

export function weightedPairScore(componentScores, { hardFilterPassed = true } = {}) {
  if (!hardFilterPassed) {
    return { eligible: false, score: null, recommendation: "Ausgeschlossen" };
  }

  let weightedSum = 0;
  let availableWeight = 0;
  const missing = [];

  for (const [criterion, weight] of Object.entries(GRUPPENFINDER_WEIGHTS)) {
    const score = clampScore(componentScores?.[criterion]);
    if (score === null) {
      missing.push(criterion);
      continue;
    }
    weightedSum += score * weight;
    availableWeight += weight;
  }

  if (availableWeight === 0) {
    return { eligible: true, score: null, recommendation: "Nicht berechnet", missing };
  }

  // Solange einzelne Kriterien (z. B. Entfernung) noch fehlen, wird auf die
  // tatsächlich vorhandene Gewichtssumme normiert. Damit entspricht v1 der
  // bereits getesteten Airtable-Logik (aktuell 97,5 % ohne Entfernung).
  const score = Math.round((weightedSum / availableWeight) * 10) / 10;

  return {
    eligible: true,
    score,
    recommendation: classifyPair(score),
    missing,
    availableWeight,
  };
}

export function evaluateFourPersonGroup(pairScores) {
  if (!Array.isArray(pairScores) || pairScores.length !== 6) {
    throw new Error("Eine 4er-Gruppe benötigt genau 6 Paar-Scores.");
  }

  const normalized = pairScores.map(clampScore);
  if (normalized.some((score) => score === null)) {
    throw new Error("Alle 6 Paar-Scores müssen berechnet sein.");
  }

  const average = Math.round((normalized.reduce((sum, score) => sum + score, 0) / 6) * 10) / 10;
  const weakestPair = Math.min(...normalized);
  const suitable = average >= GROUP_THRESHOLDS.minimumAverage && weakestPair >= GROUP_THRESHOLDS.minimumWeakestPair;

  return {
    average,
    weakestPair,
    suitable,
    recommendation: suitable ? "Vorschlag geeignet" : "Nicht bevorzugen",
  };
}

// Ersatzkandidaten werden gegen die drei verbleibenden Gruppenmitglieder geprüft.
// Bewertet wird immer die komplette neue 4er-Gruppe:
// 3 bereits bestehende Paar-Scores + 3 Paar-Scores des Ersatzkandidaten.
// Die Funktion sortiert nur Vorschläge. Sie verändert keinerlei Daten.
export function rankReplacementCandidates(candidates, existingPairScores) {
  if (!Array.isArray(candidates)) return [];

  const existing = Array.isArray(existingPairScores)
    ? existingPairScores.map(clampScore)
    : [];

  if (existing.length !== 3 || existing.some((score) => score === null)) {
    throw new Error("Für eine Ersatzbewertung werden genau 3 bestehende Paar-Scores der verbleibenden Gruppe benötigt.");
  }

  return candidates
    .map((candidate) => {
      const candidateScores = Array.isArray(candidate?.pairScores)
        ? candidate.pairScores.map(clampScore)
        : [];

      if (candidateScores.length !== 3 || candidateScores.some((score) => score === null)) {
        return {
          ...candidate,
          eligible: false,
          reason: "Es werden genau 3 berechnete Paar-Scores zum Ersatzkandidaten benötigt.",
        };
      }

      const groupEvaluation = evaluateFourPersonGroup([
        ...existing,
        ...candidateScores,
      ]);

      return {
        ...candidate,
        groupAverage: groupEvaluation.average,
        weakestPair: groupEvaluation.weakestPair,
        eligible: groupEvaluation.suitable,
        recommendation: groupEvaluation.recommendation,
      };
    })
    .sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      return (b.groupAverage ?? -1) - (a.groupAverage ?? -1)
        || (b.weakestPair ?? -1) - (a.weakestPair ?? -1);
    });
}
