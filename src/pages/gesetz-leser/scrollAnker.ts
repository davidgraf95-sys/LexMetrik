// W2·5d U-POSITION/A16: anker-basierte Scroll-Restoration für den Gesetz-Leser.
//
// David 5.7.2026: «Zurück landet EXAKT am Ausgangsort.» Wurzel-Problem — die
// gespeicherte absolute Scrollposition (window.scrollY, App.tsx:ScrollWieder-
// herstellung) ist bei langen Gesetzen mit `content-visibility:auto` UNZUVERLÄSSIG:
// die Platzhalterhöhen off-screen materialisieren erst beim Rendern, ein absolutes
// scrollY=X landet nach Re-Layout an einem ANDEREN Artikel («Seitenanfang statt
// Art. 5»). Davids eigener Hinweis: anker-basiert wiederherstellen — «letzter
// sichtbarer Artikel + Offset».
//
// Diese kleine Registry hält je Reiter-Identität (tabSchluessel, Pfad + ?r, ohne
// #Hash/?preset) den zuletzt beobachteten Anker {Artikel-Token, Offset}. Der Reader
// pflegt ihn beim Scrollen; App.tsx:ScrollWiederherstellung löst ihn beim
// Zurück-/Reiter-Wechsel gegen das AKTUELLE DOM auf (element-basiert → robust gegen
// die content-visibility-Höhen-Neuschätzung) und fällt auf das gespeicherte scrollY
// zurück, wenn der Anker (noch) nicht auflösbar ist.
//
// ZUSTANDSLOS (§5): nur Pfad-Schlüssel + Zahl/Token, nie Fall-/Formulardaten.
// Reine Darstellungs-Infrastruktur (§3), deterministisch bei gleichem DOM (§2).

export interface ScrollAnker {
  /** Artikel-Token (id ohne «art-»-Präfix), z. B. «5» oder «335_c». */
  token: string;
  /** px, um die die Artikel-Oberkante ZUM Aufnahmezeitpunkt ÜBER der Bezugslinie
   *  lag (≥ 0 = in den Artikel hineingescrollt). Bewahrt die Feinposition. */
  offset: number;
}

const anker = new Map<string, ScrollAnker>();

export function merkeAnker(key: string, a: ScrollAnker): void {
  anker.set(key, a);
}

export function leseAnker(key: string): ScrollAnker | undefined {
  return anker.get(key);
}

/**
 * Bezugslinie (px ab Container-Oberkante), an der «der oberste angeschnittene
 * Artikel» gemessen wird — deckungsgleich mit dem Scroll-Spy (`inhalt.tsx`) und
 * dem `.nt-anker`-scroll-margin (index.css: 5rem). rem-basiert ⇒ skaliert mit der
 * Schriftskala (R3) mit. `containerTop` = 0 für das Fenster, sonst Pane-Oberkante.
 */
export function bezugslinie(containerTop: number, remPx: number): number {
  return containerTop + 5 * remPx + 8;
}

/**
 * Löst den gespeicherten Anker gegen das aktuelle Dokument (Fenster-Scroll) in ein
 * Ziel-scrollY auf. null, wenn kein Anker existiert oder das Artikel-Element (noch)
 * nicht im DOM ist (⇒ Aufrufer nutzt den scrollY-Fallback). Element-basiert und
 * darum robust gegen die content-visibility-Höhenschätzung: das Artikel-Element
 * liegt IMMER im DOM (nur off-screen unrendered), getElementById findet es.
 */
export function aufloeseAnkerY(key: string): number | null {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null;
  const a = anker.get(key);
  if (!a) return null;
  const el = document.getElementById(`art-${a.token}`);
  if (!el) return null;
  const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const bezug = bezugslinie(0, remPx);
  const top = el.getBoundingClientRect().top;
  // Ziel-scrollY so, dass die Artikel-Oberkante wieder `offset` px über der
  // Bezugslinie liegt: scrollY + (top - (bezug - offset)).
  return Math.max(0, Math.round(window.scrollY + top - bezug + a.offset));
}
