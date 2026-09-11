// ═══ W2·26/Z3 · WELCHE ZAHL DIE RUBRIK «ENTSCHEIDE» NENNT ═══════════════════
//
// MANDAT David 11.9.2026 («alles sauberer, übersichtlicher»), Punkt Z3: in der
// Zeile steht EINE Zahl, nicht zwei.
//
// DER BEFUND DAHINTER. Bis W2·26 nannte die Marke IMMER die Grundgesamtheit aus
// der Zähl-Datei («11 Entscheide»), während die Liste darunter bei aktivem
// Zeit- oder Kantonsfilter nur die gefilterten Kanten führte und ihre eigene
// «5 von 12»-Auskunft trug (`parts/BezuegeZeile.tsx`). Die Zeile versprach dann
// eine Menge, die der Klick nicht lieferte — derselbe §8-Mangel, den D30 an der
// umgekehrten Stelle behoben hat.
//
// DIE REGEL, in einem Satz: bei aktivem Filter zeigt die Marke die GEFILTERTE
// Zahl (also genau die Zahl der Zeilen, die das Aufklappen zeigt), und die
// Grundgesamtheit steht im `title`. Ohne Filter ändert sich nichts — dann bleibt
// die Zähl-Datei die Quelle, und damit bleibt die R6c/D30-Zusage bestehen, dass
// die Zahl beim Eintreffen des Shards nicht umspringt (sie ist gezählt, nicht
// gefiltert).
//
// WARUM EIGENE DATEI (§3, Zweitblick-Auflage zu PR #788): die Regel stand als
// drei Ausdrücke mitten im JSX-Bauteil `ArtikelBezuegeFuss` und war damit nur
// über den Browser prüfbar. Sie ist RECHNEN, nicht Zeichnen — rein, ohne DOM,
// ohne React, gleiche Eingabe ⇒ gleiche Ausgabe (§2). Der Bauteil ruft sie auf
// und rendert; geprüft wird sie direkt (`src/tests/entscheid-zahl.test.ts`).

/** Die Bezugs-Quelle, soweit diese Regel sie braucht (§3: kein React-Typ hier). */
export interface EntscheidQuelle {
  /** Zahl der Kanten, die die Liste unter der Marke wirklich zeigt. */
  kanten: number;
  /** Ist ein Zeitraum-Filter aktiv? */
  zeitAktiv: boolean;
  /** Ist ein Kantons-Filter aktiv? */
  kantonAktiv: boolean;
}

/** Was die Marke zeigt — und was sie im `title` dazusagt. */
export interface EntscheidZahl {
  /** Die EINE sichtbare Zahl. */
  anzahl: number;
  /** Grundgesamtheit, nur wenn die sichtbare Zahl eine gefilterte ist. */
  titel?: string;
}

/**
 * Die Zahl der Rubrik «Entscheide» und ihr `title`.
 *
 * @param quelle     Die Bezüge, die die Liste zeigt (`bezuegeImFuss ?? bezuege`),
 *                   oder `null`, solange der Shard nicht da ist.
 * @param zaehler    Entscheid-Zahl aus der Zähl-Datei (`gesamtProArtikel`, ohne
 *                   UI-Filter) oder `null`, wenn es sie nicht gibt.
 * @param leitfaelle Fallback-Länge der Leitfall-Liste (Stand vor R6c).
 * @param zitat      KURZ-Zitat für den `title` — «11 insgesamt zu Art. 198 ZPO».
 */
export function entscheidZahl(
  quelle: EntscheidQuelle | null | undefined,
  zaehler: number | null | undefined,
  leitfaelle: number,
  zitat: string,
): EntscheidZahl {
  // Die Rangfolge ist die von R6c/D30 und bleibt unverändert: Zähl-Datei zuerst
  // (sie ist gezählt, nicht gefiltert, und springt darum nicht um), sonst die
  // Kanten der Quelle, die auch die Liste zeigt, sonst die Leitfälle.
  const roh = zaehler != null ? zaehler : (quelle ? quelle.kanten : leitfaelle);
  const filterAktiv = !!quelle && (quelle.zeitAktiv || quelle.kantonAktiv);
  const gezeigt = filterAktiv && quelle ? quelle.kanten : roh;
  // DER `title` STEHT NUR, WENN ER ETWAS SAGT (§8): bei gleicher Zahl wäre
  // «5 im aktiven Filter — 5 insgesamt» Lärm, und ein leerer `title` am Knopf
  // ist schlechter als keiner (Screenreader lesen ihn mit).
  return filterAktiv && roh > gezeigt
    ? { anzahl: gezeigt, titel: `${gezeigt} im aktiven Filter — ${roh} insgesamt zu ${zitat}` }
    : { anzahl: gezeigt };
}
