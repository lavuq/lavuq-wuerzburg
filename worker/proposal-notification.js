import { buildGroupProposalsPreview } from "./group-proposals-preview.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendBrevoEmail(env, { to, subject, htmlContent }) {
  if (!env?.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY fehlt.");
  }

  const senderEmail = env.BREVO_SENDER_EMAIL || "kontakt@lavuq-wue.de";
  const senderName = env.BREVO_SENDER_NAME || "LAVUQ Würzburg";

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: to, name: "LAVUQ Organisation" }],
      subject,
      htmlContent,
    }),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.message || JSON.stringify(body);
    } catch (_) {}
    throw new Error(detail || `Brevo HTTP ${response.status}`);
  }
}

export async function handleProposalNotification(env, input = {}) {
  const dryRun = input?.dryRun === true;
  const controlledTest = input?.testMode === "controlled-multi" || input?.testMode === "controlled-a-d";

  const preview = await buildGroupProposalsPreview(env, {
    limit: 1,
    controlledTest,
  });

  if (!preview?.ok) {
    return {
      ok: false,
      status: 422,
      code: preview?.code || "PREVIEW_FAILED",
      notificationSent: false,
    };
  }

  const best = Array.isArray(preview.proposals) ? preview.proposals[0] : null;
  if (!best) {
    return {
      ok: true,
      status: 200,
      state: preview?.state || "NO_SUITABLE_GROUP",
      eligibleApplicants: preview?.eligibleApplicants || 0,
      notificationSent: false,
      dryRun,
    };
  }

  const applicantIds = Array.isArray(best.applicantIds) ? best.applicantIds : [];
  const notificationEmail = String(env?.GROUP_PROPOSAL_NOTIFICATION_EMAIL || "lavuq@web.de").trim();

  const subject = controlledTest
    ? "[TEST] LAVUQ Gruppenvorschlag gefunden"
    : "LAVUQ: Neuer Gruppenvorschlag gefunden";

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b1f3a;max-width:640px;margin:0 auto;">
      <h2 style="margin-bottom:8px;">Neuer LAVUQ-Gruppenvorschlag</h2>
      <p>Der Gruppenfinder hat eine geeignete 4er-Gruppe gefunden.</p>
      <p><strong>Gruppen-Durchschnitt:</strong> ${escapeHtml(best.groupAverage)}<br>
      <strong>Schwächster Paar-Score:</strong> ${escapeHtml(best.weakestPair)}<br>
      <strong>Empfehlung:</strong> ${escapeHtml(best.recommendation || "—")}</p>
      <p><strong>Bewerber-Record-IDs:</strong><br>${applicantIds.map(escapeHtml).join("<br>")}</p>
      <p style="margin-top:24px;"><strong>Wichtig:</strong> Es wurde keine Gruppe automatisch angelegt, keine Einladung versendet und kein Kontakt freigegeben. Die weitere Freigabe bleibt manuell.</p>
      <p style="font-size:12px;color:#667085;margin-top:28px;">Automatische interne LAVUQ-Gruppenfinder-Benachrichtigung.</p>
    </div>`;

  if (!dryRun) {
    await sendBrevoEmail(env, {
      to: notificationEmail,
      subject,
      htmlContent,
    });
  }

  return {
    ok: true,
    status: 200,
    state: "GROUP_PROPOSAL_FOUND",
    notificationSent: !dryRun,
    dryRun,
    controlledTest,
    recipientConfigured: Boolean(notificationEmail),
    proposal: {
      applicantIds,
      groupAverage: best.groupAverage,
      weakestPair: best.weakestPair,
      recommendation: best.recommendation,
    },
    safety: {
      airtableChanged: false,
      groupCreated: false,
      invitationsSent: false,
      contactsReleased: false,
    },
  };
}
