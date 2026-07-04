# APK Build Instructions

## App 1: Domain Sniper (React Native / Expo)
**Location:** `mobile-game/`
**Method:** Expo EAS Cloud Build — no Android SDK needed locally

### Prerequisites
- Node.js 18+
- Expo account (free at https://expo.dev)

### Steps
```bash
cd mobile-game

# Install EAS CLI globally
npm install -g eas-cli

# Log in to your Expo account
eas login

# Build APK in the cloud (preview profile = APK output)
eas build --platform android --profile preview
```

EAS will queue the build on Expo's servers. When complete (~5–10 min), you'll get a download link for the `.apk` file. No Android Studio needed.

### Profiles
| Profile | Output | Use case |
|---------|--------|----------|
| `preview` | `.apk` | Direct install on device |
| `production` | `.aab` | Google Play Store upload |
| `development` | `.apk` | Expo Dev Client for debugging |

---

## App 2: Cosmos Capital (React Web / Capacitor)
**Location:** `galactic-raider/`
**Method:** Capacitor + Android Studio — requires Android SDK

### Prerequisites
- Node.js 18+
- [Android Studio](https://developer.android.com/studio) with:
  - Android SDK (API 22+)
  - Android SDK Build-Tools
  - JDK 17+ (bundled with Android Studio)
- Set `ANDROID_HOME` env var (usually `~/Library/Android/sdk` on Mac or `C:\Users\<you>\AppData\Local\Android\Sdk` on Windows)

### Steps — Open in Android Studio (easiest)
```bash
cd galactic-raider

# Install dependencies
npm install

# Build web app + sync to Android
npm run cap:sync

# Open Android Studio
npx cap open android
```
Then in Android Studio: **Build → Build Bundle(s)/APK(s) → Build APK(s)**
APK saved to: `android/app/build/outputs/apk/debug/app-debug.apk`

### Steps — Command line only
```bash
cd galactic-raider
npm install
npm run cap:build-apk
# APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

### After code changes
```bash
npm run cap:sync   # rebuilds web + syncs to Android project
```

---

## Installing the APK on your Android device
1. Copy the `.apk` to your phone via USB, email, or Google Drive
2. On your phone: **Settings → Security → Install unknown apps** → enable for your file manager
3. Tap the `.apk` file to install

Or via `adb` (if Android SDK is installed):
```bash
adb install app-debug.apk
```
