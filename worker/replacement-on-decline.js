// LAVUQ – Ersatzvorschlag nach Absage
// Liest nur erforderliche Airtable-Daten, berechnet einen Vorschlag und speichert
// ihn an der Gruppe zur manuellen Prüfung. Keine Einladung, kein Token, keine Kontaktfreigabe.

import { findBestReplacementCandidate } from "./gruppenfinder-replacement.js";

const BASE_ID = "apphnIBhuAbmMTUtY";
const APPLICANTS_TABLE = "tblzLtbR5Yh4nR5aQ";
const GROUPS_TABLE = "tblF8peAAJGjwfKab";
const MEMBERS_TABLE = "tbl4QX0NIB3tUKtF4";
const PAIRS_TABLE = "tblsGuVbUkbsLLAh2";

const MEMBER_GROUP = "fldMUYzXykTpV0j2x";
const MEMBER_APPLICANT = "fldcV8kd6KF7zdScE";
const MEMBER_STATUS = "fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS = "fldUmjMa2j7MLG5RA";

const GROUP_MEMBERS = "fldefQRMALyEVcFvg";
const GROUP_REPLACEMENT_APPLICANT = "fldACvW6dTj5J85tD";
const GROUP_REPLACEMENT_AVERAGE = "fldAzPxVLx1UroFnc";
const GROUP_REPLACEMENT_WEAKEST = "fldBfiesZsl9pdafH";
const GROUP_REPLACEMENT_STATUS = "fldmm2AyEi1vGixhl";

const PAIR_A = "fldsgi4kvs4IWFUgl";
const PAIR_B = "fldxO1264TrJcQd0P";
const PAIR_SCORE = "fld3hcGAAcgILLmEw";
const PAIR_HARD_FILTER = "fldxqsVj7wCVztoEx";

function firstLink(value) {
  return Array.isArray(value) && value.length ? value[0] : null;
}

async function airtableRequest(env, path, options = {}) {
  const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.error?.type || body?.error?.message || "";
    } catch (_) {}
    throw new Error(detail || `Airtable HTTP ${response.status}`);
  }
  return response.json();
}

async function getRecord(env, tableId, recordId) {
  return airtableRequest(env, `${tableId}/${recordId}?returnFieldsByFieldId=true`);
}

async function listAll(env, tableId) {
  const records = [];
  let offset = null;
  do {
    const query = new URLSearchParams({
      pageSize: "100",
      returnFieldsByFieldId: "true",
    });
    if (offset) query.set("offset", offset);
    const page = await airtableRequest(env, `${tableId}?${query.toString()}`);
    records.push(...(page.records || []));
    offset = page.offset || null;
  } while (offset);
  return records;
}

