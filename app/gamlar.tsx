import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { batıGamları } from '../src/data/batıgamları';
import { useDilStore } from '../src/store/dilStore';

const tipRenk: Record<string, string> = { major: '#4ecdc4', minor: '#e94560', mod: '#a78bfa', pentatonik: '#f5a623' };
const tipIsimTR: Record<string, string> = { major: 'Majör', minor: 'Minör', mod: 'Mod', pentatonik: 'Pentatonik' };
const tipIsimEN: Record<string, string> = { major: 'Major', minor: 'Minor', mod: 'Mode', pentatonik: 'Pentatonic' };

export default function GamlarScreen() {
  const router = useRouter();
  const { tr, dil } = useDilStore();
  const gruplar = ['major', 'minor', 'mod', 'pentatonik'];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>{tr.geri}</Text></TouchableOpacity>
        <Text style={s.baslik}>{tr.gamlarVeModlar}</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={s.liste}>
        {gruplar.map(grup => {
          const gamlar = batıGamları.filter(g => g.tip === grup);
          if (!gamlar.length) return null;
          return (
            <View key={grup}>
              <Text style={[s.grupBaslik, { color: tipRenk[grup] }]}>{dil === 'en' ? tipIsimEN[grup] : tipIsimTR[grup]}</Text>
              {gamlar.map(g => (
                <TouchableOpacity key={g.id} style={[s.kart, { borderLeftColor: tipRenk[g.tip] }]}
                  onPress={() => router.push({ pathname: '/gam-detay', params: { id: g.id } })}>
                  <View style={s.kartUst}>
                    <Text style={s.kartIsim}>{dil === 'en' ? g.isimEn : g.isim}</Text>
                    <Text style={s.zorluk}>{'⭐'.repeat(g.zorluk)}</Text>
                  </View>
                  <Text style={s.aciklama} numberOfLines={2}>{dil === 'en' ? g.aciklamaEn : g.aciklama}</Text>
                  <View style={s.orneklar}>
                    {g.ornekTonlar.slice(0, 2).map((t, i) => (
                      <View key={i} style={[s.tonBadge, { borderColor: tipRenk[g.tip] + '88' }]}>
                        <Text style={[s.tonText, { color: tipRenk[g.tip] }]}>{t}</Text>
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
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#0f3460' },
  geri: { color: '#888', fontSize: 16, width: 50 }, baslik: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  liste: { padding: 16 }, grupBaslik: { fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 10, marginTop: 8 },
  kart: { backgroundColor: '#16213e', borderRadius: 14, padding: 18, marginBottom: 12, borderLeftWidth: 4 },
  kartUst: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  kartIsim: { fontSize: 18, fontWeight: 'bold', color: '#fff' }, zorluk: { fontSize: 13 },
  aciklama: { color: '#888', fontSize: 13, lineHeight: 20, marginBottom: 10 },
  orneklar: { flexDirection: 'row', gap: 8 },
  tonBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, backgroundColor: '#ffffff08' },
  tonText: { fontSize: 12, fontWeight: '600' },
});