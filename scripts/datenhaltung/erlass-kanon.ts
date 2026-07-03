// scripts/datenhaltung/erlass-kanon.ts
// QS-DATA E4 · Q4-Vorbedingung: law-code-Kanonisierung. Rein, deterministisch, DB-frei
// (CLAUDE.md §2). Bildet die MEHRSPRACHIGEN Gesetzes-Kürzel der voilaj-`law_code`s
// (DE/FR/IT) auf UNSERE `erlasse.key`-Namensräume (src/lib/normtext/register.ts) ab.
//
// WARUM: `norm_referenzen.erlass_key` trägt den Roh-`law_code` — derselbe Erlass steht
// mehrsprachig getrennt (IVG/LAI, UVG/LAA/LAINF, OR/CO, ZGB/CC, StGB/CP, ZPO/CPC …).
// Ohne Kanonisierung zerfiele die topische In-degree je Artikel in Sprach-Silos; die
// Vereinigung ist der ganze Zweck (Gegenprüfungs-Befund Q4, e3-lokal-2026-07-03.md §8).
//
// BELEG (§7/§11): jede Gruppe trägt die AMTLICHE SR-Nummer; der Unit-Test
// (erlass-kanon.test.ts) prüft für JEDE Gruppe, dass ERLASS_REGISTER einen Eintrag mit
// `key` === Gruppen-key UND `sr` === Gruppen-sr führt (die SR-Nummer ist die Klammer,
// die die mehrsprachigen Kürzel EINES Erlasses zusammenhält — sie ist amtlich eindeutig).
//
// §8/§1 — NIE raten: mehrdeutige Kürzel bleiben UNGEMAPPT (Rest = unresolved, legitim):
//   • «StG»  = eidg. Stempelsteuer (641.10) ODER kant. Steuergesetz → schon in der
//     norm-index-Semantik ausgeschlossen (AMBIGE_BUND_KANTON_KUERZEL).
//   • «LASI» = fr. «LAsi» (AsylG) ODER kant. GE «Loi sur l'insertion et l'aide sociale
//     individuelle» → NICHT gemappt (AsylG deckt der eindeutige Code «ASYLG» ab).
//   • Kantonale Prozessgesetze (LPA, VRPG, LOJ, OG/OJ …) und aufgehobenes Bundesrecht
//     (OG/OJ = altes OG/Bundesrechtspflege ≠ BGG) bleiben unresolved — anderer Erlass (§1).

/** Kanon-Gruppe: EIN Register-key + seine amtliche SR-Nummer + die mehrsprachigen Kürzel. */
export interface KanonGruppe {
  /** Ziel-Namensraum = erlasse.key (uppercase, wie ERLASS_REGISTER.key). */
  key: string;
  /** Amtliche SR-Nummer (Beleg; Test verankert sie gegen ERLASS_REGISTER). */
  sr: string;
  /** DE/FR/IT-Kürzel dieses Erlasses (roh, wie im voilaj-law_code; werden normalisiert). */
  codes: string[];
}

