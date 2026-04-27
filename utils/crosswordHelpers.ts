import { CellData, CellState, Direction, GridState, LevelData, WordEntry } from '../data/types';

export const cellKey = (row: number, col: number): string => `${row}-${col}`;

export function buildCellMap(levelData: LevelData): {
  cellMap: Record<string, CellData>;
  wordCells: Record<string, string[]>;
  wordMap: Record<string, WordEntry>;
} {
  const cellMap: Record<string, CellData> = {};
  const wordCells: Record<string, string[]> = {};
  const wordMap: Record<string, WordEntry> = {};

  // Initialize all non-black cells from the grid
  for (let r = 0; r < levelData.gridSize; r++) {
    for (let c = 0; c < levelData.gridSize; c++) {
      const letter = levelData.grid[r]?.[c];
      if (letter !== null && letter !== undefined) {
        const key = cellKey(r, c);
        cellMap[key] = {
          row: r,
          col: c,
          letter: letter.toUpperCase(),
          isBlack: false,
        };
      }
    }
  }

  // Assign word ids and clue numbers to cells
  for (const word of levelData.words) {
    wordMap[word.id] = word;
    const cells: string[] = [];

    for (let i = 0; i < word.word.length; i++) {
      const r = word.direction === 'down' ? word.startRow + i : word.startRow;
      const c = word.direction === 'across' ? word.startCol + i : word.startCol;
      const key = cellKey(r, c);

      if (!cellMap[key]) {
        cellMap[key] = {
          row: r,
          col: c,
          letter: word.word[i].toUpperCase(),
          isBlack: false,
        };
      }

      if (word.direction === 'across') {
        cellMap[key].acrossWordId = word.id;
      } else {
        cellMap[key].downWordId = word.id;
      }

      // Assign clue number to starting cell
      if (i === 0) {
        cellMap[key].clueNumber = word.clueNumber;
      }

      cells.push(key);
    }

    wordCells[word.id] = cells;
  }

  return { cellMap, wordCells, wordMap };
}

export function buildInitialGridState(cellMap: Record<string, CellData>): GridState {
  const state: GridState = {};
  for (const key of Object.keys(cellMap)) {
    state[key] = { userLetter: '', isRevealed: false, isCorrect: false };
  }
  return state;
}

export function isWordComplete(
  wordId: string,
  wordCells: Record<string, string[]>,
  cellMap: Record<string, CellData>,
  gridState: GridState
): boolean {
  const cells = wordCells[wordId];
  if (!cells) return false;
  return cells.every((key) => {
    const cell = cellMap[key];
    const state = gridState[key];
    if (!cell || !state) return false;
    return state.isRevealed || state.isCorrect || state.userLetter === cell.letter;
  });
}

export function getNextCellInWord(
  wordId: string,
  currentKey: string,
  wordCells: Record<string, string[]>,
  gridState: GridState,
  direction: 'forward' | 'backward'
): string | null {
  const cells = wordCells[wordId];
  if (!cells) return null;
  const idx = cells.indexOf(currentKey);
  if (idx === -1) return null;

  if (direction === 'forward') {
    // Find next unfilled cell after current
    for (let i = idx + 1; i < cells.length; i++) {
      const s = gridState[cells[i]];
      if (s && !s.isRevealed && !s.isCorrect && s.userLetter === '') {
        return cells[i];
      }
    }
    // Wrap: find first unfilled cell from start
    for (let i = 0; i < idx; i++) {
      const s = gridState[cells[i]];
      if (s && !s.isRevealed && !s.isCorrect && s.userLetter === '') {
        return cells[i];
      }
    }
    // All filled: stay at current
    return null;
  } else {
    if (idx > 0) return cells[idx - 1];
    return null;
  }
}

export function validateLevelData(level: LevelData): string[] {
  const errors: string[] = [];

  if (level.grid.length !== level.gridSize) {
    errors.push(`Grid has ${level.grid.length} rows, expected ${level.gridSize}`);
  }

  for (let r = 0; r < level.grid.length; r++) {
    if (level.grid[r].length !== level.gridSize) {
      errors.push(`Row ${r} has ${level.grid[r].length} cols, expected ${level.gridSize}`);
    }
  }

  for (const word of level.words) {
    for (let i = 0; i < word.word.length; i++) {
      const r = word.direction === 'down' ? word.startRow + i : word.startRow;
      const c = word.direction === 'across' ? word.startCol + i : word.startCol;
      const gridLetter = level.grid[r]?.[c];
      const wordLetter = word.word[i].toUpperCase();
      if (!gridLetter) {
        errors.push(`Word ${word.id} at (${r},${c}): grid is null/black but word expects '${wordLetter}'`);
      } else if (gridLetter.toUpperCase() !== wordLetter) {
        errors.push(`Word ${word.id} at (${r},${c}): grid='${gridLetter}' but word='${wordLetter}'`);
      }
    }
  }

  return errors;
}
