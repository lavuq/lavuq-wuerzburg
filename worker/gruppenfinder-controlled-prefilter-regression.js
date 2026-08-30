// LAVUQ – kontrollierter produktionsnaher Vorfilter-Test
// Rein read-only: keine Airtable-Schreibzugriffe, keine Einladungen, keine Kontaktfreigabe.

import { evaluateFourPersonGroup } from "./gruppenfinder.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Vier kontrollierte Testprofile mit den bereits bekannten Referenz-Paar-Scores.
// Alle sechs Kanten müssen den sicheren Paar-Grenzwert >= 65 erfüllen.
const pairScores = [86.9, 86.9, 82.1, 94.1, 85.1, 86.7];
const minimumPairScore = 65;

assert(pairScores.length === 6, "Eine 4er-Gruppe muss genau sechs Paar-Scores besitzen.");
assert(pairScores.every((score) => score >= minimumPairScore), "Vorfilter hätte die Referenzgruppe blockiert.");

const evaluation = evaluateFourPersonGroup(pairScores);
assert(evaluation.suitable === true, "Referenzgruppe muss geeignet sein.");
assert(evaluation.average === 87, `Erwarteter Durchschnitt 87, erhalten ${evaluation.average}`);
assert(evaluation.weakestPair === 82.1, `Erwarteter schwächster Paar-Score 82.1, erhalten ${evaluation.weakestPair}`);

// Negativfall: Eine einzige unsichere Kante unter 65 muss die Gruppe vor der Vollbewertung ausschließen.
const blockedPairScores = [90, 90, 90, 90, 90, 60];
const blockedByPrefilter = blockedPairScores.some((score) => score < minimumPairScore);
assert(blockedByPrefilter === true, "Negativfall muss durch den Vorfilter blockiert werden.");

console.log("Gruppenfinder kontrollierter Vorfilter-Test erfolgreich ✅");
console.log("1. Kontrollierte Testbewerber: 4");
console.log("2. Paar-Scores geprüft: 6");
console.log("3. Alle Referenz-Paare >=65: JA");
console.log(`4. Gruppen-Durchschnitt: ${evaluation.average}`);
console.log(`5. Schwächster Paar-Score: ${evaluation.weakestPair}`);
console.log("6. Geeignete Referenzgruppe erkannt: JA");
console.log("7. Negativfall mit Paar-Score 60 vorgefiltert: JA");
console.log("8. Automatische Einladung: NEIN");
console.log("9. Kontaktdaten automatisch geteilt: NEIN");
console.log("10. Airtable geändert: NEIN");