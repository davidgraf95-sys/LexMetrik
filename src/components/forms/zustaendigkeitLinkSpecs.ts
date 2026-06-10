// ─── Permalink-Specs der Zuständigkeits-Seite (G3.1 / M-8, 10.6.2026) ───────
// Eigenes Modul (kein Component-Export, react-refresh-Regel): Die Seite
// /rechner/zustaendigkeit trägt VIER Specs im selben Query-String (Zivil ·
// SchKG · Straf · Straf-Rechtsmittel; Rechtsweg-Weiche im Hash #schkg/#straf).
// Kurzparameter müssen darum SEITENWEIT eindeutig sein — Invariante in
// src/tests/zustaendigkeitExport.test.ts. Einzige bewusste Ausnahme: `tan`
// (Straf-Anliegen) wird von Haupt- und Rechtsmittel-Spec geteilt, damit ein
// geteilter Rechtsmittel-Link die richtige Sicht öffnet.

import { einerVon, istKanton, type PermalinkSpec } from '../../lib/permalink';
import type { Kanton } from '../../types/legal';
import type {
  Streitsache, MieteUnterfall, DeliktUnterfall, PersoenlichkeitUnterfall, IpUnterfall,
  RmObjekt, RmVerfahren, RmVorinstanz,
} from '../../lib/zustaendigkeit';
import type {
  SchkgAnliegen, SchkgPfand, SchkgSchuldnerTyp, WiderspruchKonstellation,
} from '../../lib/schkgZustaendigkeit';
import type {
  StrafInput, StrafKaskade32, StrafSpezialforum, StrafTatortLage, StrafBeteiligung,
} from '../../lib/strafZustaendigkeit';
import type {
  StrafEntscheidTyp, StrafAnfechtende, StrafAnfechtungsziel, RevisionsGrund,
} from '../../lib/strafRechtsmittel';

// ── Zivil (ZustaendigkeitForm) ──────────────────────────────────────────────
export type Instanz = 'einleitung' | 'rechtsmittel';

export type ZustFormState = {
  streitsache: Streitsache;
  vermoegensrechtlich: boolean;
  streitwertRoh: string;
  mieteUnterfall: MieteUnterfall;
  glgBetroffen: boolean;
  konsumentenvertrag: boolean;
  klaegeristGeschuetzt: boolean;
  geschaeftlicheTaetigkeit: boolean;
  beklagteImHR: boolean;
  klaegerImHR: boolean;
  beklagteAuslandOderUnbekannt: boolean;
  widerklageOderGerichtlicheFrist: boolean;
  // Ausbau 5.6.2026:
  ausVertrag: boolean;
  deliktUnterfall: DeliktUnterfall;
  persoenlichkeitUnterfall: PersoenlichkeitUnterfall;
  ipUnterfall: IpUnterfall;
  bundKlagerecht: boolean;
  avgVerleih: boolean;
  gerichtsstandsvereinbarung: boolean;
  gemeinde: string;
  plz: string;
  kanton: Kanton | '';
  instanz: Instanz;
  // Rechtsmittel-Umbau 6.6.2026 (Auftrag David):
  rmObjekt: RmObjekt;
  rmVerfahren: RmVerfahren;
  rmVorinstanz: RmVorinstanz;
  rmFamilienSummarsache: boolean;
};

