// LAVUQ Treffen 2 – kontrollierte Terminankuendigung.
// Standard ist Vorschau. Echter Versand nur mit expliziter Bestaetigung.
// Ein Ledger mit sending/sent verhindert Doppelversand nach Abbruechen.
const BASE_ID="apphnIBhuAbmMTUtY";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";
const MEMBERS_TABLE="tbl4QX0NIB3tUKtF4";
const APPLICANTS_TABLE="tblzLtbR5Yh4nR5aQ";
const MEETING_GROUP_LINK="fld0Zpt6q0OO9RmTt";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_STATUS="fldAZyz79cEpcGweE";
const MEETING_DATE="fldGIDne7S1fY997i";
const MEETING_PLACE="fld7gEEQzLn3RMxoq";
const MEETING_T2_RECIPIENT_IDS="fldJW0Oyip2OZjOlk";
const MEETING_T2_ANNOUNCEMENT_LEDGER="fldG18BVLfZEE0fBw";
const MEMBER_GROUP="fldMUYzXykTpV0j2x";
const MEMBER_APPLICANT="fldcV8kd6KF7zdScE";
const MEMBER_STATUS="fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS="fldUmjMa2j7MLG5RA";
const APPLICANT_NAME="fldPPnyiAKpIXnawY";
const APPLICANT_EMAIL="flduioUSJQ7BlM85W";

