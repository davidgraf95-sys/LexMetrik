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
import { normalisiereArtikelToken } from './lexwork-token.ts';
import { bereinige } from './adapter-lexwork.ts';

function clean(s: string): string {
  return dekodiereEntities((s ?? '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

/**
 * Reinigt einen Gliederungs-Label-Teil (Nummer bzw. Titel-Text). Strenger als
 * `clean`, weil das Label sonst redaktionellen Ballast durchreicht (Befunde
 * B3/B4 der Gegenprüfung 17.7.2026):
 *  - Fussnoten-Anker («<a class="footnote">[2]</a>») komplett raus (kein «[2]»-Leak).
 *  - LexWork-Änderungsmarker «<strong>*</strong>» raus.
 *  - Hochgestellte Exponenten «<sup>bis</sup>» OHNE Leerzeichen verbinden, damit
 *    «I.A.<sup>bis</sup>» → «I.A.bis» (nicht «I.A. bis», das sich als deutsches
 *    „bis“ liest). Sonst-Tags (z.B. «<br/>») → Leerzeichen (Wort-Trennung).
 */
function cleanLabel(s: string): string {
  return dekodiereEntities(
    (s ?? '')
      .replace(/<a\b[^>]*class=["']footnote["'][^>]*>[\s\S]*?<\/a>/gi, '')
      .replace(/<strong>\s*\*\s*<\/strong>/gi, '')
      .replace(/<\/?sup>/gi, '')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

// Gliederungs-Titel ODER Artikel, in Dokumentreihenfolge.
//
// Gliederungs-Titel: LexWork liefert die beiden CSS-Klassen `title` und
// `level_N` in BEIDEN Reihenfolgen — `class='title level_N'` (z.B. BS-121.110)
// UND `class='level_N title'` (z.B. BS-131.100, BE-215.326.2). Der frühere,
// reihenfolge-feste Ausdruck `class='title level_N'` verwarf die zweite Variante
// still → korpusweit Erlasse mit `gliederung: []` trotz amtlicher Gliederung
// (Gegenprüfungs-Befund B1, 17.7.2026). Darum das Klassen-Attribut generisch
// fangen (m[1]) und Ebene + `title`-Zugehörigkeit im Code prüfen (reihenfolge-
// unabhängig). `article`/`article_number`-Divs tragen kein `level_` → kein
// Fehlgriff.
const TOK = new RegExp(
  "<div class='([^']*level_\\d+[^']*)'>([\\s\\S]*?)</div>"
  + "|<div class='article'>\\s*<div class='article_number'>([\\s\\S]*?)</div>"
  + "(?:\\s*<div class='article_title'>([\\s\\S]*?)</div>)?",
  'g',
);

export function extrahiereStrukturLexWork(xhtml: string): Record<string, ArtikelStruktur> {
  const result: Record<string, ArtikelStruktur> = {};
  const gl: Array<{ ebene: number; label: string } | undefined> = [];

  for (const m of xhtml.matchAll(TOK)) {
    if (m[1] != null) {
      // Gliederungs-Titel: «N Bezeichnung». m[1] = rohes Klassen-Attribut.
      // Nur echte Titel (Klasse enthält `title`); Ebene aus `level_N` — beide
      // reihenfolge-unabhängig (Befund B1).
      const klasse = m[1];
      if (!/(?:^|\s)title(?:\s|$)/.test(klasse)) continue;
      const ebene = Number(klasse.match(/level_(\d+)/)?.[1]);
      if (!Number.isFinite(ebene) || ebene < 1) continue;
      const nr = m[2].match(/<span class='number'>([\s\S]*?)<\/span>/)?.[1] ?? '';
      // Titel = title_text ODER (bei aufgehobenen Titeln) der abrogation_ellip-
      // Platzhalter «…». KEIN Fallback auf den ganzen Div — der zöge die Nummer
      // ein zweites Mal ein und dupliziert das Label (Befund B5: «4.C.II.I.bis
      // 4.C.II.I.bis …»).
      const titel =
        m[2].match(/<span class='title_text'>([\s\S]*?)<\/span>/)?.[1]
        ?? m[2].match(/<span class='abrogation_ellip'>([\s\S]*?)<\/span>/)?.[1]
        ?? '';
      const label = [cleanLabel(nr), cleanLabel(titel)].filter(Boolean).join(' ');
      if (!label) continue;
      gl.length = ebene - 1;       // tiefere Ebenen verfallen
      gl[ebene - 1] = { ebene, label };
    } else if (m[3] != null) {
      // Artikel: Nummer (Token) + optionale Sachüberschrift (Marginalie).
      // Der Token MUSS mit DERSELBEN Reinigung + Normalisierung wie der Snapshot/
      // Adapter gebildet werden (§5 SSoT), sonst verwirft der Runner-Filter
      // (struktur-kanton-run.ts, a.tokens.has) den Artikel (Bug F-2):
      //  - bereinige() entfernt den Änderungsmarker «<strong>*</strong>» (Novellen-/
      //    geänderte Artikel: «2a&nbsp;<strong>*</strong>») + Fussnoten-Anker;
      //    `clean` liesse «2a *» stehen → kein Token-Treffer.
      //  - normalisiereArtikelToken() trennt Suffixe: «2a» → «2_a», «335bis» → «335_bis».
      const roh = bereinige(m[3].match(/<span class='number'>([\s\S]*?)<\/span>/)?.[1] ?? '');
      if (!roh) continue;
      const token = normalisiereArtikelToken(roh);
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
