// makamDef.ts — TEK KAYNAK
// UI, playback, analyzer, egzersiz motoru hep buradan beslenecek.
// centTables + makamPracticeDefs + seyirPatterns → tek obje.

// ── TİPLER ────────────────────────────────────────────────────────

export type SeyirTipi = 'cikici' | 'inici' | 'inici-cikici';
export type DereceRol = 'karar' | 'guclu' | 'yeden' | 'gecis';
export type Zorluk = 1 | 2 | 3;
export type EgzersizSeviye = 'baslangic' | 'orta' | 'ileri';

export interface MakamDerece {
  index: number;           // 0-bazlı derece sırası
  turAdi: string;          // Türk perde adı
  batiAdi: string;         // Batı nota adı (yaklaşık)
  midi: string;            // En yakın standart MIDI notası
  centOffset: number;      // O MIDI'dan cent sapması (Python ile doğrulandı)
  komaKumulatif: number;   // Karar perdesinden kümülatif koma
  hz: number;              // Gerçek frekans
  rol: DereceRol | null;
}

export interface SeyirCumlesi {
  id: string;
  baslik: string;
  aciklama: string;
  dereceler: number[];     // derece index'leri
  tip: 'acilis' | 'karar' | 'guclu' | 'karakteristik' | 'tam';
  tags: string[];
}

export interface MakamDef {
  id: string;
  turAdi: string;
  enAdi: string;
  karakterAciklama: string;
  seyirTipi: SeyirTipi;
  zorluk: Zorluk;
  uygunSeviyeler: EgzersizSeviye[];
  karar_hz: number;
  dereceler: MakamDerece[];
  yedenAciklama: string;
  benzerMakamlar: string[];
  ornekEserler: string[];
  seyirCumleleri: SeyirCumlesi[];
}

// ── VERİ ─────────────────────────────────────────────────────────

