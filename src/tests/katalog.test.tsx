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

describe('Register: VIER Oberkategorien (Auftrag David 10.6.2026 — deklarierte Test-Anpassung, §6 Ziff. 3)', () => {
  it('Default: vier Registerteile I–IV mit Einstiegs-Navigation, Direktlink-Zeilen und ehrlichen Zählern; kein Kachel/Panel-Apparat', () => {
    const html = seiteHtml('/');
    // Die vier Aufgaben-Einstiege (Navigation) + Sektionen
    expect(html).toContain('aria-label="Oberkategorien"');
    for (const id of ['zustaendigkeiten', 'fristen', 'gebuehren', 'vorlagen']) {
      expect(html).toContain(`href="#register-${id}"`);
      expect(html).toContain(`id="register-${id}"`);
    }
    expect(html).toContain('Zuständigkeiten');
    expect(html).toContain('Gebühren');
    expect(html).toContain('Vorlagen');
    // Reihenfolge I → IV
    expect(html.indexOf('id="register-zustaendigkeiten"')).toBeLessThan(html.indexOf('id="register-fristen"'));
    expect(html.indexOf('id="register-fristen"')).toBeLessThan(html.indexOf('id="register-gebuehren"'));
    expect(html.indexOf('id="register-gebuehren"')).toBeLessThan(html.indexOf('id="register-vorlagen"'));
    // Rechtsgebiet bleibt als zweite Ebene (stille Overline)
    expect(html).toContain('Arbeit');
    expect(html).toContain('Miete');
    // Klicktiefe 1: Verfügbare als Direktlinks; ehrliches Mengenbild
    expect(html).toContain('href="/rechner/zpo-fristen"');
    expect(html).toContain('href="/rechner/zustaendigkeit"');
    expect(html).toContain('verfügbar');
    expect(html).toContain('In Vorbereitung');
    expect(html).toContain('Entwurf</span>');
    // WEG: Gebiets-Kacheln/Panels und der alte Steuer-Apparat
    expect(html).not.toContain('id="kachel-');
    expect(html).not.toContain('id="panel-');
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain('Direkter Einstieg');
    expect(html).not.toContain('Zuletzt verwendet');
    // Suche NICHT auf der Seite (lebt im Header)
    expect(html).not.toContain('type="search"');
  });

  it('Rubrik «Häufig gebraucht» steht zwischen Einstiegen und Registerteil I (Power-Pfad bleibt)', async () => {
    const html = seiteHtml('/');
    const { haeufigGebrauchtKarten } = await import('../lib/haeufigGebraucht');
    expect(html).toContain('Häufig gebraucht');
    const karten = haeufigGebrauchtKarten();
    expect(karten.length).toBeGreaterThan(0);
    for (const k of karten) expect(html).toContain(`href="${k.href}"`);
    expect(html.indexOf('aria-label="Oberkategorien"')).toBeLessThan(html.indexOf('gruppe-haeufig'));
    expect(html.indexOf('gruppe-haeufig')).toBeLessThan(html.indexOf('id="register-zustaendigkeiten"'));
    // Rubrik verschwindet bei aktiver Suche (Trefferliste ersetzt das Register)
    expect(seiteHtml('/?q=Verzugszins')).not.toContain('gruppe-haeufig');
  });

  it('geplante Karten je Kategorie hinter der «In Vorbereitung (N)»-Aufklappzeile (§8, ohne Ballast)', () => {
    const html = seiteHtml('/');
    expect(html).toContain('<details');
    expect(html).toContain('In Vorbereitung');
    // geplante Titel sind enthalten (Stichprobe), aber nicht als Link
    expect(html).toContain('Existenzminimum');
    expect(html).not.toContain('href="/rechner/existenzminimum"');
  });

  it('Alt-Parameter ?ansicht= und ?gebiet= bleiben harmlos (Link-Erbe)', () => {
    for (const url of ['/?ansicht=katalog', '/?gebiet=arbeit']) {
      const html = seiteHtml(url);
      expect(html).toContain('id="register-fristen"');
      expect(html).not.toContain('role="tablist"');
    }
  });

  it('?q= ersetzt das Register durch die flache Trefferliste — mit Kategorie-Label (teilbare Suche)', () => {
    const html = seiteHtml('/?q=Rechtsvorschlag');
    expect(html).toContain('Treffer');
    expect(html).toContain('href="/rechner/schkg-fristen"'); // schkg-fristen via Keyword
    expect(html).not.toContain('id="register-'); // Register ausgeblendet
    expect(html).toContain('Fristen ·'); // Kategorie-Label in der Trefferzeile
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
