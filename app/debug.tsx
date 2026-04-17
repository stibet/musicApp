import { useRef, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C, F, R } from '../constants/Design';
import { makamDefler, getDereceLabel } from '../src/makam/makamDef';
import { makamAnalizEt } from '../src/makam/makamEngine';

interface DebugFrame {
  zaman: number;
  algilananHz: number;
  clarity: number;
  makamId: string;
  enYakinPerde: string;
  dereceIndex: number;
  centFark: number;
  komaFark: number;
  makamda: boolean;
  dogruluk: number;
}

export default function DebugScreen() {
  const router = useRouter();
  const [aktifMakam, setAktifMakam] = useState('rast');
  const [dinliyor, setDinliyor] = useState(false);
  const [sonFrame, setSonFrame] = useState<DebugFrame | null>(null);
  const [gecmis, setGecmis] = useState<DebugFrame[]>([]);
  const [hata, setHata] = useState<string | null>(null);
  const [tolerans, setTolerans] = useState(50);

  const rafRef    = useRef<number | null>(null);
  const ctxRef    = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const gecmisRef   = useRef<DebugFrame[]>([]);

  async function baslat() {
    if (Platform.OS !== 'web') { setHata('Sadece web modunda çalışır'); return; }
    setHata(null); setGecmis([]); gecmisRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.1;
      analyserRef.current = analyser;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const { PitchDetector } = await import('pitchy');
      detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize);
      setDinliyor(true);
      tick();
    } catch (e: any) { setHata(e.message); }
  }

  function tick() {
    const analyser = analyserRef.current;
    const detector = detectorRef.current;
    const ctx      = ctxRef.current;
    if (!analyser || !detector || !ctx) return;
    const buf = new Float32Array(analyser.fftSize) as Float32Array<ArrayBuffer>;
    analyser.getFloatTimeDomainData(buf);
    const [hz, clarity] = detector.findPitch(buf, ctx.sampleRate);
    if (clarity > 0.85 && hz > 50 && hz < 3000) {
      const analiz = makamAnalizEt(hz, aktifMakam);
      const frame: DebugFrame = {
        zaman: Date.now(),
        algilananHz: Math.round(hz * 10) / 10,
        clarity: Math.round(clarity * 100),
        makamId: aktifMakam,
        enYakinPerde: analiz.enYakinDerece.turAdi,
        dereceIndex: analiz.enYakinDerece.index,
        centFark: analiz.centFark,
        komaFark: analiz.komaFark,
        makamda: Math.abs(analiz.centFark) <= tolerans,
        dogruluk: analiz.dogruluk,
      };
      setSonFrame(frame);
      gecmisRef.current = [frame, ...gecmisRef.current].slice(0, 50);
      setGecmis([...gecmisRef.current]);
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function durdur() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (ctxRef.current) ctxRef.current.close();
    rafRef.current = streamRef.current = ctxRef.current = analyserRef.current = detectorRef.current = null;
    setDinliyor(false);
  }

  const centRenk = (c: number) => Math.abs(c) <= 15 ? C.green : Math.abs(c) <= 35 ? C.amber : C.red;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>← Geri</Text></TouchableOpacity>
        <Text style={s.baslik}>🔧 Debug — Pitch</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Makam seç */}
        <Text style={s.label}>Test Makamı</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {makamDefler.map(m => (
            <TouchableOpacity key={m.id} disabled={dinliyor}
              style={[s.chip, aktifMakam === m.id && s.chipAktif]}
              onPress={() => setAktifMakam(m.id)}>
              <Text style={[s.chipText, aktifMakam === m.id && s.chipTextAktif]}>{m.turAdi}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tolerans */}
        <Text style={s.label}>Tolerans: ±{tolerans} cent</Text>
        <View style={s.toleransRow}>
          {[15, 25, 35, 50, 70].map(t => (
            <TouchableOpacity key={t} style={[s.toleransBtn, tolerans === t && s.toleransBtnAktif]}
              onPress={() => setTolerans(t)}>
              <Text style={[s.toleransBtnText, tolerans === t && { color: C.gold }]}>±{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Canlı gösterge */}
        <View style={s.canli}>
          {sonFrame ? (
            <>
              <View style={s.canliRow}>
                <View style={s.canliKutu}>
                  <Text style={s.canliLabel}>Algılanan Hz</Text>
                  <Text style={[s.canliDeger, { color: C.teal }]}>{sonFrame.algilananHz}</Text>
                </View>
                <View style={s.canliKutu}>
                  <Text style={s.canliLabel}>Clarity</Text>
                  <Text style={[s.canliDeger, { color: C.amber }]}>%{sonFrame.clarity}</Text>
                </View>
                <View style={s.canliKutu}>
                  <Text style={s.canliLabel}>Perde</Text>
                  <Text style={[s.canliDeger, { color: sonFrame.makamda ? C.green : C.red }]}>
                    {sonFrame.enYakinPerde}
                  </Text>
                </View>
              </View>
              <View style={s.canliRow}>
                <View style={s.canliKutu}>
                  <Text style={s.canliLabel}>Cent Fark</Text>
                  <Text style={[s.canliDeger, { color: centRenk(sonFrame.centFark) }]}>
                    {sonFrame.centFark > 0 ? '+' : ''}{sonFrame.centFark}
                  </Text>
                </View>
                <View style={s.canliKutu}>
                  <Text style={s.canliLabel}>Koma Fark</Text>
                  <Text style={[s.canliDeger, { color: centRenk(sonFrame.centFark) }]}>
                    {sonFrame.komaFark > 0 ? '+' : ''}{sonFrame.komaFark}
                  </Text>
                </View>
                <View style={s.canliKutu}>
                  <Text style={s.canliLabel}>Doğruluk</Text>
                  <Text style={[s.canliDeger, { color: sonFrame.dogruluk >= 75 ? C.green : C.amber }]}>
                    %{sonFrame.dogruluk}
                  </Text>
                </View>
              </View>
              {/* Cent göstergesi */}
              <View style={s.centBar}>
                <View style={s.centBarOrta} />
                <View style={[s.centBarTop, {
                  left: `${Math.min(90, Math.max(10, 50 + (sonFrame.centFark / 100) * 40))}%`,
                  backgroundColor: centRenk(sonFrame.centFark),
                }]} />
              </View>
              <View style={s.centLabels}>
                <Text style={s.centLabel}>-100 cent</Text>
                <Text style={[s.centLabel, { color: C.green }]}>0</Text>
                <Text style={s.centLabel}>+100 cent</Text>
              </View>
              <Text style={[s.makamdurum, { color: sonFrame.makamda ? C.green : C.red }]}>
                {sonFrame.makamda ? `✓ ${aktifMakam} makamında` : `✗ Makam dışı`}
              </Text>
            </>
          ) : (
            <Text style={s.bekle}>{dinliyor ? 'Ses bekleniyor...' : 'Mikrofonu başlat'}</Text>
          )}
        </View>

        {/* Buton */}
        {Platform.OS === 'web' ? (
          <TouchableOpacity style={[s.btn, dinliyor && s.btnDur]} onPress={dinliyor ? durdur : baslat}>
            <Text style={[s.btnText, dinliyor && { color: C.textSecondary }]}>
              {dinliyor ? '■ Durdur' : '▶ Mikrofonu Başlat'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={s.uyari}><Text style={{ color: C.amber, fontSize: F.sm }}>⚠ Web modunda çalışır. "w" bas.</Text></View>
        )}
        {hata && <Text style={{ color: C.red, fontSize: F.xs, textAlign: 'center', marginTop: 8 }}>{hata}</Text>}

        {/* Geçmiş */}
        {gecmis.length > 0 && (
          <View style={s.gecmis}>
            <Text style={s.label}>Son 20 Frame</Text>
            <View style={s.gecmisBaslik}>
              <Text style={[s.gecmisH, { width: 70 }]}>Hz</Text>
              <Text style={[s.gecmisH, { flex: 1 }]}>Perde</Text>
              <Text style={[s.gecmisH, { width: 55 }]}>Cent</Text>
              <Text style={[s.gecmisH, { width: 45 }]}>Koma</Text>
              <Text style={[s.gecmisH, { width: 40 }]}>%</Text>
            </View>
            {gecmis.slice(0, 20).map((f, i) => (
              <View key={i} style={[s.gecmisSatir, !f.makamda && { backgroundColor: C.redGlow }]}>
                <Text style={[s.gecmisD, { width: 70, color: C.teal }]}>{f.algilananHz}</Text>
                <Text style={[s.gecmisD, { flex: 1, color: f.makamda ? C.green : C.red }]}>{f.enYakinPerde}</Text>
                <Text style={[s.gecmisD, { width: 55, color: centRenk(f.centFark) }]}>
                  {f.centFark > 0 ? '+' : ''}{f.centFark}
                </Text>
                <Text style={[s.gecmisD, { width: 45, color: centRenk(f.centFark) }]}>
                  {f.komaFark > 0 ? '+' : ''}{f.komaFark}
                </Text>
                <Text style={[s.gecmisD, { width: 40 }]}>%{f.dogruluk}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: C.border },
  geri:      { color: C.textSecondary, fontSize: F.md, fontWeight: '600', width: 60 },
  baslik:    { color: C.textPrimary, fontWeight: '900', fontSize: F.lg },
  content:   { padding: 16, paddingBottom: 48 },
  label:     { color: C.textMuted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  chip:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: R.full, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface2, marginRight: 8 },
  chipAktif: { borderColor: C.gold, backgroundColor: C.goldGlow },
  chipText:  { color: C.textMuted, fontSize: F.sm, fontWeight: '600' },
  chipTextAktif: { color: C.gold },
  toleransRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  toleransBtn:  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: R.full, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface2 },
  toleransBtnAktif: { borderColor: C.gold, backgroundColor: C.goldGlow },
  toleransBtnText:  { color: C.textMuted, fontSize: F.xs, fontWeight: '600' },
  canli:     { backgroundColor: C.surface, borderRadius: R.xl, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border, minHeight: 160 },
  canliRow:  { flexDirection: 'row', gap: 8, marginBottom: 10 },
  canliKutu: { flex: 1, backgroundColor: C.surface2, borderRadius: R.md, padding: 10, alignItems: 'center' },
  canliLabel:{ color: C.textMuted, fontSize: F.xs },
  canliDeger:{ fontWeight: '900', fontSize: F.lg, marginTop: 2 },
  centBar:   { height: 8, backgroundColor: C.surface2, borderRadius: 4, position: 'relative', marginBottom: 4, marginTop: 8 },
  centBarOrta:{ position: 'absolute', left: '50%', width: 2, height: 14, backgroundColor: C.green, top: -3 },
  centBarTop: { position: 'absolute', width: 14, height: 14, borderRadius: 7, top: -3, marginLeft: -7 },
  centLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  centLabel:  { color: C.textMuted, fontSize: F.xs },
  makamdurum: { textAlign: 'center', fontWeight: '800', fontSize: F.md },
  bekle:     { color: C.textMuted, textAlign: 'center', marginTop: 20 },
  btn:       { backgroundColor: C.gold, borderRadius: R.lg, padding: 16, alignItems: 'center', marginBottom: 16 },
  btnDur:    { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
  btnText:   { color: C.bg, fontWeight: '900', fontSize: F.md },
  uyari:     { backgroundColor: C.surface2, borderRadius: R.lg, padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: C.amber },
  gecmis:    { marginTop: 8 },
  gecmisBaslik: { flexDirection: 'row', gap: 4, marginBottom: 4, paddingHorizontal: 4 },
  gecmisH:   { color: C.textMuted, fontSize: F.xs, fontWeight: '700' },
  gecmisSatir:{ flexDirection: 'row', gap: 4, backgroundColor: C.surface, borderRadius: R.sm, padding: 6, marginBottom: 3 },
  gecmisD:   { color: C.textSecondary, fontSize: F.xs },
});
