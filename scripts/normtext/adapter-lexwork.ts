/**
 * LexWork-Adapter — Norm-Volltext aus der LexWork-Plattform (18+ Kantone:
 * BE, ZG, OW, …) für die Norm-Vorschau-Popover.
 *
 * Empirisch gepinnter Vertrag (Spike 16.6.2026, ZG 161.7 / BE 161.12):
 *   GET https://<host>/api/{de|fr}/texts_of_law/{lawId}  → HTTP 200 JSON
 *   Top-Level { "text_of_law": {...} } mit u.a.:
 *     - title, abbreviation, enactment ('YYYY-MM-DD'), version_uid (Drift-Token)
 *     - current_version: { id, version_dates_str, structured_document_id }
 *     - selected_version: { xhtml_tol, pdf_link_tol, structured_document_id, … }
 *   structured_document_id liegt unter den *_version-Objekten (NICHT top-level,
 *   anders als die Auftragsleitlinie behauptete — Realität gewinnt, §7). Ist es
 *   null/fehlt ODER ist xhtml_tol falsy, ist der Erlass nur als PDF verfügbar.
 *
 * REALE xhtml_tol-Struktur (verifiziert, weicht in Details vom Vertrag ab):
 *   - Artikel-Kopf:  <div class='article'> mit
 *       <div class='article_number'><span class='article_symbol'>§|Art.</span>
 *         <span class='number'>1</span></div>  + optional article_title.
 *   - article / paragraph / enumeration_item sind GESCHWISTER, nicht verschachtelt.
 *   - Absatz:  <div class='paragraph'><span class='number'>1</span>
 *       <p><span class='text_content'>…</span></p></div>
 *   - Buchstaben-Liste:  <table class='enumeration_item'><tr>
 *       <td class='number'>a)</td><td class='left_col …'>…Text;</td></tr></table>
 *       → Text liegt DIREKT im td (kein text_content-Span; Nummer als «a)», nicht «a.»).
 *   - Änderungs-Marker <strong>*</strong>, &nbsp; und HTML-Entities kommen vor
 *     und werden bereinigt/dekodiert.
 *
 * Öffentliche Signaturen (LexArtikel/LexWorkErgebnis/Funktionen) sind stabil;
 * Regex-Interna dürfen sich anpassen, wenn LexWork das Markup ändert (§7).
 */

import { dekodiereEntities } from './html-entities.ts';
import { reichereMehrspaltig } from './mehrspaltige-tabelle.ts';

/**
 * Soft-404 / Angular-Shell des LexWork-`/api/`-Endpunkts.
 *
 * Migriert ein LexWork-Host seinen strukturierten Endpunkt (Befund GL/
 * gesetze.gl.ch, 11.7.2026: der `/app/`-SPA-Pfad liefert bereits eine 2.3 KB
 * «Casemates»-Angular-Shell mit HTTP 200 + text/html), kann `/api/texts_of_law/{id}`
 * dieselbe Shell statt des JSON-Bodys ausliefern — HTTP 200, aber kein
 * `text_of_law`. Ohne eigene Erkennung würde `res.json()` mit einem kryptischen
 * «Unexpected token '<'» scheitern, im Drift-Tor als blosse Netz-WARNUNG
 * durchrutschen und die Snapshots **still veralten** (scraping-Skill Fakt 3:
 * Fehler am Content-Type erkennen, nie am Status-Code). Diese eigene Fehlerklasse
 * macht die Bedingung im Tor (`check:normtext-netz`) zu einem HARTEN Fehler.
 */
export class LexWorkShellError extends Error {
  /** Diskriminator für den Fall, dass `instanceof` über Modul-Grenzen bricht. */
  readonly istSoftShell = true as const;
  readonly url: string;
  readonly detail: string;
  constructor(url: string, detail: string) {
    super(
      `LexWork ${url}: Soft-404-Shell — ${detail}. Der strukturierte Endpunkt ` +
        `liefert kein JSON (vermutlich Angular-/Casemates-Shell). Quell-Migration? ` +
        `Snapshots würden sonst still veralten (§7 Drift-Erkennung).`,
    );
    this.name = 'LexWorkShellError';
    this.url = url;
    this.detail = detail;
  }
}

export interface LexArtikel {
  bloecke: Array<{
    absatz: string | null;
    text: string;
    items?: Array<{ marke: string; text: string }>;
    /** Stufe 2: Mehrspalten-Tabelle (NW/BS/SO/VS/ZG/TG ·/—-Text). Kanonisch
     * `spalten` (typisiert, T-B1); `kopf` bleibt als Legacy-Feld im Typ. */
    mehrspaltig?: {
      kopf?: string[];
      spalten?: Array<{ typ: 'bereich' | 'zahl' | 'text' | 'betrag'; titel: string }>;
      zeilen: string[][];
    };
  }>;
  /**
   * N1 — amtlicher Randtitel (Sachtitel) des Artikels aus
   * <div class='article_title'><span class='title_text'>…</span></div>,
   * fussnoten-bereinigt. Fehlt der Titel oder ist er nur «…»/leer (aufgehobene,
   * umnummerierte Artikel), bleibt das Feld undefined — wir fabrizieren keinen
   * Randtitel (§7). Wird in der Lesesicht als Randtitel angezeigt.
   */
  titel?: string;
}

