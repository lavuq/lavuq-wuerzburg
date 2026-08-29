const AIRTABLE_BASE_ID = "apphnIBhuAbmMTUtY";
const AIRTABLE_TABLE_ID = "tblzLtbR5Yh4nR5aQ";
const AIRTABLE_MEMBERS_TABLE_ID = "tbl4QX0NIB3tUKtF4";
const ALLOWED_ORIGINS = ["https://lavuq.github.io", "https://lavuq-wue.de", "https://www.lavuq-wue.de"];
const FIELD_CONFIRMATION_SENT = "fldyEd3DYTo5fQoMf";

const MEMBER_FIELD_STATUS = "fldBS2hoKQX0Rr1aX";
const MEMBER_FIELD_CONTACT_SHARED = "fld3LCPTEbAl46bF1";
const MEMBER_FIELD_INVITE_STATUS = "fldUmjMa2j7MLG5RA";
const MEMBER_FIELD_INVITE_SENT_AT = "fldMiaXKZ4goKsPMK";
const MEMBER_FIELD_INVITE_ANSWERED_AT = "fldXuLbkNFl2MZrJi";
const MEMBER_FIELD_INVITE_TOKEN = "fldbbkqZ7VRvtbzB0";
const MEMBER_FIELD_INVITE_VALID_UNTIL = "fldbKNNUAaUYBY1JX";

function jsonResponse(payload, status, headers) {
  return new Response(JSON.stringify(payload), { status, headers });
}

