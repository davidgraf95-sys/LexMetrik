// ─── Server-Einstieg fürs Build-Zeit-Prerender (SSG-Etappe E3) ─────────────
//
// Dossier: docs/ssg-diagnose.md
//
// Rendert die ECHTE App (App.tsx bleibt Single Source der Routen) für eine
// URL zu vollständigem HTML. `prerender` aus react-dom/static wartet — anders
// als renderToString im Smoke — auf alle Suspense-Grenzen, also auch auf die
// lazy()-Seiten-Chunks. Wird nur von scripts/prerender.ts (vite-node)
// importiert und landet in keinem Browser-Bundle.
import { prerender } from 'react-dom/static';
import { StaticRouter } from 'react-router';
import App from './App';

export async function renderRoute(url: string): Promise<string> {
  const { prelude } = await prerender(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
  const reader = prelude.getReader();
  const decoder = new TextDecoder();
  let html = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    html += decoder.decode(value, { stream: true });
  }
  return html + decoder.decode();
}
