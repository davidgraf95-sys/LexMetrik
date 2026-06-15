// ─── Geschäftsart-Taxonomie des allgemeinen Beurkundungskosten-Rechners ─────
//
// FAHRPLAN-BEURKUNDUNGS-AUSBAU (Direktive David 15.6.2026): der Notariatsrechner
// wird von «nur Grundstückkauf» auf ALLE öffentlich beurkundbaren Rechtsgeschäfte
// ausgebaut. Diese Datei deklariert die Geschäftsart-Dimension (B-1): je Art die
// Gruppe, das Bemessungs-Label und der Tarif-Charakter.
//
// Fachlicher Kern (§1/§2): In den meisten Kantonen ist der Notariatstarif ein
// GENEREller wertbasierter Promille-/Staffeltarif auf den «Geschäftswert»; die
// Geschäftsart bestimmt v. a., WAS der Geschäftswert ist (Kaufpreis, Kapital,
// Bürgschaftssumme, Nachlasswert …). Einzelne Geschäfte tragen Sondersätze/Minima
// (Testament, Erbvertrag, Ehevertrag) oder sind nicht vermögensrechtlich
// (Vollmacht, Vorsorgeauftrag → fix/Aufwand). Welche Behandlung je Kanton gilt,
// liegt in `beurkundung.ts` (amtlich belegt, doppelt verifiziert — §7/§8).

/** Kanonische Geschäftsarten (Identifikatoren stabil — Permalink/Schema). */
export type GeschaeftsartId =
  | 'grundstueckkauf'
  | 'baurecht'
  | 'vorkaufsrecht'
  | 'dienstbarkeit'
  | 'schuldbrief'
  | 'schenkung'
  | 'erbvertrag'
  | 'ehevertrag'
  | 'testament'
  | 'vorsorgeauftrag'
  | 'verpfruendung'
  | 'vollmacht'
  | 'ag_gruendung'
  | 'gmbh_gruendung'
  | 'genossenschaft_gruendung'
  | 'kapitalerhoehung'
  | 'kapitalherabsetzung'
  | 'statutenaenderung'
  | 'fusion'
  | 'stiftung'
  | 'buergschaft'
  | 'schuldanerkennung';

export type GeschaeftsartGruppe =
  | 'immobilien'
  | 'familie_nachlass'
  | 'gesellschaft'
  | 'sicherung'
  | 'uebriges';

export const GRUPPEN_LABEL: Record<GeschaeftsartGruppe, string> = {
  immobilien: 'Immobilien',
  familie_nachlass: 'Familie & Nachlass',
  gesellschaft: 'Gesellschaft & Stiftung',
  sicherung: 'Sicherungsgeschäfte',
  uebriges: 'Übriges',
};

export interface Geschaeftsart {
  id: GeschaeftsartId;
  gruppe: GeschaeftsartGruppe;
  /** Anzeige-Name der Geschäftsart. */
  label: string;
  /** Kurze Erläuterung (was wird beurkundet). */
  beschreibung: string;
  /** `wert` = der Tarif bemisst sich an einem Geschäftswert (Eingabefeld nötig);
   *  `fix` = nicht vermögensrechtlich (kein Wertfeld; Fix-/Aufwandgebühr). */
  bemessung: 'wert' | 'fix';
  /** Label des Wertfeldes (nur bei bemessung='wert'). */
  wertLabel?: string;
  /** Hinweis zum Wertfeld (Bemessungsbasis). */
  wertHinweis?: string;
  /** Bundesrechtliche Grundlage der Beurkundungspflicht/-form (§5: aus Schema). */
  normBund: { artikel: string; bemerkung?: string }[];
}

