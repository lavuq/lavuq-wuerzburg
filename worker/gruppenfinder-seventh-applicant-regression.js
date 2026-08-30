import { evaluateFourPersonGroup } from "./gruppenfinder.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function combinationsOfFour(ids) {
  const groups = [];
  for (let a = 0; a < ids.length - 3; a += 1) {
    for (let b = a + 1; b < ids.length - 2; b += 1) {
      for (let c = b + 1; c < ids.length - 1; c += 1) {
        for (let d = c + 1; d < ids.length; d += 1) {
          groups.push([ids[a], ids[b], ids[c], ids[d]]);
        }
      }
    }
  }
  return groups;
}

function key(a, b) {
  return [a, b].sort().join("|");
}

function evaluateGroup(group, pairScores) {
  const six = [];
  for (let i = 0; i < group.length - 1; i += 1) {
    for (let j = i + 1; j < group.length; j += 1) {
      const score = pairScores[key(group[i], group[j])];
      assert(Number.isFinite(score), `Paar-Score fehlt: ${group[i]}/${group[j]}`);
      six.push(score);
    }
  }
  return { group, ...evaluateFourPersonGroup(six) };
}

const applicants = ["A", "B", "C", "D", "E", "F", "G"];

// Kontrollierte Matrix für 7 Bewerber. Alle 35 möglichen Vierergruppen werden geprüft.
// G ist bewusst so gesetzt, dass eine neue starke Konstellation entstehen kann und
// der Algorithmus nicht bei der bisherigen 6-Bewerber-Siegergruppe stehen bleibt.
const pairScores = {
  [key("A", "B")]: 84,
  [key("A", "C")]: 86,
  [key("A", "D")]: 82,
  [key("A", "E")]: 92,
  [key("A", "F")]: 90,
  [key("A", "G")]: 78,
  [key("B", "C")]: 83,
  [key("B", "D")]: 81,
  [key("B", "E")]: 80,
  [key("B", "F")]: 79,
  [key("B", "G")]: 77,
  [key("C", "D")]: 85,
  [key("C", "E")]: 94,
  [key("C", "F")]: 95,
  [key("C", "G")]: 96,
  [key("D", "E")]: 93,
  [key("D", "F")]: 96,
  [key("D", "G")]: 97,
  [key("E", "F")]: 97,
  [key("E", "G")]: 98,
  [key("F", "G")]: 99,
};

const groups = combinationsOfFour(applicants);
assert(groups.length === 35, `Bei 7 Bewerbern müssen 35 4er-Kombinationen entstehen, erhalten: ${groups.length}`);

const evaluated = groups.map((group) => evaluateGroup(group, pairScores));
const suitable = evaluated.filter((entry) => entry.suitable);
suitable.sort((a, b) => b.average - a.average || b.weakestPair - a.weakestPair);

assert(suitable.length > 0, "Es muss mindestens eine geeignete Gruppe geben.");
const best = suitable[0];
const firstFour = evaluated.find((entry) => entry.group.join("") === "ABCD");
const previousWinner = evaluated.find((entry) => entry.group.join("") === "CDEF");

assert(firstFour, "A/B/C/D muss vorhanden sein.");
assert(previousWinner, "C/D/E/F muss vorhanden sein.");
assert(best.group.join("") !== "ABCD", "Beste Gruppe darf nicht automatisch die ersten vier sein.");
assert(best.average >= previousWinner.average, "Der 7-Bewerber-Vergleich darf keine bessere vorhandene Gruppe übersehen.");
assert(best.suitable === true, "Beste Gruppe muss geeignet sein.");
assert(best.average >= 75, "Durchschnitt muss mindestens 75 sein.");
assert(best.weakestPair >= 65, "Schwächster Paar-Score muss mindestens 65 sein.");

console.log("Gruppenfinder 7.-Bewerber-Ranking-Test erfolgreich ✅");
console.log(`1. Bewerber: ${applicants.length}`);
console.log(`2. Bewertete 4er-Kombinationen: ${evaluated.length}`);
console.log(`3. Geeignete 4er-Kombinationen: ${suitable.length}`);
console.log(`4. Erste vier A/B/C/D -> Durchschnitt: ${firstFour.average} | Schwächster Paar-Score: ${firstFour.weakestPair}`);
console.log(`5. Bisherige 6er-Siegergruppe C/D/E/F -> Durchschnitt: ${previousWinner.average} | Schwächster Paar-Score: ${previousWinner.weakestPair}`);
console.log(`6. Beste Gruppe aus 7 Bewerbern: ${best.group.join("/")} | Durchschnitt: ${best.average} | Schwächster Paar-Score: ${best.weakestPair}`);
console.log("7. Alle 35 möglichen 4er-Kombinationen wurden verglichen: JA");
console.log("8. Automatische Einladung: NEIN");
console.log("9. Kontaktdaten automatisch geteilt: NEIN");
console.log("10. Airtable geändert: NEIN");
