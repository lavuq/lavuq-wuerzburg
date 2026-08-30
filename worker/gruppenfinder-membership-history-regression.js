import assert from "node:assert/strict";

const FIELD_STATUS = "status";
const FIELD_INVITE_STATUS = "inviteStatus";

function isAcceptedActive(record) {
  return record?.[FIELD_STATUS] === "Aktiv" && record?.[FIELD_INVITE_STATUS] === "Angenommen";
}

function evaluateContactRelease(memberships) {
  const acceptedActive = memberships.filter(isAcceptedActive);
  return {
    membershipCount: memberships.length,
    acceptedActiveCount: acceptedActive.length,
    allowed: acceptedActive.length === 4,
  };
}

const currentFourPlusHistory = [
  { id: "A", status: "Aktiv", inviteStatus: "Angenommen" },
  { id: "C", status: "Aktiv", inviteStatus: "Angenommen" },
  { id: "D", status: "Aktiv", inviteStatus: "Angenommen" },
  { id: "E", status: "Aktiv", inviteStatus: "Angenommen" },
  { id: "B", status: "Vorgeschlagen", inviteStatus: "Abgelehnt" },
];

const onlyThreeCurrentPlusHistory = [
  { id: "A", status: "Aktiv", inviteStatus: "Angenommen" },
  { id: "C", status: "Aktiv", inviteStatus: "Angenommen" },
  { id: "E", status: "Aktiv", inviteStatus: "Angenommen" },
  { id: "D", status: "Vorgeschlagen", inviteStatus: "Nicht versendet" },
  { id: "B", status: "Vorgeschlagen", inviteStatus: "Abgelehnt" },
];

const historicalButMarkedActive = [
  { id: "A", status: "Aktiv", inviteStatus: "Angenommen" },
  { id: "C", status: "Aktiv", inviteStatus: "Angenommen" },
  { id: "D", status: "Aktiv", inviteStatus: "Angenommen" },
  { id: "E", status: "Aktiv", inviteStatus: "Angenommen" },
  { id: "B", status: "Aktiv", inviteStatus: "Abgelehnt" },
];

const good = evaluateContactRelease(currentFourPlusHistory);
assert.equal(good.membershipCount, 5);
assert.equal(good.acceptedActiveCount, 4);
assert.equal(good.allowed, true);

const incomplete = evaluateContactRelease(onlyThreeCurrentPlusHistory);
assert.equal(incomplete.membershipCount, 5);
assert.equal(incomplete.acceptedActiveCount, 3);
assert.equal(incomplete.allowed, false);

const declinedHistory = evaluateContactRelease(historicalButMarkedActive);
assert.equal(declinedHistory.membershipCount, 5);
assert.equal(declinedHistory.acceptedActiveCount, 4);
assert.equal(declinedHistory.allowed, true);

console.log("Gruppenfinder Historien-/Ersatzmitgliedschaftstest erfolgreich ✅");
console.log(`Fall 1: 5 Datensaetze, davon 4 aktuell aktiv + angenommen -> Freigabe technisch erlaubt: ${good.allowed ? "JA" : "NEIN"}`);
console.log("Abgelehnte historische Mitgliedschaft B wurde nicht als aktueller Gruppenplatz mitgezaehlt.");
console.log(`Fall 2: Nur 3 aktuell aktiv + angenommen -> Freigabe erlaubt: ${incomplete.allowed ? "JA" : "NEIN"}`);
console.log(`Fall 3: B sogar Status Aktiv, aber Einladung Abgelehnt -> gezaehlte aktuelle Plaetze: ${declinedHistory.acceptedActiveCount}`);
console.log("Keine Airtable-Daten oder echten Kontaktdaten verwendet; Test ist vollstaendig read-only.");
