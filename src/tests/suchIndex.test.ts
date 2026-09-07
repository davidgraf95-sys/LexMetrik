// Dead-Link- und Vollständigkeits-Tor für den Artikel-Suchindex (ROADMAP Schritt 5).
//
// Der HOCH-Bug 28.6.: der Treffer-href baute auf dem internen `erlass`-Kürzel
// (z. B. «StGB») statt dem /gesetze-Routen-Key (Dateiname-Stamm «STGB») → 71/218
// Erlasse mit toten Links. Dieses Tor sichert: JEDER Index-Key ist ein echter
// Routen-Key SEINER Ebene (§8 kein toter Link), und Kürzel/Key bleiben getrennt.
//
// W2·5 (25.7.2026), seit der Kanton im selben Index liegt, drei weitere Zusicherungen:
//   · KEIN stiller Verlust — jeder Erlass mit Snapshot-Datei steht im Index oder
//     mit Grund in `uebersprungen`. Ein Erlass, der aus der Suche fällt, ist für
//     den Nutzer unauffindbar, ohne dass irgendwo etwas rot wird; genau das
//     verhindert dieser Test.
//   · KEINE stille Herkunfts-Lüge — jeder kantonale Eintrag führt sein
//     Kantonskürzel, und zwar dasselbe wie das Browse-Manifest. Ohne `kt` fiele
//     die Kanton-Marke im Treffer weg und der Treffer sähe aus wie Bundesrecht.
//   · BEIDE Ebenen sind wirklich drin (nicht nur die Felder vorhanden).
//
// Quervergleichs-Quelle ist public/normtext/register.json — dasselbe Manifest, aus
// dem /gesetze die Routen auflöst (§5: eine Wahrheit für «welcher Erlass existiert
// unter welchem Key»). ERLASS_REGISTER führt nur Bund und taugt daher nicht als
// Kanton-Prüfmass.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { baueIndex, EBENEN } from '../../scripts/such-index-generieren';
import { ERLASS_REGISTER } from '../lib/normtext/register';

interface ManifestErlass { key: string; ebene: 'bund' | 'kanton'; kanton: string | null; datei: string | null }
const manifest = (JSON.parse(readFileSync('public/normtext/register.json', 'utf8')) as { erlasse: ManifestErlass[] }).erlasse;

const bundKeys = new Set(ERLASS_REGISTER.filter((e) => e.ebene === 'bund').map((e) => e.key));
// AUSDRÜCKLICH über BEIDE Ebenen (K3-Scharfschaltung 1.9.2026): der Generator
// schreibt per Default nur noch den Bund, dieser Test prüft aber die
// Extraktions-Invarianten je Ebene (Herkunft, Kantonskürzel, Routen-Keys) — die
// gelten für den Vollbau (`SUCHE_INDEX_EBENEN=bund,kanton`) unverändert weiter.
// Ohne das `EBENEN` wären die Kanton-Prüfungen unten still leer gelaufen: ein
// Tor, das nichts mehr sieht, ist gefährlicher als keines (§6.7).
const index = baueIndex(EBENEN);
const keys = [...new Set(index.eintraege.filter((e) => e.eb === 'bund').map((e) => e.k))];

describe('Artikel-Suchindex — keine toten Links', () => {
  it('jeder Bund-Index-Key ist ein gültiger /gesetze-Bund-Routen-Key', () => {
    const tot = keys.filter((k) => !bundKeys.has(k));
    expect(tot).toEqual([]); // wäre vor dem Fix: StGB, StPO, SchKG, … (71)
  });

  it('jeder Index-Key ist ein Routen-Key SEINER Ebene (Bund wie Kanton)', () => {
    for (const eb of EBENEN) {
      const routen = new Set(manifest.filter((e) => e.ebene === eb).map((e) => e.key));
      const tot = [...new Set(index.eintraege.filter((e) => e.eb === eb).map((e) => e.k))]
        .filter((k) => !routen.has(k));
      expect(tot.length, `tote ${eb}-Links (${tot.length}): ${tot.slice(0, 10).join(', ')}`).toBe(0);
    }
  });

  it('Kürzel (Anzeige) und Routen-Key (href) werden getrennt geführt', () => {
    const stgb = index.eintraege.find((e) => e.ku === 'StGB');
    expect(stgb).toBeDefined();
    expect(stgb!.k).toBe('STGB');           // href-Key
    expect(stgb!.ku).toBe('StGB');          // Anzeige-Kürzel
    const schkg = index.eintraege.find((e) => e.ku === 'SchKG');
    expect(schkg!.k).toBe('SCHKG');
  });

  it('Index ist nicht leer und trägt erwartete Felder', () => {
    expect(index.eintraege.length).toBeGreaterThan(20000);
    const e = index.eintraege[0];
    expect(e).toHaveProperty('k');
    expect(e).toHaveProperty('ku');
    expect(e).toHaveProperty('a');
    expect(e).toHaveProperty('t');
    expect(e).toHaveProperty('tb'); // G-SUCH: Tabellen-/Struktur-Tier
    expect(e).toHaveProperty('f');  // G-SUCH: Fussnoten-Body
    expect(e).toHaveProperty('eb'); // W2·5: Ebene (Routing + Herkunft)
    expect(e).toHaveProperty('kt'); // W2·5: Kanton (Herkunfts-Anzeige)
  });
});

// ── W2·5: Kanton gleichwertig im Index, Herkunft ehrlich ─────────────────────

