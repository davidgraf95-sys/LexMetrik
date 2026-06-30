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
  /** G23 (M8): Delegationsnorm-Verweis «(Art. N ArG)» aus
   *  <p class="man-template-referenz"> — die Trägergesetz-Grundlage, auf der eine
   *  Verordnungsbestimmung beruht. Steht in Fedlex direkt unter der Überschrift;
   *  wurde bisher von keiner Block-Alternative erfasst und stumm verworfen. */
  grundlage?: string;
  bloecke: Array<{
    absatz: string | null;
    text: string;
    items?: Array<{ marke: string; text: string; tiefe?: number }>;
    /** Fedlex-<table> als Mehrspalten-Block (Bug-Fix 23.6.2026: Tabellen wurden
     *  zuvor komplett gedroppt — z.B. IVG art_28b Rententabelle, AHVG art_34bis).
     *  M10: kanonisches `spalten`-Modell (T-B1) statt rohem `{kopf,zeilen}`. */
    mehrspaltig?: {
      spalten?: Array<{ typ: 'bereich' | 'zahl' | 'text' | 'betrag'; titel: string }>;
      kopf?: string[];
      zeilen: string[][];
    };
  }>;
}

import { dekodiereEntities } from './html-entities.ts';
import { normalisiereTabelle, type RohTabelle, type RohZelle } from './tabelle-normalisieren.ts';

/**
 * Entfernt Fussnoten-Marker <sup><a …>NNN</a></sup> aus einem HTML-Fragment,
 * SAMT der Ziffer (sonst leakt «337» o.ä. in den Normtext). Robust gegen
 * Whitespace/&nbsp;/<inl>-Wrapper zwischen <sup> und <a> (Fedlex emittiert das
 * vereinzelt). Absatznummern-<sup> (nacktes <sup>N</sup> OHNE <a>) bleiben
 * unberührt — die werden separat als absatz erkannt.
 */
export function entferneFussnotenSups(html: string): string {
  return html.replace(
    /<sup\b[^>]*>(?:\s|&nbsp;|<\/?inl>)*<a\b[\s\S]*?<\/a>(?:\s|&nbsp;|<\/?inl>)*<\/sup>/gi,
    '',
  );
}

/**
 * Extrahiert einen einzelnen Artikel aus einem Fedlex-Filestore-HTML.
 *
 * @param html  - Volltext des heruntergeladenen HTML-Dokuments
 * @param token - Artikel-ID ohne Präfix «art_», z.B. «77», «335_c», «19_a»
 * @returns     ArtikelText mit Absatz-Blöcken, oder null wenn Anker fehlt
 */
export function extrahiereArtikel(html: string, token: string): ArtikelText | null {
  // Haupttext-Artikel: Anker = «art_<token>». Delegiert an die anker-basierte
  // Variante (byte-gleich; der Anker wird nur explizit benannt).
  return extrahiereArtikelAusAnker(html, `art_${token}`);
}

/**
 * Wie extrahiereArtikel, aber mit dem VOLLEN Anker statt nur der Artikel-Nr. —
 * z.B. «art_335_c» (Haupttext) ODER «disp_u1/art_1» (Schlusstitel/UeB, M13).
 * Die Block-Parserei darunter ist identisch; nur das gesuchte <article id="…">
 * unterscheidet sich. So fällt der Schlusstitel (eigenes Anker-Schema
 * `disp_uN/art_*`, von alleArtikelTokens digit-only nicht erfasst) nicht mehr
 * stumm weg (§7-Vollabdeckung), ohne den Haupttext-Pfad anzufassen.
 *
 * @param ankerRoh - Voller Anker, optional mit Synthese-Suffix «__2» (N-tes
 *                   Vorkommen bei doppelter id, s. alleArtikelTokens/alleSchlussteilAnker).
 */
