import DateTimePickerWrapper from '@/components/ui/DateTimePickerWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { formatDisplayDate } from '@/utils/helpers';

interface Props {
  value: string;
  onChange: (dateStr: string) => void;
}

export default function DateSelectorField({ value, onChange }: Props) {
  const { colors } = useTheme();
  const [showManual, setShowManual] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [manualText, setManualText] = useState('');

  function handlePickerChange(_event: { type: string; nativeEvent: { timestamp: number } }, date?: Date) {
    setShowPicker(false);
    if (date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      onChange(`${y}-${m}-${d}`);
      setShowManual(false);
    }
  }

  function handleManualSubmit() {
    const trimmed = manualText.trim();
    if (trimmed) onChange(trimmed);
    setShowManual(false);
  }

  if (showManual) {
    return (
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.primary }]}
          value={manualText}
          onChangeText={setManualText}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.mutedText}
          onSubmitEditing={handleManualSubmit}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleManualSubmit}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowManual(false)}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color={colors.mutedText} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => {
          setShowPicker(true);
          setManualText(value);
        }}
        onLongPress={() => {
          setManualText(value);
          setShowManual(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        <Text style={[styles.dateText, { color: colors.text }]}>{formatDisplayDate(value)}</Text>
        <Ionicons name="pencil-outline" size={14} color={colors.mutedText} />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePickerWrapper
          value={new Date(value + 'T00:00:00')}
          mode="date"
          display="default"
          onChange={handlePickerChange}
          maximumDate={new Date()}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  dateText: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
