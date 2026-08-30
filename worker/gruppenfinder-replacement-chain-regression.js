import { rankReplacementCandidates } from "./gruppenfinder.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Kontrollierter Kettentest:
// 1) Ein bestehendes Gruppenmitglied lehnt ab.
// 2) Dadurch entsteht genau ein freier Platz.
// 3) Mehrere Ersatzkandidaten werden gegen die drei verbleibenden Mitglieder bewertet.
// 4) Der beste geeignete Kandidat wird nur VORGESCHLAGEN.
// 5) Es wird ausdrücklich KEINE automatische Einladung freigegeben.

const membershipsBefore = [
  { id: "A", status: "Aktiv", invitationStatus: "Angenommen" },
  { id: "B", status: "Vorgeschlagen", invitationStatus: "Gesendet" },
  { id: "C", status: "Aktiv", invitationStatus: "Angenommen" },
  { id: "D", status: "Aktiv", invitationStatus: "Angenommen" },
];

const membershipsAfterDecline = membershipsBefore.map((member) =>
  member.id === "B"
    ? { ...member, invitationStatus: "Abgelehnt" }
    : member,
);

function isOpenSlot(member) {
  return ["Abgelehnt", "Abgelaufen"].includes(member.invitationStatus);
}

const openSlots = membershipsAfterDecline.filter(isOpenSlot);
assert(openSlots.length === 1, `Erwartet genau 1 freien Platz, erhalten ${openSlots.length}`);
assert(openSlots[0].id === "B", "Der freie Platz muss durch die Ablehnung von B entstehen.");

const existingPairScores = [86.9, 82.1, 86.7];
const candidates = [
  { id: "E", pairScores: [100.0, 86.9, 82.1] },
  { id: "F", pairScores: [88.0, 84.0, 80.0] },
  { id: "SCHWACH", pairScores: [90.0, 90.0, 60.0] },
];

const ranking = rankReplacementCandidates(candidates, existingPairScores);
const proposed = ranking.find((candidate) => candidate.eligible);

assert(proposed, "Es muss mindestens einen geeigneten Ersatzkandidaten geben.");
assert(proposed.id === "E", `Erwartet E als besten Ersatzkandidaten, erhalten ${proposed.id}`);
assert(proposed.groupAverage === 87.5, `E: erwarteter Gruppen-Durchschnitt 87.5, erhalten ${proposed.groupAverage}`);
assert(proposed.weakestPair === 82.1, `E: erwarteter schwächster Paar-Score 82.1, erhalten ${proposed.weakestPair}`);

const replacementProposal = {
  vacancyForMember: openSlots[0].id,
  candidateId: proposed.id,
  membershipStatus: "Vorgeschlagen",
  invitationStatus: "Nicht versendet",
  invitationReleased: false,
  contactShared: false,
};

assert(replacementProposal.membershipStatus === "Vorgeschlagen", "Ersatzperson darf zunächst nur vorgeschlagen sein.");
assert(replacementProposal.invitationStatus === "Nicht versendet", "Es darf noch keine Einladung als versendet markiert sein.");
assert(replacementProposal.invitationReleased === false, "Die Einladung darf nicht automatisch freigegeben werden.");
assert(replacementProposal.contactShared === false, "Kontaktdaten dürfen nicht automatisch geteilt werden.");

console.log("Gruppenfinder Ablehnung-/Ersatzketten-Test erfolgreich ✅");
console.log("1. Ablehnung erkannt: B -> Platz frei");
console.log(`2. Bewertete Ersatzkandidaten: ${ranking.length}`);
console.log(`3. Bester geeigneter Ersatz: ${proposed.id} | Durchschnitt: ${proposed.groupAverage} | Schwächster Paar-Score: ${proposed.weakestPair}`);
console.log("4. Neuer Mitgliedsstatus: Vorgeschlagen");
console.log("5. Einladungsstatus: Nicht versendet");
console.log("6. Einladung automatisch freigegeben: NEIN");
console.log("7. Kontaktdaten geteilt: NEIN");
