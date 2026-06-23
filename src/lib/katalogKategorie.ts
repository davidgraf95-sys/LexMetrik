import { kategorieFuer, type OberkategorieId } from './oberkategorien';
import type { CalculatorCard } from './startseiteConfig';

// ─── Kategorie-Zuordnung für die Rubrik-Übersichten (/rechner, /vorlagen) ────
//
// Reine Ableitung (§3/§5): ordnet eine Katalog-Karte ihrer Oberkategorie zu
// (Fallback «vorlagen» wie in der bisherigen Katalog-Logik) und filtert die
// Karten EINER Kategorie heraus. Kein eigenes Ranking, keine Rechtslogik.

export const kategorieVonKarte = (k: CalculatorCard): OberkategorieId => kategorieFuer(k) ?? 'vorlagen';

/** Karten EINER Oberkategorie in Katalog-Reihenfolge. */
export function kartenDerKategorie(karten: CalculatorCard[], katId: OberkategorieId): CalculatorCard[] {
  return karten.filter((k) => kategorieVonKarte(k) === katId);
}
