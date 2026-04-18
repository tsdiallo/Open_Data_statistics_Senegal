// Netlify scheduled function — déclenche un rebuild quotidien (06:00 UTC)
// pour rafraîchir les données FMI / Banque mondiale / Open-Meteo.
//
// Pré-requis : créer un Build Hook dans Netlify > Site settings > Build & deploy
// > Build hooks, puis stocker son URL dans la variable d'environnement
// REFRESH_BUILD_HOOK. Sans cette variable, la fonction ne fait rien.

export default async () => {
  const hook = process.env.REFRESH_BUILD_HOOK;
  if (!hook) {
    console.warn("[scheduled-refresh] REFRESH_BUILD_HOOK absent — aucune action");
    return new Response("no-op", { status: 200 });
  }
  try {
    const res = await fetch(hook, { method: "POST" });
    console.log(`[scheduled-refresh] build hook → ${res.status}`);
    return new Response(`triggered:${res.status}`, { status: 200 });
  } catch (err) {
    console.error("[scheduled-refresh] échec :", err);
    return new Response("error", { status: 500 });
  }
};

export const config = {
  schedule: "@daily",
};
