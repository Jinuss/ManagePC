import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['electron-store'] })],
    resolve: {
      alias: {
        '@': resolve('src/main')
      }
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: 'src/renderer',
    server: {
      hmr: {
        enabled: true,
        host: 'localhost'
      },
      watch: {
        usePolling: true,
        interval: 100
      }
    },
    build: {
      outDir: resolve(__dirname, 'out/renderer'),
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          settings: resolve(__dirname, 'src/renderer/windows/settings/index.html')
        }
      }
    },
    plugins: [
      vue()
    ],
    resolve: {
      alias: {
        '@': resolve('src/renderer')
      }
    }
  }
})