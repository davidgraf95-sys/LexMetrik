import { BgerRechtswegForm } from '../components/forms/BgerRechtswegForm';
import { ThemenEinstieg } from '../components/ThemenEinstieg';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// BGer-Rechtsweg unter /rechner/bgg-fristen (FAHRPLAN-BGER-RECHTSWEG R-2;
// Dossier bibliothek/recherche/bgg-beschwerde-engine.md).
export function RechnerBgerRechtsweg() {
  const calc = getCalculator('bgg-fristen')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <BgerRechtswegForm />
      </div>
      <ThemenEinstieg
        label="Vor dem Weiterzug:"
        links={[
          { to: '/rechner/zustaendigkeit', label: 'Zuständigkeit & Rechtsmittel (ZPO)' },
          { to: '/rechner/streitwert', label: 'Streitwert (ZPO)' },
          { to: '/rechner/tagerechner', label: 'Fristenrechner' },
        ]}
      />
    </div>
  );
}
