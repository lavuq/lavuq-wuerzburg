// LAVUQ – sicherer Read-only/Dry-Run fuer die 24h-Erinnerung vor einem Gruppentreffen.
// Versendet keine E-Mails und veraendert keine Airtable-Daten.
const BASE_ID="apphnIBhuAbmMTUtY";
const MEMBERS_TABLE="tbl4QX0NIB3tUKtF4";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";
const MEMBER_GROUP="fldMUYzXykTpV0j2x";
const MEMBER_STATUS="fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS="fldUmjMa2j7MLG5RA";
const MEMBER_CONTACT_SHARED="fld3LCPTEbAl46bF1";
const MEETING_DATE="fldGIDne7S1fY997i";
const MEETING_STATUS="fldAZyz79cEpcGweE";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_REMINDER_24H="fldFeGgB1HmXRMzYk";
const MEETING_GROUP_LINK="fld0Zpt6q0OO9RmTt";
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
async function listTable(env,table){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}?${p}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}
function linked(v,recordId){return Array.isArray(v)&&v.some(x=>(typeof x==="string"?x:x?.id)===recordId);}
function acceptedActive(m){return text(m?.fields?.[MEMBER_STATUS])==="Aktiv"&&text(m?.fields?.[MEMBER_INVITE_STATUS])==="Angenommen";}
function validDate(v){const d=new Date(v);return Number.isFinite(d.getTime())?d:null;}
export async function buildMeetingReminder24hDryRun(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const groupId=String(input.groupId||"").trim();
 if(!/^rec[A-Za-z0-9]{14}$/.test(groupId))return{ok:false,status:400,code:"INVALID_GROUP_ID"};
 const now=validDate(input.asOf||new Date().toISOString());if(!now)return{ok:false,status:400,code:"INVALID_AS_OF"};
 const meetings=await listTable(env,MEETINGS_TABLE);
 const candidates=meetings.filter(m=>linked(m?.fields?.[MEETING_GROUP_LINK],groupId)&&Number(m?.fields?.[MEETING_ATTEMPT]||0)===1&&text(m?.fields?.[MEETING_STATUS])==="Bestätigt");
 if(candidates.length!==1)return{ok:false,status:409,code:candidates.length===0?"NO_CONFIRMED_FIRST_MEETING":"MULTIPLE_CONFIRMED_FIRST_MEETINGS",meetingCount:candidates.length};
 const meeting=candidates[0];const when=validDate(meeting?.fields?.[MEETING_DATE]);if(!when)return{ok:false,status:422,code:"MEETING_DATETIME_INVALID"};
 const msUntil=when.getTime()-now.getTime();const hoursUntil=Math.round((msUntil/3600000)*100)/100;
 const reminderAlreadySent=meeting?.fields?.[MEETING_REMINDER_24H]===true;
 const due=msUntil>=23*3600000&&msUntil<=25*3600000;
 const members=await listTable(env,MEMBERS_TABLE);const recipients=members.filter(m=>linked(m?.fields?.[MEMBER_GROUP],groupId)&&acceptedActive(m)&&m?.fields?.[MEMBER_CONTACT_SHARED]===true);
 const exactlyFourEligibleRecipients=recipients.length===4;
 const ready=due&&!reminderAlreadySent&&exactlyFourEligibleRecipients;
 return{ok:true,status:200,state:ready?"READY_FOR_24H_REMINDER":"NOT_READY_FOR_24H_REMINDER",dryRun:true,readOnly:true,groupId,meetingRecordId:meeting.id,meetingAttempt:1,meetingConfirmed:true,hoursUntilMeeting:hoursUntil,reminderWindowMatched:due,reminderAlreadySent,eligibleRecipientCount:recipients.length,exactlyFourEligibleRecipients,wouldSendEmails:ready?4:0,wouldMarkReminderSent:false,airtableChanged:false,piiExposedInResponse:false};
}
