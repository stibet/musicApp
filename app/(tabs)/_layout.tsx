import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { C } from '../../constants/Design';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
      <Text style={{ fontSize: 10, color: focused ? C.gold : C.textMuted, fontWeight: focused ? '700' : '400', marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🎵" label="Koç" focused={focused} /> }} />
      <Tabs.Screen name="two" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🎤" label="Analiz" focused={focused} /> }} />
      <Tabs.Screen name="progress" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Rapor" focused={focused} /> }} />
    </Tabs>
  );
}
