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
// (segmentiereAnhangZiffern wird für ZH NICHT mehr genutzt — der Anhang wird
//  spaltenbewusst über extrahiereZhAnhangSpalten gelesen; generischer
//  Segmentierer bleibt für SG/LU im adapter-pdf.)

// ─────────────────────────────────────────────────────────────────────────────
// Typen
// ─────────────────────────────────────────────────────────────────────────────

export interface ZhBlock {
  absatz: string | null;
  text: string;
  items?: Array<{ marke: string; text: string }>;
  /** Stufe 2: Mehrspalten-Tabelle (Streitwert/Grundgebühr/Zuschlag u.ä.). */
  mehrspaltig?: { kopf?: string[]; zeilen: string[][] };
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
  /** Einheitliches Label je token: «§ N» (ZH ist ein «§»-Erlass). */
  labels: Record<string, string>;
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
  /** Fragment-Breite (pt) — für die Spalten-Lücken-Erkennung. */
  w: number;
}

// Schwelle (pt) für eine Spaltengrenze zwischen zwei Fragmenten derselben
// Textzeile. Empirisch an ZH-Tarif-PDFs (Probe 20.6.2026): normale Marke→Text-
// Lücken liegen bei 2–15 pt, echte Tabellenspalten (Wert-/Verweis-Spalte,
// Randtitel→Body) bei ≥21 pt. 18 pt trennt beides sauber. Eingefügt wird NUR ein
// Leerzeichen an der Spaltengrenze — kein Zeichen geändert/entfernt/umgestellt
// (Wortlaut unangetastet, §1; konsistent mit entglueZhTarif).
const SPALTEN_LUECKE_PT = 18;

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
  spaltenLuecke = false,
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
      stuecke.push({ x, y, h, s: item.str, w: (item as { width?: number }).width ?? 0 });
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
      let vorEndeX: number | null = null; // rechter Rand des letzten übernommenen Fragments
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
        // Spaltengrenze: liegt das nächste Fragment deutlich rechts vom Ende des
        // vorigen (Wert-/Verweis-Spalte einer Tabelle, Randtitel→Body), fehlt das
        // Spalten-Whitespace in der PDF-Extraktion → ein Leerzeichen einfügen.
        // Nur Whitespace, kein Zeichen geändert (§1).
        if (spaltenLuecke && vorEndeX !== null && st.x - vorEndeX > SPALTEN_LUECKE_PT) {
          text += ' ';
        }
        text += st.s;
        vorEndeX = st.x + st.w;
      }
      const bereinigt = text.replace(/\s+/g, ' ').trim();
      // FUSSNOTEN-DEFINITIONEN aussondern (Bug 22.6.2026 «mis-assigned ZH
      // footnotes»): die Quellen-/Änderungs-Fussnoten am Seitenfuss («OS 64, 280»,
      // «ABl 2008, 1188», «SR 210», «LS 242», «Eingefügt durch B vom …», «Fassung
      // gemäss B vom …», «In/Kraft seit …», «Begründung siehe …») stehen in der
      // KLEINEREN Fussnoten-Schrift (h≈8.0; Body ist h≈9.18) und sind KEIN
      // Normtext. Ohne Filter hängt der §-Parser sie an den letzten § (bei ZH-243
      // § 17 = Schlussbestimmung, da KEIN § 18 folgt) → unlesbarer Blob, und bei
      // ZH-215.3 entstand daraus sogar ein Schein-«§ 25». Signatur (§1: NUR
      // Fussnoten-Definitionen, nie Body): alle Zeilen-Stücke in Fussnoten-Höhe
      // (h≤8.5) UND der Text beginnt mit einem Fussnoten-Definitions-Marker. So
      // bleiben die Tarif-/Streitwert-Tabellen (Zahlen, «Gebühr», «bis») unberührt.
      const istFussnotenSchrift =
        stueckeDerZeile.length > 0 &&
        stueckeDerZeile.every((st) => st.h <= 8.5);
      const istFussnotenDefinition =
        istFussnotenSchrift &&
        // Opener-Marker einer Fussnoten-Definition …
        (/^(?:OS \d|ABl \d|SR \d|LS \d|Eingefügt durch|Fassung gemäss|Aufgehoben durch|In Kraft seit|Kraft seit|Begründung siehe|Inkrafttreten:|\d+\. \w+ \d{4})/.test(
          bereinigt,
        ) ||
          // … oder eine Fussnoten-FORTSETZUNGSZEILE (Umbruch von «… In Kraft /
          // seit 1. Januar 2024.»): «seit …» bzw. «Kraft seit …» / reines
          // Datumsfragment «1. Januar 2017 (ABl …).». NUR in Fussnoten-Höhe
          // (h≤8.5) → Body-Sätze mit «seit» (h≈9.18) bleiben unberührt (§1).
          /^(?:seit \d|Kraft seit|\d+\. (?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember) \d{4})/.test(
            bereinigt,
          ));
      if (istFussnotenDefinition) {
        // Eine Fussnoten-Fortsetzungszeile trägt oft eine (fälschlich als Absatz
        // gelesene) führende Hochzahl (die Fussnoten-Nummer). Diese Zeile wird
        // komplett verworfen — der Absatz-Marker darf NICHT als leerer §-Block
        // überleben (sonst Schein-Absätze «¶14»/«¶15» in § 17).
        continue;
      }
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

/** Zerlegt eine Absatznummer «2» / «1bis» / «2ter» in (Zahl, lat. Suffix-Rang),
 *  damit baueBloecke die Sequenz validieren kann. Suffix-Rang: ''=0, bis=1,
 *  ter=2, quater=3, quinquies=4 (so folgt «1bis» auf «1», «1ter» auf «1bis»). */
const ABSATZ_NUMMER = /^(\d+)(bis|ter|quater|quinquies)?$/;
const SUFFIX_RANG: Record<string, number> = {
  '': 0,
  bis: 1,
  ter: 2,
  quater: 3,
  quinquies: 4,
};

