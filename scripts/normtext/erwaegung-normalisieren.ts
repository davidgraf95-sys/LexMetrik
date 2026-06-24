// ─── Deterministische Erwägungs-Normalisierung (rein, browserlos, §2/§3) ──────
//
// EINE reine Funktion, die einen Erwägungs-Abschnitt zu konsistenten
// {marke, tiefe?, text}-Blöcken vereinheitlicht — gleicher Pfad für Live-Import,
// Cache-Replay und Bestands-Renormalisierung (Single Source, §5).
//
// Zwei-Track-Design (vom Code-Befund diktiert, §7/§1):
//  1. paras (OCL e_number) vorhanden  → marke aus e_number, wenn `markenPlausibel`;
//     sonst alle marke=null (ehrlich flach, §8). Das ist der grosse Hebel: der
//     reparierte `markenPlausibel` akzeptiert publizierte Sammlungs-Auszüge, die
//     legitim bei consid. N≥3 starten und echte Innenlücken haben (4→7).
//  2. paras leer, EIN Block (Monolith) → `spalteMonolith` versuchen — NUR wenn
//     ≥2 echte FÜHRENDE Gliederungsnummern existieren. Sonst null (flach lassen).
//     Niemals Gliederung aus Zitaten fabrizieren (§1).
//
// WORT-ERHALTEND: die Funktion fügt nur Marken hinzu und schneidet/spaltet Text,
// erfindet aber NIE Worte und stellt NIE um. Die Wort-Invariante ist getestet.

import type { EntscheidBlock } from '../../src/lib/rechtsprechung/typen';
import type { OclParagraph } from './adapter-entscheide';
import { bereinigeFliesstext } from '../../src/lib/rechtsprechung/register';

