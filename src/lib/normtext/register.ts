// ─── Erlass-Register: Single Source of Truth für Identität + Taxonomie ──────
//
// Welche Erlasse gibt es, und wie sind sie eingeordnet? Reine Daten (§3) — KEIN
// Normtext (der lebt in den Snapshots public/normtext/*.json, §5/§7). Aus diesem
// Register + den Snapshots generiert scripts/normtext/browse-manifest.ts das
// Browse-Manifest public/normtext/register.json (Rubrik V «Gesetze»).
//
// Invariante (Tor src/tests/normtext-register.test.ts): Register ⊇ Snapshots —
// jedes Bundes-Snapshot hat genau einen Register-Eintrag, jeder Bund-Eintrag mit
// status 'snapshot' eine Datei. Taxonomie ist DEKLARIERT (§2: keine Heuristik),
// nie geraten. Ableitbares (stand/quelleUrl/Artikelzahl) steht NICHT hier,
// sondern wird vom Generator aus den Snapshots gezogen (sonst Drift).

import { FEDLEX, type FedlexGesetz } from '../fedlex';
import { BUND_STUBS } from './bund-stubs.generated';

/** Kanzleirelevante Sach-Achsen. Bund deklariert je Erlass; Kanton-Default unten. */
export type Rechtsgebiet =
  | 'privat' | 'straf' | 'prozess'
  | 'oeffentlich' | 'schkg' | 'sozial-abgaben';

export type Sprache = 'de' | 'fr' | 'it';
export type ErlassStatus = 'snapshot' | 'nur-live-link';

export interface ErlassRegistereintrag {
  /** == Snapshot-Datei-Stamm ohne .json: 'OR', 'GEBV_SCHKG', 'BE-161.12'. */
  key: string;
  ebene: 'bund' | 'kanton';
  /** nur Kanton: Kantonskürzel 'BE'. */
  kanton?: string;
  /** Anzeige-Kürzel ('OR', 'GebV SchKG'). */
  kuerzel: string;
  /** Volltitel des Erlasses. */
  titel: string;
  /** Bund: SR-Nummer ('220'); Kanton: kant. Systematiknummer. */
  sr?: string;
  rechtsgebiet: Rechtsgebiet;
  sprache: Sprache;
  /** Sortiergewicht innerhalb (ebene, rechtsgebiet); Leitgesetze niedrig. */
  rang: number;
  status: ErlassStatus;
  /** Bund: FEDLEX-Schlüssel (hält fedlex.ts ↔ Register synchron, Tor). */
  fedlexKey?: FedlexGesetz;
  /** Nur status 'nur-live-link' (kein Snapshot): Pflicht. */
  quelleUrl?: string;
  stand?: string;
}

/** Anzeige-Reihenfolge + Labels der Sach-Achsen (Übersicht Bund). */
export const GEBIETE: ReadonlyArray<{ id: Rechtsgebiet; label: string }> = [
  { id: 'privat', label: 'Privatrecht' },
  { id: 'straf', label: 'Strafrecht' },
  { id: 'prozess', label: 'Verfahrensrecht' },
  { id: 'schkg', label: 'Schuldbetreibung & Konkurs' },
  { id: 'oeffentlich', label: 'Öffentliches Recht' },
  { id: 'sozial-abgaben', label: 'Steuern, Sozialversicherung & Abgaben' },
];

export const GEBIET_LABEL: Record<Rechtsgebiet, string> = Object.fromEntries(
  GEBIETE.map((g) => [g.id, g.label]),
) as Record<Rechtsgebiet, string>;

export const GEBIET_RANG: Record<Rechtsgebiet, number> = Object.fromEntries(
  GEBIETE.map((g, i) => [g.id, i]),
) as Record<Rechtsgebiet, number>;

