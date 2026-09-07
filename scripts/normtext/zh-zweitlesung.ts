/**
 * scripts/normtext/zh-zweitlesung.ts — UNABHÄNGIGE zweite Lesung eines
 * ZH-Erlass-PDF, Messgrundlage für das Tor `check:zh-vollstaendigkeit`.
 *
 * Sie teilt mit dem Produktions-Adapter (`adapter-zh-pdf.ts`) KEINE Zeile Code
 * (§6.7 lit. d — ein Tor, das die Logik benutzt, die es absichern soll, ist
 * keins): Zeilen entstehen hier über eine grobe y-Toleranz statt exakter
 * Rundung, Fragmente werden stumpf mit Leerzeichen verkettet statt geometrisch,
 * und die Köpfe erkennt ein Muster, dem der Abstand egal ist.
 *
 * Zwei Modellentscheide teilt sie bewusst und dokumentiert:
 *   · Body-Spalte — ohne sie zählte sie Randnoten («b. Ausserhalb hängiger
 *     Verfahren») als lit.-Positionen mit.
 *   · Grenze zum Schluss­apparat — ohne sie zählte sie die zweite, bei 1 neu
 *     beginnende §-Zählung der Übergangsbestimmungen mit (ZH-700.1: 34
 *     doppelte Nummern).
 * Beide sind durch Unit-Tests am Adapter gedeckt, nicht durch dieses Tor.
 *
 * §2: rein und deterministisch bis auf den pdfjs-Aufruf (kein Netz, kein FS).
 */

// ── Zweitlesung: PDF-Textlayer → Zeilen ──────────────────────────────────────

interface Stueck {
  x: number;
  y: number;
  h: number;
  s: string;
  /** pdfjs-Schriftkennung (dokument-lokal), für die Titel-Schrift-Bedingung. */
  f?: string;
}

/** Grobe y-Toleranz (pt): alles innerhalb davon ist EINE Zeile. Hochstellungen
 *  (2.76 pt über der Grundlinie) fallen damit in ihre Zeile, ohne dass das Tor
 *  etwas über Hochstellungen wissen müsste. Der Zeilenabstand ist ≈10.2 pt. */
const ZEILE_TOLERANZ = 4;

/** Obergrenze der Fussnoten-Ziffer. NICHT als alleiniges Merkmal brauchbar:
 *  die Klassen berühren sich (Fussnoten-Ziffern 4.32/4.62/4.92, aber ZH-211.1
 *  S. 24 setzt eine echte Absatzzahl mit 5.04). Massgeblich ist zusätzlich die
 *  Grundschrift der Trägerzeile (Fussnote ≈ 7.98 gegen Body ≈ 9.18). */
const APPARAT_H = 5.2;
/** Grösste Grundschrift, die noch Fussnoten-/Kleinsatz ist. */
const KLEINSATZ_H = 8.5;

const KOPF_PARAGRAF =
  /^§\s*(\d+)\s*([a-z])?\s*(bis|ter|quater|quinquies)?\s*\./;
const KOPF_ARTIKEL =
  /^Art\.\s*(\d+)\s*([a-z])?\s*(bis|ter|quater|quinquies)?(?=\s|$)/;
/** lit.-Zeile — auch die NACKTE, aufgehobene Marke («d.» allein auf der Zeile,
 *  ZH-230 § 194, ZH-631.1 § 23). Das alte Muster verlangte ein Leerzeichen nach
 *  dem Punkt und zählte sie darum nicht mit; die exakte lit.-Deckung wäre damit
 *  systematisch um die aufgehobenen Buchstaben danebengelegen. */
const LIT_ZEILE = /^[a-z]\.(?:\s|$)/;
const SCHLUSSAPPARAT = /^(?:Übergangs|Schluss)bestimmung(?:en)?\b/;
const ANHANG_TITEL = /^Anhang(?:\s*\d*)?(?::|$)/;

/**
 * §§-SAMMELZEILE (Härtung nach Befund B-4, Gegenprüfung Runde 2, 31.8.2026).
 *
 * `KOPF_PARAGRAF` verlangt ein einzelnes «§» und sah die Sammel-Aufhebungsköpfe
 * darum nie — genau die blinde Stelle, die der Produktions-Adapter hatte. Die
 * Mengengleichheit (Prüfung 1) war deshalb TRÜGERISCH grün: was beide Seiten
 * nicht lesen, fehlt beiden Seiten gleich.
 *
 * Bewusst NUR die Textgestalt, ohne den Kopf-Einzug, den der Adapter benutzt
 * (§6.7 lit. d — sonst wäre die Prüfung ein Spiegel des Geprüften). Die
 * Zeile muss mit «§§» beginnen, eine reine Nennungsliste tragen und mit dem
 * Punkt ENDEN; damit fallen Querverweise im Satz («… nach §§ 88–90. Davon
 * ausgenommen …», «§§ 156–159 GG,») heraus, ohne Geometrie zu bemühen. Der
 * verbleibende Unterschied zum Adapter (ZH-331 § 17 «Vorbehalten bleiben
 * §§ 23–23 b und 35 b.») ist harmlos: das Tor verlangt nur, dass die genannten
 * §§ im Snapshot VORKOMMEN — dort stehen sie als echte Artikel.
 */