// Permalink (FAHRPLAN-PRAXIS 1.3): kompletter Zivil-Fall inkl. Rechtsmittel-
// Weichen; der Rechtsweg (zivil/schkg/straf) läuft über den bestehenden Hash.
export const ZUST_LINK_SPEC: PermalinkSpec<ZustFormState & { schritt?: number } & Record<string, unknown>> = {
  streitsache: { p: 'ss', typ: 'str', gueltig: einerVon('geldforderung', 'miete_wohn_geschaeft', 'arbeit', 'scheidung', 'erbrecht', 'delikt', 'persoenlichkeit', 'gesellschaft', 'ip_wettbewerb') },
  vermoegensrechtlich: { p: 'vr', typ: 'bool' },
  streitwertRoh: { p: 'sw', typ: 'str', gueltig: (v) => v.length <= 16 },
  mieteUnterfall: { p: 'mu', typ: 'str', gueltig: einerVon('kuendigungsschutz', 'erstreckung', 'mietzins_anfechtung', 'hinterlegung', 'sonstige') },
  glgBetroffen: { p: 'gl', typ: 'bool' },
  konsumentenvertrag: { p: 'kv', typ: 'bool' },
  klaegeristGeschuetzt: { p: 'kg', typ: 'bool' },
  geschaeftlicheTaetigkeit: { p: 'gt', typ: 'bool' },
  beklagteImHR: { p: 'bh', typ: 'bool' },
  klaegerImHR: { p: 'kh', typ: 'bool' },
  beklagteAuslandOderUnbekannt: { p: 'ba', typ: 'bool' },
  widerklageOderGerichtlicheFrist: { p: 'wf', typ: 'bool' },
  ausVertrag: { p: 'av', typ: 'bool' },
  deliktUnterfall: { p: 'du', typ: 'str', gueltig: einerVon('allgemein', 'verkehrsunfall', 'ungerechtfertigte_massnahme') },
  persoenlichkeitUnterfall: { p: 'pu', typ: 'str', gueltig: einerVon('verletzung', 'gegendarstellung', 'datenschutz', 'gewaltschutz') },
  ipUnterfall: { p: 'iu', typ: 'str', gueltig: einerVon('ip_kartell_firma', 'uwg', 'klage_gegen_bund') },
  bundKlagerecht: { p: 'bk', typ: 'bool' },
  avgVerleih: { p: 'al', typ: 'bool' },
  gerichtsstandsvereinbarung: { p: 'gv', typ: 'bool' },
  gemeinde: { p: 'g', typ: 'str', gueltig: (v) => v.length <= 60 },
  plz: { p: 'pl', typ: 'str', gueltig: (v) => /^\d{4}$/.test(v) },
  kanton: { p: 'k', typ: 'str', gueltig: istKanton },
  instanz: { p: 'in', typ: 'str', gueltig: einerVon('einleitung', 'rechtsmittel') },
  rmObjekt: { p: 'ro', typ: 'str', gueltig: einerVon('endentscheid', 'zwischenentscheid', 'vorsorgliche_massnahme', 'prozessleitende_verfuegung') },
  rmVerfahren: { p: 'rv', typ: 'str', gueltig: einerVon('ordentlich_vereinfacht', 'summarisch') },
  rmVorinstanz: { p: 'ri', typ: 'str', gueltig: einerVon('erstinstanz', 'handelsgericht', 'direktklage_oberes_gericht') },
  rmFamilienSummarsache: { p: 'rf', typ: 'bool' },
  schritt: { p: 'sch', typ: 'num', gueltig: (n) => Number.isInteger(n) && n >= 0 && n <= 8 },
};

// ── SchKG (SchkgZustaendigkeitTeil) — s-Präfix ──────────────────────────────
export type SchkgLinkZustand = {
  anliegen: SchkgAnliegen; schuldnerTyp: SchkgSchuldnerTyp; pfand: SchkgPfand;
  arrestGelegt: boolean; forderungRoh: string; widerspruchK: WiderspruchKonstellation;
  kollokationIn: 'pfaendung' | 'konkurs'; roArt: 'provisorisch' | 'definitiv';
  ortPlz: string; ortKanton: Kanton | ''; ortGemeinde: string;
};
export const SCHKG_LINK_SPEC: PermalinkSpec<SchkgLinkZustand & Record<string, unknown>> = {
  anliegen: { p: 'sa', typ: 'str', gueltig: einerVon('betreibung_einleiten', 'rechtsoeffnung', 'aberkennungsklage', 'anerkennungsklage', 'feststellung', 'rueckforderung', 'widerspruch', 'kollokation', 'arrest', 'konkursbegehren', 'beschwerde_amt') },
  schuldnerTyp: { p: 'sst', typ: 'str', gueltig: einerVon('natuerlich_wohnsitz', 'natuerlich_ohne_wohnsitz', 'jur_person_hr', 'jur_person_nicht_hr', 'erbschaft', 'stockwerkeigentuemer', 'ausland_niederlassung') },
  pfand: { p: 'spf', typ: 'str', gueltig: einerVon('kein', 'faustpfand', 'grundpfand') },
  arrestGelegt: { p: 'sar', typ: 'bool' },
  forderungRoh: { p: 'sfo', typ: 'str', gueltig: (v) => v.length <= 16 },
  widerspruchK: { p: 'swk', typ: 'str', gueltig: einerVon('gewahrsam_schuldner', 'gewahrsam_dritter_ch', 'gewahrsam_dritter_ausland', 'grundstueck') },
  kollokationIn: { p: 'sko', typ: 'str', gueltig: einerVon('pfaendung', 'konkurs') },
  roArt: { p: 'sro', typ: 'str', gueltig: einerVon('provisorisch', 'definitiv') },
  ortPlz: { p: 'spl', typ: 'str', gueltig: (v) => /^\d{4}$/.test(v) },
  ortKanton: { p: 'skt', typ: 'str', gueltig: istKanton },
  ortGemeinde: { p: 'sgm', typ: 'str', gueltig: (v) => v.length <= 60 },
};

