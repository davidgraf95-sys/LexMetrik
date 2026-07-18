import { erfassungsgrad, STUFE_WORT, type ErfassungsStufe } from '../../lib/normtext/erfassungsgrad';

// ── IA-2 · Erfassungsgrad-Badges (§11.2 / §11.6.8) ───────────────────────────
// Reine Darstellung (§3) über der SSoT erfassungsgrad.ts. a11y-Kern (§11.6.8,
// §13/F): NIE nur Farbe — jede Stufe trägt das Zustands-WORT als Text; die
// Erlass-Zahl steht daneben (Zahl + Wort = das ehrliche Signal, §8). Kein
// Prozentsatz, keine Wort-Ampel mit Werturteil.

// Token-basierte Badge-Klasse je Stufe (§13/D2 — keine Ad-hoc-Farben):
// «vollständig» = ok/geltend (sage), «Auswahl» = massgeblich (Messing),
// «dünn» = weiche Status-Border (gedämpft, ehrlich zurückhaltend).
const BADGE_KLASSE: Readonly<Record<ErfassungsStufe, string>> = {
  vollstaendig: 'lc-badge lc-badge-ok',
  auswahl: 'lc-badge lc-badge-massgeblich',
  duenn: 'lc-badge lc-badge-soft',
};

/**
 * Kompaktes Stufen-Wort-Badge (nur das Zustands-Wort) — dort eingesetzt, wo die
 * Erlass-Zahl bereits unmittelbar daneben steht (Kachel, Schnellwechsel-Pill,
 * Karten-Bildunterschrift). Das Wort ist Text → nicht nur Farbe (§11.6.8).
 */
export function StufeBadge({ kanton, n, className }: { kanton: string; n: number; className?: string }) {
  const g = erfassungsgrad(kanton, n);
  return (
    <span className={`${BADGE_KLASSE[g.stufe]}${className ? ` ${className}` : ''}`}>
      {STUFE_WORT[g.stufe]}
    </span>
  );
}

/**
 * Kurzlegende für die «Kantone»-Einstiegskachel (§11.1): erklärt die drei
 * Zustands-Wörter ohne Wertung. Reine Erläuterung (§8-ehrlich).
 */
export function ErfassungsgradLegende({ className }: { className?: string }) {
  return (
    <span className={`text-xs text-ink-500${className ? ` ${className}` : ''}`}>
      Erfassungsgrad je Kanton: <span className="text-ink-700">vollständig</span> ·{' '}
      <span className="text-ink-700">Auswahl</span> · <span className="text-ink-700">dünn</span>
    </span>
  );
}
