import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface GameHeaderProps {
  title: string;
  levelNumber: number;
  hintsUsed: number;
  onHint: () => void;
  onBack: () => void;
}

export function GameHeader({ title, levelNumber, hintsUsed, onHint, onBack }: GameHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.level}>Level {levelNumber}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      <TouchableOpacity onPress={onHint} style={styles.hintButton}>
        <Text style={styles.hintIcon}>{'?'}</Text>
        <Text style={styles.hintCount}>{hintsUsed}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#4A90D9',
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 12,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  level: {
    color: '#ddeeff',
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  hintButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hintIcon: {
    color: '#F6C90E',
    fontSize: 18,
    fontWeight: '800',
  },
  hintCount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