async function airtableGetRecord(env, tableId, recordId) {
  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`,
    {
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) return null;
  return response.json();
}

async function airtablePatchRecord(env, tableId, recordId, fields) {
  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    }
  );

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.error?.type || body?.error?.message || "";
    } catch (_) {}
    throw new Error(detail || `Airtable HTTP ${response.status}`);
  }

  return response.json();
}

function validateInvitationRecord(record, token) {
  if (!record || !record.fields) {
    return { ok: false, status: 404, error: "Diese Einladung wurde nicht gefunden." };
  }

  const storedToken = String(record.fields[MEMBER_FIELD_INVITE_TOKEN] || "");
  if (!token || !storedToken || token !== storedToken) {
    return { ok: false, status: 403, error: "Dieser Einladungslink ist ungültig." };
  }

  const inviteStatus = String(record.fields[MEMBER_FIELD_INVITE_STATUS] || "Nicht versendet");
  const validUntil = record.fields[MEMBER_FIELD_INVITE_VALID_UNTIL] || null;

  if (inviteStatus === "Gesendet" && validUntil) {
    const expiry = new Date(validUntil).getTime();
    if (Number.isFinite(expiry) && Date.now() > expiry) {
      return {
        ok: true,
        expired: true,
        inviteStatus: "Abgelaufen",
        validUntil,
      };
    }
  }

  return { ok: true, expired: false, inviteStatus, validUntil };
}

async function handleInvitationStatus(request, env, corsHeaders) {
  if (!env.AIRTABLE_TOKEN) {
    return jsonResponse({ ok: false, error: "Airtable-Zugang ist nicht eingerichtet." }, 500, corsHeaders);
  }

  const url = new URL(request.url);
  const memberId = String(url.searchParams.get("member") || "").trim();
  const token = String(url.searchParams.get("token") || "").trim();

  if (!/^rec[A-Za-z0-9]{14}$/.test(memberId) || !token) {
    return jsonResponse({ ok: false, error: "Dieser Einladungslink ist unvollständig." }, 400, corsHeaders);
  }

  try {
    const record = await airtableGetRecord(env, AIRTABLE_MEMBERS_TABLE_ID, memberId);
    const check = validateInvitationRecord(record, token);

    if (!check.ok) {
      return jsonResponse({ ok: false, error: check.error }, check.status, corsHeaders);
    }

    if (check.expired) {
      try {
        await airtablePatchRecord(env, AIRTABLE_MEMBERS_TABLE_ID, memberId, {
          [MEMBER_FIELD_INVITE_STATUS]: "Abgelaufen",
        });
      } catch (error) {
        console.error("Einladungs-Ablauf konnte nicht gespeichert werden:", error);
      }
    }

    return jsonResponse(
      {
        ok: true,
        status: check.expired ? "Abgelaufen" : check.inviteStatus,
        validUntil: check.validUntil,
      },
      200,
      corsHeaders
    );
  } catch (error) {
    console.error("Einladungsstatus Fehler:", error);
    return jsonResponse({ ok: false, error: "Die Einladung konnte momentan nicht geprüft werden." }, 500, corsHeaders);
  }
}

async function handleInvitationResponse(request, env, corsHeaders) {
  if (!env.AIRTABLE_TOKEN) {
    return jsonResponse({ ok: false, error: "Airtable-Zugang ist nicht eingerichtet." }, 500, corsHeaders);
  }

  try {
    const data = await request.json();
    const memberId = String(data.memberId || "").trim();
    const token = String(data.token || "").trim();
    const decision = String(data.decision || "").trim();

    if (!/^rec[A-Za-z0-9]{14}$/.test(memberId) || !token || !["accept", "decline"].includes(decision)) {
      return jsonResponse({ ok: false, error: "Ungültige Antwortdaten." }, 400, corsHeaders);
    }

    const record = await airtableGetRecord(env, AIRTABLE_MEMBERS_TABLE_ID, memberId);
    const check = validateInvitationRecord(record, token);

    if (!check.ok) {
      return jsonResponse({ ok: false, error: check.error }, check.status, corsHeaders);
    }

    if (check.expired) {
      try {
        await airtablePatchRecord(env, AIRTABLE_MEMBERS_TABLE_ID, memberId, {
          [MEMBER_FIELD_INVITE_STATUS]: "Abgelaufen",
        });
      } catch (_) {}
      return jsonResponse({ ok: false, error: "Diese Einladung ist bereits abgelaufen." }, 410, corsHeaders);
    }

    if (check.inviteStatus !== "Gesendet") {
      if (check.inviteStatus === "Angenommen" || check.inviteStatus === "Abgelehnt") {
        return jsonResponse({ ok: true, status: check.inviteStatus, alreadyAnswered: true }, 200, corsHeaders);
      }
      return jsonResponse({ ok: false, error: "Diese Einladung ist noch nicht für eine Antwort freigegeben." }, 409, corsHeaders);
    }

    const now = new Date().toISOString();
    const fields = {
      [MEMBER_FIELD_INVITE_STATUS]: decision === "accept" ? "Angenommen" : "Abgelehnt",
      [MEMBER_FIELD_INVITE_ANSWERED_AT]: now,
      [MEMBER_FIELD_CONTACT_SHARED]: false,
    };

    if (decision === "accept") {
      fields[MEMBER_FIELD_STATUS] = "Aktiv";
    }

    await airtablePatchRecord(env, AIRTABLE_MEMBERS_TABLE_ID, memberId, fields);

    return jsonResponse(
      {
        ok: true,
        status: decision === "accept" ? "Angenommen" : "Abgelehnt",
        contactShared: false,
      },
      200,
      corsHeaders
    );
  } catch (error) {
    console.error("Einladungsantwort Fehler:", error);
    return jsonResponse({ ok: false, error: "Deine Antwort konnte momentan nicht gespeichert werden." }, 500, corsHeaders);
  }
}

async function sendConfirmationEmail(env, { email, vorname, bewerberId }) {
  if (!env.BREVO_API_KEY) {
    console.warn("BREVO_API_KEY fehlt – Eingangsbestätigung wurde nicht versendet.");
    return false;
  }

  const senderEmail = env.BREVO_SENDER_EMAIL || "lavuq@web.de";
  const senderName = env.BREVO_SENDER_NAME || "LAVUQ Würzburg";

  const subject = "Deine LAVUQ-Bewerbung ist angekommen";
  const htmlContent = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b1f3a;max-width:620px;margin:0 auto;">
      <h2 style="margin-bottom:8px;">Hallo ${vorname},</h2>
      <p>vielen Dank für deine Bewerbung bei <strong>LAVUQ Würzburg</strong>.</p>
      <p>Deine Angaben sind erfolgreich bei uns eingegangen.</p>
      <p><strong>Deine Bewerber-ID:</strong><br>${bewerberId}</p>
      <p>Wir prüfen nun, welche 4er-Gruppe möglichst gut zu deinen Angaben passt. Die Zusammenstellung erfolgt bewusst nicht nach dem Zufallsprinzip. Je nach aktueller Bewerberlage kann es deshalb etwas dauern, bis eine passende Gruppe gefunden ist.</p>
      <p>Du musst im Moment nichts weiter tun. Wir melden uns, sobald der nächste Schritt ansteht.</p>
      <p style="margin-top:28px;">Viele Grüße<br><strong>LAVUQ Würzburg</strong></p>
      <p style="font-size:12px;color:#667085;margin-top:28px;">LAVUQ ist kein Dating-Angebot. Im Mittelpunkt stehen Freundschaft, Austausch und gemeinsame Unternehmungen.</p>
    </div>`;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email, name: vorname }],
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
    console.error("Brevo Fehler:", response.status, detail);
    return false;
  }

  return true;
}

