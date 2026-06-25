import { DETAILGRAD_OPTIONEN, type Detailgrad } from '../../lib/vorlagen/detailgrad';

// ─── Varianten-Kopf (FAHRPLAN-VERTRAGS-VARIANTEN P0) ────────────────────────
// Segment-Schalter über dem Stepper: Untertyp (optional, regime-treue Weiche)
// und Detailgrad einfach/standard/experte. Reine Darstellung (§3) – die
// Auswahl reist als Feld ins Schema und steuert dort die includeIf-Bausteine.

export interface UntertypOption<T extends string> {
  id: T;
  label: string;
  sub?: string;
}

export function VariantenKopf<T extends string>({
  untertypLabel, untertypOptionen, untertyp, onUntertyp,
  detailgrad, onDetailgrad,
}: {
  untertypLabel?: string;
  untertypOptionen?: readonly UntertypOption<T>[];
  untertyp?: T;
  onUntertyp?: (v: T) => void;
  detailgrad: Detailgrad;
  onDetailgrad: (v: Detailgrad) => void;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-raised p-4 space-y-3">
      {untertypOptionen && untertypOptionen.length > 0 && (
        <fieldset className="space-y-1.5">
          <legend className="lc-overline">{untertypLabel ?? 'Untertyp'}</legend>
          <div className="flex flex-wrap gap-2">
            {untertypOptionen.map((o) => (
              <button key={o.id} type="button" onClick={() => onUntertyp?.(o.id)}
                aria-pressed={untertyp === o.id}
                className={`rounded-lg border px-3 py-1.5 text-left text-body-s ${untertyp === o.id ? 'border-brass-500 bg-brass-100 text-ink-900' : 'border-line text-ink-700 hover:border-brass-300'}`}>
                <span className="font-medium block leading-tight">{o.label}</span>
                {o.sub && <span className="text-ink-500 text-xs">{o.sub}</span>}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset className="space-y-1.5">
        <legend className="lc-overline">Detailgrad</legend>
        <div className="grid grid-cols-3 gap-2 max-w-xl">
          {DETAILGRAD_OPTIONEN.map((o) => (
            <button key={o.id} type="button" onClick={() => onDetailgrad(o.id)}
              aria-pressed={detailgrad === o.id}
              className={`rounded-lg border px-3 py-2 text-left text-body-s ${detailgrad === o.id ? 'border-brass-500 bg-brass-100 text-ink-900' : 'border-line text-ink-700 hover:border-brass-300'}`}>
              <span className="font-medium block leading-tight">{o.label}</span>
              <span className="text-ink-500 text-xs">{o.sub}</span>
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
