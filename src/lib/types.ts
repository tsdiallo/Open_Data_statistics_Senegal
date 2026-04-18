export type Category = "demographie" | "economie" | "climat";

export type Frequency =
  | "annuelle"
  | "trimestrielle"
  | "mensuelle"
  | "quotidienne"
  | "horaire"
  | "ponctuelle";

export type DataNature =
  | "historique"
  | "estimation"
  | "projection"
  | "prevision";

export interface Source {
  name: string;
  url: string;
  retrievedAt: string;
}

export interface DataPoint {
  date: string;
  value: number | null;
}

export interface Indicator {
  id: string;
  category: Category;
  title: string;
  unit: string;
  frequency: Frequency;
  nature: DataNature;
  source: Source;
  explanation: string;
  series: DataPoint[];
  region?: string;
}

export interface DatasetMeta {
  generatedAt: string;
  sources: Record<string, { lastFetch: string; ok: boolean; note?: string }>;
}
