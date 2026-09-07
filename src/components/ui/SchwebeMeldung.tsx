import type { ReactNode } from 'react';

// ═══ Die EINE schwebende Meldung über dem Lesetext (F2-5) ════════════════════
//
// GEMESSEN (Design-Konsistenz Runde 2, Finder-Welle F2, 31.8.2026): drei
// flüchtige, `fixed` über dem Lesetext liegende Meldungen — gleiche Rolle
// («etwas ist passiert / etwas wird angeboten, ohne den Lesefluss zu
// unterbrechen»), drei Geometrien und drei Optiken:
//   · `v3/LeserRahmenV3:393` Reiter-Toast   `fixed right-3 top-20 z-50`,
//     `rounded-lg border border-line`
//   · `parts/WeiterlesenChip`               `fixed inset-x-0 z-40 px-4`,
//     Offset `calc(var(--nt-stick) + 0.5rem)`, `rounded-full`
//   · `layout/RuecksprungChip`              `fixed inset-x-0 bottom-4 z-40 px-4`,
//     `rounded-full`
//
// DER TOAST-OFFSET WAR EIN FEHLER, KEIN GESCHMACK: `top-20` = 5 rem = 80 px,
// die klebende Kopf-Zone reicht aber bis 6.25 rem = 100 px (`--nt-stick`,
// gesetzt in `gesetz-leser/inhalt.tsx`). @390 lag der Toast damit ÜBER den
// Kopf-Griffen (⚖ · ☰ · «Ansicht»), die auf demselben Zuschnitt bedient werden —
// und ausgerechnet über der rechten Ecke, wo sie sitzen. Die beiden Chips
// rechneten längst aus `--nt-stick`; der Toast hatte die Zahl geraten (§13/D2).
//
// KANON (Fahrplan §1: schweigt das Reglement, gewinnt die verbreitetere Form —
// hier 2:1 für die Chips):
//   · STREIFEN volle Breite, `px-4`, `pointer-events-none`, `z-40`; die
//     Ausrichtung darin entscheidet, wo die Meldung steht. Ein Streifen voller
//     Breite darf den Text darunter nicht für Klicks sperren.
//   · OFFSET oben aus `--nt-stick` + 0.5 rem (die EINE Quelle der realen
//     Sticky-Höhe, im Pane kleiner), unten `bottom-4`.
//   · PILLE `rounded-full bg-paper-raised shadow-lg`, `pointer-events-auto`.
//     Der Toast trug `rounded-lg` + eigene `border-line`-Kante; beides fällt
//     weg — Fläche und Schlagschatten grenzen die Pille schon ab, und eine
//     vierte Kantenform für dieselbe Rolle ist genau der Befund.
//
// A11Y: `aria-live="polite"` an der äusseren Zone, damit ein Screenreader von
// einer Meldung erfährt, die ohne Fokuswechsel erscheint; NIE `role="alert"` —
// keine dieser drei unterbricht, sie warten. `role="status"` (Vorgabe für
// Vollzugsmeldungen wie den Toast) ist die benannte Region dazu; Angebote, die
// der Nutzer annehmen KANN, kommen ohne Rolle aus.
//
// Reine Darstellungsschicht (§1/§3). §15/CLS 0: `fixed` — die Meldung liegt
// ausserhalb des Layoutflusses und kann nichts verschieben. Das ist hier nicht
// Vorsicht, sondern Notwendigkeit: alle drei Inhalte entstehen erst nach der
// Hydration und würden im Fluss die prerenderte Seite auseinanderschieben.
export function SchwebeMeldung({
  kante, ausrichtung, rolle, daten, inhaltKlassen, children,
}: {
  /** `oben` = unter der klebenden Kopf-Zone (`--nt-stick`), `unten` = Daumenzone. */
  kante: 'oben' | 'unten';
  ausrichtung: 'links' | 'mitte' | 'rechts';
  /** `status` = Vollzugsmeldung (benannte Region). Ohne Angabe: nur `aria-live`. */
  rolle?: 'status';
  /** Marker-Attribut der Fläche (`data-weiterlesen`), an dem Sonden hängen. */
  daten?: string;
  /** Zusätzliche Klassen der Pille (Polsterung, Schriftgrad, Abstände im
   *  Inneren). Anatomie — Form, Fläche, Schatten, Klickbarkeit — gehört dem
   *  Baustein. */
  inhaltKlassen?: string;
  children: ReactNode;
}) {
  const justify = ausrichtung === 'links' ? 'justify-start'
    : ausrichtung === 'mitte' ? 'justify-center' : 'justify-end';
  return (
    <div aria-live="polite" role={rolle} {...(daten ? { [daten]: true } : {})}
      className={`pointer-events-none fixed inset-x-0 z-overlay flex px-4 ${justify}${kante === 'unten' ? ' bottom-4' : ''}`}
      style={kante === 'oben' ? { top: 'calc(var(--nt-stick, 6.25rem) + 0.5rem)' } : undefined}>
      <div className={`pointer-events-auto flex items-center rounded-full bg-paper-raised shadow-lg${inhaltKlassen ? ` ${inhaltKlassen}` : ''}`}>
        {children}
      </div>
    </div>
  );
}
