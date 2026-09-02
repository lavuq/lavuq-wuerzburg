// LAVUQ – Treffen 3: sichere Vorbereitung nach dem Feedback zu Treffen 2.
// Regel fuer diesen Prozessschritt: Treffen 3 wird nur vorbereitet, wenn exakt die
// drei fuer Treffen 2 vorgesehenen Teilnehmer ihr Feedback abgegeben und jeweils
// ausdruecklich "Ja" zu einem weiteren Treffen gewaehlt haben.
const BASE_ID="apphnIBhuAbmMTUtY";
const GROUPS_TABLE="tblF8peAAJGjwfKab";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";
const FEEDBACK_TABLE="tblLyjFTdr1MziUgj";
const MEMBERS_TABLE="tbl4QX0NIB3tUKtF4";

const GROUP_PRIMARY="fldCb3rBz4kTWzQLx";
const MEETING_ID="fldvZ9GprKKdePE3p";
const MEETING_GROUP_TEXT="fldqZmig5i2kihEgg";
const MEETING_DATE="fldGIDne7S1fY997i";
const MEETING_PLACE="fld7gEEQzLn3RMxoq";
const MEETING_AGREED="flddvVn0fyhznL454";
const MEETING_STATUS="fldAZyz79cEpcGweE";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_GROUP_LINK="fld0Zpt6q0OO9RmTt";
const MEETING_SECOND_PARTICIPANT_IDS="fldJW0Oyip2OZjOlk";
const MEETING_THIRD_PARTICIPANT_IDS="fld9NnPRq52Wg0bMb";

const FEEDBACK_MEETING="fldaykTvzKmCqn9MO";
const FEEDBACK_APPLICANT="fldkOnMXpqlnNjs1b";
const FEEDBACK_SUBMITTED_AT="fld5uezt0LJJdtd29";
const FEEDBACK_CONTINUE="fldudL6OgGjs2mkMm";
const FEEDBACK_SAFETY_REVIEW="fldB3Dxaijejmjb0h";

const MEMBER_GROUP="fldMUYzXykTpV0j2x";
const MEMBER_APPLICANT="fldcV8kd6KF7zdScE";
const MEMBER_STATUS="fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS="fldUmjMa2j7MLG5RA";

function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function firstLink(v){if(!Array.isArray(v)||!v.length)return null;const x=v[0];return typeof x==="string"?x:x?.id||null;}
function linked(v,recordId){return Array.isArray(v)&&v.some(x=>(typeof x==="string"?x:x?.id)===recordId);}
function future(v){const d=new Date(v);return Number.isFinite(d.getTime())&&d.getTime()>Date.now();}
function parseIds(v){return [...new Set(String(v||"").split(/\s+/).map(x=>x.trim()).filter(x=>/^rec[A-Za-z0-9]{14}$/.test(x)))];}
function serializeIds(ids){return [...new Set(ids)].sort().join("\n");}
function acceptedActive(m){return text(m?.fields?.[MEMBER_STATUS])==="Aktiv"&&text(m?.fields?.[MEMBER_INVITE_STATUS])==="Angenommen";}

