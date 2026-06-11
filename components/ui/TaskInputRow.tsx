import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  value: string;
  onChange: (text: string) => void;
  onDelete: () => void;
  index: number;
  completed?: boolean;
  onToggleComplete?: () => void;
}

export default function TaskInputRow({ value, onChange, onDelete, index, completed, onToggleComplete }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      {onToggleComplete ? (
        <TouchableOpacity
          onPress={onToggleComplete}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={24}
            color={completed ? colors.success : colors.mutedText}
          />
        </TouchableOpacity>
      ) : (
        <Ionicons name="checkmark-circle-outline" size={20} color={colors.secondary} />
      )}

      <View style={[
        styles.wrapper,
        {
          backgroundColor: colors.background,
          borderColor: completed ? colors.success : colors.border,
          opacity: completed ? 0.7 : 1,
        }
      ]}>
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
            completed && { textDecorationLine: 'line-through', color: colors.mutedText },
          ]}
          value={value}
          onChangeText={onChange}
          placeholder={`Task ${index + 1}`}
          placeholderTextColor={colors.mutedText}
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity onPress={onDelete} activeOpacity={0.7}>
        <Ionicons name="close-circle" size={20} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  wrapper: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    minHeight: 44,
  },
  input: {
    minHeight: 44,
    fontSize: FontSize.md,
    paddingVertical: Spacing.sm,
  },
});
