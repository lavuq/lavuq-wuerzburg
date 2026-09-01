// LAVUQ – Treffen 2: sichere Vorbereitung nach 4 Feedbacks.
// Regel: Unsicher darf weitermachen. 0-1x Nein => Gruppe bleibt bestehen.
// Ab 2x Nein => Gruppe nicht fortsetzen; zwei neue Teilnehmer erforderlich.
const BASE_ID="apphnIBhuAbmMTUtY";
const GROUPS_TABLE="tblF8peAAJGjwfKab";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";
const FEEDBACK_TABLE="tblLyjFTdr1MziUgj";
const GROUP_PRIMARY="fldCb3rBz4kTWzQLx";
const MEETING_ID="fldvZ9GprKKdePE3p";
const MEETING_GROUP_TEXT="fldqZmig5i2kihEgg";
const MEETING_DATE="fldGIDne7S1fY997i";
const MEETING_PLACE="fld7gEEQzLn3RMxoq";
const MEETING_AGREED="flddvVn0fyhznL454";
const MEETING_STATUS="fldAZyz79cEpcGweE";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_GROUP_LINK="fld0Zpt6q0OO9RmTt";
const FEEDBACK_MEETING="fldaykTvzKmCqn9MO";
const FEEDBACK_SUBMITTED_AT="fld5uezt0LJJdtd29";
const FEEDBACK_CONTINUE="fldudL6OgGjs2mkMm";

function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function linked(v,recordId){return Array.isArray(v)&&v.some(x=>(typeof x==="string"?x:x?.id)===recordId);}
function future(v){const d=new Date(v);return Number.isFinite(d.getTime())&&d.getTime()>Date.now();}
async function listTable(env,table){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}?${p}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}
async function getGroup(env,id){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${GROUPS_TABLE}/${id}?returnFieldsByFieldId=true`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable Gruppe HTTP ${r.status}`);return r.json();}
async function createMeeting(env,fields){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${MEETINGS_TABLE}`,{method:"POST",headers:headers(env),body:JSON.stringify({fields})});const raw=await r.text();let data={};try{data=raw?JSON.parse(raw):{};}catch{}if(!r.ok)throw new Error(`Airtable Treffen 2 POST HTTP ${r.status}`);return data;}
function meetingCode(){const d=new Date();const p=n=>String(n).padStart(2,"0");return `LAVUQ-T2-${d.getUTCFullYear()}${p(d.getUTCMonth()+1)}${p(d.getUTCDate())}-${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;}

export async function handleSecondMeetingPrepare(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const groupId=String(input.groupId||"").trim();
 const firstMeetingRecordId=String(input.firstMeetingRecordId||"").trim();
 const dryRun=input.dryRun!==false;
 if(!/^rec[A-Za-z0-9]{14}$/.test(groupId))return{ok:false,status:400,code:"INVALID_GROUP_ID"};
 if(!/^rec[A-Za-z0-9]{14}$/.test(firstMeetingRecordId))return{ok:false,status:400,code:"INVALID_FIRST_MEETING_ID"};

 const feedback=await listTable(env,FEEDBACK_TABLE);
 const rows=feedback.filter(r=>linked(r?.fields?.[FEEDBACK_MEETING],firstMeetingRecordId));
 const submitted=rows.filter(r=>Boolean(r?.fields?.[FEEDBACK_SUBMITTED_AT]));
 const feedbackRequestCount=rows.length;
 const submittedCount=submitted.length;
 if(feedbackRequestCount!==4||submittedCount!==4)return{ok:true,status:200,state:"WAIT_FOR_ALL_FIRST_MEETING_FEEDBACKS",dryRun:true,readOnly:true,feedbackRequestCount,submittedCount,wouldPrepareSecondMeeting:false,wouldCreateSecondMeeting:false,airtableChanged:false,emailsSent:0,piiExposedInResponse:false};

 const noCount=submitted.filter(r=>text(r?.fields?.[FEEDBACK_CONTINUE])==="Nein").length;
 const unsureCount=submitted.filter(r=>text(r?.fields?.[FEEDBACK_CONTINUE])==="Unsicher").length;
 const yesCount=submitted.filter(r=>text(r?.fields?.[FEEDBACK_CONTINUE])==="Ja").length;
 if(noCount>=2)return{ok:true,status:200,state:"CLOSE_GROUP_AND_REPLACE_TWO_PARTICIPANTS",dryRun:true,readOnly:true,feedbackRequestCount:4,submittedCount:4,yesCount,unsureCount,noCount,groupContinues:false,replacementParticipantsNeeded:2,wouldPrepareSecondMeeting:false,wouldCreateSecondMeeting:false,airtableChanged:false,emailsSent:0,piiExposedInResponse:false};

 const meetings=await listTable(env,MEETINGS_TABLE);
 const secondMeetings=meetings.filter(m=>linked(m?.fields?.[MEETING_GROUP_LINK],groupId)&&Number(m?.fields?.[MEETING_ATTEMPT]||0)===2&&!["Abgesagt","Nicht stattgefunden"].includes(text(m?.fields?.[MEETING_STATUS])));
 if(secondMeetings.length>0)return{ok:true,status:200,state:"SECOND_MEETING_ALREADY_EXISTS",dryRun,feedbackRequestCount:4,submittedCount:4,yesCount,unsureCount,noCount,groupContinues:true,existingSecondMeetingCount:secondMeetings.length,wouldPrepareSecondMeeting:false,wouldCreateSecondMeeting:false,airtableChanged:false,emailsSent:0,piiExposedInResponse:false};

 if(dryRun)return{ok:true,status:200,state:"READY_TO_PREPARE_SECOND_MEETING",dryRun:true,readOnly:true,feedbackRequestCount:4,submittedCount:4,yesCount,unsureCount,noCount,groupContinues:true,replacementParticipantsNeeded:0,wouldPrepareSecondMeeting:true,wouldCreateSecondMeeting:false,requiresDatePlaceAndGroupAgreement:true,airtableChanged:false,emailsSent:0,piiExposedInResponse:false};

 const dateTime=String(input.dateTime||"").trim();
 const place=String(input.place||"").trim();
 if(String(input.confirmation||"")!=="ZWEITES_TREFFEN_ANLEGEN")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED"};
 if(!future(dateTime))return{ok:false,status:400,code:"INVALID_OR_PAST_DATETIME"};
 if(place.length<4)return{ok:false,status:400,code:"MEETING_PLACE_REQUIRED"};
 if(input.publicPlaceConfirmed!==true)return{ok:false,status:409,code:"PUBLIC_PLACE_CONFIRMATION_REQUIRED"};
 if(input.groupAgreed!==true)return{ok:false,status:409,code:"GROUP_AGREEMENT_REQUIRED"};

 const g=await getGroup(env,groupId);const groupCode=text(g?.fields?.[GROUP_PRIMARY])||groupId;
 const created=await createMeeting(env,{[MEETING_ID]:meetingCode(),[MEETING_GROUP_TEXT]:groupCode,[MEETING_DATE]:dateTime,[MEETING_PLACE]:place,[MEETING_AGREED]:true,[MEETING_STATUS]:"Bestätigt",[MEETING_ATTEMPT]:2,[MEETING_GROUP_LINK]:[groupId]});
 return{ok:true,status:200,state:"SECOND_MEETING_CREATED",dryRun:false,groupContinues:true,yesCount,unsureCount,noCount,meetingRecordId:String(created?.id||""),meetingAttempt:2,statusName:"Bestätigt",emailsSent:0,airtableChanged:true,piiExposedInResponse:false};
}