export function extrahiereArtikelAusAnker(html: string, ankerRoh: string): ArtikelText | null {
  // M9/G7: doppelte id. Ein Erlass kann ZWEI <article id="…"> mit identischem
  // Anker tragen (KKV art_126_z: «Anlagebeschränkungen» + «126z tredecies
  // Wesentliche Mängel»; betmg/vwvg/pavo: aufgehobene Bereichs-Artikel «15a–15c»).
  // alleArtikelTokens/alleSchlussteilAnker vergeben dem 2./3. Vorkommen einen
  // Synthese-Suffix «__2»/«__3»; hier extrahieren wir dann das N-te Vorkommen des
  // BASIS-Ankers. Ohne Suffix (Normalfall) = erstes Vorkommen, byte-gleich.
  const suffix = ankerRoh.match(/^(.*)__(\d+)$/);
  const basisAnker = suffix ? suffix[1] : ankerRoh;
  const nth = suffix ? Number(suffix[2]) : 1;
  // Escape des Ankers für die Regex (Unterstriche und «/» sind literal, kein
  // Sonderzeichen — der «/»-Trenner des disp-Schemas bleibt unberührt).
  const escapedToken = basisAnker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const articleRe = new RegExp(
    `<article[^>]*\\sid="${escapedToken}"[^>]*>([\\s\\S]*?)</article>`,
    'gi',
  );
  const treffer = [...html.matchAll(articleRe)];
  const articleMatch = treffer[nth - 1];
  if (!articleMatch) return null;

  // Fussnoten-Apparat (<div class="footnotes">…</div>) und Artikel-Überschrift
  // (<h6>…</h6>, trägt eine Heading-Fussnote) sind KEIN Normtext und werden vorab
  // entfernt — sonst leckt der Fallback-Pfad (unnummerierte plain-<p>-Artikel wie
  // BETMG/VStrR) den Fussnotentext + Marker in den Normtext (Bug-Check 23.6.2026).
  // Der Haupt-Loop matcht diese Elemente ohnehin nicht; nur der Fallback profitiert.
  const innerRoh = articleMatch[1]
    .replace(/<div\s+class="footnotes">[\s\S]*$/i, '') // Apparat steht am Artikelende
    .replace(/<h6\b[^>]*>[\s\S]*?<\/h6>/gi, '');

  // G23 (M8): Delegationsnorm-Verweis <p class="man-template-referenz">(Art. N ArG)</p>
  // direkt nach der Überschrift — bisher von keiner Block-Alternative erfasst und
  // stumm verloren (~7100 Verordnungs-Bestimmungen). Als artikel-level `grundlage`
  // erhalten (amtlicher Inhalt, §2/§8) und aus dem Body entfernen, damit er nicht
  // in den Fallback-Text leakt. Die Marke trägt vereinzelt einen Fussnoten-<sup>.
  const refRe = /<p\b[^>]*\bclass="[^"]*\bman-template-referenz\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i;
  const refMatch = innerRoh.match(refRe);
  const grundlage = refMatch ? entferneTags(entferneFussnotenSups(refMatch[1])) || undefined : undefined;
  const inner = innerRoh.replace(new RegExp(refRe.source, 'gi'), '');
  const mitGrundlage = grundlage ? { grundlage } : {};

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
      // M10: kanonisches spalten-Modell (rechteckig, Staffel verdichtet, T-B1).
      // Lässt sich keine wortlauttreue Rechteck-Form herstellen (ragged/Prosa),
      // bleibt der Alt-Parse {kopf,zeilen} erhalten — exakte Nicht-Regression,
      // der Renderer rendert Legacy weiter (T-E5); der Validator listet sie.
      const norm = normalisiereTabelle(parseRohTabelle(match[5]));
      if (norm) {
        bloecke.push({ absatz: null, text: '', mehrspaltig: { spalten: norm.spalten, zeilen: norm.zeilen } });
      } else {
        const mehr = parseFedlexTabelle(match[5]);
        if (mehr.zeilen.length > 0) bloecke.push({ absatz: null, text: '', mehrspaltig: mehr });
      }
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
      const ohneFootnotes = entferneFussnotenSups(roh);

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

  // Fallback: kein einziger <p class="absatz"> gefunden → ganzen Artikel-Text zurückgeben.
  // WICHTIG (Bug-Befund 25.6.2026): auch hier die Fussnoten-<sup><a>…</a></sup>
  // entfernen, BEVOR entferneTags läuft — sonst leakt die Fussnoten-Ziffer in den
  // Normtext (z.B. DBG art_222 «…1995 337», VwVG art_17). Betrifft Artikel, deren
  // einziger Inhalt ein <p> mit Nicht-«absatz»-Klasse ist (class="inkrafttreten" u.ä.),
  // das keinen Block-Zweig trifft. Mehrfach-Leerzeichen (nach Marker-Entfernung
  // mitten im Satz) auf eines reduzieren.
  if (bloecke.length === 0) {
    const text = entferneTags(entferneFussnotenSups(inner)).replace(/^\s*Art\.\s*\S+\s*/, '').replace(/\s{2,}/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
    if (text) return { ...mitGrundlage, bloecke: [{ absatz: null, text }] };
    // Leerer Artikel-Körper (Fedlex rendert aufgehobene, aber noch nummerierte
    // Artikel als blosse Überschrift mit leerem <div class="collapseable">, z.B.
    // SVG art_107): faithful als «aufgehoben»-Block darstellen (Konvention «…»,
    // NormPopover zeigt «aufgehoben»). So bleibt der Artikel in der
    // Vollständigkeit erfasst statt stumm zu fehlen (§8 Ehrlichkeit, kein
    // Aufweichen des Vollständigkeitstests).
    return { ...mitGrundlage, bloecke: [{ absatz: null, text: '…' }] };
  }

  return { ...mitGrundlage, bloecke };
}

