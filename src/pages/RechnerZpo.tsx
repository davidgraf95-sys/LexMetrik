import { ZpoFristenForm } from '../components/forms/ZpoFristenForm';
import { EreignisFristenSektion } from '../components/forms/EreignisFristen';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';

// ZPO-Fristenrechner unter /rechner/zpo-fristen. Logik UNVERÄNDERT.
// (Der Pflicht-Disclaimer ist im ZpoFristenForm bereits prominent enthalten.)
// S-5c (Fristenspiegel-Auflösung): die ZPO-Ereignisse Zivilentscheid +
// Klagebewilligung leben als Ereignis-Block auf DIESER Seite.
export function RechnerZpo() {
  const calc = getCalculator('zpo-fristen')!;
  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <ZpoFristenForm />
      </div>
      <EreignisFristenSektion ereignisse={['zivilentscheid', 'klagebewilligung']} />
    </div>
  );
}
