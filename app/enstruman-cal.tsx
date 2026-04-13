import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions, Platform, SafeAreaView, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import {
  BEYAZ_TUSLAR, DAVUL_NOTALAR, NOTA_ISIMLERI_TR, NOTA_ISIMLERI_EN,
  SIYAH_TUSLAR, enstrumanlar, notaTam,
} from '../src/instruments/engine';
import { isSesMotorHazir, notaBirak, notaCal, sesMotorBaslat } from '../src/audio/sesMotoru';
import { useDilStore } from '../src/store/dilStore';

const { width } = Dimensions.get('window');

export default function EnstrumanCalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { dil } = useDilStore();

  const enstruman = enstrumanlar.find(e => e.id === id);
  const [hazir, setHazir] = useState(false);
  const [aktifOktav, setAktifOktav] = useState(enstruman?.oktavlar[1] ?? 4);
  const [basiliTuslar, setBasiliTuslar] = useState<Set<string>>(new Set());
  const [sonCalinan, setSonCalinan] = useState<string>('');
  const [webDegil, setWebDegil] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setWebDegil(true);
      return;
    }
    sesMotorBaslat().then(() => setHazir(true));
  }, []);

  if (!enstruman) return null;

  function tusBas(nota: string, isim: string) {
    setBasiliTuslar(prev => new Set(prev).add(nota));
    setSonCalinan(isim);
    notaCal(enstruman!.id, nota);
  }

  function tusBirak(nota: string) {
    setBasiliTuslar(prev => { const s = new Set(prev); s.delete(nota); return s; });
    notaBirak(enstruman!.id, nota);
  }

  const isDavul = enstruman.id === 'drums';

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.geri}>← {dil === 'tr' ? 'Geri' : 'Back'}</Text>
        </TouchableOpacity>
        <Text style={s.baslik}>
          {enstruman.emoji} {dil === 'tr' ? enstruman.isim : enstruman.isimEn}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Web uyarısı */}
      {webDegil && (
        <View style={s.uyariBox}>
          <Text style={s.uyariText}>
            {dil === 'tr'
              ? '⚠️ Ses şu an sadece web modunda çalışıyor. Terminalde "w" tuşuna bas.'
              : '⚠️ Sound works in web mode only. Press "w" in terminal.'}
          </Text>
        </View>
      )}

      {/* Son çalınan nota */}
      <View style={s.notaGoster}>
        <Text style={[s.notaBuyuk, { color: enstruman.renk }]}>
          {sonCalinan || '—'}
        </Text>
        <Text style={s.notaKucuk}>
          {hazir ? (dil === 'tr' ? '✅ Ses hazır' : '✅ Audio ready') : (dil === 'tr' ? '⏳ Yükleniyor...' : '⏳ Loading...')}
        </Text>
      </View>

      {isDavul ? (
        <DavulKlavyesi
          enstrumanId={enstruman.id}
          renk={enstruman.renk}
          dil={dil}
          basiliTuslar={basiliTuslar}
          onBas={tusBas}
          onBirak={tusBirak}
        />
      ) : (
        <>
          {/* Oktav seçici */}
          <View style={s.oktavRow}>
            <Text style={s.oktavLabel}>{dil === 'tr' ? 'Oktav:' : 'Octave:'}</Text>
            {enstruman.oktavlar.map(o => (
              <TouchableOpacity
                key={o}
                style={[s.oktavBtn, aktifOktav === o && { backgroundColor: enstruman.renk + '33', borderColor: enstruman.renk }]}
                onPress={() => setAktifOktav(o)}
              >
                <Text style={[s.oktavBtnText, aktifOktav === o && { color: enstruman.renk }]}>{o}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Klavye */}
          <PiyanoKlavyesi
            enstrumanId={enstruman.id}
            oktav={aktifOktav}
            renk={enstruman.renk}
            dil={dil}
            basiliTuslar={basiliTuslar}
            onBas={tusBas}
            onBirak={tusBirak}
          />
        </>
      )}

      {/* Bilgi */}
      <View style={s.bilgiBox}>
        <Text style={s.bilgiText}>
          {dil === 'tr'
            ? 'Tuşlara bas ve bas'
            : 'Tap and hold keys to play'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

// Piyano klavyesi komponenti
function PiyanoKlavyesi({
  enstrumanId, oktav, renk, dil, basiliTuslar, onBas, onBirak
}: {
  enstrumanId: string; oktav: number; renk: string; dil: string;
  basiliTuslar: Set<string>; onBas: (nota: string, isim: string) => void; onBirak: (nota: string) => void;
}) {
  const NOTALAR = dil === 'tr' ? NOTA_ISIMLERI_TR : NOTA_ISIMLERI_EN;
  const beyazSayi = BEYAZ_TUSLAR.length;
  const tusGenislik = Math.min(52, (width - 32) / beyazSayi);
  const tusYukseklik = 140;

  return (
    <View style={[pk.container, { marginHorizontal: 16 }]}>
      <View style={{ flexDirection: 'row', position: 'relative', height: tusYukseklik }}>
        {/* Beyaz tuşlar */}
        {BEYAZ_TUSLAR.map((notaIdx, i) => {
          const nota = notaTam(notaIdx, oktav);
          const aktif = basiliTuslar.has(nota);
          return (
            <TouchableOpacity
              key={nota}
              style={[
                pk.beyazTus,
                { width: tusGenislik - 2, height: tusYukseklik },
                aktif && { backgroundColor: renk + 'aa', borderColor: renk },
              ]}
              onPressIn={() => onBas(nota, NOTALAR[notaIdx])}
              onPressOut={() => onBirak(nota)}
              activeOpacity={0.7}
            >
              <Text style={[pk.beyazTusText, aktif && { color: '#fff', fontWeight: 'bold' }]}>
                {NOTALAR[notaIdx]}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Siyah tuşlar - absolute position */}
        {SIYAH_TUSLAR.map((notaIdx) => {
          const nota = notaTam(notaIdx, oktav);
          const aktif = basiliTuslar.has(nota);

          // Siyah tuşun beyaz tuşlar arasındaki pozisyonu
          const beyazIndex = [0, 1, 3, 4, 5].indexOf([0, 2, 4, 5, 7, 9, 11].findIndex((_, i) =>
            BEYAZ_TUSLAR[i] + 1 === notaIdx || BEYAZ_TUSLAR[i] === notaIdx - 1
          ));

          // Pozisyon hesaplama
          let leftPct = 0;
          if (notaIdx === 1) leftPct = tusGenislik * 0.65;
          else if (notaIdx === 3) leftPct = tusGenislik * 1.65;
          else if (notaIdx === 6) leftPct = tusGenislik * 3.65;
          else if (notaIdx === 8) leftPct = tusGenislik * 4.65;
          else if (notaIdx === 10) leftPct = tusGenislik * 5.65;

          return (
            <TouchableOpacity
              key={nota}
              style={[
                pk.siyahTus,
                {
                  left: leftPct,
                  width: tusGenislik * 0.6,
                  height: tusYukseklik * 0.6,
                  backgroundColor: aktif ? renk : '#1a1a2e',
                  borderColor: aktif ? renk : '#333',
                },
              ]}
              onPressIn={() => onBas(nota, NOTA_ISIMLERI_TR[notaIdx])}
              onPressOut={() => onBirak(nota)}
              activeOpacity={0.7}
            >
              <Text style={[pk.siyahTusText, aktif && { color: '#fff' }]}>
                {NOTA_ISIMLERI_EN[notaIdx]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Davul klavyesi komponenti
function DavulKlavyesi({
  enstrumanId, renk, dil, basiliTuslar, onBas, onBirak
}: {
  enstrumanId: string; renk: string; dil: string;
  basiliTuslar: Set<string>; onBas: (nota: string, isim: string) => void; onBirak: (nota: string) => void;
}) {
  const renkler = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <ScrollView contentContainerStyle={dk.container}>
      <View style={dk.grid}>
        {DAVUL_NOTALAR.map((d, i) => {
          const aktif = basiliTuslar.has(d.not);
          return (
            <TouchableOpacity
              key={d.not}
              style={[
                dk.pad,
                { backgroundColor: aktif ? renkler[i] : renkler[i] + '33', borderColor: renkler[i] },
              ]}
              onPressIn={() => onBas(d.not, dil === 'tr' ? d.isim : d.isimEn)}
              onPressOut={() => onBirak(d.not)}
              activeOpacity={0.7}
            >
              <Text style={dk.padIsim}>{dil === 'tr' ? d.isim : d.isimEn}</Text>
              <Text style={dk.padNot}>{d.not}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

import { C, F, R } from '../constants/Design';

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: C.border },
  geri: { color: C.textSecondary, fontSize: F.md, width: 50 },
  baslik: { color: C.textPrimary, fontWeight: '900', fontSize: F.lg },
  rehberBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: R.full, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface2 },
  uyari: { backgroundColor: C.surface2, borderRadius: R.md, padding: 10, margin: 12, borderLeftWidth: 3, borderLeftColor: C.amber },
  uyariText: { color: C.amber, fontSize: F.xs },
  notaGoster: { alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  notaBuyuk: { fontSize: 44, fontWeight: '900' },
  notaKucuk: { color: C.textMuted, fontSize: F.xs, marginTop: 2 },
});
