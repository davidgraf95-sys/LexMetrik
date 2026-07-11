import { describe, it, expect } from 'vitest';
import { baueNormIndex, parseNormQuery, type NormErlass } from '../lib/suche/normQuery';

// Akzeptanztests des Norm-Query-Parsers (W2·5d G4 · FAHRPLAN-GESETZES-UX §4.2).
// Deterministisch, ohne Suchindex. Positivfälle prüfen Kürzel-Auflösung +
// Artikel-Token-Ableitung (kongruent passus.ts: 257d→257_d, 49abis→49_a_bis);
// Negativfälle beweisen, dass Freitext KEIN Ziel liefert (→ normale Suche).

// Repräsentative Fixtures (Bund + Kanton, snapshot/pdf-embed) — bewusst NICHT an
// die konkrete Manifest-Grösse gekoppelt (§ M1 lässt register.json wachsen).
const ERLASSE: NormErlass[] = [
  { key: 'OR', ebene: 'bund', kanton: null, kuerzel: 'OR', titel: 'Obligationenrecht', status: 'snapshot' },
  { key: 'ZGB', ebene: 'bund', kanton: null, kuerzel: 'ZGB', titel: 'Zivilgesetzbuch', status: 'snapshot' },
  { key: 'AIG', ebene: 'bund', kanton: null, kuerzel: 'AIG', titel: 'Ausländer- und Integrationsgesetz', status: 'snapshot' },
  { key: 'VMWG', ebene: 'bund', kanton: null, kuerzel: 'VMWG', titel: 'Mietrechtsverordnung', status: 'snapshot' },
  { key: 'STGB', ebene: 'bund', kanton: null, kuerzel: 'StGB', titel: 'Strafgesetzbuch', status: 'snapshot' },
  { key: 'ZPO', ebene: 'bund', kanton: null, kuerzel: 'ZPO', titel: 'Zivilprozessordnung', status: 'snapshot' },
  { key: 'SchKG', ebene: 'bund', kanton: null, kuerzel: 'SchKG', titel: 'Schuldbetreibung und Konkurs', status: 'snapshot' },
  { key: 'GEBV_SCHKG', ebene: 'bund', kanton: null, kuerzel: 'GebV SchKG', titel: 'Gebührenverordnung SchKG', status: 'snapshot' },
  { key: 'ARGV1', ebene: 'bund', kanton: null, kuerzel: 'ArGV 1', titel: 'Verordnung 1 zum Arbeitsgesetz', status: 'snapshot' },
  { key: 'STG', ebene: 'bund', kanton: null, kuerzel: 'StG', titel: 'Stempelabgaben', status: 'snapshot' },
  { key: 'BGOE', ebene: 'bund', kanton: null, kuerzel: 'BGÖ', titel: 'Öffentlichkeitsgesetz', status: 'snapshot' },
  { key: 'EMRK', ebene: 'bund', kanton: null, kuerzel: 'EMRK', titel: 'EMRK', status: 'pdf-embed' },
  { key: 'AI-640.000', ebene: 'kanton', kanton: 'AI', kuerzel: 'StG', titel: 'Steuergesetz AI', status: 'snapshot' },
  { key: 'AR-621.12', ebene: 'kanton', kanton: 'AR', kuerzel: 'ABRG', titel: 'ABRG', status: 'snapshot' },
];

const idx = baueNormIndex(ERLASSE);
const href = (q: string) => parseNormQuery(q, idx)?.href ?? null;

