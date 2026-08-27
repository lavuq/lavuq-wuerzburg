// LAVUQ Matching Engine
// Deterministische Regeln für Paar- und Gruppenbewertung.
// Noch nicht produktiv verdrahtet: Die Ausführung muss später im Backend/Worker erfolgen.

const WEIGHTS = Object.freeze({
  interests: 0.18,
  friendshipValues: 0.16,
  contactFrequency: 0.14,
  friendshipGoal: 0.12,
  sharedTime: 0.12,
  personality: 0.08,
  planning: 0.07,
  age: 0.06,
  lifeSituation: 0.07,
});

const CONTACT_ORDER = [
  'Mehrmals pro Woche',
  'Ungefähr einmal pro Woche',
  'Ungefähr alle zwei Wochen',
  'Ein paar Mal im Monat',
  'Eher gelegentlich',
];

const PERSONALITY_ORDER = [
  'Eher ruhig und zurückhaltend',
  'Ausgeglichen',
  'Eher offen und kontaktfreudig',
];

const PLANNING_ORDER = [
  'Gerne frühzeitig geplant',
  'Mischung aus geplant und spontan',
  'Am liebsten spontan',
];

const FRIENDSHIP_GOALS = [
  'Eine enge, langfristige Freundschaft',
  'Regelmäßigen Kontakt',
  'Menschen für gemeinsame Unternehmungen',
  'Meinen Freundeskreis erweitern',
  'Erstmal neue Menschen kennenlernen',
];

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== 'string' || !value.trim()) return [];
  return value.split(/[,;\n]/).map(v => v.trim()).filter(Boolean);
}

// Sørensen-Dice: bewertet die gemeinsame Auswahl relativ zur Menge beider Personen.
function overlapScore(a, b) {
  const A = new Set(asArray(a));
  const B = new Set(asArray(b));
  if (!A.size && !B.size) return 50;
  if (!A.size || !B.size) return 0;
  let common = 0;
  for (const item of A) if (B.has(item)) common++;
  return clamp((2 * common / (A.size + B.size)) * 100);
}

function ordinalScore(a, b, order, table) {
  const ia = order.indexOf(a);
  const ib = order.indexOf(b);
  if (ia < 0 || ib < 0) return 50;
  return table[Math.abs(ia - ib)] ?? table[table.length - 1];
}

function contactFrequencyScore(a, b) {
  return ordinalScore(a, b, CONTACT_ORDER, [100, 75, 40, 10, 10]);
}

function personalityScore(a, b) {
  return ordinalScore(a, b, PERSONALITY_ORDER, [100, 75, 45]);
}

function planningScore(a, b) {
  return ordinalScore(a, b, PLANNING_ORDER, [100, 70, 30]);
}

function ageScore(a, b) {
  const diff = Math.abs(Number(a) - Number(b));
  if (!Number.isFinite(diff)) return 50;
  if (diff <= 4) return 100;
  if (diff <= 8) return 85;
  if (diff <= 12) return 65;
  if (diff <= 18) return 40;
  return 20;
}

function friendshipGoalScore(a, b) {
  if (!a || !b) return 50;
  if (a === b) return 100;
  const ia = FRIENDSHIP_GOALS.indexOf(a);
  const ib = FRIENDSHIP_GOALS.indexOf(b);
  if (ia < 0 || ib < 0) return 50;
  const diff = Math.abs(ia - ib);
  if (diff === 1) return 85;
  if (diff === 2) return 70;
  if (diff === 3) return 40;
  return 25;
}

function lifeSituationImportanceFactor(value) {
  switch (value) {
    case 'Sehr wichtig': return 1.0;
    case 'Teilweise wichtig': return 0.6;
    case 'Eher unwichtig': return 0.25;
    default: return 0.5;
  }
}

function lifeSituationScore(a, b) {
  const same = a.currentLifeSituation && b.currentLifeSituation &&
    a.currentLifeSituation === b.currentLifeSituation;
  const base = same ? 100 : 30;
  const importance = (lifeSituationImportanceFactor(a.lifeSituationImportance) +
    lifeSituationImportanceFactor(b.lifeSituationImportance)) / 2;
  // Bei geringer Wichtigkeit wird eine Abweichung deutlich weniger bestraft.
  if (same) return 100;
  return clamp(100 - ((100 - base) * importance));
}

function onlyGroupRequirement(pref) {
  if (pref === 'Nur Männer') return 'Männlich';
  if (pref === 'Nur Frauen') return 'Weiblich';
  return null;
}