// Gruppen nach Register-key. Reihenfolge belanglos (Lookup baut eine Map). Kommentar =
// Sprachzuordnung der Aliase. Aufgenommen sind die im Bundeskorpus volumenrelevanten,
// EINDEUTIG bundesrechtlichen Kürzel (empirische Top-Erhebung aus norm_referenzen,
// e4-lokal-2026-07-03.md §1). Erweiterbar; jede neue Zeile braucht die SR-Beleg-Zeile.
export const KANON_GRUPPEN: readonly KanonGruppe[] = [
  // ── Privatrecht ──
  { key: 'OR', sr: '220', codes: ['OR', 'CO'] },                       // CO = fr+it
  { key: 'ZGB', sr: '210', codes: ['ZGB', 'CC'] },                     // CC = fr+it
  { key: 'VVG', sr: '221.229.1', codes: ['VVG', 'LCA'] },              // LCA = fr+it
  { key: 'URG', sr: '231.1', codes: ['URG', 'LDA'] },                  // LDA = fr+it
  { key: 'MSCHG', sr: '232.11', codes: ['MSchG', 'LPM'] },             // LPM = fr+it
  { key: 'PATG', sr: '232.14', codes: ['PatG', 'LBI'] },               // LBI = fr+it
  { key: 'FUSG', sr: '221.301', codes: ['FusG', 'LFus'] },
  { key: 'IPRG', sr: '291', codes: ['IPRG', 'LDIP'] },                 // LDIP = fr+it
  // ── Strafrecht ──
  { key: 'STGB', sr: '311.0', codes: ['StGB', 'CP'] },                 // CP = fr+it (Code pénal / Codice penale)
  { key: 'STPO', sr: '312.0', codes: ['StPO', 'CPP'] },                // CPP = fr+it
  { key: 'BETMG', sr: '812.121', codes: ['BetmG', 'LStup'] },
  { key: 'IRSG', sr: '351.1', codes: ['IRSG', 'EIMP', 'AIMP'] },       // EIMP = fr, AIMP = it
  // ── Verfahren / Prozess ──
  { key: 'ZPO', sr: '272', codes: ['ZPO', 'CPC'] },                    // CPC = fr+it
  { key: 'BGG', sr: '173.110', codes: ['BGG', 'LTF'] },               // LTF = fr+it (loi sur le Tribunal fédéral)
  { key: 'VWVG', sr: '172.021', codes: ['VwVG', 'PA'] },              // PA = fr+it (procédure administrative)
  { key: 'VGG', sr: '173.32', codes: ['VGG', 'LTAF'] },              // LTAF = fr+it
  { key: 'VGKE', sr: '173.320.2', codes: ['VGKE', 'FITAF'] },
  // ── SchKG ──
  { key: 'SCHKG', sr: '281.1', codes: ['SchKG', 'LP', 'LEF'] },       // LP = fr, LEF = it
  // ── Öffentliches Recht ──
  { key: 'BV', sr: '101', codes: ['BV', 'Cst'] },                     // Cst = fr+it
  { key: 'SVG', sr: '741.01', codes: ['SVG', 'LCR', 'LCStr'] },       // LCR = fr, LCStr = it
  { key: 'DSG', sr: '235.1', codes: ['DSG', 'LPD'] },                 // LPD = fr+it
  { key: 'AIG', sr: '142.20', codes: ['AIG', 'LEI', 'LEtr', 'AuG', 'LStrI'] }, // AuG/LEtr = Vorläufer-/Alt-Kürzel desselben Erlasses (SR 142.20)
  { key: 'ASYLG', sr: '142.31', codes: ['AsylG'] },                  // fr «LAsi»/«LASI» bewusst NICHT (kant. GE-Kollision, s. Kopf)
  { key: 'KG', sr: '251', codes: ['KG', 'LCart'] },
  { key: 'UWG', sr: '241', codes: ['UWG', 'LCD'] },
  { key: 'RPG', sr: '700', codes: ['RPG', 'LAT'] },
  { key: 'USG', sr: '814.01', codes: ['USG', 'LPE'] },
  { key: 'BEWG', sr: '211.412.41', codes: ['BewG', 'LFAIE'] },
  { key: 'GWG', sr: '955.0', codes: ['GwG', 'LBA'] },
  { key: 'FINMAG', sr: '956.1', codes: ['FINMAG', 'LFINMA'] },
  { key: 'BANKG', sr: '952.0', codes: ['BankG', 'LB'] },
  { key: 'BGOE', sr: '152.3', codes: ['BGÖ', 'LTrans'] },
  // ── Sozialversicherung / Abgaben ──
  { key: 'ATSG', sr: '830.1', codes: ['ATSG', 'LPGA'] },             // LPGA = fr+it
  { key: 'IVG', sr: '831.20', codes: ['IVG', 'LAI'] },               // LAI = fr+it
  { key: 'IVV', sr: '831.201', codes: ['IVV', 'RAI'] },             // RAI = fr+it (règlement AI)
  { key: 'UVG', sr: '832.20', codes: ['UVG', 'LAA', 'LAINF'] },     // LAA = fr, LAINF = it
  { key: 'AVIG', sr: '837.0', codes: ['AVIG', 'LACI'] },           // LACI = fr+it
  { key: 'AHVG', sr: '831.10', codes: ['AHVG', 'LAVS'] },          // LAVS = fr+it
  { key: 'AHVV', sr: '831.101', codes: ['AHVV', 'RAVS'] },
  { key: 'BVG', sr: '831.40', codes: ['BVG', 'LPP'] },             // LPP = fr+it
  { key: 'FZG', sr: '831.42', codes: ['FZG', 'LFLP'] },            // LFLP = fr+it (libre passage)
  { key: 'ELG', sr: '831.30', codes: ['ELG', 'LPC'] },             // LPC = fr+it
  { key: 'AVIV', sr: '837.02', codes: ['AVIV', 'OACI'] },          // OACI = fr+it (ordonnance assurance-chômage)
  { key: 'VZAE', sr: '142.201', codes: ['VZAE', 'OASA'] },         // OASA = fr+it (admission/séjour)
  { key: 'GEBV_SCHKG', sr: '281.35', codes: ['GebVSchKG', 'OELP', 'OTLEF'] }, // OELP = fr, OTLEF = it (émoluments LP)
  { key: 'KVG', sr: '832.10', codes: ['KVG', 'LAMal'] },           // LAMal = fr+it
  { key: 'MVG', sr: '833.1', codes: ['MVG', 'LAM'] },
  { key: 'FAMZG', sr: '836.2', codes: ['FamZG', 'LAFam'] },
  { key: 'DBG', sr: '642.11', codes: ['DBG', 'LIFD'] },            // LIFD = fr+it
  { key: 'STHG', sr: '642.14', codes: ['StHG', 'LHID'] },          // LHID = fr+it
  { key: 'MWSTG', sr: '641.20', codes: ['MWSTG', 'LTVA', 'LIVA'] }, // LTVA = fr, LIVA = it
  { key: 'VSTG', sr: '642.21', codes: ['VStG', 'LIA', 'LIP'] },    // LIA = fr, LIP = it
  { key: 'ARG', sr: '822.11', codes: ['ArG', 'LTr'] },
  // ── Grund-/Menschenrechte (Staatsvertrag; Register-key EMRK, SR 0.101) ──
  { key: 'EMRK', sr: '0.101', codes: ['EMRK', 'CEDH', 'CEDU'] },   // CEDH = fr, CEDU = it
];

