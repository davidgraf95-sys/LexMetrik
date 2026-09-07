/**
 * ZH-4c · Systematik der Zürcher Gesetzessammlung, Ebene 1 (14 Ordner).
 *
 * QUELLE (amtlich, browserlos, Abruf 31.8.2026):
 *   https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung.html
 * Die Suchseite ist SERVER-gerendert; die 14 Ordner stehen dort als
 * `name="fileNumber"`-Auswahltabelle mit den Spalten «Nr. | Ordnungsnummer |
 * Thema». Nummernband und Thema sind aus genau diesen beiden Tabellenspalten
 * WÖRTLICH übernommen (§7).
 *
 * WARUM STATISCH UND NICHT ÜBER DIE API (§7, Quell-Wahl):
 * ZH hat keine clex/LexWork-Instanz — `GET /api/de/systematic_categories`
 * existiert auf www.zh.ch nicht (Dossier §7). Der einzige maschinell greifbare
 * Systematik-Träger ist diese server-gerenderte Auswahl. Ebene 2 ist maschinell
 * NICHT greifbar (Dossier §3); darum bleibt `sub` leer, statt eine
 * Feingliederung zu erfinden (§8).
 *
 * WÖRTLICHKEIT — bewusst nicht «korrigiert» (Präzedenz BS-«·»-Befund
 * 23.6.2026): die amtliche Quelle schreibt vier Themen ohne Wortzwischenraum
 * («PolitischeRechte», «SchuldbetreibungundKonkurs», «WaldundJagd»,
 * «IndustrieundGewerbe»). Das ist eine Eigenheit der Quelle, kein Lesefehler —
 * beide Träger (Radio-`placeholder` UND die sichtbare Tabellenzelle) führen
 * denselben Text. Ein hier eingesetztes Leerzeichen wäre eine zweite Wahrheit
 * (§5/§7); eine Korrektur müsste bei der amtlichen Stelle erfolgen.
 *
 * ZUORDNUNG ERLASS → ORDNER (§2 deterministisch): über das Nummernband der
 * dreistelligen Hauptnummer der LS-Ordnungsnummer («131.1» → 131 → Ordner 1).
 * Keine Titel-Heuristik. Die Bänder sind disjunkt und monoton; eine Hauptnummer
 * ausserhalb aller Bänder bekommt keinen Eintrag und fällt in der UI auf den
 * neutralen «Bereich N» zurück (§8) — besser als eine geratene Einordnung.
 */

export interface ZhOrdner {
  /** Ordner-Nummer 1…14 (Spalte «Nr.»). */
  nummer: string;
  /** Thema, wörtlich aus der Spalte «Thema». */
  name: string;
  /** Nummernband der Hauptnummer, wörtlich aus der Spalte «Ordnungsnummer». */
  von: number;
  bis: number;
}

export const ZH_ORDNER: readonly ZhOrdner[] = [
  { nummer: '1', name: 'Verfassung - Kantonsgebiet - Gemeinden - Bürgerrecht - PolitischeRechte - Behörden', von: 101, bis: 176 },
  { nummer: '2', name: 'Staatspersonal - Kirchen - Religionsgemeinschaften', von: 177, bis: 184 },
  { nummer: '3', name: 'Gerichtsorganisation - Zivilrecht - Notariat - Grundbuch', von: 211, bis: 255 },
  { nummer: '4', name: 'SchuldbetreibungundKonkurs - Strafrecht - Strafvollzug - Opferhilfe - Gewaltschutz', von: 281, bis: 351 },
  { nummer: '5', name: 'Bildung - Volksschule', von: 410, bis: 412 },
  { nummer: '6', name: 'Mittelschulen - Berufsbildung', von: 413, bis: 413 },
  { nummer: '7', name: 'Fachhochschulen', von: 414, bis: 414 },
  { nummer: '8', name: 'Universität - Dokumentation - Kultur', von: 415, bis: 440 },
  { nummer: '9', name: 'Militär - Bevölkerungsschutz - Polizei', von: 511, bis: 554 },
  { nummer: '10', name: 'Finanzhaushalt - Steuern - Gebühren', von: 611, bis: 691 },
  { nummer: '11', name: 'Raumplanung - Baurecht - Umweltschutz', von: 700, bis: 715 },
  { nummer: '12', name: 'Beschaffungswesen - Strassen - Wasserwirtschaft - Energie - Verkehr - Enteignung', von: 720, bis: 782 },
  { nummer: '13', name: 'Gesundheit - Arbeit - Sozialversicherung - Fürsorge', von: 810, bis: 857 },
  { nummer: '14', name: 'Feuerpolizei - Landwirtschaft - WaldundJagd - IndustrieundGewerbe - Handel - Banken', von: 861, bis: 954 },
];

/**
 * Baut den ZH-Eintrag für `public/normtext/kanton-systematik.json`.
 *
 * Index-Schlüssel: ZH-Erlasse tragen im Register die systematische Nummer als
 * «LS 131.1» → `systematikSchluessel` liefert den Namespace-Schlüssel
 * «LS#1311». Der Lookup (`sachgruppe`) kürzt den Ziffernteil schrittweise, also
 * greift der Eintrag «LS#131». Weil die 14 Ordner NUMMERNBÄNDER sind und keine
 * Präfixe, wird jede Hauptnummer des Bandes einzeln indiziert (577 Einträge) —
 * ein Präfix-Eintrag würde Bandgrenzen wie 176/177 oder 691/700 überdecken.
 *
 * §2: rein und deterministisch (keine Reihenfolge-Abhängigkeit, keine Zeit).
 */
export function baueZhSystematik(): {
  roots: Array<{ nummer: string; name: string; kinder: Array<{ nummer: string; name: string }> }>;
  index: Record<string, [string, string]>;
} {
  const index: Record<string, [string, string]> = {};
  for (const o of ZH_ORDNER) {
    for (let n = o.von; n <= o.bis; n++) {
      // Ebene 2 ist maschinell nicht belegt → sub bleibt leer (§8).
      index[`LS#${n}`] = [o.nummer, ''];
    }
  }
  return {
    roots: ZH_ORDNER.map((o) => ({ nummer: o.nummer, name: o.name, kinder: [] })),
    index,
  };
}
