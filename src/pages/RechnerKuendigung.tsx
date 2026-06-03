import { useState } from 'react';
import { LohnfortzahlungForm } from '../components/forms/LohnfortzahlungForm';
import { KuendigungSperrForm } from '../components/forms/KuendigungSperrForm';
import { KombinierteAnsicht } from '../components/forms/KombinierteAnsicht';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { PflichtDisclaimer } from '../components/PflichtDisclaimer';
import { getCalculator } from '../lib/calculators';

type Tab = 'a' | 'b_c' | 'kombiniert';
const TABS: { id: Tab; label: string; sub: string }[] = [
  { id: 'a', label: 'A – Lohnfortzahlung', sub: 'Art. 324a OR' },
  { id: 'b_c', label: 'B+C – Kündigung', sub: 'Art. 335c / 336c OR' },
  { id: 'kombiniert', label: 'Kombiniert', sub: 'A + B + C' },
];

// Arbeitsrechts-Rechner unter /rechner/kuendigung. Berechnungslogik UNVERÄNDERT;
// nur der Seitenrahmen (Kopf + Tabs + Disclaimer) ist neu.
export function RechnerKuendigung() {
  const calc = getCalculator('kuendigung')!;
  const [tab, setTab] = useState<Tab>('a');

  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <PflichtDisclaimer />

      <div className="flex flex-wrap gap-1 p-1 bg-surface rounded-xl w-fit">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-surface-raised text-brass-700 shadow-sm border border-line' : 'text-ink-600 hover:text-ink-900'
            }`}>
            <span className="block">{t.label}</span>
            <span className="block text-xs font-normal opacity-70">{t.sub}</span>
          </button>
        ))}
      </div>

      <div className="bg-surface-raised rounded-2xl border border-line shadow-sm p-6 sm:p-8">
        {tab === 'a' && <LohnfortzahlungForm />}
        {tab === 'b_c' && <KuendigungSperrForm />}
        {tab === 'kombiniert' && <KombinierteAnsicht />}
      </div>
    </div>
  );
}
