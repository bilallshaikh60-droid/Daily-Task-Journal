// app/_layout.tsx
import { ThemeProvider as CustomThemeProvider, useTheme } from '@/context/ThemeContext';
import { WorkingDaysProvider } from '@/context/WorkingDaysContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';

function AppNavigationLayout() {
  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(colors.card); // ← sets nav bar color
    }
  }, [isDark, colors.card]);

  return (
    <WorkingDaysProvider>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="edit-entry"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
        <StatusBar style={isDark ? "light" : "dark"} />
      </SafeAreaProvider>
    </WorkingDaysProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CustomThemeProvider>
        <AppNavigationLayout />
      </CustomThemeProvider>
    </GestureHandlerRootView>
  );
}