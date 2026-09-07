/**
 * scripts/normtext/zh-seitenmontage.ts — die GEOMETRIE-Schicht des ZH-PDF-Wegs:
 * pdfjs-Roh-Stücke → bereinigte Body-Textzeilen → serialisierte Textbasis.
 *
 * Herausgelöst aus `adapter-zh-pdf.ts` (§6.6, Fix-Runde 3): der Adapter stand
 * mit 1918 Zeilen 35 % über seiner Baseline. Die Schnittkante ist keine
 * willkürliche: hier endet alles, was mit KOORDINATEN und SCHRIFTEN zu tun hat,
 * und dahinter beginnt der reine Text-Parser (§-Köpfe, Absätze, items). Beide
 * Seiten sind getrennt testbar — die Geometrie gegen echte pdfjs-Fixtures, der
 * Parser gegen serialisierte Textbasen ohne pdfjs.
 *
 * Der Adapter re-exportiert alles, was er vorher selbst exportierte; für
 * bestehende Aufrufer (Tests, Werkzeuge) ist der Umzug unsichtbar (§6:
 * Verhaltensneutralität).
 *
 * §2: rein bis auf den pdfjs-Aufruf in `extrahiereZhTextZeilen` — kein Netz,
 * kein FS, kein Date.now.
 */

import { SAMMEL_MARKER, SAMMEL_ZEILE } from './zh-sammelkopf.ts';
import {
  APPARAT_ZIFFER_MAX_H, HOCH_MAX_H, HOCH_TRAEGER_ABSTAND, WORT_LUECKE_PT,
  type PdfStueck,
} from './zh-schriftmasse.ts';
import { bodyMinXDerSeite, istZhMarginalie, sammleZhRandbloecke } from './zh-randspalte.ts';
export { bodyMinXDerSeite, istZhMarginalie, sammleZhRandbloecke } from './zh-randspalte.ts';
export type { ZhRandblock } from './zh-randspalte.ts';

// ─────────────────────────────────────────────────────────────────────────────
// PDF-Text-Extraktion (pdfjs, BUILD-time, NUR in scripts/)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Einzug (pt) der KOPF-Spalte gegenüber der Body-Spalte (Fix-Runde 2,
 * 31.8.2026). Die Zürcher Loseblattsammlung setzt jeden Bestimmungs-Kopf mit
 * hängendem Einzug: die Kopfzeile beginnt 14.2 pt rechts vom linken Body-Rand,
 * jede Fliesstext-Zeile bündig bei 0.
 *
 * Gemessen an allen 24 ZH-PDF: 2376 Kopfzeilen, p05 = med = p95 = 14.2. Die
 * §§-Zeilen, die KEINE Köpfe sind (Querverweise am Zeilenanfang, umbrochene
 * Sätze), liegen bei 0 / 19.3 / 19.9 / 34 — die beiden Klassen berühren sich
 * nicht, ±2 pt Toleranz trennt sie mit Sicherheitsabstand.
 */
const KOPF_EINZUG_PT = 14.2;
const KOPF_EINZUG_TOLERANZ_PT = 2;

/** Eine hochgestellte Absatznummer: Ziffer, optional mit unmittelbar
 *  angehängtem lateinischem Suffix («2bis», «1ter»). Ein alleinstehender
 *  Suffix ist KEINE Absatznummer (er gehört zum §-Kopf, s. Zuordnung unten). */
const ABSATZ_HOCHZAHL = /^\d+(?:bis|ter|quater|quinquies)?$/;

