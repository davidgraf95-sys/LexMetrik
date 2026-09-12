import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { DeckungsSicht } from '../pages/MaterialienDeckung';
import {
  summiere, quote, sortiere, zeilen, DECKUNG_PROFIL,
  type DeckungProjektion,
} from '../lib/materialien/deckung';
import echt from '../../public/materialien/deckungs-sicht.json';
import materialRegister from '../../public/materialien/register.json';

// ─── Die Deckungs-Seite «was wir nicht haben» (W2·6c, §11.5) ─────────────────
//
// DREI ZUSAGEN, DIE EINE EHRLICHKEITS-SEITE (§8) TRAGEN MUSS:
//
//  (1) KEINE ZAHL STEHT IM QUELLTEXT. Jede angezeigte Zahl kommt aus dem
//      Artefakt. Geprüft wird das nicht durch Grep über die Datei, sondern
//      indem die Seite gegen eine FIXTURE gerendert wird, deren Zahlen es im
//      echten Bestand nicht gibt — stünde etwas hartkodiert da, fiele es hier
//      als falsche Summe auf.
//  (2) DIE SUMMEN STIMMEN GEGEN DIE ZEILEN. `summiere()` ist die einzige Stelle,
//      die addiert; der Test addiert unabhängig nach und vergleicht.
//  (3) «NICHT ERHOBEN» IST NICHT «NULL». Eine Quote aus 0/0 wird nie angezeigt.

const fixture: DeckungProjektion = {
  profil: DECKUNG_PROFIL,
  staende: {
    deckung: '2026-01-02', entstehung: '2026-01-03', synopse: '2026-01-04',
    curia: '2026-01-05', provenienz: '2026-01-06', normtext: '2026-01-07',
  },
  ebenen: {
    anker: { haben: 2, gesamt: 9, stand: '2026-01-02', quelle: 'Fedlex (Testquelle)' },
    curia: { haben: 77, gesamt: null, stand: '2026-01-05', quelle: 'Curia (Testquelle)' },
    verfahrenBund: { haben: 55, gesamt: null, stand: '2026-01-06', quelle: 'Curia (Testquelle)' },
    verfahrenBs: { haben: 13, gesamt: 15, stand: '2026-01-06', quelle: 'Grosser Rat BS (Testquelle)' },
    bsKanten: { amtlich: 3, maschinell: 44 },
    zh: { haben: 0, gesamt: null, stand: '2026-01-06', quelle: 'Kantonsrat ZH — noch nicht erschlossen' },
  },
  erlasse: {
    // voll erfasst, mit Synopse-Fenster
    TESTA: {
      titel: 'Testgesetz A', sr: '999.1',
      ocFussnoten: 40, ocGetroffen: 30, aenderungen: 30, mitBotschaft: 7,
      fensterAb: '2021-01-01', schritte: 4, altBloecke: 100, ohneEreignis: 25,
      konflikte: 6, quellLuecken: 2,
    },
    // Fundstellen vorhanden, aber keine einzige getroffen ⇒ 0 %, muss sichtbar sein
    TESTB: {
      titel: 'Testgesetz B',
      ocFussnoten: 12, ocGetroffen: 0, aenderungen: 0, mitBotschaft: 0,
    },
    // gar keine Fundstelle ⇒ Quote nicht definiert, und kein Synopse-Fenster
    TESTC: {
      titel: 'Teststaatsvertrag C',
      ocFussnoten: 0, ocGetroffen: 0, aenderungen: 0, mitBotschaft: 0,
      fensterAb: '2022-01-01', schritte: 1, altBloecke: 8, ohneEreignis: 8,
      konflikte: 0, quellLuecken: 0,
    },
  },
};

function html(p: DeckungProjektion): string {
  return renderToString(<MemoryRouter><DeckungsSicht p={p} /></MemoryRouter>);
}

/** Sichtbarer Text der Seite: Tags und die SSR-Textnoden-Marker (`<!-- -->`)
 *  weg, Leerraum normalisiert. Nur so lässt sich prüfen, dass eine Summe im
 *  SATZ steht und nicht bloss irgendwo als Ziffernfolge vorkommt. */
