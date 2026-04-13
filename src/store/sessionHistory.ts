import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'makam_coach_sessions_v1';

export interface CoachSessionRecord {
  id: string;
  timestamp: number;
  makamId: string;
  makamTitle: string;
  mode: 'scale' | 'phrase';
  phraseTitle?: string;
  instrumentTitle: string;
  notationMode: 'turk' | 'bati' | 'ikisi';
  transposeLabel: string;
  successPct: number;
  avgAbsKoma: number;
  correctCount: number;
  total: number;
}

export async function loadCoachSessions(): Promise<CoachSessionRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveCoachSession(record: CoachSessionRecord) {
  const sessions = await loadCoachSessions();
  const next = [record, ...sessions].slice(0, 30);
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}
