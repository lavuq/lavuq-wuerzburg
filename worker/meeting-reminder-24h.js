// LAVUQ – sichere 24h-Erinnerung vor einem Gruppentreffen.
// Standard: Dry-Run. Controlled-One sendet genau eine Testmail ohne Statusaenderung.
// Controlled-All sendet idempotent an alle berechtigten Mitglieder und markiert den Termin danach als erledigt.
const BASE_ID="apphnIBhuAbmMTUtY";
const MEMBERS_TABLE="tbl4QX0NIB3tUKtF4";
const APPLICANTS_TABLE="tblzLtbR5Yh4nR5aQ";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";
const MEMBER_GROUP="fldMUYzXykTpV0j2x";
const MEMBER_APPLICANT="fldcV8kd6KF7zdScE";
const MEMBER_STATUS="fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS="fldUmjMa2j7MLG5RA";
const MEMBER_CONTACT_SHARED="fld3LCPTEbAl46bF1";
const APPLICANT_NAME="fldPPnyiAKpIXnawY";
const APPLICANT_EMAIL="flduioUSJQ7BlM85W";
const MEETING_DATE="fldGIDne7S1fY997i";
const MEETING_PLACE="fld7gEEQzLn3RMxoq";
const MEETING_STATUS="fldAZyz79cEpcGweE";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_REMINDER_24H="fldFeGgB1HmXRMzYk";
const MEETING_GROUP_LINK="fld0Zpt6q0OO9RmTt";
const MEETING_REMINDER_24H_LEDGER="fldQiaKrY9Dqats3l";
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
function formatBerlin(iso){return new Intl.DateTimeFormat("de-DE",{timeZone:"Europe/Berlin",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(iso));}
function parseLedger(raw){const map=new Map();for(const line of String(raw||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean)){const i=line.indexOf(":");if(i>0)map.set(line.slice(i+1),line.slice(0,i));}return map;}
function serializeLedger(map){return [...map.entries()].map(([id,state])=>`${state}:${id}`).join("\n");}
async function sendMail(env,to,name,dateTime,place){if(!env.BREVO_API_KEY)throw new Error("BREVO_API_KEY fehlt");const senderEmail=env.BREVO_SENDER_EMAIL||"kontakt@lavuq-wue.de";const senderName=env.BREVO_SENDER_NAME||"LAVUQ Würzburg";const html=`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b1f3a;max-width:620px;margin:0 auto"><h2>Hallo ${esc(name)},</h2><p>eine kurze Erinnerung: Euer LAVUQ-Treffen findet morgen statt.</p><p><strong>Termin:</strong> ${esc(formatBerlin(dateTime))} Uhr<br><strong>Treffpunkt:</strong> ${esc(place)}</p><p>Für das erste Treffen empfehlen wir weiterhin einen öffentlichen Ort. Du darfst zu jedem Treffen eine Begleitperson mitbringen.</p><p>Viele Grüße<br><strong>LAVUQ Würzburg</strong></p></div>`;const r=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"api-key":env.BREVO_API_KEY,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({sender:{email:senderEmail,name:senderName},to:[{email:to,name}],subject:"Erinnerung: Dein LAVUQ-Treffen ist morgen",htmlContent:html})});if(!r.ok)throw new Error(`Brevo HTTP ${r.status}`);}
export async function buildMeetingReminder24hDryRun(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const groupId=String(input.groupId||"").trim();
 if(!/^rec[A-Za-z0-9]{14}$/.test(groupId))return{ok:false,status:400,code:"INVALID_GROUP_ID"};
 const now=validDate(input.asOf||new Date().toISOString());if(!now)return{ok:false,status:400,code:"INVALID_AS_OF"};
 const meetings=await listTable(env,MEETINGS_TABLE);
 const candidates=meetings.filter(m=>linked(m?.fields?.[MEETING_GROUP_LINK],groupId)&&Number(m?.fields?.[MEETING_ATTEMPT]||0)===1&&text(m?.fields?.[MEETING_STATUS])==="Bestätigt");
 if(candidates.length!==1)return{ok:false,status:409,code:candidates.length===0?"NO_CONFIRMED_FIRST_MEETING":"MULTIPLE_CONFIRMED_FIRST_MEETINGS",meetingCount:candidates.length};
 const meeting=candidates[0];const when=validDate(meeting?.fields?.[MEETING_DATE]);if(!when)return{ok:false,status:422,code:"MEETING_DATETIME_INVALID"};
 const msUntil=when.getTime()-now.getTime();const hoursUntil=Math.round((msUntil/3600000)*100)/100;
 const reminderAlreadySent=meeting?.fields?.[MEETING_REMINDER_24H]===true;
 const due=msUntil>=23*3600000&&msUntil<=25*3600000;
 const members=await listTable(env,MEMBERS_TABLE);const recipients=members.filter(m=>linked(m?.fields?.[MEMBER_GROUP],groupId)&&acceptedActive(m)&&m?.fields?.[MEMBER_CONTACT_SHARED]===true);
 const exactlyFourEligibleRecipients=recipients.length===4;
 const ledger=parseLedger(meeting?.fields?.[MEETING_REMINDER_24H_LEDGER]);
 const ambiguous=[...ledger.entries()].filter(([,state])=>state==="sending").map(([id])=>id);
 const alreadySentIds=recipients.filter(r=>ledger.get(r.id)==="sent").map(r=>r.id);
 const pendingRecipients=recipients.filter(r=>ledger.get(r.id)!=="sent");
 const ready=due&&!reminderAlreadySent&&exactlyFourEligibleRecipients&&ambiguous.length===0;
 if(input.controlledOne===true){
   if(String(input.confirmation||"")!=="EINE_24H_ERINNERUNG_SENDEN")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED"};
   if(!due)return{ok:false,status:409,code:"OUTSIDE_24H_WINDOW",hoursUntilMeeting:hoursUntil};
   if(reminderAlreadySent)return{ok:false,status:409,code:"24H_REMINDER_ALREADY_COMPLETED"};
   if(!exactlyFourEligibleRecipients)return{ok:false,status:409,code:"NOT_EXACTLY_4_ELIGIBLE_RECIPIENTS",eligibleRecipientCount:recipients.length};
   const chosen=recipients[0];const applicantId=firstLink(chosen?.fields?.[MEMBER_APPLICANT]);if(!applicantId)return{ok:false,status:409,code:"APPLICANT_MISSING"};
   const a=await getApplicant(env,applicantId);const name=text(a?.fields?.[APPLICANT_NAME])||"LAVUQ Teilnehmer";const email=text(a?.fields?.[APPLICANT_EMAIL]);if(!email||!email.includes("@"))return{ok:false,status:409,code:"EMAIL_MISSING"};
   await sendMail(env,email,name,meeting?.fields?.[MEETING_DATE],text(meeting?.fields?.[MEETING_PLACE]));
   return{ok:true,status:200,state:"ONE_24H_TEST_REMINDER_SENT",dryRun:false,controlledOne:true,groupId,meetingRecordId:meeting.id,meetingAttempt:1,hoursUntilMeeting:hoursUntil,eligibleRecipientCount:4,emailsSent:1,otherEmailsSent:0,meetingReminderMarkedComplete:false,airtableChanged:false,piiExposedInResponse:false};
 }
 if(input.controlledAll===true){
   if(String(input.confirmation||"")!=="ALLE_24H_ERINNERUNGEN_SENDEN")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED"};
   if(!due)return{ok:false,status:409,code:"OUTSIDE_24H_WINDOW",hoursUntilMeeting:hoursUntil};
   if(reminderAlreadySent)return{ok:true,status:200,state:"24H_REMINDER_ALREADY_COMPLETED",dryRun:false,controlledAll:true,groupId,emailsSent:0,alreadySentCount:4,duplicateSendPrevented:true,airtableChanged:false,piiExposedInResponse:false};
   if(!exactlyFourEligibleRecipients)return{ok:false,status:409,code:"NOT_EXACTLY_4_ELIGIBLE_RECIPIENTS",eligibleRecipientCount:recipients.length};
   if(ambiguous.length)return{ok:false,status:409,code:"REMINDER_SEND_STATE_REQUIRES_REVIEW",ambiguousRecipientCount:ambiguous.length,emailsSent:0,duplicateSendPrevented:true,airtableChanged:false,piiExposedInResponse:false};
   const people=[];
   for(const m of recipients){const applicantId=firstLink(m?.fields?.[MEMBER_APPLICANT]);if(!applicantId)return{ok:false,status:409,code:"APPLICANT_MISSING"};const a=await getApplicant(env,applicantId);const name=text(a?.fields?.[APPLICANT_NAME])||"LAVUQ Teilnehmer";const email=text(a?.fields?.[APPLICANT_EMAIL]);if(!email||!email.includes("@"))return{ok:false,status:409,code:"EMAIL_MISSING"};people.push({memberId:m.id,name,email});}
   let sentNow=0;let changed=false;
   for(const p of people){if(ledger.get(p.memberId)==="sent")continue;ledger.set(p.memberId,"sending");await patchMeeting(env,meeting.id,{[MEETING_REMINDER_24H_LEDGER]:serializeLedger(ledger)});changed=true;try{await sendMail(env,p.email,p.name,meeting?.fields?.[MEETING_DATE],text(meeting?.fields?.[MEETING_PLACE]));}catch(e){return{ok:false,status:502,code:"REMINDER_SEND_FAILED_REQUIRES_REVIEW",emailsSentBeforeFailure:sentNow,ambiguousRecipientCount:1,duplicateSendPrevented:true,airtableChanged:true,piiExposedInResponse:false};}ledger.set(p.memberId,"sent");await patchMeeting(env,meeting.id,{[MEETING_REMINDER_24H_LEDGER]:serializeLedger(ledger)});sentNow++;}
   const sentTotal=people.filter(p=>ledger.get(p.memberId)==="sent").length;
   if(sentTotal!==4)return{ok:false,status:409,code:"REMINDER_NOT_COMPLETE",emailsSent:sentNow,sentTotal,airtableChanged:changed,piiExposedInResponse:false};
   await patchMeeting(env,meeting.id,{[MEETING_REMINDER_24H_LEDGER]:serializeLedger(ledger),[MEETING_REMINDER_24H]:true});
   return{ok:true,status:200,state:"24H_REMINDER_SENT_TO_ALL",dryRun:false,controlledAll:true,groupId,meetingRecordId:meeting.id,meetingAttempt:1,hoursUntilMeeting:hoursUntil,eligibleRecipientCount:4,emailsSent:sentNow,alreadySentCount:alreadySentIds.length,totalMarkedSent:4,meetingReminderMarkedComplete:true,duplicateSendPrevented:true,airtableChanged:true,piiExposedInResponse:false};
 }
 return{ok:true,status:200,state:ready?"READY_FOR_24H_REMINDER":"NOT_READY_FOR_24H_REMINDER",dryRun:true,readOnly:true,groupId,meetingRecordId:meeting.id,meetingAttempt:1,meetingConfirmed:true,hoursUntilMeeting:hoursUntil,reminderWindowMatched:due,reminderAlreadySent,eligibleRecipientCount:recipients.length,exactlyFourEligibleRecipients,alreadySentCount:alreadySentIds.length,pendingRecipientCount:pendingRecipients.length,ambiguousRecipientCount:ambiguous.length,wouldSendEmails:ready?pendingRecipients.length:0,wouldMarkReminderSent:false,airtableChanged:false,piiExposedInResponse:false};
}
