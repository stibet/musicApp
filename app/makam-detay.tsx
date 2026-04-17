import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, F, R } from '../constants/Design';
import { makamlar } from '../src/data/makamlar';
import { yedenler } from '../src/makam/centTables';
import { seyirKaliplari, seyirYonAciklama } from '../src/makam/seyirPatterns';
import { makamVideolari, MakamVideo, seviyeLabel, seviyeRenk } from '../src/data/videolar';

const SEYIR_RENK: Record<string, string> = { 'çıkıcı': C.green, 'inici': C.red, 'inici-çıkıcı': C.amber };

function komaAcikla(koma: number): { isim: string; renk: string } {
  const map: Record<number, { isim: string; renk: string }> = {
    4:  { isim: 'Bakiye (~91 cent)', renk: '#60a5fa' },
    5:  { isim: 'Küçük mücennep (~113 cent)', renk: '#a78bfa' },
    8:  { isim: 'Büyük mücennep (~181 cent)', renk: '#34d399' },
    9:  { isim: 'Tanini — tam ses (~204 cent)', renk: C.gold },
    12: { isim: 'Artık ikili küçük (~272 cent)', renk: '#f87171' },
    13: { isim: 'Artık ikili — Hicaz karakteri (~295 cent)', renk: '#ef4444' },
    14: { isim: 'Büyük artık ikili (~317 cent)', renk: '#dc2626' },
  };
  return map[koma] ?? { isim: `${koma} koma`, renk: C.textMuted };
}

function komaToCent(koma: number): string {
  return `≈${Math.round(koma * (1200 / 53))} cent`;
}

function VideoKart({ video }: { video: MakamVideo }) {
  const renk = seviyeRenk[video.seviye] || C.gold;
  const label = seviyeLabel[video.seviye as keyof typeof seviyeLabel]?.tr || video.seviye;

  function ac() {
    const url = `https://www.youtube.com/watch?v=${video.youtubeId}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://youtu.be/${video.youtubeId}`);
    });
  }

  return (
    <TouchableOpacity style={s.videoKart} activeOpacity={0.8} onPress={ac}>
      <View style={[s.videoIkon, { backgroundColor: renk + '22' }]}>
        <Text style={s.videoIkonText}>▶</Text>
      </View>
      <View style={s.videoIcerik}>
        <Text style={s.videoBaslik} numberOfLines={2}>{video.baslik}</Text>
        <View style={s.videoTagRow}>
          <View style={[s.videoSeviye, { backgroundColor: renk + '22', borderColor: renk + '66' }]}>
            <Text style={[s.videoSeviyeText, { color: renk }]}>{label}</Text>
          </View>
          <Text style={s.videoMeta}>{video.enstruman} · {video.sure}</Text>
        </View>
      </View>
      <Text style={s.videoOk}>›</Text>
    </TouchableOpacity>
  );
}

