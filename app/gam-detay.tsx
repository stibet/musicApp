import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { batıGamları } from '../src/data/batıgamları';
import { useDilStore } from '../src/store/dilStore';

const tipRenk: Record<string, string> = { major: '#4ecdc4', minor: '#e94560', mod: '#a78bfa', pentatonik: '#f5a623' };
const NOTALAR = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];

function gamHesapla(yariSesler: number[]): string[] {
  const sonuc = ['Do']; let poz = 0;
  for (const adim of yariSesler) { poz = (poz + adim) % 12; sonuc.push(NOTALAR[poz]); }
  return sonuc;
}

function Klavye({ aktifNotalar, renk }: { aktifNotalar: string[]; renk: string }) {
  const beyaz = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
  const siyah: Record<string, string> = { Do: 'Do♯', Re: 'Re♯', Fa: 'Fa♯', Sol: 'Sol♯', La: 'La♯' };
  return (
    <View style={ks.container}>
      {beyaz.map((nota, i) => {
        const aktif = aktifNotalar.includes(nota);
        const siyahNota = siyah[nota];
        const siyahAktif = siyahNota && aktifNotalar.includes(siyahNota);
        return (
          <View key={i} style={ks.tusWrapper}>
            <View style={[ks.beyazTus, aktif && { backgroundColor: renk + 'aa', borderColor: renk }]}>
              <Text style={[ks.beyazTusText, aktif && { color: '#fff', fontWeight: 'bold' }]}>{aktif ? nota : ''}</Text>
            </View>
            {siyahNota && (
              <View style={[ks.siyahTus, siyahAktif && { backgroundColor: renk }]}>
                {siyahAktif && <Text style={ks.siyahTusText}>♯</Text>}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

export default function GamDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tr, dil } = useDilStore();
  const gam = batıGamları.find(g => g.id === id);
  if (!gam) return <SafeAreaView style={s.container}><Text style={{ color: '#fff', padding: 20 }}>Bulunamadı.</Text></SafeAreaView>;

  const renk = tipRenk[gam.tip];
  const notaDizisi = gamHesapla(gam.yariSesler);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>{tr.geri}</Text></TouchableOpacity>
        <Text style={s.baslik}>{dil === 'en' ? gam.isimEn : gam.isim}</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.kimlikKart}>
          <View style={s.kimlikRow}>
            {[
              { label: tr.tur, val: gam.tip, renk },
              { label: tr.sesSayisi, val: String(gam.yariSesler.length), renk: '#fff' },
              { label: tr.zorluk, val: '⭐'.repeat(gam.zorluk), renk: '#fff' },
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
          <Text style={s.bolumIcerik}>{dil === 'en' ? gam.aciklamaEn : gam.aciklama}</Text>
        </View>

        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>{tr.notaDizisi}</Text>
          <View style={s.notalar}>
            {notaDizisi.map((n, i) => (
              <View key={i} style={[s.notaBadge, (i === 0 || i === notaDizisi.length - 1)
                ? { backgroundColor: renk + '33', borderColor: renk } : { backgroundColor: '#16213e', borderColor: '#0f3460' }]}>
                <Text style={[s.notaText, (i === 0 || i === notaDizisi.length - 1) && { color: renk, fontWeight: 'bold' }]}>{n}</Text>
                <Text style={s.notaIndex}>{i + 1}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>{tr.klavyeGosterimi}</Text>
          <Klavye aktifNotalar={notaDizisi} renk={renk} />
        </View>

        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>{tr.adimYapisi}</Text>
          <View style={s.adimlar}>
            {gam.yariSesler.map((a, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={[s.adimKutu, { backgroundColor: renk + '22', borderColor: renk + '66' }]}>
                  <Text style={[s.adimVal, { color: renk }]}>{a}</Text>
                  <Text style={s.adimLabel}>{a === 1 ? tr.yarimSes : a === 2 ? tr.tamSes : '1½'}</Text>
                </View>
                {i < gam.yariSesler.length - 1 && <Text style={s.adimOk}>→</Text>}
              </View>
            ))}
          </View>
        </View>

        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>{tr.ornekTonlar}</Text>
          <View style={s.tonlar}>
            {gam.ornekTonlar.map((t, i) => (
              <View key={i} style={[s.tonBadge, { borderColor: renk }]}>
                <Text style={[s.tonText, { color: renk }]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[s.quizBtn, { backgroundColor: renk }]}
          onPress={() => router.push({ pathname: '/quiz', params: { kategori: 'western' } })}>
          <Text style={s.quizBtnText}>{tr.buKonudanSoruCoz}</Text>
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
  notalar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  notaBadge: { borderRadius: 10, padding: 10, alignItems: 'center', minWidth: 52, borderWidth: 1 },
  notaText: { color: '#fff', fontWeight: '600', fontSize: 13 }, notaIndex: { color: '#666', fontSize: 10, marginTop: 2 },
  adimlar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  adimKutu: { borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, minWidth: 52 },
  adimVal: { fontWeight: 'bold', fontSize: 18 }, adimLabel: { color: '#666', fontSize: 10, marginTop: 2 },
  adimOk: { color: '#444', fontSize: 14 },
  tonlar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tonBadge: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, backgroundColor: '#ffffff08' },
  tonText: { fontSize: 14, fontWeight: '600' },
  quizBtn: { borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 32 },
  quizBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

const ks = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: '#0f3460', borderRadius: 12, padding: 12, justifyContent: 'center' },
  tusWrapper: { alignItems: 'center', position: 'relative', marginHorizontal: 2 },
  beyazTus: { width: 38, height: 100, backgroundColor: '#e8e8e8', borderRadius: 6, borderWidth: 1, borderColor: '#ccc', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 6 },
  beyazTusText: { fontSize: 9, color: '#444' },
  siyahTus: { position: 'absolute', top: 0, width: 24, height: 60, backgroundColor: '#222', borderRadius: 4, zIndex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 4, marginLeft: 14 },
  siyahTusText: { color: '#fff', fontSize: 9 },
});