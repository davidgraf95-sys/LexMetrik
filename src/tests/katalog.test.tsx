import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LocaleProvider } from '../components/locale';
import { Startseite } from '../pages/Startseite';
import { Header } from '../components/layout/Header';
import { RechnerKarte } from '../components/RechnerKarte';
import { ALLE_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';

// Akzeptanztests Katalog (Umbauten 5.–7.6.2026) — Stand Radikal-
// Verschlankung 7.6.2026 (Auftrag David «mache das alles weg und die
// suchfunktion in den header»): «/» = Hero + Register, NICHTS dazwischen;
// die Suche lebt im Header und schreibt ?q=; Tabs/Filter/Chips/Zuletzt
// sind entfernt (deklarierte Test-Anpassung, §6 Ziff. 3).

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

const headerHtml = (url: string) =>
  renderToString(
    <MemoryRouter initialEntries={[url]}>
      <LocaleProvider><Header /></LocaleProvider>
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

  it('?kategorie=fristen: Unterthemen-Ansicht — praxis-gerankte Liste, Sub-Labels, Geplant-Zeile, Zurück-Weg', () => {
    const html = seiteHtml('/?kategorie=fristen');
    expect(html).toContain('id="register-titel-fristen"');
    expect(html).toContain('Alle Kategorien'); // Zurück-Weg
    // Klicktiefe 1 + Praxis-Rang: Tagerechner (Alltag) vor Gewährleistung (regelmässig)
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

  it('?kategorie=fristen: FE-1-Anatomie — zwei Haupteinstiege, Fach-Direkteinstieg-Kennzeichnung, Eigenes-Regime-Zeilen mit WARUM-Satz', () => {
    const html = seiteHtml('/?kategorie=fristen');
    // EIN Einstieg: Tagerechner + Fristenspiegel zuoberst, mit Regime-Untertiteln
    expect(html).toContain('Fristen berechnen');
    expect(html).toContain('Allgemein (Vertrag/OR) · Zivilprozess (ZPO) · Betreibung (SchKG) · Rückwärts');
    expect(html).toContain('Ein Ereignis – die parallel laufenden Fristen daraus');
    // Doppelpfad gewollt, aber gekennzeichnet
    expect(html).toContain('Fach-Direkteinstieg');
    expect(html).toContain('href="/rechner/zpo-fristen"');
    expect(html).toContain('href="/rechner/schkg-fristen"');
    // Spezialrechner als benannte Abzweigungen mit Ein-Satz-Begründung
    expect(html).toContain('Eigenes Regime');
    expect(html).toContain('Unterbrechungs-Kette');
    expect(html).toContain('Art. 336c OR');
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

describe('Header-Suche (Auftrag David 7.6.2026: «die suchfunktion in den header»)', () => {
  it('das Suchfeld lebt im Header und trägt auf «/» den ?q=-Wert', () => {
    const html = headerHtml('/?q=Rechtsvorschlag');
    expect(html.match(/type="search"/g)?.length).toBe(1);
    expect(html).toContain('value="Rechtsvorschlag"');
    expect(html).toContain('aria-keyshortcuts="/"');
  });

  it('auf anderen Seiten ist das Feld leer (sammelt lokal, Enter führt zu «/»)', () => {
    const html = headerHtml('/rechner/verzugszins');
    expect(html.match(/type="search"/g)?.length).toBe(1);
    expect(html).toContain('value=""');
  });
});

describe('Hauptseiten-Anatomie (Radikal-Verschlankung: Hero → Register → Fusszeilen)', () => {
  it('Hero = Claim + EIN Satz + Kennzahlen ohne Preisaussage (D-4); Fuss = Methodik-Zeile + Hinweis', () => {
    const html = seiteHtml('/');
    expect(html).toContain('Schweizer Recht, berechenbar');
    expect(html).toContain('Zuständigkeit klären. Fristen berechnen. Gebühren beziffern. Dokumente aufsetzen.');
    expect(html).toContain('sofort verfügbar');
    expect(html).toContain('Rechtsgebiete');
    expect(html).not.toContain('kostenlos');
    expect(html).not.toContain('Deterministisch – gleiche Eingabe');
    // Fuss: Methodik EINE Zeile mit Link statt 4 Karten (U5)
    expect(html).toContain('So rechnet LexMetrik');
    expect(html).toContain('href="/methodik"');
    expect(html).not.toContain('Praxis statt Schublade');
    expect(html).toContain('Rechtlicher Hinweis');
    // Pro-Reste bleiben getilgt
    expect(html).not.toContain('Werkzeuge für die anwaltliche Praxis');
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
