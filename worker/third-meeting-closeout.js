// LAVUQ Treffen 3 – kontrollierter Abschlussprozess.
const BASE_ID="apphnIBhuAbmMTUtY";
const FEEDBACK_TABLE="tblLyjFTdr1MziUgj";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";
const GROUPS_TABLE="tblF8peAAJGjwfKab";
const MEMBERS_TABLE="tbl4QX0NIB3tUKtF4";
const APPLICANTS_TABLE="tblzLtbR5Yh4nR5aQ";

const FEEDBACK_MEETING="fldaykTvzKmCqn9MO";
const FEEDBACK_SUBMITTED_AT="fld5uezt0LJJdtd29";
const FEEDBACK_FEELING="fldasI0An5QelVvea";
const FEEDBACK_CONTINUE="fldudL6OgGjs2mkMm";
const FEEDBACK_SAFETY_REVIEW="fldB3Dxaijejmjb0h";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_STATUS="fldAZyz79cEpcGweE";
const MEETING_DATE="fldGIDne7S1fY997i";
const MEETING_GROUP="fld0Zpt6q0OO9RmTt";
const MEETING_PARTICIPANTS="fld9NnPRq52Wg0bMb";
const GROUP_STATUS="fldpizdbKv9LGxMDa";
const GROUP_END_DATE="fld3gGSTXHIeucPFE";
const MEMBER_GROUP="fldMUYzXykTpV0j2x";
const MEMBER_APPLICANT="fldcV8kd6KF7zdScE";
const MEMBER_STATUS="fldBS2hoKQX0Rr1aX";
const MEMBER_CLOSEOUT_SENT="fldavcF0TDGuGYLj1";
const APPLICANT_NAME="fldPPnyiAKpIXnawY";
const APPLICANT_EMAIL="flduioUSJQ7BlM85W";

function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function firstLink(v){if(!Array.isArray(v)||!v.length)return null;const x=v[0];return typeof x==="string"?x:x?.id||null;}
function linked(v,id){return Array.isArray(v)&&v.some(x=>(typeof x==="string"?x:x?.id)===id);}
function validRecordId(v){return /^rec[A-Za-z0-9]{14}$/.test(String(v||""));}
function parseMemberIds(v){return [...new Set(String(v||"").split(/\r?\n|,|;|\s+/).map(s=>s.trim()).filter(validRecordId))];}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
async function getRecord(env,table,id){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}/${id}?returnFieldsByFieldId=true`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);return r.json();}
async function listTable(env,table){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}?${p}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}
async function patch(env,table,id,fields){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}/${id}`,{method:"PATCH",headers:headers(env),body:JSON.stringify({fields})});if(!r.ok)throw new Error(`Airtable ${table} PATCH HTTP ${r.status}`);return r.json();}
async function sendMail(env,to,name){
 if(!env.BREVO_API_KEY)throw new Error("BREVO_API_KEY_MISSING");
 const senderEmail=env.BREVO_SENDER_EMAIL||"kontakt@lavuq-wue.de";
 const senderName=env.BREVO_SENDER_NAME||"LAVUQ Würzburg";
 const html=`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b1f3a;max-width:620px;margin:0 auto"><h2>Hallo ${esc(name)},</h2><p>ihr habt eure drei begleiteten LAVUQ-Treffen abgeschlossen – und alle möchten den Kontakt weiterführen.</p><p>Damit endet die begleitete LAVUQ-Phase für eure Gruppe erfolgreich. Ab jetzt könnt ihr euch ganz selbstständig weiter verabreden und eure Freundschaft wachsen lassen.</p><p>LAVUQ plant für diese Gruppe keine weiteren automatischen Treffen mehr.</p><p>Wenn später etwas Wichtiges oder eine Sicherheitsfrage auftaucht, könnt ihr euch weiterhin an LAVUQ wenden. Bei akuter Gefahr bitte direkt 110 oder 112 kontaktieren.</p><p>Wir wünschen euch viele gute gemeinsame Momente.<br><strong>LAVUQ Würzburg</strong></p></div>`;
 const r=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"api-key":env.BREVO_API_KEY,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({sender:{email:senderEmail,name:senderName},to:[{email:to,name}],subject:"Eure LAVUQ-Gruppe geht jetzt selbstständig weiter",htmlContent:html})});
 const raw=await r.text();let data={};try{data=raw?JSON.parse(raw):{};}catch{}
 if(!r.ok)throw new Error(`BREVO_HTTP_${r.status}`);
 if(!String(data?.messageId||"").trim())throw new Error("BREVO_MESSAGE_ID_MISSING");
 return true;
}
function decision(rows){
 const submitted=rows.filter(r=>Boolean(r?.fields?.[FEEDBACK_SUBMITTED_AT]));
 if(rows.length!==3||submitted.length!==3)return{ready:false,code:"NOT_ALL_THREE_FEEDBACKS_SUBMITTED"};
 const safety=submitted.some(r=>r?.fields?.[FEEDBACK_SAFETY_REVIEW]===true||["Unwohl","Nein"].includes(text(r?.fields?.[FEEDBACK_FEELING])));
 if(safety)return{ready:false,code:"MANUAL_SAFETY_REVIEW_REQUIRED"};
 const cont=submitted.map(r=>text(r?.fields?.[FEEDBACK_CONTINUE]));
 if(cont.filter(v=>v==="Nein").length>0)return{ready:false,code:"NOT_ALL_CONTINUE"};
 return{ready:true};
}

