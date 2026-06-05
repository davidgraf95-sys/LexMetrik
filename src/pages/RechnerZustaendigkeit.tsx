import { ZustaendigkeitForm } from '../components/forms/ZustaendigkeitForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// Zuständigkeitsrechner unter /rechner/zustaendigkeit (Phase 3 des Auftrags
// ZUSTAENDIGKEIT-AUFTRAG.md). Pflicht-Disclaimer prominent in der Form.
export function RechnerZustaendigkeit() {
  const calc = getCalculator('zustaendigkeit')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <ZustaendigkeitForm />
      </div>
    </div>
  );
}
