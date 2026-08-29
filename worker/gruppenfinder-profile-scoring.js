// LAVUQ Gruppenfinder – Profil-Scoring v1
// Wandelt Bewerberantworten in reproduzierbare Einzel-Scores um.
// Kalibriert gegen die bestätigte Testgruppe A–D.

import { calculateDistanceCompatibility } from "./gruppenfinder-distance.js";

function text(value) {
  if (value == null) return "";
  if (typeof value === "object" && value.name) return String(value.name).trim();
  return String(value).trim();
}

function setFromCsv(value) {
  return new Set(text(value).split(",").map((v) => v.trim()).filter(Boolean));
}

function overlapCount(a, b) {
  let n = 0;
  for (const item of a) if (b.has(item)) n += 1;
  return n;
}

function isSubset(a, b) {
  for (const item of a) if (!b.has(item)) return false;
  return true;
}

export function scoreInterests(aValue, bValue) {
  const a = setFromCsv(aValue);
  const b = setFromCsv(bValue);
  const common = overlapCount(a, b);

  let score = common >= 5 ? 100 : common === 4 ? 90 : common === 3 ? 75 : common === 2 ? 55 : common === 1 ? 40 : 35;

  if (common >= 4 && Math.abs(a.size - b.size) <= 1 && (isSubset(a, b) || isSubset(b, a))) {
    score = Math.min(100, score + 10);
  }

  return score;
}

export function scoreFriendshipValues(aValue, bValue) {
  const a = setFromCsv(aValue);
  const b = setFromCsv(bValue);
  const common = overlapCount(a, b);
  const maxSize = Math.max(a.size, b.size);

  if (a.size === b.size && common === a.size) return 100;
  if (common >= 5) return 100;
  if (common === 4) return maxSize <= 5 ? 100 : 80;
  if (common === 3) return 70;
  if (common === 2) return 55;
  if (common === 1) return 40;
  return 25;
}

export function scoreSharedTime(aValue, bValue) {
  const a = setFromCsv(aValue);
  const b = setFromCsv(bValue);
  const common = overlapCount(a, b);

  let score = common >= 6 ? 100 : common === 5 ? 95 : common === 4 ? 90 : common === 3 ? 75 : common === 2 ? 55 : common === 1 ? 40 : 25;

  if (common === 3 && Math.abs(a.size - b.size) <= 1 && (isSubset(a, b) || isSubset(b, a))) {
    score = 85;
  }

  return score;
}

export function scoreExactOrNear(aValue, bValue, nearPairs = []) {
  const a = text(aValue);
  const b = text(bValue);
  if (!a || !b) return null;
  if (a === b) return 100;
  for (const [x, y, score] of nearPairs) {
    if ((a === x && b === y) || (a === y && b === x)) return score;
  }
  return 60;
}

export function scoreFriendshipGoal(aValue, bValue) {
  const a = text(aValue);
  const b = text(bValue);
  if (!a || !b) return null;
  return a === b ? 100 : 75;
}

export function scoreAge(aValue, bValue) {
  const a = Number(aValue);
  const b = Number(bValue);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const diff = Math.abs(a - b);
  if (diff <= 2) return 100;
  if (diff <= 5) return 90;
  if (diff <= 10) return 75;
  if (diff <= 15) return 60;
  return 40;
}

const LIFE_BASE = {
  "Berufstätig|Familienalltag mit Kindern": 50,
  "Familienalltag mit Kindern|Ruhestand": 40,
  "Berufstätig|Ruhestand": 45,
};

function lifeKey(a, b) {
  return [a, b].sort((x, y) => x.localeCompare(y, "de")).join("|");
}

export function scoreLifeSituation(aSituation, bSituation, aImportance, bImportance) {
  const a = text(aSituation);
  const b = text(bSituation);
  if (!a || !b) return null;
  if (a === b) return 100;

  let score = LIFE_BASE[lifeKey(a, b)] ?? 45;
  const importance = [text(aImportance), text(bImportance)];

  if (importance.includes("Teilweise wichtig")) score -= 10;

  return Math.max(0, Math.min(100, score));
}

