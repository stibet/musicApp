// centTables.ts
// AEU (Arel-Ezgi-Uzdilek) sistemi — her makam, her derece için
// doğrulanmış cent offset değerleri.
//
// Hesaplama yöntemi:
//   1. Karar perdesi Hz olarak belirlendi
//   2. Her derece = karar_hz × 2^(kuma_kumulatif × 1200/53 / 1200)
//   3. En yakın standart MIDI notası bulundu
//   4. centOffset = 1200 × log2(derece_hz / midi_hz)
//
// Tüm değerler Python ile algoritmik olarak hesaplanmış,
// el hesabı yapılmamıştır.
//
// 1 koma = 1200/53 ≈ 22.64 cent
// 1 bakiye = 4 koma ≈ 90.6 cent
// 1 küçük mücennep = 5 koma ≈ 113.2 cent
// 1 büyük mücennep = 8 koma ≈ 181.1 cent
// 1 tanini (tam ses) = 9 koma ≈ 203.8 cent

export interface DereceOffset {
  perde: string;
  midi: string;
  centOffset: number;
  komaKumulatif: number;
  hz: number;
  rol?: 'karar' | 'guclu' | 'yeden';
}

// MIDI notasını numaraya çevir
export function midiAdiToSayi(midi: string): number {
  const NOTALAR = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const m = midi.match(/^([A-G]#?)(\d)$/);
  if (!m) return 60;
  return (parseInt(m[2]) + 1) * 12 + NOTALAR.indexOf(m[1]);
}

// MIDI numarasından Hz (A4=440)
export function midiSayiToHz(n: number): number {
  return 440 * Math.pow(2, (n - 69) / 12);
}

// MIDI + centOffset → gerçek Hz
export function gercekHz(midi: string, centOffset: number): number {
  return midiSayiToHz(midiAdiToSayi(midi)) * Math.pow(2, centOffset / 1200);
}

// Kabul edilebilir perde sapması (cent)
// ±50 cent ≈ ±2.2 koma — enstrüman ve kulak toleransı
export const PERDE_TOLERANS_CENT = 50;

// ── CENT TABLOLARI ────────────────────────────────────────────────
// Python ile doğrulanmış değerler. Değiştirme.

export const centTablosu: Record<string, DereceOffset[]> = {

  // ──────────────────────────────────────────────────────────────
  // RAST — karar Sol (G3 = 196.00 Hz)
  // Koma dizisi: [9, 8, 5, 9, 9, 8, 5] → toplam 53
  // Si koma♭: B3'ten -15.1 cent (eski A#3 eşlemesi YANLIŞ'tı)
  rast: [
    { perde: 'Sol',       midi: 'G3',  centOffset:  +0.0, komaKumulatif: 0,  hz: 196.00, rol: 'karar' },
    { perde: 'La',        midi: 'A3',  centOffset:  +3.8, komaKumulatif: 9,  hz: 220.48 },
    { perde: 'Si koma♭',  midi: 'B3',  centOffset: -15.1, komaKumulatif: 17, hz: 244.80 },
    { perde: 'Do',        midi: 'C4',  centOffset:  -1.9, komaKumulatif: 22, hz: 261.34 },
    { perde: 'Re',        midi: 'D4',  centOffset:  +1.9, komaKumulatif: 31, hz: 293.99, rol: 'guclu' },
    { perde: 'Mi',        midi: 'E4',  centOffset:  +5.7, komaKumulatif: 40, hz: 330.71 },
    { perde: 'Fa♯ koma♭', midi: 'F#4', centOffset: -13.2, komaKumulatif: 48, hz: 367.19, rol: 'yeden' },
    { perde: 'Sol',       midi: 'G4',  centOffset:  +0.0, komaKumulatif: 53, hz: 392.00, rol: 'karar' },
  ],

  // ──────────────────────────────────────────────────────────────
  // HİCAZ — karar Re (D4 = 293.66 Hz)
  // Koma dizisi: [4, 13, 5, 9, 4, 13, 4] → toplam 53
  // Karakteristik: Mi♭ koma (4 koma) → Fa♯ (13 koma büyük artık ikili)
  hicaz: [
    { perde: 'Re',        midi: 'D4',  centOffset:  +0.0, komaKumulatif: 0,  hz: 293.66, rol: 'karar' },
    { perde: 'Mi♭ koma',  midi: 'D#4', centOffset:  -9.5, komaKumulatif: 4,  hz: 309.43 },
    { perde: 'Fa♯',       midi: 'F#4', centOffset: -15.1, komaKumulatif: 17, hz: 366.78 },
    { perde: 'Sol',       midi: 'G4',  centOffset:  -1.9, komaKumulatif: 22, hz: 391.56 },
    { perde: 'La',        midi: 'A4',  centOffset:  +1.9, komaKumulatif: 31, hz: 440.47, rol: 'guclu' },
    { perde: 'Si♭ koma',  midi: 'A#4', centOffset:  -7.6, komaKumulatif: 35, hz: 464.13 },
    { perde: 'Do♯',       midi: 'C#5', centOffset: -13.2, komaKumulatif: 48, hz: 550.14, rol: 'yeden' },
    { perde: 'Re',        midi: 'D5',  centOffset:  +0.0, komaKumulatif: 53, hz: 587.32, rol: 'karar' },
  ],

  // ──────────────────────────────────────────────────────────────
  // UŞŞAK — karar La (A3 = 220.00 Hz)
  // Koma dizisi: [8, 5, 9, 9, 4, 9, 9] → toplam 53
  // Fa koma: F4 + (-7.5 cent) — önceki F#4 eşlemesi YANLIŞ'tı
  // Sol♯: G4'ten -3.8 cent (yeden)
  usak: [
    { perde: 'La',       midi: 'A3',  centOffset:  +0.0, komaKumulatif: 0,  hz: 220.00, rol: 'karar' },
    { perde: 'Si koma♭', midi: 'B3',  centOffset: -18.9, komaKumulatif: 8,  hz: 244.26 },
    { perde: 'Do',       midi: 'C4',  centOffset:  -5.7, komaKumulatif: 13, hz: 260.77 },
    { perde: 'Re',       midi: 'D4',  centOffset:  -1.9, komaKumulatif: 22, hz: 293.34, rol: 'guclu' },
    { perde: 'Mi',       midi: 'E4',  centOffset:  +1.9, komaKumulatif: 31, hz: 329.99 },
    { perde: 'Fa koma',  midi: 'F4',  centOffset:  -7.5, komaKumulatif: 35, hz: 347.71 },
    { perde: 'Sol♯',     midi: 'G4',  centOffset:  -3.8, komaKumulatif: 44, hz: 391.14, rol: 'yeden' },
    { perde: 'La',       midi: 'A4',  centOffset:  +0.0, komaKumulatif: 53, hz: 440.00, rol: 'karar' },
  ],

  // ──────────────────────────────────────────────────────────────
  // HÜSEYNİ — karar La (A3 = 220.00 Hz)
  // Koma dizisi: [9, 5, 8, 9, 9, 5, 8] → toplam 53
  // Not: 6. derece (40 koma = 905.7 cent) F#4'e yakın — AEU'da
  // bu perde "Hüseyni perdesi" olarak da bilinir, Fa değil.
  huseyni: [
    { perde: 'La',      midi: 'A3',  centOffset:  +0.0, komaKumulatif: 0,  hz: 220.00, rol: 'karar' },
    { perde: 'Si',      midi: 'B3',  centOffset:  +3.8, komaKumulatif: 9,  hz: 247.48 },
    { perde: 'Do koma', midi: 'C4',  centOffset: +17.0, komaKumulatif: 14, hz: 264.20 },
    { perde: 'Re',      midi: 'D4',  centOffset:  -1.9, komaKumulatif: 22, hz: 293.34 },
    { perde: 'Mi',      midi: 'E4',  centOffset:  +1.9, komaKumulatif: 31, hz: 329.99, rol: 'guclu' },
    { perde: 'Fa',      midi: 'F#4', centOffset:  +5.7, komaKumulatif: 40, hz: 371.21 },
    { perde: 'Sol koma',midi: 'G4',  centOffset: +18.9, komaKumulatif: 45, hz: 396.29, rol: 'yeden' },
    { perde: 'La',      midi: 'A4',  centOffset:  +0.0, komaKumulatif: 53, hz: 440.00, rol: 'karar' },
  ],

  // ──────────────────────────────────────────────────────────────
  // NİHAVEND — karar Re (D4 = 293.66 Hz)
  // Koma dizisi: [9, 4, 9, 9, 4, 14, 4] → toplam 53
  // Do♯ (harmonik 7. derece): 49 koma = C#5 + 9.4 cent
  nihavend: [
    { perde: 'Re',  midi: 'D4',  centOffset:  +0.0, komaKumulatif: 0,  hz: 293.66, rol: 'karar' },
    { perde: 'Mi',  midi: 'E4',  centOffset:  +3.7, komaKumulatif: 9,  hz: 330.34 },
    { perde: 'Fa',  midi: 'F4',  centOffset:  -5.7, komaKumulatif: 13, hz: 348.08 },
    { perde: 'Sol', midi: 'G4',  centOffset:  -1.9, komaKumulatif: 22, hz: 391.56 },
    { perde: 'La',  midi: 'A4',  centOffset:  +1.9, komaKumulatif: 31, hz: 440.47, rol: 'guclu' },
    { perde: 'Si♭', midi: 'A#4', centOffset:  -7.6, komaKumulatif: 35, hz: 464.13 },
    { perde: 'Do♯', midi: 'C#5', centOffset:  +9.4, komaKumulatif: 49, hz: 557.39, rol: 'yeden' },
    { perde: 'Re',  midi: 'D5',  centOffset:  +0.0, komaKumulatif: 53, hz: 587.32, rol: 'karar' },
  ],

  // ──────────────────────────────────────────────────────────────
  // SEGAH — karar Si koma♭ (B3 = 246.94 Hz'den 1 koma pest = 243.73 Hz)
  // Koma dizisi: [5, 9, 8, 9, 5, 9, 8] → toplam 53
  // Not: karar ve bazı dereceler kendi nearest MIDI'larından
  // negatif offset'le hesaplanmıştır — bu Segah'ın karakteridir.
  segah: [
    { perde: 'Si koma♭',  midi: 'B3',  centOffset: -22.7, komaKumulatif: 0,  hz: 243.73, rol: 'karar' },
    { perde: 'Do',        midi: 'C4',  centOffset:  -9.4, komaKumulatif: 5,  hz: 260.20 },
    { perde: 'Re',        midi: 'D4',  centOffset:  -5.7, komaKumulatif: 14, hz: 292.70 },
    { perde: 'Mi koma♭',  midi: 'E4',  centOffset: -24.5, komaKumulatif: 22, hz: 324.99, rol: 'guclu' },
    { perde: 'Fa',        midi: 'F#4', centOffset: -20.8, komaKumulatif: 31, hz: 365.58 },
    { perde: 'Sol',       midi: 'G4',  centOffset:  -7.6, komaKumulatif: 36, hz: 390.29 },
    { perde: 'La',        midi: 'A4',  centOffset:  -3.8, komaKumulatif: 45, hz: 439.04, rol: 'yeden' },
    { perde: 'Si koma♭',  midi: 'B4',  centOffset: -22.7, komaKumulatif: 53, hz: 487.46, rol: 'karar' },
  ],
};

// ── YEDEN BİLGİLERİ ──────────────────────────────────────────────
export const yedenler: Record<string, { perde: string; aciklama: string }> = {
  rast:     { perde: 'Fa♯ koma♭', aciklama: 'Sol kararına güçlü çekim yapan yeden — F♯ biraz pest' },
  hicaz:    { perde: 'Do♯',       aciklama: 'Re kararına Do♯ çekimi' },
  usak:     { perde: 'Sol♯',      aciklama: 'La kararına Sol♯ çekimi — G biraz pest' },
  huseyni:  { perde: 'Sol koma',  aciklama: 'La kararına Sol koma çekimi — G biraz tiz' },
  nihavend: { perde: 'Do♯',       aciklama: 'Re kararına Do♯ çekimi (harmonik minör karakteri)' },
  segah:    { perde: 'La',        aciklama: 'Si koma♭ kararına La çekimi' },
};