export interface LexWorkErgebnis {
  meta: {
    titel: string;
    abkuerzung: string;
    versionUid: string;
    stand: string;
    pdfUrl: string | null;
    nurPdf: boolean;
  };
  artikel: Record<string, LexArtikel>; // token → Artikel
  /** Einheitliches Artikel-Label je token, abgeleitet aus dem Quell-Designator
   *  (article_symbol «§»/«Art.») + Nummer — «§ N» bzw. «Art. N». Konsistent mit
   *  Bund, unabhängig vom rohen Tarif-Zitat (Auftrag David 16.6.2026). */
  labels: Record<string, string>;
}

/** Strippt HTML-Tags, dekodiert die in LexWork vorkommenden Entities und
 *  normalisiert Whitespace zu einfachen Leerzeichen. */
function bereinige(roh: string): string {
  // Fussnoten-Anker «<a class="footnote" …>[8]</a>» (bzw. «8») sind redaktionelle
  // Verweis-Marker, KEIN Normtext → komplett (inkl. Inhalt) entfernen, BEVOR der
  // generische Tag-Strip läuft (analog zur <sup><a>-Fussnoten-Behandlung im
  // Fedlex-Extraktor). Sonst bliebe der Anker-Inhalt «[8]»/«8» als Streustelle
  // im Text stehen (§7 Treue, GL III B/7/1 «…Fusionsgesetz[8]:»).
  const ohneFootnotes = roh.replace(
    /<a\b[^>]*class=["']footnote["'][^>]*>[\s\S]*?<\/a>/gi,
    '',
  );
  // LexWork-Änderungsmarker «<strong>*</strong>» sind redaktionelle Annotationen
  // (markieren geänderte Stellen), KEIN Normtext → vor dem Strip entfernen, damit
  // kein loses «*» im Text verbleibt.
  const ohneMarker = ohneFootnotes.replace(/<strong>\s*\*\s*<\/strong>/gi, '');
  const ohneTags = ohneMarker.replace(/<[^>]+>/g, '');
  return dekodiereEntities(ohneTags).replace(/\s+/g, ' ').trim();
}

/** Liest den ersten .number-Span aus einem .article_number-Block. */
function leseArtikelNummer(segment: string): string | null {
  const numBlock = segment.match(
    /<div\s+class='article_number'>([\s\S]*?)<\/div>/i,
  );
  if (!numBlock) return null;
  const num = numBlock[1].match(/<span\s+class='number'>([\s\S]*?)<\/span>/i);
  if (!num) return null;
  return bereinige(num[1]);
}

/** Liest das article_symbol («§»/«Art.») aus einem .article_number-Block.
 *  Default «Art.» wenn kein Symbol erkennbar (defensiv; LexWork liefert es). */
function leseArtikelSymbol(segment: string): string {
  const numBlock = segment.match(
    /<div\s+class='article_number'>([\s\S]*?)<\/div>/i,
  );
  if (!numBlock) return 'Art.';
  const sym = numBlock[1].match(
    /<span\s+class='article_symbol'>([\s\S]*?)<\/span>/i,
  );
  if (!sym) return 'Art.';
  const roh = bereinige(sym[1]);
  // «§» bleibt «§»; alles andere («Art.», «art.») → kanonisch «Art.».
  return roh.startsWith('§') ? '§' : 'Art.';
}

/**
 * Extrahiert ALLE Artikel des Erlasses (token → Artikel) plus ein einheitliches
 * Label je token (Designator + Nummer, «§ N»/«Art. N»). Vollabdeckung (§7, Build-
 * Regel Norm-Snapshots): nicht nur die zitierten Tokens, sondern jeder
 * <div class='article'> im xhtml_tol. Das Label folgt dem Quell-Designator
 * (article_symbol), nicht dem rohen Tarif-Zitat → tier-/artikelübergreifend
 * konsistent mit Bund.
 */
export function extrahiereAlleLexWorkArtikel(xhtml: string): {
  artikel: Record<string, LexArtikel>;
  labels: Record<string, string>;
} {
  const artikel: Record<string, LexArtikel> = {};
  const labels: Record<string, string> = {};
  const teile = xhtml.split(/(?=<div\s+class='article'>)/i);
  for (const segment of teile) {
    if (!/^\s*<div\s+class='article'>/i.test(segment)) continue;
    const nummer = leseArtikelNummer(segment);
    if (nummer === null) continue;
    // Token kongruent zum Inventar/Fedlex-Anker: «1a» → «1_a», «335bis» → «335_bis».
    const token = nummer
      .toLowerCase()
      .replace(/^(\d+)([a-z])?(bis|ter|quater|quinquies)?$/i, (_, n, b, suf) =>
        [n, b, suf].filter(Boolean).join('_'),
      );
    if (token in artikel) continue; // erster Treffer gewinnt (stabil)
    const parsed = parseSegment(segment);
    // S1 (BS-Audit 23.6.2026) — aufgehobene, aber UMNUMMERIERTE Artikel haben einen
    // Artikel-Header (Nummer + «…»-Titel), aber KEIN paragraph/enumeration-Segment
    // → parseSegment liefert bloecke=[]. Früher wurde der Eintrag hier verworfen,
    // wodurch die Nummerierung riss und der Artikel komplett verschwand (410.100
    // §6–§30, 153.100 §53). Statt droppen einen Eintrag mit EINEM leeren Block
    // emittieren — die Lesesicht (ArtikelBody) rendert leere Blöcke bereits als
    // gedämpftes «aufgehoben». KEINEN Text «Aufgehoben.» fabrizieren (§7: zweite
    // Wahrheit; der Quell-Body ist tatsächlich leer).
    if (parsed.bloecke.length === 0) parsed.bloecke.push({ absatz: null, text: '' });
    artikel[token] = parsed;
    // Label aus Designator + roher Nummer (ohne Unterstrich-Normalisierung):
    // «§ 1a», «Art. 335bis» — wie die Quelle die Nummer schreibt.
    labels[token] = `${leseArtikelSymbol(segment)} ${nummer.replace(/\s+/g, '')}`;
  }
  return { artikel, labels };
}

/**
 * Extrahiert EINEN Artikel (per Nummer-Token, z.B. '1', '4', '36') aus dem
 * xhtml_tol-Blob. Kein Treffer → null.
 *
 * @param xhtml - der gesamte selected_version.xhtml_tol-String
 * @param token - Artikel-Nummer ohne Symbol, wie im .article_number .number-Span
 */
export function extrahiereLexWorkArtikel(
  xhtml: string,
  token: string,
): LexArtikel | null {
  // In Artikel-Segmente zerlegen: alles ab einem <div class='article'> bis kurz
  // vor dem nächsten. Das erste Teilstück (vor dem ersten Artikel) wird verworfen.
  // Token aus dem Inventar stammt aus parsePassus ('Art. 1a' → '1_a', Unterstrich),
  // die Live-Artikelnummer liest sich aber als '1a' (ohne Unterstrich). Beide
  // Seiten beim Vergleich normalisieren (Unterstriche entfernen), sonst bleibt
  // ein real existierender a-Artikel (BE 169.81 art_1a/8a, NW 268.12 art_17a)
  // fälschlich ungefunden. artikelLabel/id bleiben unverändert.
  const tokenNorm = token.replace(/_/g, '');
  const teile = xhtml.split(/(?=<div\s+class='article'>)/i);
  for (const segment of teile) {
    if (!/^\s*<div\s+class='article'>/i.test(segment)) continue;
    const nummer = leseArtikelNummer(segment);
    if (nummer === null || nummer.replace(/_/g, '') !== tokenNorm) continue;
    return parseSegment(segment);
  }
  return null;
}

// Aufzählungs-Marke am Anfang eines text_content-Spans:
//   «1. », «17. », «5a. », «36a. »  → Ziffern-Punkt (Bemerkung: a/b/c als
//   GANZE Marke nur in Klammer-Form «a) », nie «a. » — der reine «a.» kommt in
//   LexWork-Tarifen nicht als Aufzählungsmarke vor und würde sonst Satzanfänge
//   zerschneiden). Klammer-Form «a) », «b) » → Buchstaben-Unterpunkt.
const INLINE_MARKE = /^\s*(\d+(?:bis|ter|quater|quinquies)?[a-z]?)\.\s+|^\s*([a-z](?:bis|ter|quater|quinquies)?)\)\s+/;

