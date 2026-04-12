import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { C, F, R } from '../constants/Design';
import { frekansToNota } from '../src/audio/pitchDetector';
import { playReferenceNote, playReferenceSequence } from '../src/audio/referencePlayer';
import {
  buildSequenceForMode, coachInstruments, noteLabelFromMode, practiceMakamlari,
  transposeOptions, type CoachInstrumentId, type NotaGosterimModu, type PracticeMode,
} from '../src/data/makamPracticeDefs';
import { analyzeAgainstTarget, buildSessionSummary, summarizeAttempts, type AttemptItem } from '../src/practice/coachAnalyzer';
import { saveCoachSession } from '../src/store/sessionHistory';

const STABLE_CORRECT = 3;
const STABLE_WRONG = 3;

function statusBorder(status: string) {
  if (status === 'correct') return { borderColor: C.green, backgroundColor: C.greenGlow };
  if (status === 'wrong') return { borderColor: C.red, backgroundColor: C.redGlow };
  if (status === 'playing') return { borderColor: C.playing, backgroundColor: C.tealGlow };
  if (status === 'listening') return { borderColor: C.gold, backgroundColor: C.goldGlow };
  return { borderColor: C.border, backgroundColor: C.surface2 };
}

export default function MakamKocuScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const initialMakam = practiceMakamlari.find(m => m.id === params.id) ?? practiceMakamlari[0];

  const [selectedMakamId, setSelectedMakamId] = useState(initialMakam.id);
  const [instrument, setInstrument] = useState<CoachInstrumentId>('piano');
  const [notationMode, setNotationMode] = useState<NotaGosterimModu>('ikisi');
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('scale');
  const [selectedPhraseId, setSelectedPhraseId] = useState<string | undefined>(undefined);
  const [transpose, setTranspose] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('Hazır');
  const [heardLabel, setHeardLabel] = useState('—');
  const [heardHz, setHeardHz] = useState(0);
  const [attempts, setAttempts] = useState<AttemptItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessionSaved, setSessionSaved] = useState(false);

  const selected = practiceMakamlari.find(m => m.id === selectedMakamId) ?? practiceMakamlari[0];
  const activePhrase = selected.practice.phrases.find(p => p.id === selectedPhraseId) ?? selected.practice.phrases[0];
  const activeSequence = useMemo(() => buildSequenceForMode(selected.id, practiceMode, activePhrase?.id), [selected.id, practiceMode, activePhrase?.id]);
  const currentTarget = activeSequence[currentStep] ?? activeSequence[0];
  const sessionSummary = useMemo(() => buildSessionSummary(attempts), [attempts]);
  const summaryRows = useMemo(() => summarizeAttempts(attempts), [attempts]);
  const tonicHz = selected.practice.tonicHz * Math.pow(2, transpose / 12);
  const transposeLabel = transposeOptions.find(t => t.semitones === transpose)?.label ?? 'Yerinde';
  const progressFraction = activeSequence.length > 0 ? Math.min(1, sessionSummary.correctCount / activeSequence.length) : 0;

  const durdurRef = useRef<(() => void) | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectorRef = useRef<any>(null);
  const correctStableRef = useRef(0);
  const wrongStableRef = useRef(0);
  const lastWrongSigRef = useRef('');
  const completedRef = useRef(false);

  useEffect(() => {
    if (!selectedPhraseId && selected.practice.phrases[0]) setSelectedPhraseId(selected.practice.phrases[0].id);
  }, [selected.id]);

  useEffect(() => { resetSession(); }, [selectedMakamId, notationMode, practiceMode, selectedPhraseId, transpose]);
  useEffect(() => { return () => stopListening(); }, []);

  function resetSession() {
    setCurrentStep(0); setAttempts([]); setHeardLabel('—'); setHeardHz(0);
    setFeedback(practiceMode === 'scale' ? 'Hazır · önce diziyi dinle' : 'Hazır · örnek cümleyi dinle');
    completedRef.current = false; correctStableRef.current = 0; wrongStableRef.current = 0; lastWrongSigRef.current = '';
    setSessionSaved(false);
    setStepStatuses(activeSequence.map((_, i) => i === 0 ? 'listening' : 'idle'));
  }

  async function playScale() {
    setIsPlaying(true);
    setStepStatuses(activeSequence.map(() => 'idle'));
    await playReferenceSequence(instrument, activeSequence.map(s => s.midi), (index) => {
      setCurrentStep(index);
      setStepStatuses(activeSequence.map((_, i) => i === index ? 'playing' : i < index ? 'correct' : 'idle'));
    }, transpose);
    setStepStatuses(activeSequence.map((_, i) => i === 0 ? 'listening' : 'idle'));
    setCurrentStep(0);
    setFeedback('Sıra sende');
    setIsPlaying(false);
  }

  async function startListening() {
    setError(null);
    try {
      if (Platform.OS === 'web') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false } });
        streamRef.current = stream;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048; analyser.smoothingTimeConstant = 0.2;
        analyserRef.current = analyser;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const { PitchDetector } = await import('pitchy');
        detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize);
        setIsListening(true);
        tickPitch();
      } else {
        const { nativePitchBul } = await import('../src/audio/nativePitch');
        const fn = await nativePitchBul((f, c) => { if (f > 0 && c >= 0) processFrequency(f); }, () => setIsListening(false));
        durdurRef.current = fn; setIsListening(true);
      }
    } catch (e: any) { setError(e?.message || 'Mikrofon açılamadı'); }
  }

  function tickPitch() {
    const analyser = analyserRef.current; const detector = detectorRef.current; const ctx = audioCtxRef.current;
    if (!analyser || !detector || !ctx) return;
    const buf = new Float32Array(analyser.fftSize) as Float32Array<ArrayBuffer>;
    analyser.getFloatTimeDomainData(buf);
    const [f, c] = detector.findPitch(buf, ctx.sampleRate);
    if (c > 0.92 && f > 60 && f < 1400) processFrequency(f);
    rafRef.current = requestAnimationFrame(tickPitch);
  }

  function processFrequency(frequency: number) {
    if (completedRef.current || currentStep >= activeSequence.length) return;
    const pitch = frekansToNota(frequency);
    setHeardHz(Math.round(frequency * 10) / 10);
    setHeardLabel(`${pitch.nota}${pitch.oktav}`);
    const result = analyzeAgainstTarget(frequency, selected, tonicHz, currentTarget, selected.practice.steps, notationMode, transpose);
    setFeedback(result.correct ? `${result.expected} doğru · ${result.closenessLabel}` : `${result.feedback} · hedef ${result.expected}`);
    if (result.correct) {
      correctStableRef.current += 1; wrongStableRef.current = 0;
      if (correctStableRef.current >= STABLE_CORRECT) {
        setAttempts(prev => [...prev, { targetIndex: currentStep, expected: result.expected, heard: result.heard, koma: result.analysis.komaFark, at: Date.now(), correct: true }]);
        advanceStep(true, result.expected);
      }
      return;
    }
    correctStableRef.current = 0;
    const sig = `${currentStep}-${result.heard}-${Math.sign(result.analysis.komaFark)}`;
    if (sig === lastWrongSigRef.current) wrongStableRef.current += 1;
    else { wrongStableRef.current = 1; lastWrongSigRef.current = sig; }
    if (wrongStableRef.current >= STABLE_WRONG) {
      setAttempts(prev => [...prev, { targetIndex: currentStep, expected: result.expected, heard: result.heard, koma: result.analysis.komaFark, at: Date.now(), correct: false }]);
      wrongStableRef.current = 0;
    }
  }

  function advanceStep(correct: boolean, expectedLabel: string) {
    setStepStatuses(prev => prev.map((st, i) => {
      if (i < currentStep) return 'correct';
      if (i === currentStep) return correct ? 'correct' : 'wrong';
      if (i === currentStep + 1) return 'listening';
      return st === 'playing' ? 'idle' : prev[i];
    }));
    const next = currentStep + 1;
    if (next >= activeSequence.length) { completedRef.current = true; setFeedback(`Tamamlandı · ${expectedLabel}`); return; }
    setCurrentStep(next); correctStableRef.current = 0; wrongStableRef.current = 0; lastWrongSigRef.current = '';
  }

  function stopListening() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (durdurRef.current) durdurRef.current();
    rafRef.current = null; streamRef.current = null; audioCtxRef.current = null;
    analyserRef.current = null; detectorRef.current = null; durdurRef.current = null;
    setIsListening(false);
  }

  async function saveSession() {
    if (sessionSummary.total === 0 || sessionSaved) return;
    await saveCoachSession({ id: `${Date.now()}`, timestamp: Date.now(), makamId: selected.id, makamTitle: selected.practice.title, mode: practiceMode, phraseTitle: practiceMode === 'phrase' ? activePhrase?.title : undefined, instrumentTitle: coachInstruments.find(i => i.id === instrument)?.title || instrument, notationMode, transposeLabel, successPct: sessionSummary.successPct, avgAbsKoma: sessionSummary.avgAbsKoma, correctCount: sessionSummary.correctCount, total: sessionSummary.total });
    setSessionSaved(true); setFeedback('Seans kaydedildi ✓');
  }

  const feedbackRenk = feedback.includes('doğru') || feedback.includes('Tamamlandı') || feedback.includes('kaydedildi') ? C.green : feedback.includes('tiz') || feedback.includes('pest') ? C.amber : feedback === 'Hazır' || feedback === 'Sıra sende' ? C.textSecondary : C.red;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.geri}>← Geri</Text>
          </TouchableOpacity>
          <Text style={s.logo}>Makam Koçu</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/progress')}>
            <Text style={s.geri}>Rapor</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroGlow} />
          <Text style={s.heroTag}>{practiceMakamlari.indexOf(selected) + 1} / {practiceMakamlari.length}</Text>
          <Text style={s.heroTitle}>{selected.practice.title}</Text>
          <Text style={s.heroSub}>{selected.durak} karar · {selected.guclu} güçlü · {transposeLabel}</Text>
          <View style={s.progressBarWrap}>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${progressFraction * 100}%` }]} />
            </View>
            <Text style={s.progressText}>{sessionSummary.correctCount}/{activeSequence.length} adım</Text>
          </View>
        </View>

        {/* Adım 1 */}
        <Section title="1 · Makam ve Mod">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
            {practiceMakamlari.map(m => (
              <Chip key={m.id} label={m.practice.title} active={selectedMakamId === m.id} onPress={() => setSelectedMakamId(m.id)} />
            ))}
          </ScrollView>
          <View style={s.modeRow}>
            <Chip label="Dizi" active={practiceMode === 'scale'} onPress={() => setPracticeMode('scale')} />
            <Chip label="Örnek Cümle" active={practiceMode === 'phrase'} onPress={() => setPracticeMode('phrase')} />
          </View>
          {practiceMode === 'phrase' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
              {selected.practice.phrases.map(p => (
                <Chip key={p.id} label={p.title} sub={p.subtitle} active={activePhrase?.id === p.id} onPress={() => setSelectedPhraseId(p.id)} />
              ))}
            </ScrollView>
          )}
        </Section>

        {/* Adım 2 */}
        <Section title="2 · Enstrüman, Gösterim, Transpoze">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
            {coachInstruments.map(i => (
              <Chip key={i.id} label={`${i.emoji} ${i.title}`} active={instrument === i.id} onPress={() => setInstrument(i.id)} color={i.color} />
            ))}
          </ScrollView>
          <View style={s.modeRow}>
            {([['turk','Türkçe'],['bati','Batı'],['ikisi','İkisi']] as [NotaGosterimModu, string][]).map(([key, label]) => (
              <Chip key={key} label={label} active={notationMode === key} onPress={() => setNotationMode(key)} />
            ))}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
            {transposeOptions.map(t => (
              <Chip key={t.label} label={t.label === 'Yerinde' ? 'Yerinde' : `${t.semitones > 0 ? '+' : ''}${t.semitones} ys`} active={transpose === t.semitones} onPress={() => setTranspose(t.semitones)} />
            ))}
          </ScrollView>
        </Section>

        {/* Adım 3 - Hedef */}
        <Section title="3 · Hedef">
          <View style={s.hedefKart}>
            <Text style={s.hedefTag}>Aktif nota</Text>
            <Text style={s.hedefNota}>{currentTarget ? noteLabelFromMode(currentTarget, notationMode, transpose) : '—'}</Text>
            <View style={s.aksiyon}>
              <AksiyonBtn label="Diziyi Çal" sub="Önce dinle" onPress={playScale} loading={isPlaying} />
              <AksiyonBtn label="Bu Notayı" sub="Tek nota" onPress={() => playReferenceNote(instrument, currentTarget.midi, 1000, transpose)} />
              <AksiyonBtn label={isListening ? 'Durdur' : 'Mikrofon'} sub={isListening ? 'Analiz aktif' : 'Canlı analiz'} onPress={isListening ? stopListening : startListening} vurgu />
              <AksiyonBtn label="Kaydet" sub="Geçmişe ekle" onPress={saveSession} disabled={sessionSummary.total === 0 || sessionSaved} />
            </View>
          </View>
        </Section>

        {/* Adım 4 - Canlı analiz */}
        <Section title="4 · Canlı Analiz">
          <View style={s.canliKart}>
            <View style={s.canliMetrikler}>
              <View style={s.metrik}>
                <Text style={s.metrikLabel}>Duyulan</Text>
                <Text style={s.metrikVal}>{heardLabel}</Text>
              </View>
              <View style={s.metrik}>
                <Text style={s.metrikLabel}>Frekans</Text>
                <Text style={s.metrikVal}>{heardHz ? `${heardHz} Hz` : '—'}</Text>
              </View>
            </View>
            <Text style={[s.feedbackText, { color: feedbackRenk }]}>{feedback}</Text>
          </View>
          {error && <Text style={{ color: C.red, marginTop: 8, fontSize: F.xs }}>{error}</Text>}
          {Platform.OS !== 'web' && <Text style={{ color: C.textMuted, marginTop: 8, fontSize: F.xs }}>Hassas analiz web modunda daha güçlü.</Text>}
        </Section>

        {/* Adım 5 - Adım adım */}
        <Section title="5 · Adım Adım Sonuç">
          <View style={s.sequence}>
            {activeSequence.map((step, i) => {
              const status = stepStatuses[i] ?? 'idle';
              return (
                <View key={`${step.midi}-${i}`} style={[s.seqChip, statusBorder(status)]}>
                  <Text style={s.seqIdx}>{i + 1}</Text>
                  <Text style={s.seqLabel}>{noteLabelFromMode(step, notationMode, transpose)}</Text>
                </View>
              );
            })}
          </View>
          {summaryRows.length > 0 && (
            <View style={s.summaryList}>
              {summaryRows.map(row => (
                <View key={row.targetIndex} style={s.summaryRow}>
                  <Text style={s.summaryMain}>{row.expected}</Text>
                  <Text style={[s.summarySide, { color: row.correct ? C.green : C.red }]}>
                    {row.correct ? 'Doğru ✓' : `Yanlış · ${row.wrongNote}`}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Section>

        {/* Adım 6 - Rapor */}
        <Section title="6 · Başarı Raporu">
          <View style={s.raporGrid}>
            {[
              { label: 'Başarı', val: `%${sessionSummary.successPct}`, renk: sessionSummary.successPct >= 70 ? C.green : sessionSummary.successPct >= 40 ? C.amber : C.red },
              { label: 'Doğru Adım', val: `${sessionSummary.correctCount}/${sessionSummary.total || activeSequence.length}`, renk: C.green },
              { label: 'Ort. Sapma', val: `${sessionSummary.avgAbsKoma} koma`, renk: C.amber },
              { label: 'Mod', val: practiceMode === 'scale' ? 'Dizi' : 'Cümle', renk: C.teal },
            ].map((item, i) => (
              <View key={i} style={s.raporKart}>
                <Text style={s.raporLabel}>{item.label}</Text>
                <Text style={[s.raporVal, { color: item.renk }]}>{item.val}</Text>
              </View>
            ))}
          </View>
          {sessionSummary.strongest.length > 0 && (
            <View style={s.raporBox}>
              <Text style={s.raporBoxBaslik}>Güçlü notalar</Text>
              <Text style={{ color: C.green, fontWeight: '700' }}>{sessionSummary.strongest.join(' · ')}</Text>
            </View>
          )}
          {sessionSummary.weakPairs.length > 0 && (
            <View style={[s.raporBox, { borderLeftColor: C.red }]}>
              <Text style={s.raporBoxBaslik}>Tekrar et</Text>
              <Text style={{ color: C.red, fontWeight: '700' }}>{sessionSummary.weakPairs.join(' · ')}</Text>
            </View>
          )}
        </Section>

      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Chip({ label, sub, active, onPress, color }: { label: string; sub?: string; active?: boolean; onPress: () => void; color?: string }) {
  const c = color || C.gold;
  return (
    <TouchableOpacity style={[s.chip, active && { borderColor: c, backgroundColor: c + '1A' }]} onPress={onPress} activeOpacity={0.75}>
      <Text style={[s.chipLabel, active && { color: c }]}>{label}</Text>
      {sub ? <Text style={s.chipSub}>{sub}</Text> : null}
    </TouchableOpacity>
  );
}

function AksiyonBtn({ label, sub, onPress, loading, vurgu, disabled }: { label: string; sub: string; onPress: () => void; loading?: boolean; vurgu?: boolean; disabled?: boolean }) {
  return (
    <TouchableOpacity disabled={disabled}
      style={[s.aksiyonBtn, vurgu && s.aksiyonBtnVurgu, disabled && { opacity: 0.4 }]}
      onPress={onPress} activeOpacity={0.8}>
      <Text style={s.aksiyonLabel}>{loading ? 'Çalıyor...' : label}</Text>
      <Text style={s.aksiyonSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 20 },
  geri: { color: C.textSecondary, fontSize: F.md, fontWeight: '600' },
  logo: { color: C.textPrimary, fontWeight: '900', fontSize: F.lg },
  hero: { backgroundColor: C.surface, borderRadius: R.xl, padding: 22, marginBottom: 16, borderWidth: 1, borderColor: C.border2, overflow: 'hidden', position: 'relative' },
  heroGlow: { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: C.goldGlow },
  heroTag: { color: C.gold, fontSize: F.xs, fontWeight: '800', letterSpacing: 2, marginBottom: 6 },
  heroTitle: { color: C.textPrimary, fontWeight: '900', fontSize: F.xxl + 4, marginBottom: 6 },
  heroSub: { color: C.textMuted, fontSize: F.sm, marginBottom: 16 },
  progressBarWrap: { gap: 6 },
  progressBar: { height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: C.gold, borderRadius: 3 },
  progressText: { color: C.textSecondary, fontSize: F.xs, fontWeight: '600' },
  section: { backgroundColor: C.surface, borderRadius: R.xl, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12 },
  sectionTitle: { color: C.gold, fontWeight: '800', fontSize: F.md, marginBottom: 14, letterSpacing: 0.5 },
  chipRow: { gap: 8, paddingBottom: 4 },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: { backgroundColor: C.surface2, borderRadius: R.lg, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: C.border },
  chipLabel: { color: C.textSecondary, fontWeight: '700', fontSize: F.sm },
  chipSub: { color: C.textMuted, fontSize: F.xs, marginTop: 2 },
  hedefKart: { backgroundColor: C.surface2, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, padding: 16 },
  hedefTag: { color: C.gold, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  hedefNota: { color: C.textPrimary, fontSize: F.xxl + 8, fontWeight: '900', marginTop: 6, marginBottom: 16 },
  aksiyon: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  aksiyonBtn: { flexBasis: '48%', backgroundColor: C.surface, borderRadius: R.md, padding: 14, borderWidth: 1, borderColor: C.border },
  aksiyonBtnVurgu: { backgroundColor: C.goldGlow, borderColor: C.gold },
  aksiyonLabel: { color: C.textPrimary, fontWeight: '800', fontSize: F.sm },
  aksiyonSub: { color: C.textMuted, fontSize: F.xs, marginTop: 4 },
  canliKart: { backgroundColor: C.surface2, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, padding: 16 },
  canliMetrikler: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  metrik: { flex: 1, backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1, borderColor: C.border, padding: 12 },
  metrikLabel: { color: C.textMuted, fontSize: F.xs },
  metrikVal: { color: C.textPrimary, fontWeight: '900', fontSize: F.lg, marginTop: 4 },
  feedbackText: { fontSize: F.md, fontWeight: '700', textAlign: 'center', paddingVertical: 4 },
  sequence: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  seqChip: { borderRadius: R.md, borderWidth: 1, padding: 12, minWidth: '47%' },
  seqIdx: { color: C.gold, fontWeight: '700', fontSize: F.xs },
  seqLabel: { color: C.textPrimary, fontWeight: '800', marginTop: 4, fontSize: F.md },
  summaryList: { marginTop: 12, gap: 6 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.surface2, borderRadius: R.md, padding: 12, borderWidth: 1, borderColor: C.border },
  summaryMain: { color: C.textPrimary, fontWeight: '700' },
  summarySide: { fontWeight: '800', fontSize: F.sm },
  raporGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  raporKart: { flexBasis: '48%', backgroundColor: C.surface2, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: C.border },
  raporLabel: { color: C.textMuted, fontSize: F.xs },
  raporVal: { fontWeight: '900', fontSize: F.xl, marginTop: 4 },
  raporBox: { backgroundColor: C.surface2, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, borderLeftColor: C.green, marginTop: 8 },
  raporBoxBaslik: { color: C.textSecondary, fontSize: F.xs, fontWeight: '700', marginBottom: 6 },
});
