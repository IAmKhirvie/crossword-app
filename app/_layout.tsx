import { Stack } from 'expo-router';
import { ProgressProvider } from '../context/ProgressContext';

export default function RootLayout() {
  return (
    <ProgressProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'WordConnect' }} />
        <Stack.Screen name="game/[level]" options={{ headerShown: false }} />
      </Stack>
    </ProgressProvider>
  );
}
