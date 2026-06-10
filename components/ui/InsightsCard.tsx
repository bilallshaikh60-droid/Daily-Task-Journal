// components/ui/InsightsCard.tsx
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color?: string;
  index?: number;
}

export default function InsightsCard({ icon, text, color, index = 0 }: Props) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  // Fallback to active theme primary token if no custom override passed down
  const finalColor = color || colors.primary;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        { 
          opacity, 
          transform: [{ translateY }],
          backgroundColor: colors.card,
          borderColor: colors.border
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: finalColor + '18' }]}>
        <Ionicons name={icon} size={22} color={finalColor} />
      </View>
      <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    gap: Spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: FontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
});