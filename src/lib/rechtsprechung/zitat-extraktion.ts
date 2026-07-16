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
//
// ── Muster-Ausbau F2 (Roadmap W2·7-VZUI, 16.7.2026) ──────────────────────────
// Die Erwägungs-/Bereichs-/Ketten-/Umlaut-Muster sind angelehnt an den Zitat-
// Normalizer des Omnilex-AI-Starter-Repos (`src/omnilex/citations/normalizer.py`,
// Lizenz **Apache-2.0**) — übernommen wurden NUR die Regex-Formen (BGE-Pinpoint
// `E.`/`Erw.`/`consid.` dezimal/slash/range, Absatz-Marker DE/FR/IT), NICHT das
// dort naive `if abbrev in raw`-Substring-Matching (Fehlmatch-anfällig). Recherche
// + Lizenz-/FP-Analyse: `bibliothek/werkzeuge/omnilex-ai-und-kaggle-legal-ir-2026-07-16.md`.
// Jede F2-Ergänzung ist adversarial FP-geprüft und mit dem in dieser Datei
// verankerten Filter (`INVALID_LAW_CODES`, Gross-/Umlaut-/Bereichs-Monotonie-Regeln)
// gegen konstruierte Fehltreffer abgesichert (Tests: `src/tests/zitat-extraktion.test.ts`).
//
// ── F2-Nachtrag (nachgeholte Doppel-Prüfung, 16.7.2026) ──────────────────────
// Vier durch Netz-Abbruch in der Refute-Phase stumm verworfene Kandidaten
// nachgeholt: (1) «ATF …» frz. + (2) «DTF …» ital. BGE-Sigel → beide auf den
// «BGE …»-Kanon normalisiert (Verzahnungs-Dedup der Sprach-Zwillinge, sonst
// stiller Verlust im FR/IT-Korpus; Miner-These 2 empirisch bestätigt) inkl. des
// vorher verlorenen «consid.»-Pinpoints; (4) «lett.» ital. lettera als Sub-Marker
// (vorher [] — «let» frass 3 von 4 Zeichen). (3) «ch.» frz. chiffre war bereits
// über SUB_MARKER erfasst → als geprüft-verworfen dokumentiert.

