import { Link } from 'react-router-dom';
import { MietrechtForm } from '../components/forms/MietrechtForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { TagerechnerRueckverweis } from '../components/TagerechnerRueckverweis';
import { getCalculator } from '../lib/calculators';

// Mietrechtlicher Kündigungsrechner unter /rechner/mietrecht.
export function RechnerMietrecht() {
  const calc = getCalculator('mietrecht')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <TagerechnerRueckverweis />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <MietrechtForm />
      </div>

      {/* Themen-Einstieg (Konsolidierung 7.6.2026, E3): Mieter-Schreiben und
          Vermieter-Checkliste ohne eigene Katalog-Karten — Direktzugang hier. */}
      <p className="text-body-s text-ink-600">
        <span className="font-medium text-ink-900">Kündigung aussprechen:</span>{' '}
        <Link to="/vorlagen/kuendigung-mieter" className="text-brass-700 hover:text-brass-600 no-underline">Kündigungsschreiben Mieter:in →</Link>
        {' · '}
        <Link to="/vorlagen/kuendigung-vermieter" className="text-brass-700 hover:text-brass-600 no-underline">Vermieter:innen: Checkliste (amtliches Formular) →</Link>
      </p>
    </div>
  );
}
