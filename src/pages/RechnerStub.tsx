import { Link, useParams } from 'react-router-dom';
import { getCalculator } from '../lib/calculators';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { NotFound } from './NotFound';

// Gerüst-Seite für noch nicht implementierte Rechner ("in Vorbereitung" / "geplant").
// Die Rechenlogik folgt je Rechner separat.
export function RechnerStub() {
  const { slug } = useParams();
  const calc = slug ? getCalculator(slug) : undefined;
  if (!calc) return <NotFound />;

  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="lc-card p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-warn-700 uppercase tracking-wide">
          {calc.status === 'in Vorbereitung' ? 'In Vorbereitung' : 'Geplant'}
        </p>
        <p className="text-ink-600 max-w-md mx-auto">
          Dieser Rechner ist noch nicht verfügbar. Die Berechnungslogik wird separat ergänzt;
          der Seitenrahmen folgt bereits der gemeinsamen Vorlage.
        </p>
        <Link to="/rechner" className="inline-block text-sm font-medium text-brass-700">← Zurück zur Rechnerübersicht</Link>
      </div>
    </div>
  );
}
