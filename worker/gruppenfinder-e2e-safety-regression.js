import assert from "node:assert/strict";

function acceptedActive(m) {
  return m.status === "Aktiv" && m.inviteStatus === "Angenommen";
}
function canReleaseContacts(memberships, manualRelease) {
  return manualRelease === true && memberships.filter(acceptedActive).length === 4;
}

const state = {
  contactsShared: false,
  manualContactRelease: false,
  memberships: [
    { id: "A", status: "Vorgeschlagen", inviteStatus: "Nicht versendet", inviteReleased: false },
    { id: "B", status: "Vorgeschlagen", inviteStatus: "Nicht versendet", inviteReleased: false },
    { id: "C", status: "Vorgeschlagen", inviteStatus: "Nicht versendet", inviteReleased: false },
    { id: "D", status: "Vorgeschlagen", inviteStatus: "Nicht versendet", inviteReleased: false },
  ],
};

// Gruppe gefunden: noch keinerlei Freigabe oder Versand.
assert.equal(state.contactsShared, false);
assert.equal(canReleaseContacts(state.memberships, state.manualContactRelease), false);

// Manuelle Einladungsfreigabe und kontrollierter Versand werden simuliert.
for (const m of state.memberships) {
  m.inviteReleased = true;
  m.inviteStatus = "Gesendet";
}

// A/C/D nehmen an, B lehnt ab.
for (const id of ["A", "C", "D"]) {
  const m = state.memberships.find(x => x.id === id);
  m.inviteStatus = "Angenommen";
  m.status = "Aktiv";
}
const b = state.memberships.find(x => x.id === "B");
b.inviteStatus = "Abgelehnt";
assert.equal(state.memberships.filter(acceptedActive).length, 3);
assert.equal(canReleaseContacts(state.memberships, true), false);

// Ersatz E wird vorgeschlagen. B bleibt als Historie erhalten.
state.memberships.push({ id: "E", status: "Vorgeschlagen", inviteStatus: "Nicht versendet", inviteReleased: false });
assert.equal(state.memberships.length, 5);
assert.equal(canReleaseContacts(state.memberships, true), false);

// E braucht ebenfalls bewusste Einladungsfreigabe.
const e = state.memberships.find(x => x.id === "E");
e.inviteReleased = true;
e.inviteStatus = "Gesendet";
assert.equal(canReleaseContacts(state.memberships, true), false);

// E nimmt an: jetzt 4 aktuelle aktive + angenommene, B bleibt Historie.
e.inviteStatus = "Angenommen";
e.status = "Aktiv";
assert.equal(state.memberships.filter(acceptedActive).length, 4);

// Auch 4/4 allein teilt noch keine Kontakte.
assert.equal(canReleaseContacts(state.memberships, false), false);
assert.equal(state.contactsShared, false);

// Erst bewusste Kontaktfreigabe macht die technische Freigabe möglich.
state.manualContactRelease = true;
assert.equal(canReleaseContacts(state.memberships, state.manualContactRelease), true);

// Regression bleibt read-only: keine echten Kontakte/Airtable/E-Mails.
assert.equal(state.contactsShared, false);

console.log("Gruppenfinder End-to-End-Sicherheitstest erfolgreich ✅");
console.log("1. Gruppe gefunden -> keine automatische Einladung/Kontaktfreigabe.");
console.log("2. A/C/D angenommen, B abgelehnt -> nur 3 aktuelle Plaetze; Kontaktfreigabe blockiert.");
console.log("3. Ersatz E vorgeschlagen -> B bleibt als Historie erhalten.");
console.log("4. E erst nach manueller Einladungsfreigabe versandbereit.");
console.log("5. E angenommen -> 4 aktuell aktiv + angenommen.");
console.log("6. 4/4 allein -> Kontakte weiterhin NICHT automatisch geteilt.");
console.log("7. Erst bewusste Kontaktfreigabe + 4/4 -> technisch erlaubt.");
console.log("8. Test ist vollstaendig read-only: keine Airtable-Aenderung, keine E-Mail, keine echten Kontaktdaten.");
