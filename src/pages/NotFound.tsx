import { Link } from 'react-router-dom';
import { SeitenKopf } from '../components/layout/SeitenKopf';

// 404 in der Familie der statischen Seiten (SeitenKopf): Overline + Ablesekante
// + Display-Titel. Statt einer Sackgasse mehrere geführte Wiedereinstiege.
const WEGE = [
  { to: '/', label: 'Katalog – alle Rechner & Vorlagen' },
  { to: '/methodik', label: 'Methodik' },
  { to: '/kontakt', label: 'Kontakt' },
];

export function NotFound() {
  return (
    <div className="py-16 max-w-reading space-y-4">
      <SeitenKopf overline="404 · Nicht gefunden" titel="Diese Seite gibt es nicht."
        intro="Die Adresse ist veraltet oder vertippt. Hier kommen Sie zurück ins Werkzeug:" />
      <ul className="lc-list">
        {WEGE.map((w) => (
          <li key={w.to}>
            <Link to={w.to} className="text-body-s font-medium text-brass-700 hover:text-brass-600 no-underline">{w.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
