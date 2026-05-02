import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProgressProvider } from '../context/ProgressContext';
import { SettingsProvider } from '../context/SettingsContext';
import { useEffect } from 'react';
import { useSoundManager } from '../hooks/useSoundManager';

function AppMusicController() {
  const { playMusic, stopMusic, isLoaded } = useSoundManager();

  useEffect(() => {
    if (isLoaded) {
      playMusic();
    }
    return () => {
      stopMusic();      // ✅ call, but don’t return the promise
    };
  }, [isLoaded]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <ProgressProvider>
          <Stack>
            <Stack.Screen name="index" options={{ title: 'WordConnect' }} />
            <Stack.Screen name="game/[level]" options={{ headerShown: false }} />
          </Stack>
          <AppMusicController />
        </ProgressProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}