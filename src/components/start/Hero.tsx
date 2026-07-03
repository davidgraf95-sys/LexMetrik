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
// Bausequenz (§10): S5 (diese Schicht) aktiviert die EINE warme Fläche der
// Seite — den Brass-Wash (§0-Verdikt, BINDEND). Reiner Ein-Klassen-Tausch
// dieser Konstante, die Struktur (rounded-2xl border p-6/p-8) bleibt unberührt.
// DOKUMENTIERTER EIN-KLASSEN-FALLBACK: bei Kontrast-Bruch (Auflage 8, gemessen
// in abnahme/startseite-v3/KONTRAST-PROTOKOLL.md) oder Davids Veto genügt es,
// hier auf `bg-surface` zurückzustellen — kein weiterer Umbau nötig.
const HERO_FLAECHE = 'bg-brass-100'; // Fallback: 'bg-surface' (§0/§8 Ein-Klassen-Rückstellung)

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
      {/* Overline auf ink-600 statt ink-500 (§8-Ausweich «dunklere Tinte»): auf
          dem Brass-Wash misst ink-500 nur 4.23:1 (< 4.5, 11px = Kleintext) — die
          eine Stufe dunklere Tinte hebt es auf 6.28:1 (hell) / 6.80:1 (dunkel).
          Messprotokoll: abnahme/startseite-v3/KONTRAST-PROTOKOLL.md, Zeile (c). */}
      <p suppressHydrationWarning className="lc-overline lc-overline-soft text-ink-600">
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
        {/* Such-Hinweis auf ink-600 statt ink-500 (§8-Ausweich, wie die Overline):
            11px-Kleintext auf dem Brass-Wash misst mit ink-500 nur 4.23:1 (axe
            serious) — ink-600 hebt es auf 6.28:1 (hell) / 6.80:1 (dunkel). */}
        <p className="mt-2 text-micro text-ink-600">
          Durchsucht Gesetze, Rechtsprechung, Materialien, Rechner und Vorlagen
        </p>
      </div>
    </div>
  );
}
