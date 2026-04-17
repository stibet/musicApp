import { useRef, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C, F, R } from '../constants/Design';
import { practiceMakamlari } from '../src/data/makamPracticeDefs';
import { makamAnalizEt } from '../src/makam/makamEngine';

interface NotaFrame {
  zaman: number;
  frekans: number;
  perde: string;
  makamda: boolean;
  komaFark: number;
}

// Analiz makamEngine'e taşındı

async function videoAnalizEt(
  file: File,
  makamId: string,
  onProgress: (pct: number) => void
): Promise<{ frames: NotaFrame[]; duration: number }> {
  const arrayBuf = await file.arrayBuffer();
  const ctx = new AudioContext();
  const audioBuf = await ctx.decodeAudioData(arrayBuf);
  const duration = audioBuf.duration;
  const sr = audioBuf.sampleRate;
  const data = audioBuf.getChannelData(0);
  const winSamples = Math.floor(sr * 0.05);
  const hopSamples = winSamples;
  const { PitchDetector } = await import('pitchy');
  const detector = PitchDetector.forFloat32Array(winSamples);
  const frames: NotaFrame[] = [];
  const total = Math.floor((data.length - winSamples) / hopSamples);
  for (let i = 0; i * hopSamples + winSamples < data.length; i++) {
    const start   = i * hopSamples;
    const window  = data.slice(start, start + winSamples) as unknown as Float32Array<ArrayBuffer>;
    const [freq, clarity] = detector.findPitch(window, sr);
    if (clarity > 0.88 && freq > 60 && freq < 2500) {
      const analiz = makamAnalizEt(freq, makamId);
      frames.push({
        zaman: start / sr,
        frekans: freq,
        perde: analiz.enYakinDerece.perde,
        makamda: analiz.makamda,
        komaFark: analiz.komaFark,
      });
    }
    if (i % 200 === 0) onProgress(Math.round((i / total) * 100));
  }
  await ctx.close();
  onProgress(100);
  return { frames, duration };
}

