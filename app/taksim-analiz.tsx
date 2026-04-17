import { useRef, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C, F, R } from '../constants/Design';
import { practiceMakamlari } from '../src/data/makamPracticeDefs';
import { makamAnalizEt } from '../src/makam/makamEngine';

interface NotaKaydi {
  zaman: number;
  frekans: number;
  perde: string;
  makamda: boolean;
  komaFark: number;
}

// Analiz makamEngine'e taşındı (makamEngine.ts)

function notaMesaji(makamda: boolean, komaFark: number, perde: string, makamIsim: string) {
  if (!makamda) return `"${perde}" ${makamIsim} makamında yok`;
  const abs = Math.abs(komaFark);
  if (abs <= 1) return `${perde} — tam isabetle ✓`;
  if (abs <= 2) return `${perde} — çok yakın`;
  if (abs <= 3) return `${perde} — kabul edilebilir`;
  return `${perde} — ${abs.toFixed(1)} koma ${komaFark > 0 ? 'tiz' : 'pest'}`;
}

function seyirYorum(kayitlar: NotaKaydi[]) {
  if (kayitlar.length < 4) return '';
  const son = kayitlar.slice(-10);
  const oran = son[son.length - 1].frekans / son[0].frekans;
  if (oran > 1.10) return '↗ Tizleşiyor';
  if (oran < 0.91) return '↘ Pesleşiyor';
  return '→ Sabit bölge';
}

