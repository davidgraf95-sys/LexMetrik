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

/** Erlass-Text → { «1.1.1» → {bloecke}, … }. Leer, wenn kein Ziffer-Anhang. */
export function segmentiereAnhangZiffern(text: string): Record<string, AnhangEintrag> {
  const zeilen = text.split('\n');
  // Anhang-Start: erste Zeile mit mehrstufiger Ziffer am Anfang. Davor (Artikel-
  // Body, Präambel) wird ignoriert — die werden vom §/Art.-Extraktor erfasst.
  const start = zeilen.findIndex((z) => ZIFFER_KOPF.test(z.trim()));
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
    const m = zeile.match(ZIFFER_KOPF);
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
