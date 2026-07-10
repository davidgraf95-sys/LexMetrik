import type { SachgebietZaehler } from '../../lib/rechtsprechung/browse';
import type { Rechtsgebiet } from '../../lib/normtext/register';

// Sachgebiet-Navigation — die EINZIGE Sachgebiet-Steuerung (das alte Filter-
// Select entfällt, Entdoppelung). Kontrastreiche, zählende Rail: der kuratierte
// Primär-Einstieg (Mehrwert ggü. einer flachen Trefferliste). Desktop: vertikale,
// klebende Liste; Mobil/Tablet: horizontales Chip-Band. Reine Darstellung (§3);
// Zähler kommen aus zaehleSachgebiete().

export function SachgebietKacheln({ zaehler, gesamt, aktiv, onWaehle }: {
  zaehler: SachgebietZaehler[];
  gesamt: number;
  aktiv: Rechtsgebiet | null;
  onWaehle: (g: Rechtsgebiet | null) => void;
}) {
  const eintraege: { id: Rechtsgebiet | null; label: string; count: number }[] = [
    { id: null, label: 'Alle Sachgebiete', count: gesamt },
    ...zaehler.map((z) => ({ id: z.sachgebiet, label: z.label, count: z.count })),
  ];

  return (
    <nav aria-label="Sachgebiete" className="lg:sticky lg:top-20">
      {/* Desktop: vertikale Rail. Mobil/Tablet: scrollbares Chip-Band. */}
      <div className="relative">
      <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
        {eintraege.map((e) => {
          const an = aktiv === e.id;
          return (
            <li key={e.id ?? 'alle'} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onWaehle(e.id)}
                aria-current={an ? 'true' : undefined}
                className={`flex w-full items-center justify-between gap-2 whitespace-nowrap lg:whitespace-normal rounded-md border-l-2 px-3 py-2 text-left text-body-s transition-colors ${
                  an
                    ? 'border-brass-500 bg-brass-100 font-medium text-brass-800'
                    : 'border-transparent text-ink-700 hover:bg-well'
                }`}
              >
                {/* lg (vertikale Leiste): Label voll umbrechen statt abschneiden
                    (Auftrag David: «nicht abschneiden», z.B. «Steuern, Sozial­
                    versicherung & Abgaben»). Mobil (horizontale Scroll-Reihe)
                    bleibt es einzeilig. */}
                <span className="truncate lg:overflow-visible lg:whitespace-normal lg:leading-snug">{e.label}</span>
                <span className={`num text-xs ${an ? 'text-brass-700' : 'text-ink-500'}`}>{e.count}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {/* Scroll-Affordance (Responsive-Audit D10): auf dem mobilen Chip-Band
          war das seitliche Scrollen unsichtbar — das letzte Sachgebiet wirkte
          mitten im Wort abgeschnitten («Strafr…»). Ein rechter Verlauf über den
          Seitengrund signalisiert «hier geht es weiter». Ab lg ist die Rail
          vertikal (kein Seitwärts-Scroll) → ausgeblendet. */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-paper to-transparent lg:hidden" />
      </div>
    </nav>
  );
}
