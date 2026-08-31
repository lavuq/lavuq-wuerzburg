const BASE_ID="apphnIBhuAbmMTUtY";
const FEEDBACK_TABLE="tblLyjFTdr1MziUgj";

const F_TOKEN="fldvZizwPZiCE7co3";
const F_VALID_UNTIL="fldszL9Bjcsk5UDFD";
const F_ATTENDED="fldf1l9DL5cHFfUEv";
const F_SAFE="fldasI0An5QelVvea";
const F_CONTINUE="fldudL6OgGjs2mkMm";
const F_COMMENT="fldysQyNMSDZd66Cz";
const F_SAFETY_REVIEW="fldB3Dxaijejmjb0h";
const F_SUBMITTED_AT="fld5uezt0LJJdtd29";
const F_LINK="fldwHXctCJcj9eHYE";

function headers(env){return{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"};}
function text(v){if(v==null)return"";if(typeof v==="object"&&!Array.isArray(v)&&v.name)return String(v.name).trim();return String(v).trim();}
function validToken(v){return /^[A-Za-z0-9_-]{20,200}$/.test(String(v||""));}
function safeResponse(ok,status,state,extra={}){return{ok,status,state,...extra,piiExposedInResponse:false,tokenExposedInResponse:false};}

async function listFeedback(env){
 let out=[],offset="";
 do{
  const p=new URLSearchParams({pageSize:"100",returnFieldsByFieldId:"true"});
  if(offset)p.set("offset",offset);
  const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${FEEDBACK_TABLE}?${p}`,{headers:headers(env)});
  if(!r.ok)throw new Error(`Airtable LIST HTTP ${r.status}`);
  const j=await r.json();out.push(...(j.records||[]));offset=String(j.offset||"");
 }while(offset);
 return out;
}

async function patchFeedback(env,id,fields){
 const r=await fetch(`https://api.airtable.com/v0/${BASE_ID}/${FEEDBACK_TABLE}/${id}`,{method:"PATCH",headers:headers(env),body:JSON.stringify({fields})});
 if(!r.ok)throw new Error(`Airtable PATCH HTTP ${r.status}`);
 return r.json();
}

export async function handleFeedbackSubmit(env,input={}){
 if(!env?.AIRTABLE_TOKEN)return safeResponse(false,500,"AIRTABLE_TOKEN_MISSING");
 const token=String(input.token||"").trim();
 const feeling=String(input.feeling||"").trim();
 const continueChoice=String(input.continueChoice||"").trim();
 const comment=String(input.comment||"").trim().slice(0,2000);
 if(!validToken(token))return safeResponse(false,400,"INVALID_TOKEN");
 if(!["Sehr wohl","Okay","Unwohl"].includes(feeling))return safeResponse(false,400,"INVALID_FEELING");
 if(!["Ja","Unsicher","Nein"].includes(continueChoice))return safeResponse(false,400,"INVALID_CONTINUE_CHOICE");

 const rows=await listFeedback(env);
 const matches=rows.filter(r=>text(r?.fields?.[F_TOKEN])===token);
 if(matches.length!==1)return safeResponse(false,404,"FEEDBACK_LINK_INVALID_OR_USED");
 const row=matches[0];
 if(text(row?.fields?.[F_SUBMITTED_AT]))return safeResponse(false,409,"FEEDBACK_ALREADY_SUBMITTED");
 const validUntil=new Date(text(row?.fields?.[F_VALID_UNTIL]));
 if(!Number.isFinite(validUntil.getTime())||validUntil.getTime()<=Date.now())return safeResponse(false,410,"FEEDBACK_LINK_EXPIRED");

 const safeMap={"Sehr wohl":"Ja","Okay":"Teilweise","Unwohl":"Nein"};
 await patchFeedback(env,row.id,{
  [F_ATTENDED]:true,
  [F_SAFE]:safeMap[feeling],
  [F_CONTINUE]:continueChoice,
  [F_COMMENT]:comment,
  [F_SAFETY_REVIEW]:feeling==="Unwohl",
  [F_SUBMITTED_AT]:new Date().toISOString(),
  [F_TOKEN]:"",
  [F_LINK]:"",
  [F_VALID_UNTIL]:null
 });

 return safeResponse(true,200,"FEEDBACK_SAVED",{saved:true,duplicateSubmissionPrevented:true,linkInvalidated:true,safetyReviewRequested:feeling==="Unwohl"});
}
