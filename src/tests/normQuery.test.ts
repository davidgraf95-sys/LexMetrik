import { describe, it, expect } from 'vitest';
import { baueNormIndex, parseNormQuery, type NormErlass } from '../lib/suche/normQuery';

// Akzeptanztests des Norm-Query-Parsers (W2·5d G4 · FAHRPLAN-GESETZES-UX §4.2).
// Deterministisch, ohne Suchindex. Positivfälle prüfen Kürzel-Auflösung +
// Artikel-Token-Ableitung (kongruent passus.ts: 257d→257_d, 49abis→49_a_bis);
// Negativfälle beweisen, dass Freitext KEIN Ziel liefert (→ normale Suche).

// Repräsentative Fixtures (Bund + Kanton, snapshot/pdf-embed) — bewusst NICHT an
// die konkrete Manifest-Grösse gekoppelt (§ M1 lässt register.json wachsen).
const ERLASSE: NormErlass[] = [
  { key: 'OR', ebene: 'bund', kanton: null, kuerzel: 'OR', titel: 'Obligationenrecht', status: 'snapshot', sr: '220' },
  { key: 'ZGB', ebene: 'bund', kanton: null, kuerzel: 'ZGB', titel: 'Zivilgesetzbuch', status: 'snapshot', sr: '210' },
  { key: 'AIG', ebene: 'bund', kanton: null, kuerzel: 'AIG', titel: 'Ausländer- und Integrationsgesetz', status: 'snapshot', sr: '142.20' },
  { key: 'VMWG', ebene: 'bund', kanton: null, kuerzel: 'VMWG', titel: 'Mietrechtsverordnung', status: 'snapshot', sr: '221.213.11' },
  { key: 'STGB', ebene: 'bund', kanton: null, kuerzel: 'StGB', titel: 'Strafgesetzbuch', status: 'snapshot', sr: '311.0' },
  { key: 'ZPO', ebene: 'bund', kanton: null, kuerzel: 'ZPO', titel: 'Zivilprozessordnung', status: 'snapshot', sr: '272' },
  { key: 'SchKG', ebene: 'bund', kanton: null, kuerzel: 'SchKG', titel: 'Schuldbetreibung und Konkurs', status: 'snapshot', sr: '281.1' },
  { key: 'GEBV_SCHKG', ebene: 'bund', kanton: null, kuerzel: 'GebV SchKG', titel: 'Gebührenverordnung SchKG', status: 'snapshot' },
  { key: 'ARGV1', ebene: 'bund', kanton: null, kuerzel: 'ArGV 1', titel: 'Verordnung 1 zum Arbeitsgesetz', status: 'snapshot' },
  { key: 'STG', ebene: 'bund', kanton: null, kuerzel: 'StG', titel: 'Stempelabgaben', status: 'snapshot' },
  { key: 'BGOE', ebene: 'bund', kanton: null, kuerzel: 'BGÖ', titel: 'Öffentlichkeitsgesetz', status: 'snapshot' },
  { key: 'BV', ebene: 'bund', kanton: null, kuerzel: 'BV', titel: 'Bundesverfassung', status: 'snapshot', sr: '101' },
  { key: 'IPRG', ebene: 'bund', kanton: null, kuerzel: 'IPRG', titel: 'Bundesgesetz über das Internationale Privatrecht', status: 'snapshot', sr: '291' },
  { key: 'BGG', ebene: 'bund', kanton: null, kuerzel: 'BGG', titel: 'Bundesgerichtsgesetz', status: 'snapshot', sr: '173.110' },
  { key: 'STPO', ebene: 'bund', kanton: null, kuerzel: 'StPO', titel: 'Strafprozessordnung', status: 'snapshot', sr: '312.0' },
  { key: 'MSTG', ebene: 'bund', kanton: null, kuerzel: 'MStG', titel: 'Militärstrafgesetz', status: 'snapshot', sr: '321.0' },
  { key: 'EMRK', ebene: 'bund', kanton: null, kuerzel: 'EMRK', titel: 'EMRK', status: 'pdf-embed' },
  // O-4: weitere Ziele der erweiterten FR/IT-Alias-Tabelle (BV/BGG/STPO/IPRG stehen
  // bereits oben mit SR-Nummer — hier nur die noch fehlenden Ziel-Kürzel + Kantone).
  { key: 'VWVG', ebene: 'bund', kanton: null, kuerzel: 'VwVG', titel: 'Verwaltungsverfahrensgesetz', status: 'snapshot' },
  { key: 'MWSTG', ebene: 'bund', kanton: null, kuerzel: 'MWSTG', titel: 'Mehrwertsteuergesetz', status: 'snapshot' },
  { key: 'KG', ebene: 'bund', kanton: null, kuerzel: 'KG', titel: 'Kartellgesetz', status: 'snapshot' },
  { key: 'AI-640.000', ebene: 'kanton', kanton: 'AI', kuerzel: 'StG', titel: 'Steuergesetz AI', status: 'snapshot', sr: '640.000' },
  { key: 'AR-621.12', ebene: 'kanton', kanton: 'AR', kuerzel: 'ABRG', titel: 'ABRG', status: 'snapshot', sr: '621.12' },
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
    // IA-1-Alias-Ausbau (amtliche FR/IT-Kurztitel weiterer Kodifikationen)
    ['art. 29 Cst', '/gesetze/bund/BV#art-29'],          // Constitution fédérale → BV
    ['Cost. 8', '/gesetze/bund/BV#art-8'],                // Costituzione federale → BV
    ['art. 190 LDIP', '/gesetze/bund/IPRG#art-190'],      // droit international privé → IPRG
    ['LTF 42', '/gesetze/bund/BGG#art-42'],               // Tribunal fédéral → BGG
    ['CPP 10', '/gesetze/bund/STPO#art-10'],              // procédure pénale → StPO
    ['CPM 3', '/gesetze/bund/MSTG#art-3'],                // pénal militaire → MStG
  ];
  it.each(positiv)('%s → %s', (q, ziel) => {
    expect(href(q)).toBe(ziel);
  });

  // O-4: erweiterte FR/IT-Alias-Tabelle (amtliche titleShort je Sprachfassung, Fedlex).
  const aliasFrIt: [string, string][] = [
    // Spec-Beispiele (Auftrag): CO 97, CC 684, LP 80, Cst. 29
    ['CO 97', '/gesetze/bund/OR#art-97'],
    ['CC 684', '/gesetze/bund/ZGB#art-684'],
    ['LP 80', '/gesetze/bund/SchKG#art-80'],
    ['Cst. 29', '/gesetze/bund/BV#art-29'],
    // Punkt-Variante «Cst» ohne Punkt — norm() entfernt Interpunktion
    ['Cst 29', '/gesetze/bund/BV#art-29'],
    // Italienische Fassung «Cost.» (differiert von FR) → dasselbe Ziel BV
    ['Cost. 29', '/gesetze/bund/BV#art-29'],
    // IT weicht von FR ab: SchKG LEF (it) neben LP (fr)
    ['LEF 80', '/gesetze/bund/SchKG#art-80'],
    // Weitere Kodifikationen
    ['LTF 42', '/gesetze/bund/BGG#art-42'],
    ['CPP 10', '/gesetze/bund/STPO#art-10'],
    ['PA 5', '/gesetze/bund/VWVG#art-5'],
    ['LDIP 116', '/gesetze/bund/IPRG#art-116'],
    ['LCart 7', '/gesetze/bund/KG#art-7'],
    // FR und IT der Steuer-MWST: LTVA (fr) / LIVA (it) → MWSTG
    ['LTVA 18', '/gesetze/bund/MWSTG#art-18'],
    ['LIVA 18', '/gesetze/bund/MWSTG#art-18'],
    // Migration: LEI (fr) / LStrI (it) → AIG
    ['LEI 83', '/gesetze/bund/AIG#art-83'],
    ['LStrI 83', '/gesetze/bund/AIG#art-83'],
    // Reines Alias-Kürzel (kein Artikel) → Erlass-Sprung
    ['CO', '/gesetze/bund/OR'],
    ['LTF', '/gesetze/bund/BGG'],
    // Gross-/Kleinschreibung egal
    ['co 97', '/gesetze/bund/OR#art-97'],
    ['lp 80', '/gesetze/bund/SchKG#art-80'],
    ['cst. 29', '/gesetze/bund/BV#art-29'],
    // Kompaktform ohne Trennzeichen
    ['cc684', '/gesetze/bund/ZGB#art-684'],
    ['ltf42', '/gesetze/bund/BGG#art-42'],
  ];
  it.each(aliasFrIt)('FR/IT-Alias %s → %s', (q, ziel) => {
    expect(href(q)).toBe(ziel);
  });

  it('echtes deutsches Kürzel schlägt den Alias (kein Shadowing durch FR/IT)', () => {
    // «KG» ist ein echter Bund-Erlass (Kartellgesetz) — die Alias-Auflösung wird
    // nie erreicht, weil holeErlasse die Karte zuerst prüft; «StG»-Bund/Kanton-
    // Vorrang bleibt (Regressionsschutz gegen versehentliches Alias-Vorziehen).
    expect(href('KG 7')).toBe('/gesetze/bund/KG#art-7');
    expect(href('StG 5')).toBe('/gesetze/bund/STG#art-5');
    expect(href('StG AI 5')).toBe('/gesetze/kanton/AI-640.000#art-5');
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

describe('parseNormQuery — SR-Nummer-Sprung (IA-1)', () => {
  const sr: [string, string][] = [
    ['SR 220', '/gesetze/bund/OR'],                 // reiner Erlass-Sprung über die SR-Nummer
    ['SR 220 336c', '/gesetze/bund/OR#art-336_c'],  // SR-Nummer + Artikel
    ['SR 220 Art. 257d', '/gesetze/bund/OR#art-257_d'],
    ['SR 311.0 111', '/gesetze/bund/STGB#art-111'], // dotted SR-Nummer
    ['SR 311 111', '/gesetze/bund/STGB#art-111'],   // «.0» weggelassen (kollisionsfrei gekürzt)
    ['SR 101', '/gesetze/bund/BV'],
    ['sr 173.110 42', '/gesetze/bund/BGG#art-42'],  // klein geschrieben
  ];
  it.each(sr)('%s → %s', (q, ziel) => {
    expect(href(q)).toBe(ziel);
  });

  it('SR-Nummer NUR für Bund (kantonale Sammlungs-Nummer springt nicht)', () => {
    // «640.000» ist die kantonale AI-Nummer — kein SR-Sprung (Bund-only, §8).
    expect(parseNormQuery('SR 640.000', idx)).toBeNull();
  });

  it('unbekannte / unsaubere SR-Form → kein Fehl-Sprung', () => {
    expect(parseNormQuery('SR 999.999', idx)).toBeNull(); // unbekannte Nummer
    expect(parseNormQuery('SR 220 Kündigung', idx)).toBeNull(); // Fremdwort statt Artikel
    expect(parseNormQuery('SR', idx)).toBeNull(); // nur das Präfix
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
