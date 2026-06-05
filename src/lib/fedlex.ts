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
  // 19/19a empirisch am Filestore-HTML (Konsolidierung 20251001; 5.6.2026).
  VMWG:  'https://www.fedlex.admin.ch/eli/cc/1990/835_835_835/de',
  // StPO SR 312.0 – Anker art_129 empirisch am Filestore-HTML verifiziert
  // (Konsolidierung 20240101; geprüft 5.6.2026, Vollmacht-Vorlage).
  StPO:  'https://www.fedlex.admin.ch/eli/cc/2010/267/de',
  // VwVG SR 172.021 – Anker art_11 empirisch am Filestore-HTML verifiziert
  // (Konsolidierung 20210101; geprüft 5.6.2026, Vollmacht-Vorlage).
  VwVG:  'https://www.fedlex.admin.ch/eli/cc/1969/737_757_755/de',
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

// Direktlink aus einem Normverweis-Text, z. B. 'Art. 335c Abs. 1 OR' →
// OR-Basis + #art_335_c. Absatz-/Ziffer-Angaben ändern den Anker nicht;
// massgeblich ist der führende Artikel.
//
// Fallback (Normentreue, nie auf geratene Anker verlinken):
// - Schlusstitel (SchlT): eigener Nummernkreis, Anker nicht deterministisch →
//   Gesetzes-Seite ohne Anker.
// - Unbekanntes Gesetz → null (kein Link).
export function fedlexLinkFuerArtikel(text: string): string | null {
  const gesetz = (Object.keys(FEDLEX) as FedlexGesetz[]).find((g) => new RegExp(`(^|\\s)${g}$`).test(text.trim()));
  if (!gesetz) return null;
  if (/\bSchlT\b/.test(text)) return FEDLEX[gesetz];
  const m = text.match(/^Art\.\s*(\d+(?:bis|ter|quater|quinquies|[a-z])?)\b/);
  return m ? fedlexUrl(gesetz, m[1]) : FEDLEX[gesetz];
}
