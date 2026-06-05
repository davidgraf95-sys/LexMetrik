import type { Kanton } from '../types/legal';

// ─── Handelsgerichte (Art. 6 ZPO — nur 4 Kantone führen eines) ──────────────
// Anordnung David 5.6.2026 («baue in den relevanten kantonen auch das
// handelsgericht ein»). Quellen: zweifach geprüfte Dossiers gerichts-
// behoerden-kantone.md / gerichtsadressen-erstliste.md (Audit) /
// gog-gerichtsorganisation-kantone.md (Normen), Abruf 5.6.2026.
// In allen anderen Kantonen besteht KEIN Handelsgericht (Art. 6 Abs. 1 ZPO
// ist eine Kann-Vorschrift) — die HG-Weiche der Engine ist dort gegenstandslos.

export interface Handelsgericht {
  name: string;
  strasse: string;
  plzOrt: string;
  organisation: string;
}

export const HANDELSGERICHTE: Partial<Record<Kanton, Handelsgericht>> = {
  ZH: {
    name: 'Handelsgericht des Kantons Zürich',
    strasse: 'Hirschengraben 15, Postfach',
    plzOrt: '8021 Zürich',
    organisation: 'eigenes Gericht am Obergerichts-Komplex (§§ 36/38/44 GOG ZH; einzige kantonale Instanz)',
  },
  BE: {
    name: 'Handelsgericht des Kantons Bern',
    strasse: 'Hochschulstrasse 17, Postfach',
    plzOrt: '3012 Bern',
    organisation: 'Teil der Zivilabteilung des Obergerichts (Art. 35 Abs. 3/43/45 Abs. 2 GSOG; Spruchkörper mit 2 Fachrichtern)',
  },
  AG: {
    name: 'Handelsgericht des Kantons Aargau',
    strasse: 'Obere Vorstadt 40, Postfach',
    plzOrt: '5001 Aarau',
    organisation: 'Abteilung des Obergerichts — eigener Standort Nr. 40 (Re-Audit 6.6.2026; Nr. 38 = Obergericht); Besucher-PLZ 5000',
  },
  SG: {
    name: 'Handelsgericht des Kantons St. Gallen',
    strasse: 'Klosterhof 1',
    plzOrt: '9001 St. Gallen',
    organisation: 'am Kantonsgericht (Art. 13 GerG SG; Entscheide seit 2018)',
  },
};

export const HG_KANTONE = Object.keys(HANDELSGERICHTE) as Kanton[];

export function handelsgerichtFuer(kanton: Kanton): Handelsgericht | null {
  return HANDELSGERICHTE[kanton] ?? null;
}
