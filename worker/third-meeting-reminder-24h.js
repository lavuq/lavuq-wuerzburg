// LAVUQ Treffen 3 – 24h-Erinnerung mit Dry-Run und geschuetztem Automatikversand.
const BASE_ID="apphnIBhuAbmMTUtY";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";
const MEMBERS_TABLE="tbl4QX0NIB3tUKtF4";
const APPLICANTS_TABLE="tblzLtbR5Yh4nR5aQ";
const MEETING_GROUP_LINK="fld0Zpt6q0OO9RmTt";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_STATUS="fldAZyz79cEpcGweE";
const MEETING_DATE="fldGIDne7S1fY997i";
const MEETING_PLACE="fld7gEEQzLn3RMxoq";
const MEETING_T3_RECIPIENT_IDS="fld9NnPRq52Wg0bMb";
const MEETING_REMINDER_24H="fldFeGgB1HmXRMzYk";
const MEETING_REMINDER_24H_LEDGER="fldQiaKrY9Dqats3l";
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
 const senderEmail=env.BREVO_SENDER_EMAIL||"kontakt@lavuq-wue.de";const senderName=env.BREVO_SENDER_NAME||"LAVUQ Würzburg";
 const html=`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b1f3a;max-width:620px;margin:0 auto"><h2>Hallo ${esc(name)},</h2><p>eine kurze Erinnerung: Euer drittes LAVUQ-Treffen findet morgen statt.</p><p><strong>Termin:</strong> ${esc(formatBerlin(dateTime))} Uhr<br><strong>Treffpunkt:</strong> ${esc(place)}</p><p>Du darfst auch zu diesem Treffen eine Begleitperson mitbringen. Ein öffentlicher Treffpunkt bleibt unsere Empfehlung.</p><p>Viele Grüße<br><strong>LAVUQ Würzburg</strong></p></div>`;
 const r=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"api-key":env.BREVO_API_KEY,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({sender:{email:senderEmail,name:senderName},to:[{email:to,name}],subject:"Erinnerung: Euer drittes LAVUQ-Treffen ist morgen",htmlContent:html})});
 if(!r.ok)throw new Error(`BREVO_HTTP_${r.status}`);
}
export async function handleThirdMeetingReminder24h(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const meetingRecordId=String(input.meetingRecordId||"").trim();const mode=String(input.mode||"dryRun");const asOf=new Date(String(input.asOf||new Date().toISOString()));
 if(!/^rec[A-Za-z0-9]{14}$/.test(meetingRecordId))return{ok:false,status:400,code:"INVALID_MEETING_ID"};
 if(!["dryRun","automatic"].includes(mode))return{ok:false,status:400,code:"INVALID_MODE"};
 if(!Number.isFinite(asOf.getTime()))return{ok:false,status:400,code:"INVALID_AS_OF"};
 const meeting=await getRecord(env,MEETINGS_TABLE,meetingRecordId);const mf=meeting?.fields||{};const groupId=firstLink(mf[MEETING_GROUP_LINK]);const attempt=Number(mf[MEETING_ATTEMPT]||0);const statusName=text(mf[MEETING_STATUS]);
 const when=new Date(String(mf[MEETING_DATE]||""));const place=text(mf[MEETING_PLACE]);const recipientIds=parseIds(mf[MEETING_T3_RECIPIENT_IDS]);
 if(attempt!==3)return{ok:false,status:409,code:"NOT_THIRD_MEETING"};if(statusName!=="Bestätigt")return{ok:false,status:409,code:"THIRD_MEETING_NOT_CONFIRMED"};if(!groupId)return{ok:false,status:409,code:"GROUP_LINK_MISSING"};if(!Number.isFinite(when.getTime()))return{ok:false,status:422,code:"MEETING_DATETIME_INVALID"};if(place.length<4)return{ok:false,status:409,code:"MEETING_PLACE_MISSING"};if(recipientIds.length!==3)return{ok:false,status:409,code:"EXPECTED_EXACTLY_3_THIRD_MEETING_RECIPIENTS",recipientFilterCount:recipientIds.length};
 const msUntil=when.getTime()-asOf.getTime();const hoursUntil=Math.round((msUntil/3600000)*100)/100;const due=msUntil>=23*3600000&&msUntil<=25*3600000;const reminderAlreadyCompleted=mf[MEETING_REMINDER_24H]===true;
 const members=(await listTable(env,MEMBERS_TABLE)).filter(m=>linked(m?.fields?.[MEMBER_GROUP],groupId));const currentAccepted=members.filter(m=>text(m?.fields?.[MEMBER_STATUS])==="Aktiv"&&text(m?.fields?.[MEMBER_INVITE_STATUS])==="Angenommen");const currentIds=new Set(currentAccepted.map(m=>m.id));const validRecipientIds=recipientIds.filter(id=>currentIds.has(id));
 if(validRecipientIds.length!==3)return{ok:false,status:409,code:"THIRD_MEETING_RECIPIENT_FILTER_INVALID",validRecipientCount:validRecipientIds.length};
 const ledger=parseLedger(mf[MEETING_REMINDER_24H_LEDGER]);const ambiguous=validRecipientIds.filter(id=>ledger.get(id)==="sending");const alreadySent=validRecipientIds.filter(id=>ledger.get(id)==="sent");const pending=validRecipientIds.filter(id=>ledger.get(id)!=="sent");const ready=due&&!reminderAlreadyCompleted&&ambiguous.length===0&&pending.length>0;
 const base={meetingAttempt:3,hoursUntilMeeting:hoursUntil,reminderWindowMatched:due,reminderAlreadyCompleted,recipientFilterCount:3,validRecipientCount:3,alreadySentCount:alreadySent.length,pendingRecipientCount:pending.length,ambiguousRecipientCount:ambiguous.length,excludedCurrentAcceptedCount:Math.max(0,currentAccepted.length-3),excludedMembersWouldReceiveReminder:false,duplicateSendPrevented:true,piiExposedInResponse:false,recipientIdsExposedInResponse:false};
 if(mode==="dryRun")return{ok:true,status:200,state:ready?"READY_FOR_THIRD_MEETING_24H_REMINDER":"NOT_READY_FOR_THIRD_MEETING_24H_REMINDER",dryRun:true,readOnly:true,...base,wouldSendEmails:ready?pending.length:0,emailsSent:0,airtableChanged:false};
 if(String(input.confirmation||"")!=="AUTOMATIC_THIRD_MEETING_24H")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED"};
 if(!due)return{ok:true,status:200,state:"THIRD_MEETING_24H_NOT_DUE",dryRun:false,automatic:true,...base,emailsSent:0,airtableChanged:false};
 if(reminderAlreadyCompleted)return{ok:true,status:200,state:"THIRD_MEETING_24H_ALREADY_COMPLETED",dryRun:false,automatic:true,...base,emailsSent:0,airtableChanged:false};
 if(ambiguous.length)return{ok:false,status:409,code:"REMINDER_SEND_STATE_REQUIRES_REVIEW",...base,emailsSent:0,airtableChanged:false};
 const byId=new Map(currentAccepted.map(m=>[m.id,m]));const people=[];
 for(const id of validRecipientIds){const applicantId=firstLink(byId.get(id)?.fields?.[MEMBER_APPLICANT]);if(!applicantId)return{ok:false,status:409,code:"APPLICANT_LINK_MISSING"};const a=await getRecord(env,APPLICANTS_TABLE,applicantId);const name=text(a?.fields?.[APPLICANT_NAME])||"LAVUQ Teilnehmer";const email=text(a?.fields?.[APPLICANT_EMAIL]);if(!email||!email.includes("@"))return{ok:false,status:409,code:"RECIPIENT_EMAIL_MISSING"};people.push({memberId:id,name,email});}
 let sentNow=0;
 for(const p of people){if(ledger.get(p.memberId)==="sent")continue;ledger.set(p.memberId,"sending");await patchMeeting(env,meetingRecordId,{[MEETING_REMINDER_24H_LEDGER]:serializeLedger(ledger)});try{await sendMail(env,p.email,p.name,mf[MEETING_DATE],place);}catch(e){return{ok:false,status:502,code:"REMINDER_SEND_FAILED_REQUIRES_REVIEW",emailsSentBeforeFailure:sentNow,ambiguousRecipientCount:1,airtableChanged:true,duplicateSendPrevented:true,piiExposedInResponse:false};}ledger.set(p.memberId,"sent");await patchMeeting(env,meetingRecordId,{[MEETING_REMINDER_24H_LEDGER]:serializeLedger(ledger)});sentNow++;}
 const totalSent=people.filter(p=>ledger.get(p.memberId)==="sent").length;if(totalSent!==3)return{ok:false,status:409,code:"REMINDER_NOT_COMPLETE",emailsSent:sentNow,totalMarkedSent:totalSent,airtableChanged:true,piiExposedInResponse:false};
 await patchMeeting(env,meetingRecordId,{[MEETING_REMINDER_24H_LEDGER]:serializeLedger(ledger),[MEETING_REMINDER_24H]:true});
 return{ok:true,status:200,state:"THIRD_MEETING_24H_SENT_TO_ALL",dryRun:false,automatic:true,meetingAttempt:3,eligibleRecipientCount:3,emailsSent:sentNow,totalMarkedSent:3,pendingRecipientCount:0,excludedMembersReceivedEmail:false,reminderMarkedComplete:true,airtableChanged:true,duplicateSendPrevented:true,piiExposedInResponse:false};
}
