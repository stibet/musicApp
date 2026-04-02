import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useDilStore } from '../../src/store/dilStore';

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{icon}</Text>;
}

export default function TabLayout() {
  const { tr } = useDilStore();
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#16213e', borderTopColor: '#0f3460' }, tabBarActiveTintColor: '#e94560', tabBarInactiveTintColor: '#666' }}>
      <Tabs.Screen name="index" options={{ title: tr.ogren, tabBarIcon: ({ color }) => <TabIcon icon="🎵" color={color} /> }} />
      <Tabs.Screen name="two" options={{ title: tr.pratik, tabBarIcon: ({ color }) => <TabIcon icon="🎤" color={color} /> }} />
      <Tabs.Screen name="progress" options={{ title: tr.ilerleme, tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} /> }} />
    </Tabs>
  );
}