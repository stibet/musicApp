import { makamlar } from './makamlar';

export type NotaGosterimModu = 'turk' | 'bati' | 'ikisi';
export type CoachInstrumentId = 'piano' | 'clarinet' | 'violin' | 'ney';
export type PracticeMode = 'scale' | 'phrase';

export interface PracticeStepDef {
  degreeIndex: number;
  turkish: string;
  western: string;
  midi: string;
  role?: 'karar' | 'guclu' | 'gecis';
}

export interface PhraseDef {
  id: string;
  title: string;
  subtitle: string;
  degreeOrder: number[];
}

export interface MakamPracticeDef {
  id: string;
  title: string;
  tonicHz: number;
  steps: PracticeStepDef[];
  phrases: PhraseDef[];
}

export const coachInstruments: Array<{ id: CoachInstrumentId; title: string; emoji: string; color: string }> = [
  { id: 'piano', title: 'Piyano', emoji: '🎹', color: '#4ecdc4' },
  { id: 'clarinet', title: 'Klarnet', emoji: '🎷', color: '#84cc16' },
  { id: 'violin', title: 'Keman', emoji: '🎻', color: '#a78bfa' },
  { id: 'ney', title: 'Ney', emoji: '🪈', color: '#f59e0b' },
];

export const transposeOptions = [
  { label: 'Yerinde', semitones: 0 },
  { label: '+1', semitones: 1 },
  { label: '+2', semitones: 2 },
  { label: '-1', semitones: -1 },
  { label: '-2', semitones: -2 },
];

