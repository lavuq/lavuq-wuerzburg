// LAVUQ – kontrollierter Versand genau einer persoenlichen Feedback-Mail nach Treffen 1.
// Sicherheitsziele: explizite Bestaetigung, genau 4 vorbereitete Feedback-Datensaetze,
// nur ein noch unversendeter Empfaenger, kein Token/Link/PII im Response, Doppelversand-Schutz in Airtable.
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

const APPLICANT_NAME="fldPPnyiAKpIXnawY";
const APPLICANT_EMAIL="flduioUSJQ7BlM85W";

const MEETING_GROUP_LINK="fld0Zpt6q0OO9RmTt";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_STATUS="fldAZyz79cEpcGweE";

function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function firstLink(v){if(!Array.isArray(v)||!v.length)return null;const x=v[0];return typeof x==="string"?x:x?.id||null;}
function linked(v,id){return Array.isArray(v)&&v.some(x=>(typeof x==="string"?x:x?.id)===id);}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
function validRecordId(v){return /^rec[A-Za-z0-9]{14}$/.test(String(v||""));}

async function listTable(env,table){
 let out=[],offset="";
 do{
  const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});
  if(offset)p.set("offset",offset);
  const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}?${p}`,{headers:headers(env)});
  if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);
  const j=await r.json(); out.push(...(j.records||[])); offset=String(j.offset||"");
 }while(offset);
 return out;
}
async function getRecord(env,table,id){
 const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}/${id}?returnFieldsByFieldId=true`,{headers:headers(env)});
 if(!r.ok)throw new Error(`Airtable GET HTTP ${r.status}`);
 return r.json();
}
async function patchFeedback(env,id,fields){
 const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${FEEDBACK_TABLE}/${id}`,{method:"PATCH",headers:headers(env),body:JSON.stringify({fields})});
 if(!r.ok)throw new Error(`Airtable Feedback PATCH HTTP ${r.status}`);
 return r.json();
}
async function sendFeedbackMail(env,to,name,feedbackLink){
 if(!env.BREVO_API_KEY)throw new Error("BREVO_API_KEY fehlt");
 const senderEmail=env.BREVO_SENDER_EMAIL||"kontakt@lavuq-wue.de";
 const senderName=env.BREVO_SENDER_NAME||"LAVUQ Würzburg";
 const subject="TEST Feedback: Wie war euer erstes LAVUQ-Treffen?";
 const html=`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b1f3a;max-width:620px;margin:0 auto">
   <h2>Hallo ${esc(name)},</h2>
   <p>wir möchten gern kurz wissen, wie du euer erstes LAVUQ-Treffen erlebt hast.</p>
   <p>Über deinen persönlichen Link kannst du dein Feedback abgeben:</p>
   <p style="margin:28px 0"><a href="${esc(feedbackLink)}" style="background:#0b1f3a;color:#fff;text-decoration:none;padding:13px 20px;border-radius:8px;display:inline-block">Feedback geben</a></p>
   <p>Der Link ist persönlich und zeitlich begrenzt. Bitte leite ihn nicht weiter.</p>
   <p><strong>TESTHINWEIS:</strong> Dies ist eine kontrollierte Feedback-Testmail an genau eine Person.</p>
   <p>Viele Grüße<br><strong>LAVUQ Würzburg</strong></p>
  </div>`;
 const r=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"api-key":env.BREVO_API_KEY,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({sender:{email:senderEmail,name:senderName},to:[{email:to,name}],subject,htmlContent:html})});
 const raw=await r.text(); let data={}; try{data=raw?JSON.parse(raw):{};}catch{}
 if(!r.ok)throw new Error(`Brevo HTTP ${r.status}`);
 const messageId=String(data?.messageId||"").trim();
 if(!messageId)throw new Error("Brevo Message-ID fehlt");
 return{providerAccepted:true,providerStatus:r.status,providerMessageId:messageId};
}

export async function handleFirstMeetingFeedbackMailControlledOne(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const groupId=String(input.groupId||"").trim();
 if(!validRecordId(groupId))return{ok:false,status:400,code:"INVALID_GROUP_ID"};
 if(input.controlledOne!==true||String(input.confirmation||"")!=="EINE_FEEDBACK_MAIL_SENDEN")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED"};

 const meetings=await listTable(env,MEETINGS_TABLE);
 const meetingCandidates=meetings.filter(m=>linked(m?.fields?.[MEETING_GROUP_LINK],groupId)&&Number(m?.fields?.[MEETING_ATTEMPT]||0)===1&&text(m?.fields?.[MEETING_STATUS])==="Bestätigt");
 if(meetingCandidates.length!==1)return{ok:false,status:409,code:meetingCandidates.length?"MULTIPLE_CONFIRMED_FIRST_MEETINGS":"NO_CONFIRMED_FIRST_MEETING"};
 const meeting=meetingCandidates[0];

 const feedbackRows=(await listTable(env,FEEDBACK_TABLE)).filter(f=>linked(f?.fields?.[FEEDBACK_MEETING],meeting.id));
 if(feedbackRows.length!==4)return{ok:false,status:409,code:"NOT_EXACTLY_4_FEEDBACK_REQUESTS",feedbackRequestCount:feedbackRows.length};

 const complete=feedbackRows.filter(f=>firstLink(f?.fields?.[FEEDBACK_APPLICANT])&&text(f?.fields?.[FEEDBACK_TOKEN])&&text(f?.fields?.[FEEDBACK_LINK])&&text(f?.fields?.[FEEDBACK_VALID_UNTIL]));
 if(complete.length!==4)return{ok:false,status:409,code:"FEEDBACK_REQUESTS_INCOMPLETE",completeFeedbackRequestCount:complete.length};

 const alreadySent=feedbackRows.filter(f=>f?.fields?.[FEEDBACK_MAIL_SENT]===true);
 const unsent=feedbackRows.filter(f=>f?.fields?.[FEEDBACK_MAIL_SENT]!==true);
 if(unsent.length===0)return{ok:true,status:200,state:"ALL_FEEDBACK_MAILS_ALREADY_MARKED_SENT",controlledOne:true,feedbackRequestCount:4,emailsSent:0,alreadySentCount:4,remainingUnsentCount:0,duplicateSendPrevented:true,airtableChanged:false,secondMeetingPrepared:false,piiExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false};

 const row=unsent[0];
 const applicantId=firstLink(row?.fields?.[FEEDBACK_APPLICANT]);
 const applicant=await getRecord(env,APPLICANTS_TABLE,applicantId);
 const name=text(applicant?.fields?.[APPLICANT_NAME])||"LAVUQ Teilnehmer";
 const email=text(applicant?.fields?.[APPLICANT_EMAIL]);
 if(!email||!email.includes("@"))return{ok:false,status:422,code:"EMAIL_MISSING"};
 const feedbackLink=text(row?.fields?.[FEEDBACK_LINK]);
 const validUntil=new Date(text(row?.fields?.[FEEDBACK_VALID_UNTIL]));
 if(!Number.isFinite(validUntil.getTime())||validUntil.getTime()<=Date.now())return{ok:false,status:409,code:"FEEDBACK_LINK_EXPIRED"};

 const delivery=await sendFeedbackMail(env,email,name,feedbackLink);
 await patchFeedback(env,row.id,{[FEEDBACK_MAIL_SENT]:true,[FEEDBACK_MAIL_MESSAGE_ID]:delivery.providerMessageId});

 return{ok:true,status:200,state:"ONE_FIRST_MEETING_FEEDBACK_MAIL_SENT",controlledOne:true,feedbackRequestCount:4,emailsSent:1,otherEmailsSent:0,alreadySentCount:alreadySent.length,remainingUnsentCount:Math.max(0,unsent.length-1),providerAccepted:delivery.providerAccepted,providerStatus:delivery.providerStatus,providerMessageIdPresent:true,feedbackMailMarkedSent:true,duplicateSendPrevented:true,airtableChanged:true,secondMeetingPrepared:false,piiExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false};
}