/** Wortzahl eines bereinigten Strings (für die Zwischentitel-Heuristik S4). */
function wortzahl(s: string): number {
  return s.trim() === '' ? 0 : s.trim().split(/\s+/).length;
}

/**
 * Zerlegt einen Absatz mit mehreren text_content-Spans in Einleitung + items,
 * wenn die Spans eine INLINE-Aufzählung bilden (BS 292.400 §11-Stil:
 * «1. Stiftung:», «17. Übertragung …», Unterpunkte «a) …»). Spans VOR der
 * ersten Marke bilden den Einleitungstext; ab der ersten Marke beginnt je
 * Marke ein item, Folge-Spans ohne Marke werden an das laufende item gehängt.
 *
 * Hat KEIN Span eine Marke, gibt es keine Aufzählung → items leer, der ganze
 * Absatztext steht in `text` (Normalfall einfacher Absätze).
 *
 * S4 (BS-Audit 23.6.2026) — ABSATZ-ZWISCHENTITEL nicht als lit. fehldeuten:
 * In 834.410 §8a sind Abs. 1/2/3 je EIN paragraph-Block, dessen ERSTER Span ein
 * kurzer markierter Sachtitel ist («a) Spital», «b) Pflegeheim», «c) Beitragshöhe»)
 * und dessen FOLGE-Spans der eigentliche (markenlose) Normtext sind. Das ist KEINE
 * Buchstaben-Aufzählung, sondern eine absatz-interne Zwischenüberschrift. Kriterium
 * (robust, NICHT die reine ≥2-Marken-Schwelle — die heilt §8a Abs. 1/2 mit nur EINER
 * Marke nicht): GENAU EINE Marke, am ersten Span, deren Resttext kurz ist (≤4 Wörter,
 * ein Label), gefolgt von mindestens einem markenlosen Span → der markierte Span ist
 * ein Zwischentitel und gehört ZUM Absatztext (Marker bleibt verbatim erhalten, §7),
 * es entsteht kein lit.-item. Echte Inline-Aufzählungen (≥2 Marken, BS §11) und
 * echte Einzel-Listen (lit. über <table class='enumeration_item'>, eigener Pfad)
 * sind nicht betroffen.
 */
