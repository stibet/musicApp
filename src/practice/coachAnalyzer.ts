import type { NotaGosterimModu, PracticeStepDef } from '../data/makamPracticeDefs';
import { noteLabelFromMode } from '../data/makamPracticeDefs';
import type { Makam } from '../data/makamlar';
import { frekansiMakamaGoreAnalizEt } from '../audio/makamAnalyzer';

export type StepStatus = 'idle' | 'playing' | 'listening' | 'correct' | 'wrong';

export interface AttemptItem {
  targetIndex: number;
  expected: string;
  heard: string;
  koma: number;
  at: number;
  correct: boolean;
}

export interface SessionSummaryResult {
  total: number;
  correctCount: number;
  successPct: number;
  avgAbsKoma: number;
  strongest: string[];
  weakPairs: string[];
}

export function analyzeAgainstTarget(
  frequency: number,
  makam: Makam,
  tonicHz: number,
  targetStep: PracticeStepDef,
  allScaleSteps: PracticeStepDef[],
  mode: NotaGosterimModu,
  semitones = 0,
) {
  const analysis = frekansiMakamaGoreAnalizEt(frequency, makam, tonicHz);
  const heardStep = allScaleSteps[analysis.dereceIndex] ?? targetStep;
  const expected = noteLabelFromMode(targetStep, mode, semitones);
  const heard = noteLabelFromMode(heardStep, mode, semitones);
  const sameDegree = analysis.dereceIndex === targetStep.degreeIndex;
  const abs = Math.abs(analysis.komaFark);
  const closeEnough = abs <= 2;
  const correct = sameDegree && closeEnough;

  let feedback = 'Yanlış perde';
  if (correct) feedback = 'Hedef doğru';
  else if (sameDegree) feedback = analysis.komaFark > 0 ? 'Biraz tiz' : 'Biraz pest';
  else feedback = `${heard} duydum`;

  return {
    analysis,
    expected,
    heard,
    correct,
    closenessLabel: abs <= 1 ? 'çok yakın' : abs <= 2 ? 'kabul edilebilir' : abs <= 4 ? 'düzeltilebilir' : 'kaçıyor',
    feedback,
  };
}

export function summarizeAttempts(attempts: AttemptItem[]) {
  const grouped = new Map<number, AttemptItem[]>();
  for (const item of attempts) {
    const arr = grouped.get(item.targetIndex) ?? [];
    arr.push(item);
    grouped.set(item.targetIndex, arr);
  }

  return [...grouped.entries()].map(([targetIndex, items]) => {
    const correct = items.some((i) => i.correct);
    const firstWrong = items.find((i) => !i.correct);
    return {
      targetIndex,
      correct,
      wrongNote: correct ? undefined : firstWrong?.heard,
      expected: items[0]?.expected,
      attempts: items.length,
      avgKoma: Math.round((items.reduce((sum, item) => sum + Math.abs(item.koma), 0) / items.length) * 10) / 10,
    };
  });
}

export function buildSessionSummary(attempts: AttemptItem[]): SessionSummaryResult {
  if (attempts.length === 0) {
    return { total: 0, correctCount: 0, successPct: 0, avgAbsKoma: 0, strongest: [], weakPairs: [] };
  }

  const grouped = summarizeAttempts(attempts);
  const correctCount = grouped.filter((item) => item.correct).length;
  const avgAbsKoma = Math.round((attempts.reduce((sum, item) => sum + Math.abs(item.koma), 0) / attempts.length) * 10) / 10;
  const strongest = grouped.filter((item) => item.correct).slice(0, 3).map((item) => item.expected || '');
  const weakPairs = grouped.filter((item) => !item.correct).slice(0, 3).map((item) => `${item.expected} → ${item.wrongNote || '—'}`);

  return {
    total: grouped.length,
    correctCount,
    successPct: Math.round((correctCount / grouped.length) * 100),
    avgAbsKoma,
    strongest,
    weakPairs,
  };
}
