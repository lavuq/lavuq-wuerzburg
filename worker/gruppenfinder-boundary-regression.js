// LAVUQ Gruppenfinder – Grenzwert-Regressions-Test
// Prüft die harte Mindestgrenze für den schwächsten Paar-Score.
// Reiner Test: keine Airtable-Schreibzugriffe, keine Einladungen, keine Kontaktdaten.

import { classifyPair, evaluateFourPersonGroup } from "./gruppenfinder.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Fünf starke Paarungen halten den Gruppendurchschnitt sicher über 75.
// Damit isolieren wir ausschließlich die Mindestgrenze des schwächsten Paares.
const strongPairs = [90, 90, 90, 90, 90];

const below = evaluateFourPersonGroup([...strongPairs, 64.9]);
const exact = evaluateFourPersonGroup([...strongPairs, 65.0]);
const above = evaluateFourPersonGroup([...strongPairs, 65.1]);

assert(classifyPair(64.9) === "Zu schwach", "64,9 muss als Zu schwach klassifiziert werden.");
assert(classifyPair(65.0) === "Grundsätzlich passend", "65,0 muss als Grundsätzlich passend klassifiziert werden.");
assert(classifyPair(65.1) === "Grundsätzlich passend", "65,1 muss als Grundsätzlich passend klassifiziert werden.");

assert(below.average >= 75, "Kontrollfehler: Durchschnitt bei 64,9 muss >= 75 bleiben.");
assert(exact.average >= 75, "Kontrollfehler: Durchschnitt bei 65,0 muss >= 75 bleiben.");
assert(above.average >= 75, "Kontrollfehler: Durchschnitt bei 65,1 muss >= 75 bleiben.");

assert(below.weakestPair === 64.9, "Schwächster Paar-Score bei 64,9 falsch.");
assert(exact.weakestPair === 65, "Schwächster Paar-Score bei 65,0 falsch.");
assert(above.weakestPair === 65.1, "Schwächster Paar-Score bei 65,1 falsch.");

assert(below.suitable === false, "64,9 darf NICHT freigegeben werden.");
assert(exact.suitable === true, "65,0 muss die Mindestgrenze bestehen.");
assert(above.suitable === true, "65,1 muss die Mindestgrenze bestehen.");

console.log("Gruppenfinder Grenzwerttest erfolgreich ✅");
console.log("64,9 ->", below.recommendation, "| Durchschnitt:", below.average, "| Schwächster Paar-Score:", below.weakestPair);
console.log("65,0 ->", exact.recommendation, "| Durchschnitt:", exact.average, "| Schwächster Paar-Score:", exact.weakestPair);
console.log("65,1 ->", above.recommendation, "| Durchschnitt:", above.average, "| Schwächster Paar-Score:", above.weakestPair);
