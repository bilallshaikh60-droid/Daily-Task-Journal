import { ThemeProvider as CustomThemeProvider, useTheme } from '@/context/ThemeContext';
import { WorkingDaysProvider } from '@/context/WorkingDaysContext';
import { Buffer } from 'buffer';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

global.Buffer = Buffer;

function AppNavigationLayout() {
  const { colors, isDark } = useTheme();

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
        <StatusBar
          style={isDark ? 'light' : 'dark'}
          backgroundColor={colors.card}
        />
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