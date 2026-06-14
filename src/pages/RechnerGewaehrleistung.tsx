import { GewaehrleistungForm } from '../components/forms/GewaehrleistungForm';
import { Card } from '../components/ui/Card';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { TagerechnerRueckverweis } from '../components/TagerechnerRueckverweis';
import { getCalculator } from '../lib/calculators';

// Gewährleistungs- und Mängelrüge-Rechner unter /rechner/gewaehrleistung.
// (Der Pflicht-Disclaimer ist im GewaehrleistungForm bereits prominent enthalten.)
export function RechnerGewaehrleistung() {
  const calc = getCalculator('gewaehrleistung')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <TagerechnerRueckverweis />
      <Card>
        <GewaehrleistungForm />
      </Card>
    </div>
  );
}