export async function handleThirdMeetingCloseout(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const meetingRecordId=String(input.meetingRecordId||"").trim();
 if(!validRecordId(meetingRecordId))return{ok:false,status:400,code:"INVALID_MEETING_ID"};
 const execute=input.controlledExecute===true&&String(input.confirmation||"")==="TREFFEN_3_GRUPPE_ABSCHLIESSEN_UND_MAILS_SENDEN";
 const meeting=await getRecord(env,MEETINGS_TABLE,meetingRecordId);
 if(Number(meeting?.fields?.[MEETING_ATTEMPT]||0)!==3||text(meeting?.fields?.[MEETING_STATUS])!=="Bestätigt")return{ok:false,status:409,code:"THIRD_MEETING_NOT_CONFIRMED"};
 const meetingDate=new Date(text(meeting?.fields?.[MEETING_DATE]));
 if(!Number.isFinite(meetingDate.getTime()))return{ok:false,status:409,code:"MEETING_DATE_INVALID"};
 const beforeMeeting=Date.now()<meetingDate.getTime();
 if(execute&&beforeMeeting&&input.allowBeforeMeetingForTest!==true)return{ok:false,status:409,code:"MEETING_NOT_YET_OCCURRED"};
 const groupId=firstLink(meeting?.fields?.[MEETING_GROUP]);
 if(!validRecordId(groupId))return{ok:false,status:409,code:"GROUP_LINK_INVALID"};
 const memberIds=parseMemberIds(meeting?.fields?.[MEETING_PARTICIPANTS]);
 if(memberIds.length!==3)return{ok:false,status:409,code:"NOT_EXACTLY_3_PARTICIPANTS",participantCount:memberIds.length};
 const rows=(await listTable(env,FEEDBACK_TABLE)).filter(r=>linked(r?.fields?.[FEEDBACK_MEETING],meetingRecordId));
 const d=decision(rows);if(!d.ready)return{ok:false,status:409,code:d.code};
 const members=await Promise.all(memberIds.map(id=>getRecord(env,MEMBERS_TABLE,id)));
 const alreadySent=members.filter(m=>m?.fields?.[MEMBER_CLOSEOUT_SENT]===true).length;
 const pending=members.filter(m=>m?.fields?.[MEMBER_CLOSEOUT_SENT]!==true);
 if(!execute)return{ok:true,status:200,state:"THIRD_MEETING_CLOSEOUT_READY",dryRun:true,meetingAttempt:3,participantCount:3,alreadySentCount:alreadySent,pendingMailCount:pending.length,wouldCloseGroup:true,wouldMarkMembersCompleted:true,wouldSendEmails:pending.length,beforeMeeting,airtableChanged:false,emailsSent:0,piiExposedInResponse:false};
 let emailsSent=0;
 for(const member of pending){
   if(!linked(member?.fields?.[MEMBER_GROUP],groupId))throw new Error("MEMBER_GROUP_MISMATCH");
   const applicantId=firstLink(member?.fields?.[MEMBER_APPLICANT]);if(!validRecordId(applicantId))throw new Error("APPLICANT_LINK_INVALID");
   const applicant=await getRecord(env,APPLICANTS_TABLE,applicantId);
   const name=text(applicant?.fields?.[APPLICANT_NAME])||"LAVUQ Teilnehmer";const email=text(applicant?.fields?.[APPLICANT_EMAIL]);if(!email||!email.includes("@"))throw new Error("RECIPIENT_EMAIL_INVALID");
   await sendMail(env,email,name);
   await patch(env,MEMBERS_TABLE,member.id,{[MEMBER_STATUS]:"Abgeschlossen",[MEMBER_CLOSEOUT_SENT]:true});
   emailsSent++;
 }
 const endDate=meetingDate.toISOString().slice(0,10);
 await patch(env,GROUPS_TABLE,groupId,{[GROUP_STATUS]:"Abgeschlossen",[GROUP_END_DATE]:endDate});
 return{ok:true,status:200,state:"THIRD_MEETING_GROUP_CLOSED_SUCCESSFULLY",controlledExecute:true,meetingAttempt:3,participantCount:3,emailsSent,alreadySentCount:alreadySent,groupStatusChanged:true,membersMarkedCompleted:true,airtableChanged:true,beforeMeetingTestOverride:beforeMeeting&&input.allowBeforeMeetingForTest===true,duplicateSendPrevented:true,piiExposedInResponse:false};
}
