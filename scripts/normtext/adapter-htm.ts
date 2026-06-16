/**
 * HTM-Adapter — Norm-Volltext aus den statischen, MS-Word-exportierten
 * .htm-Erlasssammlungen der Kantone NE (rsn.ne.ch) und GE (silgeneve.ch),
 * für die Norm-Vorschau-Popover. Browserlos: reines fetch + Regex-Extraktion
 * (kein Headless-Browser, kein Scraping pro Kanton — ein Adapter, zwei Profile).
 *
 * Beide Quellen liefern statisches HTML in windows-1252/latin-1 (CRLF,
 * Word-Markup). Empirisch verifiziert am echten HTML (§7, Spike 16.6.2026):
 *
 * GE — silgeneve.ch (Profil 'ge'):
 *   - Artikel-Kopf:  <p class=article>Art. N&nbsp;&nbsp;… Sachtitel</p>
 *       (Nummer + frz. Sachtitel im selben <p>; Nummer evtl. mit <sup>(6)</sup>-
 *        Revisionsmarke dahinter — wird verworfen).
 *   - Absätze:       <p class=TexteTL>…</p> — bei mehreren Absätzen je <p> ein
 *       führendes <sup>1</sup>/<sup>2</sup>… als Absatznummer. Folge-<p> bis zum
 *       nächsten article/chapitre/section/partie gehören zum Artikel.
 *   - Revisions-/Fussnoten-Marken <sup>(6)</sup> sind redaktionell → entfernt.
 *   - Stand: jüngstes <p class=Tvigueur>DD.MM.YYYY</p> (In-Kraft-Daten); Fallback
 *       Kopf «Dernières modifications au 1er juillet 2025».
 *
 * NE — rsn.ne.ch (Profil 'ne'):
 *   - Artikel-Kopf:  <p class=xNormal><a name="LVMPART_N"><b>Art. N</b></a>…Text…</p>
 *       (Art. 1 = «Article premier»). Der Absatztext steht im SELBEN <p> direkt
 *        nach dem Anker; weitere Absätze sind Folge-<p class=xNormal> mit
 *        führendem <sup>1</sup>/<sup>2</sup>/<sup>1bis</sup>… als Absatznummer.
 *   - Sachtitel/Marginalie: das unmittelbar VORANGEHENDE <p class=xMarginale> …
 *       (rein redaktionell, NICHT Normtext → als Block-Metadaten ignoriert; der
 *        Volltext besteht aus den Absätzen).
 *   - lit.-Punkte:   <p class=xRetrait1a><i>a)</i> …Text…</p> → items am Absatz.
 *   - Fussnoten:     <a href="#_ftn…"><span class=MsoFootnoteReference>[9]</span></a>
 *       → komplett entfernt (redaktioneller Verweis, kein Normtext).
 *   - Eingebettete Word-Tabellen (MsoTableGrid, Gebührenstaffeln) → als lesbarer
 *       Text an den vorangehenden Absatz gehängt (Zelle · Zelle — Zeile).
 *   - Stand: <p class=xEdition>État au<br>1er avril 2023</p>.
 *
 * TI — m3.ti.ch (Profil 'ti', italienisch, server-gerendertes HTML, KEIN SPA):
 *   - URL: …/raccolta-leggi/legge/num/{N} (utf-8). Die Tarif-quelleUrl zitiert TI
 *     teils als …/pdfatto/atto/{N} (PDF) — die HTML-URL …/legge/num/{N} wird
 *     daraus abgeleitet (tiHtmlUrlAusQuelle).
 *   - Artikel-Kopf: fettes <span style="…font-weight:bold…">Art. N</span> (die
 *     Aweber-Word→HTML-Ausgabe zerlegt «Art. N» teils in mehrere fette Spans
 *     «Art.»·« »·«N» — sie werden vor dem Split zu EINEM Span verschmolzen).
 *   - Absätze: kleine Spans «font-size:8pt; vertical-align:2pt» mit nacktem
 *     Ziffern-Inhalt (1, 2, 3) am <p>-Anfang = Absatznummer; Folgespans = Text.
 *   - Sachtitel/Marginalie: fettes <span> mit Text (kein «Art. N») in einem
 *     eigenen <p> VOR dem Artikel → redaktionell, ignoriert.
 *   - Fussnoten: <a href="#_ftn…"><span …>[N]</span></a> bzw. hochgestellte
 *     «font-size:6.67pt; vertical-align:super»-Spans «[N]» → entfernt.
 *   - Eingebettete Tabellen (Gebührenstaffeln) → an den vorangehenden Absatz.
 *   - Stand: jüngstes «in vigore dal D.M.YYYY» → ISO.
 *
 * Mehrsprachigkeit: NE/GE französisch, TI italienisch — Texte unverändert.
 *
 * Drift-Token (§7 d): es gibt keine version_uid. quelleHash = sha256 des
 * normalisierten extrahierten Volltexts (alle Artikel + items, stabil sortiert)
 * dient als fassungsToken; zusätzlich der `stand` aus dem Datum-Marker. Re-fetch
 * + quelleHash-Vergleich erkennt jede inhaltliche Änderung der Quelle.
 *
 * §2: rein/deterministisch (kein Date.now/Math.random). Öffentliche Signaturen
 * sind stabil; Regex-Interna dürfen sich anpassen, wenn die Quelle ihr Word-
 * Markup ändert (§7).
 */

import { createHash } from 'node:crypto';
import { dekodiereEntities } from './html-entities.ts';

export type HtmProfil = 'ne' | 'ge' | 'ti';

export interface HtmBlock {
  absatz: string | null;
  text: string;
  items?: Array<{ marke: string; text: string }>;
}

export interface HtmArtikel {
  bloecke: HtmBlock[];
}

export interface HtmErgebnis {
  meta: {
    titel: string;
    stand: string;
    quelleHash: string;
  };
  artikel: Record<string, HtmArtikel>; // token → Artikel
  /** Einheitliches Label je token: «Art. N» (NE/GE sind «Art.»-Erlasse). */
  labels: Record<string, string>;
}

// ── latin-1/windows-1252 → JS-String ────────────────────────────────────────
// Beide Quellen deklarieren windows-1252 (latin-1-Superset; die in CH-Erlassen
// vorkommenden Zeichen é/à/ç/€/«/» liegen in der windows-1252-Belegung). Wir
// dekodieren byteweise über TextDecoder('windows-1252'), damit é (0xE9) usw.
// korrekt werden statt Mojibake.
export function dekodiereLatin1(bytes: Uint8Array): string {
  return new TextDecoder('windows-1252').decode(bytes);
}

