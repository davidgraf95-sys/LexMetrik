import { VerjaehrungForm } from '../components/forms/VerjaehrungForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { TagerechnerRueckverweis } from '../components/TagerechnerRueckverweis';
import { ThemenEinstieg } from '../components/ThemenEinstieg';
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
      {/* R10: passende Vorlage zum Rechner (V2 FAHRPLAN-VORLAGEN-AUSBAU) */}
      <ThemenEinstieg label="Verjährung vertraglich hinausschieben:" links={[
        { to: '/vorlagen/verjaehrungsverzicht', label: 'Verjährungsverzichtserklärung (Art. 141 OR)' },
      ]} />
    </div>
  );
}
