import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LocaleProvider } from '../components/locale';
import { Startseite } from '../pages/Startseite';
import { RechnerKarte } from '../components/RechnerKarte';
import { ALLE_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';

// Akzeptanztests Katalog (Umbauten 5./6.6.2026) — seit FAHRPLAN-EINE-
// HAUPTSEITE (Auftrag David 7.6.2026) laufen sie gegen «/»: die Free/Pro-
// Zweiteilung ist aufgehoben, der vollständige Katalog liegt auf der einen
// Hauptseite (vorher /pro; deklarierte Test-Anpassung, §6 Ziff. 3).

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

const seiteHtml = (url: string) =>
  renderToString(
    <MemoryRouter initialEntries={[url]}>
      <LocaleProvider><Startseite /></LocaleProvider>
    </MemoryRouter>,
  );

describe('Katalog auf der Hauptseite: Tabs + Kachel-Raster (Umbau 6.6.2026, Auftrag David)', () => {
  it('Default «Verfügbar»: Zähler korrekt, Gebiets-KACHELN statt Karten-Strom, Obergruppen als Landkarte', () => {
    const html = seiteHtml('/');
    const verf = ALLE_KARTEN.filter(istVerfuegbar).length;
    expect(html).toContain(`Verfügbar (${verf})`);
    expect(html).toContain(`Gesamter Katalog (${ALLE_KARTEN.length})`);
    // 5er-Gruppen sichtbar (mit Verfügbarem): materiell + prozess + übergreifend
    // (&-Labels seit U3 nur noch via sansAmp gerendert → Teilstrings prüfen)
    expect(html).toContain('Zivilrecht (materiell)');
    expect(html).toContain('Zivilprozess');
    expect(html).toContain('Vollstreckung');
    // Raster-Ansicht: kein Panel offen — keine Karten, keine Badges sichtbar
    expect(html).not.toContain('id="panel-');
    expect(html).not.toContain('In Vorbereitung</span>');
    // Kachel trägt die Inhaltsangabe (verfügbare Werkzeug-Titel) + Zähler
    expect(html).toContain('id="kachel-arbeit"');
    expect(html).toContain('verfügbar');
    // Hero betont Verfügbares
    expect(html).toContain('sofort verfügbar');
  });

  it('Tab «Gesamter Katalog» (?ansicht=katalog): Kacheln mit «in Vorbereitung»-Zählern, alle 5 Gruppen', () => {
    const html = seiteHtml('/?ansicht=katalog');
    expect(html).toContain('in Vorbereitung');
    expect(html).toContain('Öffentliches Recht');
    expect(html).toContain('Strafrecht');
    expect(html).toContain('Strafprozess');
    // auch im Katalog-Tab: Karten erst im geöffneten Panel
    expect(html).not.toContain('In Vorbereitung</span>');
  });

  it('?gebiet=arbeit: Panel ersetzt die ANGEKLICKTE Kachel an Ort und Stelle, übrige Kacheln bleiben (Wunsch David)', () => {
    const html = seiteHtml('/?ansicht=katalog&gebiet=arbeit');
    expect(html).toContain('id="panel-arbeit"');
    expect(html).not.toContain('id="kachel-arbeit"');  // die geöffnete Kachel weicht ihrem Panel
    expect(html).toContain('id="kachel-miete"');       // … die übrigen bleiben sichtbar
    expect(html).toContain('Schliessen');              // expliziter Rückweg im Panel (✕ seit FAHRPLAN-DESIGN 3.3 aria-hidden)
    expect(html).toContain('lc-reveal-panel');         // gemächliche Einblendung (motion-reduce global)
    expect(html).toContain('view-transition-name:kachel-miete'); // Nachrutschen animierbar
    expect(html).toContain('In Vorbereitung</span>'); // geplante Karten im Panel sichtbar
    expect(html).toContain('Entwurf</span>');          // gebaute, ungeprüfte ebenso (§8)
    // Untergruppen-Anatomie bleibt
    expect(html).toContain('>Rechner<');
    // nur EIN Panel offen (das angewählte Gebiet)
    expect(html.match(/id="panel-/g)?.length).toBe(1);
  });

  it('Verfügbar-Tab + ?gebiet: Panel zeigt nur Verfügbares (kein «In Vorbereitung»-Badge)', () => {
    const html = seiteHtml('/?gebiet=arbeit');
    expect(html).toContain('id="panel-arbeit"');
    expect(html).not.toContain('In Vorbereitung</span>');
  });

  it('?q= ersetzt die Kacheln durch die flache Trefferliste (teilbare Suche, Etappe 1.3)', () => {
    const html = seiteHtml('/?q=Rechtsvorschlag');
    expect(html).toContain('Treffer');
    expect(html).toContain('href="/rechner/schkg-fristen"'); // schkg-fristen via Keyword
    expect(html).not.toContain('id="kachel-'); // Kachel-Raster ausgeblendet
    // Suchfeld trägt den URL-Wert (seit U2/U3 EIN Feld in voller Breite)
    expect(html).toContain('value="Rechtsvorschlag"');
  });

  it('?q= ohne Treffer: ehrlicher Leerzustand statt stillen Verschwindens', () => {
    const html = seiteHtml('/?q=Patentgericht');
    expect(html).toContain('Keine Treffer');
    expect(html).toContain('Filter zurücksetzen');
  });
});

describe('Anliegen-Einstiege (Etappe 2.1 — Entwurf, Abnahme David offen)', () => {
  it('jede Anliegen-ID zeigt auf eine VERFÜGBARE Karte mit href (§8); Labels eindeutig', async () => {
    const { ANLIEGEN } = await import('../lib/anliegen');
    const { karte } = await import('../lib/startseiteConfig');
    ANLIEGEN.forEach((a) => {
      const k = karte(a.zielId);
      expect(k, `${a.label} → ${a.zielId}`).toBeTruthy();
      expect(istVerfuegbar(k!), `${a.zielId} muss verfügbar sein`).toBe(true);
      expect(k!.href, `${a.zielId} braucht href`).toBeTruthy();
    });
    expect(new Set(ANLIEGEN.map((a) => a.label)).size).toBe(ANLIEGEN.length);
  });

  it('die Anliegen erscheinen in der vereinten Einstiegszeile (U2/D-A: Anliegen zuerst → alle sichtbar)', async () => {
    const { ANLIEGEN } = await import('../lib/anliegen');
    const html = seiteHtml('/');
    expect(html).toContain('Direkter Einstieg');
    ANLIEGEN.forEach((a) => expect(html).toContain(a.label.replace(/&/g, '&amp;')));
  });
});

describe('Katalog: Schnellzugriff (nur «Zuletzt» — Favoriten entfernt, Anweisung 5.6.2026)', () => {
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

describe('Eine Hauptseite — Übersichts-Umbau (FAHRPLAN-STARTSEITE-UEBERSICHT, Auftrag David 7.6.2026)', () => {
  it('Zone 1: Hero = Claim + EIN Satz + Kennzahlen ohne Preisaussage (U1/D-4); Methodik-Anker entfallen', () => {
    const html = seiteHtml('/');
    expect(html).toContain('Schweizer Recht, berechenbar');
    expect(html).toContain('Fristen berechnen. Beträge beziffern. Rechtsdokumente aufsetzen.');
    expect(html).toContain('sofort verfügbar');
    expect(html).toContain('Rechtsgebiete');
    expect(html).not.toContain('kostenlos');
    // U1: die drei Anker-Zeilen leben auf /methodik, nicht mehr im Hero
    expect(html).not.toContain('Deterministisch – gleiche Eingabe');
  });

  it('Zone 2: EINE Einstiegszeile (Anliegen + Werkzeuge dedupliziert, max. 10 + «mehr»), EIN Suchfeld', async () => {
    const html = seiteHtml('/');
    const { ANLIEGEN } = await import('../lib/anliegen');
    const { haeufigGebrauchtKarten } = await import('../lib/haeufigGebraucht');
    expect(html).toContain('Direkter Einstieg');
    expect(html).not.toContain('Häufig gebraucht');        // alte Doppel-Zeile weg
    expect(html).not.toContain('Einstieg nach Anliegen');  // in der vereinten Zeile aufgegangen
    // Dedupe + Klemmung: 10 Chips sichtbar, Rest hinter «mehr (N) …»
    const ziele = new Set(ANLIEGEN.map((a) => a.zielId));
    const werkzeuge = haeufigGebrauchtKarten().filter((k) => !ziele.has(k.id));
    const gesamt = ANLIEGEN.length + werkzeuge.length;
    if (gesamt > 10) expect(html).toContain(`mehr (${gesamt - 10})`);
    // EIN Suchfeld in voller Breite (U2/U3): genau eine search-Instanz
    expect(html.match(/type="search"/g)?.length).toBe(1);
    expect(html).not.toContain('Suche, Filter &amp; Übersicht'); // Drawer aufgelöst
  });

  it('Zone 3: Register voller Breite, Filter hinter Schaltung, Zuletzt/Hinweis-Prosa nur bei Inhalt (U2–U4)', () => {
    const html = seiteHtml('/');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('>Filter');                      // kompakte Filter-Schaltung im Kopf
    expect(html).not.toContain('Output-Typ');               // Gruppen erst nach Klick sichtbar
    // Seitenleiste aufgelöst: Gebietsliste (nav) existiert nicht mehr
    expect(html).not.toContain('Rechtsgebiete nach Obergruppen');
    // Leerzustand «Zuletzt» rendert NICHTS (keine Erklär-Prosa)
    expect(html).not.toContain('erscheinen hier automatisch');
    expect(html).not.toContain('Zuletzt verwendet');
    // Entwurf-Legende als stille Notiz im Katalog-Kopf
    expect(html).toContain('fachlich noch nicht geprüft');
    // Fuss: Methodik EINE Zeile mit Link statt 4 Karten (U5)
    expect(html).toContain('So rechnet LexMetrik');
    expect(html).toContain('href="/methodik"');
    expect(html).not.toContain('Praxis statt Schublade');   // Langtext-Karten weg
    expect(html).toContain('Rechtlicher Hinweis');
    // Pro-Reste bleiben getilgt
    expect(html).not.toContain('Werkzeuge für die anwaltliche Praxis');
  });
});

describe('Kombinierter Fristenrechner (Auftrag 5.6.2026)', () => {
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
