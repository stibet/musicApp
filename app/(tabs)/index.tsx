import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, F, R } from '../../constants/Design';
import { practiceMakamlari } from '../../src/data/makamPracticeDefs';
import { ilerlemeYukle } from '../../src/store/progress';
import { loadCoachSessions } from '../../src/store/sessionHistory';

const SEYIR_RENK: Record<string, string> = {
  'çıkıcı': C.green,
  'inici': C.red,
  'inici-çıkıcı': C.amber,
};

export default function HomeScreen() {
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [sessionSayisi, setSessionSayisi] = useState(0);

  useFocusEffect(useCallback(() => {
    ilerlemeYukle().then(i => setStreak(i.streak));
    loadCoachSessions().then(s => setSessionSayisi(s.length));
  }, []));

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.appLabel}>MAKAM COACH</Text>
          <Text style={s.appSub}>Profesyonel makam pratiği</Text>
        </View>
        <View style={s.statRow}>
          <View style={s.statPill}>
            <Text style={s.statEmoji}>🔥</Text>
            <Text style={s.statVal}>{streak}</Text>
          </View>
          <View style={s.statPill}>
            <Text style={s.statEmoji}>🎯</Text>
            <Text style={s.statVal}>{sessionSayisi}</Text>
          </View>
        </View>
      </View>

      {/* Hero kart */}
      <TouchableOpacity style={s.heroCard} activeOpacity={0.85}
        onPress={() => router.push('/makam-kocu')}>
        <View style={s.heroGlow} />
        <Text style={s.heroTag}>ANA MODÜL</Text>
        <Text style={s.heroTitle}>Makam Koçu</Text>
        <Text style={s.heroDesc}>
          Dizi çal, örnek cümle dinle, koma bazında geri bildirim al. Enstrüman, transpoze ve nota modu seçimleriyle tam özelleştir.
        </Text>
        <View style={s.heroArrow}>
          <Text style={s.heroArrowText}>Başla →</Text>
        </View>
      </TouchableOpacity>

      {/* Hızlı makam seçimi */}
      <Text style={s.sectionTitle}>Makam Seç</Text>
      <View style={s.makamGrid}>
        {practiceMakamlari.map((m) => (
          <TouchableOpacity key={m.id} style={s.makamKart} activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/makam-kocu', params: { id: m.id } })}>
            <View style={[s.makamDot, { backgroundColor: SEYIR_RENK[m.seyir] || C.gold }]} />
            <Text style={s.makamIsim}>{m.practice.title}</Text>
            <Text style={s.makamAlt}>{m.durak} · {m.guclu}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* İkincil modüller */}
      <Text style={s.sectionTitle}>Destekleyici Modüller</Text>

      <TouchableOpacity style={s.modul} activeOpacity={0.8} onPress={() => router.push('/(tabs)/two')}>
        <View style={[s.modulIkon, { backgroundColor: C.tealGlow }]}>
          <Text style={{ fontSize: 22 }}>🎤</Text>
        </View>
        <View style={s.modulIcerik}>
          <Text style={s.modulBaslik}>Canlı Pitch Analizi</Text>
          <Text style={s.modulAlt}>Mikrofondan çal, koma farkını gör</Text>
        </View>
        <Text style={s.modulOk}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.modul} activeOpacity={0.8} onPress={() => router.push('/quiz')}>
        <View style={[s.modulIkon, { backgroundColor: C.violetDim + '44' }]}>
          <Text style={{ fontSize: 22 }}>🧠</Text>
        </View>
        <View style={s.modulIcerik}>
          <Text style={s.modulBaslik}>Teori Quiz</Text>
          <Text style={s.modulAlt}>Makam ve gam sorularıyla bilgini test et</Text>
        </View>
        <Text style={s.modulOk}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.modul} activeOpacity={0.8} onPress={() => router.push('/makamlar')}>
        <View style={[s.modulIkon, { backgroundColor: C.goldGlow }]}>
          <Text style={{ fontSize: 22 }}>🗂</Text>
        </View>
        <View style={s.modulIcerik}>
          <Text style={s.modulBaslik}>Makam Ansiklopedisi</Text>
          <Text style={s.modulAlt}>Karar, güçlü, koma dizisi, örnek eserler</Text>
        </View>
        <Text style={s.modulOk}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.modul} activeOpacity={0.8} onPress={() => router.push('/gamlar')}>
        <View style={[s.modulIkon, { backgroundColor: C.tealGlow }]}>
          <Text style={{ fontSize: 22 }}>🎼</Text>
        </View>
        <View style={s.modulIcerik}>
          <Text style={s.modulBaslik}>Batı Gamları</Text>
          <Text style={s.modulAlt}>Modlar, pentatonik, blues ve daha fazlası</Text>
        </View>
        <Text style={s.modulOk}>›</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingTop: 60, paddingBottom: 48 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  appLabel: { color: C.gold, fontSize: F.xs, fontWeight: '800', letterSpacing: 2 },
  appSub: { color: C.textSecondary, fontSize: F.sm, marginTop: 4 },
  statRow: { flexDirection: 'row', gap: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.surface2, borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  statEmoji: { fontSize: 14 },
  statVal: { color: C.textPrimary, fontWeight: '800', fontSize: F.sm },

  heroCard: { backgroundColor: C.surface, borderRadius: R.xl, padding: 24, marginBottom: 28, borderWidth: 1, borderColor: C.border2, overflow: 'hidden', position: 'relative' },
  heroGlow: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: C.goldGlow },
  heroTag: { color: C.gold, fontSize: F.xs, fontWeight: '800', letterSpacing: 2, marginBottom: 10 },
  heroTitle: { color: C.textPrimary, fontSize: F.hero, fontWeight: '900', marginBottom: 12, lineHeight: 48 },
  heroDesc: { color: C.textSecondary, fontSize: F.md, lineHeight: 22, marginBottom: 20 },
  heroArrow: { backgroundColor: C.gold, borderRadius: R.full, paddingHorizontal: 20, paddingVertical: 12, alignSelf: 'flex-start' },
  heroArrowText: { color: C.bg, fontWeight: '900', fontSize: F.md },

  sectionTitle: { color: C.textSecondary, fontSize: F.xs, fontWeight: '700', letterSpacing: 2, marginBottom: 14, textTransform: 'uppercase' },

  makamGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  makamKart: { width: '47.5%', backgroundColor: C.surface, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: C.border },
  makamDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 10 },
  makamIsim: { color: C.textPrimary, fontWeight: '800', fontSize: F.lg },
  makamAlt: { color: C.textMuted, fontSize: F.xs, marginTop: 6 },

  modul: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.surface, borderRadius: R.lg, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  modulIkon: { width: 48, height: 48, borderRadius: R.md, justifyContent: 'center', alignItems: 'center' },
  modulIcerik: { flex: 1 },
  modulBaslik: { color: C.textPrimary, fontWeight: '700', fontSize: F.md },
  modulAlt: { color: C.textMuted, fontSize: F.xs, marginTop: 3 },
  modulOk: { color: C.textMuted, fontSize: 22 },
});
