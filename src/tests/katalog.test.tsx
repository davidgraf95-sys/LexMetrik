import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LocaleProvider } from '../components/locale';
import { Startseite } from '../pages/Startseite';
import { RechnerUebersicht } from '../pages/RechnerUebersicht';
import { VorlagenUebersicht } from '../pages/VorlagenUebersicht';
import { HeaderSuche } from '../components/layout/HeaderSuche';
import { RechnerKarte } from '../components/RechnerKarte';
import { ALLE_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';

// Akzeptanztests Katalog/Rubriken. Stand UI-Welle (deklarierte Anpassung
// §6 Ziff. 3): /recherche ist aufgelöst — die Rechner-/Vorlagen-Register leben
// auf eigenen Übersichtsseiten (/rechner, /vorlagen), die die bestehende
// KategorieSektion wiederverwenden; die Suche liegt im Header-Dropdown. Die
// Startseite «/» ist das Suche-zuerst-Cockpit (Begrüssung, News, Schnellrechner,
// Zeiterfassung, Favoriten).

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

// UI-Welle: /recherche ist aufgelöst — die Rechner- und Vorlagen-Register
// leben jetzt auf eigenen Übersichtsseiten (/rechner, /vorlagen), die die
// bestehende KategorieSektion wiederverwenden (kein ?kategorie-Drilldown mehr,
// keine ?q=-Flachsuche — die Suche liegt im Header-Dropdown).
const rechnerHtml = () =>
  renderToString(
    <MemoryRouter initialEntries={['/rechner']}>
      <LocaleProvider><RechnerUebersicht /></LocaleProvider>
    </MemoryRouter>,
  );
const vorlagenHtml = (url = '/vorlagen') =>
  renderToString(
    <MemoryRouter initialEntries={[url]}>
      <LocaleProvider><VorlagenUebersicht /></LocaleProvider>
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

describe('Rechner-Übersicht /rechner (UI-Welle: Ersatz fürs Katalog-Deckblatt, §6.3)', () => {
  it('zeigt die drei Rechner-Kategorien als Sektionen — ohne Vorlagen, ohne Deckblatt/Suchfeld/Zurück-Weg', () => {
    const html = rechnerHtml();
    expect(html).toContain('id="register-zustaendigkeiten"');
    expect(html).toContain('id="register-fristen"');
    expect(html).toContain('id="register-gebuehren"');
    // Vorlagen liegen auf der eigenen Seite /vorlagen
    expect(html).not.toContain('id="register-vorlagen"');
    // kein Deckblatt-Klickmodell, keine Flachsuche, kein «Alle Kategorien»-Zurück
    expect(html).not.toContain('aria-label="Oberkategorien"');
    expect(html).not.toContain('type="search"');
    expect(html).not.toContain('Alle Kategorien');
  });

  it('Fristen-Register direkt sichtbar: Haupteinstieg Tagerechner + prozessual/materiell (kein Drilldown)', () => {
    const html = rechnerHtml();
    expect(html).toContain('id="register-titel-fristen"');
    expect(html).toContain('Fristen berechnen');
    expect(html).toContain('Einfacher Fristenrechner (Datum · Frist · Ferien-Wahl)');
    expect(html).toContain('href="/rechner/tagerechner"');
    expect(html).toContain('Prozessuale Fristen');
    expect(html).toContain('href="/rechner/zpo-fristen"');
    expect(html).toContain('href="/rechner/schkg-fristen"');
    expect(html).toContain('Materielle Fristen');
    expect(html).toContain('href="/rechner/verjaehrung"');
    expect(html).toContain('Art. 336c OR');
    expect(html.indexOf('Fristenrechner')).toBeLessThan(html.indexOf('Gewährleistung'));
    // Fristenspiegel aufgelöst; keine gleichrangige Mischliste
    expect(html).not.toContain('Fristenspiegel');
    expect(html).not.toContain('Weitere Werkzeuge');
  });

  it('Zuständigkeiten- + Gebühren-Sektion tragen ihre Werkzeuge; Ehrlichkeit (§8) bleibt', () => {
    const html = rechnerHtml();
    expect(html).toContain('Rechtswege');                  // Zuständigkeits-Register
    expect(html).toContain('href="/rechner/verzugszins"'); // Gebühren-Werkzeug
    expect(html).toContain('Entwurf</span>');
    expect(html).toContain('In Vorbereitung');
    expect(html).toContain('<details');
  });

  it('Methodik-Fuss + Pflichthinweis (§8) erreichbar; kein «kostenlos»', () => {
    const html = rechnerHtml();
    expect(html).toContain('So rechnet LexMetrik');
    expect(html).toContain('href="/methodik"');
    expect(html).toContain('Rechtlicher Hinweis');
    expect(html).not.toContain('kostenlos');
  });
});

describe('Vorlagen-Übersicht /vorlagen (UI-Welle)', () => {
  it('zeigt die Vorlagen-Sektion mit Dokument-Gruppen + Rechtsgebiet-Filter, keine Rechner-Sektion', () => {
    const html = vorlagenHtml();
    expect(html).toContain('id="register-vorlagen"');
    // Dokument-Gruppen (VORLAGE_SEKTIONEN-Titel)
    expect(html).toContain('Behördeneingaben');
    expect(html).toContain('Verträge');
    // Filter-Pillen nur in der Vorlagen-Kategorie
    expect(html).toContain('aria-label="Vorlagen nach Rechtsgebiet filtern"');
    // Rechner-Sektionen liegen auf /rechner
    expect(html).not.toContain('id="register-fristen"');
    expect(html).not.toContain('aria-label="Oberkategorien"');
  });

  it('eine verfügbare Vorlage ist direkt verlinkt; Filter-Reset «Alle» vorhanden', () => {
    const html = vorlagenHtml();
    expect(html).toContain('href="/vorlagen/mahnung"');
    expect(html).toContain('>Alle<');
  });
});

describe('Globale Suche im Top-Streifen (UI-Welle: Dropdown überall, §6.3)', () => {
  // Deklarierte fachliche Änderung (§6.3, UI-Welle): Das Topbar-Feld führt nicht
  // mehr über ?q=/«/recherche», sondern zeigt Treffer als Dropdown direkt unter
  // dem Feld — auf JEDER Seite gleich. Beim ersten Render (SSR, leeres Feld) ist
  // genau ein leeres Suchfeld da; das Dropdown erscheint erst clientseitig beim
  // Tippen (Lazy-Daten).
  it('rendert genau ein leeres Suchfeld mit «/»-Kürzel — unabhängig vom Pfad', () => {
    for (const url of ['/', '/rechner/verzugszins', '/gesetze', '/rechtsprechung']) {
      const html = sucheHtml(url);
      expect(html.match(/type="search"/g)?.length, url).toBe(1);
      expect(html, url).toContain('value=""');
      expect(html, url).toContain('aria-keyshortcuts="/"');
    }
  });

  it('trägt die Such-Landmark (role="search") und kein ?q=-gebundenes Vorbefüllen mehr', () => {
    const html = sucheHtml('/?q=Rechtsvorschlag');
    expect(html).toContain('role="search"');
    // Kein Spiegeln von ?q= ins Feld (Dropdown-Suche ist URL-unabhängig).
    expect(html).toContain('value=""');
  });
});

describe('Startseite V2 — «Rechner-zuerst»-Cockpit (19.6.2026, deklarierte Anpassung §6 Ziff. 3)', () => {
  it('zeigt Begrüssung, Schnellrechner, Zeiterfassung und Favoriten — KEIN Katalog-Deckblatt', () => {
    const html = startHtml('/');
    // Begrüssung (zufällig, tageszeitpassend → kein fixer Text) + Datum/Uhr-Zeile.
    // Das «Berechnung statt KI»-Badge wurde 26.6.2026 entfernt (Auftrag David) —
    // der ehrliche KI-/Determinismus-Hinweis trägt jetzt allein der §8-Disclaimer.
    expect(html).toMatch(/·\s\d{2}:\d{2}:\d{2}/); // Datum · HH:MM:SS
    expect(html).not.toContain('Berechnung statt KI');
    // Sektionen des Cockpits
    expect(html).toContain('Schnellrechner');
    expect(html).toContain('Zeiterfassung');
    expect(html).toContain('Favoriten');
    // Schnellrechner rechnet live (der «live hergeleitet»-Badge wurde 25.6.2026
    // auf Wunsch David als redundant entfernt — der Live-Hinweis im Ergebnisblock
    // genügt; §6 Ziff. 3 deklarierte fachliche Änderung).
    expect(html).toContain('Live-Berechnung');
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
