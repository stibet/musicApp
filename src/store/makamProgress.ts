import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'makam_progress_v1';

export interface MakamProgressItem {
  makamId: string;
  sessions: number;
  totalSteps: number;
  totalCorrect: number;
  bestSuccessPct: number;
  avgSuccessPct: number;
  avgAbsKoma: number;
  lastStudiedAt: number;
  weakestNotes: string[];
}

export interface MakamProgressStore {
  items: Record<string, MakamProgressItem>;
}

export interface MakamProgressInput {
  makamId: string;
  successPct: number;
  avgAbsKoma: number;
  correctCount: number;
  total: number;
  weakPairs?: string[];
}

export async function loadMakamProgress(): Promise<MakamProgressStore> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { items: {} };
  } catch {
    return { items: {} };
  }
}

export async function saveMakamProgressEntry(input: MakamProgressInput) {
  const store = await loadMakamProgress();
  const prev = store.items[input.makamId];
  const sessions = (prev?.sessions ?? 0) + 1;
  const totalSteps = (prev?.totalSteps ?? 0) + input.total;
  const totalCorrect = (prev?.totalCorrect ?? 0) + input.correctCount;
  const totalSuccessWeighted = (prev?.avgSuccessPct ?? 0) * (prev?.sessions ?? 0) + input.successPct;
  const totalKomaWeighted = (prev?.avgAbsKoma ?? 0) * (prev?.sessions ?? 0) + input.avgAbsKoma;
  store.items[input.makamId] = {
    makamId: input.makamId,
    sessions,
    totalSteps,
    totalCorrect,
    bestSuccessPct: Math.max(prev?.bestSuccessPct ?? 0, input.successPct),
    avgSuccessPct: Math.round((totalSuccessWeighted / sessions) * 10) / 10,
    avgAbsKoma: Math.round((totalKomaWeighted / sessions) * 10) / 10,
    lastStudiedAt: Date.now(),
    weakestNotes: (input.weakPairs ?? []).slice(0, 5),
  };
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(store));
  } catch {}
  return store.items[input.makamId];
}
