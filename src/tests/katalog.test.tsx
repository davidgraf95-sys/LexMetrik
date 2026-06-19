import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LocaleProvider } from '../components/locale';
import { Startseite } from '../pages/Startseite';
import { Recherche } from '../pages/Recherche';
import { HeaderSuche } from '../components/layout/HeaderSuche';
import { RechnerKarte } from '../components/RechnerKarte';
import { ALLE_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';

// Akzeptanztests Katalog. Stand App-Shell + Startseite V2 (19.6.2026,
// deklarierte Anpassung §6 Ziff. 3): Der Katalog (vier Oberkategorien, Such-
// Trefferliste) lebt jetzt auf /recherche; die Startseite «/» ist das
// «Rechner-zuerst»-Cockpit (Begrüssung, Schnellrechner, Zeiterfassung,
// Favoriten). Die Katalog-Mechanik (Deckblatt/?kategorie/?q) ist unverändert,
// wird nur an ihrem neuen Ort (Recherche → Katalog) geprüft.

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

// Katalog-Deckblatt/Suche werden auf /recherche gerendert (neuer Ort des
// Katalogs); die Mechanik liegt unverändert in der Katalog-Komponente.
const seiteHtml = (url: string) =>
  renderToString(
    <MemoryRouter initialEntries={[url]}>
      <LocaleProvider><Recherche /></LocaleProvider>
    </MemoryRouter>,
  );

// Startseite V2 (Cockpit) — eigener Renderer für die Anatomie-Tests.
const startHtml = (url: string) =>
  renderToString(
    <MemoryRouter initialEntries={[url]}>
      <LocaleProvider><Startseite /></LocaleProvider>
    </MemoryRouter>,
  );

// Suche lebt seit dem App-Shell-Umbau im Top-Streifen (Topbar → HeaderSuche);
// Verhalten unverändert, neuer Ort (deklarierte Anpassung, §6 Ziff. 3).
const sucheHtml = (url: string) =>
  renderToString(
    <MemoryRouter initialEntries={[url]}>
      <LocaleProvider><HeaderSuche /></LocaleProvider>
    </MemoryRouter>,
  );

describe('Register: Vier-Kategorien-DECKBLATT mit Klick-Ansicht (Präzisierung David 10.6.2026 — deklarierte Test-Anpassung, §6 Ziff. 3)', () => {
  it('Default: NUR die vier Oberkategorien als Deckblatt — keine Unterthemen auf der Seite', () => {
    const html = seiteHtml('/');
    expect(html).toContain('aria-label="Oberkategorien"');
    for (const titel of ['Zuständigkeiten', 'Fristen', 'Gebühren', 'Vorlagen']) {
      expect(html).toContain(titel);
    }
    // Ehrliche Zähler + Direktlinks (Schnellzugriff) in den Kacheln
    expect(html).toContain('verfügbar');
    expect(html).toContain('href="/rechner/tagerechner"');
    expect(html).toContain('href="/rechner/verzugszins"');
    // KEINE Unterthemen-Sektionen, keine Werkzeug-Listen unten an der Seite
    expect(html).not.toContain('id="register-titel-');
    expect(html).not.toContain('In Vorbereitung (');
    expect(html).not.toContain('href="/rechner/verjaehrung"'); // Alltag-Werkzeug, aber NICHT Kachel-Direktlink
    expect(html).not.toContain('id="kachel-');
    expect(html).not.toContain('id="panel-');
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain('type="search"');
  });

  it('?kategorie=fristen: Unterthemen-Ansicht — Haupteinstieg zuoberst, Geplant-Zeile, Zurück-Weg', () => {
    const html = seiteHtml('/?kategorie=fristen');
    expect(html).toContain('id="register-titel-fristen"');
    expect(html).toContain('Alle Kategorien'); // Zurück-Weg
    // Klicktiefe 1: Haupteinstieg (Tagerechner) vor den Rubriken-Zeilen
    expect(html).toContain('href="/rechner/tagerechner"');
    expect(html).toContain('href="/rechner/verjaehrung"');
    expect(html.indexOf('Fristenrechner')).toBeLessThan(html.indexOf('Gewährleistung'));
    // Ehrlichkeit: Entwurf-Badges + Geplant-Aufklappzeile
    expect(html).toContain('Entwurf</span>');
    expect(html).toContain('<details');
    expect(html).toContain('In Vorbereitung');
    // Die ANDEREN Kategorien sind nicht gelistet
    expect(html).not.toContain('id="register-titel-vorlagen"');
    expect(html).not.toContain('href="/rechner/verzugszins"');
  });

  it('?kategorie=fristen: S-5b-Anatomie — Haupteinstieg + Rubriken prozessual/materiell mit WARUM-Sätzen (deklarierte Ablösung FE-1)', () => {
    const html = seiteHtml('/?kategorie=fristen');
    // EIN Haupteinstieg: Tagerechner mit dem simplen Rechner zuoberst
    expect(html).toContain('Fristen berechnen');
    expect(html).toContain('Einfacher Fristenrechner (Datum · Frist · Ferien-Wahl)');
    // Auftrag David 10.6.2026 abends: prozessual / materiell
    expect(html).toContain('Prozessuale Fristen');
    expect(html).toContain('href="/rechner/zpo-fristen"');
    expect(html).toContain('href="/rechner/schkg-fristen"');
    expect(html).toContain('Materielle Fristen');
    expect(html).toContain('Unterbrechungs-Kette');
    expect(html).toContain('Art. 336c OR');
    // Fristenspiegel ist aufgelöst (S-5c) — kein Einstieg mehr
    expect(html).not.toContain('Fristenspiegel');
    // Keine gleichrangige Mischliste mehr
    expect(html).not.toContain('Weitere Werkzeuge');
  });

  it('Kachel-Direktlinks decken alle vier Kategorien (Schnellzugriff-Funktion erhalten)', async () => {
    const html = seiteHtml('/');
    const { kachelDirektlinks } = await import('../lib/praxisRang');
    const { KATALOG_KARTEN } = await import('../lib/startseiteConfig');
    for (const kat of ['zustaendigkeiten', 'fristen', 'gebuehren', 'vorlagen'] as const) {
      const links = kachelDirektlinks(kat, KATALOG_KARTEN);
      expect(links.length, kat).toBeGreaterThan(0);
      for (const k of links) expect(html).toContain(`href="${k.href}"`);
    }
  });

  it('Alt-Parameter ?ansicht= bleibt harmlos; ?gebiet= öffnet die passende Kategorie erst clientseitig (SSR: Deckblatt)', () => {
    for (const url of ['/?ansicht=katalog', '/?gebiet=arbeit']) {
      const html = seiteHtml(url);
      expect(html).toContain('aria-label="Oberkategorien"');
      expect(html).not.toContain('role="tablist"');
    }
  });

  it('?q= ersetzt das Deckblatt durch die flache Trefferliste — mit Kategorie-Label (teilbare Suche)', () => {
    const html = seiteHtml('/?q=Rechtsvorschlag');
    expect(html).toContain('Treffer');
    expect(html).toContain('href="/rechner/schkg-fristen"');
    expect(html).not.toContain('aria-label="Oberkategorien"');
    expect(html).toContain('Fristen ·');
  });

  it('?q= ohne Treffer: ehrlicher Leerzustand statt stillen Verschwindens', () => {
    const html = seiteHtml('/?q=Patentgericht');
    expect(html).toContain('Keine Treffer');
    expect(html).toContain('Suche zurücksetzen');
  });
});

describe('Katalog-Suche im Top-Streifen (Auftrag David 7.6.2026: «die suchfunktion in den header»; seit App-Shell im Topbar)', () => {
  it('das Suchfeld trägt auf «/» den ?q=-Wert', () => {
    const html = sucheHtml('/?q=Rechtsvorschlag');
    expect(html.match(/type="search"/g)?.length).toBe(1);
    expect(html).toContain('value="Rechtsvorschlag"');
    expect(html).toContain('aria-keyshortcuts="/"');
  });

  it('auf anderen Seiten ist das Feld leer (sammelt lokal, Enter führt zu «/»)', () => {
    const html = sucheHtml('/rechner/verzugszins');
    expect(html.match(/type="search"/g)?.length).toBe(1);
    expect(html).toContain('value=""');
  });
});

describe('Startseite V2 — «Rechner-zuerst»-Cockpit (19.6.2026, deklarierte Anpassung §6 Ziff. 3)', () => {
  it('zeigt Begrüssung, KI-Hinweis, Schnellrechner, Zeiterfassung und Favoriten — KEIN Katalog-Deckblatt', () => {
    const html = startHtml('/');
    // Begrüssung (zufällig, tageszeitpassend → kein fixer Text) + Datum/Uhr-Zeile
    // + ehrlicher KI-Hinweis (§8).
    expect(html).toMatch(/·\s\d{2}:\d{2}:\d{2}/); // Datum · HH:MM:SS
    expect(html).toContain('Berechnung statt KI');
    // Sektionen des Cockpits
    expect(html).toContain('Schnellrechner');
    expect(html).toContain('Zeiterfassung');
    expect(html).toContain('Favoriten');
    // Schnellrechner ruft die ECHTEN Engines: Default-Streitwert ergibt ein
    // Gebühren-/Zuständigkeits-Kopfergebnis (kein Platzhalter «—»).
    expect(html).toContain('live hergeleitet');
    // Pflichthinweis (§8) bleibt
    expect(html).toContain('Rechtlicher Hinweis');
    // Der Katalog (vier Oberkategorien) ist NICHT mehr auf der Startseite
    expect(html).not.toContain('aria-label="Oberkategorien"');
  });

  it('bietet drei Schnellrechner-Tabs; der aktive (Fristen) verlinkt in den Voll-Rechner', () => {
    const html = startHtml('/');
    // Tablist mit drei Tabs
    expect(html).toContain('role="tablist"');
    expect((html.match(/role="tab"/g) ?? []).length).toBe(3);
    expect(html).toContain('>Gebühren<');
    expect(html).toContain('>Zuständigkeit<');
    // Aktiver Tab (Fristen) zeigt das echte Engine-Ergebnis-Umfeld + Voll-Rechner-Link
    expect(html).toContain('href="/rechner/tagerechner"');
  });
});

describe('Katalog auf /recherche — Methodik-Fuss + Hinweis bleiben erreichbar', () => {
  it('Trefferliste/Deckblatt führen Methodik-Link und Pflichthinweis (§8)', () => {
    const html = seiteHtml('/');
    expect(html).toContain('So rechnet LexMetrik');
    expect(html).toContain('href="/methodik"');
    expect(html).toContain('Rechtlicher Hinweis');
    expect(html).not.toContain('kostenlos');
  });
});

describe('Karten-Invarianten', () => {
  it('Karten tragen KEINEN Favoriten-Stern (weder verfügbar noch geplant; Anweisung 5.6.2026)', () => {
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

describe('FE-4: Rück-Abzweigung der Spezialrechner (FAHRPLAN-FRISTEN-EINHEIT)', () => {
  it.each(['RechnerVerjaehrung', 'RechnerGewaehrleistung', 'RechnerErbFristen', 'RechnerMietrecht', 'RechnerKuendigung'] as const)(
    '%s verlinkt zurück zum EINEN Fristenrechner-Einstieg', async (name) => {
      const mod = await import(`../pages/${name}.tsx`);
      const Seite = mod[name] as () => React.JSX.Element;
      const html = renderToString(
        <MemoryRouter initialEntries={['/x']}>
          <LocaleProvider><Seite /></LocaleProvider>
        </MemoryRouter>,
      );
      expect(html).toContain('Zum Fristenrechner');
      expect(html).toContain('href="/rechner/tagerechner"');
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
    // FE-2: geführte Regime-Frage statt nackter Tabs; Weiche fragt, rät nicht
    expect(html).toContain('In welchem Verfahren läuft die Frist?');
    expect(html).toContain('Weiss nicht?');
  });
});
