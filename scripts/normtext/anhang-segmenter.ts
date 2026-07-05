// ─── Generischer Anhang-/Tarif-Ziffer-Segmentierer ─────────────────────────
//
// Viele kantonale Notariats-/Grundbuch-/Gerichtsgebühren-Tarife stehen NICHT in
// Art./§, sondern im ANHANG mit hierarchischer Nummerierung («1.1.1», «2.5.1»,
// «4.4.3.1» …). Dieser eine Segmentierer zerlegt einen extrahierten Erlass-Text
// in Per-Ziffer-Einträge — wiederverwendbar über alle Anhang-Quellen (ZH-PDF,
// LexWork, HTM, generisches PDF), statt 22-mal Hand-Parsing.
//
// Mechanik: Im Text wird der Anhang-Tarif-Bereich gesucht (erste Zeile, die mit
// einer mehrstufigen Ziffer beginnt, z. B. «1.1Verträge…»), dann jede Zeile, die
// mit einer Hierarchie-Ziffer «N(.N)+» beginnt, als neuer Eintrag genommen;
// Folgezeilen ohne Ziffer-Marke hängen an den laufenden Eintrag an. Token = die
// gepunktete Ziffer (= Snapshot-`artikel`; kongruent zu parsePassus, das
// «Anhang Ziff. N.N.N» auf genau diesen Token auflöst).
//
// Konservativ: nur wenn ≥ MIN_ZIFFERN echte Ziffer-Einträge gefunden werden,
// gilt es als Anhang-Tarif (sonst leer → keine Fehl-Einträge bei Erlassen, die
// gar keinen Ziffer-Anhang haben). §7-Zitat-Ausnahme: Live-Link bleibt
// massgeblich; Spalten-Merge-Artefakte des PDF (eingeklebte Querverweis-Nummern)
// sind im Snapshot möglich, der amtliche Link ist die verbindliche Fassung.

export interface AnhangEintrag {
  bloecke: Array<{ absatz: null; text: string }>;
}

const ZIFFER_KOPF = /^(\d+(?:\.\d+)+)\s*(.*)$/;
const MIN_ZIFFERN = 8;

/**
 * Erlass-Text → { «1.1.1» → {bloecke}, … }. Leer, wenn kein Ziffer-Anhang.
 *
 * `istKopfZeile` (optional): GEOMETRIE-Orakel je Zeilenindex (Gegenprüfungs-
 * Befund D1–D3, SG-2935). Ohne Orakel öffnet JEDE Zeile, die mit einer
 * mehrstufigen Ziffer beginnt, eine neue Position — auch eine UMGEBROCHENE
 * Querverweis-Zeile («… ausgenommen Nrn. 25.07 bis ⏎ 25.10 dieses Erlasses …»),
 * wodurch (a) die laufende Position trunkiert wird (Betrag verloren) und
 * (b) ein Phantom-Eintrag per First-wins-Dedup die ECHTE spätere Position
 * verdrängt (SG-2935: 25.10 zeigte 50.– statt amtlich 100.–). Mit Orakel
 * (PDF-Pfad: `istZifferKopfZeile`, Ziffer sitzt in der Nr.-Spalte am linken
 * Body-Rand) öffnet nur eine geometrisch belegte Kopf-Zeile; nicht belegte
 * Ziffer-Zeilen fliessen als Fortsetzung in die laufende Position (§1: kein
 * Zeichen verloren, keine Trennung ohne Geometrie-Beweis).
 */
export function segmentiereAnhangZiffern(
  text: string,
  istKopfZeile?: (zeilenIndex: number) => boolean,
): Record<string, AnhangEintrag> {
  const zeilen = text.split('\n');
  const istKopf = (i: number): boolean =>
    ZIFFER_KOPF.test(zeilen[i].trim()) && (istKopfZeile ? istKopfZeile(i) : true);
  // Anhang-Start: erste Kopf-Zeile mit mehrstufiger Ziffer am Anfang. Davor
  // (Artikel-Body, Präambel) wird ignoriert — die erfasst der §/Art.-Extraktor.
  let start = -1;
  for (let i = 0; i < zeilen.length; i++) {
    if (istKopf(i)) {
      start = i;
      break;
    }
  }
  if (start < 0) return {};

  const eintraege: Record<string, AnhangEintrag> = {};
  let aktivToken: string | null = null;
  let aktivText = '';
  const speichere = (): void => {
    if (aktivToken === null) return;
    // «¶N»-Marker sind die interne Absatz-Kodierung der PDF-Serialisierung
    // (serialisierePdfZeilen/serialisiereZhZeilen). Im Anhang-Tarif sind das
    // KEINE echten Absätze, sondern verirrte hochgestellte Ziffern/Fussnoten-
    // Verweise aus dem zweispaltigen Layout («gemäss ¶8 Art. 727» → «gemäss
    // Art. 727»). Für die faithful-Speicherung (§7) entfernt, damit kein «¶8»
    // im Snapshot-Text steht.
    const t = aktivText.replace(/¶\d+(?:bis|ter)?\s*/g, ' ').replace(/\s+/g, ' ').trim();
    if (t && !(aktivToken in eintraege)) {
      eintraege[aktivToken] = { bloecke: [{ absatz: null, text: t }] };
    }
  };

  for (let i = start; i < zeilen.length; i++) {
    const zeile = zeilen[i].trim();
    const m = istKopf(i) ? zeile.match(ZIFFER_KOPF) : null;
    if (m) {
      speichere();
      aktivToken = m[1];
      aktivText = m[2];
    } else if (aktivToken !== null) {
      aktivText += ' ' + zeile;
    }
  }
  speichere();

  return Object.keys(eintraege).length >= MIN_ZIFFERN ? eintraege : {};
}
