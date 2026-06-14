import type { ReactNode, HTMLAttributes } from 'react';

// Flächen-Primitive: die Haupt-Inhaltskarte der Rechner-/Vorlagenseiten.
// EINE Quelle für Radius/Rahmen/Padding statt des 17× wortgleich kopierten
// Inline-Wrappers (FAHRPLAN-FUNDAMENT / Redesign E2). Reine Darstellung — der
// gerenderte Klassenstring ist identisch zum bisherigen Inline-Markup.
//
//  padding="lg" (Default) → p-6 sm:p-8   (Seiten-Inhaltskarte)
//  padding="md"           → p-5 sm:p-6   (kompakter, z. B. Wizard-Karte)
export function Card({
  children,
  className = '',
  padding = 'lg',
  ...rest
}: {
  children: ReactNode;
  className?: string;
  padding?: 'lg' | 'md';
} & HTMLAttributes<HTMLDivElement>) {
  const pad = padding === 'md' ? 'p-5 sm:p-6' : 'p-6 sm:p-8';
  return (
    <div className={`bg-surface-raised rounded-2xl border border-line ${pad}${className ? ' ' + className : ''}`} {...rest}>
      {children}
    </div>
  );
}
