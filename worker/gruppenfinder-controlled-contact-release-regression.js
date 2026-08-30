import assert from "node:assert/strict";

// Vollständig read-only: simuliert nur die bewusste Kontaktfreigabe.
// Keine Airtable-Schreibzugriffe, keine E-Mails, keine echten Kontaktdaten.
function canReleaseContacts(members) {
  return (
    members.length === 4 &&
    members.every(
      (member) =>
        member.memberStatus === "Aktiv" &&
        member.inviteStatus === "Angenommen",
    )
  );
}

function controlledContactRelease(members, manualRelease) {
  const eligible = canReleaseContacts(members);
  return {
    eligible,
    manualRelease: manualRelease === true,
    contactShared: eligible && manualRelease === true,
  };
}

const completeGroup = [
  { id: "A", memberStatus: "Aktiv", inviteStatus: "Angenommen" },
  { id: "C", memberStatus: "Aktiv", inviteStatus: "Angenommen" },
  { id: "D", memberStatus: "Aktiv", inviteStatus: "Angenommen" },
  { id: "E", memberStatus: "Aktiv", inviteStatus: "Angenommen" },
];

const threeOfFour = [
  ...completeGroup.slice(0, 3),
  { id: "E", memberStatus: "Vorgeschlagen", inviteStatus: "Gesendet" },
];

// 4/4 allein darf noch nichts teilen.
const completeWithoutRelease = controlledContactRelease(completeGroup, false);
assert.equal(completeWithoutRelease.eligible, true);
assert.equal(completeWithoutRelease.contactShared, false);

// Erst 4/4 + bewusste Freigabe darf die simulierte Freigabe auslösen.
const completeWithRelease = controlledContactRelease(completeGroup, true);
assert.equal(completeWithRelease.eligible, true);
assert.equal(completeWithRelease.manualRelease, true);
assert.equal(completeWithRelease.contactShared, true);

// Manuelle Freigabe darf die 4/4-Sicherheitsbedingung niemals umgehen.
const incompleteWithRelease = controlledContactRelease(threeOfFour, true);
assert.equal(incompleteWithRelease.eligible, false);
assert.equal(incompleteWithRelease.contactShared, false);

console.log("Gruppenfinder kontrollierte Kontaktfreigabe erfolgreich ✅");
console.log("1. Alle 4 aktiv + angenommen: JA");
console.log("2. Ohne bewusste Freigabe -> Kontaktdaten geteilt: NEIN");
console.log("3. Mit bewusster Freigabe + 4/4 -> Freigabe technisch erlaubt: JA");
console.log("4. Nur 3/4 trotz manueller Freigabe -> Kontaktdaten geteilt: NEIN");
console.log("5. Echte Kontaktdaten verwendet oder versendet: NEIN");
console.log("Hinweis: Der Test simuliert contactShared nur im Arbeitsspeicher und bleibt vollständig read-only.");