export function hardFilterGroupComposition(a, b) {
  const genderA = text(a.geschlecht);
  const genderB = text(b.geschlecht);
  const prefA = text(a.gruppenwunsch);
  const prefB = text(b.gruppenwunsch);

  const accepts = (pref, otherGender) => {
    if (!pref || pref === "Keine Präferenz") return true;
    if (pref === "Nur Männer") return otherGender === "Männlich";
    if (pref === "Nur Frauen") return otherGender === "Weiblich";
    return true;
  };

  return accepts(prefA, genderB) && accepts(prefB, genderA);
}

function baseScores(a, b) {
  return {
    interessen: scoreInterests(a.interessen, b.interessen),
    freundschaftswerte: scoreFriendshipValues(a.freundschaftswerte, b.freundschaftswerte),
    kontaktfrequenz: scoreExactOrNear(a.kontaktfrequenz, b.kontaktfrequenz),
    freundschaftsziel: scoreFriendshipGoal(a.freundschaftsziel, b.freundschaftsziel),
    gemeinsameZeit: scoreSharedTime(a.gemeinsameZeit, b.gemeinsameZeit),
    persoenlichkeit: scoreExactOrNear(a.persoenlichkeit, b.persoenlichkeit, [
      ["Introvertiert", "Ausgeglichen", 80],
      ["Extrovertiert", "Ausgeglichen", 80],
    ]),
    planung: scoreExactOrNear(a.planung, b.planung, [
      ["Mischung aus geplant und spontan", "Gerne frühzeitig geplant", 80],
      ["Mischung aus geplant und spontan", "Eher spontan", 80],
    ]),
    lebenssituation: scoreLifeSituation(a.lebenssituation, b.lebenssituation, a.lebenssituationWichtigkeit, b.lebenssituationWichtigkeit),
    alter: scoreAge(a.alter, b.alter),
  };
}

// Synchroner Modus bleibt für Regressionstests ohne externe PLZ-Auflösung erhalten.
export function scoreProfilePair(a, b) {
  return {
    hardFilterPassed: hardFilterGroupComposition(a, b),
    scores: {
      ...baseScores(a, b),
      entfernung: null,
    },
  };
}

// Vollständiger Produktionsmodus inklusive Entfernung und beidseitigem Radius-Hard-Filter.
export async function scoreProfilePairWithDistance(a, b, fetchImpl = fetch) {
  const groupCompositionPassed = hardFilterGroupComposition(a, b);

  if (!groupCompositionPassed) {
    return {
      hardFilterPassed: false,
      hardFilters: {
        gruppenzusammensetzung: false,
        entfernung: null,
      },
      distance: null,
      scores: {
        ...baseScores(a, b),
        entfernung: null,
      },
      exclusionReason: "Gewünschte Gruppenzusammensetzung ist nicht kompatibel.",
    };
  }

  const distance = await calculateDistanceCompatibility(a, b, fetchImpl);
  const hardFilterPassed = groupCompositionPassed && distance.hardFilterPassed;

  return {
    hardFilterPassed,
    hardFilters: {
      gruppenzusammensetzung: groupCompositionPassed,
      entfernung: distance.hardFilterPassed,
    },
    distance: {
      resolved: distance.resolved,
      km: distance.distanceKm,
      reason: distance.reason,
    },
    scores: {
      ...baseScores(a, b),
      entfernung: distance.score,
    },
    exclusionReason: hardFilterPassed ? null : distance.reason,
  };
}

export function profileFromAirtableFields(fields = {}) {
  return {
    alter: fields.fldEIDovX5FIgFdif,
    geschlecht: fields.fldQ7YMAFTABnbrLo,
    gruppenwunsch: fields.fld49bquWX3QtAGur,
    interessen: fields.fldbnsrvWQa1z3QGo,
    persoenlichkeit: fields.fld78D6tSGN6F62Ec,
    planung: fields.fldWJh9cPUnMX9F58,
    kontaktfrequenz: fields.fldLwqv2A45o92Elb,
    freundschaftswerte: fields.fldhPsY2Zvnneh9Js,
    gemeinsameZeit: fields.fldEygPXWXs6gmVdy,
    lebenssituationWichtigkeit: fields.fldgVR6zKSMcmzxuK,
    lebenssituation: fields.fldFD6TqjrhGH2fip,
    freundschaftsziel: fields.fldZHIMXs41fjGQev,
    plz: fields.fldPI0pg4zB5cDMDm,
    maximalerUmkreisKm: fields.fldqC5pTpkRJH5I7e,
  };
}
