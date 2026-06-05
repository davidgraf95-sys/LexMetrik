import { VerzugszinsForm } from '../components/forms/VerzugszinsForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// Verzugszins-Rechner unter /rechner/verzugszins (Art. 104 OR).
export function RechnerVerzugszins() {
  const calc = getCalculator('verzugszins')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <VerzugszinsForm />
      </div>
    </div>
  );
}
