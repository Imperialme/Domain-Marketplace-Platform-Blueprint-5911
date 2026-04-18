# Domain Sniper 🎯

A fast-paced tap game for iOS and Android built with **React Native + Expo**.

Snipe valuable domain names before competitors grab them! Race against the clock, chain combos, and climb the ranks.

## Features

- **60-second rounds** with increasing domain spawn pressure
- **7 domain extensions** with different rarity tiers (.com = legendary, .org = common)
- **Combo system** — tap in quick succession for up to +150% bonus points
- **3 difficulty modes** — Easy / Medium / Hard
- **6 rank tiers** — from Domain Novice to Domain Mogul
- **Local leaderboard** with stats (games played, domains sniped, total XP)
- **Haptic feedback** on taps
- **Smooth animations** with React Native Animated API
- Dark neon UI theme

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React Native 0.74 + Expo ~51 |
| Navigation | React Navigation v6 (Stack) |
| Animations | React Native Animated API |
| Storage | AsyncStorage |
| Haptics | expo-haptics |
| Gradients | expo-linear-gradient |
| Safe Areas | react-native-safe-area-context |

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode 15+ (macOS only)
- For Android: Android Studio with SDK 34+

### Install & Run

```bash
cd mobile-game
npm install
npm start          # Opens Expo Dev Tools
npm run ios        # Runs on iOS Simulator
npm run android    # Runs on Android Emulator
```

Scan the QR code with **Expo Go** app on your physical device to test instantly.

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Build
npm run build:android   # Generates .aab for Play Store
npm run build:ios       # Generates .ipa for App Store
```

## Project Structure

```
mobile-game/
├── App.js                      # Root — Navigation container
├── app.json                    # Expo config (bundle IDs, icons)
├── assets/                     # App icons & splash screen
└── src/
    ├── screens/
    │   ├── HomeScreen.js        # Main menu, difficulty selector
    │   ├── GameScreen.js        # Core gameplay loop
    │   ├── LeaderboardScreen.js # Score history & personal best
    │   └── HowToPlayScreen.js  # Rules & domain value guide
    ├── components/
    │   ├── DomainBubble.js      # Animated tappable domain bubble
    │   ├── HUD.js               # In-game heads-up display
    │   ├── GameOverModal.js     # End-of-round results screen
    │   └── ComboPopup.js        # Animated combo feedback
    └── utils/
        ├── constants.js         # Game config (extensions, difficulties)
        ├── gameLogic.js         # Score calc, spawn, rank helpers
        └── storage.js           # AsyncStorage score persistence
```

## Assets

Place these PNG files in `assets/` before building:

| File | Size | Description |
|------|------|-------------|
| `icon.png` | 1024×1024 | App icon |
| `splash.png` | 1284×2778 | Splash screen |
| `adaptive-icon.png` | 1024×1024 | Android adaptive icon |
| `favicon.png` | 32×32 | Web favicon |

Recommended design: crosshair/target over a dark blue-black gradient with neon accents.

## Gameplay

1. **Tap** domain bubbles before they expire
2. **Chain taps** within 2 seconds to build combos (up to ×10)
3. **Prioritize rare extensions** — `.com` is 100pts, `.org` is 20pts
4. **Hard mode** spawns domains faster with shorter lifetimes but ×2 score multiplier

## License

Part of the Domain Marketplace Platform Blueprint project.
