// ─── Helfer: Stand-Berechnung für gen-startseite-zaehler.ts ──────────────────
//
// Ausgelagert aus gen-startseite-zaehler.ts, DAMIT dieser Kern ohne die realen
// Register-/Snapshot-Dateien testbar ist — das Generator-Skript hat Top-Level-
// Seiteneffekte (schreibt/prüft beim blossen Import), ein Test darf es also
// nie importieren (src/tests/startseite-zaehler-stand-rechtsprechung.test.ts).
//
// #691 (FAHRPLAN-OFFENE-BEFUNDE §1, latent seit 5.9.2026): `standRechtsprechung`
// zeigte `register.json`s `erzeugt` — das ist der Zeitstempel des BUILD-LAUFS
// (`entscheide-schreiben.ts` schreibt dort das globale `--datum`), nicht das
// Abrufdatum der Inhalte. Der Wert änderte sich bei JEDEM Lauf auf «heute»,
// auch ohne einen einzigen neuen Entscheid — das genaue Muster, das §2
// («kein Date.now() in der Rechenlogik») verbieten will, nur einen Schritt
// weiter oben (im Register-Schreiber statt im Zähler selbst).
//
// FIX (§8): der Stand ist das JÜNGSTE Abrufdatum über den echten Bestand
// (Nicht-Verweise mit eigener Datei). Jede Snapshot-Datei trägt ihr eigenes
// `erzeugt`, das beim Schreiben bereits auf `snap.abgerufen` gesetzt wird
// (entscheide-schreiben.ts, Kommentar bei `EntscheidSnapshotDatei`) — das
// Lesen dieses einen Feldes je Datei genügt, ein zweiter Rechenweg über
// `eintraege[0].abgerufen` wäre dieselbe Zahl (empirisch geprüft: 30/30
// Stichprobe ohne Abweichung, 12.9.2026).

const ISO_TAG = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Grösstes gültige ISO-Tagesdatum (`JJJJ-MM-TT`) aus einer Werteliste; alles
 * andere (null, leer, Freitext) fällt weg. Lexikografischer Vergleich ist bei
 * diesem Format identisch mit dem chronologischen (§2 — kein Date-Objekt, kein
 * Zeitzonen-Risiko). Kein gültiger Wert ⇒ `null`, nie ein erfundenes Datum (§8).
 */
export function juengstes(werte: Array<string | null | undefined>): string | null {
  let max: string | null = null;
  for (const w of werte) {
    if (typeof w !== 'string' || !ISO_TAG.test(w)) continue;
    if (max === null || w > max) max = w;
  }
  return max;
}

/** Minimalform eines Register-Eintrags, wie sie für die Stand-Berechnung nötig ist. */
export interface EntscheidEintragFuerStand {
  verweis?: unknown;
  datei?: string | null;
}

/**
 * §8/#691: Stand der Rechtsprechung = jüngstes Abrufdatum über den echten
 * Bestand (Nicht-Verweise MIT eigener Datei — ein Verweis ist ein
 * Redirect-Stub ohne eigenen Snapshot). `liesAbgerufen` liest das Abrufdatum
 * EINER Snapshot-Datei (Pfad relativ zu `public/rechtsprechung/`) und ist
 * injizierbar, damit dieser Kern ohne die 5093 realen Dateien testbar bleibt
 * — rein und deterministisch (§2): kein `Date.now()`, dasselbe Register liefert
 * immer denselben Stand.
 */
export function berechneStandRechtsprechung(
  entscheide: EntscheidEintragFuerStand[],
  liesAbgerufen: (datei: string) => string | null,
): string | null {
  const werte = entscheide
    .filter((e): e is EntscheidEintragFuerStand & { datei: string } => !e.verweis && !!e.datei)
    .map((e) => liesAbgerufen(e.datei));
  return juengstes(werte);
}
