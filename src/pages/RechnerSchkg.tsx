import { SchkgFristenForm } from '../components/forms/SchkgFristenForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// SchKG-Fristenrechner unter /rechner/schkg-fristen.
export function RechnerSchkg() {
  const calc = getCalculator('schkg-fristen')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <SchkgFristenForm />
      </div>
    </div>
  );
}