export default function TaksimAnalizScreen() {
  const router  = useRouter();
  const rafRef       = useRef<number | null>(null);
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const streamRef    = useRef<MediaStream | null>(null);
  const detectorRef  = useRef<any>(null);
  const kayitlarRef  = useRef<NotaKaydi[]>([]);
  const lastSigRef   = useRef('');
  const lastZamanRef = useRef(0);

  const [secilenId, setSecilenId]   = useState(practiceMakamlari[0].id);
  const [dinliyor, setDinliyor]     = useState(false);
  const [kayitlar, setKayitlar]     = useState<NotaKaydi[]>([]);
  const [sonKayit, setSonKayit]     = useState<NotaKaydi | null>(null);
  const [hata, setHata]             = useState<string | null>(null);
  const [bitti, setBitti]           = useState(false);

  const secilen = practiceMakamlari.find(m => m.id === secilenId) ?? practiceMakamlari[0];

  async function baslat() {
    setHata(null); setBitti(false);
    setKayitlar([]); kayitlarRef.current = [];
    lastSigRef.current = ''; setSonKayit(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false }
      });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.25;
      analyserRef.current = analyser;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const { PitchDetector } = await import('pitchy');
      detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize);
      setDinliyor(true);
      tick();
    } catch (e: any) { setHata(e?.message || 'Mikrofon açılamadı'); }
  }

  function tick() {
    const analyser = analyserRef.current;
    const detector = detectorRef.current;
    const ctx      = audioCtxRef.current;
    if (!analyser || !detector || !ctx) return;
    const buf = new Float32Array(analyser.fftSize) as Float32Array<ArrayBuffer>;
    analyser.getFloatTimeDomainData(buf);
    const [freq, clarity] = detector.findPitch(buf, ctx.sampleRate);
    // Clarity eşiğini biraz düşürdük (0.93 → 0.88) - daha fazla nota yakalaması için
    if (clarity > 0.88 && freq > 60 && freq < 2500) isleFreq(freq);
    rafRef.current = requestAnimationFrame(tick);
  }

  function isleFreq(freq: number) {
    const simdi = Date.now();
    // makamEngine kullan — centTables ile doğru oktav ve cent analizi
    const analiz = makamAnalizEt(freq, secilenId);
    const perde   = analiz.enYakinDerece.perde;
    const makamda = analiz.makamda;
    const komaFark = analiz.komaFark;

    const sig = `${perde}-${makamda}`;
    if (sig === lastSigRef.current && simdi - lastZamanRef.current < 300) {
      setSonKayit(prev => prev ? { ...prev, komaFark, frekans: freq } : null);
      return;
    }
    lastSigRef.current  = sig;
    lastZamanRef.current = simdi;
    const kayit: NotaKaydi = {
      zaman: simdi,
      frekans: freq,
      perde,
      makamda,
      komaFark,
    };
    setSonKayit(kayit);
    kayitlarRef.current = [kayit, ...kayitlarRef.current].slice(0, 300);
    setKayitlar([...kayitlarRef.current]);
  }

  function durdur() {
    if (rafRef.current)      cancelAnimationFrame(rafRef.current);
    if (streamRef.current)   streamRef.current.getTracks().forEach(t => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    rafRef.current = streamRef.current = audioCtxRef.current =
    analyserRef.current = detectorRef.current = null;
    setDinliyor(false);
    if (kayitlarRef.current.length > 0) setBitti(true);
  }

  const toplamNota  = kayitlar.length;
  const makamIcinde = kayitlar.filter(k => k.makamda).length;
  const basariYuzde = toplamNota > 0 ? Math.round((makamIcinde / toplamNota) * 100) : 0;
  const ortKoma     = toplamNota > 0
    ? Math.round((kayitlar.reduce((s, k) => s + Math.abs(k.komaFark), 0) / toplamNota) * 10) / 10 : 0;

  const perdeOlcumu: Record<string, number> = {};
  kayitlar.forEach(k => { perdeOlcumu[k.perde] = (perdeOlcumu[k.perde] || 0) + 1; });
  const topPerdeler = Object.entries(perdeOlcumu).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const yanlisOlcumu: Record<string, number> = {};
  kayitlar.filter(k => !k.makamda).forEach(k => { yanlisOlcumu[k.perde] = (yanlisOlcumu[k.perde] || 0) + 1; });
  const topYanlislar = Object.entries(yanlisOlcumu).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const seyir = seyirYorum(kayitlar);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>← Geri</Text></TouchableOpacity>
        <Text style={s.baslik}>Taksim Analizi</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Makam seçimi */}
        <Text style={s.label}>Makam</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {practiceMakamlari.map(m => (
            <TouchableOpacity key={m.id} disabled={dinliyor}
              style={[s.chip, secilenId === m.id && s.chipAktif]}
              onPress={() => { setSecilenId(m.id); setKayitlar([]); kayitlarRef.current = []; setBitti(false); }}>
              <Text style={[s.chipText, secilenId === m.id && s.chipTextAktif]}>{m.practice.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Makam perdeleri */}
        <View style={s.makamBilgi}>
          <Text style={s.makamBilgiBaslik}>{secilen.practice.title} perdeleri:</Text>
          <View style={s.perdeSira}>
            {secilen.practice.steps.map((st, i) => (
              <View key={i} style={[s.perdePil,
                st.role === 'karar' && s.perdeKarar,
                st.role === 'guclu' && s.perdeGuclu]}>
                <Text style={[s.perdePilText,
                  st.role === 'karar' && { color: C.gold },
                  st.role === 'guclu' && { color: C.amber }]}>
                  {st.turkish}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Canlı gösterge */}
        <View style={s.canliKart}>
          {sonKayit && dinliyor ? (
            <>
              <View style={s.canliUst}>
                <Text style={s.canliHz}>{Math.round(sonKayit.frekans)} Hz</Text>
                <View style={[s.makamTag, {
                  backgroundColor: sonKayit.makamda ? C.greenGlow : C.redGlow,
                  borderColor: sonKayit.makamda ? C.green : C.red
                }]}>
                  <Text style={[s.makamTagText, { color: sonKayit.makamda ? C.green : C.red }]}>
                    {sonKayit.makamda ? '✓ Makamda' : '✗ Makam dışı'}
                  </Text>
                </View>
              </View>
              <Text style={s.canliPerde}>{sonKayit.perde}</Text>
              <Text style={[s.canliMesaj, { color: sonKayit.makamda ? C.green : C.red }]}>
                {notaMesaji(sonKayit.makamda, sonKayit.komaFark, sonKayit.perde, secilen.practice.title)}
              </Text>
              {seyir !== '' && <Text style={s.seyirText}>{seyir}</Text>}
            </>
          ) : (
            <Text style={s.bekle}>
              {dinliyor ? 'Ses bekleniyor...' : 'Başlatmak için aşağıdaki butona bas'}
            </Text>
          )}
        </View>

        {/* Buton */}
        {Platform.OS === 'web' ? (
          <TouchableOpacity style={[s.btn, dinliyor && s.btnDur]}
            onPress={dinliyor ? durdur : baslat} activeOpacity={0.8}>
            <Text style={[s.btnText, dinliyor && { color: C.textSecondary }]}>
              {dinliyor ? '■ Durdur ve Raporu Gör' : '▶ Taksime Başla'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={s.nativeUyari}>
            <Text style={s.nativeUyariText}>⚠ Web modunda çalışır. Terminal'de "w" bas.</Text>
          </View>
        )}

        {hata && <Text style={{ color: C.red, marginTop: 8, fontSize: F.xs, textAlign: 'center' }}>{hata}</Text>}

        {/* RAPOR */}
        {bitti && kayitlar.length > 0 && (
          <>
            <View style={s.raporBaslikWrap}>
              <Text style={s.raporBaslikText}>Taksim Raporu</Text>
            </View>

            <View style={s.raporGrid}>
              {[
                { label: 'Makam İçi',    val: `%${basariYuzde}`, renk: basariYuzde >= 80 ? C.green : basariYuzde >= 60 ? C.amber : C.red },
                { label: 'Toplam Nota',  val: `${toplamNota}`,    renk: C.textPrimary },
                { label: 'Ort. Sapma',   val: `${ortKoma} koma`,  renk: C.amber },
                { label: 'Seyir',        val: seyir || '—',       renk: C.teal },
              ].map((item, i) => (
                <View key={i} style={s.raporKart}>
                  <Text style={s.raporKartLabel}>{item.label}</Text>
                  <Text style={[s.raporKartVal, { color: item.renk }]}>{item.val}</Text>
                </View>
              ))}
            </View>

            <View style={[s.yorum, { borderLeftColor: basariYuzde >= 80 ? C.green : basariYuzde >= 60 ? C.amber : C.red }]}>
              <Text style={s.yorumBaslik}>Değerlendirme</Text>
              <Text style={s.yorumMetin}>
                {basariYuzde >= 85
                  ? `Harika! %${basariYuzde} oranında ${secilen.practice.title} makamı içinde kaldın. Makam seyrine çok iyi hâkimsin.`
                  : basariYuzde >= 70
                  ? `Güçlü performans. %${basariYuzde} makam içinde. Küçük koma kaymaları var ama genel seyir doğru.`
                  : basariYuzde >= 50
                  ? `Gelişme var. Notaların yaklaşık yarısı makam dışına çıkmış. Hangi perdelerin sorunlu olduğuna bak.`
                  : `Makam dışına çok çıkılmış. Önce Makam Koçu'nda diziyi çalıştır, sonra tekrar dene.`}
              </Text>
            </View>

            {topPerdeler.length > 0 && (
              <View style={s.bolum}>
                <Text style={s.bolumBaslik}>En Çok Çalınan Perdeler</Text>
                {topPerdeler.map(([perde, adet]) => {
                  const yuzde = Math.round((adet / toplamNota) * 100);
                  const step  = secilen.practice.steps.find(st => st.turkish === perde);
                  const renk  = step?.role === 'karar' ? C.gold : step?.role === 'guclu' ? C.amber : C.teal;
                  return (
                    <View key={perde} style={s.barSatir}>
                      <Text style={[s.barIsim, { color: renk }]}>
                        {perde}{step?.role === 'karar' ? ' ★' : step?.role === 'guclu' ? ' ◆' : ''}
                      </Text>
                      <View style={s.barArka}>
                        <View style={[s.barDolu, { width: `${yuzde}%`, backgroundColor: renk }]} />
                      </View>
                      <Text style={s.barYuzde}>{yuzde}%</Text>
                    </View>
                  );
                })}
                <Text style={s.aciklama}>★ durak  ◆ güçlü</Text>
              </View>
            )}

            {topYanlislar.length > 0 && (
              <View style={s.bolum}>
                <Text style={s.bolumBaslik}>Makam Dışı Notalar</Text>
                {topYanlislar.map(([perde, adet]) => (
                  <View key={perde} style={s.yanlisKart}>
                    <View style={s.yanlisDot} />
                    <Text style={s.yanlisText}>{perde}</Text>
                    <Text style={s.yanlisAdet}>{adet}×</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={s.bolum}>
              <Text style={s.bolumBaslik}>Son 30 Nota</Text>
              <View style={s.notaAkis}>
                {kayitlar.slice(0, 30).map((k, i) => (
                  <View key={i} style={[s.notaPil, {
                    backgroundColor: k.makamda ? C.greenGlow : C.redGlow,
                    borderColor: k.makamda ? C.green + '66' : C.red + '66'
                  }]}>
                    <Text style={[s.notaPilText, { color: k.makamda ? C.green : C.red }]}>{k.perde}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity style={s.tekrarBtn} onPress={() => {
              setKayitlar([]); kayitlarRef.current = []; setSonKayit(null); setBitti(false);
            }}>
              <Text style={s.tekrarBtnText}>Yeni Taksim Başlat</Text>
            </TouchableOpacity>
          </>
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
  content:   { padding: 20, paddingBottom: 48 },
  label:     { color: C.textMuted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  chip:      { paddingHorizontal: 16, paddingVertical: 9, borderRadius: R.full, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface2, marginRight: 8 },
  chipAktif: { borderColor: C.gold, backgroundColor: C.goldGlow },
  chipText:  { color: C.textMuted, fontWeight: '600', fontSize: F.sm },
  chipTextAktif: { color: C.gold, fontWeight: '800' },
  makamBilgi:       { backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  makamBilgiBaslik: { color: C.textMuted, fontSize: F.xs, fontWeight: '600', marginBottom: 10 },
  perdeSira:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  perdePil:   { paddingHorizontal: 10, paddingVertical: 5, borderRadius: R.full, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
  perdeKarar: { borderColor: C.gold + '88', backgroundColor: C.goldGlow },
  perdeGuclu: { borderColor: C.amber + '88', backgroundColor: C.amber + '18' },
  perdePilText:{ color: C.textSecondary, fontSize: F.xs, fontWeight: '600' },
  canliKart:  { backgroundColor: C.surface, borderRadius: R.xl, padding: 28, marginBottom: 16, borderWidth: 1, borderColor: C.border, minHeight: 160, justifyContent: 'center', alignItems: 'center' },
  canliUst:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 12 },
  canliHz:    { color: C.textMuted, fontSize: F.sm },
  makamTag:   { borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },
  makamTagText:{ fontSize: F.xs, fontWeight: '800' },
  canliPerde: { color: C.textPrimary, fontSize: 56, fontWeight: '900', marginBottom: 6 },
  canliMesaj: { fontSize: F.md, fontWeight: '700', textAlign: 'center' },
  seyirText:  { color: C.textMuted, fontSize: F.sm, marginTop: 8 },
  bekle:      { color: C.textMuted, fontSize: F.md, textAlign: 'center' },
  btn:     { backgroundColor: C.gold, borderRadius: R.lg, padding: 18, alignItems: 'center', marginBottom: 24 },
  btnDur:  { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
  btnText: { color: C.bg, fontWeight: '900', fontSize: F.lg },
  nativeUyari:    { backgroundColor: C.surface2, borderRadius: R.lg, padding: 14, marginBottom: 24, borderLeftWidth: 3, borderLeftColor: C.amber },
  nativeUyariText:{ color: C.amber, fontSize: F.sm },
  raporBaslikWrap:{ marginBottom: 12, marginTop: 8 },
  raporBaslikText:{ color: C.textPrimary, fontWeight: '900', fontSize: F.xl },
  raporGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  raporKart:  { flexBasis: '47%', backgroundColor: C.surface, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: C.border },
  raporKartLabel: { color: C.textMuted, fontSize: F.xs },
  raporKartVal:   { fontWeight: '900', fontSize: F.xl, marginTop: 4 },
  yorum:      { backgroundColor: C.surface, borderRadius: R.lg, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4 },
  yorumBaslik:{ color: C.textSecondary, fontWeight: '800', fontSize: F.md, marginBottom: 8 },
  yorumMetin: { color: C.textSecondary, fontSize: F.sm, lineHeight: 22 },
  bolum:      { marginBottom: 20 },
  bolumBaslik:{ color: C.textMuted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  barSatir:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  barIsim:    { width: 110, fontSize: F.sm, fontWeight: '700' },
  barArka:    { flex: 1, height: 8, backgroundColor: C.surface2, borderRadius: 4, overflow: 'hidden' },
  barDolu:    { height: 8, borderRadius: 4 },
  barYuzde:   { color: C.textMuted, fontSize: F.xs, width: 36, textAlign: 'right' },
  aciklama:   { color: C.textMuted, fontSize: F.xs, marginTop: 4 },
  yanlisKart: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: R.md, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, borderLeftColor: C.red },
  yanlisDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: C.red },
  yanlisText: { flex: 1, color: C.textSecondary, fontSize: F.md, fontWeight: '600' },
  yanlisAdet: { color: C.red, fontWeight: '800', fontSize: F.md },
  notaAkis:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  notaPil:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: R.full, borderWidth: 1 },
  notaPilText:{ fontSize: F.xs, fontWeight: '700' },
  tekrarBtn:    { backgroundColor: C.surface, borderRadius: R.lg, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  tekrarBtnText:{ color: C.textSecondary, fontWeight: '700', fontSize: F.md },
});
