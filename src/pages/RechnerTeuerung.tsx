import { TeuerungForm } from '../components/forms/TeuerungForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// LIK-Teuerungsrechner unter /rechner/teuerung (Free).
export function RechnerTeuerung() {
  const calc = getCalculator('teuerung')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <TeuerungForm />
      </div>
    </div>
  );
}
