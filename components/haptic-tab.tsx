import * as Haptics from 'expo-haptics';
import { PlatformPressable } from 'expo-router/react-navigation';
import { Platform } from 'react-native';

export function HapticTab(props: React.ComponentProps<typeof PlatformPressable>) {
  return (
    <PlatformPressable
      {...props}
      pressOpacity={1}                 
      pressColor="transparent"         
      onPressIn={(ev) => {
        if (Platform.OS === 'ios') {   
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}