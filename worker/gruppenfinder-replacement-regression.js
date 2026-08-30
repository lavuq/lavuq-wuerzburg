import { rankReplacementCandidates } from "./gruppenfinder.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Kontrollierter Ersatztest:
// Eine Person fällt aus einer guten 4er-Gruppe aus. Die drei verbleibenden
// Paar-Scores bleiben bestehen. Mehrere Ersatzkandidaten werden anhand der
// KOMPLETTEN neu entstehenden 4er-Gruppe bewertet (alle 6 Paar-Scores).
const existingPairScores = [86.9, 82.1, 86.7];

const candidates = [
  {
    id: "E",
    label: "starker Ersatzkandidat",
    pairScores: [100.0, 86.9, 82.1],
  },
  {
    id: "F",
    label: "guter, aber schwächerer Ersatzkandidat",
    pairScores: [88.0, 84.0, 80.0],
  },
  {
    id: "SCHWACH",
    label: "Kandidat mit einem zu schwachen Paar",
    pairScores: [90.0, 90.0, 60.0],
  },
];

const ranking = rankReplacementCandidates(candidates, existingPairScores);

assert(ranking.length === 3, "Es müssen alle drei Ersatzkandidaten bewertet werden.");
assert(ranking[0].id === "E", "E muss als bester Ersatzkandidat auf Rang 1 stehen.");
assert(ranking[0].eligible === true, "E muss für die Ersatzgruppe geeignet sein.");
assert(ranking[0].groupAverage === 87.5, `E: erwarteter Gruppen-Durchschnitt 87.5, erhalten ${ranking[0].groupAverage}`);
assert(ranking[0].weakestPair === 82.1, `E: erwarteter schwächster Paar-Score 82.1, erhalten ${ranking[0].weakestPair}`);

const weak = ranking.find((candidate) => candidate.id === "SCHWACH");
assert(weak, "Der schwache Kandidat muss im Ergebnis enthalten sein.");
assert(weak.eligible === false, "Kandidat mit Paar-Score 60 muss ausgeschlossen werden.");
assert(weak.weakestPair === 60, `Erwarteter schwächster Paar-Score 60, erhalten ${weak.weakestPair}`);
assert(ranking.indexOf(weak) > ranking.findIndex((candidate) => candidate.id === "F"), "Ungeeigneter Kandidat muss hinter geeigneten Kandidaten sortiert werden.");

console.log("Gruppenfinder Ersatzpersonen-Test erfolgreich ✅");
console.log(`Bewertete Ersatzkandidaten: ${ranking.length}`);
for (const [index, candidate] of ranking.entries()) {
  console.log(`${index + 1}. ${candidate.id} | Durchschnitt: ${candidate.groupAverage} | Schwächster Paar-Score: ${candidate.weakestPair} | ${candidate.recommendation}`);
}
console.log("Bester Ersatzkandidat: E");
console.log("Schwacher Kandidat mit Paar-Score 60 korrekt aussortiert.");
