import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Lexmetrik-Typografie: Geist (UI) + Geist Mono (Anzeige); Fraunces via <link>.
import '@fontsource-variable/geist/index.css'
import '@fontsource-variable/geist-mono/index.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
