// LAVUQ – kontrollierter Recovery-Versand fuer offene Feedbacks nach Treffen 1.
// Sendet nur an Teilnehmer, deren Feedback noch NICHT abgegeben wurde.
// Bestehende persoenliche Links bleiben unveraendert; es werden keine Tokens/Links im Response ausgegeben.
const BASE_ID="apphnIBhuAbmMTUtY";
const FEEDBACK_TABLE="tblLyjFTdr1MziUgj";
const APPLICANTS_TABLE="tblzLtbR5Yh4nR5aQ";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";

const FEEDBACK_MEETING="fldaykTvzKmCqn9MO";
const FEEDBACK_APPLICANT="fldkOnMXpqlnNjs1b";
const FEEDBACK_TOKEN="fldvZizwPZiCE7co3";
const FEEDBACK_LINK="fldwHXctCJcj9eHYE";
const FEEDBACK_VALID_UNTIL="fldszL9Bjcsk5UDFD";
const FEEDBACK_SUBMITTED_AT="fld5uezt0LJJdtd29";

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

async function sendRecoveryMail(env,to,name,feedbackLink){
 if(!env.BREVO_API_KEY)throw new Error("BREVO_API_KEY fehlt");
 const senderEmail=env.BREVO_SENDER_EMAIL||"kontakt@lavuq-wue.de";
 const senderName=env.BREVO_SENDER_NAME||"LAVUQ Würzburg";
 const subject="TEST Erinnerung: Dein persoenlicher LAVUQ-Feedback-Link";
 const html=`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b1f3a;max-width:620px;margin:0 auto">
   <h2>Hallo ${esc(name)},</h2>
   <p>dein Feedback zu eurem ersten LAVUQ-Treffen ist noch offen.</p>
   <p>Hier kannst du deinen bereits vorbereiteten persoenlichen Feedback-Link erneut oeffnen:</p>
   <p style="margin:28px 0"><a href="${esc(feedbackLink)}" style="background:#0b1f3a;color:#fff;text-decoration:none;padding:13px 20px;border-radius:8px;display:inline-block">Feedback geben</a></p>
   <p>Der Link ist persoenlich und zeitlich begrenzt. Bitte leite ihn nicht weiter.</p>
   <p><strong>TESTHINWEIS:</strong> Kontrollierter Recovery-Versand nur fuer noch offene Feedbacks.</p>
   <p>Viele Gruesse<br><strong>LAVUQ Wuerzburg</strong></p>
  </div>`;
 const r=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"api-key":env.BREVO_API_KEY,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({sender:{email:senderEmail,name:senderName},to:[{email:to,name}],subject,htmlContent:html})});
 const raw=await r.text(); let data={}; try{data=raw?JSON.parse(raw):{};}catch{}
 if(!r.ok)throw new Error(`Brevo HTTP ${r.status}`);
 return{accepted:true,messageIdPresent:Boolean(String(data?.messageId||"").trim())};
}

export async function handleFirstMeetingFeedbackRecoveryOpen(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const groupId=String(input.groupId||"").trim();
 if(!validRecordId(groupId))return{ok:false,status:400,code:"INVALID_GROUP_ID"};
 if(input.recoveryOpenOnly!==true||String(input.confirmation||"")!=="NUR_OFFENE_FEEDBACKS_ERNEUT_SENDEN")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED"};

 const meetings=await listTable(env,MEETINGS_TABLE);
 const candidates=meetings.filter(m=>linked(m?.fields?.[MEETING_GROUP_LINK],groupId)&&Number(m?.fields?.[MEETING_ATTEMPT]||0)===1&&text(m?.fields?.[MEETING_STATUS])==="Bestätigt");
 if(candidates.length!==1)return{ok:false,status:409,code:candidates.length?"MULTIPLE_CONFIRMED_FIRST_MEETINGS":"NO_CONFIRMED_FIRST_MEETING"};
 const meeting=candidates[0];
 const rows=(await listTable(env,FEEDBACK_TABLE)).filter(f=>linked(f?.fields?.[FEEDBACK_MEETING],meeting.id));
 if(rows.length!==4)return{ok:false,status:409,code:"NOT_EXACTLY_4_FEEDBACK_REQUESTS",feedbackRequestCount:rows.length};

 const submitted=rows.filter(r=>Boolean(text(r?.fields?.[FEEDBACK_SUBMITTED_AT])));
 const open=rows.filter(r=>!text(r?.fields?.[FEEDBACK_SUBMITTED_AT]));
 if(open.length===0)return{ok:true,status:200,state:"NO_OPEN_FIRST_MEETING_FEEDBACKS",recoveryOpenOnly:true,feedbackRequestCount:4,submittedCount:4,openCount:0,emailsSent:0,airtableChanged:false,piiExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false};
 if(submitted.length!==1||open.length!==3)return{ok:false,status:409,code:"RECOVERY_REQUIRES_EXACTLY_3_OPEN",submittedCount:submitted.length,openCount:open.length,piiExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false};

 const recipients=[];
 for(const row of open){
  const applicantId=firstLink(row?.fields?.[FEEDBACK_APPLICANT]);
  const token=text(row?.fields?.[FEEDBACK_TOKEN]);
  const feedbackLink=text(row?.fields?.[FEEDBACK_LINK]);
  const validUntil=new Date(text(row?.fields?.[FEEDBACK_VALID_UNTIL]));
  if(!applicantId||!token||!feedbackLink||!Number.isFinite(validUntil.getTime())||validUntil.getTime()<=Date.now())return{ok:false,status:409,code:"OPEN_FEEDBACK_LINK_NOT_USABLE",piiExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false};
  const applicant=await getRecord(env,APPLICANTS_TABLE,applicantId);
  const name=text(applicant?.fields?.[APPLICANT_NAME])||"LAVUQ Teilnehmer";
  const email=text(applicant?.fields?.[APPLICANT_EMAIL]);
  if(!email||!email.includes("@"))return{ok:false,status:422,code:"EMAIL_MISSING",piiExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false};
  recipients.push({name,email,feedbackLink});
 }

 let emailsSent=0,messageIdsPresent=0;
 for(const recipient of recipients){
  const d=await sendRecoveryMail(env,recipient.email,recipient.name,recipient.feedbackLink);
  if(d.accepted)emailsSent++;
  if(d.messageIdPresent)messageIdsPresent++;
 }
 return{ok:true,status:200,state:"OPEN_FIRST_MEETING_FEEDBACKS_RECOVERY_SENT",recoveryOpenOnly:true,feedbackRequestCount:4,submittedCount:1,openCount:3,emailsSent,messageIdsPresent,existingLinksReused:true,feedbackStatusReset:false,airtableChanged:false,secondMeetingPrepared:false,piiExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false};
}
