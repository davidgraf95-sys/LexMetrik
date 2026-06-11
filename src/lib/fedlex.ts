// Dossier: bibliothek/register/quellen-register.md
// ─── Fedlex-Verlinkung (verifizierte Anker) ───────────────────────────────
//
// Verifizierte Fedlex-Basis-URLs (Systematische Rechtssammlung, konsolidierte,
// in Kraft stehende Fassung, Sprache de). Kein ?version=-Parameter, damit der
// Link stets die geltende Fassung auflöst.
// SR 220 OR · SR 210 ZGB · SR 272 ZPO · SR 281.1 SchKG · SR 822.11 ArG ·
// SR 312.0 StPO · SR 172.021 VwVG

export const FEDLEX = {
  OR:    'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de',
  ZGB:   'https://www.fedlex.admin.ch/eli/cc/24/233_245_233/de',
  ZPO:   'https://www.fedlex.admin.ch/eli/cc/2010/262/de',
  SchKG: 'https://www.fedlex.admin.ch/eli/cc/11/529_488_529/de',
  // ArG: Anker art_9/art_12/art_13/art_46 empirisch gegen das konsolidierte
  // Filestore-HTML verifiziert (Konsolidierung 20230901; geprüft 5.6.2026).
  ArG:   'https://www.fedlex.admin.ch/eli/cc/1966/57_57_57/de',
  // VMWG SR 221.213.11 – ELI via Fedlex-SPARQL verifiziert; Anker art_16/17/
  // 19/19a empirisch am Filestore-HTML (Konsolidierung 20251001; 5.6.2026 —
  // diese Notiz war korrekt: die zwischenzeitliche «19a existiert nicht»-
  // Diskrepanz [5./6.6.] beruhte auf dem 20250101-Cache; aufgelöst 7.6.2026,
  // 20251001 liegt als n=0-Datei, jetzt regulär gepinnt).
  VMWG:  'https://www.fedlex.admin.ch/eli/cc/1990/835_835_835/de',
  // StPO SR 312.0 – Anker art_129 empirisch am Filestore-HTML verifiziert
  // (Konsolidierung 20240101; geprüft 5.6.2026, Vollmacht-Vorlage).
  StPO:  'https://www.fedlex.admin.ch/eli/cc/2010/267/de',
  // VwVG SR 172.021 – Anker art_11 empirisch am Filestore-HTML verifiziert
  // (Konsolidierung 20210101; geprüft 5.6.2026, Vollmacht-Vorlage).
  VwVG:  'https://www.fedlex.admin.ch/eli/cc/1969/737_757_755/de',
  // VVG SR 221.229.1 – Anker art_35_a/35_b/35_c sowie art_97/98 empirisch am
  // Filestore-HTML verifiziert (Konsolidierung 20240101 = neuste abrufbare;
  // geprüft 6.6.2026, Kündigungs-Maske 3: 35a halbzwingend [98], 35b/35c
  // absolut zwingend [97], Lebensversicherung ausgenommen [35a Abs. 3]).
  VVG:   'https://www.fedlex.admin.ch/eli/cc/24/719_735_717/de',
  // HRegV SR 221.411 – Anker art_20/24_a/43/44/45/71/72/117 empirisch am
  // Filestore-HTML verifiziert (Konsolidierung 20250101 = neuste abrufbare,
  // 1.7.2025/1.1.2026 existieren nicht; geprüft 6.6.2026, Gründungs-Masken;
  // Dossiers bibliothek/recherche/gesellschaftsgruendung.md + gmbh-/ag-…).
  HRegV: 'https://www.fedlex.admin.ch/eli/cc/2007/686/de',
  // GebV SchKG SR 281.35 — ELI via Fedlex-SPARQL verifiziert; Anker art_16/
  // 20/30/48 etc. empirisch am Filestore-HTML (Konsolidierung 20260101 =
  // neuste, keine künftige Fassung; geprüft 7.6.2026, Betreibungskosten-
  // Rechner; Dossier bibliothek/recherche/gebv-schkg-kostenrechner.md).
  GebVSchKG: 'https://www.fedlex.admin.ch/eli/cc/1996/2937_2937_2937/de',
  // BGG SR 173.110 — Cache gepinnt (fedlex-cache.sh, Konsolidierung 20260401);
  // Anker art_42–art_119 empirisch verifiziert (11.6.2026, BGer-Rechtsweg;
  // Dossier bibliothek/recherche/bgg-beschwerde-engine.md).
  BGG:   'https://www.fedlex.admin.ch/eli/cc/2006/218/de',
  // BGerR SR 173.110.131 — Cache gepinnt 11.6.2026 (Konsolidierung 20260201,
  // Filestore NUR ohne -N-Suffix); Anker art_33/34/35/35_a/36 zeichengenau
  // verifiziert (rechtsmittel-spruchkoerper-kantone.md §3).
  BGerR: 'https://www.fedlex.admin.ch/eli/cc/2006/834/de',
} as const;

