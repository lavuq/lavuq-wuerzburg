import previewWorker from "./worker-with-preview.js";
import { handleFirstMeetingFeedbackMailControlledOne, handleFirstMeetingFeedbackMailControlledAll } from "./first-meeting-feedback-mail.js";
import { handleFirstMeetingFeedbackRecoveryOpen } from "./first-meeting-feedback-recovery.js";
import { handleFirstMeetingFeedbackDecisionDryRun } from "./first-meeting-feedback-decision.js";
import { handleSecondMeetingPrepare } from "./second-meeting-prepare.js";
import { handleFeedbackSubmit } from "./feedback-submit.js";

function json(payload,status=200,extraHeaders={}){return new Response(JSON.stringify(payload,null,2),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",...extraHeaders}});}
function bearerToken(request){const header=String(request.headers.get("Authorization")||"");return header.startsWith("Bearer ")?header.slice(7):"";}
function authorized(request,env){const configured=String(env?.GRUPPENFINDER_PREVIEW_KEY||"");const supplied=bearerToken(request);return Boolean(configured&&supplied&&supplied===configured);}
function corsHeaders(request){
 const origin=String(request.headers.get("Origin")||"");
 const allowed=new Set(["https://lavuq-wue.de","https://www.lavuq-wue.de"]);
 return allowed.has(origin)?{"Access-Control-Allow-Origin":origin,"Vary":"Origin","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"POST, OPTIONS"}:{};
}

export default{
 async fetch(request,env,ctx){
  const url=new URL(request.url);

  if(url.pathname==="/feedback/submit"){
   const cors=corsHeaders(request);
   if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
   if(request.method!=="POST")return json({ok:false,error:"Nur POST ist erlaubt."},405,cors);
   const origin=String(request.headers.get("Origin")||"");
   if(origin&&!cors["Access-Control-Allow-Origin"])return json({ok:false,error:"Origin nicht erlaubt."},403);
   try{
    const input=await request.json().catch(()=>({}));
    const result=await handleFeedbackSubmit(env,input);
    return json(result,Number(result?.status||(result?.ok?200:500)),cors);
   }catch(e){
    console.error("Feedback submit failed",e?.message||e);
    return json({ok:false,status:500,state:"FEEDBACK_SAVE_FAILED",piiExposedInResponse:false,tokenExposedInResponse:false},500,cors);
   }
  }

  if(url.pathname==="/gruppenfinder/first-meeting-feedback-mail"){
   if(request.method!=="POST")return json({ok:false,error:"Nur POST ist erlaubt."},405);
   if(!authorized(request,env))return json({ok:false,error:"Nicht autorisiert."},401);
   try{
    const input=await request.json().catch(()=>({}));
    const result=input?.controlledAll===true
      ? await handleFirstMeetingFeedbackMailControlledAll(env,input)
      : await handleFirstMeetingFeedbackMailControlledOne(env,input);
    return json(result,Number(result?.status||(result?.ok?200:500)));
   }catch(e){
    console.error(e);
    return json({ok:false,error:"Feedback-Testmail konnte nicht verarbeitet werden."},500);
   }
  }

  if(url.pathname==="/gruppenfinder/first-meeting-feedback-recovery"){
   if(request.method!=="POST")return json({ok:false,error:"Nur POST ist erlaubt."},405);
   if(!authorized(request,env))return json({ok:false,error:"Nicht autorisiert."},401);
   try{
    const input=await request.json().catch(()=>({}));
    const result=await handleFirstMeetingFeedbackRecoveryOpen(env,input);
    return json(result,Number(result?.status||(result?.ok?200:500)));
   }catch(e){
    console.error(e);
    return json({ok:false,error:"Feedback-Recovery konnte nicht verarbeitet werden.",piiExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false},500);
   }
  }

  if(url.pathname==="/gruppenfinder/first-meeting-feedback-decision"){
   if(request.method!=="POST")return json({ok:false,error:"Nur POST ist erlaubt."},405);
   if(!authorized(request,env))return json({ok:false,error:"Nicht autorisiert."},401);
   try{
    const input=await request.json().catch(()=>({}));
    const result=await handleFirstMeetingFeedbackDecisionDryRun(env,input);
    return json(result,Number(result?.status||(result?.ok?200:500)));
   }catch(e){
    console.error(e);
    return json({ok:false,error:"Feedback-Entscheidung konnte nicht geprueft werden.",piiExposedInResponse:false,tokenExposedInResponse:false,linkExposedInResponse:false},500);
   }
  }

  if(url.pathname==="/gruppenfinder/second-meeting-prepare"){
   if(request.method!=="POST")return json({ok:false,error:"Nur POST ist erlaubt."},405);
   if(!authorized(request,env))return json({ok:false,error:"Nicht autorisiert."},401);
   try{
    const input=await request.json().catch(()=>({}));
    const result=await handleSecondMeetingPrepare(env,input);
    return json(result,Number(result?.status||(result?.ok?200:500)));
   }catch(e){
    console.error(e);
    return json({ok:false,error:"Treffen 2 konnte nicht vorbereitet werden.",piiExposedInResponse:false},500);
   }
  }
  return previewWorker.fetch(request,env,ctx);
 }
};
