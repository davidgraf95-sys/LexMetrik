// ─── Such-/Auswahl-Arithmetik der Richter-Facette ───────────────────────────
//
// Reine Helfer der DARSTELLUNGSSCHICHT (§3: keine Rechtslogik) in einem eigenen
// Modul — dieselbe Aufteilung wie components/suche/trefferAuswahl.ts, und von der
// react-refresh-Regel verlangt (eine .tsx exportiert nur Komponenten).
// Deterministisch (§2) und ohne React, darum direkt unit-testbar.

import type { RichterZaehler } from '../../lib/rechtsprechung/browse';

/**
 * Höchstens so viele Optionen gleichzeitig im DOM — der Rest wird eingetippt
 * (§15: kein 180-Knoten-Listbox-Dauerbaum), die Zahl bleibt ehrlich sichtbar.
 *
 * Die Zahl ist bewusst so klein, dass die Liste OHNE eigenen Scroll-Container
 * auskommt: ein `overflow-y-auto`-Kasten ohne Tastatur-Fokus ist ein axe-
 * `scrollable-region-focusable`-Verstoss (serious, empirisch 20.7.2026), und ein
 * Scroll-Container bräuchte zusätzlich eine scrollIntoView-Kopplung an die
 * Pfeil-Auswahl. Kurze Liste + Eintippen löst beides ersatzlos.
 */
export const SICHTBAR_MAX = 8;

/**
 * Diakritika-neutrale Suchform: «muller» findet «Müller», «gelzer» «Gelzer».
 * Deterministisch (§2), rein lexikalisch — keine Namens-/Personenlogik.
 */
export function faltName(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').toLowerCase();
}

/** Namens-Treffer zur Eingabe, Reihenfolge unverändert (bereits count-sortiert). */
export function trefferFuer(optionen: RichterZaehler[], q: string): RichterZaehler[] {
  const f = faltName(q.trim());
  if (!f) return optionen;
  return optionen.filter((o) => faltName(o.name).includes(f));
}

// Auswahl über den STABILEN Slug statt über einen Positions-Index — dieselbe
// Lektion wie in components/suche/trefferAuswahl.ts (#210): die Trefferliste
// wächst/schrumpft beim Tippen, ein Index zeigte danach auf eine ANDERE Person.
// Fällt der gewählte Slug aus der Liste, endet die Auswahl sauber auf «nichts»,
// statt auf die Nachbar-Person zu springen.
function position(liste: RichterZaehler[], aktiv: string | null): number {
  return aktiv === null ? -1 : liste.findIndex((o) => o.slug === aktiv);
}

/** Nächster Slug (ArrowDown); ohne gültige Auswahl der erste, am Ende Wrap. */
export function naechsterSlug(liste: RichterZaehler[], aktiv: string | null): string | null {
  if (liste.length === 0) return null;
  return liste[(position(liste, aktiv) + 1) % liste.length].slug;
}

/** Voriger Slug (ArrowUp); ohne gültige Auswahl der letzte (Wrap). */
export function vorigerSlug(liste: RichterZaehler[], aktiv: string | null): string | null {
  if (liste.length === 0) return null;
  const p = position(liste, aktiv);
  return liste[p <= 0 ? liste.length - 1 : p - 1].slug;
}
