// ─── Zweiachsiger Einstieg: Rechtsgebiet × Aufgabe (ROADMAP Schritt 5) ──────
//
// «Ein Index → mehrere Oberflächen» (§5): die Auffindbarkeits-Schicht leitet
// sich AUSSCHLIESSLICH aus dem Katalog (`ALLE_KARTEN`) ab — kein zweiter Pfad,
// keine eigene Zuordnungs-Tabelle. Achse 1 = Rechtsgebiet (`karte.rechtsgebiet`,
// kanonisiert über RECHTSGEBIET_SEKTIONEN); Achse 2 = Aufgabe (`kategorieFuer`,
// die vier Oberkategorien). Reine Daten-Projektion (§3), nur VERFÜGBARE Karten
// (§8: kein toter Link). Das /rechner-Register (Achse Aufgabe) und diese
// Gebiets-Achse speisen sich aus derselben Quelle.

import { ALLE_KARTEN, istVerfuegbar, type CalculatorCard } from './startseiteConfig';
import { kategorieFuer, OBERKATEGORIEN, type OberkategorieId } from './oberkategorien';
import { RECHTSGEBIET_SEKTIONEN } from './startseiteConfigTypen';

export interface EinstiegZelle {
  kategorie: OberkategorieId;
  titel: string;
  karten: CalculatorCard[];
}

export interface EinstiegGebiet {
  gebiet: string;       // RECHTSGEBIET_SEKTIONEN[].name
  id: string;           // RECHTSGEBIET_SEKTIONEN[].id (Anker-/Key-tauglich)
  lede: string;
  anzahl: number;       // Summe verfügbarer Karten im Gebiet
  zellen: EinstiegZelle[]; // nur nicht-leere Aufgaben-Zellen, in OBERKATEGORIEN-Reihenfolge
}

const KAT_TITEL: Record<OberkategorieId, string> = Object.fromEntries(
  OBERKATEGORIEN.map((k) => [k.id, k.titel]),
) as Record<OberkategorieId, string>;

/**
 * Zweiachsige Matrix: je Rechtsgebiet die verfügbaren Karten, gruppiert nach
 * Aufgabe. Gebiete ohne verfügbare Karte fallen weg (§8). Reihenfolge der
 * Gebiete = RECHTSGEBIET_SEKTIONEN, der Aufgaben = OBERKATEGORIEN.
 */
export function einstiegMatrix(): EinstiegGebiet[] {
  const verfuegbar = ALLE_KARTEN.filter((k) => istVerfuegbar(k));
  const out: EinstiegGebiet[] = [];

  for (const sektion of RECHTSGEBIET_SEKTIONEN) {
    const imGebiet = verfuegbar.filter((k) => k.rechtsgebiet === sektion.name);
    if (imGebiet.length === 0) continue;

    const zellen: EinstiegZelle[] = [];
    for (const kat of OBERKATEGORIEN) {
      const karten = imGebiet.filter((k) => kategorieFuer(k) === kat.id);
      if (karten.length > 0) zellen.push({ kategorie: kat.id, titel: KAT_TITEL[kat.id], karten });
    }
    out.push({
      gebiet: sektion.name,
      id: sektion.id,
      lede: sektion.lede,
      anzahl: imGebiet.length,
      zellen,
    });
  }
  return out;
}