// ── EINHEITEN-EXPONENT (Befund B1, Gegenprüfung 4, Fix-Runde 4, 31.8.2026) ──
// Die Hochstellungs-Politik verwarf ALLE mittigen Hochzahlen als Fussnoten-
// Verweise — auch den Exponenten einer Masseinheit. Aus «1000 m²» wurde
// «1000 m» (ZH-700.1 § 239a Abs. 3), aus «2 m²» «2 m» (§ 260 Abs. 4), aus
// «10 m².» «10 m.» (§ 303 Abs. 1) — eine WERTVERÄNDERUNG (§1: Fläche ≠ Länge).
//
// Deterministische Regel, empirisch am Gesamtbestand erhoben (alle 24 ZH-PDF,
// 31.8.2026): eine hochgestellte Ziffer ist genau dann ein Einheiten-Exponent,
// wenn sie (a) OHNE Wort-Lücke am vorigen Fragment klebt (Lücke < 0.8 pt,
// gemessen −0.10…+0.03) und (b) der bis dahin montierte Zeilentext auf
// Ziffer + Leerzeichen + Einheiten-Token endet («… 10 m», «… 1000 m»).
// Die Erhebung fand 28 direkt angeklebte Hochzahlen «2»/«3»; exakt 3 tragen
// die Signatur (b) und sind ausnahmslos die m²-Stellen — die übrigen 25 enden
// auf Abkürzungen/Wörter («249 StG²», «139 GOG³», «KV³», «… in Kraft²») und
// bleiben Fussnoten-Verweise. Im Korpus existiert NUR m²; die Token-Liste ist
// geschlossen (mm/cm/dm/km/m — die SI-Längeneinheiten, die ein Flächen-/
// Volumenmass bilden können), der Exponent auf ²/³ beschränkt.
//
// GERENDERT wird der Unicode-Superskript («m²») — konsistent zum bestehenden
// Kanton-Bestand aus den strukturierten Quellen (BS-772.530 «550 cm²»,
// SO-615.11 «m³»; im Bund-Korpus kommt keine Flächeneinheit vor).
const EINHEIT_VOR_EXPONENT = /\d ?(?:mm|cm|dm|km|m)$/;
const EXPONENT_ZEICHEN: Record<string, string> = { '2': '²', '3': '³' };


/** Eine zusammengefügte Textzeile (eine y-Position einer Seite). */
export interface ZhTextZeile {
  /** Führende Absatznummer (hochgestellte Ziffer am Zeilenanfang) oder null. */
  absatz: string | null;
  /** Der bereinigte Zeilentext (Fussnoten-Hochzahlen entfernt). */
  text: string;
  /** Sammel-Aufhebungskopf («§§ 66–69.») — Kopf-Einzug + reine §-Nennungsliste
   *  (Bug B-2, Gegenprüfung Runde 2). Nur hier gesetzt, nie geraten. */
  sammelkopf?: true;
  /** Die Zeile ist VOLLSTÄNDIG in der Titel-Schrift des Dokuments gesetzt
   *  (kein einziges Body-Schrift-Fragment) — der Diskriminator für die
   *  arabisch nummerierten Gliederungstitel, s. TITEL_MARKER / GLIEDERUNG_ARABISCH. */
  titelschrift?: true;
  /** Die (auf ganze Punkte gerundete) y-Position der Zeile auf ihrer Seite.
   *  NUR für die Randtitel-Zuordnung (R1): der Randtitel im Aussenrand steht
   *  auf DERSELBEN Grundlinie wie der §-Kopf, den er beschriftet. Das Feld
   *  wandert NICHT in den serialisierten Text (serialisiereZhZeilen liest es
   *  nicht) — die Textbasis und damit jeder Snapshot bleiben byte-gleich. */
  y?: number;
}

/** Ergebnis der PDF-Layout-Extraktion: Body-Zeilen + der verworfene Kopf-/
 *  Fussband-Text (für die Stand-Erkennung «1. 1. 15 - 87»). */
export interface ZhExtrakt {
  zeilen: ZhTextZeile[];
  /** Roh-Text aus den Kopf-/Fussbändern (y>520 / y<60), zeilenfrei verkettet. */
  randText: string;
  /** Die Randtitel (Marginalien) mit dem INDEX der Textzeile, auf deren
   *  Grundlinie sie stehen (R1). Der Index ist zugleich der Zeilenindex im
   *  serialisierten Text — `serialisiereZhZeilen` schreibt genau eine Zeile je
   *  Element und verbindet mit «\n». Nur so kann der Parser, der allein weiss,
   *  welche Zeile ein §-Kopf ist, den Randtitel seinem § zuordnen, ohne dass
   *  die Kopf-Erkennung ein zweites Mal im Code stünde (§5). */
  randnoten: ZhRandnote[];
}

/** Ein Randtitel samt der Textzeile, an der er hängt. */
export interface ZhRandnote {
  /** Index in `ZhExtrakt.zeilen` = Zeilenindex der serialisierten Textbasis. */
  zeilenIndex: number;
  /** Der Randtitel-Wortlaut, wie er im Aussenrand steht. */
  text: string;
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
  const seitenStuecke: PdfStueck[][] = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const seite = await doc.getPage(p);
    const inhalt = await seite.getTextContent();