export const makamDefler: MakamDef[] = [

  // ── RAST ────────────────────────────────────────────────────────
  {
    id: 'rast',
    turAdi: 'Rast',
    enAdi: 'Rast',
    karakterAciklama: 'Neşeli, dengeli, huzurlu. Türk müziğinin temel makamı. Çıkıcı seyiriyle aşağıdan yukarı hareket eder. Si koma♭ perdesi Batı Si♭\'inden 15 cent tiz çalınır.',
    seyirTipi: 'cikici',
    zorluk: 1,
    uygunSeviyeler: ['baslangic', 'orta', 'ileri'],
    karar_hz: 196.00,
    yedenAciklama: 'Fa♯ koma♭ perdesi Sol kararına güçlü çekim yapar.',
    benzerMakamlar: ['mahur'],
    ornekEserler: ['Yine Bir Gülnihal', 'Rast Saz Semaisi', 'Gönlüm Sana Meyyal'],
    dereceler: [
      { index: 0, turAdi: 'Sol',       batiAdi: 'G',   midi: 'G3',  centOffset:  +0.0, komaKumulatif: 0,  hz: 196.00, rol: 'karar' },
      { index: 1, turAdi: 'La',        batiAdi: 'A',   midi: 'A3',  centOffset:  +3.8, komaKumulatif: 9,  hz: 220.48, rol: null },
      { index: 2, turAdi: 'Si koma♭',  batiAdi: 'B~',  midi: 'B3',  centOffset: -15.1, komaKumulatif: 17, hz: 244.80, rol: null },
      { index: 3, turAdi: 'Do',        batiAdi: 'C',   midi: 'C4',  centOffset:  -1.9, komaKumulatif: 22, hz: 261.34, rol: null },
      { index: 4, turAdi: 'Re',        batiAdi: 'D',   midi: 'D4',  centOffset:  +1.9, komaKumulatif: 31, hz: 293.99, rol: 'guclu' },
      { index: 5, turAdi: 'Mi',        batiAdi: 'E',   midi: 'E4',  centOffset:  +5.7, komaKumulatif: 40, hz: 330.71, rol: null },
      { index: 6, turAdi: 'Fa♯ koma♭', batiAdi: 'F#~', midi: 'F#4', centOffset: -13.2, komaKumulatif: 48, hz: 367.19, rol: 'yeden' },
      { index: 7, turAdi: 'Sol',       batiAdi: 'G',   midi: 'G4',  centOffset:  +0.0, komaKumulatif: 53, hz: 392.00, rol: 'karar' },
    ],
    seyirCumleleri: [
      { id: 'rast_acilis',    baslik: 'Açılış',         aciklama: 'Sol\'den Re güçlüsüne çıkıcı',       dereceler: [0,1,2,3,4],        tip: 'acilis',        tags: ['cikici','kolay'] },
      { id: 'rast_karar',     baslik: 'Karar Cümlesi',  aciklama: 'Fa♯k yedenden Sol kararına',          dereceler: [5,4,3,2,6,7,0],    tip: 'karar',         tags: ['yeden','orta'] },
      { id: 'rast_guclu',     baslik: 'Güçlü Vurgusu',  aciklama: 'Re güçlü çevresi dolaşımı',          dereceler: [3,4,5,4,3,2,1,0],  tip: 'guclu',         tags: ['guclu','orta'] },
      { id: 'rast_tam',       baslik: 'Tam Rast Cümlesi',aciklama: 'Karakteristik çıkıcı-iniş cümlesi', dereceler: [0,1,2,3,4,3,2,6,7,0], tip: 'tam',         tags: ['tam','ileri'] },
    ],
  },

  // ── HİCAZ ───────────────────────────────────────────────────────
  {
    id: 'hicaz',
    turAdi: 'Hicaz',
    enAdi: 'Hijaz',
    karakterAciklama: 'Dramatik, hüzünlü. Mi♭ koma (4 koma) ile Fa♯ (17 koma) arasındaki 13 komalık büyük artık ikili makamın kimliğidir. İnici-çıkıcı seyir.',
    seyirTipi: 'inici-cikici',
    zorluk: 2,
    uygunSeviyeler: ['orta', 'ileri'],
    karar_hz: 293.66,
    yedenAciklama: 'Do♯ perdesi Re kararına çekim yapar.',
    benzerMakamlar: ['kurdi'],
    ornekEserler: ['Hicaz Longa', 'Yine Şûl Oldu Gönlüm', 'Hicazkar Longa'],
    dereceler: [
      { index: 0, turAdi: 'Re',       batiAdi: 'D',   midi: 'D4',  centOffset:  +0.0, komaKumulatif: 0,  hz: 293.66, rol: 'karar' },
      { index: 1, turAdi: 'Mi♭ koma', batiAdi: 'Eb~', midi: 'D#4', centOffset:  -9.5, komaKumulatif: 4,  hz: 309.43, rol: null },
      { index: 2, turAdi: 'Fa♯',      batiAdi: 'F#',  midi: 'F#4', centOffset: -15.1, komaKumulatif: 17, hz: 366.78, rol: null },
      { index: 3, turAdi: 'Sol',      batiAdi: 'G',   midi: 'G4',  centOffset:  -1.9, komaKumulatif: 22, hz: 391.56, rol: null },
      { index: 4, turAdi: 'La',       batiAdi: 'A',   midi: 'A4',  centOffset:  +1.9, komaKumulatif: 31, hz: 440.47, rol: 'guclu' },
      { index: 5, turAdi: 'Si♭ koma', batiAdi: 'Bb~', midi: 'A#4', centOffset:  -7.6, komaKumulatif: 35, hz: 464.13, rol: null },
      { index: 6, turAdi: 'Do♯',      batiAdi: 'C#',  midi: 'C#5', centOffset: -13.2, komaKumulatif: 48, hz: 550.14, rol: 'yeden' },
      { index: 7, turAdi: 'Re',       batiAdi: 'D',   midi: 'D5',  centOffset:  +0.0, komaKumulatif: 53, hz: 587.32, rol: 'karar' },
    ],
    seyirCumleleri: [
      { id: 'hicaz_karakter', baslik: 'Hicaz Karakteri', aciklama: 'Büyük artık ikili — makamın sesi', dereceler: [0,1,2,1,0],        tip: 'karakteristik', tags: ['artikikili','orta'] },
      { id: 'hicaz_yukari',   baslik: 'Güçlüye Çıkış',  aciklama: 'Re\'den La güçlüsüne',             dereceler: [0,1,2,3,4],        tip: 'acilis',        tags: ['cikici','orta'] },
      { id: 'hicaz_karar',    baslik: 'Karar Dönüşü',   aciklama: 'La\'dan Re kararına iniş',          dereceler: [4,5,4,3,2,1,0],    tip: 'karar',         tags: ['inici','orta'] },
      { id: 'hicaz_tam',      baslik: 'Tam Hicaz',       aciklama: 'Karakteristik açılış + karar',     dereceler: [0,1,2,3,4,3,2,1,0], tip: 'tam',           tags: ['tam','ileri'] },
    ],
  },

  // ── UŞŞAK ───────────────────────────────────────────────────────
  {
    id: 'usak',
    turAdi: 'Uşşak',
    enAdi: 'Ussak',
    karakterAciklama: 'Hüzünlü, içli. İnici seyiriyle yukarıdan aşağı hareket eder. Si koma♭ Uşşak\'ta Rast\'tan daha pest çalınır (8 koma = 181 cent).',
    seyirTipi: 'inici',
    zorluk: 1,
    uygunSeviyeler: ['baslangic', 'orta', 'ileri'],
    karar_hz: 220.00,
    yedenAciklama: 'Sol♯ perdesi La kararına çekim yapar.',
    benzerMakamlar: ['huseyni'],
    ornekEserler: ['Çeşme-i Hüsrev', 'Uşşak Şarkılar'],
    dereceler: [
      { index: 0, turAdi: 'La',      batiAdi: 'A',   midi: 'A3',  centOffset:  +0.0, komaKumulatif: 0,  hz: 220.00, rol: 'karar' },
      { index: 1, turAdi: 'Si koma♭',batiAdi: 'B~',  midi: 'B3',  centOffset: -18.9, komaKumulatif: 8,  hz: 244.26, rol: null },
      { index: 2, turAdi: 'Do',      batiAdi: 'C',   midi: 'C4',  centOffset:  -5.7, komaKumulatif: 13, hz: 260.77, rol: null },
      { index: 3, turAdi: 'Re',      batiAdi: 'D',   midi: 'D4',  centOffset:  -1.9, komaKumulatif: 22, hz: 293.34, rol: 'guclu' },
      { index: 4, turAdi: 'Mi',      batiAdi: 'E',   midi: 'E4',  centOffset:  +1.9, komaKumulatif: 31, hz: 329.99, rol: null },
      { index: 5, turAdi: 'Fa koma', batiAdi: 'F~',  midi: 'F4',  centOffset:  -7.5, komaKumulatif: 35, hz: 347.71, rol: null },
      { index: 6, turAdi: 'Sol♯',    batiAdi: 'G#',  midi: 'G4',  centOffset:  -3.8, komaKumulatif: 44, hz: 391.14, rol: 'yeden' },
      { index: 7, turAdi: 'La',      batiAdi: 'A',   midi: 'A4',  centOffset:  +0.0, komaKumulatif: 53, hz: 440.00, rol: 'karar' },
    ],
    seyirCumleleri: [
      { id: 'usak_inici',  baslik: 'İnici Açılış', aciklama: 'Güçlü Re\'den karar La\'ya',   dereceler: [3,2,1,0],        tip: 'acilis', tags: ['inici','kolay'] },
      { id: 'usak_karar',  baslik: 'Karar',        aciklama: 'La kararına yavaş iniş',       dereceler: [2,1,2,1,0],      tip: 'karar',  tags: ['karar','orta'] },
      { id: 'usak_tam',    baslik: 'Tam Uşşak',    aciklama: 'Karakteristik inici cümle',    dereceler: [3,2,1,0,1,2,3],  tip: 'tam',    tags: ['tam','orta'] },
    ],
  },

  // ── HÜSEYNİ ─────────────────────────────────────────────────────
  {
    id: 'huseyni',
    turAdi: 'Hüseyni',
    enAdi: 'Huseyni',
    karakterAciklama: 'Olgun, asil. Do koma (+17 cent) ve Sol koma (+19 cent) perdeleri karakterini verir. İnici-çıkıcı seyir.',
    seyirTipi: 'inici-cikici',
    zorluk: 2,
    uygunSeviyeler: ['orta', 'ileri'],
    karar_hz: 220.00,
    yedenAciklama: 'Sol koma perdesi La kararına çekim yapar.',
    benzerMakamlar: ['usak'],
    ornekEserler: ['Hüseyni Beste', 'Dilkeşhaveran'],
    dereceler: [
      { index: 0, turAdi: 'La',      batiAdi: 'A',   midi: 'A3',  centOffset:  +0.0, komaKumulatif: 0,  hz: 220.00, rol: 'karar' },
      { index: 1, turAdi: 'Si',      batiAdi: 'B',   midi: 'B3',  centOffset:  +3.8, komaKumulatif: 9,  hz: 247.48, rol: null },
      { index: 2, turAdi: 'Do koma', batiAdi: 'C~',  midi: 'C4',  centOffset: +17.0, komaKumulatif: 14, hz: 264.20, rol: null },
      { index: 3, turAdi: 'Re',      batiAdi: 'D',   midi: 'D4',  centOffset:  -1.9, komaKumulatif: 22, hz: 293.34, rol: null },
      { index: 4, turAdi: 'Mi',      batiAdi: 'E',   midi: 'E4',  centOffset:  +1.9, komaKumulatif: 31, hz: 329.99, rol: 'guclu' },
      { index: 5, turAdi: 'Fa',      batiAdi: 'F#~', midi: 'F#4', centOffset:  +5.7, komaKumulatif: 40, hz: 371.21, rol: null },
      { index: 6, turAdi: 'Sol koma',batiAdi: 'G~',  midi: 'G4',  centOffset: +18.9, komaKumulatif: 45, hz: 396.29, rol: 'yeden' },
      { index: 7, turAdi: 'La',      batiAdi: 'A',   midi: 'A4',  centOffset:  +0.0, komaKumulatif: 53, hz: 440.00, rol: 'karar' },
    ],
    seyirCumleleri: [
      { id: 'huseyni_acilis', baslik: 'Açılış', aciklama: 'La\'dan Mi güçlüsüne',   dereceler: [0,1,2,3,4],      tip: 'acilis', tags: ['cikici','orta'] },
      { id: 'huseyni_karar',  baslik: 'Karar',  aciklama: 'Sol koma yedenden La\'ya', dereceler: [5,6,5,4,3,2,1,0], tip: 'karar', tags: ['yeden','orta'] },
    ],
  },

  // ── NİHAVEND ────────────────────────────────────────────────────
  {
    id: 'nihavend',
    turAdi: 'Nihavend',
    enAdi: 'Nihavend',
    karakterAciklama: 'Batı minörüne en yakın makam. Do♯ (harmonik 7. derece) İnici seyirde kullanılır, dramatik etki yaratır.',
    seyirTipi: 'inici-cikici',
    zorluk: 1,
    uygunSeviyeler: ['baslangic', 'orta', 'ileri'],
    karar_hz: 293.66,
    yedenAciklama: 'Do♯ perdesi Re kararına çekim yapar (harmonik minör karakteri).',
    benzerMakamlar: ['kurdi'],
    ornekEserler: ['Nihavend Longa', 'Nihavent Saz Semaisi'],
    dereceler: [
      { index: 0, turAdi: 'Re',  batiAdi: 'D',  midi: 'D4',  centOffset:  +0.0, komaKumulatif: 0,  hz: 293.66, rol: 'karar' },
      { index: 1, turAdi: 'Mi',  batiAdi: 'E',  midi: 'E4',  centOffset:  +3.7, komaKumulatif: 9,  hz: 330.34, rol: null },
      { index: 2, turAdi: 'Fa',  batiAdi: 'F',  midi: 'F4',  centOffset:  -5.7, komaKumulatif: 13, hz: 348.08, rol: null },
      { index: 3, turAdi: 'Sol', batiAdi: 'G',  midi: 'G4',  centOffset:  -1.9, komaKumulatif: 22, hz: 391.56, rol: null },
      { index: 4, turAdi: 'La',  batiAdi: 'A',  midi: 'A4',  centOffset:  +1.9, komaKumulatif: 31, hz: 440.47, rol: 'guclu' },
      { index: 5, turAdi: 'Si♭', batiAdi: 'Bb', midi: 'A#4', centOffset:  -7.6, komaKumulatif: 35, hz: 464.13, rol: null },
      { index: 6, turAdi: 'Do♯', batiAdi: 'C#', midi: 'C#5', centOffset:  +9.4, komaKumulatif: 49, hz: 557.39, rol: 'yeden' },
      { index: 7, turAdi: 'Re',  batiAdi: 'D',  midi: 'D5',  centOffset:  +0.0, komaKumulatif: 53, hz: 587.32, rol: 'karar' },
    ],
    seyirCumleleri: [
      { id: 'nihavend_acilis',   baslik: 'Açılış',          aciklama: 'Re\'den La güçlüsüne',        dereceler: [0,1,2,3,4],        tip: 'acilis', tags: ['cikici','kolay'] },
      { id: 'nihavend_harmonik', baslik: 'Harmonik Karar',  aciklama: 'Do♯ ile dramatik iniş',       dereceler: [4,5,6,5,4,3,2,1,0], tip: 'karar', tags: ['harmonik','orta'] },
    ],
  },

  // ── SEGAH ───────────────────────────────────────────────────────
  {
    id: 'segah',
    turAdi: 'Segah',
    enAdi: 'Segah',
    karakterAciklama: 'Derin, mistik. Si koma♭ ve Mi koma♭ perdeleri her ikisi de yarım tonun altında — yoğun, tasavvuf karakteri. Karar perdesi kendisi zaten B3\'ten -22.7 cent.',
    seyirTipi: 'inici-cikici',
    zorluk: 3,
    uygunSeviyeler: ['ileri'],
    karar_hz: 243.73,
    yedenAciklama: 'La perdesi Si koma♭ kararına çekim yapar.',
    benzerMakamlar: [],
    ornekEserler: ['Segah İlahi', 'Segah Beste'],
    dereceler: [
      { index: 0, turAdi: 'Si koma♭', batiAdi: 'B~',  midi: 'B3',  centOffset: -22.7, komaKumulatif: 0,  hz: 243.73, rol: 'karar' },
      { index: 1, turAdi: 'Do',       batiAdi: 'C',   midi: 'C4',  centOffset:  -9.4, komaKumulatif: 5,  hz: 260.20, rol: null },
      { index: 2, turAdi: 'Re',       batiAdi: 'D',   midi: 'D4',  centOffset:  -5.7, komaKumulatif: 14, hz: 292.70, rol: null },
      { index: 3, turAdi: 'Mi koma♭', batiAdi: 'E~',  midi: 'E4',  centOffset: -24.5, komaKumulatif: 22, hz: 324.99, rol: 'guclu' },
      { index: 4, turAdi: 'Fa',       batiAdi: 'F#~', midi: 'F#4', centOffset: -20.8, komaKumulatif: 31, hz: 365.58, rol: null },
      { index: 5, turAdi: 'Sol',      batiAdi: 'G',   midi: 'G4',  centOffset:  -7.6, komaKumulatif: 36, hz: 390.29, rol: null },
      { index: 6, turAdi: 'La',       batiAdi: 'A',   midi: 'A4',  centOffset:  -3.8, komaKumulatif: 45, hz: 439.04, rol: 'yeden' },
      { index: 7, turAdi: 'Si koma♭', batiAdi: 'B~',  midi: 'B4',  centOffset: -22.7, komaKumulatif: 53, hz: 487.46, rol: 'karar' },
    ],
    seyirCumleleri: [
      { id: 'segah_acilis', baslik: 'Segah Açılışı', aciklama: 'Karar\'dan güçlü Mi koma♭\'ye', dereceler: [0,1,2,3],        tip: 'acilis', tags: ['cikici','ileri'] },
      { id: 'segah_karar',  baslik: 'Mistik Karar',  aciklama: 'La yedenden Si koma♭\'ye',      dereceler: [6,7,6,0],        tip: 'karar',  tags: ['yeden','ileri'] },
    ],
  },
];

