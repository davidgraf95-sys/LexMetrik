// ─── Eingabe-Bausteine der Rechner/Vorlagen (Design-Konsistenz R2-E) ────────
//
// Drei Wächter und drei Vertrags-Belege zu den Befunden F1-1 (natives
// `type="date"`), F1-6 («(optional)» im Label statt der `optional`-Prop) und
// F1-10 (drei Kopier-Knopf-Bauformen).
//
// F1-1 ist KEINE Geschmacksfrage: `<input type="date">` rendert in der Locale
// des BROWSERS. Auf einem us-englischen Profil steht dort MM/DD/YYYY — und
// genau diese Felder tragen das fristauslösende Ereignis, das Datum des
// GV-Beschlusses (6-Monats-Verfall, Art. 650 Abs. 3 OR) oder den Stichtag
// einer Sperrfrist. Das Haus-`DatumsFeld` schreibt TT.MM.JJJJ fest und hält
// den WERT unverändert bei ISO (yyyy-MM-dd) — Engines und Vorlagen-Schemas
// sehen also exakt dasselbe wie vorher (§3: reine Darstellung).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { DatumsFeld } from '../components/DatumsFeld';
import { BetragsFeld } from '../components/BetragsFeld';
import { Field, KopierButton, Checkbox } from '../components/vorlagen/ui';
import { alleQuellen, alleTsx, liesOhneKommentare, pruefeAusnahmen, rel } from './appDateien';

// ─── R3-α-WURZEL (31.8.2026, §17/§6.7) ──────────────────────────────────────
//
// Hier stand `R2E_FLAECHEN` — eine Liste von 22 Dateien mit der ausdrücklichen
// Erlaubnis zu wachsen. Genau das ist die Bauart, die B3 als Vakuum-Lücke
// ausgewiesen hat: eine Liste, die wachsen DARF, wächst nur, wenn jemand
// hinschaut. Gemessen am 31.8.2026 stand ausserhalb der Liste ein «(CHF,
// optional)» im Label (`ErbteilungForm`) und zwei rohe `type="date"`
// (`EntscheidFilter`, `BezugZeitWahl`) — der Wächter war grün.
//
// Die Sonden fegen jetzt die App. Ausgenommen bleibt nur, was seine Begründung
// AM FUNDORT trägt; `pruefeAusnahmen` liest sie dort wörtlich nach.

const quelle = (p: string) => readFileSync(p, 'utf8');

