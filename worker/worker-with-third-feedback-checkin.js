import baseWorker from "./worker-with-third-reminder-2h.js";
import { handleThirdMeetingFeedbackCheckin } from "./third-meeting-feedback-checkin.js";

function json(payload,status=200){return new Response(JSON.stringify(payload,null,2),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});}
function bearerToken(request){const header=String(request.headers.get("Authorization")||"");return header.startsWith("Bearer ")?header.slice(7):"";}
function authorized(request,env){const configured=String(env?.GRUPPENFINDER_PREVIEW_KEY||"");const supplied=bearerToken(request);return Boolean(configured&&supplied&&supplied===configured);}

export default{
 async fetch(request,env,ctx){
  const url=new URL(request.url);
  if(url.pathname==="/gruppenfinder/third-meeting-feedback-checkin"){
   if(request.method!=="POST")return json({ok:false,error:"Nur POST ist erlaubt."},405);
   if(!authorized(request,env))return json({ok:false,error:"Nicht autorisiert."},401);
   try{
    const input=await request.json().catch(()=>({}));
    const result=await handleThirdMeetingFeedbackCheckin(env,input);
    return json(result,Number(result?.status||(result?.ok?200:500)));
   }catch(e){
    console.error(e);
    return json({ok:false,error:"Treffen-3-Feedback-Check-in konnte nicht verarbeitet werden.",piiExposedInResponse:false},500);
   }
  }
  return baseWorker.fetch(request,env,ctx);
 }
};
