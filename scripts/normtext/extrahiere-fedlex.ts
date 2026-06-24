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
  bloecke: Array<{
    absatz: string | null;
    text: string;
    items?: Array<{ marke: string; text: string }>;
    /** Fedlex-<table> als Mehrspalten-Block (Bug-Fix 23.6.2026: Tabellen wurden
     *  zuvor komplett gedroppt — z.B. IVG art_28b Rententabelle, AHVG art_34bis). */
    mehrspaltig?: { kopf?: string[]; zeilen: string[][] };
  }>;
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

  // Fussnoten-Apparat (<div class="footnotes">…</div>) und Artikel-Überschrift
  // (<h6>…</h6>, trägt eine Heading-Fussnote) sind KEIN Normtext und werden vorab
  // entfernt — sonst leckt der Fallback-Pfad (unnummerierte plain-<p>-Artikel wie
  // BETMG/VStrR) den Fussnotentext + Marker in den Normtext (Bug-Check 23.6.2026).
  // Der Haupt-Loop matcht diese Elemente ohnehin nicht; nur der Fallback profitiert.
  const inner = articleMatch[1]
    .replace(/<div\s+class="footnotes">[\s\S]*$/i, '') // Apparat steht am Artikelende
    .replace(/<h6\b[^>]*>[\s\S]*?<\/h6>/gi, '');

  // <p>-Absätze UND <dl>-Aufzählungen in DOKUMENTREIHENFOLGE durchlaufen
  // (Geschwister im collapseable-div). Vier Alternativen:
  //  (1) <p class="…absatz…">                — Standard-Absatz neuerer Konsolidierungen.
  //  (2) <p> mit führendem <sup>N</sup>       — ältere Erlasse (IPRG/BetmG/VStrR)
  //      setzen die Absatznummer als nacktes <sup> OHNE absatz-Klasse.
  //  (3) <p> UNMITTELBAR vor einer <dl>       — Einleitungssatz/Label einer Liste
  //      ohne absatz-Klasse («…es sei denn:», «Erste Klasse»). Lookahead konsumiert
  //      die <dl> nicht → (4) hängt sie an genau diesen Block.
  //  (4) <dl>                                 — Aufzählung am vorausgehenden Block.
  // (2)/(3) tragen eine Einzel-<p>-Schranke ((?!</p>)) — sonst spannt der Match
  // über mehrere Absätze und verschmilzt z.B. SchKG art_219 Abs. 5 (Bug 23.6.2026).
  // Bestehende Gesetze (class="absatz"-Markup) treffen (1) zuerst → unberührt,
  // ausser sie tragen echte alte Listen-Labels (dann korrekt verbessert, §6-Re-Baseline).
  //  (5) <table> — Mehrspalten-Tabelle (Rententabellen u.ä.); wird als GANZES
  //      konsumiert, damit ihre Zellen-<p> nicht einzeln matchen, und als
  //      mehrspaltig-Block geführt (sonst kompletter Verlust, Bug 23.6.2026).
  const NICHT_P = '(?:(?!</p>)[\\s\\S])*?';
  // Die <dl>-Alternative matcht NUR den Öffnungs-Tag (match[4] === ''); ihr Ende
  // wird im Loop BALANCIERT bestimmt (findeDlEnde), weil Fedlex verschachtelte
  // <dl> in <dd> setzt (lit. → nummerierte Unterpunkte, z.B. MStG art_42, KVV
  // art_30). Ein non-greedy `[\s\S]*?</dl>` stoppte sonst am ERSTEN — also dem
  // INNEREN — </dl> und verlor lit-Ebene + Einleitung (Bug 25.6.2026, §1).
  const bloeckeUndListenRe = new RegExp(
    '<p[^>]*\\bclass="[^"]*\\babsatz\\b[^"]*"[^>]*>([\\s\\S]*?)</p>' +
      `|<p[^>]*>((?:\\s|&nbsp;|<\\/?inl>)*<sup\\b[^>]*>\\d+(?:bis|ter|quater|quinquies)?[a-z]?</sup>${NICHT_P})</p>` +
      `|<p[^>]*>(${NICHT_P})</p>(?=\\s*<dl)` +
      '|(<dl[^>]*>)' +
      '|<table[^>]*>([\\s\\S]*?)</table>',
    'gi',
  );
  const bloecke: ArtikelText['bloecke'] = [];

  let match: RegExpExecArray | null;
  while ((match = bloeckeUndListenRe.exec(inner)) !== null) {
    // Leer-Match-Schutz: bei einem Null-Längen-Treffer (theoretisch) lastIndex
    // vorrücken, damit der Loop nicht hängt.
    if (match[0] === '') { bloeckeUndListenRe.lastIndex++; continue; }
    if (match[5] !== undefined) {
      // ── Tabelle (<table><tr><th>…</th></tr><tr><td>…</td></tr></table>) ──────
      const mehr = parseFedlexTabelle(match[5]);
      if (mehr.zeilen.length > 0) bloecke.push({ absatz: null, text: '', mehrspaltig: mehr });
    } else if (match[1] !== undefined || match[2] !== undefined || match[3] !== undefined) {
      // ── Absatz (<p class="absatz"> | <p><sup>N</sup> | <p> vor <dl>) ──────
      const roh = match[1] ?? match[2] ?? match[3]!;

      // Absatznummer: erstes <sup>, das KEIN <a>-Kind enthält und nur Ziffern/[a-z] enthält.
      // Fussnoten-<sup> sehen so aus: <sup><a href="...">188</a></sup> → verwerfen.
      const supMatch = roh.match(/^(?:\s|&nbsp;|<\/?inl>)*<sup(?:[^>]*)>([\s\S]*?)<\/sup>/i);
      let absatz: string | null = null;
      if (supMatch) {
        const supInhalt = supMatch[1];
        // Nur akzeptieren wenn kein <a>-Tag drin steckt und der Text nur Ziffern/[a-z] ist
        if (!/<a[\s>]/i.test(supInhalt) && /^\d+(?:bis|ter|quater|quinquies)?[a-z]?$/.test(supInhalt.trim())) {
          absatz = supInhalt.trim();
        }
      }

      // Fussnoten-<sup><a ...>…</a></sup> entfernen, BEVOR entferneTags läuft —
      // sonst bleibt die Zahl (z.B. «188») als Text stehen.
      const ohneFootnotes = roh.replace(/<sup[^>]*><a[\s\S]*?<\/a><\/sup>/gi, '');

      // Absatznummer-<sup> (gesetzt falls absatz != null) aus dem Roh-Text entfernen,
      // damit die Ziffer nicht in den sichtbaren Text einfließt.
      const ohneAbsatzNr = absatz
        ? ohneFootnotes.replace(/^(?:\s|&nbsp;|<\/?inl>)*<sup[^>]*>\d+(?:bis|ter|quater|quinquies)?[a-z]?<\/sup>(?:&nbsp;|\s|<\/?inl>)*/i, '')
        : ohneFootnotes;

      const text = entferneTags(ohneAbsatzNr).trim();
      if (text) {
        bloecke.push({ absatz, text });
      }
    } else if (match[4] !== undefined) {
      // ── Aufzählung (<dl><dt>marke.</dt><dd>text</dd>…</dl>) ───────────────
      // Balancierte <dl>…</dl>-Klammer: match[4] ist nur der Öffnungs-Tag; das
      // PASSENDE schliessende </dl> wird über die Tag-Tiefe gefunden, damit
      // verschachtelte <dl> (lit. → nummerierte Unterpunkte) komplett erfasst
      // werden (Bug 25.6.2026). dlInner = Inhalt OHNE äusseres <dl>/</dl>.
      const ende = findeDlEnde(inner, match.index);
      const dlInner = inner.slice(match.index + match[4].length, ende - '</dl>'.length);
      bloeckeUndListenRe.lastIndex = ende; // verschachtelte <dl>/<dt> nicht erneut matchen
      const items = parseDefinitionsListe(dlInner);
      if (items.length > 0) {
        if (bloecke.length > 0) {
          bloecke[bloecke.length - 1].items = items;
        } else {
          // Liste ohne vorangehenden Absatz (selten) → eigener Block.
          bloecke.push({ absatz: null, text: '', items });
        }
      }
    }
  }

  // Fallback: kein einziger <p class="absatz"> gefunden → ganzen Artikel-Text zurückgeben
  if (bloecke.length === 0) {
    const text = entferneTags(inner).replace(/^\s*Art\.\s*\S+\s*/, '').trim();
    if (text) return { bloecke: [{ absatz: null, text }] };
    // Leerer Artikel-Körper (Fedlex rendert aufgehobene, aber noch nummerierte
    // Artikel als blosse Überschrift mit leerem <div class="collapseable">, z.B.
    // SVG art_107): faithful als «aufgehoben»-Block darstellen (Konvention «…»,
    // NormPopover zeigt «aufgehoben»). So bleibt der Artikel in der
    // Vollständigkeit erfasst statt stumm zu fehlen (§8 Ehrlichkeit, kein
    // Aufweichen des Vollständigkeitstests).
    return { bloecke: [{ absatz: null, text: '…' }] };
  }

  return { bloecke };
}

