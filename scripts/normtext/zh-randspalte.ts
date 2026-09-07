/**
 * scripts/normtext/zh-randspalte.ts — die MARGINALIENSPALTE der Zürcher
 * Loseblattsammlung: das Spiegelbild zu `zh-seitenmontage.ts`.
 *
 * Die Seitenmontage baut aus den pdfjs-Roh-Stücken die Body-Textzeilen und
 * VERWIRFT dabei alles, was im Aussenrand steht. Genau dieses Verworfene ist
 * der amtliche Randtitel (Sachüberschrift) einer Bestimmung — hier wird es
 * eingesammelt (R1, Auftrag David 2.9.2026).
 *
 * WARUM EIGENE DATEI (§6.6): Mit dem Randtitel-Sammler riss `zh-seitenmontage.ts`
 * die Schlankheits-Schwelle (849 Z. gegen 800). Die Schnittkante ist keine
 * willkürliche — hier endet, was mit der BODY-Spalte zu tun hat, und beginnt,
 * was mit der RANDspalte zu tun hat. Die eine geteilte Aussage, an der beide
 * hängen (wo die Body-Spalte anfängt und was darum «Aussenrand» heisst), steht
 * genau einmal, nämlich hier, und die Seitenmontage importiert sie (§5).
 *
 * §2: rein — kein pdfjs, kein Netz, kein FS, kein Date.now.
 */
import {
  APPARAT_ZIFFER_MAX_H, HOCH_MAX_H, HOCH_TRAEGER_ABSTAND,
  type PdfStueck,
} from './zh-schriftmasse.ts';

/** Obergrenze der MARGINALIEN-Schrift (pt). Gemessen an allen 24 ZH-PDF:
 *  Randnoten stehen durchgängig bei h = 7.5, Body bei h = 9.18. */
const MARGINALIE_MAX_H = 7.7;
/** Wie weit links vom Body-Rand eine Marginalie mindestens beginnt (gerade
 *  Seiten, Aussenrand links). */
const MARGINALIE_LINKS_PT = 3;
/** Wie weit rechts vom Body-Rand die Marginalie der ungeraden Seiten beginnt
 *  (der Body-Textblock ist ~242 pt breit). */
const MARGINALIE_RECHTS_PT = 250;

/**
 * Die linke Kante der Body-Spalte einer Seite (Minimum der x-Positionen aller
 * Body-Höhen-Stücke). Liefert null, wenn die Seite kein Body-Stück trägt.
 *
 * EINE Quelle für beide Leser dieser Geometrie (§5): `montiereZhSeite`
 * VERWIRFT alles im Aussenrand, `sammleZhRandbloecke` SAMMELT genau dasselbe
 * ein. Läge die Kante zweimal im Code, könnten die beiden Seiten der Münze
 * auseinanderlaufen und ein Randtitel gleichzeitig fehlen und falsch stehen.
 */
export function bodyMinXDerSeite(stuecke: PdfStueck[]): number | null {
  const bodyXs = stuecke.filter((s) => s.h >= 8.7).map((s) => s.x);
  return bodyXs.length === 0 ? null : Math.min(...bodyXs);
}

/**
 * «Dieses Stück steht im AUSSENRAND und ist damit Marginalie (Randtitel), nicht
 * Normtext.» — der geteilte Diskriminator (s. bodyMinXDerSeite).
 *
 * AUSGENOMMEN ist die Body-HOCHSTELLUNGS-Klasse (5.2 < h < 7.0, h ~ 5.70,
 * Befund B1/Fix-Runde 4): eine Hochstellung am RECHTEN Zeilenende einer vollen
 * Body-Zeile steht bei x bis ~360 und fiele mit dem Pauschal-Fenster als
 * «Marginalie» weg, BEVOR die Zuordnungs- und Exponent-Logik sie je sah — genau
 * dort sitzt der Einheiten-Exponent («1000 m2» ZH-700.1 § 239a: x = 328.9 bei
 * bodyMinX = 53.8). Die Marginalien-SCHRIFT (Randnote h ~ 7.5) und ihre
 * Fussnoten-Ziffern in Apparat-Groesse (h <= 5.2, ZH-175.2 S. 1 «Grundsatz52»)
 * bleiben erfasst.
 */
