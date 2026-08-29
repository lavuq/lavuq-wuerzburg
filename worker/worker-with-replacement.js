// LAVUQ Worker-Einstieg mit sicherer Ersatzvorschlags-Automatik.
// Delegiert alle bestehenden Requests an worker.js.
// Nach erfolgreicher Ablehnung wird nur ein Ersatzvorschlag berechnet und in Airtable
// als "Zur Prüfung" gespeichert. Keine Einladung, kein Token, keine Kontaktfreigabe.

import baseWorker from "./worker.js";
import { createReplacementProposalAfterDecline } from "./replacement-on-decline.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const isInvitationResponse =
      url.pathname === "/invitation-response" && request.method === "POST";

    let declineMemberId = null;

    if (isInvitationResponse) {
      try {
        const cloned = request.clone();
        const body = await cloned.json();
        if (body?.decision === "decline" && /^rec[A-Za-z0-9]{14}$/.test(String(body?.memberId || ""))) {
          declineMemberId = String(body.memberId);
        }
      } catch (_) {}
    }

    const response = await baseWorker.fetch(request, env, ctx);

    if (declineMemberId && response.ok) {
      const run = async () => {
        try {
          const proposal = await createReplacementProposalAfterDecline(env, declineMemberId);
          console.log("Ersatzvorschlag nach Absage:", proposal);
        } catch (error) {
          // Die Absage selbst bleibt erfolgreich, auch wenn die Ersatzsuche scheitert.
          console.error("Ersatzvorschlag konnte nicht berechnet werden:", error);
        }
      };

      if (ctx?.waitUntil) ctx.waitUntil(run());
      else await run();
    }

    return response;
  },
};