async function markConfirmationSent(env, recordId) {
  if (!recordId) return false;

  try {
    await airtablePatchRecord(env, AIRTABLE_TABLE_ID, recordId, {
      [FIELD_CONFIRMATION_SENT]: true,
    });
    return true;
  } catch (error) {
    console.error("Airtable Bestätigungsstatus Fehler:", error);
    return false;
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === "/invitation-status" && request.method === "GET") {
      return handleInvitationStatus(request, env, corsHeaders);
    }

    if (url.pathname === "/invitation-response" && request.method === "POST") {
      return handleInvitationResponse(request, env, corsHeaders);
    }

    if (request.method === "GET") {
      if (!env.AIRTABLE_TOKEN) {
        return jsonResponse({
          ok: false,
          service: "LAVUQ Bewerbung",
          airtable: "secret-fehlt",
          error: "AIRTABLE_TOKEN ist im Worker nicht vorhanden."
        }, 500, corsHeaders);
      }

      try {
        const check = await fetch(
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?maxRecords=1`,
          {
            headers: {
              Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!check.ok) {
          let details = "";
          try {
            const body = await check.json();
            details = body?.error?.type || body?.error?.message || "Airtable-Fehler";
          } catch (_) {}

          return jsonResponse({
            ok: false,
            service: "LAVUQ Bewerbung",
            airtable: "nicht-verbunden",
            status: check.status,
            error: details || `Airtable HTTP ${check.status}`
          }, 500, corsHeaders);
        }

        return jsonResponse({
          ok: true,
          service: "LAVUQ Bewerbung",
          airtable: "verbunden",
          emailConfirmation: env.BREVO_API_KEY ? "konfiguriert" : "nicht-konfiguriert"
        }, 200, corsHeaders);
      } catch (error) {
        return jsonResponse({
          ok: false,
          service: "LAVUQ Bewerbung",
          airtable: "verbindungsfehler",
          error: String(error?.message || error)
        }, 500, corsHeaders);
      }
    }

    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Methode nicht erlaubt" }, 405, corsHeaders);
    }

    if (!env.AIRTABLE_TOKEN) {
      return jsonResponse({ ok: false, error: "Airtable-Zugang ist noch nicht eingerichtet." }, 500, corsHeaders);
    }

    try {
      let data = {};
      let getAll = () => [];
      const contentType = request.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        data = await request.json();
        getAll = (name) => {
          const value = data[name];
          if (Array.isArray(value)) return value;
          if (value === undefined || value === null || value === "") return [];
          return [value];
        };
      } else {
        const text = await request.text();
        const params = new URLSearchParams(text);
        data = Object.fromEntries(params.entries());
        getAll = (name) => params.getAll(name);
      }

      if (data["bot-field"]) {
        return jsonResponse({ ok: true }, 200, corsHeaders);
      }

      const vorname = String(data.Vorname || "").trim();
      const plz = String(data.PLZ || "").trim();
      const alter = Number(data.Alter);
      const email = String(data.Email || "").trim();

      if (!vorname || !/^[0-9]{5}$/.test(plz) || !Number.isFinite(alter) || alter < 18 || !email) {
        return jsonResponse({ ok: false, error: "Pflichtangaben sind unvollständig." }, 400, corsHeaders);
      }

      const radiusMatch = String(data.Maximaler_Umkreis || "").match(/\d+/);
      const bewerberId =
        "LAV-" +
        new Date().toISOString().replace(/\D/g, "").slice(0, 14) +
        "-" +
        crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();

      const fields = {
        fld5MVt7Qs57DZ0G3: bewerberId,
        fldPPnyiAKpIXnawY: vorname,
        flduioUSJQ7BlM85W: email,
        fld0n0lHsBXYnPosF: String(data.Mobilnummer || "").trim() || undefined,
        fldEIDovX5FIgFdif: alter,
        fldPI0pg4zB5cDMDm: plz,
        fldQ7YMAFTABnbrLo: data.Geschlecht || undefined,
        fldFD6TqjrhGH2fip: data.Aktuelle_Lebenssituation || undefined,
        fld49bquWX3QtAGur: data.Gewuenschte_Gruppe || undefined,
        fldbnsrvWQa1z3QGo: getAll("Freizeit_Interessen").join(", ") || undefined,
        fld78D6tSGN6F62Ec: data.Persoenlichkeit || undefined,
        fldWJh9cPUnMX9F58: data.Planung_von_Unternehmungen || undefined,
        fldLwqv2A45o92Elb: data.Gewuenschte_Kontaktfrequenz || undefined,
        fldhPsY2Zvnneh9Js: getAll("Wichtige_Freundschaftswerte").join(", ") || undefined,
        fldEygPXWXs6gmVdy: getAll("Gemeinsame_Zeit").join(", ") || undefined,
        fldgVR6zKSMcmzxuK: data.Aehnliche_Lebenssituation || undefined,
        fldUdkEWvt7C1OlqC: data.Kennenlernen_in_Gruppe || undefined,
        fldZHIMXs41fjGQev: data.Freundschaftsziel || undefined,
        fldi2ywB31DExQQK3: data.Besonderer_Hinweis || undefined,
        fldy8JQlTiQWK2hGn: "Neu",
      };

      if (radiusMatch) fields.fldqC5pTpkRJH5I7e = Number(radiusMatch[0]);
      Object.keys(fields).forEach((key) => {
        if (fields[key] === undefined || fields[key] === "") delete fields[key];
      });

      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ records: [{ fields }] }),
        }
      );

      if (!airtableResponse.ok) {
        let detail = "";
        try {
          const body = await airtableResponse.json();
          detail = body?.error?.type || body?.error?.message || "";
        } catch (_) {}
        console.error("Airtable Fehler:", airtableResponse.status, detail);
        return jsonResponse({
          ok: false,
          error: detail ? `Airtable: ${detail}` : `Airtable HTTP ${airtableResponse.status}`
        }, 500, corsHeaders);
      }

      const result = await airtableResponse.json();
      const recordId = result.records?.[0]?.id;

      let emailSent = false;
      try {
        emailSent = await sendConfirmationEmail(env, { email, vorname, bewerberId });
        if (emailSent) {
          await markConfirmationSent(env, recordId);
        }
      } catch (emailError) {
        console.error("Eingangsbestätigung Fehler:", emailError);
      }

      return jsonResponse({ ok: true, bewerberId, recordId, emailSent }, 200, corsHeaders);
    } catch (error) {
      console.error(error);
      return jsonResponse(
        { ok: false, error: "Die Bewerbung konnte momentan nicht gespeichert werden." },
        500,
        corsHeaders
      );
    }
  },
};
