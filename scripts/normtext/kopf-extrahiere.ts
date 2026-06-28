/**
 * Erlass-Kopf-Extraktor (Bund, M5): liest den Vorspann eines Fedlex-Erlasses, der
 * VOR dem ersten <article> steht und vom Artikel-Extraktor verworfen wird —
 *   <div id="preface">  SR-Nr, amtlicher Titel, Erlassdatum «vom … (Stand am …)»
 *   <div id="preamble"> Erlassformel (Autor «Der Bundesrat,» + Ingress/Rechts-
 *                       grundlage «gestützt auf …» + Verb «beschliesst:/verordnet:»)
 *                       bzw. bei der BV die materielle Präambel (G6).
 *
 * Höchster Fundiertheits-Hebel des renderer-nahen Teils: der Ingress ist die
 * Rechtsgrundlage/Delegationsnorm und fehlt heute zu 100 % (§2 Fedlex-Floor).
 *
 * Reine Präsentations-Anreicherung (§3): KEINE Normtext-/Snapshot-Erzeugung. Das
 * Ergebnis liegt als SIDECAR neben dem Struktur-Sidecar (struktur-run.ts) → der
 * Snapshot-Index golden/normtext-snapshot.json bleibt byte-gleich (§7).
 *
 * Wortlaut bleibt unangetastet (§1): wir normalisieren nur die Darstellung
 * (Tags entfernen, <br> → Leerzeichen, Entities dekodieren). Fussnoten-Marker am
 * exakten Wort sind G14/B2 — hier wird der Marker entfernt und die Fussnote über
 * `fnDefinitionen` separat gesammelt (sichtbar am Kopf, §8).
 */
import { fnDefinitionen, type Fussnote } from './fussnoten-extrahiere.ts';
import { dekodiereEntities } from './html-entities.ts';

export type KopfRolle = 'autor' | 'ingress' | 'praeambel' | 'verb';
export interface KopfZeile {
  rolle: KopfRolle;
  text: string;
}
export interface ErlassKopf {
  /** SR-Nummer aus <p class="srnummer"> (z. B. «210», «0.103.2»). */
  srNummer?: string;
  /** Amtlicher Titel aus <h1 class="erlasstitel …"> (<br> → Leerzeichen). */
  titel?: string;
  /** «vom 10. Dezember 1907 (Stand am 1. Januar 2026)». */
  erlassdatum?: string;
  /** Überschrift der materiellen Präambel, falls Fedlex eine setzt (BV: «Präambel», G6). */
  praeambelTitel?: string;
  /** Geordnete Erlassformel-/Präambel-Zeilen (Dokumentreihenfolge). */
  praeambel?: KopfZeile[];
  /** Kopf-/Ingress-Fussnoten (Quell-/Verfassungs-/SR-Verweise), falls vorhanden. */
  fussnoten?: Fussnote[];
}

/** Balanciertes Ende eines <div>-Blocks ab startIdx (Index NACH dem schliessenden
 *  </div>). Fedlex schachtelt im Preamble einen Wrapper-<div> + <div class="footnotes">. */
function findeDivEnde(html: string, startIdx: number): number {
  const tagRe = /<div\b[^>]*>|<\/div>/gi;
  tagRe.lastIndex = startIdx;
  let tiefe = 0;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(html)) !== null) {
    if (m[0].toLowerCase().startsWith('</')) {
      tiefe--;
      if (tiefe === 0) return m.index + m[0].length;
    } else {
      tiefe++;
    }
  }
  return html.length;
}

/** Schneidet den balancierten Inhalt von <div id="ID"> … </div> heraus (oder null). */
function divInhalt(html: string, id: string): string | null {
  const re = new RegExp(`<div\\b[^>]*\\bid="${id}"[^>]*>`, 'i');
  const m = re.exec(html);
  if (!m) return null;
  const ende = findeDivEnde(html, m.index);
  const start = m.index + m[0].length;
  // </div> am Ende abschneiden (findeDivEnde gibt den Index NACH </div>).
  return html.slice(start, ende - '</div>'.length);
}

/** Tag-frei + Entities dekodiert + <br>/Whitespace normalisiert. Fussnoten-<sup>
 *  (Marker) werden zuvor entfernt — ihr Inhalt kommt separat über fnDefinitionen. */
