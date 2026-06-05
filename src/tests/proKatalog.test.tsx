import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LocaleProvider } from '../components/locale';
import { Pro } from '../pages/Pro';
import { RechnerKarte } from '../components/RechnerKarte';
import { ALLE_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';

// Akzeptanztests Pro-Katalog-Umbau (Auftrag 5.6.2026, Phasen 3–6).

// Minimaler localStorage-Mock (Node hat keinen)
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

const proHtml = (url: string) =>
  renderToString(
    <MemoryRouter initialEntries={[url]}>
      <LocaleProvider><Pro /></LocaleProvider>
    </MemoryRouter>,
  );

describe('Pro-Katalog: Tabs + Gruppen', () => {
  it('Default «Verfügbar»: Zähler korrekt, nur verfügbare Karten, Obergruppen als Landkarte', () => {
    const html = proHtml('/pro');
    const verf = ALLE_KARTEN.filter((k) => k.tier === 'pro' || k.tier === 'free').filter(istVerfuegbar).length;
    expect(html).toContain(`Verfügbar (${verf})`);
    expect(html).toContain(`Gesamter Katalog (${ALLE_KARTEN.length})`);
    // 5er-Gruppen sichtbar (mit Verfügbarem): materiell + prozess + übergreifend
    expect(html).toContain('Zivilrecht (materiell)');
    expect(html).toContain('Zivilprozess &amp; Vollstreckung');
    // Im Verfügbar-Tab keine geplante Karte (kein «In Vorbereitung»-Badge)
    expect(html).not.toContain('In Vorbereitung</span>');
    // Hero betont Verfügbares
    expect(html).toContain('sofort verfügbar');
  });

  it('Tab «Gesamter Katalog» (?ansicht=katalog): Fahrplan mit «in Vorbereitung»-Zählern, alle 5 Gruppen', () => {
    const html = proHtml('/pro?ansicht=katalog');
    expect(html).toContain('in Vorbereitung');
    expect(html).toContain('Öffentliches Recht');
    expect(html).toContain('Strafrecht &amp; Strafprozess');
    expect(html).toContain('In Vorbereitung</span>'); // geplante Karten sichtbar
  });
});

describe('Pro-Katalog: Schnellzugriff (nur «Zuletzt» — Favoriten entfernt, Anweisung 5.6.2026)', () => {
  it('Zuletzt-Roundtrip über localStorage (dedupliziert, max. 6, defensiv)', async () => {
    const { merkeZuletzt, ladeZuletzt } = await import('../lib/schnellzugriff');
    for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'b']) merkeZuletzt(id);
    const z = ladeZuletzt();
    expect(z[0]).toBe('b');           // neueste zuerst, dedupliziert
    expect(z.length).toBeLessThanOrEqual(6);
    // defensiv: kaputter Speicherstand → leere Liste
    localStorage.setItem('lexmetrik.zuletzt.v1', '{kaputt');
    expect(ladeZuletzt()).toEqual([]);
  });

  it('Invariante: Karten tragen KEINEN Favoriten-Stern mehr (weder verfügbar noch geplant)', () => {
    const geplant = ALLE_KARTEN.find((k) => k.status === 'geplant')!;
    const verf = ALLE_KARTEN.find((k) => istVerfuegbar(k) && k.href)!;
    const render = (card: typeof geplant) => renderToString(
      <MemoryRouter><LocaleProvider>
        <RechnerKarte card={card} />
      </LocaleProvider></MemoryRouter>,
    );
    for (const html of [render(geplant), render(verf)]) {
      expect(html).not.toContain('Favorit');
      expect(html).not.toContain('aria-pressed');
      expect(html).not.toContain('★');
      expect(html).not.toContain('☆');
    }
  });
});

describe('Free-Kachelwand (Auftrag 5.6.2026)', () => {
  it('flache Wand: zwei Blöcke, keine Filter/Suche/Sprungmarken/Sterne; geplant gedämpft an Position', async () => {
    const { Startseite } = await import('../pages/Startseite');
    const html = renderToString(
      <MemoryRouter initialEntries={['/']}>
        <LocaleProvider><Startseite /></LocaleProvider>
      </MemoryRouter>,
    );
    // Hero-Neubau 5.6.2026 («nüchtern & juristisch»): Claim als Overline,
    // Nutzen-Headline, Anker-Einstiege in beide Blöcke
    expect(html).toContain('Schweizer Recht, berechenbar');
    expect(html).toContain('Fristen berechnen. Beträge beziffern. Rechtsdokumente aufsetzen.');
    expect(html).toContain('href="#rechner"');
    expect(html).toContain('href="#vorlagen"');
    expect(html).toContain('>Rechner<');
    expect(html).toContain('>Vorlagen<');
    // entfernt: Suche, Filter, Tabs, Übersicht, Schnellzugriff, Stern
    expect(html).not.toContain('Katalog filtern');
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain('Übersicht');
    expect(html).not.toContain('Schnellzugriff');
    expect(html).not.toContain('als Favorit markieren');
    // kein Rechtsgebiet-Schnitt (keine Gebiets-Disclosure-Sektionen)
    expect(html).not.toContain('lc-sektion');
    // geplant sichtbar gedämpft, ohne href
    expect(html).toContain('In Vorbereitung');
    // bleibende Blöcke
    expect(html).toContain('Werkzeuge für die anwaltliche Praxis');
    expect(html).toContain('So rechnet LexMetrik');
    expect(html).toContain('Rechtlicher Hinweis');
  });

  it('Pro bleibt unverändert (Tabs + Gruppen + Schnellzugriff vorhanden)', () => {
    const html = proHtml('/pro');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('Schnellzugriff');
    expect(html).toContain('Zivilrecht (materiell)');
  });
});

describe('Kombinierter Fristenrechner (Free, Auftrag 5.6.2026)', () => {
  it('Verfahrens-Schnitt vorhanden; Default Allgemein; Engines getrennt erreichbar', async () => {
    const { RechnerTagerechner } = await import('../pages/RechnerTagerechner');
    const html = renderToString(
      <MemoryRouter initialEntries={['/rechner/tagerechner']}>
        <LocaleProvider><RechnerTagerechner /></LocaleProvider>
      </MemoryRouter>,
    );
    expect(html).toContain('Allgemein (Vertrag/OR)');
    expect(html).toContain('Zivilprozess (ZPO)');
    expect(html).toContain('Betreibung (SchKG)');
    // Default = Allgemein-Form gerendert (Tabs frist/rueckwaerts/zwischen)
    expect(html).toContain('Tage zwischen');
  });
});
