import { FnRef } from '../../../components/normtext/ArtikelBody';
import { WJ } from '../../../components/normtext/wortverbinder';
import { margStufeStil, margLabel } from '../helpers';
import { SUCH_META } from '../suchHighlight';
import { ArtikelHistorieZeile } from './ArtikelHistorie';
import type { ArtikelHistorie } from '../../../lib/normtext/historie-laden';

// ═══ Die zwei KOPFTEILE des Artikels: Randtitel und Fassungs-Slot ═══════════
//
// §6.6-Split aus `./ArtikelLeser.tsx` (W2·24-F, 7.9.2026 — die Datei stand bei
// 866 Zeilen gegen die Schwelle 800). Herausgelöst ist genau das, was BEIDE
// Satzspiegel-Formen an ZWEI verschiedenen Orten zeigen und was der Artikel
// deshalb ohnehin als Wert herumreicht:
//   · der RANDTITEL — in der Zeilenform als Zeile über «Art. N» (`lr-rand`),
//     in der Breitform im Artikelkopf (`lr7-kopf-titel`);
//   · der FASSUNGS-SLOT — in der Zeilenform im Beiwerk, in der Breitform
//     neben dem Randtitel (`lr7-fassung`).
// Das Markup ist in beiden Formen DASSELBE (§5: eine Quelle für die
// Stufen-Stimme); nur der Ort wechselt. Genau darum sind es Bauteile und keine
// zwei Zweige.
//
// VERHALTENSNEUTRAL (§6): Wortlaut, Klassen, Attribute und Reihenfolge sind
// unverändert übernommen — die Namen der Werte sind zu Prop-Namen geworden
// (`e.titel` → `titel`, `e.artikel` → `artikel`, `artOffen` → `markerOffen`,
// `histImKopf` → `imKopf`, `fussAnzeige.length > 0 || historie` →
// `reserviert`). React fügt kein Wrapper-Element ein; der Golden-Beweis läuft
// über `npm run golden:vergleich` und `check:golden-normtext`.
//
// KEIN PRÄDIKAT «hat der Randtitel Inhalt?» hier: die Zeilenform stellt die
// Frage schon selbst (`randInhalt` in `./ArtikelLeser.tsx`, für den
// Registerfarben-Strich), und eine zweite Funktion daneben verstiesse gegen
// die Fast-Refresh-Regel dieser Datei (nur Komponenten exportieren).

export function HistSlot({ historie, artikel, imKopf, reserviert }: {
  historie?: ArtikelHistorie;
  artikel: string;
  /** Steht der Slot im Artikelkopf (Breitform)? Dann ohne den `mt-4` der
   *  Beiwerk-Zone — im Kopf sitzt er neben dem Randtitel. */
  imKopf: boolean;
  /** Kann in diesem Slot je eine Fassungs-Zeile eintreffen? Nur dann wird die
   *  Höhe reserviert (Ä26, artikelweise am Datenmodell entschieden). */
  reserviert: boolean;
}) {
  return (
    <div {...{ [SUCH_META]: '' }} data-hist-slot
      className={reserviert
        ? `min-h-beiwerk${imKopf ? '' : ' mt-4'}`
        : undefined}>
      <ArtikelHistorieZeile historie={historie} artikel={artikel} />
    </div>
  );
}

/** Die Randtitel selbst — in beiden Formen DASSELBE Markup, nur an einem
 *  anderen Ort (§5: eine Quelle für die Stufen-Stimme, `helpers.tsx`). */
export function RandTitel({ marg, margBasis, titel, artikel, markerOffen, fnProSektion, fnKlasse }: {
  marg?: string[];
  margBasis?: number;
  titel?: string | null;
  artikel: string;
  /** Ist der Artikel aufgeklappt? Nur dann stehen die Fussnoten-Marker an den
   *  Randtiteln — ihr Ziel (`<p id="fn-…">`) lebt im aufgeklappten Block. */
  markerOffen: boolean;
  fnProSektion: Record<string, string[]>;
  fnKlasse: Record<string, string>;
}) {
  return marg && marg.length > 0 ? (
    <div className="mb-1 space-y-0.5 font-serif leading-snug">
      {marg.map((m, i) => (
        // `lr-blatt` markiert die unterste Stufe (die Sachüberschrift des
        // Artikels). Nur sie wird in der Breitform zur kursiven Serifen-Zeile;
        // die Vorfahren-Stufen bleiben Grotesk.
        <div key={i} className={`${margStufeStil((margBasis ?? 0) + i, i === marg.length - 1)}${i === marg.length - 1 ? ' lr-blatt' : ''}`}>
          {/* A30: bis/ter-Suffix des Enumerators hochgestellt (margLabel). */}
          {margLabel(m)}
          {/* G11: section-heading-Fussnoten-Marker an der passenden Randtitel-
              Zeile (blatt im Volltext, ganze Kette in der Suchsicht). G2b:
              immer (an artOffen gebunden), Prominenz via data-fussnoten-CSS.
              A31: Wort-Verbinder (U+2060) klebt den Marker DIREKT an den
              Randtitel (kein Abstand, kein Umbruch auf eine eigene Zeile). */}
          {markerOffen && fnProSektion[m]?.map((nr, j) => (
            <span key={nr} data-fn-marker data-fn-klasse={fnKlasse[nr]}>{WJ}{j > 0 && <span className="align-super text-[length:var(--hochgestellt)] text-ink-500">,</span>}<FnRef artikel={artikel} nr={nr} /></span>
          ))}
        </div>
      ))}
    </div>
  ) : titel ? (
    /* S2 · Ä7: derselbe Stil wie das Randtitel-BLATT in `margStufeStil`
       (dort steht die Herleitung) — es ist dieselbe Rolle, nur aus der
       anderen Quelle (`article_title` statt `marg`). Beide müssen gleich
       aussehen, sonst wechselt die Sachüberschrift zwischen Artikeln ihre
       Stimme (§5). */
    <div className="lr-blatt mb-1 font-sans text-leser-rand font-semibold text-ink-800">
      {titel}
    </div>
  ) : null;
}
