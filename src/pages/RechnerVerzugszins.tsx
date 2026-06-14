import { VerzugszinsForm } from '../components/forms/VerzugszinsForm';
import { Card } from '../components/ui/Card';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// Verzugszins-Rechner unter /rechner/verzugszins (Art. 104 OR).
export function RechnerVerzugszins() {
  const calc = getCalculator('verzugszins')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <Card>
        <VerzugszinsForm />
      </Card>
    </div>
  );
}
