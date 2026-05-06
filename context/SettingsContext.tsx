import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
  keyboardHeight: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;   // 0.0 – 1.0
  sfxVolume: number;     // 0.0 – 1.0
}

interface SettingsContextType extends Settings {
  updateSettings: (partial: Partial<Settings>) => void;
}

const defaults: Settings = {
  keyboardHeight: 44,
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.8,
  sfxVolume: 1.0,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaults);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('user-settings');
      if (stored) setSettings(prev => ({ ...prev, ...JSON.parse(stored) }));
    })();
  }, []);

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...partial };
      AsyncStorage.setItem('user-settings', JSON.stringify(newSettings)).catch(() => {});
      return newSettings;
    });
  };

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}