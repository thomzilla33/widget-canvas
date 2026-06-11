import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from a GitHub Pages project site at /widget-canvas/.
// BrowserRouter reads this same value via import.meta.env.BASE_URL.
export default defineConfig({
  plugins: [react()],
  base: '/widget-canvas/',
})
