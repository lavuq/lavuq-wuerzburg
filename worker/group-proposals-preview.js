// LAVUQ – read-only 4er-Gruppen-Vorschläge
// Liest freigegebene Bewerber und berechnet mögliche Gruppen.
// Schreibt NICHTS nach Airtable, erstellt keine Gruppen und verschickt keine Einladungen.

import { profileFromAirtableFields, scoreProfilePairWithDistance } from "./gruppenfinder-profile-scoring.js";
import { weightedPairScore, evaluateFourPersonGroup } from "./gruppenfinder.js";

const BASE_ID = "apphnIBhuAbmMTUtY";
const APPLICANTS_TABLE = "tblzLtbR5Yh4nR5aQ";
const MEMBERS_TABLE = "tbl4QX0NIB3tUKtF4";

const APPLICANT_ACTIVE = "fld3AfxsslBlRpG4B";
const APPLICANT_READY = "fld3fw7Siu6ePkbjN";
const APPLICANT_GENDER = "fldQ7YMAFTABnbrLo";
const APPLICANT_GROUP_WISH = "fld49bquWX3QtAGur";

const MEMBER_APPLICANT = "fldcV8kd6KF7zdScE";
const MEMBER_STATUS = "fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS = "fldUmjMa2j7MLG5RA";

const MAX_ELIGIBLE_APPLICANTS = 40;

// Ausschließlich kontrollierte Testprofile A-F. Diese IDs dürfen nur im expliziten
// geschützten Testmodus ihre bestehende Gruppenbindung für die Berechnung ignorieren.
const CONTROLLED_TEST_APPLICANT_IDS = new Set([
  "recD0pbzMvStrQmCs", // A
  "recHH6a21SFbu2Y2C", // B
  "recLH985oQTy0uh2q", // C
  "rec2qyfv3hvpOGexa", // D
  "recDJTxYsYc3KCoX6", // E
  "recnO4MtDO0cJlgcL", // F
]);

function firstLink(value) {
  return Array.isArray(value) && value.length ? value[0] : null;
}

