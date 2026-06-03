import { MietrechtForm } from '../components/forms/MietrechtForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// Mietrechtlicher Kündigungsrechner unter /rechner/mietrecht.
export function RechnerMietrecht() {
  const calc = getCalculator('mietrecht')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <MietrechtForm />
      </div>
    </div>
  );
}
