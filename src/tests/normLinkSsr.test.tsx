import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { NormChip, NormLink } from '../components/vorlagen/ui';
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
    const out = ssr(<NormLink artikel="Art. 8 ZZG" />);
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

// NormChip ist der geteilte Chip-Kern (Refactor 16.6.2026): NormLink ist nur
// noch ein dünner Wrapper darauf, und alle direkten <a href={fedlexLokalisiert…}>
// -Kopien (wizard/RechnerKopf/Vorlagen) rendern jetzt ebenfalls über NormChip.
// Diese Fälle belegen die kritische Byte-Gleichheit (§6, NULL Regression):
//  (a) ohne title rendert KEIN title=-Attribut,
//  (b) NormLink rendert weiterhin mit Default-title,
//  (c) ein wizard-typischer Chip-Aufruf erzeugt href/target/rel/class wie vorher.
// V2·C-3 (§4b-B, deklarierte Änderung §6.3): die Klassenzeile trägt neu
// hover:border-brass-400 (NormChip-Verweisfarbe = komplette brass-Hover-Familie).
describe('NormChip — geteilter Chip-Kern (SSR-Byte-Gleichheit)', () => {
  it('(a) mit artikel + hrefOverride ohne title: <a class="lc-chip …">, KEIN title=', () => {
    const out = ssr(<NormChip artikel="Art. 335c OR" hrefOverride="https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de#art_335_c" />);
    expect(out).toContain('<a');
    expect(out).toContain('class="lc-chip no-underline hover:text-brass-700 hover:border-brass-400"');
    expect(out).not.toContain('title=');
  });

  it('(b) NormLink rendert wie bisher: lc-chip + Default-title', () => {
    const out = ssr(<NormLink artikel="Art. 335c Abs. 1 OR" />);
    expect(out).toContain('class="lc-chip no-underline hover:text-brass-700 hover:border-brass-400"');
    expect(out).toContain('title="Art. 335c Abs. 1 OR auf Fedlex öffnen"');
  });

  it('(c) wizard-typischer Chip-Aufruf erzeugt href, target, rel, class exakt', () => {
    const href = 'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de#art_266l';
    const out = ssr(<NormChip artikel="Art. 266l OR" hrefOverride={href} />);
    expect(out).toContain(`href="${href}"`);
    expect(out).toContain('target="_blank"');
    expect(out).toMatch(/rel="[^"]*noopener[^"]*"/);
    expect(out).toContain('class="lc-chip no-underline hover:text-brass-700 hover:border-brass-400"');
    expect(out).not.toContain('title=');
    // Anzeigetext = artikel (Default-anzeige)
    expect(out).toContain('Art. 266l OR');
  });
});
