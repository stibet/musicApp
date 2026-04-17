import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C, F, R } from '../constants/Design';
import { makamDefler, getMakamlariSeviyeye, type EgzersizSeviye } from '../src/makam/makamDef';
import { soruOlustur, cevapKontrol, seviyeEgzersizler, egzersizAciklamalari, type EgzersizTip } from '../src/egzersiz/egzersizMotoru';
import { egzersizSonucuKaydet, profilYukle, seviyeIsim } from '../src/store/skorStore';
import { loadPracticeSettings } from '../src/store/practiceSettings';
import type { IEgzersizSoru } from '../src/interfaces';

type Ekran = 'menu' | 'oyna' | 'bitti';

export default function EgzersizlerScreen() {
  const router = useRouter();
  const [ekran, setEkran]             = useState<Ekran>('menu');
  const [seviye, setSeviye]           = useState<EgzersizSeviye>('orta');
  const [secilenTip, setSecilenTip]   = useState<EgzersizTip>('dizi-dinlet');
  const [secilenMakam, setSecilenMakam] = useState('rast');
  const [soru, setSoru]               = useState<IEgzersizSoru | null>(null);
  const [secilen, setSecilen]         = useState<string | null>(null);
  const [dogru, setDogru]             = useState(0);
  const [yanlis, setYanlis]           = useState(0);
  const [toplamPuan, setToplamPuan]   = useState(0);
  const [soruSayac, setSoruSayac]     = useState(0);
  const MAX_SORU = 10;

  useEffect(() => {
    profilYukle().then(p => setSeviye(p.seviye));
    // practiceSettings'den son ayarları yükle (ileride tolerans vs. buraya gelecek)
    loadPracticeSettings().catch(() => {});
  }, []);

  function yeniSoru() {
    const tipler = seviyeEgzersizler[seviye];
    const tip    = secilenTip || tipler[Math.floor(Math.random() * tipler.length)];
    const makamlar = getMakamlariSeviyeye(seviye);
    const makam  = makamlar.find(m => m.id === secilenMakam) || makamlar[0];
    try {
      const s = soruOlustur(tip, makam.id, seviye);
      setSoru(s);
      setSecilen(null);
    } catch { }
  }

  function basla() {
    setDogru(0); setYanlis(0); setToplamPuan(0); setSoruSayac(0);
    setEkran('oyna');
    setTimeout(() => yeniSoru(), 50);
  }

  function cevapSec(cevap: string) {
    if (secilen || !soru) return;
    setSecilen(cevap);
    const dogruMu = cevapKontrol(soru, cevap);
    if (dogruMu) { setDogru(d => d + 1); setToplamPuan(p => p + soru.puan); }
    else setYanlis(y => y + 1);
    egzersizSonucuKaydet(soru.makamId, dogruMu, soru.puan);
  }

  function sonraki() {
    if (soruSayac + 1 >= MAX_SORU) { setEkran('bitti'); return; }
    setSoruSayac(s => s + 1);
    yeniSoru();
  }

  const dogruCevapStr = soru ? String(soru.dogruCevap) : '';

  if (ekran === 'menu') return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.geri}>← Geri</Text></TouchableOpacity>
        <Text style={s.baslik}>Egzersizler</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Seviye */}
        <Text style={s.label}>Seviye</Text>
        <View style={s.seviyeRow}>
          {(['baslangic', 'orta', 'ileri'] as EgzersizSeviye[]).map(sv => (
            <TouchableOpacity key={sv} style={[s.seviyeBtn, seviye === sv && s.seviyeBtnAktif]}
              onPress={() => setSeviye(sv)}>
              <Text style={[s.seviyeBtnText, seviye === sv && { color: C.gold }]}>{seviyeIsim(sv)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Makam seç */}
        <Text style={s.label}>Makam</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {getMakamlariSeviyeye(seviye).map(m => (
            <TouchableOpacity key={m.id} style={[s.chip, secilenMakam === m.id && s.chipAktif]}
              onPress={() => setSecilenMakam(m.id)}>
              <Text style={[s.chipText, secilenMakam === m.id && s.chipTextAktif]}>{m.turAdi}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Egzersiz tipleri */}
        <Text style={s.label}>Egzersiz Tipi</Text>
        <View style={s.tipGrid}>
          {seviyeEgzersizler[seviye].map(tip => {
            const info = egzersizAciklamalari[tip];
            return (
              <TouchableOpacity key={tip} style={[s.tipKart, secilenTip === tip && s.tipKartAktif]}
                onPress={() => setSecilenTip(tip)}>
                <Text style={s.tipEmoji}>{info.emoji}</Text>
                <Text style={[s.tipBaslik, secilenTip === tip && { color: C.gold }]}>{info.baslik}</Text>
                <Text style={s.tipAciklama}>{info.aciklama}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={s.baslaBtn} onPress={basla}>
          <Text style={s.baslaBtnText}>▶ {MAX_SORU} Soruluk Egzersiz Başlat</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );

  if (ekran === 'bitti') {
    const yuzde = Math.round((dogru / MAX_SORU) * 100);
    return (
      <SafeAreaView style={s.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 64 }}>{yuzde >= 80 ? '🏆' : yuzde >= 50 ? '👏' : '📚'}</Text>
          <Text style={{ color: C.textPrimary, fontWeight: '900', fontSize: 28, marginTop: 16 }}>Tamamlandı!</Text>
          <Text style={{ color: yuzde >= 70 ? C.green : yuzde >= 40 ? C.amber : C.red, fontWeight: '900', fontSize: 48 }}>
            {dogru}/{MAX_SORU}
          </Text>
          <View style={[s.puanBadge]}>
            <Text style={{ color: C.gold, fontWeight: '900', fontSize: F.xl }}>+{toplamPuan} puan</Text>
          </View>
          <Text style={{ color: C.textMuted, marginBottom: 32, fontSize: F.md }}>%{yuzde} başarı</Text>
          <TouchableOpacity style={s.baslaBtn} onPress={basla}>
            <Text style={s.baslaBtnText}>Tekrar Oyna</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.baslaBtn, { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, marginTop: 10 }]}
            onPress={() => setEkran('menu')}>
            <Text style={[s.baslaBtnText, { color: C.textSecondary }]}>Menüye Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!soru) return <SafeAreaView style={s.container}><View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text style={{color:C.textMuted}}>Yükleniyor...</Text></View></SafeAreaView>;

  const info = egzersizAciklamalari[soru.tip];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => setEkran('menu')}><Text style={s.geri}>← Çık</Text></TouchableOpacity>
        <Text style={s.baslik}>{soruSayac + 1}/{MAX_SORU}</Text>
        <Text style={{ color: C.green, fontWeight: '700' }}>✓{dogru}</Text>
      </View>
      <View style={s.progress}>
        <View style={[s.progressFill, { width: `${((soruSayac + 1) / MAX_SORU) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={s.oyunContent} showsVerticalScrollIndicator={false}>

        <View style={s.soruKart}>
          <View style={s.soruTipRow}>
            <Text style={s.soruEmoji}>{info.emoji}</Text>
            <Text style={s.soruTipAd}>{info.baslik}</Text>
            <View style={s.puanTag}><Text style={s.puanTagText}>{soru.puan}p</Text></View>
          </View>
          <Text style={s.soruText}>{soru.soru}</Text>
          {soru.ipucu && !secilen && (
            <Text style={s.ipucu}>💡 {soru.ipucu}</Text>
          )}
        </View>

        {soru.secenekler && (
          <View style={s.secenekler}>
            {soru.secenekler.map(opt => {
              let stil = s.secenek;
              if (secilen) {
                if (opt === dogruCevapStr) stil = { ...s.secenek, ...s.dogruSec };
                else if (opt === secilen)  stil = { ...s.secenek, ...s.yanlisSec };
              }
              return (
                <TouchableOpacity key={opt} style={stil} onPress={() => cevapSec(opt)} activeOpacity={0.8}>
                  <Text style={s.secenekText}>{opt}</Text>
                  {secilen && opt === dogruCevapStr && <Text style={{ color: C.green, fontSize: F.xs, marginTop: 4 }}>✓ Doğru</Text>}
                  {secilen && opt === secilen && opt !== dogruCevapStr && <Text style={{ color: C.red, fontSize: F.xs, marginTop: 4 }}>✗ Yanlış</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {secilen && (
          <TouchableOpacity style={s.sonrakiBtn} onPress={sonraki}>
            <Text style={s.sonrakiBtnText}>
              {soruSayac + 1 >= MAX_SORU ? 'Sonuçları Gör →' : 'Sonraki →'}
            </Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: C.border },
  geri:      { color: C.textSecondary, fontSize: F.md, fontWeight: '600', width: 60 },
  baslik:    { color: C.textPrimary, fontWeight: '900', fontSize: F.lg },
  content:   { padding: 16, paddingBottom: 48 },
  label:     { color: C.textMuted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  seviyeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  seviyeBtn: { flex: 1, backgroundColor: C.surface, borderRadius: R.lg, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  seviyeBtnAktif: { borderColor: C.gold, backgroundColor: C.goldGlow },
  seviyeBtnText:  { color: C.textMuted, fontWeight: '700' },
  chip:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: R.full, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface2, marginRight: 8 },
  chipAktif: { borderColor: C.gold, backgroundColor: C.goldGlow },
  chipText:  { color: C.textMuted, fontWeight: '600', fontSize: F.sm },
  chipTextAktif: { color: C.gold },
  tipGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  tipKart:   { width: '47%', backgroundColor: C.surface, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: C.border },
  tipKartAktif: { borderColor: C.gold, backgroundColor: C.goldGlow },
  tipEmoji:  { fontSize: 24, marginBottom: 8 },
  tipBaslik: { color: C.textPrimary, fontWeight: '800', fontSize: F.sm, marginBottom: 4 },
  tipAciklama:{ color: C.textMuted, fontSize: F.xs, lineHeight: 16 },
  baslaBtn:  { backgroundColor: C.gold, borderRadius: R.lg, padding: 18, alignItems: 'center' },
  baslaBtnText: { color: C.bg, fontWeight: '900', fontSize: F.lg },
  puanBadge: { backgroundColor: C.goldGlow, borderRadius: R.full, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 8, borderWidth: 1, borderColor: C.gold + '55' },
  progress:  { height: 3, backgroundColor: C.border },
  progressFill: { height: 3, backgroundColor: C.gold },
  oyunContent: { padding: 20, paddingBottom: 48 },
  soruKart:  { backgroundColor: C.surface, borderRadius: R.xl, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: C.border },
  soruTipRow:{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  soruEmoji: { fontSize: 24 },
  soruTipAd: { color: C.textSecondary, fontWeight: '700', fontSize: F.sm, flex: 1 },
  puanTag:   { backgroundColor: C.goldGlow, borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: C.gold + '55' },
  puanTagText: { color: C.gold, fontWeight: '800', fontSize: F.xs },
  soruText:  { color: C.textPrimary, fontWeight: '800', fontSize: F.lg, lineHeight: 26 },
  ipucu:     { color: C.textMuted, fontSize: F.sm, marginTop: 12, fontStyle: 'italic' },
  secenekler:{ gap: 10 },
  secenek:   { backgroundColor: C.surface, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: C.border },
  dogruSec:  { backgroundColor: C.greenDim, borderColor: C.green },
  yanlisSec: { backgroundColor: C.redDim, borderColor: C.red },
  secenekText:{ color: C.textPrimary, fontSize: F.md, fontWeight: '600' },
  sonrakiBtn: { marginTop: 16, backgroundColor: C.gold, borderRadius: R.lg, padding: 18, alignItems: 'center' },
  sonrakiBtnText: { color: C.bg, fontWeight: '900', fontSize: F.md },
});
