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

export interface LexArtikel {
  bloecke: Array<{
    absatz: string | null;
    text: string;
    items?: Array<{ marke: string; text: string }>;
  }>;
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
const INLINE_MARKE = /^\s*(\d+[a-z]?)\.\s+|^\s*([a-z])\)\s+/;

/**
 * Zerlegt einen Absatz mit mehreren text_content-Spans in Einleitung + items,
 * wenn die Spans eine INLINE-Aufzählung bilden (BS 292.400 §11-Stil:
 * «1. Stiftung:», «17. Übertragung …», Unterpunkte «a) …»). Spans VOR der
 * ersten Marke bilden den Einleitungstext; ab der ersten Marke beginnt je
 * Marke ein item, Folge-Spans ohne Marke werden an das laufende item gehängt.
 *
 * Hat KEIN Span eine Marke, gibt es keine Aufzählung → items leer, der ganze
 * Absatztext steht in `text` (Normalfall einfacher Absätze).
 */
function spaltInline(spans: string[]): {
  text: string;
  items: Array<{ marke: string; text: string }>;
} {
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

/**
 * Wandelt eine Gebühren-/Staffel-Tabelle (<table class='enumeration_tabular'>,
 * z.B. ZG 161.7 § 11) in lesbaren Text. Die Tabelle hat eine Kopfzeile (<th>)
 * mit Spaltenbeschriftungen und Datenzeilen (<td>). Je Datenzeile werden die
 * nicht-leeren Zellen mit ihrer Spaltenbeschriftung versehen («Spalte: Wert»)
 * und mit « · » getrennt; die Zeilen werden mit « — » verkettet. So bleiben die
 * Zellen sauber getrennt (kein zusammengeklebter Text) und der Bezug Wert↔Spalte
 * geht nicht verloren. Ohne Kopfzeile werden die Zellen ohne Beschriftung
 * verkettet. Liefert '' bei leerer Tabelle.
 */
function tabelleZuText(tabellenInner: string): string {
  const zeilen = [...tabellenInner.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(
    (r) => r[1],
  );
  let kopf: string[] = [];
  const zeilenTexte: string[] = [];
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
    const zellen = tds
      .map((wert, i) => {
        if (!wert) return '';
        const label = kopf[i];
        return label ? `${label}: ${wert}` : wert;
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
  for (const m of segment.matchAll(
    /<div\s+class='paragraph'>([\s\S]*?)<\/p>\s*<\/div>|<table\s+class='enumeration_item'>([\s\S]*?)<\/table>|<table\s+class='enumeration_tabular'>([\s\S]*?)<\/table>/gi,
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
      const numCell = inner.match(/<td[^>]*\bclass='[^']*\bnumber\b[^']*'[^>]*>([\s\S]*?)<\/td>/i);
      const markeRoh = numCell ? bereinige(numCell[1]) : '';
      const marke = (markeRoh.match(/^([0-9]+[a-z]?|[a-z])/i)?.[1] ?? markeRoh)
        .toLowerCase();
      // alle NICHT-number-td als Text
      const textZellen = [...inner.matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/gi)]
        .filter((c) => !/\bclass='[^']*\bnumber\b[^']*'/i.test(c[1]))
        .map((c) => bereinige(c[2]))
        .filter(Boolean);
      const text = textZellen.join(' ').trim();
      if (marke && text) {
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
      // enumeration_tabular: Gebühren-/Staffeltabelle. Ihre Zeilen werden als
      // lesbarer Text an den vorangehenden Einleitungs-Absatz («… beträgt die
      // Entscheidgebühr:») gehängt, damit die Bestimmung nicht unvollständig wirkt.
      const tabelleText = tabelleZuText(m[3]);
      if (tabelleText) {
        if (bloecke.length > 0) {
          const last = bloecke[bloecke.length - 1];
          last.text = last.text ? `${last.text} ${tabelleText}` : tabelleText;
        } else {
          // Tabelle ohne vorangehenden Absatz (selten) → eigener Block.
          bloecke.push({ absatz: null, text: tabelleText });
        }
      }
    }
  }

  return { bloecke };
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
  tokens: string[],
): Promise<LexWorkErgebnis> {
  const url = `https://${host}/api/${lang}/texts_of_law/${lawId}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`LexWork ${url}: HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
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

  const artikel: Record<string, LexArtikel> = {};
  if (!nurPdf && xhtml) {
    for (const token of tokens) {
      const a = extrahiereLexWorkArtikel(xhtml, token);
      if (a) artikel[token] = a;
    }
  }

  return { meta, artikel };
}
