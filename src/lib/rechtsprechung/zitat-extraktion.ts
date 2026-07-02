// ─── Zitat-Extraktion aus Urteils-Fliesstext (rein, deterministisch, §2) ─────
//
// Portierung der OpenCaseLaw-Referenz-Extraktion (`reference_extraction.py`) nach
// TypeScript. Erkennt in Schweizer Entscheidtext:
//   • Gesetzes-Zitate  — «Art. 34 Abs. 2 BV», «art. 8 al. 2 CEDH», «Art. 52bis OR»
//   • Entscheid-Zitate — BGE («BGE 147 I 268») und Aktenzeichen («4A_123/2020»)
//
// Anders als die bisherige `statutesZuNormKeys`-Logik (die nur die Gesetzes-
// Abkürzung behält) bewahrt diese Portierung das VOLLE Artikel-/Absatz-Token
// (`34`, `8a`, `52bis`) treu — die getestete Grundlage für die per-Artikel-
// Leitentscheide (W3). Reine Funktionen: kein I/O, kein `Date.now()`.
//
// Die Regex-Bausteine spiegeln das Python-Original 1:1 (dort `re.VERBOSE`, hier
// ohne Verbose zusammengesetzt). Python-`re.IGNORECASE` → JS-Flag `i`; benannte
// Gruppen `(?P<name>…)` → `(?<name>…)`; der Lookahead `(?![a-z])` funktioniert in
// modernem V8. Der Filter (`INVALID_LAW_CODES` + Gross-/Länge-Regeln) verkörpert
// jahrelang getunte Falsch-Positiv-Vermeidung und wird VERBATIM übernommen.

/** Gesetzes-Zitat mit bewahrtem Artikel-/Absatz-Token. */
export interface StatutRef {
  /** Roh-Treffer (getrimmt), z.B. 'Art. 34 Abs. 2 BV'. */
  raw: string;
  /** Gesetzes-Abkürzung (grossgeschrieben), z.B. 'BV'. */
  gesetz: string;
  /** Artikel-Token, whitespace-frei und klein — BEWAHRT: '34', '8a', '52bis'. */
  artikel: string;
  /** Absatz-Token (falls genannt), z.B. '2'; sonst null. */
  absatz: string | null;
  /** Normalform, z.B. 'ART.34.ABS.2.BV' bzw. 'ART.8.EMRK'. */
  normalisiert: string;
}

// ── Regex-Bausteine (Python-Marker-Konstanten) ──────────────────────────────
const ARTIKEL_MARKER = '(?:Art\\.?|Artikel)';
const ABSATZ_MARKER = '(?:Abs\\.?|Absatz|al\\.?|alin(?:ea)?\\.?|cpv\\.?|co\\.?|para\\.?)';
const ORDINAL_SUFFIX = '(?:bis|ter|quater|quinquies|sexies)';
// Artikel-/Absatz-Token: Zahl + optional (Ordinal-Suffix ODER einzelner
// Buchstabe, der nicht von einem weiteren Buchstaben gefolgt ist).
const ARTIKEL_TOKEN = `\\d+(?:\\s*${ORDINAL_SUFFIX}|[a-z](?![a-z]))?`;
const ABSATZ_TOKEN = ARTIKEL_TOKEN;
// Qualifikatoren zwischen Absatz und Gesetzes-Code
const FOLGE_MARKER = '(?:ff|ss|segg)\\.?'; // «und folgende»
const SUB_MARKER = '(?:Ziff(?:er)?|lit|Bst|Buchst|S|Satz|ch|let|n)';
const SUB_TOKEN = '(?:\\d+|[a-z])';
const GESETZ_CODE = '[A-Z][A-Z0-9]{1,11}(?:/[A-Z0-9]{2,6})?';

/**
 * Gesetzes-Zitat-Muster. Struktur (mit `i`-Flag → auch klein geschriebene
 * Treffer, die der nachgelagerte Filter aussortiert):
 *   \b Art. <artikel> [Abs. <paragraph>] [ff.] [Ziff. n] <law> \b
 */
const STATUTE_QUELLE =
  `\\b${ARTIKEL_MARKER}\\s*` +
  `(?<article>${ARTIKEL_TOKEN})\\s*` +
  `(?:${ABSATZ_MARKER}\\s*(?<paragraph>${ABSATZ_TOKEN}))?\\s*` +
  `(?:${FOLGE_MARKER}\\s+)?` +
  `(?:${SUB_MARKER}\\.?\\s*${SUB_TOKEN}\\s+)?` +
  `(?<law>${GESETZ_CODE})` +
  `\\b`;
