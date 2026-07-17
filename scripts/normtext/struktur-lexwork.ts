/**
 * Struktur-Extraktor (Kanton/LexWork): liest Gliederung (Teil/Titel/Abschnitt),
 * Artikel-Sachüberschrift (Marginalie), den ERLASS-KOPF (Ingress/Erlassformel mit
 * verlinkten Rechtsgrundlagen) und die amtlichen FUSSNOTEN aus dem LexWork-XHTML
 * (xhtml_tol) — je Artikel-Token bzw. am Kopf.
 *
 * LexWork-Markup (verifiziert BS gesetzessammlung.bs.ch 154.100 · BE belex 161.12,
 * Single-Quote-Klassen):
 *  - Gliederung: die Titel-/Level-Klasse kommt in BEIDEN Reihenfolgen vor —
 *      BE:  <div class='title level_N'>…   ·   BS: <div class='level_N title'>…
 *      je <span class='number'>N.</span> <span class='title_text'>…</span>.
 *      (Befund B1/A42: der frühere, reihenfolge-feste Ausdruck kannte nur EINE
 *      Reihenfolge → für Erlasse mit umgekehrter Klassenfolge fiel die Gliederung
 *      komplett aus — «keine gliederung». Fix: Klassen-Attribut generisch fangen
 *      und Ebene + `title`-Zugehörigkeit reihenfolge-unabhängig im Code prüfen.)
 *  - Artikel: <div class='article'><div class='article_number'>
 *      <span class='article_symbol'>§|Art.</span><span class='number'>1</span></div>
 *      <div class='article_title'><span class='title_text'>Grundsatz</span></div></div>
 *      Die paragraph-/enumeration-Blöcke sind GESCHWISTER NACH dem article-Div.
 *  - Kopf: <div class='enactment'>Vom … (Stand …)</div>
 *      <div class='ingress_author'>Der Grosse Rat …,</div>
 *      <div class='ingress_foundation'><p>… gestützt auf §§ … der Verfassung …
 *        <a class="footnote" …>[1]</a>,</p></div>
 *      <div class='ingress_action'>beschliesst:</div>
 *  - Fussnoten-Apparat: <div class='footnotes' id=''>…<ol><li>
 *      <a class='footnote' …>[N]</a> <span class='footnote_text'>SG
 *        <a class="law_link" href="https://…/data/111.100/de">111.100</a>.</span></li>…</ol></div>
 *      Die Marker im Fliesstext/Ingress sind <a class="footnote" …>[N]</a>.
 *
 * Reine Präsentations-Anreicherung (§3). Token = Artikelnummer (= Snapshot-artikel).
 * Ausgabe-Schema deckungsgleich mit dem Bund-Sidecar (struktur-run.ts) → derselbe
 * Reader-Pfad (ErlassKopfBlock, ArtikelBody-FnRef, baueGliederungsbaum) rendert
 * Kanton wie Bund. §7: nichts fabrizieren — leere Titel/Marker bleiben weg.
 *
 * TOKEN-SSoT (§5, F-2): Der Artikel-Token wird mit DERSELBEN Reinigung +
 * Normalisierung wie der Snapshot/Adapter gebildet — `bereinige()` (adapter-
 * lexwork.ts) entfernt Änderungsmarker/Fussnoten-Anker, `normalisiereArtikel-
 * Token()` (lexwork-token.ts) trennt Suffixe («2a» → «2_a», «335bis» → «335_bis»).
 * Sonst verwirft der Runner-Filter (struktur-kanton-run.ts, a.tokens.has) jeden
 * Suffix-/geänderten Artikel (Bug F-2, doppelt verifiziert gegen den Adapter).
 */

import { dekodiereEntities } from './html-entities.ts';
import { normalisiereArtikelToken } from './lexwork-token.ts';
import { bereinige } from './adapter-lexwork.ts';

