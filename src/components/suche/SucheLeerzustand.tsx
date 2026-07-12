import { Link } from 'react-router-dom';
import { useZuletzt } from '../layout/useZuletzt';
import { VerlaufIcon } from '../layout/VerlaufIcon';

// ─── Leerzustand der Suche (⌘K / Fokus ohne Eingabe) — UI-NAV O1, Schritt 2 ──
//
// Erscheint, wenn das Suchfeld fokussiert, aber leer ist: die zuletzt geöffneten
// Inhalte (aus DERSELBEN Verlauf-Quelle wie Startseiten-Chips und Topbar-Verlauf,
// §5) plus einige kuratierte Einstiege. Reine Darstellung/Navigation (§3).
//
// Synchron/CLS-frei: das Panel erscheint nur auf Fokus (Nutzer-Interaktion, nie im
// ersten Paint) → keine localStorage-/Hydration-Divergenz im Prerender (§15.2).
// `useZuletzt` liefert den Verlauf reaktiv (nach dem Mount) — im SSR leer, was
// hier ohnehin nie gerendert wird.
//
// Kuratierte Einstiege = stabile Übersichts-Routen (reine Navigation, keine
// Rechtswerte, §13): der schnelle Sprung in die vier Korpus-Rubriken + Rechner.

const EINSTIEGE: ReadonlyArray<{ route: string; label: string }> = [
  { route: '/gesetze', label: 'Gesetze' },
  { route: '/rechtsprechung', label: 'Rechtsprechung' },
  { route: '/materialien', label: 'Materialien' },
  { route: '/rechner', label: 'Rechner' },
  { route: '/vorlagen', label: 'Vorlagen' },
];

const ZEILE_CLS = 'flex items-center gap-2.5 px-4 py-2 no-underline text-body-s text-ink-700 transition-colors hover:bg-brass-100/40 hover:text-brass-800';

export function SucheLeerzustand({ onAuswahl }: { onAuswahl?: () => void }) {
  const verlauf = useZuletzt().slice(0, 5);

  return (
    <div className="lc-card overflow-hidden">
      {verlauf.length > 0 && (
        <div className="border-b border-line">
          <p className="lc-overline px-4 pt-3 pb-1">Zuletzt geöffnet</p>
          <ul className="pb-1.5">
            {verlauf.map((e) => (
              <li key={e.route}>
                <Link to={e.route} onClick={onAuswahl} className={ZEILE_CLS}>
                  <VerlaufIcon typ={e.typ} className="shrink-0 text-ink-500" />
                  <span className="min-w-0 flex-1 truncate">{e.titel}</span>
                  <span aria-hidden className="text-ink-300">→</span>
                </Link>
              </li>
            ))}
          </ul>
          {/* §8: der Verlauf liegt nur lokal. */}
          <p className="px-4 pb-2 text-micro leading-snug text-ink-500">Nur auf diesem Gerät</p>
        </div>
      )}

      <div>
        <p className="lc-overline px-4 pt-3 pb-1">Einstieg</p>
        <ul className="pb-1.5">
          {EINSTIEGE.map((e) => (
            <li key={e.route}>
              <Link to={e.route} onClick={onAuswahl} className={ZEILE_CLS}>
                <span className="min-w-0 flex-1 truncate">{e.label}</span>
                <span aria-hidden className="text-ink-300">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
