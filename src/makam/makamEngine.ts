// makamEngine.ts
// Tüm makam teorisi hesaplamalarının merkezi.
// centTables.ts + seyirPatterns.ts kullanan üst katman.

import { centTablosu, DereceOffset, gercekHz, midiAdiToSayi, midiSayiToHz, PERDE_TOLERANS_CENT, yedenler } from './centTables';
import { seyirKaliplari, MakamSeyir } from './seyirPatterns';

// ── PITCH MATCHING ─────────────────────────────────────────────────

export interface PitchAnalizSonucu {
  algilanHzFrekans: number;
  enYakinDerece: DereceOffset;
  centFark: number;       // gerçek perdeye cent farkı (+ = tiz, - = pest)
  komaFark: number;       // cent → koma dönüşümü
  makamda: boolean;       // tolerans içinde mi?
  dogruluk: number;       // 0-100 yüzde
  mesaj: string;
  yeden: boolean;         // yeden perdesi mi?
}

// Hz farkını cent'e çevir
function hzToCent(algilanan: number, referans: number): number {
  return 1200 * Math.log2(algilanan / referans);
}

// Cent'ten koma'ya
function centToKoma(cent: number): number {
  return cent / (1200 / 53);
}

// Bir frekansı makama göre analiz et
export function makamAnalizEt(
  algilanHz: number,
  makamId: string,
): PitchAnalizSonucu {
  const dereceler = centTablosu[makamId];
  if (!dereceler) {
    return {
      algilanHzFrekans: algilanHz,
      enYakinDerece: { perde: '?', midi: 'C4', centOffset: 0, komaKumulatif: 0, hz: 261 },
      centFark: 0,
      komaFark: 0,
      makamda: false,
      dogruluk: 0,
      mesaj: 'Makam bulunamadı',
      yeden: false,
    };
  }

  // Her derece için ±3 oktav kontrol et, en yakını bul
  let enYakin = dereceler[0];
  let enKucukCentFark = Infinity;
  let enKucukAbsCent  = Infinity;

  for (const derece of dereceler) {
    const midiNum = midiAdiToSayi(derece.midi);
    for (const oktShift of [-2, -1, 0, 1, 2]) {
      const referansHz = midiSayiToHz(midiNum + oktShift * 12) * Math.pow(2, derece.centOffset / 1200);
      if (referansHz < 40 || referansHz > 4200) continue;
      const centFark = hzToCent(algilanHz, referansHz);
      const absCent  = Math.abs(centFark);
      if (absCent < enKucukAbsCent) {
        enKucukAbsCent  = absCent;
        enKucukCentFark = centFark;
        enYakin         = derece;
      }
    }
  }

  const makamda  = enKucukAbsCent <= PERDE_TOLERANS_CENT;
  const komaFark = centToKoma(enKucukCentFark);
  const abs      = Math.abs(enKucukCentFark);
  const dogruluk = abs <= 10 ? 100 : abs <= 20 ? 90 : abs <= 35 ? 75 : abs <= 50 ? 55 : 20;

  // Yeden kontrolü
  const yedenBilgi = yedenler[makamId];
  const yeden = yedenBilgi?.perde === enYakin.perde;

  // Mesaj
  let mesaj = '';
  if (!makamda) {
    mesaj = `"${enYakin.perde}" bu makamda yok`;
  } else if (abs <= 10) {
    mesaj = `${enYakin.perde} — tam isabet ✓`;
  } else if (abs <= 25) {
    mesaj = `${enYakin.perde} — çok yakın`;
  } else if (abs <= 50) {
    mesaj = `${enYakin.perde} — ${enKucukCentFark > 0 ? '+' : ''}${Math.round(enKucukCentFark)} cent`;
  } else {
    mesaj = `${enYakin.perde} — ${abs.toFixed(0)} cent ${enKucukCentFark > 0 ? 'tiz' : 'pest'}`;
  }

  return {
    algilanHzFrekans: algilanHz,
    enYakinDerece:    enYakin,
    centFark:         Math.round(enKucukCentFark * 10) / 10,
    komaFark:         Math.round(komaFark * 10) / 10,
    makamda,
    dogruluk,
    mesaj,
    yeden,
  };
}

