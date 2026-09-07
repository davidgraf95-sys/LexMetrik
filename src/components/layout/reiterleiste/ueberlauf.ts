// ═══ R13 · ÜBERLAUF UND FENSTER DER ARBEITSLEISTE (Prüfbefunde R13-1…3) ═════
//
// GEMESSEN 7.9.2026 am Stand `0ba97c5d6` (`scratchpad/w224-r13-befunde.md`):
//   R13-2  8 realistische Reiter @1440 — `scrollWidth 1476 > clientWidth 1355`,
//          «+N» erschien NICHT (Überlauf war an die feste Zahl 8 gebunden),
//          der Scrollbalken ist per CSS unsichtbar: der achte Reiter stand als
//          stummes «Z» an der Kante. @1024 fehlten zwei Reiter ganz.
//   R13-3  15 Reiter, aktiv #14 → #15: der aktive Reiter wurde in Slot 8
//          GETAUSCHT, der bisherige Slot-8-Reiter verschwand. Die Leiste zeigte
//          damit eine Nachbarschaft, die es im Speicher nicht gibt — und
//          Alt+⇧+←/→ ordnete gegen das Bild.
//
// DIE ANTWORT AUF BEIDES IST DIESELBE: die Leiste zeigt ein FENSTER über die
// echte Speicherordnung — eine zusammenhängende Teilfolge, deren Länge sich aus
// der GEMESSENEN Breite ergibt (`useReiterFenster`), nicht aus einer festen
// Zahl. Was nicht hineinpasst, steht im «+N»-Blatt; angeschnitten wird nie.
//
// Diese Datei ist der RECHNENDE Teil (§3): rein, ohne DOM, ohne React —
// darum in `src/tests/reiter-ueberlauf-r13.test.ts` direkt prüfbar.

/** Eigener MIME-Typ für das Ziehen eines Reiters in ein Pane (§5a Ziff. 4).
 *  `dragover` darf die Nutzlast nicht lesen, nur die Typen — darum ein eigener
 *  Typ statt einer Inhaltsprüfung auf `text/plain`.
 *  (Wohnt seit dem R13-Split hier, damit `Reiter.tsx` und `Reiterleiste.tsx`
 *  dieselbe Konstante lesen, ohne dass die eine die andere importiert.) */
export const REITER_MIME = 'application/x-lexmetrik-reiter';

/**
 * Wo das sichtbare Fenster beginnt.
 *
 * REGEL (Browser-Norm, R13-3): das Fenster BEWEGT sich, es TAUSCHT nicht. Es
 * rückt genau so weit, dass der aktive Reiter darin liegt — keinen Reiter
 * weiter. Damit bleibt die sichtbare Folge immer eine zusammenhängende
 * Teilfolge des Speichers, und der Nachbar links vom aktiven Reiter ist auch
 * im Speicher sein Nachbar.
 *
 * @param laenge   Zahl der offenen Reiter (Speicher).
 * @param aktivIdx Stelle des aktiven Reiters, `-1` wenn keiner aktiv ist.
 * @param anzahl   Wie viele Reiter nebeneinander passen (gemessen).
 * @param alt      Bisheriger Fensteranfang.
 */
export function fensterStart(laenge: number, aktivIdx: number, anzahl: number, alt: number): number {
  const max = Math.max(0, laenge - anzahl);
  let start = Math.min(Math.max(0, alt), max);
  if (aktivIdx >= 0) {
    if (aktivIdx < start) start = aktivIdx;
    else if (aktivIdx >= start + anzahl) start = aktivIdx - anzahl + 1;
  }
  return Math.min(Math.max(0, start), max);
}

/**
 * Der erste Reiter, der NICHT MEHR GANZ ins Bild passt — aus gemessenen
 * Kanten, nicht aus einer festen Zahl (R13-2).
 *
 * `kanten[i]` ist die rechte Kante des i-ten Reiters relativ zum Streifenanfang
 * (`offsetLeft + offsetWidth`). Ein Reiter gilt als passend, solange seine
 * Kante die Streifenbreite um höchstens `TOLERANZ` überschreitet — sub-pixel
 * aus der Flex-Verteilung ist kein Anschnitt.
 *
 * @returns Index des ersten überstehenden Reiters, oder `-1`, wenn alle passen.
 */
export const TOLERANZ_PX = 1;

export function ersterUeberlauf(kanten: readonly number[], breite: number): number {
  for (let i = 0; i < kanten.length; i++) {
    if (kanten[i] > breite + TOLERANZ_PX) return i;
  }
  return -1;
}
