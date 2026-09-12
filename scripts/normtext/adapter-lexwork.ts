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
import { normalisiereArtikelToken } from './lexwork-token.ts';

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
  /**
   * G-AUFH-ART (W2·5j, BS-132.100-Audit 27.7.2026) — ARTIKEL-genau aufgehoben.
   * Gesetzt NUR wenn `parseSegment` für das Artikel-Segment buchstäblich KEINEN
   * Body-Block extrahiert (kein paragraph, keine enumeration_item/_tabular, kein
   * substantieller paragraph_post) — ein STRUKTURELLES Signal aus der Quelle
   * (Numerierungs-Slot ohne Wortlaut nach dem Artikelkopf), nicht eine Ableitung
   * aus «Text ist zufällig leer». Empirisch verifiziert an gesetzessammlung.bs.ch
   * (132.100 §51/§55: article_title='…' + kein Body; §76a/§76b: ECHTER Randtitel
   * + kein Body) und gesetze.gl.ch (III-C.1 Art. 3/4/8–11/12–14/19: durchweg
   * article_title='…' + kein Body) — beide Titel-Varianten sind gleichermassen
   * aufgehobene Artikel, siehe adapter-lexwork.md-Kommentar bei parseSegment.
   */
  aufgehoben?: true;
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
 *  normalisiert Whitespace zu einfachen Leerzeichen. Entfernt zuvor Fussnoten-
 *  Anker und den LexWork-Änderungsmarker «<strong>*</strong>».
 *
 *  Exportiert, weil der Struktur-Extraktor (struktur-lexwork.ts) die
 *  Artikel-Nummer mit DERSELBEN Reinigung zum Token verarbeiten muss (§5 SSoT):
 *  Novellen-/geänderte Artikel tragen die Nummer als «2a&nbsp;<strong>*</strong>»
 *  — ohne diesen Marker-/Fussnoten-Strip bliebe «2a *» stehen, der Runner-Filter
 *  (struktur-kanton-run.ts, a.tokens.has) verwürfe den Artikel (Wurzel von F-2). */
