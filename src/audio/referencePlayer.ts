import { Platform } from 'react-native';
import { notaCal, sesMotorBaslat } from './sesMotoru';
import type { CoachInstrumentId } from '../data/makamPracticeDefs';
import { transposeMidi } from '../data/makamPracticeDefs';

const instrumentMap: Record<CoachInstrumentId, string> = {
  piano: 'piano',
  clarinet: 'flute',
  violin: 'violin',
  ney: 'ney',
};

export async function playReferenceNote(instrument: CoachInstrumentId, midi: string, duration = 700, semitones = 0) {
  if (Platform.OS !== 'web') return;
  await sesMotorBaslat();
  notaCal(instrumentMap[instrument], transposeMidi(midi, semitones), duration > 900 ? '2n' : '4n');
}

export async function playReferenceSequence(
  instrument: CoachInstrumentId,
  notes: string[],
  onStep?: (index: number) => void,
  semitones = 0,
) {
  if (Platform.OS !== 'web') return;
  await sesMotorBaslat();
  for (let i = 0; i < notes.length; i += 1) {
    onStep?.(i);
    notaCal(instrumentMap[instrument], transposeMidi(notes[i], semitones), '4n');
    await new Promise((resolve) => setTimeout(resolve, 760));
  }
}
