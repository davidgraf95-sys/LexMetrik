import { useSearchParams } from 'react-router-dom';
import type { Modus } from '../lib/startseiteConfig';

// Primärweiche «Rechner | Vorlagen» — In-Page-Toggle (Modus ist Inhaltsebene,
// die Stufe bleibt Route). Zustand in der URL (?modus=vorlagen): teilbar und
// Back-Button-tauglich. Gleiche Anatomie wie der StufenSchalter, eine Stufe
// prominenter (grössere Segmente).

export function useModus(): [Modus, (m: Modus) => void] {
  const [params, setParams] = useSearchParams();
  const modus: Modus = params.get('modus') === 'vorlagen' ? 'vorlage' : 'rechner';
  const setModus = (m: Modus) => {
    const neu = new URLSearchParams(params);
    if (m === 'vorlage') neu.set('modus', 'vorlagen');
    else neu.delete('modus');
    setParams(neu);
  };
  return [modus, setModus];
}

const MODI: { code: Modus; label: string; sub: string }[] = [
  { code: 'rechner', label: 'Rechner', sub: 'berechnen' },
  { code: 'vorlage', label: 'Vorlagen', sub: 'erstellen' },
];

export function ModusSchalter({ modus, onChange }: { modus: Modus; onChange: (m: Modus) => void }) {
  return (
    <div role="tablist" aria-label="Modus" className="inline-flex gap-1 p-1 bg-surface border border-line rounded-xl">
      {MODI.map((m) => {
        const aktiv = modus === m.code;
        return (
          <button key={m.code} type="button" role="tab" aria-selected={aktiv}
            onClick={() => onChange(m.code)}
            className={`px-5 sm:px-7 py-2.5 rounded-lg text-left no-underline transition-all ${
              aktiv
                ? 'bg-surface-raised text-brass-700 shadow-sm border border-line'
                : 'text-ink-600 hover:text-ink-900'
            }`}>
            <span className="block text-sm font-semibold">{m.label}</span>
            <span className={`block text-xs ${aktiv ? 'text-brass-600' : 'text-ink-500'}`}>{m.sub}</span>
          </button>
        );
      })}
    </div>
  );
}
