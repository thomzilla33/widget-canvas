import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Served from a GitHub Pages project site at /widget-canvas/.
// BrowserRouter reads this same value via import.meta.env.BASE_URL.
export default defineConfig({
  plugins: [react()],
  base: '/widget-canvas/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
