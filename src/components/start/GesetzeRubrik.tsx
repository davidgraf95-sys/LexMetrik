import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ─── Startseite-Rubrik «Gesetze» (#6, Auftrag David) ────────────────────────
//
// Kombiniert: ein Suchfeld in die Gesetzes-Sammlung (→ /gesetze?q=…, die
// Übersicht liest den Begriff und filtert) + Chips zu den meistgenutzten
// Bundeserlassen (direkt in die Lesesicht /gesetze/bund/<key>). Reine
// Darstellung (§3); die Erlass-Keys referenzieren bestehende Einträge der
// Sammlung (public/normtext/register.json) — Kern-Bundescodes, stabil.
const TOP_ERLASSE: { kuerzel: string; key: string }[] = [
  { kuerzel: 'OR', key: 'OR' },
  { kuerzel: 'ZGB', key: 'ZGB' },
  { kuerzel: 'BV', key: 'BV' },
  { kuerzel: 'StGB', key: 'STGB' },
  { kuerzel: 'ZPO', key: 'ZPO' },
  { kuerzel: 'StPO', key: 'STPO' },
  { kuerzel: 'SchKG', key: 'SCHKG' },
  { kuerzel: 'DBG', key: 'DBG' },
];

export function GesetzeRubrik() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const absenden = (e: FormEvent) => {
    e.preventDefault();
    const t = q.trim();
    navigate(t ? `/gesetze?q=${encodeURIComponent(t)}` : '/gesetze');
  };
  return (
    <div className="lc-card p-5 space-y-3">
      <form onSubmit={absenden} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="search"
          placeholder="Gesetz oder Artikel suchen — OR, ZGB, Mietrecht …"
          aria-label="Gesetzessammlung durchsuchen"
          className="lc-input lc-input-sm flex-1"
        />
        <button type="submit"
          className="h-9 shrink-0 rounded-md border border-brass-500 px-3.5 text-body-s font-medium text-brass-700 transition-colors hover:bg-brass-100">
          Suchen
        </button>
      </form>
      <div className="flex flex-wrap gap-1.5">
        {TOP_ERLASSE.map((e) => (
          <Link key={e.key} to={`/gesetze/bund/${e.key}`}
            className="lc-chip no-underline hover:text-brass-700 hover:border-brass-400">
            {e.kuerzel}
          </Link>
        ))}
        <Link to="/gesetze"
          className="lc-chip no-underline font-medium text-brass-700 hover:border-brass-400">
          Alle Gesetze →
        </Link>
      </div>
    </div>
  );
}
