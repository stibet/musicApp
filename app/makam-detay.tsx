import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, F, R } from '../constants/Design';
import { makamlar } from '../src/data/makamlar';

const SEYIR_RENK: Record<string, string> = { 'çıkıcı': C.green, 'inici': C.red, 'inici-çıkıcı': C.amber };

export default function MakamDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const makam = makamlar.find(m => m.id === id);
  if (!makam) return <SafeAreaView style={s.container}><Text style={{ color: C.textPrimary, padding: 20 }}>Bulunamadı.</Text></SafeAreaView>;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>← Geri</Text></TouchableOpacity>
        <Text style={s.baslik}>{makam.isim}</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Kimlik */}
        <View style={s.kimlikKart}>
          <View style={s.kimlikGlow} />
          {[
            { label: 'Durak', val: makam.durak, renk: C.gold },
            { label: 'Güçlü', val: makam.guclu, renk: C.amber },
            { label: 'Seyir', val: makam.seyir, renk: SEYIR_RENK[makam.seyir] },
          ].map((item, i) => (
            <View key={i} style={s.kimlikItem}>
              <Text style={s.kimlikLabel}>{item.label}</Text>
              <Text style={[s.kimlikVal, { color: item.renk }]}>{item.val}</Text>
            </View>
          ))}
        </View>

        {/* Açıklama */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>Hakkında</Text>
          <Text style={s.bolumIcerik}>{makam.aciklama}</Text>
        </View>

        {/* Perdeler */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>Perdeler</Text>
          <View style={s.perdeler}>
            {makam.perdeler.map((p, i) => {
              const isDurak = i === 0 || i === makam.perdeler.length - 1;
              const isGuclu = p === makam.guclu && i !== 0;
              return (
                <View key={i} style={[s.perde, isDurak && { borderColor: C.gold, backgroundColor: C.goldGlow }, isGuclu && { borderColor: C.amber, backgroundColor: C.amber + '11' }]}>
                  <Text style={[s.perdeText, isDurak && { color: C.gold }, isGuclu && { color: C.amber }]}>{p}</Text>
                  {isDurak && <Text style={[s.perdeMeta, { color: C.gold }]}>durak</Text>}
                  {isGuclu && <Text style={[s.perdeMeta, { color: C.amber }]}>güçlü</Text>}
                </View>
              );
            })}
          </View>
        </View>

        {/* Koma dizisi */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>Koma Dizisi</Text>
          <View style={s.komaSatir}>
            {makam.komaDizisi.map((k, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={s.komaItem}>
                  <Text style={s.komaVal}>{k}</Text>
                  <Text style={s.komaLabel}>koma</Text>
                </View>
                {i < makam.komaDizisi.length - 1 && <Text style={{ color: C.textMuted }}>›</Text>}
              </View>
            ))}
          </View>
          <Text style={s.komaNot}>Toplam: {makam.komaDizisi.reduce((a, b) => a + b, 0)} · 1 oktav = 53 koma</Text>
        </View>

        {/* Örnek eserler */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>Örnek Eserler</Text>
          {makam.ornekEserler.map((e, i) => (
            <View key={i} style={s.eser}>
              <View style={s.eserDot} />
              <Text style={s.eserText}>{e}</Text>
            </View>
          ))}
        </View>

        {/* Aksiyonlar */}
        <View style={s.butonRow}>
          <TouchableOpacity style={s.btnAna} activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/makam-kocu', params: { id: makam.id } })}>
            <Text style={s.btnAnaText}>Makam Koçuna Git →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnIkincil} activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/quiz', params: { kategori: 'maqam' } })}>
            <Text style={s.btnIkincilText}>Quiz Çöz</Text>
          </TouchableOpacity>
        </View>

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
  kimlikKart: { backgroundColor: C.surface, borderRadius: R.xl, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: C.border, flexDirection: 'row', justifyContent: 'space-around', overflow: 'hidden', position: 'relative' },
  kimlikGlow: { position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: C.goldGlow },
  kimlikItem: { alignItems: 'center' },
  kimlikLabel: { color: C.textMuted, fontSize: F.xs, marginBottom: 4 },
  kimlikVal: { fontWeight: '900', fontSize: F.lg },
  bolum: { marginBottom: 24 },
  bolumBaslik: { color: C.textMuted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  bolumIcerik: { color: C.textSecondary, fontSize: F.md, lineHeight: 24 },
  perdeler: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  perde: { borderRadius: R.md, padding: 10, alignItems: 'center', minWidth: 56, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  perdeText: { color: C.textSecondary, fontWeight: '700', fontSize: F.sm },
  perdeMeta: { fontSize: F.xs - 1, marginTop: 2 },
  komaSatir: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, alignItems: 'center' },
  komaItem: { backgroundColor: C.surface, borderRadius: R.sm, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: C.border, minWidth: 44 },
  komaVal: { color: C.gold, fontWeight: '900', fontSize: F.lg },
  komaLabel: { color: C.textMuted, fontSize: F.xs - 1 },
  komaNot: { color: C.textMuted, fontSize: F.xs, marginTop: 10 },
  eser: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: R.md, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: C.border },
  eserDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.gold },
  eserText: { color: C.textSecondary, fontSize: F.md },
  butonRow: { gap: 10, marginTop: 8 },
  btnAna: { backgroundColor: C.gold, borderRadius: R.lg, padding: 18, alignItems: 'center' },
  btnAnaText: { color: C.bg, fontWeight: '900', fontSize: F.md },
  btnIkincil: { backgroundColor: C.surface, borderRadius: R.lg, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  btnIkincilText: { color: C.textSecondary, fontWeight: '700', fontSize: F.md },
});
