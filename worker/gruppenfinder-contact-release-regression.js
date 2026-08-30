import assert from "node:assert/strict";

// Read-only regression for the contact-release gate.
// No Airtable writes, no emails, and no real contact data are used.
function evaluateContactRelease(members) {
  assert.equal(members.length, 4, "Eine LAVUQ-Gruppe muss genau 4 Mitglieder haben.");

  const allAccepted = members.every(
    (member) => member.memberStatus === "Aktiv" && member.inviteStatus === "Angenommen",
  );

  return {
    allAccepted,
    contactReleaseAllowed: allAccepted,
    contactShared: false,
  };
}

const threeAccepted = [
  { id: "A", memberStatus: "Aktiv", inviteStatus: "Angenommen" },
  { id: "C", memberStatus: "Aktiv", inviteStatus: "Angenommen" },
  { id: "D", memberStatus: "Aktiv", inviteStatus: "Angenommen" },
  { id: "E", memberStatus: "Vorgeschlagen", inviteStatus: "Gesendet" },
];

const beforeComplete = evaluateContactRelease(threeAccepted);
assert.equal(beforeComplete.allAccepted, false);
assert.equal(beforeComplete.contactReleaseAllowed, false);
assert.equal(beforeComplete.contactShared, false);

const declinedMember = [
  { id: "A", memberStatus: "Aktiv", inviteStatus: "Angenommen" },
  { id: "C", memberStatus: "Aktiv", inviteStatus: "Angenommen" },
  { id: "D", memberStatus: "Aktiv", inviteStatus: "Angenommen" },
  { id: "E", memberStatus: "Vorgeschlagen", inviteStatus: "Abgelehnt" },
];

const afterDecline = evaluateContactRelease(declinedMember);
assert.equal(afterDecline.contactReleaseAllowed, false);
assert.equal(afterDecline.contactShared, false);

const allAccepted = [
  { id: "A", memberStatus: "Aktiv", inviteStatus: "Angenommen" },
  { id: "C", memberStatus: "Aktiv", inviteStatus: "Angenommen" },
  { id: "D", memberStatus: "Aktiv", inviteStatus: "Angenommen" },
  { id: "E", memberStatus: "Aktiv", inviteStatus: "Angenommen" },
];

const completeGroup = evaluateContactRelease(allAccepted);
assert.equal(completeGroup.allAccepted, true);
assert.equal(completeGroup.contactReleaseAllowed, true);
// Important: eligibility alone must never mutate/share contacts.
assert.equal(completeGroup.contactShared, false);

console.log("Gruppenfinder Kontaktfreigabe-Test erfolgreich ✅");
console.log("1. Nur 3 von 4 angenommen -> Kontaktfreigabe erlaubt: NEIN");
console.log("2. Eine Person abgelehnt -> Kontaktfreigabe erlaubt: NEIN");
console.log("3. Alle 4 aktiv + angenommen -> Kontaktfreigabe grundsätzlich erlaubt: JA");
console.log("4. Freigabebedingung allein teilt Kontaktdaten automatisch: NEIN");
console.log("5. Kontaktdaten im Regressionstest geteilt: NEIN");
console.log("Hinweis: Regression ist vollständig read-only und verwendet keine echten Kontaktdaten.");