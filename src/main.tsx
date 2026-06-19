import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// LexMetrik-Typografie: Geist (UI + Display) + Geist Mono (Anzeige), selbst
// gehostet. Fraunces entfernt (Wunsch David 6.6.2026 – Geist überall).
import '@fontsource-variable/geist/index.css'
import '@fontsource-variable/geist-mono/index.css'
// Source Serif 4 (variabel, selbst gehostet): Lese-Schrift NUR für den Gesetzes-
// Volltext (Rubrik V) — editorial, „Gesetzbuch“; UI/Marginalien bleiben Geist
// (Entscheid David 17.6.2026).
import '@fontsource-variable/source-serif-4/index.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
