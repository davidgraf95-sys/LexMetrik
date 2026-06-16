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
 * Mehrsprachigkeit: die Erlasse sind französisch — Texte werden so übernommen.
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

export type HtmProfil = 'ne' | 'ge';

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
): { meta: { titel: string; stand: string; quelleHash: string }; artikel: Record<string, HtmArtikel> } {
  const segmente = leseParagraphen(html);
  let artikel: Record<string, HtmArtikel>;
  let titel: string;
  let stand: string;
  if (profil === 'ge') {
    artikel = geExtrahiere(segmente);
    titel = geTitel(segmente);
    stand = geStand(html);
    // GE: Tarif-Tabellen als gepaarte Band↔Wert-items an die Einleitungsabsätze.
    geHängeTabellen(segmente, html, artikel);
  } else {
    artikel = neExtrahiere(segmente);
    titel = neTitel(segmente);
    stand = neStand(html);
    // NE: Gebührenstaffel-Tabellen an die Einleitungsabsätze hängen.
    for (const token of Object.keys(artikel)) {
      neHängeTabellen(html, token, artikel[token]);
    }
  }
  const quelleHash = berechneQuelleHash(artikel);
  return { meta: { titel, stand, quelleHash }, artikel };
}

// ─────────────────────────────────────────────────────────────────────────────
// Netz-Hülle
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Holt eine .htm-Quelle, dekodiert latin-1, extrahiert ALLE Artikel und gibt
 * die angeforderten Tokens zurück. meta trägt titel/stand/quelleHash.
 *
 * `tokens` filtert die Rückgabe (nur die zitierten Artikel ins Snapshot); der
 * quelleHash deckt aber den GANZEN extrahierten Volltext ab (stabiler Drift-
 * Token, unabhängig davon, welche Tokens gerade zitiert sind).
 */
export async function holeHtm(
  url: string,
  profil: HtmProfil,
  tokens: string[],
): Promise<HtmErgebnis> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTM ${url}: HTTP ${res.status}`);
  }
  const buf = new Uint8Array(await res.arrayBuffer());
  const html = dekodiereLatin1(buf);
  const { meta, artikel } = extrahiereAlleHtmArtikel(html, profil);

  // Nur die zitierten Tokens zurückgeben (kleinere Snapshots), aber quelleHash
  // bleibt über den Gesamttext.
  const gefiltert: Record<string, HtmArtikel> = {};
  for (const t of tokens) {
    if (t in artikel) gefiltert[t] = artikel[t];
  }
  return { meta, artikel: gefiltert };
}
