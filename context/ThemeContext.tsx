// context/ThemeContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof LightColors;
}

// 1. Define your exact color palettes
const LightColors = {
  background: '#F9F9F6',
  card: '#FFFFFF',
  cardLight: '#F3F3EE',
  text: '#111111',
  mutedText: '#767670',
  border: '#EAEAEA',
  primary: '#3B82F6',   // Adjust to match your exact brand blue
  secondary: '#6B7280',
  success: '#10B981',
  danger: '#EF4444',
};

const DarkColors = {
  background: '#121212',
  card: '#1E1E1E',
  cardLight: '#2A2A2A',
  text: '#FFFFFF',
  mutedText: '#A0A0A0',
  border: '#333333',
  primary: '#3B82F6',
  secondary: '#9CA3AF',
  success: '#10B981',
  danger: '#EF4444',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme(); // Fallback to device system settings
  const [theme, setTheme] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');

  // Load saved preference on initialization
  useEffect(() => {
    async function loadTheme() {
      const savedTheme = await AsyncStorage.getItem('user-theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      } else if (systemScheme) {
        // Coerce system scheme to our ThemeMode type (only 'light' or 'dark')
        setTheme(systemScheme === 'dark' ? 'dark' : 'light');
      }
    }
    loadTheme();
  }, [systemScheme]);

  const toggleTheme = async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    await AsyncStorage.setItem('user-theme', nextTheme);
  };

  const colors = theme === 'dark' ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}