export function istZhMarginalie(st: PdfStueck, bodyMinX: number): boolean {
  return (
    st.h <= MARGINALIE_MAX_H &&
    !(st.h < HOCH_MAX_H && st.h > APPARAT_ZIFFER_MAX_H) &&
    (st.x < bodyMinX - MARGINALIE_LINKS_PT || st.x > bodyMinX + MARGINALIE_RECHTS_PT)
  );
}

/** Ein zusammenhaengender Randtitel-Block einer Seite. */
export interface ZhRandblock {
  /** y-Position der OBERSTEN Zeile des Blocks (auf ganze Punkte gerundet) —
   *  die Grundlinie, auf der auch der beschriftete §-Kopf steht. */
  ankerY: number;
  /** Der zusammengefuegte Randtitel-Text (Umbrueche aufgeloest). */
  text: string;
}

/** Groesster y-Abstand (pt) zweier Randtitel-Zeilen, die noch ZUM SELBEN Block
 *  gehoeren. Gemessen: Zeilenabstand der Marginalienspalte ~8 pt (ZH-131.1 S. 1
 *  «Gliederung und» y=274 / «Organisation» y=266; S. 2 «Gemeinde-» y=448 /
 *  «organe» y=440). Der Abstand ZWEIER Randtitel ist der Abstand ihrer §§ und
 *  betraegt im Bestand nie unter 25 pt (ein § braucht mindestens zwei Body-
 *  Zeilen a ~10 pt). 12 pt trennt die beiden Klassen mit Sicherheitsabstand. */
const RANDBLOCK_MAX_LUECKE_PT = 12;

/**
 * Wort-Luecke IN DER MARGINALIENSPALTE (pt) — eigener Wert, NICHT der des
 * Bodys (WORT_LUECKE_PT = 0.8).
 *
 * WARUM EIGEN: Die Randnote ist in 7.5 pt gesetzt, der Body in 9.18 pt. Die
 * Laufweite eines Leerzeichens skaliert mit dem Schriftgrad, die Body-Schwelle
 * ist fuer die Randspalte also zu gross — mit ihr fielen «Varianten-, Teil- und
 * Grundsatzabstimmung» (ZH-131.1 § 12, Luecke 0.57) und «Zustimmung der
 * Gemeinden ...» (§ 77, Luecke 0.75) zu «Varianten-,Teil-» und
 * «Zustimmungder» zusammen. Beide von der unabhaengigen PyMuPDF-Zweitlesung
 * gefunden (2.9.2026), nicht vom Augenschein.
 *
 * DIE MESSUNG (alle 111 ZH-PDF, 2.9.2026): 1369 Fragment-Luecken in der
 * Marginalienspalte, zwei Klassen ohne Beruehrung —
 *   · KLEBUNG (kein Leerzeichen): -0.5 ... +0.07 pt, 1327 Faelle. Ausnahmslos
 *     der Trennstrich hinter einem Wortstamm («meinde» + «-», «richts» + «-»).
 *   · WORT-LUECKE: 0.39 ... 7.5 pt, 42 Faelle. Ausnahmslos echte Wortgrenzen
 *     («chtung» + «von», «immung» + «der», «nach §» + «40»).
 * Zwischen 0.07 und 0.39 liegt kein einziger Wert. 0.25 pt trennt die beiden
 * Klassen mit Faktor 3.5 bzw. 1.6 Sicherheitsabstand.
 */
const MARGINALIE_WORT_LUECKE_PT = 0.25;

/** Anschlusswoerter, die einen ERGAENZUNGSSTRICH belegen («Sozial- | und ...»). */
const ERGAENZUNGS_ANSCHLUSS = /^(?:und|oder|bzw\.|sowie|wie|beziehungsweise)\b/;

