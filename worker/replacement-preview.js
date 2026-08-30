// LAVUQ – read-only Ersatzkandidaten-Vorschau
// Liest Airtable-Daten und berechnet Vorschläge, schreibt aber NICHTS zurück.
// Keine Gruppenzuweisung, keine Einladung, kein Token, keine Kontaktfreigabe.

import { findBestReplacementCandidate } from "./gruppenfinder-replacement.js";
import { weightedPairScore } from "./gruppenfinder.js";
import {
  profileFromAirtableFields,
  scoreProfilePairWithDistance,
} from "./gruppenfinder-profile-scoring.js";

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

const PAIR_A = "fldsgi4kvs4IWFUgl";
const PAIR_B = "fldxO1264TrJcQd0P";
const PAIR_SCORE = "fld3hcGAAcgILLmEw";
const PAIR_HARD_FILTER = "fldxqsVj7wCVztoEx";

function firstLink(value) {
  if (!Array.isArray(value) || !value.length) return null;
  const first = value[0];
  return typeof first === "string" ? first : first?.id || null;
}

async function airtableRequest(env, path) {
  const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${path}`, {
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
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

    if (a && b && hard && Number.isFinite(score)) {
      map.set(pairKey(a, b), score);
    }
  }

  return map;
}

async function calculateLivePairScore(aRecord, bRecord) {
  const aProfile = profileFromAirtableFields(aRecord?.fields || {});
  const bProfile = profileFromAirtableFields(bRecord?.fields || {});
  const profileResult = await scoreProfilePairWithDistance(aProfile, bProfile, fetch);
  if (!profileResult?.hardFilterPassed) return null;
  const weighted = weightedPairScore(profileResult.scores, {
    hardFilterPassed: profileResult.hardFilterPassed,
  });
  return weighted?.eligible && Number.isFinite(weighted?.score) ? weighted.score : null;
}

async function resolveExistingPairScores(scoreMap, remainingApplicants, remainingApplicantIds) {
  const pairs = [[0,1],[0,2],[1,2]];
  const scores = [];
  let liveFallbackCount = 0;

  for (const [i,j] of pairs) {
    let score = scoreMap.get(pairKey(remainingApplicantIds[i], remainingApplicantIds[j]));
    if (!Number.isFinite(score)) {
      score = await calculateLivePairScore(remainingApplicants[i], remainingApplicants[j]);
      if (Number.isFinite(score)) liveFallbackCount += 1;
    }
    scores.push(score);
  }

  return { scores, liveFallbackCount };
}

function isCurrentMembership(member, declinedMemberId) {
  if (!member || member.id === declinedMemberId) return false;
  if (!applicantIdFromMember(member)) return false;

  const invite = String(member?.fields?.[MEMBER_INVITE_STATUS]?.name || member?.fields?.[MEMBER_INVITE_STATUS] || "");
  return invite !== "Abgelehnt" && invite !== "Abgelaufen";
}

function isCommittedMembership(member, declinedMemberId) {
  if (member.id === declinedMemberId) return false;

  const status = String(member?.fields?.[MEMBER_STATUS]?.name || member?.fields?.[MEMBER_STATUS] || "");
  const invite = String(member?.fields?.[MEMBER_INVITE_STATUS]?.name || member?.fields?.[MEMBER_INVITE_STATUS] || "");

  if (["Abgelehnt", "Abgelaufen"].includes(invite)) return false;
  return status === "Aktiv" || status === "Vorgeschlagen";
}

export async function buildReplacementPreview(env, declinedMemberId) {
  if (!env?.AIRTABLE_TOKEN) throw new Error("AIRTABLE_TOKEN fehlt.");
  if (!declinedMemberId) throw new Error("declinedMemberId fehlt.");

  const declined = await getRecord(env, MEMBERS_TABLE, declinedMemberId);
  const groupId = firstLink(declined?.fields?.[MEMBER_GROUP]);
  const declinedApplicantId = applicantIdFromMember(declined);

  if (!groupId || !declinedApplicantId) {
    return {
      ok: false,
      code: "MEMBER_LINK_MISSING",
      reason: "Abgelehntes Mitglied ist nicht vollständig mit Gruppe/Bewerber verknüpft.",
    };
  }

  const group = await getRecord(env, GROUPS_TABLE, groupId);
  const memberIdsRaw = Array.isArray(group?.fields?.[GROUP_MEMBERS]) ? group.fields[GROUP_MEMBERS] : [];
  const memberIds = memberIdsRaw.map((x)=>typeof x==="string"?x:x?.id).filter(Boolean);

  const memberRecords = [];
  for (const id of memberIds) memberRecords.push(await getRecord(env, MEMBERS_TABLE, id));

  const remainingMemberships = memberRecords.filter((member) => isCurrentMembership(member, declinedMemberId));

  if (remainingMemberships.length === 4) {
    return { ok:true, mode:"read-only", state:"replacement-already-filled", actionRequired:false, evaluatedCandidates:0, suitableCandidates:0, best:null };
  }

  if (remainingMemberships.length > 4) {
    return { ok:false, code:"GROUP_OVERFILLED", reason:"Die Gruppe enthält mehr als vier aktuelle Mitgliedschaften." };
  }

  if (remainingMemberships.length !== 3) {
    return { ok:false, code:"REMAINING_MEMBER_COUNT", reason:"Ersatzsuche erwartet genau 3 verbleibende Mitglieder." };
  }

  const remainingApplicantIds = remainingMemberships.map(applicantIdFromMember);
  const remainingApplicants = [];
  for (const applicantId of remainingApplicantIds) remainingApplicants.push(await getRecord(env, APPLICANTS_TABLE, applicantId));

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
  const resolved = await resolveExistingPairScores(scoreMap, remainingApplicants, remainingApplicantIds);
  const existingPairScores = resolved.scores;

  if (existingPairScores.some((score) => !Number.isFinite(score))) {
    return {
      ok: false,
      code: "MISSING_PAIR_SCORES",
      reason: "Bestehende Paar-Scores der verbleibenden Gruppe konnten weder gespeichert noch live vollständig berechnet werden.",
    };
  }

  const result = await findBestReplacementCandidate({
    remainingMembers: remainingApplicants,
    existingPairScores,
    candidates: allApplicants,
    excludedApplicantIds: [declinedApplicantId, ...remainingApplicantIds],
    committedApplicantIds,
    fetchImpl: fetch,
  });

  return {
    ok: true,
    mode: "read-only",
    state: "replacement-needed",
    actionRequired: true,
    groupId,
    declinedApplicantId,
    remainingApplicantIds,
    existingPairScores,
    existingPairScoresLiveFallbackCount: resolved.liveFallbackCount,
    best: result.best,
    ranked: result.ranked,
    evaluatedCandidates: result.evaluatedCandidates,
    suitableCandidates: result.suitableCandidates,
  };
}