const SAMMEL_ZEILE_ZWEIT =
  /^§§\s*\d+\s*[a-z]?\s*(?:bis|ter|quater|quinquies)?(?:\s*[–—−-]\s*|\s*,\s*|\s+und\s+)[\d\sa-z–—−,.]*\.$/;

/** Hochgestellte Absatznummer — inkl. lat. Suffix (Befund B-1: das alte Muster
 *  /^\d+$/ kannte ihn nicht, also konnte das Tor den Verlust nicht sehen). */
const ABSATZ_HOCHZAHL_ZWEIT = /^\d+(?:bis|ter|quater|quinquies)?$/;

/**
 * EINHEITEN-EXPONENT der Zweitlesung (Befund B1, Fix-Runde 4, 31.8.2026).
 *
 * Der Adapter warf mit den Fussnoten-Hochzahlen auch die Einheiten-Exponenten
 * weg («1000 m²» → «1000 m») — und KEINE Prüfung sah es: die Hochzahl ist
 * keine \d-Ziffernfolge im Snapshot (Prüfung 7/7b blind), und der Zeichen-
 * verlust von 1 Zeichen liegt weit über der 7c-Untergrenze. Die Zweitlesung
 * erhebt den Exponenten darum UNABHÄNGIG und Prüfung 9 hält ihn gegen den
 * Snapshot-Text.
 *
 * UNABHÄNGIGE MECHANIK (§6.7 lit. d): der Adapter entscheidet an der
 * GEOMETRISCHEN Wort-Lücke (x-Abstand gegen die Fragment-Breite), die
 * Zweitlesung an der FRAGMENT-ORDNUNG der x-sortierten Zeile — sie kennt
 * keine Breiten. GETEILTE MODELLENTSCHEIDUNG (offen deklariert, wie die drei
 * im Modulkopf): «eine hochgestellte 2/3 unmittelbar nach einem
 * Einheiten-Token mit vorangehender Zahl ist ein Exponent» — das ist die
 * fachliche Regel selbst, empirisch total am Bestand (3 Exponenten, 25
 * Fussnoten-Verweise nach Wörtern/Abkürzungen, 0 Grenzfälle).
 */
const EINHEIT_ZWEIT = /(?:^|\d\s?)(mm|cm|dm|km|m)$/;

export function einheitenExponentenInZeile(
  zeile: Array<{ x: number; h: number; s: string }>,
): string[] {
  const raus: string[] = [];
  for (let i = 1; i < zeile.length; i++) {
    const st = zeile[i];
    if (st.h >= 7 || st.h <= APPARAT_H) continue; // keine Body-Hochstellung
    const ziffer = st.s.trim();
    if (ziffer !== '2' && ziffer !== '3') continue;
    const links = zeile[i - 1];
    if (links.h < 8.7) continue; // linker Nachbar muss Body sein
    const linksText = links.s.trimEnd();
    const einheit = linksText.match(EINHEIT_ZWEIT);
    if (!einheit) continue;
    // Standalone-Einheit («m» als EIGENES Fragment, ZH-700.1 § 303): die
    // vorangehende Zahl muss dann im Fragment davor stehen.
    if (linksText === einheit[1]) {
      const davor = zeile[i - 2];
      if (davor === undefined || davor.h < 8.7 || !/\d$/.test(davor.s.trimEnd())) continue;
    }
    raus.push(`${einheit[1]}${ziffer}`);
  }
  return raus;
}

/**
 * ÜBERSCHRIFTS-VERDACHT für die Regionen-Messung (Härtung 2).
 *
 * Eine Gliederungs-Überschrift steht im PDF, aber nicht im Snapshot. Für die
 * Zeichen- und Zahlen-Messung je Region muss die Zweitlesung sie darum
 * auslassen — sonst meldete jede Region eine Differenz.
 *
 * BEWUSST UNABHÄNGIG vom Adapter (§6.7 lit. d): der Adapter entscheidet an der
 * SCHRIFT, hier entscheidet allein die TEXTGESTALT — Zähler oder Buchstabe,
 * Punkt, ein grossgeschriebener Titel, KEIN Satzschlusspunkt, und höchstens
 * acht Wörter. Die beiden Wege können auseinanderlaufen; genau das ist der
 * Zweck. Ein Auseinanderlaufen kostet hier nur Toleranz-Spielraum, nie einen
 * stillen Durchlass: was die Zweitlesung fälschlich als Überschrift auslässt,
 * FEHLT ihr danach — und lässt die Region ZU KLEIN aussehen, was rot wird,
 * nicht grün.
 */
const UEBERSCHRIFT_GESTALT =
  /^(?:\d+(?:bis|ter|quater|quinquies)?|[A-Z](?:bis|ter|quater|quinquies)?|[IVXLC]+)\.\s+[A-ZÄÖÜ].{0,70}$/;

/** Ein Titel schliesst NIE mit Satzzeichen ab. Genau das trennt ihn von der
 *  kurzen, gross beginnenden Aufzählungszeile — «1. Wahrsagen, insbesondere
 *  Traumdeuten oder Kartenschlagen,» (ZH-331 § 5 lit. a Ziff. 1) ist Normtext
 *  und muss in der Messung bleiben. */
