// LAVUQ – kontrollierte Kontaktfreigabe
// Dieser Code gibt Kontaktdaten NICHT automatisch frei.
// Voraussetzung fuer einen Schreibvorgang:
// 1) geschuetzter Admin-Endpunkt,
// 2) exakt vier aktive + angenommene Gruppenmitglieder,
// 3) dryRun=false,
// 4) explizite Bestaetigung "KONTAKTE_FREIGEBEN".

const AIRTABLE_BASE_ID = "apphnIBhuAbmMTUtY";
const MEMBERS_TABLE_ID = "tbl4QX0NIB3tUKtF4";

const FIELD_GROUP = "fldMUYzXykTpV0j2x";
const FIELD_STATUS = "fldBS2hoKQX0Rr1aX";
const FIELD_INVITE_STATUS = "fldUmjMa2j7MLG5RA";
const FIELD_CONTACT_SHARED = "fld3LCPTEbAl46bF1";

function airtableHeaders(env) {
  return {
    Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
    "Content-Type": "application/json",
  };
}

async function listMemberRecords(env) {
  const records = [];
  let offset = "";

  do {
    const params = new URLSearchParams({
      pageSize: "100",
      returnFieldsByFieldId: "true",
    });
    if (offset) params.set("offset", offset);

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${MEMBERS_TABLE_ID}?${params.toString()}`,
      { headers: airtableHeaders(env) },
    );

    if (!response.ok) {
      throw new Error(`Airtable Mitgliederliste HTTP ${response.status}`);
    }

    const payload = await response.json();
    records.push(...(Array.isArray(payload.records) ? payload.records : []));
    offset = String(payload.offset || "");
  } while (offset);

  return records;
}

function linkedToGroup(record, groupId) {
  const links = record?.fields?.[FIELD_GROUP];
  return Array.isArray(links) && links.includes(groupId);
}

function isAcceptedActive(record) {
  return (
    String(record?.fields?.[FIELD_STATUS] || "") === "Aktiv" &&
    String(record?.fields?.[FIELD_INVITE_STATUS] || "") === "Angenommen"
  );
}

async function batchMarkContactsShared(env, records) {
  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${MEMBERS_TABLE_ID}`,
    {
      method: "PATCH",
      headers: airtableHeaders(env),
      body: JSON.stringify({
        records: records.map((record) => ({
          id: record.id,
          fields: { [FIELD_CONTACT_SHARED]: true },
        })),
      }),
    },
  );

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.error?.type || body?.error?.message || "";
    } catch (_) {}
    throw new Error(detail || `Airtable Kontaktfreigabe HTTP ${response.status}`);
  }

  return response.json();
}

export async function handleControlledContactRelease(env, input = {}) {
  if (!env?.AIRTABLE_TOKEN) {
    return {
      ok: false,
      status: 500,
      code: "AIRTABLE_NOT_CONFIGURED",
      error: "Airtable-Zugang ist nicht eingerichtet.",
    };
  }

  const groupId = String(input.groupId || "").trim();
  const dryRun = input.dryRun !== false;
  const confirmation = String(input.confirm || "").trim();

  if (!/^rec[A-Za-z0-9]{14}$/.test(groupId)) {
    return { ok: false, status: 400, code: "INVALID_GROUP_ID", error: "Ungueltige Gruppen-ID." };
  }

  const allMembers = await listMemberRecords(env);
  const groupMemberships = allMembers.filter((record) => linkedToGroup(record, groupId));
  const acceptedActive = groupMemberships.filter(isAcceptedActive);

  // Historische/abgelehnte Mitgliedschaften duerfen in der Gruppe erhalten bleiben.
  // Entscheidend sind exakt vier aktuell aktive + angenommene Mitgliedschaften.
  if (acceptedActive.length !== 4) {
    return {
      ok: false,
      status: 409,
      code: "NOT_ALL_4_ACCEPTED",
      groupId,
      groupMembershipCount: groupMemberships.length,
      acceptedActiveCount: acceptedActive.length,
      contactReleaseAllowed: false,
      changed: false,
      error: "Kontaktfreigabe ist erst bei exakt 4 aktiven und angenommenen Mitgliedern erlaubt.",
    };
  }

  const alreadySharedCount = acceptedActive.filter(
    (record) => record?.fields?.[FIELD_CONTACT_SHARED] === true,
  ).length;

  if (dryRun) {
    return {
      ok: true,
      status: 200,
      mode: "dry-run",
      groupId,
      acceptedActiveCount: 4,
      alreadySharedCount,
      contactReleaseAllowed: true,
      changed: false,
    };
  }

  if (confirmation !== "KONTAKTE_FREIGEBEN") {
    return {
      ok: false,
      status: 400,
      code: "EXPLICIT_CONFIRMATION_REQUIRED",
      groupId,
      acceptedActiveCount: 4,
      contactReleaseAllowed: true,
      changed: false,
      error: "Explizite Bestaetigung fehlt.",
    };
  }

  if (alreadySharedCount === 4) {
    return {
      ok: true,
      status: 200,
      mode: "commit",
      groupId,
      acceptedActiveCount: 4,
      alreadySharedCount: 4,
      contactReleaseAllowed: true,
      contactShared: true,
      changed: false,
      alreadyReleased: true,
    };
  }

  await batchMarkContactsShared(env, acceptedActive);

  return {
    ok: true,
    status: 200,
    mode: "commit",
    groupId,
    acceptedActiveCount: 4,
    contactReleaseAllowed: true,
    contactShared: true,
    changed: true,
    updatedMemberships: 4,
  };
}
