// ─── Katalog-Filterlogik (Suche + Pill-Filter) als reine Funktion ───────────
//
// Extrahiert aus components/Katalog.tsx (Fahrplan Katalog-UI, Etappe 0.1) —
// verhaltensneutral (§6): exakt dieselbe Treffer-Semantik wie zuvor inline.
// Als lib-Funktion ist die Auffindbarkeit testbar: die Suchbegriff-Goldliste
// (katalogSuche.test.ts) fährt gegen DIESELBE Logik wie die UI (§5).

import type { CalculatorCard } from './startseiteConfig';

export interface KatalogFilter {
  /** Rechtsgebiet-Filter (leer = alle). */
  gebiete: ReadonlySet<string>;
  /** Rechtsbereich-Filter (leer = alle). */
  bereiche: ReadonlySet<string>;
  /** Output-/Dokument-Typ-Filter (leer = alle). */
  arten: ReadonlySet<string>;
  /** Geplantes ausblenden (Status-Schnitt «Nur verfügbare»). */
  nurVerfuegbar: boolean;
  /** Freitext-Suche über Titel, Rechtsgebiet, Keywords und Norm-Labels. */
  suche: string;
}

export const LEERER_FILTER: KatalogFilter = {
  gebiete: new Set(), bereiche: new Set(), arten: new Set(),
  nurVerfuegbar: false, suche: '',
};

/** Trifft die Freitext-Suche diese Karte? (leere Suche trifft immer) */
export function sucheTrifft(k: CalculatorCard, suche: string): boolean {
  const q = suche.trim().toLowerCase();
  if (q === '') return true;
  // Normverweise kompakt (ohne Leerzeichen) abgleichen, damit «Art. 335c»,
  // «Art.335c» und «335c» gleichermassen treffen.
  const qKompakt = q.replace(/\s+/g, '');
  return (
    [k.title, k.rechtsgebiet, ...(k.keywords ?? [])].some((t) => t.toLowerCase().includes(q)) ||
    k.norms.some((n) => n.label.toLowerCase().replace(/\s+/g, '').includes(qKompakt))
  );
}

/** Gesamtprädikat des Katalogs: Pill-Filter UND Freitext-Suche. */
export function kartePasst(k: CalculatorCard, f: KatalogFilter): boolean {
  return (
    (f.gebiete.size === 0 || f.gebiete.has(k.rechtsgebiet)) &&
    (f.bereiche.size === 0 || f.bereiche.has(k.rechtsbereich)) &&
    (f.arten.size === 0 || f.arten.has(k.art)) &&
    (!f.nurVerfuegbar || k.status !== 'geplant') &&
    sucheTrifft(k, f.suche)
  );
}
