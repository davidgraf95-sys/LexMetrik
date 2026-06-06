import { StreitwertForm } from '../components/forms/StreitwertForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// Streitwert-Rechner unter /rechner/streitwert (Quick-Win B.9; Dossier
// bibliothek/recherche/zpo-kosten-streitwert.md, Rechner 1).
export function RechnerStreitwert() {
  const calc = getCalculator('streitwert')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <StreitwertForm />
      </div>
    </div>
  );
}
