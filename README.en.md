[![en](https://img.shields.io/badge/lang-English-blue.svg)](README.en.md)
[![中文](https://img.shields.io/badge/lang-中文-red.svg)](README.md)

# My Project
...

# ManagePC

A cross-platform system management tool built with Electron + Vue3, providing system monitoring, network management, SSH key management and more.

[![Electron](https://img.shields.io/badge/Electron-47848F?style=flat&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=flat&logo=vue.js&logoColor=4FC08D)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Naive UI](https://img.shields.io/badge/Naive%20UI-18A058?style=flat&logo=naiveui&logoColor=white)](https://www.naiveui.com/)

## Features

- **System Monitoring**: Real-time monitoring of CPU, memory, disk, network and other system resources
- **Network Information**: View current network connection status, IP addresses, etc.
- **SSH Key Management**: Manage and view SSH keys
- **Battery Status**: View laptop battery status and health
- **Auto Update**: Supports automatic update on Windows, manual download on macOS
- **Log Viewer**: Real-time application log viewing with cleanup support
- **Theme Switching**: Supports light, dark, and system themes
- **Multi-language**: Supports Chinese and English

## Tech Stack

### Main Process

| Technology | Version | Purpose |
|------------|---------|---------|
| Electron | ^42.5.0 | Desktop application framework |
| Node.js | ^24.x | Backend runtime |
| electron-store | ^11.0.2 | Data persistence |
| electron-log | ^5.4.4 | Log management |
| electron-updater | ^6.8.9 | Windows update |
| systeminformation | ^5.31.7 | System information retrieval |

### Renderer Process

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue.js | ^3.4.21 | Frontend framework |
| Vite | ^5.2.8 | Build tool |
| Naive UI | ^2.44.1 | UI component library |
| ECharts | ^6.1.0 | Chart visualization |
| Vue I18n | ^9.14.5 | Internationalization |

## Project Structure

```
src/
├── main/                    # Main process code
│   ├── modules/             # Feature modules
│   │   ├── window/          # Window management
│   │   │   ├── windowManager.js   # Main and settings window management
│   │   │   └── trayManager.js     # Tray management
│   │   ├── update/          # Update management
│   │   │   └── updateManager.js   # Update detection and installation
│   │   ├── log/             # Log management
│   │   │   └── logManager.js      # Log configuration and read/write
│   │   └── ipc/             # IPC communication
│   │       └── ipcHandlers.js     # IPC channel registration
│   ├── utils/               # Utility functions
│   │   ├── helps.js         # Platform detection, icon paths, etc.
│   │   ├── systemInfo.js    # System information retrieval
│   │   └── SystemMonitor.js # System monitoring polling
│   ├── constants.js         # Global constants
│   ├── store.js             # Persistence storage
│   └── index.js             # Application entry
├── renderer/                # Renderer process code
│   ├── components/          # Common components
│   │   ├── CustomTitleBar.vue    # Windows custom title bar
│   │   └── LogViewer.vue         # Log viewer component
│   ├── composables/         # Vue composables
│   │   ├── usePlatform.js   # Platform information
│   │   └── useTheme.js      # Theme management
│   ├── windows/             # Window pages
│   │   └── settings/        # Settings window
│   ├── App.vue              # Main application component
│   ├── main.js              # Renderer process entry
│   └── styles/              # Global styles
└── preload/                 # Preload scripts
    └── index.js             # Secure API exposure
```

## Development Environment

### Requirements

- Node.js >= 24.0.0
- npm >= 10.0.0
- macOS / Windows

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Build Production Version

```bash
npm run build
```

## Packaging & Publishing

### Windows

```bash
npm run pack:win
# Or publish to GitHub Release
npm run publish:win
```

### macOS

```bash
npm run pack:mac
# Or publish to GitHub Release
npm run publish:mac
```

> **Note**: macOS version requires manual signing and notarization. GitHub Actions only packages .dmg file without signing.

## Update Mechanism

### Windows

Uses `electron-updater` for automatic updates:
1. Detect new versions in GitHub Release
2. Auto download update package
3. Install and restart application

### macOS

Due to signing and notarization restrictions, manual update approach is used:
1. Query GitHub Release API for latest version
2. Compare version numbers to determine if update is needed
3. Prompt user to manually download .dmg file

## Log System

### Development Environment

Log file is located at project root `debug.log`, automatically cleared on each startup.

### Production Environment

- Windows: `%APPDATA%\SuperSystemMonitor\logs\main.log`
- macOS: `~/Library/Logs/SuperSystemMonitor/main.log`

### Log Viewing

In the application settings page, you can:
- View log contents in real-time
- Refresh logs
- Clear logs

## Cross-platform Compatibility

| Feature | Windows | macOS |
|---------|---------|-------|
| Window Dragging | Custom title bar | Native traffic light buttons |
| Tray Icon | Supported | Supported |
| Minimize to Tray | Supported | Supported |
| Auto Update | electron-updater | GitHub API |
| Settings Window | Independent | Independent |
| Window Focus State | Supported | Supported |

## Key Technical Points

### Electron Main Process

1. **Window Management**: Use `BrowserWindow` to create frameless windows, implement custom draggable areas via `-webkit-app-region`
2. **Tray Management**: Use `Tray` and `Menu` to create system tray, support double-click to restore window
3. **IPC Communication**: Use `contextBridge` and `ipcMain/ipcRenderer` for secure inter-process communication
4. **Window Lifecycle**: Listen to `close`, `minimize`, `focus`, `blur` events to implement window hiding to tray instead of exiting

### Vue3 Renderer Process

1. **Component Development**: Use `<script setup>` syntax and Composition API
2. **Reactive System**: Use `ref`, `computed`, etc. for reactive data
3. **Theme System**: Support automatic switching between light, dark, and system themes
4. **Internationalization**: Use Vue I18n for multi-language support

### Build Tool

1. **electron-vite**: Vite plugin optimized for Electron, supports independent builds for main process, preload scripts, and renderer process
2. **Hot Reload**: Configure `server.watch` with polling mode to resolve macOS file watching issues

## License

ISC