function pairPreferenceCompatible(a, b) {
  const pa = a.groupPreference;
  const pb = b.groupPreference;
  const onlyA = onlyGroupRequirement(pa);
  const onlyB = onlyGroupRequirement(pb);

  if (onlyA && a.gender !== onlyA) return false;
  if (onlyA && b.gender !== onlyA) return false;
  if (onlyB && a.gender !== onlyB) return false;
  if (onlyB && b.gender !== onlyB) return false;

  // "Nur Männer/Frauen" und "Gemischte Gruppe" können in derselben 4er-Gruppe
  // nicht gleichzeitig vollständig erfüllt werden.
  if ((onlyA && pb === 'Gemischte Gruppe') || (onlyB && pa === 'Gemischte Gruppe')) return false;
  if (onlyA && onlyB && onlyA !== onlyB) return false;
  return true;
}

function hardFilter(a, b, distanceKm) {
  const reasons = [];
  if (!a.matchingReady || !b.matchingReady) reasons.push('Matching nicht freigegeben');
  if (!a.activeProfile || !b.activeProfile) reasons.push('Profil nicht aktiv');

  const distance = Number(distanceKm);
  if (!Number.isFinite(distance)) reasons.push('Entfernung unbekannt');
  else {
    if (Number.isFinite(Number(a.maxRadiusKm)) && distance > Number(a.maxRadiusKm)) reasons.push('Außerhalb Umkreis A');
    if (Number.isFinite(Number(b.maxRadiusKm)) && distance > Number(b.maxRadiusKm)) reasons.push('Außerhalb Umkreis B');
  }

  if (!pairPreferenceCompatible(a, b)) reasons.push('Gruppenwunsch/Geschlecht nicht kompatibel');
  return { passed: reasons.length === 0, reasons };
}

function evaluatePair(a, b, { distanceKm } = {}) {
  const hard = hardFilter(a, b, distanceKm);
  if (!hard.passed) {
    return { hardFilterPassed: false, exclusionReasons: hard.reasons, score: null, components: null };
  }

  const components = {
    interests: overlapScore(a.interests, b.interests),
    friendshipValues: overlapScore(a.friendshipValues, b.friendshipValues),
    contactFrequency: contactFrequencyScore(a.contactFrequency, b.contactFrequency),
    friendshipGoal: friendshipGoalScore(a.friendshipGoal, b.friendshipGoal),
    sharedTime: overlapScore(a.sharedTime, b.sharedTime),
    personality: personalityScore(a.personality, b.personality),
    planning: planningScore(a.planning, b.planning),
    age: ageScore(a.age, b.age),
    lifeSituation: lifeSituationScore(a, b),
  };

  const score = Object.entries(WEIGHTS).reduce((sum, [key, weight]) => sum + components[key] * weight, 0);
  return {
    hardFilterPassed: true,
    exclusionReasons: [],
    score: Math.round(score * 10) / 10,
    components,
  };
}

function groupPreferenceSatisfied(member, group) {
  const genders = new Set(group.map(x => x.gender).filter(Boolean));
  switch (member.groupPreference) {
    case 'Nur Männer': return group.every(x => x.gender === 'Männlich');
    case 'Nur Frauen': return group.every(x => x.gender === 'Weiblich');
    case 'Gemischte Gruppe': return genders.size >= 2;
    case 'Keine Präferenz': return true;
    default: return true;
  }
}

function evaluateGroup(group, pairResults) {
  if (!Array.isArray(group) || group.length !== 4) {
    return { accepted: false, reason: 'Eine LAVUQ-Gruppe muss aus genau 4 Personen bestehen.' };
  }
  if (!group.every(member => groupPreferenceSatisfied(member, group))) {
    return { accepted: false, reason: 'Mindestens ein Gruppenwunsch wird auf Gruppenebene nicht erfüllt.' };
  }
  if (!Array.isArray(pairResults) || pairResults.length !== 6 || pairResults.some(p => !p.hardFilterPassed || !Number.isFinite(p.score))) {
    return { accepted: false, reason: 'Es müssen 6 gültige Paarbewertungen vorliegen.' };
  }

  const scores = pairResults.map(p => p.score);
  const groupScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const weakestPairScore = Math.min(...scores);
  return {
    accepted: groupScore >= 70 && weakestPairScore >= 55,
    groupScore: Math.round(groupScore * 10) / 10,
    weakestPairScore: Math.round(weakestPairScore * 10) / 10,
    thresholds: { groupScoreMin: 70, weakestPairMin: 55 },
  };
}

const LAVUQ_MATCHING = Object.freeze({
  WEIGHTS,
  overlapScore,
  evaluatePair,
  evaluateGroup,
  hardFilter,
});

if (typeof module !== 'undefined' && module.exports) module.exports = LAVUQ_MATCHING;
if (typeof window !== 'undefined') window.LAVUQ_MATCHING = LAVUQ_MATCHING;
