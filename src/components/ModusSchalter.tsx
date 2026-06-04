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

export function ModusSchalter({ modus, onChange, anzahl, breit = false }: {
  modus: Modus;
  onChange: (m: Modus) => void;
  anzahl?: Record<Modus, number>; // optionale Zähler je Modus
  breit?: boolean;                // volle Breite (Seitenleiste)
}) {
  return (
    // role=group + aria-pressed (wie Status-/Stufen-Toggle) statt Tabs-Pattern:
    // es ist ein Inhalts-Umschalter ohne Tabpanel-Semantik.
    // Zwei IDENTISCH aufgebaute Zellen (grid-cols-2): Label+Zähler teilen die
    // Grundlinie (items-baseline), die Verben sitzen exakt auf gleicher Höhe.
    <div role="group" aria-label="Modus"
      className={`${breit ? 'grid w-full' : 'inline-grid'} grid-cols-2 gap-1 p-1 bg-surface border border-line rounded-xl`}>
      {MODI.map((m) => {
        const aktiv = modus === m.code;
        return (
          <button key={m.code} type="button" aria-pressed={aktiv}
            onClick={() => onChange(m.code)}
            className={`flex flex-col gap-0.5 ${breit ? 'px-4' : 'px-5 sm:px-7'} py-2.5 rounded-lg text-left no-underline transition-all ${
              aktiv
                ? 'bg-surface-raised text-brass-700 shadow-sm border border-line'
                : 'border border-transparent text-ink-600 hover:text-ink-900'
            }`}>
            <span className="flex items-baseline gap-2">
              <span className="text-sm font-semibold leading-tight">{m.label}</span>
              {anzahl && (
                /* beide Zähler identisch — aktiv/inaktiv vermittelt allein die Zelle */
                <span className="num text-[0.7rem] font-medium leading-none text-ink-500">
                  {anzahl[m.code]}
                </span>
              )}
            </span>
            <span className={`block text-xs leading-tight ${aktiv ? 'text-brass-600' : 'text-ink-500'}`}>{m.sub}</span>
          </button>
        );
      })}
    </div>
  );
}
