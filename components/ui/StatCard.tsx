import { View, Text, StyleSheet } from 'react-native';
import { FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  label: string;
  value: string | number;
  color?: string;
}

export default function StatCard({ label, value, color }: Props) {
  const { colors } = useTheme();
  const accentColor = color ?? colors.primary;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: accentColor, borderLeftWidth: 3 }]}>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.mutedText }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
    elevation: 2,
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
  },
  label: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
});
