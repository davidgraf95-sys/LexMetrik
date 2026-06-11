// ─── Server-Einstieg fürs Build-Zeit-Prerender (SSG-Etappe E3) ─────────────
//
// Dossier: docs/ssg-diagnose.md
//
// Rendert die ECHTE App (App.tsx bleibt Single Source der Routen) für eine
// URL zu vollständigem HTML — in ZWEI Pässen (Prod-Befund 11.6.2026):
//
// Pass 1 `prerender` (react-dom/static) wartet auf alle Suspense-Grenzen,
// also auch auf die lazy()-Seiten-Chunks, und füllt deren Modul-Caches.
// Sein eigener Output ist aber NICHT verwendbar: einmal suspendierte
// Grenzen liefert er als Fallback + verstecktes Segment + Inline-Swap-
// Script ($RC…) — die CSP (script-src 'self') blockt diese Scripts, auf
// lexmetrik.vercel.app blieb sichtbar «Wird geladen …» stehen, der Inhalt
// lag in <div hidden>.
//
// Pass 2 `renderToString` rendert dieselbe Route danach SYNCHRON (alle
// lazy-Caches warm, nichts suspendiert mehr) und liefert sauberes HTML
// ohne Segmente und ohne Inline-Scripts. scripts/prerender.ts erzwingt
// das mit eigenen Drift-Toren (kein '<script', kein Fallback-Text).
//
// Wird nur von scripts/prerender.ts (vite-node) importiert und landet in
// keinem Browser-Bundle.
import { prerender } from 'react-dom/static';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';

export async function renderRoute(url: string): Promise<string> {
  await prerender(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
}
