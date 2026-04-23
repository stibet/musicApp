import { Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, F, R } from '../constants/Design';
import { batıGamları, TIP_RENK, TIP_ISIM, gamBul } from '../src/data/westernScales';
import { solAnahtariHTML, gamMidiListesi } from '../components/SolAnahtari';

const NOTALAR_TR = ['Do','Do♯','Re','Re♯','Mi','Fa','Fa♯','Sol','Sol♯','La','La♯','Si'];

function gamHesapla(yariSesler: number[]): string[] {
  const sonuc = ['Do']; let poz = 0;
  for (const adim of yariSesler) { poz = (poz + adim) % 12; sonuc.push(NOTALAR_TR[poz]); }
  return sonuc;
}

export default function GamDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const gam = gamBul(id);
  if (!gam) return (
    <SafeAreaView style={s.container}>
      <Text style={{ color: C.textPrimary, padding: 20 }}>Bulunamadı.</Text>
    </SafeAreaView>
  );

  const renk = TIP_RENK[gam.tip] ?? C.gold;
  const notaDizisi = gamHesapla(gam.yariSesler);
  const { notalar, perdeAdlari } = gamMidiListesi(gam.yariSesler);
  const svgHtml = Platform.OS === 'web' ? solAnahtariHTML(notalar, perdeAdlari) : null;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>← Geri</Text></TouchableOpacity>
        <Text style={s.baslik}>{gam.isim}</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Kimlik kartı */}
        <View style={[s.kimlikKart, { borderTopColor: renk }]}>
          {[
            { label: 'Tür',       val: TIP_ISIM[gam.tip] ?? gam.tip, renk },
            { label: 'Ses Sayısı',val: `${notaDizisi.length} ses`,    renk: C.textPrimary },
            { label: 'Zorluk',    val: '⭐'.repeat(gam.zorluk),       renk: C.textPrimary },
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

        {/* Karakteristik aralık */}
        <View style={[s.karakterKart, { borderLeftColor: renk }]}>
          <Text style={s.karakterLabel}>Karakteristik Aralık</Text>
          <Text style={[s.karakterVal, { color: renk }]}>{gam.karakteristikAralik}</Text>
        </View>

        {/* Derece formülü */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>Derece Formülü</Text>
          <View style={s.formulKart}>
            <Text style={[s.formulText, { color: renk }]}>{gam.dereceFormuller}</Text>
          </View>
        </View>

        {/* Sol anahtarı görünümü */}
        {svgHtml && (
          <View style={s.bolum}>
            <Text style={s.bolumBaslik}>Sol Anahtarı (Do üzerinden)</Text>
            <View style={s.staffKart}>
              <div dangerouslySetInnerHTML={{ __html: svgHtml }} />
            </View>
          </View>
        )}

        {/* Nota dizisi */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>Nota Dizisi</Text>
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
                  <Text style={s.adimLabel}>{a === 1 ? 'yarım' : a === 2 ? 'tam' : `${a/2}T`}</Text>
                </View>
                {i < gam.yariSesler.length - 1 && <Text style={{ color: C.textMuted, fontSize: 12 }}>›</Text>}
              </View>
            ))}
          </View>
        </View>

        {/* Karakter */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>Karakter</Text>
          <View style={s.taglar}>
            {gam.karakter.map((k, i) => (
              <View key={i} style={[s.tag, { borderColor: renk + '55', backgroundColor: renk + '11' }]}>
                <Text style={[s.tagText, { color: renk }]}>{k}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Kullanım alanları */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>Kullanım Alanları</Text>
          <View style={s.taglar}>
            {gam.kullanimAlanlari.map((k, i) => (
              <View key={i} style={s.tagGri}>
                <Text style={s.tagGriText}>{k}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Örnek tonlar */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>Örnek Tonlar</Text>
          <View style={s.taglar}>
            {gam.ornekTonlar.map((t, i) => (
              <View key={i} style={[s.tag, { borderColor: renk + '44', backgroundColor: renk + '11' }]}>
                <Text style={[s.tagText, { color: renk }]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Örnek eserler */}
        {gam.ornekEserler.length > 0 && (
          <View style={s.bolum}>
            <Text style={s.bolumBaslik}>Örnek Eserler</Text>
            {gam.ornekEserler.map((e, i) => (
              <View key={i} style={s.eserSatir}>
                <Text style={{ color: renk, fontSize: 16, marginRight: 8 }}>♪</Text>
                <Text style={s.eserText}>{e}</Text>
              </View>
            ))}
          </View>
        )}

        {/* İlgili gamlar */}
        {gam.ilgiliGamlar.length > 0 && (
          <View style={s.bolum}>
            <Text style={s.bolumBaslik}>İlgili Gamlar</Text>
            <View style={s.taglar}>
              {gam.ilgiliGamlar.map((gid, i) => {
                const ig = gamBul(gid);
                if (!ig) return null;
                return (
                  <TouchableOpacity key={i} style={[s.tag, { borderColor: TIP_RENK[ig.tip] + '55' }]}
                    onPress={() => router.push({ pathname: '/gam-detay', params: { id: gid } })}>
                    <Text style={[s.tagText, { color: TIP_RENK[ig.tip] }]}>{ig.isim} →</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: C.border },
  geri:         { color: C.textSecondary, fontSize: F.md, fontWeight: '600', width: 60 },
  baslik:       { color: C.textPrimary, fontWeight: '900', fontSize: F.lg },
  content:      { padding: 20, paddingBottom: 48 },
  kimlikKart:   { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: C.surface, borderRadius: R.lg, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.border, borderTopWidth: 3 },
  kimlikItem:   { alignItems: 'center' },
  kimlikLabel:  { color: C.textMuted, fontSize: F.xs, marginBottom: 6 },
  kimlikVal:    { fontWeight: '900', fontSize: F.lg },
  bolum:        { marginBottom: 20 },
  bolumBaslik:  { color: C.textMuted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  bolumIcerik:  { color: C.textSecondary, fontSize: F.sm, lineHeight: 22 },
  karakterKart: { backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4 },
  karakterLabel:{ color: C.textMuted, fontSize: F.xs, marginBottom: 6 },
  karakterVal:  { fontSize: F.sm, fontWeight: '700', lineHeight: 20 },
  formulKart:   { backgroundColor: C.surface2, borderRadius: R.md, padding: 14, alignItems: 'center' },
  formulText:   { fontWeight: '900', fontSize: F.lg, letterSpacing: 2 },
  staffKart:    { backgroundColor: C.surface, borderRadius: R.lg, padding: 12, borderWidth: 1, borderColor: C.border, alignItems: 'center', overflow: 'hidden' },
  notalar:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  nota:         { width: 44, height: 52, backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', gap: 4 },
  notaText:     { color: C.textSecondary, fontWeight: '700', fontSize: F.sm },
  notaIdx:      { color: C.textMuted, fontSize: F.xs - 1 },
  adimlar:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  adim:         { width: 50, height: 50, borderRadius: R.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  adimVal:      { fontWeight: '900', fontSize: F.lg },
  adimLabel:    { color: C.textMuted, fontSize: F.xs - 1 },
  taglar:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:          { paddingHorizontal: 12, paddingVertical: 6, borderRadius: R.full, borderWidth: 1 },
  tagText:      { fontWeight: '700', fontSize: F.xs },
  tagGri:       { paddingHorizontal: 12, paddingVertical: 6, borderRadius: R.full, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  tagGriText:   { color: C.textSecondary, fontSize: F.xs, fontWeight: '600' },
  eserSatir:    { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  eserText:     { color: C.textSecondary, fontSize: F.sm },
});