async function patchGroup(env, groupId, fields) {
  return airtableRequest(env, `${GROUPS_TABLE}/${groupId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields }),
  });
}

function applicantIdFromMember(member) {
  return firstLink(member?.fields?.[MEMBER_APPLICANT]);
}

function pairKey(a, b) {
  return [a, b].sort().join("|");
}

function buildPairScoreMap(pairRecords) {
  const map = new Map();
  for (const record of pairRecords) {
    const a = firstLink(record?.fields?.[PAIR_A]);
    const b = firstLink(record?.fields?.[PAIR_B]);
    const score = Number(record?.fields?.[PAIR_SCORE]);
    const hard = record?.fields?.[PAIR_HARD_FILTER] === true;
    if (a && b && hard && Number.isFinite(score)) map.set(pairKey(a, b), score);
  }
  return map;
}

function isCommittedMembership(member, declinedMemberId) {
  if (member.id === declinedMemberId) return false;
  const status = String(member?.fields?.[MEMBER_STATUS] || "");
  const invite = String(member?.fields?.[MEMBER_INVITE_STATUS] || "");
  if (["Abgelehnt", "Abgelaufen"].includes(invite)) return false;
  return status === "Aktiv" || status === "Vorgeschlagen";
}

export async function createReplacementProposalAfterDecline(env, declinedMemberId) {
  if (!env?.AIRTABLE_TOKEN) throw new Error("AIRTABLE_TOKEN fehlt.");

  const declined = await getRecord(env, MEMBERS_TABLE, declinedMemberId);
  const groupId = firstLink(declined?.fields?.[MEMBER_GROUP]);
  const declinedApplicantId = applicantIdFromMember(declined);
  if (!groupId || !declinedApplicantId) {
    return { ok: false, reason: "Abgelehntes Mitglied ist nicht vollständig mit Gruppe/Bewerber verknüpft." };
  }

  const group = await getRecord(env, GROUPS_TABLE, groupId);
  const memberIds = Array.isArray(group?.fields?.[GROUP_MEMBERS]) ? group.fields[GROUP_MEMBERS] : [];

  const memberRecords = [];
  for (const id of memberIds) {
    const member = await getRecord(env, MEMBERS_TABLE, id);
    if (member) memberRecords.push(member);
  }

  const remainingMemberships = memberRecords.filter((member) => {
    if (member.id === declinedMemberId) return false;
    const applicantId = applicantIdFromMember(member);
    if (!applicantId) return false;
    const invite = String(member?.fields?.[MEMBER_INVITE_STATUS] || "");
    return invite !== "Abgelehnt" && invite !== "Abgelaufen";
  });

  if (remainingMemberships.length !== 3) {
    await patchGroup(env, groupId, {
      [GROUP_REPLACEMENT_APPLICANT]: [],
      [GROUP_REPLACEMENT_STATUS]: "Kein Vorschlag",
    });
    return { ok: false, reason: `Ersatzsuche erwartet 3 verbleibende Mitglieder, gefunden: ${remainingMemberships.length}.` };
  }

  const remainingApplicants = [];
  const remainingApplicantIds = [];
  for (const membership of remainingMemberships) {
    const applicantId = applicantIdFromMember(membership);
    remainingApplicantIds.push(applicantId);
    remainingApplicants.push(await getRecord(env, APPLICANTS_TABLE, applicantId));
  }

  const [allApplicants, allMemberships, pairRecords] = await Promise.all([
    listAll(env, APPLICANTS_TABLE),
    listAll(env, MEMBERS_TABLE),
    listAll(env, PAIRS_TABLE),
  ]);

  const committedApplicantIds = allMemberships
    .filter((member) => isCommittedMembership(member, declinedMemberId))
    .map(applicantIdFromMember)
    .filter(Boolean);

  const scoreMap = buildPairScoreMap(pairRecords);
  const existingPairScores = [
    scoreMap.get(pairKey(remainingApplicantIds[0], remainingApplicantIds[1])),
    scoreMap.get(pairKey(remainingApplicantIds[0], remainingApplicantIds[2])),
    scoreMap.get(pairKey(remainingApplicantIds[1], remainingApplicantIds[2])),
  ];

  if (existingPairScores.some((score) => !Number.isFinite(score))) {
    await patchGroup(env, groupId, {
      [GROUP_REPLACEMENT_APPLICANT]: [],
      [GROUP_REPLACEMENT_STATUS]: "Kein Vorschlag",
    });
    return { ok: false, reason: "Bestehende Paar-Scores der verbleibenden Gruppe sind unvollständig." };
  }

  const excludedApplicantIds = [declinedApplicantId, ...remainingApplicantIds];
  const result = await findBestReplacementCandidate({
    remainingMembers: remainingApplicants,
    existingPairScores,
    candidates: allApplicants,
    excludedApplicantIds,
    committedApplicantIds,
    fetchImpl: fetch,
  });

  if (!result.best) {
    await patchGroup(env, groupId, {
      [GROUP_REPLACEMENT_APPLICANT]: [],
      [GROUP_REPLACEMENT_STATUS]: "Kein Vorschlag",
    });
    return { ok: true, proposalCreated: false, groupId, evaluatedCandidates: result.evaluatedCandidates };
  }

  await patchGroup(env, groupId, {
    [GROUP_REPLACEMENT_APPLICANT]: [result.best.applicantId],
    [GROUP_REPLACEMENT_AVERAGE]: result.best.groupAverage,
    [GROUP_REPLACEMENT_WEAKEST]: result.best.weakestPair,
    [GROUP_REPLACEMENT_STATUS]: "Zur Prüfung",
  });

  return {
    ok: true,
    proposalCreated: true,
    groupId,
    applicantId: result.best.applicantId,
    groupAverage: result.best.groupAverage,
    weakestPair: result.best.weakestPair,
    suitableCandidates: result.suitableCandidates,
  };
}