export default function MakamDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const makam = makamlar.find(m => m.id === id);
  if (!makam) return (
    <SafeAreaView style={s.container}>
      <Text style={{ color: C.textPrimary, padding: 20 }}>Bulunamadı.</Text>
    </SafeAreaView>
  );

  const videolar = makamVideolari[makam.id] || [];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.geri}>← Geri</Text>
        </TouchableOpacity>
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

        {/* Perde dizisi + koma aralıkları */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>Perde Dizisi ve Koma Aralıkları</Text>
          <Text style={s.bolumAlt}>1 oktav = 53 koma · 1 koma ≈ 22.6 cent</Text>

          <View style={s.diziBand}>
            {makam.perdeler.map((perde, i) => {
              const isDurak = i === 0 || i === makam.perdeler.length - 1;
              const isGuclu = perde === makam.guclu && !isDurak;
              const komaAraligi = makam.komaDizisi[i];
              const { isim: komaIsim, renk: komaRenk } = komaAraligi ? komaAcikla(komaAraligi) : { isim: '', renk: '' };

              return (
                <View key={i} style={s.perdeBlok}>
                  <View style={[
                    s.perdeKutu,
                    isDurak && { borderColor: C.gold, backgroundColor: C.goldGlow },
                    isGuclu && { borderColor: C.amber, backgroundColor: C.amber + '18' },
                  ]}>
                    <Text style={[s.perdeAd, isDurak && { color: C.gold }, isGuclu && { color: C.amber }]}>
                      {perde}
                    </Text>
                    {isDurak && <Text style={[s.perdeRol, { color: C.gold }]}>durak</Text>}
                    {isGuclu && <Text style={[s.perdeRol, { color: C.amber }]}>güçlü</Text>}
                  </View>

                  {komaAraligi !== undefined && (
                    <View style={s.aralik}>
                      <View style={[s.aralikCizgi, { backgroundColor: komaRenk + '66' }]} />
                      <View style={[s.aralikBadge, { backgroundColor: komaRenk + '18', borderColor: komaRenk + '55' }]}>
                        <Text style={[s.aralikKoma, { color: komaRenk }]}>{komaAraligi} koma</Text>
                        <Text style={[s.aralikCent, { color: komaRenk + 'aa' }]}>{komaToCent(komaAraligi)}</Text>
                        <Text style={[s.aralikIsim, { color: komaRenk }]} numberOfLines={2}>{komaIsim}</Text>
                      </View>
                      <View style={[s.aralikCizgi, { backgroundColor: komaRenk + '66' }]} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View style={s.toplamRow}>
            <Text style={s.toplamText}>
              Toplam: {makam.komaDizisi.reduce((a, b) => a + b, 0)} koma · {komaToCent(makam.komaDizisi.reduce((a, b) => a + b, 0))}
            </Text>
          </View>
        </View>

        {/* Koma rehberi */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>Koma Aralıkları Rehberi</Text>
          {[
            { koma: 4, aciklama: 'Bakiye — küçük yarım ton (~91 cent)' },
            { koma: 5, aciklama: 'Küçük mücennep — büyük yarım ton (~113 cent)' },
            { koma: 8, aciklama: 'Büyük mücennep — küçük tam ton (~181 cent)' },
            { koma: 9, aciklama: 'Tanini — tam ses (~204 cent)' },
            { koma: 13, aciklama: 'Artık ikili — Hicaz\'ın karakteristik aralığı (~295 cent)' },
          ].map(item => {
            const { renk } = komaAcikla(item.koma);
            const buMakamda = makam.komaDizisi.includes(item.koma);
            return (
              <View key={item.koma} style={[s.rehberSatir, buMakamda && { borderLeftColor: renk, backgroundColor: renk + '08' }]}>
                <View style={[s.rehberKoma, { backgroundColor: renk + '22', borderColor: renk + '55' }]}>
                  <Text style={[s.rehberKomaVal, { color: renk }]}>{item.koma}</Text>
                </View>
                <Text style={[s.rehberAciklama, buMakamda && { color: C.textSecondary }]}>{item.aciklama}</Text>
                {buMakamda && <Text style={[s.buMakamda, { color: renk }]}>✓</Text>}
              </View>
            );
          })}
        </View>

        {/* Yeden */}
        {yedenler[makam.id] && (
          <View style={s.bolum}>
            <Text style={s.bolumBaslik}>Yeden</Text>
            <View style={s.yedenKart}>
              <Text style={s.yedenPerde}>{yedenler[makam.id].perde}</Text>
              <Text style={s.yedenAciklama}>{yedenler[makam.id].aciklama}</Text>
            </View>
          </View>
        )}

        {/* Seyir kalıpları */}
        {seyirKaliplari[makam.id] && (
          <View style={s.bolum}>
            <Text style={s.bolumBaslik}>Seyir Kalıpları</Text>
            <Text style={s.bolumAlt}>
              {seyirYonAciklama(seyirKaliplari[makam.id].yon as any)}
            </Text>
            <View style={s.seyirKart}>
              <Text style={s.seyirAciklama}>{seyirKaliplari[makam.id].karakterAciklama}</Text>
            </View>
            {seyirKaliplari[makam.id].tipikCumleler.map((cumle) => (
              <View key={cumle.id} style={s.cumleSatir}>
                <View style={s.cumleBaslikRow}>
                  <Text style={s.cumleBaslik}>{cumle.baslik}</Text>
                </View>
                <Text style={s.cumleAciklama}>{cumle.aciklama}</Text>
                {cumle.not && <Text style={s.cumleNot}>ℹ {cumle.not}</Text>}
              </View>
            ))}
          </View>
        )}

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

        {/* Videolar */}
        {videolar.length > 0 && (
          <View style={s.bolum}>
            <Text style={s.bolumBaslik}>İzle ve Öğren</Text>
            <Text style={s.bolumAlt}>YouTube'da açılır</Text>
            {videolar.map(v => (
              <VideoKart key={v.id} video={v} />
            ))}
          </View>
        )}

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
  bolumBaslik: { color: C.textMuted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  bolumAlt: { color: C.textMuted, fontSize: F.xs, marginBottom: 12 },
  bolumIcerik: { color: C.textSecondary, fontSize: F.md, lineHeight: 24 },

  diziBand: { gap: 0 },
  perdeBlok: { alignItems: 'center' },
  perdeKutu: { borderRadius: R.md, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, width: '100%' },
  perdeAd: { color: C.textPrimary, fontWeight: '800', fontSize: F.md },
  perdeRol: { fontSize: F.xs, marginTop: 2, fontWeight: '600' },
  aralik: { alignItems: 'center', width: '100%', paddingVertical: 3 },
  aralikCizgi: { width: 2, height: 5, borderRadius: 1 },
  aralikBadge: { borderRadius: R.md, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 7, alignItems: 'center', width: '85%' },
  aralikKoma: { fontWeight: '900', fontSize: F.lg },
  aralikCent: { fontSize: F.xs, marginTop: 1 },
  aralikIsim: { fontSize: F.xs, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  toplamRow: { backgroundColor: C.surface2, borderRadius: R.md, padding: 12, marginTop: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  toplamText: { color: C.textSecondary, fontSize: F.sm, fontWeight: '700' },

  rehberSatir: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderRadius: R.md, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, borderLeftColor: C.border },
  rehberKoma: { width: 40, height: 40, borderRadius: R.md, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  rehberKomaVal: { fontWeight: '900', fontSize: F.md },
  rehberAciklama: { flex: 1, color: C.textMuted, fontSize: F.xs, lineHeight: 16 },
  buMakamda: { fontWeight: '900', fontSize: F.md },

  eser: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: R.md, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: C.border },
  eserDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.gold },
  eserText: { color: C.textSecondary, fontSize: F.md },

  videoKart: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  videoIkon: { width: 48, height: 48, borderRadius: R.md, justifyContent: 'center', alignItems: 'center' },
  videoIkonText: { fontSize: 20 },
  videoIcerik: { flex: 1 },
  videoBaslik: { color: C.textPrimary, fontWeight: '700', fontSize: F.sm, lineHeight: 18, marginBottom: 6 },
  videoTagRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  videoSeviye: { borderRadius: R.full, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  videoSeviyeText: { fontSize: F.xs - 1, fontWeight: '700' },
  videoMeta: { color: C.textMuted, fontSize: F.xs },
  videoOk: { color: C.textMuted, fontSize: 22 },

  butonRow: { gap: 10, marginTop: 8 },
  yedenKart: { backgroundColor: C.surface2, borderRadius: R.lg, padding: 14, borderWidth: 1, borderLeftWidth: 3, borderColor: C.border, borderLeftColor: C.violet },
  yedenPerde: { color: C.violet, fontWeight: '900', fontSize: F.xl, marginBottom: 4 },
  yedenAciklama: { color: C.textSecondary, fontSize: F.sm },
  seyirKart: { backgroundColor: C.surface2, borderRadius: R.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  seyirAciklama: { color: C.textSecondary, fontSize: F.sm, lineHeight: 20 },
  cumleSatir: { backgroundColor: C.surface, borderRadius: R.md, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, borderLeftColor: C.teal },
  cumleBaslikRow: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: 6 },
  cumleBaslik: { color: C.teal, fontWeight: '800', fontSize: F.sm },
  cumleAciklama: { color: C.textSecondary, fontSize: F.xs, lineHeight: 18 },
  cumleNot: { color: C.textMuted, fontSize: F.xs - 1, marginTop: 6, fontStyle: 'italic' as const },
  btnAna: { backgroundColor: C.gold, borderRadius: R.lg, padding: 18, alignItems: 'center' },
  btnAnaText: { color: C.bg, fontWeight: '900', fontSize: F.md },
  btnIkincil: { backgroundColor: C.surface, borderRadius: R.lg, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  btnIkincilText: { color: C.textSecondary, fontWeight: '700', fontSize: F.md },
});
