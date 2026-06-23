import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ladeVerlauf, loescheVerlauf, type VerlaufEintrag } from '../../lib/verlauf';
import {
  verlaufLabel, gesetzPfad, entscheidPfad, type VerlaufManifeste,
} from '../../lib/verlaufLabel';

// ─── «Weiter wo du warst» — Verlauf-Schiene (Startseite-Überarbeitung) ──────
//
// 1-Klick zurück zum zuletzt geöffneten Rechner/Vorlage/Gesetz/Entscheid.
// Reines localStorage-Lesen + Render (§3). SSR-sicher: lazy-Initializer fällt
// serverseitig auf [] zurück, der Container trägt suppressHydrationWarning.
// Labels der :key-Routen (Gesetz/Entscheid) werden aus den ohnehin lazy
// geladenen Manifesten aufgelöst — nie ein Rohpfad. Bei leerem Verlauf rendert
// die Komponente nichts (die Favoriten in der Werkzeug-Zeile übernehmen).

function pfeilGlyph() {
  // Dezenter «Zurück-zu»-Bogen im Gravur-Stil (passt zum Skalenstrich-Motiv).
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-brass-500">
      <path d="M9 14L4 9l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9h11a5 5 0 0 1 0 10h-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Verlauf() {
  const [eintraege, setEintraege] = useState<VerlaufEintrag[]>(ladeVerlauf);
  const [manifeste, setManifeste] = useState<VerlaufManifeste>({});

  // Manifeste nur laden, wenn der Verlauf eine Leser-Route (Gesetz/Entscheid)
  // enthält, deren Label sonst Platzhalter bliebe.
  useEffect(() => {
    const brauchtGesetze = eintraege.some((e) => gesetzPfad(e.path));
    const brauchtEntscheide = eintraege.some((e) => entscheidPfad(e.path));
    if (!brauchtGesetze && !brauchtEntscheide) return;
    let lebt = true;
    (async () => {
      const [g, ent] = await Promise.all([
        brauchtGesetze ? import('../../lib/normtext/browse').then((m) => m.ladeBrowseManifest()) : Promise.resolve(null),
        brauchtEntscheide ? import('../../lib/rechtsprechung/browse').then((m) => m.ladeEntscheidManifest()) : Promise.resolve(null),
      ]);
      if (lebt) setManifeste({ gesetze: g, entscheide: ent });
    })();
    return () => { lebt = false; };
  }, [eintraege]);

  const leeren = () => { loescheVerlauf(); setEintraege([]); };

  if (eintraege.length === 0) return null;

  return (
    <section aria-label="Zuletzt geöffnet" className="space-y-2" suppressHydrationWarning>
      <div className="flex items-center gap-3">
        <span className="lc-overline text-ink-500">Weiter wo du warst</span>
        <span aria-hidden className="flex-1 h-px bg-line" />
        <button type="button" onClick={leeren}
          className="text-body-s text-ink-400 hover:text-brass-700 transition-colors shrink-0">
          Verlauf löschen
        </button>
      </div>
      {/* Mobil horizontal scrollbar mit rechter Fade-Maske als Affordance. */}
      <div className="relative">
        <ul className="flex gap-2 overflow-x-auto pb-1 -mb-1 lc-scroll-x" style={{ scrollSnapType: 'x proximity' }}>
          {eintraege.map((e) => (
            <li key={e.path} style={{ scrollSnapAlign: 'start' }} className="shrink-0">
              <Link to={e.path}
                className="group/chip inline-flex items-center gap-2 rounded-lg border border-line bg-surface pl-3 pr-3.5 py-2 text-body-s text-ink-800 no-underline transition-colors hover:border-brass-400 hover:bg-brass-100/40">
                {pfeilGlyph()}
                <span className="truncate max-w-[14rem] group-hover/chip:text-brass-800">
                  {verlaufLabel(e.path, manifeste)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <span aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-paper to-transparent sm:hidden" />
      </div>
    </section>
  );
}