function reinText(roh: string): string {
  return dekodiereEntities(
    roh
      .replace(/<sup\b[\s\S]*?<\/sup>/gi, '')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

/** Die Erstvorkommens-Reihenfolge der Fussnoten-Marker (#fn-…) in einem HTML-
 *  Abschnitt, ohne die Rückverweise im Definitions-Block. */
function kopfFussnoten(...abschnitte: string[]): (defs: Map<string, Fussnote>) => Fussnote[] {
  return (defs) => {
    const gesehen = new Set<string>();
    const liste: Fussnote[] = [];
    for (const abschnitt of abschnitte) {
      for (const mm of abschnitt.matchAll(/\bhref="#(fn-[^"]+)"/gi)) {
        const id = mm[1];
        if (gesehen.has(id)) continue;
        gesehen.add(id);
        const def = defs.get(id);
        if (def) liste.push({ ...def, absatz: null, item: null });
      }
    }
    return liste;
  };
}

/**
 * Liest den Erlass-Kopf (preface + preamble) aus dem Fedlex-Filestore-HTML.
 * Gibt null zurück, wenn weder Titel noch Präambel-Inhalt vorhanden sind (so
 * tragen die wenigen kopflosen Erlasse keinen leeren Sidecar-Eintrag).
 */
export function extrahiereKopf(html: string): ErlassKopf | null {
  const preface = divInhalt(html, 'preface');
  const preamble = divInhalt(html, 'preamble');
  const kopf: ErlassKopf = {};

  if (preface) {
    const sr = preface.match(/<p[^>]*\bclass="[^"]*\bsrnummer\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
    if (sr) { const t = reinText(sr[1]); if (t) kopf.srNummer = t; }
    const titel = preface.match(/<h1[^>]*\bclass="[^"]*\berlasstitel\b[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
    if (titel) { const t = reinText(titel[1]); if (t) kopf.titel = t; }
    const datum = preface.match(/<p[^>]*\bclass="[^"]*\berlassdatum\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
    if (datum) { const t = reinText(datum[1]); if (t) kopf.erlassdatum = t; }
  }

  if (preamble) {
    // Präambel-Körper VOR dem Fussnoten-Block; der Block selbst wird über
    // fnDefinitionen aufgelöst, nicht als Zeile geführt.
    const fnIdx = preamble.search(/<div\b[^>]*\bclass="[^"]*\bfootnotes\b[^"]*"[^>]*>/i);
    const koerper = fnIdx >= 0 ? preamble.slice(0, fnIdx) : preamble;

    // BV/G6: materielle Präambel trägt eine <h5>…Präambel…</h5>-Überschrift.
    const pt = koerper.match(/<h5\b[^>]*>([\s\S]*?)<\/h5>/i);
    if (pt) { const t = reinText(pt[1]); if (t) kopf.praeambelTitel = t; }

    // Zeilen in DOKUMENTREIHENFOLGE: <p class="man-template-autor|ingress|
    // man-template-verb|absatz">. «absatz» im Preamble = materieller Präambeltext
    // (G6), nicht zu verwechseln mit Artikel-Absätzen (die liegen in <article>).
    const zeilen: KopfZeile[] = [];
    for (const pm of koerper.matchAll(/<p\b[^>]*\bclass="([^"]*)"[^>]*>([\s\S]*?)<\/p>/gi)) {
      const klasse = pm[1];
      const text = reinText(pm[2]);
      if (!text) continue;
      let rolle: KopfRolle | null = null;
      if (/\bman-template-autor\b/.test(klasse)) rolle = 'autor';
      else if (/\bingress\b/.test(klasse)) rolle = 'ingress';
      else if (/\bman-template-verb\b/.test(klasse)) rolle = 'verb';
      else if (/\babsatz\b/.test(klasse)) rolle = 'praeambel';
      if (rolle) zeilen.push({ rolle, text });
    }
    if (zeilen.length) kopf.praeambel = zeilen;

    const fn = kopfFussnoten(preface ?? '', koerper)(fnDefinitionen(html));
    if (fn.length) kopf.fussnoten = fn;
  }

  const hatInhalt = kopf.titel || kopf.erlassdatum || kopf.praeambel?.length;
  return hatInhalt ? kopf : null;
}