const defs: Record<string, MakamPracticeDef> = {
  hicaz: {
    id: 'hicaz',
    title: 'Hicaz',
    tonicHz: 293.66,
    steps: [
      { degreeIndex: 0, turkish: 'Re', western: 'D', midi: 'D4', role: 'karar' },
      { degreeIndex: 1, turkish: 'Mi♭ koma', western: 'Eb', midi: 'D#4' },
      { degreeIndex: 2, turkish: 'Fa♯', western: 'F#', midi: 'F#4' },
      { degreeIndex: 3, turkish: 'Sol', western: 'G', midi: 'G4' },
      { degreeIndex: 4, turkish: 'La', western: 'A', midi: 'A4', role: 'guclu' },
      { degreeIndex: 5, turkish: 'Si♭ koma', western: 'Bb', midi: 'A#4' },
      { degreeIndex: 6, turkish: 'Do♯', western: 'C#', midi: 'C#5' },
      { degreeIndex: 7, turkish: 'Re', western: 'D', midi: 'D5', role: 'karar' },
    ],
    phrases: [
      { id: 'hicaz_1', title: 'Karakteristik yürüyüş', subtitle: 'Hicaz rengi', degreeOrder: [0, 1, 2, 3, 2, 1, 0] },
      { id: 'hicaz_2', title: 'Karar dönüşü', subtitle: 'Güçlüden karara', degreeOrder: [4, 5, 4, 3, 2, 1, 0] },
    ],
  },
  rast: {
    id: 'rast',
    title: 'Rast',
    tonicHz: 196,
    steps: [
      { degreeIndex: 0, turkish: 'Sol', western: 'G', midi: 'G3', role: 'karar' },
      { degreeIndex: 1, turkish: 'La', western: 'A', midi: 'A3' },
      { degreeIndex: 2, turkish: 'Si koma♭', western: 'B~', midi: 'B3' },
      { degreeIndex: 3, turkish: 'Do', western: 'C', midi: 'C4' },
      { degreeIndex: 4, turkish: 'Re', western: 'D', midi: 'D4', role: 'guclu' },
      { degreeIndex: 5, turkish: 'Mi', western: 'E', midi: 'E4' },
      { degreeIndex: 6, turkish: 'Fa♯ koma♭', western: 'F#~', midi: 'F#4' },
      { degreeIndex: 7, turkish: 'Sol', western: 'G', midi: 'G4', role: 'karar' },
    ],
    phrases: [
      { id: 'rast_1', title: 'Dengeli açılış', subtitle: 'Rast seyrine giriş', degreeOrder: [0, 1, 2, 3, 4, 3, 2, 1, 0] },
      { id: 'rast_2', title: 'Güçlü vurgusu', subtitle: 'Re çevresi', degreeOrder: [3, 4, 5, 4, 3, 2, 1, 0] },
    ],
  },
  usak: {
    id: 'usak',
    title: 'Uşşak',
    tonicHz: 220,
    steps: [
      { degreeIndex: 0, turkish: 'La', western: 'A', midi: 'A3', role: 'karar' },
      { degreeIndex: 1, turkish: 'Si koma♭', western: 'B~', midi: 'B3' },
      { degreeIndex: 2, turkish: 'Do', western: 'C', midi: 'C4' },
      { degreeIndex: 3, turkish: 'Re', western: 'D', midi: 'D4', role: 'guclu' },
      { degreeIndex: 4, turkish: 'Mi', western: 'E', midi: 'E4' },
      { degreeIndex: 5, turkish: 'Fa koma', western: 'F~', midi: 'F4' },
      { degreeIndex: 6, turkish: 'Sol♯', western: 'G#', midi: 'G#4' },
      { degreeIndex: 7, turkish: 'La', western: 'A', midi: 'A4', role: 'karar' },
    ],
    phrases: [
      { id: 'usak_1', title: 'İçli yürüyüş', subtitle: 'Karar çevresi', degreeOrder: [0, 1, 2, 1, 0, 1, 2, 3] },
      { id: 'usak_2', title: 'Kısa kapanış', subtitle: 'Yumuşak iniş', degreeOrder: [4, 3, 2, 1, 0] },
    ],
  },
  huseyni: {
    id: 'huseyni',
    title: 'Hüseyni',
    tonicHz: 220,
    steps: [
      { degreeIndex: 0, turkish: 'La', western: 'A', midi: 'A3', role: 'karar' },
      { degreeIndex: 1, turkish: 'Si', western: 'B', midi: 'B3' },
      { degreeIndex: 2, turkish: 'Do koma', western: 'C~', midi: 'C4' },
      { degreeIndex: 3, turkish: 'Re', western: 'D', midi: 'D4' },
      { degreeIndex: 4, turkish: 'Mi', western: 'E', midi: 'E4', role: 'guclu' },
      { degreeIndex: 5, turkish: 'Fa', western: 'F', midi: 'F4' },
      { degreeIndex: 6, turkish: 'Sol koma', western: 'G~', midi: 'G4' },
      { degreeIndex: 7, turkish: 'La', western: 'A', midi: 'A4', role: 'karar' },
    ],
    phrases: [
      { id: 'huseyni_1', title: 'Asil açılış', subtitle: 'Mi çevresine çıkış', degreeOrder: [0, 1, 2, 3, 4, 3, 2] },
      { id: 'huseyni_2', title: 'Karar dönüşü', subtitle: 'Olgun iniş', degreeOrder: [4, 5, 4, 3, 2, 1, 0] },
    ],
  },
  nihavend: {
    id: 'nihavend',
    title: 'Nihavend',
    tonicHz: 293.66,
    steps: [
      { degreeIndex: 0, turkish: 'Re', western: 'D', midi: 'D4', role: 'karar' },
      { degreeIndex: 1, turkish: 'Mi', western: 'E', midi: 'E4' },
      { degreeIndex: 2, turkish: 'Fa', western: 'F', midi: 'F4' },
      { degreeIndex: 3, turkish: 'Sol', western: 'G', midi: 'G4' },
      { degreeIndex: 4, turkish: 'La', western: 'A', midi: 'A4', role: 'guclu' },
      { degreeIndex: 5, turkish: 'Si♭', western: 'Bb', midi: 'A#4' },
      { degreeIndex: 6, turkish: 'Do♯', western: 'C#', midi: 'C#5' },
      { degreeIndex: 7, turkish: 'Re', western: 'D', midi: 'D5', role: 'karar' },
    ],
    phrases: [
      { id: 'nihavend_1', title: 'Romantik iniş', subtitle: 'Minör renk', degreeOrder: [0, 2, 3, 4, 3, 2, 1, 0] },
      { id: 'nihavend_2', title: 'Kısa cümle', subtitle: 'Güçlüden dönüş', degreeOrder: [4, 5, 6, 5, 4, 3, 2, 0] },
    ],
  },
  segah: {
    id: 'segah',
    title: 'Segâh',
    tonicHz: 233.08,
    steps: [
      { degreeIndex: 0, turkish: 'Si koma♭', western: 'Bb~', midi: 'A#3', role: 'karar' },
      { degreeIndex: 1, turkish: 'Do', western: 'C', midi: 'C4' },
      { degreeIndex: 2, turkish: 'Re', western: 'D', midi: 'D4' },
      { degreeIndex: 3, turkish: 'Mi koma♭', western: 'Eb~', midi: 'D#4', role: 'guclu' },
      { degreeIndex: 4, turkish: 'Fa', western: 'F', midi: 'F4' },
      { degreeIndex: 5, turkish: 'Sol', western: 'G', midi: 'G4' },
      { degreeIndex: 6, turkish: 'La', western: 'A', midi: 'A4' },
      { degreeIndex: 7, turkish: 'Si koma♭', western: 'Bb~', midi: 'A#4', role: 'karar' },
    ],
    phrases: [
      { id: 'segah_1', title: 'Mistık yürüyüş', subtitle: 'Segâh rengi', degreeOrder: [0, 1, 2, 3, 2, 1, 0] },
      { id: 'segah_2', title: 'İlahi kapanış', subtitle: 'Derin karar', degreeOrder: [3, 4, 3, 2, 1, 0] },
    ],
  },
};