// ── Bundesgesetze (27) — Schlüssel == Snapshot-Datei (UPPERCASE). SR/Titel
//    aus den verifizierten ELI-Pins in fedlex.ts (§7), Gebiet deklariert. ──────
export const ERLASS_REGISTER: ReadonlyArray<ErlassRegistereintrag> = [
  // Privatrecht
  bund('ZGB', 'ZGB', 'Schweizerisches Zivilgesetzbuch', '210', 'privat', 1),
  bund('OR', 'OR', 'Bundesgesetz betreffend die Ergänzung des ZGB (Obligationenrecht)', '220', 'privat', 2),
  bund('VVG', 'VVG', 'Bundesgesetz über den Versicherungsvertrag', '221.229.1', 'privat', 3),
  bund('VMWG', 'VMWG', 'Verordnung über die Miete und Pacht von Wohn- und Geschäftsräumen', '221.213.11', 'privat', 4),
  bund('GBV', 'GBV', 'Grundbuchverordnung', '211.432.1', 'privat', 5),
  bund('HREGV', 'HRegV', 'Handelsregisterverordnung', '221.411', 'privat', 6, 'HRegV'),
  bund('GEBV_HREG', 'GebV-HReg', 'Gebührenverordnung für das Handelsregister', '221.411.1', 'privat', 7, 'GebVHReg'),
  bund('URG', 'URG', 'Bundesgesetz über das Urheberrecht und verwandte Schutzrechte', '231.1', 'privat', 8),
  bund('FUSG', 'FusG', 'Bundesgesetz über Fusion, Spaltung, Umwandlung und Vermögensübertragung (Fusionsgesetz)', '221.301', 'privat', 9, 'FusG'),
  bund('UWG', 'UWG', 'Bundesgesetz gegen den unlauteren Wettbewerb', '241', 'privat', 10),
  bund('MSCHG', 'MSchG', 'Bundesgesetz über den Schutz von Marken und Herkunftsangaben (Markenschutzgesetz)', '232.11', 'privat', 11, 'MSchG'),
  bund('PATG', 'PatG', 'Bundesgesetz über die Erfindungspatente (Patentgesetz)', '232.14', 'privat', 12, 'PatG'),
  // Privatrecht — Volltext-Ausbau 23.6.2026 (Promotion aus nur-live-link-Stubs)
  bund('PARTG', 'PartG', 'Bundesgesetz über die eingetragene Partnerschaft gleichgeschlechtlicher Paare (Partnerschaftsgesetz, PartG)', '211.231', 'privat', 21),
  bund('IPRG', 'IPRG', 'Bundesgesetz über das Internationale Privatrecht (IPRG)', '291', 'privat', 22),
  // Strafrecht
  bund('STGB', 'StGB', 'Schweizerisches Strafgesetzbuch', '311.0', 'straf', 1, 'StGB'),
  // Strafrecht — Volltext-Ausbau 23.6.2026 (Promotion aus nur-live-link-Stubs)
  bund('JSTG', 'JStG', 'Bundesgesetz über das Jugendstrafrecht (Jugendstrafgesetz, JStG)', '311.1', 'straf', 11),
  bund('BETMG', 'BetmG', 'Bundesgesetz über die Betäubungsmittel und die psychotropen Stoffe (Betäubungsmittelgesetz, BetmG)', '812.121', 'straf', 12),
  bund('VSTRR', 'VStrR', 'Bundesgesetz über das Verwaltungsstrafrecht (VStrR)', '313.0', 'straf', 13),
  // ── Volltext-Ausbau Bund Batch 2 (23.6.2026, Promotion aus Stubs) ──
  bund('KKG', 'KKG', 'Bundesgesetz über den Konsumkredit (KKG)', '221.214.1', 'privat', 23),
  bund('VGG', 'VGG', 'Bundesgesetz über das Bundesverwaltungsgericht (Verwaltungsgerichtsgesetz, VGG)', '173.32', 'prozess', 20),
  bund('BGFA', 'BGFA', 'Bundesgesetz über die Freizügigkeit der Anwältinnen und Anwälte (Anwaltsgesetz, BGFA)', '935.61', 'prozess', 21),
  bund('RPG', 'RPG', 'Bundesgesetz über die Raumplanung (Raumplanungsgesetz, RPG)', '700', 'oeffentlich', 20),
  bund('USG', 'USG', 'Bundesgesetz über den Umweltschutz (Umweltschutzgesetz, USG)', '814.01', 'oeffentlich', 21),
  bund('GWG', 'GwG', 'Bundesgesetz über die Bekämpfung der Geldwäscherei und der Terrorismusfinanzierung (Geldwäschereigesetz, GwG)', '955.0', 'oeffentlich', 22),
  bund('ATSG', 'ATSG', 'Bundesgesetz über den Allgemeinen Teil des Sozialversicherungsrechts (ATSG)', '830.1', 'sozial-abgaben', 20),
  bund('BVG', 'BVG', 'Bundesgesetz über die berufliche Alters-, Hinterlassenen- und Invalidenvorsorge (BVG)', '831.40', 'sozial-abgaben', 21),
  bund('UVG', 'UVG', 'Bundesgesetz über die Unfallversicherung (UVG)', '832.20', 'sozial-abgaben', 22),
  bund('AVIG', 'AVIG', 'Bundesgesetz über die obligatorische Arbeitslosenversicherung und die Insolvenzentschädigung (Arbeitslosenversicherungsgesetz, AVIG)', '837.0', 'sozial-abgaben', 23),
  // ── Volltext-Ausbau Bund Batch 3 (23.6.2026, Promotion aus Stubs) ──
  bund('IVG', 'IVG', 'Bundesgesetz über die Invalidenversicherung (IVG)', '831.20', 'sozial-abgaben', 24),
  bund('FAMZG', 'FamZG', 'Bundesgesetz über die Familienzulagen und Finanzhilfen an Familienorganisationen (Familienzulagengesetz, FamZG)', '836.2', 'sozial-abgaben', 25),
  bund('STHG', 'StHG', 'Bundesgesetz über die Harmonisierung der direkten Steuern der Kantone und Gemeinden (Steuerharmonisierungsgesetz, StHG)', '642.14', 'sozial-abgaben', 26),
  bund('AIG', 'AIG', 'Bundesgesetz über die Ausländerinnen und Ausländer und über die Integration (Ausländer- und Integrationsgesetz, AIG)', '142.20', 'oeffentlich', 23),
  bund('ASYLG', 'AsylG', 'Asylgesetz (AsylG)', '142.31', 'oeffentlich', 24),
  bund('GLG', 'GlG', 'Bundesgesetz über die Gleichstellung von Frau und Mann (Gleichstellungsgesetz, GlG)', '151.1', 'oeffentlich', 25),
  bund('FINMAG', 'FINMAG', 'Bundesgesetz über die Eidgenössische Finanzmarktaufsicht (Finanzmarktaufsichtsgesetz, FINMAG)', '956.1', 'oeffentlich', 26),
  bund('BGBB', 'BGBB', 'Bundesgesetz über das bäuerliche Bodenrecht (BGBB)', '211.412.11', 'privat', 24),
  // ── Volltext-Ausbau Bund Batch 4 (23.6.2026, Promotion aus Stubs) ──
  bund('AHVG', 'AHVG', 'Bundesgesetz über die Alters- und Hinterlassenenversicherung (AHVG)', '831.10', 'sozial-abgaben', 27),
  bund('BANKG', 'BankG', 'Bundesgesetz über die Banken und Sparkassen (Bankengesetz, BankG)', '952.0', 'oeffentlich', 27),
  bund('HMG', 'HMG', 'Bundesgesetz über Arzneimittel und Medizinprodukte (Heilmittelgesetz, HMG)', '812.21', 'oeffentlich', 28),
  // Verfahrensrecht
  bund('ZPO', 'ZPO', 'Schweizerische Zivilprozessordnung', '272', 'prozess', 1),
  bund('STPO', 'StPO', 'Schweizerische Strafprozessordnung', '312.0', 'prozess', 2, 'StPO'),
  bund('BGG', 'BGG', 'Bundesgesetz über das Bundesgericht (Bundesgerichtsgesetz)', '173.110', 'prozess', 3),
  bund('JSTPO', 'JStPO', 'Schweizerische Jugendstrafprozessordnung', '312.1', 'prozess', 4, 'JStPO'),
  bund('VWVG', 'VwVG', 'Bundesgesetz über das Verwaltungsverfahren', '172.021', 'prozess', 5, 'VwVG'),
  bund('BGERR', 'BGerR', 'Reglement für das Bundesgericht', '173.110.131', 'prozess', 6, 'BGerR'),
  // Schuldbetreibung & Konkurs
  bund('SCHKG', 'SchKG', 'Bundesgesetz über Schuldbetreibung und Konkurs', '281.1', 'schkg', 1, 'SchKG'),
  bund('GEBV_SCHKG', 'GebV SchKG', 'Gebührenverordnung zum SchKG', '281.35', 'schkg', 2, 'GebVSchKG'),
  // Öffentliches Recht
  bund('BV', 'BV', 'Bundesverfassung der Schweizerischen Eidgenossenschaft', '101', 'oeffentlich', 0),
  bund('SVG', 'SVG', 'Strassenverkehrsgesetz', '741.01', 'oeffentlich', 1),
  bund('DSG', 'DSG', 'Bundesgesetz über den Datenschutz', '235.1', 'oeffentlich', 2),
  bund('BBG', 'BBG', 'Bundesgesetz über die Berufsbildung', '412.10', 'oeffentlich', 3),
  bund('BEWG', 'BewG', 'Bundesgesetz über den Erwerb von Grundstücken durch Personen im Ausland (Lex Koller)', '211.412.41', 'oeffentlich', 4, 'BewG'),
  bund('KG', 'KG', 'Bundesgesetz über Kartelle und andere Wettbewerbsbeschränkungen (Kartellgesetz)', '251', 'oeffentlich', 5),
  // Steuern, Sozialversicherung & Abgaben
  bund('KVG', 'KVG', 'Bundesgesetz über die Krankenversicherung', '832.10', 'sozial-abgaben', 1),
  bund('KVV', 'KVV', 'Verordnung über die Krankenversicherung', '832.102', 'sozial-abgaben', 2),
  bund('MWSTG', 'MWSTG', 'Bundesgesetz über die Mehrwertsteuer', '641.20', 'sozial-abgaben', 3),
  bund('STG', 'StG', 'Bundesgesetz über die Stempelabgaben', '641.10', 'sozial-abgaben', 4, 'StG'),
  bund('EOG', 'EOG', 'Bundesgesetz über den Erwerbsersatz (Erwerbsersatzordnung)', '834.1', 'sozial-abgaben', 5),
  bund('ARG', 'ArG', 'Bundesgesetz über die Arbeit in Industrie, Gewerbe und Handel (Arbeitsgesetz)', '822.11', 'sozial-abgaben', 6, 'ArG'),
  bund('DBG', 'DBG', 'Bundesgesetz über die direkte Bundessteuer', '642.11', 'sozial-abgaben', 7),
  bund('VSTG', 'VStG', 'Bundesgesetz über die Verrechnungssteuer (Verrechnungssteuergesetz)', '642.21', 'sozial-abgaben', 8, 'VStG'),
  // ── Wichtige weitere Bundesgesetze als «nur-live-link»-Stubs (kein Volltext;
  //    Fedlex-Link), verifiziert via SPARQL — bund-stubs.generated.ts (§7). ──
  ...BUND_STUBS,
];

