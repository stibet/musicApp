// Web Audio sentez motoru
// Tone.js ile her enstrüman için farklı ses karakteri

import { Platform } from 'react-native';

let toneLoaded = false;
let Tone: any = null;
let synths: Record<string, any> = {};
let reverb: any = null;
let compressor: any = null;

export async function sesMotorBaslat(): Promise<void> {
  if (Platform.OS !== 'web') return;
  if (toneLoaded) return;

  try {
    Tone = await import('tone');
    await Tone.start();

    // Efektler
    compressor = new Tone.Compressor(-30, 3).toDestination();
    reverb = new Tone.Reverb({ decay: 1.5, wet: 0.2 }).connect(compressor);
    await reverb.ready;

    // Piyano - sampler (Salamander Grand Piano CDN)
    synths['piano'] = new Tone.Sampler({
      urls: {
        A0: 'A0.mp3', C1: 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3',
        A1: 'A1.mp3', C2: 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3',
        A2: 'A2.mp3', C3: 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3',
        A3: 'A3.mp3', C4: 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3',
        A4: 'A4.mp3', C5: 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3',
        A5: 'A5.mp3', C6: 'C6.mp3', 'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3',
        A6: 'A6.mp3', C7: 'C7.mp3', 'D#7': 'Ds7.mp3', 'F#7': 'Fs7.mp3',
        A7: 'A7.mp3', C8: 'C8.mp3',
      },
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      onload: () => console.log('Piyano yüklendi'),
    }).connect(reverb);

    // Gitar - sentez
    synths['guitar'] = new Tone.PluckSynth({
      attackNoise: 1,
      dampening: 4000,
      resonance: 0.95,
    }).connect(reverb);

    // Bas gitar
    synths['bass'] = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.5 },
      filterEnvelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.5, baseFrequency: 200, octaves: 2 },
    }).connect(compressor);

    // Keman - sentez
    synths['violin'] = new Tone.FMSynth({
      harmonicity: 3.01,
      modulationIndex: 14,
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.2, decay: 0.3, sustain: 0.9, release: 0.8 },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 0.2, decay: 0.3, sustain: 0.9, release: 0.8 },
    }).connect(reverb);

    // Ney - sentez (flüt benzeri)
    synths['ney'] = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.3, decay: 0.1, sustain: 0.9, release: 0.8 },
    }).connect(reverb);

    // Bağlama - pluck
    synths['baglama'] = new Tone.PluckSynth({
      attackNoise: 2,
      dampening: 3000,
      resonance: 0.92,
    }).connect(reverb);

    // Ud - sentez
    synths['ud'] = new Tone.PluckSynth({
      attackNoise: 1.5,
      dampening: 2500,
      resonance: 0.9,
    }).connect(reverb);

    // Davul - Membrane + Metal sentez
    synths['drums_kick'] = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.1 },
    }).connect(compressor);

    synths['drums_snare'] = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
    }).connect(compressor);

    synths['drums_hihat'] = new Tone.MetalSynth({
      frequency: 400,
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).connect(compressor);

    synths['drums_hihat_open'] = new Tone.MetalSynth({
      frequency: 400,
      envelope: { attack: 0.001, decay: 0.4, release: 0.1 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).connect(compressor);

    synths['drums_tom1'] = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
    }).connect(compressor);

    synths['drums_tom2'] = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 3,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
    }).connect(compressor);

    synths['drums_crash'] = new Tone.MetalSynth({
      frequency: 300,
      envelope: { attack: 0.001, decay: 1.0, release: 0.3 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 3000,
      octaves: 1.5,
    }).connect(reverb);

    synths['drums_ride'] = new Tone.MetalSynth({
      frequency: 440,
      envelope: { attack: 0.001, decay: 0.6, release: 0.2 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 3500,
      octaves: 1.5,
    }).connect(reverb);

    // Trompet
    synths['trumpet'] = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.3 },
    }).connect(reverb);

    // Flüt
    synths['flute'] = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.1, sustain: 0.9, release: 0.5 },
    }).connect(reverb);

    toneLoaded = true;
    console.log('Ses motoru hazır');
  } catch (e) {
    console.error('Ses motoru hatası:', e);
  }
}

export function notaCal(enstrumanId: string, nota: string, sure: string = '8n'): void {
  if (Platform.OS !== 'web' || !toneLoaded || !Tone) return;

  try {
    if (enstrumanId === 'drums') {
      davulCal(nota);
      return;
    }

    const synth = synths[enstrumanId];
    if (!synth) return;

    if (enstrumanId === 'guitar' || enstrumanId === 'baglama' || enstrumanId === 'ud') {
      synth.triggerAttack(nota);
    } else {
      synth.triggerAttackRelease(nota, sure);
    }
  } catch (e) {
    console.error('Nota çalma hatası:', e, nota);
  }
}

export function notaBirak(enstrumanId: string, nota: string): void {
  if (Platform.OS !== 'web' || !toneLoaded) return;
  if (enstrumanId === 'guitar' || enstrumanId === 'baglama' || enstrumanId === 'ud') {
    const synth = synths[enstrumanId];
    if (synth && synth.releaseAll) synth.releaseAll();
  }
}

function davulCal(nota: string): void {
  switch (nota) {
    case 'C2': synths['drums_kick']?.triggerAttackRelease('C1', '8n'); break;
    case 'D2': synths['drums_snare']?.triggerAttackRelease('8n'); break;
    case 'F#2': synths['drums_hihat']?.triggerAttackRelease('32n'); break;
    case 'A#2': synths['drums_hihat_open']?.triggerAttackRelease('8n'); break;
    case 'A2': synths['drums_tom1']?.triggerAttackRelease('E2', '8n'); break;
    case 'B2': synths['drums_tom2']?.triggerAttackRelease('C2', '8n'); break;
    case 'C#3': synths['drums_crash']?.triggerAttackRelease('16n'); break;
    case 'D#3': synths['drums_ride']?.triggerAttackRelease('16n'); break;
  }
}

export function isSesMotorHazir(): boolean {
  return toneLoaded;
}