export const practiceMakamlari = makamlar
  .filter((m) => defs[m.id])
  .map((m) => ({ ...m, practice: defs[m.id] }));

const WESTERN_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiToNumber(midi: string) {
  const match = midi.match(/^([A-G])(#?)(\d)$/);
  if (!match) return 60;
  const [, note, sharp, octaveRaw] = match;
  const octave = Number(octaveRaw);
  const index = WESTERN_NOTES.indexOf(`${note}${sharp}`);
  return (octave + 1) * 12 + index;
}

export function numberToMidi(value: number) {
  const note = WESTERN_NOTES[((value % 12) + 12) % 12];
  const octave = Math.floor(value / 12) - 1;
  return `${note}${octave}`;
}

export function transposeMidi(midi: string, semitones: number) {
  return numberToMidi(midiToNumber(midi) + semitones);
}

export function midiToWesternLabel(midi: string) {
  const match = midi.match(/^([A-G])(#?)(\d)$/);
  if (!match) return midi;
  return `${match[1]}${match[2]}`;
}

export function noteLabelFromMode(step: PracticeStepDef, mode: NotaGosterimModu, semitones = 0) {
  const transposedWestern = midiToWesternLabel(transposeMidi(step.midi, semitones));
  if (mode === 'turk') return step.turkish;
  if (mode === 'bati') return transposedWestern;
  return `${step.turkish} · ${transposedWestern}`;
}

export function buildSequenceForMode(
  makamId: string,
  mode: PracticeMode,
  phraseId?: string,
) {
  const makam = practiceMakamlari.find((item) => item.id === makamId) ?? practiceMakamlari[0];
  if (mode === 'scale') return makam.practice.steps;
  const phrase = makam.practice.phrases.find((item) => item.id === phraseId) ?? makam.practice.phrases[0];
  return phrase.degreeOrder.map((degreeIndex) => makam.practice.steps[degreeIndex]);
}