// ── SEYIR ANALİZİ ─────────────────────────────────────────────────

export interface SeyirAnalizSonucu {
  yon: 'yukari' | 'asagi' | 'sabit';
  gucluVurguYapildi: boolean;
  kararaYaklasiyor: boolean;
  mevcutBolge: 'karar-alti' | 'orta' | 'guclu-ustu';
  yorum: string;
}

export function seyirAnalizEt(
  sonKayitlar: Array<{ perde: string; komaKumulatif: number }>,
  makamId: string,
): SeyirAnalizSonucu {
  if (sonKayitlar.length < 3) {
    return { yon: 'sabit', gucluVurguYapildi: false, kararaYaklasiyor: false, mevcutBolge: 'orta', yorum: '' };
  }

  const seyir = seyirKaliplari[makamId];
  const dereceler = centTablosu[makamId];
  if (!seyir || !dereceler) {
    return { yon: 'sabit', gucluVurguYapildi: false, kararaYaklasiyor: false, mevcutBolge: 'orta', yorum: '' };
  }

  const gucluDerece = dereceler.find(d => d.rol === 'guclu');
  const kararDerece = dereceler.find(d => d.rol === 'karar');

  // Son 8 kayıttaki koma kümülatif değerleri
  const son = sonKayitlar.slice(-8);
  const ilkKoma = son[0].komaKumulatif;
  const sonKoma = son[son.length - 1].komaKumulatif;
  const fark = sonKoma - ilkKoma;

  const yon: 'yukari' | 'asagi' | 'sabit' =
    fark > 4 ? 'yukari' : fark < -4 ? 'asagi' : 'sabit';

  // Güçlü vurgu yapıldı mı?
  const gucluVurguYapildi = gucluDerece
    ? sonKayitlar.some(k => k.perde === gucluDerece.perde)
    : false;

  // Karara yaklaşıyor mu?
  const kararaYaklasiyor = kararDerece
    ? Math.abs(sonKoma - kararDerece.komaKumulatif) < 10 && yon === 'asagi'
    : false;

  // Mevcut bölge
  const gucluKoma = gucluDerece?.komaKumulatif ?? 30;
  const mevcutBolge =
    sonKoma < 15 ? 'karar-alti' :
    sonKoma > gucluKoma - 5 ? 'guclu-ustu' : 'orta';

  const yorum =
    yon === 'yukari' ? '↗ Tizleşiyor' :
    yon === 'asagi'  ? '↘ Pesleşiyor' : '→ Sabit bölge';

  return { yon, gucluVurguYapildi, kararaYaklasiyor, mevcutBolge, yorum };
}

// ── REFERANS FREKANS ──────────────────────────────────────────────

// Belirli bir makam derecesinin gerçek frekansını döndür (cent offset dahil)
export function dereceHz(makamId: string, derece: number, oktavShift = 0): number {
  const tab = centTablosu[makamId];
  if (!tab || derece >= tab.length) return 440;
  const d = tab[derece];
  const midiNum = midiAdiToSayi(d.midi) + oktavShift * 12;
  return midiSayiToHz(midiNum) * Math.pow(2, d.centOffset / 1200);
}

// Makamın tüm derecelerini Hz olarak döndür
export function makamHzleri(makamId: string): number[] {
  const tab = centTablosu[makamId];
  if (!tab) return [];
  return tab.map(d => {
    const midiNum = midiAdiToSayi(d.midi);
    return midiSayiToHz(midiNum) * Math.pow(2, d.centOffset / 1200);
  });
}

// Tone.js için detune değeri hesapla (cent offset → Tone.js detune parametresi)
export function toneDetune(makamId: string, derece: number): number {
  const tab = centTablosu[makamId];
  if (!tab || derece >= tab.length) return 0;
  return tab[derece].centOffset;
}

// Makam bilgisi özeti
export function makamOzeti(makamId: string) {
  const tab  = centTablosu[makamId];
  const seyir = seyirKaliplari[makamId];
  const yeden = yedenler[makamId];
  return { dereceler: tab, seyir, yeden };
}
