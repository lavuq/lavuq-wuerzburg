// LAVUQ Produktions-Orchestrator – zentraler produktiver Ablauf fuer Gruppen + Treffen 1-3.
import { handleAutomaticGroupAndInvitations } from "./auto-group-invitations.js";
import { handleControlledContactRelease } from "./contact-release.js";
import { handleFinalGroupNotification } from "./final-group-notification.js";
import { handleFirstMeetingProduction } from "./first-meeting-production.js";
import { handleSecondMeetingReminder24hDryRun } from "./second-meeting-reminder-24h.js";
import { handleSecondMeetingReminder2hDryRun } from "./second-meeting-reminder-2h.js";
import { handleSecondMeetingProductionFeedback } from "./second-meeting-production-feedback.js";
import { handleThirdMeetingReminder24h } from "./third-meeting-reminder-24h.js";
import { handleThirdMeetingReminder2h } from "./third-meeting-reminder-2h.js";
import { handleThirdMeetingFeedbackCheckin } from "./third-meeting-feedback-checkin.js";
import { handleThirdMeetingFeedbackMailControlledOne } from "./third-meeting-feedback-mail.js";
import { handleThirdMeetingCloseout } from "./third-meeting-closeout.js";
import { handleSecondMeetingPrepare } from "./second-meeting-prepare.js";
import { handleThirdMeetingPrepare } from "./third-meeting-prepare.js";

