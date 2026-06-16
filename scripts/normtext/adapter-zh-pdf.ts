/**
 * ZH-PDF-Adapter — Norm-Volltext aus den Text-PDF der Zürcher
 * Gesetzessammlung (zhlex), für die Norm-Vorschau-Popover. Browserlos:
 * fetch + pdfjs-Text-Extraktion zur BUILD-ZEIT (kein Headless-Browser).
 *
 * Mechanik (empirisch verifiziert §7, Spike 16.6.2026):
 *
 * 1. Registry-Seite zh.ch/.../zhlex-ls/erlass-…html verlinkt die PDF über
 *    einen OpenAttachment-Link auf notes.zh.ch:
 *      <a … href="https://www.notes.zh.ch/appl/zhlex_r.nsf/OpenAttachment?Open
 *         &docid=<ID>&file=<datei>.pdf">
 * 2. Dieser OpenAttachment-Link liefert KEIN PDF, sondern einen ~153-Byte-
 *    HTML-JS-Redirect:
 *      <script>window.location="/appl/zhlex_r.nsf/WebView/<ID>/$File/<datei>.pdf"</script>
 *    Dem window.location (relativ zu notes.zh.ch) folgen → echtes Text-PDF
 *    (Acrobat Distiller, application/pdf).
 * 3. Das PDF ist ein Text-PDF (kein Scan). §-Marker im extrahierten Text:
 *    «§ N.» (mit Punkt). Absätze als hochgestellte Ziffern (1, 2, 3);
 *    lit.-Punkte «a.»/«b.»; eingebettete Gebühren-Tabellen (Streitwert/Gebühr).
 *
 * PDF-Layout (Spiegelrand-Buch, §7):
 *   - Body-Spalte wechselt je Seitenparität (ungerade x∈[54,329], gerade
 *     x∈[88,363]). Body-Schrift h≈9.2pt.
 *   - Marginalie (Sachtitel/Randnote) steht im AUSSEN-Rand: gerade Seiten
 *     links (x≈28), ungerade Seiten rechts (x≈337), Schrift h≈7.5pt → wird
 *     als redaktionell verworfen (NICHT Normtext).
 *   - ACHTUNG: Gebühren-TABELLEN haben dieselbe Schrifthöhe (7.5pt) wie die
 *     Marginalie — sie liegen aber in der Body-Spalte und werden darum über
 *     die x-Position (innerhalb der Body-Spalte) als Inhalt behalten.
 *   - Absatz-/Fussnoten-Hochstellung h≈5.7pt: eine führende Ziffer am
 *     Zeilenanfang = Absatznummer; eine Ziffer mitten/am Ende eines Worts =
 *     Fussnoten-Verweis → verworfen.
 *   - Kopf-/Fusszeilen-Bänder (y>520 oben, y<60 unten): Erlasstitel + LS-Nr.,
 *     «1. 1. 15 - 87», Seitenzahlen → verworfen.
 *   - Silbentrennung am Zeilenende («Gebüh-\nren» → «Gebühren»): zusammengefügt.
 *
 * Drift-Token (§7 d): es gibt kein version_uid. quelleHash = sha256 der
 * normalisierten extrahierten PDF-Textbasis (alle Artikel + items, stabil
 * sortiert) dient als fassungsToken; `stand` aus dem PDF-Kopf-Marker
 * («1. 1. 15 - 87» → In-Kraft 1.1.2015) bzw. Registry. Re-fetch +
 * quelleHash-Vergleich erkennt jede inhaltliche Änderung der Quelle.
 *
 * §2: rein/deterministisch (kein Date.now/Math.random). Die reine Parser-
 * Funktion extrahiereZhParagraphen() arbeitet ohne Netz/FS (testbar gegen
 * eine Fixture echten extrahierten ZH-Texts); holeZhPdf() ist die Netz-Hülle.
 */

import { createHash } from 'node:crypto';

// ─────────────────────────────────────────────────────────────────────────────
// Typen
// ─────────────────────────────────────────────────────────────────────────────

export interface ZhBlock {
  absatz: string | null;
  text: string;
  items?: Array<{ marke: string; text: string }>;
}

export interface ZhArtikel {
  bloecke: ZhBlock[];
}

