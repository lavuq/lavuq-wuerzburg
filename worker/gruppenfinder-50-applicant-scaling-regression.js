import { evaluateFourPersonGroup } from "./gruppenfinder.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function key(a, b) {
  return [a, b].sort().join("|");
}

function deterministicPairScore(a, b) {
  const ai = Number(a.slice(1));
  const bi = Number(b.slice(1));
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

const applicants = Array.from({ length: 50 }, (_, i) => `P${String(i + 1).padStart(2, "0")}`);
const pairScores = {};
for (let i = 0; i < applicants.length - 1; i += 1) {
  for (let j = i + 1; j < applicants.length; j += 1) {
    pairScores[key(applicants[i], applicants[j])] = deterministicPairScore(applicants[i], applicants[j]);
  }
}

const start = performance.now();
let evaluatedCount = 0;
let suitableCount = 0;
let best = null;

// Streaming-Auswertung: keine 230.300 Gruppenobjekte im Speicher halten.
for (let a = 0; a < applicants.length - 3; a += 1) {
  for (let b = a + 1; b < applicants.length - 2; b += 1) {
    for (let c = b + 1; c < applicants.length - 1; c += 1) {
      for (let d = c + 1; d < applicants.length; d += 1) {
        const result = evaluateGroup([applicants[a], applicants[b], applicants[c], applicants[d]], pairScores);
        evaluatedCount += 1;
        if (!result.suitable) continue;
        suitableCount += 1;
        if (!best || result.average > best.average || (result.average === best.average && result.weakestPair > best.weakestPair)) {
          best = result;
        }
      }
    }
  }
}

const elapsedMs = performance.now() - start;
assert(Object.keys(pairScores).length === 1225, "Bei 50 Bewerbern müssen 1.225 Paar-Scores entstehen.");
assert(evaluatedCount === 230300, `Bei 50 Bewerbern müssen 230.300 4er-Kombinationen entstehen, erhalten: ${evaluatedCount}`);
assert(suitableCount > 0, "Es muss mindestens eine geeignete Gruppe geben.");
assert(best && best.average >= 75, "Beste Gruppe muss Durchschnitt >= 75 haben.");
assert(best && best.weakestPair >= 65, "Beste Gruppe muss schwächsten Paar-Score >= 65 haben.");

console.log("Gruppenfinder 50-Bewerber-Skalierungstest erfolgreich ✅");
console.log(`1. Bewerber: ${applicants.length}`);
console.log(`2. Paar-Scores erzeugt: ${Object.keys(pairScores).length}`);
console.log(`3. Bewertete 4er-Kombinationen: ${evaluatedCount}`);
console.log(`4. Geeignete 4er-Kombinationen: ${suitableCount}`);
console.log(`5. Beste Gruppe: ${best.group.join("/")} | Durchschnitt: ${best.average} | Schwächster Paar-Score: ${best.weakestPair}`);
console.log(`6. Reine Berechnungszeit: ${elapsedMs.toFixed(2)} ms`);
console.log("7. Alle 230.300 möglichen 4er-Kombinationen verglichen: JA");
console.log("8. Automatische Einladung: NEIN");
console.log("9. Kontaktdaten automatisch geteilt: NEIN");
console.log("10. Airtable geändert: NEIN");
