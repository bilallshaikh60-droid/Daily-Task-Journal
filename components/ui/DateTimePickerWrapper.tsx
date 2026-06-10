import { Platform, TextInput, View } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { toLocalDateString } from '@/constants/types';

type PickerEvent = {
  type: 'set' | 'dismissed';
  nativeEvent: { timestamp: number };
};

type PickerProps = {
  value: Date;
  mode?: 'date' | 'time' | 'datetime';
  display?: 'default' | 'spinner' | 'clock' | 'calendar';
  onChange: (event: PickerEvent, date?: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
};

export default function DateTimePickerWrapper(props: PickerProps) {
  if (Platform.OS === 'web') {
    const dateStr = toLocalDateString(props.value);
    return (
      <View style={{ marginBottom: 16 }}>
        <input
          type="date"
          value={dateStr}
          max={props.maximumDate ? toLocalDateString(props.maximumDate) : undefined}
          min={props.minimumDate ? toLocalDateString(props.minimumDate) : undefined}
          onChange={e => {
            const val = e.target.value;
            if (val) {
              props.onChange(
                { type: 'set', nativeEvent: { timestamp: Date.now() } },
                new Date(val + 'T00:00:00')
              );
            }
          }}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            borderRadius: `${BorderRadius.lg}px`,
            border: `1px solid ${Colors.border}`,
            backgroundColor: Colors.background,
            color: Colors.text,
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </View>
    );
  }

  const NativePicker = require('@react-native-community/datetimepicker').default;
  return (
    <NativePicker
      value={props.value}
      mode={props.mode ?? 'date'}
      display={props.display ?? 'default'}
      onChange={props.onChange}
      maximumDate={props.maximumDate}
      minimumDate={props.minimumDate}
    />
  );
}
