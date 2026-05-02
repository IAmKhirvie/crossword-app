import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettings } from '../context/SettingsContext';
import Slider from '@react-native-community/slider';
import { useSoundManager } from '../hooks/useSoundManager';


export default function SettingsScreen() {
    const { playSfx } = useSoundManager();

    const {
        keyboardHeight,
        musicEnabled,
        sfxEnabled,
        musicVolume,
        sfxVolume,
        updateSettings,
    } = useSettings();
    const router = useRouter();   

  const increaseHeight = () => updateSettings({ keyboardHeight: Math.min(keyboardHeight + 4, 64) });
  const decreaseHeight = () => updateSettings({ keyboardHeight: Math.max(keyboardHeight - 4, 36) });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ---- Keyboard Height ---- */}
      <View style={styles.settingRow}>
        <Text style={styles.label}>Keyboard Height</Text>
        <View style={styles.heightControl}>
            <TouchableOpacity onPress={decreaseHeight} style={styles.heightButton}>
                <Text style={styles.heightButtonText}>−</Text>
            </TouchableOpacity>
                <Text style={styles.heightValue}>{Math.round(keyboardHeight)}</Text>
            <TouchableOpacity onPress={increaseHeight} style={styles.heightButton}>
                <Text style={styles.heightButtonText}>+</Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* ---- Live preview of a key ---- */}
      <View style={styles.previewRow}>
        <View style={[styles.previewKey, { height: keyboardHeight }]}>
          <Text style={styles.previewKeyText}>A</Text>
        </View>
        <Text style={styles.previewLabel}>Live key size</Text>
      </View>

      {/* ---- Music toggle + volume ---- */}
      <View style={styles.settingRow}>
        <Text style={styles.label}>Music</Text>
        <Switch
          value={musicEnabled}
          onValueChange={val => updateSettings({ musicEnabled: val })}
          trackColor={{ false: '#767577', true: '#22c55e' }}
        />
      </View>
      {musicEnabled && (
        <View style={styles.volumeRow}>
          <Text style={styles.volumeLabel}>Vol</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.1}
            value={musicVolume}
            onValueChange={val => updateSettings({ musicVolume: val })}
            minimumTrackTintColor="#22c55e"
            thumbTintColor="#22c55e"
          />
          <Text style={styles.volumeValue}>{Math.round(musicVolume * 100)}%</Text>
        </View>
      )}

      {/* ---- Sound Effects toggle + volume ---- */}
      <View style={styles.settingRow}>
        <Text style={styles.label}>Sound Effects</Text>
        <Switch
          value={sfxEnabled}
          onValueChange={val => updateSettings({ sfxEnabled: val })}
          trackColor={{ false: '#767577', true: '#22c55e' }}
        />
      </View>
      {sfxEnabled && (
        <View style={styles.volumeRow}>
          <Text style={styles.volumeLabel}>Vol</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.1}
            value={sfxVolume}
            onValueChange={val => updateSettings({ sfxVolume: val })}
            minimumTrackTintColor="#22c55e"
            thumbTintColor="#22c55e"
          />
          <Text style={styles.volumeValue}>{Math.round(sfxVolume * 100)}%</Text>
        </View>
      )}

      {/* ---- Done ---- */}
      <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F4F8',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  heightControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heightButton: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heightButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  heightValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    minWidth: 32,
    textAlign: 'center',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    gap: 12,
  },
  previewKey: {
    backgroundColor: '#fff',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
  },
  previewKeyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  volumeLabel: {
    width: 40,
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  volumeValue: {
    width: 40,
    textAlign: 'right',
    fontSize: 14,
    color: '#555',
  },
  doneButton: {
    marginTop: 40,
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});