export default function VideoAnalizScreen() {
  const router  = useRouter();
  const videoEl = useRef<HTMLVideoElement | null>(null);
  const inputEl = useRef<HTMLInputElement | null>(null);
  const animRef = useRef<number | null>(null);

  const [secilenId, setSecilenId]   = useState(practiceMakamlari[0].id);
  const [dosyaAdi, setDosyaAdi]     = useState<string | null>(null);
  const [videoUrl, setVideoUrl]     = useState<string | null>(null);
  const [analiz, setAnaliz]         = useState<NotaFrame[]>([]);
  const [duration, setDuration]     = useState(0);
  const [islem, setIslem]           = useState(false);
  const [progress, setProgress]     = useState(0);
  const [aktifFrame, setAktifFrame] = useState<NotaFrame | null>(null);

  const secilen = practiceMakamlari.find(m => m.id === secilenId) ?? practiceMakamlari[0];

  function enYakinFrame(t: number) {
    return analiz.reduce<NotaFrame | null>((best, f) => {
      if (Math.abs(f.zaman - t) < (best ? Math.abs(best.zaman - t) : Infinity)) return f;
      return best;
    }, null);
  }

  function guncelle() {
    if (videoEl.current) setAktifFrame(enYakinFrame(videoEl.current.currentTime));
    animRef.current = requestAnimationFrame(guncelle);
  }

  async function dosyaSec(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(URL.createObjectURL(file));
    setDosyaAdi(file.name);
    setAnaliz([]); setAktifFrame(null); setProgress(0);
  }

  async function analizBaslat() {
    const file = (inputEl.current as any)?.files?.[0];
    if (!file) return;
    setIslem(true); setProgress(0); setAktifFrame(null);
    try {
      const { frames, duration: dur } = await videoAnalizEt(file, secilenId, pct => setProgress(pct));
      setAnaliz(frames); setDuration(dur);
    } catch (e: any) { console.error('Analiz hatası:', e); }
    finally { setIslem(false); }
  }

  // Zaman çizelgesi
  const SEG = 200;
  const timelineSegs = analiz.length > 0 && duration > 0
    ? Array.from({ length: SEG }, (_, i) => {
        const t = (i / SEG) * duration;
        const alik = analiz.filter(f => Math.abs(f.zaman - t) < duration / SEG / 2);
        if (!alik.length) return C.surface2;
        const mi = alik.filter(f => f.makamda).length / alik.length;
        return mi > 0.75 ? C.green : mi > 0.45 ? C.amber : C.red;
      })
    : [];

  const toplamNota  = analiz.length;
  const makamIcinde = analiz.filter(f => f.makamda).length;
  const basariYuzde = toplamNota > 0 ? Math.round((makamIcinde / toplamNota) * 100) : 0;
  const ortKoma     = toplamNota > 0
    ? Math.round((analiz.reduce((s, f) => s + Math.abs(f.komaFark), 0) / toplamNota) * 10) / 10 : 0;
  const perdeOlcumu: Record<string, number> = {};
  analiz.forEach(f => { perdeOlcumu[f.perde] = (perdeOlcumu[f.perde] || 0) + 1; });
  const topPerdeler = Object.entries(perdeOlcumu).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const yanlisOlcumu: Record<string, number> = {};
  analiz.filter(f => !f.makamda).forEach(f => { yanlisOlcumu[f.perde] = (yanlisOlcumu[f.perde] || 0) + 1; });
  const topYanlislar = Object.entries(yanlisOlcumu).sort((a, b) => b[1] - a[1]).slice(0, 4);

  if (Platform.OS !== 'web') {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>← Geri</Text></TouchableOpacity>
          <Text style={s.baslik}>Video Analizi</Text><View style={{ width: 60 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>💻</Text>
          <Text style={{ color: C.textPrimary, fontWeight: '800', fontSize: F.lg, textAlign: 'center', marginBottom: 12 }}>Web modunda çalışır</Text>
          <Text style={{ color: C.textMuted, fontSize: F.sm, textAlign: 'center' }}>Terminal'de "w" bas.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>← Geri</Text></TouchableOpacity>
        <Text style={s.baslik}>Video Analizi</Text><View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <Text style={s.label}>Makam</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {practiceMakamlari.map(m => (
            <TouchableOpacity key={m.id} disabled={islem}
              style={[s.chip, secilenId === m.id && s.chipAktif]}
              onPress={() => { setSecilenId(m.id); setAnaliz([]); setAktifFrame(null); }}>
              <Text style={[s.chipText, secilenId === m.id && s.chipTextAktif]}>{m.practice.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dosya yükleyici */}
        <Text style={s.label}>Video veya Ses Dosyası</Text>
        <input ref={inputEl as any} type="file" accept="video/*,audio/*"
          style={{ display: 'none' }} onChange={dosyaSec as any} />
        <TouchableOpacity style={s.uploadKart} activeOpacity={0.8}
          onPress={() => (inputEl.current as any)?.click()}>
          <Text style={s.uploadIkon}>{dosyaAdi ? '🎬' : '📁'}</Text>
          <Text style={s.uploadText} numberOfLines={1}>{dosyaAdi || 'Dosya seç'}</Text>
          <Text style={s.uploadAlt}>MP4, MOV, MP3, WAV, M4A</Text>
        </TouchableOpacity>

        {dosyaAdi && !analiz.length && (
          <TouchableOpacity style={[s.analizBtn, islem && { opacity: 0.6 }]}
            onPress={analizBaslat} disabled={islem} activeOpacity={0.8}>
            {islem
              ? <Text style={s.analizBtnText}>Analiz ediliyor... %{progress}</Text>
              : <Text style={s.analizBtnText}>🔍 Analizi Başlat</Text>}
          </TouchableOpacity>
        )}

        {islem && (
          <View style={s.progressWrap}>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        )}

        {/* Video oynatıcı — DÜZELTME: max yükseklik 240px */}
        {videoUrl && analiz.length > 0 && (
          <>
            <Text style={s.label}>Video</Text>
            <View style={s.videoWrap}>
              <video
                ref={videoEl as any}
                src={videoUrl}
                style={{
                  width: '100%',
                  maxHeight: 240,           // sabit max yükseklik
                  objectFit: 'contain',
                  borderRadius: 12,
                  display: 'block',
                  backgroundColor: '#000',
                }}
                controls
                onPlay={() => { if (animRef.current) cancelAnimationFrame(animRef.current); guncelle(); }}
                onPause={() => { if (animRef.current) cancelAnimationFrame(animRef.current); }}
                onSeeked={() => {
                  if (videoEl.current) setAktifFrame(enYakinFrame(videoEl.current.currentTime));
                }}
              />
              {/* Nota overlay — sağ üst, kompakt */}
              {aktifFrame && (
                <View style={[s.overlay, { borderColor: aktifFrame.makamda ? C.green : C.red }]}>
                  <Text style={[s.overlayPerde, { color: aktifFrame.makamda ? C.green : C.red }]}>
                    {aktifFrame.perde}
                  </Text>
                  <Text style={[s.overlayKoma, { color: aktifFrame.makamda ? C.green : C.red }]}>
                    {aktifFrame.makamda
                      ? (Math.abs(aktifFrame.komaFark) <= 1 ? '✓' : `${Math.abs(aktifFrame.komaFark).toFixed(1)}k`)
                      : '✗ dışı'}
                  </Text>
                </View>
              )}
            </View>

            {/* Zaman çizelgesi */}
            <View style={s.timeline}>
              {timelineSegs.map((renk, i) => (
                <View key={i} style={{ flex: 1, height: 16, backgroundColor: renk }} />
              ))}
            </View>
            <View style={s.legend}>
              {[{ renk: C.green, label: 'Makamda' }, { renk: C.amber, label: 'Yakın' }, { renk: C.red, label: 'Dışı' }].map(l => (
                <View key={l.label} style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: l.renk }]} />
                  <Text style={s.legendText}>{l.label}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Rapor */}
        {analiz.length > 0 && !islem && (
          <>
            <View style={{ marginBottom: 12, marginTop: 16 }}>
              <Text style={{ color: C.textPrimary, fontWeight: '900', fontSize: F.xl }}>Analiz Raporu</Text>
              <Text style={{ color: C.textMuted, fontSize: F.sm, marginTop: 4 }}>
                {secilen.practice.title} · {toplamNota} nota · {Math.round(duration)}s
              </Text>
            </View>

            <View style={s.raporGrid}>
              {[
                { label: 'Makam İçi',    val: `%${basariYuzde}`, renk: basariYuzde >= 80 ? C.green : basariYuzde >= 60 ? C.amber : C.red },
                { label: 'Toplam Nota',  val: `${toplamNota}`,   renk: C.textPrimary },
                { label: 'Ort. Sapma',   val: `${ortKoma} koma`, renk: C.amber },
                { label: 'Süre',         val: `${Math.round(duration)}s`, renk: C.teal },
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
                  ? `Mükemmel performans. %${basariYuzde} oranında ${secilen.practice.title} makamı içinde kaldın.`
                  : basariYuzde >= 70
                  ? `Güçlü performans. %${basariYuzde} makam içinde. Küçük koma kaymaları var.`
                  : basariYuzde >= 50
                  ? `Ortalama performans. Notaların yaklaşık yarısı makam dışına çıkmış.`
                  : `Makam dışına çok çıkılmış. Makam Koçu ile diziyi pekiştir.`}
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
                      <Text style={[s.barIsim, { color: renk }]}>{perde}{step?.role === 'karar' ? ' ★' : step?.role === 'guclu' ? ' ◆' : ''}</Text>
                      <View style={s.barArka}><View style={[s.barDolu, { width: `${yuzde}%`, backgroundColor: renk }]} /></View>
                      <Text style={s.barYuzde}>{yuzde}%</Text>
                    </View>
                  );
                })}
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

            <TouchableOpacity style={s.tekrarBtn}
              onPress={() => { setAnaliz([]); setAktifFrame(null); setDosyaAdi(null); setVideoUrl(null); }}>
              <Text style={s.tekrarBtnText}>Yeni Video Yükle</Text>
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
  content:   { padding: 20, paddingBottom: 60 },
  label:     { color: C.textMuted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  chip:      { paddingHorizontal: 16, paddingVertical: 9, borderRadius: R.full, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface2, marginRight: 8 },
  chipAktif: { borderColor: C.gold, backgroundColor: C.goldGlow },
  chipText:  { color: C.textMuted, fontWeight: '600', fontSize: F.sm },
  chipTextAktif: { color: C.gold, fontWeight: '800' },
  uploadKart:{ backgroundColor: C.surface, borderRadius: R.lg, borderWidth: 2, borderColor: C.border, padding: 20, alignItems: 'center', marginBottom: 14 } as any,
  uploadIkon:{ fontSize: 32, marginBottom: 8 },
  uploadText:{ color: C.textPrimary, fontWeight: '700', fontSize: F.md, maxWidth: 280, textAlign: 'center' },
  uploadAlt: { color: C.textMuted, fontSize: F.xs, marginTop: 4 },
  analizBtn: { backgroundColor: C.gold, borderRadius: R.lg, padding: 16, alignItems: 'center', marginBottom: 14 },
  analizBtnText: { color: C.bg, fontWeight: '900', fontSize: F.md },
  progressWrap: { marginBottom: 14 },
  progressBar:  { height: 6, backgroundColor: C.surface2, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: C.gold, borderRadius: 3 },
  videoWrap: { borderRadius: R.lg, overflow: 'hidden', position: 'relative', marginBottom: 8, backgroundColor: '#000' },
  overlay:   { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(8,11,15,0.9)', borderRadius: R.md, padding: 8, borderWidth: 2, alignItems: 'center', minWidth: 60 },
  overlayPerde:{ color: C.textPrimary, fontWeight: '900', fontSize: 20 },
  overlayKoma: { fontSize: F.xs, fontWeight: '700', marginTop: 2 },
  timeline:  { flexDirection: 'row', height: 14, borderRadius: R.sm, overflow: 'hidden', marginBottom: 6 },
  legend:    { flexDirection: 'row', gap: 14, marginBottom: 20 },
  legendItem:{ flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText:{ color: C.textMuted, fontSize: F.xs },
  raporGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  raporKart: { flexBasis: '47%', backgroundColor: C.surface, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: C.border },
  raporKartLabel: { color: C.textMuted, fontSize: F.xs },
  raporKartVal:   { fontWeight: '900', fontSize: F.xl, marginTop: 4 },
  yorum:     { backgroundColor: C.surface, borderRadius: R.lg, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4 },
  yorumBaslik:{ color: C.textSecondary, fontWeight: '800', fontSize: F.md, marginBottom: 8 },
  yorumMetin: { color: C.textSecondary, fontSize: F.sm, lineHeight: 22 },
  bolum:     { marginBottom: 18 },
  bolumBaslik:{ color: C.textMuted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  barSatir:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  barIsim:   { width: 110, fontSize: F.sm, fontWeight: '700' },
  barArka:   { flex: 1, height: 8, backgroundColor: C.surface2, borderRadius: 4, overflow: 'hidden' },
  barDolu:   { height: 8, borderRadius: 4 },
  barYuzde:  { color: C.textMuted, fontSize: F.xs, width: 36, textAlign: 'right' },
  yanlisKart:{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: R.md, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, borderLeftColor: C.red },
  yanlisDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.red },
  yanlisText:{ flex: 1, color: C.textSecondary, fontSize: F.md, fontWeight: '600' },
  yanlisAdet:{ color: C.red, fontWeight: '800', fontSize: F.md },
  tekrarBtn: { backgroundColor: C.surface, borderRadius: R.lg, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border, marginTop: 8 },
  tekrarBtnText: { color: C.textSecondary, fontWeight: '700', fontSize: F.md },
});
