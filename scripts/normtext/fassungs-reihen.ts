// ─── Fassungs-Reihen: ein SR-Slot, mehrere Fassungen (Totalrevision) ────────
//
// AUSGELAGERT aus entscheide-mapping.ts (12.9.2026, §6.6 — die Datei stand mit
// diesem Block über ihrer Schlankheits-Schwelle). Der Umzug ist wortgleich und
// verhaltensneutral; entscheide-mapping.ts re-exportiert `fassungsReihen`,
// `ERLASS_FASSUNGS_REIHEN`, `fassungsDatumVon` und den Typ, damit kein Aufrufer
// angefasst werden musste (§6).
//
// Leaf-Modul: liest ERLASS_REGISTER und die ELI-Zuordnung, importiert NICHTS
// aus entscheide-mapping (kein Zyklus).

import { erlassKeyVonEli } from '../../src/lib/normtext/erlassAdresse';
import { ERLASS_REGISTER } from '../../src/lib/normtext/register';
import type { EntscheidSnapshot } from '../../src/lib/rechtsprechung/typen';

// ANLASS (12.9.2026, PR #823). SR 412.103.1 trägt seit dem 1.3.2026 ZWEI
// Register-Einträge: die geltende Berufsmaturitätsverordnung vom 13.6.2025
// (`BMV_2025`, ELI cc/2025/408) und ihre in deren Art. 34 ausdrücklich
// aufgehobene Vorgängerin von 2009 (`BMV`, ELI cc/2009/423). Beide führen
// dasselbe amtliche Kürzel «BMV», beide dieselbe SR-Nummer. Für die
// Kollisionsregel war das ein Mehrdeutigkeits-Fall wie jeder andere: das
// Kürzel beidseitig verworfen, die fremdsprachigen Aliase (fr/it «OMPr») über
// die doppelt belegte SR-Nummer dazu. Ergebnis wäre, dass ein Entscheid zur
// Berufsmaturität GAR KEINEN Norm-Key mehr bekommt — obwohl hier nichts
// unklar ist.
//
// WARUM DAS KEINE KOLLISION IST. Die Kollisionsregel schützt vor RATEN: zwei
// verschiedene Erlasse, dasselbe Kürzel, kein Kriterium zur Trennung. Hier
// gibt es ein Kriterium, und es ist amtlich deklariert — das Aufhebungsdatum.
// Ein Entscheid, der «BMV» zitiert, meint die im Entscheidzeitpunkt geltende
// Fassung: vor dem 1.3.2026 die Verordnung von 2009, ab dem 1.3.2026 die von
// 2025. Das ist keine Heuristik, sondern die Grundregel der zeitlichen Geltung
// (§1); §2 bleibt gewahrt, weil beide Eingaben deklariert sind — das Datum aus
// dem Snapshot, die Aufhebung aus `aufhebungen.ts`.
//
// DEKLARIERT, NICHT GERATEN (§5/§2). Eine Reihe entsteht nur, wenn ALLE vier
// Bedingungen erfüllt sind:
//   (1) mehrere Bund-Einträge teilen genau dieselbe SR-Nummer,
//   (2) GENAU EINER von ihnen ist nicht aufgehoben (die geltende Fassung),
//   (3) jeder aufgehobene nennt in `aufgehoben.nachfolger.eli` einen
//       Nachfolger, der über `erlassKeyVonEli` auf einen Eintrag DERSELBEN
//       Reihe auflöst — die Abfolge ist also beidseitig belegt, nicht aus der
//       gemeinsamen SR-Nummer erschlossen,
//   (4) jeder aufgehobene trägt sein amtliches Aufhebungsdatum (`seit`).
// Fehlt eine davon, bleibt es bei der alten, strengen Regel: verwerfen und als
// Kollision bzw. Alias-Notiz ausweisen (§6.7 — nie still raten). Die
// Sabotage-Probe dazu steht im Unit-Test: zwei Einträge auf derselben
// SR-Nummer OHNE deklarierte Aufhebung ergeben KEINE Reihe.
//
// KEINE ZWEITE WAHRHEIT (§5). Die Abfolge wird nirgends neu gepflegt: sie
// entsteht aus dem ERLASS_REGISTER (das `aufhebungen.ts` bereits einmergt) und
// der ELI→key-Zuordnung aus `erlassAdresse.ts`. Wer einen Erlass total
// revidiert, ergänzt eine Zeile in `aufhebungen.ts` — die Norm-Key-Auflösung
// zieht ohne weiteren Handgriff nach.

/** Eine Fassungs-Reihe in einem SR-Slot: die geltende Fassung plus ihre
 *  aufgehobenen Vorgängerinnen mit dem amtlichen Aufhebungsdatum (`bis`).
 *  `bis` ist EXKLUSIV — `datum < bis` fällt in die Geltungszeit dieser
 *  Fassung, `datum >= bis` in die der Nachfolgerin (am Aufhebungstag tritt die
 *  neue Fassung in Kraft). */
export interface FassungsReihe {
  /** Register-key der heute geltenden Fassung. */
  geltend: string;
  /** Aufgehobene Vorgängerinnen, aufsteigend nach `bis`. */
  historisch: ReadonlyArray<{ key: string; bis: string }>;
}

type RegEintrag = (typeof ERLASS_REGISTER)[number];

