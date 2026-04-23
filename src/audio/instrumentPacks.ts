// instrumentPacks.ts
// Enstrüman ses paketleri.
// Aşama A (web): CDN tabanlı FluidR3_GM + Salamander
// Aşama B (iOS/Mac): AVAudioUnitSampler GM programları + yerel WAV (ileride)

export type InstrumentId = 'clarinet' | 'piano' | 'violin' | 'ney' | 'ud' | 'guitar' | 'baglama';

// General MIDI program numaraları — Aşama B native ses motoru için
export const nativeInstrumentPrograms: Record<InstrumentId, number> = {
  clarinet: 71,  // Clarinet
  piano:     0,  // Acoustic Grand Piano
  violin:   40,  // Violin
  ney:      73,  // Flute (ney yaklaşımı)
  ud:       24,  // Acoustic Guitar (Nylon) — ud yaklaşımı
  guitar:   25,  // Acoustic Guitar (Steel)
  baglama:  105, // Banjo — bağlama yaklaşımı
};

export interface InstrumentPack {
  id: InstrumentId;
  isim: string;
  isimEn: string;
  emoji: string;
  renk: string;
  // Tone.js Sampler için CDN URL
  cdnBaseUrl: string;
  // Hangi notalar var (CDN'de)
  notalar: Record<string, string>;
  // Ton karakteri
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  // Reverb wet oranı
  reverbWet: number;
  // Makam pratiği için uygun mu?
  makamUygun: boolean;
  // Aşama B'de kullanılacak native format
  nativeFormat?: 'exs24' | 'sfz' | 'auv3';
  nativeNot?: string;
}

