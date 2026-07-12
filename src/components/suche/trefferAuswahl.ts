// ─── Pfeil-Auswahl im Such-Dropdown über einen STABILEN Treffer-Key ─────────
//
// UI-NAV (Race-Fix zu #183/#210): Header-Suche UND Hero führten die aktive
// Pfeil-Auswahl bislang als POSITIONS-Index (`aktivIndex`) in die per
// `flatMap` gebaute Trefferliste. Diese Liste wächst aber ASYNCHRON: die
// teure Artikel-Volltextgruppe ist per `useDeferredValue` entkoppelt (§15.3,
// #183) und landet «einen Tick später». Ein Positions-Index zeigt nach dem
// Einwachsen auf einen ANDEREN Treffer — Enter sprang ins falsche Ziel
// (empirisch unter CPU-Drossel: SCHKG#art-257 statt OR#art-257_d, #210).
//
// Wurzel-Fix: die Auswahl wird über den STABILEN Options-Key (die `oid`,
// suchOptionId) geführt, nicht über die Position. Wächst die deferred Gruppe
// ein, relokalisiert `findIndex` den semantisch GLEICHEN Treffer an seine neue
// Stelle — die Auswahl folgt ihm, das Ziel bleibt unverändert. Verschwindet der
// gewählte Treffer ganz (er ist in der neuen Trefferwelt nicht mehr da), fällt
// die Auswahl sauber auf «nichts» zurück (Enter → oberster Treffer/Norm-Sprung,
// A5/P3-Kontrakt) statt auf einen fremden Treffer zu springen.
//
// Reine Auswahl-Arithmetik (§2/§3): keine Rechts-/Trefferlogik, nur Navigation.

/** Ein flacher Treffer in Anzeigereihenfolge: stabile Options-ID + Ziel-Link. */
export interface FlacherTreffer {
  /** Stabile, zwischen Feld und Panel geteilte Options-ID (suchOptionId). */
  oid: string;
  /** Deep-Link des Treffers. */
  href: string;
}

/** Position des per Key gewählten Treffers in der AKTUELLEN (evtl. gewachsenen)
 *  Liste — oder -1, wenn nichts gewählt ist ODER der Treffer nicht mehr
 *  existiert. Das «nicht mehr existiert → -1» ist die Kern-Invariante: die
 *  Auswahl springt nie stillschweigend auf einen Nachbar-Treffer um. */
export function aktivePosition(flach: FlacherTreffer[], aktivKey: string | null): number {
  if (aktivKey === null) return -1;
  return flach.findIndex((f) => f.oid === aktivKey);
}

/** Key des NÄCHSTEN Treffers (ArrowDown). Ohne gültige Auswahl → erster;
 *  am Listenende → wieder erster (Wrap, wie bisher). */
export function naechsterKey(flach: FlacherTreffer[], aktivKey: string | null): string | null {
  if (flach.length === 0) return null;
  const pos = aktivePosition(flach, aktivKey); // -1 → (‑1+1)%len = 0 = erster
  return flach[(pos + 1) % flach.length].oid;
}

/** Key des VORIGEN Treffers (ArrowUp). Ohne gültige Auswahl → letzter (Wrap). */
export function vorigerKey(flach: FlacherTreffer[], aktivKey: string | null): string | null {
  if (flach.length === 0) return null;
  const pos = aktivePosition(flach, aktivKey); // -1 → -1<=0 → letzter
  return flach[pos <= 0 ? flach.length - 1 : pos - 1].oid;
}

/** Der `href` des per Key gewählten Treffers — oder undefined, wenn keiner
 *  gewählt ist bzw. der gewählte Treffer nicht (mehr) in der Liste steht. */
export function gewaehlterHref(flach: FlacherTreffer[], aktivKey: string | null): string | undefined {
  const pos = aktivePosition(flach, aktivKey);
  return pos >= 0 ? flach[pos].href : undefined;
}

/** Die Options-ID (`oid`) des gewählten Treffers für `aria-activedescendant` —
 *  nur gesetzt, wenn der Treffer tatsächlich in der Liste steht (kein
 *  hängender ARIA-Verweis auf einen verschwundenen Treffer). */
export function aktiveOptionId(flach: FlacherTreffer[], aktivKey: string | null): string | undefined {
  const pos = aktivePosition(flach, aktivKey);
  return pos >= 0 ? flach[pos].oid : undefined;
}
