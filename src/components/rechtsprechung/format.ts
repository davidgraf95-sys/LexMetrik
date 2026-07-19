// Kleine, geteilte Anzeige-Helfer für Karte und Zeile (reine Darstellung, §3).

/** ISO 'YYYY-MM-DD' → 'DD.MM.YYYY' (de-CH); unverändert, wenn kein ISO-Datum. */
export function formatiereDatum(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

/**
 * Datums-Zelle für Karte/Zeile: ein Platzhalterdatum (datumUnbekannt, BS §7.2)
 * NIE als echtes Datum zeigen (§8) — stattdessen «JJJJ, o. D.» (Jahr aus der
 * Geschäftsnummer, ohne Datum); Tooltip via DATUM_UNBEKANNT_TITEL.
 */
export function datumAnzeige(iso: string, datumUnbekannt?: boolean): string {
  return datumUnbekannt ? `${iso.slice(0, 4)}, o. D.` : formatiereDatum(iso);
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
