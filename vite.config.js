/**
 * vite.config.js
 * Build configuration for the Offline Notes App (React + Vite + PWA).
 *
 * Plugins:
 *  - @vitejs/plugin-react-swc : compiles React (JSX) with the fast SWC compiler.
 *  - vite-plugin-pwa          : turns the app into a Progressive Web App.
 *
 * We use the "injectManifest" strategy, which means WE write the service worker
 * ourselves (src/service-worker.js). At build time the plugin only injects the
 * list of generated static files into `self.__WB_MANIFEST`, so the service
 * worker knows exactly which files to pre-cache for offline use.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest', // use our own custom service worker
      srcDir: 'src', // folder that contains the service worker source
      filename: 'service-worker.js', // built to dist/service-worker.js
      registerType: 'autoUpdate', // activate a new service worker as soon as it is available
      injectRegister: false, // we register the service worker ourselves in main.jsx

      // Static files that are pre-cached when the service worker installs
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
      },

      // Web App Manifest (makes the app installable and gives it a name/icon)
      manifest: {
        name: 'Offline Notes App',
        short_name: 'Notes',
        description: 'Add and view notes - works offline using IndexedDB.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1e293b',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },

      // Run the service worker in development (npm run dev) as well
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: {
    port: 5173, // development server  -> http://localhost:5173
  },
  preview: {
    port: 4173, // production preview -> http://localhost:4173
  },
})
