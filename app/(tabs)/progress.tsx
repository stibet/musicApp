import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { C, F, R } from '../../constants/Design';
import { sorular } from '../../src/data/sorular';
import { Ilerleme, ilerlemeYukle } from '../../src/store/progress';
import { CoachSessionRecord, loadCoachSessions } from '../../src/store/sessionHistory';

export default function ProgressScreen() {
  const [ilerleme, setIlerleme] = useState<Ilerleme | null>(null);
  const [sessions, setSessions] = useState<CoachSessionRecord[]>([]);

  useFocusEffect(useCallback(() => {
    ilerlemeYukle().then(setIlerleme);
    loadCoachSessions().then(setSessions);
  }, []));

  const toplamCevap = (ilerleme?.toplamDogru || 0) + (ilerleme?.toplamYanlis || 0);
  const basariYuzde = toplamCevap > 0 ? Math.round(((ilerleme?.toplamDogru || 0) / toplamCevap) * 100) : 0;
  const avgSession = sessions.length ? Math.round(sessions.reduce((s, i) => s + i.successPct, 0) / sessions.length) : 0;

  const zayif = ilerleme
    ? Object.values(ilerleme.sorular).filter(s => s.yanlis > 0).sort((a, b) => b.yanlis - a.yanlis).slice(0, 3)
        .map(s => ({ ...s, soruMetni: sorular.find(q => q.id === s.soruId)?.soru || s.soruId }))
    : [];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.pageTitle}>İlerleme</Text>
        <Text style={s.pageSub}>Koç seansları ve quiz istatistiklerin</Text>

        {/* Özet */}
        <View style={s.heroRow}>
          <View style={[s.heroKart, { borderColor: C.gold + '44' }]}>
            <Text style={s.heroVal}>{sessions.length}</Text>
            <Text style={s.heroLabel}>Seans</Text>
          </View>
          <View style={[s.heroKart, { borderColor: C.green + '44' }]}>
            <Text style={[s.heroVal, { color: C.green }]}>%{avgSession}</Text>
            <Text style={s.heroLabel}>Ort. Başarı</Text>
          </View>
          <View style={[s.heroKart, { borderColor: C.amber + '44' }]}>
            <Text style={[s.heroVal, { color: C.amber }]}>{ilerleme?.streak || 0}</Text>
            <Text style={s.heroLabel}>🔥 Seri</Text>
          </View>
        </View>

        {/* Quiz istatistikleri */}
        <Text style={s.sectionTitle}>Quiz İstatistikleri</Text>
        <View style={s.grid}>
          {[
            { label: 'Başarı', val: `%${basariYuzde}`, renk: C.green },
            { label: 'Doğru', val: `${ilerleme?.toplamDogru || 0}`, renk: C.green },
            { label: 'Yanlış', val: `${ilerleme?.toplamYanlis || 0}`, renk: C.red },
            { label: 'Görülen', val: `${Object.keys(ilerleme?.sorular || {}).length}`, renk: C.teal },
          ].map((item, i) => (
            <View key={i} style={s.statKart}>
              <Text style={[s.statVal, { color: item.renk }]}>{item.val}</Text>
              <Text style={s.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Zayıf konular */}
        {zayif.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Tekrar Et</Text>
            {zayif.map((item, i) => (
              <View key={i} style={s.zayifKart}>
                <Text style={s.zayifMetin} numberOfLines={2}>{item.soruMetni}</Text>
                <View style={s.zayifBadge}>
                  <Text style={s.zayifBadgeText}>✗ {item.yanlis}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Koç seansları */}
        <Text style={s.sectionTitle}>Son Koç Seansları</Text>
        {sessions.length === 0 ? (
          <View style={s.bosKart}>
            <Text style={s.bosText}>Henüz kaydedilmiş seans yok.</Text>
            <Text style={s.bosAlt}>Makam Koçu'nda bir dizi tamamlayıp kaydet.</Text>
          </View>
        ) : (
          sessions.slice(0, 8).map(ses => (
            <View key={ses.id} style={s.sesKart}>
              <View style={{ flex: 1 }}>
                <Text style={s.sesBaslik}>{ses.makamTitle}</Text>
                <Text style={s.sesMeta}>{ses.mode === 'scale' ? 'Dizi' : ses.phraseTitle || 'Cümle'} · {ses.instrumentTitle}</Text>
                <Text style={s.sesTarih}>{new Date(ses.timestamp).toLocaleDateString('tr-TR')}</Text>
              </View>
              <View style={s.sesSkor}>
                <Text style={[s.sesSkorVal, { color: ses.successPct >= 70 ? C.green : ses.successPct >= 40 ? C.amber : C.red }]}>
                  %{ses.successPct}
                </Text>
                <Text style={s.sesKoma}>{ses.avgAbsKoma} koma</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingTop: 60, paddingBottom: 48 },
  pageTitle: { color: C.textPrimary, fontSize: F.xxl, fontWeight: '900', marginBottom: 4 },
  pageSub: { color: C.textSecondary, fontSize: F.sm, marginBottom: 24 },
  heroRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  heroKart: { flex: 1, backgroundColor: C.surface, borderRadius: R.lg, padding: 16, alignItems: 'center', borderWidth: 1 },
  heroVal: { color: C.gold, fontSize: F.xxl, fontWeight: '900' },
  heroLabel: { color: C.textMuted, fontSize: F.xs, marginTop: 4 },
  sectionTitle: { color: C.textMuted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statKart: { width: '47.5%', backgroundColor: C.surface, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: C.border },
  statVal: { fontSize: F.xxl, fontWeight: '900' },
  statLabel: { color: C.textMuted, fontSize: F.xs, marginTop: 4 },
  zayifKart: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, borderLeftColor: C.red },
  zayifMetin: { flex: 1, color: C.textSecondary, fontSize: F.sm },
  zayifBadge: { backgroundColor: C.redDim, borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 4 },
  zayifBadgeText: { color: C.red, fontWeight: '800', fontSize: F.xs },
  bosKart: { backgroundColor: C.surface, borderRadius: R.lg, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  bosText: { color: C.textSecondary, fontSize: F.md, fontWeight: '700' },
  bosAlt: { color: C.textMuted, fontSize: F.sm, marginTop: 6, textAlign: 'center' },
  sesKart: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  sesBaslik: { color: C.textPrimary, fontWeight: '800', fontSize: F.md },
  sesMeta: { color: C.textMuted, fontSize: F.xs, marginTop: 4 },
  sesTarih: { color: C.textMuted, fontSize: F.xs, marginTop: 2 },
  sesSkor: { alignItems: 'flex-end', justifyContent: 'center' },
  sesSkorVal: { fontSize: F.xl, fontWeight: '900' },
  sesKoma: { color: C.textMuted, fontSize: F.xs, marginTop: 2 },
});
