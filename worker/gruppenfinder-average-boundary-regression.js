// LAVUQ Gruppenfinder – Grenzwerttest Gruppen-Durchschnitt 75
// Isoliert die Mindestgrenze des Gruppendurchschnitts.
// Reiner Test: keine Airtable-Schreibzugriffe, keine Einladungen, keine Kontaktdaten.

import { evaluateFourPersonGroup } from "./gruppenfinder.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Alle Paar-Scores bleiben >= 65. Damit kann nur die Durchschnittsgrenze entscheiden.
// Bei sechs identischen Paar-Scores entspricht der Gruppen-Durchschnitt exakt dem Testwert.
const below = evaluateFourPersonGroup([74.9, 74.9, 74.9, 74.9, 74.9, 74.9]);
const exact = evaluateFourPersonGroup([75.0, 75.0, 75.0, 75.0, 75.0, 75.0]);
const above = evaluateFourPersonGroup([75.1, 75.1, 75.1, 75.1, 75.1, 75.1]);

assert(below.weakestPair >= 65, "Kontrollfehler: schwächster Paar-Score bei 74,9 muss >= 65 sein.");
assert(exact.weakestPair >= 65, "Kontrollfehler: schwächster Paar-Score bei 75,0 muss >= 65 sein.");
assert(above.weakestPair >= 65, "Kontrollfehler: schwächster Paar-Score bei 75,1 muss >= 65 sein.");

assert(below.average === 74.9, "Durchschnitt 74,9 wurde unerwartet gerundet.");
assert(exact.average === 75, "Durchschnitt 75,0 wurde unerwartet verändert.");
assert(above.average === 75.1, "Durchschnitt 75,1 wurde unerwartet gerundet.");

assert(below.suitable === false, "74,9 Durchschnitt darf NICHT freigegeben werden.");
assert(exact.suitable === true, "75,0 Durchschnitt muss die Mindestgrenze bestehen.");
assert(above.suitable === true, "75,1 Durchschnitt muss die Mindestgrenze bestehen.");

console.log("Gruppenfinder Durchschnitts-Grenzwerttest erfolgreich ✅");
console.log("74,9 ->", below.recommendation, "| Durchschnitt:", below.average, "| Schwächster Paar-Score:", below.weakestPair);
console.log("75,0 ->", exact.recommendation, "| Durchschnitt:", exact.average, "| Schwächster Paar-Score:", exact.weakestPair);
console.log("75,1 ->", above.recommendation, "| Durchschnitt:", above.average, "| Schwächster Paar-Score:", above.weakestPair);