/** Monatsname am Absatz-Anfang ⇒ Jahreszahl-Datum als Marke fehlgeparst. */
export const MONAT =
  /^(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\b/;

/** Top-Marke ≥ 1900 ist sicher eine fehlgeparste Jahreszahl, keine Gliederung. */
const JAHR_SCHWELLE = 1900;

/** Top-Segment-Folge einer e_number-Liste, nur endliche Zahlen. */
function tops(nums: (string | undefined)[]): number[] {
  return nums
    .map((e) => Number(String(e ?? '').split('.')[0]))
    .filter((n) => Number.isFinite(n));
}

/**
 * Plausibilität der OCL-Erwägungs-Nummerierung — REPARIERT (§1):
 * akzeptiert publizierte Sammlungs-Auszüge, die legitim bei consid. N≥3 starten
 * und echte Innenlücken haben (amtliche BGE drucken nur die relevante Teilmenge).
 * Verwirft NUR fehlgeparste Marken:
 *  · Top-Marke ≥ Jahr-Schwelle (Datum/Jahr als Marke fehlgeparst),
 *  · NICHT-monoton aufsteigende Top-Folge (Parse/Reihenfolge kaputt),
 *  · Block-Start mit Monatsname (Jahreszahl-Datum als Marke).
 * Die alte Start-bei-1/2-Annahme (`tops[0] > 2`) und der pauschale Sprung≥3-Guard
 * entfallen — beide entwerteten genuine amtliche Nummerierung (168 flache BGE).
 */
export function markenPlausibel(paras: OclParagraph[]): boolean {
  const t = tops(paras.map((p) => p.e_number));
  if (!t.length) return false;
  if (t.some((n) => n >= JAHR_SCHWELLE)) return false;
  for (let i = 1; i < t.length; i++) if (t[i] < t[i - 1]) return false;
  if (paras.some((p) => MONAT.test(String(p.text ?? p.text_excerpt ?? '').trim()))) return false;
  return true;
}

/**
 * Robuste Regex für eine FÜHRENDE Gliederungsnummer am Absatz-Anfang.
 * Schutz gegen Datum/Betrag/Jahr/Liste: keine weitere Ziffer direkt danach
 * (Betrag „1 000"), kein Monat danach (Datum), kein 4-stelliges Jahr,
 * Folge-Zeichen muss Grossbuchstabe/Anführung/Klammer sein. 0 Fehltreffer auf
 * dem Korpus (empirisch verifiziert).
 */
const RE_FUEHREND =
  /^\s*(\d{1,2}(?:\.\d{1,2}){0,3})\.?\s+(?!\d)(?!(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\b)(?=[A-ZÄÖÜ«"(])/;

/**
 * Eine führende Gliederungsnummer am Absatz-Anfang erkennen. Liefert
 * {nummer, rest} oder null. Wort-erhaltend: `rest` ist exakt der Resttext.
 */
export function fuehrendeGliederungsnummer(p: string): { nummer: string; rest: string } | null {
  const m = RE_FUEHREND.exec(p);
  if (!m) return null;
  return { nummer: m[1], rest: p.slice(m[0].length) };
}

/**
 * Monolith-Split: EIN markenloser Erwägungs-Block → mehrere, NUR wenn ≥2 echte
 * führende Gliederungsnummern existieren, deren Top-Folge streng aufsteigend &
 * lückenarm ist (Start ≤ 2, kein Top-Sprung ≥ 3 — Schutz gegen Zitat-Treffer).
 * Sonst null (ehrlich flach lassen, §8). WORT-ERHALTEND: reines Slicing an den
 * Absatzgrenzen, kein Wort wird verändert oder umgestellt.
 */
export function spalteMonolith(text: string): EntscheidBlock[] | null {
  const paras = String(text).split(/\n{2,}/).map((p) => p.replace(/^[ \t]+/, '')).filter((p) => p.trim());
  // Treffer-Indizes: Absätze mit echter führender Gliederungsnummer.
  const treffer: { i: number; nummer: string; top: number }[] = [];
  for (let i = 0; i < paras.length; i++) {
    const g = fuehrendeGliederungsnummer(paras[i]);
    if (g) treffer.push({ i, nummer: g.nummer, top: Number(g.nummer.split('.')[0]) });
  }
  if (treffer.length < 2) return null;
  // Nur die Top-Köpfe (eine Segment-Tiefe) als Schnittpunkte werten; Folge plausibel?
  const koepfe = treffer.filter((t) => !t.nummer.includes('.'));
  if (koepfe.length < 2) return null;
  const ttops = koepfe.map((k) => k.top);
  if (ttops[0] > 2) return null;
  for (let i = 1; i < ttops.length; i++) {
    if (ttops[i] <= ttops[i - 1]) return null;           // streng aufsteigend
    if (ttops[i] - ttops[i - 1] >= 3) return null;        // keine grossen Lücken (Zitat-Schutz)
  }
  // An den Kopf-Absätzen schneiden. Text VOR dem ersten Kopf bleibt markenlos voran.
  const grenzen = koepfe.map((k) => k.i);
  const bloecke: EntscheidBlock[] = [];
  if (grenzen[0] > 0) {
    const vorab = paras.slice(0, grenzen[0]).join('\n\n');
    if (vorab.trim()) bloecke.push({ marke: null, text: bereinigeFliesstext(vorab) });
  }
  for (let g = 0; g < grenzen.length; g++) {
    const von = grenzen[g];
    const bis = g + 1 < grenzen.length ? grenzen[g + 1] : paras.length;
    const stueck = paras.slice(von, bis).join('\n\n');
    const txt = bereinigeFliesstext(stueck);
    if (txt) bloecke.push({ marke: `E. ${koepfe[g].nummer}`, tiefe: 1, text: txt });
  }
  return bloecke.length >= 2 ? bloecke : null;
}

/**
 * EINZIGE Eintrittsfunktion. Vereinheitlicht einen Erwägungs-Abschnitt zu
 * konsistenten {marke, tiefe?, text}-Blöcken. Pure, deterministisch (§2).
 *
 * Quelle-Priorität (typ-neutral — kennt weder leitcharakter noch Regeste):
 *   1. paras vorhanden  → marke aus e_number (wenn markenPlausibel), tiefe aus
 *      depth bzw. Segmentzahl; sonst alle marke=null (ehrlich flach).
 *   2. paras leer, EIN markenloser Block → spalteMonolith versuchen.
 *   3. sonst → unverändert (vorhandeneBloecke).
 *
 * `vorhandeneBloecke` ist die bereits bereinigte Block-Liste (text fertig); bei
 * vorhandenen `paras` werden die Texte aus `paras` genommen (Live-/Replay-Pfad).
 */
export function normalisiereErwaegung(
  paras: OclParagraph[],
  vorhandeneBloecke: EntscheidBlock[],
): EntscheidBlock[] {
  if (paras.length) {
    const plaus = markenPlausibel(paras);
    const bloecke = paras
      .map((p): EntscheidBlock => {
        const text = bereinigeFliesstext(String(p.text ?? p.text_excerpt ?? ''));
        if (!plaus || !p.e_number) return { marke: null, text };
        const tiefe = typeof p.depth === 'number'
          ? p.depth
          : String(p.e_number).split('.').length;
        return { marke: `E. ${p.e_number}`, tiefe, text };
      })
      .filter((b) => b.text);
    return bloecke;
  }
  // Kein paras (Bestand ohne Cache): nur Monolith-Veredelung, sonst unverändert.
  if (vorhandeneBloecke.length === 1 && !vorhandeneBloecke[0].marke) {
    const gespalten = spalteMonolith(vorhandeneBloecke[0].text);
    if (gespalten) return gespalten;
  }
  return vorhandeneBloecke;
}
