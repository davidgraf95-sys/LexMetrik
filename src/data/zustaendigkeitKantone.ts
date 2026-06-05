import type { Kanton } from '../types/legal';
import { behoerdeFuer, type BehoerdenAdresse, type EingabeArt } from '../lib/vorlagen/behoerden';
import type { SchlichtungsbehoerdeTyp } from '../lib/zustaendigkeit';

// ─── Zuständigkeits-Kantonsschicht (Phase 2) — datierte Parameter ────────────
//
// Art. 4 ZPO: Sachliche und funktionelle Zuständigkeit regelt das KANTONALE
// Recht. Diese Datei hält je Kanton die dafür nötigen, datierten Stammdaten
// (Pflege wie AV_MINDESTLOEHNE: stand + quelle; Rhythmus «bei GOG-Revision»).
// Adressen kommen aus der bestehenden Registry lib/vorlagen/behoerden.ts —
// KEIN Zweitbestand (§5). Nicht erfasste Kantone liefern null → die UI zeigt
// ein ehrliches «noch nicht erfasst» (§8/§13); nie raten.
//
// Pilot: BS (Stammdaten amtlich am Staatskalender BS verifiziert, 5.6.2026;
// Recherche-Dossier für weitere Kantone: bibliothek/behoerden/schlichtungsbehoerden-
// kantone.md — Übernahme erst nach fachlicher Abnahme).

export interface KantonZustaendigkeit {
  kanton: Kanton;
  stand: string;                   // Verifikationsdatum der Einträge
  quelle: string;                  // amtliche Quelle
  /** Hat der Kanton ein Handelsgericht (Art. 6 ZPO)? Real: ZH/BE/AG/SG. */
  handelsgericht: boolean;
  /** Kantonale Streitwertgrenze Einzelgericht ↔ Kollegium (GOG/EG ZPO);
   *  null = noch nicht am kantonalen Erlass verifiziert (offen, §11). */
  einzelgerichtBisCHF: number | null;
  /** Erstinstanzliches Zivilgericht (Name; Adresse über behoerden.ts, sobald
   *  als eigene EingabeArt erfasst). */
  erstinstanzName: string | null;
  /** Politische Gemeinden des Kantons (örtliche Auflösung Gemeinde → Kanton). */
  gemeinden: readonly string[];
}

export const ZUSTAENDIGKEIT_KANTONE: Partial<Record<Kanton, KantonZustaendigkeit>> = {
  BS: {
    kanton: 'BS',
    stand: '5.6.2026',
    quelle: 'staatskalender.bs.ch (Behörden); GOG BS SG 154.100 (Erlass-Seite — §-genaue Verifikation offen)',
    handelsgericht: false,          // BS kennt kein Handelsgericht (Art. 6 ist Kann-Vorschrift)
    einzelgerichtBisCHF: null,      // GOG-BS-Schwelle Einzelgericht: offene Verifikation (§11)
    erstinstanzName: 'Zivilgericht Basel-Stadt',
    gemeinden: ['Basel', 'Riehen', 'Bettingen'],
  },
};

/** Ist der Kanton in der Zuständigkeits-Kantonsschicht erfasst? */
export function kantonErfasst(kanton: Kanton): boolean {
  return ZUSTAENDIGKEIT_KANTONE[kanton] != null;
}

export function kantonZustaendigkeit(kanton: Kanton): KantonZustaendigkeit | null {
  return ZUSTAENDIGKEIT_KANTONE[kanton] ?? null;
}

// Behördentyp (Bundesrecht, Art. 197/200 ZPO) → EingabeArt der Adress-Registry.
// GlG: Die paritätische Stelle nach Art. 200 Abs. 2 ZPO ist in BS die
// Kantonale Schlichtungsstelle für Diskriminierungsfragen.
const TYP_ZU_EINGABEART: Record<SchlichtungsbehoerdeTyp, EingabeArt> = {
  ordentlich: 'schlichtungsbehoerde_zivil',
  paritaetisch_miete: 'schlichtungsstelle_miete',
  paritaetisch_glg: 'schlichtungsstelle_diskriminierung',
};

/** Konkrete Schlichtungsstelle (mit Adresse) für Kanton + Behördentyp;
 *  null, wenn Kanton oder Stelle (noch) nicht erfasst ist — nie raten. */
export function stelleFuer(kanton: Kanton, typ: SchlichtungsbehoerdeTyp): BehoerdenAdresse | null {
  if (!kantonErfasst(kanton)) return null;
  return behoerdeFuer(TYP_ZU_EINGABEART[typ], kanton);
}

/** Gehört die Gemeinde (Freitext) zum erfassten Kanton? Deterministischer
 *  Namensvergleich (trim/case); unbekannte Gemeinden → false (keine Heuristik). */
export function gemeindeImKanton(kanton: Kanton, gemeinde: string): boolean {
  const k = ZUSTAENDIGKEIT_KANTONE[kanton];
  if (!k) return false;
  const ziel = gemeinde.trim().toLowerCase();
  return ziel !== '' && k.gemeinden.some((g) => g.toLowerCase() === ziel);
}