// Bund-Eintrag mit Default-Sprache de + status 'snapshot'. fedlexKey default ==
// key, wenn der FEDLEX-Schlüssel identisch ist (sonst explizit übergeben).
function bund(
  key: string, kuerzel: string, titel: string, sr: string,
  rechtsgebiet: Rechtsgebiet, rang: number, fedlexKey?: FedlexGesetz,
): ErlassRegistereintrag {
  const fk = (fedlexKey ?? key) as FedlexGesetz;
  if (!(fk in FEDLEX)) throw new Error(`bund(): FEDLEX-Schlüssel fehlt für ${key} (${fk})`);
  return { key, ebene: 'bund', kuerzel, titel, sr, rechtsgebiet, sprache: 'de', rang, status: 'snapshot', fedlexKey: fk };
}

// ── Kantonale Erlasse: Identität (Kürzel/Titel/SR/Sprache) leitet der Generator
//    aus dem Snapshot + Dateinamen ab. Das Rechtsgebiet ist hier deklariert
//    (Default unten); Abweichungen als Override. Erstklassifikation 17.6.2026 —
//    von David fall-für-fall verfeinerbar (kantonale Gruppierung primär nach
//    Kanton, Gebiet sekundär). ────────────────────────────────────────────────
export const KANTON_GEBIET_DEFAULT: Rechtsgebiet = 'oeffentlich';

/** Override key (Datei-Stamm) → Rechtsgebiet für kantonale Erlasse. */
export const KANTON_GEBIET: Readonly<Record<string, Rechtsgebiet>> = {
  // (wird mit der kantonalen Klassifikation gefüllt; leer = überall Default)
};

/** Schlägt das Rechtsgebiet eines kantonalen Erlasses nach (Override → Default). */
export function kantonGebiet(key: string): Rechtsgebiet {
  return KANTON_GEBIET[key] ?? KANTON_GEBIET_DEFAULT;
}