/** Block-Sammler: Absätze + lit.-items eines Artikels aus seinen Zeilen.
 *
 *  Absatz-Nummerierung nach VALIDIERTER SEQUENZ (Fix 22.6.2026, Bund-Qualität):
 *  ein ¶-Marker wird nur dann als echte Absatznummer akzeptiert, wenn er die
 *  erwartete monotone Folge fortsetzt (1→2→3…, lat. Suffixe «1bis»→«1ter» am
 *  selben Grund-Index zulässig). Ein Marker, der die Folge bricht (z. B. «¶10»
 *  wo «¶1» erwartet, «¶5» wo «¶2» erwartet), ist KEINE Absatznummer, sondern ein
 *  Fussnoten-Verweis (hochgestellte Verweis-Ziffer mitten im Absatz). Er wird
 *  verworfen: ein leerer Verweis-Marker entfällt ganz, ein Marker mit Resttext
 *  (Wort-Fragment einer umbrochenen Zeile) fliesst als Fortsetzung in den
 *  laufenden Absatz — so entstehen weder leere noch Fragment-Blöcke und keine
 *  «komischen Randziffern» (§1: nur die irrtümlich als Absatz gelesene Ziffer
 *  entfernt, kein Normtext erfunden/verworfen). */
function baueBloecke(zeilen: string[]): ZhBlock[] {
  const bloecke: ZhBlock[] = [];
  let aktiv: ZhBlock | null = null;
  // Puffer für Fortsetzungs-Zeilen (zur Silbentrennung pro logischem Stück).
  let textPuffer: string[] = [];
  let itemPuffer: string[] = [];
  let aktivItem: { marke: string } | null = null;
  // Erwartete nächste Absatz-Grundzahl (für die Sequenz-Validierung). Solange
  // noch kein nummerierter Absatz akzeptiert wurde, ist die erste gültige Nummer
  // 1 (oder ein impliziter, markerloser Absatz 1). zuletztNummer/-Suffix halten
  // den zuletzt akzeptierten Absatz, um lat. Suffixe (1→1bis→1ter) zu erlauben.
  let zuletztNummer = 0;
  let zuletztSuffix = -1; // -1 = noch kein nummerierter Absatz

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
  // Accessor: liefert den laufenden Block mit seinem deklarierten Union-Typ
  // (innerhalb der Schleife verengt TS `aktiv` über die Closure-Mutationen
  // hinweg auf `null`; der Closure-Zugriff umgeht diese fehlerhafte Verengung).
  const aktuellerBlock = (): ZhBlock | null => aktiv;

  for (const zeile of zeilen) {
    const absM = zeile.match(ABSATZ_MARKER);
    if (absM) {
      const rest = absM[2].trim();
      const num = absM[1].match(ABSATZ_NUMMER);
      // Sequenz-Validierung: akzeptiere die Nummer nur, wenn sie die erwartete
      // monotone Folge fortsetzt. Gültig ist (a) die nächste Grundzahl
      // (zuletztNummer+1, Suffix-Rang 0) oder (b) eine lat. Suffix-Steigerung am
      // SELBEN Grund-Index (1→1bis→1ter). Alles andere bricht die Folge.
      let gueltig = false;
      if (num) {
        const n = Number(num[1]);
        const rang = SUFFIX_RANG[num[2] ?? ''] ?? 0;
        // Backfill «¶1»: Steht noch kein nummerierter Absatz, der erste Absatz
        // begann aber implizit (markerlos, absatz=null) mit echtem Text, und der
        // nun kommende Marker würde gültig auf eine implizite «1» folgen
        // («2» als nächste Grundzahl, oder «1bis» als Suffix der «1»), so ist der
        // erste Absatz die Nr. 1 — rückwirkend benummern (Bund-Konvention
        // 1,2,3…). So bleibt nie ein «[null,'2',…]» übrig, auch wenn die
        // «¹»-Recovery (Part A) den Erst-Marker einmal nicht greift.
        const folgtAufImplizit1 =
          (n === 2 && rang === 0) || (n === 1 && rang === 1);
        const ersterBlock = aktuellerBlock();
        if (
          zuletztSuffix === -1 &&
          folgtAufImplizit1 &&
          ersterBlock !== null &&
          ersterBlock.absatz === null &&
          (textPuffer.length > 0 ||
            ersterBlock.text !== '' ||
            (ersterBlock.items?.length ?? 0) > 0)
        ) {
          // Ersten (impliziten) Absatz als Nr. 1 setzen, dann den Marker prüfen.
          flushText();
          flushItem();
          ersterBlock.absatz = '1';
          zuletztNummer = 1;
          zuletztSuffix = 0;
        }
        if (n === zuletztNummer + 1 && rang === 0) {
          gueltig = true;
        } else if (n === zuletztNummer && rang === zuletztSuffix + 1) {
          gueltig = true;
        }
      }
      if (gueltig && num) {
        // Echter Absatz. Sein Resttext startet den Block.
        neuerBlock(absM[1]);
        zuletztNummer = Number(num[1]);
        zuletztSuffix = SUFFIX_RANG[num[2] ?? ''] ?? 0;
        if (rest) textPuffer.push(rest);
      } else {
        // Folge-brechende «Absatznummer» = Fussnoten-Verweis (keine echte
        // Absatznummer). Marker verwerfen; ein etwaiger Resttext (Wort-Fragment
        // einer umbrochenen Zeile) fliesst als Fortsetzung in den laufenden
        // Absatz/Item (§1: kein Normtext verloren, keine Geister-Blöcke).
        if (rest) {
          if (aktivItem) {
            itemPuffer.push(rest);
          } else {
            if (!aktiv) neuerBlock(null);
            textPuffer.push(rest);
          }
        }
      }
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
    // ANHANG-GRENZE (Bug 22.6.2026): der «Anhang: Gebührentarif» (ZH-243) ist
    // eine eigene Tarif-TABELLE und wird SPALTENBEWUSST über
    // extrahiereZhAnhangSpalten erfasst — NICHT vom generischen §-Parser. Da auf
    // den letzten § (§ 17, Schlussbestimmung) KEIN weiterer §-Kopf folgt, würde
    // der Parser sonst den GANZEN Anhang an § 17 hängen (3740-Zeichen-Blob).
    // Beim «Anhang»-Titel wird der laufende § abgeschlossen und die Akkumulation
    // gestoppt (Rest der Textbasis = Tabelle, gehört nicht in einen §).
    if (/^Anhang(:|\b)/.test(zeile.trim())) {
      speichere();
      aktivToken = null;
      aktivZeilen = [];
      continue;
    }
    // §-Kopf? (kann an Marginalie-Rest kleben; wir prüfen auf den Marker.)
    const kopf = zeile.match(PARAGRAF_KOPF);
    if (kopf) {
      // VERLORENE «¹»-Recovery (Bug 22.6.2026): die hochgestellte Absatznummer
      // «1» des ERSTEN Absatzes steht in den ZH-PDF auf einer EIGENEN Zeile
      // DIREKT VOR der «§ N.»-Kopfzeile (pdfjs liest sie als «¶1» kurz oberhalb
      // der Überschrift) — sie gehört also zum NEUEN §, nicht zum vorigen. Steht
      // als letzte Zeile des laufenden § ein NACKTER ¶-Marker (nur Nummer, kein
      // Text), so ist das genau dieser verirrte Erst-Absatz-Marker: aus dem
      // alten § entfernen und dem neuen § voranstellen. (Ein nackter ¶-Marker
      // kann nie das LETZTE des vorigen § sein — sein Absatztext stünde sonst
      // zwischen ihm und dem §-Kopf, nicht danach.) §1: nur Zuordnung der
      // bereits extrahierten Nummer korrigiert, kein Zeichen erfunden.
      let verirrterMarker: string | null = null;
      while (aktivZeilen.length > 0 && aktivZeilen[aktivZeilen.length - 1] === '') {
        aktivZeilen.pop();
      }
      const letzte = aktivZeilen[aktivZeilen.length - 1];
      if (letzte !== undefined) {
        const m = letzte.match(ABSATZ_MARKER);
        if (m && m[2].trim() === '') {
          verirrterMarker = `¶${m[1]}`;
          aktivZeilen.pop();
        }
      }
      // Alles vor dem § ist Marginalie-Rest/Müll → verwerfen; alles nach «§ N.»
      // ist der Beginn des ersten Absatzes.
      speichere();
      aktivToken = normalisiereToken(kopf[1]);
      aktivZeilen = [];
      // Den verirrten Erst-Absatz-Marker dem neuen § voranstellen, BEVOR der
      // Resttext der Kopfzeile als (markerlose) Folgezeile dazukommt — so wird
      // «¶1» dem ersten Absatz korrekt zugewiesen (baueBloecke nimmt den Resttext
      // als dessen Text auf).
      if (verirrterMarker !== null) aktivZeilen.push(verirrterMarker);
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
      const mTeil = b.mehrspaltig
        ? [(b.mehrspaltig.kopf ?? []).join('\t'), ...b.mehrspaltig.zeilen.map((z) => z.join('\t'))].join('\n')
        : '';
      teile.push(
        [
          `${b.absatz ?? ''}\t${b.text}${items ? `\n${items}` : ''}`,
          mTeil,
        ]
          .filter(Boolean)
          .join('\n'),
      );
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
// x-koordinatenbasierte Streitwert-Staffel-Extraktion (ZH-215.3 § 4)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extrahiert die Streitwert-Staffel-Tabelle des ZH-215.3 § 4 (AnwGebV) aus den
 * rohen PDF-Stücken {x,y,h,s,p} der § 4-Region (zwischen «§ 4.» und «§ 5.»).
 *
 * Die Tabelle hat im PDF zwei sichtbare Spaltenköpfe («Streitwert» | «Gebühr»),
 * wird aber als 3-spaltige Mehrspalten-Tabelle ausgegeben:
 *   kopf: ['Streitwert', 'Grundgebühr', 'Zuschlag']
 *
 * Trennprinzip (§1: nur aus x-Geometrie, kein Ziffern-Raten):
 *   - threshold1 = x der «Gebühr»-Kopfzeile (≈168.65 pt): trennt Streitwert | Grundgebühr.
 *   - threshold2 = threshold1 + 47 ≈ 215.6 pt: trennt Grundgebühr | Zuschlag.
 *     (Zuschlag-Stücke starten empirisch bei x ≥ 215; Grundgebühr-Stücke bei x ≤ 192.)
 *   - Kein Stück wird intern aufgespalten — «1» (x=175) und «250 zuzügl.» (x=181)
 *     kommen beide in Grundgebühr; das «zuzügl.» wird anschliessend als Keyword
 *     erkannt und an den Anfang der Zuschlag-Spalte verschoben (deterministisch,
 *     kein Ziffern-Raten).
 *
 * Guard: Falls keine Streitwert-Kopfzeile gefunden oder < 3 Datenzeilen → null.
 * Abs. 2 / Abs. 3 des § 4 (h≈9.2 Body-Text) werden NICHT als Tabellenzeilen
 * aufgenommen (Filter: nur h ≤ 7.7, da Tabellenschrift 7.5 pt).
 *
 * §1: nur x-Koordinaten als Trennkriterium; kein Math.random/Date.now (§2).
 * §3: reine Extraktion, kein UI-Code.
 */
export function extrahiereZhStreitwertStaffel(
  stuecke: Array<{ x: number; y: number; h: number; s: string; p: number }>,
): { kopf: string[]; zeilen: string[][] } | null {
  if (stuecke.length === 0) return null;

  // ── Schritt 1: Kopfzeile mit «Streitwert» suchen (Tabellenschrift h≤7.7)
  // Die Kopfzeile liegt im Körper der Tabelle (nicht in der Marginalie bei x≈28).
  // Wir filtern Marginalien-Stücke (x < 60) aus.
  const TABLE_MAX_H = 7.7; // Tabellenschrift 7.5 pt; Body-Text 9.2 pt
  const TABLE_MIN_H = 6.5; // Absatz-Hochzahlen h≈5.7 pt: NICHT Tabellenspalten
  const MARG_X_MAX = 60; // Marginalien-Stücke liegen bei x≈28

  // Alle Tabellenschrift-Stücke (h ∈ [TABLE_MIN_H, TABLE_MAX_H], nicht Marginalie)
  const tabStuecke = stuecke.filter(
    (s) => s.h >= TABLE_MIN_H && s.h <= TABLE_MAX_H && s.x > MARG_X_MAX,
  );

  if (tabStuecke.length === 0) return null;

  // ── Schritt 2: Kopfzeile identifizieren (enthält Stück «Streitwert» oder «Gebühr»)
  // Die Kopfzeile ist die erste y-Gruppe, die «Streitwert» enthält.
  // Danach folgt die Unterzeile «(in Franken) | (in Franken)» — beide ausschliessen.
  const byPY = new Map<string, Array<{ x: number; s: string }>>();
  for (const s of tabStuecke) {
    const key = `${s.p}_${Math.round(s.y)}`;
    let l = byPY.get(key);
    if (!l) {
      l = [];
      byPY.set(key, l);
    }
    l.push({ x: s.x, s: s.s });
  }

  // Zeilen (p, y-absteigend)
  const zeilen = [...byPY.entries()].sort((a, b) => {
    const [pa, ya] = a[0].split('_').map(Number);
    const [pb, yb] = b[0].split('_').map(Number);
    return pa - pb || yb - ya;
  });

  // Kopfzeile finden: erste Zeile mit Stück «Streitwert»
  let kopfIdx = -1;
  let threshold1 = 0;
  for (let i = 0; i < zeilen.length; i++) {
    const [, stueckeRow] = zeilen[i];
    const streitwertSt = stueckeRow.find((s) => s.s.trim() === 'Streitwert');
    const gebuehrSt = stueckeRow.find((s) => s.s.trim() === 'Gebühr');
    if (streitwertSt && gebuehrSt) {
      kopfIdx = i;
      threshold1 = gebuehrSt.x; // x-Position des Kopf «Gebühr» → Spaltengrenze 1|2
      break;
    }
  }

  if (kopfIdx < 0 || threshold1 === 0) return null;

  // threshold2 = Spaltengrenze Grundgebühr|Zuschlag. Zuschlag-Stücke starten empirisch
  // bei x ≈ 215 (threshold1 ≈ 168 + 47 = 215). Robuste Bestimmung: wir suchen unter
  // den Stücken in Zeilen NACH dem Kopf die erste x-Lücke > 20 pt rechts von threshold1.
  // Fallback: threshold1 + 47 (empirisch aus Fixture).
  const threshold2 = threshold1 + 47;

  // ── Schritt 3: Datenzeilen extrahieren (nach Kopf + Unterzeile, bis Body-Text)
  // Unterzeilen nach dem Kopf (z. B. «(in Franken) | (in Franken)»): überspringen.
  // Body-Text-Stücke (h ≥ 9.0) markieren das Ende der Tabelle.
  // Datenzeilen sind tabStuecke-Zeilen nach kopfIdx+1, die NICHT «(in Franken)» enthalten.
  const datenZeilen: string[][] = [];
  for (let i = kopfIdx + 1; i < zeilen.length; i++) {
    const [, stueckeRow] = zeilen[i];
    // Unterzeile «(in Franken)»: überspringen
    if (stueckeRow.some((s) => s.s.includes('(in Franken)'))) continue;
    // Leere Zeile: überspringen
    if (stueckeRow.length === 0) continue;

    // Stücke in 3 Spalten aufteilen
    const sorted = [...stueckeRow].sort((a, b) => a.x - b.x);
    const col1: string[] = [];
    const col2: string[] = [];
    const col3: string[] = [];
    for (const st of sorted) {
      if (st.x < threshold1) {
        col1.push(st.s);
      } else if (st.x < threshold2) {
        col2.push(st.s);
      } else {
        col3.push(st.s);
      }
    }

    // Spalten zusammenfügen (Leerzeichen zwischen Stücken)
    let c1 = col1.join(' ').replace(/\s+/g, ' ').trim();
    let c2 = col2.join(' ').replace(/\s+/g, ' ').trim();
    let c3 = col3.join(' ').replace(/\s+/g, ' ').trim();

    // Post-Prozess §1-sicher: Wenn col1 mit «Mio.» endet und danach noch eine
    // nackte Zifferngruppe folgt («über 10 Mio. 106»), wurde dieses Fragment
    // fälschlich der Streitwert-Spalte zugerechnet (es liegt x-technisch knapp
    // links von threshold1). Die Zifferngruppe wird an den ANFANG von col2
    // verschoben — kein Zeichen geändert/erfunden, nur ein existierendes Fragment
    // verschoben. Regex: «(… Mio.) <Ziffern>» am Ende von c1.
    const mioSplit = c1.match(/^(.*\bMio\.)\s+(\d[\d\s]*)$/);
    if (mioSplit) {
      c1 = mioSplit[1].trim();
      const wanderFragment = mioSplit[2].trim();
      c2 = c2 ? `${wanderFragment} ${c2}` : wanderFragment;
    }

    // Post-Prozess: «zuzügl.» am Ende von col2 → Anfang von col3 verschieben.
    // In der Fixture enthält «250 zuzügl.» (x=181) das Keyword; es gehört semantisch
    // zum Zuschlag. Deterministisch: nur «zuzügl.» am Ende von col2 (nach Trim).
    // Kein Ziffern-Raten — wir verschieben nur das Keyword-Token.
    if (c2.endsWith(' zuzügl.') || c2 === 'zuzügl.') {
      const stripped = c2.endsWith(' zuzügl.')
        ? c2.slice(0, -' zuzügl.'.length).trim()
        : '';
      c2 = stripped;
      c3 = c3 ? `zuzügl. ${c3}` : 'zuzügl.';
    } else if (c2.includes(' zuzügl.')) {
      // «zuzügl.» in der Mitte von col2 (sollte nicht vorkommen, defensiv)
      const idx = c2.lastIndexOf(' zuzügl.');
      const stripped = c2.slice(0, idx).trim();
      const rest = c2.slice(idx + 1).trim(); // «zuzügl. …»
      c2 = stripped;
      c3 = rest + (c3 ? ` ${c3}` : '');
    }

    // Nur Zeilen mit mindestens einem nicht-leeren Inhalt aufnehmen
    if (!c1 && !c2 && !c3) continue;

    datenZeilen.push([c1, c2, c3]);
  }

  // Guard: ≥ 3 Datenzeilen erforderlich (§1: mehrdeutige Geometrie → null)
  if (datenZeilen.length < 3) return null;

  return {
    kopf: ['Streitwert', 'Grundgebühr', 'Zuschlag'],
    zeilen: datenZeilen,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// x-koordinatenbasierte NotGebV-Anhang-Tarif-Extraktion (ZH-243 «Anhang: Gebührentarif»)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extrahiert den gesamten ZH-NotGebV-Anhang-Gebührentarif (ZH-243, «Anhang:
 * Gebührentarif (§ 1)», PDF-Seiten 5–22) x-koordinatenbasiert aus den rohen
 * PDF-Stücken {x,y,h,s,p} der Anhang-Region (alles ab dem «Anhang»-Titel).
 *
 * Spaltenmodell (empirisch verifiziert, Geometrie-Spike 22.6.2026 — §7):
 * Der Anhang ist eine 4-Spalten-Tabelle im Spiegelrand-Buch, deren x-Lage je
 * Seitenparität wechselt (Bundsteg):
 *   - UNGERADE Seiten: Ziffer x≈54 · Beschreibung x≈82 (Unter-«–» x≈91)
 *                      · Ansatz/Fr. x≈252 · «siehe Ziff.» (Verweis) x≈289–295
 *   - GERADE Seiten:   Ziffer x≈88 · Beschreibung x≈116 (Unter-«–» x≈125)
 *                      · Ansatz/Fr. x≈286 · «siehe Ziff.» (Verweis) x≈329
 * Die Schwellen werden RELATIV zur Beschreibungsspalte (descX, linkester
 * Nicht-Ziffer-Cluster der Seite) bestimmt — robust gegen den Bundsteg:
 *   descX+170 ≈ Ansatzspalte · descX+207…213 ≈ Verweisspalte.
 *
 * §1 (Wortlaut-Treue): der Ansatz (0,75‰, «mindestens 50», Rahmen «100–1500»)
 * bleibt INLINE in Lese-Reihenfolge in der Beschreibung — bei mehrzeiligen
 * hierarchischen Einträgen (Unter-«–»-Bänder) steht so jeder Betrag direkt bei
 * seinem Tatbestand (eine flache Betrags-Spalte würde Betrag und Phrase
 * trennen → unlesbar/irreführend). Nur die Verweis-Spalte («siehe Ziff.»,
 * Querverweis-Ziffern wie «2.2.1, 2.2.2,») wird separiert und als
 * «(vgl. Ziff. …)» ans Zeilenende gestellt. Silbentrennung an Zeilengrenzen
 * («Begrün-»+«dung» → «Begründung») wird zusammengefügt (ausser vor
 * Konjunktionen wie «oder/und» = echte Hängestrich-Komposita). Kein Zeichen
 * geändert/erfunden — nur Spalten getrennt, Trennstriche gefügt (§1/§3).
 *
 * Schrift-Trennung (§1): Tarif-/Tatbestand-Stücke sind h≈9.18 (Body). Die
 * Spaltenköpfe «Ansatz/Fr.»/«Grundbuchgebühren siehe Ziff.:» (h≈8.2) und die
 * Fussnoten-Definitionen (h≈8.0) werden über h ≥ 8.7 ausgeschlossen — sie
 * dürfen NIE in eine Tarif-Zelle geraten (Bug 22.6.2026: die Köpfe klebten
 * früher als «… 50 Ansatz/Fr. Beurkundungsgebühren siehe Ziff.:» in den Text).
 *
 * Rückgabe: `{ kopf, zeilen }` — eine N-Spalten-Tabelle des GANZEN Anhangs.
 * Jede Zeile = [Ziffer, Beschreibung (mit Inline-Ansätzen), «siehe Ziff.»].
 * Die hierarchischen Ziffern (2.3.3, 2.3.5.1) bleiben als Strings in Spalte 0.
 * Guard (§1): null, wenn die Geometrie keine Ziffer-Spalte hergibt (mehrdeutig
 * → kein geratenes Resultat). `holeZhPdf` zerlegt die Zeilen anschliessend in
 * die je-Ziffer-Snapshot-Einträge (Token-adressierbar für die Zitat-Auflösung).
 *
 * §2 rein/deterministisch (kein Date.now/Math.random); §3 keine UI.
 */
export function extrahiereZhNotariatsTarif(
  stuecke: Array<{ x: number; y: number; h: number; s: string; p: number }>,
): { kopf: string[]; zeilen: string[][] } | null {
  if (stuecke.length === 0) return null;

  // Nur Body-/Tarif-Schrift (h≈9.18). Köpfe (h≈8.2) + Fussnoten (h≈8.0) raus.
  const content = stuecke.filter((s) => s.h >= 8.7);
  if (content.length === 0) return null;

  // Nach (Seite, y) zu Tabellenzeilen gruppieren, von oben nach unten lesen.
  type S = { x: number; y: number; h: number; s: string; p: number };
  const byPY = new Map<string, S[]>();
  for (const s of content) {
    const key = `${s.p}_${Math.round(s.y)}`;
    let l = byPY.get(key);
    if (!l) {
      l = [];
      byPY.set(key, l);
    }
    l.push(s);
  }
  const rows = [...byPY.entries()]
    .map(([key, ss]) => {
      const [p, y] = key.split('_').map(Number);
      return { p, y, ss: ss.sort((a, b) => a.x - b.x) };
    })
    .sort((a, b) => a.p - b.p || b.y - a.y);

  // Ziffer-Token am Zeilenanfang in der Ziffer-Spalte. Zwei Formen:
  //   - hierarchisch «N.N…» (1.1.1, 2.3.3, 5.2) — Sektion A/B + 5.x;
  //   - nackt «N» / «NN» (1, 2, …, 14) — Sektions-Gruppenköpfe (1–4: «Beurkundungs-
  //     gebühren», die Halbgebühr-Regel) UND die Sektion-C-Posten (5–14: «Auszüge»,
  //     «Schriftliche Auskunft» …). Beide tragen eigenen Tarif-Wortlaut und sind je
  //     eine Tabellenzeile — nur so endet 5.2 NICHT als Riesen-Blob, der 6–14 mit-
  //     verschluckt. Die x-Lage (Ziffer-Spalte) trennt Kopf von einer nackten
  //     Betrags-Zahl (die in der Ansatz-/Body-Spalte rechts liegt).
  // Verweis-Ziffern (2.2.1 …) matchen das Muster auch, liegen aber rechts
  // (Verweisspalte) → über die x-Schwelle (descX-3) ausgeschlossen.
  const KOPF = /^(\d+(?:\.\d+)*)\s*(.*)$/; // Token (hierarchisch ODER nackt) + Resttext
  const REF = /^\d+\.\d+[\d.,\s]*$/; // reine Verweis-Ziffernkette «2.2.1, 2.2.2,»
  const KONJ = /^(oder|und|bzw|sowie|beziehungsweise)\b/i;
  // Ein Ziffer-Kopf-Stück: «N.N…» (mit/ohne Resttext) ODER nackt «N»/«NN» (1–2
  // Stellen, kein Komma/Punkt → keine Betrags-/Verweis-Zahl).
  const istZifferKopfStueck = (s: string): boolean => {
    const t = s.trim();
    return /^\d+(?:\.\d+)+(?:\s|$)/.test(t) || /^\d{1,2}(?:\s|$)/.test(t);
  };

  // Spalten-x je Seite: tokX = linkester Ziffer-Cluster; descX = linkester
  // Nicht-Ziffer-Cluster rechts davon (Beschreibungsspalte). Relativ dazu die
  // Verweisspalte (descX+195) — der Ansatz bleibt INLINE in der Beschreibung.
  const tokX = new Map<number, number>();
  for (const r of rows) {
    const f = r.ss[0];
    if (istZifferKopfStueck(f.s)) {
      const c = tokX.get(r.p);
      if (c === undefined || f.x < c) tokX.set(r.p, f.x);
    }
  }
  const descX = new Map<number, number>();
  for (const r of rows) {
    for (const s of r.ss) {
      if (s.x > (tokX.get(r.p) ?? 0) + 12) {
        const c = descX.get(r.p);
        if (c === undefined || s.x < c) descX.set(r.p, s.x);
      }
    }
  }

  type E = { token: string; lines: Array<{ main: string; ref: string }> };
  const eintraege: E[] = [];
  let cur: E | null = null;

  // Eine Tabellenzeile in (Beschreibung+Ansatz inline | Verweis) zerlegen.
  const baueZeile = (pieces: S[], dX: number): { main: string; ref: string } => {
    const bVer = dX + 195; // Schwelle Beschreibung/Ansatz (inline) → Verweisspalte
    const main = pieces
      .filter((s) => s.x < bVer)
      .map((s) => s.s)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const ref = pieces
      .filter((s) => s.x >= bVer && REF.test(s.s.trim()))
      .map((s) => s.s)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    return { main, ref };
  };

  for (const r of rows) {
    const dX = descX.get(r.p) ?? 82;
    const first = r.ss[0];
    const firstIstZiffer = first.x < dX - 3 && istZifferKopfStueck(first.s);
    if (firstIstZiffer) {
      const m = first.s.trim().match(KOPF)!;
      // Erster Treffer eines Tokens gewinnt (defensiv gegen Wiederholungen).
      if (eintraege.some((e) => e.token === m[1])) {
        cur = eintraege.find((e) => e.token === m[1])!;
        continue;
      }
      cur = { token: m[1], lines: [] };
      eintraege.push(cur);
      const ln = baueZeile(r.ss.slice(1), dX);
      const main = `${m[2] ? `${m[2]} ` : ''}${ln.main}`.replace(/\s+/g, ' ').trim();
      cur.lines.push({ main, ref: ln.ref });
      continue;
    }
    if (!cur) continue; // vor dem ersten Ziffer-Kopf (Abschnitts-Titel «A.») → ignorieren
    // Fortsetzungszeile: alles ab der Beschreibungsspalte (Abschnitts-Letter
    // «A./B./C.» und nackte Top-Level-Zahlen in der Ziffer-Spalte überspringen).
    const body = r.ss.filter((s) => s.x >= dX - 3);
    if (body.length === 0) continue;
    cur.lines.push(baueZeile(body, dX));
  }

  // Guard (§1): keine Ziffer-Einträge erkannt → mehrdeutige Geometrie → null.
  if (eintraege.length === 0) return null;

  // Zeilen je Eintrag zusammenfügen: Silbentrennung an Zeilengrenzen (nicht vor
  // Konjunktionen); Verweise gesammelt als «(vgl. Ziff. …)»-Suffix.
  const zeilen: string[][] = [];
  for (const e of eintraege) {
    let desc = '';
    for (const ln of e.lines) {
      const t = ln.main;
      if (!t) continue;
      if (/\p{L}-$/u.test(desc) && /^\p{Ll}/u.test(t) && !KONJ.test(t)) {
        desc = desc.slice(0, -1) + t;
      } else {
        desc = desc ? `${desc} ${t}` : t;
      }
    }
    desc = desc.replace(/\s+/g, ' ').trim();
    const refs = e.lines
      .map((l) => l.ref)
      .filter(Boolean)
      .join(' ')
      .replace(/[,\s]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!desc && !refs) continue;
    zeilen.push([e.token, desc, refs]);
  }

  if (zeilen.length === 0) return null;
  return { kopf: ['Ziffer', 'Beschreibung', 'siehe Ziff.'], zeilen };
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
/** Token-Präfix für die NACKTEN Anhang-Ziffern (1–14): die Sektions-Gruppenköpfe
 *  (1–4) und die Sektion-C-Posten (5–14) tragen eigenständigen Tarif-Wortlaut,
 *  ihre nackte Zahl kollidiert aber mit den §§ 1–17. Sie bekommen darum den
 *  Token «anhang_N» (im Lese-View «Anhang Ziff. N»), damit sie weder die §§
 *  überschreiben noch verloren gehen. parsePassus löst NUR mehrstufige Anhang-
 *  Ziffern («Anhang Ziff. N.N») als Token auf — die nackten Posten sind also
 *  ohnehin kein Zitatziel; «anhang_N» ist reine Sicht-/Vollabdeckungs-Adresse. */
const ANHANG_NACKT_PREFIX = 'anhang_';

/**
 * Spaltenbewusste Extraktion des ZH-NotGebV-Anhang-Tarifs (Auftrag David
 * 17.6.2026; x-Geometrie-Neufassung 22.6.2026). Liest die Anhang-Region (alles
 * ab dem «Anhang»-Titel) und delegiert an die reine, gegen die Fixture getestete
 * `extrahiereZhNotariatsTarif` (4-Spalten-x-Geometrie, §1). Jede Tarif-Zeile wird
 * zu einem je-Ziffer-Snapshot-Eintrag: hierarchische Ziffern (1.1.1, 2.3.3 …)
 * behalten ihren gepunkteten, zitat-auflösbaren Token; nackte Posten (1–14)
 * erhalten «anhang_N» (Kollisions-Schutz gegen die §§). Verweise stehen als
 * «(vgl. Ziff. …)» am Zeilenende. Kein 3740-Zeichen-Blob mehr; der frühere
 * Spaltenkopf-Leak («Ansatz/Fr. Beurkundungsgebühren siehe Ziff.:») ist über die
 * h≥8.7-Schwelle ausgeschlossen.
 */
async function extrahiereZhAnhangSpalten(
  bytes: Uint8Array,
): Promise<Record<string, ZhArtikel>> {
  const stuecke = await extrahiereZhAnhangStuecke(bytes);
  const tarif = extrahiereZhNotariatsTarif(stuecke);
  if (!tarif) return {};

  const eintraege: Record<string, ZhArtikel> = {};
  for (const [ziffer, beschreibung, verweis] of tarif.zeilen) {
    const text = beschreibung + (verweis ? ` (vgl. Ziff. ${verweis})` : '');
    if (!text) continue;
    // Nackte Top-Level-Posten (kein Punkt) → «anhang_N» (Kollisions-Schutz §§).
    const token = ziffer.includes('.') ? ziffer : `${ANHANG_NACKT_PREFIX}${ziffer}`;
    if (token in eintraege) continue; // erster Treffer gewinnt
    eintraege[token] = { bloecke: [{ absatz: null, text }] };
  }
  return eintraege;
}

/**
 * Extrahiert die rohen PDF-Stücke {x,y,h,s,p} der ZH-NotGebV-Anhang-Region
 * (alles ab der Seite mit dem «Anhang: Gebührentarif»-Titel) — Eingabe für
 * `extrahiereZhNotariatsTarif`. Vor dem Anhang-Titel (= der §§-Teil) wird NICHTS
 * aufgenommen, damit die §-Region (inkl. Fussnoten-Definitionen) nicht in die
 * Tarif-Extraktion gerät. Kopf-/Fussband (y<60 / y>530) und Erlasstitel (h≥11)
 * raus. Leeres Array, wenn kein «Anhang»-Titel gefunden (defensiv, §1).
 */
async function extrahiereZhAnhangStuecke(
  bytes: Uint8Array,
): Promise<Array<{ x: number; y: number; h: number; s: string; p: number }>> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: bytes, useSystemFonts: true }).promise;

  type S = { x: number; y: number; h: number; s: string; p: number };
  const alle: S[] = [];
  // Anhang-Startseite: die Seite mit dem Titel «Anhang: Gebührentarif» (h≈10.7).
  let anhangSeite = Number.MAX_SAFE_INTEGER;
  const seiten: S[][] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const inhalt = await (await doc.getPage(p)).getTextContent();
    const stueckeSeite: S[] = [];
    for (const it of inhalt.items) {
      const item = it as { str: string; transform: number[]; height?: number };
      if (!item.str || !item.str.replace(/\s/g, '')) continue;
      const y = item.transform[5];
      if (y < 60 || y > 530) continue; // Kopf-/Fussband
      const h = item.height ?? 9;
      if (h >= 11) continue; // Erlasstitel
      if (/^Anhang(:|\b)/.test(item.str.trim()) && anhangSeite === Number.MAX_SAFE_INTEGER) {
        anhangSeite = p;
      }
      stueckeSeite.push({ x: item.transform[4], y, h, s: item.str, p });
    }
    seiten[p] = stueckeSeite;
  }
  if (anhangSeite === Number.MAX_SAFE_INTEGER) return [];
  for (let p = anhangSeite; p < seiten.length; p++) {
    if (seiten[p]) alle.push(...seiten[p]);
  }
  return alle;
}

/**
 * Extrahiert die rohen PDF-Stücke {x,y,h,s,p} der § 4-Region aus dem ZH-215.3-
 * PDF-Byte-Array. Die Region wird durch «§ 4.»-Marker (Start) und «§ 5.»-Marker
 * (Ende) begrenzt — zeilenweise aus den pdfjs-Stücken bestimmt.
 *
 * Gibt die Stücke inkl. Randtext/Marginalie zurück (Filterung in
 * extrahiereZhStreitwertStaffel). Leeres Array wenn § 4 nicht gefunden.
 *
 * Intern-Privat: nur für holeZhPdf. Kein Export (nicht direkt testbar nötig —
 * die Testbarkeit liegt auf der reinen Funktion extrahiereZhStreitwertStaffel
 * gegen die Fixture, §2).
 */
async function extrahiereZhPar4Stuecke(
  bytes: Uint8Array,
): Promise<Array<{ x: number; y: number; h: number; s: string; p: number }>> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: bytes, useSystemFonts: true }).promise;

  type S = { x: number; y: number; h: number; s: string; p: number };
  const alle: S[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const inhalt = await (await doc.getPage(p)).getTextContent();
    for (const it of inhalt.items) {
      const item = it as { str: string; transform: number[]; height?: number };
      if (!item.str || !item.str.replace(/\s/g, '')) continue;
      const y = item.transform[5];
      if (y < 60 || y > 530) continue; // Kopf-/Fussband
      const h = item.height ?? 9;
      if (h >= 11) continue; // Erlasstitel
      alle.push({ x: item.transform[4], y, h, s: item.str, p });
    }
  }

  // Zeilen (p, y-absteigend) bilden, um § 4. und § 5. Marker zu finden
  const byPY = new Map<string, S[]>();
  for (const s of alle) {
    const key = `${s.p}_${Math.round(s.y)}`;
    let l = byPY.get(key);
    if (!l) { l = []; byPY.set(key, l); }
    l.push(s);
  }
  const rows = [...byPY.entries()].sort((a, b) => {
    const [pa, ya] = a[0].split('_').map(Number);
    const [pb, yb] = b[0].split('_').map(Number);
    return pa - pb || yb - ya;
  });

  // § 4. und § 5. in den Zeilen suchen
  let par4Start = -1;
  let par4End = rows.length;
  for (let i = 0; i < rows.length; i++) {
    const text = rows[i][1].map((s) => s.s).join('');
    if (par4Start < 0 && /§\s*4\./.test(text)) {
      par4Start = i;
    } else if (par4Start >= 0 && /§\s*5\./.test(text)) {
      par4End = i;
      break;
    }
  }

  if (par4Start < 0) return [];

  // Stücke der § 4-Region sammeln
  const par4Stuecke: S[] = [];
  for (let i = par4Start; i < par4End; i++) {
    for (const s of rows[i][1]) {
      par4Stuecke.push(s);
    }
  }
  return par4Stuecke;
}

