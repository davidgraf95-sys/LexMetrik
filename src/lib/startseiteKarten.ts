// ─── Rechner-Karten (RechnerCard) ─────────────────────────────────────────
//
// Aus startseiteConfig.ts ausgelagert (§6 Datei-Schlankheit) — Inhalt
// byte-identisch. Single source of truth für die Rechner-Karten (§5).
// Verifizierte Fedlex-Basis-URLs/Anker zentral in src/lib/fedlex.ts.
//
// H-10 (§6.6, B26): Katalog entlang der Rubrik-Blöcke in drei Teilmodule
// gesplittet; hier per Spread in ORIGINAL-Key-Reihenfolge zusammengeführt
// (Beweis: Vorher/Nachher-JSON.stringify identisch, Hashes im Commit).
import type { CalculatorCard } from './startseiteConfigTypen';
import { KARTEN_FRISTEN } from './startseiteKartenFristen';
import { KARTEN_BETRAEGE_WERKZEUGE } from './startseiteKartenBetraegeWerkzeuge';
import { KARTEN_AUSBAU } from './startseiteKartenAusbau';

export const KARTEN: Record<string, CalculatorCard> = {
  ...KARTEN_FRISTEN,
  ...KARTEN_BETRAEGE_WERKZEUGE,
  ...KARTEN_AUSBAU,
};
