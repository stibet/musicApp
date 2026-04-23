import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, F, R } from '../../constants/Design';
import { practiceMakamlari } from '../../src/data/makamPracticeDefs';
import { loadCoachSessions } from '../../src/store/sessionHistory';
import { ilerlemeYukle } from '../../src/store/progress';

const SEYIR_RENK: Record<string, string> = {
  'çıkıcı': C.green, 'inici': C.red, 'inici-çıkıcı': C.amber,
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
    <ScrollView style={s.bg} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      <View style={s.header}>
        <View>
          <Text style={s.appName}>MAKAM COACH</Text>
          <Text style={s.appSub}>Profesyonel makam pratiği</Text>
        </View>
        <View style={s.badges}>
          <View style={s.badge}><Text>🔥</Text><Text style={s.badgeVal}>{streak}</Text></View>
          <View style={s.badge}><Text>🎯</Text><Text style={s.badgeVal}>{sessionSayisi}</Text></View>
        </View>
      </View>

      {/* Makam Koçu grid */}
      <Text style={s.bolumBaslik}>Makam Koçu</Text>
      <View style={s.grid}>
        {practiceMakamlari.map(m => (
          <TouchableOpacity key={m.id} style={s.makamKart} activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/makam-kocu', params: { id: m.id } })}>
            <View style={[s.dot, { backgroundColor: SEYIR_RENK[m.seyir] || C.gold }]} />
            <Text style={s.makamAd}>{m.practice.title}</Text>
            <Text style={s.makamAlt}>{m.durak} · {m.guclu}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Analiz araçları */}
      <Text style={s.bolumBaslik}>Analiz Araçları</Text>

      <TouchableOpacity style={[s.modulKart, { borderLeftColor: C.violet }]} activeOpacity={0.8}
        onPress={() => router.push('/taksim-analiz')}>
        <View style={[s.modulIkon, { backgroundColor: C.violet + '22' }]}><Text style={{ fontSize: 24 }}>🎼</Text></View>
        <View style={s.modulIcerik}>
          <Text style={s.modulBaslik}>Taksim Analizi</Text>
          <Text style={s.modulAlt}>Mikrofonda serbest çal — her nota analiz edilsin</Text>
        </View>
        <Text style={s.ok}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.modulKart, { borderLeftColor: '#FF0000' }]} activeOpacity={0.8}
        onPress={() => router.push('/video-analiz')}>
        <View style={[s.modulIkon, { backgroundColor: '#FF000022' }]}><Text style={{ fontSize: 24 }}>🎬</Text></View>
        <View style={s.modulIcerik}>
          <Text style={s.modulBaslik}>Video Analizi</Text>
          <Text style={s.modulAlt}>Video/ses yükle — makam doğruluğunu gör</Text>
        </View>
        <View style={s.yeniTag}><Text style={s.yeniTagText}>YENİ</Text></View>
        <Text style={s.ok}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.modulKart, { borderLeftColor: C.teal }]} activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/two')}>
        <View style={[s.modulIkon, { backgroundColor: C.teal + '22' }]}><Text style={{ fontSize: 24 }}>🎤</Text></View>
        <View style={s.modulIcerik}>
          <Text style={s.modulBaslik}>Canlı Pitch Analizi</Text>
          <Text style={s.modulAlt}>Gerçek zamanlı koma farkı analizi</Text>
        </View>
        <Text style={s.ok}>›</Text>
      </TouchableOpacity>

      {/* Diğer araçlar */}
      <Text style={s.bolumBaslik}>Araçlar</Text>

      {[
        { emoji:'🧠', baslik:'Karışık Quiz',        alt:'Tüm kategorilerden rastgele sorular',       rota:'/quiz',      renk: C.violet, params: { mod: 'karisik' } },
        { emoji:'🗂', baslik:'Makam Ansiklopedisi', alt:'Koma dizisi, perdeler, videolar',          rota:'/makamlar',  renk: C.gold },
        { emoji:'🎼', baslik:'Batı Gamları',        alt:'Modlar ve gamlar',                         rota:'/gamlar',    renk: C.teal },
      ].map((m, i) => (
        <TouchableOpacity key={i} style={[s.modulKart, { borderLeftColor: m.renk }]}
          activeOpacity={0.8} onPress={() => router.push({ pathname: m.rota as any, params: (m as any).params })}>
          <View style={[s.modulIkon, { backgroundColor: m.renk + '22' }]}>
            <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
          </View>
          <View style={s.modulIcerik}>
            <Text style={s.modulBaslik}>{m.baslik}</Text>
            <Text style={s.modulAlt}>{m.alt}</Text>
          </View>
          <Text style={s.ok}>›</Text>
        </TouchableOpacity>
      ))}

    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg:      { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingTop: 60, paddingBottom: 48 },
  header:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  appName: { color: C.gold, fontSize: F.xs, fontWeight: '800', letterSpacing: 2 },
  appSub:  { color: C.textSecondary, fontSize: F.sm, marginTop: 4 },
  badges:  { flexDirection: 'row', gap: 8 },
  badge:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.surface, borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  badgeVal:{ color: C.textPrimary, fontWeight: '800', fontSize: F.sm },
  bolumBaslik:{ color: C.textMuted, fontSize: F.xs, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, marginTop: 4 },
  grid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  makamKart:{ width: '47.5%', backgroundColor: C.surface, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: C.border },
  dot:     { width: 8, height: 8, borderRadius: 4, marginBottom: 10 },
  makamAd: { color: C.textPrimary, fontWeight: '800', fontSize: F.lg },
  makamAlt:{ color: C.textMuted, fontSize: F.xs, marginTop: 4 },
  modulKart:  { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.surface, borderRadius: R.lg, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3 },
  modulIkon:  { width: 48, height: 48, borderRadius: R.md, justifyContent: 'center', alignItems: 'center' },
  modulIcerik:{ flex: 1 },
  modulBaslik:{ color: C.textPrimary, fontWeight: '700', fontSize: F.md },
  modulAlt:   { color: C.textMuted, fontSize: F.xs, marginTop: 3, lineHeight: 16 },
  ok:         { color: C.textMuted, fontSize: 22 },
  yeniTag:    { backgroundColor: C.red + '22', borderRadius: R.full, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: C.red + '55', marginRight: 4 },
  yeniTagText:{ color: C.red, fontSize: 10, fontWeight: '800' },
});