/** Registry aller Geschäftsarten in Anzeige-Reihenfolge (Gruppen geordnet). */
export const GESCHAEFTSARTEN: Geschaeftsart[] = [
  // ── Immobilien ──
  {
    id: 'grundstueckkauf', gruppe: 'immobilien', label: 'Grundstückkauf',
    beschreibung: 'Kaufvertrag über eine Liegenschaft (Beurkundung + Grundbuch + ggf. Grundpfand + Handänderungssteuer).',
    bemessung: 'wert', wertLabel: 'Kaufpreis (CHF)', wertHinweis: 'Handänderungswert der Liegenschaft',
    normBund: [{ artikel: 'Art. 216 OR', bemerkung: 'öffentliche Beurkundung des Grundstückkaufs' }, { artikel: 'Art. 657 ZGB' }],
  },
  {
    id: 'baurecht', gruppe: 'immobilien', label: 'Baurecht (Baurechtsvertrag)',
    beschreibung: 'Begründung eines selbständigen und dauernden Baurechts als Dienstbarkeit (Art. 779 ff. ZGB).',
    bemessung: 'wert', wertLabel: 'Wert des Baurechts (CHF)', wertHinweis: 'kapitalisierter Baurechtszins bzw. Bauwert (sofern wertabhängig tarifiert)',
    normBund: [{ artikel: 'Art. 779 ZGB', bemerkung: 'Baurecht als Dienstbarkeit (öffentliche Beurkundung)' }, { artikel: 'Art. 779a ZGB', bemerkung: 'Form des Baurechtsvertrags' }],
  },
  {
    id: 'vorkaufsrecht', gruppe: 'immobilien', label: 'Vorkaufs- / Kaufs- / Rückkaufsrecht',
    beschreibung: 'Vertragliches Vorkaufs-, Kaufs- oder Rückkaufsrecht an einem Grundstück (Art. 216 OR).',
    bemessung: 'wert', wertLabel: 'Wert des Rechts / Grundstückwert (CHF)', wertHinweis: 'massgeblicher Wert (limitierter Preis bzw. Verkehrswert)',
    normBund: [{ artikel: 'Art. 216 OR', bemerkung: 'Form der Vorkaufs-/Kaufs-/Rückkaufsrechte an Grundstücken' }, { artikel: 'Art. 216a OR' }],
  },
  {
    id: 'dienstbarkeit', gruppe: 'immobilien', label: 'Dienstbarkeit / Nutzniessung / Wohnrecht',
    beschreibung: 'Begründung einer Grunddienstbarkeit, Nutzniessung oder eines Wohnrechts an einem Grundstück.',
    bemessung: 'wert', wertLabel: 'Wert des Rechts (CHF)', wertHinweis: 'kapitalisierter Wert der Dienstbarkeit/Nutzniessung',
    normBund: [{ artikel: 'Art. 732 ZGB', bemerkung: 'Errichtung Grunddienstbarkeit (öffentliche Beurkundung)' }, { artikel: 'Art. 746 ZGB' }, { artikel: 'Art. 776 ZGB' }],
  },
  {
    id: 'schuldbrief', gruppe: 'immobilien', label: 'Schuldbrief / Grundpfand (Errichtung)',
    beschreibung: 'Beurkundung der Errichtung eines Register- oder Papier-Schuldbriefs bzw. einer Grundpfandverschreibung (Art. 799 ZGB).',
    bemessung: 'wert', wertLabel: 'Pfandsumme (CHF)', wertHinweis: 'Nennbetrag des Grundpfandrechts',
    normBund: [{ artikel: 'Art. 799 ZGB', bemerkung: 'Errichtung des Grundpfands (öffentliche Beurkundung)' }, { artikel: 'Art. 842 ZGB', bemerkung: 'Schuldbrief' }],
  },
  // ── Familie & Nachlass ──
  {
    id: 'testament', gruppe: 'familie_nachlass', label: 'Öffentliches Testament',
    beschreibung: 'Öffentliche letztwillige Verfügung (Art. 499 ff. ZGB) – in vielen Kantonen Fix-/Aufwandgebühr.',
    bemessung: 'fix',
    normBund: [{ artikel: 'Art. 499 ZGB', bemerkung: 'öffentliche letztwillige Verfügung' }, { artikel: 'Art. 500 ZGB' }, { artikel: 'Art. 501 ZGB' }],
  },
  {
    id: 'erbvertrag', gruppe: 'familie_nachlass', label: 'Erbvertrag',
    beschreibung: 'Erb- oder Erbverzichtsvertrag (Art. 512 ZGB) – Form wie öffentliches Testament.',
    bemessung: 'wert', wertLabel: 'Betroffenes Vermögen / Nachlasswert (CHF)', wertHinweis: 'vom Vertrag erfasstes Vermögen (sofern wertabhängig tarifiert)',
    normBund: [{ artikel: 'Art. 512 ZGB', bemerkung: 'Form des Erbvertrags (öffentliche Beurkundung)' }, { artikel: 'Art. 495 ZGB' }],
  },
  {
    id: 'ehevertrag', gruppe: 'familie_nachlass', label: 'Ehe- / Vermögensvertrag',
    beschreibung: 'Ehevertrag (Güterstand, Art. 182 ff. ZGB) bzw. Vermögensvertrag eingetragener Partnerschaft.',
    bemessung: 'wert', wertLabel: 'Betroffenes Vermögen (CHF)', wertHinweis: 'vom Vertrag erfasstes Vermögen (sofern wertabhängig tarifiert)',
    normBund: [{ artikel: 'Art. 184 ZGB', bemerkung: 'öffentliche Beurkundung des Ehevertrags' }, { artikel: 'Art. 181 ZGB' }],
  },
  {
    id: 'schenkung', gruppe: 'familie_nachlass', label: 'Schenkung (beurkundet)',
    beschreibung: 'Schenkungsversprechen bzw. beurkundungspflichtige Schenkung (Art. 243 OR; Grundstücke Art. 216 OR).',
    bemessung: 'wert', wertLabel: 'Zuwendungswert (CHF)', wertHinweis: 'Wert der geschenkten Sache/Leistung',
    normBund: [{ artikel: 'Art. 243 OR', bemerkung: 'Form des Schenkungsversprechens' }, { artikel: 'Art. 242 OR' }],
  },
  {
    id: 'vorsorgeauftrag', gruppe: 'familie_nachlass', label: 'Vorsorgeauftrag (beurkundet)',
    beschreibung: 'Vorsorgeauftrag in öffentlich beurkundeter Form (Art. 361 Abs. 1 ZGB) – nicht vermögensrechtlich.',
    bemessung: 'fix',
    normBund: [{ artikel: 'Art. 361 ZGB', bemerkung: 'Errichtung des Vorsorgeauftrags (eigenhändig oder öffentlich beurkundet)' }, { artikel: 'Art. 360 ZGB' }],
  },
  {
    id: 'verpfruendung', gruppe: 'familie_nachlass', label: 'Verpfründungsvertrag',
    beschreibung: 'Verpfründungsvertrag (Übergabe von Vermögen gegen lebenslange Pflege/Unterhalt, Art. 522 OR).',
    bemessung: 'wert', wertLabel: 'Wert des übergebenen Vermögens (CHF)', wertHinweis: 'Wert der übertragenen Vermögenswerte',
    normBund: [{ artikel: 'Art. 522 OR', bemerkung: 'Form des Verpfründungsvertrags (öffentliche Beurkundung)' }],
  },
  // ── Gesellschaft & Stiftung ──
  {
    id: 'ag_gruendung', gruppe: 'gesellschaft', label: 'AG-Gründung',
    beschreibung: 'Öffentliche Beurkundung des Errichtungsakts einer Aktiengesellschaft (Art. 629 OR).',
    bemessung: 'wert', wertLabel: 'Aktienkapital (CHF)', wertHinweis: 'Aktienkapital (zzgl. allfälliges Agio, wo der Tarif es einbezieht)',
    normBund: [{ artikel: 'Art. 629 OR', bemerkung: 'Errichtungsakt der AG (öffentliche Beurkundung)' }, { artikel: 'Art. 631 OR' }],
  },
  {
    id: 'gmbh_gruendung', gruppe: 'gesellschaft', label: 'GmbH-Gründung',
    beschreibung: 'Öffentliche Beurkundung des Errichtungsakts einer GmbH (Art. 777 OR).',
    bemessung: 'wert', wertLabel: 'Stammkapital (CHF)', wertHinweis: 'Stammkapital der GmbH',
    normBund: [{ artikel: 'Art. 777 OR', bemerkung: 'Errichtungsakt der GmbH (öffentliche Beurkundung)' }, { artikel: 'Art. 779 OR' }],
  },
  {
    id: 'genossenschaft_gruendung', gruppe: 'gesellschaft', label: 'Genossenschaft-Gründung',
    beschreibung: 'Öffentliche Beurkundung des Errichtungsakts einer Genossenschaft (Art. 830 OR) – kein festes Kapital.',
    bemessung: 'fix',
    normBund: [{ artikel: 'Art. 830 OR', bemerkung: 'Errichtung der Genossenschaft (öffentliche Beurkundung)' }, { artikel: 'Art. 834 OR' }],
  },
  {
    id: 'kapitalerhoehung', gruppe: 'gesellschaft', label: 'Kapitalerhöhung',
    beschreibung: 'Beurkundete ordentliche Kapitalerhöhung einer AG/GmbH (Art. 650/653 OR).',
    bemessung: 'wert', wertLabel: 'Erhöhungsbetrag (CHF)', wertHinweis: 'Betrag der Kapitalerhöhung (zzgl. Agio, wo einbezogen)',
    normBund: [{ artikel: 'Art. 650 OR', bemerkung: 'Beschluss und Beurkundung der Kapitalerhöhung' }, { artikel: 'Art. 652g OR' }],
  },
  {
    id: 'kapitalherabsetzung', gruppe: 'gesellschaft', label: 'Kapitalherabsetzung',
    beschreibung: 'Beurkundete Herabsetzung des Aktien-/Stammkapitals (Art. 653j ff. OR).',
    bemessung: 'wert', wertLabel: 'Herabsetzungsbetrag (CHF)', wertHinweis: 'Betrag der Kapitalherabsetzung (sofern wertabhängig tarifiert)',
    normBund: [{ artikel: 'Art. 653j OR', bemerkung: 'Kapitalherabsetzung (Beschluss und Beurkundung)' }, { artikel: 'Art. 653n OR' }],
  },
  {
    id: 'statutenaenderung', gruppe: 'gesellschaft', label: 'Statutenänderung (beurkundet)',
    beschreibung: 'Beurkundungspflichtige Statutenänderung einer AG/GmbH (z. B. Zweck, Firma, Sitz; Art. 647 OR).',
    bemessung: 'fix',
    normBund: [{ artikel: 'Art. 647 OR', bemerkung: 'öffentliche Beurkundung von Statutenänderungen' }],
  },
  {
    id: 'fusion', gruppe: 'gesellschaft', label: 'Fusion / Spaltung / Umwandlung',
    beschreibung: 'Beurkundung von Fusions-, Spaltungs- oder Umwandlungsbeschlüssen nach Fusionsgesetz (FusG).',
    bemessung: 'fix',
    normBund: [{ artikel: 'Art. 20 FusG', bemerkung: 'Beurkundung des Fusionsbeschlusses' }, { artikel: 'Art. 44 FusG' }, { artikel: 'Art. 65 FusG' }],
  },
  {
    id: 'stiftung', gruppe: 'gesellschaft', label: 'Stiftungserrichtung',
    beschreibung: 'Errichtung einer Stiftung durch öffentliche Urkunde (Art. 81 Abs. 1 ZGB).',
    bemessung: 'wert', wertLabel: 'Stiftungsvermögen (CHF)', wertHinweis: 'gewidmetes Stiftungsvermögen',
    normBund: [{ artikel: 'Art. 81 ZGB', bemerkung: 'Errichtung der Stiftung (öffentliche Urkunde oder Verfügung von Todes wegen)' }],
  },
  // ── Sicherungsgeschäfte ──
  {
    id: 'buergschaft', gruppe: 'sicherung', label: 'Bürgschaft',
    beschreibung: 'Bürgschaft einer natürlichen Person über CHF 2 000 – öffentliche Beurkundung (Art. 493 Abs. 2 OR).',
    bemessung: 'wert', wertLabel: 'Bürgschaftssumme (CHF)', wertHinweis: 'Höchstbetrag der Bürgschaft (Art. 493 Abs. 1 OR)',
    normBund: [{ artikel: 'Art. 493 OR', bemerkung: 'Form der Bürgschaft (Beurkundung über CHF 2 000)' }],
  },
  {
    id: 'schuldanerkennung', gruppe: 'sicherung', label: 'Schuldanerkennung / Darlehen (beurkundet)',
    beschreibung: 'Öffentlich beurkundete Schuldanerkennung bzw. beurkundeter Darlehens-/Schuldvertrag.',
    bemessung: 'wert', wertLabel: 'Forderungs- / Darlehenssumme (CHF)', wertHinweis: 'anerkannte Forderung bzw. Darlehensbetrag',
    normBund: [{ artikel: 'Art. 17 OR', bemerkung: 'Schuldanerkennung' }, { artikel: 'Art. 82 SchKG', bemerkung: 'provisorische Rechtsöffnung aus öffentlicher Urkunde' }],
  },
  // ── Übriges ──
  {
    id: 'vollmacht', gruppe: 'uebriges', label: 'Vollmacht / Beglaubigung',
    beschreibung: 'Beurkundung einer Vollmacht bzw. Beglaubigung einer Unterschrift/Kopie – feste Gebühr.',
    bemessung: 'fix',
    normBund: [{ artikel: 'Art. 33 OR', bemerkung: 'Vollmacht' }, { artikel: 'Art. 55 SchlT ZGB', bemerkung: 'kantonale Beurkundungs-/Beglaubigungszuständigkeit' }],
  },
];

const BY_ID: Record<GeschaeftsartId, Geschaeftsart> =
  Object.fromEntries(GESCHAEFTSARTEN.map((g) => [g.id, g])) as Record<GeschaeftsartId, Geschaeftsart>;

export const geschaeftsart = (id: GeschaeftsartId): Geschaeftsart => BY_ID[id];

export const GESCHAEFTSART_IDS: GeschaeftsartId[] = GESCHAEFTSARTEN.map((g) => g.id);

/** Geschäftsarten je Gruppe, in Anzeige-Reihenfolge. */
export const GESCHAEFTSARTEN_NACH_GRUPPE: { gruppe: GeschaeftsartGruppe; label: string; arten: Geschaeftsart[] }[] =
  (Object.keys(GRUPPEN_LABEL) as GeschaeftsartGruppe[]).map((gruppe) => ({
    gruppe,
    label: GRUPPEN_LABEL[gruppe],
    arten: GESCHAEFTSARTEN.filter((g) => g.gruppe === gruppe),
  }));
