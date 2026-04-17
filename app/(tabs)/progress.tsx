import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { C, F, R } from '../../constants/Design';
import { CoachSessionRecord, loadCoachSessions } from '../../src/store/sessionHistory';
import { loadMakamProgress, type MakamProgressItem } from '../../src/store/makamProgress';
import { profilYukle, seviyeIsim, rozetler, type KullaniciProfil } from '../../src/store/skorStore';
import { makamDefler } from '../../src/makam/makamDef';

export default function ProgressScreen() {
  const [sessions, setSessions]       = useState<CoachSessionRecord[]>([]);
  const [makamProg, setMakamProg]     = useState<Record<string, MakamProgressItem>>({});
  const [profil, setProfil]           = useState<KullaniciProfil | null>(null);

  useFocusEffect(useCallback(() => {
    loadCoachSessions().then(setSessions);
    loadMakamProgress().then(s => setMakamProg(s.items));
    profilYukle().then(setProfil);
  }, []));

  const toplamSeans  = sessions.length;
  const avgBasari    = toplamSeans ? Math.round(sessions.reduce((s, i) => s + i.successPct, 0) / toplamSeans) : 0;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.baslik}>İlerleme</Text>

        {/* Özet */}
        <View style={s.heroRow}>
          <View style={[s.hero, { borderColor: C.gold + '44' }]}>
            <Text style={[s.heroVal, { color: C.gold }]}>{profil?.streak ?? 0}</Text>
            <Text style={s.heroLabel}>🔥 Seri</Text>
          </View>
          <View style={[s.hero, { borderColor: C.green + '44' }]}>
            <Text style={[s.heroVal, { color: C.green }]}>{profil?.toplamPuan ?? 0}</Text>
            <Text style={s.heroLabel}>Puan</Text>
          </View>
          <View style={[s.hero, { borderColor: C.teal + '44' }]}>
            <Text style={[s.heroVal, { color: C.teal }]}>{toplamSeans}</Text>
            <Text style={s.heroLabel}>Seans</Text>
          </View>
          <View style={[s.hero, { borderColor: C.amber + '44' }]}>
            <Text style={[s.heroVal, { color: C.amber }]}>{seviyeIsim(profil?.seviye ?? 'baslangic')}</Text>
            <Text style={s.heroLabel}>Seviye</Text>
          </View>
        </View>

        {/* Rozetler */}
        {(profil?.rozetler?.length ?? 0) > 0 && (
          <View style={s.bolum}>
            <Text style={s.bolumBaslik}>Rozetler</Text>
            <View style={s.rozetRow}>
              {(profil?.rozetler ?? []).map(r => {
                const rz = rozetler[r];
                if (!rz) return null;
                return (
                  <View key={r} style={s.rozetKart}>
                    <Text style={{ fontSize: 28 }}>{rz.emoji}</Text>
                    <Text style={s.rozetIsim}>{rz.isim}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Makam bazlı ilerleme */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>Makam Bazlı İlerleme</Text>
          {makamDefler.map(m => {
            const p = makamProg[m.id];
            if (!p) return (
              <View key={m.id} style={s.makamKart}>
                <Text style={s.makamAd}>{m.turAdi}</Text>
                <Text style={s.makamAlt}>Henüz çalışılmadı</Text>
              </View>
            );
            return (
              <View key={m.id} style={s.makamKart}>
                <View style={s.makamUst}>
                  <Text style={s.makamAd}>{m.turAdi}</Text>
                  <Text style={[s.makamBasari, {
                    color: p.bestSuccessPct >= 80 ? C.green : p.bestSuccessPct >= 50 ? C.amber : C.red
                  }]}>
                    En iyi: %{p.bestSuccessPct}
                  </Text>
                </View>
                <View style={s.makamBar}>
                  <View style={[s.makamBarFill, {
                    width: `${p.avgSuccessPct}%`,
                    backgroundColor: p.avgSuccessPct >= 70 ? C.green : p.avgSuccessPct >= 40 ? C.amber : C.red,
                  }]} />
                </View>
                <View style={s.makamAltRow}>
                  <Text style={s.makamAlt}>{p.sessions} seans · ort. %{p.avgSuccessPct}</Text>
                  <Text style={s.makamAlt}>{p.avgAbsKoma} koma sapma</Text>
                </View>
                {p.weakestNotes.length > 0 && (
                  <Text style={s.zayifNota}>⚠ Zayıf: {p.weakestNotes.slice(0,3).join(' · ')}</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Son seanslar */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>Son Koç Seansları</Text>
          {sessions.length === 0 ? (
            <View style={s.bosKart}>
              <Text style={s.bosText}>Henüz seans yok.</Text>
              <Text style={s.bosAlt}>Makam Koçu'nda bir dizi tamamlayıp kaydet.</Text>
            </View>
          ) : sessions.slice(0, 8).map(ses => (
            <View key={ses.id} style={s.sesKart}>
              <View style={{ flex: 1 }}>
                <Text style={s.sesBaslik}>{ses.makamTitle}</Text>
                <Text style={s.sesMeta}>{ses.mode === 'scale' ? 'Dizi' : ses.phraseTitle || 'Cümle'} · {ses.instrumentTitle}</Text>
                <Text style={s.sesTarih}>{new Date(ses.timestamp).toLocaleDateString('tr-TR')}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[s.sesSkor, {
                  color: ses.successPct >= 70 ? C.green : ses.successPct >= 40 ? C.amber : C.red
                }]}>%{ses.successPct}</Text>
                <Text style={s.sesKoma}>{ses.avgAbsKoma} koma</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content:   { padding: 20, paddingTop: 60, paddingBottom: 48 },
  baslik:    { color: C.textPrimary, fontSize: F.xxl, fontWeight: '900', marginBottom: 20 },
  heroRow:   { flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  hero:      { flex: 1, minWidth: '45%', backgroundColor: C.surface, borderRadius: R.lg, padding: 14, alignItems: 'center', borderWidth: 1 },
  heroVal:   { fontSize: F.xl, fontWeight: '900' },
  heroLabel: { color: C.textMuted, fontSize: F.xs, marginTop: 4 },
  bolum:     { marginBottom: 24 },
  bolumBaslik: { color: C.textMuted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  rozetRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  rozetKart: { backgroundColor: C.surface, borderRadius: R.lg, padding: 12, alignItems: 'center', minWidth: 80, borderWidth: 1, borderColor: C.border },
  rozetIsim: { color: C.textSecondary, fontSize: F.xs, marginTop: 6, textAlign: 'center' },
  makamKart: { backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  makamUst:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  makamAd:   { color: C.textPrimary, fontWeight: '800', fontSize: F.md },
  makamBasari:{ fontWeight: '800', fontSize: F.sm },
  makamBar:  { height: 6, backgroundColor: C.surface2, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  makamBarFill: { height: 6, borderRadius: 3 },
  makamAltRow:{ flexDirection: 'row', justifyContent: 'space-between' },
  makamAlt:  { color: C.textMuted, fontSize: F.xs },
  zayifNota: { color: C.amber, fontSize: F.xs, marginTop: 6 },
  bosKart:   { backgroundColor: C.surface, borderRadius: R.lg, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  bosText:   { color: C.textSecondary, fontWeight: '700', fontSize: F.md },
  bosAlt:    { color: C.textMuted, fontSize: F.sm, marginTop: 6 },
  sesKart:   { flexDirection: 'row', backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  sesBaslik: { color: C.textPrimary, fontWeight: '800', fontSize: F.md },
  sesMeta:   { color: C.textMuted, fontSize: F.xs, marginTop: 3 },
  sesTarih:  { color: C.textMuted, fontSize: F.xs },
  sesSkor:   { fontSize: F.xl, fontWeight: '900' },
  sesKoma:   { color: C.textMuted, fontSize: F.xs },
});