// ── Ausgabe-Typen (deckungsgleich mit src/lib/normtext/browse.ts) ────────────
export interface LexFnLink {
  label: string;
  url: string;
  /** Interner Reader-Verweis, falls wir den zitierten Erlass im Volltext halten
   *  (vom Runner aufgelöst); sonst bleibt `url` der amtliche Fallback (§8). */
  intern?: { ebene: 'bund' | 'kanton'; key: string };
}
export interface LexFussnote {
  nr: string;
  text: string;
  links: LexFnLink[];
  absatz?: string | null;
  item?: string | null;
}
export interface LexArtikelStruktur {
  gliederung: Array<{ ebene: number; label: string }>;
  marginalie: string[];
  /** Amtliche Fussnoten des Artikels (Rechtsgrundlagen-/Änderungs-Verweise). */
  fussnoten?: LexFussnote[];
}
export type LexKopfRolle = 'autor' | 'ingress' | 'praeambel' | 'verb';
export interface LexKopfZeile { rolle: LexKopfRolle; text: string; fnNrs?: string[] }
export interface LexErlassKopf {
  titel?: string;
  erlassdatum?: string;
  praeambel?: LexKopfZeile[];
  fussnoten?: LexFussnote[];
}

/** Tag-frei + Entities dekodiert + Whitespace normalisiert. Fussnoten-Marker
 *  (<a class="footnote">[N]</a>) werden VOR dem Tag-Strip komplett entfernt — ihr
 *  Inhalt («[1]») kommt separat über den Apparat/fnNrs (sonst bliebe «… 2005 [1] ,»
 *  als Streustelle im Text stehen, §7). Verwaiste Leerzeichen vor Interpunktion
 *  (entstehen beim Strippen eines law_link-Tags: «SG 111.100 .») werden geglättet;
 *  kein deutsches/legales Muster setzt ein Leerzeichen vor . , ; : ! ? — reine
 *  Darstellung (§3), Wortlaut unangetastet.
 *
 *  Marginalie/Ingress/Fussnoten-Text nutzen `clean`; der Gliederungs-LABEL nutzt
 *  `cleanLabel` (unten), das zusätzlich hochgestellte Exponenten ohne Leerzeichen
 *  verbindet (F-2-Befund B4). Da `clean` den Änderungsmarker mitstrippt, schliesst
 *  K-1 zugleich den in F-2 zurückgestellten Marker-Leak der MARGINALIE (Befund B3). */
