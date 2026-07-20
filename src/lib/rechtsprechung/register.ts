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

/** Verweis-Eintrag: das vollständige Urteil zu einem BGE als eigene Übersichts-Karte,
 *  per Deep-Link auf die Detailseite des BGE mit voraktivierter Voll-Ansicht (kein Daten-Duplikat). */
export interface VolltextVerweis {
  zielKey: string;          // Snapshot-key des BGE (Detailseite)
  ansicht: 'voll';
  bgeReferenz: string;      // für das Karten-Label «… zu BGE 152 IV 14»
}

/** Rolle im Spruchkörper (amtlich namentlich, URG-Art.-5-frei). */
export type RichterRolle = 'vorsitz' | 'mitglied' | 'gerichtsschreiber';

/**
 * Ein Spruchkörper-Mitglied im Manifest — bewusst auf zwei Ein-Zeichen-Schlüssel
 * verkürzt (`s`/`r`), weil das Register bereits ~7,5 MB wiegt und der Client danach
 * filtert (§15). Der ANZEIGENAME steht nicht je Entscheid, sondern einmal je Slug im
 * Richter-Register `public/rechtsprechung/richter.json` — sonst stünde derselbe Name
 * bis zu 700× im Manifest.
 */
export interface RichterRef {
  /** Kanon-Slug (Filter-/Join-Key), z.B. 'wullschleger-stephan'. */
  s: string;
  /** Rolle im Spruchkörper. */
  r: RichterRolle;
}

/** Slug → Anzeigename + Korpus-Trefferzahl (eigene, schlanke Projektion). */
export interface RichterRegisterEintrag {
  name: string;
  /** Zahl der Entscheide, in denen die Person als Richter:in mitwirkte (ohne GS). */
  count: number;
}

export interface RichterRegister {
  erzeugt: string;
  richter: Record<string, RichterRegisterEintrag>;
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
  /** true ⇒ `datum` ist ein Platzhalter (Quelle ohne Entscheiddatum, BS §3.3/§7.2). */
  datumUnbekannt?: true;
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
  /**
   * Spruchkörper (Richter-Facette). Nur gesetzt, wenn der amtliche Besetzungs-Block
   * strukturiert werden konnte — fehlt er, fehlt das Feld (nie leeres Array, nie
   * erfundene Besetzung, §8). Anonymisierte Parteien/Gutachter erscheinen hier NIE.
   */
  richter?: RichterRef[];
  /** Gesetzt nur bei Verweis-Einträgen (vollständiges Urteil zu einem BGE); sonst undefined. */
  verweis?: VolltextVerweis | null;
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
    .replace(/^\s*(?:Regeste|Regesto|Régeste)\b[^\S\n]*(?:\n+|(?=[a-zäöü]\b))/i, '')
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