// ── YARDIMCI FONKSİYONLAR ────────────────────────────────────────

export function getMakamDef(id: string): MakamDef | undefined {
  return makamDefler.find(m => m.id === id);
}

export function getDerece(makamId: string, index: number): MakamDerece | undefined {
  return getMakamDef(makamId)?.dereceler[index];
}

export function getDereceHz(makamId: string, index: number): number {
  return getDerece(makamId, index)?.hz ?? 440;
}

export function getDereceLabel(makamId: string, index: number, mod: 'turk' | 'bati' | 'ikisi' = 'ikisi'): string {
  const d = getDerece(makamId, index);
  if (!d) return '?';
  if (mod === 'turk') return d.turAdi;
  if (mod === 'bati') return d.batiAdi;
  return `${d.turAdi} · ${d.batiAdi}`;
}

export function getKararDerece(makamId: string): MakamDerece | undefined {
  return getMakamDef(makamId)?.dereceler.find(d => d.rol === 'karar');
}

export function getGucluDerece(makamId: string): MakamDerece | undefined {
  return getMakamDef(makamId)?.dereceler.find(d => d.rol === 'guclu');
}

export function getYedenDerece(makamId: string): MakamDerece | undefined {
  return getMakamDef(makamId)?.dereceler.find(d => d.rol === 'yeden');
}

export function getSeyirCumlesi(makamId: string, tip: SeyirCumlesi['tip']): SeyirCumlesi | undefined {
  return getMakamDef(makamId)?.seyirCumleleri.find(c => c.tip === tip);
}

// Zorluk seviyesine göre makamları filtrele
export function getMakamlariSeviyeye(seviye: EgzersizSeviye): MakamDef[] {
  return makamDefler.filter(m => m.uygunSeviyeler.includes(seviye));
}
