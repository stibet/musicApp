import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, F, R } from '../constants/Design';
import { batıGamları } from '../src/data/batıgamları';

const TIP_RENK: Record<string, string> = { major: C.green, minor: C.red, mod: C.violet, pentatonik: C.amber };
const NOTALAR = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];

function gamHesapla(yariSesler: number[]): string[] {
  const sonuc = ['Do']; let poz = 0;
  for (const adim of yariSesler) { poz = (poz + adim) % 12; sonuc.push(NOTALAR[poz]); }
  return sonuc;
}

export default function GamDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const gam = batıGamları.find(g => g.id === id);
  if (!gam) return <SafeAreaView style={s.container}><Text style={{ color: C.textPrimary, padding: 20 }}>Bulunamadı.</Text></SafeAreaView>;

  const renk = TIP_RENK[gam.tip];
  const notaDizisi = gamHesapla(gam.yariSesler);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>← Geri</Text></TouchableOpacity>
        <Text style={s.baslik}>{gam.isim}</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Kimlik */}
        <View style={[s.kimlikKart, { borderColor: renk + '44' }]}>
          <View style={[s.kimlikGlow, { backgroundColor: renk + '11' }]} />
          {[
            { label: 'Tür', val: gam.tip, renk },
            { label: 'Ses Sayısı', val: `${gam.yariSesler.length}`, renk: C.textPrimary },
            { label: 'Zorluk', val: '⭐'.repeat(gam.zorluk), renk: C.textPrimary },
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
          <Text style={s.bolumIcerik}>{gam.aciklama}</Text>
        </View>

        {/* Nota dizisi */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>Nota Dizisi (Do üzerinden)</Text>
          <View style={s.notalar}>
            {notaDizisi.map((n, i) => {
              const isFirst = i === 0; const isLast = i === notaDizisi.length - 1;
              return (
                <View key={i} style={[s.nota, (isFirst || isLast) && { borderColor: renk, backgroundColor: renk + '22' }]}>
                  <Text style={[s.notaText, (isFirst || isLast) && { color: renk, fontWeight: '900' }]}>{n}</Text>
                  <Text style={s.notaIdx}>{i + 1}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Adım yapısı */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>Adım Yapısı (yarım ses)</Text>
          <View style={s.adimlar}>
            {gam.yariSesler.map((a, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={[s.adim, { backgroundColor: renk + '22', borderColor: renk + '55' }]}>
                  <Text style={[s.adimVal, { color: renk }]}>{a}</Text>
                  <Text style={s.adimLabel}>{a === 1 ? 'yarım' : a === 2 ? 'tam' : '1½'}</Text>
                </View>
                {i < gam.yariSesler.length - 1 && <Text style={{ color: C.textMuted, fontSize: 12 }}>›</Text>}
              </View>
            ))}
          </View>
        </View>

        {/* Örnek tonlar */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>Örnek Tonlar</Text>
          <View style={s.tonlar}>
            {gam.ornekTonlar.map((t, i) => (
              <View key={i} style={[s.tonTag, { borderColor: renk + '55' }]}>
                <Text style={[s.tonText, { color: renk }]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[s.btn, { backgroundColor: renk }]} activeOpacity={0.85}
          onPress={() => router.push({ pathname: '/quiz', params: { kategori: 'bati' } })}>
          <Text style={s.btnText}>Bu Konudan Quiz Çöz →</Text>
        </TouchableOpacity>

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
  kimlikKart: { backgroundColor: C.surface, borderRadius: R.xl, padding: 20, marginBottom: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-around', overflow: 'hidden', position: 'relative' },
  kimlikGlow: { position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40 },
  kimlikItem: { alignItems: 'center' },
  kimlikLabel: { color: C.textMuted, fontSize: F.xs, marginBottom: 4 },
  kimlikVal: { fontWeight: '900', fontSize: F.lg },
  bolum: { marginBottom: 24 },
  bolumBaslik: { color: C.textMuted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  bolumIcerik: { color: C.textSecondary, fontSize: F.md, lineHeight: 24 },
  notalar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  nota: { borderRadius: R.md, padding: 10, alignItems: 'center', minWidth: 48, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  notaText: { color: C.textSecondary, fontWeight: '700', fontSize: F.sm },
  notaIdx: { color: C.textMuted, fontSize: F.xs - 1, marginTop: 2 },
  adimlar: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  adim: { borderRadius: R.md, padding: 10, alignItems: 'center', borderWidth: 1, minWidth: 52 },
  adimVal: { fontWeight: '900', fontSize: F.lg },
  adimLabel: { color: C.textMuted, fontSize: F.xs - 1 },
  tonlar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tonTag: { borderRadius: R.full, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, backgroundColor: C.surface },
  tonText: { fontSize: F.sm, fontWeight: '700' },
  btn: { borderRadius: R.lg, padding: 18, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  btnText: { color: C.bg, fontWeight: '900', fontSize: F.md },
});
