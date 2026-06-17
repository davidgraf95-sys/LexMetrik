import type { Band } from '../../lib/normtext/browse';

// Sticky-Inhaltsverzeichnis der Lesesicht: die Artikel-Bänder als schnelle
// Sprungnavigation, das aktuell sichtbare Band hervorgehoben (Scrollspy via
// IntersectionObserver im Leser). Reine Darstellung (§3).
export function GesetzTOC({ baender, aktivId, onSprung }: {
  baender: Pick<Band, 'id' | 'label'>[];
  aktivId: string | null;
  onSprung: (id: string) => void;
}) {
  return (
    <nav aria-label="Artikel-Übersicht" className="text-body-s">
      <p className="lc-overline mb-2">Inhalt</p>
      <ul className="space-y-0.5">
        {baender.map((b) => {
          const aktiv = b.id === aktivId;
          return (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => onSprung(b.id)}
                aria-current={aktiv ? 'true' : undefined}
                className={`relative block w-full text-left rounded px-2 py-1 transition-colors ${
                  aktiv
                    ? 'text-ink-900 font-medium bg-brass-100/50'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-paper-sunken/60'
                }`}
              >
                {aktiv && <span className="scale-rule scale-rule-sm absolute left-0 top-1 bottom-1 w-[2px]" aria-hidden />}
                <span className="num">{b.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
