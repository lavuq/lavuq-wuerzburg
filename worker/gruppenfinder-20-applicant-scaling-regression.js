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

function deterministicPairScore(a, b) {
  const ai = Number(a.slice(1));
  const bi = Number(b.slice(1));
  // Reproduzierbare kontrollierte Scores von 60 bis 99.
  return 60 + ((ai * 17 + bi * 23 + ai * bi * 3) % 40);
}

function evaluateGroup(group, pairScores) {
  const six = [];
  for (let i = 0; i < group.length - 1; i += 1) {
    for (let j = i + 1; j < group.length; j += 1) {
      six.push(pairScores[key(group[i], group[j])]);
    }
  }
  return { group, ...evaluateFourPersonGroup(six) };
}

const applicants = Array.from({ length: 20 }, (_, i) => `P${String(i + 1).padStart(2, "0")}`);
const pairScores = {};
for (let i = 0; i < applicants.length - 1; i += 1) {
  for (let j = i + 1; j < applicants.length; j += 1) {
    pairScores[key(applicants[i], applicants[j])] = deterministicPairScore(applicants[i], applicants[j]);
  }
}

const start = performance.now();
const groups = combinationsOfFour(applicants);
assert(groups.length === 4845, `Bei 20 Bewerbern müssen 4.845 4er-Kombinationen entstehen, erhalten: ${groups.length}`);

const evaluated = groups.map((group) => evaluateGroup(group, pairScores));
const suitable = evaluated.filter((entry) => entry.suitable);
suitable.sort((a, b) => b.average - a.average || b.weakestPair - a.weakestPair);
const elapsedMs = performance.now() - start;

assert(evaluated.length === 4845, "Nicht alle 4.845 Kombinationen wurden bewertet.");
assert(suitable.length > 0, "Es muss mindestens eine geeignete Gruppe geben.");
const best = suitable[0];
assert(best.average >= 75, "Beste Gruppe muss Durchschnitt >= 75 haben.");
assert(best.weakestPair >= 65, "Beste Gruppe muss schwächsten Paar-Score >= 65 haben.");

console.log("Gruppenfinder 20-Bewerber-Skalierungstest erfolgreich ✅");
console.log(`1. Bewerber: ${applicants.length}`);
console.log(`2. Paar-Scores erzeugt: ${Object.keys(pairScores).length}`);
console.log(`3. Bewertete 4er-Kombinationen: ${evaluated.length}`);
console.log(`4. Geeignete 4er-Kombinationen: ${suitable.length}`);
console.log(`5. Beste Gruppe: ${best.group.join("/")} | Durchschnitt: ${best.average} | Schwächster Paar-Score: ${best.weakestPair}`);
console.log(`6. Reine Berechnungszeit: ${elapsedMs.toFixed(2)} ms`);
console.log("7. Alle 4.845 möglichen 4er-Kombinationen verglichen: JA");
console.log("8. Automatische Einladung: NEIN");
console.log("9. Kontaktdaten automatisch geteilt: NEIN");
console.log("10. Airtable geändert: NEIN");