const STATUTE_PATTERN = new RegExp(STATUTE_QUELLE, 'gi');

const BGE_PATTERN = /\bBGE\s+(?<vol>\d{1,3})\s+(?<div>[IVX]{1,4})\s+(?<page>\d{1,4})\b/gi;

// Aktenzeichen-Muster (Reihenfolge wie im Python-Original; ohne IGNORECASE).
const DOCKET_PATTERNS: RegExp[] = [
  // 1A.122/2005, 2C_37/2016, D-7414/2015
  /\b[A-Z0-9]{1,4}[._-]\d{1,6}[/_]\d{4}\b/g,
  // VB.2018.00411, RR.2012.25
  /\b[A-Z]{1,6}\.\d{4}\.\d{1,6}\b/g,
  // 151 I 62 — BGE-interne Nennung ohne explizites «BGE»
  /\b\d{1,3}\s+[IVX]{1,4}\s+\d{1,4}\b/g,
];

/**
 * Blockliste: Tokens, die dem Gesetzes-Code-Muster ähneln, aber keine Gesetzes-
 * Abkürzung sind (Struktur-Marker, Artikel/Präpositionen/Konjunktionen DE/FR/IT,
 * Ordinalwörter, gängige Nicht-Gesetzes-Abkürzungen). VERBATIM aus dem Python-
 * Original (`_INVALID_LAW_CODES`) — jahrelang getunte Falsch-Positiv-Vermeidung.
 */
export const INVALID_LAW_CODES: ReadonlySet<string> = new Set([
  // ── Struktur-Marker ──
  'AL', 'ABS', 'ABSATZ', 'ALIN', 'ALINEA', 'CPV', 'PARA',
  'BIS', 'TER', 'QUATER', 'QUINQUIES', 'SEXIES',
  'FF', 'SS', 'SEGG', 'ZIFF', 'ZIFFER', 'LIT', 'BST', 'BUCHST', 'SATZ',
  // ── Deutsch: Artikel, Präpositionen, Konjunktionen ──
  'AB', 'AM', 'AN', 'AUS', 'BEI', 'BZW', 'DA', 'DAS', 'DEM', 'DEN',
  'DER', 'DES', 'DIE', 'DIES', 'DURCH', 'EIN', 'EINE', 'EINEM',
  'EINEN', 'EINER', 'EINES', 'ER', 'ES', 'GEGEN', 'HA', 'IM', 'IN',
  'IST', 'JE', 'MIT', 'NACH', 'NEBEN', 'NICHT', 'NOCH', 'NUR',
  'ODER', 'OHNE', 'SICH', 'SIE', 'SIND', 'SOWIE', 'UM', 'UND',
  'UNTER', 'VOM', 'VON', 'VOR', 'WAR', 'WIE', 'WIRD', 'ZU',
  'ZUM', 'ZUR', 'ZWISCHEN',
  // ── Französisch: Artikel, Präpositionen, Konjunktionen ──
  'AU', 'AUX', 'AVEC', 'CE', 'CES', 'CETTE', 'COMME', 'DANS',
  'DE', 'DU', 'EN', 'EST', 'ET', 'IL', 'LA', 'LE', 'LES',
  'MAIS', 'OU', 'PAR', 'PEUT', 'POUR', 'QUE', 'QUI', 'SE',
  'SONT', 'SUR', 'UN', 'UNE',
  // ── Italienisch: Artikel, Präpositionen ──
  'CHE', 'CON', 'CUI', 'DAL', 'DEI', 'DEL', 'DELL', 'DELLA',
  'DELLE', 'DELLO', 'DI', 'FRA', 'GLI', 'NEL', 'NELL', 'NELLA',
  'NON', 'PER', 'SUL', 'TRA', 'UNA', 'UNO',
  // ── Ordinal- / Strukturwörter ──
  'ART', 'CUM', 'DRITTER', 'ERSTER', 'LETT', 'LET', 'LETTRE',
  'LITT', 'NAPR', 'PHR', 'PRIMA', 'RZ', 'SECONDA', 'ZWEITER',
  // ── Gängige Abkürzungen, die keine Gesetzes-Codes sind ──
  'AD', 'AGB', 'BI', 'CH', 'NE', 'NI', 'NO', 'OF', 'QU', 'RE', 'SI',
]);

