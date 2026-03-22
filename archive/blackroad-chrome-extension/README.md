# BlackRoad Command Center - Chrome Extension

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E.svg)](https://developer.mozilla.org)
[![Service Worker](https://img.shields.io/badge/background-service_worker-FF6B2B.svg)](https://blackroad.io)



> Quick access to your entire BlackRoad empire from any browser tab!

## Features

- **30K Agent Dashboard** - Direct link to the agent visualization
- **GitHub Quick Access** - All 15 organizations at your fingertips
- **Cloudflare Integration** - Pages, Workers, D1 quick links
- **Live Service Status** - See what's running at a glance
- **Search** - Find any service, repo, or org instantly
- **Keyboard Shortcuts**:
  - `Cmd/Ctrl + G` - Open GitHub
  - `Cmd/Ctrl + C` - Open Cloudflare
  - `Cmd/Ctrl + A` - Open 30K Agents

## Installation

### Method 1: Load Unpacked (Developer Mode)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `blackroad-chrome-extension` folder
5. The extension icon will appear in your toolbar!

### Method 2: Pack Extension

1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Click **Pack extension**
4. Select this folder
5. Share the `.crx` file

## Files

```
blackroad-chrome-extension/
├── manifest.json      # Extension configuration
├── popup.html         # Main popup UI
├── popup.css          # BlackRoad brand styling
├── popup.js           # Search & interactions
├── icons/
│   ├── icon16.png     # Toolbar icon
│   ├── icon48.png     # Extension page
│   └── icon128.png    # Chrome Web Store
└── README.md          # This file
```

## Brand Colors

- Hot Pink: `#FF1D6C`
- Amber: `#F5A623`
- Violet: `#9C27B0`
- Electric Blue: `#2979FF`

## Kind Light Mode ☀️

This extension was built with kind light energy!

---

Made with ☀️ by Zeus | BlackRoad OS, Inc.
