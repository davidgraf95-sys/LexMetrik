// Race-Repro + Regression für die Pfeil-Auswahl im Such-Dropdown (#183/#210).
//
// Der Kern der Race: die per useDeferredValue entkoppelte Artikel-Volltextgruppe
// (§15.3) landet «einen Tick später» und wächst in die flache Trefferliste ein.
// Führte man die Auswahl als POSITIONS-Index, zeigte derselbe Index nach dem
// Einwachsen auf einen ANDEREN Treffer — Enter sprang ins falsche Ziel
// (empirisch: SCHKG#art-257 statt OR#art-257_d). Diese Datei bildet genau das
// Szenario deterministisch ab: «Pfeil runter → Gruppe wächst ein → Enter ⇒ Ziel
// UNVERÄNDERT». Der eingebaute Positions-Resolver (`positionsHref`) zeigt, dass
// das Szenario den Bug WIRKLICH auslöst (rot); der Key-Resolver schliesst ihn.
import { describe, it, expect } from 'vitest';
import {
  aktivePosition,
  naechsterKey,
  vorigerKey,
  gewaehlterHref,
  aktiveOptionId,
  type FlacherTreffer,
} from '../../components/suche/trefferAuswahl';

// Vor dem Einwachsen der deferred Artikelgruppe: Sprung + eine Gesetz-Gruppe.
const vorher: FlacherTreffer[] = [
  { oid: 'lb-sprung-OR_257d', href: '/gesetze/bund/OR#art-257_d' },
  { oid: 'lb-gesetze-OR', href: '/gesetze/bund/OR' },
];

// Nach dem Einwachsen: die Artikel-Volltextgruppe (deferred) ist VOR den
// Gesetzen eingeschoben und hat die Positionen verschoben — der Treffer, der
// vorher auf Index 1 lag (OR-Gesetz), steht jetzt auf Index 3, und Index 1
// hält nun einen fremden Artikel-Treffer (SCHKG#art-257).
const nachher: FlacherTreffer[] = [
  { oid: 'lb-sprung-OR_257d', href: '/gesetze/bund/OR#art-257_d' },
  { oid: 'lb-artikel-SCHKG_257', href: '/gesetze/bund/SchKG#art-257' },
  { oid: 'lb-artikel-OR_257d', href: '/gesetze/bund/OR#art-257_d' },
  { oid: 'lb-gesetze-OR', href: '/gesetze/bund/OR' },
];

/** Der PRE-FIX-Resolver: Auswahl als reiner Positions-Index (flach[i].href).
 *  Nur im Test, um zu belegen, dass das Szenario den Bug auslöst. */
function positionsHref(flach: FlacherTreffer[], pos: number): string | undefined {
  return pos >= 0 && pos < flach.length ? flach[pos].href : undefined;
}

describe('Such-Dropdown Pfeil-Auswahl: stabiler Key statt Positions-Index', () => {
  it('Positions-Index (PRE-FIX) springt beim Einwachsen ins FALSCHE Ziel', () => {
    // Pfeil runter wählt in `vorher` Position 1 (das OR-Gesetz).
    const pos = 1;
    expect(positionsHref(vorher, pos)).toBe('/gesetze/bund/OR');
    // Gruppe wächst ein → derselbe Positions-Index zeigt jetzt auf SCHKG (Bug).
    expect(positionsHref(nachher, pos)).toBe('/gesetze/bund/SchKG#art-257');
    // Beweis: das Ziel hat sich unter der Auswahl WEGgeschoben.
    expect(positionsHref(nachher, pos)).not.toBe(positionsHref(vorher, pos));
  });

  it('stabiler Key: Pfeil runter → Gruppe wächst ein → Enter ⇒ Ziel UNVERÄNDERT', () => {
    // Pfeil runter (ohne Vorauswahl) wählt den ersten Treffer …
    let key = naechsterKey(vorher, null);
    expect(key).toBe('lb-sprung-OR_257d');
    // … noch einmal Pfeil runter wählt den zweiten Treffer (das OR-Gesetz).
    key = naechsterKey(vorher, key);
    expect(key).toBe('lb-gesetze-OR');
    const zielVorher = gewaehlterHref(vorher, key);
    expect(zielVorher).toBe('/gesetze/bund/OR');

    // Deferred Artikelgruppe wächst ein → Positionen verschieben sich …
    expect(aktivePosition(vorher, key)).toBe(1);
    expect(aktivePosition(nachher, key)).toBe(3); // relokalisiert!

    // … Enter nimmt den per Key gewählten Treffer: Ziel UNVERÄNDERT.
    const zielNachher = gewaehlterHref(nachher, key);
    expect(zielNachher).toBe('/gesetze/bund/OR');
    expect(zielNachher).toBe(zielVorher);
    // Und aria-activedescendant folgt dem Treffer an seine neue Position.
    expect(aktiveOptionId(nachher, key)).toBe('lb-gesetze-OR');
  });

  it('verschwindet der gewählte Treffer, fällt die Auswahl sauber auf «nichts» (Enter → oberster)', () => {
    const key = 'lb-gesetze-OR';
    const wegGewachsen: FlacherTreffer[] = [
      { oid: 'lb-sprung-OR_257d', href: '/gesetze/bund/OR#art-257_d' },
      { oid: 'lb-artikel-OR_257d', href: '/gesetze/bund/OR#art-257_d' },
    ];
    expect(aktivePosition(wegGewachsen, key)).toBe(-1);
    expect(gewaehlterHref(wegGewachsen, key)).toBeUndefined();
    expect(aktiveOptionId(wegGewachsen, key)).toBeUndefined();
    // Kein Sprung auf einen Nachbar-Treffer — die Komponente nimmt dann den obersten.
  });

  it('ohne Auswahl ist nichts aktiv (Enter = oberster Treffer/Norm-Sprung, A5/P3)', () => {
    expect(aktivePosition(vorher, null)).toBe(-1);
    expect(gewaehlterHref(vorher, null)).toBeUndefined();
    expect(aktiveOptionId(vorher, null)).toBeUndefined();
  });

  it('Pfeil-Navigation wickelt an beiden Enden korrekt um (Wrap wie bisher)', () => {
    // ArrowUp ohne Auswahl → letzter Treffer.
    expect(vorigerKey(vorher, null)).toBe('lb-gesetze-OR');
    // ArrowDown am letzten Treffer → wieder erster.
    expect(naechsterKey(vorher, 'lb-gesetze-OR')).toBe('lb-sprung-OR_257d');
    // ArrowUp am ersten Treffer → letzter.
    expect(vorigerKey(vorher, 'lb-sprung-OR_257d')).toBe('lb-gesetze-OR');
    // Leere Liste → kein Key.
    expect(naechsterKey([], null)).toBeNull();
    expect(vorigerKey([], null)).toBeNull();
  });
});
