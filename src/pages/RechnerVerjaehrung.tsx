import { VerjaehrungForm } from '../components/forms/VerjaehrungForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { TagerechnerRueckverweis } from '../components/TagerechnerRueckverweis';
import { getCalculator } from '../lib/calculators';

// Verjährungsrechner unter /rechner/verjaehrung.
// (Der Pflicht-Disclaimer ist im VerjaehrungForm bereits prominent enthalten.)
export function RechnerVerjaehrung() {
  const calc = getCalculator('verjaehrung')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <TagerechnerRueckverweis />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <VerjaehrungForm />
      </div>
    </div>
  );
}
