import { describe, it, expect, beforeEach } from 'vitest';
import {
  ladeTabs, merkeTab, ersetzeTab, schliesseTab, leereTabs, ordneTabsUm, naechsteInstanz,
  aktualisiereTabArtikel, neuerLeererReiter, hatLeerenReiter,
  schliesseAndere, schliesseRechtsVon, stelleLetztenWiederHer, letzterGeschlossener,
  istReiterPfad,
} from '../lib/tabs';

// In-App-Reiter (lib/tabs.ts): Persistenz, stabile Reihenfolge, Dublette per
// pathname, MAX-Kappung, korruptes localStorage. Reines Speicher-Werkzeug.
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

describe('tabs.ts — offene Reiter', () => {
  it('neuer Reiter hinten angehängt; Reihenfolge stabil', () => {
    merkeTab('/rechner/tagerechner');
    merkeTab('/gesetze/bund/or');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/rechner/tagerechner', '/gesetze/bund/or']);
  });

  it('Dublette per pathname: Position bleibt, Label wird aktualisiert', () => {
    merkeTab('/rechner/tagerechner');
    merkeTab('/gesetze/bund/or');
    merkeTab('/rechner/tagerechner', 'Fristenrechner');
    const t = ladeTabs();
    expect(t.map((x) => x.path)).toEqual(['/rechner/tagerechner', '/gesetze/bund/or']);
    expect(t[0].label).toBe('Fristenrechner');
  });

  it('verschiedene ?query desselben Pfads = derselbe Reiter', () => {
    merkeTab('/rechner/tagerechner?preset=a');
    merkeTab('/rechner/tagerechner?preset=b');
    expect(ladeTabs().length).toBe(1);
  });

  it('MAX 50: der älteste (vorn) fällt heraus (Limit 8→50, Auftrag David)', () => {
    for (let i = 0; i < 52; i++) merkeTab(`/rechner/r${i}`);
    const t = ladeTabs();
    expect(t.length).toBe(50);
    expect(t[0].path).toBe('/rechner/r2');
    expect(t[49].path).toBe('/rechner/r51');
  });

  it('?r-Diskriminator: dasselbe Gesetz mehrfach offen (Auftrag David)', () => {
    merkeTab('/gesetze/bund/OR');
    merkeTab('/gesetze/bund/OR?r=2');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/gesetze/bund/OR', '/gesetze/bund/OR?r=2']);
    // andere Query (kein ?r) bleibt EIN Reiter
    merkeTab('/gesetze/bund/OR?preset=x');
    expect(ladeTabs().length).toBe(2);
  });

  it('naechsteInstanz: nächster freier ?r, Artikel-Anker bleibt erhalten', () => {
    merkeTab('/gesetze/bund/OR');
    expect(naechsteInstanz('/gesetze/bund/OR#art-41')).toBe('/gesetze/bund/OR?r=2#art-41');
    merkeTab('/gesetze/bund/OR?r=2');
    expect(naechsteInstanz('/gesetze/bund/OR')).toBe('/gesetze/bund/OR?r=3');
  });

  it('aktualisiereTabArtikel ändert nur den Anker des passenden Reiters', () => {
    merkeTab('/gesetze/bund/OR?r=2');
    aktualisiereTabArtikel('/gesetze/bund/OR?r=2#art-97');
    expect(ladeTabs()[0].path).toBe('/gesetze/bund/OR?r=2#art-97');
    // kein passender Reiter → keine Änderung, kein Crash
    aktualisiereTabArtikel('/gesetze/bund/ZGB#art-1');
    expect(ladeTabs().length).toBe(1);
  });

  // ── W2·24 §5a Ziff. 3 (R2-Nachzug 6.9.2026) · ERSETZEN STATT ANHÄUFEN ─────
  // VERHALTENSÄNDERUNG, deklariert: bis hierher legte JEDE Navigation einen
  // Reiter an (gemessen im Preview: drei Klicks OR → ZGB → ZPO = drei Reiter).
  // `merkeTab` behält seine anhängende Bedeutung — sie ist jetzt der Weg für den
  // AUSDRÜCKLICH neuen Reiter (Mittelklick, ⌘/Ctrl+Enter, zweite Instanz);
  // die gewöhnliche Navigation läuft über `ersetzeTab`.
  describe('ersetzeTab — die Navigation verbraucht den aktiven Reiter', () => {
    it('ersetzt an Ort und Stelle; die Reihenfolge bleibt', () => {
      merkeTab('/gesetze/bund/OR');
      merkeTab('/rechner/tagerechner');
      ersetzeTab('/gesetze/bund/OR', '/gesetze/bund/ZGB');
      expect(ladeTabs().map((t) => t.path)).toEqual(['/gesetze/bund/ZGB', '/rechner/tagerechner']);
    });

    it('drei Navigationen hintereinander = EIN Reiter (kein Wildwuchs)', () => {
      ersetzeTab(null, '/gesetze/bund/OR');
      ersetzeTab('/gesetze/bund/OR', '/gesetze/bund/ZGB');
      ersetzeTab('/gesetze/bund/ZGB', '/gesetze/bund/ZPO');
      expect(ladeTabs().map((t) => t.path)).toEqual(['/gesetze/bund/ZPO']);
    });

    it('Ziel schon offen → nur wechseln, der aktive Reiter bleibt stehen', () => {
      merkeTab('/gesetze/bund/OR');
      merkeTab('/gesetze/bund/ZGB');
      ersetzeTab('/gesetze/bund/ZGB', '/gesetze/bund/OR', 'Obligationenrecht');
      expect(ladeTabs().map((t) => t.path)).toEqual(['/gesetze/bund/OR', '/gesetze/bund/ZGB']);
      expect(ladeTabs()[0].label).toBe('Obligationenrecht');
    });

    it('kein aktiver Reiter (Kaltstart, Übersichtsseite) → anhängen wie bisher', () => {
      merkeTab('/gesetze/bund/OR');
      ersetzeTab(null, '/rechner/tagerechner');
      ersetzeTab('/gesetze/bund/UNBEKANNT', '/vorlagen/kuendigung');
      expect(ladeTabs().map((t) => t.path))
        .toEqual(['/gesetze/bund/OR', '/rechner/tagerechner', '/vorlagen/kuendigung']);
    });

    it('der ersetzte Reiter erbt NICHTS vom alten (Label, Lesestellung, Wahl)', () => {
      merkeTab('/gesetze/bund/OR#art-336_c', 'Obligationenrecht');
      aktualisiereTabArtikel('/gesetze/bund/OR#art-97');
      ersetzeTab('/gesetze/bund/OR', '/gesetze/bund/ZGB');
      expect(ladeTabs()).toEqual([{ path: '/gesetze/bund/ZGB' }]);
    });
  });

  // ── F5 (Prüfbefund 6.9.2026) · BESCHRIFTUNG AUS DER ADRESSE, NICHT AUS DEM
  // SCROLL. Rot zu bekommen: in `eintragAus` den `wahl`-Zweig streichen, oder
  // in `aktualisiereTabArtikel` `wahl` mitschreiben.
  describe('wahl — der gewählte Anker neben der Lesestellung', () => {
    it('die Adresse setzt `wahl`; der Scroll-Spy rührt sie nicht an', () => {
      merkeTab('/gesetze/bund/OR#art-336_c');
      expect(ladeTabs()[0].wahl).toBe('#art-336_c');
      aktualisiereTabArtikel('/gesetze/bund/OR#art-97');
      const t = ladeTabs()[0];
      expect(t.path, 'die Lesestellung folgt dem Scroll').toBe('/gesetze/bund/OR#art-97');
      expect(t.wahl, 'die Beschriftung folgt der Adresse').toBe('#art-336_c');
    });

    it('ein Update OHNE Anker löscht die Wahl nicht (Tracker schickt pathname+search)', () => {
      merkeTab('/gesetze/bund/OR#art-336_c');
      merkeTab('/gesetze/bund/OR');
      expect(ladeTabs()[0].wahl).toBe('#art-336_c');
    });

    it('ohne Anker in der Adresse gibt es keine Wahl (kein geratener Artikel)', () => {
      merkeTab('/gesetze/bund/ZGB');
      aktualisiereTabArtikel('/gesetze/bund/ZGB#art-3');
      expect(ladeTabs()[0].wahl).toBeUndefined();
    });
  });

  it('schliesseTab entfernt per pathname', () => {
    merkeTab('/a'); merkeTab('/b');
    schliesseTab('/a');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/b']);
  });

  it('leereTabs leert die Liste', () => {
    merkeTab('/a'); leereTabs();
    expect(ladeTabs()).toEqual([]);
  });

  it('ordneTabsUm verschiebt den Reiter an die Zielposition (#12 Drag-and-Drop)', () => {
    merkeTab('/a'); merkeTab('/b'); merkeTab('/c'); merkeTab('/d');
    // /d nach vorne (an Position von /a)
    ordneTabsUm('/d', '/a');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/d', '/a', '/b', '/c']);
    // /d wieder nach hinten (an Position von /c)
    ordneTabsUm('/d', '/c');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/a', '/b', '/c', '/d']);
  });

  // ── D15/D16 (David 6.9.2026) · DIE SEITE KOMMT VOM ZEIGER ────────────────
  // «per drag and drop soll man register verschieben können … analog browser».
  // Der dritte Parameter sagt, ob der Reiter DAVOR oder DAHINTER einrastet;
  // ohne ihn liesse sich kein Reiter ans ENDE ziehen (hinter dem letzten gibt
  // es kein weiteres Ziel). Der Default bleibt die frühere, richtungsabhängige
  // Regel — der Fall darüber prüft sie unverändert weiter.
  it('ordneTabsUm mit ausdrücklicher Seite: davor / dahinter', () => {
    merkeTab('/a'); merkeTab('/b'); merkeTab('/c');
    // /a DAHINTER /c → ans Ende (mit dem Default wäre es ebenfalls dahinter,
    // hier steht es ausdrücklich).
    ordneTabsUm('/a', '/c', false);
    expect(ladeTabs().map((t) => t.path)).toEqual(['/b', '/c', '/a']);
    // /a DAVOR /c — dieselbe Richtung wie eben, aber die andere Seite: der
    // Default (von > nach ⇒ davor … hier von < nach) läge falsch.
    leereTabs(); merkeTab('/a'); merkeTab('/b'); merkeTab('/c');
    ordneTabsUm('/a', '/c', true);
    expect(ladeTabs().map((t) => t.path)).toEqual(['/b', '/a', '/c']);
    // Rückwärts, ausdrücklich dahinter.
    leereTabs(); merkeTab('/a'); merkeTab('/b'); merkeTab('/c');
    ordneTabsUm('/c', '/a', false);
    expect(ladeTabs().map((t) => t.path)).toEqual(['/a', '/c', '/b']);
  });

  it('ordneTabsUm: unbekannter Pfad oder gleiche Position → unverändert', () => {
    merkeTab('/a'); merkeTab('/b');
    ordneTabsUm('/x', '/a');   // /x existiert nicht
    ordneTabsUm('/a', '/a');   // gleiche Position
    expect(ladeTabs().map((t) => t.path)).toEqual(['/a', '/b']);
  });

  it('ordneTabsUm identifiziert per pathname (Query egal)', () => {
    merkeTab('/a'); merkeTab('/b');
    ordneTabsUm('/b?x=1', '/a?y=2');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/b', '/a']);
  });

  it('korruptes JSON / Nicht-Array → leere Liste (kein Crash)', () => {
    localStorage.setItem('lexmetrik-tabs', '{kaputt');
    expect(ladeTabs()).toEqual([]);
    localStorage.setItem('lexmetrik-tabs', '42');
    expect(ladeTabs()).toEqual([]);
  });

  // ── D19 (David 6.9.2026: «mit plus einen neuen reiter erzeugen können») ───
  describe('neuerLeererReiter — höchstens ein leerer Reiter', () => {
    it('legt Pfad "/" mit leer:true an, hinten angehängt', () => {
      merkeTab('/rechner/tagerechner');
      neuerLeererReiter();
      const t = ladeTabs();
      expect(t.map((x) => x.path)).toEqual(['/rechner/tagerechner', '/']);
      expect(t[1].leer).toBe(true);
    });

    it('zweiter Aufruf legt KEINEN zweiten an (höchstens einer gleichzeitig)', () => {
      neuerLeererReiter();
      neuerLeererReiter();
      neuerLeererReiter();
      expect(ladeTabs().length).toBe(1);
      expect(ladeTabs()[0]).toEqual({ path: '/', leer: true });
    });

    it('hatLeerenReiter meldet den Zustand korrekt', () => {
      expect(hatLeerenReiter()).toBe(false);
      neuerLeererReiter();
      expect(hatLeerenReiter()).toBe(true);
      schliesseTab('/');
      expect(hatLeerenReiter()).toBe(false);
    });

    it('ersetzeTab füllt den leeren Reiter und streicht das leer-Kennzeichen (§5a Ziff. 3 greift unverändert)', () => {
      neuerLeererReiter();
      ersetzeTab('/', '/gesetze/bund/OR#art-257_d', 'Art. 257d OR');
      const t = ladeTabs();
      expect(t.length).toBe(1);
      expect(t[0].path).toBe('/gesetze/bund/OR#art-257_d');
      expect(t[0].leer).toBeUndefined();
    });

    it('ein bereits offenes Ziel behält seine Position (Regel 1 aus §5a Ziff. 3): der leere Reiter bleibt dann leer stehen', () => {
      merkeTab('/gesetze/bund/OR');
      neuerLeererReiter();
      ersetzeTab('/', '/gesetze/bund/OR');
      const t = ladeTabs();
      expect(t.map((x) => x.path)).toEqual(['/gesetze/bund/OR', '/']);
      expect(t[1].leer).toBe(true);
    });
  });
  // ═══ M2 · MATERIALIEN TRAGEN EINEN REITER (Prüfbefund R11 #23) ════════════
  //
  // ROT ZU BEKOMMEN (§6.7): in `lib/tabs.istReiterPfad` das Wort `materialien`
  // aus dem Regex streichen ⇒ der erste Fall unten misst `false`.
  describe('M2 — Materialien sind reiterfähig', () => {
    it('eine Material-Detailseite trägt einen Reiter', () => {
      expect(istReiterPfad('/materialien/BJ-EHRA-PM-2025-01')).toBe(true);
    });

    it('die Rubrik-Übersicht /materialien trägt weiterhin einen Reiter (D7), die Startseite weiterhin keinen', () => {
      expect(istReiterPfad('/materialien')).toBe(true);
      expect(istReiterPfad('/')).toBe(false);
    });

    it('Meta-Seiten bleiben ohne Reiter — der Regex öffnet nur die fünf Rubriken', () => {
      expect(istReiterPfad('/ueber')).toBe(false);
      expect(istReiterPfad('/materialienxyz/abc')).toBe(false);
    });
  });

  // ═══ M3 · «ZULETZT GESCHLOSSEN» (Prüfbefund R11 #37) ══════════════════════
  //
  // ROT ZU BEKOMMEN (§6.7): den `merkeGeschlossen`-Aufruf in `schliesseTab`
  // entfernen ⇒ `stelleLetztenWiederHer` gibt null zurück, alle Fälle unten
  // werden rot. Die POSITION ist der eigentliche Prüfgegenstand: ein
  // Wiederherstellen ans Ende der Leiste wäre kein Wiederherstellen.
  describe('M3 — zuletzt geschlossen', () => {
    it('Schliessen an Position 2 ⇒ Wiederherstellung an Position 2, nicht am Ende', () => {
      merkeTab('/gesetze/bund/OR');
      merkeTab('/rechtsprechung/bge_146_III_1');
      merkeTab('/rechner/zpo-fristen');
      schliesseTab('/rechtsprechung/bge_146_III_1');
      expect(ladeTabs().map((t) => t.path)).toEqual(['/gesetze/bund/OR', '/rechner/zpo-fristen']);
      expect(stelleLetztenWiederHer()?.path).toBe('/rechtsprechung/bge_146_III_1');
      expect(ladeTabs().map((t) => t.path))
        .toEqual(['/gesetze/bund/OR', '/rechtsprechung/bge_146_III_1', '/rechner/zpo-fristen']);
    });

    it('Label und gewählter Anker kommen mit zurück', () => {
      merkeTab('/gesetze/bund/OR#art-336_c', 'OR');
      schliesseTab('/gesetze/bund/OR');
      const wieder = stelleLetztenWiederHer();
      expect(wieder?.label).toBe('OR');
      expect(wieder?.wahl).toBe('#art-336_c');
      expect(ladeTabs()[0].wahl).toBe('#art-336_c');
    });

    it('auch ein ERSETZTER Reiter (§5a Ziff. 3) landet im Ring — dort ist der Verlust der Normalfall', () => {
      merkeTab('/gesetze/bund/OR');
      ersetzeTab('/gesetze/bund/OR', '/gesetze/bund/ZGB');
      expect(ladeTabs().map((t) => t.path)).toEqual(['/gesetze/bund/ZGB']);
      expect(stelleLetztenWiederHer()?.path).toBe('/gesetze/bund/OR');
      expect(ladeTabs().map((t) => t.path)).toEqual(['/gesetze/bund/OR', '/gesetze/bund/ZGB']);
    });

    it('leerer Ring: kein Fehler, kein Reiter — die Aktion wird gar nicht erst angeboten', () => {
      expect(letzterGeschlossener()).toBeNull();
      expect(stelleLetztenWiederHer()).toBeNull();
      expect(ladeTabs()).toEqual([]);
    });

    it('der leere «+»-Reiter kommt NICHT in den Ring — er trägt kein Dokument', () => {
      neuerLeererReiter();
      schliesseTab('/');
      expect(letzterGeschlossener()).toBeNull();
    });

    it('«Alle schliessen» füllt den Ring; Wiederherstellen holt von hinten nach vorn zurück', () => {
      merkeTab('/gesetze/bund/OR');
      merkeTab('/gesetze/bund/ZGB');
      leereTabs();
      expect(ladeTabs()).toEqual([]);
      expect(stelleLetztenWiederHer()?.path).toBe('/gesetze/bund/ZGB');
      expect(stelleLetztenWiederHer()?.path).toBe('/gesetze/bund/OR');
      expect(ladeTabs().map((t) => t.path)).toEqual(['/gesetze/bund/OR', '/gesetze/bund/ZGB']);
    });

    it('ist derselbe Reiter inzwischen wieder offen, wird der Ring-Eintrag verbraucht statt verdoppelt', () => {
      merkeTab('/gesetze/bund/OR');
      schliesseTab('/gesetze/bund/OR');
      merkeTab('/gesetze/bund/OR');
      expect(stelleLetztenWiederHer()?.path).toBe('/gesetze/bund/OR');
      expect(ladeTabs().map((t) => t.path)).toEqual(['/gesetze/bund/OR']);
      expect(letzterGeschlossener()).toBeNull();
    });
  });

  // ═══ M4 · DIE SAMMEL-SCHLIESSER DES KONTEXTMENÜS ══════════════════════════
  //
  // ROT ZU BEKOMMEN (§6.7): in `schliesseRechtsVon` `slice(0, idx + 1)` durch
  // `slice(0, idx)` ersetzen ⇒ der genannte Reiter fiele mit weg und der erste
  // Fall unten wird rot.
  describe('M4 — Alle anderen / rechts davon schliessen', () => {
    beforeEach(() => {
      merkeTab('/gesetze/bund/OR');
      merkeTab('/rechtsprechung/bge_146_III_1');
      merkeTab('/rechner/zpo-fristen');
      merkeTab('/vorlagen/arbeitsvertrag');
    });

    it('rechts davon: der genannte Reiter und alles links bleibt', () => {
      schliesseRechtsVon('/rechtsprechung/bge_146_III_1');
      expect(ladeTabs().map((t) => t.path)).toEqual(['/gesetze/bund/OR', '/rechtsprechung/bge_146_III_1']);
    });

    it('rechts davon am letzten Reiter: nichts geschieht, nichts landet im Ring', () => {
      schliesseRechtsVon('/vorlagen/arbeitsvertrag');
      expect(ladeTabs().length).toBe(4);
      expect(letzterGeschlossener()).toBeNull();
    });

    it('alle anderen: genau einer bleibt, die drei anderen sind wiederherstellbar', () => {
      schliesseAndere('/rechner/zpo-fristen');
      expect(ladeTabs().map((t) => t.path)).toEqual(['/rechner/zpo-fristen']);
      expect(letzterGeschlossener()?.path).toBe('/vorlagen/arbeitsvertrag');
      expect(stelleLetztenWiederHer()?.path).toBe('/vorlagen/arbeitsvertrag');
      expect(ladeTabs().map((t) => t.path)).toEqual(['/rechner/zpo-fristen', '/vorlagen/arbeitsvertrag']);
    });

    it('ein unbekannter Pfad lässt beide Listen unangetastet (nie stilles Schliessen)', () => {
      schliesseAndere('/gesetze/bund/UNBEKANNT');
      schliesseRechtsVon('/gesetze/bund/UNBEKANNT');
      expect(ladeTabs().length).toBe(4);
    });
  });
});
