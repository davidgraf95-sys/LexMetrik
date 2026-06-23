// ─── Rechtsprechungs-Register/Manifest-Schema ───────────────────────────────
//
// Identität/Taxonomie eines Entscheids für die Übersicht (Pendant zu
// normtext/browse-typen.ts). Generiert von scripts/normtext/entscheid-manifest.ts
// nach public/rechtsprechung/register.json; lazy geladen (nie im Bundle, §3).
// Sachgebiet teilt die Rechtsgebiet-Achse der Gesetze (Verzahnung, §5).

import type { Rechtsgebiet } from '../normtext/register';
import type {
  EntscheidSprache, Entscheidquelle, Bestandstatus,
  Kuratierungsstatus, Leitcharakter, Gerichtstyp,
} from './typen';

/** Deklarierte Identität eines Entscheids (Single Source für die Übersicht). */
export interface EntscheidRegistereintrag {
  /** == Snapshot-Datei-Stamm, z.B. 'bund/bger/5A_1100_2025'. */
  key: string;
  gerichtstyp: Gerichtstyp;
  gericht: string;
  kanton: string;            // 'CH' für Bund
  nummer: string;
  bgeReferenz: string | null;
  datum: string;
  leitcharakter: Leitcharakter;
  /** Kuratiertes Sachgebiet (deklariert, nie aus legal_area geraten). */
  sachgebiet: Rechtsgebiet;
  sprache: EntscheidSprache;
  bestand: Bestandstatus;
  kuratierung: Kuratierungsstatus;
  quelle: Entscheidquelle;
  quelleUrl: string;
}

/** Manifest-Eintrag (Register + aus dem Snapshot abgeleitete Felder). */
export interface BrowseEntscheid {
  key: string;
  gericht: string;
  gerichtName: string;
  gerichtstyp: Gerichtstyp;
  kanton: string;
  nummer: string;
  bgeReferenz: string | null;
  datum: string;
  zitierung: string;
  leitcharakter: Leitcharakter;
  regesteVorhanden: boolean;
  /** Geglättete, gekappte Regeste für die Karte; null wenn keine. */
  regesteKurz: string | null;
  sachgebiet: Rechtsgebiet;
  sprache: EntscheidSprache;
  /** Register-keys der angewandten Normen (Norm-Facette + Verzahnung). */
  normKeys: string[];
  bestand: Bestandstatus;
  kuratierung: Kuratierungsstatus;
  /** Pfad relativ zu public/rechtsprechung, z.B. 'bund/bger/5A_1100_2025.json'. */
  datei: string | null;
  quelle: Entscheidquelle;
  quelleUrl: string;
  fassungsToken: string;
}

export interface EntscheidManifest {
  erzeugt: string;
  entscheide: BrowseEntscheid[];
}

/**
 * Regeste-Rohtext für die Anzeige glätten (Bug-Klasse, unit-getestet):
 * - <br> → Zeilenumbruch
 * - Markdown-Links [text](url) → text (OCL liefert Quer-Zitate als Markdown)
 * - 3+ Leerzeilen kollabieren
 * Reine Funktion, build-time UND UI.
 */
export function normalisiereRegeste(roh: string): string {
  return roh
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\[([^\]]+)\]\((?:https?:|\/)[^)]+\)/g, '$1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Kurzfassung der Regeste für die Karte (erste sinnvolle Zeilen, hart gekappt). */
export function kuerzeRegeste(text: string, max = 240): string {
  const eine = text.replace(/\s+/g, ' ').trim();
  return eine.length <= max ? eine : eine.slice(0, max - 1).trimEnd() + '…';
}
