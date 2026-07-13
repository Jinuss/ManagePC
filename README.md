[中文](README.md) | [English](README.en.md)

# ManagePC

一款基于 Electron + Vue3 的跨平台系统管理工具，提供系统监控、网络管理、SSH 密钥管理等功能。

[![Electron](https://img.shields.io/badge/Electron-47848F?style=flat&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=flat&logo=vue.js&logoColor=4FC08D)](https://vuejs.org/)
[![Electron Vite](https://img.shields.io/badge/Electron%20Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://electron-vite.org/)
[![Naive UI](https://img.shields.io/badge/Naive%20UI-18A058?style=flat&logo=naiveui&logoColor=white)](https://www.naiveui.com/)

## 功能特性

- **系统监控**：实时监控 CPU、内存、磁盘、网络等系统资源
- **网络信息**：查看当前网络连接状态、IP 地址等信息
- **SSH 密钥管理**：管理和查看 SSH 密钥
- **电池状态**：查看笔记本电池状态和健康度
- **任务调度**：支持基于 cron 表达式的定时任务管理
- **自定义协议**：支持 `managepc://` 协议注册，可通过浏览器链接唤醒应用
- **快捷键管理**：自定义全局快捷键设置
- **自动更新**：支持 Windows 自动更新，macOS 手动下载更新
- **日志查看**：实时查看应用日志，支持日志清理
- **主题切换**：支持亮色、暗色、系统主题
- **多语言**：支持中文、英文

## 技术栈

### 主进程 (Main Process)

| 技术 | 版本 | 用途 |
|------|------|------|
| Electron | ^42.5.0 | 桌面应用框架 |
| Node.js | ^24.x | 后端运行时 |
| electron-store | ^11.0.2 | 数据持久化 |
| electron-log | ^5.4.4 | 日志管理 |
| electron-updater | ^6.8.9 | Windows 更新 |
| systeminformation | ^5.31.7 | 系统信息获取 |
| better-sqlite3 | ^12.11.1 | 任务数据库 |
| node-schedule | ^2.1.1 | 定时任务调度 |
| @sentry/electron | ^7.15.0 | 错误追踪 |
| semver | ^7.8.5 | 版本号比较 |

### 渲染进程 (Renderer Process)

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue.js | ^3.4.21 | 前端框架 |
| Naive UI | ^2.44.1 | UI 组件库 |
| ECharts | ^6.1.0 | 图表展示 |
| Vue I18n | ^9.14.5 | 国际化 |
| Pinia | ^3.0.4 | 状态管理 |

## 项目结构

```
src/
├── main/                    # 主进程代码
│   ├── database/            # 数据库模块（基础设施层）
│   │   └── task.db.js       # 任务数据库
│   ├── modules/             # 功能模块
│   │   ├── window/          # 窗口管理
│   │   │   ├── windowManager.js   # 主窗口和设置窗口管理
│   │   │   └── trayManager.js     # 托盘管理
│   │   ├── update/          # 更新管理
│   │   │   ├── BaseUpdater.js     # 更新基类
│   │   │   ├── WindowsUpdater.js  # Windows 更新器
│   │   │   ├── MacUpdater.js      # macOS 更新器
│   │   │   └── updateManager.js   # 更新检测和安装
│   │   ├── task/            # 任务管理
│   │   │   └── taskManager.js     # 定时任务调度
│   │   ├── log/             # 日志管理
│   │   │   └── logManager.js      # 日志配置和读写
│   │   └── ipc/             # IPC 通信
│   │       ├── index.js           # IPC 入口
│   │       ├── ipcLogHandlers.js  # 日志 IPC 处理器
│   │       ├── ipcProtocolHandlers.js  # 协议 IPC 处理器
│   │       ├── ipcShortcutHandlers.js  # 快捷键 IPC 处理器
│   │       ├── ipcStoreHandlers.js     # 存储 IPC 处理器
│   │       ├── ipcSysInfoHandlers.js   # 系统信息 IPC 处理器
│   │       ├── ipcTaskHandlers.js     # 任务 IPC 处理器
│   │       ├── ipcUpdateHandlers.js   # 更新 IPC 处理器
│   │       └── ipcWindowHandlers.js   # 窗口 IPC 处理器
│   ├── store/               # 持久化存储
│   │   └── index.js         # Store 管理
│   ├── utils/               # 工具函数
│   │   ├── helps.js         # 平台判断、图标路径等
│   │   ├── systemInfo.js    # 系统信息获取
│   │   └── SystemMonitor.js # 系统监控轮询
│   ├── constants.js         # 全局常量定义
│   ├── store.js             # 旧版持久化存储（兼容）
│   ├── sentry.js            # Sentry 错误追踪
│   └── index.js             # 应用入口
├── renderer/                # 渲染进程代码
│   ├── components/          # 公共组件
│   │   ├── PCMonitor.vue          # 系统监控主组件
│   │   ├── SystemInfo.vue         # 系统信息组件
│   │   ├── TrendCharts.vue        # 趋势图表组件
│   │   ├── LogViewer.vue          # 日志查看组件
│   │   ├── TaskSchedulerPage.vue  # 任务调度页面
│   │   ├── TaskTable.vue          # 任务列表组件
│   │   ├── TaskDialog.vue         # 任务对话框组件
│   │   └── ...                    # 其他组件
│   ├── composables/         # Vue 组合式函数
│   │   ├── usePlatform.js   # 平台信息
│   │   ├── useTheme.js      # 主题管理
│   │   ├── useAppUpdate.js  # 更新管理
│   │   └── useDialog.js     # 对话框管理
│   ├── layout/              # 布局组件
│   │   ├── index.vue        # 主布局
│   │   └── CustomTitleBar.vue     # Windows 自定义标题栏
│   ├── windows/             # 窗口页面
│   │   └── settings/        # 设置窗口
│   │       ├── SettingsWindow.vue # 设置窗口主组件
│   │       └── components/  # 设置子组件
│   │           ├── CommonSetting/ # 通用设置
│   │           │   └── ProtocolSettings.vue  # 协议设置
│   │           ├── ThemeSettings.vue         # 主题设置
│   │           ├── UpdateSettings.vue        # 更新设置
│   │           └── ...                       # 其他设置组件
│   ├── i18n/                # 国际化配置
│   │   ├── index.js         # i18n 入口
│   │   ├── zh.js            # 中文语言包
│   │   └── en.js            # 英文语言包
│   ├── store/               # Pinia 状态管理
│   ├── App.vue              # 主应用组件
│   ├── main.js              # 渲染进程入口
│   └── styles/              # 全局样式
├── preload/                 # 预加载脚本
│   ├── modules/             # 预加载模块
│   │   ├── ipcCommonPreload.js    # 公共 IPC API
│   │   ├── ipcLogPreload.js       # 日志 IPC API
│   │   ├── ipcProtocolPreload.js  # 协议 IPC API
│   │   ├── ipcShortcutPreload.js  # 快捷键 IPC API
│   │   ├── ipcStorePreload.js     # 存储 IPC API
│   │   ├── ipcSysInfoPreload.js   # 系统信息 IPC API
│   │   ├── ipcTaskPreload.js      # 任务 IPC API
│   │   ├── ipcUpdatePreload.js    # 更新 IPC API
│   │   └── ipcWindowPreload.js    # 窗口 IPC API
│   └── index.js             # 预加载入口
└── cert/                    # 证书文件
    ├── ManagePC.cer         # 证书文件
    └── ManagePC.pfx         # PFX 证书
```

## 开发环境

### 环境要求

- Node.js >= 24.0.0
- npm >= 10.0.0
- macOS / Windows

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 打包发布

### Windows

```bash
npm run pack:win
# 或发布到 GitHub Release
npm run publish:win
```

### macOS

```bash
npm run pack:mac
# 或发布到 GitHub Release
npm run publish:mac
```

### 其他命令

```bash
# 打包所有平台
npm run pack:all

# 清理构建产物
npm run clean

# 重建原生依赖
npm run rebuild

# 清理 electron-builder 缓存
npm run clean:electron-cache
```

> **注意**：macOS 版本需要手动签名和公证，GitHub Actions 仅打包 .dmg 文件，不进行签名。

## 更新机制

### Windows

使用 `electron-updater` 实现自动更新：
1. 检测 GitHub Release 中的新版本
2. 自动下载更新包
3. 安装并重启应用

### macOS

由于签名和公证限制，采用手动更新方式：
1. 查询 GitHub Release API 获取最新版本
2. 对比版本号判断是否需要更新
3. 提示用户手动下载 .dmg 文件安装

## 日志系统

### 开发环境

日志文件位于项目根目录 `debug.log`，每次启动时自动清空。

### 生产环境

- Windows：`%APPDATA%\SuperSystemMonitor\logs\main.log`
- macOS：`~/Library/Logs/SuperSystemMonitor/main.log`

### 日志查看

在应用设置页面中可以：
- 实时查看日志内容
- 刷新日志
- 清空日志

## 跨平台兼容性

| 功能 | Windows | macOS |
|------|---------|-------|
| 窗口拖动 | 自定义标题栏 | 原生交通灯按钮 |
| 托盘图标 | 支持 | 支持 |
| 窗口最小化到托盘 | 支持 | 支持 |
| 自动更新 | electron-updater | GitHub API |
| 设置窗口 | 独立窗口 | 独立窗口 |
| 窗口聚焦状态 | 支持 | 支持 |
| 任务调度 | 支持 | 支持 |
| 自定义协议 | 支持 | 支持 |
| 快捷键管理 | 支持 | 支持 |
| SSH 密钥管理 | 支持 | 支持 |

## 关键技术点

### Electron 主进程

1. **窗口管理**：使用 `BrowserWindow` 创建无边框窗口，通过 `-webkit-app-region` 实现自定义拖动区域
2. **托盘管理**：使用 `Tray` 和 `Menu` 创建系统托盘，支持双击唤醒窗口
3. **IPC 通信**：使用 `contextBridge` 和 `ipcMain/ipcRenderer` 实现安全的进程间通信，IPC 通道名定义为常量并分模块注册
4. **窗口生命周期**：监听 `close`、`minimize`、`focus`、`blur` 等事件，实现窗口隐藏到托盘而非退出
5. **任务调度**：使用 `node-schedule` 实现基于 cron 表达式的定时任务，数据存储于 `better-sqlite3` 数据库
6. **自定义协议**：支持 `managepc://` 协议注册，生产环境使用 `app.setAsDefaultProtocolClient`，开发环境使用 `process.execPath`
7. **更新器拆分**：基于策略模式拆分 `BaseUpdater`、`WindowsUpdater`、`MacUpdater`，分别处理不同平台的更新逻辑
8. **Sentry 集成**：使用 `@sentry/electron` 实现主进程和渲染进程的错误追踪

### Vue3 渲染进程

1. **组件化开发**：使用 `<script setup>` 语法和组合式 API
2. **响应式系统**：使用 `ref`、`computed` 等响应式数据
3. **状态管理**：使用 Pinia 管理全局状态
4. **主题系统**：支持亮色、暗色、系统主题自动切换
5. **国际化**：使用 Vue I18n 实现多语言支持
6. **组件拆分**：任务调度相关组件拆分为 `TaskSchedulerPage`、`TaskTable`、`TaskDialog`，职责清晰

### 构建工具

1. **electron-vite**：专为 Electron 优化的 Vite 插件，支持主进程、预加载脚本、渲染进程的独立构建
2. **热更新**：配置 `server.watch` 使用轮询方式，解决 macOS 文件监听问题

## License

ISC
