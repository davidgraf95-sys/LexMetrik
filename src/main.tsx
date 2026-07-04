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
import { effektivesThema, wendeThemaAn } from './components/thema'
import { wendeSchriftskalaAn } from './components/layout/useSchriftskala'
import { wendeLeserOptionenAn } from './pages/gesetz-leser/leserOptionen'

// Thema so früh wie möglich anwenden (vor dem ersten App-Render) — ohne
// CSP-verbotenes Inline-Script bleibt für Dunkel-Nutzer ein kurzes Aufblitzen
// des prerenderten Light-HTML; das hält es minimal.
wendeThemaAn(effektivesThema())
// Ebenso die gespeicherte Schriftskala (R3) vor dem ersten Render anwenden —
// kein Aufblitzen der Default-Grösse für Nutzer mit eigener Wahl.
wendeSchriftskalaAn()
// Und die gespeicherten Leser-Optionen (W2·5d G2a: Linien/Fussnoten/Verweise)
// als data-*-Attribute ans <html> — CSP-konform ohne Inline-Script, analog
// Thema/Schriftskala. Default 'an' ⇒ CSS-No-op ⇒ heutige Darstellung byte-gleich.
wendeLeserOptionenAn()

// Veralteter Chunk nach einem Deploy: Vite feuert 'vite:preloadError', wenn ein
// vorab geladener Modul-Chunk fehlt (offener Tab zeigt auf alte Hashes). Einmal
// neu laden holt das frische index.html mit gültigen Hashes (per sessionStorage
// gegen eine Endlosschleife abgesichert). Ergänzt lazyRetry für Chunks, die nicht
// über einen Lazy-Import, sondern über modulepreload geladen werden.
window.addEventListener('vite:preloadError', () => {
  try {
    if (!sessionStorage.getItem('lex-chunk-reload')) {
      sessionStorage.setItem('lex-chunk-reload', '1')
      window.location.reload()
    }
  } catch { /* sessionStorage nicht verfügbar */ }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
