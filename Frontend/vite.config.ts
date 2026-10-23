import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // 운영 Nginx와 같은 구조: /api 는 Nest로 프록시 (same-origin 쿠키 유지)
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
