const BASE_ID = "apphnIBhuAbmMTUtY";
const GROUPS_TABLE = "tblF8peAAJGjwfKab";
const MEMBERS_TABLE = "tbl4QX0NIB3tUKtF4";
const APPLICANTS_TABLE = "tblzLtbR5Yh4nR5aQ";

const GROUP_ID = "fldCb3rBz4kTWzQLx";
const GROUP_RELEASED = "fldgALGaOoeJGd6yg";
const MEMBER_GROUP = "fldMUYzXykTpV0j2x";
const MEMBER_APPLICANT = "fldcV8kd6KF7zdScE";
const MEMBER_STATUS = "fldBS2hoKQX0Rr1aX";
const MEMBER_CONTACT_SHARED = "fld3LCPTEbAl46bF1";
const MEMBER_INVITE_STATUS = "fldUmjMa2j7MLG5RA";
const MEMBER_INVITE_RELEASED = "fldSGBeJO6GLQ27gi";
const APPLICANT_FIRST_NAME = "fldPPnyiAKpIXnawY";
const APPLICANT_EMAIL = "flduioUSJQ7BlM85W";

function text(v){
  if(v==null)return "";
  if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();
  return String(v).trim();
}
function linkedIds(v){return Array.isArray(v)?v.map(x=>typeof x==="string"?x:x?.id).filter(Boolean):[];}
async function airtable(env,tableId,path=""){
  const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}${path}`,{headers:{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`}});
  if(!r.ok)throw new Error(`Airtable HTTP ${r.status}`);
  return r.json();
}
async function allRecords(env,tableId,fieldIds=[]){
  const out=[];let offset=null;
  do{
    const q=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});
    for(const f of fieldIds)q.append("fields[]",f);
    if(offset)q.set("offset",offset);
    const page=await airtable(env,tableId,`?${q.toString()}`);
    out.push(...(page.records||[]));offset=page.offset||null;
  }while(offset);
  return out;
}
function makeSecurePreviewToken(){
  const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);
  return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
}
export async function handleInvitationPreparation(env,input={}){
  if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
  const groupId=String(input?.groupId||"").trim();
  if(!groupId)return{ok:false,status:400,code:"GROUP_ID_REQUIRED"};

  const groups=await allRecords(env,GROUPS_TABLE,[GROUP_ID,GROUP_RELEASED]);
  const group=groups.find(r=>text(r?.fields?.[GROUP_ID])===groupId);
  if(!group)return{ok:false,status:404,code:"GROUP_NOT_FOUND"};
  if(group?.fields?.[GROUP_RELEASED]!==true)return{ok:false,status:409,code:"GROUP_NOT_RELEASED"};

  const members=await allRecords(env,MEMBERS_TABLE,[MEMBER_GROUP,MEMBER_APPLICANT,MEMBER_STATUS,MEMBER_CONTACT_SHARED,MEMBER_INVITE_STATUS,MEMBER_INVITE_RELEASED]);
  const groupMembers=members.filter(r=>linkedIds(r?.fields?.[MEMBER_GROUP]).includes(group.id));
  if(groupMembers.length!==4)return{ok:false,status:409,code:"GROUP_MUST_HAVE_EXACTLY_FOUR_MEMBERS",memberCount:groupMembers.length};

  for(const m of groupMembers){
    if(text(m?.fields?.[MEMBER_STATUS])!=="Vorgeschlagen")return{ok:false,status:409,code:"MEMBER_NOT_PROPOSED",memberId:m.id};
    if(text(m?.fields?.[MEMBER_INVITE_STATUS])!=="Nicht versendet")return{ok:false,status:409,code:"INVITATION_ALREADY_PROCESSED",memberId:m.id};
    if(m?.fields?.[MEMBER_INVITE_RELEASED]!==true)return{ok:false,status:409,code:"INVITATION_NOT_RELEASED",memberId:m.id};
    if(m?.fields?.[MEMBER_CONTACT_SHARED]===true)return{ok:false,status:409,code:"CONTACT_ALREADY_SHARED",memberId:m.id};
  }

  const applicantIds=groupMembers.flatMap(m=>linkedIds(m?.fields?.[MEMBER_APPLICANT]));
  const applicants=await allRecords(env,APPLICANTS_TABLE,[APPLICANT_FIRST_NAME,APPLICANT_EMAIL]);
  const byId=new Map(applicants.map(a=>[a.id,a]));
  const prepared=[];
  for(const id of applicantIds){
    const a=byId.get(id);const email=text(a?.fields?.[APPLICANT_EMAIL]);
    if(!a||!email||!email.includes("@"))return{ok:false,status:409,code:"APPLICANT_EMAIL_MISSING",applicantId:id};
    const token=makeSecurePreviewToken();
    prepared.push({applicantId:id,firstName:text(a?.fields?.[APPLICANT_FIRST_NAME]),recipientReady:true,secureTokenPrepared:token.length===64,tokenExposed:false,emailPrepared:true});
  }

  return{ok:true,status:200,state:"READY_FOR_INVITATION_SEND_TEST",dryRun:true,groupId,preparedInvitations:prepared.length,prepared,emailsSent:false,airtableChanged:false,contactsReleased:false,tokensPersisted:false};
}
