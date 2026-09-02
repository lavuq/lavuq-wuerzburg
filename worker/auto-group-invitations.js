import { handleGroupProposalRelease } from "./group-proposal-release.js";
import { handleSingleInvitationSend } from "./single-invitation-send.js";

const BASE_ID="apphnIBhuAbmMTUtY";
const MEMBERS_TABLE="tbl4QX0NIB3tUKtF4";
const MEMBER_GROUP="fldMUYzXykTpV0j2x";
const MEMBER_STATUS="fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS="fldUmjMa2j7MLG5RA";
const MEMBER_INVITE_RELEASED="fldSGBeJO6GLQ27gi";
const MEMBER_CONTACT_SHARED="fld3LCPTEbAl46bF1";

function first(v){if(!Array.isArray(v)||!v.length)return null;const x=v[0];return typeof x==="string"?x:x?.id||null;}
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
async function listMembers(env){let out=[],offset="";do{const q=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)q.set("offset",offset);const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${MEMBERS_TABLE}?${q}`,{headers:headers(env)});if(!r.ok)throw new Error(`Airtable Mitglieder ${r.status}`);const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");}while(offset);return out;}
async function patchMembers(env,records){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${MEMBERS_TABLE}`,{method:"PATCH",headers:headers(env),body:JSON.stringify({records})});if(!r.ok)throw new Error(`Airtable Einladungsfreigabe ${r.status}`);return r.json();}

export async function handleAutomaticGroupAndInvitations(env){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const released=await handleGroupProposalRelease(env,{dryRun:false,confirmation:"GRUPPE_FREIGEBEN"});
 if(released?.ok===false&&released?.code==="NO_CURRENT_SUITABLE_PROPOSAL")return{ok:true,status:200,state:"NO_SUITABLE_GROUP_PROPOSAL",groupsCreated:0,emailsSent:0,airtableChanged:false};
 if(released?.ok===false)return released;
 const groupRecordId=String(released.groupRecordId||"");
 if(!/^rec[A-Za-z0-9]{14}$/.test(groupRecordId))return{ok:false,status:409,code:"GROUP_RECORD_ID_MISSING_AFTER_RELEASE"};
 const members=(await listMembers(env)).filter(m=>first(m?.fields?.[MEMBER_GROUP])===groupRecordId);
 if(members.length!==4)return{ok:false,status:409,code:"GROUP_MUST_HAVE_EXACTLY_FOUR_MEMBERS",memberCount:members.length};
 const releasable=members.filter(m=>text(m?.fields?.[MEMBER_STATUS])==="Vorgeschlagen"&&text(m?.fields?.[MEMBER_INVITE_STATUS])==="Nicht versendet"&&m?.fields?.[MEMBER_CONTACT_SHARED]!==true);
 if(releasable.length!==4)return{ok:false,status:409,code:"MEMBERS_NOT_READY_FOR_AUTOMATIC_INVITATIONS",readyCount:releasable.length};
 const needsRelease=releasable.filter(m=>m?.fields?.[MEMBER_INVITE_RELEASED]!==true);
 if(needsRelease.length){await patchMembers(env,needsRelease.map(m=>({id:m.id,fields:{[MEMBER_INVITE_RELEASED]:true}})));}
 let emailsSent=0;
 for(const m of releasable){const r=await handleSingleInvitationSend(env,{memberId:m.id,confirmation:"EINE_TESTEINLADUNG_SENDEN"});if(r?.ok===false&&r?.code!=="INVITATION_ALREADY_PROCESSED")return{ok:false,status:r?.status||500,code:r?.code||"INVITATION_SEND_FAILED",emailsSent,airtableChanged:true};if(r?.emailSent===true)emailsSent++;}
 return{ok:true,status:200,state:"GROUP_CREATED_AND_INVITATIONS_SENT",groupRecordId,groupsCreated:released.state==="GROUP_MANUALLY_RELEASED"?1:0,membershipsCreated:Number(released.membershipsCreated||0),inviteReleaseSet:4,emailsSent,contactsReleased:false,airtableChanged:true,duplicateSendPrevented:true,piiExposedInResponse:false,tokenExposedInResponse:false};
}
