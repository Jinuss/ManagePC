[English](README.en.md) | [中文](README.md)

# ManagePC

A cross-platform system management tool built with Electron + Vue3, providing system monitoring, network management, SSH key management and more.

[![Electron](https://img.shields.io/badge/Electron-47848F?style=flat&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=flat&logo=vue.js&logoColor=4FC08D)](https://vuejs.org/)
[![Electron Vite](https://img.shields.io/badge/Electron%20Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://electron-vite.org/)
[![Naive UI](https://img.shields.io/badge/Naive%20UI-18A058?style=flat&logo=naiveui&logoColor=white)](https://www.naiveui.com/)

## Features

- **System Monitoring**: Real-time monitoring of CPU, memory, disk, network and other system resources
- **Network Information**: View current network connection status, IP addresses, etc.
- **SSH Key Management**: Manage and view SSH keys
- **Battery Status**: View laptop battery status and health
- **Task Scheduler**: Manage scheduled tasks based on cron expressions
- **Custom Protocol**: Support `managepc://` protocol registration, wake app via browser links
- **Keyboard Shortcuts**: Customize global keyboard shortcuts
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
| better-sqlite3 | ^12.11.1 | Task database |
| node-schedule | ^2.1.1 | Task scheduling |
| @sentry/electron | ^7.15.0 | Error tracking |
| semver | ^7.8.5 | Version comparison |

### Renderer Process

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue.js | ^3.4.21 | Frontend framework |
| Electron Vite | Build tool |
| Naive UI | ^2.44.1 | UI component library |
| ECharts | ^6.1.0 | Chart visualization |
| Vue I18n | ^9.14.5 | Internationalization |
| Pinia | ^3.0.4 | State management |

## Project Structure

```
src/
├── main/                    # Main process code
│   ├── database/            # Database modules (infrastructure layer)
│   │   └── task.db.js       # Task database
│   ├── modules/             # Feature modules
│   │   ├── window/          # Window management
│   │   │   ├── windowManager.js   # Main and settings window management
│   │   │   └── trayManager.js     # Tray management
│   │   ├── update/          # Update management
│   │   │   ├── BaseUpdater.js     # Base updater class
│   │   │   ├── WindowsUpdater.js  # Windows updater
│   │   │   ├── MacUpdater.js      # macOS updater
│   │   │   └── updateManager.js   # Update detection and installation
│   │   ├── task/            # Task management
│   │   │   └── taskManager.js     # Task scheduling
│   │   ├── log/             # Log management
│   │   │   └── logManager.js      # Log configuration and read/write
│   │   └── ipc/             # IPC communication
│   │       ├── index.js           # IPC entry
│   │       ├── ipcLogHandlers.js  # Log IPC handlers
│   │       ├── ipcProtocolHandlers.js  # Protocol IPC handlers
│   │       ├── ipcShortcutHandlers.js  # Shortcut IPC handlers
│   │       ├── ipcStoreHandlers.js     # Store IPC handlers
│   │       ├── ipcSysInfoHandlers.js   # System info IPC handlers
│   │       ├── ipcTaskHandlers.js     # Task IPC handlers
│   │       ├── ipcUpdateHandlers.js   # Update IPC handlers
│   │       └── ipcWindowHandlers.js   # Window IPC handlers
│   ├── store/               # Persistence storage
│   │   └── index.js         # Store management
│   ├── utils/               # Utility functions
│   │   ├── helps.js         # Platform detection, icon paths, etc.
│   │   ├── systemInfo.js    # System information retrieval
│   │   └── SystemMonitor.js # System monitoring polling
│   ├── constants.js         # Global constants
│   ├── store.js             # Legacy persistence storage (compatibility)
│   ├── sentry.js            # Sentry error tracking
│   └── index.js             # Application entry
├── renderer/                # Renderer process code
│   ├── components/          # Common components
│   │   ├── PCMonitor.vue          # System monitoring main component
│   │   ├── SystemInfo.vue         # System information component
│   │   ├── TrendCharts.vue        # Trend charts component
│   │   ├── LogViewer.vue          # Log viewer component
│   │   ├── TaskSchedulerPage.vue  # Task scheduler page
│   │   ├── TaskTable.vue          # Task list component
│   │   ├── TaskDialog.vue         # Task dialog component
│   │   └── ...                    # Other components
│   ├── composables/         # Vue composables
│   │   ├── usePlatform.js   # Platform information
│   │   ├── useTheme.js      # Theme management
│   │   ├── useAppUpdate.js  # Update management
│   │   └── useDialog.js     # Dialog management
│   ├── layout/              # Layout components
│   │   ├── index.vue        # Main layout
│   │   └── CustomTitleBar.vue     # Windows custom title bar
│   ├── windows/             # Window pages
│   │   └── settings/        # Settings window
│   │       ├── SettingsWindow.vue # Settings window main component
│   │       └── components/  # Settings sub-components
│   │           ├── CommonSetting/ # Common settings
│   │           │   └── ProtocolSettings.vue  # Protocol settings
│   │           ├── ThemeSettings.vue         # Theme settings
│   │           ├── UpdateSettings.vue        # Update settings
│   │           └── ...                       # Other settings components
│   ├── i18n/                # Internationalization
│   │   ├── index.js         # i18n entry
│   │   ├── zh.js            # Chinese language pack
│   │   └── en.js            # English language pack
│   ├── store/               # Pinia state management
│   ├── App.vue              # Main application component
│   ├── main.js              # Renderer process entry
│   └── styles/              # Global styles
├── preload/                 # Preload scripts
│   ├── modules/             # Preload modules
│   │   ├── ipcCommonPreload.js    # Common IPC API
│   │   ├── ipcLogPreload.js       # Log IPC API
│   │   ├── ipcProtocolPreload.js  # Protocol IPC API
│   │   ├── ipcShortcutPreload.js  # Shortcut IPC API
│   │   ├── ipcStorePreload.js     # Store IPC API
│   │   ├── ipcSysInfoPreload.js   # System info IPC API
│   │   ├── ipcTaskPreload.js      # Task IPC API
│   │   ├── ipcUpdatePreload.js    # Update IPC API
│   │   └── ipcWindowPreload.js    # Window IPC API
│   └── index.js             # Preload entry
└── cert/                    # Certificate files
    ├── ManagePC.cer         # Certificate file
    └── ManagePC.pfx         # PFX certificate
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

### Other Commands

```bash
# Package all platforms
npm run pack:all

# Clean build artifacts
npm run clean

# Rebuild native dependencies
npm run rebuild

# Clean electron-builder cache
npm run clean:electron-cache
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
| Task Scheduler | Supported | Supported |
| Custom Protocol | Supported | Supported |
| Keyboard Shortcuts | Supported | Supported |
| SSH Key Management | Supported | Supported |

## Key Technical Points

### Electron Main Process

1. **Window Management**: Use `BrowserWindow` to create frameless windows, implement custom draggable areas via `-webkit-app-region`
2. **Tray Management**: Use `Tray` and `Menu` to create system tray, support double-click to restore window
3. **IPC Communication**: Use `contextBridge` and `ipcMain/ipcRenderer` for secure inter-process communication, IPC channel names defined as constants and registered by module
4. **Window Lifecycle**: Listen to `close`, `minimize`, `focus`, `blur` events to implement window hiding to tray instead of exiting
5. **Task Scheduler**: Use `node-schedule` for cron-based scheduled tasks, data stored in `better-sqlite3` database
6. **Custom Protocol**: Support `managepc://` protocol registration, production uses `app.setAsDefaultProtocolClient`, development uses `process.execPath`
7. **Updater Strategy**: Strategy pattern with `BaseUpdater`, `WindowsUpdater`, `MacUpdater` for platform-specific update logic
8. **Sentry Integration**: Use `@sentry/electron` for error tracking in both main and renderer processes

### Vue3 Renderer Process

1. **Component Development**: Use `<script setup>` syntax and Composition API
2. **Reactive System**: Use `ref`, `computed`, etc. for reactive data
3. **State Management**: Use Pinia for global state management
4. **Theme System**: Support automatic switching between light, dark, and system themes
5. **Internationalization**: Use Vue I18n for multi-language support
6. **Component Split**: Task scheduler components split into `TaskSchedulerPage`, `TaskTable`, `TaskDialog` with clear responsibilities

### Build Tool

1. **electron-vite**: Vite plugin optimized for Electron, supports independent builds for main process, preload scripts, and renderer process
2. **Hot Reload**: Configure `server.watch` with polling mode to resolve macOS file watching issues

## License

ISC
