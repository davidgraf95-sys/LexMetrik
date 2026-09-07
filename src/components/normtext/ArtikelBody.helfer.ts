import type { NormSnapshot } from '../../lib/normtext/typen';
import type { BildDaten, BildKachel } from './BildElemente';

// Bild-/Kachel-Felder eines Blocks (bild/bildKacheln) sind neu im Snapshot-Daten-
// format; die Render-Schicht liest sie über diese lokale Erweiterung des
// Snapshot-Block-Typs (wie TabSpalte — kein Import aus scripts/, §3). Additiv:
// bestehende Blöcke ohne die Felder rendern unverändert.
export type BildBlock = NormSnapshot['bloecke'][number] & { bild?: BildDaten; bildKacheln?: BildKachel[] };

/** Zitier-Kontext der Lesesicht: macht Absatz-/lit.-/Ziff.-Marken klickbar
 *  («Art. X Abs. Y lit. z ERLASS» kopieren). Im Popover undefiniert → unverändert.
 *  B-6 (QS-BASIS): `fassung`/`permalinkBasis` (optional) rüsten die inline-Kopie
 *  mit dem Stand-Ausweis (§7 a–d) nach; fehlen sie (z. B. Popover), bleibt die
 *  Marke bei der reinen Fundstelle — byte-gleich zu vorher. */
export interface ZitierKontext {
  artikelLabel: string;
  kuerzel: string;
  /** Konsolidierungs-/Fassungsdatum ISO des Erlasses (Stand-Ausweis). */
  fassung?: string;
  /** Permalink-Pfad inkl. #anker OHNE origin (origin kommt zur Klick-Zeit). */
  permalinkBasis?: string;
}

// M6-D: leere Self-Ziel-Map + No-op-Sprung für den Fremdgesetz-Chapeau-Kontext —
// dort gibt es kein «eigenes» Sprungziel; NormText routet bare «Art. N» allein über
// `fremdKuerzel` auf das Fremdgesetz (NormChip). Modul-konstant (keine Re-Allokation).
export const FREMD_LEER: Map<string, string> = new Map();
export const NOOP = (): void => {};

// ─── QS-UI · MARKEN-PRÄFIX (Gegenprüfung PR #658, 4.9.2026) ─────────────────
// Fedlex setzt ZWEI verschiedene Dinge in dieselbe <dl><dt>-Struktur, und die
// Extraktion legt beide als `items[].marke` ab (extrahiere-fedlex.ts §Aufzählung):
//   (1) ECHTE Aufzählungen — «<dt>a. </dt>», «<dt>1. </dt>» → lit. a / Ziff. 1.
//   (2) LABEL-LISTEN (Legenden, Kategorien-Tafeln) — «<dt>A: </dt>»,
//       «<dt>BE: </dt>», «<dt>BAS </dt>». Das sind KEINE Aufzählungspositionen,
//       sondern definierte Begriffe: VZV Art. 3 zählt die Ausweiskategorien
//       A/B/BE/C1E/M auf, AsylV 2 Art. 23 die Formelgrössen BAS/BVA/EQCH.
// Gemessen am Preview von origin/main (4./5.9.2026, VZV Art. 3): sichtbar «BE.»,
// kopiertes Zitat «Art. 3 Abs. 1 lit. BE VZV». Beides ist fachlich falsch —
// «lit. BE» gibt es in der VZV nicht, und der Punkt ersetzt den amtlichen
// Doppelpunkt des <dt>. Die Marke selbst («BE») bleibt unverändert; geändert
// wird nur ihre BESCHRIFTUNG (§3: reine Darstellung, kein Zitat-Wortlaut).
//
// UNTERSCHEIDUNG (deterministisch, §2): der amtliche Trenner («a. » vs. «A: »)
// überlebt die Extraktion nicht — die Darstellungsschicht unterscheidet daher
// an der Marke selbst. Schweizer Aufzählungsmarken sind KLEINgeschrieben
// (a, abis, cquinquies) oder ziffernbeginnend (1, 1bis, 2.3); eine Marke, die
// mit einem GROSSbuchstaben beginnt, ist im Korpus ausnahmslos ein Label.
// Gemessen über den ganzen Korpus (public/normtext/**, 73 689 Item-Marken):
// 550 Vorkommen (0.75 %) beginnen gross — VZV-Kategorien, AsylV-Formelgrössen,
// AVO-Versicherungszweige (A1/B1/C1), VTS-«Klasse 3», LSV-Formelsymbole.
// Marken mit anderem Anfang (Symbole «+», «./», «– I») bleiben bewusst
// unangetastet: dort ist die Extraktion selbst mangelhaft, das ist ein eigener
// Befund und keine Beschriftungsfrage.
export type MarkenArt = 'strich' | 'ziff' | 'lit' | 'label';

