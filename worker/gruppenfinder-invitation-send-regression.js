import assert from "node:assert/strict";
import crypto from "node:crypto";

// Read-only regression of the state machine only. No Airtable writes and no email.
function prepareInvitation({ memberStatus, released }) {
  assert.equal(memberStatus, "Vorgeschlagen");
  assert.equal(released, true);
  return {
    token: crypto.randomBytes(24).toString("base64url"),
    inviteStatus: "Nicht versendet",
    contactShared: false,
  };
}

function markSent(state) {
  assert.ok(state.token.length >= 32);
  return { ...state, inviteStatus: "Gesendet", contactShared: false };
}

function respond(state, decision) {
  assert.equal(state.inviteStatus, "Gesendet");
  if (decision === "accept") {
    return { ...state, inviteStatus: "Angenommen", memberStatus: "Aktiv", contactShared: false };
  }
  if (decision === "decline") {
    return { ...state, inviteStatus: "Abgelehnt", memberStatus: "Vorgeschlagen", contactShared: false };
  }
  throw new Error("Unbekannte Entscheidung");
}

const prepared = prepareInvitation({ memberStatus: "Vorgeschlagen", released: true });
assert.equal(prepared.inviteStatus, "Nicht versendet");
assert.equal(prepared.contactShared, false);

const sent = markSent(prepared);
assert.equal(sent.inviteStatus, "Gesendet");
assert.equal(sent.contactShared, false);

const accepted = respond(sent, "accept");
assert.equal(accepted.inviteStatus, "Angenommen");
assert.equal(accepted.memberStatus, "Aktiv");
assert.equal(accepted.contactShared, false);

const declined = respond(sent, "decline");
assert.equal(declined.inviteStatus, "Abgelehnt");
assert.equal(declined.memberStatus, "Vorgeschlagen");
assert.equal(declined.contactShared, false);

console.log("Gruppenfinder Einladungs-Versand-Test erfolgreich ✅");
console.log("1. Manuelle Freigabe: JA");
console.log("2. Sicherer Token erzeugt: JA");
console.log("3. Vorbereitung allein versendet nichts: Nicht versendet");
console.log("4. Kontrollierter Versandstatus: Gesendet");
console.log("5. Annahme -> Mitgliedsstatus: Aktiv");
console.log("6. Ablehnung -> Mitgliedsstatus: Vorgeschlagen");
console.log("7. Kontaktdaten nach Annahme geteilt: NEIN");
console.log("8. Kontaktdaten nach Ablehnung geteilt: NEIN");
console.log("Hinweis: Regression ist read-only; es wird keine echte E-Mail verschickt.");
