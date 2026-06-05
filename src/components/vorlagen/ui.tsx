import { fedlexLinkFuerArtikel } from '../../lib/fedlex';
import { useLocale, fedlexLokalisiert } from '../locale';

// Geteilte UI-Bausteine der Vorlagen-Wizards (Testament, Patientenverfügung, …).

export const inputCls = 'lc-input';

export function Field({ label, children, hint, optional }: {
  label: string; children: React.ReactNode; hint?: string; optional?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-body-s font-medium text-ink-700">
        {label}{optional && <span className="text-ink-500 font-normal"> · optional</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

export function NormLink({ artikel }: { artikel: string }) {
  const { locale } = useLocale();
  const roh = fedlexLinkFuerArtikel(artikel);
  const url = roh ? fedlexLokalisiert(roh, locale) : null;
  return url
    ? <a href={url} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700">{artikel}</a>
    : <span className="lc-chip">{artikel}</span>;
}

// Stepper-Leiste (klickbar bis zum erreichten Schritt)
export function Stepper({ schritte, aktiv, onWechsel }: {
  schritte: readonly { id: string; label: string }[];
  aktiv: number;
  onWechsel: (i: number) => void;
}) {
  return (
    <nav aria-label="Schritte" className="flex flex-wrap gap-x-1 gap-y-2">
      {schritte.map((s, i) => {
        const erledigt = i < aktiv;
        const istAktiv = i === aktiv;
        return (
          <button key={s.id} type="button" onClick={() => i <= aktiv && onWechsel(i)}
            aria-current={istAktiv ? 'step' : undefined}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              istAktiv ? 'bg-surface-raised border border-line text-brass-700 shadow-sm'
              : erledigt ? 'text-ink-700 hover:bg-brass-100/50'
              : 'text-ink-500 cursor-default'
            }`}>
            <span className={`num inline-flex items-center justify-center w-5 h-5 rounded-full text-micro ${
              erledigt ? 'bg-brass-500 text-ink-900' : istAktiv ? 'border border-brass-500 text-brass-700' : 'border border-line text-ink-500'
            }`}>{erledigt ? '✓' : i + 1}</span>
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}

// ─── Geteilte Engine-UI (UX-Programm Etappe 1, 5.6.2026) ────────────────────
// Entdoppelung wortgleicher Muster aus den 12 Rechner-Formularen (§10).

/** Live-Hinweis über dem Ergebnisblock — vorher 9× wortgleich dupliziert. */
export function LiveHeader() {
  return (
    <p className="lc-live lc-overline text-ink-500 normal-case" style={{ letterSpacing: '0.04em' }}>
      Live-Berechnung – aktualisiert sich automatisch
    </p>
  );
}

/** Einheitliche Eingabefehler-Box (vorher 4 Varianten; immer role="alert"). */
export function FehlerBox({ fehler }: { fehler: string[] }) {
  if (fehler.length === 0) return null;
  return (
    <div role="alert" className="rounded-lg border border-line bg-danger-bg p-4 space-y-1">
      <p className="text-xs font-semibold text-danger-700 uppercase tracking-wide mb-1">Eingabefehler</p>
      {fehler.map((f, i) => <p key={i} className="text-body-s text-danger-700">• {f}</p>)}
    </div>
  );
}
