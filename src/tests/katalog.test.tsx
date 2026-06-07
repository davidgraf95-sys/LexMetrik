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

describe('Register auf der Hauptseite: Kachel-Raster ohne Steuer-Apparat (Radikal-Verschlankung 7.6.2026)', () => {
  it('Default: GESAMTER Katalog als Gebiets-KACHELN mit ehrlichen Zählern; kein Tab-/Filter-/Chip-Apparat', () => {
    const html = seiteHtml('/');
    // 5er-Gruppen sichtbar (&-Labels via sansAmp → Teilstrings prüfen)
    expect(html).toContain('Zivilrecht (materiell)');
    expect(html).toContain('Zivilprozess');
    expect(html).toContain('Vollstreckung');
    expect(html).toContain('Öffentliches Recht');
    expect(html).toContain('Strafrecht');
    // Raster-Ansicht: kein Panel offen — keine Karten, keine Badges sichtbar
    expect(html).not.toContain('id="panel-');
    expect(html).not.toContain('In Vorbereitung</span>');
    // Kachel trägt Inhaltsangabe + ehrliches Mengenbild (voller Katalog, §8)
    expect(html).toContain('id="kachel-arbeit"');
    expect(html).toContain('verfügbar');
    expect(html).toContain('in Vorbereitung');
    // WEG (Auftrag David): Tabs, Typ-Filter, Chip-Einstiege, Zuletzt, Entwurf-Notiz
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain('Gesamter Katalog (');
    expect(html).not.toContain('Output-Typ');
    expect(html).not.toContain('Direkter Einstieg');
    expect(html).not.toContain('Einstieg nach Anliegen');
    expect(html).not.toContain('Zuletzt verwendet');
    expect(html).not.toContain('erscheinen hier automatisch');
    expect(html).not.toContain('fachlich noch nicht geprüft —');
    // Suche NICHT auf der Seite (lebt im Header)
    expect(html).not.toContain('type="search"');
  });

  it('Rubrik «Häufig gebraucht» führt das Register als Direktlinks; «Übergreifend» steht am ENDE (Auftrag 7.6.2026)', async () => {
    const html = seiteHtml('/');
    const { haeufigGebrauchtKarten } = await import('../lib/haeufigGebraucht');
    // Rubrik zuoberst mit allen kuratierten, verfügbaren Werkzeugen als Links
    expect(html).toContain('Häufig gebraucht');
    const karten = haeufigGebrauchtKarten();
    expect(karten.length).toBeGreaterThan(0);
    karten.forEach((k) => expect(html).toContain(`id="werkzeug-${k.id}"`));
    expect(html.indexOf('gruppe-haeufig')).toBeLessThan(html.indexOf('gruppe-zivil-prozess'));
    // Übergreifend als LETZTE Obergruppe (nach Öffentliches Recht)
    expect(html.indexOf('id="gruppe-uebergreifend"')).toBeGreaterThan(html.indexOf('id="gruppe-oeffentlich"'));
    // Rubrik verschwindet bei aktiver Suche (Trefferliste ersetzt das Register)
    expect(seiteHtml('/?q=Verzugszins')).not.toContain('gruppe-haeufig');
  });

  it('?gebiet=arbeit: Panel ersetzt die ANGEKLICKTE Kachel an Ort und Stelle, übrige Kacheln bleiben (Wunsch David)', () => {
    const html = seiteHtml('/?gebiet=arbeit');
    expect(html).toContain('id="panel-arbeit"');
    expect(html).not.toContain('id="kachel-arbeit"');  // die geöffnete Kachel weicht ihrem Panel
    expect(html).toContain('id="kachel-miete"');       // … die übrigen bleiben sichtbar
    expect(html).toContain('Schliessen');              // expliziter Rückweg im Panel (✕ seit FAHRPLAN-DESIGN 3.3 aria-hidden)
    expect(html).toContain('lc-reveal-panel');         // gemächliche Einblendung (motion-reduce global)
    expect(html).toContain('view-transition-name:kachel-miete'); // Nachrutschen animierbar
    expect(html).toContain('In Vorbereitung</span>'); // geplante Karten im Panel sichtbar (voller Katalog)
    expect(html).toContain('Entwurf</span>');          // gebaute, ungeprüfte ebenso (§8)
    // Untergruppen-Anatomie bleibt
    expect(html).toContain('>Rechner<');
    // nur EIN Panel offen (das angewählte Gebiet)
    expect(html.match(/id="panel-/g)?.length).toBe(1);
  });

  it('Alt-Parameter ?ansicht= wird ignoriert (Link-Erbe bleibt harmlos)', () => {
    const html = seiteHtml('/?ansicht=katalog');
    expect(html).toContain('id="kachel-arbeit"');
    expect(html).not.toContain('role="tablist"');
  });

  it('?q= ersetzt die Kacheln durch die flache Trefferliste (teilbare Suche, Etappe 1.3)', () => {
    const html = seiteHtml('/?q=Rechtsvorschlag');
    expect(html).toContain('Treffer');
    expect(html).toContain('href="/rechner/schkg-fristen"'); // schkg-fristen via Keyword
    expect(html).not.toContain('id="kachel-'); // Kachel-Raster ausgeblendet
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
    expect(html).toContain('Fristen berechnen. Beträge beziffern. Rechtsdokumente aufsetzen.');
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
