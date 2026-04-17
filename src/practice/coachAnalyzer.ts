// coachAnalyzer.ts — makamEngine kullanan yeni versiyon
// Artık centTables.ts'den gelen gerçek frekansları kullanıyor.

import type { NotaGosterimModu, PracticeStepDef } from '../data/makamPracticeDefs';
import { noteLabelFromMode } from '../data/makamPracticeDefs';
import { centTablosu, midiAdiToSayi, midiSayiToHz, PERDE_TOLERANS_CENT } from '../makam/centTables';
import { makamAnalizEt } from '../makam/makamEngine';

export type StepStatus = 'idle' | 'playing' | 'listening' | 'correct' | 'wrong';

export interface AttemptItem {
  targetIndex: number;
  expected: string;
  heard: string;
  centFark: number;
  komaFark: number;
  at: number;
  correct: boolean;
}

export interface SessionSummaryResult {
  total: number;
  correctCount: number;
  successPct: number;
  avgAbsCent: number;
  avgAbsKoma: number;
  strongest: string[];
  weakPairs: string[];
}

// Hedef adıma karşı frekans analizi
export function analyzeAgainstTarget(
  frequency: number,
  makamId: string,
  targetStep: PracticeStepDef,
  allScaleSteps: PracticeStepDef[],
  mode: NotaGosterimModu,
  semitones = 0,
) {
  // centTables'dan hedef perdenin gerçek frekansını al
  const tab = centTablosu[makamId];
  const hedefDerece = tab?.[targetStep.degreeIndex];

  // Hedef gerçek frekans (cent offset dahil, transpoze dahil)
  let hedefHz = 0;
  if (hedefDerece) {
    const transposedMidi = midiAdiToSayi(hedefDerece.midi) + semitones;
    hedefHz = midiSayiToHz(transposedMidi) * Math.pow(2, hedefDerece.centOffset / 1200);
    // Oktav eşleştirme — kullanıcı bir oktav farklı çalıyor olabilir
    const oktavlar = [-1, 0, 1, 2];
    let enYakin = hedefHz;
    let enKucuk = Math.abs(1200 * Math.log2(frequency / hedefHz));
    for (const o of oktavlar) {
      const h = hedefHz * Math.pow(2, o);
      const fark = Math.abs(1200 * Math.log2(frequency / h));
      if (fark < enKucuk) { enKucuk = fark; enYakin = h; }
    }
    hedefHz = enYakin;
  }

  // makamEngine ile tam analiz
  const analiz = makamAnalizEt(frequency, makamId);

  // Hedef adımla eşleşiyor mu?
  const sameDegree = analiz.enYakinDerece.perde === (hedefDerece?.perde ?? targetStep.turkish);
  const centFark   = hedefHz > 0 ? 1200 * Math.log2(frequency / hedefHz) : analiz.centFark;
  const absCent    = Math.abs(centFark);
  const correct    = sameDegree && absCent <= PERDE_TOLERANS_CENT;
  const komaFark   = centFark / (1200 / 53);

  const expected = noteLabelFromMode(targetStep, mode, semitones);
  const heard    = analiz.enYakinDerece.perde;

  let feedback = '';
  if (correct) {
    feedback = absCent <= 15 ? `✓ ${expected} — tam isabet` :
               absCent <= 30 ? `✓ ${expected} — çok iyi` :
               `✓ ${expected} — kabul edilebilir`;
  } else if (sameDegree) {
    feedback = centFark > 0
      ? `${expected} — ${Math.round(absCent)} cent tiz`
      : `${expected} — ${Math.round(absCent)} cent pest`;
  } else {
    feedback = `"${heard}" duydum, hedef ${expected}`;
  }

  return {
    analysis: {
      frekans:     frequency,
      perdeIsmi:   heard,
      hedefHz:     Math.round(hedefHz * 10) / 10,
      centFark:    Math.round(centFark * 10) / 10,
      komaFark:    Math.round(komaFark * 10) / 10,
      dogruluk:    analiz.dogruluk,
    },
    expected,
    heard,
    correct,
    feedback,
    closenessLabel:
      absCent <= 10 ? 'mükemmel' :
      absCent <= 25 ? 'çok iyi'  :
      absCent <= 50 ? 'kabul edilebilir' :
      absCent <= 80 ? 'düzeltilebilir'  : 'kaçıyor',
    centFark: Math.round(centFark * 10) / 10,
    komaFark: Math.round(komaFark * 10) / 10,
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
    const correct    = items.some(i => i.correct);
    const firstWrong = items.find(i => !i.correct);
    return {
      targetIndex,
      correct,
      wrongNote: correct ? undefined : firstWrong?.heard,
      expected:  items[0]?.expected,
      attempts:  items.length,
      avgCent:   Math.round((items.reduce((s, i) => s + Math.abs(i.centFark), 0) / items.length) * 10) / 10,
    };
  });
}

export function buildSessionSummary(attempts: AttemptItem[]): SessionSummaryResult {
  if (!attempts.length) return { total: 0, correctCount: 0, successPct: 0, avgAbsCent: 0, avgAbsKoma: 0, strongest: [], weakPairs: [] };
  const grouped      = summarizeAttempts(attempts);
  const correctCount = grouped.filter(i => i.correct).length;
  const avgAbsCent   = Math.round((attempts.reduce((s, i) => s + Math.abs(i.centFark), 0) / attempts.length) * 10) / 10;
  const avgAbsKoma   = Math.round((avgAbsCent / (1200 / 53)) * 10) / 10;
  const strongest    = grouped.filter(i => i.correct).slice(0, 3).map(i => i.expected || '');
  const weakPairs    = grouped.filter(i => !i.correct).slice(0, 3).map(i => `${i.expected} → ${i.wrongNote || '—'}`);
  return { total: grouped.length, correctCount, successPct: Math.round((correctCount / grouped.length) * 100), avgAbsCent, avgAbsKoma, strongest, weakPairs };
}
