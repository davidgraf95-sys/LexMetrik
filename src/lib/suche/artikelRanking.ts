// ─── Artikel-Volltext-Ranking: deterministische Relevanz-Schicht (UI-NAV S4) ─
//
// #40 (schwerster Suchbefund): Alltagsbegriffe wie «Miete» oder «Verjährung»
// finden die einschlägigen Kernartikel (OR 253 ff., OR 127 ff.) nicht zuoberst,
// weil FlexSearch nur Termnähe im Artikeltext kennt — die Sachüberschrift
// (Randtitel/Titel-Pfad) und die Bedeutung des Erlasses fliessen nicht ein.
// Schlimmer: verbose Spätartikel (die den Begriff oft nennen) verdrängen den
// definitorischen Eröffnungsartikel des Abschnitts.
//
// Diese Schicht rangiert die von FlexSearch gefundenen KANDIDATEN deterministisch
// (§2 — reine Funktion, kein LLM, kein Date.now, keine Schätzung). Kernidee: ein
// TOPISCHER Treffer (Query steht in Marginalie/Gliederung des Artikels) schlägt
// immer einen blossen Textfrequenz-Treffer, und innerhalb eines getroffenen
// Abschnitts ordnet die Artikelnummer (definitorischer Artikel zuerst: «253 ff.»)
// statt der Wortdichte:
//
//   Gruppe A — topische Treffer (Marginalie/Gliederung getroffen):
//     nach Sach-Score ↓ (Marginalie ≫ Gliederung, getippt ≫ Synonym),
//     dann Kernerlass-Rang ↑, dann Artikelnummer ↑ (definitorisch zuerst).
//   Gruppe B — reine Texttreffer:
//     nach Termfrequenz ↓, dann Kernerlass-Rang ↑, dann Artikelnummer ↑.
//   A steht immer vor B.
//
// K10: KEIN Zweit-Index — m/g sind Felder auf denselben Daten, die der Reader
// ohnehin rendert. Recall liefert FlexSearch; hier wird nur RE-RANGIERT.

import { normalisiereBegriff, expandiereSuchbegriff } from './vokabular';

export interface RankEintrag { k: string; ku: string; a: string; l: string; m: string; n: string; g: string; t: string }

// Kernerlasse (ROUTEN-Keys, wie der Index sie führt): bewusst KLEIN gehalten und
// hier begründet — keine abgeleitete «Objektivität», sondern die im juristischen
// Alltag am häufigsten gemeinten Grund-Kodifikationen (Plan S4). OR/ZGB =
// Zivilrecht, StGB/StPO = Strafrecht/-verfahren, ZPO = Zivilverfahren, BV =
// Verfassung, SchKG = Vollstreckung.
export const KERNERLASSE: readonly string[] = ['OR', 'ZGB', 'STGB', 'ZPO', 'STPO', 'BV', 'SCHKG'];
const KERN_RANG = new Map(KERNERLASSE.map((k, i) => [k, i]));
const KERN_NICHT = KERNERLASSE.length; // Rang für Nicht-Kernerlasse (ganz hinten)

// Topische Treffer werden aus der GETIPPTEN Query gebildet (nicht aus Synonymen):
// sonst hübe ein Synonym-Treffer die Ordnung durcheinander. Drei Stufen:
//   Stufe 0 — HAUPTTHEMA: die Query steht in der primären Marginalie (oberster
//     Randtitel) ODER im Gliederungs-Titel — der Artikel ist dem Thema gewidmet
//     (OR 127 «Verjährung», OR 492 im Titel «Die Bürgschaft», OR 253 «Die Miete»).
//   Stufe 1 — NEBENERWÄHNUNG: die Query trifft nur eine nachrangige Marginalie —
//     der Artikel NENNT das Thema, ist ihm aber nicht gewidmet (OR 121
//     «Verrechnung … Bei Bürgschaft»). Steht hinter dem gewidmeten Artikel.
//   Stufe 2 — reiner Texttreffer (Gruppe B).
// Innerhalb einer Stufe ordnet Kernerlass ↑, dann die Artikelnummer (definitorischer
// Eröffnungsartikel zuerst → «253 ff.», «492 ff.»; die zentralen Allgemein-Teil-
// Artikel mit niedriger Nummer vor Spezialabschnitten).
const TF_CAP = 5; // Deckel der Termfrequenz je Term (Langartikel nicht bevorteilen)

/** In vergleichbare Tokens zerlegen (lowercase, ohne Diakritika — spiegelt die
 *  FlexSearch-LatinBalance-Normalisierung; nur a–z/0–9-Sequenzen). */
function tokens(s: string): string[] {
  return normalisiereBegriff(s).split(/[^a-z0-9]+/).filter((w) => w.length > 0);
}

/** Trägt IRGENDein Feld-Token den Term als Präfix? Spiegelt FlexSearch
 *  `tokenize: 'forward'` (ein Token ist über jeden seiner Präfixe auffindbar). */
