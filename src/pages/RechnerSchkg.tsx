import { SchkgFristenForm } from '../components/forms/SchkgFristenForm';
import { EreignisFristenSektion } from '../components/forms/EreignisFristen';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// SchKG-Fristenrechner unter /rechner/schkg-fristen.
// S-5c (Fristenspiegel-Auflösung): das Ereignis Zahlungsbefehl
// (Rechtsvorschlag · Art.-88-Dual · Rechtsöffnung) lebt auf DIESER Seite.
export function RechnerSchkg() {
  const calc = getCalculator('schkg-fristen')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <SchkgFristenForm />
      </div>
      <EreignisFristenSektion ereignisse={['zahlungsbefehl']} />
    </div>
  );
}
