import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { CompletedWordInfo } from '../data/types';

interface WordRevealModalProps {
  visible: boolean;
  wordInfo: CompletedWordInfo | null;
  onDismiss: () => void;
}

export function WordRevealModal({ visible, wordInfo, onDismiss }: WordRevealModalProps) {
  if (!wordInfo) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.word}>{wordInfo.wordEntry.word}</Text>

            <View style={styles.imageContainer}>
              <Image
                source={wordInfo.imageSource}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.pronunciation}>{wordInfo.wordEntry.pronunciation}</Text>
            <Text style={styles.definition}>{wordInfo.wordEntry.definition}</Text>

            <TouchableOpacity style={styles.button} onPress={onDismiss}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '85%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 40,
    color: '#4CAF50',
    marginBottom: 8,
  },
  word: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    letterSpacing: 2,
    marginBottom: 16,
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 180,
  },
  pronunciation: {
    fontSize: 18,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  definition: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
