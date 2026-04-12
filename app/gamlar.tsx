import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, F, R } from '../constants/Design';
import { batıGamları } from '../src/data/batıgamları';

const TIP_RENK: Record<string, string> = { major: C.green, minor: C.red, mod: C.violet, pentatonik: C.amber };
const TIP_ISIM: Record<string, string> = { major: 'Majör', minor: 'Minör', mod: 'Mod', pentatonik: 'Pentatonik' };

export default function GamlarScreen() {
  const router = useRouter();
  const gruplar = ['major', 'minor', 'mod', 'pentatonik'];
  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>← Geri</Text></TouchableOpacity>
        <Text style={s.baslik}>Batı Gamları</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={s.liste} showsVerticalScrollIndicator={false}>
        {gruplar.map(grup => {
          const gamlar = batıGamları.filter(g => g.tip === grup);
          if (!gamlar.length) return null;
          return (
            <View key={grup}>
              <View style={s.grupBaslik}>
                <View style={[s.grupDot, { backgroundColor: TIP_RENK[grup] }]} />
                <Text style={[s.grupIsim, { color: TIP_RENK[grup] }]}>{TIP_ISIM[grup]}</Text>
              </View>
              {gamlar.map(g => (
                <TouchableOpacity key={g.id} style={[s.kart, { borderLeftColor: TIP_RENK[g.tip] }]}
                  activeOpacity={0.8} onPress={() => router.push({ pathname: '/gam-detay', params: { id: g.id } })}>
                  <View style={s.kartUst}>
                    <Text style={s.kartIsim}>{g.isim}</Text>
                    <Text style={s.zorluk}>{'⭐'.repeat(g.zorluk)}</Text>
                  </View>
                  <Text style={s.aciklama} numberOfLines={2}>{g.aciklama}</Text>
                  <View style={s.tonlar}>
                    {g.ornekTonlar.slice(0, 2).map((t, i) => (
                      <View key={i} style={[s.tonTag, { borderColor: TIP_RENK[g.tip] + '55' }]}>
                        <Text style={[s.tonText, { color: TIP_RENK[g.tip] }]}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
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
  liste: { padding: 16, paddingBottom: 48 },
  grupBaslik: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 8 },
  grupDot: { width: 8, height: 8, borderRadius: 4 },
  grupIsim: { fontSize: F.xs, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  kart: { backgroundColor: C.surface, borderRadius: R.xl, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3 },
  kartUst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  kartIsim: { color: C.textPrimary, fontWeight: '900', fontSize: F.lg },
  zorluk: { fontSize: F.sm },
  aciklama: { color: C.textMuted, fontSize: F.sm, lineHeight: 20, marginBottom: 10 },
  tonlar: { flexDirection: 'row', gap: 8 },
  tonTag: { borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, backgroundColor: C.surface2 },
  tonText: { fontSize: F.xs, fontWeight: '700' },
});
