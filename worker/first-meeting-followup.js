// LAVUQ – sichere Nachbereitung von Treffen 1.
// Standard: Dry-Run. Controlled-One sendet eine Testmail ohne Airtable-Aenderung.
// Controlled-All sendet idempotent an alle 4 und markiert den Nachtreffen-Check abgeschlossen.
const BASE_ID="apphnIBhuAbmMTUtY";
const MEMBERS_TABLE="tbl4QX0NIB3tUKtF4";
const APPLICANTS_TABLE="tblzLtbR5Yh4nR5aQ";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";
const FEEDBACK_TABLE="tblLyjFTdr1MziUgj";
const MEMBER_GROUP="fldMUYzXykTpV0j2x";
const MEMBER_APPLICANT="fldcV8kd6KF7zdScE";
const MEMBER_STATUS="fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS="fldUmjMa2j7MLG5RA";
const MEMBER_CONTACT_SHARED="fld3LCPTEbAl46bF1";
const APPLICANT_NAME="fldPPnyiAKpIXnawY";
const APPLICANT_EMAIL="flduioUSJQ7BlM85W";
const MEETING_DATE="fldGIDne7S1fY997i";
const MEETING_STATUS="fldAZyz79cEpcGweE";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_REMINDER_24H="fldFeGgB1HmXRMzYk";
const MEETING_REMINDER_2H="fldY246Gg4hYuOIZO";
const MEETING_FOLLOWUP_DONE="fld1iy06nx9r3nJmx";
const MEETING_FOLLOWUP_RECIPIENT_IDS="fld8kfMdVMJLdjRSI";
const MEETING_GROUP_LINK="fld0Zpt6q0OO9RmTt";
const FEEDBACK_MEETING="fldaykTvzKmCqn9MO";
const FEEDBACK_APPLICANT="fldkOnMXpqlnNjs1b";
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function firstLink(v){if(!Array.isArray(v)||!v.length)return null;const x=v[0];return typeof x==="string"?x:x?.id||null;}
function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
async function listTable(env,table){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}?${p}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}
async function getApplicant(env,id){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${APPLICANTS_TABLE}/${id}?returnFieldsByFieldId=true`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable Bewerber HTTP ${r.status}`);return r.json();}
async function patchMeeting(env,id,fields){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${MEETINGS_TABLE}/${id}`,{method:"PATCH",headers:headers(env),body:JSON.stringify({fields})});if(!r.ok)throw new Error(`Airtable Termin PATCH HTTP ${r.status}`);return r.json();}
function linked(v,recordId){return Array.isArray(v)&&v.some(x=>(typeof x==="string"?x:x?.id)===recordId);}
function acceptedActive(m){return text(m?.fields?.[MEMBER_STATUS])==="Aktiv"&&text(m?.fields?.[MEMBER_INVITE_STATUS])==="Angenommen";}
function validDate(v){const d=new Date(v);return Number.isFinite(d.getTime())?d:null;}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
function parseRecipientIds(v){return new Set(String(v||"").split(/[\s,;]+/).map(x=>x.trim()).filter(x=>/^rec[A-Za-z0-9]{14}$/.test(x)));}
function serializeRecipientIds(set){return [...set].sort().join("\n");}
async function sendFollowupMail(env,to,name){
 if(!env.BREVO_API_KEY)throw new Error("BREVO_API_KEY fehlt");
 const senderEmail=env.BREVO_SENDER_EMAIL||"kontakt@lavuq-wue.de";
 const senderName=env.BREVO_SENDER_NAME||"LAVUQ Würzburg";
 const subject="TEST Nachbereitung: Wie war euer erstes LAVUQ-Treffen?";
 const html=`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b1f3a;max-width:620px;margin:0 auto"><h2>Hallo ${esc(name)},</h2><p>wir hoffen, dass euer erstes LAVUQ-Treffen gut verlaufen ist.</p><p>Als nächsten Schritt möchten wir kurz erfahren, wie du das Treffen erlebt hast. Diese Testnachricht prüft den sicheren Versand der Nachbereitung; Feedbackdaten werden dadurch noch nicht gespeichert und Treffen 2 wird noch nicht vorbereitet.</p><p><strong>TESTHINWEIS:</strong> Dies ist eine kontrollierte Nachbereitungs-Testmail.</p><p>Viele Grüße<br><strong>LAVUQ Würzburg</strong></p></div>`;
 const r=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"api-key":env.BREVO_API_KEY,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({sender:{email:senderEmail,name:senderName},to:[{email:to,name}],subject,htmlContent:html})});
 const raw=await r.text();let data={};try{data=raw?JSON.parse(raw):{};}catch{}
 if(!r.ok)throw new Error(`Brevo HTTP ${r.status}`);
 return{providerAccepted:true,providerStatus:r.status,providerMessageIdPresent:Boolean(data?.messageId),providerMessageId:String(data?.messageId||"")};
}
async function diagnoseBrevoDelivery(env,messageId){
 if(!env.BREVO_API_KEY)return{ok:false,status:500,code:"BREVO_API_KEY_MISSING"};
 const id=String(messageId||"").trim();if(!id)return{ok:false,status:400,code:"MESSAGE_ID_REQUIRED"};
 const params=new URLSearchParams({messageId:id,limit:"50",sort:"desc"});
 const r=await fetch(`https://api.brevo.com/v3/smtp/statistics/events?${params}`,{headers:{"api-key":env.BREVO_API_KEY,Accept:"application/json"}});
 const raw=await r.text();let data={};try{data=raw?JSON.parse(raw):{};}catch{}
 if(!r.ok)return{ok:false,status:r.status,code:"BREVO_EVENTS_LOOKUP_FAILED",providerStatus:r.status};
 const events=Array.isArray(data?.events)?data.events:[];
 const eventTypes=[...new Set(events.map(e=>String(e?.event||"").trim()).filter(Boolean))];
 const terminalDelivered=eventTypes.includes("delivered");
 const blocked=eventTypes.some(e=>["blocked","hardBounces","hard_bounce","softBounces","soft_bounce","deferred","invalid"].includes(e));
 return{ok:true,status:200,state:terminalDelivered?"BREVO_DELIVERED":blocked?"BREVO_DELIVERY_PROBLEM":"BREVO_STATUS_PENDING_OR_UNKNOWN",diagnosisOnly:true,messageIdMatched:events.length>0,eventCount:events.length,eventTypes,delivered:terminalDelivered,deliveryProblem:blocked,emailsSent:0,airtableChanged:false,piiExposedInResponse:false};
}
async function applicantForMember(env,member){
 const applicantId=firstLink(member?.fields?.[MEMBER_APPLICANT]);
 if(!applicantId)throw new Error("APPLICANT_MISSING");
 const a=await getApplicant(env,applicantId);
 const name=text(a?.fields?.[APPLICANT_NAME])||"LAVUQ Teilnehmer";
 const email=text(a?.fields?.[APPLICANT_EMAIL]);
 if(!email||!email.includes("@"))throw new Error("EMAIL_MISSING");
 return{name,email,applicantId};
}
export async function buildFirstMeetingFollowupDryRun(env,input={}){
 if(input.deliveryDiagnosis===true)return diagnoseBrevoDelivery(env,input.messageId);
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const groupId=String(input.groupId||"").trim();if(!/^rec[A-Za-z0-9]{14}$/.test(groupId))return{ok:false,status:400,code:"INVALID_GROUP_ID"};
 const now=validDate(input.asOf||new Date().toISOString());if(!now)return{ok:false,status:400,code:"INVALID_AS_OF"};
 const meetings=await listTable(env,MEETINGS_TABLE);
 const candidates=meetings.filter(m=>linked(m?.fields?.[MEETING_GROUP_LINK],groupId)&&Number(m?.fields?.[MEETING_ATTEMPT]||0)===1&&text(m?.fields?.[MEETING_STATUS])==="Bestätigt");
 if(candidates.length!==1)return{ok:false,status:409,code:candidates.length===0?"NO_CONFIRMED_FIRST_MEETING":"MULTIPLE_CONFIRMED_FIRST_MEETINGS",meetingCount:candidates.length};
 const meeting=candidates[0];const when=validDate(meeting?.fields?.[MEETING_DATE]);if(!when)return{ok:false,status:422,code:"MEETING_DATETIME_INVALID"};
 const msSince=now.getTime()-when.getTime();const hoursSinceMeeting=Math.round((msSince/3600000)*100)/100;
 const meetingPassed=msSince>0;
 const reminder24hCompleted=meeting?.fields?.[MEETING_REMINDER_24H]===true;
 const reminder2hCompleted=meeting?.fields?.[MEETING_REMINDER_2H]===true;
 const followupCompleted=meeting?.fields?.[MEETING_FOLLOWUP_DONE]===true;
 const members=await listTable(env,MEMBERS_TABLE);
 const recipients=members.filter(m=>linked(m?.fields?.[MEMBER_GROUP],groupId)&&acceptedActive(m)&&m?.fields?.[MEMBER_CONTACT_SHARED]===true);
 const exactlyFourEligibleRecipients=recipients.length===4;
 const ready=meetingPassed&&reminder24hCompleted&&reminder2hCompleted&&exactlyFourEligibleRecipients;
 if(input.feedbackPreparationDryRun===true){
   const applicantIds=recipients.map(m=>firstLink(m?.fields?.[MEMBER_APPLICANT])).filter(Boolean);
   const feedbackRows=await listTable(env,FEEDBACK_TABLE);
   const existingForMeeting=feedbackRows.filter(f=>linked(f?.fields?.[FEEDBACK_MEETING],meeting.id));
   const existingApplicantIds=new Set(existingForMeeting.map(f=>firstLink(f?.fields?.[FEEDBACK_APPLICANT])).filter(Boolean));
   const existingForEligible=applicantIds.filter(id=>existingApplicantIds.has(id)).length;
   const missingFeedbackRequests=Math.max(0,applicantIds.length-existingForEligible);
   const feedbackReady=meetingPassed&&followupCompleted&&exactlyFourEligibleRecipients;
   return{ok:true,status:200,state:feedbackReady?"READY_TO_PREPARE_FIRST_MEETING_FEEDBACK":"NOT_READY_TO_PREPARE_FIRST_MEETING_FEEDBACK",dryRun:true,readOnly:true,feedbackPreparationDryRun:true,groupId,meetingRecordId:meeting.id,meetingAttempt:1,meetingPassed,followupCompleted,eligibleRecipientCount:recipients.length,exactlyFourEligibleRecipients,existingFeedbackRequestCount:existingForEligible,missingFeedbackRequestCount:feedbackReady?missingFeedbackRequests:0,wouldCreateFeedbackRequests:feedbackReady?missingFeedbackRequests:0,wouldCreatePersonalFeedbackLinks:feedbackReady?missingFeedbackRequests:0,wouldSendEmails:0,wouldPrepareSecondMeeting:false,airtableChanged:false,piiExposedInResponse:false};
 }
 if(input.controlledAll===true){
   if(String(input.confirmation||"")!=="VIER_NACHBEREITUNGEN_SENDEN")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED"};
   if(!meetingPassed)return{ok:false,status:409,code:"MEETING_NOT_PASSED"};
   if(!reminder24hCompleted||!reminder2hCompleted)return{ok:false,status:409,code:"REMINDERS_NOT_COMPLETED"};
   if(!exactlyFourEligibleRecipients)return{ok:false,status:409,code:"NOT_EXACTLY_4_ELIGIBLE_RECIPIENTS",eligibleRecipientCount:recipients.length};
   const sentIds=parseRecipientIds(meeting?.fields?.[MEETING_FOLLOWUP_RECIPIENT_IDS]);
   const eligibleIds=new Set(recipients.map(m=>m.id));
   const alreadySentCount=[...eligibleIds].filter(id=>sentIds.has(id)).length;
   if(followupCompleted&&alreadySentCount===4)return{ok:true,status:200,state:"FIRST_MEETING_FOLLOWUP_ALREADY_COMPLETED",dryRun:false,controlledAll:true,groupId,meetingRecordId:meeting.id,meetingAttempt:1,eligibleRecipientCount:4,emailsSent:0,alreadySentCount:4,totalMarkedSent:4,duplicateSendPrevented:true,feedbackRequestsCreated:0,secondMeetingPrepared:false,followupMarkedComplete:true,airtableChanged:false,piiExposedInResponse:false};
   let emailsSent=0,providerAcceptedCount=0,providerMessageIdCount=0,airtableChanged=false;
   for(const member of recipients){
     if(sentIds.has(member.id))continue;
     const a=await applicantForMember(env,member);
     const delivery=await sendFollowupMail(env,a.email,a.name);
     emailsSent++;
     if(delivery.providerAccepted)providerAcceptedCount++;
     if(delivery.providerMessageIdPresent)providerMessageIdCount++;
     sentIds.add(member.id);
     await patchMeeting(env,meeting.id,{[MEETING_FOLLOWUP_RECIPIENT_IDS]:serializeRecipientIds(sentIds)});
     airtableChanged=true;
   }
   const totalMarkedSent=[...eligibleIds].filter(id=>sentIds.has(id)).length;
   if(totalMarkedSent===4&&!followupCompleted){await patchMeeting(env,meeting.id,{[MEETING_FOLLOWUP_DONE]:true});airtableChanged=true;}
   return{ok:true,status:200,state:totalMarkedSent===4?"FIRST_MEETING_FOLLOWUP_SENT_TO_ALL":"FIRST_MEETING_FOLLOWUP_PARTIAL",dryRun:false,controlledAll:true,groupId,meetingRecordId:meeting.id,meetingAttempt:1,hoursSinceMeeting,eligibleRecipientCount:4,emailsSent,alreadySentCount,totalMarkedSent,providerAcceptedCount,providerMessageIdCount,duplicateSendPrevented:true,feedbackRequestsCreated:0,secondMeetingPrepared:false,followupMarkedComplete:totalMarkedSent===4,airtableChanged,piiExposedInResponse:false};
 }
 if(input.controlledOne===true){
   if(String(input.confirmation||"")!=="EINE_NACHBEREITUNG_SENDEN")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED"};
   if(!meetingPassed)return{ok:false,status:409,code:"MEETING_NOT_PASSED"};
   if(!reminder24hCompleted||!reminder2hCompleted)return{ok:false,status:409,code:"REMINDERS_NOT_COMPLETED"};
   if(!exactlyFourEligibleRecipients)return{ok:false,status:409,code:"NOT_EXACTLY_4_ELIGIBLE_RECIPIENTS",eligibleRecipientCount:recipients.length};
   const a=await applicantForMember(env,recipients[0]);
   const delivery=await sendFollowupMail(env,a.email,a.name);
   return{ok:true,status:200,state:"ONE_FIRST_MEETING_FOLLOWUP_TEST_SENT",dryRun:false,controlledOne:true,groupId,meetingRecordId:meeting.id,meetingAttempt:1,hoursSinceMeeting,eligibleRecipientCount:4,emailsSent:1,otherEmailsSent:0,feedbackRequestsCreated:0,secondMeetingPrepared:false,followupMarkedComplete:false,airtableChanged:false,providerAccepted:delivery.providerAccepted,providerStatus:delivery.providerStatus,providerMessageIdPresent:delivery.providerMessageIdPresent,providerMessageId:delivery.providerMessageId,piiExposedInResponse:false};
 }
 return{ok:true,status:200,state:ready?"READY_FOR_FIRST_MEETING_FOLLOWUP":"NOT_READY_FOR_FIRST_MEETING_FOLLOWUP",dryRun:true,readOnly:true,groupId,meetingRecordId:meeting.id,meetingAttempt:1,meetingConfirmed:true,meetingPassed,hoursSinceMeeting,reminder24hCompleted,reminder2hCompleted,followupCompleted,eligibleRecipientCount:recipients.length,exactlyFourEligibleRecipients,wouldSendFollowupEmails:ready&&!followupCompleted?4:0,wouldCreateFeedbackRequests:ready?4:0,wouldPrepareSecondMeeting:false,emailsSent:0,airtableChanged:false,piiExposedInResponse:false};
}
