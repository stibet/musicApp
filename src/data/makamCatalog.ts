import { practiceMakamlari } from './makamPracticeDefs';
import { centTablosu } from '../makam/centTables';
import { seyirKaliplari } from '../makam/seyirPatterns';

export interface UnifiedMakamRecord {
  id: string;
  title: string;
  titleEn: string;
  karar: string;
  guclu: string;
  yeden?: string;
  seyir: string;
  aciklama: string;
  zorluk: 1 | 2 | 3;
  perdeler: string[];
  komaDizisi: number[];
  degrees: ReturnType<typeof getMakamDegrees>;
  seyirCumleleri: ReturnType<typeof getSeyirCumleleri>;
}

export function getMakamDegrees(makamId: string) {
  return centTablosu[makamId] ?? [];
}

export function getSeyirCumleleri(makamId: string) {
  return seyirKaliplari[makamId]?.tipikCumleler ?? [];
}

export function getUnifiedMakam(makamId: string): UnifiedMakamRecord | undefined {
  const makam = practiceMakamlari.find((item) => item.id === makamId);
  if (!makam) return undefined;
  const degrees = getMakamDegrees(makamId);
  const yeden = degrees.find((d) => d.rol === 'yeden')?.perde;
  return {
    id: makam.id,
    title: makam.practice.title,
    titleEn: makam.isimEn,
    karar: makam.durak,
    guclu: makam.guclu,
    yeden,
    seyir: makam.seyir,
    aciklama: makam.aciklama,
    zorluk: makam.zorluk,
    perdeler: makam.perdeler,
    komaDizisi: makam.komaDizisi,
    degrees,
    seyirCumleleri: getSeyirCumleleri(makamId),
  };
}

export const unifiedMakams: UnifiedMakamRecord[] = practiceMakamlari
  .map((item) => getUnifiedMakam(item.id))
  .filter(Boolean) as UnifiedMakamRecord[];
