// playbackInterface.ts
// Tüm ses çalma buradan geçer.
// Platform.OS === 'web'  → Tone.js CDN (Aşama A)
// Platform.OS === 'ios'  → AVAudioUnitSampler native (Aşama B, ~5ms)

import { Platform } from 'react-native';
import type { SeyirCumlesi } from '../makam/makamDef';
import { getMakamDef } from '../makam/makamDef';

// ── Motor soyutlaması ─────────────────────────────────────────────

interface AudioMotor {
  notaCalCent(id: string, nota: string, centOffset: number, sure: string): void;
  notaCal?(id: string, nota: string, sure: string): void;
}

let _motor: AudioMotor | null = null;

async function getMotor(): Promise<AudioMotor | null> {
  if (_motor) return _motor;

  if (Platform.OS === 'ios') {
    const native = await import('./nativeAudio');
    await native.nativeMotorBaslat();
    _motor = {
      notaCalCent(id, nota, centOffset, sure) {
        const ms = sureToMs(sure);
        native.nativeNotaCalCent(id, nota, centOffset, ms);
      },
      notaCal(id, nota, sure) {
        const ms = sureToMs(sure);
        native.nativeNotaCal(id, nota, ms);
      },
    };
  } else if (Platform.OS === 'web') {
    const web = await import('./sesMotoru');
    await web.sesMotorBaslat();
    _motor = {
      notaCalCent: web.notaCalCent,
      notaCal:     web.notaCal,
    };
  }

  return _motor;
}

// Basit süre → ms dönüşümü (BPM 70 varsayımı)
function sureToMs(sure: string): number {
  const map: Record<string, number> = { '1n': 3428, '2n': 1714, '4n': 857, '8n': 428, '16n': 214 };
  return map[sure] ?? 700;
}

// ── Eski getSesMotoru uyumluluğu ─────────────────────────────────
async function getSesMotoru() {
  return getMotor();
}

// MIDI adından MIDI numarası
function midiAdiToSayi(midi: string): number {
  const NOTALAR = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const m = midi.match(/^([A-G]#?)(\d)$/);
  if (!m) return 60;
  return (parseInt(m[2]) + 1) * 12 + NOTALAR.indexOf(m[1]);
}

function midiSayiToAd(n: number): string {
  const NOTALAR = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  return `${NOTALAR[n % 12]}${Math.floor(n / 12) - 1}`;
}

// Semitone transpoze
function transpoze(midi: string, semitones: number): string {
  return midiSayiToAd(midiAdiToSayi(midi) + semitones);
}

// ── ANA PLAYBACK FONKSİYONLARI ───────────────────────────────────

// Tek derece çal (makam bazlı, cent offset ile)
export async function calDerece(
  makamId: string,
  dereceIndex: number,
  enstrumanId: string,
  semitones = 0,
  sure = '4n',
): Promise<void> {
  const makam = getMakamDef(makamId);
  if (!makam) return;
  const derece = makam.dereceler[dereceIndex];
  if (!derece) return;
  const motor = await getSesMotoru();
  if (!motor) return;
  const midi = transpoze(derece.midi, semitones);
  motor.notaCalCent(enstrumanId, midi, derece.centOffset, sure);
}

// Referans nota çal (makam-kocu uyumluluğu için)
export async function playReferenceNote(
  enstrumanId: string,
  midi: string,
  durationMs = 700,
  semitones = 0,
  centOffset = 0,
): Promise<void> {
  const motor = await getSesMotoru();
  if (!motor) return;
  const transposed = transpoze(midi, semitones);
  const sure = durationMs > 900 ? '2n' : '4n';
  motor.notaCalCent(enstrumanId, transposed, centOffset, sure);
}

// Dizi çal (tempo parametreli)
export async function calDiziAsync(
  makamId: string,
  enstrumanId: string,
  dereceListesi: number[],
  tempo = 70,         // BPM
  semitones = 0,
  onStep?: (index: number) => void,
): Promise<void> {
  const makam = getMakamDef(makamId);
  if (!makam) return;
  const motor = await getSesMotoru();
  if (!motor) return;

  const beklemeMs = Math.round((60 / tempo) * 1000);

  for (let i = 0; i < dereceListesi.length; i++) {
    onStep?.(i);
    const derece = makam.dereceler[dereceListesi[i]];
    if (!derece) continue;
    const midi = transpoze(derece.midi, semitones);
    motor.notaCalCent(enstrumanId, midi, derece.centOffset, '4n');
    await new Promise(r => setTimeout(r, beklemeMs));
  }
}

// Eski uyumluluk — makam-kocu.tsx bunu kullanıyor
export async function playReferenceSequence(
  enstrumanId: string,
  midiNotalar: string[],
  onStep?: (index: number) => void,
  semitones = 0,
  makamId?: string,
): Promise<void> {
  const motor = await getSesMotoru();
  if (!motor) return;

  const makam = makamId ? getMakamDef(makamId) : null;

  for (let i = 0; i < midiNotalar.length; i++) {
    onStep?.(i);
    const transposed  = transpoze(midiNotalar[i], semitones);
    const centOffset  = makam?.dereceler[i]?.centOffset ?? 0;
    motor.notaCalCent(enstrumanId, transposed, centOffset, '4n');
    await new Promise(r => setTimeout(r, 760));
  }
}

// Seyir cümlesi çal
export async function calSeyirCumlesi(
  makamId: string,
  cumleTip: SeyirCumlesi['tip'] = 'karakteristik',
  enstrumanId: string,
  tempo = 65,
  semitones = 0,
): Promise<void> {
  const makam = getMakamDef(makamId);
  if (!makam) return;
  const cumle = makam.seyirCumleleri.find(c => c.tip === cumleTip)
             ?? makam.seyirCumleleri[0];
  if (!cumle) return;
  await calDiziAsync(makamId, enstrumanId, cumle.dereceler, tempo, semitones);
}

// playSeyirCumlesi — eski uyumluluk
export async function playSeyirCumlesi(
  enstrumanId: string,
  makamId: string,
  cumleTip: SeyirCumlesi['tip'] = 'karakteristik',
  semitones = 0,
): Promise<void> {
  await calSeyirCumlesi(makamId, cumleTip, enstrumanId, 65, semitones);
}

// ── TEMPO SABİTLERİ ───────────────────────────────────────────────
export const TEMPO_SEVIYELERI = {
  yavas:  45,
  normal: 70,
  hizli:  100,
} as const;

export type TempoSeviye = keyof typeof TEMPO_SEVIYELERI;

export function tempoLabel(t: TempoSeviye): string {
  return { yavas: '🐢 Yavaş', normal: '▶ Normal', hizli: '⚡ Hızlı' }[t];
}