    // Roh-Stücke mit Koordinaten sammeln (Kopf-/Fussband y>520 / y<60 raus,
    // aber den Rand-Text für die Stand-Erkennung separat sammeln).
    const stuecke: PdfStueck[] = [];
    for (const it of inhalt.items) {
      const item = it as { str: string; transform: number[]; height?: number; fontName?: string };
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
      stuecke.push({
        x,
        y,
        h,
        s: item.str,
        w: (item as { width?: number }).width ?? 0,
        f: item.fontName,
      });
    }
    seitenStuecke.push(stuecke);
  }

  // Body-Schrift EINMAL je Dokument bestimmen, nicht je Seite: eine Seite kann
  // (Titelseite, Gliederungs-Übersicht) fast nur Überschriften tragen, und dann
  // gewönne dort die Titel-Schrift die Mehrheit (§1: der Diskriminator darf
  // nicht seitenweise kippen).
  const bodySchrift = bestimmeBodySchrift(seitenStuecke.flat());
  const randnoten: ZhRandnote[] = [];
  for (const stuecke of seitenStuecke) {
    // Die Zeilen DIESER Seite: der Anker eines Randtitels liegt immer auf
    // derselben Seite (die Marginalienspalte steht neben ihrem Satzspiegel).
    const seitenZeilen = montiereZhSeite(stuecke, bodySchrift);
    const versatz = zeilen.length;
    zeilen.push(...seitenZeilen);

    for (const block of sammleZhRandbloecke(stuecke)) {
      // ZUORDNUNG (rein geometrisch): Der Randtitel steht auf DERSELBEN
      // Grundlinie wie der Kopf, den er beschriftet — gemessen an ZH-131.1 S. 1
      // («Gegenstand» y=361 / «§ 1.» y=361; «Autonomie» y=324 / «§ 2.» y=324).
      // ±ANKER_TOLERANZ_PT fängt die Rundung; gibt es keinen Treffer, FÄLLT DER
      // RANDTITEL WEG (§8: lieber keine Angabe als eine falsch zugeordnete).
      let treffer = -1;
      let bestAbstand = Infinity;
      for (let i = 0; i < seitenZeilen.length; i++) {
        const y = seitenZeilen[i].y;
        if (y === undefined) continue;
        const abstand = Math.abs(y - block.ankerY);
        if (abstand < bestAbstand) {
          bestAbstand = abstand;
          treffer = i;
        }
      }
      if (treffer < 0 || bestAbstand > ANKER_TOLERANZ_PT) continue;
      randnoten.push({ zeilenIndex: versatz + treffer, text: block.text });
    }
  }

  return { zeilen, randText: randStuecke.join(' '), randnoten };
}

/** Wie weit die Grundlinie eines Randtitels von der seines Kopfes abweichen
 *  darf. Gemessen an allen ZH-PDF: der Regelfall ist 0 pt (identische
 *  Grundlinie); die y-Rundung auf ganze Punkte kann 1 pt kosten. 2 pt ist der
 *  Sicherheitsabstand — die nächste Body-Zeile liegt ~10 pt entfernt. */
const ANKER_TOLERANZ_PT = 2;

/**
 * Die BODY-Schrift des Dokuments: die pdfjs-Schriftkennung mit den meisten
 * Zeichen in Body-Höhe (h ≥ 8.7).
 *
 * WARUM ZEICHEN und nicht Fragmente: ein Fragment kann ein Buchstabe oder ein
 * halber Satz sein; die Zeichenzahl gewichtet den Fliesstext richtig gegen die
 * kurzen Überschriften. Gemessen an allen 24 ZH-PDF ist der Abstand zwischen
 * Sieger und Zweitem durchweg mehr als eine Zehnerpotenz.
 *
 * Liefert undefined, wenn keine Schriftkennungen vorliegen (Unit-Tests mit
 * synthetischen Stücken) — dann bleibt die Titelschrift-Erkennung AUS und der
 * Adapter verhält sich wie vor Fix-Runde 3.
 */
