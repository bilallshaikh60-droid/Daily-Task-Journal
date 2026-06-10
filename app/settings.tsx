import { settingsStyles } from '@/constants/styles';
import { Weekday } from '@/constants/types';
import { useTheme } from '@/context/ThemeContext';
import { useWorkingDays } from '@/context/WorkingDaysContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const DAYS: { label: string; short: string; value: Weekday }[] = [
  { label: 'Sunday', short: 'Sun', value: 0 },
  { label: 'Monday', short: 'Mon', value: 1 },
  { label: 'Tuesday', short: 'Tue', value: 2 },
  { label: 'Wednesday', short: 'Wed', value: 3 },
  { label: 'Thursday', short: 'Thu', value: 4 },
  { label: 'Friday', short: 'Fri', value: 5 },
  { label: 'Saturday', short: 'Sat', value: 6 },
];

const PRESETS: { label: string; days: Weekday[] }[] = [
  { label: '5-day (Mon–Fri)', days: [1, 2, 3, 4, 5] },
  { label: '6-day (Mon–Sat)', days: [1, 2, 3, 4, 5, 6] },
  { label: '7-day (All week)', days: [0, 1, 2, 3, 4, 5, 6] },
  { label: 'Weekends only', days: [0, 6] },
];

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { workingDays, setWorkingDays } = useWorkingDays();
  const [selected, setSelected] = useState<Weekday[]>(workingDays);
  const insets = useSafeAreaInsets();

  function toggleDay(day: Weekday) {
    if (selected.includes(day)) {
      if (selected.length === 1) {
        Alert.alert('At least one day required', 'You must have at least one working day.');
        return;
      }
      setSelected(selected.filter(d => d !== day));
    } else {
      setSelected([...selected, day].sort((a, b) => a - b) as Weekday[]);
    }
  }

  async function handleSave() {
    await setWorkingDays(selected);
    Alert.alert('Saved', 'Working days updated.', [
      { text: 'OK', onPress: () => router.canGoBack() ? router.back() : router.push('/') }
    ]);
  }

  function applyPreset(days: Weekday[]) {
    setSelected(days);
  }

  const hasChanges = JSON.stringify(selected.sort()) !== JSON.stringify([...workingDays].sort());

  return (
    <SafeAreaView edges={['top']} style={[settingsStyles.container, { backgroundColor: colors.background }]}>
      <View style={settingsStyles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.push('/')} style={settingsStyles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[settingsStyles.title, { color: colors.text }]}>Settings</Text>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[settingsStyles.themeToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={settingsStyles.section}>
        <Text style={[settingsStyles.sectionTitle, { color: colors.text }]}>Working Days</Text>
        <Text style={[settingsStyles.sectionSubtitle, { color: colors.mutedText }]}>
          Streaks and activity tracking will only count these days
        </Text>

        <View style={settingsStyles.presets}>
          {PRESETS.map(preset => {
            const isActive = JSON.stringify(preset.days) === JSON.stringify(selected);
            return (
              <TouchableOpacity
                key={preset.label}
                style={[
                  settingsStyles.presetBtn,
                  {
                    backgroundColor: isActive ? colors.primary : colors.card,
                    borderColor: isActive ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => applyPreset(preset.days)}
                activeOpacity={0.8}
              >
                <Text style={[settingsStyles.presetText, { color: isActive ? '#fff' : colors.text }]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[settingsStyles.dayGrid, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {DAYS.map(({ label, short, value }) => {
            const isSelected = selected.includes(value);
            return (
              <TouchableOpacity
                key={value}
                style={[
                  settingsStyles.dayBtn,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.background,
                    borderColor: isSelected ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => toggleDay(value)}
                activeOpacity={0.8}
              >
                <Text style={[settingsStyles.dayShort, { color: isSelected ? '#fff' : colors.mutedText }]}>
                  {short}
                </Text>
                <Text style={[settingsStyles.dayFull, { color: isSelected ? '#fff' : colors.text }]}>
                  {label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={18} color="#fff" style={settingsStyles.dayCheck} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[settingsStyles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[
            settingsStyles.saveBtn,
            { backgroundColor: hasChanges ? colors.primary : colors.border }
          ]}
          onPress={handleSave}
          disabled={!hasChanges}
          activeOpacity={0.9}
        >
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={settingsStyles.saveBtnText}>Save Working Days</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
