import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { hasWebGL2, loadWorld } from './lib/webgl'

// Fetch the 3D world (three.js and friends) while React renders the page around it.
if (hasWebGL2) loadWorld().catch(() => {})

// Start every visit at the top, before any scroll animation is measured:
// the intro and all pinned sections assume the page begins at scroll 0.
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
