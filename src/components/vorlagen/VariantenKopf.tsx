import { DETAILGRAD_OPTIONEN, type Detailgrad } from '../../lib/vorlagen/detailgrad';
import { SelectionGrid } from '../ui/SelectionGrid';

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
  // R5-F2 (6.9.2026): Kasten (Rahmen rundum + Radius + eigene Füllung) →
  // Linien-Block. Der Kopf-Schalter ist kein Objekt auf dem Papier, sondern
  // ein Abschnitt: eine weiche Linie oben und unten, sonst Weissraum
  // (§5 «Linien statt Flächen»).
  return (
    <div className="border-y border-rule-soft py-4 space-y-3">
      {untertypOptionen && untertypOptionen.length > 0 && (
        <fieldset className="space-y-1.5">
          <legend className="lc-overline">{untertypLabel ?? 'Untertyp'}</legend>
          {/* B3-4 (R3-α, 31.8.2026): eigene Kachel-Anatomie → der EINE
              Baustein. Die ink-600-Messung des Unterlabels ist mit dorthin
              gewandert, `min-h-11` kommt neu dazu. */}
          <SelectionGrid<T>
            className="flex flex-wrap gap-2"
            items={untertypOptionen.map((o) => ({ code: o.id, label: o.label, sub: o.sub }))}
            value={untertyp ?? ''} onSelect={(c) => onUntertyp?.(c)} />
        </fieldset>
      )}
      <fieldset className="space-y-1.5">
        <legend className="lc-overline">Detailgrad</legend>
        {/* dito B3-4 */}
        <SelectionGrid
          className="grid grid-cols-3 gap-2 max-w-xl"
          items={DETAILGRAD_OPTIONEN.map((o) => ({ code: o.id, label: o.label, sub: o.sub }))}
          value={detailgrad} onSelect={onDetailgrad} />
      </fieldset>
    </div>
  );
}
