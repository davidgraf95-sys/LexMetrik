import { TeuerungForm } from '../components/forms/TeuerungForm';
import { Card } from '../components/ui/Card';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// LIK-Teuerungsrechner unter /rechner/teuerung (Free).
export function RechnerTeuerung() {
  const calc = getCalculator('teuerung')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <Card>
        <TeuerungForm />
      </Card>
    </div>
  );
}