export async function holeZhPdf(
  registryUrl: string,
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

  // 4. Extraktion + Parsing. bytes für JEDEN pdfjs-Lauf kopieren (getDocument
  // detacht den Puffer → zweiter Lauf auf demselben Array würfe DataCloneError).
  // Spalten-Lücken-Erkennung AKTIV (Probe ZH-243 20.6.2026 validiert: nur
  // Leerzeichen an Spaltengrenzen, Wortlaut beweisbar identisch). Materialisiert
  // sich erst beim nächsten `npm run normtext` (Rollout) in die ZH-Snapshots.
  const { zeilen, randText } = await extrahiereZhTextZeilen(bytes.slice(), true);
  const textbasis = serialisiereZhZeilen(zeilen);
  const artikel = extrahiereAlleZhParagraphen(textbasis);

  // Anhang-Tarif SPALTENBEWUSST erfassen (Auftrag David 17.6.2026): der ZH-
  // NotGebV-Anhang ist eine 4-Spalten-Tabelle (Ziffer | Beschreibung | Ansatz |
  // Verweise). Der generische Zeilen-Serialisierer verschränkt die Verweis-Spalte
  // in die Beschreibung («Begrün-2.2.1, 2.2.2, dung») — spaltenbewusst getrennt
  // bleibt der Wortlaut intakt + lesbar. Nur für ZH (eigene Spalten-x-Geometrie);
  // SG/LU-Anhänge nutzen weiter den generischen Segmentierer.
  const anhang = await extrahiereZhAnhangSpalten(bytes.slice());
  for (const [ziff, e] of Object.entries(anhang)) {
    if (!(ziff in artikel)) artikel[ziff] = e;
  }

  // ── ZH-215.3 § 4 Streitwert-Staffel spaltenbewusst (Task 3, Stufe-2 Mehrspalten) ─
  // Nur für ZH-215.3 (AnwGebV): § 4 Abs. 1 enthält eine 2(→3)-spaltige Tarif-Tabelle
  // (Streitwert | Grundgebühr | Zuschlag). Der generische Zeilen-Serialisierer
  // verschmilzt die Spalten (z. B. «100001250» = «10000» Streitwert + «1250» Grundgebühr).
  // Wir lesen die § 4-Region x-bewusst und setzen bei Erfolg mehrspaltig (kein Text).
  // Nur wenn '4' im Artikel-Ergebnis vorhanden + die x-Extraktion eindeutig → anwenden.
  if ('4' in artikel && artikel['4'].bloecke.length > 0) {
    const par4Stuecke = await extrahiereZhPar4Stuecke(bytes.slice());
    const staffel = extrahiereZhStreitwertStaffel(par4Stuecke);
    if (staffel !== null) {
      const block0 = artikel['4'].bloecke[0];
      artikel['4'].bloecke[0] = { ...block0, text: '', mehrspaltig: staffel };
    }
  }

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

  // Vollabdeckung (§7): ALLE Artikel zurückgeben. Label «Anhang Ziff. N.N.N» für
  // die gepunkteten Anhang-Ziffern (kongruent zu parsePassus, das «Anhang Ziff. …»
  // auf genau diesen Token auflöst); «Anhang Ziff. N» für die nackten Anhang-Posten
  // (Token «anhang_N», Kollisions-Schutz gegen die §§); sonst «§ N» (Paragraphen,
  // inkl. lat. Suffix «8a» aus «8_a»).
  const labels: Record<string, string> = {};
  for (const token of Object.keys(artikel)) {
    if (token.startsWith(ANHANG_NACKT_PREFIX)) {
      labels[token] = `Anhang Ziff. ${token.slice(ANHANG_NACKT_PREFIX.length)}`;
    } else if (token.includes('.')) {
      labels[token] = `Anhang Ziff. ${token}`;
    } else {
      labels[token] = `§ ${token.replace(/_/g, '')}`;
    }
  }
  return { meta: { titel, stand, quelleHash }, artikel, labels };
}
