// Kleine, geteilte Anzeige-Helfer für Karte und Zeile (reine Darstellung, §3).

/** ISO 'YYYY-MM-DD' → 'DD.MM.YYYY' (de-CH); unverändert, wenn kein ISO-Datum. */
export function formatiereDatum(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

/** Kanton-Anzeige: 'CH' → 'Bund', sonst das Kürzel. */
export function kantonLabel(kanton: string): string {
  return kanton === 'CH' ? 'Bund' : kanton;
}
