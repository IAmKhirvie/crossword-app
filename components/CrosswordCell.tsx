import React, { memo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { CellData, CellState } from '../data/types';

export type CellHighlight = 'none' | 'selected-word' | 'selected-cell';

interface CrosswordCellProps {
  cellData: CellData | null;
  cellState: CellState | undefined;
  highlight: CellHighlight;
  cellSize: number;
  onPress: () => void;
}

function CrosswordCellInner({
  cellData,
  cellState,
  highlight,
  cellSize,
  onPress,
}: CrosswordCellProps) {
  if (!cellData || cellData.isBlack) {
    return (
      <View
        style={[
          styles.cell,
          { width: cellSize, height: cellSize, backgroundColor: '#1a1a1a' },
        ]}
      />
    );
  }

  let bg = '#FFFFFF';
  if (highlight === 'selected-cell') bg = '#F6C90E';
  else if (highlight === 'selected-word') bg = '#B8D8F8';
  if (cellState?.isRevealed) bg = highlight === 'selected-cell' ? '#F6C90E' : '#FFE4E1';

  const letterColor = cellState?.isRevealed ? '#8B0000' : '#000';
  const displayLetter = cellState?.userLetter || '';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.cell,
        {
          width: cellSize,
          height: cellSize,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: '#999',
        },
      ]}
    >
      {cellData.clueNumber !== undefined && (
        <Text style={[styles.clueNumber, { fontSize: Math.max(cellSize * 0.22, 7) }]}>
          {cellData.clueNumber}
        </Text>
      )}
      <Text
        style={[
          styles.letter,
          {
            fontSize: cellSize * 0.5,
            color: letterColor,
          },
        ]}
      >
        {displayLetter}
      </Text>
    </TouchableOpacity>
  );
}

export const CrosswordCell = memo(CrosswordCellInner);

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  clueNumber: {
    position: 'absolute',
    top: 1,
    left: 2,
    fontWeight: '600',
    color: '#333',
  },
  letter: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
