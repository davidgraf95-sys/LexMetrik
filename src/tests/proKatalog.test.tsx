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

describe('Pro-Katalog: Schnellzugriff', () => {
  it('Favoriten-/Zuletzt-Roundtrip über localStorage', async () => {
    const { toggleFavorit, ladeFavoriten, merkeZuletzt, ladeZuletzt } = await import('../lib/schnellzugriff');
    expect(ladeFavoriten()).toEqual([]);
    toggleFavorit('verzugszins');
    toggleFavorit('zpo-fristen');
    expect(ladeFavoriten()).toEqual(['verzugszins', 'zpo-fristen']);
    toggleFavorit('verzugszins');
    expect(ladeFavoriten()).toEqual(['zpo-fristen']);
    for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'b']) merkeZuletzt(id);
    const z = ladeZuletzt();
    expect(z[0]).toBe('b');           // neueste zuerst, dedupliziert
    expect(z.length).toBeLessThanOrEqual(6);
    // defensiv: kaputter Speicherstand → leere Liste
    localStorage.setItem('lexmetrik.favoriten.v1', '{kaputt');
    expect(ladeFavoriten()).toEqual([]);
  });

  it('Invariante: geplante Karten erhalten NIE einen Stern; verfügbare schon', () => {
    const geplant = ALLE_KARTEN.find((k) => k.status === 'geplant')!;
    const verf = ALLE_KARTEN.find((k) => istVerfuegbar(k) && k.href)!;
    const render = (card: typeof geplant) => renderToString(
      <MemoryRouter><LocaleProvider>
        <RechnerKarte card={card} favorit={false} onFavorit={istVerfuegbar(card) ? () => {} : undefined} />
      </LocaleProvider></MemoryRouter>,
    );
    expect(render(geplant)).not.toContain('aria-pressed');
    expect(render(verf)).toContain('als Favorit markieren');
  });
});
