import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ZuletztVerwendet } from '../components/start/ZuletztVerwendet';
import { merkeBesuch } from '../lib/zuletztVerwendet';

// «Zuletzt» — Overflow-Invariante @390 px und Marken-Zuordnung.
//
// DEKLARIERTE ANPASSUNG (W2·24-DESIGN-IDENTITAET R10, 6.9.2026, §6.3): aus der
// Fliesstext-Zeile «Zuletzt geöffnet: A · B · C» (R3) ist die MARKEN-ZEILE des
// Referenzbildes geworden (`abnahme/design-identitaet/pult-freigegeben.html`,
// Marke `.zuletzt`): kleines Etikett «Zuletzt», dann je Eintrag ein
// 3-px-Registerstrich vor dem Namen. Zwei Prüfpunkte ändern sich damit im
// WORTLAUT, keiner im GEHALT:
//   · das sichtbare Etikett heisst «Zuletzt» statt «Zuletzt geöffnet» (der
//     ACCESSIBLE Name der Region bleibt «Zuletzt geöffnet» — er soll ohne den
//     sichtbaren Zusammenhang verständlich sein);
//   · geprüft wird zusätzlich der Registerstrich je Eintrag, weil er die neue
//     Aussage der Zeile trägt (aus welchem Bestand der Eintrag stammt) und aus
//     dem `typ` der EINEN Verlauf-Quelle abgeleitet ist (§5, keine zweite
//     Zuordnung).
// Die tragende Invariante ist unverändert: die Zeile bricht um, statt eine
// waagrechte Scroll-Achse aufzumachen (die Klassen des früheren Chip-Streifens
// — overflow-x-auto/flex-nowrap/w-max — dürfen nicht wiederkehren, §6.7).
//
// NEU GEPRÜFT (R10): die HÜLLE steht immer und hält Platz frei
// (`min-h-beiwerk`). Beim Prerender gibt es kein localStorage; ohne Reservierung
// schöbe die Zeile beim ersten Client-Render alles darunter nach unten (§15).
//
// jsdom/SSR kennt kein Layout — geprüft wird darum, was am Markup messbar ist.
beforeEach(() => {
  const speicher = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => speicher.get(k) ?? null,
    setItem: (k: string, v: string) => void speicher.set(k, v),
    removeItem: (k: string) => void speicher.delete(k),
    clear: () => speicher.clear(),
    key: () => null,
    length: 0,
  } as unknown as Storage;
});

const render = () =>
  renderToString(
    <MemoryRouter>
      <ZuletztVerwendet />
    </MemoryRouter>,
  );

describe('ZuletztVerwendet — Marken-Zeile des Pults', () => {
  it('leerer Speicher → kein Etikett, kein Verweis, aber reservierte Höhe (§8/§15)', () => {
    const html = render();
    expect(html).not.toContain('>Zuletzt<');
    expect(html).not.toContain('<a ');
    // Die Hülle steht trotzdem und hält Platz frei — sonst springt die Seite,
    // sobald der Client den Verlauf nachliest.
    expect(html).toContain('min-h-beiwerk');
  });

  it('gefüllt: Etikett + je ein Verweis mit Registerstrich, ohne waagrechte Scroll-Achse', () => {
    // Mehr Einträge mit langen Titeln als in 390 px passen — die Zeile bricht
    // um, statt die Seite zu weiten.
    for (let i = 0; i < 6; i++) {
      merkeBesuch({ route: `/rechner/langer-titel-nummer-${i}`, titel: `Sehr langer Rechnername Nummer ${i}` });
    }
    const html = render();

    expect(html).toContain('>Zuletzt<');
    const verweise = html.match(/<a /g) ?? [];
    expect(verweise.length, 'ein Verweis je Eintrag').toBe(6);
    for (let i = 0; i < 6; i++) {
      expect(html, `Eintrag ${i} verlinkt`).toContain(`/rechner/langer-titel-nummer-${i}`);
    }
    // Registerstrich: Rechner-Routen tragen das Werkzeug-Register (`--reg-w`).
    expect((html.match(/bg-reg-w/g) ?? []).length, 'je Eintrag ein Registerstrich').toBe(6);

    // Keine Scroll-Achse: die Zeile umbricht (flex-wrap), sie scrollt nicht.
    expect(html).toContain('flex-wrap');
    for (const klasse of ['overflow-x-auto', 'flex-nowrap', 'w-max']) {
      expect(html, `Scroll-Streifen-Klasse «${klasse}» ist zurück`).not.toContain(klasse);
    }
  });

  it('der Registerstrich folgt dem Inhalts-Typ der Route (§5, eine Zuordnung)', () => {
    merkeBesuch({ route: '/gesetze/bund/OR', titel: 'OR' });
    merkeBesuch({ route: '/rechtsprechung/bge_152_V_52', titel: 'BGE 152 V 52' });
    merkeBesuch({ route: '/materialien#b-ESTV', titel: 'ESTV' });
    const html = render();
    expect(html, 'Gesetz → Register g').toContain('bg-reg-g');
    expect(html, 'Entscheid → Register r').toContain('bg-reg-r');
    expect(html, 'Material → Register m').toContain('bg-reg-m');
  });
});
