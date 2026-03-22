[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/blackboxprogramming/blackroad-mobile-app.svg?style=social&label=Star)](https://github.com/blackboxprogramming/blackroad-mobile-app)
[![GitHub forks](https://img.shields.io/github/forks/blackboxprogramming/blackroad-mobile-app.svg?style=social&label=Fork)](https://github.com/blackboxprogramming/blackroad-mobile-app/fork)


# BlackRoad Mobile App 📱

iOS and Android mobile app for BlackRoad - built with React Native!

## Features

- **Dashboard** - View all deployments
- **API Playground** - Test API endpoints
- **Analytics** - Real-time metrics
- **Notifications** - Push notifications for deployments
- **Dark Mode** - Beautiful dark theme

## Screenshots

[Add screenshots here]

## Installation

```bash
npm install
```

### iOS

```bash
cd ios && pod install
npx react-native run-ios
```

### Android

```bash
npx react-native run-android
```

## Build for Production

### iOS
```bash
cd ios
xcodebuild -workspace BlackRoad.xcworkspace -scheme BlackRoad archive
```

### Android
```bash
cd android
./gradlew assembleRelease
```

## Tech Stack

- React Native
- React Navigation
- AsyncStorage
- Axios

## License

MIT License

---

Part of the **BlackRoad Empire** 🚀
