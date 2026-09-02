// LAVUQ Treffen 3 – automatische Feedback-Auswertung als sicherer Dry-Run.
// Keine E-Mails, keine Airtable-Aenderungen.
const BASE_ID="apphnIBhuAbmMTUtY";
const FEEDBACK_TABLE="tblLyjFTdr1MziUgj";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";
const FEEDBACK_MEETING="fldaykTvzKmCqn9MO";
const FEEDBACK_SUBMITTED_AT="fld5uezt0LJJdtd29";
const FEEDBACK_FEELING="fldasI0An5QelVvea";
const FEEDBACK_CONTINUE="fldudL6OgGjs2mkMm";
const FEEDBACK_SAFETY_REVIEW="fldB3Dxaijejmjb0h";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_STATUS="fldAZyz79cEpcGweE";

function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function linked(v,id){return Array.isArray(v)&&v.some(x=>(typeof x==="string"?x:x?.id)===id);}
function validRecordId(v){return /^rec[A-Za-z0-9]{14}$/.test(String(v||""));}
async function getRecord(env,table,id){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}/${id}?returnFieldsByFieldId=true`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);return r.json();}
async function listFeedback(env){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${FEEDBACK_TABLE}?${p}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable Feedback HTTP ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}
function countBy(rows,field){const out={};for(const r of rows){const v=text(r?.fields?.[field])||"Leer";out[v]=(out[v]||0)+1;}return out;}

export async function handleThirdMeetingFeedbackDecisionDryRun(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const meetingRecordId=String(input.meetingRecordId||"").trim();
 if(!validRecordId(meetingRecordId))return{ok:false,status:400,code:"INVALID_MEETING_ID"};
 const meeting=await getRecord(env,MEETINGS_TABLE,meetingRecordId);
 if(Number(meeting?.fields?.[MEETING_ATTEMPT]||0)!==3||text(meeting?.fields?.[MEETING_STATUS])!=="Bestätigt")return{ok:false,status:409,code:"THIRD_MEETING_NOT_CONFIRMED"};
 const rows=(await listFeedback(env)).filter(r=>linked(r?.fields?.[FEEDBACK_MEETING],meetingRecordId));
 const submitted=rows.filter(r=>Boolean(r?.fields?.[FEEDBACK_SUBMITTED_AT]));
 const feedbackRequestCount=rows.length;
 const submittedCount=submitted.length;
 const complete=feedbackRequestCount===3&&submittedCount===3;
 const feelingCounts=countBy(submitted,FEEDBACK_FEELING);
 const continueCounts=countBy(submitted,FEEDBACK_CONTINUE);
 const yesCount=Number(continueCounts.Ja||0);
 const unsureCount=Number(continueCounts.Unsicher||0);
 const noCount=Number(continueCounts.Nein||0);
 const uncomfortableCount=Number(feelingCounts.Unwohl||0)+Number(feelingCounts.Nein||0);
 const safetyFlagCount=submitted.filter(r=>r?.fields?.[FEEDBACK_SAFETY_REVIEW]===true).length;
 const safetyReviewRequired=uncomfortableCount>0||safetyFlagCount>0;
 let decision="WAIT_FOR_ALL_FEEDBACKS";
 let nextAction="Weitere Feedbacks abwarten";
 if(complete){
   if(safetyReviewRequired){
     decision="MANUAL_SAFETY_REVIEW_REQUIRED";
     nextAction="Sicherheitspruefung durch LAVUQ vor jedem weiteren Schritt";
   }else if(noCount>=2){
     decision="THIRD_MEETING_COMPLETED_CLOSE_GROUP";
     nextAction="LAVUQ-Phase abschliessen; Gruppe nicht als gemeinsame Fortsetzung markieren";
   }else if(noCount===1){
     decision="THIRD_MEETING_COMPLETED_PARTIAL_CONTINUATION";
     nextAction="LAVUQ-Phase abschliessen; Fortsetzung nur fuer zustimmende/unsichere Teilnehmer vorbereiten";
   }else{
     decision="THIRD_MEETING_COMPLETED_CONTINUE_INDEPENDENTLY";
     nextAction="LAVUQ-Phase erfolgreich abschliessen; Gruppe kann sich selbststaendig weiter treffen";
   }
 }
 return{ok:true,status:200,state:"THIRD_MEETING_FEEDBACK_DECISION_DRY_RUN",dryRun:true,readOnly:true,meetingAttempt:3,feedbackRequestCount,submittedCount,allThreeSubmitted:complete,pendingFeedbackCount:Math.max(0,3-submittedCount),feelingCounts,continueCounts,yesCount,unsureCount,noCount,uncomfortableCount,safetyFlagCount,safetyReviewRequired,decision,nextAction,emailsSent:0,airtableChanged:false,groupStatusChanged:false,piiExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false};
}
