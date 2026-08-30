// LAVUQ Gruppenfinder – kombinierter Grenzwerttest
// Prüft, dass BEIDE Bedingungen gleichzeitig erfüllt sein müssen:
// Gruppendurchschnitt >= 75 UND schwächster Paar-Score >= 65.
// Reiner Test: keine Airtable-Schreibzugriffe, keine Einladungen, keine Kontaktdaten.

import { evaluateFourPersonGroup } from "./gruppenfinder.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const cases = [
  {
    name: "Durchschnitt gut, schwächstes Paar zu niedrig",
    scores: [90, 90, 90, 90, 90, 64.9],
    expected: false,
  },
  {
    name: "Schwächstes Paar gut, Durchschnitt zu niedrig",
    scores: [74.9, 74.9, 74.9, 74.9, 74.9, 74.9],
    expected: false,
  },
  {
    name: "Beide Grenzen exakt erfüllt",
    // Durchschnitt = 75,0; schwächstes Paar = 65,0
    scores: [77, 77, 77, 77, 77, 65],
    expected: true,
  },
  {
    name: "Beide Grenzen klar erfüllt",
    scores: [82, 80, 78, 76, 74, 70],
    expected: true,
  },
];

for (const testCase of cases) {
  const result = evaluateFourPersonGroup(testCase.scores);
  assert(
    result.suitable === testCase.expected,
    `${testCase.name}: erwartet suitable=${testCase.expected}, erhalten ${result.suitable}`,
  );
  console.log(
    `${testCase.name} -> ${result.recommendation} | Durchschnitt: ${result.average} | Schwächster Paar-Score: ${result.weakestPair}`,
  );
}

const exact = evaluateFourPersonGroup([77, 77, 77, 77, 77, 65]);
assert(exact.average === 75, `Exakter Kombinationsfall muss Durchschnitt 75,0 ergeben, erhalten ${exact.average}`);
assert(exact.weakestPair === 65, `Exakter Kombinationsfall muss schwächstes Paar 65,0 ergeben, erhalten ${exact.weakestPair}`);
assert(exact.suitable === true, "Exakt 75,0 / 65,0 muss geeignet sein.");

console.log("Gruppenfinder kombinierter Grenzwerttest erfolgreich ✅");