function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function firstLink(v){if(!Array.isArray(v)||!v.length)return null;const x=v[0];return typeof x==="string"?x:x?.id||null;}
function linked(v,id){return Array.isArray(v)&&v.some(x=>(typeof x==="string"?x:x?.id)===id);}
function parseIds(v){return [...new Set(String(v||"").split(/\s+/).map(x=>x.trim()).filter(x=>/^rec[A-Za-z0-9]{14}$/.test(x)))];}
function parseLedger(raw){const map=new Map();for(const line of String(raw||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean)){const i=line.indexOf(":");if(i>0)map.set(line.slice(i+1),line.slice(0,i));}return map;}
function serializeLedger(map){return [...map.entries()].map(([id,state])=>`${state}:${id}`).join("\n");}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
function formatBerlin(iso){return new Intl.DateTimeFormat("de-DE",{timeZone:"Europe/Berlin",weekday:"long",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(iso));}
async function getRecord(env,table,id){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}/${id}?returnFieldsByFieldId=true`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);return r.json();}
async function listTable(env,table){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}?${p}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}
async function patchMeeting(env,id,fields){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${MEETINGS_TABLE}/${id}`,{method:"PATCH",headers:headers(env),body:JSON.stringify({fields})});if(!r.ok)throw new Error(`Airtable Termin PATCH HTTP ${r.status}`);return r.json();}
async function sendMail(env,to,name,dateTime,place){
 if(!env.BREVO_API_KEY)throw new Error("BREVO_API_KEY_MISSING");
 const senderEmail=env.BREVO_SENDER_EMAIL||"kontakt@lavuq-wue.de";
 const senderName=env.BREVO_SENDER_NAME||"LAVUQ Würzburg";
 const html=`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b1f3a;max-width:620px;margin:0 auto"><h2>Hallo ${esc(name)},</h2><p>euer zweites LAVUQ-Treffen steht fest.</p><p><strong>Termin:</strong> ${esc(formatBerlin(dateTime))} Uhr<br><strong>Treffpunkt:</strong> ${esc(place)}</p><p>Bitte stimmt euch weiterhin direkt in eurer Gruppe ab. Du darfst auch zu diesem Treffen eine Begleitperson mitbringen. Ein öffentlicher Treffpunkt bleibt unsere Empfehlung.</p><p>Wir erinnern dich zusätzlich 24 Stunden und ungefähr 2 Stunden vor dem Treffen.</p><p>Viele Grüße<br><strong>LAVUQ Würzburg</strong></p><p style="font-size:12px;color:#667085;margin-top:28px">LAVUQ ist kein Dating-Angebot. Im Mittelpunkt stehen Freundschaft, Austausch und gemeinsame Unternehmungen.</p></div>`;
 const r=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"api-key":env.BREVO_API_KEY,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({sender:{email:senderEmail,name:senderName},to:[{email:to,name}],subject:"Euer zweites LAVUQ-Treffen steht fest",htmlContent:html})});
 if(!r.ok)throw new Error(`BREVO_HTTP_${r.status}`);
}
export async function handleSecondMeetingAnnouncement(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const meetingRecordId=String(input.meetingRecordId||"").trim();
 const mode=String(input.mode||"preview");
 if(!/^rec[A-Za-z0-9]{14}$/.test(meetingRecordId))return{ok:false,status:400,code:"INVALID_MEETING_ID"};
 if(!["preview","controlledOne","controlledAll"].includes(mode))return{ok:false,status:400,code:"INVALID_MODE"};
 const meeting=await getRecord(env,MEETINGS_TABLE,meetingRecordId);const mf=meeting?.fields||{};
 const groupId=firstLink(mf[MEETING_GROUP_LINK]);const attempt=Number(mf[MEETING_ATTEMPT]||0);const statusName=text(mf[MEETING_STATUS]);
 const dateTime=String(mf[MEETING_DATE]||"");const place=text(mf[MEETING_PLACE]);const recipientIds=parseIds(mf[MEETING_T2_RECIPIENT_IDS]);
 if(attempt!==2)return{ok:false,status:409,code:"NOT_SECOND_MEETING"};
 if(statusName!=="Bestätigt")return{ok:false,status:409,code:"SECOND_MEETING_NOT_CONFIRMED"};
 if(!groupId)return{ok:false,status:409,code:"GROUP_LINK_MISSING"};
 if(!dateTime||!Number.isFinite(new Date(dateTime).getTime())||new Date(dateTime).getTime()<=Date.now())return{ok:false,status:409,code:"SECOND_MEETING_DATE_INVALID_OR_PAST"};
 if(place.length<4)return{ok:false,status:409,code:"SECOND_MEETING_PLACE_MISSING"};
 if(recipientIds.length!==3)return{ok:false,status:409,code:"EXPECTED_EXACTLY_3_SECOND_MEETING_RECIPIENTS",recipientFilterCount:recipientIds.length};
 const members=(await listTable(env,MEMBERS_TABLE)).filter(m=>linked(m?.fields?.[MEMBER_GROUP],groupId));
 const currentAccepted=members.filter(m=>text(m?.fields?.[MEMBER_STATUS])==="Aktiv"&&text(m?.fields?.[MEMBER_INVITE_STATUS])==="Angenommen");
 const byId=new Map(currentAccepted.map(m=>[m.id,m]));const valid=recipientIds.filter(id=>byId.has(id));
 if(valid.length!==3)return{ok:false,status:409,code:"SECOND_MEETING_RECIPIENT_FILTER_INVALID",validRecipientCount:valid.length};
 const people=[];
 for(const id of valid){const applicantId=firstLink(byId.get(id)?.fields?.[MEMBER_APPLICANT]);if(!applicantId)return{ok:false,status:409,code:"APPLICANT_LINK_MISSING"};const a=await getRecord(env,APPLICANTS_TABLE,applicantId);const name=text(a?.fields?.[APPLICANT_NAME])||"LAVUQ Teilnehmer";const email=text(a?.fields?.[APPLICANT_EMAIL]);if(!email||!email.includes("@"))return{ok:false,status:409,code:"RECIPIENT_EMAIL_MISSING"};people.push({memberId:id,name,email});}
 const ledger=parseLedger(mf[MEETING_T2_ANNOUNCEMENT_LEDGER]);const ambiguous=people.filter(p=>ledger.get(p.memberId)==="sending");const sent=people.filter(p=>ledger.get(p.memberId)==="sent");const pending=people.filter(p=>ledger.get(p.memberId)!=="sent");
 if(ambiguous.length)return{ok:false,status:409,code:"ANNOUNCEMENT_SEND_STATE_REQUIRES_REVIEW",ambiguousRecipientCount:ambiguous.length,emailsSent:0,duplicateSendPrevented:true,piiExposedInResponse:false};
 if(mode==="preview")return{ok:true,status:200,state:pending.length?"SECOND_MEETING_ANNOUNCEMENT_READY":"SECOND_MEETING_ANNOUNCEMENT_ALREADY_COMPLETED",dryRun:true,readOnly:true,meetingAttempt:2,validRecipientCount:3,alreadySentCount:sent.length,pendingRecipientCount:pending.length,wouldSendEmails:pending.length,excludedCurrentAcceptedCount:Math.max(0,currentAccepted.length-3),excludedMembersWouldReceiveEmail:false,emailsSent:0,airtableChanged:false,duplicateSendPrevented:true,piiExposedInResponse:false};
 if(mode==="controlledOne"&&sent.length>0)return{ok:true,status:200,state:"ONE_CONTROLLED_TEST_ALREADY_COMPLETED",dryRun:false,controlledOne:true,emailsSent:0,totalMarkedSent:sent.length,pendingRecipientCount:pending.length,duplicateSendPrevented:true,airtableChanged:false,piiExposedInResponse:false};
 if(mode==="controlledOne"&&String(input.confirmation||"")!=="EINE_TREFFEN_2_TERMINMAIL_SENDEN")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED"};
 if(mode==="controlledAll"&&String(input.confirmation||"")!=="ALLE_TREFFEN_2_TERMINMAILS_SENDEN")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED"};
 const targets=mode==="controlledOne"?pending.slice(0,1):pending;let sentNow=0;
 for(const p of targets){ledger.set(p.memberId,"sending");await patchMeeting(env,meetingRecordId,{[MEETING_T2_ANNOUNCEMENT_LEDGER]:serializeLedger(ledger)});try{await sendMail(env,p.email,p.name,dateTime,place);}catch(e){return{ok:false,status:502,code:"ANNOUNCEMENT_SEND_FAILED_REQUIRES_REVIEW",emailsSentBeforeFailure:sentNow,ambiguousRecipientCount:1,airtableChanged:true,duplicateSendPrevented:true,piiExposedInResponse:false};}ledger.set(p.memberId,"sent");await patchMeeting(env,meetingRecordId,{[MEETING_T2_ANNOUNCEMENT_LEDGER]:serializeLedger(ledger)});sentNow++;}
 const totalSent=people.filter(p=>ledger.get(p.memberId)==="sent").length;
 return{ok:true,status:200,state:totalSent===3?"SECOND_MEETING_ANNOUNCEMENT_SENT_TO_ALL":"ONE_SECOND_MEETING_ANNOUNCEMENT_SENT",dryRun:false,controlledOne:mode==="controlledOne",controlledAll:mode==="controlledAll",meetingAttempt:2,eligibleRecipientCount:3,emailsSent:sentNow,totalMarkedSent:totalSent,pendingRecipientCount:3-totalSent,excludedMembersReceivedEmail:false,airtableChanged:sentNow>0,duplicateSendPrevented:true,piiExposedInResponse:false};
}
