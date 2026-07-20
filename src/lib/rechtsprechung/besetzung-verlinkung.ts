// ─── Besetzungs-Freitext → verlinkbare Teile (rein, deterministisch) ────────
//
// Zweck: der amtliche Besetzungs-Freitext eines Entscheids («Dr. G. Thomi
// (Vorsitz), Dr. T. Fasnacht …») soll die genannten RICHTER:INNEN als Links auf
// ihre übrigen Entscheide führen (`/rechtsprechung?richter=<slug>`), OHNE den
// amtlichen Wortlaut zu verändern, zu kürzen oder umzustellen.
//
// SSoT (§5): der Parser ist und bleibt `parseBesetzung()` in `besetzung.ts` —
// hier wird KEINE zweite Namens-/Rollen-Erkennung gebaut. Diese Datei leistet nur
// die Brücke ROH-NAME → KANON-SLUG und die Positionsbestimmung im Freitext.
//
// ── Warum die Brücke überhaupt nötig ist ──
// Der Snapshot trägt den Freitext (SSoT), das Manifest trägt die strukturierte
// Liste `richter: {s,r}[]` mit den KORPUS-KANONISIERTEN Slugs. Der Reader kann
// die Kanonisierung nicht selbst nachrechnen: sie braucht den Blick über den
// ganzen Korpus («P. Schmid» → Patrizia oder Patrick?) und passiert genau einmal
// im Generator. Die Verbindung entsteht darum POSITIONELL:
// `scripts/normtext/entscheide-schreiben.ts` baut `richter[]` als
// `parseBesetzung(freitext).richter.map(…)` — gleiche Länge, gleiche Reihenfolge,
// gleiche Rollen. Derselbe Parser auf denselben Freitext liefert im Reader also
// dieselbe Liste; Position i des Parser-Ergebnisses gehört zu Position i des
// Manifests.
//
// ── Ehrlichkeits-Regeln (§1/§8) — nie ein erfundener Link ──
// 1. Stimmen Länge ODER Rollenfolge nicht überein (Manifest älter als der
//    Parser, fremd erzeugtes Manifest), wird NICHTS verlinkt: der Freitext
//    erscheint als reiner Text. Lieber kein Link als ein falscher.
// 2. Lässt sich auch nur EIN richterlicher Roh-Name nicht als wortgenaues
//    Vorkommen im Freitext lokalisieren, wird ebenfalls nichts verlinkt. Grund:
//    die Zuordnung ist positionell — fällt ein Anker aus, könnte der nächste
//    Name auf den Textausschnitt des ausgefallenen rutschen und damit auf die
//    FALSCHE Person zeigen. Fail-closed statt Teilverlinkung (§1).
// 3. GERICHTSSCHREIBER:INNEN werden NICHT verlinkt. Die Facette `?richter=`
//    trifft ausdrücklich nur richterliche Mitwirkung (`filterEntscheide`:
//    `r.r !== 'gerichtsschreiber'`); ein GS-Link führte bei den 300 reinen
//    Gerichtsschreiber-Slugs auf eine LEERE Liste und bei den übrigen auf eine
//    Liste, die ihre GS-Mitwirkung gerade nicht enthält. Beides wäre eine
//    Falschaussage (§8).
// 4. Die Teile ergeben aneinandergehängt IMMER byte-genau den Eingabe-Freitext
//    (Test `besetzungVerlinkung.test.ts`) — der amtliche Wortlaut kann durch
//    diese Schicht weder verfälscht noch gekürzt werden.

import { parseBesetzung, type RichterRolle } from './besetzung';
import type { RichterRef } from './register';

/** Ein Stück des Freitexts: entweder verlinkbare Person oder reiner Wortlaut. */
export interface BesetzungsTeil {
  /** Ausschnitt des amtlichen Freitexts, unverändert. */
  text: string;
  /** Kanon-Slug für `?richter=` — nur gesetzt, wenn EINDEUTIG und verlinkbar. */
  slug: string | null;
  /** Rolle der Person (nur bei verlinkten Teilen gesetzt). */
  rolle: RichterRolle | null;
}

