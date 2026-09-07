// scripts/datenhaltung/suche.test.ts
// QS-DATA E2-Vorarbeiten: Unit-Tests des Such-Query-Moduls gegen die lokal (in-memory,
// via denselben ingest+fts-Bausteinen wie datenhaltung:build) gebauten HOT-DBs.
// Kernbeweise: bm25-Treffer, diakritik-insensitiv, Pagination BY DESIGN, KEINE Volltext-
// Felder im Response, und der Payload-Grenz-Test (breite Query → Antwort << 4,5-MB-Wand).
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { oeffneDb, frischesSchema } from './schema';
import { ingestNormtext, ingestNormtextZiel, ingestRechtsprechung } from './ingest';
import { baueFtsArtikel, baueFtsEntscheideSchaufenster } from './fts';
import { bloeckeText } from './suche-kern';
import { sucheArtikel, sucheEntscheide, MAX_LIMIT } from './suche';

const PAYLOAD_WAND = 4.5 * 1024 * 1024; // 4,5-MB-Function-Payload-Wand (§4)

let dbN: DatabaseSync;
let dbR: DatabaseSync;

beforeAll(() => {
  dbN = oeffneDb();
  frischesSchema(dbN, 'normtext');
  ingestNormtext(dbN);
  ingestNormtextZiel(dbN);
  baueFtsArtikel(dbN);

  dbR = oeffneDb();
  frischesSchema(dbR, 'rechtsprechung');
  ingestRechtsprechung(dbR);
  baueFtsEntscheideSchaufenster(dbR);
  // ── Hook-Budget 60 s → 95 s (QS-E2E-STABIL, Messung 14.8.2026) ─────────────
  // REPRODUKTION VOR DEM FIX (F3): unter der im Fahrplan genannten Bedingung
  // «Parallel-Last (Builds + e2e)» — voller `npm run test:e2e` plus dauernd
  // laufender vite-build, Last-Mittel ~14 auf 10 Kernen — fiel dieser Hook in
  // 1 von 5 Läufen mit «Hook timed out in 60000ms».
  //
  // MESSREIHE, Datei-Gesamtdauer in s (der Hook ist der weit überwiegende Teil):
  //   isoliert (nichts sonst auf der Maschine, n=5):
  //     11.66 · 10.67 · 10.62 · 10.58 · 10.70   (mittel 10.85, sd 0.45)
  //   unter Parallel-Last (n=5, Bedingung oben):
  //     46.23 · 66.60 · 49.08 · 48.97 · 41.78   (mittel 50.53, sd 9.46)
  // Lastfaktor also ~4.7×, und die Streuung wächst um mehr als das Zwanzigfache
  // (sd 0.45 → 9.46 s). Genau daran scheitert ein Deckel, der gegen den
  // ISOLIERTEN Wert bemessen ist: isoliert wirken 60 s wie Faktor 5.5 Reserve,
  // unter Last liegt der Hook IM Streubereich des Deckels.
  //
  // HÖHE nach QS-PERF Ziff. 5 (Ist + max(3 sd, 25 %)): Ist = 66 600 ms
  // (schlechtester gemessener Wert), 3 sd = 27 840 ms, 25 % = 16 650 ms
  // → 66 600 + 27 840 = 94 440 ms, gerundet 95 000 ms.
  //
  // WARUM NICHT «Hook entlasten» (die Alternative im Fahrplan): der Hook baut
  // beide HOT-DBs aus den echten Quellen über dieselben ingest+fts-Bausteine wie
  // `datenhaltung:build`. Genau das ist die Aussage dieser Datei — ein gecachtes
  // DB-Artefakt nähme die Ingest-Strecke aus der Prüfung, der Test bewiese danach
  // weniger (§1 vor Tempo). Die Arbeit ist legitim schwer; zu korrigieren war der
  // ungemessene Deckel, nicht der Hook.
  //
  // §6.7: der Deckel kann weiterhin scheitern — er greift bei Überschreitung und
  // hält zum schlechtesten belegten Wert noch ~30 % Abstand; eine echte
  // Verlangsamung der Ingest-Strecke (etwa durch einen Korpus-Sprung) fällt
  // unverändert durch. KEINE Assertion und kein Prüfschritt berührt (§6.3).
  //
  // ── NACHTRAG 6.9.2026 (W2·24 · §17-Wurzelfix, DREI Runden Falsch-Rot) ──────
  //
  // Der 95-s-Deckel riss in W2·24 dreimal, ohne dass an dieser Datei etwas
  // geändert worden wäre. Vor der Zuschreibung an eine Ursache steht die
  // Messung (§0 Ziff. 3), also NEU ERHOBEN, gleiche Bedingung wie oben
  // «isoliert», n=3, 6.9.2026, Dateidauer in s:
  //     16.10 · 16.18 · 14.50   (mittel 15.59, sd 0.94)
  // Die Zahlen oben (mittel 10.85) bleiben stehen — sie sind nicht falsch
  // geworden, sie sind von damals (§2b). Der Vergleich IST der Befund:
  //
  //   DIE URSACHE IST NICHT DIE PARALLEL-LAST, SONDERN DER KORPUS.
  //   Die isolierte Strecke ist seit der Deckel-Festlegung um +44 % gewachsen
  //   (10.85 → 15.59 s), ganz ohne fremde Last. Der Deckel wurde also gegen
  //   einen Ist-Stand bemessen, den es nicht mehr gibt; seine Reserve war
  //   längst um dieselben 44 % geschrumpft, bevor die erste Parallel-Last
  //   ihn zum Reissen brachte. Ein absoluter Millisekunden-Deckel auf einer
  //   mitwachsenden Ingest-Strecke veraltet von selbst.
  //
  // NEUE HÖHE, aus den vorhandenen Messreihen fortgeschrieben (nicht geraten):
  //   · Lastfaktor aus der Reihe oben: 50.53 / 10.85 = 4.66×
  //   · relative Streuung unter Last: sd/mittel = 9.46 / 50.53 = 18.7 %
  //   · erwartet unter Last, heutiger Korpus: 15.59 × 4.66 = 72.6 s
  //     (sd entsprechend 13.6 s)
  //   · QS-PERF Ziff. 5, Ist + max(3 sd, 25 %): 72.6 + 40.8 = 113.4 s
  //   · Die Bau-Flotte dieser Runde fährt SECHS Arbeitsbäume parallel, also
  //     mehr als die Bedingung, unter der der Lastfaktor 4.66 gemessen wurde.
  //     Für diesen Aufschlag ist 240 000 ms gesetzt — gut das Doppelte des
  //     fortgeschriebenen Werts.
  //
  // WAS DIESER DECKEL DAMIT IST — und was er ausdrücklich NICHT ist: er ist
  // eine ROBUSTHEITS-Grenze gegen einen hängenden Lauf, keine Perf-Schranke.
  // Als Perf-Schranke hat er nie getaugt: eine Wanduhr-Messung unter
  // unbekannter Fremdlast misst die Maschine, nicht die Ingest-Strecke (genau
  // die Verwechslung, vor der §0 Ziff. 3 warnt). Wer die Ingest-GESCHWINDIGKEIT
  // bewachen will, braucht eine Messung mit genannter Bedingung — das gehört
  // zu `check:perf-budget`, nicht in einen Vitest-Hook-Timeout.
  // KEINE Assertion, kein Prüfschritt, kein Deckel-Wert des Tests berührt.
}, 240000);