// ── Tag-Strip + Entity-Dekode + Whitespace-Normalisierung ────────────────────
/** Strippt HTML-Tags, entfernt Fussnoten/Revisionsmarken, dekodiert Entities,
 *  normalisiert Whitespace zu einfachen Leerzeichen. */
function bereinige(roh: string): string {
  // NE: Fussnoten-Anker sind redaktionelle Verweis-Marker, KEIN Normtext →
  //     komplett entfernen. Zwei reale Formen (§7):
  //       (a) <a href="#_ftn…">…<span class=MsoFootnoteReference>[9]</span>…</a>
  //       (b) <a href="Javascript:MyDocumentNote(5)">…5)…</a>  (ältere RSN-Seiten)
  let s = roh.replace(
    /<a\b[^>]*href=["'](?:#_ftn|Javascript:MyDocumentNote)[^>]*>[\s\S]*?<\/a>/gi,
    '',
  );
  // GE: Revisionsmarken «<sup>…(6)…</sup>» (reine Klammerzahl, evtl. in einen
  //     <span> gehüllt) sind redaktionell → entfernen. Absatznummern stehen
  //     ebenfalls in <sup>, werden aber VOR bereinige() gesondert ausgelesen
  //     (leseSupNummer); hier verbleibende <sup>(N)</sup> sind Revisionsmarken.
  //     Inner-Tags (z.B. <span style=…>) werden für die Klammerzahl-Prüfung
  //     ignoriert (Strip innerhalb des <sup>).
  s = s.replace(/<sup\b[^>]*>([\s\S]*?)<\/sup>/gi, (voll, innen) =>
    /^\s*\(\d+\)\s*$/.test(innen.replace(/<[^>]+>/g, '')) ? '' : voll,
  );
  // restliche MsoFootnoteReference-Spans (ohne umschliessenden _ftn-Anker)
  s = s.replace(
    /<span\b[^>]*class=["']?MsoFootnoteReference["']?[^>]*>[\s\S]*?<\/span>/gi,
    '',
  );
  const ohneTags = s.replace(/<[^>]+>/g, '');
  return dekodiereEntities(ohneTags).replace(/\s+/g, ' ').trim();
}

// ── <p class=…>-Segmentierung ────────────────────────────────────────────────
interface PSegment {
  klasse: string;
  inner: string;
  /** Byte-Offset des <p> im Quell-HTML (für Tabellen-Zuordnung GE). */
  index: number;
  /** true, wenn dieses <p> innerhalb eines <table> liegt (Tabellenzelle). Solche
   *  Zellen werden NICHT als eigene Blöcke ausgegeben — die Tabelle wird als
   *  gepaarte Band↔Wert-`items` separat angehängt (tabelleZuItems). */
  inTabelle: boolean;
}

/** Liefert die [start,ende)-Byte-Ranges aller <table>…</table> im HTML. */
function tabellenRanges(html: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  const re = /<table\b[^>]*>[\s\S]*?<\/table>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    ranges.push([m.index, m.index + m[0].length]);
  }
  return ranges;
}

/** Zerlegt das HTML in <p class=…>…</p>-Segmente (Word exportiert sauber
 *  geschlossene <p>; verschachtelte Tabellen bleiben im inner erhalten).
 *  inTabelle markiert Zellen-<p> (liegen in einer <table>-Range). */
function leseParagraphen(html: string): PSegment[] {
  const ranges = tabellenRanges(html);
  const segmente: PSegment[] = [];
  // class= mit/ohne Quotes (GE: class=article, NE: class=xNormal). Bis zum
  // nächsten </p>. Word verschachtelt keine <p> ineinander.
  const re = /<p\b[^>]*\bclass=["']?([\w-]+)["']?[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const index = m.index;
    const inTabelle = ranges.some(([a, b]) => index >= a && index < b);
    segmente.push({ klasse: m[1], inner: m[2], index, inTabelle });
  }
  return segmente;
}

// Vorlauf-Müll vor der Absatznummer: Whitespace, leere <b>/<span>, &nbsp;.
const VORLAUF = /^(?:\s|&nbsp;|<b>[\s\S]*?<\/b>|<span\b[^>]*>(?:\s|&nbsp;)*<\/span>)*/i;

/**
 * Liest eine führende Absatznummer am Anfang des inner-Texts. Reale Formen (§7):
 *   (a) <sup>1</sup>                                        (NE 164.1, GE)
 *   (b) <span style='font-size:9.0pt'>1</span>             (NE 16631 — kleiner Font)
 *   (c) <span style='position:relative;top:-3pt'><span style='font-size:7.0pt'>1</span></span>
 *                                                          (NE 6350 — CSS-Hochstellung)
 * Erkannt wird ein führendes hochgestelltes/kleingesetztes Element, dessen
 * reiner Inhalt eine Absatznummer (Ziffer + opt. lat. Suffix: 1, 2, 1bis) ist.
 * Eine reine Klammerzahl (6) ist KEINE Absatznummer (Revisionsmarke) → null.
 *
 * Liefert {nummer, rest} oder null. Fussnoten-Anker werden vorab entfernt.
 */
function leseSupNummer(inner: string): { nummer: string; rest: string } | null {
  // Fussnoten-Anker (beide Formen) zuerst entfernen, sonst steht beim Artikel-
  // Kopf der Anker zwischen </a> und der Absatznummer.
  const ohneFootnote = inner.replace(
    /<a\b[^>]*href=["'](?:#_ftn|Javascript:MyDocumentNote)[^>]*>[\s\S]*?<\/a>/gi,
    '',
  );

  // Vorlauf-Müll überspringen.
  const v = ohneFootnote.match(VORLAUF);
  const start = v ? v[0].length : 0;
  const ab = ohneFootnote.slice(start);

  // (a) <sup>…</sup>  ODER  (b/c) ein/zwei verschachtelte kleine/hochgestellte
  //     <span>…</span>. Wir greifen das erste Element und prüfen seinen Inhalt.
  const supM = ab.match(/^<sup\b[^>]*>([\s\S]*?)<\/sup>/i);
  let inhalt: string | null = null;
  let verbraucht = 0;
  if (supM) {
    inhalt = supM[1];
    verbraucht = supM[0].length;
  } else {
    // (b/c): führendes <span style=…(klein/hochgestellt)…>…</span>, evtl. mit
    //        innerem <span>. Akzeptiere nur, wenn das style die Hochstellung/
    //        Kleinschrift signalisiert (font-size ≤ 10pt ODER top:-…pt ODER
    //        vertical-align:super) — sonst würde ein normaler Text-Span fälschlich
    //        als Absatznummer gelesen.
    const spanM = ab.match(/^<span\b([^>]*)>([\s\S]*?)<\/span>/i);
    if (spanM) {
      const style = spanM[1];
      const klein =
        /font-size:\s*(?:[1-9]|10)(?:\.\d+)?pt/i.test(style) ||
        /top:\s*-\d/i.test(style) ||
        /vertical-align:\s*super/i.test(style);
      if (klein) {
        inhalt = spanM[2];
        verbraucht = spanM[0].length;
      }
    }
  }
  if (inhalt === null) return null;

  const roh = bereinige(inhalt);
  // Absatznummer-Form: 1, 2, 1bis, 2ter, 10 … (Ziffer + optional lat. Suffix).
  if (!/^\d+(?:bis|ter|quater|quinquies)?$/i.test(roh)) return null;
  const rest = ab.slice(verbraucht);
  return { nummer: roh.toLowerCase(), rest };
}

// ── NE: lit.-Marke aus xRetrait1a («<i>a)</i> …») ───────────────────────────
/** Liest eine lit.-Marke «a)»/«b)» am Anfang eines xRetrait1a-Segments.
 *  Liefert {marke, rest} oder null (z.B. «-  si la valeur…» ohne Buchstabe). */
function leseLitMarke(inner: string): { marke: string; rest: string } | null {
  const text = bereinige(inner);
  const m = text.match(/^([a-z])\)\s*/i);
  if (!m) return null;
  return { marke: m[1].toLowerCase(), rest: text.slice(m[0].length).trim() };
}

// ── Word-Tarif-Tabelle → gepaarte Band↔Wert-`items` ──────────────────────────
/**
 * Wandelt eine Word-Tarif-Tabelle (Gebührenstaffel) in gepaarte `items`: je
 * TABELLENZEILE EIN item `{ marke: <Band/Bedingung>, text: <Gebühr/Wert> }`, so
 * dass im Popover Band UND Wert beieinander stehen (wie bei den BS-Ziffern) statt
 * alle Werte als Klumpen am ersten Band (Bug-Befund 16.6.2026).
 *
 * Reale Struktur (§7, live geprüft an NE 164.1 art_12 + GE rsg_e1_05p10 art_17):
 *   - 1. Spalte = Band/Bedingung (z.B. «- jusqu'à», «- de»). Folgespalten bis VOR
 *     die Wertspalte tragen die Grenzen («2'001.– · à · 5'000.–») und werden zum
 *     Band-Label verkettet.
 *   - Letzte gefüllte Spalte = Wert (Gebühr/Prozentsatz).
 *   - rowspan (NE art_12): die Wertzelle der ersten 5 Bänder ist EINE Zelle mit
 *     rowspan=5, die FÜNF <p>-Absätze enthält — einer je Band. Word legt sie nur
 *     in der HTML der ersten Zeile ab; die Folgezeilen tragen keine eigene
 *     Wertzelle. → die n Wert-Absätze werden den n folgenden Band-Zeilen
 *     einzeln zugeordnet.
 *   - reine Kopfzeilen (nur «Fr.»-Überschriften, kein Band) → übersprungen.
 *
 * Liefert [] bei leerer/nicht paarbarer Tabelle (§8: kein stiller Crash, dann
 * fällt der Aufrufer auf den unveränderten Prosa-Pfad zurück).
 */
function tabelleZuItems(tabellenHtml: string): Array<{ marke: string; text: string }> {
  const zeilen = [...tabellenHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(
    (r) => r[1],
  );
  // Zellen je Zeile mit ihren <p>-Werten und rowspan auslesen.
  interface Zelle {
    text: string; // ganze Zelle bereinigt (für Band-Verkettung)
    absaetze: string[]; // einzelne <p>-Absätze (für rowspan-Verteilung)
    rowspan: number;
  }
  const matrix: Zelle[][] = zeilen.map((zeile) => {
    return [...zeile.matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi)].map((c) => {
      const attr = c[1];
      const inhalt = c[2];
      const rsM = attr.match(/\browspan=["']?(\d+)/i);
      const absaetze = [...inhalt.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
        .map((p) => bereinige(p[1]))
        .filter(Boolean);
      // Falls keine <p> (nur nackter Text in der Zelle): ganze Zelle als ein Absatz.
      if (absaetze.length === 0) {
        const roh = bereinige(inhalt);
        if (roh) absaetze.push(roh);
      }
      return {
        text: absaetze.join(' '),
        absaetze,
        rowspan: rsM ? Math.max(1, parseInt(rsM[1], 10)) : 1,
      };
    });
  });

  // rowspan-Wertzellen: eine Zelle mit rowspan>1, deren Absätze sich auf die
  // Folgezeilen verteilen. Wir merken pro rowspan-Wertzelle die Absatz-Queue und
  // die Restzeilen, und ziehen je nachfolgender Band-Zeile einen Absatz.
  interface Pending {
    absaetze: string[];
    rest: number; // verbleibende Zeilen inkl. der aktuellen
  }
  let pending: Pending | null = null;

  const items: Array<{ marke: string; text: string }> = [];

  for (const zellen of matrix) {
    const gefuellt = zellen.filter((z) => z.text !== '');
    // Kopfzeile / Leerzeile (keine echten Zellen) → überspringen, aber pending
    // NICHT verbrauchen (Word stellt Leerzeilen mit height=0 ans Tabellenende).
    if (gefuellt.length === 0) continue;

    // Band-Label = alle gefüllten Zellen AUSSER der letzten (Wert), verkettet.
    // Sonderfall rowspan-aktiv: dann steht in dieser Zeile KEINE eigene Wertzelle
    // (sie ist von der vorigen rowspan-Zelle überdeckt) → alle gefüllten Zellen
    // bilden das Band.
    let bandZellen: Zelle[];
    let wertText: string;

    // Enthält diese Zeile selbst eine rowspan>1-Zelle? Dann ist deren letzter
    // Eintrag die mehrzeilige Wertzelle.
    const rowspanZelle = zellen.find((z) => z.rowspan > 1 && z.text !== '');

    if (pending && pending.rest > 0) {
      // Wert kommt aus der laufenden rowspan-Queue; alle gefüllten Zellen = Band.
      bandZellen = gefuellt;
      wertText = pending.absaetze.shift() ?? '';
      pending.rest -= 1;
      if (pending.rest === 0) pending = null;
    } else if (rowspanZelle) {
      // Neue rowspan-Wertzelle: ihr erster Absatz gehört zu DIESER Zeile, die
      // restlichen zu den folgenden (rowspan-1) Zeilen.
      bandZellen = gefuellt.filter((z) => z !== rowspanZelle);
      const queue = [...rowspanZelle.absaetze];
      wertText = queue.shift() ?? rowspanZelle.text;
      if (queue.length > 0) {
        pending = { absaetze: queue, rest: rowspanZelle.rowspan - 1 };
      }
    } else {
      // Normale Zeile: letzte gefüllte Zelle = Wert, Rest = Band.
      wertText = gefuellt[gefuellt.length - 1].text;
      bandZellen = gefuellt.slice(0, -1);
    }

    const band = bandZellen.map((z) => z.text).filter(Boolean).join(' ');
    // Reine Kopfzeile (z.B. NE «Fr.»-Überschriften, GE «Valeur litigieuse |
    // Emolument»): weder Band noch Wert enthalten eine Ziffer → übersprungen.
    const KOPF = /^(?:fr\.?|emolument|émolument|valeur litigieuse|\s|&nbsp;)*$/i;
    if (!/\d/.test(band) && !/\d/.test(wertText) && KOPF.test(band) && KOPF.test(wertText)) {
      continue;
    }
    const marke = band || wertText;
    const text = band ? wertText : '';
    items.push({ marke, text });
  }
  return items;
}

// ─────────────────────────────────────────────────────────────────────────────
// GE-Profil
// ─────────────────────────────────────────────────────────────────────────────

/** GE: liest «Art. N» (+ evtl. Sachtitel) aus einem <p class=article>-inner.
 *  Liefert die Artikel-Nummer (token-normalisiert, z.B. '4', '16') oder null. */
function geArtikelNummer(inner: string): string | null {
  // Nummer steht VOR evtl. <sup>(6)</sup>-Revisionsmarke und dem Sachtitel.
  // bereinige würde die Marke entfernen, aber den Sachtitel anhängen — wir
  // lesen die Nummer direkt aus dem Rohtext.
  const text = bereinige(inner);
  const m = text.match(/^Art\.\s*(\d+[a-z]?(?:bis|ter|quater|quinquies)?)/i);
  if (!m) return null;
  return normalisiereToken(m[1]);
}

const GE_GLIEDERUNG = new Set(['article', 'chapitre', 'section', 'partie', 'titre']);

/** Extrahiert alle GE-Artikel aus den Paragraphen. */
function geExtrahiere(segmente: PSegment[]): Record<string, HtmArtikel> {
  const artikel: Record<string, HtmArtikel> = {};
  let aktiv: { token: string; bloecke: HtmBlock[] } | null = null;

  const speichere = (): void => {
    if (aktiv && aktiv.bloecke.length > 0 && !(aktiv.token in artikel)) {
      artikel[aktiv.token] = { bloecke: aktiv.bloecke };
    }
  };

  for (const seg of segmente) {
    if (seg.klasse === 'article') {
      speichere();
      const token = geArtikelNummer(seg.inner);
      aktiv = token ? { token, bloecke: [] } : null;
      continue;
    }
    // Andere Gliederungs-Paragraphen beenden den laufenden Artikel.
    if (GE_GLIEDERUNG.has(seg.klasse)) {
      speichere();
      aktiv = null;
      continue;
    }
    if (!aktiv) continue;
    // Tabellenzellen-<p> NICHT als eigene Blöcke ausgeben — die Tabelle wird als
    // gepaarte Band↔Wert-items separat angehängt (geHängeTabellen). Sonst
    // zerfällt die Tarif-Tabelle in Label-/Wert-Einzelblöcke (Bug 16.6.2026).
    if (seg.inTabelle) continue;
    // Absatz-Paragraph (TexteTL u.ä.). Leerzeilen (retour…) ignorieren.
    if (/^retour/i.test(seg.klasse) || seg.klasse === 'xLigneBlanche') continue;
    const sup = leseSupNummer(seg.inner);
    const text = sup ? bereinige(sup.rest) : bereinige(seg.inner);
    if (!text) continue;
    aktiv.bloecke.push({ absatz: sup ? sup.nummer : null, text });
  }
  speichere();
  return artikel;
}

/** GE: eingebettete Word-Tarif-Tabellen als gepaarte Band↔Wert-`items` an den
 *  Einleitungsabsatz des Artikels hängen (analog NE). Eine Tabelle wird dem
 *  Artikel zugeordnet, in dessen Roh-Abschnitt (zwischen seinem <p class=article>
 *  und dem nächsten Gliederungs-/Artikel-<p>) sie liegt. */
function geHängeTabellen(segmente: PSegment[], html: string, artikel: Record<string, HtmArtikel>): void {
  // Artikel-Köpfe mit ihrem Token + Byte-Index sammeln (in HTML-Reihenfolge).
  const koepfe: Array<{ token: string; index: number }> = [];
  for (const seg of segmente) {
    if (seg.klasse === 'article') {
      const token = geArtikelNummer(seg.inner);
      if (token) koepfe.push({ token, index: seg.index });
    }
  }
  if (koepfe.length === 0) return;
  // Gliederungs-Grenzen: jeder Artikel reicht bis zum nächsten Artikel-Kopf.
  for (let i = 0; i < koepfe.length; i++) {
    const { token, index } = koepfe[i];
    const ende = i + 1 < koepfe.length ? koepfe[i + 1].index : html.length;
    const abschnitt = html.slice(index, ende);
    const tabellen = [...abschnitt.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)];
    if (tabellen.length === 0) continue;
    const tabItems = tabellen.flatMap((t) => tabelleZuItems(t[1]));
    if (tabItems.length === 0) continue;
    // Falls der Artikel KEINEN Prosa-Block hat — entweder weil sein gesamter
    // Inhalt in der Tabelle steckt (z.B. GE rsg_e1_50p06 Art. 6, dann fehlt er
    // ganz in `artikel`, da geExtrahiere nur blockhaltige Artikel speichert),
    // oder weil der Träger-Block leer ist —, legen wir einen leeren Träger-Block
    // an, damit die Tabellen-items nicht verloren gehen.
    let art = artikel[token];
    if (!art) {
      art = { bloecke: [] };
      artikel[token] = art;
    }
    if (art.bloecke.length === 0) art.bloecke.push({ absatz: null, text: '' });
    (art.bloecke[0].items ??= []).push(...tabItems);
  }
}

/** GE-Stand: jüngstes Tvigueur-Datum; Fallback Kopf «Dernières modifications au». */
function geStand(html: string): string {
  const daten = [
    ...html.matchAll(
      /<p\b[^>]*\bclass=["']?Tvigueur["']?[^>]*>[\s\S]*?(\d{2})\.(\d{2})\.(\d{4})[\s\S]*?<\/p>/gi,
    ),
  ].map((m) => `${m[3]}-${m[2]}-${m[1]}`);
  if (daten.length > 0) {
    daten.sort();
    return daten[daten.length - 1];
  }
  // Fallback: Kopf «Dernières modifications au 1er juillet 2025»
  const kopf = leseFranzMonatsdatum(html);
  return kopf ?? '';
}

/** GE-Titel: erstes <p class=TitreLoi>. */
function geTitel(segmente: PSegment[]): string {
  const s = segmente.find((p) => p.klasse === 'TitreLoi');
  return s ? bereinige(s.inner) : '';
}

// ─────────────────────────────────────────────────────────────────────────────
// NE-Profil
// ─────────────────────────────────────────────────────────────────────────────

/** NE: liest «Art. N»/«Article premier» aus einem xNormal-inner mit
 *  <a name="LVMPART_N"><b>…</b></a>. Liefert {token, rest} oder null. */
function neArtikelKopf(inner: string): { token: string; rest: string } | null {
  const m = inner.match(
    /<a\b[^>]*name=["']LVMPART_[^"']*["'][^>]*>\s*<b>([\s\S]*?)<\/b>\s*<\/a>/i,
  );
  if (!m) return null;
  const label = bereinige(m[1]);
  let token: string | null = null;
  if (/^Article\s+premier/i.test(label)) {
    token = '1';
  } else {
    const a = label.match(/^Art\.\s*(\d+[a-z]?(?:bis|ter|quater|quinquies)?)/i);
    if (a) token = normalisiereToken(a[1]);
  }
  if (!token) return null;
  const rest = inner.slice(m.index! + m[0].length);
  return { token, rest };
}

/** Extrahiert alle NE-Artikel aus den Paragraphen. */
function neExtrahiere(segmente: PSegment[]): Record<string, HtmArtikel> {
  const artikel: Record<string, HtmArtikel> = {};
  let aktiv: { token: string; bloecke: HtmBlock[] } | null = null;

  const speichere = (): void => {
    if (aktiv && aktiv.bloecke.length > 0 && !(aktiv.token in artikel)) {
      artikel[aktiv.token] = { bloecke: aktiv.bloecke };
    }
  };

  for (const seg of segmente) {
    if (seg.klasse === 'xNormal') {
      const kopf = neArtikelKopf(seg.inner);
      if (kopf) {
        // Neuer Artikel beginnt.
        speichere();
        aktiv = { token: kopf.token, bloecke: [] };
        // Der erste Absatz steht im selben <p> (evtl. mit <sup>1</sup>).
        const sup = leseSupNummer(kopf.rest);
        const text = sup ? bereinige(sup.rest) : bereinige(kopf.rest);
        if (text) aktiv.bloecke.push({ absatz: sup ? sup.nummer : null, text });
        continue;
      }
      // xNormal ohne Anker = Folge-Absatz des laufenden Artikels.
      if (!aktiv) continue;
      const sup = leseSupNummer(seg.inner);
      const text = sup ? bereinige(sup.rest) : bereinige(seg.inner);
      if (text) aktiv.bloecke.push({ absatz: sup ? sup.nummer : null, text });
      continue;
    }

    if (!aktiv) {
      // Vor dem ersten Artikel (Präambel, Marginalie) — ignorieren.
      continue;
    }

    // lit.-Punkt am laufenden Absatz.
    if (seg.klasse === 'xRetrait1a') {
      const lit = leseLitMarke(seg.inner);
      if (lit && lit.rest) {
        const last = aktiv.bloecke[aktiv.bloecke.length - 1];
        if (last) (last.items ??= []).push({ marke: lit.marke, text: lit.rest });
        else aktiv.bloecke.push({ absatz: null, text: '', items: [{ marke: lit.marke, text: lit.rest }] });
      }
      continue;
    }

    // Marginalie / Gliederung beenden den Artikel NICHT direkt (NE setzt
    // xMarginale VOR den nächsten Artikel) — aber xMarginale/xTitre/xChapitre/
    // xNomChapitre signalisieren das Ende des aktuellen Artikels.
    if (
      seg.klasse === 'xMarginale' ||
      seg.klasse === 'xTitre' ||
      seg.klasse === 'xChapitre' ||
      seg.klasse === 'xNomChapitre'
    ) {
      speichere();
      aktiv = null;
      continue;
    }
    // xLigneBlanche, sonstige → ignorieren (Artikel bleibt aktiv, falls noch
    // Folge-Absätze kommen).
  }
  speichere();
  return artikel;
}

/** NE: eingebettete Word-Tarif-Tabellen als gepaarte Band↔Wert-`items` an den
 *  Einleitungsabsatz hängen (Bug-Fix 16.6.2026 — vorher flacher Text-Klumpen).
 *  Wird NACH neExtrahiere separat aufgerufen, weil die Tabellen zwischen den
 *  xNormal-Absätzen stehen. Wir scannen den Artikel-Bereich erneut roh. */
function neHängeTabellen(html: string, token: string, art: HtmArtikel): void {
  // Den Roh-Abschnitt dieses Artikels herausschneiden: ab LVMPART_<token> bis
  // zum nächsten LVMPART. (Art. 1 = LVMPART_1; token '1_a' → 'LVMPART_1a' kommt
  // bei NE nicht vor — Tabellen-Anhängung ist best effort, §8 ohne stillen Crash.)
  const ankerName = `LVMPART_${token.replace(/_/g, '')}`;
  const start = html.indexOf(`name="${ankerName}"`);
  if (start < 0) return;
  const restHtml = html.slice(start);
  const nextAnker = restHtml.slice(20).search(/name=["']LVMPART_/i);
  const abschnitt = nextAnker < 0 ? restHtml : restHtml.slice(0, nextAnker + 20);
  const tabellen = [
    ...abschnitt.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi),
  ];
  if (tabellen.length === 0) return;
  const tabItems = tabellen.flatMap((t) => tabelleZuItems(t[1]));
  if (tabItems.length === 0) return;
  // An den ersten Absatz als items hängen (die Staffel gehört zum Einleitungs-
  // absatz). Falls dieser schon items hat (NE: keine, GE: lit.), anhängen.
  const ziel = art.bloecke[0];
  if (ziel) (ziel.items ??= []).push(...tabItems);
}

/** NE-Stand: <p class=xEdition>État au<br>1er avril 2023</p>. */
function neStand(html: string): string {
  const m = html.match(
    /<p\b[^>]*\bclass=["']?xEdition["']?[^>]*>([\s\S]*?)<\/p>/i,
  );
  if (!m) return '';
  return leseFranzMonatsdatum(m[1]) ?? '';
}

/** NE-Titel: erstes <p class=xTitre…> bzw. der Reference/Titre. */
function neTitel(segmente: PSegment[]): string {
  const s = segmente.find((p) => p.klasse === 'xTitre');
  return s ? bereinige(s.inner) : '';
}

// ─────────────────────────────────────────────────────────────────────────────
// TI-Profil (m3.ti.ch, server-gerendertes HTML, italienisch)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Leitet die TI-HTML-URL (…/legge/num/{N}) aus der Tarif-quelleUrl ab. Die
 * Tarif-Daten zitieren TI als …/pdfatto/atto/{N} (PDF) ODER bereits als
 * …/legge/num/{N} (HTML). Manifest-Key bleibt aber die EXAKTE Tarif-quelleUrl —
 * diese Funktion liefert nur die zu fetchende HTML-Adresse.
 */
export function tiHtmlUrlAusQuelle(quelleUrl: string): string {
  const m = quelleUrl.match(
    /^(https:\/\/m3\.ti\.ch\/CAN\/RLeggi\/public\/(?:index\.php\/)?raccolta-leggi)\/pdfatto\/atto\/(\d+)$/i,
  );
  if (m) return `${m[1]}/legge/num/${m[2]}`;
  return quelleUrl;
}

/** Italienische Monatsnamen → MM (für «in vigore: 1° luglio 2015»). */
const IT_MONATE: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04', maggio: '05',
  giugno: '06', luglio: '07', agosto: '08', settembre: '09', ottobre: '10',
  novembre: '11', dicembre: '12',
};

/**
 * TI-Stand: jüngstes In-Kraft-Datum aus den Fussnoten-Anmerkungen. Zwei reale
 * Formen (§7, live geprüft an atto 137 LTG + atto 148 tariffa notarile):
 *   (a) «in vigore dal D.M.YYYY»            (numerisch — neuere Erlasse, LTG)
 *   (b) «in vigore: D° mese YYYY»           (it. Monatsname — ältere, Notariat)
 * Das jüngste gefundene Datum ist der Erlass-Stand. Tags werden vorher gestrippt,
 * weil Tag/«°»/Monat in der TI-Ausgabe in getrennten Spans stehen.
 */
export function leseTiStand(html: string): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&deg;/gi, '°');
  const daten: string[] = [];
  // (a) numerisch
  for (const m of text.matchAll(/in\s+vigore\s+dal\s+(\d{1,2})\.(\d{1,2})\.(\d{4})/gi)) {
    daten.push(`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`);
  }
  // (b) it. Monatsname («in vigore: 1° luglio 2015»; «°» und «dal» optional)
  for (const m of text.matchAll(
    /in\s+vigore\s*(?:dal)?\s*:?\s*(\d{1,2})\s*°?\s+([a-zà-ù]+)\s+(\d{4})/gi,
  )) {
    const mon = IT_MONATE[m[2].toLowerCase()];
    if (mon) daten.push(`${m[3]}-${mon}-${m[1].padStart(2, '0')}`);
  }
  if (daten.length === 0) return '';
  daten.sort();
  return daten[daten.length - 1];
}

/** TI-Titel: erstes <h1>/<title>-naher Erlasstitel. Best effort (rein
 *  informativ; der Erlass-Name kommt im Snapshot aus den Tarif-Daten). */
function tiTitel(html: string): string {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? bereinige(m[1]) : '';
}

// Fettes <span …font-weight:bold…> mit Art.-Kopf. Die Aweber-Word→HTML-Ausgabe
// zerlegt «Art. N» teils in mehrere unmittelbar aufeinanderfolgende fette Spans
// («Art.»·« »·«N»). Vor dem Split verschmelzen wir benachbarte fette Spans.
const TI_BOLD_SPAN = /<span\b[^>]*font-weight:\s*bold[^>]*>([\s\S]*?)<\/span>/gi;

/** Verschmilzt unmittelbar aufeinanderfolgende fette Spans zu EINEM fetten Span,
 *  damit ein zerstückeltes «Art.»·« »·«1» als «Art. 1» erkannt wird. */
function verschmelzeBoldSpans(html: string): string {
  // Zwischen zwei fetten Spans dürfen nur Whitespace stehen → zusammenfassen.
  let out = html;
  let prev: string;
  do {
    prev = out;
    out = out.replace(
      /(<span\b[^>]*font-weight:\s*bold[^>]*>)([\s\S]*?)(<\/span>)\s*(<span\b[^>]*font-weight:\s*bold[^>]*>)([\s\S]*?)(<\/span>)/i,
      (_voll, open1, inner1, _close1, _open2, inner2, close2) =>
        `${open1}${inner1}${inner2}${close2}`,
    );
  } while (out !== prev);
  return out;
}

/** Strippt Fussnoten-Anker (<a href="#_ftn…"> Verweis und <a href="#_ftnref…">
 *  Rückverweis, je …>[N]</a>) und hochgestellte «[N]»-Verweis-Spans (font-size
 *  klein + vertical-align:super), damit sie nicht als Absatznummer/Text
 *  durchschlagen. */
function tiOhneFootnotes(html: string): string {
  let s = html.replace(/<a\b[^>]*href=["']#_ftn(?:ref)?[^>]*>[\s\S]*?<\/a>/gi, '');
  // Hochgestellte Verweis-Spans «[N]» (auch ohne <a>-Hülle).
  s = s.replace(
    /<span\b[^>]*vertical-align:\s*super[^>]*>\s*\[?\d+\]?\s*<\/span>/gi,
    '',
  );
  // Leere Anker (Verweis-Ziele).
  s = s.replace(/<a\b[^>]*name=["']_ftn(?:ref)?\d+["'][^>]*>\s*<\/a>/gi, '');
  return s;
}

/** true, wenn ein <p>-inner (VOR dem Footnote-Stripping) eine Fussnoten-Definition
 *  ist: er beginnt mit dem Rückverweis-Anker <a href="#_ftnref…">. Diese Absätze
 *  («Cpv. modificato …; in vigore dal …») stehen am Dokumentende und sind KEIN
 *  Normtext → übersprungen, damit sie nicht dem letzten Artikel zugeschlagen
 *  werden. */
function istTiFootnoteDef(inner: string): boolean {
  return /^\s*<a\b[^>]*href=["']#_ftnref/i.test(inner);
}

// Absatznummer-Span: «font-size:8pt; vertical-align:2pt» mit nacktem Ziffern-
// Inhalt (1, 2, 3 …). Steht am <p>-Anfang nach dem Art.-Kopf bzw. allein.
const TI_ABSATZ_SPAN =
  /<span\b[^>]*font-size:\s*8(?:\.0)?pt[^>]*vertical-align:\s*2pt[^>]*>\s*(\d+(?:bis|ter)?)\s*<\/span>/i;

/**
 * Extrahiert ALLE TI-Artikel aus dem server-gerenderten HTML. Jeder Artikel
 * besteht aus einem oder mehreren <p>, das erste mit dem fetten «Art. N»-Kopf,
 * Folge-<p> tragen weitere Absatznummern. Tabellen werden an den vorangehenden
 * Absatz gehängt (analog NE/GE).
 */
function tiExtrahiere(html: string): Record<string, HtmArtikel> {
  const artikel: Record<string, HtmArtikel> = {};
  let aktiv: { token: string; bloecke: HtmBlock[] } | null = null;

  const speichere = (): void => {
    if (aktiv && aktiv.bloecke.length > 0 && !(aktiv.token in artikel)) {
      artikel[aktiv.token] = { bloecke: aktiv.bloecke };
    }
  };

  // <p>…</p> / <table>…</table> der Reihe nach aus dem ROHEN HTML (damit
  // istTiFootnoteDef den unveränderten <p>-Anfang sieht); je Knoten danach die
  // Fussnoten-Anker entfernen und fette Spans verschmelzen.
  const knoten = [
    ...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>|<table\b[^>]*>([\s\S]*?)<\/table>/gi),
  ];

  for (const m of knoten) {
    if (m[2] !== undefined) {
      // Tabelle → an den vorangehenden Absatz als items.
      if (!aktiv || aktiv.bloecke.length === 0) continue;
      const tabItems = tabelleZuItems(m[2]);
      if (tabItems.length === 0) continue;
      (aktiv.bloecke[aktiv.bloecke.length - 1].items ??= []).push(...tabItems);
      continue;
    }
    // Fussnoten-Definition (steht am Dokumentende, beginnt mit #_ftnref-Anker)
    // → kein Normtext, überspringen (sonst würde sie dem letzten Artikel
    // zugeschlagen).
    if (istTiFootnoteDef(m[1])) continue;
    const inner = verschmelzeBoldSpans(tiOhneFootnotes(m[1]));

    // Art.-Kopf? Fetter Span «Art. N» (nach Verschmelzung). Wir suchen den
    // ERSTEN fetten Span und prüfen, ob er mit «Art. N» beginnt.
    TI_BOLD_SPAN.lastIndex = 0;
    const boldM = TI_BOLD_SPAN.exec(inner);
    const boldText = boldM ? bereinige(boldM[1]) : '';
    const artM = boldText.match(/^Art\.?\s*(\d+[a-z]?(?:bis|ter|quater|quinquies)?)\b/i);

    if (artM) {
      speichere();
      const token = normalisiereToken(artM[1]);
      aktiv = { token, bloecke: [] };
      // Nach dem Art.-Kopf: Absatznummer + Text im selben <p>. Den Kopf-Span aus
      // dem inner entfernen, dann wie einen Folge-Absatz behandeln.
      const nachKopf = inner.slice(boldM!.index + boldM![0].length);
      tiFuegeAbsatz(aktiv.bloecke, nachKopf);
      continue;
    }

    // Kein Art.-Kopf. Ist es ein Folge-Absatz des aktiven Artikels (beginnt mit
    // einer Absatznummer ODER trägt Fliesstext)? Oder eine Marginalie/Gliederung
    // (fetter Sachtitel-Span ohne «Art.») → beendet NICHT zwingend, aber liefert
    // keinen Normtext.
    if (!aktiv) continue;
    // Marginalie: ein <p>, dessen GANZER (bereinigter) Inhalt fett ist (Sachtitel)
    // → kein Normtext. Heuristik: enthält einen fetten Span UND der Gesamttext ==
    // dem fetten Text (kein zusätzlicher Fliesstext).
    const ganz = bereinige(inner);
    if (ganz === '' ) continue;
    if (boldText && ganz === boldText) {
      // reiner Sachtitel (z.B. «Procedura ordinaria») → überspringen
      continue;
    }
    tiFuegeAbsatz(aktiv.bloecke, inner);
  }

  speichere();
  return artikel;
}

/** Hängt einen TI-Absatz (inner eines <p> ohne Art.-Kopf) an die Blockliste.
 *  Führende Absatznummer (8pt/2pt-Span) wird gelesen; der Rest ist Text. */
function tiFuegeAbsatz(bloecke: HtmBlock[], inner: string): void {
  let absatz: string | null = null;
  let rest = inner;
  const absM = inner.match(TI_ABSATZ_SPAN);
  // Nur als Absatznummer werten, wenn der Span am ANFANG steht (vor Fliesstext).
  if (absM && inner.slice(0, absM.index!).replace(/<[^>]+>|\s|&nbsp;/gi, '') === '') {
    absatz = absM[1].toLowerCase();
    rest = inner.slice(absM.index! + absM[0].length);
  }
  const text = bereinige(rest);
  if (text) bloecke.push({ absatz, text });
}

// ── Französisches Monatsdatum «1er avril 2023» / «1er juillet 2025» → ISO ─────
const FR_MONATE: Record<string, string> = {
  janvier: '01', février: '02', fevrier: '02', mars: '03', avril: '04',
  mai: '05', juin: '06', juillet: '07', août: '08', aout: '08',
  septembre: '09', octobre: '10', novembre: '11', décembre: '12', decembre: '12',
};
/** Liest ein frz. Datum «1er avril 2023» / «15 juin 2024» aus bereinigtem
 *  HTML und gibt ISO YYYY-MM-DD zurück (oder null). */
function leseFranzMonatsdatum(html: string): string | null {
  const text = bereinige(html);
  const m = text.match(
    /(\d{1,2})(?:er|e|ème)?\s+([A-Za-zéûôîàèç]+)\s+(\d{4})/i,
  );
  if (!m) return null;
  const tag = m[1].padStart(2, '0');
  const monat = FR_MONATE[m[2].toLowerCase()];
  if (!monat) return null;
  return `${m[3]}-${monat}-${tag}`;
}

// ── Token-Normalisierung («4», «16», «1a», «335bis» → Anker-Token) ───────────
const TOKEN_SUFFIX = /^(\d+)([a-z])?(bis|ter|quater|quinquies)?$/i;
/** «4»→'4', «1a»→'1_a', «335bis»→'335_bis' (kongruent parsePassus/Fedlex). */
function normalisiereToken(roh: string): string {
  return roh
    .toLowerCase()
    .replace(TOKEN_SUFFIX, (_, n, b, suf) => [n, b, suf].filter(Boolean).join('_'));
}

/** Token → lesbare Nummer (Umkehrung von normalisiereToken): «1_a»→«1a»,
 *  «335_bis»→«335bis», «4»→«4». Für das einheitliche Artikel-Label. */
export function tokenZuNummer(token: string): string {
  return token.replace(/_/g, '');
}

// ── quelleHash über die extrahierten Artikel (Drift-Token) ───────────────────
/** sha256 des normalisierten Volltexts ALLER extrahierten Artikel (stabil
 *  sortiert nach token; je Block absatz/text + items). Dient als fassungsToken. */
export function berechneQuelleHash(artikel: Record<string, HtmArtikel>): string {
  const teile: string[] = [];
  for (const token of Object.keys(artikel).sort()) {
    teile.push(`#${token}`);
    for (const b of artikel[token].bloecke) {
      const items = (b.items ?? []).map((i) => `${i.marke}\t${i.text}`).join('\n');
      teile.push(`${b.absatz ?? ''}\t${b.text}${items ? `\n${items}` : ''}`);
    }
  }
  return createHash('sha256').update(teile.join('\n'), 'utf8').digest('hex');
}

// ─────────────────────────────────────────────────────────────────────────────
// Reine Parser-Funktion (testbar, ohne Netz)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extrahiert EINEN Artikel (per Token) aus dem .htm-Volltext.
 * Kein Treffer → null.
 *
 * @param html   bereits in JS-String dekodiertes .htm (latin-1 → utf-16)
 * @param token  Artikel-Token (Anker-Form: '4', '16', '1_a')
 * @param profil 'ne' | 'ge'
 */
export function extrahiereHtmArtikel(
  html: string,
  token: string,
  profil: HtmProfil,
): HtmArtikel | null {
  const alle = extrahiereAlleHtmArtikel(html, profil);
  return alle.artikel[token] ?? null;
}

/** Extrahiert ALLE Artikel + Meta (titel, stand, quelleHash) aus dem .htm.
 *  Reine Funktion (kein Netz) — Kern für holeHtm und Tests. */
export function extrahiereAlleHtmArtikel(
  html: string,
  profil: HtmProfil,
): {
  meta: { titel: string; stand: string; quelleHash: string };
  artikel: Record<string, HtmArtikel>;
  labels: Record<string, string>;
} {
  let artikel: Record<string, HtmArtikel>;
  let titel: string;
  let stand: string;
  if (profil === 'ge') {
    const segmente = leseParagraphen(html);
    artikel = geExtrahiere(segmente);
    titel = geTitel(segmente);
    stand = geStand(html);
    // GE: Tarif-Tabellen als gepaarte Band↔Wert-items an die Einleitungsabsätze.
    geHängeTabellen(segmente, html, artikel);
  } else if (profil === 'ti') {
    artikel = tiExtrahiere(html);
    titel = tiTitel(html);
    stand = leseTiStand(html);
  } else {
    const segmente = leseParagraphen(html);
    artikel = neExtrahiere(segmente);
    titel = neTitel(segmente);
    stand = neStand(html);
    // NE: Gebührenstaffel-Tabellen an die Einleitungsabsätze hängen.
    for (const token of Object.keys(artikel)) {
      neHängeTabellen(html, token, artikel[token]);
    }
  }
  const quelleHash = berechneQuelleHash(artikel);
  // Einheitliches Label: NE/GE «Art.»-Erlasse (französisch), TI «Art.»-Erlass
  // (italienisch) → «Art. N».
  const labels: Record<string, string> = {};
  for (const token of Object.keys(artikel)) {
    labels[token] = `Art. ${tokenZuNummer(token)}`;
  }
  return { meta: { titel, stand, quelleHash }, artikel, labels };
}

// ─────────────────────────────────────────────────────────────────────────────
// Netz-Hülle
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Holt eine HTM/HTML-Quelle (NE/GE latin-1, TI utf-8), extrahiert ALLE Artikel
 * und gibt sie samt einheitlichen Labels zurück (Vollabdeckung §7). meta trägt
 * titel/stand/quelleHash; der quelleHash deckt den GANZEN extrahierten Volltext ab.
 */
export async function holeHtm(
  url: string,
  profil: HtmProfil,
): Promise<HtmErgebnis> {
  // TI: …/pdfatto/atto/{N} (PDF-Zitat) → HTML-Seite …/legge/num/{N} ableiten.
  // NE/GE: die quelleUrl IST schon die .htm-Adresse.
  const fetchUrl = profil === 'ti' ? tiHtmlUrlAusQuelle(url) : url;
  const res = await fetch(fetchUrl);
  if (!res.ok) {
    throw new Error(`HTM ${fetchUrl}: HTTP ${res.status}`);
  }
  const buf = new Uint8Array(await res.arrayBuffer());
  // TI ist utf-8 (server-gerendert), NE/GE sind windows-1252/latin-1 (Word-Export).
  const html =
    profil === 'ti' ? new TextDecoder('utf-8').decode(buf) : dekodiereLatin1(buf);
  // Vollabdeckung (§7): ALLE extrahierten Artikel zurückgeben, nicht nur die
  // zitierten. Der quelleHash deckt ohnehin den Gesamttext ab.
  const { meta, artikel, labels } = extrahiereAlleHtmArtikel(html, profil);
  return { meta, artikel, labels };
}
