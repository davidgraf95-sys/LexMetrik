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
    // Führende „Regeste"-Eigenüberschrift entfernen (die Quelle stellt sie dem Text
    // voran) — die UI zeigt das Label „Regeste" separat, sonst stünde es doppelt.
    // Zwei Formate: „Regeste\n…" und mehrteilig „Regeste a\n…" (nbsp + Teilbuchstabe;
    // dort bleibt der Teilbuchstabe erhalten). „Regeste." (Satz) wird NICHT angetastet.
    .replace(/^\s*Regeste\b[^\S\n]*(?:\n+|(?=[a-zäöü]\b))/i, '')
    .replace(/\[([^\]]+)\]\((?:https?:|\/)[^)]+\)/g, '$1')
    .replace(/\s*\|\s*[^|\n]+\s*$/, '')   // OCL-Suffix " | <Rechtsgebiet>" (redundant zu sachgebiet) abschneiden
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Kurzfassung der Regeste für die Karte (erste sinnvolle Zeilen, hart gekappt). */
export function kuerzeRegeste(text: string, max = 240): string {
  const eine = text.replace(/\s+/g, ' ').trim();
  return eine.length <= max ? eine : eine.slice(0, max - 1).trimEnd() + '…';
}

/**
 * Bereinigt Urteils-Fliesstext (Sachverhalt/Erwägungen/Dispositiv) für die Anzeige —
 * Bug-Klasse, unit-getestet. OCL markiert Zitate mit eingestreuten Zeilenumbrüchen
 * und liefert Quer-Zitate als Markdown-Links samt interner URL:
 *   "(\nArt. 90 BGG\n)"  ·  "[BGE 137 III 47\nE. 1.2.2](https://…/entscheid/…)"
 * → Markdown-Links auf den Text reduzieren, EINZELNE \n (Annotations-Artefakte) zu
 * Leerzeichen, ECHTE Absätze (\n\n) erhalten, Leerzeichen vor Satzzeichen/in Klammern
 * glätten. Die Norm-Verlinkung übernimmt danach <NormText> auf dem sauberen Text.
 */
export function bereinigeFliesstext(roh: string): string {
  return String(roh)
    .replace(/\[([^\]]+)\]\((?:https?:|\/)[^)]*\)/g, '$1') // Markdown-Link -> reiner Text
    .replace(/\s*<https?:\/\/[^>]*>/g, '')                 // freistehende <URL>-Autolinks entfernen
    .replace(/\r\n/g, '\n')
    // Silbentrennung am Zeilenumbruch heilen ("wer-\nden" -> "werden"); echte
    // Komposita-Bindestriche ("Justiz-\nund …") bleiben (kleines Folgewort und/oder/…).
    .replace(/([a-zäöüß])-\n[ \t]*(?!(?:und|oder|bzw|sowie|aber|sondern)\b)([a-zäöü])/g, '$1$2')
    .split(/\n{2,}/)                     // echte Absaetze trennen
    .map((para) => para.replace(/[ \t]*\n[ \t]*/g, ' ').replace(/[ \t]{2,}/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n')                       // Absaetze mit Leerzeile zusammenfuegen
    .replace(/ +([.,;:!?)\]])/g, '$1')   // kein Leerzeichen vor Satzzeichen/Klammer-zu
    .replace(/([([]) +/g, '$1')          // kein Leerzeichen nach Klammer-auf
    .trim();
}
