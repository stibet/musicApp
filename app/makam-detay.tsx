import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { makamlar } from '../src/data/makamlar';
import { useDilStore } from '../src/store/dilStore';

const seyirRenk: Record<string, string> = { 'çıkıcı': '#4ecdc4', 'inici': '#e94560', 'inici-çıkıcı': '#f5a623' };

export default function MakamDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tr, dil } = useDilStore();
  const makam = makamlar.find(m => m.id === id);

  if (!makam) return <SafeAreaView style={s.container}><Text style={{ color: '#fff', padding: 20 }}>Bulunamadı.</Text></SafeAreaView>;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>{tr.geri}</Text></TouchableOpacity>
        <Text style={s.baslik}>{dil === 'en' ? makam.isimEn : makam.isim}</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.kimlikKart}>
          <View style={s.kimlikRow}>
            {[
              { label: tr.durak, val: makam.durak, renk: '#fff' },
              { label: tr.guclu, val: makam.guclu, renk: '#fff' },
              { label: tr.seyir, val: makam.seyir, renk: seyirRenk[makam.seyir] },
              { label: tr.zorluk, val: '⭐'.repeat(makam.zorluk), renk: '#fff' },
            ].map((item, i) => (
              <View key={i} style={s.kimlikItem}>
                <Text style={s.kimlikLabel}>{item.label}</Text>
                <Text style={[s.kimlikVal, { color: item.renk }]}>{item.val}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>{tr.hakkinda}</Text>
          <Text style={s.bolumIcerik}>{dil === 'en' ? makam.aciklamaEn : makam.aciklama}</Text>
        </View>

        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>{tr.perdeler}</Text>
          <View style={s.perdeler}>
            {makam.perdeler.map((p, i) => (
              <View key={i} style={[s.perdeBadge,
                i === 0 || i === makam.perdeler.length - 1 ? s.perdeDurak : p === makam.guclu ? s.perdeGuclu : s.perdeNormal]}>
                <Text style={s.perdeText}>{p}</Text>
                {(i === 0 || i === makam.perdeler.length - 1) && <Text style={s.perdeMeta}>{tr.durak.toLowerCase()}</Text>}
                {p === makam.guclu && i !== 0 && <Text style={s.perdeMeta}>{tr.guclu.toLowerCase()}</Text>}
              </View>
            ))}
          </View>
        </View>

        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>{tr.komaDizisi}</Text>
          <View style={s.komaSatir}>
            {makam.komaDizisi.map((k, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={s.komaItem}><Text style={s.komaVal}>{k}</Text><Text style={s.komaLabel}>koma</Text></View>
                {i < makam.komaDizisi.length - 1 && <Text style={s.komaOk}>→</Text>}
              </View>
            ))}
          </View>
          <Text style={s.komaNot}>Toplam: {makam.komaDizisi.reduce((a, b) => a + b, 0)} koma · {tr.oktav}</Text>
        </View>

        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>{tr.ornekEserler}</Text>
          {makam.ornekEserler.map((e, i) => (
            <View key={i} style={s.eserItem}><Text style={s.eserText}>♪ {e}</Text></View>
          ))}
        </View>

        <TouchableOpacity style={s.quizBtn} onPress={() => router.push({ pathname: '/quiz', params: { kategori: 'maqam' } })}>
          <Text style={s.quizBtnText}>{tr.buMakamSoruCoz}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#0f3460' },
  geri: { color: '#888', fontSize: 16, width: 50 }, baslik: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  content: { padding: 16 },
  kimlikKart: { backgroundColor: '#16213e', borderRadius: 14, padding: 16, marginBottom: 16 },
  kimlikRow: { flexDirection: 'row', justifyContent: 'space-around' },
  kimlikItem: { alignItems: 'center' }, kimlikLabel: { color: '#666', fontSize: 12, marginBottom: 4 },
  kimlikVal: { fontWeight: 'bold', fontSize: 15 },
  bolum: { marginBottom: 24 }, bolumBaslik: { color: '#ccc', fontWeight: '600', fontSize: 16, marginBottom: 12 },
  bolumIcerik: { color: '#aaa', fontSize: 15, lineHeight: 24 },
  perdeler: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  perdeBadge: { borderRadius: 10, padding: 10, alignItems: 'center', minWidth: 60, borderWidth: 1 },
  perdeDurak: { backgroundColor: '#e9456022', borderColor: '#e94560' },
  perdeGuclu: { backgroundColor: '#f5a62322', borderColor: '#f5a623' },
  perdeNormal: { backgroundColor: '#16213e', borderColor: '#0f3460' },
  perdeText: { color: '#fff', fontWeight: '600', fontSize: 13 }, perdeMeta: { color: '#888', fontSize: 10, marginTop: 2 },
  komaSatir: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  komaItem: { borderRadius: 10, padding: 8, alignItems: 'center', backgroundColor: '#e9456022', borderWidth: 1, borderColor: '#e9456066', minWidth: 48 },
  komaVal: { color: '#e94560', fontWeight: 'bold', fontSize: 16 }, komaLabel: { color: '#666', fontSize: 10 },
  komaOk: { color: '#444', fontSize: 14 }, komaNot: { color: '#666', fontSize: 12, marginTop: 10 },
  eserItem: { backgroundColor: '#16213e', borderRadius: 8, padding: 12, marginBottom: 8 },
  eserText: { color: '#ccc', fontSize: 15 },
  quizBtn: { backgroundColor: '#e94560', borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 32 },
  quizBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});