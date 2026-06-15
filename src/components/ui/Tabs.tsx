// ─── Tabs: generisches Segmented-Control (Darstellungsschicht, §3) ──────────
// Verhaltensneutrale Entdoppelung (5.6.2026): zuvor wortgleich in Katalog
// (Pro-Tabs, Filter-Status-Toggle) und AllgemeineFristForm (Modus-Tabs) —
// dort Markup EXAKT wie zuvor. Die SchKG/ZPO-Phasenwahl (UX B12) wurde
// dagegen BEWUSST vom dunklen Button-Stil auf diese Segmented-Control-Optik
// vereinheitlicht (Funktion identisch). Die ursprünglichen Fundstellen unterschieden
// sich nur in Höhe/Textgrösse/Padding (→ Grösse `s`/`m`) und der Semantik
// (`mode`: ARIA-Tabs `role=tab/aria-selected` vs. Toggle-Buttons
// `aria-pressed`). Keine Logik, kein Zustand — reiner gesteuerter View.

export type TabItem<T extends string> = { code: T; label: React.ReactNode };

/** Grösse: `m` = h-9/text-body-s/px-3 (Tabs); `s` = h-8/text-xs/px-2.5 (Filter-Toggle). */
type TabGroesse = 's' | 'm';

const KNOPF: Record<TabGroesse, string> = {
  m: 'px-3 rounded-md text-body-s font-medium transition-all',
  s: 'px-2.5 rounded-md text-xs font-medium transition-all',
};
// Mobile grössere Trefferfläche (Redesign E7: h-11 = 44px erreicht auf Touch
// die AAA-Empfehlung), ab sm zurück auf die kompakte Desktop-Höhe.
const HOEHE: Record<TabGroesse, string> = { m: 'h-11 sm:h-9', s: 'h-10 sm:h-8' };

const AKTIV = 'bg-surface-raised text-brass-700 shadow-sm border border-line';
const INAKTIV = 'text-ink-600 hover:text-ink-900';

export function Tabs<T extends string>({
  items, value, onChange, groesse = 'm', mode = 'tab', ariaLabel,
}: {
  items: readonly TabItem<T>[];
  value: T;
  onChange: (code: T) => void;
  groesse?: TabGroesse;
  /** `tab` = role=tablist/tab + aria-selected; `pressed` = aria-pressed-Buttons. */
  mode?: 'tab' | 'pressed';
  ariaLabel?: string;
}) {
  return (
    <div
      role={mode === 'tab' ? 'tablist' : undefined}
      aria-label={ariaLabel}
      className={`flex ${HOEHE[groesse]} items-stretch gap-1 p-0.5 bg-surface border border-line rounded-lg w-fit max-w-full overflow-x-auto`}
    >
      {items.map((it) => {
        const aktiv = value === it.code;
        return (
          <button
            key={it.code}
            type="button"
            role={mode === 'tab' ? 'tab' : undefined}
            aria-selected={mode === 'tab' ? aktiv : undefined}
            aria-pressed={mode === 'pressed' ? aktiv : undefined}
            onClick={() => onChange(it.code)}
            // Touch-Target (FAHRPLAN-DESIGN 3.2, revidiert im Bug-Check §9):
            // eine Pseudo-Element-Erweiterung wird vom overflow-x-auto-
            // Container geclippt und wäre wirkungslos. h-8/h-9 erfüllen
            // WCAG 2.2 AA (≥24px); AAA (44px) ist in einer scrollbaren
            // Segmented-Control ohne Redesign nicht erreichbar.
            className={`shrink-0 whitespace-nowrap ${KNOPF[groesse]} ${aktiv ? AKTIV : INAKTIV}`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