export const instrumentPacks: Record<InstrumentId, InstrumentPack> = {

  clarinet: {
    id: 'clarinet',
    isim: 'Klarnet',
    isimEn: 'Clarinet',
    emoji: '🎷',
    renk: '#84cc16',
    // FluidR3_GM — gerçek sample kayıtları
    cdnBaseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/clarinet-mp3/',
    notalar: {
      'D3': 'D3.mp3', 'F3': 'F3.mp3', 'A3': 'A3.mp3',
      'C4': 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3',
      'A4': 'A4.mp3', 'C5': 'C5.mp3', 'D#5': 'Ds5.mp3',
      'F#5': 'Fs5.mp3', 'A5': 'A5.mp3', 'C6': 'C6.mp3',
    },
    envelope: { attack: 0.04, decay: 0.1, sustain: 0.9, release: 0.5 },
    reverbWet: 0.2,
    makamUygun: true,
    nativeFormat: 'exs24',
    nativeNot: 'Aşama B: Philharmonia Clarinet WAV → EXS24 → AVAudioUnitSampler',
  },

  piano: {
    id: 'piano',
    isim: 'Piyano',
    isimEn: 'Piano',
    emoji: '🎹',
    renk: '#4ecdc4',
    // Salamander Grand Piano — Steinway D
    cdnBaseUrl: 'https://tonejs.github.io/audio/salamander/',
    notalar: {
      'A0': 'A0.mp3', 'C1': 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3',
      'A1': 'A1.mp3', 'C2': 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3',
      'A2': 'A2.mp3', 'C3': 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3',
      'A3': 'A3.mp3', 'C4': 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3',
      'A4': 'A4.mp3', 'C5': 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3',
      'A5': 'A5.mp3', 'C6': 'C6.mp3', 'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3',
      'A6': 'A6.mp3', 'C7': 'C7.mp3', 'D#7': 'Ds7.mp3', 'F#7': 'Fs7.mp3',
      'A7': 'A7.mp3', 'C8': 'C8.mp3',
    },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.8, release: 1.2 },
    reverbWet: 0.15,
    makamUygun: true,
    nativeFormat: 'exs24',
    nativeNot: 'Aşama B: Logic Pro Steinway veya Salamander local',
  },

  violin: {
    id: 'violin',
    isim: 'Keman',
    isimEn: 'Violin',
    emoji: '🎻',
    renk: '#a78bfa',
    cdnBaseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/violin-mp3/',
    notalar: {
      'G3': 'G3.mp3', 'A3': 'A3.mp3', 'C4': 'C4.mp3', 'E4': 'E4.mp3',
      'G4': 'G4.mp3', 'A4': 'A4.mp3', 'C5': 'C5.mp3', 'E5': 'E5.mp3',
      'G5': 'G5.mp3', 'A5': 'A5.mp3', 'C6': 'C6.mp3',
    },
    envelope: { attack: 0.18, decay: 0.1, sustain: 0.9, release: 0.8 },
    reverbWet: 0.25,
    makamUygun: true,
    nativeFormat: 'sfz',
    nativeNot: 'Aşama B: VSCO Community Violin SFZ veya Philharmonia',
  },

  ney: {
    id: 'ney',
    isim: 'Ney',
    isimEn: 'Ney',
    emoji: '🪈',
    renk: '#f59e0b',
    cdnBaseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/flute-mp3/',
    notalar: {
      'C5': 'C5.mp3', 'D5': 'D5.mp3', 'E5': 'E5.mp3', 'F5': 'F5.mp3',
      'G5': 'G5.mp3', 'A5': 'A5.mp3', 'C6': 'C6.mp3',
    },
    envelope: { attack: 0.3, decay: 0.05, sustain: 0.88, release: 1.0 },
    reverbWet: 0.3,
    makamUygun: true,
    nativeNot: 'Aşama B: Freesound CC0 ney sample → EXS24',
  },

  ud: {
    id: 'ud',
    isim: 'Ud',
    isimEn: 'Oud',
    emoji: '🪕',
    renk: '#d97706',
    cdnBaseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic-guitar-nylon-mp3/',
    notalar: {
      'E2': 'E2.mp3', 'A2': 'A2.mp3', 'D3': 'D3.mp3',
      'G3': 'G3.mp3', 'C4': 'C4.mp3', 'F4': 'F4.mp3',
    },
    envelope: { attack: 0.002, decay: 0.8, sustain: 0.3, release: 1.5 },
    reverbWet: 0.18,
    makamUygun: true,
    nativeNot: 'Aşama B: Freesound MTG Oud pack veya Karoryfer Splendid Grand Oud',
  },

  guitar: {
    id: 'guitar',
    isim: 'Gitar',
    isimEn: 'Guitar',
    emoji: '🎸',
    renk: '#f97316',
    cdnBaseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic-guitar-nylon-mp3/',
    notalar: {
      'E2': 'E2.mp3', 'A2': 'A2.mp3', 'D3': 'D3.mp3',
      'G3': 'G3.mp3', 'B3': 'B3.mp3', 'E4': 'E4.mp3',
    },
    envelope: { attack: 0.002, decay: 0.5, sustain: 0.2, release: 1.2 },
    reverbWet: 0.15,
    makamUygun: false,
    nativeFormat: 'sfz',
    nativeNot: 'Aşama B: VSCO Acoustic Guitar veya Logic Vintage Acoustic',
  },

  baglama: {
    id: 'baglama',
    isim: 'Bağlama',
    isimEn: 'Baglama',
    emoji: '🪕',
    renk: '#b45309',
    cdnBaseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/banjo-mp3/',
    notalar: {
      'A2': 'A2.mp3', 'D3': 'D3.mp3', 'G3': 'G3.mp3',
      'A3': 'A3.mp3', 'D4': 'D4.mp3',
    },
    envelope: { attack: 0.002, decay: 0.6, sustain: 0.25, release: 1.0 },
    reverbWet: 0.12,
    makamUygun: true,
    nativeNot: 'Aşama B: Freesound CC0 saz sample → EXS24',
  },
};

// Makam pratiği için uygun enstrümanlar
export const makamEnstrumanlar = Object.values(instrumentPacks).filter(p => p.makamUygun);
