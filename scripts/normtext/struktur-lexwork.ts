/**
 * Struktur-Extraktor (Kanton/LexWork): liest Gliederung (Teil/Titel/Abschnitt)
 * und Artikel-Sachüberschrift (Marginalie) aus dem LexWork-XHTML (xhtml_tol).
 *
 * LexWork-Markup (verifiziert BE belex 161.12, 17.6.2026; Single-Quote-Klassen):
 *  - Gliederung: <div class='title level_N'><span class='number'>N</span>
 *      <span class='title_text'>Allgemeine Bestimmungen</span></div>  (FLACH, level-nummeriert)
 *  - Artikel: <div class='article'><div class='article_number'>
 *      <span class='article_symbol'>Art.</span><span class='number'>1</span></div>
 *      <div class='article_title'><span class='title_text'>Grundsatz</span></div></div>
 *
 * Reine Präsentations-Anreicherung (§3). Token = Artikelnummer (= Snapshot-artikel).
 */

import type { ArtikelStruktur } from './struktur-extrahiere.ts';
import { dekodiereEntities } from './html-entities.ts';

function clean(s: string): string {
  return dekodiereEntities((s ?? '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

// Gliederungs-Titel ODER Artikel, in Dokumentreihenfolge.
const TOK = new RegExp(
  "<div class='title level_(\\d+)'>([\\s\\S]*?)</div>"
  + "|<div class='article'>\\s*<div class='article_number'>([\\s\\S]*?)</div>"
  + "(?:\\s*<div class='article_title'>([\\s\\S]*?)</div>)?",
  'g',
);

export function extrahiereStrukturLexWork(xhtml: string): Record<string, ArtikelStruktur> {
  const result: Record<string, ArtikelStruktur> = {};
  const gl: Array<{ ebene: number; label: string } | undefined> = [];

  for (const m of xhtml.matchAll(TOK)) {
    if (m[1] != null) {
      // Gliederungs-Titel: «N Bezeichnung»
      const ebene = Number(m[1]);
      const nr = m[2].match(/<span class='number'>([\s\S]*?)<\/span>/)?.[1] ?? '';
      const titel = m[2].match(/<span class='title_text'>([\s\S]*?)<\/span>/)?.[1] ?? m[2];
      const label = `${clean(nr)} ${clean(titel)}`.trim();
      if (!label) continue;
      gl.length = ebene - 1;       // tiefere Ebenen verfallen
      gl[ebene - 1] = { ebene, label };
    } else if (m[3] != null) {
      // Artikel: Nummer (Token) + optionale Sachüberschrift (Marginalie)
      const token = clean(m[3].match(/<span class='number'>([\s\S]*?)<\/span>/)?.[1] ?? '');
      if (!token) continue;
      const sach = m[4] != null
        ? clean(m[4].match(/<span class='title_text'>([\s\S]*?)<\/span>/)?.[1] ?? m[4])
        : '';
      result[token] = {
        gliederung: gl.filter((g): g is { ebene: number; label: string } => g != null).map((g) => ({ ...g })),
        marginalie: sach ? [sach] : [],
      };
    }
  }
  return result;
}
