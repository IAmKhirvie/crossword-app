import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  CellData,
  CellState,
  CompletedWordInfo,
  Direction,
  GridState,
  LevelData,
  LevelProgress,
  WordEntry,
} from '../data/types';
import { IMAGE_MAP } from '../data/imageMap';
import {
  buildCellMap,
  buildInitialGridState,
  cellKey,
  getNextCellInWord,
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

  const selectedWordId = useMemo(() => {
    if (!selectedCell) return null;
    const key = cellKey(selectedCell.row, selectedCell.col);
    const cell = cellMap[key];
    if (!cell) return null;
    if (activeDirection === 'across' && cell.acrossWordId) return cell.acrossWordId;
    if (activeDirection === 'down' && cell.downWordId) return cell.downWordId;
    return cell.acrossWordId ?? cell.downWordId ?? null;
  }, [selectedCell, activeDirection, cellMap]);

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

  const checkWordCompletionForCell = useCallback(
    (key: string, nextGridState: GridState) => {
      const cell = cellMap[key];
      if (!cell) return;
      const wordIds = [cell.acrossWordId, cell.downWordId].filter(Boolean) as string[];
      const newlyCompleted: CompletedWordInfo[] = [];
      for (const wId of wordIds) {
        if (completedWordIds.has(wId)) continue;
        if (isWordComplete(wId, wordCells, cellMap, nextGridState)) {
          completedWordIds.add(wId);
          const wordEntry = wordMap[wId];
          if (wordEntry) {
            newlyCompleted.push({
              wordEntry,
              imageSource: IMAGE_MAP[wordEntry.imageKey] ?? IMAGE_MAP['placeholder'] ?? 0,
            });
          }
        }
      }
      if (newlyCompleted.length > 0) {
        setCompletedWordIds(new Set(completedWordIds));
        setRevealModalQueue((q) => [...q, ...newlyCompleted]);
      }
    },
    [cellMap, wordCells, wordMap, completedWordIds]
  );

  const selectCell = useCallback(
    (row: number, col: number) => {
      const key = cellKey(row, col);
      const cell = cellMap[key];
      if (!cell || cell.isBlack) return;

      if (
        selectedCell &&
        selectedCell.row === row &&
        selectedCell.col === col &&
        cell.acrossWordId &&
        cell.downWordId
      ) {
        setActiveDirection((d) => (d === 'across' ? 'down' : 'across'));
      } else {
        setSelectedCell({ row, col });
        // Auto-detect direction
        if (cell.acrossWordId && !cell.downWordId) setActiveDirection('across');
        else if (cell.downWordId && !cell.acrossWordId) setActiveDirection('down');
      }
    },
    [selectedCell, cellMap]
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
      if (!selectedCell || !selectedWordId) return;
      const key = cellKey(selectedCell.row, selectedCell.col);
      const state = gridState[key];
      if (!state || state.isRevealed || state.isCorrect) {
        // Try to advance to next empty cell
        const next = getNextCellInWord(selectedWordId, key, wordCells, gridState, 'forward');
        if (next) {
          const [r, c] = next.split('-').map(Number);
          setSelectedCell({ row: r, col: c });
        }
        return;
      }

      const nextGridState = {
        ...gridState,
        [key]: { ...state, userLetter: letter.toUpperCase() },
      };
      setGridState(nextGridState);

      checkWordCompletionForCell(key, nextGridState);

      // Advance cursor
      const next = getNextCellInWord(selectedWordId, key, wordCells, nextGridState, 'forward');
      if (next) {
        const [r, c] = next.split('-').map(Number);
        setSelectedCell({ row: r, col: c });
      }
    },
    [selectedCell, selectedWordId, gridState, wordCells, checkWordCompletionForCell]
  );

  const deleteLetterFromSelected = useCallback(() => {
    if (!selectedCell || !selectedWordId) return;
    const key = cellKey(selectedCell.row, selectedCell.col);
    const state = gridState[key];
    if (!state) return;

    if (state.userLetter && !state.isRevealed && !state.isCorrect) {
      setGridState((prev) => ({
        ...prev,
        [key]: { ...prev[key], userLetter: '' },
      }));
    } else {
      // Move backward
      const prev = getNextCellInWord(selectedWordId, key, wordCells, gridState, 'backward');
      if (prev) {
        const [r, c] = prev.split('-').map(Number);
        const prevState = gridState[prev];
        if (prevState && !prevState.isRevealed && !prevState.isCorrect) {
          setGridState((gs) => ({
            ...gs,
            [prev]: { ...gs[prev], userLetter: '' },
          }));
        }
        setSelectedCell({ row: r, col: c });
      }
    }
  }, [selectedCell, selectedWordId, gridState, wordCells]);

  const revealSelectedCell = useCallback(() => {
    if (!selectedCell) return;
    const key = cellKey(selectedCell.row, selectedCell.col);
    const cell = cellMap[key];
    const state = gridState[key];
    if (!cell || !state || state.isRevealed || state.isCorrect) return;

    const nextGridState = {
      ...gridState,
      [key]: {
        userLetter: cell.letter,
        isRevealed: true,
        isCorrect: true,
      },
    };
    setGridState(nextGridState);
    setHintsUsed((h) => h + 1);

    checkWordCompletionForCell(key, nextGridState);

    // Advance to next empty cell
    if (selectedWordId) {
      const next = getNextCellInWord(selectedWordId, key, wordCells, nextGridState, 'forward');
      if (next) {
        const [r, c] = next.split('-').map(Number);
        setSelectedCell({ row: r, col: c });
      }
    }
  }, [selectedCell, selectedWordId, cellMap, gridState, wordCells, checkWordCompletionForCell]);

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
