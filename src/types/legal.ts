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

// KTG-Gleichwertigkeits-Kriterien (Art. 324a Abs. 4 OR, SHK N 61–62) — §2.6
export type KtgKriterien = {
  taggeldProzent?: number;                    // z.B. 80 (% des Lohnes)
  leistungsdauerTage?: number;                // z.B. 720/730
  karenzTage?: number;                        // max. 3 Tage zulässig
  praemienAnteilArbeitgeberProzent?: number;  // mind. 50 %
  alleRisikenAbgedeckt?: boolean;
  schriftlichVereinbart?: boolean;            // Gültigkeitsvoraussetzung (Art. 324a Abs. 4 OR)
};

export type LohnfortzahlungInput = {
  vertragsbeginn: string;           // yyyy-MM-dd (= tatsächliche Arbeitsaufnahme)
  verhinderungBeginn: string;       // yyyy-MM-dd (Stichtag A)
  verhinderungEnde?: string;        // yyyy-MM-dd, optional — für DJ-übergreifende Verhinderung (§2.1)
  arbeitsunfaehigkeitProzent: number; // 1–100, bezogen auf die geschuldete Arbeitsleistung
  pensumProzent?: number;           // Beschäftigungsgrad 1–100 (§2.3), default 100
  kanton: Kanton;
  ktgGleichwertigVorhanden: boolean;
  ktgKriterien?: KtgKriterien;      // §2.6 Gleichwertigkeits-Checkliste
  monatslohnBrutto?: number;
  dreizehnterMonatslohn?: boolean;  // §2.7 13. Monatslohn (anteilig) berücksichtigen
  befristetFest?: boolean;          // §2.2 befristeter Vertrag fester Dauer
  vereinbarteKuendigungsfristMonate?: number; // §2.2 (unbefristet)
  anrechenbareVordienstzeitMonate?: number;   // §2.2 SHK N 44 (Lehre, Praktikum, Folge-Befristungen)
};

// ─── Module B: Kündigungsfrist ────────────────────────────────────────────

export type KuendigungsPartei = 'arbeitgeber' | 'arbeitnehmer';

export type KuendigungsfristInput = {
  vertragsbeginn: string;           // yyyy-MM-dd
  zugangKuendigung: string;         // yyyy-MM-dd (Stichtag B)
  kuendigendePartei: KuendigungsPartei;
  probezeitMonate: number;          // 0–3, default 1
  abweichendeFristMonate?: number;
  abweichendeFristFormGueltig?: boolean; // §3.2 schriftlich / GAV / NAV (Gültigkeitsvoraussetzung)
  abweichendeFristQuelleGAV?: boolean;   // §3.2 für Verkürzung < 1 Monat im 1. DJ
  kuendigungsterminMonatsende: boolean; // default true
  vaterschaftsurlaubResttage?: number;   // §3.4 Art. 335c Abs. 3 OR (nur Arbeitgeberkündigung)
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
  // §1.3 Rückfall: Index (0-basiert) eines früheren krankheit_unfall-Ereignisses mit
  // DERSELBEN Ursache. Gesetzt → keine eigene Sperrfrist (BGE 120 II 124 «aucun lien»).
  gleicheUrsacheWieEreignis?: number | null;
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
