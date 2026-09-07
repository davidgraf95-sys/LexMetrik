// scripts/datenhaltung/suche-kern.test.ts
// W2·13-KANTONE K-3 / F35: der Artikel-Treffer der Edge-Suche trägt die EBENE des
// Erlasses (und kantonal sein Kürzel) bis an die Netzgrenze.
//
// WARUM EIGENE DATEI (nicht suche.test.ts): die dortigen Tests bauen im
// `beforeAll` beide HOT-DBs aus den echten Quellen (Budget 95 s, s. Kopf jener
// Datei). Die Zeilen-Formung ist eine REINE Funktion — sie braucht keine DB, und
// ein Beweis, der 95 s wartet, wird im Alltag nicht gefahren. Hier laufen darum
// nur die importfreien Bausteine gegen handgeschriebene Roh-Zeilen.
import { describe, expect, it } from 'vitest';
import {
  baueFtsSpaltenMatch,
  BM25_GEWICHTE,
  formeArtikelTreffer,
  FTS_ARTIKEL_SPALTEN,
  FTS_SPALTEN_HAUPT,
  FTS_SPALTEN_NEBEN,
  SQL_ARTIKEL_TREFFER,
  type ArtikelRohzeile,
} from './suche-kern';

const BLOECKE = JSON.stringify([{ text: 'Der Anwalt hat Anspruch auf ein Honorar.' }]);

function zeile(ueber: Partial<ArtikelRohzeile> = {}): ArtikelRohzeile {
  return {
    erlass_key: 'OR',
    art_id: 'art_330_a',
    artikel: '330_a',
    artikel_label: 'Art. 330a',
    quelle_url: 'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de#art_330_a',
    bloecke_json: BLOECKE,
    abkuerzung: 'OR',
    ebene: 'bund',
    kanton: null,
    ...ueber,
  };
}

describe('formeArtikelTreffer: Ebene + Kanton in der Fundstelle (F35)', () => {
  it('Kanton-Zeile → ebene «kanton» und das Kantonskürzel', () => {
    const t = formeArtikelTreffer(
      zeile({
        erlass_key: 'AG-291.150',
        art_id: 'art_1',
        artikel: '1',
        artikel_label: '§ 1',
        abkuerzung: 'AnwT',
        quelle_url: 'https://gesetzessammlungen.ag.ch/app/de/texts_of_law/291.150',
        ebene: 'kanton',
        kanton: 'AG',
      }),
      'honorar',
    );
    expect(t.fundstelle.ebene).toBe('kanton');
    expect(t.fundstelle.kanton).toBe('AG');
    // Die bestehenden Fundstellen-Felder bleiben, was sie waren.
    expect(t.fundstelle.erlass).toBe('AG-291.150');
    expect(t.fundstelle.artikel).toBe('1');
  });

  it('Bund-Zeile → ebene «bund», KEIN kanton-Feld (kein leeres Kürzel im Draht)', () => {
    const t = formeArtikelTreffer(zeile(), 'honorar');
    expect(t.fundstelle.ebene).toBe('bund');
    expect('kanton' in t.fundstelle).toBe(false);
  });

  it('Alt-Zeile ohne ebene/kanton → Fundstelle wie bisher (kein undefined im JSON)', () => {
    // Ein Aufrufer, der die neuen Spalten nicht selektiert (oder eine gecachte
    // Alt-Antwort), darf keine Scheinauskunft erzeugen: dann steht schlicht
    // nichts da, und der Client fällt auf sein Alt-Verhalten zurück (§8).
    const alt = zeile() as Partial<ArtikelRohzeile>;
    delete alt.ebene;
    delete alt.kanton;
    const t = formeArtikelTreffer(alt as ArtikelRohzeile, 'honorar');
    expect('ebene' in t.fundstelle).toBe(false);
    expect('kanton' in t.fundstelle).toBe(false);
    expect(JSON.parse(JSON.stringify(t.fundstelle))).toEqual({
      erlass: 'OR',
      artikel: '330_a',
      quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de#art_330_a',
    });
  });

  it('ADDITIV: die Top-Level-Form des Treffers ist unverändert (Alt-Clients)', () => {
    const t = formeArtikelTreffer(zeile({ ebene: 'kanton', kanton: 'AG' }), 'honorar');
    expect(Object.keys(t).sort()).toEqual(['fundstelle', 'id', 'snippet', 'titel']);
    // Kein Volltext-Leck durch die neuen Spalten.
    expect(JSON.stringify(t)).not.toMatch(/"bloecke"|"bloecke_json"|"volltext"/);
  });
});

describe('SQL_ARTIKEL_TREFFER liefert die Spalten, aus denen die Fundstelle gebaut wird', () => {
  it('selektiert e.ebene und e.kanton (sonst wäre das DTO-Feld immer leer)', () => {
    // Identitäts-Treffer mit Wortgrenze (§7), nicht blosse Substring-Präsenz:
    // «ebene» steckt auch in «erlass_key» nicht, aber «kanton» in «kanton_x»
    // sehr wohl — der Alias muss exakt so heissen.
    expect(SQL_ARTIKEL_TREFFER).toMatch(/\be\.ebene\s+AS\s+ebene\b/);
    expect(SQL_ARTIKEL_TREFFER).toMatch(/\be\.kanton\s+AS\s+kanton\b/);
  });
});

