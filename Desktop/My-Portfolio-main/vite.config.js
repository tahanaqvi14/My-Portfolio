import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // three.js and its add-ons (~600 kB) are their own chunk, loaded while the loader runs.
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks so returning visitors only re-download app code.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 3 },
            { name: 'motion', test: /node_modules[\\/](gsap|@gsap|lenis)[\\/]/, priority: 2 },
            { name: 'three', test: /node_modules[\\/]three[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
})
