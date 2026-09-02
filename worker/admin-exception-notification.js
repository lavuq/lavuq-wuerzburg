// Sendet eine kompakte interne Ausnahme-Meldung ohne Teilnehmerdaten.
export async function handleAdminExceptionNotification(env, input = {}) {
  if (!env?.BREVO_API_KEY) return { ok:false, status:500, code:"BREVO_API_KEY_MISSING" };
  if (String(input?.confirmation || "") !== "SEND_ADMIN_EXCEPTION_NOTIFICATION") return { ok:false, status:409, code:"EXPLICIT_CONFIRMATION_REQUIRED" };

  const hardErrors = Math.max(0, Number(input?.hardErrors || 0));
  if (hardErrors < 1) return { ok:true, status:200, state:"NO_EXCEPTION_TO_NOTIFY", notificationSent:false };

  const rawCodes = Array.isArray(input?.codes) ? input.codes : [];
  const codes = [...new Set(rawCodes.map((x)=>String(x || "").trim()).filter(Boolean))].slice(0,20);
  const runAt = String(input?.runAt || new Date().toISOString());
  const adminEmail = env.LAVUQ_ADMIN_EMAIL || env.BREVO_SENDER_EMAIL || "lavuq@web.de";
  const senderEmail = env.BREVO_SENDER_EMAIL || "kontakt@lavuq-wue.de";
  const senderName = env.BREVO_SENDER_NAME || "LAVUQ Würzburg";
  const codeText = codes.length ? codes.join(", ") : "Nicht näher klassifiziert";

  const htmlContent = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b1f3a;max-width:620px;margin:0 auto"><h2>LAVUQ benötigt deine Aufmerksamkeit</h2><p>Der automatische Produktionsablauf hat einen Ausnahmefall erkannt, der nicht selbstständig fortgesetzt wurde.</p><p><strong>Anzahl prüfpflichtiger Punkte:</strong> ${hardErrors}</p><p><strong>Technische Hinweise:</strong> ${codeText}</p><p><strong>Lauf:</strong> ${runAt}</p><p>Personenbezogene Teilnehmerdaten werden in dieser Benachrichtigung bewusst nicht übertragen.</p><p>Viele Grüße<br><strong>LAVUQ Automatisierung</strong></p></div>`;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method:"POST",
    headers:{"api-key":env.BREVO_API_KEY,"Content-Type":"application/json",Accept:"application/json"},
    body:JSON.stringify({sender:{email:senderEmail,name:senderName},to:[{email:adminEmail,name:"LAVUQ Admin"}],subject:"LAVUQ: Ausnahmefall benötigt Prüfung",htmlContent}),
  });
  if(!response.ok){let detail="";try{detail=JSON.stringify(await response.json());}catch{}return{ok:false,status:502,code:"ADMIN_NOTIFICATION_SEND_FAILED",detail:detail.slice(0,300)};}
  return{ok:true,status:200,state:"ADMIN_EXCEPTION_NOTIFICATION_SENT",notificationSent:true,piiExposedInResponse:false};
}
