/**
 * Fedlex-Artikel-Extraktor — extrahiert den Volltext eines Artikels aus einem
 * konsolidierten Fedlex-Filestore-HTML (z.B. /tmp/or.html).
 *
 * Verifizierte Markup-Struktur (SPIKE 16.6.2026, or.html/zpo.html):
 *   - Artikel: <article id="art_TOKEN">…</article>
 *   - Absatz-Container: <p class="absatz …">…</p>  (class enthält «absatz»)
 *   - Absatznummer: erstes <sup> im <p>, dessen Inhalt NUR Ziffern/[a-z]
 *     enthält und kein <a>-Kind hat (Fussnoten-<sup> enthalten immer <a>-Links)
 *   - Unterabsätze ohne Nummerierung haben kein führendes <sup>  → absatz: null
 *
 * Öffentliche Signatur ist stabil; Regex-Interna können sich anpassen, wenn
 * Fedlex das Markup ändert.
 */

export interface ArtikelText {
  bloecke: Array<{ absatz: string | null; text: string }>;
}

import { dekodiereEntities } from './html-entities.ts';

/**
 * Extrahiert einen einzelnen Artikel aus einem Fedlex-Filestore-HTML.
 *
 * @param html  - Volltext des heruntergeladenen HTML-Dokuments
 * @param token - Artikel-ID ohne Präfix «art_», z.B. «77», «335_c», «19_a»
 * @returns     ArtikelText mit Absatz-Blöcken, oder null wenn Anker fehlt
 */
export function extrahiereArtikel(html: string, token: string): ArtikelText | null {
  // Escape des Tokens für die Regex (Unterstriche sind literal, kein Sonderzeichen)
  const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const articleRe = new RegExp(
    `<article[^>]*\\sid="art_${escapedToken}"[^>]*>([\\s\\S]*?)</article>`,
    'i',
  );
  const articleMatch = html.match(articleRe);
  if (!articleMatch) return null;

  const inner = articleMatch[1];

  // Alle <p class="...absatz..."> extrahieren
  const absatzRe = /<p[^>]*\bclass="[^"]*\babsatz\b[^"]*"[^>]*>([\s\S]*?)<\/p>/gi;
  const bloecke: ArtikelText['bloecke'] = [];

  for (const match of inner.matchAll(absatzRe)) {
    const roh = match[1];

    // Absatznummer: erstes <sup>, das KEIN <a>-Kind enthält und nur Ziffern/[a-z] enthält.
    // Fussnoten-<sup> sehen so aus: <sup><a href="...">188</a></sup> → verwerfen.
    const supMatch = roh.match(/^(?:\s|&nbsp;)*<sup(?:[^>]*)>([\s\S]*?)<\/sup>/i);
    let absatz: string | null = null;
    if (supMatch) {
      const supInhalt = supMatch[1];
      // Nur akzeptieren wenn kein <a>-Tag drin steckt und der Text nur Ziffern/[a-z] ist
      if (!/<a[\s>]/i.test(supInhalt) && /^\d+[a-z]?$/.test(supInhalt.trim())) {
        absatz = supInhalt.trim();
      }
    }

    // Fussnoten-<sup><a ...>…</a></sup> entfernen, BEVOR entferneTags läuft —
    // sonst bleibt die Zahl (z.B. «188») als Text stehen.
    const ohneFootnotes = roh.replace(/<sup[^>]*><a[\s\S]*?<\/a><\/sup>/gi, '');

    // Absatznummer-<sup> (gesetzt falls absatz != null) aus dem Roh-Text entfernen,
    // damit die Ziffer nicht in den sichtbaren Text einfließt.
    const ohneAbsatzNr = absatz
      ? ohneFootnotes.replace(/^(?:\s|&nbsp;)*<sup[^>]*>\d+[a-z]?<\/sup>(?:&nbsp;|\s)*/i, '')
      : ohneFootnotes;

    const text = entferneTags(ohneAbsatzNr).trim();
    if (text) {
      bloecke.push({ absatz, text });
    }
  }

  // Fallback: kein einziger <p class="absatz"> gefunden → ganzen Artikel-Text zurückgeben
  if (bloecke.length === 0) {
    const text = entferneTags(inner).replace(/^\s*Art\.\s*\S+\s*/, '').trim();
    if (text) return { bloecke: [{ absatz: null, text }] };
    return { bloecke: [] };
  }

  return { bloecke };
}

/**
 * Entfernt alle HTML-Tags, dekodiert HTML-Entities (via dekodiereEntities)
 * und normalisiert Whitespace.
 * Fussnoten-Nummern in <sup><a>…</a></sup> werden durch diese Funktion ebenfalls
 * entfernt, weil der <sup>-Tag als solcher wegfällt.
 */
function entferneTags(s: string): string {
  return dekodiereEntities(s.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrahiert alle Artikel-Token aus einem Fedlex-Filestore-HTML in HTML-Reihenfolge.
 *
 * Matcht: id="art_<TOKEN>" wobei TOKEN mit einer Ziffer beginnt (strukturelle
 * Nicht-Artikel-Anker wie «art_SchlusstitelUebergang» werden ausgeschlossen).
 * Tokens werden dedupliziert (erster Vorkommen gewinnt), Reihenfolge wie im HTML.
 *
 * @param html - Volltext des Fedlex-Filestore-HTML
 * @returns Array der Token-Strings (ohne «art_»-Präfix), z.B. ['1','2','335_c']
 */
export function alleArtikelTokens(html: string): string[] {
  const re = /id="art_(\d[\w]*)"/g;
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const m of html.matchAll(re)) {
    const token = m[1];
    if (!seen.has(token)) {
      seen.add(token);
      tokens.push(token);
    }
  }
  return tokens;
}
