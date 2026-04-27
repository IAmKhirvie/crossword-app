import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LEVELS } from '../../data/levels';
import { useCrossword } from '../../hooks/useCrossword';
import { CrosswordGrid } from '../../components/CrosswordGrid';
import { ClueList } from '../../components/ClueList';
import { CrosswordKeyboard } from '../../components/CrosswordKeyboard';
import { WordRevealModal } from '../../components/WordRevealModal';
import { GameHeader } from '../../components/GameHeader';

export default function GameScreen() {
  const { level } = useLocalSearchParams<{ level: string }>();
  const router = useRouter();
  const levelNumber = parseInt(level ?? '1', 10);
  const levelData = LEVELS[levelNumber];

  const crossword = useCrossword(levelData);

  if (!levelData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Level not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GameHeader
        title={levelData.title}
        levelNumber={levelNumber}
        hintsUsed={crossword.hintsUsed}
        onHint={crossword.revealSelectedCell}
        onBack={() => router.back()}
      />

      <CrosswordGrid
        levelData={levelData}
        cellMap={crossword.cellMap}
        gridState={crossword.gridState}
        selectedCell={crossword.selectedCell}
        selectedWordId={crossword.selectedWordId}
        wordCells={crossword.wordCells}
        onCellPress={crossword.selectCell}
      />

      <ClueList
        words={levelData.words}
        selectedWordId={crossword.selectedWordId}
        completedWordIds={crossword.completedWordIds}
        onCluePress={crossword.selectWord}
      />

      {crossword.isPuzzleComplete && (
        <View style={styles.completeBar}>
          <Text style={styles.completeText}>Puzzle Complete!</Text>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => {
              if (LEVELS[levelNumber + 1]) {
                router.replace(`/game/${levelNumber + 1}`);
              } else {
                router.back();
              }
            }}
          >
            <Text style={styles.nextButtonText}>
              {LEVELS[levelNumber + 1] ? 'Next Level' : 'Back to Menu'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <CrosswordKeyboard
        visible={crossword.selectedCell !== null && !crossword.isPuzzleComplete}
        onLetter={crossword.typeLetterIntoSelected}
        onDelete={crossword.deleteLetterFromSelected}
      />

      <WordRevealModal
        visible={crossword.revealModalWord !== null}
        wordInfo={crossword.revealModalWord}
        onDismiss={crossword.dismissRevealModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  completeBar: {
    backgroundColor: '#22c55e',
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  completeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  nextButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  nextButtonText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '700',
  },
});
