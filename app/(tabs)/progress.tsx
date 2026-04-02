import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { sorular } from '../../src/data/sorular';
import { useDilStore } from '../../src/store/dilStore';
import { Ilerleme, ilerlemeYukle } from '../../src/store/progress';

export default function ProgressScreen() {
  const [ilerleme, setIlerleme] = useState<Ilerleme | null>(null);
  const { tr } = useDilStore();
  useFocusEffect(useCallback(() => { ilerlemeYukle().then(setIlerleme); }, []));

  if (!ilerleme) return <SafeAreaView style={s.container}><View style={s.ortala}><Text style={{ color: '#888' }}>...</Text></View></SafeAreaView>;

  const toplamCevap = ilerleme.toplamDogru + ilerleme.toplamYanlis;
  const basariYuzde = toplamCevap > 0 ? Math.round((ilerleme.toplamDogru / toplamCevap) * 100) : 0;

  const zayif = Object.values(ilerleme.sorular).filter(s => s.yanlis > 0).sort((a, b) => b.yanlis - a.yanlis).slice(0, 5)
    .map(s => ({ ...s, soruMetni: sorular.find(q => q.id === s.soruId)?.soru || s.soruId, kategori: sorular.find(q => q.id === s.soruId)?.kategori || '' }));

  const guclu = Object.values(ilerleme.sorular).filter(s => s.dogru >= 3 && s.yanlis === 0).sort((a, b) => b.dogru - a.dogru).slice(0, 3)
    .map(s => ({ ...s, soruMetni: sorular.find(q => q.id === s.soruId)?.soru || s.soruId }));

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.baslik}>📊 {tr.ilerleme}</Text>
        <View style={s.streakKart}>
          <Text style={s.streakEmoji}>🔥</Text>
          <View><Text style={s.streakSayi}>{ilerleme.streak}</Text><Text style={s.streakLabel}>{tr.gunlukSeri}</Text></View>
        </View>
        <View style={s.grid}>
          {[
            { sayi: ilerleme.toplamDogru, renk: '#4caf50', label: tr.dogru },
            { sayi: ilerleme.toplamYanlis, renk: '#e94560', label: tr.yanlis },
            { sayi: `%${basariYuzde}`, renk: '#4ecdc4', label: tr.basari },
            { sayi: Object.keys(ilerleme.sorular).length, renk: '#a78bfa', label: tr.soruGoruldu },
          ].map((item, i) => (
            <View key={i} style={s.istatKart}>
              <Text style={[s.istatSayi, { color: item.renk }]}>{item.sayi}</Text>
              <Text style={s.istatLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>{tr.genelBasari}</Text>
          <View style={s.progressBar}><View style={[s.progressFill, { width: `${basariYuzde}%` }]} /></View>
          <Text style={s.progressLabel}>%{basariYuzde} — {toplamCevap} soru</Text>
        </View>
        {zayif.length > 0 && (
          <View style={s.bolum}>
            <Text style={s.bolumBaslik}>{tr.zayifKonular}</Text>
            {zayif.map((item, i) => (
              <View key={i} style={s.konuKart}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 18 }}>{item.kategori === 'makam' ? '🕌' : '🎼'}</Text>
                  <Text style={s.konuMetin} numberOfLines={2}>{item.soruMetni}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#e94560', fontWeight: 'bold' }}>✗ {item.yanlis}</Text>
                  <Text style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ {item.dogru}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        {guclu.length > 0 && (
          <View style={s.bolum}>
            <Text style={s.bolumBaslik}>{tr.gucluKonular}</Text>
            {guclu.map((item, i) => (
              <View key={i} style={[s.konuKart, { borderLeftColor: '#4caf50' }]}>
                <Text style={s.konuMetin} numberOfLines={2}>{item.soruMetni}</Text>
                <Text style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ {item.dogru}</Text>
              </View>
            ))}
          </View>
        )}
        {toplamCevap === 0 && (
          <View style={{ backgroundColor: '#16213e', borderRadius: 16, padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🎯</Text>
            <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>{tr.hicSoruYok}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' }, ortala: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 }, baslik: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginTop: 20, marginBottom: 20 },
  streakKart: { backgroundColor: '#16213e', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#f5a623' },
  streakEmoji: { fontSize: 40 }, streakSayi: { fontSize: 36, fontWeight: 'bold', color: '#f5a623' }, streakLabel: { color: '#888', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  istatKart: { flex: 1, minWidth: '44%', backgroundColor: '#16213e', borderRadius: 12, padding: 16, alignItems: 'center' },
  istatSayi: { fontSize: 28, fontWeight: 'bold' }, istatLabel: { color: '#666', fontSize: 12, marginTop: 4 },
  bolum: { marginBottom: 24 }, bolumBaslik: { color: '#ccc', fontWeight: '600', fontSize: 16, marginBottom: 12 },
  progressBar: { height: 12, backgroundColor: '#0f3460', borderRadius: 6, marginBottom: 8, overflow: 'hidden' },
  progressFill: { height: 12, backgroundColor: '#4caf50', borderRadius: 6 }, progressLabel: { color: '#666', fontSize: 13 },
  konuKart: { backgroundColor: '#16213e', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: '#e94560' },
  konuMetin: { color: '#ccc', fontSize: 13, flex: 1 },
});