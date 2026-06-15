import type { ReactNode } from 'react';

// Gemeinsamer Kopf der statischen/Sekundärseiten (Redesign E10): Overline +
// Ablesekante (scale-rule = Marken-Signet) + responsive H1, optional Intro und
// eine Zusatzzeile (z. B. Status-Badge). Löst die zuvor 4× von Hand nachgebauten
// Köpfe ab — die stille Drift (Kontakt hatte die scale-rule verloren, drei
// Schreibweisen fürs Label, ErrorBoundary fiel ganz heraus) verschwindet damit
// an EINER Stelle. Reine Darstellung (§3).
export function SeitenKopf({ overline, titel, intro, children }: {
  overline: string;
  titel: string;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="lc-overline">{overline}</p>
      <div className="scale-rule max-w-[280px]" aria-hidden />
      <h1 className="text-h2 sm:text-h1 font-display font-semibold text-ink-900">{titel}</h1>
      {intro && <p className="text-body-l text-ink-600 leading-relaxed">{intro}</p>}
      {children}
    </div>
  );
}
