import { requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

export interface MakamAudioModule {
  prepare(): Promise<void>;
  /** Play a note with microtonal cent offset via MIDI pitch bend */
  playNote(
    midiNote: number,
    velocity: number,
    durationMs: number,
    centOffset: number,
    channel: number,
  ): void;
  stopNote(midiNote: number, channel: number): void;
  setInstrument(gmProgram: number, channel: number): void;
  setReverb(wetLevel: number): void;
  isReady(): boolean;
}

let _module: MakamAudioModule | null = null;

export function getMakamAudioModule(): MakamAudioModule | null {
  if (Platform.OS === 'web') return null;
  if (!_module) {
    try {
      _module = requireNativeModule<MakamAudioModule>('MakamAudio');
    } catch {
      return null;
    }
  }
  return _module;
}
