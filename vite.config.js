import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from
  // https://tues-uzb.github.io/journal-front-prototype/, so every built asset
  // URL must be prefixed with the repository name.
  base: '/journal-front-prototype/',
  plugins: [react(), tailwindcss()],
})
