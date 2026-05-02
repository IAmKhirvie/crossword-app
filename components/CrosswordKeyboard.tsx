import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';

interface CrosswordKeyboardProps {
  onLetter: (letter: string) => void;
  onDelete: () => void;
  visible: boolean;
}

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '\u232B'],
];

export function CrosswordKeyboard({
  onLetter,
  onDelete,
  visible,
}: CrosswordKeyboardProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { keyboardHeight } = useSettings();   // ← dynamic user setting

  if (!visible) return null;

  const keyWidth = Math.floor((width - 20) / 10) - 4;
  const keyHeight = keyboardHeight;            // now driven by settings
  const fontSize = Math.round(keyboardHeight * 0.4); // scale proportionally

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: 6,
          paddingBottom: insets.bottom + 6,
        },
      ]}
    >
      {ROWS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map(key => {
            const isDelete = key === '\u232B';
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.key,
                  {
                    width: isDelete ? keyWidth * 1.5 : keyWidth,
                    height: keyHeight,
                  },
                  isDelete && styles.deleteKey,
                ]}
                onPress={() => (isDelete ? onDelete() : onLetter(key))}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.keyText,
                    { fontSize },                     // dynamic font size
                    isDelete && styles.deleteKeyText,
                    isDelete && { fontSize: fontSize + 2 }, // slightly bigger for ⌫
                  ]}
                >
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    backgroundColor: '#D1D5DB',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  key: {
    backgroundColor: '#fff',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
  },
  deleteKey: {
    backgroundColor: '#9CA3AF',
  },
  keyText: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  deleteKeyText: {
    color: '#fff',
  },
});