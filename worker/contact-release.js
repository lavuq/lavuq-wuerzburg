// LAVUQ – Kontaktfreigabe mit expliziter Teilnehmer-Einwilligung.
// Automatische Freigabe ist nur erlaubt, wenn exakt vier aktive + angenommene
// Gruppenmitglieder vorhanden sind UND alle vier der Kontaktweitergabe zugestimmt haben.

const AIRTABLE_BASE_ID = "apphnIBhuAbmMTUtY";
const MEMBERS_TABLE_ID = "tbl4QX0NIB3tUKtF4";
const APPLICANTS_TABLE_ID = "tblzLtbR5Yh4nR5aQ";

const FIELD_GROUP = "fldMUYzXykTpV0j2x";
const FIELD_APPLICANT = "fldcV8kd6KF7zdScE";
const FIELD_STATUS = "fldBS2hoKQX0Rr1aX";
const FIELD_INVITE_STATUS = "fldUmjMa2j7MLG5RA";
const FIELD_CONTACT_SHARED = "fld3LCPTEbAl46bF1";
const FIELD_APPLICANT_CONTACT_CONSENT = "fldHkZAWmcVO5DGQc";

function airtableHeaders(env) {
  return {
    Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
    "Content-Type": "application/json",
  };
}

async function listRecords(env, tableId) {
  const records = [];
  let offset = "";
  do {
    const params = new URLSearchParams({ pageSize: "100", returnFieldsByFieldId: "true" });
    if (offset) params.set("offset", offset);
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}?${params.toString()}`,
      { headers: airtableHeaders(env) },
    );
    if (!response.ok) throw new Error(`Airtable ${tableId} HTTP ${response.status}`);
    const payload = await response.json();
    records.push(...(Array.isArray(payload.records) ? payload.records : []));
    offset = String(payload.offset || "");
  } while (offset);
  return records;
}

function linkedIds(value) {
  return Array.isArray(value)
    ? value.map((x) => (typeof x === "string" ? x : x?.id)).filter(Boolean)
    : [];
}
function linkedToGroup(record, groupId) {
  return linkedIds(record?.fields?.[FIELD_GROUP]).includes(groupId);
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
    return { ok: false, status: 500, code: "AIRTABLE_NOT_CONFIGURED" };
  }

  const groupId = String(input.groupId || "").trim();
  const dryRun = input.dryRun !== false;
  const confirmation = String(input.confirm || "").trim();
  const automatic = input.automatic === true;

  if (!/^rec[A-Za-z0-9]{14}$/.test(groupId)) {
    return { ok: false, status: 400, code: "INVALID_GROUP_ID" };
  }

  const [allMembers, applicants] = await Promise.all([
    listRecords(env, MEMBERS_TABLE_ID),
    listRecords(env, APPLICANTS_TABLE_ID),
  ]);
  const applicantById = new Map(applicants.map((r) => [r.id, r]));
  const groupMemberships = allMembers.filter((record) => linkedToGroup(record, groupId));
  const acceptedActive = groupMemberships.filter(isAcceptedActive);

  if (acceptedActive.length !== 4) {
    return {
      ok: false,
      status: 409,
      code: "NOT_ALL_4_ACCEPTED",
      groupId,
      acceptedActiveCount: acceptedActive.length,
      contactReleaseAllowed: false,
      changed: false,
    };
  }

  const consented = acceptedActive.filter((member) => {
    const applicantId = linkedIds(member?.fields?.[FIELD_APPLICANT])[0];
    return applicantId && applicantById.get(applicantId)?.fields?.[FIELD_APPLICANT_CONTACT_CONSENT] === true;
  });
  if (consented.length !== 4) {
    return {
      ok: false,
      status: 409,
      code: "CONTACT_SHARING_CONSENT_MISSING",
      groupId,
      acceptedActiveCount: 4,
      consentedCount: consented.length,
      contactReleaseAllowed: false,
      changed: false,
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
      consentedCount: 4,
      alreadySharedCount,
      contactReleaseAllowed: true,
      changed: false,
    };
  }

  if (!automatic && confirmation !== "KONTAKTE_FREIGEBEN") {
    return {
      ok: false,
      status: 400,
      code: "EXPLICIT_CONFIRMATION_REQUIRED",
      groupId,
      changed: false,
    };
  }
  if (automatic && confirmation !== "AUTOMATIC_CONTACT_RELEASE_WITH_CONSENT") {
    return {
      ok: false,
      status: 400,
      code: "AUTOMATIC_CONFIRMATION_REQUIRED",
      groupId,
      changed: false,
    };
  }

  if (alreadySharedCount === 4) {
    return {
      ok: true,
      status: 200,
      state: "CONTACTS_ALREADY_RELEASED",
      mode: automatic ? "automatic" : "commit",
      groupId,
      contactShared: true,
      changed: false,
      alreadyReleased: true,
    };
  }

  await batchMarkContactsShared(env, acceptedActive);
  return {
    ok: true,
    status: 200,
    state: "CONTACTS_RELEASED_WITH_PARTICIPANT_CONSENT",
    mode: automatic ? "automatic" : "commit",
    groupId,
    acceptedActiveCount: 4,
    consentedCount: 4,
    contactShared: true,
    changed: true,
    updatedMemberships: 4,
  };
}