describe('Artikel-Suchindex — Kanton gleichwertig aufgenommen (W2·5)', () => {
  const kantonal = index.eintraege.filter((e) => e.eb === 'kanton');

  it('beide Ebenen tragen Artikel (keine still leer gelaufene Ebene)', () => {
    for (const eb of EBENEN) {
      const n = index.eintraege.filter((e) => e.eb === eb).length;
      expect(n, `Ebene ${eb} ist leer — der Generator hat sie nicht gelesen`).toBeGreaterThan(1000);
    }
  });

  it('jeder kantonale Eintrag nennt seinen Kanton (sonst sieht er aus wie Bundesrecht)', () => {
    const ohne = [...new Set(kantonal.filter((e) => e.kt === '').map((e) => e.k))];
    // Auf die ZAHL prüfen, die Namen nur in die Meldung: bei einem Regress wären
    // es über tausend Keys — ein Diff, den niemand liest, ist ein stumpfes Tor.
    expect(ohne.length, `kantonale Erlasse ohne Kantonskürzel (${ohne.length}): ${ohne.slice(0, 10).join(', ')}`).toBe(0);
  });

  it('das Kantonskürzel deckt sich mit dem Browse-Manifest (keine zweite Wahrheit, §5)', () => {
    const mKanton = new Map(manifest.filter((e) => e.ebene === 'kanton').map((e) => [e.key, e.kanton]));
    const abweichend = [...new Set(kantonal.map((e) => `${e.k}|${e.kt}`))]
      .filter((s) => { const [k, kt] = s.split('|'); return mKanton.get(k) !== kt; });
    expect(abweichend.length, `Kanton weicht vom Manifest ab (${abweichend.length}): ${abweichend.slice(0, 10).join(', ')}`).toBe(0);
  });

  it('Bund-Einträge führen KEIN Kantonskürzel', () => {
    const falsch = index.eintraege.filter((e) => e.eb === 'bund' && e.kt !== '');
    expect(falsch.map((e) => e.k).slice(0, 10)).toEqual([]);
  });
});

// ── W2·5: kein Erlass verschwindet stillschweigend ───────────────────────────

describe('Artikel-Suchindex — Vollständigkeit (kein stiller Verlust, §8)', () => {
  it('jeder Erlass mit Snapshot-Datei steht im Index ODER mit Grund in `uebersprungen`', () => {
    const imIndex = new Set(index.eintraege.map((e) => `${e.eb}/${e.k}`));
    // `datei` ist der Snapshot-Pfad ('bund/OR.json'); null = nur-Live-Link/kein
    // Volltext, der gehört per Definition nicht in einen Volltext-Index.
    const uebersprungen = new Set(index.uebersprungen.map((u) => `${u.ebene}/${u.datei.replace(/\.json$/, '')}`));
    const verschwunden = manifest
      .filter((e) => e.datei)
      .map((e) => `${e.ebene}/${e.key}`)
      .filter((s) => !imIndex.has(s) && !uebersprungen.has(s));
    expect(verschwunden.length, `spurlos aus dem Index gefallen (${verschwunden.length}): ${verschwunden.slice(0, 10).join(', ')}`).toBe(0);
  });

  it('jede übersprungene Datei trägt einen bekannten Grund', () => {
    const gruende = new Set(index.uebersprungen.map((u) => u.grund));
    for (const g of gruende) expect(['unlesbar', 'kein-eintraege-array', 'kein-volltext']).toContain(g);
  });

  it('keine Datei wird als `unlesbar` übersprungen (kaputtes JSON im Korpus)', () => {
    const kaputt = index.uebersprungen.filter((u) => u.grund === 'unlesbar');
    expect(kaputt.map((u) => `${u.ebene}/${u.datei}`)).toEqual([]);
  });
});

// G-SUCH: Tabellenzellen + Fussnoten-Body müssen im Index landen — sonst findet
// die Korpus-Suche keinen Text, der NUR in einer Tabelle oder Fussnote steht.
describe('Artikel-Suchindex — Tabellen + Fussnoten indexiert (G-SUCH)', () => {
  const byArt = (k: string, a: string) => index.eintraege.find((e) => e.k === k && e.a === a);

  it('Tabellenzellen (mehrspaltig) stehen im Tabellen-Feld tb', () => {
    // AHVG 34bis führt die AHV-Zuschlagstabelle; «Grundzuschlags» steht NUR dort.
    const e = byArt('AHVG', '34_bis');
    expect(e).toBeDefined();
    expect(e!.tb.toLowerCase()).toContain('grundzuschlags');
    expect(e!.t.toLowerCase()).not.toContain('grundzuschlags'); // nicht im Haupttext
  });

  it('Fussnoten-Body steht im Fussnoten-Feld f (ohne <b>/<i>-Tags)', () => {
    // ADOV 5 trägt einen Änderungshinweis auf die «Strafregisterverordnung».
    const e = byArt('ADOV', '5');
    expect(e).toBeDefined();
    expect(e!.f.toLowerCase()).toContain('strafregisterverordnung');
    expect(e!.f).not.toMatch(/<\/?[a-z]/i); // keine HTML-Tags durchgerutscht
  });

  it('generischer Bild-Alt «Amtliche Abbildung» wird NICHT indexiert (Suchrauschen)', () => {
    const rausch = index.eintraege.filter((e) => /amtliche abbildung/i.test(e.tb));
    expect(rausch).toEqual([]);
  });
});
