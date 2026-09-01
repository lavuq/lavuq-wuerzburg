// LAVUQ Treffen 2 Kommunikations-Dry-Run.
// Prueft ausschließlich, welche Gruppenmitglieder Terminmail sowie 24h-/2h-Erinnerung erhalten wuerden.
const BASE_ID="apphnIBhuAbmMTUtY";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";
const MEMBERS_TABLE="tbl4QX0NIB3tUKtF4";
const MEETING_GROUP_LINK="fld0Zpt6q0OO9RmTt";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_STATUS="fldAZyz79cEpcGweE";
const MEETING_T2_RECIPIENT_IDS="fldJW0Oyip2OZjOlk";
const MEMBER_GROUP="fldMUYzXykTpV0j2x";
const MEMBER_STATUS="fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS="fldUmjMa2j7MLG5RA";

function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function linked(v,recordId){return Array.isArray(v)&&v.some(x=>(typeof x==="string"?x:x?.id)===recordId);}
function parseIds(v){return [...new Set(String(v||"").split(/\s+/).map(x=>x.trim()).filter(x=>/^rec[A-Za-z0-9]{14}$/.test(x)))];}
async function getRecord(env,table,id){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}/${id}?returnFieldsByFieldId=true`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);return r.json();}
async function listTable(env,table){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}?${p}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}

export async function handleSecondMeetingCommunicationDryRun(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const meetingRecordId=String(input.meetingRecordId||"").trim();
 if(!/^rec[A-Za-z0-9]{14}$/.test(meetingRecordId))return{ok:false,status:400,code:"INVALID_MEETING_ID"};
 const meeting=await getRecord(env,MEETINGS_TABLE,meetingRecordId);
 const mf=meeting?.fields||{};
 const groupId=Array.isArray(mf[MEETING_GROUP_LINK])?(typeof mf[MEETING_GROUP_LINK][0]==="string"?mf[MEETING_GROUP_LINK][0]:mf[MEETING_GROUP_LINK][0]?.id):"";
 const attempt=Number(mf[MEETING_ATTEMPT]||0);
 const statusName=text(mf[MEETING_STATUS]);
 const recipientIds=parseIds(mf[MEETING_T2_RECIPIENT_IDS]);
 if(attempt!==2)return{ok:false,status:409,code:"NOT_SECOND_MEETING"};
 if(!/^rec[A-Za-z0-9]{14}$/.test(groupId))return{ok:false,status:409,code:"GROUP_LINK_MISSING"};
 if(!recipientIds.length)return{ok:false,status:409,code:"SECOND_MEETING_RECIPIENT_FILTER_MISSING"};

 const memberships=(await listTable(env,MEMBERS_TABLE)).filter(r=>linked(r?.fields?.[MEMBER_GROUP],groupId));
 const currentAccepted=memberships.filter(r=>text(r?.fields?.[MEMBER_STATUS])==="Aktiv"&&text(r?.fields?.[MEMBER_INVITE_STATUS])==="Angenommen");
 const currentIds=new Set(currentAccepted.map(r=>r.id));
 const validRecipientIds=recipientIds.filter(id=>currentIds.has(id));
 const invalidRecipientCount=recipientIds.length-validRecipientIds.length;
 const excludedCurrentAcceptedCount=Math.max(0,currentAccepted.length-validRecipientIds.length);
 const filterSafe=invalidRecipientCount===0&&validRecipientIds.length===recipientIds.length;
 return{
  ok:true,status:200,state:filterSafe?"SECOND_MEETING_COMMUNICATION_READY":"SECOND_MEETING_RECIPIENT_FILTER_INVALID",
  dryRun:true,readOnly:true,meetingAttempt:2,meetingStatus:statusName,
  currentAcceptedMemberCount:currentAccepted.length,
  recipientFilterCount:recipientIds.length,
  validRecipientCount:validRecipientIds.length,
  excludedCurrentAcceptedCount,
  invalidRecipientCount,
  wouldSendMeetingAnnouncementTo:validRecipientIds.length,
  wouldSend24hReminderTo:validRecipientIds.length,
  wouldSend2hReminderTo:validRecipientIds.length,
  excludedMembersWouldReceiveMeetingCommunication:false,
  emailsSent:0,airtableChanged:false,piiExposedInResponse:false,recipientIdsExposedInResponse:false
 };
}