export interface ZhErgebnis {
  meta: {
    titel: string;
    stand: string;
    quelleHash: string;
  };
  artikel: Record<string, ZhArtikel>; // token → Artikel
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF-Text-Extraktion (pdfjs, BUILD-time, NUR in scripts/)
// ─────────────────────────────────────────────────────────────────────────────

/** Ein extrahiertes Text-Fragment mit Koordinaten (für die Layout-Analyse). */
interface PdfStueck {
  x: number;
  y: number;
  h: number;
  s: string;
}

/** Eine zusammengefügte Textzeile (eine y-Position einer Seite). */
export interface ZhTextZeile {
  /** Führende Absatznummer (hochgestellte Ziffer am Zeilenanfang) oder null. */
  absatz: string | null;
  /** Der bereinigte Zeilentext (Fussnoten-Hochzahlen entfernt). */
  text: string;
}

/** Ergebnis der PDF-Layout-Extraktion: Body-Zeilen + der verworfene Kopf-/
 *  Fussband-Text (für die Stand-Erkennung «1. 1. 15 - 87»). */
export interface ZhExtrakt {
  zeilen: ZhTextZeile[];
  /** Roh-Text aus den Kopf-/Fussbändern (y>520 / y<60), zeilenfrei verkettet. */
  randText: string;
}

/**
 * Extrahiert die strukturierten Body-Textzeilen aus den PDF-Bytes (pdfjs).
 * Verwirft Marginalie (Sachtitel im Aussenrand), Kopf-/Fusszeilen-Bänder und
 * Fussnoten-Hochzahlen; erkennt Absatz-Hochzahlen am Zeilenanfang.
 *
 * Reine Layout-Logik bis auf den pdfjs-Aufruf; die Textzeilen werden danach
 * von extrahiereZhParagraphen() in §-Artikel zerlegt (testbar via serialisiere…).
 */
export async function extrahiereZhTextZeilen(
  bytes: Uint8Array,
): Promise<ZhExtrakt> {
  // pdfjs legacy/node-Build: NUR hier (scripts/) importiert — kein src/-Import,
  // damit der Client-Bundle unberührt bleibt.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: bytes, useSystemFonts: true })
    .promise;

  const zeilen: ZhTextZeile[] = [];
  const randStuecke: string[] = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const seite = await doc.getPage(p);
    const inhalt = await seite.getTextContent();

    // Roh-Stücke mit Koordinaten sammeln (Kopf-/Fussband y>520 / y<60 raus,
    // aber den Rand-Text für die Stand-Erkennung separat sammeln).
    const stuecke: PdfStueck[] = [];
    for (const it of inhalt.items) {
      const item = it as { str: string; transform: number[]; height?: number };
      if (!item.str || !item.str.replace(/\s/g, '')) continue;
      const x = item.transform[4];
      const y = item.transform[5];
      const h = item.height ?? 9;
      // Kopf-/Fussband: laufender Erlasstitel + LS-Nr. liegen bei y≈539 (oben)
      // bzw. y≈51 (unten, «1. 1. 15 - 87» + Seitenzahl). Der oberste Body-
      // Absatz-Hochzahl-Marker kann bis y≈521 reichen — darum y>530 als
      // Kopf-Schwelle (nicht 520), sonst geht die Absatznummer der ersten
      // Body-Zeile verloren.
      if (y < 60 || y > 530) {
        randStuecke.push(item.str);
        continue; // Kopf-/Fussband
      }
      if (h >= 11) continue; // Erlasstitel (Kopf)
      stuecke.push({ x, y, h, s: item.str });
    }
    if (stuecke.length === 0) continue;

    // Body-Spalte dieser Seite aus den Body-Stücken (h≈9.2) bestimmen.
    const bodyXs = stuecke.filter((s) => s.h >= 8.7).map((s) => s.x);
    if (bodyXs.length === 0) continue;
    const bodyMinX = Math.min(...bodyXs);
    // Body-Textblock ist ~242pt breit; Marginalie liegt im Aussenrand:
    //   links  (gerade Seiten): x < bodyMinX − 3
    //   rechts (ungerade Seiten): x > bodyMinX + 250
    // Gebühren-Tabellen (gleiche Schrifthöhe wie Marginalie!) liegen IN der
    // Body-Spalte und bleiben darum erhalten.
    const istMarginalie = (st: PdfStueck): boolean =>
      st.h <= 7.7 && (st.x < bodyMinX - 3 || st.x > bodyMinX + 250);

    // Nach y gruppieren (eine Textzeile). y auf ganze Punkte runden.
    const nachY = new Map<number, PdfStueck[]>();
    for (const st of stuecke) {
      if (istMarginalie(st)) continue;
      const key = Math.round(st.y);
      let liste = nachY.get(key);
      if (!liste) {
        liste = [];
        nachY.set(key, liste);
      }
      liste.push(st);
    }

    // Zeilen von oben nach unten (y absteigend), je Zeile nach x sortiert.
    const yKeys = [...nachY.keys()].sort((a, b) => b - a);
    for (const yKey of yKeys) {
      const stueckeDerZeile = nachY.get(yKey)!.sort((a, b) => a.x - b.x);

      let absatz: string | null = null;
      let text = '';
      for (let k = 0; k < stueckeDerZeile.length; k++) {
        const st = stueckeDerZeile[k];
        const istHoch = st.h < 7.0;
        if (istHoch) {
          // Führende Hochzahl am Zeilenanfang = Absatznummer.
          if (k === 0 && /^\s*\d+\s*$/.test(st.s)) {
            absatz = st.s.trim();
            continue;
          }
          // Sonstige Hochzahl (Fussnoten-Verweis, auch «1, 2») → verwerfen.
          if (/^[\s,\d]+$/.test(st.s)) continue;
        }
        text += st.s;
      }
      const bereinigt = text.replace(/\s+/g, ' ').trim();
      // Reine Leer-/Absatz-Marker-Zeile: trotzdem behalten, falls Absatz gesetzt
      // (die Absatznummer steht oft auf eigener y-Zeile vor dem Text).
      if (bereinigt === '' && absatz === null) continue;
      zeilen.push({ absatz, text: bereinigt });
    }
  }

