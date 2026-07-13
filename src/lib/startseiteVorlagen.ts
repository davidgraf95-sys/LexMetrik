// ─── Vorlagen-Karten (VorlageCard) ────────────────────────────────────────
//
// Aus startseiteConfig.ts ausgelagert (§6 Datei-Schlankheit) — Inhalt
// byte-identisch. Single source of truth für die Vorlagen-Karten (§5).
//
// H-10 (§6.6, B26): Katalog entlang der Rubrik-Blöcke in drei Teilmodule
// gesplittet; hier per Spread in ORIGINAL-Key-Reihenfolge zusammengeführt
// (Beweis: Vorher/Nachher-JSON.stringify identisch, Hashes im Commit).
import type { VorlageCard } from './startseiteConfigTypen';
import { VORLAGEN_VORSORGE_VERTRAEGE } from './startseiteVorlagenVorsorgeVertraege';
import { VORLAGEN_EINGABEN_GESELLSCHAFT } from './startseiteVorlagenEingabenGesellschaft';
import { VORLAGEN_AUSBAU } from './startseiteVorlagenAusbau';

// ─── Vorlagen-Katalog (Modus «Vorlagen»; Start: alle «In Vorbereitung») ────
//
// Normentreue: geplante Vorlagen ohne Norm-Pills und ohne Artikel-/Tages-
// angaben; schemaId erst bei Status «geprüft». Cross-Links via `related`
// modusübergreifend (Vorlage ↔ Rechner).

export const VORLAGEN: Record<string, VorlageCard> = {
  ...VORLAGEN_VORSORGE_VERTRAEGE,
  ...VORLAGEN_EINGABEN_GESELLSCHAFT,
  ...VORLAGEN_AUSBAU,
};
