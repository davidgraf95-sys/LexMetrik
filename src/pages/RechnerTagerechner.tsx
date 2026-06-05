import { AllgemeineFristForm } from '../components/forms/AllgemeineFristForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// Allgemeiner Fristen- & Tagerechner unter /rechner/tagerechner (Free).
// (Der Pflicht-Disclaimer ist im Formular bereits prominent enthalten.)
export function RechnerTagerechner() {
  const calc = getCalculator('tagerechner')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <AllgemeineFristForm />
      </div>
    </div>
  );
}
