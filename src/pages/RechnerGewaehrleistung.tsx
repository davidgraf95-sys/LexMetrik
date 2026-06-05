import { GewaehrleistungForm } from '../components/forms/GewaehrleistungForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// Gewährleistungs- und Mängelrüge-Rechner unter /rechner/gewaehrleistung.
// (Der Pflicht-Disclaimer ist im GewaehrleistungForm bereits prominent enthalten.)
export function RechnerGewaehrleistung() {
  const calc = getCalculator('gewaehrleistung')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <GewaehrleistungForm />
      </div>
    </div>
  );
}
