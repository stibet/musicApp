// Enstrüman ses motoru
// Web'de Tone.js Sampler, Native'de expo-av ile temel sentez

import { Platform } from 'react-native';

export interface Nota {
  isim: string;
  frekans: number;
  oktav: number;
  tam: string; // örn: "C4", "A3"
}

export interface Enstruman {
  id: string;
  isim: string;
  isimEn: string;
  emoji: string;
  kategori: 'klavye' | 'tel' | 'vurma' | 'nefes';
  renk: string;
  oktavlar: number[];
  aciklama: string;
}

export const enstrumanlar: Enstruman[] = [
  { id: 'piano', isim: 'Piyano', isimEn: 'Piano', emoji: '🎹', kategori: 'klavye', renk: '#4ecdc4', oktavlar: [3, 4, 5], aciklama: 'Klasik klavyeli çalgı' },
  { id: 'guitar', isim: 'Gitar', isimEn: 'Guitar', emoji: '🎸', kategori: 'tel', renk: '#f5a623', oktavlar: [2, 3, 4], aciklama: 'Akustik gitar' },
  { id: 'bass', isim: 'Bas Gitar', isimEn: 'Bass Guitar', emoji: '🎸', kategori: 'tel', renk: '#e94560', oktavlar: [1, 2, 3], aciklama: 'Elektrik bas gitar' },
  { id: 'violin', isim: 'Keman', isimEn: 'Violin', emoji: '🎻', kategori: 'tel', renk: '#a78bfa', oktavlar: [4, 5, 6], aciklama: 'Klasik keman' },
  { id: 'ney', isim: 'Ney', isimEn: 'Ney', emoji: '🪈', kategori: 'nefes', renk: '#84cc16', oktavlar: [4, 5], aciklama: 'Türk nefesli çalgısı' },
  { id: 'baglama', isim: 'Bağlama', isimEn: 'Baglama', emoji: '🪕', kategori: 'tel', renk: '#f97316', oktavlar: [3, 4], aciklama: 'Türk halk sazı' },
  { id: 'ud', isim: 'Ud', isimEn: 'Oud', emoji: '🪕', kategori: 'tel', renk: '#eab308', oktavlar: [2, 3, 4], aciklama: 'Türk-Arap telli çalgısı' },
  { id: 'drums', isim: 'Davul', isimEn: 'Drums', emoji: '🥁', kategori: 'vurma', renk: '#ef4444', oktavlar: [3], aciklama: 'Ritim enstrümanı' },
  { id: 'trumpet', isim: 'Trompet', isimEn: 'Trumpet', emoji: '🎺', kategori: 'nefes', renk: '#f59e0b', oktavlar: [4, 5], aciklama: 'Pirinç nefesli çalgı' },
  { id: 'flute', isim: 'Flüt', isimEn: 'Flute', emoji: '🪈', kategori: 'nefes', renk: '#06b6d4', oktavlar: [5, 6], aciklama: 'Tahta nefesli çalgı' },
];

// Nota isimleri (Türkçe ve Batı)
export const NOTA_ISIMLERI_TR = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];
export const NOTA_ISIMLERI_EN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const BEYAZ_TUSLAR = [0, 2, 4, 5, 7, 9, 11]; // Do Re Mi Fa Sol La Si
export const SIYAH_TUSLAR = [1, 3, 6, 8, 10]; // Do# Re# Fa# Sol# La#

export function notaFrekans(notaIndex: number, oktav: number): number {
  // A4 = 440 Hz referans
  const yarimSes = (oktav + 1) * 12 + notaIndex - 9;
  return 440 * Math.pow(2, yarimSes / 12);
}

export function notaTam(notaIndex: number, oktav: number): string {
  return NOTA_ISIMLERI_EN[notaIndex] + oktav;
}

// Davul perküsyon notaları
export const DAVUL_NOTALAR = [
  { isim: 'Bas', isimEn: 'Kick', not: 'C2', renk: '#ef4444' },
  { isim: 'Snare', isimEn: 'Snare', not: 'D2', renk: '#f97316' },
  { isim: 'Hihat K', isimEn: 'Closed HH', not: 'F#2', renk: '#eab308' },
  { isim: 'Hihat A', isimEn: 'Open HH', not: 'A#2', renk: '#84cc16' },
  { isim: 'Tom 1', isimEn: 'Tom 1', not: 'A2', renk: '#06b6d4' },
  { isim: 'Tom 2', isimEn: 'Tom 2', not: 'B2', renk: '#8b5cf6' },
  { isim: 'Crash', isimEn: 'Crash', not: 'C#3', renk: '#ec4899' },
  { isim: 'Ride', isimEn: 'Ride', not: 'D#3', renk: '#14b8a6' },
];
