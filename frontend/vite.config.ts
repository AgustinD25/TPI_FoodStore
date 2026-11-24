import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // El alias @/ apunta a src/ (debe coincidir con "paths" en tsconfig.app.json).
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