describe('parseNormQuery — Positivfälle (Deep-Link)', () => {
  const positiv: [string, string][] = [
    // Kürzel NACH Artikel, Buchstaben-Artikel
    ['OR 257d', '/gesetze/bund/OR#art-257_d'],
    // «Art.» + Kürzel am Ende
    ['Art. 5 AIG', '/gesetze/bund/AIG#art-5'],
    // «Artikel» ausgeschrieben + Latein-Suffix mit Buchstabe
    ['Artikel 49abis OR', '/gesetze/bund/OR#art-49_a_bis'],
    // Kürzel VOR Artikel + römische Absatz-Notation (ignoriert für den Anker)
    ['ZGB 684 II', '/gesetze/bund/ZGB#art-684'],
    // «§»-Designator + Kürzel am Ende
    ['§ 336c OR', '/gesetze/bund/OR#art-336_c'],
    // Latein-Suffix «bis»
    ['Art. 334bis ZGB', '/gesetze/bund/ZGB#art-334_bis'],
    // Kürzel klein geschrieben
    ['stgb 111', '/gesetze/bund/STGB#art-111'],
    // Reines Kürzel (kein Artikel) → Erlass-Sprung
    ['VMWG', '/gesetze/bund/VMWG'],
    // Mehrteiliges Kürzel «GebV SchKG»
    ['GebV SchKG 12', '/gesetze/bund/GEBV_SCHKG#art-12'],
    // Zahl-Kürzel «ArGV 1» (mit Leerzeichen) + Artikel
    ['ArGV 1 5', '/gesetze/bund/ARGV1#art-5'],
    // Zahl-Kürzel zusammengeschrieben «ArGV1»
    ['ArGV1 5', '/gesetze/bund/ARGV1#art-5'],
    // Umlaut-Kürzel «BGÖ» → normalisiert auf «BGO»
    ['BGÖ 7', '/gesetze/bund/BGOE#art-7'],
    // Abs./lit.-Zusatz wird toleriert, Anker bleibt artikel-scharf
    ['Art. 8 Abs. 2 lit. a OR', '/gesetze/bund/OR#art-8'],
    // Kollisions-Kürzel «StG» → Bund gewinnt ohne Kantons-Angabe
    ['StG 5', '/gesetze/bund/STG#art-5'],
    // … mit expliziter Kantons-Angabe → Kanton gewinnt (Disambiguierung)
    ['StG AI 5', '/gesetze/kanton/AI-640.000#art-5'],
    // Eindeutiges Kantonskürzel
    ['ABRG 3', '/gesetze/kanton/AR-621.12#art-3'],
    // Kompaktform ohne Trennzeichen «or257d» (UI-NAV S2)
    ['or257d', '/gesetze/bund/OR#art-257_d'],
    ['ZGB684', '/gesetze/bund/ZGB#art-684'],
    ['stgb111', '/gesetze/bund/STGB#art-111'],
    // FR/IT-Kürzel-Aliasse (UI-NAV S2/Z3)
    ['CO 257d', '/gesetze/bund/OR#art-257_d'],
    ['art. 8 CC', '/gesetze/bund/ZGB#art-8'],
    ['CP 111', '/gesetze/bund/STGB#art-111'],
    ['CPC 311', '/gesetze/bund/ZPO#art-311'],
    ['LP 88', '/gesetze/bund/SchKG#art-88'],
    // Alias-Kompaktform kombiniert
    ['co257d', '/gesetze/bund/OR#art-257_d'],
  ];
  it.each(positiv)('%s → %s', (q, ziel) => {
    expect(href(q)).toBe(ziel);
  });

  it('«ArGV1» bleibt ganzes Kürzel (Kompaktform-Split greift nicht, Ambiguität)', () => {
    // Ganz-Kürzel-Auflösung gewinnt vor der Ziffer-Auftrennung.
    expect(href('ArGV1')).toBe('/gesetze/bund/ARGV1');
    expect(href('ArGV1 5')).toBe('/gesetze/bund/ARGV1#art-5');
  });

  it('pdf-embed erhält KEINEN #art-Anker (kein gerenderter Volltext)', () => {
    expect(href('EMRK 3')).toBe('/gesetze/bund/EMRK');
    expect(href('emrk')).toBe('/gesetze/bund/EMRK');
  });

  it('liefert Erlass-Metadaten + Anzeige-Form des Artikels', () => {
    const t = parseNormQuery('OR 257d', idx)!;
    expect(t.erlass.key).toBe('OR');
    expect(t.artikelToken).toBe('257_d');
    expect(t.artikelAnzeige).toBe('257d');
  });
});

describe('parseNormQuery — Negativfälle (→ normale Suche, kein Fehl-Sprung)', () => {
  const negativ = [
    '',                 // leer
    '   ',              // nur Leerzeichen
    'Kündigung',        // Freitext-Stichwort
    'Notwehr',          // Freitext-Stichwort
    'Mietzins 2024',    // Stichwort + Jahr, kein Kürzel
    'foobar',           // Unsinn
    '257',              // reine Zahl ohne Kürzel
    'Art. 5',           // Artikel ohne Kürzel
    'II',               // nur römische Ziffer
    'OR Kündigung',     // Kürzel + Fremdwort statt Artikel
    'XYZ 5',            // unbekanntes Kürzel
  ];
  it.each(negativ)('%j → null', (q) => {
    expect(parseNormQuery(q, idx)).toBeNull();
  });
});
