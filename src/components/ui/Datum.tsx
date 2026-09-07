import { datumCh } from '../../lib/normtext/erlassKopfText';

// ═══ Ein Datum, EINE Anmutung (B-3, 31.8.2026) ══════════════════════════════
//
// GEMESSEN (Design-Konsistenz, Finder-Welle B, Runde 1): dasselbe Datum trat in
// zwei Anmutungen auf — mono (`.num`) in `MaterialLeser` und `NormPopover`,
// proportional mit `tabular-nums` im Erlass-Kopf. Und es wurde von FÜNF
// byte-gleichen Formatierern erzeugt (dieselbe Regex, dieselbe Rückgabe).
//
// DER KANON steht seit S2/Ä-(b) fest und ist hier nur eingesammelt, nicht neu
// erfunden (Design-Grundlage Kap. 2.1/2.3): die Mono-Stimme ist «auf
// SR-Nr./Aktenzeichen begrenzt» — DATEN GEHÖREN NICHT DAZU. Sie laufen in der
// Textstimme mit `tabular-nums`, damit Ziffern gleicher Stelle untereinander
// stehen, ohne dass die Zeile die Schriftfamilie wechselt. Die Herleitung im
// Wortlaut steht in `parts/ErlassLeserKopf.tsx` bei der Stand-Zeile.
//
// FORMATIERUNG UND AUSZEICHNUNG GEHÖREN ZUSAMMEN: getrennt sind sie viermal
// auseinandergelaufen (die Kopie machte das Format richtig und die Stimme
// falsch). Darum EIN Baustein, der beides tut — und genau EINE Formatier-
// Quelle: `datumCh` in `lib/normtext/erlassKopfText.ts`. Sie liegt dort, weil
// derselbe String in den prerenderten SEO-Kopf muss (`lib/seo-detail.ts`) und
// die Bibliotheks-Schicht nicht auf die Darstellung zeigen darf (§3).
//
// §3: reine Darstellung — hier wird nichts über Fristen oder Geltung
// entschieden, nur eine ISO-Zeichenkette umgeschrieben.
export function Datum({ iso, className }: {
  /** ISO `YYYY-MM-DD`; ein Nicht-ISO-Wert (Altbestand) bleibt unverändert
   *  stehen, statt zu einem erfundenen Datum zu werden (§8). */
  iso: string;
  /** Zusatz-Klassen des Aufrufers (Farbe/Grösse der umgebenden Zeile).
   *  Den Ziffernsatz setzt der Baustein, er ist nicht verhandelbar — seit
   *  R6-B (5.9.2026) über `.lc-ziffern` statt der rohen `tabular-nums`-
   *  Utility; dieselbe Rolle, EINE Deklaration (§5). */
  className?: string;
}) {
  return <span className={className ? `lc-ziffern ${className}` : 'lc-ziffern'}>{datumCh(iso)}</span>;
}