/**
 * Marken-Gestalt einer Gliederungs-Überschrift: Zähler/Buchstabe + Punkt +
 * Leerzeichen. Zusammen mit der TITEL-SCHRIFT (s. `titelSchriftJeSeite`) ist
 * das die dritte und letzte Bedingung, unter der die Zweitlesung eine Zeile aus
 * der Regionen-Messung nimmt.
 *
 * DRITTE GETEILTE MODELLENTSCHEIDUNG (offen deklariert, s. Modulkopf): Dass
 * eine Überschrift an der Schrift erkennbar ist, teilt die Zweitlesung hier mit
 * dem Adapter. Sie prüft damit NICHT mehr unabhängig, ob die Unterscheidung
 * Überschrift/Aufzählung richtig getroffen wurde — das leisten Prüfung 6
 * (Gliederungstitel im Snapshot-Text) und die beidseitigen Unit-Tests am
 * Adapter. Für den ZWECK der Regionen (einen WERT an seinen § binden) ist die
 * Teilung folgenlos: eine falsch ausgelassene Überschrift fehlt BEIDEN Seiten
 * gleich, und keine Wert-Mutation kann sich dahinter verstecken.
 *
 * Ohne diese Bedingung wäre die Messung unbrauchbar: die Tarif-Tabellen in
 * ZH-211.11 § 3/§ 4 und ZH-215.3 § 4 stehen VOLLSTÄNDIG in der Titel-Schrift.
 * Sie tragen aber keine Marken-Gestalt («bis 1 000 25% des Streitwertes …»)
 * und bleiben darum in der Messung — wo sie hingehören.
 */
const MARKEN_GESTALT =
  /^(?:\d+(?:bis|ter|quater|quinquies)?|[A-Z](?:bis|ter|quater|quinquies)?|[IVXLC]+)\.\s/;