export function bereinige(roh: string): string {
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
    // SSoT: dieselbe Normalisierung nutzt der Struktur-Extraktor (§5, F-2).
    const token = normalisiereArtikelToken(nummer);
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
  // G-AUFH-ART Runde 2 — Container-Ziffer-Ausschluss (Fehlklasse 1, Gegenprüfung
  // 27.7.2026): ein aufgehoben-markierter Token, der striktes Punkt-Präfix eines
  // ANDEREN Tokens in DIESEM Erlass ist («2.1» vor «2.1.1»/«2.1.2»), ist eine
  // Gliederungs-Ziffer ohne eigenen Wortlaut — das Kind trägt den echten
  // Norminhalt (BS-786.310 Ziffer 2.1 «Verfahren» + Kinder 2.1.1/2.1.2 mit
  // vollem Text; dasselbe Muster BS-786.300, BS-785.700 §10→10.1/10.2). Muss
  // ERST nach der vollständigen Token-Sammlung laufen (braucht alle Geschwister).
  const alleTokens = Object.keys(artikel);
  for (const token of alleTokens) {
    if (!artikel[token].aufgehoben) continue;
    const istContainer = alleTokens.some((other) => other !== token && other.startsWith(`${token}.`));
    if (istContainer) delete artikel[token].aufgehoben;
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

// ── G-AUFH-ART Runde 2 — amtliche Aufhebungs-Signale (Gegenprüfung 27.7.2026) ──

/** Leer oder ausschliesslich der Ellipsen-Platzhalter «…»/«...» — die Grenze
 *  für «kein echter Norminhalt» (istAufgehoben in darstellung.ts ist bewusst
 *  NICHT wiederverwendet: die Render-Heuristik dort behandelt '' separat als
 *  «nicht aufgehoben» aus Darstellungsgründen; hier zählt Adapter-seitig sowohl
 *  '' als auch die Ellipse als «kein Wortlaut»). */
function istLeerOderEllipse(text: string): boolean {
  const t = text.trim();
  return t === '' || t === '…' || t === '...';
}

/** Kein echter Norminhalt: null Blöcke ODER jeder Block (und jedes Item) ist
 *  leer/Ellipse — Tabelle/Mehrspaltig hat IMMER Vorrang (echter Inhalt, analog
 *  artikelGanzAufgehoben in darstellung.ts, dort dieselbe Rangfolge). */
function keinRealerInhalt(bloecke: LexArtikel['bloecke']): boolean {
  if (bloecke.length === 0) return true;
  return bloecke.every((b) => {
    if (b.mehrspaltig && b.mehrspaltig.zeilen.length > 0) return false;
    if (!istLeerOderEllipse(b.text)) return false;
    return (b.items ?? []).every((it) => istLeerOderEllipse(it.text));
  });
}

/** AGS-Änderungsstern («<strong>*</strong>») IM article_number-Kopf DIESES
 *  Artikels — die amtliche LexWork/AGS-Änderungsmarkierung (nicht zu verwechseln
 *  mit demselben Marker in einem Absatz-Text, der dort redaktionell entfernt
 *  wird, s. bereinige()). Empirisch: BS 132.100 §51/§55/§76a/§76b, GL III-C.1,
 *  BS-730.110 §108 (Nachbarn §109-118 OHNE Stern bleiben unmarkiert). */
function traegtKopfStern(segment: string): boolean {
  const numBlock = segment.match(/<div\s+class='article_number'>([\s\S]*?)<\/div>/i);
  if (!numBlock) return false;
  return /<strong>\s*\*\s*<\/strong>/i.test(numBlock[1]);
}

/** Der WORTLAUT eines eigenen Absatzes dieses Artikels wurde durch die
 *  amtliche Aufhebungs-Ellipse ersetzt — LexWork kennzeichnet das mit der
 *  eigenen Klasse 'abrogation_ellip' DIREKT im <p> (kein Absatz-Wrapper-Anker
 *  nötig, da <p> das Body-Element ist). Bewusst NUR innerhalb <p> geprüft: die
 *  gleiche Klasse markiert auch eine ganz aufgehobene SEKTIONSÜBERSCHRIFT
 *  (<div class='level_3 title'>…<span class='abrogation_ellip'>…), die im
 *  Segment-REST des VORANGEHENDEN Artikels steht (BS 132.100 §76 → Überschrift
 *  «4.C.II.I.bis» → §76a) — §76 selbst hat echten Wortlaut UND keinen eigenen
 *  <p>-Ellipse-Absatz, bliebe also korrekt unmarkiert (zusätzlich durch
 *  keinRealerInhalt geschützt: §76 hat lebenden Text). Empirisch: BS-212.410
 *  §34 (Falsch-Negativ Runde 1 — Kopf trägt KEINEN Stern, nur diese Ellipse). */
function enthaeltEigeneAbrogationEllipse(segment: string): boolean {
  return /<p>\s*<span\s+class='abrogation_ellip'>/i.test(segment);
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

  // G-AUFH-ART Runde 2 (Gegenprüfung 27.7.2026, Verdikt WIDERLEGT gegen Runde 1) —
  // «kein Body-Block» ALLEIN stempelte 34 GELTENDE Artikel fälschlich als
  // aufgehoben (Container-Ziffern mit Wortlaut im Kind-Artikel, Anhang-Verweise,
  // «wird hier nicht abgedruckt»-Übergangsbestimmungen, Nachbar-Artikel ohne
  // eigenes Signal). Die AMTLICHE Regel braucht ZWEI unabhängig geprüfte
  // Bedingungen:
  //   (a) ein echtes Aufhebungs-SIGNAL der Quelle — entweder der AGS-Änderungs-
  //       stern im article_number-Kopf dieses Artikels («<strong>*</strong>»)
  //       ODER die LexWork-eigene Klasse 'abrogation_ellip' als der WORTLAUT
  //       eines eigenen Absatzes (nicht einer nachfolgenden Sektionsüberschrift
  //       im Segment-Rest, s. BS 132.100 §76→«4.C.II.I.bis»→§76a: die Ellipse
  //       gehört zur Überschrift, nicht zu §76 selbst — daher der <p>-Anker);
  //   (b) UND kein echter Norminhalt: keinRealerInhalt() — leer ODER
  //       ausschliesslich der Ellipsen-Platzhalter, Tabelle/Mehrspaltig hat
  //       IMMER Vorrang (echter Inhalt, analog artikelGanzAufgehoben).
  // Erst (a) UND (b) zusammen tragen den Marker. Container-Ziffern (Kind-Artikel
  // trägt den Wortlaut) und Anhang-verwiesene Artikel werden zusätzlich als
  // Post-Pass ausgeschlossen (extrahiereAlleLexWorkArtikel bzw. holeLexWork) —
  // hier (parseSegment) ist nur EIN Segment sichtbar, kein Geschwister-/Anhang-
  // Wissen. Empirisch verifiziert 27.7.2026: BS 132.100 §51/§55/§76a/§76b,
  // GL III-C.1 (5/5), BS-212.410 §34 (Falsch-Negativ Runde 1 behoben), BS-786.310
  // Art. 2.1 (Container, Runde 1 fälschlich markiert), BS-230.100 §28
  // («wird hier nicht abgedruckt», kein Stern/keine Ellipse → korrekt unmarkiert).
  const ergebnis: LexArtikel = { bloecke };
  if (titel) ergebnis.titel = titel;
  if ((traegtKopfStern(segment) || enthaeltEigeneAbrogationEllipse(segment)) && keinRealerInhalt(bloecke)) {
    ergebnis.aufgehoben = true;
  }
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

/** G-AUFH-ART Runde 2 — Anhang-Ausschluss (Fehlklasse 2, Gegenprüfung
 *  27.7.2026): extrahiert die Artikel-Nummer aus einem Anhangs-Titel wie
 *  «Gebührentarif zu § 46» → '46'. Begrenzte, dokumentierte Heuristik (§-/Art.-/
 *  Ziffer-Zitat am Titel-Ende); kein Treffer → null (§7: nichts erraten). */
function annexArtikelToken(titel: string): string | null {
  const m = titel.match(/(?:§|Art\.?|Ziffer)\s*([0-9][\w.]*)\s*$/i);
  return m ? m[1] : null;
}

/** Objekt, aber weder `null` noch Array — Basis der Laufzeit-Validierung
 *  unten (QS-TYP-LUECKE). */
function istPlainObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function typName(x: unknown): string {
  return x === null ? 'null' : Array.isArray(x) ? 'Array' : typeof x;
}

/** Von holeLexWork() zur Laufzeit geprüfte Mindestform (Gegenstück zum
 *  früheren reinen Compile-Cast, siehe validiereTextOfLaw). */
type TextOfLawRoh = {
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
    annex_documents?: Array<{ title?: string; abrogated?: boolean }> | null;
  } | null;
};

/**
 * Laufzeit-Validierung des LexWork-Antwortvertrags (§7 — Nullprobe
 * QS-TYP-LUECKE 15.8.2026, Gegenprüfungs-Auflage A1): `Response.json()`
 * liefert `any`; der frühere `let json: {...}`-Cast prüfte die Form nur beim
 * Compile, nie zur Laufzeit. Empirisch belegt (Reproduktion vor diesem Fix):
 * ein `text_of_law` mit falschem Typ (String statt Objekt) lief STILL durch
 * — Ergebnis ein leeres nurPdf-Ergebnis ohne jeden Hinweis; ein
 * `current_version` als Array lief ebenso still durch (Feld schweigend
 * ignoriert); ein `xhtml_tol` als Zahl crashte erst tief im XHTML-Parser mit
 * einer URL-losen Fehlermeldung («xhtml.split is not a function»). Wirft
 * jetzt sofort mit URL + Feldpfad + gefundenem Typ (kein stiller Fallback,
 * §6.7) — gleiches Muster wie scripts/materialien/adapter-bs-grossrat.ts
 * (`unknown` + `typeof`/`Array.isArray`-Wächter statt neuer Bibliothek).
 */
function validiereTextOfLaw(url: string, tol: unknown): asserts tol is TextOfLawRoh {
  if (!istPlainObject(tol)) {
    throw new Error(`LexWork ${url}: text_of_law hat unerwartete Form (${typName(tol)}), erwartet Objekt`);
  }
  const feld = (pfad: string, wert: unknown, ok: boolean, erwartet: string) => {
    if (wert != null && !ok) {
      throw new Error(`LexWork ${url}: ${pfad} ist ${typName(wert)}, erwartet ${erwartet}`);
    }
  };
  feld('text_of_law.title', tol.title, typeof tol.title === 'string', 'string');
  feld('text_of_law.abbreviation', tol.abbreviation, typeof tol.abbreviation === 'string', 'string');
  feld('text_of_law.enactment', tol.enactment, typeof tol.enactment === 'string', 'string');
  feld('text_of_law.version_uid', tol.version_uid, typeof tol.version_uid === 'string', 'string');

  for (const name of ['current_version', 'selected_version'] as const) {
    const v = tol[name];
    feld(`text_of_law.${name}`, v, istPlainObject(v), 'Objekt oder null');
    if (!istPlainObject(v)) continue;
    feld(`text_of_law.${name}.version_dates_str`, v.version_dates_str, typeof v.version_dates_str === 'string', 'string');
    feld(
      `text_of_law.${name}.structured_document_id`,
      v.structured_document_id,
      typeof v.structured_document_id === 'number',
      'number oder null',
    );
  }

  const sel = tol.selected_version;
  if (istPlainObject(sel)) {
    feld('selected_version.xhtml_tol', sel.xhtml_tol, typeof sel.xhtml_tol === 'string', 'string oder null');
    feld('selected_version.pdf_link_tol', sel.pdf_link_tol, typeof sel.pdf_link_tol === 'string', 'string oder null');
    feld(
      'selected_version.annex_documents',
      sel.annex_documents,
      Array.isArray(sel.annex_documents),
      'Array oder null',
    );
    // Gegenprüfungs-Auflage A1 (PR #813): Der Array-Container allein reicht
    // nicht — annexArtikelToken()/der Marker-Rücknahme-Block unten lesen je
    // Element `title`/`abrogated`. Reproduziert vor diesem Fix: `[null]`
    // crashte URL-los (`Cannot read properties of null`); `[{title: 46}]`
    // crashte in annexArtikelToken() («titel.match is not a function»);
    // `[{abrogated: "false"}]` lief STILL durch — der String ist truthy,
    // die Marker-Rücknahme unterblieb, ein geltender Artikel bliebe
    // fälschlich «aufgehoben» stehen (§6.7).
    if (Array.isArray(sel.annex_documents)) {
      sel.annex_documents.forEach((eintrag, i) => {
        const pfad = `selected_version.annex_documents[${i}]`;
        if (!istPlainObject(eintrag)) {
          throw new Error(`LexWork ${url}: ${pfad} hat unerwartete Form (${typName(eintrag)}), erwartet Objekt`);
        }
        feld(`${pfad}.title`, eintrag.title, typeof eintrag.title === 'string', 'string');
        feld(`${pfad}.abrogated`, eintrag.abrogated, typeof eintrag.abrogated === 'boolean', 'boolean');
      });
    }
  }
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
  let roh: unknown;
  try {
    roh = await res.json();
  } catch (e) {
    // 200 + JSON-Content-Type (oder fehlender Header) aber HTML-/Shell-Body →
    // Parse scheitert. Als Soft-404-Shell melden (harter Drift-Tor-Fehler),
    // nicht als generischer SyntaxError (der im Tor zur blossen Warnung würde).
    throw new LexWorkShellError(url, `Antwort ist kein gültiges JSON (${e instanceof Error ? e.message : String(e)})`);
  }

  // `roh` ist zu diesem Zeitpunkt `unknown` (Response.json() liefert `any`,
  // ein blosser Cast beweist zur Laufzeit nichts — QS-TYP-LUECKE 15.8.2026).
  if (!istPlainObject(roh) || roh.text_of_law == null) {
    throw new Error(`LexWork ${url}: kein text_of_law im JSON`);
  }
  const rohTol: unknown = roh.text_of_law;
  validiereTextOfLaw(url, rohTol);
  const tol = rohTol;

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
    // G-AUFH-ART Runde 2 — Anhang-Ausschluss (Fehlklasse 2, Gegenprüfung
    // 27.7.2026): ein NICHT aufgehobener Anhang, dessen Titel auf «§ N»/«Art. N»/
    // «Ziffer N» verweist, trägt den echten Norminhalt dieses Artikels
    // (BS-685.340 §46 «Gebührentarif» → Anhang «Gebührentarif zu § 46»,
    // abrogated:false) — der leere Artikel-Body ist dann KEIN Aufhebungs-Indiz,
    // sondern eine Verweis-Konvention. Marker zurücknehmen.
    for (const anhang of sel?.annex_documents ?? []) {
      if (anhang.abrogated) continue;
      const roh = annexArtikelToken(anhang.title ?? '');
      if (!roh) continue;
      const token = normalisiereArtikelToken(roh);
      if (artikel[token]?.aufgehoben) delete artikel[token].aufgehoben;
    }
  }

  return { meta, artikel, labels };
}
