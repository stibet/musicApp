import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, F, R } from '../constants/Design';
import { enstrumanlar } from '../src/instruments/engine';

const KATEGORI_RENK: Record<string, string> = { klavye: C.teal, tel: C.amber, vurma: C.red, nefes: C.green };
const KATEGORI_ISIM: Record<string, string> = { klavye: 'Klavye', tel: 'Telli', vurma: 'Vurmalı', nefes: 'Nefesli' };

export default function EnstrumanlarScreen() {
  const router = useRouter();
  const gruplar = ['klavye', 'tel', 'vurma', 'nefes'];
  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>← Geri</Text></TouchableOpacity>
        <Text style={s.baslik}>Enstrümanlar</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.aciklama}>Bir enstrüman seç, makam rehberiyle birlikte çal</Text>
        {gruplar.map(grup => {
          const liste = enstrumanlar.filter(e => e.kategori === grup);
          if (!liste.length) return null;
          return (
            <View key={grup}>
              <View style={s.grupBaslik}>
                <View style={[s.grupDot, { backgroundColor: KATEGORI_RENK[grup] }]} />
                <Text style={[s.grupIsim, { color: KATEGORI_RENK[grup] }]}>{KATEGORI_ISIM[grup]}</Text>
              </View>
              <View style={s.grid}>
                {liste.map(e => (
                  <TouchableOpacity key={e.id} style={[s.kart, { borderColor: e.renk + '44' }]}
                    activeOpacity={0.8} onPress={() => router.push({ pathname: '/enstruman-cal', params: { id: e.id } })}>
                    <Text style={s.emoji}>{e.emoji}</Text>
                    <Text style={[s.kartIsim, { color: e.renk }]}>{e.isim}</Text>
                    <Text style={s.kartAlt}>{e.aciklama}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: C.border },
  geri: { color: C.textSecondary, fontSize: F.md, fontWeight: '600', width: 60 },
  baslik: { color: C.textPrimary, fontWeight: '900', fontSize: F.lg },
  content: { padding: 16, paddingBottom: 48 },
  aciklama: { color: C.textMuted, fontSize: F.sm, marginBottom: 20 },
  grupBaslik: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 8 },
  grupDot: { width: 8, height: 8, borderRadius: 4 },
  grupIsim: { fontSize: F.xs, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  kart: { width: '47.5%', backgroundColor: C.surface, borderRadius: R.xl, padding: 16, alignItems: 'center', borderWidth: 1 },
  emoji: { fontSize: 36, marginBottom: 10 },
  kartIsim: { fontWeight: '800', fontSize: F.md, marginBottom: 4 },
  kartAlt: { color: C.textMuted, fontSize: F.xs, textAlign: 'center' },
});
