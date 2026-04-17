import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { C } from '../constants/Design';

export { ErrorBoundary } from 'expo-router';
export const unstable_settings = { initialRouteName: '(tabs)' };
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);
  if (!loaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="makam-kocu" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="taksim-analiz" />
      <Stack.Screen name="video-analiz" />
      <Stack.Screen name="egzersizler" />
      <Stack.Screen name="debug" />
      <Stack.Screen name="debug-lab" />
      <Stack.Screen name="makamlar" />
      <Stack.Screen name="makam-detay" />
      <Stack.Screen name="gamlar" />
      <Stack.Screen name="gam-detay" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
