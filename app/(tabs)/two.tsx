import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, F, R } from '../../constants/Design';
import { frekansToNota } from '../../src/audio/pitchDetector';
import { frekansiMakamaGoreAnalizEt, perdeDurumMetni, sessionIstatistigiHesapla, type MakamPitchFrame } from '../../src/audio/makamAnalyzer';
import { practiceMakamlari } from '../../src/data/makamPracticeDefs';
import { makamlar } from '../../src/data/makamlar';

export default function PitchScreen() {
  const [dinliyor, setDinliyor] = useState(false);
  const [secilenId, setSecilenId] = useState(practiceMakamlari[0].id);
  const [sonuc, setSonuc] = useState<{ nota: string; frekans: number; clarity: number; analiz: MakamPitchFrame } | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [sessionFrames, setSessionFrames] = useState<MakamPitchFrame[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectorRef = useRef<any>(null);
  const lastAcceptedRef = useRef<number>(0);
  const lastSigRef = useRef('');
  const durdurRef = useRef<(() => void) | null>(null);

  useEffect(() => { return () => durdur(); }, []);
  useEffect(() => { setSessionFrames([]); setSonuc(null); }, [secilenId]);

  const stats = useMemo(() => sessionIstatistigiHesapla(sessionFrames), [sessionFrames]);
  const secilenMakam = makamlar.find(m => m.id === secilenId) || makamlar[0];

  async function basla() {
    setHata(null);
    try {
      if (Platform.OS === 'web') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false } });
        streamRef.current = stream;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.15;
        analyserRef.current = analyser;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const { PitchDetector } = await import('pitchy');
        detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize);
        setDinliyor(true);
        analiz();
      } else {
        const { nativePitchBul } = await import('../../src/audio/nativePitch');
        const fn = await nativePitchBul(
          (f, c) => { if (f > 0) pitchGuncelle(f, c); else setSonuc(null); },
          () => setDinliyor(false)
        );
        durdurRef.current = fn;
        setDinliyor(true);
      }
    } catch (e: any) { setHata(e.message || 'Mikrofon hatası'); }
  }

  function analiz() {
    const analyser = analyserRef.current; const detector = detectorRef.current; const ctx = audioCtxRef.current;
    if (!analyser || !detector || !ctx) return;
    const buf = new Float32Array(analyser.fftSize) as Float32Array<ArrayBuffer>;
    analyser.getFloatTimeDomainData(buf);
    const [f, c] = detector.findPitch(buf, ctx.sampleRate);
    if (c > 0.92 && f > 60 && f < 1400) pitchGuncelle(f, c); else setSonuc(null);
    rafRef.current = requestAnimationFrame(analiz);
  }

  function pitchGuncelle(frekans: number, clarity: number) {
    const notaBilgi = frekansToNota(frekans);
    const analiz = frekansiMakamaGoreAnalizEt(frekans, secilenMakam, 220);
    setSonuc({ nota: notaBilgi.nota, frekans: Math.round(frekans * 10) / 10, clarity: Math.round(clarity * 100), analiz });
    const imza = `${analiz.perdeIsmi}:${Math.sign(analiz.komaFark)}:${Math.round(frekans)}`;
    const simdi = Date.now();
    if (simdi - lastAcceptedRef.current < 180 && lastSigRef.current === imza) return;
    lastAcceptedRef.current = simdi; lastSigRef.current = imza;
    setSessionFrames(prev => [...prev, analiz].slice(-120));
  }

  function durdur() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (durdurRef.current) durdurRef.current();
    audioCtxRef.current = null; analyserRef.current = null; streamRef.current = null; durdurRef.current = null;
    setDinliyor(false); setSonuc(null);
  }

  const komaRenk = (k: number) => Math.abs(k) <= 1 ? C.green : Math.abs(k) <= 3 ? C.amber : C.red;
  const komaYorum = (k: number) => Math.abs(k) <= 1 ? 'Tam hedefte ✓' : k > 0 ? `+${k} koma tiz ↑` : `${k} koma pest ↓`;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.pageTitle}>Canlı Analiz</Text>
        <Text style={s.pageSub}>Enstrüman veya sesini çal, mikrotonal geri bildirim al</Text>

        {Platform.OS !== 'web' && (
          <View style={s.uyariBox}><Text style={s.uyariText}>⚠ Hassas koma analizi web modunda daha güçlü. Terminalde "w" bas.</Text></View>
        )}
        {hata && <View style={s.hataBox}><Text style={s.hataText}>{hata}</Text></View>}

        {/* Makam seçimi */}
        <Text style={s.label}>Makam</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {practiceMakamlari.map(m => (
            <TouchableOpacity key={m.id}
              style={[s.chip, secilenId === m.id && s.chipAktif]}
              onPress={() => setSecilenId(m.id)}>
              <Text style={[s.chipText, secilenId === m.id && s.chipTextAktif]}>{m.practice.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Gösterge */}
        <View style={s.gosterge}>
          {sonuc ? (
            <>
              <Text style={s.hz}>{sonuc.frekans} Hz · %{sonuc.clarity}</Text>
              <Text style={s.notaBuyuk}>{sonuc.nota}</Text>
              <Text style={s.hedef}>Hedef: <Text style={{ color: C.textPrimary, fontWeight: '700' }}>{sonuc.analiz.perdeIsmi}</Text> · {sonuc.analiz.hedefHz} Hz</Text>
              <Text style={[s.komaYorum, { color: komaRenk(sonuc.analiz.komaFark) }]}>
                {komaYorum(sonuc.analiz.komaFark)}
              </Text>
              {/* Koma göstergesi */}
              <View style={s.barWrap}>
                <View style={s.bar}>
                  <View style={s.barMerkez} />
                  <View style={[s.barTop, {
                    left: `${Math.min(90, Math.max(10, 50 + (sonuc.analiz.komaFark / 8) * 40))}%`,
                    backgroundColor: komaRenk(sonuc.analiz.komaFark)
                  }]} />
                </View>
                <View style={s.barLabels}>
                  <Text style={s.barLabel}>Pest</Text>
                  <Text style={s.barLabel}>Doğru</Text>
                  <Text style={s.barLabel}>Tiz</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={s.bekle}>{dinliyor ? 'Ses bekleniyor...' : 'Başlamak için butona bas'}</Text>
          )}
        </View>

        {/* İstatistik */}
        <View style={s.statBox}>
          <View style={s.statRow}>
            <View style={s.statBaslik}>
              <Text style={s.statBaslikText}>Seans Özeti</Text>
              <TouchableOpacity onPress={() => setSessionFrames([])}>
                <Text style={{ color: C.red, fontSize: F.xs, fontWeight: '700' }}>Sıfırla</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.statGrid}>
            <View style={s.statKart}>
              <Text style={s.statLabel}>İsabet</Text>
              <Text style={[s.statDeger, { color: C.green }]}>%{stats.isabetYuzde}</Text>
            </View>
            <View style={s.statKart}>
              <Text style={s.statLabel}>Ort. Sapma</Text>
              <Text style={[s.statDeger, { color: C.amber }]}>{stats.ortalamaMutlakKoma} koma</Text>
            </View>
          </View>
          {stats.baskinPerdeler.length > 0 && (
            <>
              <Text style={[s.label, { marginBottom: 8 }]}>Baskın perdeler</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {stats.baskinPerdeler.map(p => (
                  <View key={p.isim} style={s.perdeTag}>
                    <Text style={s.perdeTagText}>{p.isim} · {p.adet}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Buton */}
        <TouchableOpacity style={[s.btn, dinliyor && s.btnDur]} onPress={dinliyor ? durdur : basla} activeOpacity={0.8}>
          <Text style={s.btnText}>{dinliyor ? '■ Durdur' : '▶ Dinlemeye Başla'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingTop: 60, paddingBottom: 48 },
  pageTitle: { color: C.textPrimary, fontSize: F.xxl, fontWeight: '900', marginBottom: 4 },
  pageSub: { color: C.textSecondary, fontSize: F.sm, marginBottom: 24 },
  uyariBox: { backgroundColor: C.surface2, borderRadius: R.md, padding: 12, borderLeftWidth: 3, borderLeftColor: C.amber, marginBottom: 16 },
  uyariText: { color: C.amber, fontSize: F.xs },
  hataBox: { backgroundColor: C.redDim, borderRadius: R.md, padding: 12, marginBottom: 16 },
  hataText: { color: C.red, fontSize: F.xs },
  label: { color: C.textMuted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: R.full, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface2, marginRight: 8 },
  chipAktif: { borderColor: C.gold, backgroundColor: C.goldGlow },
  chipText: { color: C.textMuted, fontWeight: '600', fontSize: F.sm },
  chipTextAktif: { color: C.gold },
  gosterge: { backgroundColor: C.surface, borderRadius: R.xl, padding: 28, alignItems: 'center', minHeight: 260, justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: C.border },
  bekle: { color: C.textMuted, fontSize: F.md },
  hz: { color: C.textMuted, fontSize: F.xs, marginBottom: 4 },
  notaBuyuk: { fontSize: 72, fontWeight: '900', color: C.textPrimary, marginBottom: 8 },
  hedef: { color: C.textMuted, fontSize: F.sm, marginBottom: 8 },
  komaYorum: { fontSize: F.xl, fontWeight: '800', marginBottom: 20 },
  barWrap: { width: '100%' },
  bar: { height: 6, backgroundColor: C.border2, borderRadius: 3, marginBottom: 8, position: 'relative', justifyContent: 'center' },
  barMerkez: { position: 'absolute', left: '50%', width: 2, height: 14, backgroundColor: C.green, marginLeft: -1, top: -4 },
  barTop: { position: 'absolute', width: 14, height: 14, borderRadius: 7, marginLeft: -7, top: -4 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { color: C.textMuted, fontSize: F.xs },
  statBox: { backgroundColor: C.surface, borderRadius: R.xl, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  statRow: {},
  statBaslik: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  statBaslikText: { color: C.textPrimary, fontWeight: '800', fontSize: F.md },
  statGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statKart: { flex: 1, backgroundColor: C.surface2, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: C.border },
  statLabel: { color: C.textMuted, fontSize: F.xs },
  statDeger: { fontSize: F.xl, fontWeight: '900', marginTop: 6 },
  perdeTag: { backgroundColor: C.surface2, borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: C.border },
  perdeTagText: { color: C.textSecondary, fontSize: F.xs, fontWeight: '600' },
  btn: { backgroundColor: C.gold, borderRadius: R.lg, padding: 18, alignItems: 'center' },
  btnDur: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border2 },
  btnText: { color: C.bg, fontWeight: '900', fontSize: F.lg },
});
