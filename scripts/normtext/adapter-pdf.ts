/**
 * Generischer Einzelspalten-PDF-Adapter — Norm-Volltext aus den Text-PDF der
 * Kantone SZ, TI, VD, JU für die Norm-Vorschau-Popover. Browserlos: fetch +
 * pdfjs-Text-Extraktion zur BUILD-ZEIT (kein Headless-Browser).
 *
 * Anders als der ZH-PDF-Adapter (Spiegelrand-Buch, x-Spalte wechselt je
 * Seitenparität) sind diese vier Quellen EINSPALTIG: der Body steht in einer
 * festen linken Spalte, Marginalie/Sachtitel (TI/VD/JU) und Kopf-/Fusszeilen
 * werden über x/y/Schrifthöhe heuristisch verworfen. Ein Adapter, vier Profile.
 *
 * Empirisch verifiziert am echten extrahierten Text (§7, Spike 16.6.2026):
 *
 * SZ — sz.ch Text-PDF (Profil 'sz'):
 *   - quelleUrl IST die PDF (…/assets/<n>/<lawNr>.pdf) → pdfUrlAusQuelle identisch.
 *   - §-Marker «§ N» (Body h≈8.5, x≈74 ungerade / x≈45 gerade Seite); § und
 *     Nummer sind getrennte Fragmente am selben y.
 *   - Absatznummer = hochgestellte Ziffer (h≈5.5) am Zeilenanfang (eigenes y).
 *   - Gliederung «I. Allgemeine Bestimmungen» (Body-Höhe, ohne §) → verworfen.
 *   - Kopf «173.111» (h≈8.5, y≈554), Fuss «SRSZ 1.2.2026 | 1» (h≈7.0, y≈22).
 *   - Stand: Fuss «SRSZ D.M.YYYY» → ISO.
 *
 * TI — m3.ti.ch pdfatto (Profil 'ti', italienisch):
 *   - quelleUrl IST schon die PDF (…/pdfatto/atto/<num>) → identisch. (Falls je
 *     die HTML-Seite …/legge/num/<num> zitiert würde: num→/pdfatto/atto/num.)
 *   - «Art. N» (h≈10, x≈93); Art. + Nummer getrennte Fragmente; der Folgetext
 *     steht teils im selben y («Art. 1 | La presente legge …»).
 *   - Absatznummer = hochgestellte Ziffer (h≈8.0) am Zeilenanfang (eigenes y).
 *   - Sachtitel «Campo di applicazione» (x≈66, Body-Höhe) auf eigener Zeile VOR
 *     dem «Art.» → Marginalie, verworfen (steht links der Body-Spalte x≈93).
 *   - Gliederung «TITOLO …»/«Capitolo …» → verworfen. Kopf «178.200» (h≈12).
 *   - Stand: Kopf «(del DD mese YYYY)» (Erlassdatum) → ISO.
 *
 * VD — lexfind.ch/tolv/<id>/fr (Profil 'vd', französisch):
 *   - quelleUrl liefert direkt die PDF → identisch.
 *   - «Art. N» (h≈12, x≈43) + Sachtitel im selben y («Art. 1 | Objet»).
 *   - Absatznummer = hochgestellte Ziffer (h≈7.0) am Zeilenanfang.
 *   - Fussnoten-Verweise «[A]»/«[B]» (h≈7.0/7.4) im Fliesstext UND als Fuss-
 *     band (h≈11.7) → verworfen. Gliederung «Partie …» (h≈16.5).
 *   - Stand: Kopf «Entrée en vigueur dès le DD.MM.YYYY» → ISO.
 *
 * JU — rsju.jura.ch viewer (Profil 'ju', französisch):
 *   - quelleUrl ist der Viewer; die PDF kommt mit «&download=1» → pdfUrlAusQuelle
 *     hängt «&download=1» an, falls nicht vorhanden.
 *   - «Article premier» (Art. 1) bzw. «Art. N» (h≈12, x≈135); Body stark
 *     fragmentiert (viele Stücke je y) → x-sortiert zusammengesetzt.
 *   - Sachtitel/Marginalie (x≈69, h≈9.0) im LINKEN Rand, mehrzeilig → verworfen
 *     (x < Body-Spalte). Absatznummer = hochgestellte Ziffer (h≈8.0) am
 *     Zeilenanfang; Fussnoten-Verweise «1)»/«2)» (h≈8.0/6.5, enden auf «)») →
 *     verworfen. lit. «a)»/«b)» (h≈12, Body) → items. Gliederung «CHAPITRE …».
 *   - Stand: Kopf «du DD mois YYYY» (Erlassdatum) → ISO.
 *
 * Mehrsprachigkeit: it/fr-Texte (Akzente é/à/ç/è/î/ù) werden so übernommen.
 *
 * Drift-Token (§7 d): kein version_uid. quelleHash = sha256 des normalisierten
 * extrahierten Volltexts (alle Artikel + items, stabil sortiert) dient als
 * fassungsToken; `stand` aus dem Profil-Kopf/Fuss-Marker. Re-fetch +
 * quelleHash-Vergleich erkennt jede inhaltliche Änderung der Quelle.
 *
 * §2: rein/deterministisch (kein Date.now/Math.random). Die reinen Funktionen
 * (extrahierePdfArtikel, leseStand…, pdfUrlAusQuelle) arbeiten ohne Netz/FS und
 * sind gegen Fixtures echten extrahierten Texts testbar; holePdf ist die Netz-
 * Hülle.
 */

import { createHash } from 'node:crypto';
import { segmentiereAnhangZiffern } from './anhang-segmenter.ts';
import { extrahiereTarifTabelle, type TarifZeile } from './tarif-tabelle.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Typen
// ─────────────────────────────────────────────────────────────────────────────

// 'olexAt'/'olexPar' = generisches OrdoLex/gr-lex-Familie-PDF (Art. bzw. §): die
// kantonalen Konsolidierungs-PDFs (ar.clex.ch, gr-lex.gr.ch, srl.lu.ch,
// gesetzessammlung.sg.ch, bdlf.fr.ch, lex.vs.ch sowie lexfind/tolv) tragen den
// Stand uniform im Kopf — «(Stand 1. Januar 2024)» (de) bzw. «(état 01.01.2011)»
// (fr). EIN Profil statt Einzel-Hacks; Marker bestimmt nur die Kopf-Erkennung.
export type PdfProfilName = 'sz' | 'ti' | 'vd' | 'ju' | 'olexAt' | 'olexPar';

