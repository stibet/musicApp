import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { makamlar } from '../src/data/makamlar';
import { useDilStore } from '../src/store/dilStore';

const seyirRenk: Record<string, string> = { 'çıkıcı': '#4ecdc4', 'inici': '#e94560', 'inici-çıkıcı': '#f5a623' };

export default function MakamlarScreen() {
  const router = useRouter();
  const { tr, dil } = useDilStore();

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>{tr.geri}</Text></TouchableOpacity>
        <Text style={s.baslik}>{tr.makamlar}</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={s.liste}>
        {makamlar.map(m => (
          <TouchableOpacity key={m.id} style={s.kart} onPress={() => router.push({ pathname: '/makam-detay', params: { id: m.id } })}>
            <View style={s.kartUst}>
              <Text style={s.kartIsim}>{dil === 'en' ? m.isimEn : m.isim}</Text>
              <View style={[s.seyirBadge, { backgroundColor: seyirRenk[m.seyir] + '22', borderColor: seyirRenk[m.seyir] }]}>
                <Text style={[s.seyirText, { color: seyirRenk[m.seyir] }]}>{m.seyir}</Text>
              </View>
            </View>
            <View style={s.kartAlt}>
              <Text style={s.infoText}>{tr.durak}: <Text style={s.infoVal}>{m.durak}</Text></Text>
              <Text style={s.infoText}>{tr.guclu}: <Text style={s.infoVal}>{m.guclu}</Text></Text>
              <Text style={s.infoText}>{'⭐'.repeat(m.zorluk)}</Text>
            </View>
            <Text style={s.aciklama} numberOfLines={2}>{dil === 'en' ? m.aciklamaEn : m.aciklama}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#0f3460' },
  geri: { color: '#888', fontSize: 16, width: 50 }, baslik: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  liste: { padding: 16 },
  kart: { backgroundColor: '#16213e', borderRadius: 14, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#0f3460' },
  kartUst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  kartIsim: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  seyirBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  seyirText: { fontSize: 12, fontWeight: '600' },
  kartAlt: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  infoText: { color: '#666', fontSize: 13 }, infoVal: { color: '#ccc', fontWeight: '600' },
  aciklama: { color: '#888', fontSize: 13, lineHeight: 20 },
});