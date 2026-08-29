// LAVUQ Worker-Einstieg für sicheren Gruppenfinder-Testmodus.
// Bestehende Produktivfunktionen werden an worker.js delegiert.
// Zusätzlich gibt es einen geschützten READ-ONLY-Endpunkt für Ersatzvorschläge.
// Keine Airtable-Schreiboperationen, keine Einladungen, keine Tokens, keine Kontaktfreigabe.

import baseWorker from "./worker.js";
import { buildReplacementPreview } from "./replacement-preview.js";

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function validRecordId(value) {
  return /^rec[A-Za-z0-9]{14}$/.test(String(value || ""));
}

function authorized(request, env) {
  const configured = String(env?.GRUPPENFINDER_PREVIEW_KEY || "");
  if (!configured) return false;

  const header = String(request.headers.get("Authorization") || "");
  if (!header.startsWith("Bearer ")) return false;

  const supplied = header.slice(7);
  return supplied.length > 0 && supplied === configured;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/gruppenfinder/replacement-preview") {
      if (request.method !== "GET") {
        return json({ ok: false, error: "Nur GET ist erlaubt." }, 405);
      }

      if (!authorized(request, env)) {
        return json({ ok: false, error: "Nicht autorisiert." }, 401);
      }

      const memberId = String(url.searchParams.get("member") || "");
      if (!validRecordId(memberId)) {
        return json({ ok: false, error: "Ungültige member-ID." }, 400);
      }

      try {
        const preview = await buildReplacementPreview(env, memberId);
        return json(preview, preview?.ok === false ? 422 : 200);
      } catch (error) {
        console.error("Gruppenfinder Preview fehlgeschlagen:", error);
        return json({
          ok: false,
          error: "Vorschau konnte nicht berechnet werden.",
        }, 500);
      }
    }

    return baseWorker.fetch(request, env, ctx);
  },
};