export interface PdfBlock {
  absatz: string | null;
  text: string;
  items?: Array<{ marke: string; text: string }>;
  /** Stufe 1: Füllpunkt-Tarifzeilen (Beschreibung | Betrag), aus dem Text
   *  zerlegt. text trägt dann nur noch den Einleitungs-Vortext. */
  tabelle?: TarifZeile[];
}

export interface PdfArtikel {
  bloecke: PdfBlock[];
}

export interface PdfErgebnis {
  meta: {
    titel: string;
    stand: string;
    quelleHash: string;
  };
  artikel: Record<string, PdfArtikel>; // token → Artikel
  /** Einheitliches Label je token, abgeleitet aus dem Profil-Marker:
   *  «§ N» (SZ) bzw. «Art. N» (TI/VD/JU). */
  labels: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Profil-Definition
// ─────────────────────────────────────────────────────────────────────────────

export interface PdfProfil {
  name: PdfProfilName;
  /** Leitet die PDF-URL aus der Tarif-quelleUrl ab. */
  pdfUrlAusQuelle: (quelleUrl: string) => string;
  /** Liest den `stand` (ISO YYYY-MM-DD) aus dem gesamten Kopf-/Fuss-Rohtext. */
  standLeser: (kopfFussText: string) => string;
  /** Artikel-Marker am Zeilenanfang: '§' (SZ) oder 'Art.' (TI/VD/JU). */
  marker: '§' | 'Art.';
}

// ── URL-Ableitungen ───────────────────────────────────────────────────────────
/** TI: num→/pdfatto/atto/num (falls die HTML-Seite …/legge/num/<num> zitiert
 *  würde). Die Tarif-Daten zitieren bereits die /pdfatto/atto-Form → identisch. */
function tiPdfUrl(quelleUrl: string): string {
  const m = quelleUrl.match(
    /^(https:\/\/m3\.ti\.ch\/CAN\/RLeggi\/public\/(?:index\.php\/)?raccolta-leggi)\/legge\/num\/(\d+)$/i,
  );
  if (m) return `${m[1]}/pdfatto/atto/${m[2]}`;
  return quelleUrl;
}

/** JU: Viewer-URL → PDF durch Anhängen von «&download=1» (falls nicht da). */
function juPdfUrl(quelleUrl: string): string {
  if (/[?&]download=1(?:&|$)/.test(quelleUrl)) return quelleUrl;
  const sep = quelleUrl.includes('?') ? '&' : '?';
  return `${quelleUrl}${sep}download=1`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stand-Leser je Profil
// ─────────────────────────────────────────────────────────────────────────────

/** SZ-Fuss «SRSZ D.M.YYYY» → ISO. */
export function leseSzStand(text: string): string {
  const m = text.match(/SRSZ\s+(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!m) return '';
  return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

/** Italienische Monatsnamen → MM. */
const IT_MONATE: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04', maggio: '05',
  giugno: '06', luglio: '07', agosto: '08', settembre: '09', ottobre: '10',
  novembre: '11', dicembre: '12',
};
/** TI-Kopf «(del 30 novembre 2010)» → ISO 2010-11-30. */
export function leseTiStand(text: string): string {
  const m = text.match(/\bdel\s+(\d{1,2})\s+([a-zàèéìòù]+)\s+(\d{4})/i);
  if (!m) return '';
  const mon = IT_MONATE[m[2].toLowerCase()];
  if (!mon) return '';
  return `${m[3]}-${mon}-${m[1].padStart(2, '0')}`;
}

/** VD-Kopf «Entrée en vigueur dès le DD.MM.YYYY» → ISO. */
export function leseVdStand(text: string): string {
  const m = text.match(/Entrée en vigueur dès le\s+(\d{2})\.(\d{2})\.(\d{4})/i);
  if (!m) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** Französische Monatsnamen → MM. */
const FR_MONATE: Record<string, string> = {
  janvier: '01', février: '02', fevrier: '02', mars: '03', avril: '04',
  mai: '05', juin: '06', juillet: '07', août: '08', aout: '08',
  septembre: '09', octobre: '10', novembre: '11', décembre: '12', decembre: '12',
};
/** JU-Kopf «du 24 mars 2010» (Erlassdatum) → ISO 2010-03-24. */
export function leseJuStand(text: string): string {
  const m = text.match(/\bdu\s+(\d{1,2})(?:er)?\s+([a-zàâçéèêëîïôûù]+)\s+(\d{4})/i);
  if (!m) return '';
  const mon = FR_MONATE[m[2].toLowerCase()];
  if (!mon) return '';
  return `${m[3]}-${mon}-${m[1].padStart(2, '0')}`;
}

/** Deutsche Monatsnamen → MM. */
const DE_MONATE: Record<string, string> = {
  januar: '01', februar: '02', märz: '03', maerz: '03', april: '04', mai: '05',
  juni: '06', juli: '07', august: '08', september: '09', oktober: '10',
  november: '11', dezember: '12',
};
/**
 * OrdoLex/gr-lex-Familie-Stand aus dem Kopf:
 *   de  «(Stand 1. Januar 2024)»  → 2024-01-01
 *   fr  «(état 01.01.2011)»        → 2011-01-01
 *   fr  «(état au 1er janvier 2020)» → 2020-01-01 (Langform)
 * Der «Stand»/«état» ist das KONSOLIDIERUNGS-Datum (geltende Fassung, §7) — nicht
 * das Erlassdatum («vom …»/«du …»), das davor steht.
 */
export function leseOrdolexStand(text: string): string {
  // Der Konsolidierungskopf ist IMMER geklammert — «(Stand …)» / «(état …)» /
  // «(version entrée en vigueur le …)». Die Klammer-Bindung ist wichtig, weil der
  // Stand-Leser auch über den ungefilterten Body (textbasis/rohText) läuft: ohne
  // sie würde ein freier Körper-Satz («per Stand 15. März 2020») fälschlich als
  // Stand gegriffen, falls der echte Kopf fehlt (Bug-Check-Befund 17.6.2026).
  const de = text.match(/\(\s*Stand\s+(\d{1,2})\.\s*([A-Za-zäöü]+)\s+(\d{4})/i);
  if (de) {
    const mon = DE_MONATE[de[2].toLowerCase()];
    if (mon) return `${de[3]}-${mon}-${de[1].padStart(2, '0')}`;
  }
  const frNum = text.match(/\(\s*état\s+(?:au\s+)?(\d{1,2})\.(\d{1,2})\.(\d{4})/i);
  if (frNum) return `${frNum[3]}-${frNum[2].padStart(2, '0')}-${frNum[1].padStart(2, '0')}`;
  // FR-Konsolidierung: «(version entrée en vigueur le 01.07.2016)» — das
  // In-Kraft-Datum der geltenden Fassung ist der Stand (§7). «le» oder «dès le».
  const frVig = text.match(/\(\s*version\s+entrée en vigueur\s+(?:dès\s+)?le\s+(\d{1,2})\.(\d{1,2})\.(\d{4})/i);
  if (frVig) return `${frVig[3]}-${frVig[2].padStart(2, '0')}-${frVig[1].padStart(2, '0')}`;
  const frLang = text.match(/\(\s*état\s+au\s+(\d{1,2})(?:er)?\s+([a-zàâçéèêëîïôûù]+)\s+(\d{4})/i);
  if (frLang) {
    const mon = FR_MONATE[frLang[2].toLowerCase()];
    if (mon) return `${frLang[3]}-${mon}-${frLang[1].padStart(2, '0')}`;
  }
  return '';
}

// ─────────────────────────────────────────────────────────────────────────────
// Profil-Registry
// ─────────────────────────────────────────────────────────────────────────────

export const PDF_PROFILE: Record<PdfProfilName, PdfProfil> = {
  sz: { name: 'sz', pdfUrlAusQuelle: (u) => u, standLeser: leseSzStand, marker: '§' },
  ti: { name: 'ti', pdfUrlAusQuelle: tiPdfUrl, standLeser: leseTiStand, marker: 'Art.' },
  vd: { name: 'vd', pdfUrlAusQuelle: (u) => u, standLeser: leseVdStand, marker: 'Art.' },
  ju: { name: 'ju', pdfUrlAusQuelle: juPdfUrl, standLeser: leseJuStand, marker: 'Art.' },
  // Generische OrdoLex-Familie: quelleUrl IST die PDF (identity); Stand aus dem
  // «(Stand …)»/«(état …)»-Kopf. olexAt = Art.-Erlasse (AR/GR/SG/FR/VS/VD-VS/TI),
  // olexPar = §-Erlasse (LU/SZ). TI-«(del …)» wird über das bestehende ti-Profil
  // geroutet (leseTiStand); olexAt nutzt zusätzlich leseTiStand als Fallback.
  olexAt: {
    name: 'olexAt',
    pdfUrlAusQuelle: (u) => u,
    standLeser: (t) => leseOrdolexStand(t) || leseTiStand(t),
    marker: 'Art.',
  },
  olexPar: { name: 'olexPar', pdfUrlAusQuelle: (u) => u, standLeser: leseOrdolexStand, marker: '§' },
};

// ─────────────────────────────────────────────────────────────────────────────
// PDF-Layout-Extraktion (pdfjs, BUILD-time, NUR in scripts/)
// ─────────────────────────────────────────────────────────────────────────────

interface PdfStueck {
  x: number;
  y: number;
  h: number;
  /** Glyph-Breite (pdfjs item.width) — für die Wort-Trennung bei fragmentierten
   *  Quellen (JU): Lücke zwischen zwei Stücken → Leerzeichen einfügen. */
  w: number;
  s: string;
}

/**
 * Marginalien-Rettung: Ein Stück LINKS der Body-Spalte (x < bodyMinX−5, das
 * `istMarginalie` sonst verwirft) ist KEINE Randnote, sondern eine hierarchische
 * Anhang-/Tarif-Ziffer-Überschrift, wenn es (a) nur KNAPP links sitzt (≤45pt) und
 * (b) mit einer mehrstufigen Ziffer «N.M[.…]» beginnt. Hintergrund: bodyMinX wird
 * pro Seite bestimmt; auf tiefer eingerückten Anhang-Seiten (AR bGS 153.2, Ziff.
 * 8.1–8.4) fällt die linksstehende Tarif-Ziffer sonst unter die Schwelle und ginge
 * verloren.
 *
 * Härtung gegen False Positives (Bug-Check 22.6.2026): Die erste Ziffer-Komponente
 * muss klein sein (≤ 99). Das schliesst SR-/Gesetzes-Nummern («173.8», «153.2»),
 * Jahres-/Datumsformen («2020.01.01») und die meisten Beträge aus, die das reine
 * N.M-Muster sonst ebenfalls träfen — Anhang-Abschnitts-Nummern sind dagegen klein
 * (1–15). Laufende Kopf-/Fuss-Erlassnummern sind ohnehin schon übers y-Band raus.
 * Rein additiv: rettet nur bisher Verworfenes, verwirft nie zusätzlich.
 */
export function istAnhangZifferLinks(x: number, bodyMinX: number, text: string): boolean {
  if (x >= bodyMinX - 5 || x < bodyMinX - 45) return false;
  const m = text.trim().match(/^(\d+)(?:\.\d+)+(?:\s|$)/);
  return m != null && Number(m[1]) <= 99;
}

/** Eine zusammengefügte Body-Textzeile. */
export interface PdfTextZeile {
  /** Führende Absatznummer (hochgestellte Ziffer am Zeilenanfang) oder null. */
  absatz: string | null;
  /** Der bereinigte Zeilentext. */
  text: string;
}

export interface PdfExtrakt {
  zeilen: PdfTextZeile[];
  /** Roh-Text aus Kopf-/Fussbändern + (verworfener) Marginalie (für die Stand-
   *  Erkennung; der Kopf «(del …)»/«du …»/«Entrée …» steht im obersten Band). */
  randText: string;
  /** UNGEFILTERTER Volltext aller pdfjs-Items (jede Seite). Letzter Stand-Fallback,
   *  wenn der Marker weder im Band noch im Body liegt — z. B. der «SRSZ D.M.YYYY»-
   *  Konsolidierungsstempel mitten auf der SZ-Titelseite (als Marginalie verworfen). */
  rohText: string;
  titel: string;
}

/**
 * Extrahiert die Body-Textzeilen aus den PDF-Bytes (pdfjs), einspaltig.
 *
 * Heuristik (für alle vier Profile gemeinsam, parametriert über `marker`):
 *  - Body-Spalte = das x der Body-Schrift (Modus der x-Werte mit Body-Höhe).
 *  - Marginalie (Sachtitel links der Body-Spalte) → verworfen.
 *  - Kopf-/Fussband (oberste/unterste y-Bänder) → in randText, aus dem Body raus.
 *  - Absatznummer = hochgestellte Ziffer (kleine Schrift) am Zeilenanfang;
 *    Fussnoten-Verweise (Ziffer mit «)» bzw. «[A]») → verworfen.
 *  - Silbentrennung am Zeilenende wird beim Parsen zusammengefügt.
 */
export async function extrahierePdfZeilen(
  bytes: Uint8Array,
  marker: '§' | 'Art.',
): Promise<PdfExtrakt> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: bytes, useSystemFonts: true }).promise;

  const zeilen: PdfTextZeile[] = [];
  const randStuecke: string[] = [];
  const rohStuecke: string[] = [];
  let titel = '';

  for (let p = 1; p <= doc.numPages; p++) {
    const seite = await doc.getPage(p);
    const inhalt = await seite.getTextContent();
    const view = seite.getViewport({ scale: 1 });
    const seitenHoehe = view.height;

    const alle: PdfStueck[] = [];
    for (const it of inhalt.items) {
      const item = it as {
        str: string;
        transform: number[];
        height?: number;
        width?: number;
      };
      if (!item.str || !item.str.replace(/\s/g, '')) continue;
      rohStuecke.push(item.str);
      alle.push({
        x: item.transform[4],
        y: item.transform[5],
        h: item.height ?? 9,
        w: item.width ?? 0,
        s: item.str,
      });
    }
    if (alle.length === 0) continue;

    // Kopf-/Fussband: die Quellen tragen einen LAUFENDEN Kopf (nur die Gesetzes-
    // Nr., z.B. «173.111»/«178.200»/«176.511») im obersten Band und eine
    // Seitenzahl/Fuss-Stand («SRSZ 1.2.2026 | 1») im untersten. ACHTUNG: VD hat
    // KEINEN laufenden Kopf — dort beginnt der Body («Art. 3 Perception») bereits
    // im obersten Band. Darum verwerfen wir aus den Rand-Bändern NUR Zeilen, die
    // wie ein laufender Kopf/Fuss aussehen (reine Gesetzes-Nr./Seitenzahl/kurzer
    // Fuss-Stand) — nicht pauschal das ganze Band (sonst ginge VD-Body verloren).
    const kopfSchwelle = seitenHoehe * 0.9;
    const fussSchwelle = seitenHoehe * 0.07;

    // Pro y-Zeile entscheiden, ob sie ein laufender Kopf/Fuss ist.
    const nachYAlle = new Map<number, PdfStueck[]>();
    for (const st of alle) {
      const key = Math.round(st.y);
      let l = nachYAlle.get(key);
      if (!l) {
        l = [];
        nachYAlle.set(key, l);
      }
      l.push(st);
    }

    // Eine Band-Zeile gehört in den BODY, wenn sie mit dem Artikel-Marker
    // beginnt (VD «Art. 3 Perception» am Seitenkopf einer Folgeseite). Alle
    // übrigen Band-Zeilen (laufende Gesetzes-Nr., Seitenzahl, Fuss-Stand «SRSZ
    // …», sowie die lexfind-Metazeilen «Entrée en vigueur …»/«Document généré
    // …») → randText (Stand-Erkennung), NICHT in den Body.
    const beginntMitMarker = (txt: string): boolean => {
      const t = txt.replace(/\s+/g, ' ').trim();
      return marker === '§' ? /^§\s*\d/.test(t) : /^Art(?:icle)?\.?\s*\d|^Article\s+premier/i.test(t);
    };

    const bodyStuecke: PdfStueck[] = [];
    for (const [y, liste] of nachYAlle) {
      const txt = liste
        .slice()
        .sort((a, b) => a.x - b.x)
        .map((s) => s.s)
        .join('');
      const imBand = y >= kopfSchwelle || y <= fussSchwelle;
      if (imBand && !beginntMitMarker(txt)) {
        for (const s of liste) randStuecke.push(s.s);
        continue;
      }
      for (const s of liste) bodyStuecke.push(s);
    }
    if (bodyStuecke.length === 0) continue;

    // Body-Schrifthöhe = häufigste Höhe ≥ 8 (Fliesstext). Die Marginalie (TI/JU)
    // hat eine kleinere Höhe ODER liegt links der Body-Spalte.
    const hoehen = bodyStuecke.map((s) => s.h).filter((h) => h >= 8);
    const bodyHoehe = haeufigste(hoehen) ?? 10;
    // Body-Spalte-x = der LINKE Spaltenrand: das kleinste x, das oft genug auftritt.
    // (NICHT das häufigste x — auf Gebührentabellen-Seiten dominiert oft die Wert-
    //  Spalte rechts; dann würden «§ 17»/«Art. N» am linken Rand fälschlich als
    //  Marginalie verworfen. Der echte linke Body-Rand ist das kleinste x mit
    //  nennenswerter Häufigkeit.)
    const bodyXs = bodyStuecke
      .filter((s) => Math.abs(s.h - bodyHoehe) < 1.5)
      .map((s) => Math.round(s.x));
    const bodyMinX = linkerSpaltenRand(bodyXs);

    // Auf Seite 1 den Titel aus der OBERSTEN Textzeile (nach der laufenden
    // Gesetzes-Nr.) ableiten — rein informativ in meta; der erlass-Name kommt im
    // Snapshot ohnehin aus den Tarif-Daten. Wir nehmen die erste y-Zeile, die
    // keine reine Nummer/Metazeile ist.
    if (p === 1 && titel === '') {
      const yObenSort = [...nachYAlle.keys()].sort((a, b) => b - a);
      for (const yk of yObenSort) {
        const t = nachYAlle.get(yk)!
          .slice()
          .sort((a, b) => a.x - b.x)
          .map((s) => s.s)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (t === '' || /^[\d.\s]+$/.test(t)) continue; // Gesetzes-Nr.
        if (/^(Entrée|Document|État|Etat)\b/i.test(t)) continue; // lexfind-Meta
        titel = t;
        break;
      }
    }

    // Marginalie verwerfen: Stücke deutlich LINKS der Body-Spalte (x < bodyMinX−5)
    // sind Sachtitel/Randnoten (TI x≈66 vs. Body 93; JU x≈69 vs. Body 135). Bei
    // SZ/VD liegt der Sachtitel IN der Body-Zeile (gleiche x) → kein Verlust.
    //
    // AUSNAHME (AR bGS 153.2, Anhang-Tarif-Ziffern 8.1–8.4): bodyMinX wird PRO
    // SEITE bestimmt; auf tiefer eingerückten Anhang-Seiten (bodyMinX 66/105) fällt
    // die linksstehende Tarif-Ziffer (x≈44/84) unter die Schwelle und ginge als
    // «Marginalie» verloren — obwohl sie die Ziffer-Überschrift IST (auf Seiten mit
    // bodyMinX≈44 überlebt dieselbe Ziffer). Eine hierarchische Anhang-Ziffer
    // («8.1», auch geklebt «8.1 Eigentum:») KNAPP links der Body-Spalte (≤45pt) ist
    // daher KEINE Randnote. Rein additiv (behält nur bisher Verworfenes); das
    // mehrstufige N.N-Muster schützt vor Seitenzahlen/Fussnoten-Hochzahlen (reine
    // «\d+») und echten Sachtitel-Marginalien (TI/JU beginnen mit Buchstaben), die
    // ≤45pt-Schranke vor weit links liegenden Randnoten.
    const istMarginalie = (st: PdfStueck): boolean =>
      st.x < bodyMinX - 5 && !istAnhangZifferLinks(st.x, bodyMinX, st.s);

    // Nach y gruppieren (eine Textzeile).
    const nachY = new Map<number, PdfStueck[]>();
    for (const st of bodyStuecke) {
      if (istMarginalie(st)) continue;
      const key = Math.round(st.y);
      let liste = nachY.get(key);
      if (!liste) {
        liste = [];
        nachY.set(key, liste);
      }
      liste.push(st);
    }

    const yKeys = [...nachY.keys()].sort((a, b) => b - a);
    for (const yKey of yKeys) {
      const stueckeDerZeile = nachY.get(yKey)!.sort((a, b) => a.x - b.x);
      // Fussnoten-/Annotations-Band (VD: «Abrogé et remplacé par …», eingerückt
      // bei x≈80 mit Schrift 11.7 > Body 11.0): eine Zeile, deren Stücke ALLE
      // deutlich rechts der Body-Spalte (x ≥ bodyMinX+25) stehen UND deren Schrift
      // grösser als der Body ist, ist KEIN Normtext → verworfen. Body-Absätze
      // haben stets ein Stück an/nahe der Body-Spalte (Absatznummer x=bodyMinX,
      // Text x=bodyMinX+6); eine eingerückte Fussnoten-Definition nicht.
      const minLineX = Math.min(...stueckeDerZeile.map((s) => s.x));
      const maxLineH = Math.max(...stueckeDerZeile.map((s) => s.h));
      if (minLineX >= bodyMinX + 25 && maxLineH > bodyHoehe + 0.4) continue;
      // Fuss-Annotation (VD: «Modifié par le Règlement …», Schrift 10.0 < Body
      // 11.0, mit führender Fussnoten-Hochzahl «5»): eine Zeile, deren GRÖSSTE
      // Schrift unter der Body-Höhe liegt, ist Annotation/Fussnote, kein Normtext.
      // AUSNAHME: eine alleinstehende Absatz-Hochzahl («1»/«2» am Body-Rand auf
      // eigener y-Zeile) ist klein, aber KEINE Annotation — sie liefert die
      // Absatznummer der Folgezeile (hängenderAbsatz). Solche Zeilen (genau ein
      // Stück, reine Ziffer, x ≤ bodyMinX+8) bleiben erhalten.
      const istLoneAbsatz =
        stueckeDerZeile.length <= 2 &&
        stueckeDerZeile[0].x <= bodyMinX + 8 &&
        /^\d+(?:bis|ter)?$/.test(stueckeDerZeile.map((s) => s.s).join('').trim());
      if (maxLineH < bodyHoehe - 0.4 && !istLoneAbsatz) continue;
      const { absatz, text } = baueZeile(stueckeDerZeile, bodyHoehe, marker, bodyMinX);
      if (text === '' && absatz === null) continue;
      zeilen.push({ absatz, text });
    }
  }

  return { zeilen, randText: randStuecke.join(' '), rohText: rohStuecke.join(' '), titel };
}

/** Häufigster gerundeter Wert einer Liste (Modus). */
function haeufigste(werte: number[]): number | null {
  if (werte.length === 0) return null;
  const zaehl = new Map<number, number>();
  for (const w of werte) {
    const k = Math.round(w * 2) / 2; // 0.5er-Raster
    zaehl.set(k, (zaehl.get(k) ?? 0) + 1);
  }
  let best = werte[0];
  let max = 0;
  for (const [k, n] of zaehl) {
    if (n > max) {
      max = n;
      best = k;
    }
  }
  return best;
}

/**
 * Linker Spaltenrand: das KLEINSTE x, das mindestens 12 % so häufig auftritt wie
 * das häufigste x. So wird der echte linke Body-Rand gefunden, auch wenn eine
 * rechte Wert-Spalte (Gebührentabelle) häufiger ist; vereinzelte Ausreisser
 * (eine eingerückte Zeile) bleiben unter der Schwelle und verschieben den Rand
 * nicht. Leere Eingabe → 0.
 */
function linkerSpaltenRand(xs: number[]): number {
  if (xs.length === 0) return 0;
  const zaehl = new Map<number, number>();
  for (const x of xs) zaehl.set(x, (zaehl.get(x) ?? 0) + 1);
  const maxN = Math.max(...zaehl.values());
  const schwelle = Math.max(2, maxN * 0.12);
  let rand = Infinity;
  for (const [x, n] of zaehl) {
    if (n >= schwelle && x < rand) rand = x;
  }
  return rand === Infinity ? Math.min(...xs) : rand;
}

/** Setzt eine Zeile aus ihren x-sortierten Stücken zusammen; erkennt führende
 *  Absatz-Hochzahl; verwirft Fussnoten-Verweise («1)», «[A]», mitten-Hochzahl). */
function baueZeile(
  stuecke: PdfStueck[],
  bodyHoehe: number,
  marker: '§' | 'Art.',
  bodyMinX: number,
): { absatz: string | null; text: string } {
  let absatz: string | null = null;
  let text = '';
  // Eine Zeile, die NUR aus einem Marker «Art.»/«§» + Nummer besteht, hat schon
  // die volle Body-Höhe; Hochzahlen sind deutlich kleiner.
  const hochSchwelle = bodyHoehe - 1.5;
  // Rechte Kante des zuletzt übernommenen Stücks (für die Wort-Trennung bei
  // fragmentierten Quellen wie JU: «Les termes utilisés» kommt als getrennte
  // Stücke ohne eigenes Leerzeichen — ein x-Abstand > ~22 % der Body-Höhe
  // signalisiert eine Wortgrenze).
  let letzteKante: number | null = null;
  const lueckenSchwelle = bodyHoehe * 0.22;

  for (let k = 0; k < stuecke.length; k++) {
    const st = stuecke[k];
    const istHoch = st.h < hochSchwelle;
    const roh = st.s.trim();
    if (istHoch) {
      // Führende reine Ziffer am Zeilenanfang = Absatznummer (nicht «1)» = Fussn.,
      // nicht «[A]»). Nur am allerersten Stück, NUR wenn die Hochzahl an/nahe der
      // linken Body-Spalte (x ≤ bodyMinX+8) steht — ein Fussnoten-Verweis «5»
      // steht mitten/rechts in der Zeile (VD: x≈140 über dem Sachtitel) und ist
      // KEINE Absatznummer —, und nur wenn der Marker NICHT in dieser Zeile
      // beginnt (sonst stünde «Art. 1» mit Hochzahl-1 = Fussnote).
      if (
        k === 0 &&
        absatz === null &&
        st.x <= bodyMinX + 8 &&
        /^\d+(?:bis|ter)?$/.test(roh) &&
        !zeileBeginntMitMarker(stuecke, marker)
      ) {
        absatz = roh.toLowerCase();
        continue;
      }
      // Fussnoten-Verweis «1)», «2)», «[A]», «er» (ordinal-Hochstellung in fr) →
      // verwerfen (kleine Schrift, nicht am Zeilenanfang oder mit Klammer/Marke).
      if (/^\d+\)?$/.test(roh) || /^\[[A-Za-z0-9]+\]$/.test(roh) || /^(er|e|ème)$/.test(roh)) {
        continue;
      }
      // sonstige kleine Schrift (z.B. hochgestellte Verweise) → verwerfen.
      if (/^[\s,\d)\]]+$/.test(roh)) continue;
    }
    // Wort-Trennung: liegt ein nennenswerter Abstand zwischen der rechten Kante
    // des Vorgängers und dem Beginn dieses Stücks, und enthält weder Ende noch
    // Anfang bereits ein Leerzeichen, ein Leerzeichen einsetzen (fragmentierte
    // Quellen). Bei kleiner/keiner Lücke direkt anhängen (echte Klebung im PDF).
    if (
      letzteKante !== null &&
      st.x - letzteKante > lueckenSchwelle &&
      !/\s$/.test(text) &&
      !/^\s/.test(st.s)
    ) {
      text += ' ';
    }
    text += st.s;
    letzteKante = st.x + st.w;
  }
  return { absatz, text: text.replace(/\s+/g, ' ').trim() };
}

/** true, wenn die Zeile (x-sortiert) mit dem Artikel-Marker «§»/«Art.» beginnt. */
function zeileBeginntMitMarker(stuecke: PdfStueck[], marker: '§' | 'Art.'): boolean {
  const erst = stuecke.slice(0, 3).map((s) => s.s).join('').replace(/\s+/g, ' ').trim();
  if (marker === '§') return /^§/.test(erst);
  return /^Art(?:icle)?\.?\b/i.test(erst);
}

/**
 * Serialisiert die Body-Textzeilen mit «¶N»-Absatzmarkern — die testbare
 * Textbasis, die extrahiereAllePdfArtikel parst (ohne pdfjs/Netz).
 */
export function serialisierePdfZeilen(zeilen: PdfTextZeile[]): string {
  return zeilen
    .map((z) => (z.absatz !== null ? `¶${z.absatz} ${z.text}` : z.text))
    .join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Reiner Parser: Textbasis → Artikel
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_SUFFIX = /^(\d+)([a-z])?(bis|ter|quater|quinquies)?$/i;
function normalisiereToken(roh: string): string {
  return roh
    .toLowerCase()
    .replace(TOKEN_SUFFIX, (_, n, b, suf) => [n, b, suf].filter(Boolean).join('_'));
}

// §-Kopf (SZ): «§ 4» am Zeilenanfang. Art-Kopf (TI/VD/JU): «Art. 4» bzw.
// «Article premier» (Art. 1). Beide am Zeilenanfang; Resttext (TI/VD/JU oft
// «Art. 1La presente …», ohne Trennzeichen) folgt im selben Stück.
//
// Der optionale Suffix-Buchstabe (30a/335bis) wird NUR mitgenommen, wenn danach
// eine Wort-/Satzgrenze folgt — sonst würde «Art. 30l’indennità» fälschlich zu
// Token «30l» (der TI-Folgetext beginnt direkt mit «l’…»). Lookahead verlangt
// nach dem Buchstaben ein Nicht-Buchstabe-/Ende.
// Die volle Ziffernkette wird IMMER gegriffen (kein Backtracking: «Art. 10La»
// → Nummer «10», nicht «1»). Der Suffix-Buchstabe ist eine SEPARATE optionale
// Gruppe, die nur greift, wenn danach eine Wort-/Satzgrenze folgt («Art. 335bis»
// ja, «Art. 30l’indennità» nein → Buchstabe bleibt beim Folgetext).
// Der Suffix-Buchstabe ist STRIKT klein ([a-z], KEIN /i-Flag), denn Artikel-
// Suffixe sind immer klein (30a/335bis); ein glued GROSSbuchstabe wie das «L»
// in «Art. 30L’indennità» darf NICHT als Suffix gegriffen werden (sonst Token
// «30_l»). Das Marker-Wort selbst wird mit «[Aa]rt» tolerant gross/klein erkannt.
const PARAGRAF_KOPF =
  /^§\s*(\d+)((?:[a-z](?:bis|ter|quater|quinquies)?)(?=$|[^a-zA-Z]))?/;
const ART_KOPF =
  /^[Aa]rt\.?\s*(\d+)((?:[a-z](?:bis|ter|quater|quinquies)?)(?=$|[^a-zA-Z]))?/;
const ART_PREMIER = /^Article\s+premier\b/i;

/** lit.-Marke am Zeilenanfang: «a) …» / «a. …» (fr/it: «a)»). */
const LIT_MARKE = /^([a-z])[).]\s*(\S.*)$/;

/** Absatz-Marker «¶N» am Zeilenanfang. */
const ABSATZ_MARKER = /^¶(\d+(?:bis|ter)?)\s*(.*)$/;

/** Gliederungs-Überschrift (NICHT Normtext): «TITOLO …», «Capitolo …»,
 *  «CHAPITRE …», «Partie …», «I. Allgemeine …», «II. …», «Section …».
 *  Erkannt ohne Marker, ohne Absatztext. */
const GLIEDERUNG =
  /^(?:TITOLO|TITRE|Capitolo|Capo|CHAPITRE|Chapitre|Partie|Section|Sezione|[IVXLC]+\.\s+[A-ZÄÖÜ])\b/;

/** Silbentrennung am Zeilenende: «Gebüh-» + «ren» → «Gebühren» (nur vor
 *  Kleinbuchstabe). */
function fuegeZeilen(roh: string[]): string {
  let out = '';
  for (let i = 0; i < roh.length; i++) {
    const zeile = roh[i];
    const naechste = roh[i + 1] ?? '';
    if (/[a-zäöüàâçéèêëîïôûù]-$/.test(zeile) && /^[a-zäöüàâçéèêëîïôûù]/.test(naechste)) {
      out += zeile.slice(0, -1);
    } else {
      out += zeile + (i < roh.length - 1 ? ' ' : '');
    }
  }
  return out.replace(/\s+/g, ' ').trim();
}

/** Block-Sammler (Absätze + lit.-items eines Artikels) — analog HTM/ZH. */
function baueBloecke(zeilen: string[]): PdfBlock[] {
  const bloecke: PdfBlock[] = [];
  let aktiv: PdfBlock | null = null;
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
    if (aktivItem) {
      itemPuffer.push(zeile);
    } else {
      if (!aktiv) neuerBlock(null);
      textPuffer.push(zeile);
    }
  }
  flushText();
  flushItem();

  // Füllpunkt-Tarifzeilen je Block in strukturierte Tabelle zerlegen (§1: nur
  // wenn eindeutig Beschreibung…Betrag; sonst Text unverändert).
  for (const b of bloecke) {
    if (!b.text) continue;
    const t = extrahiereTarifTabelle(b.text);
    if (t) {
      b.text = t.vortext;
      b.tabelle = t.tabelle;
    }
  }
  return bloecke.filter(
    (b) => b.text !== '' || (b.items && b.items.length > 0) || (b.tabelle && b.tabelle.length > 0),
  );
}

/**
 * Reiner Parser: zerlegt die serialisierte Textbasis in Artikel (token → Artikel).
 * Der `marker` bestimmt die Artikelgrenze (§ vs. Art./Article premier).
 */
export function extrahiereAllePdfArtikel(
  text: string,
  marker: '§' | 'Art.',
): Record<string, PdfArtikel> {
  const zeilen = text.split('\n');
  const artikel: Record<string, PdfArtikel> = {};

  let aktivToken: string | null = null;
  let aktivZeilen: string[] = [];
  // Hängende Absatznummer: bei TI/VD steht die hochgestellte «1» auf einer
  // EIGENEN Zeile («¶1») unmittelbar VOR der «Art. N»-Kopfzeile. Diese «¶1»
  // gehört zum ERSTEN Absatz des neuen Artikels, nicht zum Ende des vorigen.
  // Wir merken eine reine «¶N»-Zeile (ohne Resttext) als hängend; folgt ein
  // Artikel-Kopf, wird sie dem neuen Artikel vorangestellt, sonst dem alten.
  let haengenderAbsatz: string | null = null;

  const flushHaengend = (): void => {
    if (haengenderAbsatz !== null && aktivToken !== null) {
      aktivZeilen.push(`¶${haengenderAbsatz} `);
    }
    haengenderAbsatz = null;
  };

  const speichere = (): void => {
    if (aktivToken === null) return;
    const bloecke = baueBloecke(aktivZeilen);
    if (bloecke.length > 0 && !(aktivToken in artikel)) {
      artikel[aktivToken] = { bloecke };
    }
  };

  for (const rohZeile of zeilen) {
    const zeile = rohZeile.replace(/\s+$/g, '').trim();

    // Artikel-Kopf?
    let token: string | null = null;
    let nachKopf = '';
    if (marker === '§') {
      const k = zeile.match(PARAGRAF_KOPF);
      if (k) {
        token = normalisiereToken(k[1] + (k[2] ?? ''));
        nachKopf = zeile.slice(k[0].length).trim();
      }
    } else {
      const k = zeile.match(ART_KOPF);
      if (k) {
        token = normalisiereToken(k[1] + (k[2] ?? ''));
        nachKopf = zeile.slice(k[0].length).trim();
      } else if (ART_PREMIER.test(zeile)) {
        token = '1';
        nachKopf = zeile.replace(ART_PREMIER, '').trim();
      }
    }

    if (token !== null) {
      const vorabAbsatz = haengenderAbsatz; // gehört zum NEUEN Artikel
      haengenderAbsatz = null;
      speichere();
      aktivToken = token;
      aktivZeilen = [];
      // Resttext nach dem Kopf bildet den ersten Absatz; eine hängende «¶1»
      // davor liefert dessen Absatznummer.
      if (vorabAbsatz !== null && nachKopf) {
        aktivZeilen.push(`¶${vorabAbsatz} ${nachKopf}`);
      } else {
        if (vorabAbsatz !== null) aktivZeilen.push(`¶${vorabAbsatz} `);
        if (nachKopf) aktivZeilen.push(nachKopf);
      }
      continue;
    }

    // Reine «¶N»-Zeile (Absatznummer ohne Resttext) puffern (s. oben).
    const absM = zeile.match(/^¶(\d+(?:bis|ter)?)\s*$/);
    if (absM) {
      flushHaengend(); // eine evtl. ältere hängende Nummer dem aktiven Artikel geben
      haengenderAbsatz = absM[1];
      continue;
    }

    if (aktivToken === null) {
      haengenderAbsatz = null;
      continue; // Präambel vor dem ersten Artikel
    }
    if (GLIEDERUNG.test(zeile)) {
      flushHaengend();
      continue; // Abschnitts-Überschrift
    }
    if (zeile) {
      flushHaengend();
      aktivZeilen.push(zeile);
    }
  }
  flushHaengend();
  speichere();

  return artikel;
}

/** Liefert NUR den angeforderten token-Artikel oder null (testbare Hülle). */
export function extrahierePdfArtikel(
  text: string,
  token: string,
  marker: '§' | 'Art.',
): PdfArtikel | null {
  return extrahiereAllePdfArtikel(text, marker)[token] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// quelleHash (Drift-Token)
// ─────────────────────────────────────────────────────────────────────────────

export function berechnePdfQuelleHash(artikel: Record<string, PdfArtikel>): string {
  const teile: string[] = [];
  for (const token of Object.keys(artikel).sort()) {
    teile.push(`#${token}`);
    for (const b of artikel[token].bloecke) {
      const items = (b.items ?? []).map((i) => `${i.marke}\t${i.text}`).join('\n');
      const tab = (b.tabelle ?? []).map((z) => `${z.beschreibung}\t${z.betrag}`).join('\n');
      teile.push(`${b.absatz ?? ''}\t${b.text}${items ? `\n${items}` : ''}${tab ? `\n${tab}` : ''}`);
    }
  }
  return createHash('sha256').update(teile.join('\n'), 'utf8').digest('hex');
}

// ─────────────────────────────────────────────────────────────────────────────
// Netz-Hülle
// ─────────────────────────────────────────────────────────────────────────────

const UA = 'Mozilla/5.0 (LexMetrik Normtext-Snapshot)';

/**
 * Holt eine PDF-Quelle (Profil), extrahiert ALLE Artikel und gibt die
 * angeforderten Tokens zurück. meta trägt titel/stand/quelleHash; der quelleHash
 * deckt den GANZEN extrahierten Volltext ab.
 */
export async function holePdf(
  quelleUrl: string,
  profil: PdfProfil,
): Promise<PdfErgebnis> {
  const pdfUrl = profil.pdfUrlAusQuelle(quelleUrl);
  const res = await fetch(pdfUrl, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`PDF ${pdfUrl}: HTTP ${res.status}`);
  const ct = res.headers.get('content-type') ?? '';
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (!ct.includes('pdf') && !(bytes[0] === 0x25 && bytes[1] === 0x50)) {
    throw new Error(`PDF ${pdfUrl}: keine PDF-Antwort (content-type ${ct})`);
  }

  const { zeilen, randText, rohText, titel } = await extrahierePdfZeilen(bytes, profil.marker);
  const textbasis = serialisierePdfZeilen(zeilen);
  const artikel = extrahiereAllePdfArtikel(textbasis, profil.marker);

  // Anhang-Tarif (hierarchische Ziffer-Nummerierung «1.1.1», z. B. SG/LU
  // «…pdf_file_with_annexes») zusätzlich erfassen — der Art./§-Extraktor lässt
  // den Anhang sonst fallen. Konservativ: der Segmentierer liefert nur bei einem
  // echten Ziffer-Anhang (≥ Schwelle) Einträge, sonst leer (reine Artikel-Erlasse
  // bleiben unberührt). §7: Live-Link bleibt massgeblich.
  const anhang = segmentiereAnhangZiffern(textbasis);
  for (const [ziff, e] of Object.entries(anhang)) {
    if (!(ziff in artikel)) artikel[ziff] = e;
  }

  // Stand: zuerst Kopf-/Fussband, dann Titel, dann die Präambel (TI: «(del 30
  // novembre 2010)» / JU: «du 24 mars 2010» stehen NICHT im Kopfband, sondern in
  // den ersten Body-Zeilen vor dem ersten Artikel).
  const praeambel = zeilen.slice(0, 30).map((z) => z.text).join(' ');
  const stand =
    profil.standLeser(randText) ||
    profil.standLeser(titel) ||
    profil.standLeser(praeambel) ||
    // Body als Fallback, dann der UNGEFILTERTE Roh-Volltext: der SZ-«SRSZ
    // D.M.YYYY»-Stempel steht als Marginalie mitten auf der Titelseite (weder Band
    // noch Body). standLeser ist je Profil ein enges Datums-Muster → first match
    // = Konsolidierungsdatum; Fehlgriff praktisch ausgeschlossen.
    profil.standLeser(textbasis) ||
    profil.standLeser(rohText) ||
    '';
  const quelleHash = berechnePdfQuelleHash(artikel);

  // Vollabdeckung (§7): ALLE Artikel zurückgeben; Label einheitlich aus dem
  // Profil-Marker («§ N» SZ / «Art. N» VD/JU).
  const labels: Record<string, string> = {};
  for (const token of Object.keys(artikel)) {
    labels[token] = token.includes('.')
      ? `Anhang Ziff. ${token}`
      : `${profil.marker} ${token.replace(/_/g, '')}`;
  }
  return { meta: { titel, stand, quelleHash }, artikel, labels };
}
