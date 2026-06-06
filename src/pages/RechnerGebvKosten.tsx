import { GebvKostenForm } from '../components/forms/GebvKostenForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// Betreibungskosten-Rechner unter /rechner/betreibungskosten (Quick-Win B.9;
// Dossier bibliothek/recherche/gebv-schkg-kostenrechner.md).
export function RechnerGebvKosten() {
  const calc = getCalculator('betreibungskosten')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <GebvKostenForm />
      </div>
    </div>
  );
}
