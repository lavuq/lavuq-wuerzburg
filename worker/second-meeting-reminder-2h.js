// LAVUQ Treffen 2 – sichere 2h-Erinnerungspruefung.
// Ausschliesslich Dry-Run: kein Mailversand, keine Airtable-Aenderung.
const BASE_ID="apphnIBhuAbmMTUtY";
const MEETINGS_TABLE="tblHoWMR2fkeLDkec";
const MEMBERS_TABLE="tbl4QX0NIB3tUKtF4";
const MEETING_GROUP_LINK="fld0Zpt6q0OO9RmTt";
const MEETING_ATTEMPT="fld1Wu66kB9akZVje";
const MEETING_STATUS="fldAZyz79cEpcGweE";
const MEETING_DATE="fldGIDne7S1fY997i";
const MEETING_PLACE="fld7gEEQzLn3RMxoq";
const MEETING_T2_RECIPIENT_IDS="fldJW0Oyip2OZjOlk";
const MEETING_REMINDER_24H="fldFeGgB1HmXRMzYk";
const MEETING_REMINDER_2H="fldY246Gg4hYuOIZO";
const MEETING_REMINDER_2H_LEDGER="fld0cL2Spo9c1thBC";
const MEMBER_GROUP="fldMUYzXykTpV0j2x";
const MEMBER_STATUS="fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS="fldUmjMa2j7MLG5RA";
function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function firstLink(v){if(!Array.isArray(v)||!v.length)return null;const x=v[0];return typeof x==="string"?x:x?.id||null;}
function linked(v,id){return Array.isArray(v)&&v.some(x=>(typeof x==="string"?x:x?.id)===id);}
function parseIds(v){return [...new Set(String(v||"").split(/\s+/).map(x=>x.trim()).filter(x=>/^rec[A-Za-z0-9]{14}$/.test(x)))];}
function parseLedger(raw){const map=new Map();for(const line of String(raw||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean)){const i=line.indexOf(":");if(i>0)map.set(line.slice(i+1),line.slice(0,i));}return map;}
async function getRecord(env,table,id){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}/${id}?returnFieldsByFieldId=true`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);return r.json();}
async function listTable(env,table){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}?${p}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable ${table} HTTP ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}
export async function handleSecondMeetingReminder2hDryRun(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const meetingRecordId=String(input.meetingRecordId||"").trim();const asOf=new Date(String(input.asOf||new Date().toISOString()));
 if(!/^rec[A-Za-z0-9]{14}$/.test(meetingRecordId))return{ok:false,status:400,code:"INVALID_MEETING_ID"};
 if(!Number.isFinite(asOf.getTime()))return{ok:false,status:400,code:"INVALID_AS_OF"};
 const meeting=await getRecord(env,MEETINGS_TABLE,meetingRecordId);const mf=meeting?.fields||{};
 const groupId=firstLink(mf[MEETING_GROUP_LINK]);const attempt=Number(mf[MEETING_ATTEMPT]||0);const statusName=text(mf[MEETING_STATUS]);
 const when=new Date(String(mf[MEETING_DATE]||""));const place=text(mf[MEETING_PLACE]);const recipientIds=parseIds(mf[MEETING_T2_RECIPIENT_IDS]);
 if(attempt!==2)return{ok:false,status:409,code:"NOT_SECOND_MEETING"};
 if(statusName!=="Bestätigt")return{ok:false,status:409,code:"SECOND_MEETING_NOT_CONFIRMED"};
 if(!groupId)return{ok:false,status:409,code:"GROUP_LINK_MISSING"};
 if(!Number.isFinite(when.getTime()))return{ok:false,status:422,code:"MEETING_DATETIME_INVALID"};
 if(place.length<4)return{ok:false,status:409,code:"MEETING_PLACE_MISSING"};
 if(recipientIds.length!==3)return{ok:false,status:409,code:"EXPECTED_EXACTLY_3_SECOND_MEETING_RECIPIENTS",recipientFilterCount:recipientIds.length};
 const msUntil=when.getTime()-asOf.getTime();const hoursUntil=Math.round((msUntil/3600000)*100)/100;const due=msUntil>=1.5*3600000&&msUntil<=2.5*3600000;
 const reminder24hActuallyCompleted=mf[MEETING_REMINDER_24H]===true;const reminder24hSimulated=input.simulate24hCompleted===true;const reminder24hEffectiveCompleted=reminder24hActuallyCompleted||reminder24hSimulated;
 const reminder2hAlreadyCompleted=mf[MEETING_REMINDER_2H]===true;
 const members=(await listTable(env,MEMBERS_TABLE)).filter(m=>linked(m?.fields?.[MEMBER_GROUP],groupId));
 const currentAccepted=members.filter(m=>text(m?.fields?.[MEMBER_STATUS])==="Aktiv"&&text(m?.fields?.[MEMBER_INVITE_STATUS])==="Angenommen");
 const currentIds=new Set(currentAccepted.map(m=>m.id));const validRecipientIds=recipientIds.filter(id=>currentIds.has(id));
 if(validRecipientIds.length!==3)return{ok:false,status:409,code:"SECOND_MEETING_RECIPIENT_FILTER_INVALID",validRecipientCount:validRecipientIds.length};
 const ledger=parseLedger(mf[MEETING_REMINDER_2H_LEDGER]);const ambiguous=validRecipientIds.filter(id=>ledger.get(id)==="sending");const alreadySent=validRecipientIds.filter(id=>ledger.get(id)==="sent");const pending=validRecipientIds.filter(id=>ledger.get(id)!=="sent");
 const ready=due&&reminder24hEffectiveCompleted&&!reminder2hAlreadyCompleted&&ambiguous.length===0&&pending.length>0;
 return{ok:true,status:200,state:ready?"READY_FOR_SECOND_MEETING_2H_REMINDER":"NOT_READY_FOR_SECOND_MEETING_2H_REMINDER",dryRun:true,readOnly:true,meetingAttempt:2,meetingConfirmed:true,hoursUntilMeeting:hoursUntil,reminderWindowMatched:due,reminder24hActuallyCompleted,reminder24hSimulated,reminder24hEffectiveCompleted,reminder2hAlreadyCompleted,recipientFilterCount:3,validRecipientCount:3,excludedCurrentAcceptedCount:Math.max(0,currentAccepted.length-3),alreadySentCount:alreadySent.length,pendingRecipientCount:pending.length,ambiguousRecipientCount:ambiguous.length,wouldSendEmails:ready?pending.length:0,excludedMembersWouldReceiveReminder:false,emailsSent:0,airtableChanged:false,duplicateSendPrevented:true,piiExposedInResponse:false,recipientIdsExposedInResponse:false};
}
