import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProgress, LevelProgress } from '../data/types';

const STORAGE_KEY = '@crossword_app/progress';

interface ProgressContextValue {
  progress: AppProgress;
  isLoaded: boolean;
  saveLevelProgress: (lp: LevelProgress) => void;
  getLevelProgress: (levelNumber: number) => LevelProgress | undefined;
  resetAllProgress: () => Promise<void>;
}

const defaultProgress: AppProgress = { levels: {} };

const ProgressContext = createContext<ProgressContextValue>({
  progress: defaultProgress,
  isLoaded: false,
  saveLevelProgress: () => {},
  getLevelProgress: () => undefined,
  resetAllProgress: async () => {},
});

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<AppProgress>(defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestProgress = useRef(progress);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          setProgress(JSON.parse(data));
        } catch {}
      }
      setIsLoaded(true);
    });
  }, []);

  const persistProgress = useCallback((p: AppProgress) => {
    latestProgress.current = p;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(latestProgress.current));
    }, 500);
  }, []);

  const saveLevelProgress = useCallback((lp: LevelProgress) => {
    setProgress((prev) => {
      const next = {
        ...prev,
        levels: { ...prev.levels, [lp.levelNumber]: lp },
      };
      persistProgress(next);
      return next;
    });
  }, [persistProgress]);

  const getLevelProgress = useCallback(
    (levelNumber: number) => progress.levels[levelNumber],
    [progress]
  );

  const resetAllProgress = useCallback(async () => {
    setProgress(defaultProgress);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ProgressContext.Provider
      value={{ progress, isLoaded, saveLevelProgress, getLevelProgress, resetAllProgress }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => useContext(ProgressContext);
