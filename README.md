[🇺🇸 English](README.en.md) | [🇨🇳 中文](README.md)

# ManagePC

一款基于 Electron + Vue3 的跨平台系统管理工具，提供系统监控、网络管理、SSH 密钥管理等功能。

[![Electron](https://img.shields.io/badge/Electron-47848F?style=flat&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=flat&logo=vue.js&logoColor=4FC08D)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Naive UI](https://img.shields.io/badge/Naive%20UI-18A058?style=flat&logo=naiveui&logoColor=white)](https://www.naiveui.com/)

## 功能特性

- **系统监控**：实时监控 CPU、内存、磁盘、网络等系统资源
- **网络信息**：查看当前网络连接状态、IP 地址等信息
- **SSH 密钥管理**：管理和查看 SSH 密钥
- **电池状态**：查看笔记本电池状态和健康度
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

### 渲染进程 (Renderer Process)

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue.js | ^3.4.21 | 前端框架 |
| Vite | ^5.2.8 | 构建工具 |
| Naive UI | ^2.44.1 | UI 组件库 |
| ECharts | ^6.1.0 | 图表展示 |
| Vue I18n | ^9.14.5 | 国际化 |

## 项目结构

```
src/
├── main/                    # 主进程代码
│   ├── modules/             # 功能模块
│   │   ├── window/          # 窗口管理
│   │   │   ├── windowManager.js   # 主窗口和设置窗口管理
│   │   │   └── trayManager.js     # 托盘管理
│   │   ├── update/          # 更新管理
│   │   │   └── updateManager.js   # 更新检测和安装
│   │   ├── log/             # 日志管理
│   │   │   └── logManager.js      # 日志配置和读写
│   │   └── ipc/             # IPC 通信
│   │       └── ipcHandlers.js     # IPC 通道注册
│   ├── utils/               # 工具函数
│   │   ├── helps.js         # 平台判断、图标路径等
│   │   ├── systemInfo.js    # 系统信息获取
│   │   └── SystemMonitor.js # 系统监控轮询
│   ├── constants.js         # 全局常量定义
│   ├── store.js             # 持久化存储
│   └── index.js             # 应用入口
├── renderer/                # 渲染进程代码
│   ├── components/          # 公共组件
│   │   ├── CustomTitleBar.vue    # Windows 自定义标题栏
│   │   └── LogViewer.vue         # 日志查看组件
│   ├── composables/         # Vue 组合式函数
│   │   ├── usePlatform.js   # 平台信息
│   │   └── useTheme.js      # 主题管理
│   ├── windows/             # 窗口页面
│   │   └── settings/        # 设置窗口
│   ├── App.vue              # 主应用组件
│   ├── main.js              # 渲染进程入口
│   └── styles/              # 全局样式
└── preload/                 # 预加载脚本
    └── index.js             # 安全的 API 暴露
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

## 关键技术点

### Electron 主进程

1. **窗口管理**：使用 `BrowserWindow` 创建无边框窗口，通过 `-webkit-app-region` 实现自定义拖动区域
2. **托盘管理**：使用 `Tray` 和 `Menu` 创建系统托盘，支持双击唤醒窗口
3. **IPC 通信**：使用 `contextBridge` 和 `ipcMain/ipcRenderer` 实现安全的进程间通信
4. **窗口生命周期**：监听 `close`、`minimize`、`focus`、`blur` 等事件，实现窗口隐藏到托盘而非退出

### Vue3 渲染进程

1. **组件化开发**：使用 `<script setup>` 语法和组合式 API
2. **响应式系统**：使用 `ref`、`computed` 等响应式数据
3. **主题系统**：支持亮色、暗色、系统主题自动切换
4. **国际化**：使用 Vue I18n 实现多语言支持

### 构建工具

1. **electron-vite**：专为 Electron 优化的 Vite 插件，支持主进程、预加载脚本、渲染进程的独立构建
2. **热更新**：配置 `server.watch` 使用轮询方式，解决 macOS 文件监听问题

## License

ISC
