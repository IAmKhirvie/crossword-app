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
