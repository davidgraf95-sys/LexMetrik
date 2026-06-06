import { FristenspiegelForm } from '../components/forms/FristenspiegelForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// Fristenspiegel unter /rechner/fristenspiegel (FAHRPLAN-PRAXIS 3.1b):
// EIN Ereignis → alle parallelen Fristen; Orchestrierer über bestehende
// Engines (Konzept: bibliothek/recherche/fristenspiegel-konzept.md).
export function RechnerFristenspiegel() {
  const calc = getCalculator('fristenspiegel')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <FristenspiegelForm />
      </div>
    </div>
  );
}
