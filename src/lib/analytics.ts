import type { DataPoint } from "./types";

export interface SeriesStats {
  count: number;
  min: { date: string; value: number } | null;
  max: { date: string; value: number } | null;
  mean: number | null;
  last: DataPoint | null;
  first: DataPoint | null;
  delta: number | null;          // dernière - première
  deltaPct: number | null;       // variation % entre première et dernière (si non-zéro)
  yoy: number | null;             // variation % entre l'avant-dernière et la dernière
}

export function computeStats(series: DataPoint[]): SeriesStats {
  const pts = series.filter((p): p is { date: string; value: number } => p.value !== null);
  if (!pts.length) {
    return { count: 0, min: null, max: null, mean: null, last: null, first: null, delta: null, deltaPct: null, yoy: null };
  }
  let min = pts[0], max = pts[0], sum = 0;
  for (const p of pts) {
    if (p.value < min.value) min = p;
    if (p.value > max.value) max = p;
    sum += p.value;
  }
  const first = pts[0];
  const last = pts[pts.length - 1];
  const prev = pts.length >= 2 ? pts[pts.length - 2] : null;
  const delta = last.value - first.value;
  const deltaPct = first.value !== 0 ? (delta / Math.abs(first.value)) * 100 : null;
  const yoy = prev && prev.value !== 0 ? ((last.value - prev.value) / Math.abs(prev.value)) * 100 : null;
  return {
    count: pts.length,
    min,
    max,
    mean: sum / pts.length,
    last,
    first,
    delta,
    deltaPct,
    yoy,
  };
}

export function toCsv(series: DataPoint[], label = "valeur"): string {
  const rows = ["date," + label];
  for (const p of series) rows.push(`${p.date},${p.value ?? ""}`);
  return rows.join("\n");
}

// Détecte l'année de coupure historique/projection pour une série annuelle.
// Retourne l'année à partir de laquelle les valeurs sont à considérer comme projetées.
export function inferProjectionCutoff(series: DataPoint[]): number | null {
  if (!series.length) return null;
  const years = series.map((p) => Number(p.date)).filter(Number.isFinite);
  if (!years.length) return null;
  const currentYear = new Date().getFullYear();
  const maxYear = Math.max(...years);
  if (maxYear <= currentYear) return null;
  return currentYear;
}
