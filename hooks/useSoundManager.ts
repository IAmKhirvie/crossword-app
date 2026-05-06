import { useEffect, useState, useCallback } from 'react';
import { Audio } from 'expo-av';
import { useSettings } from '../context/SettingsContext';

// ── Singleton state shared across all hook consumers ──
let sfxSounds: { [key: string]: Audio.Sound } = {};
let musicInstance: Audio.Sound | null = null;
let mountCount = 0;
let loadingPromise: Promise<void> | null = null;
let globalIsLoaded = false;

export function useSoundManager() {
  const { sfxEnabled, musicEnabled, musicVolume, sfxVolume } = useSettings();
  const [isLoaded, setIsLoaded] = useState(globalIsLoaded);

  // Load sounds once — shared across every component that calls this hook
  useEffect(() => {
    mountCount++;

    if (!loadingPromise) {
      loadingPromise = (async () => {
        try {
          await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

          const [ding, complete, error, music] = await Promise.all([
            Audio.Sound.createAsync(require('../assets/sounds/ding.mp3')),
            Audio.Sound.createAsync(require('../assets/sounds/complete.mp3')),
            Audio.Sound.createAsync(require('../assets/sounds/error.mp3')),
            Audio.Sound.createAsync(require('../assets/sounds/bg-music.mp3'), {
              isLooping: true,
              volume: 0.8,
            }),
          ]);

          sfxSounds = {
            ding: ding.sound,
            complete: complete.sound,
            error: error.sound,
          };
          musicInstance = music.sound;
          globalIsLoaded = true;
        } catch (err) {
          console.warn('Failed to load sound files:', err);
          globalIsLoaded = true; // let app continue without sound
        }
      })();
    }

    loadingPromise.then(() => setIsLoaded(true));

    return () => {
      mountCount--;
      // Only unload when the very last consumer unmounts
      if (mountCount === 0) {
        Object.values(sfxSounds).forEach(s => s.unloadAsync());
        sfxSounds = {};
        if (musicInstance) {
          musicInstance.unloadAsync();
          musicInstance = null;
        }
        loadingPromise = null;
        globalIsLoaded = false;
      }
    };
  }, []);

  // ── Adjust music volume in real-time ──
  useEffect(() => {
    if (!musicInstance || !globalIsLoaded) return;
    musicInstance
      .setStatusAsync({ volume: musicVolume })
      .catch(() => {});
  }, [musicVolume]);

  // ── Toggle music on/off when setting changes ──
  useEffect(() => {
    if (!musicInstance || !isLoaded) return;
    (async () => {
      try {
        const status = await musicInstance!.getStatusAsync();
        if (!status.isLoaded) return;
        if (musicEnabled && !status.isPlaying) {
          await musicInstance!.setStatusAsync({ volume: musicVolume });
          await musicInstance!.playAsync();
        } else if (!musicEnabled && status.isPlaying) {
          await musicInstance!.stopAsync();
        }
      } catch {}
    })();
  }, [musicEnabled, isLoaded]);

  // ── Adjust SFX volume on existing loaded sounds ──
  useEffect(() => {
    if (!globalIsLoaded) return;
    Object.values(sfxSounds).forEach(s => {
      s.setStatusAsync({ volume: sfxVolume }).catch(() => {});
    });
  }, [sfxVolume]);

  // ── Play a sound effect ──
  const playSfx = useCallback(
    async (name: 'ding' | 'complete' | 'error') => {
      if (!sfxEnabled || !globalIsLoaded) return;
      const sound = sfxSounds[name];
      if (sound) {
        try {
          await sound.setStatusAsync({ volume: sfxVolume, positionMillis: 0 });
          await sound.playAsync();
        } catch {}
      }
    },
    [sfxEnabled, sfxVolume]
  );

  // ── Play / Stop background music ──
  const playMusic = useCallback(async () => {
    if (!musicEnabled || !musicInstance || !globalIsLoaded) return;
    try {
      const status = await musicInstance.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        await musicInstance.setStatusAsync({ volume: musicVolume });
        await musicInstance.playAsync();
      }
    } catch {}
  }, [musicEnabled, musicVolume]);

  const stopMusic = useCallback(async () => {
    if (!musicInstance) return;
    try {
      const status = await musicInstance.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await musicInstance.stopAsync();
      }
    } catch {}
  }, []);

  return { playSfx, playMusic, stopMusic, isLoaded };
}
