import { Link } from 'react-router-dom';

// ─── Direktzugriff-Chips auf die Kern-Bundescodes (Startseite V3, §3) ────────
//
// Schlanke Chip-Reihe unter der Kachel-Landkarte (ersetzt die frühere
// GesetzeRubrik samt deren EIGENEM Suchfeld — die Suche lebt jetzt ausschliesslich
// in der UniversalSuche im Hero, §5-Doppelung aufgelöst). Reine Darstellung (§3);
// die Keys referenzieren bestehende Einträge der Sammlung (register.json).
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

export function GesetzeChips() {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="lc-overline mr-1">Direktzugriff</span>
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
  );
}