/** Normalform eines Kürzels für den Lookup: gross, nur A–Z0–9 (Whitespace/Punkte/Trenner weg). */
export function normCode(code: string | null | undefined): string {
  return String(code ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Lookup-Map (einmal aufgebaut). Kollisions-Guard: dasselbe normalisierte Kürzel darf nie
// zwei Register-keys tragen (sonst wäre die Zuordnung mehrdeutig — Bau-Fehler, laut werfen).
const CODE_ZU_KEY: ReadonlyMap<string, string> = (() => {
  const m = new Map<string, string>();
  for (const g of KANON_GRUPPEN) {
    for (const c of g.codes) {
      const nc = normCode(c);
      const vorhanden = m.get(nc);
      if (vorhanden && vorhanden !== g.key) {
        throw new Error(`erlass-kanon: Kürzel «${c}» (${nc}) mehrdeutig → ${vorhanden} und ${g.key}`);
      }
      m.set(nc, g.key);
    }
  }
  return m;
})();

/**
 * law_code (roh, beliebige Sprache) → kanonischer `erlasse.key` oder `null`.
 * `null` = kein bundesrechtlicher Register-Erlass (kantonal / aufgehoben / unbekannt) →
 * bleibt unresolved (§8, NIE raten). Deterministisch, rein.
 */
export function kanonErlassKey(law_code: string | null | undefined): string | null {
  return CODE_ZU_KEY.get(normCode(law_code)) ?? null;
}

/** Alle kanonisierbaren Register-keys (für Tests/Diagnostik). */
export function kanonisierteKeys(): string[] {
  return [...new Set(KANON_GRUPPEN.map((g) => g.key))].sort();
}
