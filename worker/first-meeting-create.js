// LAVUQ – kontrolliertes Anlegen von Treffen 1.
// Standard ist Dry-Run. Echte Anlage nur mit dryRun=false + expliziter Bestaetigung.
const BASE_ID="apphnIBhuAbmMTUtY";
const MEMBERS_TABLE="tbl4QX0NIB3tUKtF4";
const GROUPS_TABLE="tblF8peAAJGjwfKab";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";
const MEMBER_GROUP="fldMUYzXykTpV0j2x";
const MEMBER_STATUS="fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS="fldUmjMa2j7MLG5RA";
const MEMBER_CONTACT_SHARED="fld3LCPTEbAl46bF1";
const MEMBER_FINAL_SENT="fldxnDtu0NRJRHaUp";
const GROUP_PRIMARY="fldCb3rBz4kTWzQLx";
const MEETING_ID="fldvZ9GprKKdePE3p";
const MEETING_GROUP_TEXT="fldqZmig5i2kihEgg";
const MEETING_DATE="fldGIDne7S1fY997i";
const MEETING_PLACE="fld7gEEQzLn3RMxoq";
const MEETING_AGREED="flddvVn0fyhznL454";
const MEETING_STATUS="fldAZyz79cEpcGweE";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_GROUP_LINK="fld0Zpt6q0OO9RmTt";
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
async function listTable(env,table){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}?${p}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}
async function getGroup(env,id){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${GROUPS_TABLE}/${id}?returnFieldsByFieldId=true`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable Gruppe HTTP ${r.status}`);return r.json();}
async function createMeeting(env,fields){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${MEETINGS_TABLE}`,{method:"POST",headers:headers(env),body:JSON.stringify({fields})});if(!r.ok)throw new Error(`Airtable Termin POST HTTP ${r.status}`);return r.json();}
function groupLinked(m,groupId){const g=m?.fields?.[MEMBER_GROUP];return Array.isArray(g)&&g.some(x=>(typeof x==="string"?x:x?.id)===groupId);}
function currentAccepted(m){return text(m?.fields?.[MEMBER_STATUS])==="Aktiv"&&text(m?.fields?.[MEMBER_INVITE_STATUS])==="Angenommen";}
function meetingLinked(m,groupId){const g=m?.fields?.[MEETING_GROUP_LINK];return Array.isArray(g)&&g.some(x=>(typeof x==="string"?x:x?.id)===groupId);}
function isoFuture(v){const d=new Date(v);return Number.isFinite(d.getTime())&&d.getTime()>Date.now();}
function meetingCode(){const d=new Date();const p=n=>String(n).padStart(2,"0");return `LAVUQ-T1-${d.getUTCFullYear()}${p(d.getUTCMonth()+1)}${p(d.getUTCDate())}-${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;}
export async function handleFirstMeetingCreate(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const groupId=String(input.groupId||"").trim();const dryRun=input.dryRun!==false;const dateTime=String(input.dateTime||"").trim();const place=String(input.place||"").trim();
 if(!/^rec[A-Za-z0-9]{14}$/.test(groupId))return{ok:false,status:400,code:"INVALID_GROUP_ID"};
 if(!isoFuture(dateTime))return{ok:false,status:400,code:"INVALID_OR_PAST_DATETIME"};
 if(place.length<4)return{ok:false,status:400,code:"MEETING_PLACE_REQUIRED"};
 if(input.publicPlaceConfirmed!==true)return{ok:false,status:409,code:"PUBLIC_PLACE_CONFIRMATION_REQUIRED"};
 if(input.groupAgreed!==true)return{ok:false,status:409,code:"GROUP_AGREEMENT_REQUIRED"};
 const members=await listTable(env,MEMBERS_TABLE);const accepted=members.filter(m=>groupLinked(m,groupId)&&currentAccepted(m));
 if(accepted.length!==4)return{ok:false,status:409,code:"NOT_ALL_4_ACCEPTED",acceptedActiveCount:accepted.length};
 if(accepted.some(m=>m?.fields?.[MEMBER_CONTACT_SHARED]!==true))return{ok:false,status:409,code:"CONTACTS_NOT_RELEASED_FOR_ALL"};
 if(accepted.some(m=>m?.fields?.[MEMBER_FINAL_SENT]!==true))return{ok:false,status:409,code:"FINAL_NOTIFICATION_NOT_SENT_FOR_ALL"};
 const meetings=await listTable(env,MEETINGS_TABLE);const duplicates=meetings.filter(m=>meetingLinked(m,groupId)&&Number(m?.fields?.[MEETING_ATTEMPT]||0)===1&&!["Abgesagt","Nicht stattgefunden"].includes(text(m?.fields?.[MEETING_STATUS])));
 if(duplicates.length>0)return{ok:false,status:409,code:"FIRST_MEETING_ALREADY_EXISTS",existingActiveMeetingCount:duplicates.length};
 const g=await getGroup(env,groupId);const groupCode=text(g?.fields?.[GROUP_PRIMARY])||groupId;
 if(dryRun)return{ok:true,status:200,state:"READY_TO_CREATE_FIRST_MEETING",dryRun:true,groupId,acceptedActiveCount:4,contactsReleasedForAll:true,finalNotificationSentForAll:true,publicPlaceConfirmed:true,groupAgreed:true,dateTimeValid:true,wouldCreateMeeting:true,wouldSendEmails:false,airtableChanged:false,piiExposedInResponse:false};
 if(String(input.confirmation||"")!=="ERSTES_TREFFEN_ANLEGEN")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED"};
 const created=await createMeeting(env,{[MEETING_ID]:meetingCode(),[MEETING_GROUP_TEXT]:groupCode,[MEETING_DATE]:dateTime,[MEETING_PLACE]:place,[MEETING_AGREED]:true,[MEETING_STATUS]:"Bestätigt",[MEETING_ATTEMPT]:1,[MEETING_GROUP_LINK]:[groupId]});
 return{ok:true,status:200,state:"FIRST_MEETING_CREATED",dryRun:false,groupId,meetingRecordId:created.id,meetingAttempt:1,statusName:"Bestätigt",emailsSent:0,airtableChanged:true,piiExposedInResponse:false};
}
