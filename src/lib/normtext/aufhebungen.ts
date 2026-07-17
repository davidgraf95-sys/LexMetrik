// ─── Anerkannte Ganz-Aufhebungen: Single Source of Truth ─────────────────────
//
// Ein Erlass kann von Fedlex GANZ aufgehoben werden (jolux:dateNoLongerInForce
// auf der ConsolidationAbstract). Der Snapshot bleibt als HISTORISCHE Fassung
// nutzbar — Juristinnen brauchen aufgehobene Fassungen —, darf aber NIE mehr als
// geltend dargestellt werden (§8: ehrliche Quelle). Diese Datei deklariert je
// aufgehobenem Erlass:
//   • das amtliche Aufhebungsdatum (jolux:dateNoLongerInForce),
//   • den optionalen Nachfolge-Erlass (kann dieselbe SR-Nummer, aber eine NEUE
//     ELI tragen — Schweizer Totalrevision),
//   • einen Beleg (amtliche Quelle + Verifikationsstand).
//
// ZWEI Konsumenten, EINE Quelle (§5):
//   1. PRODUKT — register.ts merged `aufgehoben` (seit+nachfolger) in den
//      Registereintrag; der Generator projiziert es nach register.json, Reader
//      (Status-Banner) und Katalog (Aufgehoben-Badge) zeigen es.
//   2. CHECK — check:fedlex-versionen kennt die «anerkannte Aufhebung»: ein
//      deklarierter Repeal ist ein EHRLICHES OK (bewusst historisch geführt),
//      ein UNDEKLARIERTER Repeal bleibt ROT (Sinn von G-AUFH, PR #285). Generisch:
//      nächste Aufhebung = nur hier einen Eintrag ergänzen.
//
// Reine Daten (§3), Leaf-Modul (importiert NICHTS aus register/browse — kein
// Zyklus). Belegpflicht (§7): jedes Datum gegen die amtliche Fedlex-Quelle
// verifiziert, Stand im `quelle`-Feld.

/** Nachfolge-Erlass eines aufgehobenen Erlasses. `eli` ist der ELI-Pfad im
 *  cache.sh-Format (`cc/2025/408`) — die SR-Nummer KANN identisch sein
 *  (Totalrevision behält den SR-Slot, neue ELI). */
export interface AufhebungsNachfolger {
  /** SR-Nummer des Nachfolgers (kann == der des aufgehobenen Erlasses sein). */
  sr: string;
  /** Volltitel des Nachfolge-Erlasses (amtlich). */
  titel: string;
  /** ELI-Pfad des Nachfolgers, `cc/JJJJ/NNN` (ohne Sprache/Datum). */
  eli: string;
}

/** Aufhebungs-Vermerk am Registereintrag/Browse-Erlass — genau die Felder aus
 *  §8-Auftrag (aufgehobenSeit + optional nachfolger). Additiv, minimal-invasiv. */
export interface ErlassAufhebung {
  /** ISO `YYYY-MM-DD`: amtliches Aufhebungsdatum (jolux:dateNoLongerInForce). */
  seit: string;
  /** Optionaler Nachfolge-Erlass. */
  nachfolger?: AufhebungsNachfolger;
}

/** Deklarierter, ANERKANNTER Repeal (SSoT-Zeile): trägt zusätzlich die Identität
 *  (key/sr/eli des aufgehobenen Erlasses) für Register- UND Check-Lookup sowie
 *  den Beleg. */
export interface AnerkannteAufhebung extends ErlassAufhebung {
  /** Register-key == Snapshot-Datei-Stamm ('BMV'). */
  key: string;
  /** SR-Nummer des AUFGEHOBENEN Erlasses. */
  sr: string;
  /** ELI-Pfad des aufgehobenen Erlasses, `cc/JJJJ/NNN` (== cache.sh-Pin). */
  eli: string;
  /** Beleg: amtliche Quelle + Verifikationsstand (§7, doppelt verifiziert). */
  quelle: string;
}

// ── Die Deklaration. Nächste Aufhebung: hier EINE Zeile ergänzen. ─────────────
export const ANERKANNTE_AUFHEBUNGEN: readonly AnerkannteAufhebung[] = [
  {
    key: 'BMV',
    sr: '412.103.1',
    eli: 'cc/2009/423',
    seit: '2026-03-01',
    nachfolger: {
      sr: '412.103.1', // Totalrevision — gleicher SR-Slot, neue ELI
      titel:
        'Verordnung vom 13. Juni 2025 über die eidgenössische Berufsmaturität (Berufsmaturitätsverordnung, BMV)',
      eli: 'cc/2025/408',
    },
    quelle:
      'Fedlex SPARQL: cc/2009/423 jolux:dateNoLongerInForce=2026-03-01, inForceStatus=enforcement-status/3 «Nicht mehr in Kraft». Nachfolge cc/2025/408 (AKN-preface <docNumber>412.103.1</docNumber>, jolux:dateEntryInForce=2026-03-01, Taxonomie-Slot 6599). Live verifiziert 2026-07-18.',
  },
];

const NACH_KEY = new Map(ANERKANNTE_AUFHEBUNGEN.map((a) => [a.key, a]));
const NACH_ELI = new Map(ANERKANNTE_AUFHEBUNGEN.map((a) => [a.eli, a]));

/** Anerkannte Aufhebung nach Register-key ('BMV'), sonst undefined. */
export function anerkannteAufhebungNachKey(key: string): AnerkannteAufhebung | undefined {
  return NACH_KEY.get(key);
}

/** Anerkannte Aufhebung nach ELI-Pfad ('cc/2009/423'), sonst undefined. Der
 *  Currency-Check keyt auf ELI (cache.sh-Pin). */
export function anerkannteAufhebungNachEli(eli: string): AnerkannteAufhebung | undefined {
  return NACH_ELI.get(eli);
}

/** Der Register-/Browse-Vermerk (seit + nachfolger) für einen key, sonst
 *  undefined. Strippt Identität/Beleg — genau die additiven Schema-Felder. */
export function aufhebungFuerRegister(key: string): ErlassAufhebung | undefined {
  const a = NACH_KEY.get(key);
  if (!a) return undefined;
  return a.nachfolger ? { seit: a.seit, nachfolger: a.nachfolger } : { seit: a.seit };
}
