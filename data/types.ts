export type Direction = 'across' | 'down';

export interface CellData {
  row: number;
  col: number;
  letter: string;
  clueNumber?: number;
  acrossWordId?: string;
  downWordId?: string;
  isBlack: boolean;
}

export interface WordEntry {
  id: string;
  word: string;
  direction: Direction;
  startRow: number;
  startCol: number;
  clueNumber: number;
  clue: string;
  definition: string;
  imageKey: string;
  pronunciation?: string;
}

export interface LevelData {
  levelNumber: number;
  title: string;
  gridSize: number;
  grid: (string | null)[][];
  words: WordEntry[];
}

export interface CellState {
  userLetter: string;
  isRevealed: boolean;
  isCorrect: boolean;
}

export type GridState = Record<string, CellState>;

export interface LevelProgress {
  levelNumber: number;
  completed: boolean;
  gridState: GridState;
  hintsUsed: number;
  completedWordIds: string[];
}

export interface AppProgress {
  levels: Record<number, LevelProgress>;
}

export interface CompletedWordInfo {
  wordEntry: WordEntry;
  imageSource: number;
}