/**
 * Fassungs-Reihen je SR-Nummer. Parameter nur für die Sabotage-Probe des
 * Unit-Tests (§6.7) — der Produktpfad nimmt immer das echte Register und die
 * echte ELI-Zuordnung.
 */
export function fassungsReihen(
  register: ReadonlyArray<RegEintrag> = ERLASS_REGISTER,
  eliZuKey: (eli: string) => string | null = erlassKeyVonEli,
): Map<string, FassungsReihe> {
  const jeSr = new Map<string, RegEintrag[]>();
  for (const e of register) {
    if (e.ebene !== 'bund' || !e.sr) continue;
    const liste = jeSr.get(e.sr);
    if (liste) liste.push(e); else jeSr.set(e.sr, [e]);
  }
  const raus = new Map<string, FassungsReihe>();
  for (const [sr, gruppe] of jeSr) {
    if (gruppe.length < 2) continue;                                  // (1)
    const geltende = gruppe.filter((e) => !e.aufgehoben);
    if (geltende.length !== 1) continue;                              // (2)
    const inGruppe = new Set(gruppe.map((e) => e.key));
    const historisch: Array<{ key: string; bis: string }> = [];
    let vollstaendig = true;
    for (const a of gruppe.filter((e) => e.aufgehoben)) {
      const auf = a.aufgehoben;
      const nachfolger = auf?.nachfolger ? eliZuKey(auf.nachfolger.eli) : null;
      if (!auf?.seit || !nachfolger || !inGruppe.has(nachfolger)) {    // (3)+(4)
        vollstaendig = false;
        break;
      }
      historisch.push({ key: a.key, bis: auf.seit });
    }
    if (!vollstaendig) continue;
    historisch.sort((x, y) => (x.bis < y.bis ? -1 : x.bis > y.bis ? 1
      : x.key < y.key ? -1 : x.key > y.key ? 1 : 0));
    raus.set(sr, { geltend: geltende[0].key, historisch });
  }
  return raus;
}

export const FASSUNGS_REIHEN = fassungsReihen();

/** Register-key → seine Fassungs-Reihe (geltende UND historische Fassungen). */
export const REIHE_JE_KEY: ReadonlyMap<string, FassungsReihe> = (() => {
  const m = new Map<string, FassungsReihe>();
  for (const r of FASSUNGS_REIHEN.values()) {
    m.set(r.geltend, r);
    for (const h of r.historisch) m.set(h.key, r);
  }
  return m;
})();

/** Gehören ZWEI keys derselben Fassungs-Reihe? Dann ist ihr gemeinsames Kürzel
 *  keine Kollision, sondern eine zeitliche Abfolge. Sonst null. */
export function reiheFuerPaar(a: string, b: string): FassungsReihe | null {
  const ra = REIHE_JE_KEY.get(a);
  return ra !== undefined && ra === REIHE_JE_KEY.get(b) ? ra : null;
}

/**
 * Die erkannten Fassungs-Reihen als lesbarer Beleg — heute genau eine:
 * `SR 412.103.1: BMV_2025 (geltend) ← BMV bis 2026-03-01`.
 *
 * Sichtbar statt still (§6.7): eine Reihe ENTSCHÄRFT die Kollisionsregel für
 * genau ein Kürzel. Wächst die Liste unbemerkt, wächst unbemerkt auch die
 * Menge der Kürzel, die nicht mehr beidseitig verworfen werden. Der Unit-Test
 * schreibt sie exakt fest, das Tor `check:normkeys` weist sie informativ aus.
 */
export const ERLASS_FASSUNGS_REIHEN: ReadonlyArray<string> = [...FASSUNGS_REIHEN]
  .map(([sr, r]) => `SR ${sr}: ${r.geltend} (geltend) ← `
    + r.historisch.map((h) => `${h.key} bis ${h.bis}`).join(' ← '))
  .sort();

/**
 * Das Datum, an dem die Fassungs-Wahl eines Snapshots hängt: sein
 * Entscheiddatum. Rein (§2) — kein `Date.now()`, kein Fallback auf «heute».
 *
 * PLATZHALTER-DATEN, ehrlich benannt (§8). Trägt ein Snapshot
 * `datumUnbekannt`, ist `datum` ein deterministischer Platzhalter aus dem
 * Geschäftsnummer-Jahr (`<GN-Jahr>-01-01`). Für die Fassungs-Wahl zählt nur die
 * EPOCHE des Entscheids, und die trifft der Platzhalter: ein Entscheid mit
 * GN-Jahr 2019 liegt in der Geltungszeit der Fassung von 2009, gleich an
 * welchem Tag des Jahres er erging. BENANNTE RESTUNSCHÄRFE: fällt ein
 * Aufhebungsdatum MITTEN in das GN-Jahr eines datumsunbekannten Entscheids
 * (hier: irgendwann 2026), kann der Platzhalter auf die falsche Seite der
 * Grenze fallen. Der Alternativweg — bei unbekanntem Datum die heute geltende
 * Fassung nehmen — wäre in derselben Lage nicht genauer, sondern systematisch
 * falsch für den ganzen historischen Bestand. Darum der Platzhalter, mit dieser
 * Grenze im Text statt im Verborgenen.
 */
export function fassungsDatumVon(snap: EntscheidSnapshot): string | null {
  return snap.datum || null;
}
