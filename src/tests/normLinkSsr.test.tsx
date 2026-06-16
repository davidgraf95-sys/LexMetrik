import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { NormLink } from '../components/vorlagen/ui';
import { LocaleProvider } from '../components/locale';

// Progressive Enhancement, NULL Regression (§6): der serverseitige Erst-Render
// von NormLink MUSS identisch zum heutigen sein — ein <a target=_blank> auf die
// Fedlex-URL, KEIN Popover/Overlay (offen=false initial, Effekte nur im
// Browser). renderToString-Muster wie im Repo üblich (node-Env, kein jsdom).

const ssr = (el: React.ReactElement) =>
  renderToString(<LocaleProvider>{el}</LocaleProvider>);

describe('NormLink — SSR/Prerender unverändert', () => {
  it('rendert den Fedlex-<a> mit href, target und rel (Fallback-Verhalten)', () => {
    const out = ssr(<NormLink artikel="Art. 335c Abs. 1 OR" />);
    expect(out).toContain('<a');
    expect(out).toMatch(/href="[^"]*fedlex[^"]*#art_335_c"/);
    expect(out).toContain('target="_blank"');
    expect(out).toMatch(/rel="[^"]*noopener[^"]*"/);
    expect(out).toContain('lc-chip');
  });

  it('kein Popover/Overlay im SSR-Output (offen=false initial)', () => {
    const out = ssr(<NormLink artikel="Art. 335c Abs. 1 OR" />);
    expect(out).not.toContain('role="dialog"');
    expect(out).not.toContain('Norm-Vorschau');
    expect(out).not.toContain('aria-modal');
  });

  it('unbekanntes Gesetz → reiner span-Chip wie bisher (kein Link)', () => {
    const out = ssr(<NormLink artikel="Art. 8 ATSG" />);
    expect(out).toContain('lc-chip');
    expect(out).not.toContain('<a');
    expect(out).not.toContain('role="dialog"');
  });

  it('zeigt artikel + bemerkung im Chip', () => {
    const out = ssr(<NormLink artikel="Art. 96 ZPO" bemerkung="Prozesskosten" />);
    expect(out).toContain('Art. 96 ZPO');
    expect(out).toContain('Prozesskosten');
  });
});
