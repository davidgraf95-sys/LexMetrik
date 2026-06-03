import { parseISO, isBefore, isAfter } from 'date-fns';
import type { Berechnungsergebnis, Normverweis } from '../../types/legal';
import type { ZpoErgebnis, ZpoEinheit } from '../../types/zpo';
import { stillstandsperioden } from '../../data/zpoFeiertage';

// ─── ZPO-spezifische PDF-Ableitungen ──────────────────────────────────────
//
// Leitet «anwendbar»-Flags aus den vorhandenen Ergebnisdaten ab, OHNE die
// Berechnung zu ändern. Domänenwissen liegt hier (nicht in der gemeinsamen
// Vorlage); die Vorlage rendert nur, was die Konfiguration liefert.

/** Überschneidet der Fristenlauf mindestens eine Stillstandsperiode? */
export function stillstandBeruehrtLauf(e: ZpoErgebnis): boolean {
  if (!e.stillstandAktiv) return false;
  const von = parseISO(e.ereignisISO);
  const bis = parseISO(e.diesAdQuemISO);
  for (let j = von.getFullYear() - 1; j <= bis.getFullYear() + 1; j++) {
    for (const p of stillstandsperioden(j)) {
      if (!isAfter(p.von, bis) && !isBefore(p.bis, von)) return true;
    }
  }
  return false;
}

/** Nur einschlägige Normverweise: Art. 145 ZPO nur bei Stillstand-Kontakt. */
export function zpoPdfCitations(e: ZpoErgebnis): Normverweis[] {
  return stillstandBeruehrtLauf(e)
    ? e.normverweise
    : e.normverweise.filter((n) => !n.artikel.startsWith('Art. 145'));
}

/**
 * PDF-Fassung des Ergebnisses: Bei Tagesfristen ist der Berechnungsmodus
 * (BGer 5A_691/2023, nur Wochen-/Monats-/Jahresfristen) nicht einschlägig –
 * die entsprechende Annahme-Zeile wird reduziert.
 */
export function zpoPdfErgebnis(e: ZpoErgebnis, einheit: ZpoEinheit): Berechnungsergebnis {
  if (einheit !== 'tage') return e;
  return { ...e, annahmen: e.annahmen.map((a) => (a.includes('5A_691/2023') ? 'Fristtyp: tage.' : a)) };
}
