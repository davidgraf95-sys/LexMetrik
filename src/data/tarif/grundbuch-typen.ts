// ─── Eintragungsart-Taxonomie der Grundbuchgebühren ─────────────────────────
//
// FAHRPLAN-BEURKUNDUNGS-AUSBAU (Direktive David 15.6.2026: «alle Arten von
// Grundbuchgebühren»; Engines dürfen getrennt werden). Diese Datei deklariert
// die Eintragungsart-Dimension der Grundbuchgebühr – getrennt vom Notariats-
// /Beurkundungstarif (eigene Engine `lib/grundbuchgebuehren.ts`).
//
// Die Grundbuchgebühr knüpft je nach Geschäft an einen Wert an (Handänderung,
// Pfandrecht, Dienstbarkeit) oder ist eine feste Gebühr (Vormerkung, Anmerkung,
// Löschung, Mutation). Welcher kantonale Tarif je Eintragungsart gilt, liegt in
// `grundbuch.ts` (amtlich belegt, doppelt verifiziert – §7/§8).

export type GbEintragsartId =
  | 'eigentum_kauf'
  | 'eigentum_erbgang'
  | 'grundpfand'
  | 'dienstbarkeit'
  | 'vormerkung'
  | 'baurecht'
  | 'stockwerkeigentum'
  | 'parzellierung'
  | 'anmerkung'
  | 'loeschung';

export type GbGruppe = 'eigentum' | 'pfand' | 'dienstbarkeit' | 'sonstige';

export const GB_GRUPPEN_LABEL: Record<GbGruppe, string> = {
  eigentum: 'Eigentumsübertragung',
  pfand: 'Grundpfand',
  dienstbarkeit: 'Dienstbarkeiten & Rechte',
  sonstige: 'Weitere Eintragungen',
};

export interface GbEintragsart {
  id: GbEintragsartId;
  gruppe: GbGruppe;
  label: string;
  beschreibung: string;
  /** `wert` = die Gebühr bemisst sich an einem Wert (Eingabefeld); `fix` = feste
   *  Gebühr unabhängig vom Wert. */
  bemessung: 'wert' | 'fix';
  wertLabel?: string;
  wertHinweis?: string;
  normBund: { artikel: string; bemerkung?: string }[];
}