/** Gesetzes-Zitat mit bewahrtem Artikel-/Absatz-Token. */
export interface StatutRef {
  /** Roh-Treffer (getrimmt), z.B. 'Art. 34 Abs. 2 BV'. */
  raw: string;
  /** Gesetzes-Abkürzung (grossgeschrieben), z.B. 'BV'. */
  gesetz: string;
  /** Artikel-Token, whitespace-frei und klein — BEWAHRT: '34', '8a', '52bis'. */
  artikel: string;
  /**
   * Bereichs-Endpunkt (F2-V10, «Art. 641-654a ZGB» → '654a'); sonst null. Fliesst
   * NICHT in `normalisiert`/den Norm-Key ein (der bleibt der Start-Artikel) —
   * nur zur treuen Anzeige des Bereichs (Monotonie-gesichert: `bis` ≥ `artikel`).
   */
  artikelBis: string | null;
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
// Untergliederungs-Marker. F2-V3: «Nr» (Staatsvertrags-Standard «Art. 34 Nr. 3
// LugÜ») VOR «n» in der Alternation, damit «Nr» ganz konsumiert wird statt «n»+«r»
// — sonst greift «Nr» als law-Kandidat und der Erlass fällt weg (belegt 150_III_423).
// F2-Nachtrag (lett): «lett» (it «lettera») und «litt» (fr «littera») MÜSSEN VOR den
// kürzeren «let»/«lit» stehen — sonst frisst «let» nur 3 der 4 Zeichen von «lett»,
// der Rest-Buchstabe «t» wird als SUB_TOKEN gelesen und das Glied kippt (der law
// wird «lett», nGross 0 → verworfen). Empirisch: extrahiereStatutRefs(
// 'art. 89 cpv. 1 lett. b LTF') = [] vor, = 1 Treffer (LTF) nach dem Fix.
const SUB_MARKER = '(?:Ziff(?:er)?|Nr|litt|lit|Bst|Buchst|S|Satz|ch|lett|let|n)';
const SUB_TOKEN = '(?:\\d+|[a-z])';
// Gesetzes-Code: Grossbuchstaben-Kürzel. F2-V5: Umlaut NUR als optionaler END-
// Buchstabe (Konvention «LugÜ»/«EPÜ»/«SDÜ»/«VeÜ»/«NYÜ»), NIE in der Innenklasse —
// sonst gingen gross geschriebene Umlaut-Wörter (ÖFFENTLICH/KÜNDIGUNG/VERGÜTUNG)
// als Code durch (Umlaut initial/medial). ASCII-`\b` würde ohne u-Flag mitten im
// Kürzel («Lug|Ü») eine Grenze ziehen → Endanker `CODE_ENDE` statt `\b`.
const GESETZ_CODE = '[A-Z][A-Z0-9]{1,11}[ÄÖÜ]?(?:/[A-Z0-9]{2,6})?';
const CODE_ENDE = '(?![A-Za-z0-9ÄÖÜ_])'; // wie `\b`, aber umlaut-bewusst

// Ein einzelnes Artikel-Glied: Zahl/Bereich (F2-V10) + optional Abs./ff. + bis zu
// drei verkettete Sub-Marker (F2-V2: «lit. b Ziff. 5»).
const ARTIKEL_BEREICH = `${ARTIKEL_TOKEN}(?:\\s*[–-]\\s*${ARTIKEL_TOKEN})?`;
const ARTIKEL_GLIED =
  `${ARTIKEL_BEREICH}` +
  `(?:\\s*${ABSATZ_MARKER}\\s*${ABSATZ_TOKEN})?` +
  `(?:\\s*${FOLGE_MARKER})?` +
  // Sub-Marker: der Token-Abschluss `(?![A-Za-z0-9])` (Pendant zum alten Pflicht-
  // `\s+`) verhindert, dass ein Marker-Buchstabe in den Code frisst — z.B. dass
  // «S» (Satz) das «St» von «StGB» konsumiert und nur «GB» als law übrig bleibt.
  `(?:\\s*(?:${SUB_MARKER})\\.?\\s*${SUB_TOKEN}(?![A-Za-z0-9])){0,3}`;
// Konnektor-Kette für Mehrfach-Zitate mit gemeinsamem Code (F2-V6/V8:
// «Art. 95 und 96 BGG», «Art. 39 ff., 82 ff. und 90 ff. ATSG»). Wort-Konnektoren
// nur mit beidseitigem Whitespace (it «e» damit zwingend ziffern-geankert, keine
// Kollision mit Artikel-Suffix «17e»); Komma/& mit optionalem Whitespace. Jedes
// Kettenglied beginnt mit einer Ziffer (ARTIKEL_GLIED → `\d`).
const KETTEN_GLIED = `(?:\\s*[,&]\\s*|\\s+(?:und|et|sowie|bzw\\.?|e)\\s+)${ARTIKEL_GLIED}`;

/**
 * Gesetzes-Zitat-Muster. Struktur (mit `i`-Flag → auch klein geschriebene
 * Treffer, die der nachgelagerte Filter aussortiert):
 *   \b Art. <liste: glied (konnektor glied)*> <law> CODE_ENDE
 * Die einzelnen Glieder der `liste` werden in `extrahiereStatutRefs` per
 * `KETTEN_TRENNER`/`GLIED_KOPF` in je einen StatutRef mit gemeinsamem Code zerlegt.
 */
const STATUTE_QUELLE =
  `\\b${ARTIKEL_MARKER}\\s*` +
  `(?<liste>${ARTIKEL_GLIED}(?:${KETTEN_GLIED})*)` +
  `\\s*(?<law>${GESETZ_CODE})` +
  CODE_ENDE;
const STATUTE_PATTERN = new RegExp(STATUTE_QUELLE, 'gi');

// Trennt eine `liste` an den Konnektoren; spiegelt KETTEN_GLIED (ohne Capture-
// Gruppen → sauberes String.split).
const KETTEN_TRENNER = /\s*[,&]\s*|\s+(?:und|et|sowie|bzw\.?|e)\s+/i;
// Kopf eines Glieds: Start-Artikel (+ optionaler Bereich, + optionaler Absatz).
// Sub-Marker/ff. werden bewusst NICHT gefangen (fliessen nie in den Norm-Key).
const GLIED_KOPF = new RegExp(
  `^\\s*(?<article>${ARTIKEL_TOKEN})(?:\\s*[–-]\\s*(?<articleBis>${ARTIKEL_TOKEN}))?` +
    `(?:\\s*${ABSATZ_MARKER}\\s*(?<paragraph>${ABSATZ_TOKEN}))?`,
  'i',
);

// Abteilung: römische Zahl I–VI (nie höher → kein L/C/D/M) plus optionaler
// Kleinbuchstabe für die historischen Abteilungen «Ia»/«Ib»/«Va» (Bug-Check E2/E3).
// F2-V1: optionaler Erwägungs-/Konsiderations-Pinpoint hinter dem `\b`-gesicherten
// Kopf (DE «E.»/«Erw.», FR «consid.»/«cons.»); Token deckt dezimal (1.2.2), Slash
// (1b/gg), Bereich (2-4) und röm. Präfix (II.3). Der `\b` nach der Seite schliesst
// die 5-Stellen-Trunkierung und den No-Space-Teilkopf (Basis-Parität).
const ERW_MARKER = '(?:E\\.|Erw\\.|consid\\.|cons\\.)';
const ERW_TOKEN = '(?:[IVX]+\\.)?\\d+[a-z]?(?:\\.\\d+[a-z]?)*(?:/[a-z]+|-\\d+[a-z]?)?';
// F2-Nachtrag (ATF/DTF): Die frz. («ATF») und ital. («DTF») Sigel bezeichnen
// DENSELBEN Bundesgerichts-Leitentscheid wie das dt. «BGE» — «ATF 147 III 121»
// ≡ «DTF 147 III 121» ≡ «BGE 147 III 121». Alle drei werden auf den KANONISCHEN
// «BGE …»-Kopf normalisiert, sonst bekämen die Sprach-Zwillinge verschiedene
// Schlüssel und die Entscheid↔Entscheid-Verzahnung im FR/IT-Korpus ginge still
// verloren (Miner-These 2, empirisch belegt). Der frz./ital. Erwägungs-Pinpoint
// «consid.» ist bereits in ERW_MARKER — er ging für ATF/DTF vorher komplett
// verloren, weil der Kopf nur über den Blank-Docket-Fallback (ohne Pinpoint)
// erfasst wurde. `ATF`/`DTF` sind — wie `BGE` — nur in der exakten
// «Sigel Band röm Seite»-Form treffbar → praktisch FP-frei.
const BGE_PATTERN = new RegExp(
  `\\b(?:BGE|ATF|DTF)\\s+(?<vol>\\d{1,3})\\s+(?<div>[IVX]{1,4}[ab]?)\\s+(?<page>\\d{1,4})\\b` +
    `(?:\\s+${ERW_MARKER}\\s*(?<erw>${ERW_TOKEN}))?`,
  'gi',
);

// ECLI-Zitat (F2-V7), inkl. EU-Gerichtshof «ECLI:EU:C:2019:134». Das literale
// `ECLI:`-Präfix (+ 4-Segment-Kette) ist hochspezifisch → praktisch FP-frei; der
// Schwanz endet nie auf Satzzeichen (kein gieriger End-Punkt). CH-ECLI-Schwanz
// «SK.2025.57» bleibt erhalten; die separate Erfassung des Docket-Schwanzes wird
// per Span-Überlappung in `extrahiereEntscheidRefs` unterdrückt (keine Doppelung).
const ECLI_PATTERN = /\bECLI:[A-Z]{2}:[A-Z]+:\d{4}:[A-Z0-9]+(?:[._][A-Z0-9]+)*/gi;

// SR-/RS-Fundstellen-Locator (F2-V9): «SR 830.11», fr/it «RS 173.110». Gross-
// geschrieben (kein `i`-Flag → kein Prosa-«sr/rs»); `\d{3}`-Pflichtkern schliesst
// Daten/Beträge/Seiten <100 aus; negativer Lookbehind gegen die parlamentarische
// Klasse «AB/BO JJJJ SR …» (Ständerat, keine Systematik-Nummer).
const SR_PATTERN = /(?<!AB \d{4} )(?<!BO \d{4} )\b(?:SR|RS)\s+\d{3}(?:\.\d+){0,3}\b/g;

// Aktenzeichen-Muster (Reihenfolge wie im Python-Original; ohne IGNORECASE).
const DOCKET_PATTERNS: RegExp[] = [
  // 1A.122/2005, 2C_37/2016, D-7414/2015
  /\b[A-Z0-9]{1,4}[._-]\d{1,6}[/_]\d{4}\b/g,
  // VB.2018.00411, RR.2012.25
  /\b[A-Z]{1,6}\.\d{4}\.\d{1,6}\b/g,
  // 151 I 62 / 120 Ia 31 — BGE-interne Nennung ohne explizites «BGE»
  /\b\d{1,3}\s+[IVX]{1,4}[ab]?\s+\d{1,4}\b/g,
];

/** Abteilung normalisieren: römischer Teil gross, Suffix-Buchstabe klein («Ia», «Va»). */
function normAbteilung(div: string): string {
  const m = /^([ivx]+)([ab]?)$/i.exec(div);
  if (!m) return div.toUpperCase();
  return m[1].toUpperCase() + m[2].toLowerCase();
}

/**
 * Kurze Codes mit nur einem Grossbuchstaben, die trotz Filter GÜLTIGE Gesetzes-
 * Abkürzungen sind (Bug-Check Z1): «Cost.» = italienische Bundesverfassung.
 */
const GUELTIGE_AUSNAHMEN: ReadonlySet<string> = new Set(['COST']);

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
  // F2: «NR» (Untergliederungs-Marker «Nummer», nie eine Gesetzes-Abkürzung) und
  // «BGE» (Entscheid-, keine Norm-Referenz) — beide sonst als law-Kandidat greifbar,
  // wenn kein echter Code folgt (F2-V2/V3). Die BGE-Erfassung selbst bleibt über
  // BGE_PATTERN/extrahiereEntscheidRefs unberührt (verhaltensneutral dort).
  'NR', 'BGE',
  // ── Gängige Abkürzungen, die keine Gesetzes-Codes sind ──
  'AD', 'AGB', 'BI', 'CH', 'NE', 'NI', 'NO', 'OF', 'QU', 'RE', 'SI',
  // F2-V8: Währungs-/Betrags-Codes — schliesst den einzigen belegten FP-Kanal der
  // Ketten-Zitate («Art. 41 und 500 EUR» → law=EUR) ohne Verlust echter Treffer.
  'CHF', 'EUR', 'USD', 'GBP', 'FR', 'FRS', 'SFR',
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
  const compact = text.trim().replace(/\s+/g, ' ');
  const bge = /^(\d{1,3})\s+([IVX]{1,4}[ab]?)\s+(\d{1,4})$/i.exec(compact);
  if (bge) {
    return `${bge[1]} ${normAbteilung(bge[2])} ${bge[3]}`;
  }
  return compact
    .toUpperCase()
    .replace(/[-./]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+/, '')
    .replace(/_+$/, '');
}