function spaltInline(spans: string[]): {
  text: string;
  items: Array<{ marke: string; text: string }>;
} {
  // Marken-Familie: 'd' = Ziffern-Punkt («1.»), 'a' = Buchstaben-Klammer («a)»).
  const familie = (s: string): 'd' | 'a' | null => {
    const m = s.match(INLINE_MARKE);
    if (!m) return null;
    return m[1] != null ? 'd' : 'a'; // m[1]=Ziffer, m[2]=Buchstabe
  };
  const familien = spans.map(familie);

  // S4 (Fall A) — genau eine Marke insgesamt, am ersten Span, kurzer Label-Resttext,
  // danach markenloser Langtext: «a) Spital» / «b) Pflegeheim» (834.410 §8a Abs. 1/2).
  // Reiner Zwischentitel-Absatz, KEINE Aufzählung.
  const markenIdx = familien.map((f, i) => (f ? i : -1)).filter((i) => i >= 0);
  if (
    markenIdx.length === 1 &&
    markenIdx[0] === 0 &&
    spans.length > 1 &&
    wortzahl(spans[0].replace(INLINE_MARKE, '')) <= 4
  ) {
    return { text: spans.map((s) => s.trim()).filter(Boolean).join(' ').trim(), items: [] };
  }

  // S4 (Fall B) — der ERSTE Span trägt eine kurze Label-Marke EINER Familie, deren
  // Marke im Block sonst NICHT wiederkehrt, während die FOLGENDEN Marken einer
  // ANDEREN Familie eine echte Aufzählung bilden: «c) Beitragshöhe» gefolgt von
  // «1.», «2.», … (834.410 §8a Abs. 3). Der einsame Buchstaben-Kopf ist ein
  // Zwischentitel und gehört in den Einleitungstext, NICHT als lit.-item — die
  // Ziffern-Aufzählung bleibt erhalten. Schützt §11 (BS 292.400): dort gehört «1.»
  // zur Ziffern-Familie, die mehrfach vorkommt → kein Peel.
  const ersteFam = familien[0];
  if (
    ersteFam &&
    spans.length > 1 &&
    wortzahl(spans[0].replace(INLINE_MARKE, '')) <= 4 &&
    // erste Marke ist die EINZIGE ihrer Familie …
    familien.filter((f) => f === ersteFam).length === 1 &&
    // … und es gibt mindestens eine Marke einer ANDEREN Familie danach.
    familien.slice(1).some((f) => f != null && f !== ersteFam)
  ) {
    const zwischentitel = spans[0].trim();
    const rest = spaltInline(spans.slice(1));
    return {
      text: [zwischentitel, rest.text].filter(Boolean).join(' ').trim(),
      items: rest.items,
    };
  }

  const intro: string[] = [];
  const items: Array<{ marke: string; text: string }> = [];
  for (const roh of spans) {
    const m = roh.match(INLINE_MARKE);
    if (m) {
      const marke = (m[1] ?? m[2]).toLowerCase();
      const rest = roh.slice(m[0].length);
      items.push({ marke, text: rest });
    } else if (items.length > 0) {
      // Folge-Span ohne Marke → an das laufende item anhängen.
      items[items.length - 1].text = `${items[items.length - 1].text} ${roh}`.trim();
    } else {
      intro.push(roh);
    }
  }
  return {
    text: intro.join(' ').trim(),
    // Leere Marken-Punkte (z.B. aufgehobene Ziff. 13–15: «13.») wegfiltern,
    // aber die Marke behalten, falls Text vorhanden.
    items: items.filter((i) => i.text !== ''),
  };
}

/** Tarif-/Positions-Nummern-Muster für die leere Kopfspalte (S4): «1», «1.1.»,
 *  «4.a)», «ca)» — synchron zu mehrspaltige-tabelle.ts:TARIF_NR_RE. Eine leere
 *  Kopfspalte mit solchen Werten ist die POSITIONS-Spalte und wird explizit als
 *  «Tarif-Nr.» beschriftet, damit sie nicht mit der Caption (eigenes «: »)
 *  verschmilzt und beim Re-Parse in Spalte 0 landet. */
const TABELLE_TARIF_NR_RE =
  /^(?:\d+(?:\.\d+)*\.?(?:[a-z]{1,2}\)?)?|\d*[a-z]{1,3}(?:bis|ter|quater)?\))$/i;

