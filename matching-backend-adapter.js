// LAVUQ Matching Backend Adapter
// Vorbereitung für Cloudflare Worker / serverseitige Ausführung.
// Keine Secrets in dieser Datei hinterlegen.

const AIRTABLE = Object.freeze({
  baseId: 'apphnIBhuAbmMTUtY',
  applicantsTableId: 'tblzLtbR5Yh4nR5aQ',
  pairTableId: 'tblsGuVbUkbsLLAh2',
  groupsTableId: 'tblF8peAAJGjwfKab',
  applicantFields: {
    applicantId: 'fld5MVt7Qs57DZ0G3',
    age: 'fldEIDovX5FIgFdif',
    zip: 'fldPI0pg4zB5cDMDm',
    maxRadiusKm: 'fldqC5pTpkRJH5I7e',
    groupPreference: 'fld49bquWX3QtAGur',
    interests: 'fldbnsrvWQa1z3QGo',
    personality: 'fld78D6tSGN6F62Ec',
    planning: 'fldWJh9cPUnMX9F58',
    contactFrequency: 'fldLwqv2A45o92Elb',
    friendshipValues: 'fldhPsY2Zvnneh9Js',
    sharedTime: 'fldEygPXWXs6gmVdy',
    lifeSituationImportance: 'fldgVR6zKSMcmzxuK',
    friendshipGoal: 'fldZHIMXs41fjGQev',
    activeProfile: 'fld3AfxsslBlRpG4B',
    matchingReady: 'fld3fw7Siu6ePkbjN',
    gender: 'fldQ7YMAFTABnbrLo',
    currentLifeSituation: 'fldFD6TqjrhGH2fip',
  },
  pairFields: {
    pairId: 'fldE2zDV70DKsNpP8',
    applicantA: 'fldsgi4kvs4IWFUgl',
    applicantB: 'fldxO1264TrJcQd0P',
    hardFilterPassed: 'fldxqsVj7wCVztoEx',
    exclusionReason: 'fldyjfoWWhdBr2sFY',
    distanceKm: 'fld6M4jJIbKChdD90',
    matchScore: 'fldELYL3jFpafXcFk',
    interests: 'fldy3p52hr7CiOCzS',
    friendshipValues: 'fldZXLKtbdmVQsTji',
    contactFrequency: 'fldqnKrWNbpYiwGVq',
    friendshipGoal: 'fldik22A4v7Yw2WLK',
    sharedTime: 'fld2bwCDbDrDWdBrC',
    personality: 'fldKprZJsh6ChuSTt',
    planning: 'fldVdK0BRcONVuMPr',
    age: 'fldhPaWKRx19HAHDS',
    lifeSituation: 'fldt32Ub9TIRimpSW',
    calculatedAt: 'fldpOANi6mL7h9Rde',
  },
});

function applicantFromAirtable(record) {
  const f = record.fields || {};
  const id = AIRTABLE.applicantFields;
  return {
    recordId: record.id,
    applicantId: f[id.applicantId],
    age: f[id.age],
    zip: f[id.zip],
    maxRadiusKm: f[id.maxRadiusKm],
    groupPreference: f[id.groupPreference],
    interests: f[id.interests],
    personality: f[id.personality],
    planning: f[id.planning],
    contactFrequency: f[id.contactFrequency],
    friendshipValues: f[id.friendshipValues],
    sharedTime: f[id.sharedTime],
    lifeSituationImportance: f[id.lifeSituationImportance],
    friendshipGoal: f[id.friendshipGoal],
    activeProfile: Boolean(f[id.activeProfile]),
    matchingReady: Boolean(f[id.matchingReady]),
    gender: f[id.gender],
    currentLifeSituation: f[id.currentLifeSituation],
  };
}

function pairRecordFields(a, b, distanceKm, evaluation) {
  const p = AIRTABLE.pairFields;
  const c = evaluation.components || {};
  return {
    [p.pairId]: [a.applicantId, b.applicantId].sort().join('__'),
    [p.applicantA]: [a.recordId],
    [p.applicantB]: [b.recordId],
    [p.hardFilterPassed]: Boolean(evaluation.hardFilterPassed),
    [p.exclusionReason]: (evaluation.exclusionReasons || []).join('; '),
    [p.distanceKm]: Number.isFinite(Number(distanceKm)) ? Number(distanceKm) : null,
    [p.matchScore]: Number.isFinite(evaluation.score) ? evaluation.score : null,
    [p.interests]: c.interests ?? null,
    [p.friendshipValues]: c.friendshipValues ?? null,
    [p.contactFrequency]: c.contactFrequency ?? null,
    [p.friendshipGoal]: c.friendshipGoal ?? null,
    [p.sharedTime]: c.sharedTime ?? null,
    [p.personality]: c.personality ?? null,
    [p.planning]: c.planning ?? null,
    [p.age]: c.age ?? null,
    [p.lifeSituation]: c.lifeSituation ?? null,
    [p.calculatedAt]: new Date().toISOString(),
  };
}

// Offene Pflicht-Zuweisungen im bestehenden Bewerbungs-Worker:
// formData.get('Geschlecht') -> AIRTABLE.applicantFields.gender
// formData.get('Aktuelle_Lebenssituation') -> AIRTABLE.applicantFields.currentLifeSituation

const LAVUQ_MATCHING_BACKEND = Object.freeze({
  AIRTABLE,
  applicantFromAirtable,
  pairRecordFields,
});

if (typeof module !== 'undefined' && module.exports) module.exports = LAVUQ_MATCHING_BACKEND;
if (typeof window !== 'undefined') window.LAVUQ_MATCHING_BACKEND = LAVUQ_MATCHING_BACKEND;