/**
 * Fuegt die Zeilen EINES Randtitels zusammen und loest den Zeilenumbruch auf.
 *
 * Der Strich am Zeilenende ist im Deutschen DREIdeutig, und alle drei Formen
 * kommen in der Zuercher Randspalte vor:
 *   · TRENNSTRICH       «Gemeinde-» + «organe»    -> «Gemeindeorgane»
 *   · BINDESTRICH       «Datenschutz-» + «Folgenabschaetzung»
 *                                                 -> «Datenschutz-Folgenabschaetzung»
 *   · ERGAENZUNGSSTRICH «Sozial-» + «und Gesundheit»
 *                                                 -> «Sozial- und Gesundheit»
 *
 * Alle drei trennt der ANSCHLUSS, deterministisch und ohne Woerterbuch (§2):
 *   (a) Grossbuchstabe -> BINDESTRICH. Die deutsche Worttrennung schneidet
 *       INNERHALB eines Wortes, die Fortsetzung ist darum immer klein. Beginnt
 *       sie gross, war der Strich der Fugenstrich eines Kompositums und bleibt.
 *   (b) Konjunktion (und/oder/bzw./sowie/wie) -> ERGAENZUNGSSTRICH, bleibt.
 *   (c) sonst (Kleinbuchstabe) -> TRENNSTRICH, faellt weg.
 *
 * Zu (a): der Fall kam aus dem Tor `check:verklebung`, das die vier Nahtstellen
 * «DatenschutzFolgenabschaetzung» (ZH-170.4), «EinzelfallAkkreditierung»
 * (ZH-211.15), «NotarStellvertreter» (ZH-242/242.25) und «TreuhaenderRegister»
 * (ZH-631.121) meldete, als die Sidecars zum ersten Mal vollstaendig liefen
 * (2.9.2026) — dieselbe Klasse, die das Tor am Bund-Korpus bewacht.
 */
function fuegeRandzeilen(zeilen: string[]): string {
  let out = '';
  for (const z of zeilen) {
    if (out === '') {
      out = z;
      continue;
    }
    const strichAmEnde = /[-‐‑]$/.test(out);
    if (!strichAmEnde) out = `${out} ${z}`;
    // (a) BINDESTRICH: Strich bleibt, kein Leerzeichen.
    else if (/^[A-ZÄÖÜ]/.test(z)) out = out + z;
    // (b) ERGAENZUNGSSTRICH: Strich bleibt, Leerzeichen bleibt.
    else if (ERGAENZUNGS_ANSCHLUSS.test(z)) out = `${out} ${z}`;
    // (c) TRENNSTRICH: Strich faellt, kein Leerzeichen.
    else out = out.replace(/[-‐‑]$/, '') + z;
  }
  return out;
}

/**
 * Sammelt die Randtitel (Marginalien) EINER Seite — das Spiegelbild zu
 * `montiereZhSeite`, das genau diese Stuecke verwirft (R1, Auftrag David
 * 2.9.2026: «achte bei zh auch darauf, dass wir marginale extrahieren und in
 * der gliederung darstellen»).
 *
 * Rein geometrisch (§2), NIE ueber den Wortlaut: massgeblich ist die Spalte
 * (istZhMarginalie) und der Zeilenabstand, nie was dort steht. Was sich nicht
 * eindeutig zuordnen laesst, faellt weg statt geraten zu werden (§8).
 */