/** Art einer Item-Marke — EINE Stelle (§5) für Präfix und Anzeige. */
export function markenArt(marke: string): MarkenArt {
  const m = marke.trim();
  if (/^[–—-]$/.test(m)) return 'strich';
  if (/^\d/.test(m)) return 'ziff';
  if (/^\p{Lu}/u.test(m)) return 'label';
  return 'lit';
}

/** lit. (Buchstaben, Bund) vs. Ziff. (Zahlen, Kanton) anhand der Marke.
 *  Label-Marken tragen KEIN Präfix (leerer String) — s. Block oben. */
export function litZiff(marke: string): string {
  const art = markenArt(marke);
  if (art === 'label') return '';
  return art === 'ziff' ? 'Ziff.' : 'lit.';
}

/** Zitat-Segment einer Marke («lit. a», «Ziff. 1», Label: nur «BE»).
 *  Der Nicht-Label-Zweig ist byte-gleich zum bisherigen `${litZiff(m)} ${m}`. */
export function markenZitat(marke: string): string {
  const p = litZiff(marke);
  return p === '' ? marke.trim() : `${p} ${marke}`;
}

/** Sichtbare Beschriftung der Marken-Spalte. Gedankenstrich ohne Punkt,
 *  Aufzählungsmarke mit «.», Label-Marke mit «:» wie im amtlichen <dt>.
 *  Trägt das Label schon ein Satzzeichen, wird keines verdoppelt. */
export function markenAnzeige(marke: string): string {
  const art = markenArt(marke);
  if (art === 'strich') return '–';
  if (art !== 'label') return `${marke}.`;
  const m = marke.trimEnd();
  return /[:.;,]$/.test(m) ? m : `${m}:`;
}

/** Verschachtelungsstufe je Item. PRIMÄR aus der EXPLIZITEN `tiefe` des
 *  Snapshots (M6, §1): liefert Fedlex die Stufe mit, wird sie NICHT mehr aus
 *  dem Markentyp geraten — das Raten erzeugte falsche Zitate, wenn die
 *  Reihenfolge umgekehrt ist (Ziff. → lit. statt lit. → Ziff.).
 *  FALLBACK-Heuristik nur für Daten OHNE tiefe (Kanton-Snapshots, noch nicht
 *  re-segnete Bund-Erlasse): Bst (a,b,c) = Stufe 0; Ziff (1,2,3) NACH einem
 *  Bst = Stufe 1, sonst 0; Gedankenstrich = eine Stufe tiefer als das
 *  vorausgehende Item. EINE Stelle (§5) — genutzt für die block-lokale
 *  Darstellung UND die blockübergreifende Fortsetzungs-Kette der Bild-Blöcke. */
export function stufenFuer(items: Array<{ marke: string; tiefe?: number }>): number[] {
  const hatTiefe = items.some((it) => typeof it.tiefe === 'number');
  if (hatTiefe) return items.map((it) => it.tiefe ?? 0);
  const typ = (m: string) => /^[–—-]$/.test(m.trim()) ? 'strich' : /^\d/.test(m.trim()) ? 'ziff' : 'lit';
  const stufen: number[] = [];
  let sahLit = false, letzteNichtStrich = 0;
  for (const it of items) {
    const t = typ(it.marke);
    let lv: number;
    if (t === 'strich') lv = letzteNichtStrich + 1;
    else if (t === 'ziff') { lv = sahLit ? 1 : 0; letzteNichtStrich = lv; }
    else { lv = 0; sahLit = true; letzteNichtStrich = 0; }
    stufen.push(lv);
  }
  return stufen;
}

/** Stand-Ausweis-Basis (B-6): dieselbe Fassung + Permalink-Basis für alle Marken
 *  eines Artikels; der Abruf-Tag und der origin kommen zur Klick-Zeit dazu. */
export interface AusweisBasis { fassung?: string; permalinkBasis: string }

// FN-5: numerischer Nr-Vergleich («95» < «95a» < «96») für die stabile Reihung
// der End-Marker, wenn Rückfall-Kandidaten mit bestehenden zusammentreffen —
// gleiche Ordnung wie die fussAnzeige-Sortierung im ArtikelLeser (A43).
export function vglFnNr(a: string, b: string): number {
  const key = (nr: string): [number, string] => {
    const m = /^(\d+)([a-z]*)$/i.exec(nr.trim());
    return m ? [parseInt(m[1], 10), m[2].toLowerCase()] : [Number.POSITIVE_INFINITY, nr];
  };
  const ka = key(a), kb = key(b);
  return ka[0] - kb[0] || ka[1].localeCompare(kb[1]);
}
