// sesMotoru.ts — Aşama A (Web / Tone.js)
// Cent offset desteği: makamEngine'den gelen detune değerini
// Tone.js Sampler'a uygular. Bu sayede mikrotonal perdeler
// doğru frekansla çalınır.
//
// Aşama B (Mac): Bu dosya yerini AVAudioUnitSampler bridge'ine bırakacak.

import { Platform } from 'react-native';
import { instrumentPacks, InstrumentId } from './instrumentPacks';

let toneLoaded = false;
let Tone: any = null;
const synths: Record<string, any> = {};
let reverb: any  = null;
let comp: any    = null;

export async function sesMotorBaslat(): Promise<void> {
  if (Platform.OS !== 'web' || toneLoaded) return;
  try {
    Tone = await import('tone');
    await Tone.start();
    comp   = new Tone.Compressor(-24, 4).toDestination();
    reverb = new Tone.Reverb({ decay: 1.8, wet: 0.2 }).connect(comp);
    await reverb.ready;

    // Her enstrümanı pack tanımından yükle
    for (const [id, pack] of Object.entries(instrumentPacks)) {
      if (id === 'ney' || id === 'ud' || id === 'guitar' || id === 'baglama') {
        // Telli/nefes: PluckSynth veya özel sentez (CDN sample az)
        if (id === 'ud' || id === 'baglama') {
          synths[id] = new Tone.PluckSynth({
            attackNoise: id === 'ud' ? 0.8 : 1.4,
            dampening:   id === 'ud' ? 3200 : 4200,
            resonance:   id === 'ud' ? 0.97 : 0.94,
          }).connect(reverb);
        } else if (id === 'guitar') {
          synths[id] = new Tone.PluckSynth({ attackNoise: 1.2, dampening: 3800, resonance: 0.96 }).connect(reverb);
        } else {
          // Ney — sine + yavaş attack
          synths[id] = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.3, decay: 0.05, sustain: 0.88, release: 1.0 },
          }).connect(reverb);
          synths['ney_harm'] = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.4, decay: 0.05, sustain: 0.5, release: 1.0 },
            volume: -18,
          }).connect(reverb);
        }
        continue;
      }

      // Sampler — gerçek MP3 kayıtlar
      synths[id] = new Tone.Sampler({
        urls:    pack.notalar,
        baseUrl: pack.cdnBaseUrl,
        onload:  () => console.log(`${id} yüklendi ✓`),
        onerror: (e: any) => console.warn(`${id} yükleme uyarısı:`, e),
      }).connect(reverb);
    }

    // Davul
    synths['drums_kick']  = new Tone.MembraneSynth({ pitchDecay: 0.06, octaves: 8, envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.1 } }).connect(comp);
    synths['drums_snare'] = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.08 } }).connect(comp);
    synths['drums_hihat'] = new Tone.MetalSynth({ frequency: 400, envelope: { attack: 0.001, decay: 0.08, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 }).connect(comp);

    toneLoaded = true;
  } catch (e) { console.error('Ses motoru hatası:', e); }
}

// ── TEMEL NOTA ÇALMA ──────────────────────────────────────────────

export function notaCal(enstrumanId: string, nota: string, sure: string = '8n'): void {
  if (Platform.OS !== 'web' || !Tone) return;
  if (enstrumanId === 'drums') { davulCal(nota); return; }
  try {
    const synth = synths[enstrumanId];
    if (!synth) return;
    if (enstrumanId === 'ney') {
      synth.triggerAttackRelease(nota, sure);
      try {
        const oct = parseInt(nota.match(/(\d+)$/)?.[1] || '5');
        synths['ney_harm']?.triggerAttackRelease(nota.replace(/\d+$/, String(oct + 1)), sure);
      } catch {}
      return;
    }
    if (['ud', 'baglama', 'guitar'].includes(enstrumanId)) {
      synth.triggerAttack(nota);
      return;
    }
    synth.triggerAttackRelease(nota, sure);
  } catch (e) { console.error('notaCal hatası:', e, nota); }
}

// ── CENT OFFSET İLE NOTA ÇALMA (mikrotonal) ───────────────────────
// Tone.js Sampler detune parametresi cent cinsinden offset alır.
// Bu fonksiyon makam perdesini doğru mikrotonal frekansla çalar.

export function notaCalCent(
  enstrumanId: string,
  nota: string,         // MIDI nota adı (en yakın standart nota)
  centOffset: number,   // cent offset (+ = tiz, - = pest)
  sure: string = '4n',
): void {
  if (Platform.OS !== 'web' || !Tone) return;
  try {
    const synth = synths[enstrumanId];
    if (!synth) return;

    // Telli enstrümanlar için detune desteği
    if (['ud', 'baglama', 'guitar'].includes(enstrumanId)) {
      // PluckSynth'te detune yok, yaklaşık frekans hesapla
      const baseHz = Tone.Frequency(nota).toFrequency();
      const gercekHz = baseHz * Math.pow(2, centOffset / 1200);
      synth.triggerAttack(gercekHz);
      return;
    }

    // Sampler'da detune parametresi var
    if (synth.detune !== undefined) {
      const mevcutDetune = synth.detune.value;
      synth.detune.value = centOffset;
      synth.triggerAttackRelease(nota, sure);
      // Kısa gecikme sonra sıfırla
      setTimeout(() => {
        if (synth.detune) synth.detune.value = 0;
      }, 1000);
    } else {
      // Detune desteklenmiyor, standart çal
      synth.triggerAttackRelease(nota, sure);
    }
  } catch (e) { console.error('notaCalCent hatası:', e); }
}

export function notaBirak(enstrumanId: string, _nota: string): void {
  if (Platform.OS !== 'web' || !toneLoaded) return;
  if (['ud', 'baglama', 'guitar'].includes(enstrumanId)) {
    synths[enstrumanId]?.releaseAll?.();
  }
}

function davulCal(nota: string): void {
  const m: Record<string, () => void> = {
    'C2':  () => synths['drums_kick']?.triggerAttackRelease('C1', '8n'),
    'D2':  () => synths['drums_snare']?.triggerAttackRelease('8n'),
    'F#2': () => synths['drums_hihat']?.triggerAttackRelease('32n'),
    'A2':  () => synths['drums_hihat']?.triggerAttackRelease('16n'),
    'B2':  () => synths['drums_kick']?.triggerAttackRelease('C1', '16n'),
    'E2':  () => synths['drums_snare']?.triggerAttackRelease('16n'),
    'G2':  () => synths['drums_hihat']?.triggerAttackRelease('8n'),
    'C3':  () => synths['drums_kick']?.triggerAttackRelease('G0', '8n'),
  };
  m[nota]?.();
}

export function isSesMotorHazir(): boolean { return toneLoaded; }
