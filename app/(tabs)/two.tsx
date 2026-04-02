import { useEffect, useRef, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { enYakinPerde, frekansToNota, makamFrekanslar } from '../../src/audio/pitchDetector';
import { makamlar } from '../../src/data/makamlar';
import { useDilStore } from '../../src/store/dilStore';

export default function PracticeScreen() {
  const { tr } = useDilStore();
  const [dinliyor, setDinliyor] = useState(false);
  const [secilenMakam, setSecilenMakam] = useState(makamlar[0]);
  const [sonuc, setSonuc] = useState<{ nota: string; frekans: number; clarity: number; enYakin: { isim: string; frekans: number; komaFark: number } | null } | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  const durdurRef = useRef<(() => void) | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectorRef = useRef<any>(null);

  useEffect(() => { return () => durdur(); }, []);

  async function basla() {
    setHata(null);
    try {
      if (Platform.OS === 'web') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const { PitchDetector } = await import('pitchy');
        detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize);
        setDinliyor(true);
        analiz();
      } else {
        const { nativePitchBul } = await import('../../src/audio/nativePitch');
        const durdurFn = await nativePitchBul(
          (frekans, clarity) => { if (frekans > 0) pitchGuncelle(frekans, clarity); else setSonuc(null); },
          () => setDinliyor(false)
        );
        durdurRef.current = durdurFn;
        setDinliyor(true);
      }
    } catch (e: any) { setHata(e.message || 'Mikrofon hatası'); }
  }

  function analiz() {
    const analyser = analyserRef.current;
    const detector = detectorRef.current;
    const ctx = audioCtxRef.current;
    if (!analyser || !detector || !ctx) return;
    const buffer = new Float32Array(analyser.fftSize) as Float32Array<ArrayBuffer>;
    analyser.getFloatTimeDomainData(buffer);
    const [frekans, clarity] = detector.findPitch(buffer, ctx.sampleRate);
    if (clarity > 0.9 && frekans > 60 && frekans < 1200) pitchGuncelle(frekans, clarity);
    else setSonuc(null);
    rafRef.current = requestAnimationFrame(analiz);
  }

  function pitchGuncelle(frekans: number, clarity: number) {
    const notaBilgi = frekansToNota(frekans);
    const perdeFrekanslar = makamFrekanslar(secilenMakam.komaDizisi, 220);
    const yakin = enYakinPerde(frekans, perdeFrekanslar, secilenMakam.perdeler);
    setSonuc({ nota: notaBilgi.nota, frekans: Math.round(frekans * 10) / 10, clarity: Math.round(clarity * 100), enYakin: yakin });
  }

  function durdur() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (durdurRef.current) durdurRef.current();
    audioCtxRef.current = null; analyserRef.current = null; streamRef.current = null; durdurRef.current = null;
    setDinliyor(false); setSonuc(null);
  }

  const komaRenk = (k: number) => Math.abs(k) <= 1 ? '#4caf50' : Math.abs(k) <= 3 ? '#f5a623' : '#e94560';
  const komaYorum = (k: number) => Math.abs(k) <= 1 ? `✅ ${tr.dogru2}!` : k > 0 ? `⬆️ ${k} ${tr.komaYukarida}` : `⬇️ ${Math.abs(k)} ${tr.komaAsagida}`;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.baslik}>🎤 {tr.pratikModu}</Text>
        <Text style={s.altBaslik}>{tr.enstrumanCal}</Text>
        {hata && <View style={s.hataBox}><Text style={s.hataText}>⚠️ {hata}</Text></View>}
        <Text style={s.label}>{tr.makamSec}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.makamScroll}>
          {makamlar.map(m => (
            <TouchableOpacity key={m.id} style={[s.makamBtn, secilenMakam.id === m.id && s.makamBtnAktif]} onPress={() => setSecilenMakam(m)}>
              <Text style={[s.makamBtnText, secilenMakam.id === m.id && s.makamBtnTextAktif]}>{m.isim}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={s.makamInfo}>
          <Text style={s.makamInfoBaslik}>{secilenMakam.isim} {tr.makami}</Text>
          <Text style={s.makamInfoPerde}>{secilenMakam.perdeler.join(' • ')}</Text>
        </View>
        <View style={s.gostergeBox}>
          {sonuc ? (
            <>
              <Text style={s.frekansText}>{sonuc.frekans} Hz • %{sonuc.clarity}</Text>
              <Text style={s.notaBuyuk}>{sonuc.nota}</Text>
              {sonuc.enYakin && (
                <>
                  <Text style={s.hedefText}>{tr.enYakinPerde} <Text style={{ color: '#fff', fontWeight: 'bold' }}>{sonuc.enYakin.isim}</Text></Text>
                  <Text style={[s.komaText, { color: komaRenk(sonuc.enYakin.komaFark) }]}>{komaYorum(sonuc.enYakin.komaFark)}</Text>
                  <View style={s.komaBarWrap}>
                    <View style={s.komaBar}>
                      <View style={s.komaBarOrta} />
                      <View style={[s.komaBarIsaret, { left: `${Math.min(90, Math.max(10, 50 + (sonuc.enYakin.komaFark / 8) * 40))}%`, backgroundColor: komaRenk(sonuc.enYakin.komaFark) }]} />
                    </View>
                    <View style={s.komaBarLabels}>
                      <Text style={s.komaBarLabel}>{tr.pest}</Text>
                      <Text style={s.komaBarLabel}>{tr.dogru2}</Text>
                      <Text style={s.komaBarLabel}>{tr.tiz}</Text>
                    </View>
                  </View>
                </>
              )}
            </>
          ) : (
            <Text style={s.bekleText}>{dinliyor ? tr.biNotaCal : tr.baslamakIcin}</Text>
          )}
        </View>
        <TouchableOpacity style={[s.baslaBtn, dinliyor && s.durdurBtn]} onPress={dinliyor ? durdur : basla}>
          <Text style={s.baslaBtnText}>{dinliyor ? tr.durdur : tr.baslat}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' }, content: { padding: 20 },
  baslik: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginTop: 20 },
  altBaslik: { fontSize: 14, color: '#666', marginBottom: 24, marginTop: 4 },
  hataBox: { backgroundColor: '#2a0e0e', borderRadius: 12, padding: 14, borderLeftWidth: 4, borderLeftColor: '#e94560', marginBottom: 16 },
  hataText: { color: '#e94560', fontSize: 13 },
  label: { color: '#888', fontSize: 13, marginBottom: 10 },
  makamScroll: { marginBottom: 12 },
  makamBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#0f3460', marginRight: 8, backgroundColor: '#16213e' },
  makamBtnAktif: { borderColor: '#e94560', backgroundColor: '#e9456022' },
  makamBtnText: { color: '#888', fontSize: 14 }, makamBtnTextAktif: { color: '#e94560', fontWeight: 'bold' },
  makamInfo: { backgroundColor: '#16213e', borderRadius: 12, padding: 14, marginBottom: 20 },
  makamInfoBaslik: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  makamInfoPerde: { color: '#666', fontSize: 12, lineHeight: 18 },
  gostergeBox: { backgroundColor: '#16213e', borderRadius: 16, padding: 24, alignItems: 'center', minHeight: 220, justifyContent: 'center', marginBottom: 20 },
  bekleText: { color: '#666', fontSize: 16 }, frekansText: { color: '#666', fontSize: 13, marginBottom: 4 },
  notaBuyuk: { fontSize: 64, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  hedefText: { color: '#888', fontSize: 14, marginBottom: 8 },
  komaText: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 }, komaBarWrap: { width: '100%' },
  komaBar: { width: '100%', height: 8, backgroundColor: '#0f3460', borderRadius: 4, marginBottom: 6, position: 'relative', justifyContent: 'center' },
  komaBarOrta: { position: 'absolute', left: '50%', width: 2, height: 16, backgroundColor: '#4caf50', marginLeft: -1, top: -4 },
  komaBarIsaret: { position: 'absolute', width: 16, height: 16, borderRadius: 8, marginLeft: -8, top: -4 },
  komaBarLabels: { flexDirection: 'row', justifyContent: 'space-between' }, komaBarLabel: { color: '#444', fontSize: 10 },
  baslaBtn: { backgroundColor: '#e94560', borderRadius: 12, padding: 18, alignItems: 'center' },
  durdurBtn: { backgroundColor: '#333' }, baslaBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});