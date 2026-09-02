// LAVUQ Produktions-Orchestrator – aktive, idempotente Verarbeitung produktionsreifer Treffen-3-Schritte.
import { handleThirdMeetingReminder24h } from "./third-meeting-reminder-24h.js";
import { handleThirdMeetingReminder2h } from "./third-meeting-reminder-2h.js";
import { handleThirdMeetingFeedbackCheckin } from "./third-meeting-feedback-checkin.js";
import { handleThirdMeetingFeedbackMailControlledOne } from "./third-meeting-feedback-mail.js";
import { handleThirdMeetingCloseout } from "./third-meeting-closeout.js";

const BASE_ID="apphnIBhuAbmMTUtY";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";
const GROUPS_TABLE="tblF8peAAJGjwfKab";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_STATUS="fldAZyz79cEpcGweE";
const MEETING_GROUP="fld0Zpt6q0OO9RmTt";
const GROUP_STATUS="fldpizdbKv9LGxMDa";

function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function firstLink(v){if(!Array.isArray(v)||!v.length)return null;const x=v[0];return typeof x==="string"?x:x?.id||null;}
async function getRecord(env,table,id){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}/${id}?returnFieldsByFieldId=true`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);return r.json();}
async function listMeetings(env){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${MEETINGS_TABLE}?${p}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable Termine HTTP ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}
function safeResult(step,result){return{step,ok:result?.ok===true,state:result?.state||null,code:result?.code||null,emailsSent:Number(result?.emailsSent||0),airtableChanged:result?.airtableChanged===true};}

export async function handleProductionOrchestrator(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 if(String(input.confirmation||"")!=="RUN_LAVUQ_PRODUCTION_ORCHESTRATOR")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED"};
 const now=new Date();
 const candidates=(await listMeetings(env)).filter(m=>Number(m?.fields?.[MEETING_ATTEMPT]||0)===3&&text(m?.fields?.[MEETING_STATUS])==="Bestätigt");
 const meetings=[];let completedGroupsSkipped=0;
 for(const m of candidates){const gid=firstLink(m?.fields?.[MEETING_GROUP]);if(!gid)continue;const g=await getRecord(env,GROUPS_TABLE,gid);if(text(g?.fields?.[GROUP_STATUS])==="Abgeschlossen"){completedGroupsSkipped++;continue;}meetings.push(m);}
 const processed=[];let emailsSent=0;let mutations=0;let hardErrors=0;
 for(const meeting of meetings){
   const steps=[];
   try{
     const r24=await handleThirdMeetingReminder24h(env,{meetingRecordId:meeting.id,mode:"automatic",confirmation:"AUTOMATIC_THIRD_MEETING_24H",asOf:now.toISOString()});
     steps.push(safeResult("reminder24h",r24));emailsSent+=Number(r24?.emailsSent||0);if(r24?.airtableChanged)mutations++;
     if(r24?.ok===false&&!['THIRD_MEETING_RECIPIENT_FILTER_INVALID'].includes(r24?.code||''))hardErrors++;

     const r2=await handleThirdMeetingReminder2h(env,{meetingRecordId:meeting.id,mode:"automatic",confirmation:"AUTOMATIC_THIRD_MEETING_2H",asOf:now.toISOString()});
     steps.push(safeResult("reminder2h",r2));emailsSent+=Number(r2?.emailsSent||0);if(r2?.airtableChanged)mutations++;
     if(r2?.ok===false&&!['THIRD_MEETING_RECIPIENT_FILTER_INVALID'].includes(r2?.code||''))hardErrors++;

     const check=await handleThirdMeetingFeedbackCheckin(env,{meetingRecordId:meeting.id,controlledCreateAll:true,confirmation:"DREI_TREFFEN_3_FEEDBACK_ANFRAGEN_ANLEGEN",prepareAheadForScheduledMeeting:true,asOf:now.toISOString(),simulateRemindersCompleted:false});
     steps.push(safeResult("feedbackPrepare",check));if(check?.airtableChanged)mutations++;
     const benignCheckCodes=new Set(["THIRD_MEETING_FEEDBACK_NOT_READY"]);if(check?.ok===false&&!benignCheckCodes.has(check?.code))hardErrors++;

     for(let i=0;i<3;i++){
       const fm=await handleThirdMeetingFeedbackMailControlledOne(env,{meetingRecordId:meeting.id,controlledOne:true,confirmation:"EINE_TREFFEN_3_FEEDBACK_MAIL_SENDEN"});
       steps.push(safeResult(`feedbackMail${i+1}`,fm));emailsSent+=Number(fm?.emailsSent||0);if(fm?.airtableChanged)mutations++;
       if(fm?.ok===false){const benign=new Set(["FEEDBACK_LINK_NOT_ACTIVE","NOT_EXACTLY_3_THIRD_MEETING_FEEDBACK_REQUESTS"]);if(!benign.has(fm?.code))hardErrors++;break;}
       if(Number(fm?.emailsSent||0)===0)break;
     }

     const close=await handleThirdMeetingCloseout(env,{meetingRecordId:meeting.id,controlledExecute:true,confirmation:"TREFFEN_3_GRUPPE_ABSCHLIESSEN_UND_MAILS_SENDEN"});
     steps.push(safeResult("closeout",close));emailsSent+=Number(close?.emailsSent||0);if(close?.airtableChanged)mutations++;
     const benignCloseCodes=new Set(["MEETING_NOT_YET_OCCURRED","NOT_ALL_THREE_FEEDBACKS_SUBMITTED","MANUAL_SAFETY_REVIEW_REQUIRED","NOT_ALL_CONTINUE"]);if(close?.ok===false&&!benignCloseCodes.has(close?.code))hardErrors++;
   }catch(e){hardErrors++;steps.push({step:"exception",ok:false,state:null,code:"UNEXPECTED_PROCESSING_ERROR",emailsSent:0,airtableChanged:false});}
   processed.push({meetingRecordId:meeting.id,steps});
 }
 return{ok:hardErrors===0,status:hardErrors===0?200:207,state:hardErrors===0?"PRODUCTION_ORCHESTRATOR_COMPLETED":"PRODUCTION_ORCHESTRATOR_COMPLETED_WITH_REVIEW",active:true,runAt:now.toISOString(),thirdMeetingsFound:candidates.length,completedGroupsSkipped,eligibleMeetings:meetings.length,processedCount:processed.length,emailsSent,mutationSteps:mutations,hardErrors,processed,piiExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false};
}
