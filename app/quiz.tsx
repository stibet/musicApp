import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, F, R } from '../constants/Design';
import { Soru, sorular } from '../src/data/sorular';
import { cevapKaydet, tekrarSorulari } from '../src/store/progress';

export default function QuizScreen() {
  const { kategori } = useLocalSearchParams<{ kategori?: string }>();
  const router = useRouter();
  const [filtrelenmis, setFiltrelenmis] = useState<Soru[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [index, setIndex] = useState(0);
  const [secilen, setSecilen] = useState<string | null>(null);
  const [dogru, setDogru] = useState(0);
  const [bitti, setBitti] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => { yukle(); }, [kategori]);

  async function yukle() {
    setYukleniyor(true);
    const tumSorular = kategori ? sorular.filter(s => kategori === 'maqam' ? s.kategori === 'makam' : s.kategori === 'bati') : sorular;
    const ids = await tekrarSorulari(tumSorular.map(s => s.id));
    setFiltrelenmis(tumSorular.filter(s => ids.includes(s.id)).sort(() => Math.random() - 0.5));
    setYukleniyor(false);
  }

  function sec(opt: string) {
    if (secilen) return;
    setSecilen(opt);
    const dogruMu = opt === suankiSoru.dogruCevap;
    if (dogruMu) setDogru(d => d + 1);
    cevapKaydet(suankiSoru.id, dogruMu);
  }

  function sonraki() {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      if (index + 1 >= filtrelenmis.length) setBitti(true);
      else { setIndex(i => i + 1); setSecilen(null); }
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  }

  if (yukleniyor) return <SafeAreaView style={s.container}><View style={s.ortala}><Text style={{ color: C.textMuted }}>Yükleniyor...</Text></View></SafeAreaView>;

  if (filtrelenmis.length === 0) return (
    <SafeAreaView style={s.container}>
      <View style={s.ortala}>
        <Text style={{ fontSize: 56, marginBottom: 16 }}>🎉</Text>
        <Text style={s.sonucBaslik}>Harika!</Text>
        <Text style={s.sonucAlt}>Bugünlük tekrar edilecek soru kalmadı.</Text>
        <TouchableOpacity style={s.sonrakiBtn} onPress={() => router.back()}>
          <Text style={s.sonrakiBtnText}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const suankiSoru = filtrelenmis[index];

  if (bitti) {
    const yuzde = Math.round((dogru / filtrelenmis.length) * 100);
    return (
      <SafeAreaView style={s.container}>
        <View style={s.ortala}>
          <Text style={{ fontSize: 72, marginBottom: 16 }}>{yuzde >= 80 ? '🏆' : yuzde >= 50 ? '👏' : '📚'}</Text>
          <Text style={s.sonucBaslik}>Tamamlandı!</Text>
          <Text style={[s.sonucSkor, { color: yuzde >= 70 ? C.green : yuzde >= 40 ? C.amber : C.red }]}>{dogru}/{filtrelenmis.length}</Text>
          <Text style={{ color: C.textMuted, fontSize: F.md, marginBottom: 28 }}>%{yuzde} başarı</Text>
          <TouchableOpacity style={s.sonrakiBtn} onPress={() => { setIndex(0); setSecilen(null); setDogru(0); setBitti(false); yukle(); }}>
            <Text style={s.sonrakiBtnText}>Tekrar Çöz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.sonrakiBtn, { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, marginTop: 10 }]} onPress={() => router.back()}>
            <Text style={[s.sonrakiBtnText, { color: C.textSecondary }]}>Ana Sayfa</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.quizHeader}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>← Geri</Text></TouchableOpacity>
        <Text style={s.quizProgress}>{index + 1} / {filtrelenmis.length}</Text>
        <Text style={[s.geri, { color: C.green }]}>✓ {dogru}</Text>
      </View>
      <View style={s.quizBar}>
        <View style={[s.quizBarFill, { width: `${((index + 1) / filtrelenmis.length) * 100}%` }]} />
      </View>

      <Animated.View style={[s.quizContent, { opacity: fadeAnim }]}>
        <View style={s.zorlukRow}>
          <View style={[s.kategoriTag, { backgroundColor: suankiSoru.kategori === 'makam' ? C.goldGlow : C.tealGlow }]}>
            <Text style={[s.kategoriTagText, { color: suankiSoru.kategori === 'makam' ? C.gold : C.teal }]}>
              {suankiSoru.kategori === 'makam' ? 'Türk Müziği' : 'Batı Müziği'}
            </Text>
          </View>
          <Text style={s.zorluk}>{'⭐'.repeat(suankiSoru.zorluk)}</Text>
        </View>

        <Text style={s.soruText}>{suankiSoru.soru}</Text>

        <View style={s.secenekler}>
          {suankiSoru.secenekler.map(opt => {
            let stil = s.secenek;
            if (secilen) {
              if (opt === suankiSoru.dogruCevap) stil = { ...s.secenek, ...s.dogruSec };
              else if (opt === secilen) stil = { ...s.secenek, ...s.yanlisSec };
            }
            return (
              <TouchableOpacity key={opt} style={stil} onPress={() => sec(opt)} activeOpacity={0.8}>
                <Text style={s.secenekText}>{opt}</Text>
                {secilen && opt === suankiSoru.dogruCevap && <Text style={{ color: C.green, fontSize: F.xs, marginTop: 4 }}>✓ Doğru</Text>}
                {secilen && opt === secilen && opt !== suankiSoru.dogruCevap && <Text style={{ color: C.red, fontSize: F.xs, marginTop: 4 }}>✗ Yanlış</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {secilen && (
          <View style={[s.aciklama, { borderLeftColor: secilen === suankiSoru.dogruCevap ? C.green : C.red }]}>
            <Text style={s.aciklamaText}>{suankiSoru.aciklama}</Text>
          </View>
        )}
      </Animated.View>

      {secilen && (
        <TouchableOpacity style={s.sonrakiBtn} onPress={sonraki}>
          <Text style={s.sonrakiBtnText}>{index + 1 >= filtrelenmis.length ? 'Sonuçları Gör →' : 'Sonraki Soru →'}</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  ortala: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 56 },
  geri: { color: C.textSecondary, fontSize: F.md, fontWeight: '600' },
  quizProgress: { color: C.textPrimary, fontWeight: '800', fontSize: F.md },
  quizBar: { height: 3, backgroundColor: C.border, marginHorizontal: 16, borderRadius: 2 },
  quizBarFill: { height: 3, backgroundColor: C.gold, borderRadius: 2 },
  quizContent: { flex: 1, padding: 20 },
  zorlukRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  kategoriTag: { borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 6 },
  kategoriTagText: { fontSize: F.xs, fontWeight: '700' },
  zorluk: { fontSize: F.sm },
  soruText: { fontSize: F.lg + 2, fontWeight: '800', color: C.textPrimary, marginBottom: 24, lineHeight: 28 },
  secenekler: { gap: 10 },
  secenek: { backgroundColor: C.surface, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: C.border },
  dogruSec: { backgroundColor: C.greenDim, borderColor: C.green },
  yanlisSec: { backgroundColor: C.redDim, borderColor: C.red },
  secenekText: { color: C.textPrimary, fontSize: F.md, fontWeight: '600' },
  aciklama: { marginTop: 16, backgroundColor: C.surface, borderRadius: R.lg, padding: 16, borderLeftWidth: 3 },
  aciklamaText: { color: C.textSecondary, fontSize: F.sm, lineHeight: 20 },
  sonucBaslik: { fontSize: F.xxl, fontWeight: '900', color: C.textPrimary, marginBottom: 8 },
  sonucSkor: { fontSize: 56, fontWeight: '900', marginBottom: 4 },
  sonucAlt: { color: C.textMuted, fontSize: F.md, textAlign: 'center', marginBottom: 28 },
  sonrakiBtn: { margin: 16, backgroundColor: C.gold, borderRadius: R.lg, padding: 18, alignItems: 'center' },
  sonrakiBtnText: { color: C.bg, fontWeight: '900', fontSize: F.md },
});