/**
 * Findet zu einem <dl>-Öffnungs-Tag (an Position startIdx beginnend) den Index
 * NACH dem PASSENDEN schliessenden </dl>, indem die <dl>/</dl>-Tiefe gezählt wird.
 * Fedlex verschachtelt <dl> in <dd> (lit. → nummerierte Unterpunkte); ein
 * non-greedy Regex stoppte am falschen (inneren) </dl>. Fehlt das schliessende
 * Tag (malformed), wird das Stringende zurückgegeben (defensiv).
 */
export function findeDlEnde(html: string, startIdx: number): number {
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
 * Items NACH ihrem Eltern-Item in DOKUMENTREIHENFOLGE angehängt. Jedes Item
 * trägt eine EXPLIZITE `tiefe` (0 = direkte Liste des Absatzes, +1 je
 * verschachtelter <dl>). Damit muss die Lesesicht (ArtikelBody) die
 * Verschachtelung NICHT mehr aus den Marken-Typen RATEN — das Raten erzeugte
 * falsche Zitate, wenn Fedlex die übliche Reihenfolge umkehrt (Ziff. → lit.
 * statt lit. → Ziff.): die geratene Stufe entnestete die lit. fälschlich auf
 * Absatzebene und die Fundstelle wurde falsch (§1-Bug G8, M6 28.6.2026).
 *
 * `tiefe` wird NUR emittiert, wenn > 0 (verschachtelt). Top-Level-Items
 * (tiefe 0) bleiben byte-gleich zum bisherigen Modell {marke,text} → keine
 * unnötige Snapshot-Re-Segnung für nicht verschachtelte Erlasse; nur Artikel
 * MIT echter Verschachtelung brechen den Daten-Index (bewusst, §7).
 */
function parseDefinitionsListe(
  dlInner: string,
  tiefe = 0,
): Array<{ marke: string; text: string; tiefe?: number }> {
  const items: Array<{ marke: string; text: string; tiefe?: number }> = [];
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
      // tiefe NUR setzen, wenn verschachtelt (>0) → Top-Level byte-gleich (§7).
      items.push(tiefe > 0 ? { marke, text, tiefe } : { marke, text });
    }

    // Unterliste rekursiv anhängen (in Dokumentreihenfolge nach dem Eltern-Item),
    // eine Stufe tiefer — die Stufe wird explizit geführt, nicht geraten.
    if (subDlIdx >= 0) {
      const subEnde = findeDlEnde(ddRoh, subDlIdx);
      const subOpenLen = ddRoh.slice(subDlIdx).match(/^<dl\b[^>]*>/i)![0].length;
      const subInner = ddRoh.slice(subDlIdx + subOpenLen, subEnde - '</dl>'.length);
      for (const sub of parseDefinitionsListe(subInner, tiefe + 1)) items.push(sub);
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
export function findeDdEnde(html: string, startIdx: number): number {
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

/** Tag-/Fussnoten-bereinigter Inhalt einer Tabellen-Zelle. */
function zellText(c: string): string {
  return entferneTags(c.replace(/<sup[^>]*><a[\s\S]*?<\/a><\/sup>/gi, ''));
}

/**
 * Zerlegt die Zellen einer <tr> (Tag `td` oder `th`) zu einem Spalten-Array und
 * EXPANDIERT colspan: eine Zelle mit colspan=N belegt N Spalten — der Text steht
 * in der ersten, die übrigen (N-1) sind leer. So bleibt die Spaltenzahl von Kopf
 * und Daten konsistent, wenn NUR der Kopf gruppierte (colspan-)Zellen hat
 * (GebV SchKG art_30: Kopf 2 colspan-Zellen über 6 Datenspalten). Minimal — kein
 * Zell-Merge/rowspan (David-Entscheid 28.6.: «minimal colspan→Kopf-Padding»).
 */
function zeileMitColspan(rowHtml: string, tag: 'td' | 'th'): string[] {
  const zellen: string[] = [];
  const re = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)</${tag}>`, 'gi');
  for (const c of rowHtml.matchAll(re)) {
    const span = Number(c[1].match(/\bcolspan=["']?(\d+)/i)?.[1] ?? '1') || 1;
    zellen.push(zellText(c[2]));
    for (let k = 1; k < span; k++) zellen.push('');
  }
  return zellen;
}

/**
 * Zerlegt eine Fedlex-<table> in einen mehrspaltig-Block {kopf, zeilen}.
 *
 * ZWEI Markup-Varianten:
 *  (A) <th>-Tabellen (IVG art_28b, AHVV/BVG-Tarife): erste/letzte <th>-Zeile =
 *      Kopf, <td>-Zeilen = Daten — colspan wird (wie bisher) IGNORIERT, weil dort
 *      Kopf UND Daten dieselben colspan tragen und so konsistent ausgerichtet
 *      sind (Audit «colspan widerlegt» trifft für <th>-Tabellen zu). UNVERÄNDERT
 *      → byte-gleich.
 *  (B) kpf-als-<td>-Tabellen (GebV SchKG art_30): KEIN <th>, der Kopf steht als
 *      <td><p class="man-template-tab-kpf">…</p></td> — bisher als Datenzeile
 *      verkannt (G20) und ohne colspan-Expansion gegen die Daten verschoben.
 *      Hier: Kopf-Zeilen erkennen, colspan KONSISTENT (Kopf + Daten dieser
 *      Tabelle) expandieren, mehrere Kopfzeilen spaltenweise zusammenführen
 *      (G19: obere Kopfzeile ging sonst verloren).
 * Reale Struktur: <tr><td colspan="4"><p class="man-template-tab-kpf">…</p></td>…</tr>.
 */
function parseFedlexTabelle(tableInner: string): { kopf?: string[]; zeilen: string[][] } {
  const hatTh = /<th\b/i.test(tableInner);
  const istKpfStil = !hatTh && /man-template-tab-kpf/i.test(tableInner);

  if (!istKpfStil) {
    // ── Variante (A) + plain-<td>: bestehender Pfad, byte-gleich ──────────────
    let kopf: string[] = [];
    const zeilen: string[][] = [];
    for (const r of tableInner.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const ths = [...r[1].matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map((c) => zellText(c[1]));
      if (ths.length > 0) {
        if (ths.some((x) => x !== '')) kopf = ths;
        continue;
      }
      const tds = [...r[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => zellText(c[1]));
      if (tds.some((x) => x !== '')) zeilen.push(tds);
    }
    return kopf.length > 0 ? { kopf, zeilen } : { zeilen };
  }

  // ── Variante (B): kpf-als-<td> — Kopf-Erkennung + colspan-Padding (G19/G20) ──
  const kopfZeilen: string[][] = [];
  const zeilen: string[][] = [];
  for (const r of tableInner.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const zellenRoh = [...r[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)];
    // Kopfzeile: jede nicht-leere Zelle trägt die tab-kpf-Klasse (keine Datenzelle).
    const istKopf =
      zellenRoh.some((c) => /man-template-tab-kpf/i.test(c[1])) &&
      zellenRoh.every((c) => /man-template-tab-kpf/i.test(c[1]) || zellText(c[1]) === '');
    const zellen = zeileMitColspan(r[1], 'td');
    if (istKopf) kopfZeilen.push(zellen);
    else if (zellen.some((x) => x !== '')) zeilen.push(zellen);
  }
  // Mehrere Kopfzeilen spaltenweise zusammenführen (G19): je Spalte die nicht-
  // leeren Texte der Kopfzeilen mit ' ' verbinden — nichts geht verloren (§8).
  const breite = Math.max(0, ...kopfZeilen.map((z) => z.length));
  const kopf: string[] = [];
  for (let c = 0; c < breite; c++) {
    kopf.push(kopfZeilen.map((z) => z[c] ?? '').filter(Boolean).join(' '));
  }
  return kopf.some((x) => x !== '') ? { kopf, zeilen } : { zeilen };
}

/** Roh-Zellen einer <tr> (tag `td`|`th`) MIT colspan — Text via zellText
 *  (fussnoten-/tag-bereinigt). Keine colspan-Expansion hier; die macht der
 *  reine Normalisierer (T-A2). */
function rohZellen(rowHtml: string, tag: 'td' | 'th'): RohZelle[] {
  const out: RohZelle[] = [];
  const re = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)</${tag}>`, 'gi');
  for (const c of rowHtml.matchAll(re)) {
    const span = Number(c[1].match(/\bcolspan=["']?(\d+)/i)?.[1] ?? '1') || 1;
    out.push({ text: zellText(c[2]), colspan: span });
  }
  return out;
}

/**
 * Zerlegt eine Fedlex-<table> in roh geparste Kopf-/Datenzeilen (mit colspan),
 * OHNE zu normalisieren — Eingabe für `normalisiereTabelle` (M10, T-F8).
 * Kopf-Erkennung beide Markup-Welten: (A) `<th>`-Zeile; (B) `<td>`-Zeile, deren
 * nicht-leere Zellen ALLE die `man-template-tab-kpf`-Klasse tragen. MEHRERE
 * Kopfzeilen werden gesammelt (T-A5-Merge geschieht im Normalisierer; der
 * Alt-Pfad behielt nur die letzte → G19-Caption-Verlust, z.B. AHVV Art. 21).
 */
function parseRohTabelle(tableInner: string): RohTabelle {
  const kopfZeilen: RohZelle[][] = [];
  const datenZeilen: RohZelle[][] = [];
  for (const r of tableInner.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const rowHtml = r[1];
    if (/<th\b/i.test(rowHtml)) {
      const ths = rohZellen(rowHtml, 'th');
      if (ths.some((z) => z.text !== '')) kopfZeilen.push(ths);
      continue;
    }
    const tds = rohZellen(rowHtml, 'td');
    const istKpf =
      /man-template-tab-kpf/i.test(rowHtml) &&
      [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].every(
        (m) => /man-template-tab-kpf/i.test(m[1]) || zellText(m[1]) === '',
      );
    if (istKpf) {
      if (tds.some((z) => z.text !== '')) kopfZeilen.push(tds);
    } else if (tds.some((z) => z.text !== '')) {
      datenZeilen.push(tds);
    }
  }
  return { kopfZeilen, datenZeilen };
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
 *
 * M9/G7: Ein wiederholtes Token wird NICHT mehr verworfen (sonst ginge der zweite
 * Artikel stumm verloren, §8) — das N-te Vorkommen erhält einen Synthese-Suffix
 * «__2»/«__3». extrahiereArtikel löst diesen Suffix wieder auf das N-te Vorkommen
 * des Basis-Tokens auf. Reihenfolge wie im HTML.
 *
 * @param html - Volltext des Fedlex-Filestore-HTML
 * @returns Array der Token-Strings, z.B. ['1','2','335_c','126_z','126_z__2']
 */
export function alleArtikelTokens(html: string): string[] {
  const re = /id="art_(\d[\w]*)"/g;
  const anzahl = new Map<string, number>();
  const tokens: string[] = [];
  for (const m of html.matchAll(re)) {
    const basis = m[1];
    const n = (anzahl.get(basis) ?? 0) + 1;
    anzahl.set(basis, n);
    tokens.push(n === 1 ? basis : `${basis}__${n}`);
  }
  return tokens;
}

/**
 * M13 — Schlusstitel-/Übergangs-/Schlussbestimmungs-Artikel.
 *
 * Fedlex legt neu-nummerierte Schluss-Divisionen («Schlusstitel:
 * Anwendungs- und Einführungsbestimmungen» beim ZGB, «Schlussbestimmungen der
 * Änderung vom …», «Übergangsbestimmungen …») unter einem EIGENEN Anker-Schema
 * ab: `<article id="disp_uN/art_*">` (gewickelt in `<div id="dispositions">`,
 * ausserhalb von `<main>`). Diese Artikel beginnen MIT EIGENER Nummerierung neu
 * (Art. 1, 2 …) und kollidieren so mit dem Haupttext (art_1). alleArtikelTokens
 * (digit-only, Präfix `art_`) erfasst sie nicht → bis M13 fielen sie stumm weg
 * (ZGB: 178 Artikel, OR: 83, PatG/SchKG/SVG: 14).
 *
 * Liefert die VOLLEN Anker (`disp_u1/art_1`) in HTML-Reihenfolge. Doppelte Anker
 * erhalten — wie alleArtikelTokens — einen Synthese-Suffix «__2»/«__3»
 * (extrahiereArtikelAusAnker löst ihn auf). Der Generator/Struktur-Pfad bildet
 * daraus über ankerZuToken ein dateiweit EINDEUTIGES Token (`disp_u1_art_1`),
 * das nicht mit dem Haupttext-Token «1» kollidiert.
 *
 * @returns z.B. ['disp_u1/art_1','disp_u1/art_6_b_bis','disp_u2/art_178', …]
 */
export function alleSchlussteilAnker(html: string): string[] {
  // Fedlex nutzt ZWEI disp-Varianten: «disp_u1/art_…» (Normalfall) UND «disp_1/art_…»
  // OHNE «u» (z.B. VZG-Schlussbestimmungen art_135/136). Beide erfassen («u?»).
  const re = /<article[^>]*\sid="(disp_u?\d+\/art_\w+)"/gi;
  const anzahl = new Map<string, number>();
  const anker: string[] = [];
  for (const m of html.matchAll(re)) {
    const basis = m[1];
    const n = (anzahl.get(basis) ?? 0) + 1;
    anzahl.set(basis, n);
    anker.push(n === 1 ? basis : `${basis}__${n}`);
  }
  return anker;
}

/**
 * Bildet aus einem vollen Anker das dateiweit eindeutige, DOM-/URL-sichere Token
 * (= Wert des Snapshot-Felds `artikel`, zugleich Struktur-Sidecar-Schlüssel).
 * Beide Erzeuger — der Snapshot-Generator UND der Struktur-Extraktor — MÜSSEN
 * dieselbe Ableitung verwenden, sonst bricht der Sidecar-Join (gliederung/
 * marginalie fänden den Schlusstitel-Artikel nicht).
 *
 *   'art_335_c'        → '335_c'          (Haupttext, byte-gleich zu bisher)
 *   'disp_u1/art_1'    → 'disp_u1_art_1'  (Schlusstitel: «/» → «_», kollisionsfrei)
 *   'disp_u1/art_1__2' → 'disp_u1_art_1__2'
 */
export function ankerZuToken(anker: string): string {
  return anker.startsWith('art_') ? anker.slice(4) : anker.replace(/\//g, '_');
}

/** Die reine Artikel-Nummer aus einem Schlussteil-Anker, für das Label.
 *  'disp_u1/art_6_b_bis' → '6_b_bis'; 'disp_u1/art_31_32__2' → '31_32'. */
export function schlussteilLabelSuffix(anker: string): string {
  return anker.replace(/__\d+$/, '').replace(/^.*\/art_/, '');
}