export type FedlexGesetz = keyof typeof FEDLEX;

// Anker '#art_<nummer>'. Buchstaben-Artikel nutzen das Fedlex-Unterstrich-
// Format: 335c → #art_335_c, 334bis → #art_334_bis (empirisch gegen die
// id="art_…"-Anker des konsolidierten Filestore-HTML, Stand 20250101,
// verifiziert – Varianten ohne Unterstrich existieren dort NICHT).
// Spannen-/Folgeverweise (–, f., ff.) verlinken den führenden Artikel.
// Audit 5.6.2026: auch Kombi-Anker Buchstabe+lat. Suffix abgedeckt —
// im OR real: 329gbis/663bbis/697hbis → art_329_g_bis (Form n_b_suffix).
const SUFFIX = /^(\d+)([a-z])?(bis|ter|quater|quinquies)?$/;

export function fedlexUrl(gesetz: FedlexGesetz, artikel: string | number): string {
  const token = String(artikel).toLowerCase().replace(/\s+/g, '')
    .replace(SUFFIX, (_, n, b, suf) => [n, b, suf].filter(Boolean).join('_'));
  return `${FEDLEX[gesetz]}#art_${token}`;
}

// Mehrwort-Gesetzesnamen → Registry-Key. Nötig, weil der generische Matcher
// nur das LETZTE Token vergleicht: «Art. 16 GebV SchKG» endete sonst auf
// «SchKG» und verlinkte Art. 16 der HAUPT-SchKG (SR 281.1) statt der
// Gebührenverordnung (SR 281.35) — Code-Review-Befund #1, 7.6.2026.
// Aliase werden VOR dem Token-Match geprüft.
const MEHRWORT_ALIAS: ReadonlyArray<[string, FedlexGesetz]> = [
  ['GebV SchKG', 'GebVSchKG'],
];

// Direktlink aus einem Normverweis-Text, z. B. 'Art. 335c Abs. 1 OR' →
// OR-Basis + #art_335_c. Absatz-/Ziffer-Angaben ändern den Anker nicht;
// massgeblich ist der führende Artikel.
//
// Fallback (Normentreue, nie auf geratene Anker verlinken):
// - Schlusstitel (SchlT): eigener Nummernkreis, Anker nicht deterministisch →
//   Gesetzes-Seite ohne Anker.
// - Unbekanntes Gesetz → null (kein Link).
export function fedlexLinkFuerArtikel(text: string): string | null {
  const bereinigt = text.trim();
  const alias = MEHRWORT_ALIAS.find(([name]) => bereinigt.endsWith(name));
  const gesetz = alias?.[1]
    ?? (Object.keys(FEDLEX) as FedlexGesetz[]).find((g) => new RegExp(`(^|\\s)${g}$`).test(bereinigt));
  if (!gesetz) return null;
  if (/\bSchlT\b/.test(text)) return FEDLEX[gesetz];
  // Bug-Check 10.6.2026 (NIEDRIG): Buchstabe UND lat. Suffix kombinierbar
  // (329gbis/663bbis/697hbis) — vorher matchte der Extraktor solche Artikel
  // gar nicht und lieferte die Gesetzes-URL ohne Anker.
  const m = text.match(/^Art\.\s*(\d+[a-z]?(?:bis|ter|quater|quinquies)?)\b/);
  return m ? fedlexUrl(gesetz, m[1]) : FEDLEX[gesetz];
}
