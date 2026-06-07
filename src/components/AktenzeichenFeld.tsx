import { Field, inputCls } from './vorlagen/ui';

// ─── Aktenzeichen-/Referenzfeld — geteilter Baustein (FAHRPLAN-PRAXIS 1.2) ──
// Optionale Mandats-Referenz des Nutzers; erscheint im Kopf des PDF-
// Rechenberichts (rechts, unter «Erstellt»). Reine Darstellung (§3);
// wird nirgends gespeichert oder übertragen.

export function AktenzeichenFeld({ value, onChange }: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label="Aktenzeichen / Referenz" optional hint="erscheint auf dem PDF-Rechenbericht und im Kalender-Eintrag (bleibt im Browser)">
      <input
        className={inputCls + ' sm:max-w-[18rem]'}
        value={value}
        maxLength={60}
        onChange={(e) => onChange(e.target.value)}
        placeholder="z. B. 2026-014 MUS"
      />
    </Field>
  );
}
