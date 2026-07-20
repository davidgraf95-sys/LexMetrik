// Identitäts-Beleg statt Substring-Präsenz (CLAUDE.md §6 Ziff. 7 d).
// Vorfall PR #309: 11 erfundene Amtsträger:innen gingen live, weil der Beleg
// `ft.includes(nachSlug)` war — jede zufällige Teilkette galt als Nachweis.
import { istWortTreffer } from '../../scripts/rechtsprechung/check-besetzung';
import { fold } from '../lib/rechtsprechung/besetzung';

const ft = (s: string) => fold(s);

describe('istWortTreffer — Identität, nicht Präsenz', () => {
  it('echter Nachname im Spruchkörper → Treffer', () => {
    expect(istWortTreffer(ft('Bundesrichter Meier, Gerichtsschreiberin Ott'), fold('Ott'))).toBe(true);
    expect(istWortTreffer(ft('Bundesrichter Meier, Gerichtsschreiberin Ott'), fold('Meier'))).toBe(true);
  });

  // Genau diese Fälle liess die alte includes()-Prüfung durch.
  it('Name nur als Teilkette in einem anderen Wort → KEIN Treffer', () => {
    expect(istWortTreffer(ft('Bundesrichterin Rottenberg'), fold('Ott'))).toBe(false);
    expect(istWortTreffer(ft('Gerichtsschreiber Meierhans'), fold('Meier'))).toBe(false);
    expect(istWortTreffer(ft('Bundesrichter Steinmann'), fold('Stein'))).toBe(false);
  });

  it('mehrteiliger Nachname nur zusammenhängend → Treffer', () => {
    expect(istWortTreffer(ft('Bundesrichterin Gutmanns-Bauer'), fold('Gutmanns-Bauer'))).toBe(true);
    // Beide Teile vorhanden, aber nicht zusammenhängend → kein Beleg.
    expect(istWortTreffer(ft('Bundesrichterin Gutmanns, Gerichtsschreiber Bauer'), fold('Gutmanns-Bauer'))).toBe(false);
  });

  it('Diakritika werden über fold() gleich behandelt', () => {
    expect(istWortTreffer(ft('Bundesrichter Müller'), fold('Mueller'))).toBe(false);
    expect(istWortTreffer(ft('Bundesrichter Müller'), fold('Müller'))).toBe(true);
  });

  it('leerer Name belegt nie', () => {
    expect(istWortTreffer(ft('Bundesrichter Meier'), '')).toBe(false);
  });
});
