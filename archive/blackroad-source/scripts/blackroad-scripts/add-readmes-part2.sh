#!/bin/bash

echo "📝 ADDING MORE READMES (Part 2)!"
echo ""

# Mobile App
cd ~/blackroad-mobile-app
cat > README.md << 'MOBILE_EOF'
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
MOBILE_EOF

git add README.md && git commit -m "docs: Add comprehensive README" && git push origin main
echo "✅ blackroad-mobile-app README added!"

# Chrome Extension
cd ~/blackroad-chrome-extension
cat > README.md << 'CHROME_EOF'
# BlackRoad Chrome Extension 🌐

Chrome DevTools extension for BlackRoad with built-in API tester!

## Features

- **DevTools Panel** - Integrated developer tools
- **API Tester** - Test endpoints directly
- **Quick Deploy** - Deploy from browser
- **Live Metrics** - Real-time analytics
- **Dark Mode** - Matches Chrome theme

## Installation

### From Chrome Web Store
[Link will be added]

### Manual Installation
1. Clone this repo
2. Open Chrome → Extensions → Developer Mode
3. Click "Load unpacked"
4. Select this directory

## Usage

1. Open Chrome DevTools (F12)
2. Click "BlackRoad" tab
3. Enter your API key
4. Start testing!

## Development

```bash
# Watch for changes
npm run watch

# Build for production
npm run build
```

## Manifest V3

This extension uses Manifest V3 for better security and performance.

## License

MIT License

---

Part of the **BlackRoad Empire** 🚀
CHROME_EOF

git add README.md && git commit -m "docs: Add comprehensive README" && git push origin main
echo "✅ blackroad-chrome-extension README added!"

# VS Code Extension
cd ~/blackroad-vscode-extension
cat > README.md << 'VSCODE_EOF'
# BlackRoad VS Code Extension 💻

Deploy to BlackRoad directly from VS Code!

## Features

- **Deploy Command** - `BlackRoad: Deploy` command palette
- **Status Bar** - Deployment status in status bar
- **Notifications** - Toast notifications for deployments
- **API Testing** - Test API endpoints
- **Metrics View** - View analytics in sidebar

## Installation

### From Marketplace
```bash
code --install-extension blackroad.blackroad-vscode
```

### Manual
1. Download `.vsix` from releases
2. Extensions → Install from VSIX

## Usage

1. Open Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Type "BlackRoad"
3. Select command:
   - Deploy
   - View Metrics
   - Test API

## Configuration

Add to your `settings.json`:

```json
{
  "blackroad.apiKey": "your-api-key",
  "blackroad.autoRefresh": true
}
```

## Keyboard Shortcuts

- `Cmd+Shift+D` - Deploy
- `Cmd+Shift+M` - View Metrics

## Development

```bash
npm install
npm run compile
# Press F5 to debug
```

## License

MIT License

---

Part of the **BlackRoad Empire** 🚀
VSCODE_EOF

git add README.md && git commit -m "docs: Add comprehensive README" && git push origin main
echo "✅ blackroad-vscode-extension README added!"

echo ""
echo "✅ Part 2 complete! (3 more READMEs)"