// ── Straf (StrafZustaendigkeitTeil) — t-Präfix ──────────────────────────────
export type StrafTeilAnliegen = StrafInput['anliegen'] | 'rechtsmittel';

export type StrafLinkZustand = {
  anliegen: StrafTeilAnliegen; tatort: StrafTatortLage; kaskade: StrafKaskade32;
  spezial: StrafSpezialforum; beteiligung: StrafBeteiligung; mehrereTaten: boolean;
  antragsdelikt: boolean; uebertretung: boolean; bund: boolean;
  minderjaehrig: boolean; kanton: Kanton | '';
};
export const STRAF_LINK_SPEC: PermalinkSpec<StrafLinkZustand & Record<string, unknown>> = {
  anliegen: { p: 'tan', typ: 'str', gueltig: einerVon('anzeige', 'gerichtsstand', 'rechtsmittel') },
  tatort: { p: 'tat', typ: 'str', gueltig: einerVon('bekannt', 'nur_erfolgsort', 'mehrere_orte', 'ausland_oder_ungewiss') },
  kaskade: { p: 'tka', typ: 'str', gueltig: einerVon('wohnsitz', 'aufenthalt', 'heimatort', 'ergreifungsort', 'auslieferung') },
  spezial: { p: 'tsp', typ: 'str', gueltig: einerVon('kein', 'medien', 'schkg_delikt', 'unternehmen', 'einziehung') },
  beteiligung: { p: 'tbe', typ: 'str', gueltig: einerVon('allein', 'teilnehmer', 'mittaeter') },
  mehrereTaten: { p: 'tmt', typ: 'bool' },
  antragsdelikt: { p: 'tad', typ: 'bool' },
  uebertretung: { p: 'tue', typ: 'bool' },
  bund: { p: 'tbu', typ: 'bool' },
  minderjaehrig: { p: 'tmi', typ: 'bool' },
  kanton: { p: 'tkt', typ: 'str', gueltig: istKanton },
};

// ── Straf-Rechtsmittel (StrafRechtsmittelTeil) — tr-Präfix; `anliegen` (tan)
// ist bewusst MIT kodiert, damit der geteilte Link die Rechtsmittel-Sicht
// öffnet (die Haupt-Spec liest denselben Schlüssel).
export type StrafRmLinkZustand = {
  anliegen: 'rechtsmittel'; entscheidTyp: StrafEntscheidTyp; werFichtAn: StrafAnfechtende;
  ziel: StrafAnfechtungsziel; uebertretung: boolean; nurZugunsten: boolean;
  revGrund: RevisionsGrund; bund: boolean; kanton: Kanton | '';
};
export const STRAF_RM_LINK_SPEC: PermalinkSpec<StrafRmLinkZustand & Record<string, unknown>> = {
  anliegen: { p: 'tan', typ: 'str', gueltig: einerVon('rechtsmittel') },
  entscheidTyp: { p: 'tre', typ: 'str', gueltig: einerVon('urteil_erstinstanz', 'strafbefehl', 'verfuegung_sta_polizei', 'anderer_entscheid_gericht', 'verfahrensleitend_gericht', 'zmg_haftentscheid', 'zmg_andere_zwangsmassnahme', 'haftentscheid_berufungsverfahren', 'rechtskraeftiges_urteil', 'rechtsverweigerung') },
  werFichtAn: { p: 'trw', typ: 'str', gueltig: einerVon('beschuldigte_person', 'privatklaegerschaft', 'staatsanwaltschaft', 'weitere_partei', 'angehoerige') },
  ziel: { p: 'trz', typ: 'str', gueltig: einerVon('umfassend', 'nur_sanktion', 'nur_zivilpunkt', 'nur_kosten') },
  uebertretung: { p: 'tru', typ: 'bool' },
  nurZugunsten: { p: 'trg', typ: 'bool' },
  revGrund: { p: 'trr', typ: 'str', gueltig: einerVon('noven', 'widerspruch', 'straftat', 'emrk') },
  bund: { p: 'trb', typ: 'bool' },
  kanton: { p: 'trk', typ: 'str', gueltig: istKanton },
};