/** Normalisiert ein Gesetzes-Zitat zu 'ART.<art>[.ABS.<abs>].<CODE>'. */
export function normalisiereStatut(
  artikel: string,
  absatz: string | null,
  gesetz: string,
): string {
  if (absatz) {
    return `ART.${artikel}.ABS.${absatz.toLowerCase()}.${gesetz.toUpperCase()}`;
  }
  return `ART.${artikel}.${gesetz.toUpperCase()}`;
}

/**
 * Normalisiert ein Aktenzeichen: BGE-artige Nennungen («151 I 62») behalten die
 * Leerzeichen und werden nur gross geschrieben; sonst werden Trenner (`-`, `.`,
 * `/`) zu `_` vereinheitlicht und Mehrfach-`_` kollabiert.
 */
export function normalisiereDocket(text: string): string {
  const compact = text.trim().toUpperCase().replace(/\s+/g, ' ');
  if (/^\d{1,3}\s+[IVX]{1,4}\s+\d{1,4}$/.test(compact)) {
    return compact;
  }
  return text
    .trim()
    .toUpperCase()
    .replace(/[-./]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+/, '')
    .replace(/_+$/, '');
}

/** Zählt Grossbuchstaben (A–Z) — Pendant zu Pythons `c.isupper()` für ASCII. */
function anzahlGross(s: string): number {
  return (s.match(/[A-Z]/g) ?? []).length;
}

/**
 * Extrahiert Gesetzes-Zitate aus Fliesstext (mit bewahrtem Artikel-Token).
 * Dedupliziert über die Normalform; Reihenfolge = erstes Vorkommen.
 */
export function extrahiereStatutRefs(text: string): StatutRef[] {
  if (!text) return [];

  const refs: StatutRef[] = [];
  const gesehen = new Set<string>();

  for (const match of text.matchAll(STATUTE_PATTERN)) {
    const g = match.groups!;
    const raw = match[0].trim();
    const artikel = (g.article ?? '').toLowerCase().replace(/\s+/g, '');
    const absatzRaw = g.paragraph;
    const absatz = absatzRaw ? absatzRaw.toLowerCase().replace(/\s+/g, '') : null;
    const lawRaw = g.law;

    // Der Treffer muss wie eine juristische Abkürzung aussehen, nicht wie ein
    // gewöhnliches Wort. Klein geschriebene Wörter (der, des, in) und lange
    // Titlecase-Wörter (Oder, Della) fallen raus. Kurzes Titlecase (Cst, Abs)
    // bleibt — die Blockliste fängt die Falsch-Positiven darunter.
    const nGross = anzahlGross(lawRaw);
    if (nGross === 0) continue;
    if (nGross === 1 && lawRaw.length > 3) continue;

    const gesetz = lawRaw.toUpperCase();
    if (INVALID_LAW_CODES.has(gesetz)) continue;

    const normalisiert = normalisiereStatut(artikel, absatz, gesetz);
    if (gesehen.has(normalisiert)) continue;
    gesehen.add(normalisiert);
    refs.push({ raw, gesetz, artikel, absatz, normalisiert });
  }
  return refs;
}

/**
 * Extrahiert Entscheid-Zitate (BGE + Aktenzeichen) als normalisierte Strings.
 * Ein gemeinsames `gesehen`-Set dedupliziert; die BGE-interne Bare-Nennung
 * («151 I 62») wird gegen ein direkt vorangehendes «BGE» entdoppelt.
 */
export function extrahiereEntscheidRefs(text: string): string[] {
  if (!text) return [];

  const refs: string[] = [];
  const gesehen = new Set<string>();

  // BGE-Zitate, z.B. «BGE 147 I 268»
  for (const match of text.matchAll(BGE_PATTERN)) {
    const g = match.groups!;
    const normalisiert = `BGE ${g.vol} ${g.div.toUpperCase()} ${g.page}`;
    if (gesehen.has(normalisiert)) continue;
    gesehen.add(normalisiert);
    refs.push(normalisiert);
  }

  const bareMuster = DOCKET_PATTERNS[DOCKET_PATTERNS.length - 1];
  for (const pattern of DOCKET_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      const raw = match[0].trim();
      if (pattern === bareMuster) {
        // Doppelzählung von BGE-Refs als Aktenzeichen vermeiden.
        const start = match.index ?? 0;
        const prefix = text.slice(Math.max(0, start - 8), start);
        if (/\bBGE\s*$/i.test(prefix)) continue;
      }
      const normalisiert = normalisiereDocket(raw);
      if (!normalisiert || gesehen.has(normalisiert)) continue;
      gesehen.add(normalisiert);
      refs.push(normalisiert);
    }
  }
  return refs;
}
