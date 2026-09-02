// LAVUQ Treffen 2 – kontrollierter Versand genau einer persoenlichen Feedback-Testmail.
const BASE_ID="apphnIBhuAbmMTUtY";
const FEEDBACK_TABLE="tblLyjFTdr1MziUgj";
const APPLICANTS_TABLE="tblzLtbR5Yh4nR5aQ";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";
const FEEDBACK_MEETING="fldaykTvzKmCqn9MO";
const FEEDBACK_APPLICANT="fldkOnMXpqlnNjs1b";
const FEEDBACK_TOKEN="fldvZizwPZiCE7co3";
const FEEDBACK_LINK="fldwHXctCJcj9eHYE";
const FEEDBACK_VALID_UNTIL="fldszL9Bjcsk5UDFD";
const FEEDBACK_MAIL_SENT="fldLGoT1elNEZKGUa";
const FEEDBACK_MAIL_MESSAGE_ID="fldPjLbgH0zCeyXnq";
const FEEDBACK_SUBMITTED_AT="fld5uezt0LJJdtd29";
const APPLICANT_NAME="fldPPnyiAKpIXnawY";
const APPLICANT_EMAIL="flduioUSJQ7BlM85W";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_STATUS="fldAZyz79cEpcGweE";

function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function firstLink(v){if(!Array.isArray(v)||!v.length)return null;const x=v[0];return typeof x==="string"?x:x?.id||null;}
function linked(v,id){return Array.isArray(v)&&v.some(x=>(typeof x==="string"?x:x?.id)===id);}
function validRecordId(v){return /^rec[A-Za-z0-9]{14}$/.test(String(v||""));}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
async function getRecord(env,table,id){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}/${id}?returnFieldsByFieldId=true`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);return r.json();}
async function listTable(env,table){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}?${p}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}
async function patchFeedback(env,id,fields){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${FEEDBACK_TABLE}/${id}`,{method:"PATCH",headers:headers(env),body:JSON.stringify({fields})});if(!r.ok)throw new Error(`Airtable Feedback PATCH HTTP ${r.status}`);return r.json();}
async function sendMail(env,to,name,feedbackLink){
 if(!env.BREVO_API_KEY)throw new Error("BREVO_API_KEY_MISSING");
 const senderEmail=env.BREVO_SENDER_EMAIL||"kontakt@lavuq-wue.de";
 const senderName=env.BREVO_SENDER_NAME||"LAVUQ Würzburg";
 const html=`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b1f3a;max-width:620px;margin:0 auto">
  <h2>Hallo ${esc(name)},</h2>
  <p>wir möchten gern kurz wissen, wie du euer zweites LAVUQ-Treffen erlebt hast.</p>
  <p>Über deinen persönlichen Link kannst du anschließend angeben, ob das Treffen stattgefunden hat, wie du dich gefühlt hast und ob du die Gruppe weiter kennenlernen möchtest.</p>
  <p style="margin:28px 0"><a href="${esc(feedbackLink)}" style="background:#0b1f3a;color:#fff;text-decoration:none;padding:13px 20px;border-radius:8px;display:inline-block">Feedback geben</a></p>
  <p>Der Link ist persönlich und zeitlich begrenzt. Bitte leite ihn nicht weiter.</p>
  <p><strong>TESTHINWEIS:</strong> Dies ist eine kontrollierte Testmail. Bitte das Feedbackformular noch nicht verbindlich absenden.</p>
  <p>Falls es eine unangenehme oder grenzüberschreitende Situation gab, kannst du LAVUQ darüber im Feedback informieren. Bei akuter Gefahr wende dich bitte direkt an 110 oder 112.</p>
  <p>Viele Grüße<br><strong>LAVUQ Würzburg</strong></p>
 </div>`;
 const r=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"api-key":env.BREVO_API_KEY,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({sender:{email:senderEmail,name:senderName},to:[{email:to,name}],subject:"TEST Feedback: Wie war euer zweites LAVUQ-Treffen?",htmlContent:html})});
 const raw=await r.text();let data={};try{data=raw?JSON.parse(raw):{};}catch{}
 if(!r.ok)throw new Error(`BREVO_HTTP_${r.status}`);
 const messageId=String(data?.messageId||"").trim();if(!messageId)throw new Error("BREVO_MESSAGE_ID_MISSING");
 return{providerStatus:r.status,messageId};
}