/**
 * Wandelt eine Gebühren-/Staffel-Tabelle (<table class='enumeration_tabular'>,
 * z.B. ZG 161.7 § 11) in lesbaren Text. Die Tabelle hat eine Kopfzeile (<th>)
 * mit Spaltenbeschriftungen und Datenzeilen (<td>). Je Datenzeile werden die
 * nicht-leeren Zellen mit ihrer Spaltenbeschriftung versehen («Spalte: Wert»)
 * und mit « · » getrennt; die Zeilen werden mit « — » verkettet.
 *
 * S4/T3 (BS-Audit 23.6.2026) — zwei Modi, damit Tarif-Tabellen sauber rendern:
 *  (a) LABEL-Modus (mind. eine nicht-leere Kopfzelle, IWB §3, GerGebV §10): jede
 *      Zelle als «Label: Wert». Eine LEERE Kopfspalte, deren Werte Tarif-/Positions-
 *      Nummern sind, wird explizit «Tarif-Nr.: N» beschriftet — so verschmilzt die
 *      Tarif-Nr. nicht mit der Caption (die ihr eigenes «: » trägt) und landet beim
 *      Re-Parse in Spalte 0 (behebt den Phantom-Spalten-Versatz S4). Leere Zellen
 *      ohne Label werden weggelassen (Label-Lookup rekonstruiert die Spalte).
 *  (b) POSITIONS-Modus (ALLE Kopfzellen leer, StG §50/§131): label-lose Tabelle.
 *      ALLE Zellen — auch leere — werden positionsgetreu mit « · » verkettet, damit
 *      die Spaltenzahl STABIL bleibt (StG §50 «Über …»-Zeile hat eine leere
 *      Mittelzelle). Der Re-Parser (extrahiereMehrspaltig) liest sie positionsbasiert.
 * Liefert '' bei leerer Tabelle.
 */