export const GB_EINTRAGSARTEN: GbEintragsart[] = [
  {
    id: 'eigentum_kauf', gruppe: 'eigentum', label: 'Eigentumsübertragung (Kauf)',
    beschreibung: 'Eintragung der Handänderung infolge Kaufvertrags (Eigentumsübertragung).',
    bemessung: 'wert', wertLabel: 'Kaufpreis / Verkehrswert (CHF)', wertHinweis: 'Handänderungswert',
    normBund: [{ artikel: 'Art. 656 ZGB', bemerkung: 'Eintragung des Eigentumserwerbs' }, { artikel: 'Art. 972 ZGB' }],
  },
  {
    id: 'eigentum_erbgang', gruppe: 'eigentum', label: 'Eigentum infolge Erbgang / Erbteilung',
    beschreibung: 'Eintragung des Eigentumsübergangs infolge Erbgangs oder Erbteilung (oft ermässigter Tarif).',
    bemessung: 'wert', wertLabel: 'Wert des Grundstücks (CHF)', wertHinweis: 'Verkehrs-/Anrechnungswert',
    normBund: [{ artikel: 'Art. 656 ZGB' }, { artikel: 'Art. 18 GBV', bemerkung: 'Eintragung ausserbuchlichen Erwerbs' }],
  },
  {
    id: 'grundpfand', gruppe: 'pfand', label: 'Grundpfand / Schuldbrief (Eintragung)',
    beschreibung: 'Eintragung der Errichtung eines Schuldbriefs oder einer Grundpfandverschreibung.',
    bemessung: 'wert', wertLabel: 'Pfandsumme (CHF)', wertHinweis: 'Nennbetrag des Grundpfandrechts',
    normBund: [{ artikel: 'Art. 799 ZGB', bemerkung: 'Errichtung des Grundpfands' }, { artikel: 'Art. 857 ZGB' }],
  },
  {
    id: 'dienstbarkeit', gruppe: 'dienstbarkeit', label: 'Dienstbarkeit / Nutzniessung / Wohnrecht',
    beschreibung: 'Eintragung einer Grunddienstbarkeit, Nutzniessung oder eines Wohnrechts.',
    bemessung: 'wert', wertLabel: 'Wert des Rechts (CHF)', wertHinweis: 'kapitalisierter Wert (sofern wertabhängig)',
    normBund: [{ artikel: 'Art. 731 ZGB', bemerkung: 'Eintragung der Grunddienstbarkeit' }, { artikel: 'Art. 746 ZGB' }],
  },
  {
    id: 'baurecht', gruppe: 'dienstbarkeit', label: 'Baurecht (Aufnahme als Grundstück)',
    beschreibung: 'Eintragung des Baurechts bzw. Aufnahme eines selbständigen und dauernden Rechts als Grundstück.',
    bemessung: 'wert', wertLabel: 'Wert des Baurechts (CHF)', wertHinweis: 'kapitalisierter Baurechtszins (sofern wertabhängig)',
    normBund: [{ artikel: 'Art. 779 ZGB' }, { artikel: 'Art. 22 GBV', bemerkung: 'selbständige und dauernde Rechte als Grundstück' }],
  },
  {
    id: 'vormerkung', gruppe: 'sonstige', label: 'Vormerkung (Vor-/Kaufsrecht, Miete …)',
    beschreibung: 'Vormerkung persönlicher Rechte (Vorkaufs-, Kaufs-, Rückkaufsrecht, Miet-/Pachtverhältnis).',
    bemessung: 'fix',
    normBund: [{ artikel: 'Art. 959 ZGB', bemerkung: 'Vormerkung persönlicher Rechte' }],
  },
  {
    id: 'stockwerkeigentum', gruppe: 'eigentum', label: 'Stockwerkeigentum (Begründung)',
    beschreibung: 'Begründung von Stockwerkeigentum (Aufteilung eines Grundstücks in Stockwerkeinheiten).',
    bemessung: 'wert', wertLabel: 'Liegenschaftswert (CHF)', wertHinweis: 'Gesamtwert der Liegenschaft (sofern wertabhängig)',
    normBund: [{ artikel: 'Art. 712d ZGB', bemerkung: 'Begründung des Stockwerkeigentums' }],
  },
  {
    id: 'parzellierung', gruppe: 'sonstige', label: 'Parzellierung / Mutation (Teilung, Vereinigung)',
    beschreibung: 'Mutation des Grundbuchs: Teilung, Vereinigung oder Grenzänderung von Grundstücken.',
    bemessung: 'fix',
    normBund: [{ artikel: 'Art. 945 ZGB', bemerkung: 'Anlegung/Änderung der Grundbuchblätter' }, { artikel: 'Art. 91 GBV' }],
  },
  {
    id: 'anmerkung', gruppe: 'sonstige', label: 'Anmerkung',
    beschreibung: 'Anmerkung öffentlich-rechtlicher Eigentumsbeschränkungen oder weiterer Tatsachen.',
    bemessung: 'fix',
    normBund: [{ artikel: 'Art. 962 ZGB', bemerkung: 'Anmerkung öffentlich-rechtlicher Beschränkungen' }],
  },
  {
    id: 'loeschung', gruppe: 'sonstige', label: 'Löschung (Pfandrecht / Dienstbarkeit)',
    beschreibung: 'Löschung eines Grundpfandrechts, einer Dienstbarkeit oder einer Vormerkung.',
    bemessung: 'fix',
    normBund: [{ artikel: 'Art. 964 ZGB', bemerkung: 'Löschung/Änderung von Einträgen' }],
  },
];

const GB_BY_ID: Record<GbEintragsartId, GbEintragsart> =
  Object.fromEntries(GB_EINTRAGSARTEN.map((g) => [g.id, g])) as Record<GbEintragsartId, GbEintragsart>;

export const gbEintragsart = (id: GbEintragsartId): GbEintragsart => GB_BY_ID[id];
export const GB_EINTRAGSART_IDS: GbEintragsartId[] = GB_EINTRAGSARTEN.map((g) => g.id);

export const GB_EINTRAGSARTEN_NACH_GRUPPE: { gruppe: GbGruppe; label: string; arten: GbEintragsart[] }[] =
  (Object.keys(GB_GRUPPEN_LABEL) as GbGruppe[]).map((gruppe) => ({
    gruppe, label: GB_GRUPPEN_LABEL[gruppe],
    arten: GB_EINTRAGSARTEN.filter((g) => g.gruppe === gruppe),
  }));