/**
 * Längentreue Normalisierung fürs Suchen: geschützte Leerzeichen werden zu
 * normalen. 1:1 pro Zeichen — die gefundenen Indizes gelten damit unverändert
 * für den ORIGINAL-String, aus dem geschnitten wird (kein Wortlaut-Drift).
 * `parseBesetzung` faltet dieselben Zeichen, darum finden sich die Roh-Namen.
 */
function normLaengentreu(s: string): string {
  return s.replace(/[\u00a0\u202f]/g, ' ');
}

/** Buchstabe? (Wortgrenzen-Prüfung, unicode-bewusst — «Müller» ≠ «Müllerhans».) */
const IST_BUCHSTABE = /\p{L}/u;

/**
 * Erstes WORTGENAUES Vorkommen von `nadel` in `heu` ab `ab`.
 *
 * Die blosse `indexOf`-Suche würde einen kurzen Nachnamen auch mitten in einem
 * längeren Wort treffen («Meier» in «Meierhans») und damit den falschen
 * Textausschnitt verlinken. Beide Ränder müssen darum Nicht-Buchstaben sein.
 */
function findeWortgenau(heu: string, nadel: string, ab: number): number {
  for (let from = ab; from <= heu.length - nadel.length; ) {
    const j = heu.indexOf(nadel, from);
    if (j < 0) return -1;
    const vor = j > 0 ? heu[j - 1] : '';
    const nach = j + nadel.length < heu.length ? heu[j + nadel.length] : '';
    if (!IST_BUCHSTABE.test(vor) && !IST_BUCHSTABE.test(nach)) return j;
    from = j + 1;
  }
  return -1;
}

/**
 * Zerlegt den Besetzungs-Freitext in Text- und Personen-Teile.
 *
 * @param freitext  Amtlicher Wortlaut aus `EntscheidRubrum.besetzung` (SSoT).
 * @param gericht   Court-Code des Entscheids (Parser-Kontext).
 * @param refs      `BrowseEntscheid.richter` aus dem Manifest (Kanon-Slugs).
 */
export function besetzungsTeile(
  freitext: string | null | undefined,
  gericht: string,
  refs: readonly RichterRef[] | null | undefined,
): BesetzungsTeil[] {
  const roh = (freitext ?? '').trim() ? freitext! : '';
  if (!roh) return [];
  const nurText: BesetzungsTeil[] = [{ text: roh, slug: null, rolle: null }];
  if (!refs?.length) return nurText;

  const geparst = parseBesetzung(roh, { gericht }).richter;
  // Ehrlichkeits-Regel 1: keine positionelle Deckung ⇒ gar kein Link.
  if (geparst.length !== refs.length) return nurText;
  for (let i = 0; i < geparst.length; i++) {
    if (geparst[i].rolle !== refs[i].r) return nurText;
  }

  const heu = normLaengentreu(roh);
  const teile: BesetzungsTeil[] = [];
  let cursor = 0;
  for (let i = 0; i < geparst.length; i++) {
    // Ehrlichkeits-Regel 3: Gerichtsschreiber:innen führt die Facette nicht.
    if (geparst[i].rolle === 'gerichtsschreiber') continue;
    const nadel = normLaengentreu(geparst[i].nameRoh);
    if (!nadel) continue;
    const idx = findeWortgenau(heu, nadel, cursor);
    // Ehrlichkeits-Regel 2: ein einziger nicht lokalisierbarer Anker kippt die
    // ganze Zuordnung auf «kein Link» — nie eine verrutschte Person (§1).
    if (idx < 0) return nurText;
    if (idx > cursor) teile.push({ text: roh.slice(cursor, idx), slug: null, rolle: null });
    teile.push({
      text: roh.slice(idx, idx + nadel.length),
      slug: refs[i].s,
      rolle: geparst[i].rolle,
    });
    cursor = idx + nadel.length;
  }
  if (cursor < roh.length) teile.push({ text: roh.slice(cursor), slug: null, rolle: null });
  return teile;
}