afterAll(() => {
  dbN?.close();
  dbR?.close();
});

const ARTIKEL_KEYS = ['id', 'titel', 'snippet', 'fundstelle'].sort();

describe('sucheArtikel', () => {
  it('findet Artikel diakritik-insensitiv (verjahrung → Verjährung)', () => {
    const a = sucheArtikel(dbN, 'verjahrung');
    expect(a.gesamt).toBeGreaterThan(0);
    expect(a.treffer.length).toBeGreaterThan(0);
    expect(a.treffer[0].id.startsWith('art:')).toBe(true);
    expect(a.treffer[0].titel.length).toBeGreaterThan(0);
    expect(a.treffer[0].fundstelle.quelleUrl.startsWith('http')).toBe(true);
  });

  it('gibt NUR id/titel/snippet/fundstelle zurück — kein Volltext-Feld', () => {
    const a = sucheArtikel(dbN, 'eigentum', { limit: 5 });
    expect(a.treffer.length).toBe(5); // Query trifft breit → Schleife prüft wirklich
    for (const t of a.treffer) {
      expect(Object.keys(t).sort()).toEqual(ARTIKEL_KEYS);
      // Volltext-Leck ausgeschlossen (bloecke/text/volltext/bloecke_json tauchen nie auf).
      const roh = JSON.stringify(t);
      expect(roh).not.toMatch(/"bloecke"|"bloecke_json"|"volltext"/);
    }
  });

  it('F35: jeder Treffer trägt die Ebene, kantonale zusätzlich ihr Kürzel', () => {
    // EMPIRISCH gegen den echten Korpus (§7): dass `e.ebene`/`e.kanton` in der
    // Fundstelle stehen, beweist der Unit-Test suche-kern.test.ts an einer
    // Hand-Zeile — hier steht der Beweis, dass die Spalten aus dem WIRKLICHEN
    // Schema kommen und für kantonales Recht wirklich 'kanton' + Kürzel liefern.
    // Ohne diesen Fall wäre F35 an der Netzgrenze eine Behauptung.
    const alle = sucheArtikel(dbN, 'recht', { limit: MAX_LIMIT }).treffer;
    expect(alle.length).toBeGreaterThan(0);
    for (const t of alle) expect(['bund', 'kanton']).toContain(t.fundstelle.ebene);

    const kantonal = ['regierungsrat', 'grossratsbeschluss', 'anwaltstarif', 'kantonsrat']
      .flatMap((q) => sucheArtikel(dbN, q, { limit: MAX_LIMIT }).treffer)
      .filter((t) => t.fundstelle.ebene === 'kanton');
    expect(kantonal.length, 'kein kantonaler Treffer — der Prüfsatz misst nichts').toBeGreaterThan(0);
    for (const t of kantonal) expect(t.fundstelle.kanton).toMatch(/^[A-Z]{2}$/);
    // Bundeserlasse tragen KEIN Kanton-Kürzel (kein leeres Feld im Draht).
    for (const t of alle.filter((x) => x.fundstelle.ebene === 'bund')) {
      expect('kanton' in t.fundstelle).toBe(false);
    }
  });

  it('Pagination by design: Limit hart auf MAX_LIMIT geklemmt', () => {
    const a = sucheArtikel(dbN, 'recht', { limit: 1000 });
    expect(a.treffer.length).toBeLessThanOrEqual(MAX_LIMIT);
  });

  it('naechsteSeite folgt dem Fenster (offset+limit bzw. null am Ende)', () => {
    const seite1 = sucheArtikel(dbN, 'recht', { limit: 5, offset: 0 });
    if (seite1.gesamt > 5) {
      expect(seite1.naechsteSeite).toBe(5);
      const seite2 = sucheArtikel(dbN, 'recht', { limit: 5, offset: 5 });
      // disjunkte IDs zwischen Seite 1 und 2 (stabile Sortierung, kein Overlap).
      const ids1 = new Set(seite1.treffer.map((t) => t.id));
      expect(seite2.treffer.some((t) => ids1.has(t.id))).toBe(false);
    }
    // Offset jenseits des Endes → leere letzte Seite, kein naechsteSeite.
    const jenseits = sucheArtikel(dbN, 'verjahrung', { offset: 1_000_000 });
    expect(jenseits.treffer.length).toBe(0);
    expect(jenseits.naechsteSeite).toBeNull();
  });

  it('leere/symbolische Query → leere Antwort (keine FTS-Syntaxfehler)', () => {
    for (const q of ['', '   ', '***', '(']) {
      const a = sucheArtikel(dbN, q);
      expect(a).toEqual({ treffer: [], gesamt: 0, naechsteSeite: null });
    }
  });

  it('PAYLOAD-GRENZ-TEST: breite Query bei Max-Limit bleibt weit unter 4,5 MB', () => {
    const a = sucheArtikel(dbN, 'recht', { limit: MAX_LIMIT });
    expect(a.gesamt).toBeGreaterThan(MAX_LIMIT); // wirklich breit
    const bytes = Buffer.byteLength(JSON.stringify(a), 'utf8');
    expect(bytes).toBeLessThan(PAYLOAD_WAND);
    expect(bytes).toBeLessThan(200_000); // real: Grössenordnung Kilobytes, nicht Megabytes
  });
});