/**
 * Zählt Grossbuchstaben — Pendant zu Pythons `c.isupper()`, F2-V5-erweitert um die
 * Umlaute Ä/Ö/Ü, sonst bliebe «LugÜ» (nur ASCII-`L` → nGross 1, Länge 4>3) fälschlich
 * verworfen.
 */
function anzahlGross(s: string): number {
  return (s.match(/[A-ZÄÖÜ]/g) ?? []).length;
}

/** Numerischer Teil eines Artikel-Tokens («654a» → 654) für die Bereichs-Monotonie. */
function artikelNummer(token: string): number {
  const m = /^\d+/.exec(token);
  return m ? parseInt(m[0], 10) : NaN;
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
    const lawRaw = g.law;

    // Der Treffer muss wie eine juristische Abkürzung aussehen, nicht wie ein
    // gewöhnliches Wort. Klein geschriebene Wörter (der, des, in) und lange
    // Titlecase-Wörter (Oder, Della) fallen raus. Kurzes Titlecase (Cst, Abs)
    // bleibt — die Blockliste fängt die Falsch-Positiven darunter.
    const nGross = anzahlGross(lawRaw);
    if (nGross === 0) continue;
    if (nGross === 1 && lawRaw.length > 3 && !GUELTIGE_AUSNAHMEN.has(lawRaw.toUpperCase())) continue;

    const gesetz = lawRaw.toUpperCase();
    if (INVALID_LAW_CODES.has(gesetz)) continue;

    // Trefferliste in einzelne Artikel-Glieder zerlegen (F2-V6/V8: Mehrfach-Zitat
    // mit gemeinsamem Code) — jedes Glied trägt dieselbe Gesetzes-Abkürzung.
    for (const stueck of (g.liste ?? '').split(KETTEN_TRENNER)) {
      const km = GLIED_KOPF.exec(stueck);
      if (!km?.groups) continue;
      const kg = km.groups;
      const artikel = (kg.article ?? '').toLowerCase().replace(/\s+/g, '');
      if (!artikel) continue;
      const absatz = kg.paragraph ? kg.paragraph.toLowerCase().replace(/\s+/g, '') : null;
      // Bereichs-Endpunkt (F2-V10) nur bei Monotonie bewahren: ein Rechtsartikel-
      // Bereich steigt nie ab → verwirft die FR-Binnen-Bindestrich-Falle
      // («art. 227-23 CP»/«Art. 6-1 EMRK», absteigend gelesen). `bis` fliesst NIE
      // in den Norm-Key (nur Start-Artikel), nur zur treuen Anzeige.
      let artikelBis = kg.articleBis ? kg.articleBis.toLowerCase().replace(/\s+/g, '') : null;
      if (artikelBis && !(artikelNummer(artikelBis) >= artikelNummer(artikel))) artikelBis = null;

      const normalisiert = normalisiereStatut(artikel, absatz, gesetz);
      if (gesehen.has(normalisiert)) continue;
      gesehen.add(normalisiert);
      refs.push({ raw, gesetz, artikel, artikelBis, absatz, normalisiert });
    }
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

  // ECLI zuerst (F2-V7) — Spannen merken, damit der Docket-Schwanz (CH-ECLI
  // «SK.2025.57») nicht zusätzlich als eigenes Aktenzeichen doppelt erfasst wird.
  const ecliSpans: Array<readonly [number, number]> = [];
  for (const match of text.matchAll(ECLI_PATTERN)) {
    const start = match.index ?? 0;
    ecliSpans.push([start, start + match[0].length]);
    const normalisiert = match[0].toUpperCase();
    if (gesehen.has(normalisiert)) continue;
    gesehen.add(normalisiert);
    refs.push(normalisiert);
  }
  const inEcli = (start: number): boolean => ecliSpans.some(([s, e]) => start >= s && start < e);

  // BGE-Zitate, z.B. «BGE 147 I 268»; F2-V1 hängt den Erwägungs-Pinpoint an
  // («BGE 137 I 305 E. 3.2»). Der Pinpoint fragmentiert nur diese Funktion — die
  // Entscheid↔Entscheid-Verzahnung läuft über `kanonZitat` (Kopf-only), unberührt.
  for (const match of text.matchAll(BGE_PATTERN)) {
    const g = match.groups!;
    const kopf = `BGE ${g.vol} ${normAbteilung(g.div)} ${g.page}`;
    const normalisiert = g.erw ? `${kopf} E. ${g.erw}` : kopf;
    if (gesehen.has(normalisiert)) continue;
    gesehen.add(normalisiert);
    refs.push(normalisiert);
  }

  const bareMuster = DOCKET_PATTERNS[DOCKET_PATTERNS.length - 1];
  for (const pattern of DOCKET_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      const start = match.index ?? 0;
      if (inEcli(start)) continue; // Teil eines bereits erfassten ECLI
      const raw = match[0].trim();
      if (pattern === bareMuster) {
        // Doppelzählung von BGE-Refs als Aktenzeichen vermeiden. F2-Nachtrag:
        // auch die frz./ital. Sigel «ATF»/«DTF» unterdrücken — deren Zahl-Schwanz
        // «147 III 121» wird sonst zusätzlich als bare Aktenzeichen erfasst und
        // bekäme den prefix-losen Schlüssel zurück, den der ATF/DTF-Fix gerade
        // auf den «BGE …»-Kanon hebt (sonst Doppel-Schlüssel statt Dedup).
        const prefix = text.slice(Math.max(0, start - 8), start);
        if (/\b(?:BGE|ATF|DTF)\s*$/i.test(prefix)) continue;
      }
      const normalisiert = normalisiereDocket(raw);
      if (!normalisiert || gesehen.has(normalisiert)) continue;
      gesehen.add(normalisiert);
      refs.push(normalisiert);
    }
  }
  return refs;
}

/**
 * Extrahiert SR-/RS-Fundstellen-Locatoren (F2-V9), z.B. «SR 830.11», fr/it
 * «RS 173.110» — eine Referenz auf einen Erlass über seine Nummer der
 * Systematischen Rechtssammlung (weder Artikel-Zitat noch Entscheid). Rein und
 * deterministisch; dedupliziert über die normalisierte Form.
 */
export function extrahiereFundstellenRefs(text: string): string[] {
  if (!text) return [];
  const refs: string[] = [];
  const gesehen = new Set<string>();
  for (const match of text.matchAll(SR_PATTERN)) {
    const normalisiert = match[0].trim().replace(/\s+/g, ' ');
    if (gesehen.has(normalisiert)) continue;
    gesehen.add(normalisiert);
    refs.push(normalisiert);
  }
  return refs;
}
