const AIRTABLE_BASE_ID = "apphnIBhuAbmMTUtY";
const AIRTABLE_TABLE_ID = "tblzLtbR5Yh4nR5aQ";
const ALLOWED_ORIGINS = ["https://lavuq.github.io"];

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
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === "GET") {
      if (!env.AIRTABLE_TOKEN) {
        return new Response(JSON.stringify({
          ok: false,
          service: "LAVUQ Bewerbung",
          airtable: "secret-fehlt",
          error: "AIRTABLE_TOKEN ist im Worker nicht vorhanden."
        }), { status: 500, headers: corsHeaders });
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

          return new Response(JSON.stringify({
            ok: false,
            service: "LAVUQ Bewerbung",
            airtable: "nicht-verbunden",
            status: check.status,
            error: details || `Airtable HTTP ${check.status}`
          }), { status: 500, headers: corsHeaders });
        }

        return new Response(JSON.stringify({
          ok: true,
          service: "LAVUQ Bewerbung",
          airtable: "verbunden"
        }), { status: 200, headers: corsHeaders });
      } catch (error) {
        return new Response(JSON.stringify({
          ok: false,
          service: "LAVUQ Bewerbung",
          airtable: "verbindungsfehler",
          error: String(error?.message || error)
        }), { status: 500, headers: corsHeaders });
      }
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, error: "Methode nicht erlaubt" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    if (!env.AIRTABLE_TOKEN) {
      return new Response(JSON.stringify({ ok: false, error: "Airtable-Zugang ist noch nicht eingerichtet." }), {
        status: 500,
        headers: corsHeaders,
      });
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
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });
      }

      const vorname = String(data.Vorname || "").trim();
      const plz = String(data.PLZ || "").trim();
      const alter = Number(data.Alter);
      const email = String(data.Email || "").trim();

      if (!vorname || !/^[0-9]{5}$/.test(plz) || !Number.isFinite(alter) || alter < 18 || !email) {
        return new Response(JSON.stringify({ ok: false, error: "Pflichtangaben sind unvollständig." }), {
          status: 400,
          headers: corsHeaders,
        });
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
        return new Response(JSON.stringify({
          ok: false,
          error: detail ? `Airtable: ${detail}` : `Airtable HTTP ${airtableResponse.status}`
        }), { status: 500, headers: corsHeaders });
      }

      const result = await airtableResponse.json();
      return new Response(
        JSON.stringify({ ok: true, bewerberId, recordId: result.records?.[0]?.id }),
        { status: 200, headers: corsHeaders }
      );
    } catch (error) {
      console.error(error);
      return new Response(
        JSON.stringify({ ok: false, error: "Die Bewerbung konnte momentan nicht gespeichert werden." }),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
