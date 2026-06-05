// ─── Juristische Obergruppen der 17 Rechtsgebiete (Pro-Katalog, Phase 2) ─────
//
// EINE umstellbare Konstante (Auftrag 5.6.2026): Die oberste Navigations-
// ebene bleibt das Rechtsgebiet; diese Gruppen sind die sichtbare Landkarte
// darüber (Seitenleiste + Super-Trenner im Strom). Die `gebiete`-Strings
// entsprechen EXAKT den `rechtsgebiet`-Werten der Katalog-Config – der
// Vollständigkeitstest sichert beide Modelle gegen verwaiste Gebiete ab.

// Schalter: 'fuenf' (juristisch sauber, empfohlen) | 'vier' (Fallback,
// ZPO/SchKG unter Privatrecht subsumiert)
export const GRUPPEN_MODELL: 'fuenf' | 'vier' = 'fuenf';

export interface RechtsbereichGruppe {
  id: string;
  label: string;
  gebiete: string[];
}

// 5er-Modell – EMPFOHLEN: löst die ZPO/SchKG-Zuordnung ehrlich (eigene
// Verfahrens-/Vollstreckungsgruppe) und bildet die anwaltliche Trennung
// materiell/prozessual ab.
const GRUPPEN_FUENF: RechtsbereichGruppe[] = [
  // Reihenfolge: Zivilprozess zuerst (Wunsch David 5.6.2026 — die
  // Fristen-/Vollstreckungswerkzeuge sind der häufigste Pro-Einstieg)
  { id: 'zivil-prozess', label: 'Zivilprozess & Vollstreckung',
    gebiete: ['Zivilprozess (ZPO) & Bundesgericht', 'Betreibung & Konkurs (SchKG)'] },
  { id: 'zivil-materiell', label: 'Zivilrecht (materiell)',
    gebiete: ['Arbeit', 'Miete', 'Vertrag & Forderung (OR)', 'Erbrecht',
              'Familienrecht', 'Vorsorge & Erwachsenenschutz', 'Gesellschaftsrecht'] },
  { id: 'straf', label: 'Strafrecht & Strafprozess',
    gebiete: ['Strafrecht & Strafprozess'] },
  { id: 'oeffentlich', label: 'Öffentliches Recht',
    gebiete: ['Verwaltungsrecht', 'Steuerrecht', 'Sozialversicherungsrecht',
              'Datenschutzrecht', 'Ausländerrecht'] },
  { id: 'uebergreifend', label: 'Übergreifend',
    gebiete: ['Weitere Rechtsgebiete', 'Übergreifende Werkzeuge'] },
];

// 4er-Modell – Fallback
const GRUPPEN_VIER: RechtsbereichGruppe[] = [
  { id: 'privat', label: 'Privatrecht',
    gebiete: ['Zivilprozess (ZPO) & Bundesgericht', 'Betreibung & Konkurs (SchKG)',
              'Arbeit', 'Miete', 'Vertrag & Forderung (OR)', 'Erbrecht',
              'Vorsorge & Erwachsenenschutz', 'Familienrecht', 'Gesellschaftsrecht'] },
  { id: 'oeffentlich', label: 'Öffentliches Recht',
    gebiete: ['Verwaltungsrecht', 'Steuerrecht', 'Sozialversicherungsrecht',
              'Datenschutzrecht', 'Ausländerrecht'] },
  { id: 'straf', label: 'Strafrecht & Strafprozess',
    gebiete: ['Strafrecht & Strafprozess'] },
  { id: 'uebergreifend', label: 'Übergreifend',
    gebiete: ['Weitere Rechtsgebiete', 'Übergreifende Werkzeuge'] },
];

export const ALLE_GRUPPEN_MODELLE = { fuenf: GRUPPEN_FUENF, vier: GRUPPEN_VIER } as const;

export const RECHTSBEREICH_GRUPPEN: RechtsbereichGruppe[] =
  GRUPPEN_MODELL === 'fuenf' ? GRUPPEN_FUENF : GRUPPEN_VIER;