function trifft(feldTokens: string[], term: string): boolean {
  return feldTokens.some((tk) => tk.startsWith(term));
}

/** Anzahl Feld-Tokens mit dem Term als Präfix (für die Termfrequenz). */
function trefferzahl(feldTokens: string[], term: string): number {
  let n = 0;
  for (const tk of feldTokens) if (tk.startsWith(term)) n++;
  return n;
}

/** Natürliche Artikel-Ordnung: führende Zahl numerisch, Suffix lexikografisch
 *  («253» < «253a» < «254»). Nicht-numerische Artikel ans Ende, dann lexikografisch. */
function artikelSchluessel(a: string): [number, string] {
  const m = /^(\d+)(.*)$/.exec(a);
  return m ? [parseInt(m[1], 10), m[2]] : [Number.MAX_SAFE_INTEGER, a];
}

/** Vorbereitete Termlisten einer Query (getippte Terme + Vokabular-Synonyme,
 *  entdoppelt). Exportiert für den Recall-Aufbau (dieselben Terme suchen). */
export function sucherTerme(q: string): { orig: string[]; syn: string[] } {
  const orig = [...new Set(tokens(q).filter((t) => t.length >= 2))];
  const origSet = new Set(orig);
  const syn = [...new Set(expandiereSuchbegriff(q).filter((t) => t.length >= 2 && !origSet.has(t)))];
  return { orig, syn };
}

interface Bewertung<T> { e: T; stufe: number; tf: number; kern: number; num: number; suf: string }

function bewerte<T extends RankEintrag>(e: T, orig: string[], syn: string[]): Bewertung<T> {
  const mTok = tokens(e.m); // primäre Marginalie (Hauptthema)
  const nTok = tokens(e.n); // nachrangige Marginalie
  const gTok = tokens(e.g); // Gliederungs-Titel
  const tTok = tokens(e.t);
  let haupt = false; // Stufe 0: primäre Marginalie oder Gliederung
  let neben = false; // Stufe 1: nur nachrangige Marginalie
  let tf = 0;
  for (const term of orig) {
    if (trifft(mTok, term) || trifft(gTok, term)) haupt = true;
    else if (trifft(nTok, term)) neben = true;
    tf += Math.min(trefferzahl(tTok, term), TF_CAP);
  }
  // Synonyme: nur Textfrequenz (schwächer) — kein topischer Boost.
  for (const term of syn) {
    tf += Math.min(trefferzahl(tTok, term), TF_CAP) * 0.4;
  }
  const [num, suf] = artikelSchluessel(e.a);
  const stufe = haupt ? 0 : neben ? 1 : 2;
  return { e, stufe, tf, kern: KERN_RANG.has(e.k) ? KERN_RANG.get(e.k)! : KERN_NICHT, num, suf };
}

/**
 * Rangiert die Kandidaten deterministisch und liefert die besten `limit`.
 * Reine Funktion (§2): gleiche Eingabe → gleiche Ausgabe, stabile Tie-Breaks.
 * Kandidaten ohne jeden Bezug (keine topische Stufe UND Textfrequenz 0 —
 * FlexSearch-«suggest»-Rauschen) fallen heraus.
 */
export function rangiere<T extends RankEintrag>(kandidaten: T[], q: string, limit: number): T[] {
  const { orig, syn } = sucherTerme(q);
  if (orig.length === 0 && syn.length === 0) return kandidaten.slice(0, limit);

  const bewertet = kandidaten
    .map((e) => bewerte(e, orig, syn))
    .filter((b) => b.stufe < 2 || b.tf > 0);

  bewertet.sort((x, y) => {
    if (x.stufe !== y.stufe) return x.stufe - y.stufe; // Hauptthema → Nebenerwähnung → Text
    if (x.stufe < 2) {
      // Topische Stufen: Kernerlass ↑, dann Artikelnummer ↑ (definitorischer
      // Eröffnungsartikel des getroffenen Abschnitts zuerst → «253 ff.»/«492 ff.»).
      if (x.kern !== y.kern) return x.kern - y.kern;
      if (x.e.k !== y.e.k) return x.e.k < y.e.k ? -1 : 1;
      if (x.num !== y.num) return x.num - y.num;
      return x.suf < y.suf ? -1 : x.suf > y.suf ? 1 : 0;
    }
    // Gruppe B (rein textuell): Termfrequenz ↓, dann Kern ↑, Artikelnummer ↑.
    if (y.tf !== x.tf) return y.tf - x.tf;
    if (x.kern !== y.kern) return x.kern - y.kern;
    if (x.e.k !== y.e.k) return x.e.k < y.e.k ? -1 : 1;
    if (x.num !== y.num) return x.num - y.num;
    return x.suf < y.suf ? -1 : x.suf > y.suf ? 1 : 0;
  });
  return bewertet.slice(0, limit).map((b) => b.e);
}