describe('R2-E/F1-1 — kein natives type="date" in der App (App-weit)', () => {
  /**
   * Die zwei Filter-Flächen, die nativ bleiben. Der Unterschied ist nicht
   * Geschmack, sondern der Grund des Wächters: F1-1 schützt Felder, die ein
   * FRISTAUSLÖSENDES Ereignis tragen (dort ist MM/DD/YYYY ein Rechtsfehler).
   * Ein Korpus-/Zeitachsen-FILTER trägt keinen Wert in eine Engine; er blendet
   * eine Liste ein und aus, und das Haus-Feld brächte in die 28-px-Filterzeile
   * ein Kalender-Popover samt `pr-11`-Reserve mit.
   */
  const AUSNAHMEN = [
    { datei: 'components/rechtsprechung/EntscheidFilter.tsx', begruendung: 'R2-E/F1-1-AUSNAHME (R3-α, 31.8.2026): Filter, kein fristauslösendes Feld' },
    { datei: 'components/verzahnung/BezugZeitWahl.tsx', begruendung: 'R2-E/F1-1-AUSNAHME (R3-α, 31.8.2026): Filter, kein fristauslösendes Feld' },
  ] as const;

  it('jede Ausnahme trägt ihre Begründung am Fundort', () => {
    expect(() => pruefeAusnahmen(AUSNAHMEN)).not.toThrow();
  });

  it('sonst benutzt jede Fläche DatumsFeld statt <input type="date">', () => {
    const erlaubt = pruefeAusnahmen(AUSNAHMEN);
    const funde = alleTsx()
      .filter((d) => !erlaubt.has(rel(d)))
      .filter((d) => /type=["']date["']/.test(liesOhneKommentare(d)))
      .map(rel);
    expect(
      funde,
      '<input type="date"> rendert in der Browser-Locale (US: MM/DD/YYYY) — '
      + 'stattdessen <DatumsFeld value={iso} onChange={…} /> (Wert bleibt ISO)',
    ).toEqual([]);
  });
});

describe('R2-E/F1-6 — «optional» steht in der Prop, nicht im Label-Text (App-weit)', () => {
  it('kein «(optional)» in einem Field-Label', () => {
    const funde: string[] = [];
    for (const d of alleTsx()) {
      const labels = [...liesOhneKommentare(d).matchAll(/<Field\s+label=(\{`[^`]*`\}|"[^"]*")/g)]
        .map((m) => m[1])
        .filter((l) => /optional/i.test(l));
      for (const l of labels) funde.push(`${rel(d)} · ${l}`);
    }
    expect(
      funde,
      '«optional» gehört in die Field-Prop (rendert « · optional»), nicht in den Label-Text',
    ).toEqual([]);
  });

  it('NEGATIV-KONTROLLE: der Ausdruck findet die Vorher-Form', () => {
    const vorher = '<Field label="Nachlass (CHF, optional)"';
    expect(/<Field\s+label=("[^"]*")/.exec(vorher)![1]).toMatch(/optional/i);
  });
});

describe('R2-E/F1-10 — «Kopiert ✓» rendert nur der geteilte KopierButton (App-weit)', () => {
  // KEINE Ausnahme mehr (R3-α, 31.8.2026): die frühere Liste `NOCH_EIGEN`
  // führte `src/pages/Kontakt.tsx` «mit Ablaufdatum». Ein Ablaufdatum, das
  // niemand einlöst, ist eine Dauerausnahme — die Fläche ist statt dessen
  // EINGEZOGEN (KopierButton mit `className="lc-btn-outline"`, Beschriftung
  // und Quittung unverändert). §17-Gegengewicht: einziehen schlägt bewachen.
  it('kein zweiter Renderer der Erfolgs-Beschriftung (App-weit, ausnahmslos)', () => {
    const fremde = alleQuellen()
      .filter((d) => rel(d) !== 'components/vorlagen/ui.tsx')
      .filter((d) => liesOhneKommentare(d).includes('Kopiert ✓'))
      .map(rel);
    expect(
      fremde,
      'Erfolgs-Beschriftung «Kopiert ✓» nur im KopierButton (src/components/vorlagen/ui.tsx)',
    ).toEqual([]);
  });
});

// ─── R3-α/B3-9 · EINE Kopier-Verweildauer ───────────────────────────────────
//
// GEMESSEN (Finder-Bericht B3, 31.8.2026): dieselbe Rückmeldung — «Kopiert ✓»,
// dann zurück in den Ruhezustand — lief mit DREI Verweildauern: 1500 ms
// (GerichtszitatForm, Dokumentmappe, ArtikelLeser), 1600 ms (useKopieren,
// LinkTeilenButton), 2000 ms (useWizardState, Kontakt, EntscheidLeser). Die
// Zahl ist eine Design-Entscheidung («wie lange bleibt eine Quittung stehen»)
// und stand achtmal da. Kanon ist die Zahl des geteilten Hooks (1600 ms); sie
// liegt seit R3-α als `KOPIER_DAUER_MS` genau einmal in `useKopieren.ts`.
//
// RÜCKBAU R5-E/R6-C (5.9.2026, §17-Gegengewicht + §6.7). Hier standen zwei
// weitere Fälle: ein App-Sweep nach `/setKopiert\(…\)\s*,\s*(…)\)` und dessen
// Negativ-Kontrolle. Sie hingen am NAMEN einer Zustandsvariablen, nicht an der
// Sache — der letzte namensgebundene Wächter der App (Messung R5-E über alle
// 422 Dateien in `src/tests/`). GEMESSEN am 5.9.2026: der Ausdruck traf **0**
// Stellen, seit R4-D alle Kopier-Mechaniken in `useKopieren` gezogen hat.
//
// MUTATIONS-BEWEIS, warum das kein Verlust ist (statt einer Behauptung): eine
// von Hand gebaute Kopier-Quittung mit eigener Dauer, aber ANDEREM
// Variablennamen (`setQuittung(true)` … `setTimeout(() => setQuittung(false),
// 2500)` samt `navigator.clipboard.writeText`) in `src/components/` eingesetzt
// —
//   · namensgebundene Sonde:  GRÜN  (sie bewacht nichts)
//   · R4-D (`clipboard.writeText`): ROT, `components/MutationsProbeR6.tsx`
// Die Sorge trägt also R4-D an der SACHE, und der Fall darunter hält die Zahl
// bei genau einer Definition. Eine Sonde, die nur bei einer bestimmten
// Schreibweise anschlägt, sieht nach geprüftem Verhalten aus und ist keines.
//
// VERBREITERN war die Alternative und ist verworfen: der naheliegende
// Ausdruck (`set[A-Z]\w*\((?:false|'')\)\s*,\s*\d{3,5}`) trifft heute genau
// eine SACHFREMDE Stelle — `v3/LeserErlassKopfZone.tsx: setReiterToast(false),
// 3200`, ein Reiter-Hinweis, keine Kopier-Quittung. Ein Wächter, der zum
// Grünhalten eine Ausnahmeliste für Fremdes braucht, ist kein Ersatz.
describe('R3-α/B3-9 — die Kopier-Quittung steht überall gleich lang', () => {
  it('die Zahl ist genau einmal definiert', () => {
    const definitionen = alleQuellen()
      .filter((d) => /export const KOPIER_DAUER_MS/.test(quelle(d)))
      .map(rel);
    expect(definitionen).toEqual(['components/useKopieren.ts']);
  });
});

// ─── R4-D · EINE Kopier-MECHANIK, nicht nur eine Kopier-Zahl ────────────────
//
// GEMESSEN (5.9.2026, Quelltext): R3-α hatte die DAUER vereinheitlicht, die
// Mechanik lief weiter fünfmal von Hand — und auseinander:
//
//   Fundort                        Erfolg erst nach Promise?  Timer-Ersatz  Unmount
//   useKopieren (Kanon)                    ja                    ja           ja
//   vorlagen/Dokumentmappe Z.123           ja                    ja           ja
//   vorlagen/useWizardState Z.67           ja                    ja           ja
//   pages/EntscheidLeser Z.582             ja                    NEIN         NEIN
//   gesetz-leser/parts/ArtikelLeser Z.344  ja                    NEIN         NEIN
//   components/LinkTeilenButton Z.47      NEIN                   NEIN         NEIN
//
// Die letzte Zeile war ein §8-Defekt: `void writeText(…)` plus sofortiges
// `setKopiert(true)` meldete «Link kopiert ✓» auch über eine unveränderte
// Zwischenablage — genau der Fehlgriff, gegen den `useKopieren` am 6.6.2026
// gebaut wurde. Wurzel war die Signatur: der Hook nahm den Text an der
// HOOK-Zeile, vier der fünf Flächen kennen ihn erst beim KLICK.
describe('R4-D — `navigator.clipboard.writeText` läuft nur im geteilten Hook', () => {
  /**
   * Wer selbst schreiben darf — und WARUM. Die Begründung steht AM FUNDORT und
   * wird hier wörtlich verlangt: eine Ausnahme, die man nur im Test sieht, ist
   * eine unsichtbare Ausnahme (Doktrin `tests/appDateien.ts`, R3-α).
   */
  const ERLAUBT: Record<string, string> = {
    'components/useKopieren.ts': 'die eine Mechanik',
    'components/rechtsprechung/EntscheidBody.tsx':
      'R4-D-AUSNAHME',
  };

  it('keine Fläche der App schreibt selbst in die Zwischenablage', () => {
    const funde = alleQuellen()
      .filter((d) => /clipboard\??\.\s*writeText/.test(liesOhneKommentare(d)))
      .map(rel)
      .filter((r) => !(r in ERLAUBT));
    expect(funde, 'eigene Kopier-Mechanik statt `useKopieren` (components/useKopieren.ts)').toEqual([]);
  });

  it('jede Ausnahme trägt ihre Begründung am Fundort', () => {
    for (const [r, grund] of Object.entries(ERLAUBT)) {
      if (r === 'components/useKopieren.ts') continue;
      const d = alleQuellen().find((x) => rel(x) === r);
      expect(d, `${r} existiert`).toBeDefined();
      expect(quelle(d!), `${r}: Begründung am Fundort`).toContain(grund);
    }
  });

  it('NEGATIV-KONTROLLE: der Ausdruck findet die Vorher-Formen', () => {
    // Wortlaute im Stand vom 31.8.2026 — Belege, nie nachgeführt (§2b).
    for (const vorher of [
      'void navigator.clipboard.writeText(`${location.origin}${pathname}${q}${hash}`);',
      'navigator.clipboard?.writeText(text).then(',
      'void navigator.clipboard?.writeText(text).then(() => {',
    ]) {
      expect(/clipboard\??\.\s*writeText/.test(vorher), vorher).toBe(true);
    }
    expect(/clipboard\??\.\s*writeText/.test('const { kopiert, kopieren } = useKopieren();')).toBe(false);
  });

  it('der Hook nimmt den Text auch beim Klick — sonst kann ihn niemand nutzen', () => {
    const h = quelle(alleQuellen().find((d) => rel(d) === 'components/useKopieren.ts')!);
    expect(h, '`kopieren(text)` bzw. `kopieren({text, marke})`')
      .toMatch(/kopieren: \(was\?: string \| KopierAuftrag\) => void/);
    expect(h, 'MARKE für Flächen mit zwei Kopier-Zielen').toContain('marke: string;');
  });
});

describe('R2-E — der Wert-Vertrag der Bausteine bleibt unverändert', () => {
  it('DatumsFeld: ISO rein, TT.MM.JJJJ auf dem Schirm (F1-1)', () => {
    const html = renderToString(<DatumsFeld value="2026-06-01" onChange={() => {}} />);
    expect(html, 'die Anzeige ist schweizerisch').toContain('value="01.06.2026"');
    expect(html, 'kein natives Datumsfeld mehr').not.toContain('type="date"');
    expect(html, 'das Eingabemuster steht im Feld').toContain('placeholder="TT.MM.JJJJ"');
  });

  it('BetragsFeld: Rohwert rein, Schweizer Gruppierung auf dem Schirm (F1-7)', () => {
    // Der Rohwert-Vertrag ist der Punkt: das Schema bekommt weiterhin die
    // nackte Zahl, `fmtCHF`/`zahl` normalisieren Apostrophe ohnehin.
    expect(renderToString(<BetragsFeld value="100000" onChange={() => {}} />))
      .toContain('value="100&#x27;000"');
    expect(renderToString(<BetragsFeld value="100'000" onChange={() => {}} />))
      .toContain('value="100&#x27;000"');
  });

  it('Field verknüpft auch das zusammengesetzte DatumsFeld mit seinem Label (F1-2)', () => {
    const html = renderToString(
      <Field label="Zugang Kündigung"><DatumsFeld value="2026-06-01" onChange={() => {}} /></Field>,
    );
    const labelId = html.match(/id="([^"]+)-label"/)?.[1];
    expect(labelId, 'das Label trägt eine id').toBeTruthy();
    expect(html, 'das innere Eingabefeld zeigt darauf').toContain(`aria-labelledby="${labelId}-label"`);
  });

  it('Field: «optional» rendert als Nachsatz am Label (F1-6)', () => {
    const html = renderToString(<Field label="Zustellart" optional><input /></Field>);
    expect(html).toContain('· optional');
  });

  it('KopierButton: Gegenstand im Label, Kanon-Optik (F1-10)', () => {
    const html = renderToString(<KopierButton text="x" gegenstand="Ergebnis" />);
    expect(html, 'der Knopf sagt, WAS kopiert wird').toContain('Ergebnis kopieren');
    expect(html, 'Kanon-Optik lc-btn-outline lc-btn-sm').toContain('class="lc-btn-outline lc-btn-sm"');
  });

  it('Checkbox: trägt eine explizite Grössenklasse am Baustein (B12 #675)', () => {
    // Deckt sich zahlengleich mit `input[type="checkbox"]` in index.css
    // (1.1rem, Redesign E7) — keine Layout-Änderung, nur am Baustein statt
    // nur global nachlesbar/testbar.
    const html = renderToString(<Checkbox checked={false} onChange={() => {}} label="X" />);
    expect(html, 'Grössenklasse steht am input selbst').toContain('class="mt-0.5 shrink-0 h-[1.1rem] w-[1.1rem]"');
  });
});
