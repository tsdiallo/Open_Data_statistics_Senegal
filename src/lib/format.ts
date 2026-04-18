const nfCompact = new Intl.NumberFormat("fr-FR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const nfStandard = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 2,
});

const dfLong = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatNumber(value: number | null, opts?: { compact?: boolean }): string {
  if (value === null || Number.isNaN(value)) return "—";
  return opts?.compact ? nfCompact.format(value) : nfStandard.format(value);
}

export function formatPercent(value: number | null, digits = 1): string {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(digits).replace(".", ",")} %`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dfLong.format(d);
}

export function delta(current: number, previous: number): { value: number; sign: "up" | "down" | "flat" } {
  const diff = current - previous;
  return {
    value: diff,
    sign: diff > 0 ? "up" : diff < 0 ? "down" : "flat",
  };
}
