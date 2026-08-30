import { buildGroupProposalsPreview } from "./group-proposals-preview.js";

const BASE_ID = "apphnIBhuAbmMTUtY";
const GROUPS_TABLE = "tblF8peAAJGjwfKab";
const MEMBERS_TABLE = "tbl4QX0NIB3tUKtF4";

const GROUP_ID = "fldCb3rBz4kTWzQLx";
const GROUP_SCORE = "fldZrDowPCJ6PmyTf";
const GROUP_WEAKEST = "fldT2Y4bGs5n86S78";
const GROUP_RELEASED = "fldgALGaOoeJGd6yg";
const GROUP_RECOMMENDATION = "fldo8pdS7LhryHJKf";
const GROUP_NOTE = "fldfWghWAWGl9zQRD";

const MEMBER_ID = "fldM9T8hoUTJAH8v1";
const MEMBER_GROUP = "fldMUYzXykTpV0j2x";
const MEMBER_APPLICANT = "fldcV8kd6KF7zdScE";
const MEMBER_STATUS = "fldBS2hoKQX0Rr1aX";
const MEMBER_CONTACT_SHARED = "fld3LCPTEbAl46bF1";
const MEMBER_INVITE_STATUS = "fldUmjMa2j7MLG5RA";
const MEMBER_INVITE_RELEASED = "fldSGBeJO6GLQ27gi";

function fieldText(value) {
  if (value == null) return "";
  if (typeof value === "object" && !Array.isArray(value) && value.name) return String(value.name).trim();
  return String(value).trim();
}

async function airtable(env, tableId, options = {}) {
  const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}${options.path || ""}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) {
    let detail = "";
    try { const body = await response.json(); detail = body?.error?.type || body?.error?.message || JSON.stringify(body); } catch (_) {}
    throw new Error(detail || `Airtable HTTP ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function proposalFingerprint(applicantIds) {
  const source = [...applicantIds].sort().join("|");
  const bytes = new TextEncoder().encode(source);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 12);
}

async function groupAlreadyExists(env, groupId) {
  let offset = null;
  do {
    const q = new URLSearchParams({ pageSize: "100", returnFieldsByFieldId: "true" });
    if (offset) q.set("offset", offset);
    const page = await airtable(env, GROUPS_TABLE, { path: `?${q.toString()}` });
    const found = (page.records || []).find((r) => fieldText(r?.fields?.[GROUP_ID]) === groupId);
    if (found) return found;
    offset = page.offset || null;
  } while (offset);
  return null;
}

export async function handleGroupProposalRelease(env, input = {}) {
  if (!env?.AIRTABLE_TOKEN) return { ok: false, status: 500, code: "AIRTABLE_TOKEN_MISSING" };

  const dryRun = input?.dryRun !== false;
  const controlledTest = input?.testMode === "controlled-multi" || input?.testMode === "controlled-a-d";
  const confirmation = String(input?.confirmation || "");

  const preview = await buildGroupProposalsPreview(env, { limit: 1, controlledTest });
  const best = preview?.proposals?.[0];
  if (!preview?.ok || !best) {
    return { ok: false, status: 409, code: "NO_CURRENT_SUITABLE_PROPOSAL", dryRun };
  }

  const applicantIds = Array.isArray(best.applicantIds) ? best.applicantIds : [];
  if (applicantIds.length !== 4) return { ok: false, status: 422, code: "PROPOSAL_NOT_FOUR_APPLICANTS", dryRun };

  const fingerprint = await proposalFingerprint(applicantIds);
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const groupId = `LAVUQ-${date}-${fingerprint.toUpperCase()}`;

  const safety = {
    invitationsSent: false,
    contactsReleased: false,
    inviteReleaseSet: false,
  };

  if (dryRun) {
    return {
      ok: true,
      status: 200,
      state: "READY_FOR_MANUAL_GROUP_RELEASE",
      dryRun: true,
      controlledTest,
      groupId,
      fingerprint,
      proposal: best,
      wouldCreateGroup: true,
      wouldCreateMemberships: 4,
      safety,
      airtableChanged: false,
    };
  }

  if (confirmation !== "GRUPPE_FREIGEBEN") {
    return { ok: false, status: 409, code: "EXPLICIT_CONFIRMATION_REQUIRED", dryRun: false, safety };
  }

  if (controlledTest && input?.allowControlledWrite !== true) {
    return { ok: false, status: 409, code: "CONTROLLED_TEST_WRITE_BLOCKED", dryRun: false, safety };
  }

  const existing = await groupAlreadyExists(env, groupId);
  if (existing) {
    return {
      ok: true,
      status: 200,
      state: "GROUP_ALREADY_RELEASED",
      dryRun: false,
      groupId,
      groupRecordId: existing.id,
      duplicatePrevented: true,
      safety,
    };
  }

  const group = await airtable(env, GROUPS_TABLE, {
    method: "POST",
    body: {
      fields: {
        [GROUP_ID]: groupId,
        [GROUP_SCORE]: best.groupAverage,
        [GROUP_WEAKEST]: best.weakestPair,
        [GROUP_RELEASED]: true,
        [GROUP_RECOMMENDATION]: best.recommendation || "Vorschlag geeignet",
        [GROUP_NOTE]: `Manuell freigegebener Gruppenfinder-Vorschlag. Fingerprint: ${fingerprint}. Einladungen und Kontakte weiterhin gesperrt.`,
      },
    },
  });

  try {
    const membershipRecords = applicantIds.map((applicantId, index) => ({
      fields: {
        [MEMBER_ID]: `${groupId}-M${index + 1}`,
        [MEMBER_GROUP]: [group.id],
        [MEMBER_APPLICANT]: [applicantId],
        [MEMBER_STATUS]: "Vorgeschlagen",
        [MEMBER_CONTACT_SHARED]: false,
        [MEMBER_INVITE_STATUS]: "Nicht versendet",
        [MEMBER_INVITE_RELEASED]: false,
      },
    }));

    const members = await airtable(env, MEMBERS_TABLE, {
      method: "POST",
      body: { records: membershipRecords, typecast: false },
    });

    return {
      ok: true,
      status: 200,
      state: "GROUP_MANUALLY_RELEASED",
      dryRun: false,
      groupId,
      groupRecordId: group.id,
      membershipsCreated: members?.records?.length || 0,
      proposal: best,
      safety,
      airtableChanged: true,
    };
  } catch (error) {
    try { await airtable(env, GROUPS_TABLE, { method: "DELETE", path: `/${group.id}` }); } catch (_) {}
    throw error;
  }
}