export async function handleSecondMeetingFeedbackMailControlledOne(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const meetingRecordId=String(input.meetingRecordId||"").trim();
 const targetApplicantId=String(input.targetApplicantId||"").trim();
 if(!validRecordId(meetingRecordId)||!validRecordId(targetApplicantId))return{ok:false,status:400,code:"INVALID_RECORD_ID"};
 if(input.controlledOne!==true||String(input.confirmation||"")!=="EINE_TREFFEN_2_FEEDBACK_MAIL_SENDEN")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED"};
 const meeting=await getRecord(env,MEETINGS_TABLE,meetingRecordId);
 if(Number(meeting?.fields?.[MEETING_ATTEMPT]||0)!==2||text(meeting?.fields?.[MEETING_STATUS])!=="Bestätigt")return{ok:false,status:409,code:"SECOND_MEETING_NOT_CONFIRMED"};
 const rows=(await listTable(env,FEEDBACK_TABLE)).filter(r=>linked(r?.fields?.[FEEDBACK_MEETING],meetingRecordId));
 if(rows.length!==3)return{ok:false,status:409,code:"NOT_EXACTLY_3_SECOND_MEETING_FEEDBACK_REQUESTS",feedbackRequestCount:rows.length};
 const targetRows=rows.filter(r=>firstLink(r?.fields?.[FEEDBACK_APPLICANT])===targetApplicantId);
 if(targetRows.length!==1)return{ok:false,status:409,code:"TARGET_FEEDBACK_REQUEST_NOT_UNIQUE",targetMatchCount:targetRows.length};
 const row=targetRows[0];
 const alreadySent=rows.filter(r=>r?.fields?.[FEEDBACK_MAIL_SENT]===true).length;
 if(row?.fields?.[FEEDBACK_MAIL_SENT]===true)return{ok:true,status:200,state:"TARGET_SECOND_MEETING_FEEDBACK_MAIL_ALREADY_SENT",controlledOne:true,feedbackRequestCount:3,emailsSent:0,alreadySentCount:alreadySent,remainingUnsentCount:3-alreadySent,duplicateSendPrevented:true,airtableChanged:false,piiExposedInResponse:false,recipientIdsExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false};
 if(alreadySent!==0)return{ok:false,status:409,code:"CONTROLLED_ONE_REQUIRES_NO_PREVIOUS_SEND",alreadySentCount:alreadySent};
 if(text(row?.fields?.[FEEDBACK_SUBMITTED_AT]))return{ok:false,status:409,code:"FEEDBACK_ALREADY_SUBMITTED"};
 const link=text(row?.fields?.[FEEDBACK_LINK]);const token=text(row?.fields?.[FEEDBACK_TOKEN]);const validUntil=new Date(text(row?.fields?.[FEEDBACK_VALID_UNTIL]));
 if(!link||!token||!Number.isFinite(validUntil.getTime())||validUntil.getTime()<=Date.now())return{ok:false,status:409,code:"FEEDBACK_LINK_NOT_ACTIVE"};
 const applicant=await getRecord(env,APPLICANTS_TABLE,targetApplicantId);
 const name=text(applicant?.fields?.[APPLICANT_NAME])||"LAVUQ Teilnehmer";
 const email=text(applicant?.fields?.[APPLICANT_EMAIL]);
 if(name!=="Simon Weinrich"||!email||!email.includes("@"))return{ok:false,status:409,code:"TARGET_RECIPIENT_MISMATCH"};
 const delivery=await sendMail(env,email,name,link);
 await patchFeedback(env,row.id,{[FEEDBACK_MAIL_SENT]:true,[FEEDBACK_MAIL_MESSAGE_ID]:delivery.messageId});
 return{ok:true,status:200,state:"ONE_SECOND_MEETING_FEEDBACK_MAIL_SENT",controlledOne:true,feedbackRequestCount:3,emailsSent:1,otherEmailsSent:0,alreadySentCount:0,remainingUnsentCount:2,providerAccepted:true,providerStatus:delivery.providerStatus,providerMessageIdPresent:true,feedbackMailMarkedSent:true,duplicateSendPrevented:true,airtableChanged:true,thirdMeetingPrepared:false,piiExposedInResponse:false,recipientIdsExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false};
}
