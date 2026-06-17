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
  // Strafrecht
  bund('STGB', 'StGB', 'Schweizerisches Strafgesetzbuch', '311.0', 'straf', 1, 'StGB'),
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
  bund('SVG', 'SVG', 'Strassenverkehrsgesetz', '741.01', 'oeffentlich', 1),
  bund('DSG', 'DSG', 'Bundesgesetz über den Datenschutz', '235.1', 'oeffentlich', 2),
  bund('BBG', 'BBG', 'Bundesgesetz über die Berufsbildung', '412.10', 'oeffentlich', 3),
  bund('BEWG', 'BewG', 'Bundesgesetz über den Erwerb von Grundstücken durch Personen im Ausland (Lex Koller)', '211.412.41', 'oeffentlich', 4, 'BewG'),
  // Steuern, Sozialversicherung & Abgaben
  bund('KVG', 'KVG', 'Bundesgesetz über die Krankenversicherung', '832.10', 'sozial-abgaben', 1),
  bund('KVV', 'KVV', 'Verordnung über die Krankenversicherung', '832.102', 'sozial-abgaben', 2),
  bund('MWSTG', 'MWSTG', 'Bundesgesetz über die Mehrwertsteuer', '641.20', 'sozial-abgaben', 3),
  bund('STG', 'StG', 'Bundesgesetz über die Stempelabgaben', '641.10', 'sozial-abgaben', 4, 'StG'),
  bund('EOG', 'EOG', 'Bundesgesetz über den Erwerbsersatz (Erwerbsersatzordnung)', '834.1', 'sozial-abgaben', 5),
  bund('ARG', 'ArG', 'Bundesgesetz über die Arbeit in Industrie, Gewerbe und Handel (Arbeitsgesetz)', '822.11', 'sozial-abgaben', 6, 'ArG'),
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
