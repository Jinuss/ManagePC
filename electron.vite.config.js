import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import copy from 'rollup-plugin-copy'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      copy({
        targets: [
          {
            src: resolve(__dirname, 'package.json'),
            dest: resolve(__dirname, 'out')
          }
        ],
        hook: 'buildEnd',
        verbose: true
      })
    ],
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
    build: {
      outDir: resolve(__dirname, 'out/renderer'),
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
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