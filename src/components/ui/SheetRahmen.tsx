import type { ReactNode, RefObject } from 'react';
import { SchliessKnopf } from './SchliessKnopf';

// ═══ Der EINE Rahmen eines von unten angeschlagenen Blatts (F2-2) ════════════
//
// GEMESSEN (Design-Konsistenz Runde 2, Finder-Welle F2, 31.8.2026): das Haus
// baut dasselbe Bottom-Sheet an ZWEI Stellen — `pages/gesetz-leser/parts/
// GliederungSheet` (Gliederung/Treffer im Leser) und `components/
// rechtsprechung/FilterSheet` (Mobil-Filter der Rubrik). Der Kommentar im
// FilterSheet sagte es selbst: «Aufbau und Optik folgen bewusst dem bestehenden
// GliederungSheet des Readers (§5/§10 — ein Sheet-Muster im Haus, nicht zwei)».
// Gefolgt war es per COPY, nicht per Baustein — und genau daran waren die
// beiden schon auseinandergelaufen:
//   · Anschlagshöhe: `var(--leser-kopf-h)` (gemessen) vs. `calc(4rem + 2.25rem)`
//     (angenommen) — rechnerisch derselbe Wert, aber zwei Wahrheiten (§5).
//   · Der Rest — Griffleiste, `lc-overline`-Titel, 44-px-✕, `flex flex-col`,
//     `rounded-t-xl`, `border-t`, `bg-paper-raised`, `shadow-lg`, der EINE
//     Scroller mit `overscroll-contain` — stand zweimal zeichengleich da.
//
// KANON der Anschlagshöhe (Fahrplan §1: schweigt das Reglement, gewinnt die
// hergeleitete Form): ein TOKEN, nie ein calc-Literal im JSX. `--sheet-anschlag`
// (src/index.css) ist die Vorgabe; der Leser reicht seine gemessene Kopfhöhe
// `--leser-kopf-h` durch, weil er sie kennt.
//
// WAS DER RAHMEN NICHT MACHT: den Scrim (der gehört zur Overlay-Anatomie des
// Aufrufers und läuft seit F2-1 über `.lc-scrim`), die Fokus-Falle
// (`useDialogFokus` bzw. der Reader-Ref) und die Viewport-Weiche. Ein Rahmen,
// der das mitbrächte, wäre an einer der beiden Stellen falsch.
//
// Reine Darstellungsschicht (§1/§3): keine Rechtslogik, kein Zustand.
// §15/CLS 0: `fixed`/`absolute` — das Blatt ist aus dem Fluss genommen und
// verschiebt nichts. Alle Zonen haben feste bzw. flex-verteilte Höhen; der
// Scroller bekommt `min-h-0 flex-1`, kein Inhalt wächst in einen Nachbarn ein.
export function SheetRahmen({
  sheetRef, inPane = false, titel, onSchliessen, anschlag = 'var(--sheet-anschlag)',
  daten, zwischenZonen, scrollerKlassen = 'px-4 py-3', scrollerDaten, sockel, children,
}: {
  /** Dialog-Ref des Aufrufers (Esc, Fokusfang, Fokus-Rückgabe bleiben dort). */
  sheetRef: RefObject<HTMLDivElement | null>;
  /** Im Split-View-Pane: `absolute` in der Overlay-Schicht statt `fixed`, und
   *  `aria-modal` entfällt — der Rest des Fensters bleibt da und bedienbar. */
  inPane?: boolean;
  /** Überschrift des Blatts. Trägt zugleich den Namen des ✕ («X schliessen»):
   *  der Screenreader soll nicht eine Zone nennen, die das Blatt nicht zeigt. */
  titel: string;
  onSchliessen: () => void;
  /** Oberkante des Blatts als CSS-Wert. Vorgabe `var(--sheet-anschlag)`; wer
   *  seine Kopfhöhe MISST, reicht sie durch (Leser: `var(--leser-kopf-h)`).
   *  Wirkungslos im Pane — dort schlägt das Blatt an der Pane-Oberkante an. */
  anschlag?: string;
  /** Name des Marker-Attributs am Wurzelknoten (`data-gliederung-sheet`,
   *  `data-filter-sheet`). Die bestehenden e2e-Selektoren hängen daran. */
  daten?: string;
  /** Zonen zwischen Kopf und Scroller (Ortsangabe, Sprungfeld) — Reihenfolge
   *  und Vorhandensein entscheidet der Aufrufer. */
  zwischenZonen?: ReactNode;
  /** Polsterung/Overflow des Scrollers. Die Anatomie (einziger Scroller,
   *  `min-h-0 flex-1`, `overscroll-contain`, schmale Leiste) ist gesetzt. */
  scrollerKlassen?: string;
  scrollerDaten?: string;
  /** Klebender Sockel unter dem Scroller (z. B. «Treffer anzeigen»). */
  sockel?: ReactNode;
  /** Der Inhalt des Scrollers. */
  children: ReactNode;
}) {
  return (
    <div
      ref={sheetRef} tabIndex={-1} role="dialog" aria-modal={inPane ? undefined : true} aria-label={titel}
      {...(daten ? { [daten]: true } : {})}
      // Volle Höhe in der Daumenzone: unten angeschlagen, oben bis knapp unter
      // die klebende Kopf-Zone bzw. bis knapp unter die Pane-Oberkante. `dvh`
      // statt `vh`, damit die mobile Browser-Leiste das Blatt nicht unter den
      // Rand schiebt.
      className={`${inPane
        ? 'pointer-events-auto absolute inset-x-0 bottom-0 top-8 z-modal rounded-t-xl'
        : 'fixed inset-x-0 bottom-0 z-modal rounded-t-xl'} flex flex-col border-t border-line bg-paper-raised shadow-lg`}
      style={inPane ? undefined : { top: anschlag, maxHeight: `calc(100dvh - ${anschlag})` }}>
      {/* 1 · Griffleiste + Titel + Schliessen. Die Griffleiste ist das Zeichen
          für «von unten angeschlagen» — dieselbe Optik trägt das Panel-Blatt
          des Lesers (`v3/LeserPanelZone`, `kopfExtra`). */}
      <div className="shrink-0 border-b border-line">
        <div aria-hidden className="mx-auto mt-2 h-1 w-10 rounded-full bg-line" />
        <div className="flex items-center justify-between px-4 py-1.5">
          <p className="lc-overline">{titel}</p>
          {/* A3-1 (R3-β): EIN Schliess-✕ der App; die 44-px-Box bleibt die des
              Blatts (Finger-Zone, s. Dateikopf). */}
          <SchliessKnopf name={`${titel} schliessen`} onClick={onSchliessen}
            klasse="-mr-2 h-11 w-11" />
        </div>
      </div>
      {zwischenZonen}
      {/* 2 · Einziger Scroller des Blatts. `overscroll-contain`, damit Wischen
          im Blatt nicht die Seite dahinter mitzieht. */}
      <div {...(scrollerDaten ? { [scrollerDaten]: true } : {})}
        className={`min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin] ${scrollerKlassen}`}>
        {children}
      </div>
      {sockel && <div className="shrink-0 border-t border-line px-4 py-2">{sockel}</div>}
    </div>
  );
}
