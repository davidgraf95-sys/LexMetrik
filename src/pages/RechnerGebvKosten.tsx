import { GebvKostenForm } from '../components/forms/GebvKostenForm';
import { Card } from '../components/ui/Card';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// Betreibungskosten-Rechner unter /rechner/betreibungskosten (Quick-Win B.9;
// Dossier bibliothek/recherche/gebv-schkg-kostenrechner.md).
export function RechnerGebvKosten() {
  const calc = getCalculator('betreibungskosten')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <Card>
        <GebvKostenForm />
      </Card>
    </div>
  );
}
