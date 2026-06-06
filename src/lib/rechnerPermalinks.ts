import { permalinkKodieren, istISO, istKanton, einerVon, type PermalinkSpec } from './permalink';
import type { SperrfristenInput } from '../types/legal';

// ─── Geteilte Rechner-Permalink-Specs (FAHRPLAN-PRAXIS 1.3/2.1) ─────────────
//
// Hier liegen die Specs jener Rechner, deren Links auch VON ANDEREN Seiten
// vorbefüllt erzeugt werden (Prefill-Brücken, Etappe 2.1) — eine Spec, zwei
// Nutzer: die Form liest/teilt, die Quell-Seite baut den vorbefüllten Link
// (§5: dieselbe Kodierung an genau einer Stelle). Reine Infrastruktur (§3).

// ── ZPO-Fristenrechner ──────────────────────────────────────────────────────

export type ZpoLink = {
  ereignis: string; einheit: string; laenge: number; verfahren: string;
  kanton: string; fristnatur: string; zustellart?: string; modus?: string;
  gerichtshinweisStillstand?: boolean;
  erstreckungAn?: boolean; erstreckungLaenge?: number; erstreckungEinheit?: string;
};

export const ZPO_LINK_SPEC: PermalinkSpec<ZpoLink & Record<string, unknown>> = {
  ereignis: { p: 'e', typ: 'str', gueltig: istISO },
  einheit: { p: 'u', typ: 'str', gueltig: einerVon('tage', 'wochen', 'monate', 'jahre') },
  laenge: { p: 'l', typ: 'num', gueltig: (n) => Number.isInteger(n) && n > 0 },
  verfahren: { p: 'v', typ: 'str', gueltig: einerVon('ordentlich', 'vereinfacht', 'familienrecht', 'klagefrist_klagebewilligung', 'schlichtung', 'summarisch', 'rechtsmittel_summarisch') },
  kanton: { p: 'k', typ: 'str', gueltig: istKanton },
  fristnatur: { p: 'n', typ: 'str', gueltig: einerVon('gesetzlich', 'gerichtlich') },
  zustellart: { p: 'z', typ: 'str', gueltig: einerVon('empfangsbestaetigung', 'gewoehnliche_post') },
  modus: { p: 'm', typ: 'str', gueltig: einerVon('bundesgericht', 'mindermeinung') },
  gerichtshinweisStillstand: { p: 'gh', typ: 'bool' },
  erstreckungAn: { p: 'ea', typ: 'bool' },
  erstreckungLaenge: { p: 'el', typ: 'num', gueltig: (n) => Number.isInteger(n) && n > 0 },
  erstreckungEinheit: { p: 'eu', typ: 'str', gueltig: einerVon('tage', 'wochen') },
};

/** Vorbefüllter Link in den ZPO-Fristenrechner (Brücke 2.1a). */
export function zpoFristenLink(teil: Partial<ZpoLink>): string {
  return '/rechner/zpo-fristen' + permalinkKodieren(ZPO_LINK_SPEC, teil as ZpoLink & Record<string, unknown>);
}

// ── Kündigungs-/Sperrfristen-Rechner ────────────────────────────────────────

export const SPERR_TYPEN_GUELTIG = new Set(['krankheit_unfall', 'schwangerschaft', 'mutterschaftsurlaub_verlaengert', 'zusatzurlaub_tod_elternteil', 'urlaub_tod_mutter', 'militaer_zivil', 'hilfsaktion', 'betreuungsurlaub']);

export const KSP_LINK_SPEC: PermalinkSpec<SperrfristenInput & Record<string, unknown>> = {
  vertragsbeginn: { p: 'vb', typ: 'str', gueltig: istISO },
  zugangKuendigung: { p: 'z', typ: 'str', gueltig: istISO },
  kuendigendePartei: { p: 'kp', typ: 'str', gueltig: einerVon('arbeitgeber', 'arbeitnehmer') },
  probezeitMonate: { p: 'pm', typ: 'num', gueltig: (n) => n >= 0 && n <= 3 },
  abweichendeFristMonate: { p: 'af', typ: 'num', gueltig: (n) => n >= 0 },
  abweichendeFristFormGueltig: { p: 'ag', typ: 'bool' },
  abweichendeFristQuelleGAV: { p: 'aq', typ: 'bool' },
  kuendigungsterminMonatsende: { p: 'me', typ: 'bool' },
  vaterschaftsurlaubResttage: { p: 'vu', typ: 'num', gueltig: (n) => Number.isInteger(n) && n >= 0 },
  sperrereignisse: {
    p: 'se', typ: 'json',
    gueltig: (v): boolean => Array.isArray(v) && v.length <= 20 && v.every((e) =>
      e && typeof e === 'object'
      && SPERR_TYPEN_GUELTIG.has((e as { typ?: string }).typ ?? '')
      && istISO((e as { von?: string }).von ?? '') && istISO((e as { bis?: string }).bis ?? '')),
  },
};

