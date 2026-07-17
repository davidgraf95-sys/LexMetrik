// ─── LIK-Frische-Mini-Tor (O-1.6) ───────────────────────────────────────────
//
// Der Landesindex der Konsumentenpreise (LIK/BFS) wird MONATLICH publiziert
// (im Folgemonat). Die Teuerungs-Engine trägt den letzten eingepflegten Monat
// als `LIK_LETZTER_MONAT`. Ohne maschinenlesbare Frische-Prüfung altert diese
// Reihe still: `check:verfall` klassiert sie als «manuell» und prüft nie.
//
// Dieses Tor läuft im WOCHEN-MONITOR (nicht im deterministischen `gate` — es
// hängt an der Wanduhr): ist der letzte eingepflegte Monat älter als
// (heute − 2 Monate), ist die Reihe überfällig → Monitor rot → Issue → Fix mit
// `scripts/lik-reihe-generieren.py`. Toleranz 2 Monate deckt den BFS-
// Publikationsverzug (Wert für Monat M erscheint Mitte M+1) sauber ab.

import { LIK_LETZTER_MONAT, LIK_STAND } from '../src/data/likReihe';

/** 'YYYY-MM' des Monats, der `mon` um `n` Monate zurückliegt. */
function monatMinus(n: number, ref = new Date()): string {
  const d = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() - n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function main(): void {
  const schwelle = monatMinus(2);
  // 'YYYY-MM'-Strings sind lexikografisch monat-vergleichbar.
  if (LIK_LETZTER_MONAT < schwelle) {
    console.error(
      `LIK-Reihe ÜBERFÄLLIG: letzter eingepflegter Monat ${LIK_LETZTER_MONAT} ` +
        `liegt vor der Frische-Schwelle ${schwelle} (heute − 2 Monate).\n` +
        `Stand: ${LIK_STAND}\n` +
        `→ Neue BFS-Werte einpflegen: python3 scripts/lik-reihe-generieren.py`,
    );
    process.exit(1);
  }
  console.log(
    `ok  LIK-Reihe frisch: letzter Monat ${LIK_LETZTER_MONAT} ≥ Schwelle ${schwelle}.`,
  );
}

main();
