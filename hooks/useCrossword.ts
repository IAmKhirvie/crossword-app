import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  CellData,
  CompletedWordInfo,
  Direction,
  GridState,
  LevelData,
  WordEntry,
} from '../data/types';
import { IMAGE_MAP } from '../data/imageMap';
import {
  buildCellMap,
  buildInitialGridState,
  cellKey,
  isWordComplete,
} from '../utils/crosswordHelpers';
import { useProgress } from '../context/ProgressContext';

export function useCrossword(levelData: LevelData) {
  const { saveLevelProgress, getLevelProgress } = useProgress();

  const { cellMap, wordCells, wordMap } = useMemo(
    () => buildCellMap(levelData),
    [levelData]
  );

  const savedProgress = getLevelProgress(levelData.levelNumber);

  const [gridState, setGridState] = useState<GridState>(() =>
    savedProgress?.gridState ?? buildInitialGridState(cellMap)
  );
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [activeDirection, setActiveDirection] = useState<Direction>('across');
  const [completedWordIds, setCompletedWordIds] = useState<Set<string>>(
    () => new Set(savedProgress?.completedWordIds ?? [])
  );
  const [hintsUsed, setHintsUsed] = useState(savedProgress?.hintsUsed ?? 0);
  const [revealModalQueue, setRevealModalQueue] = useState<CompletedWordInfo[]>([]);

  // Use refs to avoid stale closures
  const gridStateRef = useRef(gridState);
  gridStateRef.current = gridState;
  const selectedCellRef = useRef(selectedCell);
  selectedCellRef.current = selectedCell;
  const activeDirectionRef = useRef(activeDirection);
  activeDirectionRef.current = activeDirection;
  const completedWordIdsRef = useRef(completedWordIds);
  completedWordIdsRef.current = completedWordIds;

  const getSelectedWordId = useCallback(
    (cell: { row: number; col: number } | null, direction: Direction): string | null => {
      if (!cell) return null;
      const key = cellKey(cell.row, cell.col);
      const cellData = cellMap[key];
      if (!cellData) return null;
      if (direction === 'across' && cellData.acrossWordId) return cellData.acrossWordId;
      if (direction === 'down' && cellData.downWordId) return cellData.downWordId;
      return cellData.acrossWordId ?? cellData.downWordId ?? null;
    },
    [cellMap]
  );

  const selectedWordId = useMemo(
    () => getSelectedWordId(selectedCell, activeDirection),
    [selectedCell, activeDirection, getSelectedWordId]
  );

  const isPuzzleComplete = useMemo(
    () => levelData.words.every((w) => completedWordIds.has(w.id)),
    [completedWordIds, levelData.words]
  );

  // Persist progress
  const persistRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (persistRef.current) clearTimeout(persistRef.current);
    persistRef.current = setTimeout(() => {
      saveLevelProgress({
        levelNumber: levelData.levelNumber,
        completed: isPuzzleComplete,
        gridState,
        hintsUsed,
        completedWordIds: Array.from(completedWordIds),
      });
    }, 600);
  }, [gridState, hintsUsed, completedWordIds, isPuzzleComplete]);

  // Get next cell in a word (always advances, not just to empty cells)
  const getNextCell = useCallback(
    (wordId: string, currentKey: string, direction: 'forward' | 'backward'): string | null => {
      const cells = wordCells[wordId];
      if (!cells) return null;
      const idx = cells.indexOf(currentKey);
      if (idx === -1) return null;
      if (direction === 'forward') {
        return idx + 1 < cells.length ? cells[idx + 1] : null;
      } else {
        return idx > 0 ? cells[idx - 1] : null;
      }
    },
    [wordCells]
  );

  // Get next empty cell in a word (for hints)
  const getNextEmptyCell = useCallback(
    (wordId: string, currentKey: string, gs: GridState): string | null => {
      const cells = wordCells[wordId];
      if (!cells) return null;
      const idx = cells.indexOf(currentKey);
      if (idx === -1) return null;
      for (let i = idx + 1; i < cells.length; i++) {
        const s = gs[cells[i]];
        if (s && !s.isRevealed && !s.isCorrect && s.userLetter === '') {
          return cells[i];
        }
      }
      for (let i = 0; i < idx; i++) {
        const s = gs[cells[i]];
        if (s && !s.isRevealed && !s.isCorrect && s.userLetter === '') {
          return cells[i];
        }
      }
      return null;
    },
    [wordCells]
  );

  const parseCellKey = (key: string) => {
    const [r, c] = key.split('-').map(Number);
    return { row: r, col: c };
  };

  const checkWordCompletionForCell = useCallback(
    (key: string, nextGridState: GridState) => {
      const cell = cellMap[key];
      if (!cell) return;
      const wIds = [cell.acrossWordId, cell.downWordId].filter(Boolean) as string[];
      const currentCompleted = completedWordIdsRef.current;
      const newlyCompleted: CompletedWordInfo[] = [];
      const newIds: string[] = [];

      for (const wId of wIds) {
        if (currentCompleted.has(wId)) continue;
        if (isWordComplete(wId, wordCells, cellMap, nextGridState)) {
          newIds.push(wId);
          const wordEntry = wordMap[wId];
          if (wordEntry) {
            newlyCompleted.push({
              wordEntry,
              imageSource: IMAGE_MAP[wordEntry.imageKey] ?? 0,
            });
          }
        }
      }
      if (newIds.length > 0) {
        setCompletedWordIds((prev) => {
          const next = new Set(prev);
          for (const id of newIds) next.add(id);
          return next;
        });
        setRevealModalQueue((q) => [...q, ...newlyCompleted]);
      }
    },
    [cellMap, wordCells, wordMap]
  );

  const selectCell = useCallback(
    (row: number, col: number) => {
      const key = cellKey(row, col);
      const cell = cellMap[key];
      if (!cell || cell.isBlack) return;

      const current = selectedCellRef.current;
      if (
        current &&
        current.row === row &&
        current.col === col &&
        cell.acrossWordId &&
        cell.downWordId
      ) {
        setActiveDirection((d) => (d === 'across' ? 'down' : 'across'));
      } else {
        setSelectedCell({ row, col });
        if (cell.acrossWordId && !cell.downWordId) setActiveDirection('across');
        else if (cell.downWordId && !cell.acrossWordId) setActiveDirection('down');
      }
    },
    [cellMap]
  );

  const selectWord = useCallback(
    (wordId: string) => {
      const word = wordMap[wordId];
      if (!word) return;
      setActiveDirection(word.direction);
      setSelectedCell({ row: word.startRow, col: word.startCol });
    },
    [wordMap]
  );

  const typeLetterIntoSelected = useCallback(
    (letter: string) => {
      const sc = selectedCellRef.current;
      const dir = activeDirectionRef.current;
      if (!sc) return;
      const wId = getSelectedWordId(sc, dir);
      if (!wId) return;

      const key = cellKey(sc.row, sc.col);
      const gs = gridStateRef.current;
      const state = gs[key];

      if (!state || state.isRevealed || state.isCorrect) {
        // Skip to next cell
        const next = getNextCell(wId, key, 'forward');
        if (next) setSelectedCell(parseCellKey(next));
        return;
      }

      const nextGridState = {
        ...gs,
        [key]: { ...state, userLetter: letter.toUpperCase() },
      };
      setGridState(nextGridState);
      checkWordCompletionForCell(key, nextGridState);

      // Always advance to next cell in the word
      const next = getNextCell(wId, key, 'forward');
      if (next) {
        setSelectedCell(parseCellKey(next));
      }
    },
    [getSelectedWordId, getNextCell, checkWordCompletionForCell]
  );

  const deleteLetterFromSelected = useCallback(() => {
    const sc = selectedCellRef.current;
    const dir = activeDirectionRef.current;
    if (!sc) return;
    const wId = getSelectedWordId(sc, dir);
    if (!wId) return;

    const key = cellKey(sc.row, sc.col);
    const gs = gridStateRef.current;
    const state = gs[key];
    if (!state) return;

    if (state.userLetter && !state.isRevealed && !state.isCorrect) {
      setGridState((prev) => ({
        ...prev,
        [key]: { ...prev[key], userLetter: '' },
      }));
    } else {
      const prev = getNextCell(wId, key, 'backward');
      if (prev) {
        const prevState = gs[prev];
        if (prevState && !prevState.isRevealed && !prevState.isCorrect) {
          setGridState((g) => ({
            ...g,
            [prev]: { ...g[prev], userLetter: '' },
          }));
        }
        setSelectedCell(parseCellKey(prev));
      }
    }
  }, [getSelectedWordId, getNextCell]);

  const revealSelectedCell = useCallback(() => {
    const sc = selectedCellRef.current;
    if (!sc) return;
    const key = cellKey(sc.row, sc.col);
    const cell = cellMap[key];
    const gs = gridStateRef.current;
    const state = gs[key];
    if (!cell || !state || state.isRevealed || state.isCorrect) return;

    const nextGridState = {
      ...gs,
      [key]: {
        userLetter: cell.letter,
        isRevealed: true,
        isCorrect: true,
      },
    };
    setGridState(nextGridState);
    setHintsUsed((h) => h + 1);

    checkWordCompletionForCell(key, nextGridState);

    const dir = activeDirectionRef.current;
    const wId = getSelectedWordId(sc, dir);
    if (wId) {
      const next = getNextEmptyCell(wId, key, nextGridState);
      if (next) {
        setSelectedCell(parseCellKey(next));
      }
    }
  }, [cellMap, getSelectedWordId, getNextEmptyCell, checkWordCompletionForCell]);

  const dismissRevealModal = useCallback(() => {
    setRevealModalQueue((q) => q.slice(1));
  }, []);

  const resetLevel = useCallback(() => {
    setGridState(buildInitialGridState(cellMap));
    setCompletedWordIds(new Set());
    setHintsUsed(0);
    setSelectedCell(null);
    setRevealModalQueue([]);
  }, [cellMap]);

  return {
    levelData,
    cellMap,
    wordMap,
    wordCells,
    gridState,
    selectedCell,
    selectedWordId,
    activeDirection,
    completedWordIds,
    hintsUsed,
    isPuzzleComplete,
    revealModalWord: revealModalQueue[0] ?? null,
    selectCell,
    selectWord,
    typeLetterIntoSelected,
    deleteLetterFromSelected,
    revealSelectedCell,
    dismissRevealModal,
    resetLevel,
  };
}
