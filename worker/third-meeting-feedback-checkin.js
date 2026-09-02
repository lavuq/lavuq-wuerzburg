// LAVUQ Treffen 3 – Check-in am Folgetag: Dry-Run und kontrollierte Vorbereitung ohne Mailversand.
const BASE_ID="apphnIBhuAbmMTUtY";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";
const MEMBERS_TABLE="tbl4QX0NIB3tUKtF4";
const FEEDBACK_TABLE="tblLyjFTdr1MziUgj";
const MEETING_GROUP_LINK="fld0Zpt6q0OO9RmTt";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_STATUS="fldAZyz79cEpcGweE";
const MEETING_DATE="fldGIDne7S1fY997i";
const MEETING_T3_RECIPIENT_IDS="fld9NnPRq52Wg0bMb";
const MEETING_REMINDER_24H="fldFeGgB1HmXRMzYk";
const MEETING_REMINDER_2H="fldY246Gg4hYuOIZO";
const MEMBER_GROUP="fldMUYzXykTpV0j2x";
const MEMBER_APPLICANT="fldcV8kd6KF7zdScE";
const MEMBER_STATUS="fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS="fldUmjMa2j7MLG5RA";
const FEEDBACK_MEETING="fldaykTvzKmCqn9MO";
const FEEDBACK_APPLICANT="fldkOnMXpqlnNjs1b";
const FEEDBACK_ID="fldL4khxQkwJBvWS2";
const FEEDBACK_TOKEN="fldvZizwPZiCE7co3";
const FEEDBACK_LINK="fldwHXctCJcj9eHYE";
const FEEDBACK_VALID_UNTIL="fldszL9Bjcsk5UDFD";

function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function firstLink(v){if(!Array.isArray(v)||!v.length)return null;const x=v[0];return typeof x==="string"?x:x?.id||null;}
function linked(v,id){return Array.isArray(v)&&v.some(x=>(typeof x==="string"?x:x?.id)===id);}
function parseIds(v){return [...new Set(String(v||"").split(/\s+/).map(x=>x.trim()).filter(x=>/^rec[A-Za-z0-9]{14}$/.test(x)))];}
async function getRecord(env,table,id){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}/${id}?returnFieldsByFieldId=true`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);return r.json();}
async function listTable(env,table){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}?${p}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}
async function createFeedback(env,fields){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${FEEDBACK_TABLE}`,{method:"POST",headers:headers(env),body:JSON.stringify({fields})});if(!r.ok)throw new Error(`Airtable Feedback POST HTTP ${r.status}`);return r.json();}
function randomToken(){const b=new Uint8Array(24);crypto.getRandomValues(b);return [...b].map(x=>x.toString(16).padStart(2,"0")).join("");}
function feedbackId(){const b=new Uint8Array(6);crypto.getRandomValues(b);return `FB3-${Date.now().toString(36)}-${[...b].map(x=>x.toString(16).padStart(2,"0")).join("")}`;}