  return { zeilen, randText: randStuecke.join(' ') };
}

/**
 * Serialisiert Body-Textzeilen in einen einzigen, zeilengetrennten Text mit
 * eingebetteten Absatz-Markern «¶N» am Zeilenanfang. Diese Form ist die
 * testbare «extrahierte PDF-Textbasis», die extrahiereZhParagraphen() parst —
 * so kann der Parser ohne pdfjs/Netz gegen eine Fixture getestet werden.
 */
export function serialisiereZhZeilen(zeilen: ZhTextZeile[]): string {
  return zeilen
    .map((z) => (z.absatz !== null ? `¶${z.absatz} ${z.text}` : z.text))
    .join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Reiner Parser: extrahierte Textbasis → §-Artikel
// ─────────────────────────────────────────────────────────────────────────────

/** §-Kopf am Zeilenanfang: «§ 4.» / «§ 4a.» / «§ 12.» (mit Punkt). Der Marker
 *  kann an einem Marginalie-Rest kleben — wir suchen ihn an beliebiger Stelle,
 *  akzeptieren aber als Artikelgrenze nur, wenn er den Zeilenanfang dominiert. */
const PARAGRAF_KOPF = /§\s*(\d+[a-z]?(?:bis|ter|quater|quinquies)?)\s*\./;

/** lit.-Marke am Zeilenanfang: «a. …» / «a.…» (ZH nutzt lit. mit Punkt; in der
 *  PDF-Extraktion steht oft KEIN Leerzeichen zwischen «a.» und dem Punkttext,
 *  weil der Punkt-Buchstabe und der Text getrennte Fragmente am gleichen y sind).
 *  EIN Kleinbuchstabe + Punkt am Zeilenanfang (lit.-Punkte stehen in der PDF auf
 *  EIGENER Zeile). Der Folgetext beginnt teils klein («a.im Zivilprozess»). */
const LIT_MARKE = /^([a-z])\.\s*(\S.*)$/;

/** Gliederungs-/Abschnitts-Überschrift (NICHT Normtext): «A. Allgemein»,
 *  «B. Schlichtungsverfahren», «C. Zivilprozess» — Grossbuchstabe + Punkt +
 *  Titel, ohne § und ohne Absatztext. Wird zwischen Artikeln verworfen. */
const GLIEDERUNG = /^[A-Z]\.\s+[A-ZÄÖÜ]/;

/** Absatz-Marker «¶N» am Zeilenanfang (von serialisiereZhZeilen gesetzt; der
 *  Resttext ist optional — die Absatznummer steht oft auf der eigenen Zeile). */
const ABSATZ_MARKER = /^¶(\d+(?:bis|ter)?)\s*(.*)$/;

const TOKEN_SUFFIX = /^(\d+)([a-z])?(bis|ter|quater|quinquies)?$/i;
/** «4»→'4', «4a»→'4_a', «12»→'12' (kongruent parsePassus/HTM-Adapter). */
function normalisiereToken(roh: string): string {
  return roh
    .toLowerCase()
    .replace(TOKEN_SUFFIX, (_, n, b, suf) =>
      [n, b, suf].filter(Boolean).join('_'),
    );
}

/**
 * Entkleben der ZH-Gebührentabellen-Fragmente (Bug-Fix 16.6.2026). In der PDF-
 * Extraktion stehen die Tabellenspalten (Streitwert | Grundgebühr) als getrennte
 * Fragmente am gleichen y und werden ohne Leerzeichen aneinandergeklebt
 * («bis1000 25%des», «zuzügl.20%des», «Fr.1000übersteigenden»). Wir trennen NUR
 * an eindeutigen Tarif-Tabellen-Grenzen, die in korrekter ZH-Rechtsprosa NICHT
 * vorkommen (empirisch geprüft an allen ZH-Snapshots, §7) — sonst unverändert:
 *   - Schlüsselwort «bis/über/dès» direkt vor Ziffer:  «bis1000»  → «bis 1000»
 *   - Ziffer direkt vor «bis/über/dès»:                «1000über» → «1000 über»
 *   - «Fr.»/«Mio.» direkt vor Ziffer:                  «Fr.1000»  → «Fr. 1000»
 *   - «zuzügl.» vor Ziffer:                            «zuzügl.20»→ «zuzügl. 20»
 *   - «%» direkt vor Buchstabe:                        «20%des»   → «20% des»
 *   - «)(» (zwei Spaltenköpfe):                        «)(in»     → «) (in»
 *   - camelCase-Spaltenkopf «StreitwertGebühr/Grund…»: Kleinbuchst.→Grossbuchst.
 * Die reinen Spalten-Zahlenketten (z.B. «5000250») bleiben unangetastet — ihre
 * Spaltentrennung ist ohne Layout-Information nicht eindeutig rekonstruierbar.
 */
function entglueZhTarif(text: string): string {
  // Hinweis: \b ist hier untauglich — ü/ö/ä sind im JS-Standard-Regex KEINE
  // Wortzeichen, darum greift \b an «über»/«dès» nicht. Wir verankern die
  // Schlüsselwörter daher an Leerzeichen/Wortgrenze bzw. Zeilenanfang explizit.
  return text
    // Schlüsselwort (Wortanfang) direkt vor Ziffer: «bis1000»/«über1000».
    .replace(/(^|[\s(])(bis|über|dès)(\d)/gi, '$1$2 $3')
    // Ziffer direkt vor Schlüsselwort/«übersteigenden» («1000über 5000»,
    // «Fr.1000übersteigenden» → «Fr. 1000 übersteigenden»). In den ZH-Tarifen
    // sind die EINZIGEN Ziffer→Buchstabe-Klebungen genau diese Fälle (§7-Scan),
    // darum hier gezielt ohne generelle Ziffer↔Buchstabe-Trennung.
    .replace(/(\d)(bis|über)/gi, '$1 $2')
    .replace(/\b(Fr|Mio|zuzügl)\.(\d)/g, '$1. $2')
    .replace(/(%)([A-Za-zÄÖÜäöü])/g, '$1 $2')
    .replace(/\)\(/g, ') (')
    .replace(/([a-zäöü])([A-ZÄÖÜ])/g, '$1 $2');
}

/** Silbentrennung am Zeilenende zusammenfügen: «…wer-» + «den.» → «…werden.».
 *  Nur wenn die Zeile auf «-» endet und die nächste mit Kleinbuchstabe beginnt
 *  (echte Worttrennung; ein «-» vor Grossbuchstabe/Ziffer bleibt erhalten). */
function fuegeZeilen(roh: string[]): string {
  let out = '';
  for (let i = 0; i < roh.length; i++) {
    const zeile = roh[i];
    const naechste = roh[i + 1] ?? '';
    if (/[a-zäöüé]-$/.test(zeile) && /^[a-zäöüé]/.test(naechste)) {
      // Trennstrich entfernen, nächste Zeile direkt anhängen (ohne Leerzeichen).
      out += zeile.slice(0, -1);
    } else {
      out += zeile + (i < roh.length - 1 ? ' ' : '');
    }
  }
  return entglueZhTarif(out.replace(/\s+/g, ' ').trim());
}

/** Block-Sammler: Absätze + lit.-items eines Artikels aus seinen Zeilen. */
function baueBloecke(zeilen: string[]): ZhBlock[] {
  const bloecke: ZhBlock[] = [];
  let aktiv: ZhBlock | null = null;
  // Puffer für Fortsetzungs-Zeilen (zur Silbentrennung pro logischem Stück).
  let textPuffer: string[] = [];
  let itemPuffer: string[] = [];
  let aktivItem: { marke: string } | null = null;

  const flushText = (): void => {
    if (textPuffer.length > 0 && aktiv) {
      const t = fuegeZeilen(textPuffer);
      aktiv.text = aktiv.text ? `${aktiv.text} ${t}` : t;
    }
    textPuffer = [];
  };
  const flushItem = (): void => {
    if (aktivItem && aktiv) {
      const t = fuegeZeilen(itemPuffer);
      (aktiv.items ??= []).push({ marke: aktivItem.marke, text: t });
    }
    itemPuffer = [];
    aktivItem = null;
  };
  const neuerBlock = (absatz: string | null): void => {
    flushText();
    flushItem();
    aktiv = { absatz, text: '' };
    bloecke.push(aktiv);
  };

  for (const zeile of zeilen) {
    const absM = zeile.match(ABSATZ_MARKER);
    if (absM) {
      // Neuer Absatz. Sein Resttext startet den Block.
      neuerBlock(absM[1]);
      const rest = absM[2].trim();
      if (rest) textPuffer.push(rest);
      continue;
    }

    const litM = zeile.match(LIT_MARKE);
    if (litM) {
      flushText();
      flushItem();
      if (!aktiv) neuerBlock(null);
      aktivItem = { marke: litM[1].toLowerCase() };
      itemPuffer = [litM[2].trim()];
      continue;
    }

    // Fortsetzungszeile.
    if (aktivItem) {
      itemPuffer.push(zeile);
    } else {
      if (!aktiv) neuerBlock(null);
      textPuffer.push(zeile);
    }
  }
  flushText();
  flushItem();

  // Leere Blöcke (nur Marker ohne Text/items) verwerfen.
  return bloecke.filter((b) => b.text !== '' || (b.items && b.items.length > 0));
}

/**
 * Reiner Parser: zerlegt die serialisierte PDF-Textbasis in §-Artikel.
 * §-Erkennung: «§ N.» als Artikelgrenze; folgende Zeilen (mit ¶-Absatzmarkern
 * und lit.-Punkten) gehören zum Artikel bis zum nächsten «§ N.».
 *
 * Liefert NUR den angeforderten token-Artikel ({bloecke}) oder null.
 */
export function extrahiereZhParagraphen(
  text: string,
  token: string,
): ZhArtikel | null {
  const alle = extrahiereAlleZhParagraphen(text);
  return alle[token] ?? null;
}

/** Wie extrahiereZhParagraphen, aber ALLE Artikel (token → Artikel). Kern für
 *  holeZhPdf (Vollabdeckung §7) und den quelleHash. */
export function extrahiereAlleZhParagraphen(
  text: string,
): Record<string, ZhArtikel> {
  const zeilen = text.split('\n');
  const artikel: Record<string, ZhArtikel> = {};

  let aktivToken: string | null = null;
  let aktivZeilen: string[] = [];

  const speichere = (): void => {
    if (aktivToken === null) return;
    const bloecke = baueBloecke(aktivZeilen);
    if (bloecke.length > 0 && !(aktivToken in artikel)) {
      artikel[aktivToken] = { bloecke };
    }
  };

  for (const rohZeile of zeilen) {
    const zeile = rohZeile.replace(/\s+$/g, '');
    // §-Kopf? (kann an Marginalie-Rest kleben; wir prüfen auf den Marker.)
    const kopf = zeile.match(PARAGRAF_KOPF);
    if (kopf) {
      // Alles vor dem § ist Marginalie-Rest/Müll → verwerfen; alles nach «§ N.»
      // ist der Beginn des ersten Absatzes.
      speichere();
      aktivToken = normalisiereToken(kopf[1]);
      aktivZeilen = [];
      const nachKopf = zeile.slice(zeile.indexOf(kopf[0]) + kopf[0].length).trim();
      // Der erste Absatz hat oft keine ¶-Nummer (impliziter Absatz 1) ODER die
      // ¶1-Marke steht auf der eigenen Folgezeile. Den Resttext als erste Zeile
      // ohne Marker aufnehmen.
      if (nachKopf) aktivZeilen.push(nachKopf);
      continue;
    }
    if (aktivToken === null) continue; // vor dem ersten §: Präambel → ignorieren
    // Gliederungs-Überschriften («B. Schlichtungsverfahren») sind kein Normtext.
    if (GLIEDERUNG.test(zeile.trim())) continue;
    aktivZeilen.push(zeile.trim());
  }
  speichere();

  return artikel;
}

// ─────────────────────────────────────────────────────────────────────────────
// quelleHash (Drift-Token)
// ─────────────────────────────────────────────────────────────────────────────

/** sha256 des normalisierten Volltexts ALLER extrahierten Artikel (stabil
 *  sortiert nach token). Dient als fassungsToken (§7 d). */
export function berechneZhQuelleHash(
  artikel: Record<string, ZhArtikel>,
): string {
  const teile: string[] = [];
  for (const token of Object.keys(artikel).sort()) {
    teile.push(`#${token}`);
    for (const b of artikel[token].bloecke) {
      const items = (b.items ?? [])
        .map((i) => `${i.marke}\t${i.text}`)
        .join('\n');
      teile.push(`${b.absatz ?? ''}\t${b.text}${items ? `\n${items}` : ''}`);
    }
  }
  return createHash('sha256').update(teile.join('\n'), 'utf8').digest('hex');
}

// ─────────────────────────────────────────────────────────────────────────────
// Stand aus dem PDF-Kopf-Marker
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Liest das In-Kraft-Datum aus dem PDF-Kopf-Marker «1. 1. 15 - 87»
 * (= 1.1.2015, Nachtrag 87) → ISO «2015-01-01». Der Marker steht im Fussband
 * jeder Seite; wir bekommen ihn separat (er wird beim Zeilen-Extrakt verworfen)
 * und parsen ihn aus dem Roh-Text. Liefert '' wenn nicht gefunden.
 */
export function leseZhStand(kopfText: string): string {
  // Form «D. M. YY - NN» (Tag. Monat. zweistelliges Jahr - Nachtrag).
  const m = kopfText.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{2})\s*-\s*\d+/);
  if (!m) return '';
  const tag = m[1].padStart(2, '0');
  const monat = m[2].padStart(2, '0');
  // Zweistelliges Jahr → 20YY (ZH-Erlasse alle nach 2000).
  const jahr = `20${m[3]}`;
  return `${jahr}-${monat}-${tag}`;
}

