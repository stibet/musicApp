import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'makam_practice_settings_v1';

export type ToleranceMode = 'easy' | 'normal' | 'hard';
export type TempoMode = 'slow' | 'normal' | 'fast';

export interface PracticeSettings {
  toleranceMode: ToleranceMode;
  toleranceCent: number;
  tempoMode: TempoMode;
  tempoMs: number;
  repeats: number;
  showDebugPanel: boolean;
}

export const DEFAULT_SETTINGS: PracticeSettings = {
  toleranceMode: 'normal',
  toleranceCent: 25,
  tempoMode: 'normal',
  tempoMs: 720,
  repeats: 1,
  showDebugPanel: false,
};

export const tolerancePresets: Record<ToleranceMode, number> = {
  easy: 40,
  normal: 25,
  hard: 15,
};

export const tempoPresets: Record<TempoMode, number> = {
  slow: 980,
  normal: 720,
  fast: 520,
};

export async function loadPracticeSettings(): Promise<PracticeSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function savePracticeSettings(partial: Partial<PracticeSettings>) {
  const current = await loadPracticeSettings();
  const next = { ...current, ...partial };
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}
