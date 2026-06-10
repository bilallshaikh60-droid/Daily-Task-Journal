import { Text, View } from 'react-native';
import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import SettingsButton from './SettingsButton';

interface Props {
  title: string;
  subtitle?: string;
  showSettings?: boolean;
}

export default function ScreenHeader({ title, subtitle, showSettings = true }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.md, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: FontSize.xxl, fontWeight: '800', color: colors.text }}>{title}</Text>
        {subtitle && <Text style={{ fontSize: FontSize.sm, marginTop: Spacing.xs, color: colors.mutedText }}>{subtitle}</Text>}
      </View>
      {showSettings && <SettingsButton />}
    </View>
  );
}
