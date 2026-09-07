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
    // ── U2-NACHZUG (Prüfbefund R-5 der Rechner-Familie, 6.9.2026) ─────────
    //  Dieselbe Umstellung wie an `.lc-card` (index.css): kein Seitenrahmen,
    //  keine eigene Füllung, Trennung über je eine Haarlinie oben und unten.
    //  GEMESSEN hatte der Prüfer die Karte auf ALLEN 20 Rechner-Routen als
    //  «Rahmen ≥ 3 Seiten + Füllung ≠ Papier» — und die Füllungsdifferenz mit
    //  2–4/255 (hell) als visuell nicht wahrnehmbar. Genau das ist der U2-Fall:
    //  ein Kasten, den man sieht, um eine Fläche, die es nicht gibt. Er blieb
    //  in jenem Bericht als «kein Handlungsbedarf» stehen, weil er isoliert
    //  betrachtet wurde; NEBEN einer linien-basierten `.lc-card` auf derselben
    //  Seite ist er die Inkonsistenz, die David meint («alles angleichen»).
    //  Der Radius war mit R1 ohnehin schon 0 (`--radius-2xl: 0px`) — die
    //  Utility `rounded-2xl` erzeugte keine sichtbare Rundung mehr und fällt
    //  darum ersatzlos weg statt still mitgeführt zu werden.
    <div className={`border-y border-rule-soft ${pad}${className ? ' ' + className : ''}`} {...rest}>
      {children}
    </div>
  );
}
