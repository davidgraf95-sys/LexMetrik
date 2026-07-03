import { useState } from 'react';
import { HERO_TITEL, HERO_SUBLINE } from '../../lib/seo';
import { UniversalSuche } from './UniversalSuche';

// ─── Hero der Startseite (Startseite V3, Modul #1 — ersetzt Begruessung) ─────
//
// Ruhige Kopffläche mit der Value Proposition (H1), einer Subline und der
// UniversalSuche als offensichtlichem erstem Zug (FAHRPLAN §2/§3/§6). Reine
// Darstellung (§3): kein Gruss-Wort, kein Scherzpool, keine tickende Uhr, keine
// Badges, keine Deko — die eine Datums-Overline genügt.
//
// Bausequenz (§10): in DIESEM Schritt (S4) liegt der Hero bewusst noch auf
// `bg-surface`. Die eine warme Fläche (Brass-Wash) kommt erst in S5 — und zwar
// als reiner Ein-Klassen-Tausch dieser einen Konstante. NICHT die Struktur
// anfassen, nur den Wert wechseln:
const HERO_FLAECHE = 'bg-surface'; // S5: bg-brass-100 (Brass-Wash, §0-Verdikt; Fallback bleibt bg-surface)

// Datum «Donnerstag, 3. Juli 2026» — deterministisch ohne Locale-Abhängigkeit
// (SSR-stabil, keine Intl-Überraschungen zwischen Node und Browser).
const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
function heuteLang(d: Date): string {
  return `${WOCHENTAGE[d.getDay()]}, ${d.getDate()}. ${MONATE[d.getMonth()]} ${d.getFullYear()}`;
}

export function Hero() {
  // Datum EINMAL beim Mount (lazy init) — keine tickende Uhr (§0). Client-
  // spezifisch: der beim Prerender gebackene Build-Tag weicht vom Client-Tag ab
  // (Build-Datum ≠ Client-Datum), das ist gewollt und harmlos → die eine
  // client-divergente Zeile trägt darum ehrlich suppressHydrationWarning. Die
  // fixe Overline-Zeilenhöhe (lc-overline) hält den Platz, egal wie lang der Tag
  // ausfällt → kein Layout-Sprung (§15).
  const [jetzt] = useState(() => new Date());
  return (
    <div className={`${HERO_FLAECHE} rounded-2xl border border-line p-6 sm:p-8`}>
      <p suppressHydrationWarning className="lc-overline lc-overline-soft text-ink-500">
        {heuteLang(jetzt)}
      </p>
      <h1 className="mt-2 font-display font-semibold text-ink-900 text-h1 sm:text-display leading-tight">
        {HERO_TITEL}
      </h1>
      <p className="mt-3 text-body-l text-ink-700 max-w-reading">
        {HERO_SUBLINE}
      </p>
      <div className="mt-5">
        <UniversalSuche />
        <p className="mt-2 text-micro text-ink-500">
          Durchsucht Gesetze, Rechtsprechung, Materialien, Rechner und Vorlagen
        </p>
      </div>
    </div>
  );
}
