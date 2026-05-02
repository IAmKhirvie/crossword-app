import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../context/ProgressContext';
import { LEVELS, LEVEL_COUNT } from '../data/levels';

export default function LevelSelectScreen() {
  const router = useRouter();
  const { progress, isLoaded } = useProgress();

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  const levels = Array.from({ length: LEVEL_COUNT }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WordConnect</Text>
        <Text style={styles.headerSubtitle}>Learn new words with each puzzle!</Text>
      </View>
      <FlatList
        data={levels}
        keyExtractor={(item) => String(item)}
        contentContainerStyle={styles.list}
        renderItem={({ item: levelNumber }) => {
          const level = LEVELS[levelNumber];
          const levelProgress = progress.levels[levelNumber];
          const isCompleted = levelProgress?.completed ?? false;
          const isLocked =
            levelNumber > 1 && !progress.levels[levelNumber - 1]?.completed;
          const hintsUsed = levelProgress?.hintsUsed ?? 0;
          const wordsCompleted = levelProgress?.completedWordIds?.length ?? 0;
          const totalWords = level.words.length;

          return (
            <TouchableOpacity
              style={[
                styles.card,
                isCompleted && styles.cardCompleted,
                isLocked && styles.cardLocked,
              ]}
              onPress={() => {
                if (!isLocked) {
                  router.push(`/game/${levelNumber}`);
                }
              }}
              activeOpacity={isLocked ? 1 : 0.7}
            >
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.levelBadge,
                    isCompleted && styles.levelBadgeCompleted,
                    isLocked && styles.levelBadgeLocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.levelNumber,
                      isCompleted && styles.levelNumberCompleted,
                    ]}
                  >
                    {isLocked ? '\uD83D\uDD12' : isCompleted ? '\u2713' : levelNumber}
                  </Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, isLocked && styles.cardTitleLocked]}>
                  {level.title}
                </Text>
                <Text style={styles.cardMeta}>
                  {totalWords} words | {level.gridSize}x{level.gridSize} grid
                </Text>
                {wordsCompleted > 0 && !isCompleted && (
                  <Text style={styles.cardProgress}>
                    {wordsCompleted}/{totalWords} words found
                  </Text>
                )}
                {isCompleted && (
                  <Text style={styles.cardDone}>
                    Completed{hintsUsed > 0 ? ` (${hintsUsed} hints)` : ''}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#4A90D9',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ddeeff',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  cardCompleted: {
    backgroundColor: '#f0fdf0',
    borderColor: '#86efac',
    borderWidth: 1,
  },
  cardLocked: {
    opacity: 0.5,
  },
  cardLeft: {
    marginRight: 14,
  },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadgeCompleted: {
    backgroundColor: '#22c55e',
  },
  levelBadgeLocked: {
    backgroundColor: '#9CA3AF',
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  levelNumberCompleted: {
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  cardTitleLocked: {
    color: '#888',
  },
  cardMeta: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  cardProgress: {
    fontSize: 12,
    color: '#4A90D9',
    marginTop: 4,
    fontWeight: '600',
  },
  cardDone: {
    fontSize: 12,
    color: '#22c55e',
    marginTop: 4,
    fontWeight: '600',
  },
});
