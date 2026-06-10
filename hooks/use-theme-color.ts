import { Colors } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  _colorName: keyof typeof Colors
) {
  const colorFromProps = props['dark'];
  if (colorFromProps) {
    return colorFromProps;
  }
  return Colors.text;
}
