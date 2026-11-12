import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from the root of allwinandrews.github.io. Change `base` if the repo name changes.
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: { port: 5199 },
})
