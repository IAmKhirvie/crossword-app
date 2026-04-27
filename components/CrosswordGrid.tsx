import React from 'react';
import { View, ScrollView, useWindowDimensions, StyleSheet } from 'react-native';
import { CellData, GridState, LevelData } from '../data/types';
import { cellKey } from '../utils/crosswordHelpers';
import { CrosswordCell, CellHighlight } from './CrosswordCell';

interface CrosswordGridProps {
  levelData: LevelData;
  cellMap: Record<string, CellData>;
  gridState: GridState;
  selectedCell: { row: number; col: number } | null;
  selectedWordId: string | null;
  wordCells: Record<string, string[]>;
  onCellPress: (row: number, col: number) => void;
}

export function CrosswordGrid({
  levelData,
  cellMap,
  gridState,
  selectedCell,
  selectedWordId,
  wordCells,
  onCellPress,
}: CrosswordGridProps) {
  const { width } = useWindowDimensions();
  const cellSize = Math.floor((width - 32) / levelData.gridSize);

  const highlightedCells = new Set<string>();
  if (selectedWordId && wordCells[selectedWordId]) {
    for (const k of wordCells[selectedWordId]) {
      highlightedCells.add(k);
    }
  }

  const grid = [];
  for (let r = 0; r < levelData.gridSize; r++) {
    const row = [];
    for (let c = 0; c < levelData.gridSize; c++) {
      const key = cellKey(r, c);
      const cell = cellMap[key] ?? null;
      const isBlack = !cell;

      let highlight: CellHighlight = 'none';
      if (selectedCell && selectedCell.row === r && selectedCell.col === c) {
        highlight = 'selected-cell';
      } else if (highlightedCells.has(key)) {
        highlight = 'selected-word';
      }

      row.push(
        <CrosswordCell
          key={key}
          cellData={isBlack ? null : cell}
          cellState={gridState[key]}
          highlight={highlight}
          cellSize={cellSize}
          onPress={() => onCellPress(r, c)}
        />
      );
    }
    grid.push(
      <View key={`row-${r}`} style={styles.row}>
        {row}
      </View>
    );
  }

  const gridWidth = cellSize * levelData.gridSize;
  const needsScroll = gridWidth > width - 16;

  const content = (
    <View style={[styles.grid, { borderWidth: 2, borderColor: '#333' }]}>{grid}</View>
  );

  if (needsScroll) {
    return (
      <ScrollView horizontal style={styles.container}>
        <ScrollView>{content}</ScrollView>
      </ScrollView>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  grid: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
});
