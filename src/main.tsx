import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// LexMetrik-Typografie: Geist (UI) + Geist Mono (Anzeige) + Fraunces (Display-Serif),
// alle selbst gehostet. Fraunces in den Gewichten 400/500/600 (wie zuvor via Google Fonts).
import '@fontsource-variable/geist/index.css'
import '@fontsource-variable/geist-mono/index.css'
import '@fontsource/fraunces/400.css'
import '@fontsource/fraunces/500.css'
import '@fontsource/fraunces/600.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
