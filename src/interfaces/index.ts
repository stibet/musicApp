// interfaces/index.ts
// Mac'e geçince sadece bu interface'lerin implementasyonu değişir.
// UI ve mantık katmanları hiç dokunulmaz.

import type { MakamDerece, SeyirCumlesi } from '../makam/makamDef';

// ── SES MOTORU ────────────────────────────────────────────────────
export interface IAudioEngine {
  baslat(): Promise<void>;
  hazirMi(): boolean;
  // Derece bazlı çalma (makamId + derece index → doğru cent offset uygulanır)
  calDerece(makamId: string, dereceIndex: number, enstrumanId: string, sure?: string): void;
  // MIDI bazlı çalma (cent offset ile)
  calMidi(midi: string, centOffset: number, enstrumanId: string, sure?: string): void;
  // Dizi çalma
  calDiziAsync(makamId: string, dereceler: number[], enstrumanId: string, tempo: number, onStep?: (i: number) => void): Promise<void>;
  // Seyir cümlesi çalma
  calSeyir(makamId: string, cumle: SeyirCumlesi, enstrumanId: string, tempo: number): Promise<void>;
}

// ── PITCH DEDEKTÖRÜ ──────────────────────────────────────────────
export interface IPitchDetector {
  baslat(): Promise<void>;
  durdur(): void;
  onPitch(callback: (hz: number, clarity: number) => void): void;
  offPitch(): void;
}

// ── MAKAM ANALİZÖRÜ ──────────────────────────────────────────────
export interface IPitchAnalysisResult {
  algilananHz: number;
  enYakinDerece: MakamDerece;
  centFark: number;
  komaFark: number;
  makamda: boolean;
  dogruluk: number; // 0-100
  mesaj: string;
}

export interface IMakamAnalyzer {
  analiz(hz: number, makamId: string): IPitchAnalysisResult;
}

// ── PRATIK ANALİZÖRÜ ─────────────────────────────────────────────
export interface IAttempt {
  dereceIndex: number;
  hedefTurAdi: string;
  duyulanTurAdi: string;
  centFark: number;
  dogru: boolean;
  zaman: number;
}

export interface ISessionSummary {
  toplamAttempt: number;
  dogruAttempt: number;
  basariYuzde: number;
  avgAbsCent: number;
  enGucluDereceler: string[];
  enZayifDereceler: string[];
}

export interface IPracticeAnalyzer {
  hedefeKarsiAnaliz(
    hz: number,
    makamId: string,
    hedefDereceIndex: number,
    toleransCent: number,
  ): { dogru: boolean; centFark: number; mesaj: string };

  sessionOzeti(attempts: IAttempt[]): ISessionSummary;
}

// ── EGZERSIZ MOTORU ───────────────────────────────────────────────
export type EgzersizTip =
  | 'dizi-dinlet'
  | 'seyir-dinlet'
  | 'eksik-nota-bul'
  | 'dogru-perdeyi-sec'
  | 'makam-tahmin'
  | 'iki-makam-karsilastir'
  | 'inici-cikici-ayirt'
  | 'guclu-perdesi-bul'
  | 'karar-sesi-bul';

export interface IEgzersizSoru {
  id: string;
  tip: EgzersizTip;
  makamId: string;
  soru: string;
  secenekler?: string[];
  dogruCevap: string | number;
  ipucu?: string;
  puan: number;
}

export interface IEgzersizMotoru {
  soruOlustur(tip: EgzersizTip, makamId: string): IEgzersizSoru;
  cevapKontrol(soru: IEgzersizSoru, cevap: string | number): boolean;
}