/**
 * Findet zu einem <dl>-Öffnungs-Tag (an Position startIdx beginnend) den Index
 * NACH dem PASSENDEN schliessenden </dl>, indem die <dl>/</dl>-Tiefe gezählt wird.
 * Fedlex verschachtelt <dl> in <dd> (lit. → nummerierte Unterpunkte); ein
 * non-greedy Regex stoppte am falschen (inneren) </dl>. Fehlt das schliessende
 * Tag (malformed), wird das Stringende zurückgegeben (defensiv).
 */
function findeDlEnde(html: string, startIdx: number): number {
  const tagRe = /<dl\b[^>]*>|<\/dl>/gi;
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

/**
 * Zerlegt eine Fedlex-<dl>-Aufzählung in lit./Ziff.-Items — REKURSIV über
 * verschachtelte <dl> (lit.-Buchstabe → nummerierte Unterpunkte).
 *
 * Reale Struktur (SPIKE 16.6.2026, OR art_336/art_77):
 *   <dl><dt>a. </dt><dd>…Text;</dd><dt>b. </dt><dd>…</dd>…</dl>
 * Verschachtelt (MStG art_42, KVV art_30, MWSTV 126/127):
 *   <dl><dt>a. </dt><dd>Einleitung:<dl><dt>1. </dt><dd>…</dd>…</dl></dd>…</dl>
 * Die <dt>-Marke ist «a. », «1. » o.ä.; einzelne <dt> tragen einen
 * Fussnoten-<sup><a>…</a></sup> (z.B. «e.<sup><a>199</a></sup> »).
 *
 * marke = Buchstabe/Ziffer OHNE Punkt und ohne Fussnote ('a','b','17').
 * text  = bereinigter <dd>-Inhalt (Fussnoten-<sup> entfernt, Entities dekodiert);
 *         bei verschachteltem <dl> nur der Einleitungstext VOR der Unterliste.
 *
 * AUSGABE-MODELL (flach, abwärtskompatibel): Unterpunkte werden als weitere
 * Items NACH ihrem Eltern-Item in DOKUMENTREIHENFOLGE angehängt. Die Lesesicht
 * (ArtikelBody) rekonstruiert die Verschachtelung aus den Marken-Typen
 * (lit a/b/c = Stufe 0; Ziff 1/2/3 NACH einem lit = Stufe 1) — dasselbe
 * Datenmodell, das schon flache lit/Ziff/Strich-Listen zweistufig rendert.
 */
function parseDefinitionsListe(dlInner: string): Array<{ marke: string; text: string }> {
  const items: Array<{ marke: string; text: string }> = [];
  // Iterativer Scan über die direkten <dt>…<dd>-Paare DIESER Ebene. Ein <dd>
  // kann eine verschachtelte <dl> enthalten; deren Ende wird balanciert bestimmt
  // (findeDlEnde), damit das <dd>-Ende nicht am inneren </dl> falsch erkannt wird.
  const dtRe = /<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = dtRe.exec(dlInner)) !== null) {
    const ddStart = dtRe.lastIndex; // direkt nach dem <dd…>-Öffnungs-Tag
    // ── Ende dieses <dd> finden (balanciert über <dd>/</dd>) ──────────────
    const ddEnde = findeDdEnde(dlInner, ddStart);
    const ddRoh = dlInner.slice(ddStart, ddEnde);
    dtRe.lastIndex = ddEnde + '</dd>'.length; // hinter dieses </dd> springen

    // Verschachtelte <dl> in DIESEM <dd> abtrennen: Einleitungstext = vor der
    // Unterliste; die Unterliste wird rekursiv zerlegt und NACH dem Eltern-Item
    // eingehängt.
    const subDlIdx = ddRoh.search(/<dl\b[^>]*>/i);

    // Fussnoten-<sup><a>…</a></sup> aus der <dt>-Marke tilgen.
    const dtOhneFn = m[1].replace(/<sup[^>]*><a[\s\S]*?<\/a><\/sup>/gi, '');
    // Marke-Tags OHNE Leerzeichen strippen: das lat. Suffix steht als <sup>bis</sup>
    // direkt am Buchstaben («c<sup>bis</sup>»); entferneTags würde es zu «c bis»
    // trennen und die Regex unten verstümmelte es zu «c» (Bug-Audit 19.6.2026).
    const markeRoh = dekodiereEntities(dtOhneFn.replace(/<[^>]+>/g, '')).trim();
    // «a.» / «17.» / «a)» → nackte Marke ohne Punkt/Klammer.
    // Bug-Audit 19.6.2026: lat. Suffix bis/ter/quater/quinquies erhalten (sonst
    // «cbis»→«c», «1bis»→«1b»). Suffix VOR optionalem Buchstaben (wie ABS-Regex).
    const markeMatch = markeRoh.match(/^([0-9]+(?:bis|ter|quater|quinquies)?[a-z]?|[a-z](?:bis|ter|quater|quinquies)?)\s*[.)]?/i);
    const marke = markeMatch ? markeMatch[1].toLowerCase() : markeRoh.replace(/[.)]\s*$/, '');

    const ddVorListe = subDlIdx >= 0 ? ddRoh.slice(0, subDlIdx) : ddRoh;
    const ddOhneFn = ddVorListe.replace(/<sup[^>]*><a[\s\S]*?<\/a><\/sup>/gi, '');
    let text = entferneTags(ddOhneFn);

    // <dt>-EINGEBETTETER Text + LEERES <dd> (Fedlex-Sonderform, z.B. ZPO art_250
    // Ziff. 15, einige VStrR/StG/BV-Punkte): hier steht der Punkttext IM <dt>
    // hinter der Marke («<dt>15.<sup>fn</sup> Anordnung …</dt><dd></dd>») statt im
    // <dd>. Ohne Fallback ginge dieser Punkt stumm verloren (§1/§8). NUR greifen,
    // wenn das <dd> wirklich leer ist UND keine Unterliste vorliegt — sonst bleibt
    // alles byte-gleich (§6). Der Resttext nach der Marke wird tag-/fussnoten-
    // bereinigt übernommen.
    if (!text && subDlIdx < 0 && markeMatch) {
      // Die nackte Marke + Punkt/Klammer aus dem getaggt-/fussnoten-bereinigten
      // <dt> entfernen; der Rest ist der Punkttext.
      const dtTextRoh = dekodiereEntities(dtOhneFn.replace(/<[^>]+>/g, ' '))
        .replace(/\s+/g, ' ')
        .trim();
      const nachMarke = dtTextRoh.replace(
        /^[0-9]+(?:bis|ter|quater|quinquies)?[a-z]?\s*[.)]?\s*|^[a-z](?:bis|ter|quater|quinquies)?\s*[.)]?\s*/i,
        '',
      ).trim();
      if (nachMarke) text = nachMarke;
    }

    // Eltern-Item: auch ohne eigenen Text aufnehmen, WENN eine Unterliste folgt
    // (sonst ginge die lit-Ebene verloren — der eigentliche Bug). Andernfalls
    // wie bisher nur bei Text (leere Items werden verworfen).
    if (marke && (text || subDlIdx >= 0)) {
      items.push({ marke, text });
    }

    // Unterliste rekursiv anhängen (in Dokumentreihenfolge nach dem Eltern-Item).
    if (subDlIdx >= 0) {
      const subEnde = findeDlEnde(ddRoh, subDlIdx);
      const subOpenLen = ddRoh.slice(subDlIdx).match(/^<dl\b[^>]*>/i)![0].length;
      const subInner = ddRoh.slice(subDlIdx + subOpenLen, subEnde - '</dl>'.length);
      for (const sub of parseDefinitionsListe(subInner)) items.push(sub);
    }
  }
  return items;
}

