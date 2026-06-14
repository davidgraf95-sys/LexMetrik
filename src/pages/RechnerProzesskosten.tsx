import { ProzesskostenForm } from '../components/forms/ProzesskostenForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// Prozesskostenrechner /rechner/prozesskosten (FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN
// P1, Hauptmoat). Gerichtskosten + Parteientschädigung aller 26 Kantone (Art.
// 95/96 ZPO), mit interkantonaler Vergleichstabelle. Dossier
// bibliothek/recherche/prozesskosten-zpo-95-96.md.
export function RechnerProzesskosten() {
  const calc = getCalculator('prozesskosten')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <ProzesskostenForm />
      </div>
    </div>
  );
}
