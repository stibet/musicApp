import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, F, R } from '../constants/Design';
import { unifiedMakams } from '../src/data/makamCatalog';
import { loadPracticeSettings } from '../src/store/practiceSettings';
import { loadMakamProgress } from '../src/store/makamProgress';

export default function DebugLabScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);
  const [progress, setProgress] = useState<Record<string, any>>({});

  useFocusEffect(useCallback(() => {
    loadPracticeSettings().then(setSettings);
    loadMakamProgress().then((store) => setProgress(store.items));
  }, []));

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>← Geri</Text></TouchableOpacity>
          <Text style={s.title}>Debug Lab</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Pratik ayarları</Text>
          <Text style={s.line}>Tolerans: {settings?.toleranceMode ?? '—'} · ±{settings?.toleranceCent ?? 0} cent</Text>
          <Text style={s.line}>Tempo: {settings?.tempoMode ?? '—'} · {settings?.tempoMs ?? 0} ms</Text>
          <Text style={s.line}>Tekrar: {settings?.repeats ?? 1}</Text>
          <Text style={s.line}>Debug panel: {settings?.showDebugPanel ? 'Açık' : 'Kapalı'}</Text>
        </View>

        {unifiedMakams.map((makam) => {
          const p = progress[makam.id];
          return (
            <View key={makam.id} style={s.card}>
              <Text style={s.cardTitle}>{makam.title}</Text>
              <Text style={s.line}>{makam.karar} karar · {makam.guclu} güçlü {makam.yeden ? `· ${makam.yeden} yeden` : ''}</Text>
              <Text style={s.line}>Derece: {makam.degrees.length} · Seyir cümlesi: {makam.seyirCumleleri.length}</Text>
              <Text style={s.line}>Perdeler: {makam.perdeler.slice(0, 5).join(' · ')}</Text>
              <Text style={s.line}>Oturum: {p?.sessions ?? 0} · En iyi: %{p?.bestSuccessPct ?? 0} · Ort. koma: {p?.avgAbsKoma ?? 0}</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginTop: 16, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { color: C.textSecondary, fontSize: F.md, fontWeight: '700' },
  title: { color: C.textPrimary, fontSize: F.xl, fontWeight: '900' },
  card: { backgroundColor: C.surface, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12 },
  cardTitle: { color: C.gold, fontWeight: '800', fontSize: F.md, marginBottom: 8 },
  line: { color: C.textSecondary, fontSize: F.sm, marginBottom: 4 },
});
