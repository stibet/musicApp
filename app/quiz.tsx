import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Soru, sorular } from '../src/data/sorular';
import { useDilStore } from '../src/store/dilStore';
import { cevapKaydet, tekrarSorulari } from '../src/store/progress';

export default function QuizScreen() {
  const { kategori } = useLocalSearchParams<{ kategori: string }>();
  const router = useRouter();
  const { tr, dil } = useDilStore();

  const [filtrelenmis, setFiltrelenmis] = useState<Soru[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [index, setIndex] = useState(0);
  const [secilen, setSecilen] = useState<string | null>(null);
  const [dogru, setDogru] = useState(0);
  const [bitti, setBitti] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => { soruHazirla(); }, [kategori]);

  async function soruHazirla() {
    setYukleniyor(true);
    const tumSorular = sorular.filter(s => kategori === 'maqam' ? s.kategori === 'makam' : s.kategori === 'bati');
    const tekrarIds = await tekrarSorulari(tumSorular.map(s => s.id));
    setFiltrelenmis(tumSorular.filter(s => tekrarIds.includes(s.id)).sort(() => Math.random() - 0.5));
    setYukleniyor(false);
  }

  function cevapSec(secenek: string) {
    if (secilen) return;
    setSecilen(secenek);
    const dogruCevap = dil === 'en'
      ? suankiSoru.seçeneklerEn[suankiSoru.secenekler.indexOf(suankiSoru.dogruCevap)]
      : suankiSoru.dogruCevap;
    const dogruMu = secenek === dogruCevap;
    if (dogruMu) setDogru(d => d + 1);
    cevapKaydet(suankiSoru.id, dogruMu);
  }

  function sonraki() {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      if (index + 1 >= filtrelenmis.length) setBitti(true);
      else { setIndex(i => i + 1); setSecilen(null); }
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }

  if (yukleniyor) return (
    <SafeAreaView style={s.container}><View style={s.ortala}><Text style={{ color: '#888' }}>...</Text></View></SafeAreaView>
  );

  if (filtrelenmis.length === 0) return (
    <SafeAreaView style={s.container}>
      <View style={s.ortala}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🎉</Text>
        <Text style={s.sonucBaslik}>{tr.harika}</Text>
        <Text style={s.sonucMesaj}>{tr.bugunSoruKalmadi}</Text>
        <TouchableOpacity style={s.sonrakiBtn} onPress={() => router.back()}>
          <Text style={s.sonrakiBtnText}>{tr.anaSayfayaDon}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const suankiSoru = filtrelenmis[index];
  const soruMetni = dil === 'en' ? suankiSoru.soruEn : suankiSoru.soru;
  const secenekListesi = dil === 'en' ? suankiSoru.seçeneklerEn : suankiSoru.secenekler;
  const dogruCevap = dil === 'en'
    ? suankiSoru.seçeneklerEn[suankiSoru.secenekler.indexOf(suankiSoru.dogruCevap)]
    : suankiSoru.dogruCevap;
  const aciklamaMetni = dil === 'en' ? suankiSoru.aciklamaEn : suankiSoru.aciklama;

  if (bitti) {
    const yuzde = Math.round((dogru / filtrelenmis.length) * 100);
    return (
      <SafeAreaView style={s.container}>
        <View style={s.sonucContainer}>
          <Text style={{ fontSize: 72, marginBottom: 16 }}>{yuzde >= 80 ? '🏆' : yuzde >= 50 ? '👏' : '📚'}</Text>
          <Text style={s.sonucBaslik}>{tr.tamamlandi}</Text>
          <Text style={s.sonucSkor}>{dogru} / {filtrelenmis.length}</Text>
          <Text style={s.sonucYuzde}>%{yuzde}</Text>
          <Text style={s.sonucMesaj}>{yuzde >= 80 ? tr.harika : yuzde >= 50 ? tr.iyiGidiyor : tr.tekrarEt}</Text>
          <TouchableOpacity style={s.tekrarBtn} onPress={() => { setIndex(0); setSecilen(null); setDogru(0); setBitti(false); soruHazirla(); }}>
            <Text style={s.tekrarBtnText}>{tr.tekrarCoz}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.geriBtn} onPress={() => router.back()}>
            <Text style={s.geriBtnText}>{tr.anaSayfa}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>{tr.geri}</Text></TouchableOpacity>
        <Text style={s.progress}>{index + 1} / {filtrelenmis.length}</Text>
        <Text style={s.skorText}>✓ {dogru}</Text>
      </View>
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${((index + 1) / filtrelenmis.length) * 100}%` }]} />
      </View>
      <Animated.View style={[s.content, { opacity: fadeAnim }]}>
        <View style={s.zorlukRow}>
          <Text style={s.kategoriTag}>{suankiSoru.kategori === 'makam' ? tr.turkMuzigi : tr.batiMuzigi}</Text>
          <Text style={s.zorlukTag}>{'⭐'.repeat(suankiSoru.zorluk)}</Text>
        </View>
        <Text style={s.soruText}>{soruMetni}</Text>
        <View style={s.secenekler}>
          {secenekListesi.map((opt) => {
            let stil = s.secenek;
            if (secilen) {
              if (opt === dogruCevap) stil = { ...s.secenek, ...s.dogruSecenek };
              else if (opt === secilen) stil = { ...s.secenek, ...s.yanlisSecenek };
            }
            return (
              <TouchableOpacity key={opt} style={stil} onPress={() => cevapSec(opt)}>
                <Text style={s.secenekText}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {secilen && (
          <View style={[s.aciklamaBox, { borderLeftColor: secilen === dogruCevap ? '#4caf50' : '#e94560' }]}>
            <Text style={s.aciklamaBaslik}>{secilen === dogruCevap ? `✅ ${tr.dogru}!` : `❌ ${tr.yanlis}!`}</Text>
            <Text style={s.aciklamaText}>{aciklamaMetni}</Text>
          </View>
        )}
      </Animated.View>
      {secilen && (
        <TouchableOpacity style={s.sonrakiBtn} onPress={sonraki}>
          <Text style={s.sonrakiBtnText}>{index + 1 >= filtrelenmis.length ? tr.sonuclariGor : tr.sonrakiSoru}</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  ortala: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  geri: { color: '#888', fontSize: 16 }, progress: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  skorText: { color: '#4caf50', fontWeight: 'bold', fontSize: 16 },
  progressBar: { height: 4, backgroundColor: '#16213e', marginHorizontal: 16, borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: '#e94560', borderRadius: 2 },
  content: { flex: 1, padding: 20 },
  zorlukRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  kategoriTag: { color: '#888', fontSize: 13 }, zorlukTag: { fontSize: 13 },
  soruText: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 28, lineHeight: 32 },
  secenekler: { gap: 12 },
  secenek: { backgroundColor: '#16213e', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#0f3460' },
  dogruSecenek: { backgroundColor: '#1b3a1f', borderColor: '#4caf50' },
  yanlisSecenek: { backgroundColor: '#3a1b1f', borderColor: '#e94560' },
  secenekText: { color: '#fff', fontSize: 16 },
  aciklamaBox: { marginTop: 20, backgroundColor: '#16213e', borderRadius: 12, padding: 16, borderLeftWidth: 4 },
  aciklamaBaslik: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  aciklamaText: { color: '#aaa', fontSize: 14, lineHeight: 22 },
  sonrakiBtn: { margin: 16, backgroundColor: '#e94560', borderRadius: 12, padding: 18, alignItems: 'center' },
  sonrakiBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  sonucContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  sonucBaslik: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' },
  sonucSkor: { fontSize: 48, fontWeight: 'bold', color: '#e94560', marginBottom: 4 },
  sonucYuzde: { fontSize: 20, color: '#888', marginBottom: 16 },
  sonucMesaj: { fontSize: 15, color: '#ccc', textAlign: 'center', marginBottom: 32 },
  tekrarBtn: { backgroundColor: '#e94560', borderRadius: 12, padding: 16, width: '100%', alignItems: 'center', marginBottom: 12 },
  tekrarBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  geriBtn: { backgroundColor: '#16213e', borderRadius: 12, padding: 16, width: '100%', alignItems: 'center' },
  geriBtnText: { color: '#888', fontSize: 16 },
});