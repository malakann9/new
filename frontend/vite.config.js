import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import sri from 'vite-plugin-sri'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), sri()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 👇 İŞTE EKSİK OLAN KISIM (KÖPRÜ) 👇
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000', // Backend'in adresi
        changeOrigin: true,
        secure: false,
      }
    }
  }
})