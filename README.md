# Crossword Puzzle App

An educational crossword puzzle mobile app that teaches vocabulary through 10 progressively harder levels. Built with React Native + Expo.

## Features

- 10 hardcoded levels with increasing difficulty (7x7 to 15x15 grids)
- Across and Down clue panels
- Reveal Letter hint system
- Word completion modal showing image + definition
- Progress saved automatically between sessions
- Custom keyboard (no native keyboard issues)
- Level locking — complete each level to unlock the next

## Level Themes

1. Getting Started (5 words)
2. Food & Drink (5 words)
3. The Animal Kingdom (6 words)
4. Science Basics (7 words)
5. Geography (8 words)
6. World of Music (9 words)
7. Architecture (9 words)
8. Literature (11 words)
9. Philosophy (13 words)
10. Advanced Science (14 words)

## Project Structure

```
crossword-app/
├── app/
│   ├── _layout.tsx                 # Root layout (includes SafeAreaProvider, SettingsProvider, ProgressProvider, AppMusicController)
│   ├── index.tsx                   # Level Select screen (with gear icon linking to /settings)
│   ├── settings.tsx               # Settings screen – keyboard height, music/SFX toggles + volume sliders, live key preview
│   └── game/
│       └── [level].tsx             # Game screen
│
├── components/
│   ├── CrosswordGrid.tsx
│   ├── CrosswordCell.tsx
│   ├── ClueList.tsx
│   ├── CrosswordKeyboard.tsx      # Keyboard now respects user-set keyboardHeight from Settings
│   ├── WordRevealModal.tsx        # Can show part of speech & pronunciation (if data present)
│   └── GameHeader.tsx
│
├── hooks/
│   ├── useCrossword.ts            # Game logic + sound triggers (error/ding/complete)
│   └── useSoundManager.ts         # New – loads & plays SFX + background music, real-time volume control
│
├── context/
│   ├── ProgressContext.tsx        # Game progress persistence
│   └── SettingsContext.tsx        # New – persists keyboardHeight, musicEnabled, sfxEnabled, musicVolume, sfxVolume
│
├── utils/
│   └── crosswordHelpers.ts
│
├── data/
│   ├── types.ts                   # WordEntry now optionally includes partOfSpeech & pronunciation
│   ├── imageMap.ts
│   └── levels/
│       ├── index.ts
│       ├── level1.ts … level10.ts  # Add “partOfSpeech” and “pronunciation” fields to each word
│
├── assets/
│   ├── images/
│   │   └── placeholder.png
│   ├── sounds/                    # New – audio files for SFX & music
│   │   ├── ding.mp3
│   │   ├── complete.mp3
│   │   ├── error.mp3
│   │   └── bg-music.mp3
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash-icon.png
│   └── favicon.png
│
├── app.json
├── package.json                   # Now includes expo-av, @react-native-async-storage/async-storage, @react-native-community/slider, etc.
├── tsconfig.json
└── index.ts
```

### How to Add a New Level

1. Create `data/levels/level11.ts` following the same format as existing levels
2. Define the `grid` (2D array where `null` = black cell, letter = answer)
3. Define the `words` array with clue numbers, positions, clues, and definitions
4. Add it to `data/levels/index.ts` and update `LEVEL_COUNT`
5. Add image entries to `data/imageMap.ts` for each new word

### How to Add Real Images

1. Put image files (PNG/JPG) in `assets/images/` (e.g., `assets/images/apple.png`)
2. Update `data/imageMap.ts` to point each word's key to its image:
   ```typescript
   apple: require('../assets/images/apple.png'),
   ```

## How to Run

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Expo Go](https://expo.dev/go) app on your phone (iOS or Android)

### Steps

1. Clone the repo:
   ```bash
   git clone https://github.com/IAmKhirvie/crossword-app.git
   cd crossword-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the dev server:
   ```bash
   npx expo start
   ```

4. Scan the QR code with your phone:
   - **iPhone**: Open the Camera app and point it at the QR code
   - **Android**: Open Expo Go and tap "Scan QR Code"

   Make sure your phone and computer are on the same WiFi network.

## Tech Stack

- React Native + Expo (TypeScript)
- Expo Router (file-based navigation)
- AsyncStorage (progress persistence)
- Custom QWERTY keyboard component