const BASE_ID="apphnIBhuAbmMTUtY", MEETINGS="tblHoWMR2fkeLDkec", GROUPS="tblF8peAAJGjwfKab";
const F={attempt:"fld1Wu66kB9akZVje",status:"fldAZyz79cEpcGweE",group:"fld0Zpt6q0OO9RmTt",groupStatus:"fldpizdbKv9LGxMDa"};
function h(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
function t(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function first(v){if(!Array.isArray(v)||!v.length)return null;const x=v[0];return typeof x==="string"?x:x?.id||null;}
async function list(env,table){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}?${p}`,{headers:h(env)});if(!r.ok)throw new Error(`${table} ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}
async function get(env,table,id){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}/${id}?returnFieldsByFieldId=true`,{headers:h(env)});if(!r.ok)throw new Error(`${table} ${r.status}`);return r.json();}
function safe(step,r){return{step,ok:r?.ok!==false,state:r?.state||null,code:r?.code||null,emailsSent:Number(r?.emailsSent||0),airtableChanged:r?.airtableChanged===true||r?.changed===true};}
function benign(code){return new Set(["FIRST_MEETING_FEEDBACK_NOT_DUE","SECOND_MEETING_FEEDBACK_NOT_DUE","SECOND_MEETING_24H_NOT_DUE","SECOND_MEETING_24H_ALREADY_COMPLETED","SECOND_MEETING_2H_NOT_DUE","SECOND_MEETING_2H_ALREADY_COMPLETED","SECOND_MEETING_2H_WAITING_FOR_24H","THIRD_MEETING_24H_NOT_DUE","THIRD_MEETING_24H_ALREADY_COMPLETED","THIRD_MEETING_2H_NOT_DUE","THIRD_MEETING_2H_ALREADY_COMPLETED","THIRD_MEETING_2H_WAITING_FOR_24H","THIRD_MEETING_FEEDBACK_NOT_READY","MEETING_NOT_YET_OCCURRED","NOT_ALL_THREE_FEEDBACKS_SUBMITTED","MANUAL_SAFETY_REVIEW_REQUIRED","NOT_ALL_CONTINUE","NOT_EXACTLY_3_THIRD_MEETING_FEEDBACK_REQUESTS","FEEDBACK_LINK_NOT_ACTIVE","NOT_ALL_4_ACCEPTED","CONTACT_SHARING_CONSENT_MISSING","CONTACTS_NOT_RELEASED_FOR_ALL"]).has(code||"");}

export async function handleProductionOrchestrator(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 if(String(input.confirmation||"")!=="RUN_LAVUQ_PRODUCTION_ORCHESTRATOR")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED"};
 const now=new Date();let completedGroupsSkipped=0,emailsSent=0,mutationSteps=0,hardErrors=0;const processed=[];

 // Geeignete Gruppen werden automatisch angelegt, Einladungen freigegeben und an alle vier versendet.
 try{const auto=await handleAutomaticGroupAndInvitations(env);emailsSent+=Number(auto?.emailsSent||0);if(auto?.airtableChanged)mutationSteps++;if(auto?.ok===false)hardErrors++;processed.push({scope:"groupFinder",steps:[safe("automaticGroupAndInvitations",auto)]});}catch(e){hardErrors++;processed.push({scope:"groupFinder",steps:[{step:"automaticGroupAndInvitations",ok:false,code:"UNEXPECTED_PROCESSING_ERROR",emailsSent:0,airtableChanged:false}]});}

 const allMeetings=(await list(env,MEETINGS)).filter(m=>[1,2,3].includes(Number(m?.fields?.[F.attempt]||0))&&t(m?.fields?.[F.status])==="Bestätigt"), groups=await list(env,GROUPS);
 const groupMap=new Map(groups.map(g=>[g.id,g]));

 // Sobald alle vier angenommen UND der Kontaktweitergabe zugestimmt haben, werden Kontakte automatisch freigegeben.
 // Danach wird die Gruppen-/Kontaktnachricht automatisch versendet. Keine Admin-Freigabe notwendig.
 for(const g of groups){
   if(t(g?.fields?.[F.groupStatus])==="Abgeschlossen")continue;
   const steps=[];
   try{
     const cr=await handleControlledContactRelease(env,{groupId:g.id,dryRun:false,automatic:true,confirm:"AUTOMATIC_CONTACT_RELEASE_WITH_CONSENT"});
     steps.push(safe("automaticContactRelease",cr));
     if(cr?.changed===true)mutationSteps++;
     if(cr?.ok===false&&!benign(cr?.code))hardErrors++;

     const r=await handleFinalGroupNotification(env,{groupId:g.id,dryRun:false,confirmation:"ABSCHLUSSNACHRICHT_SENDEN"});
     steps.push(safe("finalGroupNotification",r));
     if(r?.ok===true){emailsSent+=Number(r.emailsSent||0);if(r.airtableChanged)mutationSteps++;}
     else if(!benign(r?.code))hardErrors++;
   }catch(e){hardErrors++;steps.push({step:"groupContactFlow",ok:false,code:"UNEXPECTED_PROCESSING_ERROR",emailsSent:0,airtableChanged:false});}
   processed.push({groupId:g.id,steps});
 }

 for(const meeting of allMeetings){const gid=first(meeting?.fields?.[F.group]);const g=gid?groupMap.get(gid):null;if(g&&t(g?.fields?.[F.groupStatus])==="Abgeschlossen"){completedGroupsSkipped++;continue;}const attempt=Number(meeting?.fields?.[F.attempt]||0),steps=[];try{
   if(attempt===1){const r=await handleFirstMeetingProduction(env,meeting,now);for(const s of r.steps||[])steps.push(safe("meeting1",s));emailsSent+=Number(r.emailsSent||0);if(r.airtableChanged)mutationSteps++;if(r.ok===false)hardErrors++;if(gid){const p=await handleSecondMeetingPrepare(env,{groupId:gid,firstMeetingRecordId:meeting.id,dryRun:true});steps.push(safe("prepareMeeting2",p));}}
   if(attempt===2){const r24=await handleSecondMeetingReminder24hDryRun(env,{meetingRecordId:meeting.id,mode:"automatic",confirmation:"AUTOMATIC_SECOND_MEETING_24H",asOf:now.toISOString()});steps.push(safe("meeting2Reminder24h",r24));emailsSent+=Number(r24.emailsSent||0);if(r24.airtableChanged)mutationSteps++;if(r24.ok===false&&!benign(r24.code))hardErrors++;const r2=await handleSecondMeetingReminder2hDryRun(env,{meetingRecordId:meeting.id,mode:"automatic",confirmation:"AUTOMATIC_SECOND_MEETING_2H",asOf:now.toISOString()});steps.push(safe("meeting2Reminder2h",r2));emailsSent+=Number(r2.emailsSent||0);if(r2.airtableChanged)mutationSteps++;if(r2.ok===false&&!benign(r2.code))hardErrors++;const fresh=await get(env,MEETINGS,meeting.id);const fb=await handleSecondMeetingProductionFeedback(env,fresh,now);steps.push(safe("meeting2Feedback",fb));emailsSent+=Number(fb.emailsSent||0);if(fb.airtableChanged)mutationSteps++;if(fb.ok===false&&!benign(fb.code))hardErrors++;if(gid){const p=await handleThirdMeetingPrepare(env,{groupId:gid,secondMeetingRecordId:meeting.id,dryRun:true});steps.push(safe("prepareMeeting3",p));}}
   if(attempt===3){const r24=await handleThirdMeetingReminder24h(env,{meetingRecordId:meeting.id,mode:"automatic",confirmation:"AUTOMATIC_THIRD_MEETING_24H",asOf:now.toISOString()});steps.push(safe("meeting3Reminder24h",r24));emailsSent+=Number(r24.emailsSent||0);if(r24.airtableChanged)mutationSteps++;if(r24.ok===false&&!benign(r24.code))hardErrors++;const r2=await handleThirdMeetingReminder2h(env,{meetingRecordId:meeting.id,mode:"automatic",confirmation:"AUTOMATIC_THIRD_MEETING_2H",asOf:now.toISOString()});steps.push(safe("meeting3Reminder2h",r2));emailsSent+=Number(r2.emailsSent||0);if(r2.airtableChanged)mutationSteps++;if(r2.ok===false&&!benign(r2.code))hardErrors++;const check=await handleThirdMeetingFeedbackCheckin(env,{meetingRecordId:meeting.id,controlledCreateAll:true,confirmation:"DREI_TREFFEN_3_FEEDBACK_ANFRAGEN_ANLEGEN",prepareAheadForScheduledMeeting:true,asOf:now.toISOString(),simulateRemindersCompleted:false});steps.push(safe("meeting3FeedbackPrepare",check));if(check.airtableChanged)mutationSteps++;if(check.ok===false&&!benign(check.code))hardErrors++;for(let i=0;i<3;i++){const fm=await handleThirdMeetingFeedbackMailControlledOne(env,{meetingRecordId:meeting.id,controlledOne:true,confirmation:"EINE_TREFFEN_3_FEEDBACK_MAIL_SENDEN"});steps.push(safe(`meeting3FeedbackMail${i+1}`,fm));emailsSent+=Number(fm.emailsSent||0);if(fm.airtableChanged)mutationSteps++;if(fm.ok===false){if(!benign(fm.code))hardErrors++;break;}if(Number(fm.emailsSent||0)===0)break;}const close=await handleThirdMeetingCloseout(env,{meetingRecordId:meeting.id,controlledExecute:true,confirmation:"TREFFEN_3_GRUPPE_ABSCHLIESSEN_UND_MAILS_SENDEN"});steps.push(safe("meeting3Closeout",close));emailsSent+=Number(close.emailsSent||0);if(close.airtableChanged)mutationSteps++;if(close.ok===false&&!benign(close.code))hardErrors++;}
 }catch(e){hardErrors++;steps.push({step:"exception",ok:false,code:"UNEXPECTED_PROCESSING_ERROR",emailsSent:0,airtableChanged:false});}processed.push({meetingRecordId:meeting.id,meetingAttempt:attempt,steps});}
 return{ok:hardErrors===0,status:hardErrors===0?200:207,state:hardErrors===0?"PRODUCTION_ORCHESTRATOR_COMPLETED":"PRODUCTION_ORCHESTRATOR_COMPLETED_WITH_REVIEW",active:true,automaticGroupReleaseAndInvitations:true,automaticContactReleaseWithConsent:true,runAt:now.toISOString(),confirmedMeetingsFound:allMeetings.length,completedGroupsSkipped,processedCount:processed.length,emailsSent,mutationSteps,hardErrors,manualGatesStillRequired:["Teilnehmer-Einwilligung zur Kontaktweitergabe","konkret mit der Gruppe abgestimmter Termin und Treffpunkt fuer Treffen 1/2/3"],adminGatesStillRequired:[],processed,piiExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false};
}
