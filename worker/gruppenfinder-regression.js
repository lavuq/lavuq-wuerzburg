import { weightedPairScore, evaluateFourPersonGroup, rankReplacementCandidates } from "./gruppenfinder.js";

// Regressionstest für die bereits manuell geprüfte Testgruppe A/B/C/D.
// Zweck: Jede spätere Änderung am Algorithmus muss dieselben Referenzwerte liefern.

export const TEST_PAIRS = Object.freeze([
  {
    id: "A-B",
    expected: 86.9,
    components: {
      freundschaftswerte: 80,
      interessen: 90,
      freundschaftsziel: 75,
      kontaktfrequenz: 100,
      gemeinsameZeit: 90,
      persoenlichkeit: 100,
      planung: 100,
      lebenssituation: 50,
      alter: 100,
      entfernung: null,
    },
  },
  {
    id: "A-C",
    expected: 86.9,
    components: {
      freundschaftswerte: 80,
      interessen: 100,
      freundschaftsziel: 75,
      kontaktfrequenz: 100,
      gemeinsameZeit: 85,
      persoenlichkeit: 100,
      planung: 100,
      lebenssituation: 30,
      alter: 100,
      entfernung: null,
    },
  },
  {
    id: "A-D",
    expected: 82.1,
    components: {
      freundschaftswerte: 100,
      interessen: 55,
      freundschaftsziel: 75,
      kontaktfrequenz: 100,
      gemeinsameZeit: 75,
      persoenlichkeit: 100,
      planung: 80,
      lebenssituation: 40,
      alter: 100,
      entfernung: null,
    },
  },
  {
    id: "B-C",
    expected: 94.1,
    components: {
      freundschaftswerte: 100,
      interessen: 100,
      freundschaftsziel: 100,
      kontaktfrequenz: 100,
      gemeinsameZeit: 75,
      persoenlichkeit: 100,
      planung: 100,
      lebenssituation: 35,
      alter: 100,
      entfernung: null,
    },
  },
  {
    id: "B-D",
    expected: 85.1,
    components: {
      freundschaftswerte: 100,
      interessen: 35,
      freundschaftsziel: 100,
      kontaktfrequenz: 100,
      gemeinsameZeit: 95,
      persoenlichkeit: 100,
      planung: 80,
      lebenssituation: 45,
      alter: 100,
      entfernung: null,
    },
  },
  {
    id: "C-D",
    expected: 86.7,
    components: {
      freundschaftswerte: 100,
      interessen: 40,
      freundschaftsziel: 100,
      kontaktfrequenz: 100,
      gemeinsameZeit: 75,
      persoenlichkeit: 100,
      planung: 80,
      lebenssituation: 100,
      alter: 100,
      entfernung: null,
    },
  },
]);

export function runGruppenfinderRegression() {
  const pairs = TEST_PAIRS.map((test) => {
    const result = weightedPairScore(test.components);
    return {
      id: test.id,
      expected: test.expected,
      actual: result.score,
      passed: result.score === test.expected,
      recommendation: result.recommendation,
    };
  });

  const group = evaluateFourPersonGroup(pairs.map((pair) => pair.actual));

  // Ersatztest: B fällt aus, A/C/D bleiben bestehen.
  // E entspricht im kontrollierten Testprofil A. Entfernung ist hier bewusst
  // noch nicht Bestandteil dieser Regression, damit die bekannten Referenzwerte
  // unverändert abgesichert bleiben.
  const replacementRanking = rankReplacementCandidates(
    [
      { id: "E", pairScores: [100.0, 86.9, 82.1] },
      { id: "SCHWACH", pairScores: [90, 90, 60] },
    ],
    [86.9, 82.1, 86.7],
  );

  const replacementPassed =
    replacementRanking[0]?.id === "E" &&
    replacementRanking[0]?.eligible === true &&
    replacementRanking[0]?.groupAverage === 87.5 &&
    replacementRanking[0]?.weakestPair === 82.1 &&
    replacementRanking[1]?.id === "SCHWACH" &&
    replacementRanking[1]?.eligible === false &&
    replacementRanking[1]?.weakestPair === 60;

  return {
    passed:
      pairs.every((pair) => pair.passed) &&
      group.average === 87.0 &&
      group.weakestPair === 82.1 &&
      replacementPassed,
    pairs,
    group,
    expectedGroup: {
      average: 87.0,
      weakestPair: 82.1,
      recommendation: "Vorschlag geeignet",
    },
    replacement: {
      passed: replacementPassed,
      ranking: replacementRanking,
      expectedTopCandidate: {
        id: "E",
        groupAverage: 87.5,
        weakestPair: 82.1,
        eligible: true,
      },
    },
  };
}
