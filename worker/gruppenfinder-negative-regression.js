// LAVUQ Gruppenfinder – Negativtest für 4er-Gruppen
// Rein deterministischer Regressionstest. Keine Airtable-Schreibzugriffe,
// keine Gruppenanlage, keine Einladungen und keine Kontaktdaten.

import { evaluateFourPersonGroup } from "./gruppenfinder.js";

const PEOPLE = ["A", "B", "C", "D", "E", "F", "G_WEAK"];

// Bekannte gute Paarwerte aus dem kontrollierten Mehrkandidaten-Test.
// Für G_WEAK werden bewusst Werte unterhalb der Paar-Mindestgrenze 65 gesetzt.
const PAIR_SCORES = new Map([
  ["A|B", 86.9],
  ["A|C", 86.9],
  ["A|D", 82.1],
  ["A|E", 100.0],
  ["A|F", 87.3],
  ["B|C", 94.1],
  ["B|D", 85.1],
  ["B|E", 86.9],
  ["B|F", 91.0],
  ["C|D", 86.7],
  ["C|E", 86.9],
  ["C|F", 90.0],
  ["D|E", 82.1],
  ["D|F", 88.0],
  ["E|F", 87.3],
  ["A|G_WEAK", 54.0],
  ["B|G_WEAK", 58.0],
  ["C|G_WEAK", 61.0],
  ["D|G_WEAK", 52.0],
  ["E|G_WEAK", 56.0],
  ["F|G_WEAK", 60.0],
]);

function key(a, b) {
  return [a, b].sort().join("|");
}

function combinationsOfFour(items) {
  const result = [];
  for (let a = 0; a < items.length - 3; a += 1) {
    for (let b = a + 1; b < items.length - 2; b += 1) {
      for (let c = b + 1; c < items.length - 1; c += 1) {
        for (let d = c + 1; d < items.length; d += 1) {
          result.push([items[a], items[b], items[c], items[d]]);
        }
      }
    }
  }
  return result;
}

function scoresFor(group) {
  const scores = [];
  for (let i = 0; i < group.length - 1; i += 1) {
    for (let j = i + 1; j < group.length; j += 1) {
      const score = PAIR_SCORES.get(key(group[i], group[j]));
      if (!Number.isFinite(score)) throw new Error(`Fehlender Paar-Score: ${group[i]} / ${group[j]}`);
      scores.push(score);
    }
  }
  return scores;
}

const groups = combinationsOfFour(PEOPLE);
const results = groups.map((group) => ({
  group,
  evaluation: evaluateFourPersonGroup(scoresFor(group)),
}));

const suitable = results.filter((item) => item.evaluation.suitable);
const rejected = results.filter((item) => !item.evaluation.suitable);
const groupsWithWeak = results.filter((item) => item.group.includes("G_WEAK"));
const rejectedWithWeak = groupsWithWeak.filter((item) => !item.evaluation.suitable);
const goodOnly = results.filter((item) => !item.group.includes("G_WEAK"));
const suitableGoodOnly = goodOnly.filter((item) => item.evaluation.suitable);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(groups.length === 35, `Erwartet 35 Kombinationen, erhalten ${groups.length}`);
assert(groupsWithWeak.length === 20, `Erwartet 20 Gruppen mit G_WEAK, erhalten ${groupsWithWeak.length}`);
assert(rejectedWithWeak.length === 20, `G_WEAK wurde nicht in allen 20 Gruppen aussortiert (${rejectedWithWeak.length}/20)`);
assert(goodOnly.length === 15, `Erwartet 15 Gruppen ohne G_WEAK, erhalten ${goodOnly.length}`);
assert(suitableGoodOnly.length === 15, `Mindestens eine bekannte gute Gruppe wurde fälschlich abgelehnt (${suitableGoodOnly.length}/15)`);
assert(suitable.length === 15, `Erwartet 15 geeignete Gruppen, erhalten ${suitable.length}`);
assert(rejected.length === 20, `Erwartet 20 abgelehnte Gruppen, erhalten ${rejected.length}`);
assert(rejected.every((item) => item.evaluation.weakestPair < 65), "Eine abgelehnte Gruppe verletzt nicht die erwartete Paar-Mindestgrenze.");

const best = [...suitable].sort((a, b) => b.evaluation.average - a.evaluation.average)[0];

console.log("Gruppenfinder Negativtest erfolgreich ✅");
console.log(`Testpersonen: ${PEOPLE.length}`);
console.log(`Bewertete 4er-Gruppen: ${groups.length}`);
console.log(`Geeignete Gruppen: ${suitable.length}`);
console.log(`Abgelehnte Gruppen: ${rejected.length}`);
console.log(`Gruppen mit schwachem Testprofil: ${groupsWithWeak.length}`);
console.log(`Davon korrekt aussortiert: ${rejectedWithWeak.length}`);
console.log(`Gute Gruppen weiterhin geeignet: ${suitableGoodOnly.length}/${goodOnly.length}`);
console.log(`Bester Gruppen-Durchschnitt: ${best.evaluation.average}`);
console.log(`Schwächster Paar-Score der besten Gruppe: ${best.evaluation.weakestPair}`);
