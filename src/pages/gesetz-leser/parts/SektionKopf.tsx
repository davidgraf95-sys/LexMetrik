import { FnRef } from '../../../components/normtext/ArtikelBody';
import type { Sektion } from '../../../lib/normtext/browse';
import { romanFrei, margLabel } from '../helpers';

// Gliederungs-Überschrift im Fliesstext: klappbar (Fedlex-analog), volle
// Bezeichnung, nach Ebene abgestuft.
export function SektionKopf({ s, refCb, offen, onToggle, bereich, bereichEinzel }: {
  s: Sektion; refCb: (el: HTMLElement | null) => void; offen: boolean; onToggle: () => void; bereich?: string;
  /** Die Sektion umfasst genau EINEN Artikel (Bereich = «Art. N», keine Spanne). */
  bereichEinzel?: boolean;
}) {
  const { pre, rest } = romanFrei(s.label);
  // Vollwertige Abschnitts-Überschrift im Fliesstext: feine Overline mit dem
  // Aufzähler («Erster Abschnitt»), darunter der Sachtitel + Artikel-Bereich. Trägt
  // wieder die Standort-Info im Text (der frühere fliegende Running-Header entfällt).
  // Randtitel-promotete Knoten (6b: «A. …», «II. …») sind feine Marginalien-
  // Gruppierungen, KEINE amtlichen Teil/Titel/Abschnitt — darum durchgehend ruhig
  // (Serif-Stimme der Randtitel, kein Trenn-Strich, keine grossen Stufengrössen),
  // unabhängig von der Roh-Ebene. Die Verschachtelung trägt der Einzug-Strich
  // (renderSektion). Reine Darstellung (§3/§13, nur vorhandene Tokens).
  const mt = s.randtitel ? 'mt-4' : s.ebene <= 1 ? 'mt-8 first:mt-0' : s.ebene === 2 ? 'mt-6' : s.ebene === 3 ? 'mt-5' : 'mt-4';
  // Linien-Kanon (W2·5d G1): NUR die obersten Sektionen (Teil/Titel/Abschnitt,
  // ebene ≤ 1) tragen einen horizontalen Struktur-Trenner. Innere Sektionen
  // (ebene ≥ 2) und randtitel-promotete Knoten tragen KEINE Horizontal-Linie —
  // ihre Tiefe trägt Typo (titelStil) + Einzug (renderSektion), nicht eine
  // zweite Linie (Gegen-Lehre «Barcode/Gleisbett», DESIGN-REGLEMENT §Linien-Kanon
  // Regel 2). Die frühere feine ebene-2-Linie (`border-line/50`) entfällt.
  const regel = s.randtitel ? '' : s.ebene <= 1 ? 'border-t border-rule-struktur pt-4' : '';
  // Titelgrösse nach Tiefe (E, Auftrag David 26.6.2026): Fedlex-artig abgestuft —
  // oberste Stufe prominent (h2), dann h3, body-l, sonst base. font-semibold liegt
  // am Titel-Span (unten). Nur existierende Tokens (§13).
  const titelStil = s.randtitel ? 'text-base' : s.ebene === 0 ? 'text-h2' : s.ebene === 1 ? 'text-h3' : s.ebene === 2 ? 'text-body-l' : 'text-base';
  const titelFont = s.randtitel ? 'font-serif font-semibold text-ink-800' : 'font-display font-semibold text-ink-900';
  // G11: section-heading-Fussnoten-Marker. FnRef ist selbst ein <button> und darf
  // NICHT im Toggle-<button> liegen (verschachtelte Buttons) → der Marker sitzt als
  // Geschwister NEBEN dem Toggle in derselben Titelzeile. Nur zeigen, wenn der
  // Fussnoten-Schalter AN ist UND die Sektion OFFEN ist: das Popover-Ziel
  // (#fn-<artikel>-<nr>) lebt im {auf && …}-Block des Trägerartikels und ist bei
  // eingeklappter Sektion ungemountet → sonst toter Bedienpfad (§13 F4, analog zum
  // artOffen-Gate der Artikel-Marker).
  // W2·5d G2b: an `offen` gebunden (Popover-Ziel lebt im offenen Block), nicht mehr
  // am alten fussnotenAuf-Schalter; Prominenz via data-fussnoten-CSS (R9).
  const sekFn = offen && s.fussnoten && s.fussnoten.length > 0 ? s.fussnoten : null;
  return (
    <div ref={refCb} data-sek={s.id} data-normtext-linie className={`nt-anker ${mt} ${regel}`}>
      {pre && (
        <button type="button" onClick={onToggle} aria-expanded={offen} className="group/sek block text-left">
          <span className="lc-overline group-hover/sek:text-brass-700">{pre}</span>
        </button>
      )}
      <span className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        {/* Einklapp-Marke deutlich (analog Fedlex, Auftrag David): jede Stufe
            inkl. Untergruppe ist klappbar — vorher war das Chevron zu blass/winzig,
            darum wirkte es, als ginge es nicht. Messing-Akzent macht es als
            Steuerelement erkennbar. */}
        <button type="button" onClick={onToggle} aria-expanded={offen} className="group/sek flex min-w-0 items-baseline gap-x-2 text-left">
          <span className={`shrink-0 w-4 text-body-s transition-colors ${offen ? 'text-brass-600' : 'text-ink-500'} group-hover/sek:text-brass-700`}>{offen ? '▾' : '▸'}</span>
          {/* A30: bis/ter-Suffix des Randtitel-Enumerators hochgestellt (margLabel);
              No-op bei Sachtiteln ohne Enumerator-Suffix. */}
          <span className={`${titelFont} ${titelStil} group-hover/sek:text-brass-700`}>{margLabel(rest || s.label)}</span>
        </button>
        {sekFn && (
          <span className="shrink-0" data-fn-marker>
            {sekFn.map((f, i) => (
              <span key={`${f.artikel}-${f.nr}`}>{i > 0 && <span className="align-super text-[0.62em] text-ink-500">,</span>}<FnRef artikel={f.artikel} nr={f.nr} /></span>
            ))}
          </span>
        )}
        {/* Artikel-Bereich-Badge. Bei einer EINZELartikel-Sektion ist das «Art. N»
            redundant, sobald die Sektion OFFEN ist (der Artikel steht direkt
            darunter mit voller Kopfzeile, Auftrag David) → nur im eingeklappten
            Zustand zeigen. Echte Spannen («Art. 1–10») bleiben immer sichtbar. */}
        {/* Bereich-Badge («Art. 1–10»). W2·5d G3b-Overflow-Fix: NICHT mehr
            `shrink-0` — bei Anhang-/Protokoll-Sektionen setzte sich der Bereich aus
            Lang-Labels zusammen («Protokoll 1 über … – Vorbehalte und Erklärungen»)
            und sprengte als un-schrumpfbares Element @390 den Reader (scrollW 790,
            H-Overflow). `min-w-0` + Umbruch lässt ein langes Label brechen statt
            überlaufen; «Art. 1–10» bleibt kurz auf einer Zeile. Für reine Anhang-
            Sektionen wird der Bereich ohnehin unterdrückt (inhalt.tsx). Reine
            Darstellung (§3) — gleicher Text, nur umbruchfähig. */}
        {bereich && !(bereichEinzel && offen) && (
          <span className="num min-w-0 [overflow-wrap:anywhere] text-xs font-normal text-ink-500">{bereich}</span>
        )}
      </span>
    </div>
  );
}
