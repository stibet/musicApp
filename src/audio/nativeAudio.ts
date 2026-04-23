// nativeAudio.ts — Aşama B (iOS / Mac Catalyst)
// AVAudioUnitSampler + MIDI pitch bend: ~5ms gecikme, offline, AEU koma hassasiyeti.
// Tone.js CDN'e ihtiyaç yok.

import { getMakamAudioModule } from '../../modules/makam-audio';
import type { InstrumentId } from './instrumentPacks';
import { nativeInstrumentPrograms } from './instrumentPacks';

// MIDI channel pool — maksimum 4 eş zamanlı mikrotonal nota
const CHANNEL_POOL = [0, 1, 2, 3];
let channelIndex = 0;
function nextChannel(): number {
  const ch = CHANNEL_POOL[channelIndex % CHANNEL_POOL.length];
  channelIndex++;
  return ch;
}

let engineReady = false;
let currentInstrument: InstrumentId = 'clarinet';

// ── MOTOR BAŞLATMA ─────────────────────────────────────────────────

export async function nativeMotorBaslat(): Promise<void> {
  const mod = getMakamAudioModule();
  if (!mod || engineReady) return;
  try {
    await mod.prepare();
    engineReady = true;
  } catch (e) {
    console.error('[NativeAudio] prepare hatası:', e);
  }
}

// ── ENSTRÜMAN DEĞİŞTİRME ──────────────────────────────────────────

export function nativeEnstrumanSec(id: InstrumentId): void {
  const mod = getMakamAudioModule();
  if (!mod || !engineReady) return;
  currentInstrument = id;
  const program = nativeInstrumentPrograms[id] ?? 71;
  for (const ch of CHANNEL_POOL) {
    mod.setInstrument(program, ch);
  }
}

// ── TEMEL NOTA ÇALMA ──────────────────────────────────────────────

export function nativeNotaCal(
  enstrumanId: string,
  nota: string,
  durationMs = 600,
): void {
  const mod = getMakamAudioModule();
  if (!mod || !engineReady) return;
  const midiNote = midiAdiToSayi(nota);
  const ch = nextChannel();
  if (currentInstrument !== enstrumanId) {
    nativeEnstrumanSec(enstrumanId as InstrumentId);
  }
  mod.playNote(midiNote, 90, durationMs, 0, ch);
}

// ── CENT OFFSET İLE NOTA ÇALMA (mikrotonal) ───────────────────────
// MIDI pitch bend ile gerçek frekans sapması — Tone.js detune'dan çok daha temiz.

export function nativeNotaCalCent(
  enstrumanId: string,
  nota: string,
  centOffset: number,
  durationMs = 700,
): void {
  const mod = getMakamAudioModule();
  if (!mod || !engineReady) return;
  const midiNote = midiAdiToSayi(nota);
  const ch = nextChannel();
  if (currentInstrument !== enstrumanId) {
    nativeEnstrumanSec(enstrumanId as InstrumentId);
  }
  mod.playNote(midiNote, 90, durationMs, centOffset, ch);
}

export function nativeNotaBirak(nota: string): void {
  const mod = getMakamAudioModule();
  if (!mod) return;
  const midiNote = midiAdiToSayi(nota);
  for (const ch of CHANNEL_POOL) mod.stopNote(midiNote, ch);
}

export function isNativeMotorHazir(): boolean {
  return engineReady;
}

// ── YARDIMCI: MIDI nota adı → numara ──────────────────────────────
// "C4" → 60, "G3" → 55, "A3" → 57, "D#4" → 63

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiAdiToSayi(midi: string): number {
  const m = midi.match(/^([A-G]#?)(-?\d+)$/);
  if (!m) return 60;
  const idx = NOTE_NAMES.indexOf(m[1]);
  const oct = parseInt(m[2]);
  return (oct + 1) * 12 + idx;
}