export async function handleThirdMeetingFeedbackCheckin(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const meetingRecordId=String(input.meetingRecordId||"").trim();
 const asOf=new Date(String(input.asOf||new Date().toISOString()));
 if(!/^rec[A-Za-z0-9]{14}$/.test(meetingRecordId))return{ok:false,status:400,code:"INVALID_MEETING_ID"};
 if(!Number.isFinite(asOf.getTime()))return{ok:false,status:400,code:"INVALID_AS_OF"};
 const controlledCreateAll=input.controlledCreateAll===true;
 if(input.dryRun!==true&&!controlledCreateAll)return{ok:false,status:409,code:"DRY_RUN_OR_CONTROLLED_CREATE_REQUIRED"};
 if(controlledCreateAll&&String(input.confirmation||"")!=="DREI_TREFFEN_3_FEEDBACK_ANFRAGEN_ANLEGEN")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED"};

 const meeting=await getRecord(env,MEETINGS_TABLE,meetingRecordId);const mf=meeting?.fields||{};
 const groupId=firstLink(mf[MEETING_GROUP_LINK]);const attempt=Number(mf[MEETING_ATTEMPT]||0);const statusName=text(mf[MEETING_STATUS]);const when=new Date(String(mf[MEETING_DATE]||""));const recipientIds=parseIds(mf[MEETING_T3_RECIPIENT_IDS]);
 if(attempt!==3)return{ok:false,status:409,code:"NOT_THIRD_MEETING"};
 if(statusName!=="Bestätigt")return{ok:false,status:409,code:"THIRD_MEETING_NOT_CONFIRMED"};
 if(!groupId)return{ok:false,status:409,code:"GROUP_LINK_MISSING"};
 if(!Number.isFinite(when.getTime()))return{ok:false,status:422,code:"MEETING_DATETIME_INVALID"};
 if(recipientIds.length!==3)return{ok:false,status:409,code:"EXPECTED_EXACTLY_3_THIRD_MEETING_RECIPIENTS",recipientFilterCount:recipientIds.length};

 const hoursSinceMeeting=Math.round(((asOf.getTime()-when.getTime())/3600000)*100)/100;const nextDayWindowMatched=hoursSinceMeeting>=20&&hoursSinceMeeting<=30;
 const reminder24hActuallyCompleted=mf[MEETING_REMINDER_24H]===true;const reminder2hActuallyCompleted=mf[MEETING_REMINDER_2H]===true;const remindersSimulated=input.simulateRemindersCompleted===true;const remindersEffectivelyCompleted=(reminder24hActuallyCompleted&&reminder2hActuallyCompleted)||remindersSimulated;
 const members=(await listTable(env,MEMBERS_TABLE)).filter(m=>linked(m?.fields?.[MEMBER_GROUP],groupId));const currentAccepted=members.filter(m=>text(m?.fields?.[MEMBER_STATUS])==="Aktiv"&&text(m?.fields?.[MEMBER_INVITE_STATUS])==="Angenommen");const byId=new Map(currentAccepted.map(m=>[m.id,m]));const validRecipientIds=recipientIds.filter(id=>byId.has(id));
 if(validRecipientIds.length!==3)return{ok:false,status:409,code:"THIRD_MEETING_RECIPIENT_FILTER_INVALID",validRecipientCount:validRecipientIds.length};
 const applicantIds=validRecipientIds.map(id=>firstLink(byId.get(id)?.fields?.[MEMBER_APPLICANT])).filter(Boolean);if(applicantIds.length!==3||new Set(applicantIds).size!==3)return{ok:false,status:409,code:"THIRD_MEETING_APPLICANT_LINKS_INVALID",validApplicantCount:new Set(applicantIds).size};
 const feedbackRows=(await listTable(env,FEEDBACK_TABLE)).filter(r=>linked(r?.fields?.[FEEDBACK_MEETING],meetingRecordId));const existingApplicantIds=new Set(feedbackRows.map(r=>firstLink(r?.fields?.[FEEDBACK_APPLICANT])).filter(Boolean));const existingForEligible=applicantIds.filter(id=>existingApplicantIds.has(id)).length;const missingFeedbackRequestCount=applicantIds.length-existingForEligible;const ready=nextDayWindowMatched&&remindersEffectivelyCompleted;

 if(controlledCreateAll){
  if(input.prepareAheadForScheduledMeeting!==true)return{ok:false,status:409,code:"PREPARE_AHEAD_CONFIRMATION_REQUIRED"};
  if(!ready)return{ok:false,status:409,code:"THIRD_MEETING_FEEDBACK_NOT_READY",nextDayWindowMatched,remindersEffectivelyCompleted};
  const missingApplicantIds=applicantIds.filter(id=>!existingApplicantIds.has(id));
  if(missingApplicantIds.length===0)return{ok:true,status:200,state:"THIRD_MEETING_FEEDBACK_ALREADY_PREPARED",dryRun:false,controlledCreateAll:true,meetingAttempt:3,eligibleRecipientCount:3,existingFeedbackRequestCount:3,feedbackRequestsCreated:0,personalFeedbackLinksCreated:0,totalPreparedCount:3,emailsSent:0,airtableChanged:false,duplicateCreationPrevented:true,excludedMembersReceivedFeedbackRequest:false,piiExposedInResponse:false,recipientIdsExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false};
  const validUntil=new Date(when.getTime()+8*24*3600000).toISOString();let created=0;
  for(const applicantId of missingApplicantIds){const token=randomToken();const link=`https://lavuq-wue.de/feedback?token=${encodeURIComponent(token)}`;await createFeedback(env,{[FEEDBACK_ID]:feedbackId(),[FEEDBACK_MEETING]:[meetingRecordId],[FEEDBACK_APPLICANT]:[applicantId],[FEEDBACK_TOKEN]:token,[FEEDBACK_LINK]:link,[FEEDBACK_VALID_UNTIL]:validUntil});created++;}
  return{ok:true,status:200,state:"THIRD_MEETING_FEEDBACK_PREPARED_FOR_ALL",dryRun:false,controlledCreateAll:true,meetingAttempt:3,eligibleRecipientCount:3,existingFeedbackRequestCount:existingForEligible,feedbackRequestsCreated:created,personalFeedbackLinksCreated:created,totalPreparedCount:existingForEligible+created,emailsSent:0,airtableChanged:created>0,duplicateCreationPrevented:true,excludedMembersReceivedFeedbackRequest:false,feedbackValidUntilStored:true,piiExposedInResponse:false,recipientIdsExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false};
 }
 return{ok:true,status:200,state:ready?"READY_FOR_THIRD_MEETING_FEEDBACK_CHECKIN":"NOT_READY_FOR_THIRD_MEETING_FEEDBACK_CHECKIN",dryRun:true,readOnly:true,meetingAttempt:3,hoursSinceMeeting,nextDayWindowMatched,reminder24hActuallyCompleted,reminder2hActuallyCompleted,remindersSimulated,remindersEffectivelyCompleted,recipientFilterCount:3,validRecipientCount:3,excludedCurrentAcceptedCount:Math.max(0,currentAccepted.length-3),existingFeedbackRequestCount:existingForEligible,missingFeedbackRequestCount:ready?missingFeedbackRequestCount:0,wouldCreateFeedbackRequests:ready?missingFeedbackRequestCount:0,wouldCreatePersonalFeedbackLinks:ready?missingFeedbackRequestCount:0,wouldSendFeedbackEmails:ready?missingFeedbackRequestCount:0,checkinQuestions:["Treffen stattgefunden","Wohlbefinden","Gruppe weiter kennenlernen","Sicherheitsmeldung"],safetyCaseWouldBeCreatedOnExplicitReport:true,excludedMembersWouldReceiveCheckin:false,emailsSent:0,airtableChanged:false,piiExposedInResponse:false,recipientIdsExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false};
}
