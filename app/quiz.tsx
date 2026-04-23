import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, F, R } from '../constants/Design';
import { Soru, sorular, makamSoruHavuzu, rastgeleSorular } from '../src/data/sorular';
import { profilYukle, puanEkle } from '../src/store/skorStore';

const KAT_RENK: Record<string, string> = {
  makam: C.gold, bati: '#8B5CF6', teori: '#10B981', perde: '#60a5fa'
};
const KAT_ISIM: Record<string, string> = {
  makam: 'Türk Müziği', bati: 'Batı Müziği', teori: 'Teori', perde: 'Perde'
};

export default function QuizScreen() {
  const { makamId, makamIsim, mod } = useLocalSearchParams<{
    makamId?: string; makamIsim?: string; mod?: string;
  }>();
  const router = useRouter();

  const [sorularListesi, setSorularListesi] = useState<Soru[]>([]);
  const [index, setIndex]     = useState(0);
  const [secilen, setSecilen] = useState<string | null>(null);
  const [dogru, setDogru]     = useState(0);
  const [bitti, setBitti]     = useState(false);
  const [fadeAnim]            = useState(new Animated.Value(1));
  const [streak, setStreak]   = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);

  const baslik = makamId
    ? `${makamIsim ?? makamId} Quizi`
    : mod === 'karisik' ? 'Karışık Quiz'
    : 'Quiz';

  useEffect(() => {
    let liste: Soru[];
    if (makamId) {
      liste = makamSoruHavuzu(makamId);
    } else {
      liste = rastgeleSorular(20);
    }
    setSorularListesi(liste.length > 0 ? liste : sorular.slice(0, 10).sort(() => Math.random() - 0.5));
    setYukleniyor(false);
  }, [makamId]);

  function sec(opt: string) {
    if (secilen) return;
    setSecilen(opt);
    const dogruMu = opt === suankiSoru.dogruCevap;
    if (dogruMu) {
      setDogru(d => d + 1);
      setStreak(s => s + 1);
      puanEkle(suankiSoru.zorluk * 10).catch(() => {});
    } else {
      setStreak(0);
    }
  }

  function sonraki() {
    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      if (index + 1 >= sorularListesi.length) {
        setBitti(true);
      } else {
        setIndex(i => i + 1);
        setSecilen(null);
      }
      Animated.timing(fadeAnim, { toValue: 1, duration: 120, useNativeDriver: true }).start();
    });
  }

  function tekrarEt() {
    const liste = makamId ? makamSoruHavuzu(makamId) : rastgeleSorular(20);
    setSorularListesi(liste.sort(() => Math.random() - 0.5));
    setIndex(0); setSecilen(null); setDogru(0); setBitti(false); setStreak(0);
  }

  if (yukleniyor) return (
    <SafeAreaView style={s.container}>
      <View style={s.ortala}><Text style={{ color: C.textMuted, fontSize: F.md }}>Hazırlanıyor...</Text></View>
    </SafeAreaView>
  );

  if (sorularListesi.length === 0) return (
    <SafeAreaView style={s.container}>
      <View style={s.ortala}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
        <Text style={s.sonucBaslik}>Soru bulunamadı</Text>
        <TouchableOpacity style={s.btn} onPress={() => router.back()}>
          <Text style={s.btnText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const suankiSoru = sorularListesi[index];
  const ilerleme = ((index + 1) / sorularListesi.length) * 100;

  // ── BİTİŞ EKRANI ──────────────────────────────────────────────
  if (bitti) {
    const yuzde = Math.round((dogru / sorularListesi.length) * 100);
    const emoji = yuzde >= 80 ? '🏆' : yuzde >= 60 ? '👏' : yuzde >= 40 ? '📚' : '💪';
    const mesaj = yuzde >= 80 ? 'Mükemmel!' : yuzde >= 60 ? 'İyi!' : yuzde >= 40 ? 'Gelişiyor' : 'Devam Et';
    return (
      <SafeAreaView style={s.container}>
        <ScrollView contentContainerStyle={s.ortala}>
          <Text style={{ fontSize: 80, marginBottom: 8 }}>{emoji}</Text>
          <Text style={s.sonucBaslik}>{mesaj}</Text>
          <View style={s.sonucKart}>
            <View style={s.sonucRow}>
              <Text style={s.sonucLabel}>Doğru</Text>
              <Text style={[s.sonucVal, { color: C.green }]}>{dogru}</Text>
            </View>
            <View style={[s.ayrac]} />
            <View style={s.sonucRow}>
              <Text style={s.sonucLabel}>Toplam</Text>
              <Text style={s.sonucVal}>{sorularListesi.length}</Text>
            </View>
            <View style={s.ayrac} />
            <View style={s.sonucRow}>
              <Text style={s.sonucLabel}>Başarı</Text>
              <Text style={[s.sonucVal, { color: yuzde >= 70 ? C.green : yuzde >= 40 ? C.amber : C.red }]}>%{yuzde}</Text>
            </View>
          </View>
          <TouchableOpacity style={s.btn} onPress={tekrarEt}>
            <Text style={s.btnText}>↺  Tekrar Çöz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => router.back()}>
            <Text style={s.btnSecondaryText}>← Geri Dön</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── SORU EKRANI ───────────────────────────────────────────────
  const renk = KAT_RENK[suankiSoru.kategori] ?? C.gold;

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.geriBtn}>
          <Text style={s.geri}>←</Text>
        </TouchableOpacity>
        <View style={s.headerOrta}>
          <Text style={s.headerBaslik} numberOfLines={1}>{baslik}</Text>
          <Text style={s.headerAlt}>{index + 1} / {sorularListesi.length}</Text>
        </View>
        <View style={s.streakBox}>
          <Text style={s.streakText}>{streak > 0 ? `🔥${streak}` : `✓${dogru}`}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${ilerleme}%` as any, backgroundColor: renk }]} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Kategori + zorluk */}
          <View style={s.metaRow}>
            <View style={[s.katTag, { backgroundColor: renk + '22', borderColor: renk + '55' }]}>
              <Text style={[s.katTagText, { color: renk }]}>{KAT_ISIM[suankiSoru.kategori] ?? suankiSoru.kategori}</Text>
            </View>
            <View style={s.zorlukDots}>
              {[1, 2, 3].map(d => (
                <View key={d} style={[s.dot, { backgroundColor: d <= suankiSoru.zorluk ? renk : C.border }]} />
              ))}
            </View>
          </View>

          {/* Soru */}
          <Text style={s.soruText}>{suankiSoru.soru}</Text>

          {/* Seçenekler */}
          <View style={s.secenekler}>
            {suankiSoru.secenekler.map((opt, i) => {
              const dogruMu = opt === suankiSoru.dogruCevap;
              const secildi = opt === secilen;
              let bgColor = C.surface;
              let borderColor = C.border;
              let textColor = C.textPrimary;
              let icon = '';
              if (secilen) {
                if (dogruMu) { bgColor = '#052e16'; borderColor = C.green; textColor = C.green; icon = '✓'; }
                else if (secildi) { bgColor = '#2d0a0a'; borderColor = C.red; textColor = C.red; icon = '✗'; }
                else { bgColor = C.surface; borderColor = C.border; textColor = C.textMuted; }
              }
              return (
                <TouchableOpacity
                  key={opt} activeOpacity={secilen ? 1 : 0.75}
                  style={[s.secenek, { backgroundColor: bgColor, borderColor }]}
                  onPress={() => sec(opt)}>
                  <View style={s.secenekIc}>
                    <View style={[s.secNumara, { borderColor: secilen && dogruMu ? C.green : secilen && secildi ? C.red : C.border }]}>
                      <Text style={[s.secNumaraText, { color: secilen && (dogruMu || secildi) ? textColor : C.textMuted }]}>
                        {icon || String.fromCharCode(65 + i)}
                      </Text>
                    </View>
                    <Text style={[s.secenekText, { color: textColor, flex: 1 }]}>{opt}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Açıklama */}
          {secilen && (
            <View style={[s.aciklama, { borderLeftColor: secilen === suankiSoru.dogruCevap ? C.green : C.red }]}>
              <Text style={s.aciklamaText}>{suankiSoru.aciklama}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {secilen && (
        <TouchableOpacity style={[s.btn, { margin: 16 }]} onPress={sonraki}>
          <Text style={s.btnText}>
            {index + 1 >= sorularListesi.length ? 'Sonuçları Gör →' : 'Sonraki →'}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: C.bg },
  ortala:           { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, gap: 12 },
  geriBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  geri:             { color: C.textSecondary, fontSize: F.lg, fontWeight: '700' },
  headerOrta:       { flex: 1, alignItems: 'center' },
  headerBaslik:     { color: C.textPrimary, fontWeight: '900', fontSize: F.md },
  headerAlt:        { color: C.textMuted, fontSize: F.xs, marginTop: 2 },
  streakBox:        { width: 52, alignItems: 'flex-end' },
  streakText:       { color: C.gold, fontWeight: '900', fontSize: F.sm },
  progressBar:      { height: 3, backgroundColor: C.border, marginHorizontal: 16, borderRadius: 2, overflow: 'hidden' },
  progressFill:     { height: 3, borderRadius: 2 },
  content:          { padding: 20, paddingBottom: 40 },
  metaRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  katTag:           { paddingHorizontal: 12, paddingVertical: 5, borderRadius: R.full, borderWidth: 1 },
  katTagText:       { fontSize: F.xs, fontWeight: '800', letterSpacing: 0.5 },
  zorlukDots:       { flexDirection: 'row', gap: 5 },
  dot:              { width: 8, height: 8, borderRadius: 4 },
  soruText:         { fontSize: F.lg + 1, fontWeight: '800', color: C.textPrimary, lineHeight: 30, marginBottom: 22 },
  secenekler:       { gap: 10, marginBottom: 16 },
  secenek:          { borderRadius: R.lg, borderWidth: 1, padding: 14 },
  secenekIc:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  secNumara:        { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  secNumaraText:    { fontSize: F.sm, fontWeight: '800' },
  secenekText:      { fontSize: F.md, fontWeight: '600', lineHeight: 22 },
  aciklama:         { backgroundColor: C.surface, borderRadius: R.lg, padding: 14, borderLeftWidth: 3, marginTop: 8 },
  aciklamaText:     { color: C.textSecondary, fontSize: F.sm, lineHeight: 20 },
  btn:              { backgroundColor: C.gold, borderRadius: R.lg, padding: 16, alignItems: 'center' },
  btnText:          { color: C.bg, fontWeight: '900', fontSize: F.md },
  btnSecondary:     { backgroundColor: C.surface, borderRadius: R.lg, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border, marginTop: 10 },
  btnSecondaryText: { color: C.textSecondary, fontWeight: '700', fontSize: F.md },
  sonucBaslik:      { fontSize: 28, fontWeight: '900', color: C.textPrimary },
  sonucKart:        { backgroundColor: C.surface, borderRadius: R.xl, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignSelf: 'stretch', marginVertical: 8 },
  sonucRow:         { flex: 1, alignItems: 'center', padding: 20, gap: 6 },
  sonucLabel:       { color: C.textMuted, fontSize: F.xs, fontWeight: '700' },
  sonucVal:         { color: C.textPrimary, fontSize: 28, fontWeight: '900' },
  ayrac:            { width: 1, backgroundColor: C.border, marginVertical: 16 },
});
