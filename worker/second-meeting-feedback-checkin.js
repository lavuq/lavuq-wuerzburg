// LAVUQ Treffen 2 – Check-in am Folgetag, ausschliesslich als sicherer Dry-Run.
const BASE_ID="apphnIBhuAbmMTUtY";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";
const MEMBERS_TABLE="tbl4QX0NIB3tUKtF4";
const FEEDBACK_TABLE="tblLyjFTdr1MziUgj";
const MEETING_GROUP_LINK="fld0Zpt6q0OO9RmTt";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_STATUS="fldAZyz79cEpcGweE";
const MEETING_DATE="fldGIDne7S1fY997i";
const MEETING_T2_RECIPIENT_IDS="fldJW0Oyip2OZjOlk";
const MEETING_REMINDER_24H="fldFeGgB1HmXRMzYk";
const MEETING_REMINDER_2H="fldY246Gg4hYuOIZO";
const MEMBER_GROUP="fldMUYzXykTpV0j2x";
const MEMBER_APPLICANT="fldcV8kd6KF7zdScE";
const MEMBER_STATUS="fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS="fldUmjMa2j7MLG5RA";
const FEEDBACK_MEETING="fldaykTvzKmCqn9MO";
const FEEDBACK_APPLICANT="fldkOnMXpqlnNjs1b";

function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function firstLink(v){if(!Array.isArray(v)||!v.length)return null;const x=v[0];return typeof x==="string"?x:x?.id||null;}
function linked(v,id){return Array.isArray(v)&&v.some(x=>(typeof x==="string"?x:x?.id)===id);}
function parseIds(v){return [...new Set(String(v||"").split(/\s+/).map(x=>x.trim()).filter(x=>/^rec[A-Za-z0-9]{14}$/.test(x)))];}
async function getRecord(env,table,id){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}/${id}?returnFieldsByFieldId=true`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);return r.json();}
async function listTable(env,table){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}?${p}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}

export async function handleSecondMeetingFeedbackCheckinDryRun(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const meetingRecordId=String(input.meetingRecordId||"").trim();
 const asOf=new Date(String(input.asOf||new Date().toISOString()));
 if(!/^rec[A-Za-z0-9]{14}$/.test(meetingRecordId))return{ok:false,status:400,code:"INVALID_MEETING_ID"};
 if(!Number.isFinite(asOf.getTime()))return{ok:false,status:400,code:"INVALID_AS_OF"};
 if(input.dryRun!==true)return{ok:false,status:409,code:"DRY_RUN_REQUIRED"};

 const meeting=await getRecord(env,MEETINGS_TABLE,meetingRecordId);
 const mf=meeting?.fields||{};
 const groupId=firstLink(mf[MEETING_GROUP_LINK]);
 const attempt=Number(mf[MEETING_ATTEMPT]||0);
 const statusName=text(mf[MEETING_STATUS]);
 const when=new Date(String(mf[MEETING_DATE]||""));
 const recipientIds=parseIds(mf[MEETING_T2_RECIPIENT_IDS]);
 if(attempt!==2)return{ok:false,status:409,code:"NOT_SECOND_MEETING"};
 if(statusName!=="Bestätigt")return{ok:false,status:409,code:"SECOND_MEETING_NOT_CONFIRMED"};
 if(!groupId)return{ok:false,status:409,code:"GROUP_LINK_MISSING"};
 if(!Number.isFinite(when.getTime()))return{ok:false,status:422,code:"MEETING_DATETIME_INVALID"};
 if(recipientIds.length!==3)return{ok:false,status:409,code:"EXPECTED_EXACTLY_3_SECOND_MEETING_RECIPIENTS",recipientFilterCount:recipientIds.length};

 const hoursSinceMeeting=Math.round(((asOf.getTime()-when.getTime())/3600000)*100)/100;
 const nextDayWindowMatched=hoursSinceMeeting>=20&&hoursSinceMeeting<=30;
 const reminder24hActuallyCompleted=mf[MEETING_REMINDER_24H]===true;
 const reminder2hActuallyCompleted=mf[MEETING_REMINDER_2H]===true;
 const remindersSimulated=input.simulateRemindersCompleted===true;
 const remindersEffectivelyCompleted=(reminder24hActuallyCompleted&&reminder2hActuallyCompleted)||remindersSimulated;

 const members=(await listTable(env,MEMBERS_TABLE)).filter(m=>linked(m?.fields?.[MEMBER_GROUP],groupId));
 const currentAccepted=members.filter(m=>text(m?.fields?.[MEMBER_STATUS])==="Aktiv"&&text(m?.fields?.[MEMBER_INVITE_STATUS])==="Angenommen");
 const byId=new Map(currentAccepted.map(m=>[m.id,m]));
 const validRecipientIds=recipientIds.filter(id=>byId.has(id));
 if(validRecipientIds.length!==3)return{ok:false,status:409,code:"SECOND_MEETING_RECIPIENT_FILTER_INVALID",validRecipientCount:validRecipientIds.length};
 const applicantIds=validRecipientIds.map(id=>firstLink(byId.get(id)?.fields?.[MEMBER_APPLICANT])).filter(Boolean);
 if(applicantIds.length!==3||new Set(applicantIds).size!==3)return{ok:false,status:409,code:"SECOND_MEETING_APPLICANT_LINKS_INVALID",validApplicantCount:new Set(applicantIds).size};

 const feedbackRows=(await listTable(env,FEEDBACK_TABLE)).filter(r=>linked(r?.fields?.[FEEDBACK_MEETING],meetingRecordId));
 const existingApplicantIds=new Set(feedbackRows.map(r=>firstLink(r?.fields?.[FEEDBACK_APPLICANT])).filter(Boolean));
 const existingForEligible=applicantIds.filter(id=>existingApplicantIds.has(id)).length;
 const missingFeedbackRequestCount=applicantIds.length-existingForEligible;
 const ready=nextDayWindowMatched&&remindersEffectivelyCompleted;
 return{
  ok:true,status:200,state:ready?"READY_FOR_SECOND_MEETING_FEEDBACK_CHECKIN":"NOT_READY_FOR_SECOND_MEETING_FEEDBACK_CHECKIN",
  dryRun:true,readOnly:true,meetingAttempt:2,hoursSinceMeeting,nextDayWindowMatched,
  reminder24hActuallyCompleted,reminder2hActuallyCompleted,remindersSimulated,remindersEffectivelyCompleted,
  recipientFilterCount:3,validRecipientCount:3,excludedCurrentAcceptedCount:Math.max(0,currentAccepted.length-3),
  existingFeedbackRequestCount:existingForEligible,missingFeedbackRequestCount:ready?missingFeedbackRequestCount:0,
  wouldCreateFeedbackRequests:ready?missingFeedbackRequestCount:0,wouldCreatePersonalFeedbackLinks:ready?missingFeedbackRequestCount:0,
  wouldSendFeedbackEmails:ready?missingFeedbackRequestCount:0,
  checkinQuestions:["Treffen stattgefunden","Wohlbefinden","Gruppe weiter kennenlernen","Sicherheitsmeldung"],
  safetyCaseWouldBeCreatedOnExplicitReport:true,excludedMembersWouldReceiveCheckin:false,
  emailsSent:0,airtableChanged:false,thirdMeetingPrepared:false,
  piiExposedInResponse:false,recipientIdsExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false
 };
}
