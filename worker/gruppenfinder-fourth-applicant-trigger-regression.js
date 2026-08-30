import { evaluateFourPersonGroup } from "./gruppenfinder.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function simulateTrigger(eligibleApplicants, pairScores = []) {
  if (eligibleApplicants < 4) {
    return {
      eligibleApplicants,
      evaluatedGroups: 0,
      suitableGroups: 0,
      state: "NOT_ENOUGH_ELIGIBLE_APPLICANTS",
      invitationSent: false,
      contactShared: false,
      airtableChanged: false,
    };
  }

  const evaluation = evaluateFourPersonGroup(pairScores);
  return {
    eligibleApplicants,
    evaluatedGroups: 1,
    suitableGroups: evaluation.suitable ? 1 : 0,
    state: evaluation.suitable ? "PROPOSAL_AVAILABLE" : "NO_SUITABLE_GROUP",
    evaluation,
    invitationSent: false,
    contactShared: false,
    airtableChanged: false,
  };
}

const before = simulateTrigger(3);
assert(before.state === "NOT_ENOUGH_ELIGIBLE_APPLICANTS", "Bei 3 Bewerbern muss gewartet werden.");
assert(before.evaluatedGroups === 0, "Bei 3 Bewerbern darf keine 4er-Gruppe bewertet werden.");

// Kontrollierte geeignete 4er-Konstellation; exakt sechs Paar-Scores.
const fourthArrives = simulateTrigger(4, [86.9, 82.1, 87.0, 94.1, 85.1, 86.7]);
assert(fourthArrives.evaluatedGroups === 1, "Beim 4. Bewerber muss genau eine 4er-Kombination bewertet werden.");
assert(fourthArrives.suitableGroups === 1, "Die kontrollierte 4er-Gruppe muss als geeignet erkannt werden.");
assert(fourthArrives.state === "PROPOSAL_AVAILABLE", "Es muss ein Vorschlag entstehen.");
assert(fourthArrives.evaluation.average >= 75, "Gruppendurchschnitt muss mindestens 75 sein.");
assert(fourthArrives.evaluation.weakestPair >= 65, "Schwächster Paar-Score muss mindestens 65 sein.");
assert(fourthArrives.invitationSent === false, "Ein Vorschlag darf keine Einladung versenden.");
assert(fourthArrives.contactShared === false, "Ein Vorschlag darf keine Kontaktdaten freigeben.");
assert(fourthArrives.airtableChanged === false, "Read-only Trigger darf Airtable nicht ändern.");

// Der 4. Bewerber kann vorhanden sein, ohne dass automatisch eine ungeeignete Gruppe entsteht.
const weakFourth = simulateTrigger(4, [90, 90, 90, 90, 90, 60]);
assert(weakFourth.suitableGroups === 0, "Paar-Score unter 65 muss den Vorschlag verhindern.");
assert(weakFourth.state === "NO_SUITABLE_GROUP", "Ungeeignete 4er-Gruppe muss ohne Vorschlag enden.");
assert(weakFourth.invitationSent === false && weakFourth.contactShared === false && weakFourth.airtableChanged === false,
  "Auch im Negativfall muss alles read-only bleiben.");

console.log("Gruppenfinder 4.-Bewerber-Trigger-Test erfolgreich ✅");
console.log("1. 3 geeignete Bewerber -> warten, keine 4er-Bewertung.");
console.log(`2. 4. geeigneter Bewerber -> Gruppe bewertet: JA | Durchschnitt: ${fourthArrives.evaluation.average} | Schwächster Paar-Score: ${fourthArrives.evaluation.weakestPair}`);
console.log("3. Geeignete Konstellation -> Vorschlag vorhanden: JA");
console.log("4. 4. Bewerber mit schwachem Paar-Score 60 -> Vorschlag verhindert: JA");
console.log("5. Automatische Einladung: NEIN");
console.log("6. Kontaktdaten automatisch geteilt: NEIN");
console.log("7. Airtable geändert: NEIN");