export function sammleZhRandbloecke(stuecke: PdfStueck[]): ZhRandblock[] {
  const bodyMinX = bodyMinXDerSeite(stuecke);
  if (bodyMinX === null) return [];
  const marg = stuecke.filter((st) => istZhMarginalie(st, bodyMinX));
  if (marg.length === 0) return [];

  // HOCHSTELLUNGEN IHRER TRAEGERZEILE ZUORDNEN — dieselbe Sorge wie im Body
  // (s. Bugs B-2/B-4 in montiereZhSeite), hier fuer die Randspalte.
  //
  // ANLASS (2.9.2026, von der Zweitlesung gefunden, nicht vom Augenschein):
  // ZH-232.35 § 7 traegt die Randnote «Beistaendinnen und Beistaende gemaess
  // Art. 449 a und 314a^bis ZGB». Der lateinische Suffix «bis» steht als
  // eigene, hoehere Grundlinie (y = 118 gegen y = 115, h = 4.6) und wurde
  // darum als EIGENE Randtitel-Zeile gelesen — das Ergebnis lautete
  // «... Art. 449 a und bis 314 a ZGB», der Suffix stand vor seiner Zahl.
  //
  // Regel rein geometrisch: eine Gruppe, die NUR aus Stuecken in
  // Apparat-Groesse besteht, gehoert zur naechsten Randtitel-Zeile darunter
  // (Δy <= HOCH_TRAEGER_ABSTAND). Reine Ziffernfolgen bleiben ausgenommen —
  // das sind Fussnoten-Verweise («Grundsatz⁵²»), kein Titelbestandteil.
  const roh = new Map<number, PdfStueck[]>();
  for (const st of marg) {
    const key = Math.round(st.y);
    let liste = roh.get(key);
    if (!liste) {
      liste = [];
      roh.set(key, liste);
    }
    liste.push(st);
  }
  const absteigend = [...roh.keys()].sort((a, b) => b - a);
  const nachY = new Map<number, PdfStueck[]>();
  for (let i = 0; i < absteigend.length; i++) {
    const y = absteigend[i];
    const gruppe = roh.get(y)!;
    const nurHoch =
      gruppe.every((st) => st.h <= APPARAT_ZIFFER_MAX_H) &&
      !gruppe.every((st) => /^[\s,\d]+$/.test(st.s));
    const traegerY = absteigend[i + 1];
    if (nurHoch && traegerY !== undefined && y - traegerY <= HOCH_TRAEGER_ABSTAND) {
      const traeger = roh.get(traegerY)!;
      traeger.push(...gruppe);
      continue;
    }
    nachY.set(y, gruppe);
  }

  const zeilen: { y: number; text: string }[] = [];
  for (const y of [...nachY.keys()].sort((a, b) => b - a)) {
    const grp = nachY.get(y)!.sort((a, b) => a.x - b.x);
    let text = '';
    let vorEndeX: number | null = null;
    for (const st of grp) {
      // Fussnoten-Verweis IM Randtitel («Grundsatz52», ZH-175.2 S. 1): eine
      // Hochzahl in Apparat-Groesse. Sie ist kein Bestandteil des Titels.
      if (st.h <= APPARAT_ZIFFER_MAX_H && /^[\s,\d]+$/.test(st.s)) {
        vorEndeX = st.x + st.w;
        continue;
      }
      const schliessend = /^[.,;:!?)\]]/.test(st.s);
      if (!schliessend && vorEndeX !== null && st.x - vorEndeX >= MARGINALIE_WORT_LUECKE_PT) {
        text += ' ';
      }
      text += st.s;
      vorEndeX = st.x + st.w;
    }
    const bereinigt = text.replace(/\s+/g, ' ').trim();
    if (bereinigt !== '') zeilen.push({ y, text: bereinigt });
  }
  if (zeilen.length === 0) return [];

  const bloecke: ZhRandblock[] = [];
  let lauf: { y: number; text: string }[] = [zeilen[0]];
  for (let i = 1; i < zeilen.length; i++) {
    if (lauf[lauf.length - 1].y - zeilen[i].y <= RANDBLOCK_MAX_LUECKE_PT) lauf.push(zeilen[i]);
    else {
      bloecke.push({ ankerY: lauf[0].y, text: fuegeRandzeilen(lauf.map((z) => z.text)) });
      lauf = [zeilen[i]];
    }
  }
  bloecke.push({ ankerY: lauf[0].y, text: fuegeRandzeilen(lauf.map((z) => z.text)) });
  return bloecke;
}

