// LAVUQ – kontrollierte manuelle Ersatzfreigabe
// Erst Dry-Run, dann nur mit expliziter Bestätigung. Keine Einladung, keine Kontaktfreigabe.
import { buildReplacementPreview } from "./replacement-preview.js";

const BASE_ID = "apphnIBhuAbmMTUtY";
const MEMBERS_TABLE = "tbl4QX0NIB3tUKtF4";
const MEMBER_ID = "fldM9T8hoUTJAH8v1";
const MEMBER_GROUP = "fldMUYzXykTpV0j2x";
const MEMBER_APPLICANT = "fldcV8kd6KF7zdScE";
const MEMBER_STATUS = "fldBS2hoKQX0Rr1aX";
const MEMBER_CONTACT_SHARED = "fld3LCPTEbAl46bF1";
const MEMBER_INVITE_STATUS = "fldUmjMa2j7MLG5RA";
const MEMBER_INVITE_RELEASED = "fldSGBeJO6GLQ27gi";
const MEMBER_NOTE = "fldxLd6P8cWTVc6Uv";

async function airtable(env, options={}) {
  const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${MEMBERS_TABLE}${options.path||""}`, {
    method: options.method||"GET",
    headers:{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"},
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if(!response.ok){let detail="";try{const b=await response.json();detail=b?.error?.type||b?.error?.message||JSON.stringify(b);}catch(_){}throw new Error(detail||`Airtable HTTP ${response.status}`);}
  return response.status===204?null:response.json();
}
function firstLink(v){if(!Array.isArray(v)||!v.length)return null;const x=v[0];return typeof x==="string"?x:x?.id||null;}
async function findExistingReplacement(env, groupRecordId, applicantId){let offset=null;do{const q=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});if(offset)q.set("offset",offset);const page=await airtable(env,{path:`?${q}`});const found=(page.records||[]).find(r=>firstLink(r?.fields?.[MEMBER_GROUP])===groupRecordId&&firstLink(r?.fields?.[MEMBER_APPLICANT])===applicantId&&String(r?.fields?.[MEMBER_INVITE_STATUS]?.name||r?.fields?.[MEMBER_INVITE_STATUS]||"")!=="Abgelehnt");if(found)return found;offset=page.offset||null;}while(offset);return null;}

export async function handleReplacementRelease(env,input={}){
  if(!env?.AIRTABLE_TOKEN)return {ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
  const declinedMemberId=String(input?.declinedMemberId||"");
  const dryRun=input?.dryRun!==false;
  if(!/^rec[A-Za-z0-9]{14}$/.test(declinedMemberId))return {ok:false,status:400,code:"INVALID_DECLINED_MEMBER_ID"};
  const preview=await buildReplacementPreview(env,declinedMemberId);
  if(!preview?.ok||preview?.state!=="replacement-needed"||!preview?.best?.applicantId)return {ok:false,status:409,code:"NO_CURRENT_SUITABLE_REPLACEMENT",previewState:preview?.state||null,dryRun};
  const candidateId=preview.best.applicantId;
  const safety={invitationSent:false,contactsReleased:false,inviteReleaseSet:false};
  if(dryRun)return {ok:true,status:200,state:"READY_FOR_MANUAL_REPLACEMENT_RELEASE",dryRun:true,declinedMemberId,groupRecordId:preview.groupId,replacementApplicantId:candidateId,groupAverage:preview.best.groupAverage,weakestPair:preview.best.weakestPair,recommendation:preview.best.recommendation,wouldCreateMembership:true,safety,airtableChanged:false};
  if(String(input?.confirmation||"")!=="ERSATZ_FREIGEBEN")return {ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED",dryRun:false,safety};
  const existing=await findExistingReplacement(env,preview.groupId,candidateId);
  if(existing)return {ok:true,status:200,state:"REPLACEMENT_ALREADY_RELEASED",dryRun:false,replacementMemberId:existing.id,duplicatePrevented:true,safety,airtableChanged:false};
  const suffix=crypto.randomUUID().replaceAll("-","").slice(0,10).toUpperCase();
  const created=await airtable(env,{method:"POST",body:{fields:{[MEMBER_ID]:`ERSATZ-${suffix}`,[MEMBER_GROUP]:[preview.groupId],[MEMBER_APPLICANT]:[candidateId],[MEMBER_STATUS]:"Vorgeschlagen",[MEMBER_CONTACT_SHARED]:false,[MEMBER_INVITE_STATUS]:"Nicht versendet",[MEMBER_INVITE_RELEASED]:false,[MEMBER_NOTE]:`Manuell freigegebener Ersatz für ${declinedMemberId}. Einladung und Kontakte weiterhin gesperrt.`}}});
  return {ok:true,status:200,state:"REPLACEMENT_MANUALLY_RELEASED",dryRun:false,declinedMemberId,replacementMemberId:created.id,replacementApplicantId:candidateId,groupAverage:preview.best.groupAverage,weakestPair:preview.best.weakestPair,recommendation:preview.best.recommendation,safety,airtableChanged:true};
}
