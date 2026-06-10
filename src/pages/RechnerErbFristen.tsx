import { ErbFristenForm } from '../components/forms/ErbFristenForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { TagerechnerRueckverweis } from '../components/TagerechnerRueckverweis';
import { getCalculator } from '../lib/calculators';

// ─── Erb-Fristen-Rechner (Quick-Win 1, bibliothek/recherche/erbrecht-ausbau.md)
// Darstellung über src/lib/erbFristen.ts; Engine getrennt von erbteilung.ts (§4).

export function RechnerErbFristen() {
  const calc = getCalculator('erb-fristen')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <TagerechnerRueckverweis />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <ErbFristenForm />
      </div>
    </div>
  );
}
