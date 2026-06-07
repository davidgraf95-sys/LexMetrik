// ─── SelectionGrid: Auswahlkacheln (aria-pressed) – Darstellungsschicht (§3) ─
// Verhaltensneutrale Entdoppelung (5.6.2026): zuvor ~14× wortgleich in den
// Vorlagen-Wizards (Arbeitsvertrag, Mietvertrag, Vorsorgeauftrag,
// Patientenverfügung, Schlichtungsgesuch) und im Teuerungsrechner.
// Markup-Klassen sind EXAKT wie zuvor; die Fundstellen unterschieden sich nur
// im Grid-Container (Spaltenzahl → `className`) und darin, ob eine Kachel eine
// Unterzeile (`sub`) trägt. Keine Logik — reiner gesteuerter View.

export type SelectionItem<T extends string> = {
  code: T;
  label: React.ReactNode;
  /** Optionale Unterzeile (text-xs). Fehlt sie, entfällt die Sub-Span. */
  sub?: React.ReactNode;
};

export function SelectionGrid<T extends string>({
  items, value, onSelect, className,
}: {
  items: readonly SelectionItem<T>[];
  /** Aktueller Wert; darf breiter sein als die Item-Codes (z. B. ein
      «keine_angabe», das in keiner Kachel vorkommt → keine ist aktiv). */
  value: T | (string & {});
  onSelect: (code: T) => void;
  /** Grid-Container-Klassen (Spalten/Gap) – exakt wie an der Fundstelle. */
  className: string;
}) {
  return (
    <div className={className}>
      {items.map((it) => {
        const aktiv = value === it.code;
        return (
          <button
            key={it.code}
            type="button"
            onClick={() => onSelect(it.code)}
            aria-pressed={aktiv}
            className={`text-left p-3 min-h-11 rounded-lg border transition-colors ${
              aktiv ? 'border-brass-500 bg-brass-100/60' : 'border-line bg-surface hover:border-brass-400'
            }`}
          >
            <span className="block text-body-s font-semibold text-ink-900">{it.label}</span>
            {it.sub !== undefined && <span className="block text-xs text-ink-500">{it.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}
