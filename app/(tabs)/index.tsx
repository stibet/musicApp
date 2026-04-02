import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDilStore } from '../../src/store/dilStore';
import { ilerlemeYukle } from '../../src/store/progress';

export default function HomeScreen() {
  const router = useRouter();
  const { tr, dil, dilDegistir } = useDilStore();
  const [streak, setStreak] = useState(0);

  useFocusEffect(useCallback(() => { ilerlemeYukle().then(i => setStreak(i.streak)); }, []));

  const modules = [
    { id: 'maqam', title: tr.turkMuzigi, subtitle: tr.makamlarKomalar, color: '#e94560' },
    { id: 'western', title: tr.batiMuzigi, subtitle: tr.gamlarModlar, color: '#4ecdc4' },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.headerRow}>
        <View>
          <Text style={s.title}>Mizmiz 🎶</Text>
          <Text style={s.subtitle}>Müzik teorisi öğrenme</Text>
        </View>
        <View style={s.dilRow}>
          <TouchableOpacity style={[s.dilBtn, dil === 'tr' && s.dilBtnAktif]} onPress={() => dilDegistir('tr')}>
            <Text style={[s.dilBtnText, dil === 'tr' && s.dilBtnTextAktif]}>TR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.dilBtn, dil === 'en' && s.dilBtnAktif]} onPress={() => dilDegistir('en')}>
            <Text style={[s.dilBtnText, dil === 'en' && s.dilBtnTextAktif]}>EN</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.streakKart}>
        <Text style={s.streakEmoji}>🔥</Text>
        <View>
          <Text style={s.streakSayi}>{streak}</Text>
          <Text style={s.streakLabel}>{tr.gunlukSeri}</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>{tr.soruCoz}</Text>
      {modules.map((m) => (
        <TouchableOpacity key={m.id} style={[s.card, { borderLeftColor: m.color }]}
          onPress={() => router.push({ pathname: '/quiz', params: { kategori: m.id } })}>
          <Text style={s.cardTitle}>{m.title}</Text>
          <Text style={s.cardSub}>{m.subtitle}</Text>
          <Text style={[s.basla, { color: m.color }]}>{tr.soruCoz} →</Text>
        </TouchableOpacity>
      ))}

      <Text style={s.sectionTitle}>{tr.ansiklopedi}</Text>
      <TouchableOpacity style={[s.card, { borderLeftColor: '#a78bfa' }]} onPress={() => router.push('/makamlar')}>
        <Text style={s.cardTitle}>🗂 {tr.makamListesi}</Text>
        <Text style={s.cardSub}>{tr.makamlarKomalar}</Text>
        <Text style={[s.basla, { color: '#a78bfa' }]}>{tr.kesifEt}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.card, { borderLeftColor: '#4ecdc4' }]} onPress={() => router.push('/gamlar')}>
        <Text style={s.cardTitle}>🎼 {tr.gamListesi}</Text>
        <Text style={s.cardSub}>{tr.gamlarModlar}</Text>
        <Text style={[s.basla, { color: '#4ecdc4' }]}>{tr.kesifEt}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 24, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 2 },
  dilRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  dilBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#0f3460', backgroundColor: '#16213e' },
  dilBtnAktif: { borderColor: '#e94560', backgroundColor: '#e9456022' },
  dilBtnText: { color: '#666', fontWeight: 'bold', fontSize: 13 },
  dilBtnTextAktif: { color: '#e94560' },
  streakKart: { backgroundColor: '#16213e', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#f5a623' },
  streakEmoji: { fontSize: 32 },
  streakSayi: { fontSize: 28, fontWeight: 'bold', color: '#f5a623' },
  streakLabel: { color: '#888', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#ccc', marginBottom: 10, marginTop: 4 },
  card: { backgroundColor: '#16213e', borderRadius: 12, padding: 18, marginBottom: 10, borderLeftWidth: 4 },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
  cardSub: { fontSize: 13, color: '#666', marginTop: 3 },
  basla: { fontSize: 13, fontWeight: '600', marginTop: 10 },
});