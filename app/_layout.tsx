import { Stack } from 'expo-router';
import { ProgressProvider } from '../context/ProgressContext';

export default function RootLayout() {
  return (
    <ProgressProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Crossword Puzzles' }} />
        <Stack.Screen name="game/[level]" options={{ headerShown: false }} />
      </Stack>
    </ProgressProvider>
  );
}
