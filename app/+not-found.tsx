import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { C, F } from '../constants/Design';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Sayfa Bulunamadı' }} />
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ color: C.textPrimary, fontSize: F.xxl, fontWeight: '900', marginBottom: 16 }}>404</Text>
        <Link href="/" style={{ color: C.gold, fontSize: F.md }}>Ana sayfaya dön →</Link>
      </View>
    </>
  );
}
