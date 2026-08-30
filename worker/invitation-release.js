const BASE_ID="apphnIBhuAbmMTUtY";
const GROUPS_TABLE="tblF8peAAJGjwfKab";
const MEMBERS_TABLE="tbl4QX0NIB3tUKtF4";
const GROUP_RELEASED="fldgALGaOoeJGd6yg";
const MEMBER_GROUP="fldMUYzXykTpV0j2x";
const MEMBER_STATUS="fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS="fldUmjMa2j7MLG5RA";
const MEMBER_INVITE_RELEASED="fldSGBeJO6GLQ27gi";
const MEMBER_CONTACT_SHARED="fld3LCPTEbAl46bF1";

function firstLink(v){return Array.isArray(v)&&v.length?v[0]:null;}
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name);return String(v);}
async function req(env,table,path=""){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table}${path}`,{headers:{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"}});if(!r.ok)throw new Error(`Airtable HTTP ${r.status}`);return r.json();}
async function listAll(env,table){const out=[];let offset=null;do{const q=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)q.set("offset",offset);const p=await req(env,table,`?${q}`);out.push(...(p.records||[]));offset=p.offset||null;}while(offset);return out;}
export async function handleInvitationRelease(env,input={}){
  const dryRun=input?.dryRun!==false;
  const groupRecordId=String(input?.groupRecordId||"");
  if(!/^rec[A-Za-z0-9]{14}$/.test(groupRecordId))return{ok:false,status:400,code:"INVALID_GROUP_RECORD_ID"};
  const group=await req(env,GROUPS_TABLE,`/${groupRecordId}?returnFieldsByFieldId=true`);
  if(group?.fields?.[GROUP_RELEASED]!==true)return{ok:false,status:409,code:"GROUP_NOT_RELEASED"};
  const all=await listAll(env,MEMBERS_TABLE);
  const members=all.filter(m=>firstLink(m?.fields?.[MEMBER_GROUP])===groupRecordId);
  if(members.length!==4)return{ok:false,status:409,code:"GROUP_MUST_HAVE_EXACTLY_FOUR_MEMBERS",memberCount:members.length};
  const invalid=members.filter(m=>text(m?.fields?.[MEMBER_STATUS])!=="Vorgeschlagen"||text(m?.fields?.[MEMBER_INVITE_STATUS])!=="Nicht versendet"||m?.fields?.[MEMBER_INVITE_RELEASED]===true||m?.fields?.[MEMBER_CONTACT_SHARED]===true);
  if(invalid.length)return{ok:false,status:409,code:"MEMBERS_NOT_READY_FOR_INVITE_RELEASE",invalidMembers:invalid.map(m=>m.id)};
  return{ok:true,status:200,state:"READY_FOR_MANUAL_INVITATION_RELEASE",dryRun,wouldReleaseInvitations:4,emailsSent:false,contactsReleased:false,airtableChanged:false,memberIds:members.map(m=>m.id)};
}