/**
 * Findet zu einem <dd>-Inhalt (ab Position startIdx, NACH dem <dd…>-Öffnungs-Tag)
 * den Index des PASSENDEN schliessenden </dd>, balanciert über die <dd>-Tiefe.
 * Verschachtelte <dl><dt>…<dd>…</dd></dl> dürfen das <dd>-Ende nicht vortäuschen;
 * darum werden <dd>/</dd> gezählt (Start-Tiefe 1 für das offene <dd>).
 */
function findeDdEnde(html: string, startIdx: number): number {
  const tagRe = /<dd\b[^>]*>|<\/dd>/gi;
  tagRe.lastIndex = startIdx;
  let tiefe = 1;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(html)) !== null) {
    if (m[0].toLowerCase().startsWith('</')) {
      tiefe--;
      if (tiefe === 0) return m.index;
    } else {
      tiefe++;
    }
  }
  return html.length;
}

/**
 * Zerlegt eine Fedlex-<table> in einen mehrspaltig-Block {kopf, zeilen}.
 * <th>-Zellen der ersten Zeile bilden den Kopf; <td>-Zeilen die Daten. Jede
 * Zelle wird tag-bereinigt (Fussnoten-<sup> getilgt). Leere Zeilen entfallen.
 * Reale Struktur (IVG art_28b): <tr><th><p>…</p></th>…</tr><tr><td><p>…</p></td>…</tr>.
 */
function parseFedlexTabelle(tableInner: string): { kopf?: string[]; zeilen: string[][] } {
  let kopf: string[] = [];
  const zeilen: string[][] = [];
  for (const r of tableInner.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const ths = [...r[1].matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map((c) =>
      entferneTags(c[1].replace(/<sup[^>]*><a[\s\S]*?<\/a><\/sup>/gi, '')),
    );
    if (ths.length > 0) {
      if (ths.some((x) => x !== '')) kopf = ths;
      continue;
    }
    const tds = [...r[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((c) =>
      entferneTags(c[1].replace(/<sup[^>]*><a[\s\S]*?<\/a><\/sup>/gi, '')),
    );
    if (tds.some((x) => x !== '')) zeilen.push(tds);
  }
  return kopf.length > 0 ? { kopf, zeilen } : { zeilen };
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
