/**
 * main.jsx
 * Entry point: renders the React app and registers the service worker.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Register the service worker (src/service-worker.js).
// registerSW() comes from vite-plugin-pwa: it checks that the browser supports
// service workers and calls navigator.serviceWorker.register() with the correct
// URL for both development (npm run dev) and production (npm run build).
registerSW({
  immediate: true,
  onRegisteredSW(swUrl) {
    console.log(`Service worker registered: ${swUrl}`)
  },
  onOfflineReady() {
    console.log('Static files cached - the app is ready to work offline.')
  },
  onRegisterError(error) {
    console.error('Service worker registration failed:', error)
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
