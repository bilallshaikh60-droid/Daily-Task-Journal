import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { BorderRadius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsButton() {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => router.push('/settings')}
      style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.7}
    >
      <Ionicons name="settings-outline" size={22} color={colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
  },
});