function clean(s: string): string {
  const ohneMarker = (s ?? '')
    .replace(
      /<a\b[^>]*\bclass=['"][^'"]*\bfootnote\b[^'"]*['"][^>]*>[\s\S]*?<\/a>/gi,
      '',
    )
    // LexWork-Änderungsmarker «<strong>*</strong>» sind redaktionelle Annotationen
    // (markieren geänderte Stellen), KEIN Normtext → entfernen (analog adapter-
    // lexwork.bereinige). Sonst bleibt «*» in Randtitel/Ingress stehen ODER — steht
    // der Marker im Nummer-Span aufgehobener Artikel («103&nbsp;<strong>*</strong>»)
    // — reisst der abweichende Token «103 *» den Artikel aus dem Sidecar (≠ Snapshot-
    // Token «103», Gegenprüfungs-Befund A42). Nur der reine Stern-Marker.
    .replace(/<strong>\s*\*\s*<\/strong>/gi, '');
  return dekodiereEntities(ohneMarker.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}

/**
 * Reinigt einen Gliederungs-Label-Teil (Nummer bzw. Titel-Text). Strenger als
 * `clean`, weil das Label sonst redaktionellen Ballast durchreicht (F-2-Befunde
 * B3/B4/B5, GP-bestätigt):
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

/** Aufhebungs-Platzhalter statt echter Randtitel? Aufgehobene, umnummerierte
 *  Artikel tragen als article_title «&hellip;» (→ «…») bzw. «...» — kein Sachtitel
 *  (§7: nichts fabrizieren; analog struktur-extrahiere/adapter-lexwork). Der reine
 *  Stern «*» ist bereits über clean() entfernt (→ ''). */
function istPlatzhalterTitel(s: string): boolean {
  return s === '' || s === '…' || s === '...';
}

// ── Fussnoten-Apparat (am Erlassende) → Map nr → LexFussnote ──────────────────
// Der Apparat ist der einzige <ol> im Dokument (Aufzählungen im Normtext sind
// <table class='enumeration_item'>). Konservativ auf den <div class='footnotes'>-
// Block gescoped, damit niemals ein Normtext-Fragment als Fussnote gelesen wird.
function parseApparat(xhtml: string): Map<string, LexFussnote> {
  const map = new Map<string, LexFussnote>();
  const app = xhtml.match(/<div class='footnotes'[^>]*>[\s\S]*?<\/ol>/i);
  const block = app ? app[0] : '';
  for (const li of block.matchAll(/<li>([\s\S]*?)<\/li>/gi)) {
    const inner = li[1];
    // Nummer aus dem führenden <a class='footnote'>[N]</a> (Rückanker).
    const nrM = inner.match(/<a\s+class=['"]footnote['"][^>]*>\s*\[?(\d+[a-z]?)\]?\s*<\/a>/i);
    if (!nrM) continue;
    const nr = nrM[1];
    const textBlock = inner.match(/<span\s+class='footnote_text'>([\s\S]*?)<\/span>\s*<\/li>/i)
      ?? inner.match(/<span\s+class='footnote_text'>([\s\S]*)$/i);
    const roh = textBlock ? textBlock[1] : '';
    // law_link-Anker VOR dem Tag-Strippen als Verweis-Ziele sammeln.
    const links: LexFnLink[] = [];
    for (const a of roh.matchAll(/<a[^>]*\bclass="law_link"[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
      const label = clean(a[2]);
      if (label) links.push({ label, url: a[1] });
    }
    const text = clean(roh);
    if (text || links.length) map.set(nr, { nr, text, links });
  }
  return map;
}

// Marker-Nummern (<a class="footnote">[N]</a>) eines HTML-Abschnitts in
// Erst-Vorkommens-Reihenfolge.
function markerNrs(abschnitt: string): string[] {
  const out: string[] = [];
  for (const m of abschnitt.matchAll(/<a\s+class=['"]footnote['"][^>]*>\s*\[?(\d+[a-z]?)\]?\s*<\/a>/gi)) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

// ── Erlass-Kopf (Ingress/Erlassformel + Kopf-Fussnoten) ──────────────────────
export function extrahiereKopfLexWork(
  xhtml: string,
  apparat: Map<string, LexFussnote> = parseApparat(xhtml),
): LexErlassKopf | null {
  const kopf: LexErlassKopf = {};

  const titel = xhtml.match(/<h1\s+class='title'>([\s\S]*?)<\/h1>/i);
  if (titel) { const t = clean(titel[1]); if (t) kopf.titel = t; }
  const enact = xhtml.match(/<div\s+class='enactment'>([\s\S]*?)<\/div>/i);
  if (enact) { const t = clean(enact[1]); if (t) kopf.erlassdatum = t; }

  const zeilen: LexKopfZeile[] = [];
  const kopfFn: LexFussnote[] = [];
  const gesehen = new Set<string>();
  const zeile = (rolle: LexKopfRolle, roh: string) => {
    const text = clean(roh);
    if (!text) return;
    const nrs = markerNrs(roh);
    for (const nr of nrs) {
      const f = apparat.get(nr);
      if (f && !gesehen.has(nr)) { gesehen.add(nr); kopfFn.push({ ...f, absatz: null, item: null }); }
    }
    zeilen.push(nrs.length ? { rolle, text, fnNrs: nrs } : { rolle, text });
  };

  const author = xhtml.match(/<div\s+class='ingress_author'>([\s\S]*?)<\/div>/i);
  if (author) zeile('autor', author[1]);
  // Mehrere ingress_foundation-Zeilen möglich (Ratschlag + Rechtsgrundlage).
  for (const f of xhtml.matchAll(/<div\s+class='ingress_foundation'>([\s\S]*?)<\/div>/gi)) zeile('ingress', f[1]);
  const action = xhtml.match(/<div\s+class='ingress_action'>([\s\S]*?)<\/div>/i);
  if (action) zeile('verb', action[1]);

  if (zeilen.length) kopf.praeambel = zeilen;
  if (kopfFn.length) kopf.fussnoten = kopfFn;

  const hatInhalt = kopf.titel || kopf.erlassdatum || kopf.praeambel?.length;
  return hatInhalt ? kopf : null;
}

// ── Artikel-Fussnoten: Marker im Fliesstext dem Absatz zuordnen ───────────────
// Dokumentlinearer Scan über Absatz-Nummern + Marker; ein Marker erbt die zuletzt
// gesehene Absatznummer (BS §6: [2]/[3]/[4] liegen alle in Abs. 1). Marker VOR dem
// ersten Absatz (Artikelkopf/Marginalie) → absatz=null → Artikelfuss-Apparat.
function artikelFussnoten(segment: string, apparat: Map<string, LexFussnote>): LexFussnote[] {
  const out: LexFussnote[] = [];
  const gesehen = new Set<string>();
  let absatz: string | null = null;
  const EVT = /<div\s+class='paragraph(?:_post)?'>\s*(?:<span\s+class='number'>([\s\S]*?)<\/span>)?|<a\s+class=['"]footnote['"][^>]*>\s*\[?(\d+[a-z]?)\]?\s*<\/a>/gi;
  for (const m of segment.matchAll(EVT)) {
    if (m[2] != null) {
      // Fussnoten-Marker → aktuelle Absatznummer.
      const nr = m[2];
      if (gesehen.has(nr)) continue;
      const f = apparat.get(nr);
      if (!f) continue;
      gesehen.add(nr);
      out.push({ ...f, absatz, item: null });
    } else {
      // Absatz-Öffner: Nummer (kann bei paragraph_post fehlen → absatz bleibt).
      const num = m[1] != null ? clean(m[1]) : '';
      if (num) absatz = num;
    }
  }
  return out;
}

// ── Gliederung + Marginalie je Artikel (beide Klassen-Reihenfolgen) ───────────
// Gliederungs-Titel ODER Artikel(kopf), in Dokumentreihenfolge.
//
// Gliederung (F-2/B1, reihenfolge-unabhängig): LexWork liefert die CSS-Klassen
// `title` und `level_N` in BEIDEN Reihenfolgen — `class='title level_N'` (BE) UND
// `class='level_N title'` (BS-131.100, BE-215.326.2). Darum das Klassen-Attribut
// generisch fangen (m[1]) und Ebene + `title`-Zugehörigkeit im Code prüfen.
// `article`/`article_number`-Divs tragen kein `level_` → kein Fehlgriff.
const TOK = new RegExp(
  "<div class='([^']*level_\\d+[^']*)'>([\\s\\S]*?)</div>"
  + "|<div class='article'>\\s*<div class='article_number'>([\\s\\S]*?)</div>"
  + "(?:\\s*<div class='article_title'>([\\s\\S]*?)</div>)?",
  'g',
);

export function extrahiereStrukturLexWork(
  xhtml: string,
  apparat: Map<string, LexFussnote> = parseApparat(xhtml),
): Record<string, LexArtikelStruktur> {
  const result: Record<string, LexArtikelStruktur> = {};
  const gl: Array<{ ebene: number; label: string } | undefined> = [];

  // Körper = alles VOR dem Fussnoten-Apparat. Der Apparat trägt selbst
  // <a class='footnote'>[N]</a>-Rückanker; ohne diesen Schnitt zöge das LETZTE
  // Artikel-Segment (das bis zum Dokumentende reicht) den ganzen Apparat mit und
  // hängte dessen Marker fälschlich an den letzten Artikel.
  const koerper = xhtml.split(/<div class='footnotes'/i)[0];

  for (const m of koerper.matchAll(TOK)) {
    if (m[1] != null) {
      // Gliederungs-Titel: «N Bezeichnung». m[1] = rohes Klassen-Attribut.
      // Nur echte Titel (Klasse enthält `title`); Ebene aus `level_N` — beide
      // reihenfolge-unabhängig (F-2-Befund B1).
      const klasse = m[1];
      if (!/(?:^|\s)title(?:\s|$)/.test(klasse)) continue;
      const ebene = Number(klasse.match(/level_(\d+)/)?.[1]);
      if (!Number.isFinite(ebene) || ebene < 1) continue;
      const inner = m[2];
      const nr = inner.match(/<span class='number'>([\s\S]*?)<\/span>/)?.[1] ?? '';
      // Titel = title_text ODER (bei aufgehobenen Titeln) der abrogation_ellip-
      // Platzhalter «…». KEIN Fallback auf den ganzen Div — der zöge die Nummer
      // ein zweites Mal ein und dupliziert das Label (F-2-Befund B5: «4.C.II.I.bis
      // 4.C.II.I.bis …»).
      const titel =
        inner.match(/<span class='title_text'>([\s\S]*?)<\/span>/)?.[1]
        ?? inner.match(/<span class='abrogation_ellip'>([\s\S]*?)<\/span>/)?.[1]
        ?? '';
      const label = [cleanLabel(nr), cleanLabel(titel)].filter(Boolean).join(' ');
      if (!label) continue;
      gl.length = ebene - 1;       // tiefere Ebenen verfallen
      gl[ebene - 1] = { ebene, label };
    } else if (m[3] != null) {
      // Artikel: Nummer (Token) + optionale Sachüberschrift (Marginalie).
      // Token via SSoT (§5, F-2): bereinige() entfernt Änderungsmarker/Fussnoten-
      // Anker, normalisiereArtikelToken() trennt Suffixe («2a» → «2_a») — sonst
      // verwirft der Runner-Filter (a.tokens.has) den Artikel.
      const roh = bereinige(m[3].match(/<span class='number'>([\s\S]*?)<\/span>/)?.[1] ?? '');
      if (!roh) continue;
      const token = normalisiereArtikelToken(roh);
      const sach = m[4] != null
        ? clean(m[4].match(/<span class='title_text'>([\s\S]*?)<\/span>/)?.[1] ?? m[4])
        : '';
      result[token] = {
        gliederung: gl.filter((g): g is { ebene: number; label: string } => g != null).map((g) => ({ ...g })),
        marginalie: istPlatzhalterTitel(sach) ? [] : [sach],
      };
    }
  }

  // Zweiter Pass: Fussnoten-Marker je Artikel-Segment dem Absatz zuordnen.
  // Der Segment-Token wird mit DERSELBEN SSoT-Normalisierung gebildet wie oben,
  // damit er den (normalisierten) result-Schlüssel trifft (auch bei Suffix-Art.).
  for (const seg of koerper.split(/(?=<div class='article'>)/i)) {
    if (!/^\s*<div class='article'>/i.test(seg)) continue;
    const roh = bereinige(seg.match(/<div class='article_number'>[\s\S]*?<span class='number'>([\s\S]*?)<\/span>/i)?.[1] ?? '');
    if (!roh) continue;
    const token = normalisiereArtikelToken(roh);
    if (!result[token]) continue;
    const fns = artikelFussnoten(seg, apparat);
    if (fns.length) result[token].fussnoten = fns;
  }

  return result;
}

/** Kombinierter Sidecar-Extrakt (Kopf + Artikel-Struktur) — ein Apparat-Parse. */
export function extrahiereLexWorkSidecar(xhtml: string): {
  kopf: LexErlassKopf | null;
  artikel: Record<string, LexArtikelStruktur>;
} {
  const apparat = parseApparat(xhtml);
  return {
    kopf: extrahiereKopfLexWork(xhtml, apparat),
    artikel: extrahiereStrukturLexWork(xhtml, apparat),
  };
}
