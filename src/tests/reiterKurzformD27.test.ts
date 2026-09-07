import { describe, it, expect } from 'vitest';
import { reiterKurzformTeile, reiterKurzformText, type TabEintrag } from '../lib/tabs';
import type { VerlaufManifeste } from '../lib/verlaufLabel';
import type { BrowseErlass } from '../lib/normtext/browse-typen';

// ═══ D27 (David 6.9.2026) · DER REITER SAGT, WO MAN STEHT ═══════════════════
//
// «diese funktion, dass es anzeigt in welchem artikel wir sind, soll der tab
// bekommen. es kann dann direkt im gesetz raus.»
//
// Die R2-Regel F5 («die Beschriftung folgt der ADRESSE, nicht dem Scrollen»)
// ist damit UMGEDREHT — nicht aufgehoben: Determinismus (§2) heisst jetzt
// «gleiche LESESTELLUNG ⇒ gleiche Beschriftung». Der Speicherort der
// Lesestellung ist `TabEintrag.path` (dorthin schreibt der Scroll-Spy des
// Lesers via `lib/tabs.aktualisiereTabArtikel`), und weil er den Neustart
// überlebt, liefern Kaltstart, SPA-Navigation und Reload bei gleicher Stellung
// dieselbe Zeichenkette. Das prüfen die Fälle unten am reinen Modell; die
// LEBENDE Kette (scrollen → Text wechselt) prüft `e2e/w224-reiterverhalten (e)`.
//
// ROT ZU BEKOMMEN (§6.7, beide einmal gefahren):
//   (a) in `lib/tabs.basisKurzform` `hashVon(t.path) ?? t.wahl` wieder durch
//       `t.wahl` ersetzen ⇒ «die Lesestellung schlägt die Adresse» und
//       «Kaltstart == Reload» messen «ZGB» statt «Art. 43a ZGB».
//   (b) in `reiterKurzformText` das `stelle`-Glied aus der Verkettung nehmen
//       ⇒ jeder Einzeiler-Fall verliert seinen Artikel.

const erlass = (p: Partial<BrowseErlass>): BrowseErlass => ({
  key: 'x', ebene: 'bund', kanton: null, kuerzel: 'X', titel: 'X', sr: null,
  rechtsgebiet: 'privat', sprache: 'de', rang: 0, status: 'snapshot',
  datei: null, artikelAnzahl: 0, stand: '2026-01-01', quelleUrl: '', fassungsToken: '', pdfPfad: null,
  ...p,
} as BrowseErlass);

const m: VerlaufManifeste = {
  gesetze: {
    erzeugt: '2026-01-01',
    erlasse: [erlass({ key: 'ZGB', kuerzel: 'ZGB' }), erlass({ key: 'OR', kuerzel: 'OR' })],
  },
  entscheide: null,
};

const t = (e: TabEintrag) => e;

describe('D27 — die Reiter-Kurzform folgt der Lesestellung', () => {
  it('ohne gemeldete Stellung steht das Kürzel allein — nichts wird geraten (§7)', () => {
    expect(reiterKurzformText(t({ path: '/gesetze/bund/ZGB' }), m)).toBe('ZGB');
  });

  it('die gemeldete Lesestellung steht im Reiter', () => {
    expect(reiterKurzformText(t({ path: '/gesetze/bund/ZGB#art-43_a' }), m)).toBe('Art. 43a ZGB');
  });

  it('die Lesestellung schlägt den Anker der Adresse (die F5-Regel ist umgedreht)', () => {
    // Deep-Link auf Art. 336c, danach bis Art. 97 gescrollt: der Reiter zeigt,
    // WO MAN IST — nicht, wo man eingestiegen ist.
    const eintrag = t({ path: '/gesetze/bund/OR#art-97', wahl: '#art-336_c' });
    expect(reiterKurzformText(eintrag, m)).toBe('Art. 97 OR');
  });

  it('`wahl` bleibt der Rückfall, solange der Spy noch nichts gemeldet hat', () => {
    // Der TabTracker meldet pathname+search (ohne Anker); bis der erste
    // Spy-Lauf greift, trägt die Adresse die einzige bekannte Stelle.
    expect(reiterKurzformText(t({ path: '/gesetze/bund/OR', wahl: '#art-336_c' }), m))
      .toBe('Art. 336c OR');
  });

  it('gleiche Stellung ⇒ gleiche Beschriftung (Kaltstart == SPA == Reload)', () => {
    // Kaltstart/Reload lesen den Eintrag aus dem Speicher, die SPA-Navigation
    // baut ihn frisch — bei gleicher Stellung ist beides dieselbe Zeichenkette.
    const ausSpeicher = t({ path: '/gesetze/bund/ZGB#art-43_a' });
    const ausNavigation = t({ path: '/gesetze/bund/ZGB#art-43_a', label: 'Zivilgesetzbuch' });
    expect(reiterKurzformText(ausSpeicher, m)).toBe(reiterKurzformText(ausNavigation, m));
  });

  it('jedes Fenster folgt seiner eigenen Stellung (Split)', () => {
    const links = t({ path: '/gesetze/bund/OR#art-97' });
    const rechts = t({ path: '/gesetze/bund/OR?r=2#art-266_g' });
    expect(reiterKurzformText(links, m)).toBe('Art. 97 OR');
    // Die Instanz-Nummer bleibt am Kern (R5) — auch wenn die Stellen schon
    // unterscheiden, bleiben zwei Instanzen an DERSELBEN Stelle trennbar.
    expect(reiterKurzformText(rechts, m)).toBe('Art. 266g OR (2)');
  });
});

describe('D27 — die Breite der Stelle ist reserviert, nicht geraten', () => {
  it('ein Gesetzes-Reiter trägt den Platz auch ohne bekannte Stellung', () => {
    // '' (nicht null) = «hier KANN eine Stellung stehen» → die Leiste
    // reserviert die Breite (`.rl-stelle`), damit der erste Spy-Lauf sie nicht
    // ruckartig verbreitert.
    expect(reiterKurzformTeile(t({ path: '/gesetze/bund/ZGB' }), m).stelle).toBe('');
    expect(reiterKurzformTeile(t({ path: '/gesetze/bund/ZGB#art-1' }), m).stelle).toBe('Art. 1');
  });

  it('wo nie eine Stellung stehen kann, wird auch kein Platz reserviert', () => {
    for (const pfad of ['/rechner/tagerechner', '/vorlagen/kuendigung', '/gesetze', '/']) {
      expect(reiterKurzformTeile(t({ path: pfad }), m).stelle, pfad).toBeNull();
    }
    expect(reiterKurzformTeile(t({ path: '/', leer: true }), m).stelle).toBeNull();
  });

  it('der Einzeiler ist derselbe wie vor der Zerlegung in drei Teile', () => {
    const teile = reiterKurzformTeile(t({ path: '/gesetze/bund/OR#art-336_c' }), m);
    expect(teile).toEqual({ kopf: '', stelle: 'Art. 336c', kern: 'OR' });
    expect(reiterKurzformText(t({ path: '/gesetze/bund/OR#art-336_c' }), m)).toBe('Art. 336c OR');
  });
});
