// ─── Core legal type system ───────────────────────────────────────────────

export type Normverweis = {
  artikel: string;
  bemerkung?: string;
};

export type Rechtsprechungshinweis = {
  aktenzeichen: string;
  aussage: string;
  verifiziert: boolean;
};

export type Rechenschritt = {
  beschreibung: string;
  zwischenergebnis: string;
  normen: Normverweis[];
  rechtsprechung?: Rechtsprechungshinweis[];
};

export type BerechnungsStatus =
  | 'ok'
  | 'nichtig'
  | 'kein_anspruch'
  | 'unzulaessig'
  | 'ktg_regime';

export type Berechnungsergebnis = {
  ergebnis: string;
  status: BerechnungsStatus;
  rechenweg: Rechenschritt[];
  annahmen: string[];
  warnungen: string[];
  normverweise: Normverweis[];
};

export interface Rechner<TInput> {
  id: string;
  titel: string;
  beschreibung: string;
  berechne(input: TInput): Berechnungsergebnis;
}

// ─── Module A: Lohnfortzahlung ────────────────────────────────────────────

export type Kanton =
  | 'AG' | 'AI' | 'AR' | 'BE' | 'BL' | 'BS' | 'FR' | 'GE' | 'GL'
  | 'GR' | 'JU' | 'LU' | 'NE' | 'NW' | 'OW' | 'SG' | 'SH' | 'SO'
  | 'SZ' | 'TG' | 'TI' | 'UR' | 'VD' | 'VS' | 'ZG' | 'ZH';

export type LohnfortzahlungInput = {
  vertragsbeginn: string;           // yyyy-MM-dd
  verhinderungBeginn: string;       // yyyy-MM-dd (Stichtag A)
  arbeitsunfaehigkeitProzent: number; // 1–100
  kanton: Kanton;
  ktgGleichwertigVorhanden: boolean;
  monatslohnBrutto?: number;
};

// ─── Module B: Kündigungsfrist ────────────────────────────────────────────

export type KuendigungsPartei = 'arbeitgeber' | 'arbeitnehmer';

export type KuendigungsfristInput = {
  vertragsbeginn: string;           // yyyy-MM-dd
  zugangKuendigung: string;         // yyyy-MM-dd (Stichtag B)
  kuendigendePartei: KuendigungsPartei;
  probezeitMonate: number;          // 0–3, default 1
  abweichendeFristMonate?: number;
  kuendigungsterminMonatsende: boolean; // default true
};

// ─── Module C: Sperrfristen ───────────────────────────────────────────────

export type SperrereignisTyp =
  | 'krankheit_unfall'
  | 'schwangerschaft'
  | 'militaer_zivil'
  | 'hilfsaktion';

export type Sperrereignis = {
  typ: SperrereignisTyp;
  von: string; // yyyy-MM-dd
  bis: string; // yyyy-MM-dd
};

export type SperrfristenInput = KuendigungsfristInput & {
  sperrereignisse?: Sperrereignis[];
};

// ─── Combined module ──────────────────────────────────────────────────────

export type ArbeitsrechtInput = SperrfristenInput & {
  verhinderungBeginn?: string;
  arbeitsunfaehigkeitProzent?: number;
  kanton?: Kanton;
  ktgGleichwertigVorhanden?: boolean;
  monatslohnBrutto?: number;
};

export type ArbeitsrechtErgebnis = {
  lohnfortzahlung?: Berechnungsergebnis;
  kuendigungsfrist?: Berechnungsergebnis;
  sperrfristen?: Berechnungsergebnis;
  querverbindungen: string[];
};

// ─── Scale table types ────────────────────────────────────────────────────

export type SkalaDauer =
  | { typ: 'wochen'; anzahl: number }
  | { typ: 'monate'; anzahl: number }
  | { typ: 'tage'; anzahl: number };

export type SkalaEintrag = {
  dienstjahrVon: number;
  dienstjahrBis: number | null; // null = unbeschränkt
  dauer: SkalaDauer;
};

export type Skala = {
  name: string;
  kantone: Kanton[];
  eintraege: SkalaEintrag[];
  quellenhinweis: string;
};