function text(h: string): string {
  return h.replace(/<!--.*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

describe('summiere()', () => {
  it('addiert die Zeilen der Fixture unabhängig nachgerechnet', () => {
    const s = summiere(fixture);
    const z = Object.values(fixture.erlasse);
    expect(s.erlasse).toBe(z.length);
    expect(s.ocFussnoten).toBe(z.reduce((a, x) => a + x.ocFussnoten, 0));
    expect(s.ocGetroffen).toBe(z.reduce((a, x) => a + x.ocGetroffen, 0));
    expect(s.aenderungen).toBe(z.reduce((a, x) => a + x.aenderungen, 0));
    expect(s.mitBotschaft).toBe(z.reduce((a, x) => a + x.mitBotschaft, 0));
    expect(s.altBloecke).toBe(z.reduce((a, x) => a + (x.altBloecke ?? 0), 0));
    expect(s.ohneEreignis).toBe(z.reduce((a, x) => a + (x.ohneEreignis ?? 0), 0));
    expect(s.konflikte).toBe(z.reduce((a, x) => a + (x.konflikte ?? 0), 0));
    expect(s.quellLuecken).toBe(z.reduce((a, x) => a + (x.quellLuecken ?? 0), 0));
    expect(s.mitFenster).toBe(z.filter((x) => x.altBloecke !== undefined).length);
    // Die beiden Lücken-Klassen schliessen sich aus und werden nie vermischt.
    expect(s.ohneTreffer).toBe(1); // TESTB: 0 von 12
    expect(s.ohneFundstelle).toBe(1); // TESTC: gar keine Fundstelle
  });

  it('rechnet dieselben Summen über das ausgelieferte Artefakt', () => {
    const p = echt as unknown as DeckungProjektion;
    const s = summiere(p);
    const z = Object.values(p.erlasse);
    expect(s.erlasse).toBe(z.length);
    expect(s.ocGetroffen).toBe(z.reduce((a, x) => a + x.ocGetroffen, 0));
    expect(s.altBloecke).toBe(z.reduce((a, x) => a + (x.altBloecke ?? 0), 0));
    // §8-Invarianten des Artefakts: nie mehr getroffen als vorhanden, nie mehr
    // Alt-Blöcke ohne Ereignis als Alt-Blöcke, nie mehr Botschaften als Änderungen.
    for (const [key, x] of Object.entries(p.erlasse)) {
      expect(x.ocGetroffen, key).toBeLessThanOrEqual(x.ocFussnoten);
      expect(x.mitBotschaft, key).toBeLessThanOrEqual(x.aenderungen);
      if (x.altBloecke !== undefined) expect(x.ohneEreignis ?? 0, key).toBeLessThanOrEqual(x.altBloecke);
    }
    expect(s.ocFussnoten).toBeGreaterThan(0);
    expect(s.altBloecke).toBeGreaterThan(0);
  });
});

describe('quote()', () => {
  it('gibt null statt 0/0 zurück — eine Quote ohne Grundgesamtheit wird nie erfunden', () => {
    expect(quote({ ocFussnoten: 0, ocGetroffen: 0 })).toBeNull();
    expect(quote({ ocFussnoten: 12, ocGetroffen: 0 })).toBe(0);
    expect(quote({ ocFussnoten: 40, ocGetroffen: 30 })).toBeCloseTo(0.75, 10);
  });
});

describe('sortiere()', () => {
  const liste = zeilen(fixture);

  it('stellt nicht messbare Zeilen in BEIDEN Richtungen ans Ende', () => {
    for (const r of ['auf', 'ab'] as const) {
      const s = sortiere(liste, 'quote', r);
      expect(s[s.length - 1].key).toBe('TESTC');
    }
  });

  it('sortiert aufsteigend die 0-%-Zeile nach vorn, absteigend nach hinten', () => {
    expect(sortiere(liste, 'quote', 'auf')[0].key).toBe('TESTB');
    expect(sortiere(liste, 'quote', 'ab')[0].key).toBe('TESTA');
  });

  it('ist stabil: gleiche Werte behalten die Key-Reihenfolge', () => {
    // aenderungen: TESTB und TESTC sind beide 0 -> Key entscheidet, nie die Einfügeordnung.
    const s = sortiere(liste, 'aenderungen', 'auf').map((x) => x.key);
    expect(s.indexOf('TESTB')).toBeLessThan(s.indexOf('TESTC'));
    expect(sortiere([...liste].reverse(), 'aenderungen', 'auf').map((x) => x.key)).toEqual(s);
  });
});

describe('DeckungsSicht (gerendert aus der Fixture)', () => {
  const out = html(fixture);

  it('zeigt die Summen der Fixture im Satz, nicht Zahlen aus dem echten Bestand', () => {
    const s = summiere(fixture);
    const t = text(out);
    // Ebenen-Zeile: «30 von 52 Fundstellen» + «22 nicht erfasst».
    expect(t).toContain(`${s.ocGetroffen} von ${s.ocFussnoten} Fundstellen`);
    expect(t).toContain(`${s.ocFussnoten - s.ocGetroffen} nicht erfasst`);
    // Botschafts-Ebene: 7 von 30 Änderungen.
    expect(t).toContain(`${s.mitBotschaft} von ${s.aenderungen} Änderungen`);
    // Synopse-Abschnitt: 108 Alt-Blöcke, davon 33 ohne Ereignis = 30.6 %.
    expect(t).toContain(`sind ${s.altBloecke} Textblöcke`);
    expect(t).toContain(`Bei ${s.ohneEreignis} davon`);
    expect(t).toContain(`${((s.ohneEreignis / s.altBloecke) * 100).toFixed(1)} %`);
    // Gegenprobe: die echten Kennzahlen dürfen NICHT auftauchen.
    const e = summiere(echt as unknown as DeckungProjektion);
    expect(t).not.toContain(e.altBloecke.toLocaleString('de-CH'));
    expect(t).not.toContain(e.ocFussnoten.toLocaleString('de-CH'));
  });

  it('nennt jeden Erlass mit Kürzel, Titel und Link in die Gesetzessammlung', () => {
    for (const [key, z] of Object.entries(fixture.erlasse)) {
      expect(out).toContain(key);
      expect(out).toContain(z.titel);
      expect(out).toContain(`/gesetze/bund/${key}`);
    }
  });

  it('zeigt die 0-%-Zeile als Zahl und die nicht messbare als Gedankenstrich', () => {
    expect(out).toContain('0.0 %');
    expect(out).toContain('—');
    expect(out).toContain('75.0 %');
  });

  it('schreibt «Grundgesamtheit nicht erhoben» statt einer erfundenen Vollständigkeit', () => {
    expect(out).toContain('Grundgesamtheit nicht erhoben');
    expect(out).not.toContain('77 von 77');
  });

  it('kennzeichnet die maschinell abgeleiteten Kanten als nicht geprüft', () => {
    expect(out).toContain('fachlich nicht geprüft');
    expect(out).toContain('maschinell');
  });

  it('bezeichnet die Quote «ohne Ereignis» ausdrücklich als ungeprüft', () => {
    expect(out).toContain('nicht geprüft');
    expect(out).toContain('nicht untersucht');
  });

  it('trägt sortierbare Spaltenköpfe mit aria-sort', () => {
    expect(out).toContain('aria-sort="ascending"');
    expect(out).toContain('aria-sort="none"');
  });
});

describe('Route /materialien/deckung', () => {
  it('kann keinen Material-Schlüssel verschatten', () => {
    // Die statische Route steht neben /materialien/:key. Sie ist kleingeschrieben;
    // alle Material-Schlüssel sind versal — geprüft, nicht angenommen (§7).
    const keys = (materialRegister as { materialien: { key: string }[] }).materialien.map((m) => m.key);
    expect(keys.length).toBeGreaterThan(0);
    expect(keys.filter((k) => k.toLowerCase() === 'deckung')).toEqual([]);
  });
});
