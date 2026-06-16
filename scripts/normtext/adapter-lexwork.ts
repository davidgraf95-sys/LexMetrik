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

export interface LexArtikel {
  bloecke: Array<{ absatz: string | null; text: string }>;
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
  // LexWork-Änderungsmarker «<strong>*</strong>» sind redaktionelle Annotationen
  // (markieren geänderte Stellen), KEIN Normtext → vor dem Strip entfernen, damit
  // kein loses «*» im Text verbleibt.
  const ohneMarker = roh.replace(/<strong>\s*\*\s*<\/strong>/gi, '');
  const ohneTags = ohneMarker.replace(/<[^>]+>/g, '');
  return dekodiereEntities(ohneTags).replace(/\s+/g, ' ').trim();
}

/** Dekodiert die in LexWork-xhtml_tol auftretenden HTML-Entities. */
function dekodiereEntities(text: string): string {
  const named: Record<string, string> = {
    '&sect;': '§',
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&ndash;': '–',
    '&mdash;': '—',
    '&auml;': 'ä',
    '&ouml;': 'ö',
    '&uuml;': 'ü',
    '&Auml;': 'Ä',
    '&Ouml;': 'Ö',
    '&Uuml;': 'Ü',
    '&szlig;': 'ß',
    '&laquo;': '«',
    '&raquo;': '»',
    '&agrave;': 'à',
    '&egrave;': 'è',
    '&eacute;': 'é',
    '&ecirc;': 'ê',
    '&ccedil;': 'ç',
  };
  let out = text;
  for (const [ent, ch] of Object.entries(named)) {
    out = out.split(ent).join(ch);
  }
  // Numerische Entities (&#123; / &#x1F;).
  out = out.replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) =>
    String.fromCodePoint(parseInt(hex, 16)),
  );
  out = out.replace(/&#(\d+);/g, (_m, dec) => String.fromCodePoint(parseInt(dec, 10)));
  return out;
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
  const teile = xhtml.split(/(?=<div\s+class='article'>)/i);
  for (const segment of teile) {
    if (!/^\s*<div\s+class='article'>/i.test(segment)) continue;
    const nummer = leseArtikelNummer(segment);
    if (nummer !== token) continue;
    return parseSegment(segment);
  }
  return null;
}

/** Wandelt ein Artikel-Segment (Kopf + folgende paragraph/enumeration-Geschwister)
 *  in die Absatz-Blöcke um. enumeration_item-Zeilen werden an den jeweils
 *  vorangehenden Absatz angehängt. */
function parseSegment(segment: string): LexArtikel {
  const bloecke: LexArtikel['bloecke'] = [];

  // paragraph-Blöcke (bis zum schliessenden </p></div>) und enumeration_item-
  // Tabellen in Dokumentreihenfolge durchlaufen — beides sind Geschwister.
  for (const m of segment.matchAll(
    /<div\s+class='paragraph'>([\s\S]*?)<\/p>\s*<\/div>|<table\s+class='enumeration_item'>([\s\S]*?)<\/table>/gi,
  )) {
    if (m[1] !== undefined) {
      // paragraph: Nummer aus erstem .number-Span, Text aus .text_content (oder <p>).
      const inner = m[1];
      const numMatch = inner.match(/<span\s+class='number'>([\s\S]*?)<\/span>/i);
      const absatz = numMatch ? bereinige(numMatch[1]) || null : null;
      const txtMatch = inner.match(
        /<span\s+class='text_content'>([\s\S]*?)<\/span>/i,
      );
      const text = bereinige(txtMatch ? txtMatch[1] : inner.replace(/<span\s+class='number'>[\s\S]*?<\/span>/i, ''));
      bloecke.push({ absatz, text });
    } else if (m[2] !== undefined) {
      // enumeration_item: an den vorigen Absatz anhängen (Nummer + Text).
      const inner = m[2];
      const cells = [...inner.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) =>
        bereinige(c[1]),
      );
      const zeile = cells.filter(Boolean).join(' ').trim();
      if (zeile) {
        if (bloecke.length > 0) {
          bloecke[bloecke.length - 1].text =
            `${bloecke[bloecke.length - 1].text} ${zeile}`.trim();
        } else {
          // Aufzählung ohne vorangehenden Absatz (selten) → eigener Block.
          bloecke.push({ absatz: null, text: zeile });
        }
      }
    }
  }

  return { bloecke };
}

/** ISO-Datum (YYYY-MM-DD) aus version_dates_str «… in Kraft seit: DD.MM.YYYY …»
 *  ziehen, falls vorhanden. Sonst null. */
function inkraftAusDatesStr(s: string | undefined | null): string | null {
  if (!s) return null;
  const m = s.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/**
 * Holt einen LexWork-Erlass und extrahiert die angeforderten Artikel-Tokens.
 *
 * - structured_document_id null/fehlt ODER xhtml_tol falsy → meta.nurPdf=true,
 *   artikel={} (kein Crash; Alt-Erlass nur als PDF).
 * - stand: ISO aus enactment, sonst aus current_version.version_dates_str.
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

  const stand =
    (tol.enactment && /^\d{4}-\d{2}-\d{2}$/.test(tol.enactment)
      ? tol.enactment
      : null) ??
    inkraftAusDatesStr(cur?.version_dates_str) ??
    '';

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
