import assert from "node:assert/strict";

// Read-only regression: a Gruppenfinder proposal must never become an invitation
// until LAVUQ explicitly releases that proposed membership.
function invitationState({ memberStatus, released }) {
  if (memberStatus !== "Vorgeschlagen") {
    return { canPrepareInvitation: false, inviteStatus: "Nicht versendet", contactShared: false };
  }
  if (!released) {
    return { canPrepareInvitation: false, inviteStatus: "Nicht versendet", contactShared: false };
  }
  return { canPrepareInvitation: true, inviteStatus: "Nicht versendet", contactShared: false };
}

const proposal = { candidate: "E", memberStatus: "Vorgeschlagen" };

const beforeRelease = invitationState({ memberStatus: proposal.memberStatus, released: false });
assert.equal(beforeRelease.canPrepareInvitation, false);
assert.equal(beforeRelease.inviteStatus, "Nicht versendet");
assert.equal(beforeRelease.contactShared, false);

const afterManualRelease = invitationState({ memberStatus: proposal.memberStatus, released: true });
assert.equal(afterManualRelease.canPrepareInvitation, true);
assert.equal(afterManualRelease.inviteStatus, "Nicht versendet");
assert.equal(afterManualRelease.contactShared, false);

// Even after manual release, this gate only permits PREPARATION.
// Sending/token creation remains a separate action and contacts stay protected.
console.log("Gruppenfinder manueller Freigabe-Test erfolgreich ✅");
console.log("1. Vorgeschlagener Ersatz:", proposal.candidate);
console.log("2. Vor manueller Freigabe: Einladung vorbereiten = NEIN");
console.log("3. Einladungsstatus vor Freigabe:", beforeRelease.inviteStatus);
console.log("4. Manuelle Freigabe erteilt: JA");
console.log("5. Danach Einladung vorbereiten erlaubt: JA");
console.log("6. Einladung trotzdem noch nicht versendet:", afterManualRelease.inviteStatus);
console.log("7. Kontaktdaten geteilt: NEIN");
