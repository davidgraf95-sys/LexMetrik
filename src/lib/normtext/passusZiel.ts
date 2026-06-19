// Passus-Ziel-Bestimmung: welche Stelle eines Artikel-Snapshots ist zitiert?
// Reine, deterministische Logik (§2/§3) — gemeinsame Wahrheit für die
// Darstellung (ArtikelBody: Hervorhebung) UND den Live-Link-Sprung (NormPopover:
// Text-Fragment). Vorher inline in NormPopover.tsx; ausgelagert, damit Popover
// und die Gesetzes-Lesesicht (Rubrik V) denselben Treffer berechnen — keine
// zweite Wahrheit (§5). Verhaltensneutral aus NormPopover übernommen.

import type { NormSnapshot } from './typen';

type Block = NormSnapshot['bloecke'][number];
type Item = NonNullable<Block['items']>[number];

/** Das zitierte Stück: Absatz und (optional) lit./Ziff.-Marke. */
export interface PassusInfo {
  absatz: string | null;
  lit?: string;
  ziff?: string;
}

/** Aufgelöstes Ziel: normalisierte Marke, Item-Koordinate, Block/Item-Treffer. */
export interface PassusZiel {
  /** Normalisierte lit/Ziff-Marke oder null (nur Absatz / nichts zitiert). */
  passusMarke: string | null;
  /** Koordinate des EINEN markierten Items oder null. */
  zielItemKey: { bi: number; ji: number } | null;
  /** Hervorzuhebender Absatz-Block (nur Absatz zitiert) oder undefined. */
  hervorBlock: Block | undefined;
  /** Hervorzuhebendes Item (lit/Ziff zitiert) oder undefined. */
  hervorItem: Item | undefined;
}

// Vergleichs-Normalisierung für lit/Ziff-Marken: case-insensitive, ohne
// umschliessende Punkte/Klammern/Leerzeichen ('a)', '(a)', '17.', ' b ' → 'a',
// '17', 'b'). Innere Suffixe (z.B. '5a', '20a', 'bis') bleiben erhalten — die
// Marke wird nur an den Rändern gesäubert, damit lit/Ziff aus dem Zitat exakt
// gegen die Snapshot-Marke matcht (einheitlich Bund-lit ↔ Kanton-Ziff).
export function markeNorm(s: string): string {
  return s.trim().replace(/^[.()\s]+|[.()\s]+$/g, '').toLowerCase();
}

// Absatz-Vergleichs-Normalisierung: nachgestellte Punkte/Whitespace strippen.
// Manche Snapshots tragen den Absatz als «1.» (z.B. FR-261.16), das Zitat aber
// als «1» — ohne Normalisierung matchten sie nicht und die Hervorhebung griffe
// nicht. Innere Form bleibt unangetastet (nur die Ränder rechts werden gesäubert).
export function absatzNorm(a: string | null): string | null {
  return a?.replace(/[.\s]+$/, '') ?? null;
}

/**
 * Bestimmt aus den Blöcken eines Snapshots und dem zitierten Passus genau EINE
 * hervorzuhebende Stelle. Ist ein lit/ziff zitiert, gilt GENAU das erste in
 * Dokumentreihenfolge passende Item (B1: bei gleicher Marke in mehreren Blöcken
 * nur das erste). Sonst (nur Absatz) der passende Block.
 */
export function bestimmePassusZiel(bloecke: Block[], passus: PassusInfo): PassusZiel {
  const passusMarke = passus.lit != null
    ? markeNorm(passus.lit)
    : passus.ziff != null ? markeNorm(passus.ziff) : null;

  const hervorBlock = passus.absatz != null
    ? bloecke.find((b) => absatzNorm(b.absatz) === absatzNorm(passus.absatz))
    : undefined;

  const zielItemKey = (() => {
    if (passusMarke == null) return null;
    for (let bi = 0; bi < bloecke.length; bi++) {
      const b = bloecke[bi];
      const istZielBlock = passus.absatz == null || absatzNorm(b.absatz) === absatzNorm(passus.absatz);
      if (!istZielBlock || b.items == null) continue;
      const ji = b.items.findIndex((it) => markeNorm(it.marke) === passusMarke);
      if (ji >= 0) return { bi, ji };
    }
    return null;
  })();

  const hervorItem = zielItemKey != null
    ? bloecke[zielItemKey.bi].items![zielItemKey.ji]
    : undefined;

  return { passusMarke, zielItemKey, hervorBlock, hervorItem };
}
