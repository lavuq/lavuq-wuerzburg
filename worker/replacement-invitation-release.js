// LAVUQ – manuelle Einladungsfreigabe fuer genau ein Ersatzmitglied.
// Kein E-Mail-Versand, keine Kontaktfreigabe.
const BASE_ID="apphnIBhuAbmMTUtY";
const MEMBERS_TABLE="tbl4QX0NIB3tUKtF4";
const MEMBER_STATUS="fldBS2hoKQX0Rr1aX";
const MEMBER_INVITE_STATUS="fldUmjMa2j7MLG5RA";
const MEMBER_INVITE_RELEASED="fldSGBeJO6GLQ27gi";
const MEMBER_CONTACT_SHARED="fld3LCPTEbAl46bF1";
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name);return String(v);}
async function req(env,id,options={}){const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${MEMBERS_TABLE}/${id}?returnFieldsByFieldId=true`,{method:options.method||"GET",headers:{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"},body:options.body?JSON.stringify(options.body):undefined});if(!r.ok)throw new Error(`Airtable HTTP ${r.status}`);return r.json();}
export async function handleReplacementInvitationRelease(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return{ok:false,status:500,code:"AIRTABLE_TOKEN_MISSING"};
 const memberId=String(input?.memberId||"");const dryRun=input?.dryRun!==false;
 if(!/^rec[A-Za-z0-9]{14}$/.test(memberId))return{ok:false,status:400,code:"INVALID_MEMBER_ID"};
 const member=await req(env,memberId);const f=member?.fields||{};
 if(text(f[MEMBER_STATUS])!=="Vorgeschlagen")return{ok:false,status:409,code:"MEMBER_NOT_PROPOSED"};
 if(text(f[MEMBER_INVITE_STATUS])!=="Nicht versendet")return{ok:false,status:409,code:"INVITATION_ALREADY_PROCESSED"};
 if(f[MEMBER_CONTACT_SHARED]===true)return{ok:false,status:409,code:"CONTACT_ALREADY_SHARED"};
 if(f[MEMBER_INVITE_RELEASED]===true)return{ok:true,status:200,state:"REPLACEMENT_INVITATION_ALREADY_RELEASED",dryRun,memberId,emailsSent:false,contactsReleased:false,airtableChanged:false};
 if(dryRun)return{ok:true,status:200,state:"READY_FOR_MANUAL_REPLACEMENT_INVITATION_RELEASE",dryRun:true,memberId,wouldReleaseOneInvitation:true,emailsSent:false,contactsReleased:false,airtableChanged:false};
 if(String(input?.confirmation||"")!=="ERSATZ_EINLADUNG_FREIGEBEN")return{ok:false,status:409,code:"EXPLICIT_CONFIRMATION_REQUIRED",dryRun:false};
 const updated=await req(env,memberId,{method:"PATCH",body:{fields:{[MEMBER_INVITE_RELEASED]:true}}});
 return{ok:true,status:200,state:"REPLACEMENT_INVITATION_MANUALLY_RELEASED",dryRun:false,memberId:updated.id,emailsSent:false,contactsReleased:false,airtableChanged:true};
}
