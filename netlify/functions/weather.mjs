// Netlify Function v2 — prévision météo 7 jours (Open-Meteo)
// Route : /api/weather/:city  (configurée plus bas)

const CITIES = {
  dakar:        { lat: 14.6928, lon: -17.4467 },
  thies:        { lat: 14.7910, lon: -16.9359 },
  saintlouis:   { lat: 16.0179, lon: -16.4896 },
  ziguinchor:   { lat: 12.5681, lon: -16.2719 },
  kaolack:      { lat: 14.1828, lon: -16.2533 },
  tambacounda:  { lat: 13.7707, lon: -13.6673 },
};

export default async (req) => {
  const url = new URL(req.url);
  const city = url.pathname.split("/").pop()?.toLowerCase() ?? "dakar";
  const coords = CITIES[city];
  if (!coords) {
    return new Response(JSON.stringify({ error: "Ville inconnue", available: Object.keys(CITIES) }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }
  const apiUrl =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${coords.lat}&longitude=${coords.lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
    `&timezone=Africa%2FDakar&forecast_days=7`;

  try {
    const upstream = await fetch(apiUrl, { headers: { accept: "application/json" } });
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    const data = await upstream.json();
    const days = (data.daily?.time ?? []).map((date, i) => ({
      date,
      tMax: data.daily.temperature_2m_max?.[i] ?? null,
      tMin: data.daily.temperature_2m_min?.[i] ?? null,
      rain: data.daily.precipitation_sum?.[i] ?? 0,
    }));
    return new Response(JSON.stringify(days), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Prévision indisponible", detail: String(err.message) }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/weather/:city",
};