/** Vorbefüllter Link in den Kündigungs-/Sperrfristen-Rechner (Brücke 2.1c).
 *  Der Rechner lebt als Tab «B+C» unter /rechner/kuendigung (Hash-Vorauswahl). */
export function sperrfristenLink(teil: Partial<SperrfristenInput>): string {
  const q = permalinkKodieren(KSP_LINK_SPEC, teil as SperrfristenInput & Record<string, unknown>);
  return '/rechner/kuendigung' + q + '#kuendigung';
}

// ── Fristenspiegel (FAHRPLAN-PRAXIS 3.1b/3.1c) ─────────────────────────────

import type { VermieterkuendigungSpiegelInput } from './fristenspiegel/vermieterkuendigung';
import type { ZivilentscheidSpiegelInput } from './fristenspiegel/zivilentscheid';
import type { KlagebewilligungSpiegelInput } from './fristenspiegel/klagebewilligung';
import type { ErbgangSpiegelInput } from './fristenspiegel/erbgang';

type FspFelder = { ereignis: string }
  & Partial<VermieterkuendigungSpiegelInput>
  & Partial<ZivilentscheidSpiegelInput>
  & Partial<KlagebewilligungSpiegelInput>
  & Partial<ErbgangSpiegelInput>;

export const FSP_LINK_SPEC: PermalinkSpec<FspFelder & Record<string, unknown>> = {
  ereignis: { p: 'ev', typ: 'str', gueltig: einerVon('vermieterkuendigung', 'zivilentscheid', 'zahlungsbefehl', 'klagebewilligung', 'erbgang', 'agkuendigung') },
  kanton: { p: 'k', typ: 'str', gueltig: istKanton },
  // A.4 Vermieter-Kündigung
  zugang: { p: 'z', typ: 'str', gueltig: istISO },
  objekt: { p: 'o', typ: 'str', gueltig: einerVon('wohnung', 'geschaeftsraum') },
  kuendigungsart: { p: 'a', typ: 'str', gueltig: einerVon('ordentlich', 'zahlungsverzug', 'pflichtverletzung', 'wichtige_gruende') },
  // A.1 Zivilentscheid (3.1c)
  zustellung: { p: 'zu', typ: 'str', gueltig: istISO },
  vermoegensrechtlich: { p: 'vr', typ: 'bool' },
  streitwertCHF: { p: 'sw', typ: 'num', gueltig: (n) => Number.isFinite(n) && n >= 0 },
  verfahren: { p: 'vf', typ: 'str', gueltig: einerVon('ordentlich_vereinfacht', 'summarisch') },
  familienSummarsache: { p: 'fs', typ: 'bool' },
  mietOderArbeit: { p: 'ma', typ: 'bool' },
  nurDispositiv: { p: 'nd', typ: 'bool' },
  // A.7 Klagebewilligung · A.6 Erbgang (3.1d)
  mietOderPacht: { p: 'mp', typ: 'bool' },
  erbenstellung: { p: 'es', typ: 'str', gueltig: einerVon('gesetzlich', 'eingesetzt') },
};

/** Vereinigte Link-Felder aller Spiegel-Ereignisse; `ereignis` wählt den Zweig. */
export type FspLink = FspFelder;

/** Vorbefüllter Link in den Fristenspiegel (Brücken-Ziel, z. B. aus dem Mietrechner). */
export function fristenspiegelLink(teil: Partial<FspLink>): string {
  return '/rechner/fristenspiegel' + permalinkKodieren(FSP_LINK_SPEC, teil as FspLink & Record<string, unknown>);
}