const DATUM_ZEILE =
  /^\d+\.\s+(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\b/;

export function istUeberschriftsGestalt(text: string): boolean {
  // Eine umbrochene Fliesstext-Zeile, die mit einem DATUM beginnt, sieht wie
  // eine Überschrift aus: «23. Juni 1831 sowie die §§ 8–10 des Gesetzes über
  // die Konflikte vom» (ZH-175.2 § 96), «31. Dezember 1985 bereits bestand und
  // nach Gesetz, Statuten oder» (ZH-631.1 § 272). Sie ist Normtext.
  if (DATUM_ZEILE.test(text)) return false;
  return UEBERSCHRIFT_GESTALT.test(text) && !/[.,;:]$/.test(text);
}

/** Gliederungs-Überschrift der zählenden Form (Befund B-3). Unabhängig vom
 *  Adapter formuliert: hier reicht das Vorkommen IRGENDWO im Snapshot-Text als
 *  Verdacht, dort entscheidet der Zeilenanfang. */
export const GLIEDERUNG_IM_TEXT =
  /(?:^|\s)(?:\d+|[IVXLC]+|(?:Ers|Zwei|Drit|Vier|Fünf|Sechs|Sieb|Sieben|Ach|Neun|Zehn|Elf|Zwölf)ter)\.?\s+(?:Kapitel|Abschnitt|Unterabschnitt|Teil|Titel|Abteilung):/;

export interface Zweitlesung {
  /** Kopf-Token in Reihenfolge des Auftretens, dedupliziert. */
  koepfe: string[];
  /** Zahl der Zeilen, die mit einer lit.-Marke beginnen. */
  litZeilen: number;
  /** Zahl der hochgestellten reinen Ziffern links vom Zeilentext. */
  absatzKandidaten: number;
  /** §-Tokens, die eine §§-Sammelzeile nennt (Bereiche aus reinen Zahlen
   *  ausgezählt, gemischte Grenzen nur mit ihren Endpunkten). */
  sammelTokens: string[];
  /** Zahlen-SPANNEN der genannten Bereiche («§§ 74–80 d.» → {von:74,bis:80}).
   *  Das Tor akzeptiert jeden Snapshot-Eintrag, dessen Nummer darin liegt: die
   *  Zweitlesung zählt bewusst konservativ aus (sie rät keine Zwischenstufen),
   *  der Adapter darf mehr auffüllen — nur NICHTS ausserhalb. */
  sammelSpannen: Array<{ von: number; bis: number }>;
  /** Absatz-Hochzahlen MIT lat. Suffix, je §-Token («7» → ['1bis','1ter']). */
  suffixAbsaetze: Record<string, string[]>;
  /** Einheiten-Exponenten je §-Token («303» → ['m2']) — Grundlage der
   *  Prüfung 9 (Befund B1: der Adapter verwarf «m²» als Fussnoten-Verweis). */
  einheitenExponenten: Record<string, string[]>;
  /** Alle Ziffernfolgen des ganzen Dokuments (Werte-Wächter, Prüfung 7).
   *  Bewusst OHNE Schlussapparat-/Fussnoten-Schnitt: das ist die Obermenge,
   *  gegen die der Snapshot ⊆ sein muss. */
  zahlen: Set<string>;
  /**
   * Je §-REGION (Härtung 2, Prüfungen 7b/7c): alles zwischen einem Kopf und dem
   * nächsten. Die grobe Obermenge `zahlen` liess drei Mutationsklassen durch,
   * weil eine anderswo im Dokument vorkommende Zahl jede Fälschung deckte:
   * Werte-TAUSCH innerhalb einer Tarif-Tabelle (1 050 ↔ 3 150), Prozentsatz-
   * ERSATZ (14 % → 8 %) und Staffelgrenzen-ERSATZ. Die Region bindet den Wert
   * an seinen §; die REIHENFOLGE bindet ihn an seine Stelle.
   */
  regionen: Record<string, RegionMass>;
  /** Punkt-Ziffern des Anhangs («1.2.1»), aus der Ziffern-Spalte gelesen —
   *  Grundlage der Anhang-Kopfprüfung (M13). */
  anhangZiffern: string[];
  /** lit.-Zeilen je §-Token (exakte Deckung statt Erlass-Quote). */
  litJeKopf: Record<string, number>;
}

/** Messwerte EINER §-Region der Zweitlesung. */
export interface RegionMass {
  /** Ziffernfolgen der Region in LESEREIHENFOLGE (Multimenge + Position). */
  zahlen: string[];
  /** Zeichenzahl des Body-Textes der Region (ohne Trennstriche/Leerraum). */
  zeichen: number;
}

function token(m: RegExpMatchArray): string {
  return [m[1], m[2], m[3]].filter(Boolean).map((t) => t.toLowerCase()).join('_');
}

/**
 * §§ einer Sammelzeile auszählen — UNABHÄNGIG von `expandiereSammelbereich`
 * nachgebaut (§6.7 lit. d) und bewusst konservativer: nur reine Zahlenspannen
 * werden aufgefüllt, jede andere Grenze zählt nur mit sich selbst. Das Tor
 * verlangt damit nie mehr, als der Kopf ohne Raten hergibt.
 */
export function sammelTokensAus(zeile: string): {
  tokens: string[];
  spannen: Array<{ von: number; bis: number }>;
} {
  const liste = zeile.replace(/^§§\s*/, '').replace(/\s*\.$/, '');
  const raus: string[] = [];
  const spannen: Array<{ von: number; bis: number }> = [];
  const nimm = (t: string): void => {
    if (t && !raus.includes(t)) raus.push(t);
  };
  const lies = (roh: string): { zahl: number; rest: string } | null => {
    const m = roh.trim().match(/^(\d+)\s*([a-z])?\s*(bis|ter|quater|quinquies)?$/);
    if (!m) return null;
    return {
      zahl: Number(m[1]),
      rest: [m[1], m[2], m[3]].filter(Boolean).join('_'),
    };
  };
  for (const teil of liste.split(/\s*,\s*|\s+und\s+/)) {
    const grenzen = teil.trim().split(/\s*[–—−-]\s*/);
    if (grenzen.length === 1) {
      const g = lies(grenzen[0]);
      if (g) nimm(g.rest);
      continue;
    }
    const von = lies(grenzen[0]);
    const bis = lies(grenzen[grenzen.length - 1]);
    if (!von || !bis) continue;
    nimm(von.rest);
    nimm(bis.rest);
    if (bis.zahl >= von.zahl && bis.zahl - von.zahl <= 100) {
      spannen.push({ von: von.zahl, bis: bis.zahl });
    }
    const reinZahlig = von.rest === String(von.zahl) && bis.rest === String(bis.zahl);
    if (reinZahlig && bis.zahl > von.zahl && bis.zahl - von.zahl <= 100) {
      for (let n = von.zahl; n <= bis.zahl; n++) nimm(String(n));
    }
  }
  return { tokens: raus, spannen };
}

/**
 * Zweitlesung eines ZH-PDF (exportiert, damit sie gegen echte Bytes getestet
 * werden kann, ohne den Netzpfad zu fahren).
 */
export async function leseZweit(bytes: Uint8Array): Promise<Zweitlesung> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: bytes, useSystemFonts: true }).promise;

  const parKoepfe: string[] = [];
  const artKoepfe: string[] = [];
  let litZeilen = 0;
  let absatzKandidaten = 0;
  let imSchluss = false;
  const sammelTokens: string[] = [];
  const sammelSpannen: Array<{ von: number; bis: number }> = [];
  const suffixAbsaetze: Record<string, string[]> = {};
  const einheitenExponenten: Record<string, string[]> = {};
  const zahlen = new Set<string>();
  // BEIDE Zählweisen bekommen ihre EIGENE Regionen-/lit.-Buchführung; welche
  // gilt, entscheidet erst der Schluss (s. unten). Vorher hing die Region am
  // zuletzt gesehenen Kopf GLEICH WELCHER Art — und in einem «§»-Erlass reisst
  // jede umbrochene Zeile, die mit «Art. 260 a Abs. 1 …» beginnt, eine
  // Schein-Region auf, in der der Rest der Bestimmung verschwindet
  // (ZH-230 § 34: die Hälfte der Aufzählung fehlte der Messung).
  const regionenPar: Record<string, RegionMass> = {};
  const regionenArt: Record<string, RegionMass> = {};
  const litParJeKopf: Record<string, number> = {};
  const litArtJeKopf: Record<string, number> = {};
  const anhangZiffern: string[] = [];
  // Laufender Kopf, um Suffix-Absaetze ihrem § zuzuordnen.
  let laufenderKopf: string | null = null;
  let laufenderPar: string | null = null;
  let laufenderArt: string | null = null;

  /** Einheiten-Exponenten der x-sortierten Zeile dem laufenden Kopf zuschlagen
   *  (Prüfung 9, Befund B1). */
  const merkeExponenten = (zeile: Stueck[]): void => {
    if (laufenderKopf === null) return;
    for (const t of einheitenExponentenInZeile(zeile)) {
      (einheitenExponenten[laufenderKopf] ??= []).push(t);
    }
  };

  /** Text beiden Regionen-Büchern zuschlagen (aufgelöst wird am Ende). */
  const zurRegion = (text: string): void => {
    zuBuch(regionenPar, laufenderPar, text);
    zuBuch(regionenArt, laufenderArt, text);
  };
  const zuBuch = (
    buch: Record<string, RegionMass>,
    kopf: string | null,
    text: string,
  ): void => {
    if (kopf === null) return;
    const r = (buch[kopf] ??= { zahlen: [], zeichen: 0 });
    // Ein aufgehobener Ziffern-BEREICH «12.–14.» steht im PDF als Spanne, im
    // Snapshot als drei Platzhalter-items 12/13/14. Damit die Zahlenfolgen
    // vergleichbar bleiben, wird die Spanne hier ausgezählt — dieselbe
    // Deklaration wie beim Sammel-Aufhebungskopf, nur eine Ebene tiefer.
    const spanne = text.trim().match(/^(\d+)\.\s*[–—−-]\s*(\d+)\.$/);
    if (spanne && Number(spanne[2]) > Number(spanne[1]) && Number(spanne[2]) - Number(spanne[1]) <= 50) {
      for (let n = Number(spanne[1]); n <= Number(spanne[2]); n++) r.zahlen.push(String(n));
      r.zeichen += text.replace(/[\s\u00AD\u2010\u2011-]/g, '').length;
      return;
    }
    for (const z of text.match(/\d+/g) ?? []) r.zahlen.push(z);
    // Zeichen OHNE Leerraum und OHNE Trennstriche: der Adapter fügt die
    // Silbentrennung zusammen und normalisiert den Leerraum, die Zweitlesung
    // nicht. Beides herauszurechnen ist billiger und ehrlicher, als eine
    // Toleranz dafür zu erfinden.
    r.zeichen += text.replace(/[\s\u00AD\u2010\u2011-]/g, '').length;
  };

  // Werte-Waechter (Pruefung 7): ALLE Ziffernfolgen des Dokuments, ohne jeden
  // Schnitt — die Obermenge, gegen die der Snapshot Teilmenge sein muss.
  for (let p = 1; p <= doc.numPages; p++) {
    const inhalt = await (await doc.getPage(p)).getTextContent();
    for (const it of inhalt.items) {
      const item = it as { str: string };
      if (!item.str) continue;
      for (const z of item.str.match(/\d+/g) ?? []) zahlen.add(z);
    }
  }

  for (let p = 1; p <= doc.numPages && !imSchluss; p++) {
    const inhalt = await (await doc.getPage(p)).getTextContent();
    const roh: Stueck[] = [];
    for (const it of inhalt.items) {
      const item = it as { str: string; transform: number[]; height?: number; fontName?: string };
      if (!item.str || !item.str.replace(/\s/g, '')) continue;
      const y = item.transform[5];
      const h = item.height ?? 9;
      if (y < 60 || y > 530 || h >= 11) continue;
      roh.push({ x: item.transform[4], y, h, s: item.str, f: item.fontName });
    }
    const bodyX = roh.filter((s) => s.h >= 8.7).map((s) => s.x);
    if (bodyX.length === 0) continue;
    const links = Math.min(...bodyX);
    // Body-Spalte: die Randnoten liegen im Aussenrand, links davon oder weit
    // rechts. Ohne diesen Schnitt zählte das Tor Randnoten wie «b. Ausserhalb
    // hängiger Verfahren» als lit.-Positionen mit.
    // BREITE (Korrektur Härtung 2): der Body-Satzspiegel ist ~278 pt breit —
    // gemessen an allen 24 PDF. Die alte Grenze `links + 260` schnitt damit die
    // letzten ~18 pt JEDER Zeile ab; für die blossen ZÄHLUNGEN (Köpfe, lit.)
    // fiel das nie auf, für die Zahlenfolge je Region schon («… mehr als 400
    // 000 Franken» verlor das «000»). Die Randnote bleibt weiterhin draussen:
    // sie steht im Kleinsatz (h ≤ 7.7) und im Aussenrand (rechts x ≈ 337,
    // links x ≈ 28), also ausserhalb beider Grenzen.
    // FENSTER-BREITE je Höhenklasse (präzisiert Runde 4, Befund B1):
    //   · Body (h ≥ 8.7) und Tarif-Kleinsatz (h ≈ 7.98): voller Satzspiegel
    //     (300 pt, s. Kommentar oben).
    //   · Randnoten-Klasse (7 < h ≤ 7.7, h ≈ 7.5): 250 pt — sie stehen im
    //     Aussenrand (rechts x ≈ 337) und sind kein Normtext.
    //   · Body-HOCHSTELLUNGEN (APPARAT_H < h < 7, h ≈ 5.70): ebenfalls voller
    //     Satzspiegel. Das alte Pauschal-Fenster «h ≤ 7.7 → 250» warf die
    //     Hochstellungen am RECHTEN Zeilenende weg — genau dort steht der
    //     Einheiten-Exponent («1000 m²» ZH-700.1 § 239a: x = 328.9 bei
    //     links = 53.8; «10 m².» § 303: x = 354.8 bei links = 87.8). Die
    //     Randnoten-Fussnoten-Ziffern im Aussenrand bleiben draussen: sie
    //     stehen in Apparat-Grösse (h ≤ 5.2) und behalten das 250-pt-Fenster.
    const spalte = roh.filter((s) => {
      const hochstellung = s.h < 7 && s.h > APPARAT_H;
      const schmal = s.h <= 7.7 && !hochstellung;
      return s.x >= links - 6 && s.x <= links + (schmal ? 250 : 300);
    });
    // Zeilen bilden: y-Cluster mit Toleranz, absteigend. Die Hochstellung fällt
    // dabei in ihre Trägerzeile, ohne dass dieses Modul etwas über
    // Hochstellungen wissen müsste.
    const sortiert = [...spalte].sort((a, b) => b.y - a.y);
    const alleZeilen: Stueck[][] = [];
    for (const st of sortiert) {
      const letzte = alleZeilen[alleZeilen.length - 1];
      if (letzte && letzte[0].y - st.y <= ZEILE_TOLERANZ) letzte.push(st);
      else alleZeilen.push([st]);
    }

    // Fussnoten-Apparat am Seitenfuss abschneiden: erste Zeile, die mit einer
    // kleinen Hochzahl beginnt UND deren übriger Satz Kleinsatz ist. Die
    // Ziffernhöhe allein trägt nicht — sie überschneidet sich mit echten
    // Absatzzahlen (ZH-211.1 S. 24: Absatzzahl h = 5.04).
    let apparatAb = alleZeilen.length;
    for (let i = 0; i < alleZeilen.length; i++) {
      const zeile = [...alleZeilen[i]].sort((a, b) => a.x - b.x);
      const hoch = zeile.filter((s) => s.h <= APPARAT_H);
      if (hoch.length === 0 || hoch[0] !== zeile[0]) continue;
      const rest = zeile.filter((s) => s.h > APPARAT_H);
      if (rest.length > 0 && rest.every((s) => s.h <= KLEINSATZ_H)) {
        apparatAb = i;
        break;
      }
    }
    const zeilen = alleZeilen.slice(0, apparatAb);

    // Dominante Body-Schrift DIESER Seite, nach FRAGMENTZAHL (der Adapter
    // rechnet dokumentweit nach Zeichenzahl — bewusst eine andere Rechnung).
    const schriftZaehler = new Map<string, number>();
    for (const zeile of zeilen) {
      for (const st of zeile) {
        if (st.h < 8.7 || st.f === undefined) continue;
        schriftZaehler.set(st.f, (schriftZaehler.get(st.f) ?? 0) + 1);
      }
    }
    const seitenSchrift = [...schriftZaehler.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    let titelKette = 0;

    for (const zeile of zeilen) {
      zeile.sort((a, b) => a.x - b.x);
      const body = zeile.filter((s) => s.h >= 8.7);
      if (body.length === 0) {
        // Tarif-/Tabellenzeile (h ≈ 7.98): für Kopf- und lit.-Erkennung
        // uninteressant, für die WERTE aber die wichtigste Zeile überhaupt —
        // ZH-211.11 § 3/§ 4 und ZH-215.3 § 4 bestehen fast nur daraus. Die
        // Fussnoten-Definitionen desselben Kleinsatzes sind vorher am
        // Apparat-Schnitt weggefallen; die Randnoten am Spalten-Schnitt.
        zurRegion(
          zeile
            .filter((st) => st.h >= 7)
            .map((st) => st.s)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim(),
        );
        continue;
      }
      const text = zeile.map((s) => s.s).join(' ').replace(/\s+/g, ' ').trim();
      // BODY-Text der Zeile: ohne die Hochstellungen (Absatznummern und
      // Fussnoten-Verweise, h ≈ 5.7 bzw. ≤ 5.0). Der Snapshot trägt beide nicht
      // im Blocktext — die Absatznummer steht im Feld `absatz`, der
      // Fussnoten-Verweis wird verworfen. Ohne diesen Schnitt bestünde die
      // Zahlenfolge JEDER Region grösstenteils aus Absatznummern.
      const textBody = zeile
        .filter((st) => st.h >= 7)
        .map((st) => st.s)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (SCHLUSSAPPARAT.test(text) || ANHANG_TITEL.test(text)) {
        imSchluss = true;
        break;
      }
      // §§-Sammelzeile (Härtung B-4): die §§, die sie nennt, MÜSSEN im
      // Snapshot vorkommen — als Platzhalter oder als echter Artikel.
      // Die amtliche Fussnoten-Ziffer hängt hinter dem Schlusspunkt in derselben
      // y-Zeile («§§ 45–47. 51») und wird davor abgestreift; ohne das griffe die
      // Gestalt-Prüfung bei keinem Kopf mit Änderungs-Fussnote.
      const ohneFussnote = text.replace(/\s*\d+(?:\s*,\s*\d+)*$/, '');
      if (SAMMEL_ZEILE_ZWEIT.test(ohneFussnote)) {
        const aus = sammelTokensAus(ohneFussnote);
        for (const t of aus.tokens) {
          if (!sammelTokens.includes(t)) sammelTokens.push(t);
        }
        sammelSpannen.push(...aus.spannen);
        continue;
      }
      // Beide Zählweisen sammeln und erst am Ende entscheiden (s. unten) —
      // ein «§»-Erlass enthält umbrochene Zeilen, die mit «Art. 957 Abs. 2
      // ZGB» beginnen, und ein «Art.»-Erlass umgekehrt.
      const par = text.match(KOPF_PARAGRAF);
      if (par && !parKoepfe.includes(token(par))) {
        // KEINE WIEDERERÖFFNUNG (wie im Adapter): «… als Einzelgericht gemäss |
        // § 31.» bricht so um, dass der Quer­verweis am Zeilenanfang steht und
        // wie ein Kopf aussieht (ZH-211.1 § 150). Ein zweites Mal denselben
        // Kopf zu öffnen hängte den Rest von § 150 an die Region von § 31 —
        // beide Messungen wurden dadurch falsch.
        parKoepfe.push(token(par));
        laufenderKopf = token(par);
        laufenderPar = token(par);
        // Der Resttext HINTER dem Kopf ist bereits Normtext des neuen § und
        // gehört in seine Region («§ 4. Die Gebühren betragen:»). Die
        // Kopf-Nummer selbst NICHT — sie steht im Snapshot im Feld `artikel`,
        // nicht im Blocktext. Abgestreift wird NUR im Buch der zugehörigen
        // Zählweise: für ein «Art.»-Buch ist «§ 4.» gewöhnlicher Text.
        zuBuch(regionenPar, laufenderPar, textBody.replace(KOPF_PARAGRAF, ''));
        zuBuch(regionenArt, laufenderArt, textBody);
        merkeExponenten(zeile);
        continue;
      }
      const art = text.match(KOPF_ARTIKEL);
      if (art && !artKoepfe.includes(token(art))) {
        artKoepfe.push(token(art));
        laufenderKopf = token(art);
        laufenderArt = token(art);
        // Umgekehrt: in einem «§»-Erlass ist eine Zeile, die mit «Art. 260 a
        // Abs. 1 …» beginnt, schlicht der Umbruch eines Satzes. Ihre Zahlen
        // gehören ungekürzt in die §-Region — vorher fehlten sie dort
        // (ZH-851.1 § 47b «Art. 29», ZH-230 § 34 «Art. 260 a», § 44 «Art. 885»).
        zuBuch(regionenArt, laufenderArt, textBody.replace(KOPF_ARTIKEL, ''));
        zuBuch(regionenPar, laufenderPar, textBody);
        merkeExponenten(zeile);
        continue;
      }
      // Gliederungs-Überschrift: steht im PDF, nie im Snapshot → nicht messen.
      const nurTitelSchrift =
        seitenSchrift !== undefined &&
        zeile.filter((st) => st.h >= 7).every((st) => st.f !== undefined && st.f !== seitenSchrift);
      const istTitel =
        istUeberschriftsGestalt(text) ||
        GLIEDERUNG_IM_TEXT.test(text) ||
        (nurTitelSchrift && MARKEN_GESTALT.test(text));
      if (istTitel) {
        titelKette = 1;
        continue;
      }
      // Fortsetzungszeile eines Titels (höchstens zwei, s. Adapter-Deckel).
      if (nurTitelSchrift && titelKette > 0 && titelKette <= 2) {
        titelKette++;
        continue;
      }
      titelKette = 0;
      if (LIT_ZEILE.test(text)) {
        litZeilen++;
        if (laufenderPar !== null) {
          litParJeKopf[laufenderPar] = (litParJeKopf[laufenderPar] ?? 0) + 1;
        }
        if (laufenderArt !== null) {
          litArtJeKopf[laufenderArt] = (litArtJeKopf[laufenderArt] ?? 0) + 1;
        }
      }
      zurRegion(textBody);
      merkeExponenten(zeile);
      const ersteBodyX = body[0].x;
      const hochzahlen = zeile.filter(
        (s) =>
          s.h < 7 &&
          s.h > APPARAT_H &&
          ABSATZ_HOCHZAHL_ZWEIT.test(s.s.trim()) &&
          s.x < ersteBodyX,
      );
      absatzKandidaten += hochzahlen.length;
      // Suffix-Absätze je § festhalten (Härtung B-4 lit. b): sie waren dem Tor
      // bisher unsichtbar, weil das Muster nur nackte Ziffern kannte.
      if (laufenderKopf !== null) {
        for (const s of hochzahlen) {
          const nr = s.s.trim();
          if (/^\d+$/.test(nr)) continue;
          const liste = (suffixAbsaetze[laufenderKopf] ??= []);
          if (!liste.includes(nr)) liste.push(nr);
        }
      }
    }
  }
  // ── ANHANG-ZIFFERN (Härtung 2, Prüfung 8) ──────────────────────────────────
  // Der Anhang-Tarif (ZH-243) trägt 132 Einträge mit Punkt-Ziffern «1.2.1». Für
  // die Kopf-Prüfungen 1 und 4 waren sie unsichtbar (`paragrafTokens` filterte
  // jeden Token mit Punkt heraus) — 88 % des grössten ZH-Anhangs standen damit
  // unbewacht. Eine Mutation, die 40 Tarif-Ziffern löscht, blieb grün.
  //
  // Unabhängige Lesart (§6.7 lit. d): eine Anhang-Ziffer ist das ERSTE Fragment
  // ihrer Zeile und besteht ausschliesslich aus Zahl-Punkt-Zahl. Die Verweise
  // in der rechten Spalte haben dieselbe Gestalt, stehen aber nie an erster
  // Stelle einer Zeile — kein Geometrie-Modell nötig, nur die Fragment-Ordnung.
  const ZIFFER_TOKEN = /^\d+(?:\.\d+)+$/;
  let imAnhang = false;
  for (let p = 1; p <= doc.numPages; p++) {
    const inhalt = await (await doc.getPage(p)).getTextContent();
    const roh: Stueck[] = [];
    for (const it of inhalt.items) {
      const item = it as { str: string; transform: number[]; height?: number };
      if (!item.str || !item.str.replace(/\s/g, '')) continue;
      const y = item.transform[5];
      const h = item.height ?? 9;
      if (y < 60 || y > 530 || h >= 11) continue;
      roh.push({ x: item.transform[4], y, h, s: item.str });
    }
    const sortiert = [...roh].sort((a, b) => b.y - a.y);
    const alleZeilen: Stueck[][] = [];
    for (const st of sortiert) {
      const letzte = alleZeilen[alleZeilen.length - 1];
      if (letzte && letzte[0].y - st.y <= ZEILE_TOLERANZ) letzte.push(st);
      else alleZeilen.push([st]);
    }
    for (const zeile of alleZeilen) {
      zeile.sort((a, b) => a.x - b.x);
      const text = zeile.map((st) => st.s).join(' ').replace(/\s+/g, ' ').trim();
      if (!imAnhang) {
        if (ANHANG_TITEL.test(text)) imAnhang = true;
        continue;
      }
      // Die Ziffer kommt aus pdfjs teils in MEHREREN Fragmenten («1.1.2» +
      // «.1»). Darum die führenden rein-numerischen Fragmente aneinanderhängen,
      // bis das erste Text-Fragment kommt.
      // pdfjs liefert die Ziffer in DREI Gestalten (an ZH-243 gemessen):
      //   «1.1.2»                                    eigenes Fragment
      //   «1.1.2» + «.1»                             über zwei Fragmente
      //   «1.1.2.1 Unentgeltliche Abtretung von …»   mit der Beschreibung in EINEM
      // Darum: führenden Zahl-Punkt-Lauf des ersten Fragments nehmen und nur
      // dann weiterjoinen, wenn das Fragment ohne Trenner endete.
      let tok = '';
      for (const st of zeile) {
        const t = st.s.trim();
        if (tok === '') {
          const m = t.match(/^(\d+(?:\.\d+)*)(\s|$)/);
          if (!m) break;
          tok = m[1];
          // Endete das Fragment mit Leerraum/Zeilenende, ist die Ziffer
          // vollstaendig — sonst laeuft sie im naechsten Fragment weiter.
          if (m[2] !== '') break;
          continue;
        }
        // Nur ein Fragment, das die Ziffernkette FORTSETZT, wird angehängt: es
        // beginnt mit einem Punkt oder das Bisherige endet auf einem. Sonst
        // frässe die Kette den nachfolgenden Betrag mit auf («1.1.3» + «11»).
        if (!/^[\d.]+$/.test(t) || (!t.startsWith('.') && !tok.endsWith('.'))) break;
        tok += t;
      }
      if (ZIFFER_TOKEN.test(tok) && !anhangZiffern.includes(tok)) anhangZiffern.push(tok);
    }
  }

  // Zählweise je Erlass: die Marke mit den mehr Treffern gewinnt. Bei
  // Gleichstand (auch 0:0) der Regelfall «§».
  const istArtikelErlass = artKoepfe.length > parKoepfe.length;
  const regionen = istArtikelErlass ? regionenArt : regionenPar;
  const litJeKopf = istArtikelErlass ? litArtJeKopf : litParJeKopf;
  const roh = istArtikelErlass ? artKoepfe : parKoepfe;
  const gesehen = new Set<string>();
  const koepfe: string[] = [];
  for (const t of roh) {
    if (gesehen.has(t)) continue;
    gesehen.add(t);
    koepfe.push(t);
  }
  return {
    koepfe,
    litZeilen,
    absatzKandidaten,
    sammelTokens,
    sammelSpannen,
    suffixAbsaetze,
    einheitenExponenten,
    zahlen,
    regionen,
    anhangZiffern,
    litJeKopf,
  };
}

