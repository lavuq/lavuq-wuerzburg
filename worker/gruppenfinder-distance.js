// LAVUQ Gruppenfinder – PLZ-/Entfernungslogik v1
// Verwendet ausschließlich Postleitzahlen, keine Straßen- oder Adressdaten.

const PLZ_CACHE = new Map();

function validGermanPlz(value) {
  const plz = String(value ?? "").trim();
  return /^\d{5}$/.test(plz) ? plz : null;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

export function haversineDistanceKm(a, b) {
  if (!a || !b) return null;
  const lat1 = Number(a.lat);
  const lon1 = Number(a.lon);
  const lat2 = Number(b.lat);
  const lon2 = Number(b.lon);
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null;

  const earthRadiusKm = 6371.0088;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export async function resolveGermanPlz(plzValue, fetchImpl = fetch) {
  const plz = validGermanPlz(plzValue);
  if (!plz) return null;
  if (PLZ_CACHE.has(plz)) return PLZ_CACHE.get(plz);

  const response = await fetchImpl(`https://api.zippopotam.us/de/${encodeURIComponent(plz)}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    PLZ_CACHE.set(plz, null);
    return null;
  }

  const data = await response.json();
  const place = data?.places?.[0];
  const coordinates = place
    ? { lat: Number(place.latitude), lon: Number(place.longitude), plz }
    : null;

  const valid = coordinates && Number.isFinite(coordinates.lat) && Number.isFinite(coordinates.lon)
    ? coordinates
    : null;

  PLZ_CACHE.set(plz, valid);
  return valid;
}

export function scoreDistance(distanceKm) {
  const km = Number(distanceKm);
  if (!Number.isFinite(km) || km < 0) return null;
  if (km <= 5) return 100;
  if (km <= 10) return 90;
  if (km <= 20) return 80;
  if (km <= 30) return 70;
  if (km <= 45) return 55;
  if (km <= 60) return 40;
  return 20;
}

export function passesMutualRadius(distanceKm, radiusA, radiusB) {
  const km = Number(distanceKm);
  const a = Number(radiusA);
  const b = Number(radiusB);
  if (!Number.isFinite(km)) return false;
  if (!Number.isFinite(a) || a < 0 || !Number.isFinite(b) || b < 0) return false;
  return km <= a && km <= b;
}

export async function calculateDistanceCompatibility(profileA, profileB, fetchImpl = fetch) {
  const [a, b] = await Promise.all([
    resolveGermanPlz(profileA?.plz, fetchImpl),
    resolveGermanPlz(profileB?.plz, fetchImpl),
  ]);

  if (!a || !b) {
    return {
      resolved: false,
      distanceKm: null,
      score: null,
      hardFilterPassed: false,
      reason: "PLZ konnte nicht aufgelöst werden.",
    };
  }

  const distanceKmRaw = haversineDistanceKm(a, b);
  const distanceKm = Math.round(distanceKmRaw * 10) / 10;
  const hardFilterPassed = passesMutualRadius(
    distanceKm,
    profileA?.maximalerUmkreisKm,
    profileB?.maximalerUmkreisKm
  );

  return {
    resolved: true,
    distanceKm,
    score: scoreDistance(distanceKm),
    hardFilterPassed,
    reason: hardFilterPassed ? null : "Die gegenseitigen maximalen Umkreise werden überschritten.",
  };
}
