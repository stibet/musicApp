import type { Makam } from '../data/makamlar';
import { enYakinPerde, komaHesapla, makamFrekanslar } from './pitchDetector';

export interface MakamPitchFrame {
  frekans: number;
  perdeIsmi: string;
  hedefHz: number;
  komaFark: number;
  dereceIndex: number;
  dogruluk: number;
}

export interface MakamSessionStats {
  toplamFrame: number;
  dogruFrame: number;
  ortalamaMutlakKoma: number;
  isabetYuzde: number;
  baskinPerdeler: { isim: string; adet: number }[];
}

export function makamReferanslariniOlustur(makam: Makam, durakHz = 220) {
  const perdeFrekanslari = makamFrekanslar(makam.komaDizisi, durakHz);
  const dereceler = makam.perdeler.map((isim, index) => ({
    isim,
    frekans: perdeFrekanslari[index] ?? durakHz,
    index,
  }));

  const oktavli: Array<{ isim: string; frekans: number; index: number; octShift: number }> = [];
  const carpans = [0.5, 1, 2];
  for (let oktavIndex = 0; oktavIndex < carpans.length; oktavIndex++) {
    const carpan = carpans[oktavIndex];
    for (const d of dereceler) {
      oktavli.push({
        isim: d.isim,
        frekans: d.frekans * carpan,
        index: d.index,
        octShift: oktavIndex - 1,
      });
    }
  }

  return oktavli;
}

export function frekansiMakamaGoreAnalizEt(
  frekans: number,
  makam: Makam,
  durakHz = 220,
): MakamPitchFrame {
  const refs = makamReferanslariniOlustur(makam, durakHz);
  let enIyi = refs[0];
  let enKucuk = Number.POSITIVE_INFINITY;

  for (const ref of refs) {
    const fark = Math.abs(komaHesapla(frekans, ref.frekans));
    if (fark < enKucuk) {
      enKucuk = fark;
      enIyi = ref;
    }
  }

  const komaFark = komaHesapla(frekans, enIyi.frekans);
  const dogruluk = komaFarkToDogruluk(komaFark);

  return {
    frekans,
    perdeIsmi: enIyi.isim,
    hedefHz: Math.round(enIyi.frekans * 10) / 10,
    komaFark,
    dereceIndex: enIyi.index,
    dogruluk,
  };
}

export function komaFarkToDogruluk(komaFark: number): number {
  const abs = Math.abs(komaFark);
  if (abs <= 1) return 100;
  if (abs <= 2) return 90;
  if (abs <= 3) return 75;
  if (abs <= 4) return 60;
  if (abs <= 6) return 40;
  return 15;
}

export function sessionIstatistigiHesapla(frames: MakamPitchFrame[]): MakamSessionStats {
  if (frames.length === 0) {
    return {
      toplamFrame: 0,
      dogruFrame: 0,
      ortalamaMutlakKoma: 0,
      isabetYuzde: 0,
      baskinPerdeler: [],
    };
  }

  const dogruFrame = frames.filter((f) => Math.abs(f.komaFark) <= 2).length;
  const ortalamaMutlakKoma =
    Math.round((frames.reduce((sum, f) => sum + Math.abs(f.komaFark), 0) / frames.length) * 10) / 10;
  const sayac = new Map<string, number>();
  for (const frame of frames) {
    sayac.set(frame.perdeIsmi, (sayac.get(frame.perdeIsmi) ?? 0) + 1);
  }

  const baskinPerdeler = [...sayac.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([isim, adet]) => ({ isim, adet }));

  return {
    toplamFrame: frames.length,
    dogruFrame,
    ortalamaMutlakKoma,
    isabetYuzde: Math.round((dogruFrame / frames.length) * 100),
    baskinPerdeler,
  };
}

export function perdeDurumMetni(komaFark: number, tr: boolean) {
  const abs = Math.abs(komaFark);
  if (abs <= 1) return tr ? 'Tam hedefte' : 'On target';
  if (abs <= 3) return tr ? 'Yakın ama düzeltilebilir' : 'Close but needs correction';
  return tr ? 'Perde kaçıyor' : 'Pitch drifting';
}
