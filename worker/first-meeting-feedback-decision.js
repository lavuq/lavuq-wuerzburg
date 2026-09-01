const BASE_ID="apphnIBhuAbmMTUtY";
const FEEDBACK_TABLE="tblLyjFTdr1MziUgj";
const FEEDBACK_MEETING="fldaykTvzKmCqn9MO";
const FEEDBACK_SUBMITTED_AT="fld5uezt0LJJdtd29";
const FEEDBACK_FEELING="fldasI0An5QelVvea";
const FEEDBACK_CONTINUE="fldudL6OgGjs2mkMm";

function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function linked(v,recordId){return Array.isArray(v)&&v.some(x=>(typeof x==="string"?x:x?.id)===recordId);}
async function listFeedback(env){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${FEEDBACK_TABLE}?${p}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable Feedback HTTP ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}
function countBy(rows,field){const out={};for(const r of rows){const v=text(r?.fields?.[field])||"Leer";out[v]=(out[v]||0)+1;}return out;}

export async function handleFirstMeetingFeedbackDecisionDryRun(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const meetingRecordId=String(input.meetingRecordId||"").trim();
 if(!/^rec[A-Za-z0-9]{14}$/.test(meetingRecordId))return{ok:false,status:400,code:"INVALID_MEETING_ID"};
 const all=await listFeedback(env);
 const rows=all.filter(r=>linked(r?.fields?.[FEEDBACK_MEETING],meetingRecordId));
 const submitted=rows.filter(r=>Boolean(r?.fields?.[FEEDBACK_SUBMITTED_AT]));
 const feedbackRequestCount=rows.length;
 const submittedCount=submitted.length;
 const complete=submittedCount===4&&feedbackRequestCount===4;
 const feelingCounts=countBy(submitted,FEEDBACK_FEELING);
 const continueCounts=countBy(submitted,FEEDBACK_CONTINUE);
 const noCount=Number(continueCounts.Nein||0);
 const unsureCount=Number(continueCounts.Unsicher||0);
 const yesCount=Number(continueCounts.Ja||0);
 const unsafeFeelingCount=Number(feelingCounts.Nein||0);
 let decision="WAIT_FOR_ALL_FEEDBACKS";
 let wouldPrepareSecondMeeting=false;
 let manualReviewRequired=false;
 let closeGroup=false;
 let replacementParticipantsNeeded=0;
 if(complete){
   // LAVUQ-Regel: "Unsicher" zaehlt als Fortsetzung. Bei 0 oder 1 "Nein" bleibt
   // die Gruppe bestehen und Treffen 2 darf vorbereitet werden. Erst ab 2 "Nein"
   // wird die Gruppe geschlossen und es werden 2 neue Teilnehmer benoetigt.
   if(noCount>=2){
     decision="CLOSE_GROUP_AND_SELECT_TWO_REPLACEMENTS";
     closeGroup=true;
     replacementParticipantsNeeded=2;
   }else{
     decision="READY_TO_PREPARE_SECOND_MEETING";
     wouldPrepareSecondMeeting=true;
   }
 }
 return{ok:true,status:200,state:"FIRST_MEETING_FEEDBACK_DECISION_DRY_RUN",dryRun:true,readOnly:true,feedbackRequestCount,submittedCount,allFourSubmitted:complete,feelingCounts,continueCounts,yesCount,unsureCount,noCount,unsafeFeelingCount,decision,wouldPrepareSecondMeeting,manualReviewRequired,closeGroup,replacementParticipantsNeeded,safetyReviewRecommended:unsafeFeelingCount>0,emailsSent:0,airtableChanged:false,secondMeetingPrepared:false,piiExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false};
}