function fieldText(value) {
  if (value == null) return "";
  if (typeof value === "object" && !Array.isArray(value) && value.name) return String(value.name).trim();
  return String(value).trim();
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

function isCommittedMembership(member) {
  const status = fieldText(member?.fields?.[MEMBER_STATUS]);
  const invite = fieldText(member?.fields?.[MEMBER_INVITE_STATUS]);

  if (["Abgelehnt", "Abgelaufen"].includes(invite)) return false;
  return status === "Aktiv" || status === "Vorgeschlagen";
}

function groupCompositionSatisfied(records) {
  const genders = records.map((record) => fieldText(record?.fields?.[APPLICANT_GENDER])).filter(Boolean);
  const wishes = records.map((record) => fieldText(record?.fields?.[APPLICANT_GROUP_WISH]));

  // "Nur Männer" / "Nur Frauen" werden bereits paarweise durch die Profil-Scoring-Hard-Filter geprüft.
  // "Gemischte Gruppe" ist dagegen eine Gruppenbedingung: mindestens zwei unterschiedliche Geschlechter.
  if (wishes.includes("Gemischte Gruppe") && new Set(genders).size < 2) return false;
  return true;
}

function combinationsOfFour(items) {
  const result = [];
  for (let a = 0; a < items.length - 3; a += 1) {
    for (let b = a + 1; b < items.length - 2; b += 1) {
      for (let c = b + 1; c < items.length - 1; c += 1) {
        for (let d = c + 1; d < items.length; d += 1) {
          result.push([items[a], items[b], items[c], items[d]]);
        }
      }
    }
  }
  return result;
}

function pairKey(a, b) {
  return [a, b].sort().join("|");
}

async function scorePairCached(a, b, cache, fetchImpl = fetch) {
  const key = pairKey(a.id, b.id);
  if (cache.has(key)) return cache.get(key);

  const scored = await scoreProfilePairWithDistance(a.profile, b.profile, fetchImpl);
  const weighted = weightedPairScore(scored.scores, { hardFilterPassed: scored.hardFilterPassed });
  const result = {
    hardFilterPassed: scored.hardFilterPassed,
    score: weighted.score,
    recommendation: weighted.recommendation,
  };
  cache.set(key, result);
  return result;
}

export async function buildGroupProposalsPreview(env, { limit = 10, controlledTest = false } = {}) {
  if (!env?.AIRTABLE_TOKEN) throw new Error("AIRTABLE_TOKEN fehlt.");

  const [allApplicants, allMemberships] = await Promise.all([
    listAll(env, APPLICANTS_TABLE),
    listAll(env, MEMBERS_TABLE),
  ]);

  const committedApplicantIds = new Set(
    allMemberships
      .filter(isCommittedMembership)
      .map(applicantIdFromMember)
      .filter(Boolean),
  );

  let applicantPool = allApplicants
    .filter((record) => record?.fields?.[APPLICANT_ACTIVE] === true)
    .filter((record) => record?.fields?.[APPLICANT_READY] === true);

  if (controlledTest) {
    // Im kontrollierten Testmodus werden ausschließlich A-F betrachtet.
    // Nur für diese IDs wird die bestehende Gruppenbindung ignoriert.
    applicantPool = applicantPool.filter((record) => CONTROLLED_TEST_APPLICANT_IDS.has(record.id));
  } else {
    // Produktionsnahe Vorschau: gebundene Personen bleiben ausgeschlossen.
    applicantPool = applicantPool.filter((record) => !committedApplicantIds.has(record.id));
  }

  const eligible = applicantPool.map((record) => ({
    id: record.id,
    record,
    profile: profileFromAirtableFields(record.fields || {}),
  }));

  if (eligible.length > MAX_ELIGIBLE_APPLICANTS) {
    return {
      ok: false,
      code: "TOO_MANY_ELIGIBLE_APPLICANTS",
      eligibleApplicants: eligible.length,
      maximumSupported: MAX_ELIGIBLE_APPLICANTS,
    };
  }

  if (eligible.length < 4) {
    return {
      ok: true,
      mode: controlledTest ? "read-only-controlled-multi-test" : "read-only",
      eligibleApplicants: eligible.length,
      evaluatedGroups: 0,
      suitableGroups: 0,
      proposals: [],
      state: "NOT_ENOUGH_ELIGIBLE_APPLICANTS",
    };
  }

  const pairCache = new Map();
  const proposals = [];
  let evaluatedGroups = 0;

  for (const group of combinationsOfFour(eligible)) {
    const rawRecords = group.map((item) => item.record);
    if (!groupCompositionSatisfied(rawRecords)) continue;

    const pairScores = [];
    let excluded = false;

    for (let i = 0; i < group.length - 1 && !excluded; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        const pair = await scorePairCached(group[i], group[j], pairCache, fetch);
        if (!pair.hardFilterPassed || !Number.isFinite(pair.score)) {
          excluded = true;
          break;
        }
        pairScores.push(pair.score);
      }
    }

    if (excluded) continue;
    evaluatedGroups += 1;

    const evaluation = evaluateFourPersonGroup(pairScores);
    if (!evaluation.suitable) continue;

    proposals.push({
      applicantIds: group.map((item) => item.id),
      groupAverage: evaluation.average,
      weakestPair: evaluation.weakestPair,
      recommendation: evaluation.recommendation,
    });
  }

  proposals.sort((a, b) =>
    b.groupAverage - a.groupAverage
    || b.weakestPair - a.weakestPair,
  );

  const safeLimit = Math.max(1, Math.min(25, Number(limit) || 10));

  return {
    ok: true,
    mode: controlledTest ? "read-only-controlled-multi-test" : "read-only",
    eligibleApplicants: eligible.length,
    evaluatedGroups,
    suitableGroups: proposals.length,
    proposals: proposals.slice(0, safeLimit),
  };
}
