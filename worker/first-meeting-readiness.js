// LAVUQ – Read-only Bereitschaftspruefung fuer das erste Gruppentreffen.
// Diese Funktion veraendert keine Airtable-Daten und versendet keine E-Mails.
const BASE_ID="apphnIBhuAbmMTUtY";
const MEMBERS_TABLE="tbl4QX0NIB3tUKtF4";
const MEMBER_GROUP="fldMUYzXykTpV0j2x";
const MEMBER_STATUS="fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS="fldUmjMa2j7MLG5RA";
const MEMBER_CONTACT_SHARED="fld3LCPTEbAl46bF1";
const MEMBER_FINAL_SENT="fldxnDtu0NRJRHaUp";
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
async function listMembers(env){let out=[],offset="";do{const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)p.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${MEMBERS_TABLE}?${p}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable Mitglieder HTTP ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}
function groupLinked(m,groupId){const g=m?.fields?.[MEMBER_GROUP];return Array.isArray(g)&&g.some(x=>(typeof x==="string"?x:x?.id)===groupId);}
function currentAccepted(m){return text(m?.fields?.[MEMBER_STATUS])==="Aktiv"&&text(m?.fields?.[MEMBER_INVITE_STATUS])==="Angenommen";}
export async function buildFirstMeetingReadiness(env,groupId){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 groupId=String(groupId||"").trim();
 if(!/^rec[A-Za-z0-9]{14}$/.test(groupId))return{ok:false,status:400,code:"INVALID_GROUP_ID"};
 const all=await listMembers(env);const groupMembers=all.filter(m=>groupLinked(m,groupId));const accepted=groupMembers.filter(currentAccepted);
 const contactsReleased=accepted.filter(m=>m?.fields?.[MEMBER_CONTACT_SHARED]===true).length;
 const finalSent=accepted.filter(m=>m?.fields?.[MEMBER_FINAL_SENT]===true).length;
 const checks={exactlyFourAcceptedActive:accepted.length===4,contactsReleasedForAll:accepted.length===4&&contactsReleased===4,finalGroupNotificationSentForAll:accepted.length===4&&finalSent===4};
 const ready=Object.values(checks).every(Boolean);
 return{ok:true,status:200,state:ready?"READY_FOR_FIRST_MEETING":"NOT_READY_FOR_FIRST_MEETING",dryRun:true,readOnly:true,groupId,groupMemberCount:groupMembers.length,acceptedActiveCount:accepted.length,contactsReleasedCount:contactsReleased,finalNotificationSentCount:finalSent,checks,wouldCreateMeeting:false,wouldSendEmails:false,airtableChanged:false,piiExposedInResponse:false};
}
