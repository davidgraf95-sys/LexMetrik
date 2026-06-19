import type { Rechtsweg, Streitsache, DeliktUnterfall, PersoenlichkeitUnterfall, MieteUnterfall } from '../../lib/zustaendigkeit';
import type { ZustFormState } from './zustaendigkeitLinkSpecs';

// §6-Datei-Schlankheit (19.6.2026): module-level Konstanten/Optionslisten +
// State-Typ/Defaults aus ZustaendigkeitForm.tsx ausgelagert (verhaltensneutral).

export const DISCLAIMER =
  'Automatisierte Orientierung zur Zuständigkeit nach ZPO (Fassung seit 1.1.2025) – keine Rechtsberatung. ' +
  'Binnenverhältnis Schweiz; internationale Sachverhalte (IPRG/LugÜ), Schiedsklauseln und die ' +
  'Streitwertberechnung selbst sind nicht abgebildet. Ermessensfragen (z. B. Handelsgericht) werden ' +
  'als offene Weichen ausgewiesen; der konkrete Fall ist fachlich zu prüfen.';

export const RECHTSWEGE: { code: Rechtsweg; label: string; sub: string; aktiv: boolean }[] = [
  { code: 'zivil', label: 'Zivil', sub: 'Forderungen, Miete, Arbeit, Familie (ZPO)', aktiv: true },
  { code: 'schkg', label: 'Betreibung (SchKG)', sub: 'Betreibungsort, Rechtsöffnung, Aberkennung u. a.', aktiv: true },
  { code: 'straf', label: 'Straf', sub: 'Anzeige, Gerichtsstand, Strafantrag (StPO)', aktiv: true },
  { code: 'verwaltung', label: 'Verwaltung', sub: 'Beschwerdeinstanzen (VwVG/kantonal)', aktiv: false },
];

export const STREITSACHEN: { code: Streitsache; label: string; sub: string }[] = [
  { code: 'geldforderung', label: 'Vertrag / Geldforderung', sub: 'Rechnung, Darlehen, Kauf u. a.' },
  { code: 'miete_wohn_geschaeft', label: 'Miete & Pacht', sub: 'Wohn-/Geschäftsräume inkl. Kündigungsschutz' },
  { code: 'arbeit', label: 'Arbeitsrecht', sub: 'Forderungen aus dem Arbeitsverhältnis' },
  { code: 'delikt', label: 'Schadenersatz (Delikt)', sub: 'Unerlaubte Handlung, Verkehrsunfall (Art. 36–38 ZPO)' },
  { code: 'persoenlichkeit', label: 'Persönlichkeit & Datenschutz', sub: 'Verletzung, Gegendarstellung, DSG, Gewaltschutz (Art. 20 ZPO)' },
  { code: 'scheidung', label: 'Scheidung', sub: 'Gemeinsames Begehren oder Klage (Art. 274 ff. ZPO)' },
  { code: 'erbrecht', label: 'Erbrecht', sub: 'Erbrechtliche Klagen (Herabsetzung, Ungültigkeit, Teilung)' },
  { code: 'gesellschaft', label: 'Gesellschaftsrecht', sub: 'Verantwortlichkeitsklagen (Art. 40 ZPO)' },
  { code: 'ip_wettbewerb', label: 'IP & Wettbewerb', sub: 'Immaterialgüter, Kartell, Firma, UWG — einzige Instanz (Art. 5 ZPO)' },
];

export const DELIKT_UNTERFAELLE: { code: DeliktUnterfall; label: string }[] = [
  { code: 'allgemein', label: 'Allgemeine unerlaubte Handlung (Art. 36 ZPO)' },
  { code: 'verkehrsunfall', label: 'Motorfahrzeug-/Fahrradunfall (Art. 38 ZPO)' },
  { code: 'ungerechtfertigte_massnahme', label: 'Schadenersatz wegen ungerechtfertigter vorsorglicher Massnahme (Art. 37 ZPO)' },
];

export const PERSOENLICHKEIT_UNTERFAELLE: { code: PersoenlichkeitUnterfall; label: string }[] = [
  { code: 'verletzung', label: 'Persönlichkeitsverletzung (Art. 28 ZGB)' },
  { code: 'gegendarstellung', label: 'Gegendarstellung' },
  { code: 'datenschutz', label: 'Datenschutz (DSG)' },
  { code: 'gewaltschutz', label: 'Gewalt, Drohungen, Nachstellungen (Art. 28b/28c ZGB)' },
];

export const MIETE_UNTERFAELLE: { code: MieteUnterfall; label: string }[] = [
  { code: 'kuendigungsschutz', label: 'Kündigungsschutz (Anfechtung der Kündigung)' },
  { code: 'erstreckung', label: 'Erstreckung des Mietverhältnisses' },
  { code: 'mietzins_anfechtung', label: 'Schutz vor missbräuchlichem Mietzins' },
  { code: 'hinterlegung', label: 'Hinterlegung des Mietzinses' },
  { code: 'sonstige', label: 'Übrige Miet-/Pachtstreitigkeit (z. B. Forderung)' },
];

// Welcher Ort ist je Streitsache örtlich massgeblich? (reine Beschriftung —
// die Regel selbst lebt in der Engine, Art. 10/23/32/33/34 ZPO)
export const ORT_LABEL: Record<Streitsache, string> = {
  geldforderung: 'Wohnsitz/Sitz der beklagten Partei',
  miete_wohn_geschaeft: 'Ort der Miet-/Pachtsache',
  arbeit: 'Wohnsitz/Sitz der beklagten Partei oder gewöhnlicher Arbeitsort',
  scheidung: 'Wohnsitz einer der Parteien',
  erbrecht: 'letzter Wohnsitz der Erblasserin/des Erblassers',
  delikt: 'Wohnsitz/Sitz einer Partei, Handlungs- oder Erfolgsort',
  persoenlichkeit: 'Wohnsitz/Sitz einer der Parteien',
  gesellschaft: 'Wohnsitz/Sitz der beklagten Partei oder Sitz der Gesellschaft',
  ip_wettbewerb: 'Wohnsitz/Sitz der beklagten Partei (bzw. Handlungs-/Erfolgsort)',
};

export type State = ZustFormState;

export const DEFAULTS: State = {
  streitsache: 'geldforderung',
  vermoegensrechtlich: true,
  streitwertRoh: '',
  mieteUnterfall: 'sonstige',
  glgBetroffen: false,
  konsumentenvertrag: false,
  klaegeristGeschuetzt: true,
  geschaeftlicheTaetigkeit: false,
  beklagteImHR: false,
  klaegerImHR: false,
  beklagteAuslandOderUnbekannt: false,
  widerklageOderGerichtlicheFrist: false,
  ausVertrag: false,
  deliktUnterfall: 'allgemein',
  persoenlichkeitUnterfall: 'verletzung',
  ipUnterfall: 'ip_kartell_firma',
  bundKlagerecht: false,
  avgVerleih: false,
  gerichtsstandsvereinbarung: false,
  gemeinde: '',
  plz: '',
  kanton: '',
  instanz: 'einleitung',
  rmObjekt: 'endentscheid',
  rmVerfahren: 'ordentlich_vereinfacht',
  rmVorinstanz: 'erstinstanz',
  rmFamilienSummarsache: false,
};
