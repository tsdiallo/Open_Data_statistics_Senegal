#!/usr/bin/env node
// Rafraîchit les jeux de données publics : FMI (WEO), Banque mondiale, Open-Meteo.
// En cas d'échec d'une source, conserve le JSON existant et marque ok:false dans meta.json.
// Aucune valeur n'est inventée : si l'API ne renvoie rien, la série reste vide.

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "..", "src", "data");
const NOW = new Date().toISOString();

const log = (msg) => console.log(`[refresh] ${msg}`);
const warn = (msg) => console.warn(`[refresh] ⚠ ${msg}`);

async function safeJson(url, label) {
  try {
    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "senegal-en-chiffres/1.0 (+https://github.com/tsdiallo/open_data_statistics_senegal)",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    warn(`${label} : ${err.message}`);
    return null;
  }
}

async function readJsonOrDefault(file, fallback) {
  const p = resolve(DATA_DIR, file);
  if (!existsSync(p)) return fallback;
  try {
    return JSON.parse(await readFile(p, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJson(file, data) {
  await writeFile(resolve(DATA_DIR, file), JSON.stringify(data, null, 2) + "\n", "utf8");
}

// ────────────────────────────────────────────────────────────────────────
// FMI — World Economic Outlook
// Endpoint: https://www.imf.org/external/datamapper/api/v1/{INDICATOR}/SEN
// ────────────────────────────────────────────────────────────────────────
const IMF_BASE = "https://www.imf.org/external/datamapper/api/v1";
const IMF_INDICATORS = [
  { id: "pib-courant", code: "NGDPD", title: "PIB nominal", unit: "Mds USD" },
  { id: "croissance-pib", code: "NGDP_RPCH", title: "Croissance du PIB en volume", unit: "%" },
  { id: "inflation", code: "PCPIPCH", title: "Inflation moyenne (IPC)", unit: "%" },
  { id: "dette-publique", code: "GGXWDG_NGDP", title: "Dette publique brute", unit: "% PIB" },
];

async function fetchImf() {
  const indicators = [];
  let ok = true;
  const currentYear = new Date().getFullYear();
  for (const ind of IMF_INDICATORS) {
    const data = await safeJson(`${IMF_BASE}/${ind.code}/SEN`, `FMI ${ind.code}`);
    if (!data) { ok = false; continue; }
    const raw = data?.values?.[ind.code]?.SEN ?? {};
    const series = Object.entries(raw)
      .map(([year, value]) => ({ date: year, value: typeof value === "number" ? value : null }))
      .filter((p) => p.value !== null)
      .sort((a, b) => Number(a.date) - Number(b.date))
      .slice(-25);
    if (!series.length) { warn(`FMI ${ind.code} : série vide`); ok = false; continue; }
    const lastYear = Number(series[series.length - 1].date);
    const nature = lastYear > currentYear ? "projection" : lastYear === currentYear ? "estimation" : "historique";
    indicators.push({
      id: ind.id,
      category: "economie",
      title: ind.title,
      unit: ind.unit,
      frequency: "annuelle",
      nature,
      source: {
        name: "FMI — World Economic Outlook",
        url: `https://www.imf.org/external/datamapper/${ind.code}@WEO/SEN`,
        retrievedAt: NOW,
      },
      explanation: ind.id,
      series,
    });
  }
  return { indicators, ok };
}

// ────────────────────────────────────────────────────────────────────────
// Banque mondiale — démographie
// Endpoint: https://api.worldbank.org/v2/country/SEN/indicator/{CODE}?format=json
// ────────────────────────────────────────────────────────────────────────
const WB_BASE = "https://api.worldbank.org/v2/country/SEN/indicator";
const WB_INDICATORS = [
  { id: "population-total", code: "SP.POP.TOTL", title: "Population totale", unit: "habitants" },
  { id: "population-urbaine", code: "SP.URB.TOTL.IN.ZS", title: "Population urbaine", unit: "% du total" },
  { id: "esperance-vie", code: "SP.DYN.LE00.IN", title: "Espérance de vie à la naissance", unit: "ans" },
];

async function fetchWorldBank() {
  const indicators = [];
  let ok = true;
  for (const ind of WB_INDICATORS) {
    const data = await safeJson(`${WB_BASE}/${ind.code}?format=json&per_page=80`, `BM ${ind.code}`);
    if (!Array.isArray(data) || data.length < 2 || !Array.isArray(data[1])) { ok = false; continue; }
    const series = data[1]
      .filter((row) => row && row.value !== null && row.date)
      .map((row) => ({ date: String(row.date), value: Number(row.value) }))
      .sort((a, b) => Number(a.date) - Number(b.date))
      .slice(-25);
    if (!series.length) { warn(`BM ${ind.code} : série vide`); ok = false; continue; }
    indicators.push({
      id: ind.id,
      category: "demographie",
      title: ind.title,
      unit: ind.unit,
      frequency: "annuelle",
      nature: "historique",
      source: {
        name: "Banque mondiale — World Development Indicators",
        url: `https://data.worldbank.org/indicator/${ind.code}?locations=SN`,
        retrievedAt: NOW,
      },
      explanation: ind.id,
      series,
    });
  }
  return { indicators, ok };
}

// ────────────────────────────────────────────────────────────────────────
// Banque mondiale — secours économique si FMI indisponible
// ────────────────────────────────────────────────────────────────────────
const WB_ECONOMY = [
  { id: "pib-courant", code: "NY.GDP.MKTP.CD", title: "PIB nominal", unit: "Mds USD", scale: 1e-9 },
  { id: "croissance-pib", code: "NY.GDP.MKTP.KD.ZG", title: "Croissance du PIB en volume", unit: "%" },
  { id: "inflation", code: "FP.CPI.TOTL.ZG", title: "Inflation moyenne (IPC)", unit: "%" },
  { id: "dette-publique", code: "GC.DOD.TOTL.GD.ZS", title: "Dette publique brute", unit: "% PIB" },
];

async function fetchWorldBankEconomy() {
  const indicators = [];
  let ok = true;
  for (const ind of WB_ECONOMY) {
    const data = await safeJson(`${WB_BASE}/${ind.code}?format=json&per_page=80`, `BM éco ${ind.code}`);
    if (!Array.isArray(data) || data.length < 2 || !Array.isArray(data[1])) { ok = false; continue; }
    const scale = ind.scale ?? 1;
    const series = data[1]
      .filter((row) => row && row.value !== null && row.date)
      .map((row) => ({ date: String(row.date), value: Number(row.value) * scale }))
      .sort((a, b) => Number(a.date) - Number(b.date))
      .slice(-25);
    if (!series.length) { warn(`BM éco ${ind.code} : série vide`); ok = false; continue; }
    indicators.push({
      id: ind.id,
      category: "economie",
      title: ind.title,
      unit: ind.unit,
      frequency: "annuelle",
      nature: "historique",
      source: {
        name: "Banque mondiale — World Development Indicators",
        url: `https://data.worldbank.org/indicator/${ind.code}?locations=SN`,
        retrievedAt: NOW,
      },
      explanation: ind.id,
      series,
    });
  }
  return { indicators, ok };
}

// ────────────────────────────────────────────────────────────────────────
// Open-Meteo — climat (14 derniers jours à Dakar)
// Endpoint archive: https://archive-api.open-meteo.com/v1/archive
// ────────────────────────────────────────────────────────────────────────
async function fetchClimateDakar() {
  const end = new Date();
  end.setDate(end.getDate() - 1); // l'API archive a un délai de J-1
  const start = new Date(end);
  start.setDate(end.getDate() - 13);
  const fmt = (d) => d.toISOString().slice(0, 10);
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=14.6928&longitude=-17.4467&start_date=${fmt(start)}&end_date=${fmt(end)}&daily=temperature_2m_mean,precipitation_sum&timezone=Africa%2FDakar`;
  const data = await safeJson(url, "Open-Meteo Dakar");
  if (!data?.daily?.time) return { indicators: [], ok: false };
  const days = data.daily.time;
  const temps = data.daily.temperature_2m_mean ?? [];
  const rains = data.daily.precipitation_sum ?? [];
  const source = {
    name: "Open-Meteo (modèle ERA5) · ANACIM (référence officielle)",
    url: "https://open-meteo.com/",
    retrievedAt: NOW,
  };
  const indicators = [
    {
      id: "temp-dakar",
      category: "climat",
      title: "Température moyenne quotidienne — Dakar",
      unit: "°C",
      frequency: "quotidienne",
      nature: "historique",
      source,
      explanation: "temp-dakar",
      region: "Dakar",
      series: days.map((d, i) => ({ date: d, value: temps[i] ?? null })).filter((p) => p.value !== null),
    },
    {
      id: "pluie-dakar",
      category: "climat",
      title: "Précipitations quotidiennes — Dakar",
      unit: "mm",
      frequency: "quotidienne",
      nature: "historique",
      source,
      explanation: "pluie-dakar",
      region: "Dakar",
      series: days.map((d, i) => ({ date: d, value: rains[i] ?? null })).filter((p) => p.value !== null),
    },
  ];
  return { indicators, ok: indicators.every((i) => i.series.length > 0) };
}

// ────────────────────────────────────────────────────────────────────────
// Pipeline
// ────────────────────────────────────────────────────────────────────────
async function main() {
  log("Démarrage du rafraîchissement");
  const meta = await readJsonOrDefault("meta.json", { generatedAt: NOW, sources: {} });

  // Économie : FMI d'abord, Banque mondiale en secours
  const imf = await fetchImf();
  if (imf.indicators.length) {
    await writeJson("economy.json", { indicators: imf.indicators });
    log(`FMI : ${imf.indicators.length} indicateur(s) écrit(s)`);
    meta.sources.imf = { lastFetch: NOW, ok: imf.ok };
  } else {
    warn("FMI indisponible, bascule sur Banque mondiale");
    const wbEco = await fetchWorldBankEconomy();
    if (wbEco.indicators.length) {
      await writeJson("economy.json", { indicators: wbEco.indicators });
      log(`Banque mondiale (éco) : ${wbEco.indicators.length} indicateur(s) écrit(s)`);
    } else {
      warn("Aucune source économique disponible, JSON existant conservé");
    }
    meta.sources.imf = { lastFetch: NOW, ok: false, note: "Indisponible — secours Banque mondiale utilisé" };
  }

  // Banque mondiale
  const wb = await fetchWorldBank();
  if (wb.indicators.length) {
    await writeJson("demography.json", { indicators: wb.indicators });
    log(`Banque mondiale : ${wb.indicators.length} indicateur(s) écrit(s)`);
  } else {
    warn("Banque mondiale : aucun indicateur récupéré, JSON existant conservé");
  }
  meta.sources.worldbank = { lastFetch: NOW, ok: wb.ok };

  // Open-Meteo
  const climate = await fetchClimateDakar();
  if (climate.indicators.length) {
    const existing = await readJsonOrDefault("climate.json", { indicators: [], forecast: [] });
    await writeJson("climate.json", { indicators: climate.indicators, forecast: existing.forecast ?? [] });
    log(`Open-Meteo : ${climate.indicators.length} série(s) écrite(s)`);
  } else {
    warn("Open-Meteo : aucune série récupérée, JSON existant conservé");
  }
  meta.sources.openMeteo = { lastFetch: NOW, ok: climate.ok };

  // ANSD : snapshot manuel — on note simplement la dernière vérif.
  meta.sources.ansd = {
    lastFetch: meta.sources.ansd?.lastFetch ?? NOW,
    ok: meta.sources.ansd?.ok ?? false,
    note: "Snapshot manuel trimestriel — voir page Méthodologie",
  };

  meta.generatedAt = NOW;
  await writeJson("meta.json", meta);
  log("Terminé");
}

main().catch((err) => {
  console.error("[refresh] échec global :", err);
  // Ne pas faire échouer le build : on garde les données précédentes.
  process.exit(0);
});
