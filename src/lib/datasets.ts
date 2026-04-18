import demography from "@/data/demography.json";
import economy from "@/data/economy.json";
import climate from "@/data/climate.json";
import meta from "@/data/meta.json";
import type { Indicator, DatasetMeta, DataPoint } from "@/lib/types";

interface DemographyFile { indicators: Indicator[] }
interface EconomyFile { indicators: Indicator[] }
interface ClimateFile { indicators: Indicator[]; forecast: DataPoint[] }

export const demographyData = demography as DemographyFile;
export const economyData = economy as EconomyFile;
export const climateData = climate as ClimateFile;
export const datasetMeta = meta as DatasetMeta;

export function findIndicator(list: Indicator[], id: string): Indicator | undefined {
  return list.find((i) => i.id === id);
}

export function latestPoint(series: DataPoint[]): DataPoint | undefined {
  return series.length ? series[series.length - 1] : undefined;
}