/**
 * Liest das In-Kraft-Datum aus dem zhlex-Registry-URL-Slug. Die Registry-URL
 * trägt zwei Datum-Tripel: das ERSTE ist das Beschluss-/Erlassdatum, das ZWEITE
 * das Inkrafttreten. Beispiel:
 *   …/erlass-211_11-2010_09_08-2011_01_01-087.html
 *                    ^Beschluss   ^Inkraft (= stand)
 * → ISO «2011-01-01». Das ist das massgebliche In-Kraft-Datum (§7/§8), NICHT der
 * Loseblatt-Nachtrag-Druckstand «1. 1. 15 - 87» aus dem PDF-Fussband (leseZhStand,
 * nur noch Fallback). Liefert '' wenn das Muster nicht matcht (defensiv).
 */
export function leseZhStandAusUrl(registryUrl: string): string {
  const m = registryUrl.match(
    /erlass-[^-]+-\d{4}_\d{2}_\d{2}-(\d{4})_(\d{2})_(\d{2})-/,
  );
  if (!m) return '';
  return `${m[1]}-${m[2]}-${m[3]}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Netz-Hülle: Registry-HTML → Redirect → PDF → Extraktion
// ─────────────────────────────────────────────────────────────────────────────

const UA = 'Mozilla/5.0 (LexMetrik Normtext-Snapshot)';

/** Extrahiert die OpenAttachment-PDF-URL aus dem Registry-HTML (notes.zh.ch). */
export function leseAttachmentUrl(registryHtml: string): string | null {
  const m = registryHtml.match(
    /href="(https?:\/\/[^"]*notes\.zh\.ch[^"]*OpenAttachment[^"]*)"/i,
  );
  return m ? m[1].replace(/&amp;/g, '&') : null;
}

/** Löst den 153-Byte-JS-Redirect (window.location="…") gegen die notes.zh.ch-
 *  Basis auf → absolute PDF-URL. Liefert null, wenn kein window.location. */
export function loeseRedirect(redirectHtml: string, basisUrl: string): string | null {
  const m = redirectHtml.match(/window\.location\s*=\s*["']([^"']+)["']/i);
  if (!m) return null;
  return new URL(m[1], basisUrl).toString();
}

/**
 * Holt einen ZH-Erlass als Volltext: Registry-HTML → OpenAttachment → JS-
 * Redirect → PDF-Bytes → pdfjs-Extraktion → §-Parser. meta trägt
 * titel/stand/quelleHash; `tokens` filtert die Rückgabe (nur zitierte Artikel),
 * der quelleHash deckt aber den GANZEN extrahierten Volltext ab.
 */
export async function holeZhPdf(
  registryUrl: string,
  tokens: string[],
): Promise<ZhErgebnis> {
  // 1. Registry-HTML.
  const regRes = await fetch(registryUrl, { headers: { 'User-Agent': UA } });
  if (!regRes.ok) throw new Error(`ZH-Registry ${registryUrl}: HTTP ${regRes.status}`);
  const regHtml = await regRes.text();

  const attachUrl = leseAttachmentUrl(regHtml);
  if (!attachUrl) {
    throw new Error(`ZH ${registryUrl}: kein OpenAttachment-Link gefunden`);
  }

  // 2. OpenAttachment → JS-Redirect.
  const redirRes = await fetch(attachUrl, { headers: { 'User-Agent': UA } });
  if (!redirRes.ok) throw new Error(`ZH-Attachment ${attachUrl}: HTTP ${redirRes.status}`);
  const redirHtml = await redirRes.text();
  const pdfUrl = loeseRedirect(redirHtml, attachUrl);
  if (!pdfUrl) {
    throw new Error(`ZH ${attachUrl}: kein window.location-Redirect gefunden`);
  }

  // 3. PDF-Bytes.
  const pdfRes = await fetch(pdfUrl, { headers: { 'User-Agent': UA } });
  if (!pdfRes.ok) throw new Error(`ZH-PDF ${pdfUrl}: HTTP ${pdfRes.status}`);
  const ct = pdfRes.headers.get('content-type') ?? '';
  const bytes = new Uint8Array(await pdfRes.arrayBuffer());
  if (!ct.includes('pdf') && !(bytes[0] === 0x25 && bytes[1] === 0x50)) {
    throw new Error(`ZH-PDF ${pdfUrl}: keine PDF-Antwort (content-type ${ct})`);
  }

  // 4. Extraktion + Parsing.
  const { zeilen, randText } = await extrahiereZhTextZeilen(bytes);
  const textbasis = serialisiereZhZeilen(zeilen);
  const artikel = extrahiereAlleZhParagraphen(textbasis);

  // Stand = In-Kraft-Datum aus dem Registry-URL-Slug (zweites Datum-Tripel, §7/§8).
  // Der PDF-Fussband-Marker «1. 1. 15 - 87» ist der Loseblatt-Nachtrag-Druckstand,
  // NICHT das Inkrafttreten → nur noch Fallback.
  const stand =
    leseZhStandAusUrl(registryUrl) ||
    leseZhStand(randText) ||
    leseZhStand(regHtml) ||
    '';
  // Titel: erste Body-Zeile.
  const titel = zeilen.length > 0 ? zeilen[0].text : '';

  const quelleHash = berechneZhQuelleHash(artikel);

  // Nur zitierte Tokens zurückgeben (kleinere Snapshots); quelleHash über alles.
  const gefiltert: Record<string, ZhArtikel> = {};
  for (const t of tokens) {
    if (t in artikel) gefiltert[t] = artikel[t];
  }
  return { meta: { titel, stand, quelleHash }, artikel: gefiltert };
}
