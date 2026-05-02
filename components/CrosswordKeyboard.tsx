import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  if (!visible) return null;

  const keyWidth = Math.floor((width - 20) / 10) - 4;
  const keyHeight = 44;

  return (
    <View
      style={[
        styles.container,
        {
          // Replace the static vertical padding with dynamic padding
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
                    isDelete && styles.deleteKeyText,
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
    // Remove `paddingVertical` from here because we set it dynamically
    paddingHorizontal: 4,
    backgroundColor: '#D1D5DB',
  },
  // … rest of styles unchanged
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  deleteKeyText: {
    fontSize: 20,
    color: '#fff',
  },
});