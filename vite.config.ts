import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // This portfolio is published at shanti-ryuu.github.io/portfolio/.
  // Set VITE_BASE_PATH=/ for a root-domain deployment or override per host.
  base: process.env.VITE_BASE_PATH || (process.env.VERCEL || process.env.NETLIFY ? '/' : '/portfolio/'),
  plugins: [react(), tailwindcss()],
})
