import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, F, R } from '../constants/Design';
import { makamlar } from '../src/data/makamlar';

const SEYIR_RENK: Record<string, string> = { 'çıkıcı': C.green, 'inici': C.red, 'inici-çıkıcı': C.amber };
const ZORLUK_RENK = ['', C.green, C.amber, C.red];

export default function MakamlarScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>← Geri</Text></TouchableOpacity>
        <Text style={s.baslik}>Makam Ansiklopedisi</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={s.liste} showsVerticalScrollIndicator={false}>
        <Text style={s.altBaslik}>{makamlar.length} makam · Koma dizileri ve örnek eserler</Text>
        {makamlar.map(m => (
          <TouchableOpacity key={m.id} style={s.kart} activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/makam-detay', params: { id: m.id } })}>
            <View style={s.kartUst}>
              <Text style={s.kartIsim}>{m.isim}</Text>
              <View style={[s.badge, { backgroundColor: SEYIR_RENK[m.seyir] + '22', borderColor: SEYIR_RENK[m.seyir] + '66' }]}>
                <Text style={[s.badgeText, { color: SEYIR_RENK[m.seyir] }]}>{m.seyir}</Text>
              </View>
            </View>
            <View style={s.kartOrta}>
              <Text style={s.infoText}>Durak: <Text style={{ color: C.textPrimary }}>{m.durak}</Text></Text>
              <Text style={s.infoText}>Güçlü: <Text style={{ color: C.textPrimary }}>{m.guclu}</Text></Text>
              <View style={[s.zorlukDot, { backgroundColor: ZORLUK_RENK[m.zorluk] }]} />
            </View>
            <Text style={s.aciklama} numberOfLines={2}>{m.aciklama}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: C.border },
  geri: { color: C.textSecondary, fontSize: F.md, fontWeight: '600', width: 60 },
  baslik: { color: C.textPrimary, fontWeight: '900', fontSize: F.lg },
  liste: { padding: 16, paddingBottom: 48 },
  altBaslik: { color: C.textMuted, fontSize: F.xs, marginBottom: 16 },
  kart: { backgroundColor: C.surface, borderRadius: R.xl, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  kartUst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  kartIsim: { color: C.textPrimary, fontWeight: '900', fontSize: F.xl },
  badge: { borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  badgeText: { fontSize: F.xs, fontWeight: '700' },
  kartOrta: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 8 },
  infoText: { color: C.textMuted, fontSize: F.sm },
  zorlukDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 'auto' },
  aciklama: { color: C.textMuted, fontSize: F.sm, lineHeight: 20 },
});