// ─── F5 (Gegenprüfung 31.8.2026): Spalten und Gewichte gehören zusammen ─────────────
describe('FTS_ARTIKEL_SPALTEN und BM25_GEWICHTE: eine Zahl je Spalte', () => {
  it('gleich viele Gewichte wie Spalten', () => {
    // Die Doku nennt die Reihenfolge «tragend» — bewacht war das nirgends. bm25()
    // ordnet die Gewichte POSITIONELL zu: eine Spalte mehr als Gewichte, und SQLite
    // rechnet stillschweigend mit 0 für das letzte Feld; ein Gewicht zu viel wirft
    // erst zur Laufzeit. Beides fiele sonst frühestens in der Trefferqualität auf.
    expect(BM25_GEWICHTE.length).toBe(FTS_ARTIKEL_SPALTEN.length);
  });

  it('die Stufen-Spalten sind echte Index-Spalten (sonst: no such column)', () => {
    // Ein Tippfehler in FTS_SPALTEN_HAUPT/-NEBEN erzeugt keinen Compile-Fehler,
    // sondern zur Laufzeit «no such column» — am Edge also 502 auf jede Query.
    for (const s of [...FTS_SPALTEN_HAUPT, ...FTS_SPALTEN_NEBEN]) {
      expect(FTS_ARTIKEL_SPALTEN as readonly string[], `«${s}» ist keine FTS-Spalte`).toContain(s);
    }
  });

  it('die Gewichte fallen in der dokumentierten Rangfolge t > m > n > g > tb > f', () => {
    // Nicht die konkreten Zahlen sind die Aussage, sondern die ORDNUNG: Volltext vor
    // primärer Marginalie, diese vor der nachrangigen, Tabelle und Fussnote zuletzt
    // (recall-only). Wer die Zahlen justiert, darf das — wer die Ordnung dreht, muss
    // hier vorbei und die fachliche Begründung in suche-kern.ts mitziehen.
    const [t, m, n, g, tb, f] = BM25_GEWICHTE;
    expect(t).toBeGreaterThan(m);
    expect(m).toBeGreaterThan(g);
    expect(g).toBeGreaterThan(n);
    expect(n).toBeGreaterThan(tb);
    expect(tb).toBeGreaterThan(f);
  });
});

// ─── F2 (Gegenprüfung 31.8.2026): die SEMANTIK des Spaltenfilters ────────────────────
// Die Wirkung dieser Ausdrücke auf die Rangfolge prüft suche-rang.test.ts gegen die
// echte DB (Budget 95 s). Hier steht die FORM — importfrei, in Millisekunden, und damit
// der Ort, an dem ein versehentlicher Rückfall auf das implizite AND sofort auffällt.
describe('baueFtsSpaltenMatch: EIN Term genügt (OR), nicht ALLE (implizites AND)', () => {
  it('mehrere Terme werden mit OR verknüpft', () => {
    expect(baueFtsSpaltenMatch('Verjährung Fristen', FTS_SPALTEN_HAUPT)).toBe(
      '{marginalie gliederung} : "Verjährung" OR {marginalie gliederung} : "Fristen"',
    );
  });

  it('ein einzelner Term bleibt unverändert (kein Streu-OR)', () => {
    expect(baueFtsSpaltenMatch('Miete', FTS_SPALTEN_HAUPT)).toBe('{marginalie gliederung} : "Miete"');
    expect(baueFtsSpaltenMatch('Miete', FTS_SPALTEN_NEBEN)).toBe('{marginalie_n} : "Miete"');
  });

  it('KEIN implizites AND mehr — die alte Form würde OR 127 auf Rang 8 legen', () => {
    // Identitäts-Prüfung statt Substring: gesucht ist die Trennung ZWISCHEN zwei
    // Spaltenfiltern. Stünde dort wieder nur ein Leerzeichen, wäre die AND-Semantik
    // zurück, und suche-rang.test.ts liefe (langsam) rot — hier fällt es sofort auf.
    const m = baueFtsSpaltenMatch('Verjährung Fristen', FTS_SPALTEN_HAUPT)!;
    expect(m).toMatch(/"\s+OR\s+\{/);
    expect(m).not.toMatch(/"\s+\{/);
  });

  it('Terme bleiben gequotet — Syntax und Injektion neutralisiert', () => {
    // Der Spaltenfilter ist der einzige Ort, an dem Nutzereingabe und feste
    // Spaltennamen in EINEN FTS5-Ausdruck geraten. Die Quotes tragen die Grenze.
    const m = baueFtsSpaltenMatch('foo" OR bar: NEAR', FTS_SPALTEN_HAUPT)!;
    expect(m).toBe(
      '{marginalie gliederung} : "foo" OR {marginalie gliederung} : "OR" OR ' +
        '{marginalie gliederung} : "bar" OR {marginalie gliederung} : "NEAR"',
    );
  });

  it('leere Query oder leere Spaltenliste → null (Aufrufer fällt auf `match` zurück)', () => {
    expect(baueFtsSpaltenMatch('', FTS_SPALTEN_HAUPT)).toBeNull();
    expect(baueFtsSpaltenMatch('§ —', FTS_SPALTEN_HAUPT)).toBeNull();
    expect(baueFtsSpaltenMatch('Miete', [])).toBeNull();
  });
});
