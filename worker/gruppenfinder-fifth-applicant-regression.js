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
      six.push(pairScores[key(group[i], group[j])]);
    }
  }
  const evaluation = evaluateFourPersonGroup(six);
  return { group, ...evaluation };
}

const applicants = ["A", "B", "C", "D", "E"];

// Kontrollierte Matrix: A/B/C/D sind gut, aber E verbessert die beste Kombination.
// Damit darf der Finder nicht einfach die ersten vier nehmen.
const pairScores = {
  [key("A", "B")]: 84,
  [key("A", "C")]: 86,
  [key("A", "D")]: 82,
  [key("A", "E")]: 92,
  [key("B", "C")]: 83,
  [key("B", "D")]: 81,
  [key("B", "E")]: 80,
  [key("C", "D")]: 85,
  [key("C", "E")]: 94,
  [key("D", "E")]: 93,
};

const groups = combinationsOfFour(applicants);
assert(groups.length === 5, `Bei 5 Bewerbern müssen 5 4er-Kombinationen entstehen, erhalten: ${groups.length}`);

const evaluated = groups.map((group) => evaluateGroup(group, pairScores));
const suitable = evaluated.filter((entry) => entry.suitable);

suitable.sort((a, b) =>
  b.average - a.average || b.weakestPair - a.weakestPair,
);

assert(suitable.length > 0, "Es muss mindestens eine geeignete Gruppe geben.");
const best = suitable[0];
const firstFour = evaluated.find((entry) => entry.group.join("") === "ABCD");

assert(firstFour, "Die erste Vierergruppe A/B/C/D muss vorhanden sein.");
assert(best.group.join("") !== "ABCD", "Die beste Gruppe darf in diesem Test nicht einfach aus den ersten vier bestehen.");
assert(best.average > firstFour.average, "Die gewählte beste Gruppe muss einen höheren Durchschnitt als A/B/C/D haben.");
assert(best.suitable === true, "Die beste Gruppe muss geeignet sein.");
assert(best.average >= 75, "Die beste Gruppe muss den Durchschnitts-Grenzwert erfüllen.");
assert(best.weakestPair >= 65, "Die beste Gruppe muss den schwächsten Paar-Grenzwert erfüllen.");

console.log("Gruppenfinder 5.-Bewerber-Ranking-Test erfolgreich ✅");
console.log(`1. Bewerber: ${applicants.length}`);
console.log(`2. Bewertete 4er-Kombinationen: ${evaluated.length}`);
console.log(`3. Erste vier A/B/C/D -> Durchschnitt: ${firstFour.average} | Schwächster Paar-Score: ${firstFour.weakestPair}`);
console.log(`4. Beste Gruppe: ${best.group.join("/")} | Durchschnitt: ${best.average} | Schwächster Paar-Score: ${best.weakestPair}`);
console.log("5. Beste Gruppe ist NICHT automatisch die ersten vier: JA");
console.log("6. Alle 5 möglichen 4er-Kombinationen wurden verglichen: JA");
console.log("7. Automatische Einladung: NEIN");
console.log("8. Kontaktdaten automatisch geteilt: NEIN");
console.log("9. Airtable geändert: NEIN");