// ── K1 Recall-Parität: die Felder m/n/g/tb/f müssen am Edge ankommen ─────────────
//
// Der statische Client-Index (scripts/such-index-generieren.ts) führt neben dem
// Artikeltext `t` fünf REKALL-Felder: m (primäre Marginalie), n (nachrangige),
// g (Gliederung), tb (Tabellen-/Struktur-Tier), f (Fussnoten). `fts_artikel`
// indexierte bis QS-BASIS (d) NUR `bloeckeText` — also allein `t`. Damit fand der
// DB-/Edge-Weg systematisch weniger als der statische Weg, und zwar STILL: die
// Antwort war nie leer, nur schlechter.
//
// Leitfall ist der, den such-index-generieren.ts:112-121 selbst als Begründung für
// das Gliederungs-Feld nennt: «Miete» steht im Artikeltext von OR 253/267 NICHT als
// Token, wohl aber in der Gliederung «Achter Titel: Die Miete».
//
// GEMESSENER ROT-STAND vor dem Fix (K0-Nullprobe, bibliothek/register/
// suche-edge-nullprobe-2026-08-31.md Ziff. 3): Query «Miete» → 79 Treffer, davon
// OR 253 = 0 und OR 267 = 0; die Top-10 führten zehn kantonale Gebühren- und
// Besoldungserlasse an.
describe('K1 Recall-Parität: Recall-Felder im Edge-Index', () => {
  /** Alle Treffer-IDs einer Query über das volle Fenster (Pagination ausgereizt). */
  function alleIds(query: string): string[] {
    const ids: string[] = [];
    for (let off = 0; off < 500; off += MAX_LIMIT) {
      const a = sucheArtikel(dbN, query, { limit: MAX_LIMIT, offset: off });
      for (const t of a.treffer) ids.push(t.id);
      if (a.naechsteSeite === null) break;
    }
    return ids;
  }

  it('findet OR 253/267 für «Miete» ÜBER DIE GLIEDERUNG (nicht über den Artikeltext)', () => {
    // Vorbedingung des Falls: der Artikeltext trägt das Token «Miete» wirklich
    // nicht — sonst prüfte der Test die Gliederung gar nicht.
    const roh = dbN
      .prepare("SELECT bloecke_json FROM artikel WHERE erlass_key = 'OR' AND art_id = 'art_253'")
      .get() as { bloecke_json: string } | undefined;
    expect(roh, 'OR art_253 muss im Korpus sein').toBeDefined();
    expect(/\bmiete\b/i.test(bloeckeText(roh!.bloecke_json))).toBe(false);

    const ids = alleIds('Miete');
    expect(ids).toContain('art:OR:art_253');
    expect(ids).toContain('art:OR:art_267');
  });

  it('findet über die primäre Marginalie (OR 127 «Verjährung»)', () => {
    const ids = alleIds('Verjährung');
    expect(ids).toContain('art:OR:art_127');
  });

  it('indexiert Fussnoten- und Tabellen-Tier (Recall-only, kein topischer Boost)', () => {
    // Ein AS-Fundstellen-Token steht ausschliesslich im Fussnoten-Body — trifft die
    // Suche es, ist das Fussnoten-Feld nachweislich im Index.
    const treffer = sucheArtikel(dbN, 'BBl', { limit: MAX_LIMIT });
    expect(treffer.gesamt).toBeGreaterThan(0);
  });
});

describe('sucheEntscheide', () => {
  it('findet Schaufenster-Entscheide diakritik-insensitiv (rechtsoffnung → Rechtsöffnung)', () => {
    const a = sucheEntscheide(dbR, 'rechtsoffnung');
    expect(a.gesamt).toBeGreaterThan(0);
    expect(a.treffer[0].id.startsWith('bund/')).toBe(true);
    expect(a.treffer[0].snippet).toContain('['); // native FTS-snippet markiert den Treffer
    expect(Object.keys(a.treffer[0]).sort()).toEqual(ARTIKEL_KEYS);
  });

  it('Pagination + Payload-Grenze auch für Entscheide', () => {
    const a = sucheEntscheide(dbR, 'recht', { limit: MAX_LIMIT });
    expect(a.treffer.length).toBeLessThanOrEqual(MAX_LIMIT);
    const bytes = Buffer.byteLength(JSON.stringify(a), 'utf8');
    expect(bytes).toBeLessThan(PAYLOAD_WAND);
  });
});
