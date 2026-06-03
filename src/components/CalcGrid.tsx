import { Link } from 'react-router-dom';
import { CALCULATORS, calcPath, type Calculator, type CalcStatus } from '../lib/calculators';
import { Icon } from './Icon';

// Karten-Raster aus der Registry (Startseite + /rechner). Tokens aus dem Designsystem.

const BADGE: Record<CalcStatus, string> = {
  'geprüft': 'lc-badge-ok',
  'in Vorbereitung': 'lc-badge-warn',
  'geplant': 'lc-badge-soft',
};

function Karte({ c }: { c: Calculator }) {
  const aktiv = c.status === 'geprüft';
  const inner = (
    <div className={`h-full lc-card p-6 flex flex-col gap-3 transition-shadow ${
      aktiv ? 'border-t-[3px] border-t-brass-500 hover:shadow-lg' : 'opacity-[0.74]'
    }`}>
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-brass-100 text-brass-700">
          <Icon name={c.icon} />
        </span>
        <span className={`lc-badge ${BADGE[c.status]}`}>{c.status}</span>
      </div>
      <div>
        <p className="lc-overline">{c.kategorie}</p>
        <h3 className="text-h3 font-display font-semibold text-ink-900 mt-1">{c.titel}</h3>
      </div>
      <p className="text-body-s text-ink-500 leading-relaxed flex-1">{c.kurzbeschrieb}</p>
      <div className="flex flex-wrap gap-1.5">{c.normen.map((n) => <span key={n} className="lc-chip">{n}</span>)}</div>
      <p className={`text-body-s font-medium ${aktiv ? 'text-brass-700' : 'text-ink-400'}`}>
        {aktiv ? 'Öffnen →' : 'bald verfügbar'}
      </p>
    </div>
  );

  return aktiv
    ? <Link to={calcPath(c.slug)} className="block no-underline rounded-lg">{inner}</Link>
    : <div aria-disabled className="cursor-default">{inner}</div>;
}

export function CalcGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {CALCULATORS.map((c) => <Karte key={c.slug} c={c} />)}
    </div>
  );
}
