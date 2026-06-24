// ─── Reine Regel-Lib: Identitäts-Kopf eines Entscheids ──────────────────────
//
// Leitet aus einem EntscheidSnapshot das Anzeige-Modell des EINHEITLICHEN
// Detailseiten-Kopfs ab (§3: keine UI, kein JSX — nur Daten→Daten). Die
// Komponente (EntscheidLeser.tsx) rendert das Modell, ohne selbst eine
// Ableitungsregel zu kennen.
//
// Ziel (Auftrag David 24.6.2026): jeder BGE-Detailseite liegt derselbe Aufbau
// zugrunde — Identität → genau EINE Thema-Aussage → (befüllte) Rubrum-Zeilen.
// Nie ein Loch, nie ein separater Block, der mal auftaucht; nichts erfunden (§8).
//
// SSoT (§5): die Thema-Synthese kommt aus synthThema() (browse.ts), die
// Regeste-Kürzung aus normalisiereRegeste()+kuerzeRegeste() (register.ts) —
// hier KEINE zweite Kaskade, keine eigene Textglättung.

import type { EntscheidSnapshot } from './typen';
import { synthThema } from './browse';
import { normalisiereRegeste, kuerzeRegeste } from './register';

export type KopfLabelKey = 'gegenstand' | 'parteien' | 'vorinstanz' | 'besetzung';

/** Feste Reihenfolge der Rubrum-Zeilen im Kopf (amtliche Rubrum-Folge, Art. 112 BGG). */
const RUBRUM_ORDER: KopfLabelKey[] = ['gegenstand', 'parteien', 'vorinstanz', 'besetzung'];

/** Max-Länge der Thema-Leitzeile im Kopf (kürzer als die Karten-Regeste, 1-Zeilen-Anker). */
const LEIT_MAX = 160;

export interface KopfRubrumZeile {
  label: KopfLabelKey;
  wert: string;
}

export interface KopfModell {
  /**
   * Thema-Anker im Kopf, sofern KEIN Rubrum-Gegenstand vorhanden ist:
   * gekürzte amtliche Regeste ODER (Fallback) synthThema. null ⇒ der
   * Gegenstand führt als erste Rubrum-Zeile (keine Dopplung der Thema-Aussage).
   */
  leitzeile: string | null;
  /** true ⇒ Leitzeile ist die abgeleitete Synthese (Darstellung: nüchtern + Marker, §8). */
  leitIstSynth: boolean;
  /** Nur befüllte Rubrum-Felder, in fester Reihenfolge. */
  rubrumZeilen: KopfRubrumZeile[];
}

/**
 * Kopf-Modell eines Entscheids. Invariante: im Kopf steht IMMER genau eine
 * Thema-Aussage — entweder der Rubrum-Gegenstand (führt die Rubrum-Zeilen an)
 * oder die `leitzeile` (amtliche Regeste, sonst Synthese). Rein/deterministisch.
 */
export function kopfModell(s: EntscheidSnapshot): KopfModell {
  const r = s.rubrum;
  const rubrumZeilen: KopfRubrumZeile[] = RUBRUM_ORDER
    .map((label) => ({ label, wert: (r?.[label] ?? '').trim() }))
    .filter((z) => z.wert.length > 0);

  // Hat das Rubrum einen Gegenstand, ist die Thema-Aussage damit gesetzt → keine eigene Leitzeile.
  if (rubrumZeilen.some((z) => z.label === 'gegenstand')) {
    return { leitzeile: null, leitIstSynth: false, rubrumZeilen };
  }

  // Sonst Thema-Anker bilden: amtliche Regeste (gekürzt, §8 nur kürzen) — sonst Synthese.
  if (s.regesteAmtlich && s.regeste) {
    const kurz = kuerzeRegeste(normalisiereRegeste(s.regeste.text), LEIT_MAX);
    if (kurz.length > 0) return { leitzeile: kurz, leitIstSynth: false, rubrumZeilen };
  }
  return { leitzeile: synthThema(s), leitIstSynth: true, rubrumZeilen };
}
