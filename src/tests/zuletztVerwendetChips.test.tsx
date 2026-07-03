import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ZuletztVerwendet } from '../components/start/ZuletztVerwendet';
import { merkeBesuch } from '../lib/zuletztVerwendet';

// «Zuletzt verwendet»-Chips (Modul #5): Overflow-Invariante @390 px (S3-Fix,
// FAHRPLAN §3 #5 / Auflage 5). jsdom/SSR kennt kein Layout — geprüft werden
// darum die TRAGENDEN Klassen, die den Effekt erzeugen (harte 1-Zeilen-Kappung
// + waagrechtes Scrollen statt Umbruch/Seiten-Overflow), plus der Vollkollaps
// bei leerem Speicher.
beforeEach(() => {
  const speicher = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => speicher.get(k) ?? null,
    setItem: (k: string, v: string) => void speicher.set(k, v),
    removeItem: (k: string) => void speicher.delete(k),
    clear: () => speicher.clear(),
    key: () => null,
    length: 0,
  } as unknown as Storage;
});

const render = () =>
  renderToString(
    <MemoryRouter>
      <ZuletztVerwendet />
    </MemoryRouter>,
  );

describe('ZuletztVerwendet — Chip-Overflow @390 px', () => {
  it('leerer Speicher → rendert komplett nichts (kein leerer Kopf, §8)', () => {
    expect(render()).toBe('');
  });

  it('gefüllt: Scroll-Container kappt auf eine Zeile und scrollt waagrecht statt Umbruch/Seiten-Overflow', () => {
    // Mehr Chips mit langen Titeln als in 390 px passen → nur mit den korrekten
    // Klassen bleibt es eine scrollende Zeile ohne Seiten-Overflow.
    for (let i = 0; i < 6; i++) {
      merkeBesuch({ route: `/rechner/langer-titel-nummer-${i}`, titel: `Sehr langer Rechnername Nummer ${i}` });
    }
    const html = render();

    // Scroll-Container: scrollt in sich (overflow-x-auto) UND kann von einem
    // Flex-/Grid-Elternteil nicht über 390 px aufgeblasen werden (min-w-0).
    expect(html).toContain('overflow-x-auto');
    expect(html).toContain('min-w-0');
    // Eine Zeile, kein Umbruch.
    expect(html).toContain('flex-nowrap');
    // Innerer Streifen wächst auf Inhaltsbreite (damit überhaupt gescrollt wird).
    expect(html).toContain('w-max');

    // Jeder Chip: kein Zeilenbruch (whitespace-nowrap) UND kein Stauchen (shrink-0)
    // → Überlauf landet im Scroll, nicht im Umbruch. Für alle 6 Chips prüfen.
    const chips = html.match(/class="lc-chip[^"]*"/g) ?? [];
    expect(chips.length).toBe(6);
    for (const cls of chips) {
      expect(cls).toContain('whitespace-nowrap');
      expect(cls).toContain('shrink-0');
    }
  });
});
