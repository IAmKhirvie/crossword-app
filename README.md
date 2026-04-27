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
├── app/                        # Screens (Expo Router file-based navigation)
│   ├── _layout.tsx             # Root layout — wraps the whole app with the navigation
│   │                             stack and the ProgressProvider for saved progress
│   ├── index.tsx               # Level Select screen — the home screen showing all 10
│   │                             level cards with lock/unlock status and progress info
│   └── game/
│       └── [level].tsx         # Game screen — this is where the actual crossword puzzle
│                                 is played. Wires together the grid, clues, keyboard,
│                                 hint button, and word reveal modal
│
├── components/                 # Reusable UI components
│   ├── CrosswordGrid.tsx       # Renders the 2D crossword grid — calculates cell sizes
│   │                             based on screen width, handles cell highlighting
│   │                             (selected cell, selected word, revealed cells)
│   ├── CrosswordCell.tsx       # A single cell in the grid — displays the letter, clue
│   │                             number in the corner, and background color based on
│   │                             its state (selected, highlighted, revealed, black)
│   ├── ClueList.tsx            # The Across/Down clue panel below the grid — has two
│   │                             tabs, auto-scrolls to the active clue, shows
│   │                             strikethrough on completed words
│   ├── CrosswordKeyboard.tsx   # Custom QWERTY keyboard (A-Z + backspace) — used
│   │                             instead of the native keyboard to avoid layout issues
│   │                             on mobile. Only visible when a cell is selected
│   ├── WordRevealModal.tsx     # Pop-up modal that appears when a word is completed —
│   │                             shows the word, an image, and its definition with a
│   │                             "Continue" button to dismiss
│   └── GameHeader.tsx          # Top bar on the game screen — has the back button,
│                                 level title, and the hint/reveal button with hint count
│
├── hooks/                      # Custom React hooks
│   └── useCrossword.ts         # The brain of the game — manages all game state:
│                                 selected cell, active direction, grid letters, word
│                                 completion detection, hint reveals, cursor movement,
│                                 and triggers the word reveal modal queue
│
├── context/                    # React Context providers
│   └── ProgressContext.tsx     # Saves and loads player progress using AsyncStorage —
│                                 tracks which levels are completed, grid state for
│                                 resuming, hints used, and completed words. Auto-saves
│                                 with a 500ms debounce so it doesn't write on every keystroke
│
├── utils/                      # Helper functions
│   └── crosswordHelpers.ts     # Core logic functions: builds the cell map from level
│                                 data, checks if a word is complete, navigates between
│                                 cells in a word, and validates that level data grids
│                                 match their word coordinates
│
├── data/                       # All game data (hardcoded, no server needed)
│   ├── types.ts                # TypeScript type definitions for everything — CellData,
│   │                             WordEntry, LevelData, GridState, LevelProgress, etc.
│   │                             Every other file's types flow from here
│   ├── imageMap.ts             # Maps word imageKeys (like "apple", "bear") to bundled
│   │                             image files. Currently all point to placeholder.png —
│   │                             replace with real images here
│   └── levels/                 # One file per level with the crossword grid and words
│       ├── index.ts            # Exports all 10 levels as a LEVELS record for easy lookup
│       ├── level1.ts           # Level 1: "Getting Started" — 7x7 grid, 5 words
│       ├── level2.ts           # Level 2: "Food & Drink" — 8x8 grid, 5 words
│       ├── level3.ts           # Level 3: "Animal Kingdom" — 9x9 grid, 6 words
│       ├── level4.ts           # Level 4: "Science Basics" — 10x10 grid, 7 words
│       ├── level5.ts           # Level 5: "Geography" — 11x11 grid, 8 words
│       ├── level6.ts           # Level 6: "World of Music" — 11x11 grid, 9 words
│       ├── level7.ts           # Level 7: "Architecture" — 12x12 grid, 9 words
│       ├── level8.ts           # Level 8: "Literature" — 12x12 grid, 11 words
│       ├── level9.ts           # Level 9: "Philosophy" — 13x13 grid, 13 words
│       └── level10.ts          # Level 10: "Advanced Science" — 15x15 grid, 14 words
│
├── assets/                     # Static assets bundled with the app
│   ├── images/
│   │   └── placeholder.png     # Default placeholder image shown in the word reveal
│   │                             modal. Replace individual word images in imageMap.ts
│   ├── icon.png                # App icon (shown on home screen)
│   ├── adaptive-icon.png       # Android adaptive icon
│   ├── splash-icon.png         # Splash screen image shown while app loads
│   └── favicon.png             # Browser tab icon (web only)
│
├── app.json                    # Expo configuration — app name, version, icons, splash
│                                 screen settings, platform-specific options
├── package.json                # Dependencies and scripts (npm install, expo start)
├── tsconfig.json               # TypeScript compiler settings
└── index.ts                    # Entry point — boots Expo Router
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