export function bestimmeBodySchrift(stuecke: PdfStueck[]): string | undefined {
  const zaehler = new Map<string, number>();
  for (const st of stuecke) {
    if (st.h < 8.7 || st.f === undefined) continue;
    zaehler.set(st.f, (zaehler.get(st.f) ?? 0) + st.s.length);
  }
  if (zaehler.size === 0) return undefined;
  return [...zaehler.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
}

/**
 * Montiert die Textzeilen EINER PDF-Seite aus ihren Roh-Stücken (rein,
 * §2 — kein pdfjs, kein Netz, kein FS). Ausgelagert, damit die drei riskanten
 * Geometrie-Entscheide gegen echte Koordinaten testbar sind: Marginalien-
 * Abgrenzung, Fussnoten-Apparat-Kante und Hochstellungs-Zuordnung.
 *
 * Erwartet die Stücke einer Seite OHNE Kopf-/Fussband (y ausserhalb 60…530)
 * und ohne Erlasstitel (h ≥ 11) — beides filtert extrahiereZhTextZeilen vorab.
 */
export function montiereZhSeite(
  stuecke: PdfStueck[],
  bodySchrift?: string,
): ZhTextZeile[] {
  const zeilen: ZhTextZeile[] = [];
  if (stuecke.length === 0) return zeilen;

  // ── FUSSNOTEN-APPARAT am Seitenfuss abschneiden (Bug B-6, 31.8.2026) ─────
  // Der Loseblatt-Änderungsapparat («Fassung gemäss G vom …», «Text siehe
  // OS 48, 204.», «Vgl. auch Art. 6–9 …») steht als geschlossener Block am
  // unteren Seitenrand und ist KEIN Normtext. Die frühere Erkennung lief über
  // eine Liste von Eröffnungs-Wendungen und liess jede Fortsetzungszeile und
  // jede unbekannte Wendung durch — bei ZH-851.1 § 55 landeten so 13
  // Pseudo-Absätze (¶11–¶23) mit OS-Zitaten im letzten §, korpusweit 43 Blöcke
  // in 15 Erlassen (Gegenprüfung 31.8.2026).
  //
  // Geometrisch statt lexikalisch: Eine Fussnoten-DEFINITION besteht aus einer
  // kleinen hochgestellten Ziffer und — auf derselben Höhe — Text in
  // FUSSNOTEN-Grundschrift (h ≈ 7.98) statt Body-Grundschrift (h ≈ 9.18). Der
  // Apparat beginnt bei der obersten solchen Zeile; alles darunter fällt weg.
  // Er steht immer unter dem Body, nie darüber, und Tarif-Tabellen tragen keine
  // führende Hochzahl — sie bleiben unberührt.
  //
  // NICHT an der Ziffernhöhe allein: die beiden Höhenklassen berühren sich doch.
  // Gemessen: Fussnoten-Ziffern 4.32/4.62/4.92, Body-Hochstellungen 5.70 — aber
  // ZH-211.1 S. 24 setzt die Absatzzahl von § 105 Abs. 2 mit h = 5.04. Eine
  // Schwelle bei 5.2 hätte dort ab halber Seite gekappt und § 105 Abs. 2 samt
  // § 106 verschluckt (in dieser Fix-Runde erzeugt und vom neuen Tor
  // check:zh-vollstaendigkeit gefangen, 31.8.2026). Massgeblich ist darum die
  // Grundschrift der zugehörigen TEXTzeile, nicht die Ziffer.
  //
  // WICHTIG — erst NACH dem Marginalien-Filter: auch eine Randnote trägt
  // Fussnoten-Verweise in Apparat-Schriftgrösse (ZH-175.2 S. 1: «Grundsatz⁵²»
  // bei y=442). Vor dem Filter gemessen, hätte diese Randnoten-Ziffer die
  // Schnittkante auf halbe Seitenhöhe gehoben und den halben Erlass gekappt
  // (in dieser Fix-Runde selbst erzeugt und gemessen, 31.8.2026).

  // Body-Spalte dieser Seite aus den Body-Stücken (h≈9.2) bestimmen.
  const bodyMinX = bodyMinXDerSeite(stuecke);
  if (bodyMinX === null) return zeilen;
  // Body-Textblock ist ~242pt breit; Marginalie liegt im Aussenrand:
  //   links  (gerade Seiten): x < bodyMinX − 3
  //   rechts (ungerade Seiten): x > bodyMinX + 250
  // Gebühren-Tabellen (gleiche Schrifthöhe wie Marginalie!) liegen IN der
  // Body-Spalte und bleiben darum erhalten.
  //
  // AUSGENOMMEN ist die Body-HOCHSTELLUNGS-Klasse (5.2 < h < 7.0, h ≈ 5.70,
  // Befund B1/Fix-Runde 4): eine Hochstellung am RECHTEN Zeilenende einer
  // vollen Body-Zeile steht bei x bis ≈ 360 und fiel mit dem Pauschal-Fenster
  // als «Marginalie» weg, BEVOR die Zuordnungs- und Exponent-Logik sie je sah —
  // genau dort sitzt der Einheiten-Exponent («1000 m²» ZH-700.1 § 239a:
  // x = 328.9 bei bodyMinX = 53.8; «10 m².» § 303: x = 354.8 bei 87.8). Die
  // Marginalien-SCHRIFT (Randnote h ≈ 7.5) und ihre Fussnoten-Ziffern in
  // Apparat-Grösse (h ≤ 5.2, ZH-175.2 S. 1 «Grundsatz⁵²») bleiben gefiltert.
  const inhaltStuecke = stuecke.filter((st) => !istZhMarginalie(st, bodyMinX));

  // Nach y gruppieren (eine Textzeile). y auf ganze Punkte runden.
  const nachY = new Map<number, PdfStueck[]>();
  for (const st of inhaltStuecke) {
    const key = Math.round(st.y);
    let liste = nachY.get(key);
    if (!liste) {
      liste = [];
      nachY.set(key, liste);
    }
    liste.push(st);
  }

  // Zeilen von oben nach unten (y absteigend), je Zeile nach x sortiert.
  let yKeys = [...nachY.keys()].sort((a, b) => b - a);

  // Apparat-Kante: oberste Gruppe, die NUR aus kleinen Hochzahlen besteht und
  // deren Trägerzeile in Fussnoten-Grundschrift gesetzt ist (h ≤ 8.5).
  const nurKleineHochzahlen = (g: PdfStueck[]): boolean =>
    g.length > 0 &&
    g.every((s) => s.h <= APPARAT_ZIFFER_MAX_H && /^[\s,\d]+$/.test(s.s));
  let apparatKante = -Infinity;
  for (let i = 0; i < yKeys.length - 1; i++) {
    if (!nurKleineHochzahlen(nachY.get(yKeys[i])!)) continue;
    const traeger = nachY.get(yKeys[i + 1])!;
    if (yKeys[i] - yKeys[i + 1] > HOCH_TRAEGER_ABSTAND) continue;
    if (traeger.every((s) => s.h <= 8.5)) {
      apparatKante = yKeys[i];
      break;
    }
  }
  if (apparatKante > -Infinity) {
    for (const key of yKeys) if (key <= apparatKante) nachY.delete(key);
    yKeys = yKeys.filter((k) => k > apparatKante);
  }
  for (const key of yKeys) nachY.get(key)!.sort((a, b) => a.x - b.x);

  // ── HOCHSTELLUNGEN IHRER TRÄGERZEILE ZUORDNEN (Bugs B-2/B-4 + lat. Suffix)
  // pdfjs liefert eine Hochstellung mit EIGENER Grundlinie (2.76 pt über der
  // Trägerzeile) — sie landet darum in einer eigenen y-Gruppe und wirkte
  // bisher wie eine eigene Textzeile. Drei Folgen, alle am Bestand belegt:
  //   B-2  Ein Fussnoten-Verweis am Zeilenende («… 11. Juni 2002³.») stand als
  //        einziges Stück seiner Gruppe an Position 0 und wurde als
  //        ABSATZNUMMER gelesen. Bei ZH-212.812 § 4 riss das den Absatz 2
  //        mitten im Wort auf («Entschädigungsver-» | «ordnung …») und
  //        erfand die Absätze 3 und 4.
  //   B-4  Über die entfernte Hochstellung hinweg fehlte die x-Lücke, aus der
  //        das Leerzeichen abgeleitet wird → «Kantonsverfassungund», «BGFAnicht».
  //   NEU  Der lateinische Suffix eines Paragraphen ist ebenfalls hochgestellt
  //        («§ 183^bis»). Er stand auf eigener Zeile, der Kopf las sich als
  //        blosses «§ 183» und kollidierte mit dem echten § 183 → §§ 174bis,
  //        183bis, 183ter, 183quater gingen im EG ZGB vollständig verloren
  //        (Fund dieser Fix-Runde, 31.8.2026 — in der Gegenprüfung nicht
  //        aufgeführt).
  //
  // Regel (rein geometrisch, §1/§2): Trägerzeile einer Hochstellung ist die
  // nächste Body-Zeile darunter (Δy ≤ 5 pt). Liegt die Hochstellung LINKS vom
  // Textbeginn dieser Zeile, ist sie deren Absatznummer und bleibt — wie
  // bisher — als eigene Marker-Zeile stehen (die «¹»-Recovery in
  // extrahiereAlleZhParagraphen hängt daran). Andernfalls gehört sie mitten in
  // die Trägerzeile und wird dort eingereiht: Fussnoten-Ziffern fallen dann
  // an ihrer richtigen Stelle weg (statt eine Absatznummer zu erfinden), lat.
  // Suffixe fügen sich in den §-Kopf ein, und die Wort-Lücke stimmt wieder.
  //
  // Textbeginn = x des ersten Body-Stücks, wobei ein vorangehender Marken-
  // kopf («§»/«§§»/«Art.» + Nummer) übersprungen wird: die Absatznummer des
  // ersten Absatzes steht ZWISCHEN Kopf und Text («§ 5.  ¹Die Gebühr …»).
  const MARKE_STUECK = /^(?:§+|Art\.)$/;
  const MARKE_NUMMER = /^\d+[a-z]?(?:bis|ter|quater|quinquies)?\.?$/;
  const textBeginnX = (gruppe: PdfStueck[]): number => {
    const body = gruppe.filter((s) => s.h >= HOCH_MAX_H);
    let i = 0;
    if (i < body.length && MARKE_STUECK.test(body[i].s.trim())) {
      i++;
      if (i < body.length && MARKE_NUMMER.test(body[i].s.trim())) i++;
      // Der Schlusspunkt des Kopfs kann ein eigenes Fragment sein, wenn
      // zwischen Nummer und Punkt ein hochgestellter Suffix steht
      // («§ | 183 | ᵇⁱˢ | .», ZH-230). Er gehört noch zum Kopf.
      if (i < body.length && body[i].s.trim() === '.') i++;
    }
    return i < body.length ? body[i].x : Number.POSITIVE_INFINITY;
  };
  const hatBody = (gruppe: PdfStueck[]): boolean =>
    gruppe.some((s) => s.h >= HOCH_MAX_H);

  for (const key of yKeys) {
    const gruppe = nachY.get(key)!;
    if (hatBody(gruppe)) continue; // reine Body-Zeile: nichts zuzuordnen
    // Trägerzeile: die NÄCHSTE Zeile darunter, sofern Δy ≤ 5 pt und Body.
    const unten = yKeys.find((k) => k < key);
    if (unten === undefined || key - unten > HOCH_TRAEGER_ABSTAND) continue;
    const traeger = nachY.get(unten)!;
    if (!hatBody(traeger)) continue;
    const grenze = textBeginnX(traeger);
    for (let i = gruppe.length - 1; i >= 0; i--) {
      // Nur eine ZIFFER — allein oder mit unmittelbar angehängtem lat. Suffix —
      // kann eine Absatznummer sein. Ein ALLEINSTEHENDER Suffix («bis»/«ter»/
      // «quater») gehört IMMER in die Trägerzeile: sonst zerfällt «§ 183ᵇⁱˢ.»
      // in einen falschen Kopf «§ 183» und eine Geisterzeile «bis» (ZH-230:
      // §§ 174bis/183bis/183ter/183quater).
      //
      // SUFFIX-ABSÄTZE (Bug B-1, Gegenprüfung Runde 2, 31.8.2026): «2bis» kommt
      // aus pdfjs als EIN Fragment (gemessen: ZH-101 Art. 104, ZH-631.1 § 7
      // «1bis»+«1ter», §§ 30/35/47 «2bis» — durchweg x = 68.0, h = 5.70, eigene
      // y-Gruppe). Das alte Muster /^\d+$/ verwarf es als Nicht-Ziffer und
      // schob es in die Trägerzeile; die Absatznummer landete als nackter Text
      // im Vorgänger-Absatz («… Staatsstrassen aus. 2bis Der Kanton sorgt …»)
      // und der Absatz 2bis existierte im Korpus nicht (0 Blöcke mit lat.
      // Suffix im ganzen ZH-Bestand).
      const istZiffer = ABSATZ_HOCHZAHL.test(gruppe[i].s.trim());
      if (istZiffer && gruppe[i].x < grenze) continue; // führend = Absatznummer
      traeger.push(gruppe[i]);
      gruppe.splice(i, 1);
    }
    traeger.sort((a, b) => a.x - b.x);
  }

  for (const yKey of yKeys) {
    const stueckeDerZeile = nachY.get(yKey)!;
    if (stueckeDerZeile.length === 0) continue;

    let absatz: string | null = null;
    let text = '';
    // Rechter Rand des zuletzt GESEHENEN Fragments — auch eines verworfenen
    // (Fussnoten-Hochzahl). Nur so bleibt die Wort-Lücke über die entfernte
    // Hochzahl hinweg messbar (B-4).
    let vorEndeX: number | null = null;
    for (let k = 0; k < stueckeDerZeile.length; k++) {
      const st = stueckeDerZeile[k];
      const istHoch = st.h < HOCH_MAX_H;
      if (istHoch) {
        // Führende Hochzahl am Zeilenanfang = Absatznummer (mit lat. Suffix,
        // s. ABSATZ_HOCHZAHL / Bug B-1).
        if (k === 0 && ABSATZ_HOCHZAHL.test(st.s.trim())) {
          absatz = st.s.trim();
          vorEndeX = st.x + st.w;
          continue;
        }
        // EINHEITEN-EXPONENT (Befund B1, Fix-Runde 4): klebt die Hochzahl ohne
        // Wort-Lücke an einem Einheiten-Token mit vorangehender Zahl, ist sie
        // der Exponent der Masseinheit und gehört in den Text («10 m².») —
        // Regel und Erhebung bei EINHEIT_VOR_EXPONENT.
        const exponent = EXPONENT_ZEICHEN[st.s.trim()];
        if (
          exponent !== undefined &&
          vorEndeX !== null &&
          st.x - vorEndeX < WORT_LUECKE_PT &&
          EINHEIT_VOR_EXPONENT.test(text)
        ) {
          text += exponent;
          vorEndeX = st.x + st.w;
          continue;
        }
        // Sonstige Hochzahl (Fussnoten-Verweis, auch «1, 2») → verwerfen,
        // ihre Breite aber als Lücke stehen lassen.
        if (/^[\s,\d]+$/.test(st.s)) {
          vorEndeX = st.x + st.w;
          continue;
        }
      }
      // Wort-Lücke: liegt das nächste Fragment messbar rechts vom Ende des
      // vorigen, stand dort im Satz ein Leerzeichen (Schwelle WORT_LUECKE_PT,
      // empirisch am Gesamtbestand belegt). Nur Whitespace, kein Zeichen
      // geändert (§1).
      // Vor anschliessender Interpunktion steht im deutschen Satz nie ein
      // Leerzeichen. Die Lücke stammt dort aus der entfernten Hochzahl, deren
      // von pdfjs gemeldete Breite die tatsächliche Laufweite leicht
      // unterschätzt («… Art. 12 BV¹² .» statt «… Art. 12 BV.»).
      const schliessend = /^[.,;:!?)\]]/.test(st.s);
      if (!schliessend && vorEndeX !== null && st.x - vorEndeX >= WORT_LUECKE_PT) {
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
    // SAMMEL-AUFHEBUNGSKOPF (Bug B-2): «§§ 66–69.» im Kopf-Einzug. Die
    // geometrische Aussage wird hier festgehalten, weil sie im serialisierten
    // Text verloren ginge — und ohne sie ist der Kopf nicht vom Satzende
    // «Vorbehalten bleiben §§ 23–23 b und 35 b.» (ZH-331) zu unterscheiden.
    const erstesBody = stueckeDerZeile.find((st) => st.h >= HOCH_MAX_H);
    const imKopfEinzug =
      erstesBody !== undefined &&
      Math.abs(erstesBody.x - bodyMinX - KOPF_EINZUG_PT) <= KOPF_EINZUG_TOLERANZ_PT;
    // TITELSCHRIFT (Fix-Runde 3, Befund GP3a-1): trägt die Zeile in Body-Höhe
    // KEIN einziges Fragment in der Body-Schrift, ist sie eine Überschrift.
    // Die Aussage ist typografisch, nicht lexikalisch — und sie geht im
    // serialisierten Text verloren, darum wird sie hier festgehalten
    // (gleiches Muster wie `sammelkopf`).
    const bodyDerZeile = stueckeDerZeile.filter((st) => st.h >= HOCH_MAX_H);
    const nurTitelschrift =
      bodySchrift !== undefined &&
      bodyDerZeile.length > 0 &&
      bodyDerZeile.every((st) => st.f !== undefined && st.f !== bodySchrift);
    if (imKopfEinzug && SAMMEL_ZEILE.test(bereinigt)) {
      zeilen.push({ absatz, text: bereinigt, sammelkopf: true, y: yKey });
      continue;
    }
    if (nurTitelschrift) {
      zeilen.push({ absatz, text: bereinigt, titelschrift: true, y: yKey });
      continue;
    }
    zeilen.push({ absatz, text: bereinigt, y: yKey });
  }
  return zeilen;
}

/**
 * Serialisiert Body-Textzeilen in einen einzigen, zeilengetrennten Text mit
 * eingebetteten Absatz-Markern «¶N» am Zeilenanfang. Diese Form ist die
 * testbare «extrahierte PDF-Textbasis», die extrahiereZhParagraphen() parst —
 * so kann der Parser ohne pdfjs/Netz gegen eine Fixture getestet werden.
 *
 * Sammel-Aufhebungsköpfe tragen zusätzlich den SAMMEL_MARKER (die geometrische
 * Kopf-Einzug-Aussage, die im reinen Text nicht mehr ablesbar wäre).
 */
export function serialisiereZhZeilen(zeilen: ZhTextZeile[]): string {
  return zeilen
    .map((z) => {
      const kern = z.absatz !== null ? `¶${z.absatz} ${z.text}` : z.text;
      const mitSammel = z.sammelkopf ? `${SAMMEL_MARKER}${kern}` : kern;
      return z.titelschrift ? `${TITEL_MARKER}${mitSammel}` : mitSammel;
    })
    .join('\n');
}

/**
 * Marker für «diese Zeile steht vollständig in der Titel-Schrift» (Fix-Runde 3).
 *
 * WOZU: Die Zürcher Sammlung setzt ihre Gliederungs-Überschriften in einem
 * eigenen Schriftschnitt. Für die BUCHSTABEN- und die ZÄHLENDE Form («A.
 * Allgemein», «2. Kapitel: …») genügte bisher das Textmuster. Die dritte Form —
 * arabische Zahl OHNE Gliederungswort und OHNE Doppelpunkt («1.
 * Sonderbauvorschriften», «2. Aufgaben») — ist vom Wortlaut her NICHT von einer
 * echten Aufzählungszeile («2. die Schulpflege,») zu unterscheiden. Ein reines
 * Textmuster hier hiesse, Normtext zu löschen (§1).
 *
 * DIE MESSUNG (alle 24 ZH-PDF, 31.8.2026, Fix-Runde 3):
 *   · 504 Zeilen der Form «N. Text» im Bestand.
 *   · Davon 34 in reiner Titel-Schrift — ausnahmslos Überschriften
 *     (ZH-131.1 «1. Allgemeines» · ZH-170.4 «1. Im Allgemeinen» ·
 *      ZH-215.1 «1. Organisation»/«2. Aufgaben» · ZH-242 «2. Notar» ·
 *      ZH-700.1 «1. Sonderbauvorschriften»/«2. Gestaltungspläne» …).
 *   · Die übrigen 470 tragen mindestens ein Body-Schrift-Fragment und sind
 *     ausnahmslos Aufzählungszeilen oder Fliesstext («2. die Schulpflege,»,
 *     «5. für die Anfechtung des Kindesverhältnisses …»).
 *   · GEGENPROBE gegen die bereits bewährten Formen: alle 524 Zeilen, die
 *     GLIEDERUNG oder GLIEDERUNG_ZAEHLEND treffen, stehen ebenfalls in reiner
 *     Titel-Schrift — 0 Ausreisser. Das Kriterium reproduziert also den
 *     verifizierten Bestand exakt und erweitert ihn nur.
 *
 * Der EINZUG trennt die beiden Klassen NICHT: beide stehen teils bei dx = 0,
 * teils bei dx = 14.2 (dem Kopf-Einzug). Darum die Schrift, nicht die Position.
 */
export const TITEL_MARKER = '⟦TITEL⟧';
