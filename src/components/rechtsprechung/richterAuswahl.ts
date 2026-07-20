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

/**
 * Namens-Treffer zur Eingabe, Reihenfolge unverändert (bereits count-sortiert).
 *
 * DREI STUFEN, weil der reine Teilketten-Vergleich die häufigste Eingabe verfehlte
 * (Befund Gegenprüfung 20.7.2026): über die Hälfte der Facetten-Einträge ist NUR
 * Nachname oder Initial+Nachname («Stadelmann» 213, «G. Thomi» 302, «Denys» 189) —
 * die Bundesgerichts-Rubra nennen keine Vornamen. Wer «Thomas Stadelmann» eintippt,
 * also so, wie Jurist:innen eine Richterperson benennen, bekam
 * «Keine Richter:in mit diesem Namen im aktuellen Ausschnitt.» — eine SACHLICH
 * FALSCHE Aussage: die Person ist im Ausschnitt, nur unter dem Nachnamen-Eimer.
 *
 *  1. Ganze Eingabe als Teilkette (bisheriges Verhalten, unverändert).
 *  2. Sonst: NACHNAME = letztes Eingabe-Token («Thomas Stadelmann» → «stadelmann»).
 *  3. Sonst: irgendein Token («Stadelmann Thomas», umgekehrte Reihenfolge).
 *
 * Die Stufen greifen strikt nacheinander: solange Stufe 1 etwas findet, ändert sich
 * nichts am bisherigen Ergebnis — die Lockerung tritt nur ein, wo vorher NICHTS
 * stand. Damit kann sie keine engere Suche verwässern.
 */
export function trefferFuer(optionen: RichterZaehler[], q: string): RichterZaehler[] {
  const f = faltName(q.trim());
  if (!f) return optionen;
  const direkt = optionen.filter((o) => faltName(o.name).includes(f));
  if (direkt.length) return direkt;
  const toks = f.split(/\s+/).filter(Boolean);
  if (toks.length < 2) return [];
  const nach = toks[toks.length - 1];
  const ueberNachname = optionen.filter((o) => faltName(o.name).includes(nach));
  if (ueberNachname.length) return ueberNachname;
  return optionen.filter((o) => toks.some((t) => faltName(o.name).includes(t)));
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
