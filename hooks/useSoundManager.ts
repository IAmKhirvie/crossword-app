import { useEffect, useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { useSettings } from '../context/SettingsContext';

let sfxSounds: { [key: string]: Audio.Sound } = {};
let musicInstance: Audio.Sound | null = null;

export function useSoundManager() {
  const { sfxEnabled, musicEnabled, musicVolume, sfxVolume } = useSettings();
  const [isLoaded, setIsLoaded] = useState(false);
  const restartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --------------------- Load sounds once ---------------------
  useEffect(() => {
    let cancelled = false;

    const loadSounds = async () => {
      try {
        const { sound: ding } = await Audio.Sound.createAsync(
          require('../assets/sounds/ding.mp3')
        );
        const { sound: complete } = await Audio.Sound.createAsync(
          require('../assets/sounds/complete.mp3')
        );
        const { sound: error } = await Audio.Sound.createAsync(
          require('../assets/sounds/error.mp3')
        );
        sfxSounds = { ding, complete, error };

        const { sound: music } = await Audio.Sound.createAsync(
          require('../assets/sounds/bg-music.mp3'),
          { isLooping: true, volume: musicVolume }
        );
        musicInstance = music;

        if (!cancelled) setIsLoaded(true);
      } catch (err) {
        console.warn('Failed to load sound files:', err);
        if (!cancelled) setIsLoaded(true);
      }
    };

    loadSounds();

    return () => {
      cancelled = true;
      Object.values(sfxSounds).forEach(s => s.unloadAsync());
      if (musicInstance) {
        musicInstance.unloadAsync();
        musicInstance = null;
      }
    };
  }, []);

  // --------------------- Real‑time volume (setStatusAsync) ---------------------
  useEffect(() => {
    if (musicInstance) {
      musicInstance
        .setStatusAsync({ volume: musicVolume })
        .catch(err => console.warn('Failed to set music volume:', err));
    }
  }, [musicVolume]);

  // --------------------- Fallback: debounced restart on volume change ---------------------
  useEffect(() => {
    if (restartTimer.current) clearTimeout(restartTimer.current);

    restartTimer.current = setTimeout(async () => {
      if (musicInstance && musicEnabled) {
        const status = await musicInstance.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await musicInstance.stopAsync();
          await musicInstance.setStatusAsync({ volume: musicVolume });
          await musicInstance.playAsync();
        }
      }
    }, 300);

    return () => {
      if (restartTimer.current) clearTimeout(restartTimer.current);
    };
  }, [musicVolume, musicEnabled]);

  // --------------------- Play SFX ---------------------
  const playSfx = useCallback(
    async (name: 'ding' | 'complete' | 'error') => {
      if (!isLoaded || !sfxEnabled) return;
      const sound = sfxSounds[name];
      if (sound) {
        try {
          await sound.setStatusAsync({ volume: sfxVolume, positionMillis: 0 });
          await sound.playAsync();
        } catch {}
      }
    },
    [isLoaded, sfxEnabled, sfxVolume]
  );

  // --------------------- Play / Stop Music ---------------------
  const playMusic = useCallback(async () => {
    if (!isLoaded || !musicEnabled || !musicInstance) return;
    const status = await musicInstance.getStatusAsync();
    if (status.isLoaded && !status.isPlaying) {
      await musicInstance.setStatusAsync({ volume: musicVolume });
      await musicInstance.playAsync();
    }
  }, [isLoaded, musicEnabled, musicVolume]);

  const stopMusic = useCallback(async () => {
    if (!musicInstance) return;
    const status = await musicInstance.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await musicInstance.stopAsync();
    }
  }, []);

  return { playSfx, playMusic, stopMusic, isLoaded };
}