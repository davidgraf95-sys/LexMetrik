// ─── Systematik des Bundesrechts (Auftrag David 20.6.2026) ──────────────────
//
// Eine FUNKTIONALE Gliederung statt der reinen SR-Nummernfolge: vom Fundament
// (Verfassung) über das Verhältnis Bürger↔Bürger (Privatrecht + dessen
// Durchsetzung) und Bürger↔Staat (Verwaltungsrecht) bis zum internationalen
// Rahmen. Vorbild: Davids «Systematik des Rechts».
//
// Reine ANZEIGE-Ordnung (kein Norminhalt, §7 unberührt): jede Untergruppe
// referenziert bestehende Register-Erlasse über ihren `key`. Erlasse, die hier
// (noch) nicht zugeordnet sind, fallen in der Gesetze-Seite in «Weitere
// Erlasse» — so geht nie ein Eintrag verloren. Praktikabilität: die geläufigen
// Leitgesetze stehen in den oberen Kategorien/Gruppen; selteneres weiter unten.

export interface SystematikGruppe {
  id: string;
  titel: string;
  /** Register-Keys (UPPERCASE wie in register.ts) in Anzeige-Reihenfolge. */
  keys: string[];
}

export interface SystematikKategorie {
  nr: string;        // '01' …
  id: string;
  titel: string;
  lede: string;
  /** Praktikabilität: die geläufigsten Kategorien sind anfangs offen. */
  standardOffen?: boolean;
  gruppen: SystematikGruppe[];
}

export const SYSTEMATIK: SystematikKategorie[] = [
  {
    nr: '01', id: 'staat', titel: 'Staats- und Verfassungsrecht',
    lede: 'Das Fundament der Rechtsordnung — alles Übrige fusst auf der Bundesverfassung.',
    gruppen: [
      { id: 'verfassung', titel: 'Verfassung & Bundesorgane', keys: ['BV', 'BGG', 'BGERR'] },
    ],
  },
  {
    nr: '02', id: 'privatrecht', titel: 'Privatrecht',
    lede: 'Das Verhältnis Bürger ↔ Bürger — Zivilgesetzbuch, Obligationenrecht und die privatrechtlichen Nebenerlasse.',
    standardOffen: true,
    gruppen: [
      { id: 'zgb', titel: 'Zivilgesetzbuch (ZGB) & Grundbuch', keys: ['ZGB', 'GBV'] },
      { id: 'or', titel: 'Obligationenrecht (OR) & Handelsregister', keys: ['OR', 'VMWG', 'HREGV', 'GEBV_HREG', 'FUSG'] },
      { id: 'ip', titel: 'Immaterialgüter & Wettbewerb', keys: ['URG', 'PATG', 'MSCHG', 'UWG', 'KG'] },
      { id: 'neben', titel: 'Weitere Privatrechtserlasse', keys: ['VVG', 'DSG', 'PARTG', 'BGBB'] },
    ],
  },
  {
    nr: '03', id: 'zivilverfahren', titel: 'Zivilprozess- und Zwangsvollstreckungsrecht',
    lede: 'Die Durchsetzung des Privatrechts — Zivilprozess und Schuldbetreibung/Konkurs.',
    standardOffen: true,
    gruppen: [
      { id: 'zpo', titel: 'Zivilprozess (ZPO)', keys: ['ZPO'] },
      { id: 'schkg', titel: 'Schuldbetreibung & Konkurs (SchKG)', keys: ['SCHKG', 'GEBV_SCHKG'] },
    ],
  },
  {
    nr: '04', id: 'straf', titel: 'Strafrecht und Strafverfahren',
    lede: 'Der staatliche Sanktionsanspruch — materielles Strafrecht und Strafprozess.',
    standardOffen: true,
    gruppen: [
      { id: 'stgb', titel: 'Strafrecht (StGB)', keys: ['STGB', 'MG'] },
      { id: 'stpo', titel: 'Strafverfahren', keys: ['STPO', 'JSTPO', 'JSTG'] },
    ],
  },
  {
    nr: '05', id: 'verwaltung', titel: 'Verwaltungsrecht',
    lede: 'Das Verhältnis Bürger ↔ Staat — der praktisch umfangreichste Ast: Verfahren, Steuern, Sozialversicherung, Migration, Bau/Umwelt, Finanzmarkt.',
    gruppen: [
      { id: 'verfahren', titel: 'Verwaltungsverfahren & Rechtspflege', keys: ['VWVG'] },
      { id: 'steuern', titel: 'Steuern & Abgaben', keys: ['DBG', 'STHG', 'MWSTG', 'VSTG', 'STG'] },
      { id: 'sozial', titel: 'Sozialversicherung', keys: ['AHVG', 'IVG', 'BVG', 'UVG', 'KVG', 'KVV', 'EOG', 'AVIG'] },
      { id: 'migration', titel: 'Migration & Gleichstellung', keys: ['AIG', 'ASYLG', 'GLG'] },
      { id: 'umwelt', titel: 'Raumplanung, Bau & Umwelt', keys: ['RPG', 'USG', 'GSCHG', 'NHG'] },
      { id: 'wirtschaft', titel: 'Wirtschaft & Finanzmarkt', keys: ['BANKG', 'KAG', 'GWG', 'BEWG'] },
      { id: 'sektoren', titel: 'Verkehr, Arbeit & Bildung', keys: ['SVG', 'ARG', 'BBG'] },
      { id: 'anwalt', titel: 'Anwaltsrecht', keys: ['BGFA'] },
    ],
  },
  {
    nr: '06', id: 'voelker', titel: 'Völker- und Europarecht',
    lede: 'Der internationale Rahmen — wirkt über Querverweise (EMRK u. a.) in die nationalen Äste hinein.',
    gruppen: [
      { id: 'menschenrechte', titel: 'Menschenrechte', keys: ['EMRK'] },
    ],
  },
];

/** Key → [Kategorie-id, Gruppen-id] für schnelle Zuordnung; mehrfach genannte
 *  Keys nehmen die ERSTE Nennung (Primär-Einordnung). */
export const SYSTEMATIK_VON_KEY: ReadonlyMap<string, { kat: string; gruppe: string }> = (() => {
  const m = new Map<string, { kat: string; gruppe: string }>();
  for (const k of SYSTEMATIK) for (const g of k.gruppen) for (const key of g.keys) {
    if (!m.has(key)) m.set(key, { kat: k.id, gruppe: g.id });
  }
  return m;
})();
