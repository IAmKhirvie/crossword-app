import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { WordEntry } from '../data/types';

interface ClueListProps {
  words: WordEntry[];
  selectedWordId: string | null;
  completedWordIds: Set<string>;
  onCluePress: (wordId: string) => void;
}

export function ClueList({
  words,
  selectedWordId,
  completedWordIds,
  onCluePress,
}: ClueListProps) {
  const [tab, setTab] = useState<'across' | 'down'>('across');
  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef<Record<string, number>>({});

  const acrossWords = words.filter((w) => w.direction === 'across');
  const downWords = words.filter((w) => w.direction === 'down');
  const displayWords = tab === 'across' ? acrossWords : downWords;

  useEffect(() => {
    if (selectedWordId && scrollRef.current) {
      const word = words.find((w) => w.id === selectedWordId);
      if (word) {
        setTab(word.direction);
        setTimeout(() => {
          const y = offsets.current[selectedWordId];
          if (y !== undefined) {
            scrollRef.current?.scrollTo({ y, animated: true });
          }
        }, 50);
      }
    }
  }, [selectedWordId, words]);

  const handleLayout = (wordId: string) => (e: LayoutChangeEvent) => {
    offsets.current[wordId] = e.nativeEvent.layout.y;
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'across' && styles.activeTab]}
          onPress={() => setTab('across')}
        >
          <Text style={[styles.tabText, tab === 'across' && styles.activeTabText]}>
            ACROSS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'down' && styles.activeTab]}
          onPress={() => setTab('down')}
        >
          <Text style={[styles.tabText, tab === 'down' && styles.activeTabText]}>
            DOWN
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView ref={scrollRef} style={styles.list}>
        {displayWords.map((word) => {
          const isSelected = word.id === selectedWordId;
          const isCompleted = completedWordIds.has(word.id);
          return (
            <TouchableOpacity
              key={word.id}
              style={[styles.clueRow, isSelected && styles.selectedClue]}
              onPress={() => onCluePress(word.id)}
              onLayout={handleLayout(word.id)}
            >
              <Text style={styles.clueNumber}>{word.clueNumber}.</Text>
              <Text
                style={[
                  styles.clueText,
                  isCompleted && styles.completedClue,
                ]}
                numberOfLines={2}
              >
                {word.clue}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#4A90D9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  activeTabText: {
    color: '#4A90D9',
  },
  list: {
    flex: 1,
  },
  clueRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  selectedClue: {
    backgroundColor: '#F6C90E30',
  },
  clueNumber: {
    width: 28,
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  clueText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  completedClue: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
});