function tabelleZuText(tabellenInner: string): string {
  const zeilen = [...tabellenInner.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(
    (r) => r[1],
  );
  let kopf: string[] = [];
  const datenZeilen: string[][] = [];
  for (const zeile of zeilen) {
    const ths = [...zeile.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map((c) =>
      bereinige(c[1]),
    );
    if (ths.length > 0) {
      kopf = ths;
      continue;
    }
    const tds = [...zeile.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((c) =>
      bereinige(c[1]),
    );
    if (tds.length > 0) datenZeilen.push(tds);
  }
  if (datenZeilen.length === 0) return '';

  const hatLabel = kopf.some((k) => k.trim() !== '');
  // (b) POSITIONS-Modus: keine Kopf-Labels → alle Zellen positionsgetreu erhalten.
  if (!hatLabel) {
    return datenZeilen
      .filter((tds) => tds.some((w) => w !== '')) // ganz leere Quell-Zeilen weg
      .map((tds) => tds.join(' · '))
      .join(' — ');
  }
  // (a) LABEL-Modus.
  const zeilenTexte: string[] = [];
  for (const tds of datenZeilen) {
    const zellen = tds
      .map((wert, i) => {
        if (!wert) return '';
        const label = (kopf[i] ?? '').trim();
        if (label) return `${label}: ${wert}`;
        // Leere Kopfspalte: Positions-Nummer explizit als Tarif-Nr. beschriften,
        // sonst bleibt der Wert label-los und verschmilzt beim Re-Parse mit der
        // Caption (S4). Nicht-numerische label-lose Werte bleiben unbeschriftet.
        return TABELLE_TARIF_NR_RE.test(wert) ? `Tarif-Nr.: ${wert}` : wert;
      })
      .filter(Boolean);
    if (zellen.length > 0) zeilenTexte.push(zellen.join(' · '));
  }
  return zeilenTexte.join(' — ');
}

/** Wandelt ein Artikel-Segment (Kopf + folgende paragraph/enumeration-Geschwister)
 *  in die Absatz-Blöcke um. Reale Aufzählungs-/Tabellen-Formen (Spike 16.6.2026):
 *   (1) enumeration_item-Tabelle  → je Tabelle ein item, an den vorigen Absatz.
 *   (2) INLINE im Absatz (BS §11) → ein paragraph mit vielen text_content-Spans,
 *       deren Marken «N.»/«a)» die items abgrenzen.
 *   (3) enumeration_tabular (ZG §11) → Gebühren-/Staffeltabelle; ihre Zeilen
 *       werden als lesbarer Text an den vorangehenden Einleitungs-Absatz gehängt. */
function parseSegment(segment: string): LexArtikel {
  const bloecke: LexArtikel['bloecke'] = [];

  // paragraph-Blöcke (bis zum schliessenden </p></div>, das den GANZEN Absatz
  // inkl. mehrerer <p> umschliesst), enumeration_item-Tabellen und
  // enumeration_tabular-Gebührentabellen in Dokumentreihenfolge — alles Geschwister.
  // WICHTIG (S2-Reihenfolge): die LEERE paragraph_post-Form
  // «<div class='paragraph_post'></div>» MUSS als eigene (verworfene) Alternative
  // ZUERST stehen. Sonst würde die nachfolgende, inhaltstragende paragraph_post-
  // Alternative mit ihrem lazy [\s\S]*? über die leere Hülle hinaus bis zum </p></div>
  // des FOLGENDEN echten Absatzes laufen und diesen verschlucken (834.410 §8a:
  // leere _post stehen zwischen Abs. 1/2/3 — sonst verloren Abs. 2/3 ihre Nummer).
  for (const m of segment.matchAll(
    /<div\s+class='paragraph_post'>\s*<\/div>|<div\s+class='paragraph'>([\s\S]*?)<\/p>\s*<\/div>|<table\s+class='enumeration_item'>([\s\S]*?)<\/table>|<table\s+class='enumeration_tabular'>([\s\S]*?)<\/table>|<div\s+class='paragraph_post'>([\s\S]*?)<\/p>\s*<\/div>/gi,
  )) {
    if (m[1] !== undefined) {
      // paragraph: Nummer aus erstem .number-Span; ALLE text_content-Spans lesen
      // (BS §11 hat viele pro Absatz). Kein text_content → ganzer <p>-Inhalt.
      const inner = m[1];
      const numMatch = inner.match(/<span\s+class='number'>([\s\S]*?)<\/span>/i);
      const absatz = numMatch ? bereinige(numMatch[1]) || null : null;
      const ohneNummer = inner.replace(/<span\s+class='number'>[\s\S]*?<\/span>/i, '');
      const spans = [
        ...ohneNummer.matchAll(/<span\s+class='text_content'>([\s\S]*?)<\/span>/gi),
      ].map((s) => bereinige(s[1]));
      if (spans.length === 0) {
        const text = bereinige(ohneNummer);
        bloecke.push({ absatz, text });
      } else {
        const { text, items } = spaltInline(spans);
        const block: LexArtikel['bloecke'][number] = { absatz, text };
        if (items.length > 0) block.items = items;
        bloecke.push(block);
      }
    } else if (m[2] !== undefined) {
      // enumeration_item: Marke aus td.number, Text aus den übrigen td → ein item
      // am vorigen Absatz.
      const inner = m[2];
      // NW 268.12 (§18 lit. a–g): zweite Verschachtelungsebene (Ziff.→lit.) rendert
      // LexWork mit ZWEI td.number — einem leeren Einrück-Spacer (&nbsp;) ZUERST,
      // dann der echten Marke «a)». Nur die erste zu lesen ergäbe '' → das item
      // würde unten (if marke && text) verworfen (die ganze Promillestaffel fiel
      // weg). Darum ALLE td.number lesen und die LETZTE nicht-leere als Marke
      // nehmen; bei der Standard-Einzelzellen-Form (ZG/BS) ist das dieselbe Zelle.
      const numCells = [...inner.matchAll(/<td[^>]*\bclass='[^']*\bnumber\b[^']*'[^>]*>([\s\S]*?)<\/td>/gi)]
        .map((c) => bereinige(c[1]))
        .filter(Boolean);
      const markeRoh = numCells.length > 0 ? numCells[numCells.length - 1] : '';
      // Bug-Audit 19.6.2026: lat. Suffix bis/ter/… erhalten (Suffix vor Buchstabe).
      const marke = (markeRoh.match(/^([0-9]+(?:bis|ter|quater|quinquies)?[a-z]?|[a-z](?:bis|ter|quater|quinquies)?)/i)?.[1] ?? markeRoh)
        .toLowerCase();
      // alle NICHT-number-td als Text
      const textZellen = [...inner.matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/gi)]
        .filter((c) => !/\bclass='[^']*\bnumber\b[^']*'/i.test(c[1]))
        .map((c) => bereinige(c[2]))
        .filter(Boolean);
      const text = textZellen.join(' ').trim();
      // S3 (BS-Audit 23.6.2026) — AUFGEHOBENE lit.-Buchstaben behalten: hat ein
      // enumeration_item eine Marke, aber leeren Body (640.100 §35 lit. g, 832.710
      // §14 lit. b: aufgehobene Buchstaben mit «&nbsp;» als Zelle), wurde das item
      // früher (if marke && text) komplett verworfen → Lücke in der lit.-Reihe
      // (a,b,c,d,e,f,h ohne g). Jetzt: bei vorhandener Marke das item MIT leerem
      // Text behalten (Marke bleibt sichtbar; KEIN fabrizierter «Aufgehoben.»-Text,
      // §7 — der Body ist tatsächlich leer; die Lesesicht zeigt leere Items gedämpft).
      if (marke) {
        const item = { marke, text };
        if (bloecke.length > 0) {
          const last = bloecke[bloecke.length - 1];
          (last.items ??= []).push(item);
        } else {
          // Aufzählung ohne vorangehenden Absatz (selten) → eigener Block.
          bloecke.push({ absatz: null, text: '', items: [item] });
        }
      }
    } else if (m[3] !== undefined) {
      // enumeration_tabular: Gebühren-/Staffeltabelle als EIGENER Block.
      // S4/T3 (BS-Audit 23.6.2026): die Tabelle wird NICHT mehr in den Text des
      // vorangehenden Caption-Absatzes («… beträgt die Entscheidgebühr:») gehängt.
      // Die alte Verschmelzung klebte die Caption an die erste Tabellenzelle und
      // erzeugte eine Phantom-Spalte bzw. einen Tarif-Nr.-Versatz (IWB §3) und
      // verhinderte die positionsbasierte Zerlegung (StG §50/§131). Die Caption
      // bleibt als eigener (vorangehender) Absatz-Block stehen — visuell identisch
      // (Einleitungszeile über der Tabelle), aber der Tabellenkörper ist sauber.
      // reichereMehrspaltig() wandelt diesen reinen Tabellen-Block in `mehrspaltig`.
      const tabelleText = tabelleZuText(m[3]);
      if (tabelleText) bloecke.push({ absatz: null, text: tabelleText });
    } else if (m[4] !== undefined) {
      // S2 (BS-Audit 23.6.2026) — paragraph_post / text_content_post: LexWork
      // hängt substantiellen Normtext als FORTSETZUNG hinter eine Tabelle/einen
      // Absatz (834.410 §8a: Ziff. 2–6 mit Vermögensgrenze Fr. 1'000'000, 360
      // Pflegetage, ausserkantonal-Klausel). Früher matchte parseSegment nur
      // paragraph/enumeration_item/enumeration_tabular → der gesamte _post-Inhalt
      // ging verloren. Jetzt: die text_content_post-Spans als Folgeabsatz lesen
      // (gleiche INLINE-Aufzählungslogik wie paragraph, da die _post-Ziffern die
      // Aufzählung des vorangehenden Absatzes fortsetzen). Leere paragraph_post
      // («<div class='paragraph_post'></div>») matchen mangels </p> gar nicht.
      const inner = m[4];
      const spans = [
        ...inner.matchAll(/<span\s+class='text_content_post'>([\s\S]*?)<\/span>/gi),
      ].map((s) => bereinige(s[1]));
      // Fallback: kein text_content_post-Span → ganzer Inhalt als Text.
      if (spans.length === 0) {
        const text = bereinige(inner);
        if (text) bloecke.push({ absatz: null, text });
      } else {
        const { text, items } = spaltInline(spans);
        const block: LexArtikel['bloecke'][number] = { absatz: null, text };
        if (items.length > 0) block.items = items;
        // Nur emittieren, wenn echter Inhalt entstand (kein Leer-Block).
        if (block.text || (block.items && block.items.length > 0)) bloecke.push(block);
      }
    }
  }

  // Stufe 2: ·/—-Tabellen in mehrspaltig-Blöcke anreichern (NW/BS/SO/VS/ZG/TG).
  // Idempotent: nur wenn extrahiereMehrspaltig ≥2 Zeilen liefert; alle anderen
  // Blöcke bleiben byte-gleich. Einleitungssatz wird im text-Feld bewahrt.
  reichereMehrspaltig(bloecke);

  // N1 (BS-Audit 23.6.2026) — Randtitel (article_title) lesen. Der Sachtitel sitzt
  // in <div class='article_title'><span class='title_text'>…</span></div>; nur das
  // erste article_title des Segments (= das des Artikelkopfs) wird gelesen, nicht
  // spätere title-Blöcke (Abschnittsüberschriften level_N). bereinige() entfernt
  // Fussnoten-Anker (153.100 §53 «Änderung anderer Gesetze[4]»). «…»/leere Titel
  // (aufgehobene, umnummerierte Artikel: «&hellip;» bzw. «&nbsp;») ergeben nach
  // bereinige() '' bzw. '…' → KEIN Randtitel (§7: nichts fabrizieren).
  const titelBlock = segment.match(
    /<div\s+class='article_title'>([\s\S]*?)<\/div>/i,
  );
  let titel: string | undefined;
  if (titelBlock) {
    const tt = titelBlock[1].match(
      /<span\s+class='title_text'>([\s\S]*?)<\/span>/i,
    );
    const roh = bereinige(tt ? tt[1] : titelBlock[1]);
    // '…' (aus &hellip;) ist der Aufhebungs-Platzhalter, kein Sachtitel.
    if (roh && roh !== '…' && roh !== '...') titel = roh;
  }

  const ergebnis: LexArtikel = { bloecke };
  if (titel) ergebnis.titel = titel;
  return ergebnis;
}

/**
 * Leitet das In-Kraft-Datum der geltenden Fassung aus `versionDatesStr` ab.
 *
 * Primat: Datum nach «in Kraft seit:» (oder «In Kraft seit:») in DD.MM.YYYY
 * → konvertiert zu ISO YYYY-MM-DD.
 * Fallback: `enactment` (ISO), falls kein «in Kraft seit»-Datum parsebar ist.
 * Beide leer/undefined → ''.
 *
 * Wird für kantonale Snapshots verwendet. Bund-Stand bleibt unverändert
 * (Fedlex-Konsolidierungsdatum ist bereits das korrekte In-Kraft-Datum).
 *
 * @example
 * inKraftSeit("Aktuelle Version in Kraft seit: 01.01.2026 (Beschlussdatum: 26.11.2025)", "2012-01-01")
 * // → "2026-01-01"
 */
export function inKraftSeit(
  versionDatesStr: string | undefined,
  enactment: string | undefined,
): string {
  if (versionDatesStr) {
    // Deutsches Muster: «in Kraft seit:» / «in Kraft seit» (Doppelpunkt optional).
    // Zweisprachige/FR-Erlasse liefern das deutsche Muster ohne «:» im de-Teil.
    const mDe = versionDatesStr.match(
      /[Ii]n\s+[Kk]raft\s+seit\s*:?\s*(\d{2})\.(\d{2})\.(\d{4})/,
    );
    if (mDe) {
      return `${mDe[3]}-${mDe[2]}-${mDe[1]}`;
    }

    // Französisches Muster: «en vigueur depuis le DD.MM.YYYY» /
    // «en vigueur dès le DD.MM.YYYY» / «en vigueur depuis DD.MM.YYYY».
    // FR-API (bdlf.fr.ch, lex.vs.ch) liefert für fr-Erlasse ausschliesslich
    // den französischen version_dates_str — ohne dieses Muster fiel der Stand
    // auf enactment (Erlass-Datum, oft 2011) zurück (BUG A4, 16.6.2026).
    const mFr = versionDatesStr.match(
      /[Ee]n\s+vigueur\s+(?:depuis|dès)\s+le\s+(\d{2})\.(\d{2})\.(\d{4})|[Ee]n\s+vigueur\s+depuis\s+(\d{2})\.(\d{2})\.(\d{4})/,
    );
    if (mFr) {
      // Gruppe 1-3 für «depuis/dès le», Gruppe 4-6 für «depuis» ohne «le»
      const j = mFr[3] ?? mFr[6];
      const mo = mFr[2] ?? mFr[5];
      const t = mFr[1] ?? mFr[4];
      return `${j}-${mo}-${t}`;
    }
  }
  // Fallback: enactment (bereits ISO), sofern gültig
  if (enactment && /^\d{4}-\d{2}-\d{2}$/.test(enactment)) {
    return enactment;
  }
  return '';
}

/**
 * Holt einen LexWork-Erlass und extrahiert die angeforderten Artikel-Tokens.
 *
 * - structured_document_id null/fehlt ODER xhtml_tol falsy → meta.nurPdf=true,
 *   artikel={} (kein Crash; Alt-Erlass nur als PDF).
 * - stand: In-Kraft-Datum aus current_version.version_dates_str (DD.MM.YYYY nach «in Kraft seit:»),
 *   Fallback selected_version.version_dates_str, Endfallback enactment (Erlass-Datum).
 * - versionUid: text_of_law.version_uid (Drift-Token).
 *
 * Reine Netz-Hülle; die Parser-Logik bleibt in extrahiereLexWorkArtikel testbar.
 */
export async function holeLexWork(
  host: string,
  lang: 'de' | 'fr',
  lawId: string,
): Promise<LexWorkErgebnis> {
  const url = `https://${host}/api/${lang}/texts_of_law/${lawId}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`LexWork ${url}: HTTP ${res.status}`);
  }
  // Soft-404-Erkennung (§7, scraping-Skill Fakt 3): ein HTTP 200 kann eine
  // Angular-Shell (text/html) statt des JSON-Bodys sein, wenn der Host den
  // strukturierten Endpunkt migriert. Am Content-Type erkennen, nicht am Status.
  // Fehlt der Header (z. B. in Tests mit Minimal-Mock), fällt die Erkennung auf
  // den JSON-Parse-Fehler unten zurück — beides mündet in LexWorkShellError.
  const contentType = res.headers?.get?.('content-type') ?? '';
  if (contentType && !/json/i.test(contentType)) {
    throw new LexWorkShellError(url, `Content-Type "${contentType}" statt application/json`);
  }
  let json: {
    text_of_law?: {
      title?: string;
      abbreviation?: string;
      enactment?: string;
      version_uid?: string;
      current_version?: {
        version_dates_str?: string;
        structured_document_id?: number | null;
      } | null;
      selected_version?: {
        xhtml_tol?: string | null;
        pdf_link_tol?: string | null;
        structured_document_id?: number | null;
        version_dates_str?: string;
      } | null;
    };
  };
  try {
    json = await res.json();
  } catch (e) {
    // 200 + JSON-Content-Type (oder fehlender Header) aber HTML-/Shell-Body →
    // Parse scheitert. Als Soft-404-Shell melden (harter Drift-Tor-Fehler),
    // nicht als generischer SyntaxError (der im Tor zur blossen Warnung würde).
    throw new LexWorkShellError(url, `Antwort ist kein gültiges JSON (${e instanceof Error ? e.message : String(e)})`);
  }

  const tol = json.text_of_law;
  if (!tol) {
    throw new Error(`LexWork ${url}: kein text_of_law im JSON`);
  }

  const sel = tol.selected_version ?? null;
  const cur = tol.current_version ?? null;
  const structuredId =
    sel?.structured_document_id ?? cur?.structured_document_id ?? null;
  const xhtml = sel?.xhtml_tol ?? null;
  const nurPdf = structuredId == null || !xhtml;

  // Primat: version_dates_str der current_version (enthält «in Kraft seit: DD.MM.YYYY»)
  // Sekundär: selected_version.version_dates_str (Fallback für ältere LexWork-Antworten)
  // Endfallback: enactment (Erlass-Datum als Notlösung)
  const stand = inKraftSeit(
    cur?.version_dates_str ?? sel?.version_dates_str,
    tol.enactment,
  );

  const meta: LexWorkErgebnis['meta'] = {
    titel: tol.title ?? '',
    abkuerzung: tol.abbreviation ?? '',
    versionUid: tol.version_uid ?? '',
    stand,
    pdfUrl: sel?.pdf_link_tol ?? null,
    nurPdf,
  };

  // Vollabdeckung (§7): ALLE Artikel des Erlasses speichern, nicht nur die
  // zitierten Tokens. Das Label folgt dem Quell-Designator (einheitlich).
  let artikel: Record<string, LexArtikel> = {};
  let labels: Record<string, string> = {};
  if (!nurPdf && xhtml) {
    const alle = extrahiereAlleLexWorkArtikel(xhtml);
    artikel = alle.artikel;
    labels = alle.labels;
  }

  return { meta, artikel, labels };
}
