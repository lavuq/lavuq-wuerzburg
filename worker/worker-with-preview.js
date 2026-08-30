// LAVUQ Worker-Einstieg fuer sicheren Gruppenfinder-Testmodus.
// Bestehende Produktivfunktionen werden an worker.js delegiert.
// Zusaetzlich gibt es geschuetzte READ-ONLY-Endpunkte fuer Ersatz- und Gruppenvorschlaege
// sowie eine bewusst bestaetigte Kontaktfreigabe mit harter 4/4-Sicherheitspruefung.

import baseWorker from "./worker.js";
import { buildReplacementPreview } from "./replacement-preview.js";
import { buildGroupProposalsPreview } from "./group-proposals-preview.js";
import { handleControlledContactRelease } from "./contact-release.js";

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

function bearerToken(request) {
  const header = String(request.headers.get("Authorization") || "");
  if (!header.startsWith("Bearer ")) return "";
  return header.slice(7);
}

function authorized(request, env) {
  const configured = String(env?.GRUPPENFINDER_PREVIEW_KEY || "");
  if (!configured) return false;
  const supplied = bearerToken(request);
  return supplied.length > 0 && supplied === configured;
}

function contactReleaseAuthorized(request, env) {
  // Fuer den Uebergang kann der bestehende geschuetzte Preview-Key verwendet werden.
  // Falls CONTACT_RELEASE_KEY gesetzt ist, hat dieser separate Schluessel Vorrang.
  const configured = String(env?.CONTACT_RELEASE_KEY || env?.GRUPPENFINDER_PREVIEW_KEY || "");
  if (!configured) return false;
  const supplied = bearerToken(request);
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
        return json({ ok: false, error: "Ungueltige member-ID." }, 400);
      }

      try {
        const preview = await buildReplacementPreview(env, memberId);
        return json(preview, preview?.ok === false ? 422 : 200);
      } catch (error) {
        console.error("Gruppenfinder Replacement Preview fehlgeschlagen:", error);
        return json({ ok: false, error: "Vorschau konnte nicht berechnet werden." }, 500);
      }
    }

    if (url.pathname === "/gruppenfinder/group-proposals-preview") {
      if (request.method !== "GET") {
        return json({ ok: false, error: "Nur GET ist erlaubt." }, 405);
      }

      if (!authorized(request, env)) {
        return json({ ok: false, error: "Nicht autorisiert." }, 401);
      }

      const limit = Number(url.searchParams.get("limit") || 10);
      const testMode = String(url.searchParams.get("testMode") || "");
      const controlledTest = testMode === "controlled-multi" || testMode === "controlled-a-d";

      try {
        const preview = await buildGroupProposalsPreview(env, { limit, controlledTest });
        return json(preview, preview?.ok === false ? 422 : 200);
      } catch (error) {
        console.error("Gruppenfinder Group Proposal Preview fehlgeschlagen:", error);
        return json({ ok: false, error: "Gruppenvorschlaege konnten nicht berechnet werden." }, 500);
      }
    }

    if (url.pathname === "/gruppenfinder/contact-release") {
      if (request.method !== "POST") {
        return json({ ok: false, error: "Nur POST ist erlaubt." }, 405);
      }

      if (!contactReleaseAuthorized(request, env)) {
        return json({ ok: false, error: "Nicht autorisiert." }, 401);
      }

      try {
        const input = await request.json();
        const result = await handleControlledContactRelease(env, input);
        return json(result, Number(result?.status || (result?.ok ? 200 : 500)));
      } catch (error) {
        console.error("Kontrollierte Kontaktfreigabe fehlgeschlagen:", error);
        return json({ ok: false, error: "Kontaktfreigabe konnte nicht verarbeitet werden." }, 500);
      }
    }

    return baseWorker.fetch(request, env, ctx);
  },
};
