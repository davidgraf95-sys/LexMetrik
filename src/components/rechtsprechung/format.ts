import { datumCh } from '../../lib/normtext/erlassKopfText';

// Kleine, geteilte Anzeige-Helfer für Karte und Zeile (reine Darstellung, §3).

// B-3-RÜCKBAU (R2-A, 31.8.2026): hier stand `export const formatiereDatum =
// datumCh` — der Alias, den B-1/B-3 als kleinsten Eingriff stehen liess. Er hat
// die sechste Kopie VERDECKT: solange derselbe Formatierer unter zwei Namen
// läuft, findet eine Sonde auf «formatiereDatum» die `datumCh`-Stellen nicht
// und umgekehrt. Ein Alias ohne eigene Aussage ist kein Baustein, sondern ein
// zweiter Name für dieselbe Wahrheit (§5) — §17-Gegengewicht: was nicht
// scheitern kann, wird gestrichen statt bewacht. Die zwei Aufrufer sind
// umgezogen: `LiveSuche` auf den `<Datum>`-Baustein (Format UND Stimme),
// `datumAnzeige` hier direkt auf `datumCh`.

/**
 * Datums-Zelle für Karte/Zeile: ein Platzhalterdatum (datumUnbekannt, BS §7.2)
 * NIE als echtes Datum zeigen (§8) — stattdessen «JJJJ, o. D.» (Jahr aus der
 * Geschäftsnummer, ohne Datum); Tooltip via DATUM_UNBEKANNT_TITEL.
 */
export function datumAnzeige(iso: string, datumUnbekannt?: boolean): string {
  return datumUnbekannt ? `${iso.slice(0, 4)}, o. D.` : datumCh(iso);
}

/** Ehrlicher Tooltip zur «o. D.»-Zelle (§8). */
export const DATUM_UNBEKANNT_TITEL =
  'Entscheiddatum nicht publiziert — Jahr aus der Geschäftsnummer';

/** Kanton-Anzeige: 'CH' → 'Bund', sonst das Kürzel. */
export function kantonLabel(kanton: string): string {
  return kanton === 'CH' ? 'Bund' : kanton;
}

const SPRACH_NAME: Record<string, string> = {
  de: 'Deutsch', fr: 'Französisch', it: 'Italienisch', rm: 'Rätoromanisch',
};

/**
 * Ehrlicher Tooltip für das Sprach-Badge nicht-deutscher Entscheide (§8, O-4):
 * BGer/eidg. Entscheide sind EINSPRACHIGE amtliche Originale — es gibt keine
 * deutsche Übersetzung. Das Badge nennt die Sprache, der Titel macht die
 * Einsprachigkeit explizit, damit niemand eine fehlende Übersetzung erwartet.
 */
export function spracheBadgeTitel(sprache: string): string {
  const name = SPRACH_NAME[sprache] ?? sprache.toUpperCase();
  return `${name}sprachiges amtliches Original — einsprachig, keine deutsche Übersetzung`;
}