async function listTable(env,table){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}?${p}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}
async function getRecord(env,table,id){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}/${id}?returnFieldsByFieldId=true`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);return r.json();}
async function createMeeting(env,fields){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${MEETINGS_TABLE}`,{method:"POST",headers:headers(env),body:JSON.stringify({fields})});const raw=await r.text();let data={};try{data=raw?JSON.parse(raw):{};}catch{}if(!r.ok)throw new Error(`Airtable Treffen 3 POST HTTP ${r.status}`);return data;}
function meetingCode(){const d=new Date();const p=n=>String(n).padStart(2,"0");return `LAVUQ-T3-${d.getUTCFullYear()}${p(d.getUTCMonth()+1)}${p(d.getUTCDate())}-${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;}

export async function handleThirdMeetingPrepare(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const groupId=String(input.groupId||"").trim();
 const secondMeetingRecordId=String(input.secondMeetingRecordId||"").trim();
 const dryRun=input.dryRun!==false;
 if(!/^rec[A-Za-z0-9]{14}$/.test(groupId))return{ok:false,status:400,code:"INVALID_GROUP_ID"};
 if(!/^rec[A-Za-z0-9]{14}$/.test(secondMeetingRecordId))return{ok:false,status:400,code:"INVALID_SECOND_MEETING_ID"};

 const secondMeeting=await getRecord(env,MEETINGS_TABLE,secondMeetingRecordId);
 const sf=secondMeeting?.fields||{};
 if(Number(sf[MEETING_ATTEMPT]||0)!==2)return{ok:false,status:409,code:"NOT_SECOND_MEETING"};
 if(!linked(sf[MEETING_GROUP_LINK],groupId))return{ok:false,status:409,code:"SECOND_MEETING_GROUP_MISMATCH"};
 if(text(sf[MEETING_STATUS])!=="Bestätigt")return{ok:false,status:409,code:"SECOND_MEETING_NOT_CONFIRMED"};

 const secondParticipantIds=parseIds(sf[MEETING_SECOND_PARTICIPANT_IDS]);
 if(secondParticipantIds.length!==3)return{ok:false,status:409,code:"EXPECTED_EXACTLY_3_SECOND_MEETING_PARTICIPANTS",participantFilterCount:secondParticipantIds.length};

 const feedback=await listTable(env,FEEDBACK_TABLE);
 const rows=feedback.filter(r=>linked(r?.fields?.[FEEDBACK_MEETING],secondMeetingRecordId));
 const submitted=rows.filter(r=>Boolean(r?.fields?.[FEEDBACK_SUBMITTED_AT]));
 const feedbackRequestCount=rows.length;
 const submittedCount=submitted.length;
 if(feedbackRequestCount!==3||submittedCount!==3)return{ok:true,status:200,state:"WAIT_FOR_ALL_SECOND_MEETING_FEEDBACKS",dryRun:true,readOnly:true,feedbackRequestCount,submittedCount,wouldPrepareThirdMeeting:false,wouldCreateThirdMeeting:false,airtableChanged:false,emailsSent:0,piiExposedInResponse:false};

 const safetyReviewCount=submitted.filter(r=>r?.fields?.[FEEDBACK_SAFETY_REVIEW]===true).length;
 if(safetyReviewCount>0)return{ok:true,status:200,state:"THIRD_MEETING_BLOCKED_BY_SAFETY_REVIEW",dryRun:true,readOnly:true,feedbackRequestCount:3,submittedCount:3,safetyReviewCount,wouldPrepareThirdMeeting:false,wouldCreateThirdMeeting:false,airtableChanged:false,emailsSent:0,piiExposedInResponse:false};

 const yesRows=submitted.filter(r=>text(r?.fields?.[FEEDBACK_CONTINUE])==="Ja");
 const unsureCount=submitted.filter(r=>text(r?.fields?.[FEEDBACK_CONTINUE])==="Unsicher").length;
 const noCount=submitted.filter(r=>text(r?.fields?.[FEEDBACK_CONTINUE])==="Nein").length;
 const yesCount=yesRows.length;
 if(yesCount!==3)return{ok:true,status:200,state:"THIRD_MEETING_NOT_UNANIMOUSLY_APPROVED",dryRun:true,readOnly:true,feedbackRequestCount:3,submittedCount:3,yesCount,unsureCount,noCount,wouldPrepareThirdMeeting:false,wouldCreateThirdMeeting:false,airtableChanged:false,emailsSent:0,piiExposedInResponse:false};

 const applicantIds=yesRows.map(r=>firstLink(r?.fields?.[FEEDBACK_APPLICANT])).filter(Boolean);
 if(applicantIds.length!==3||new Set(applicantIds).size!==3)return{ok:false,status:409,code:"SECOND_MEETING_FEEDBACK_APPLICANTS_INVALID",applicantCount:new Set(applicantIds).size,piiExposedInResponse:false};

 const members=await listTable(env,MEMBERS_TABLE);
 const participantIdSet=new Set(secondParticipantIds);
 const eligibleMembers=members.filter(m=>participantIdSet.has(m.id)&&linked(m?.fields?.[MEMBER_GROUP],groupId)&&acceptedActive(m));
 if(eligibleMembers.length!==3)return{ok:false,status:409,code:"SECOND_MEETING_PARTICIPANT_MAPPING_INVALID",eligibleMemberCount:eligibleMembers.length,piiExposedInResponse:false};
 const applicantIdSet=new Set(applicantIds);
 const continuingMemberIds=eligibleMembers.filter(m=>applicantIdSet.has(firstLink(m?.fields?.[MEMBER_APPLICANT]))).map(m=>m.id);
 if(continuingMemberIds.length!==3)return{ok:false,status:409,code:"CONTINUING_MEMBER_MAPPING_INCOMPLETE",continuingMemberCount:continuingMemberIds.length,piiExposedInResponse:false};

 const meetings=await listTable(env,MEETINGS_TABLE);
 const thirdMeetings=meetings.filter(m=>linked(m?.fields?.[MEETING_GROUP_LINK],groupId)&&Number(m?.fields?.[MEETING_ATTEMPT]||0)===3&&!["Abgesagt","Nicht stattgefunden"].includes(text(m?.fields?.[MEETING_STATUS])));
 if(thirdMeetings.length>0)return{ok:true,status:200,state:"THIRD_MEETING_ALREADY_EXISTS",dryRun,feedbackRequestCount:3,submittedCount:3,yesCount:3,continuingParticipantCount:3,existingThirdMeetingCount:thirdMeetings.length,wouldPrepareThirdMeeting:false,wouldCreateThirdMeeting:false,duplicateCreationPrevented:true,airtableChanged:false,emailsSent:0,piiExposedInResponse:false};

 if(dryRun)return{ok:true,status:200,state:"READY_TO_PREPARE_THIRD_MEETING",dryRun:true,readOnly:true,feedbackRequestCount:3,submittedCount:3,yesCount:3,unsureCount:0,noCount:0,safetyReviewCount:0,continuingParticipantCount:3,wouldPrepareThirdMeeting:true,wouldCreateThirdMeeting:false,requiresDatePlaceAndGroupAgreement:true,duplicateCreationPrevented:true,airtableChanged:false,emailsSent:0,piiExposedInResponse:false};

 const dateTime=String(input.dateTime||"").trim();
 const place=String(input.place||"").trim();
 if(String(input.confirmation||"")!=="DRITTES_TREFFEN_ANLEGEN")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED"};
 if(!future(dateTime))return{ok:false,status:400,code:"INVALID_OR_PAST_DATETIME"};
 if(place.length<4)return{ok:false,status:400,code:"MEETING_PLACE_REQUIRED"};
 if(input.publicPlaceConfirmed!==true)return{ok:false,status:409,code:"PUBLIC_PLACE_CONFIRMATION_REQUIRED"};
 if(input.groupAgreed!==true)return{ok:false,status:409,code:"GROUP_AGREEMENT_REQUIRED"};

 const g=await getRecord(env,GROUPS_TABLE,groupId);
 const groupCode=text(g?.fields?.[GROUP_PRIMARY])||groupId;
 const created=await createMeeting(env,{[MEETING_ID]:meetingCode(),[MEETING_GROUP_TEXT]:groupCode,[MEETING_DATE]:dateTime,[MEETING_PLACE]:place,[MEETING_AGREED]:true,[MEETING_STATUS]:"Bestätigt",[MEETING_ATTEMPT]:3,[MEETING_GROUP_LINK]:[groupId],[MEETING_THIRD_PARTICIPANT_IDS]:serializeIds(continuingMemberIds)});
 return{ok:true,status:200,state:"THIRD_MEETING_CREATED",dryRun:false,yesCount:3,continuingParticipantCount:3,participantFilterStored:true,meetingRecordId:String(created?.id||""),meetingAttempt:3,statusName:"Bestätigt",duplicateCreationPrevented:true,emailsSent:0,airtableChanged:true,piiExposedInResponse:false};
}
