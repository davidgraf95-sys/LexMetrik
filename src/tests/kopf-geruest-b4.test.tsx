/**
 * W2·19-DESIGN-KONSISTENZ · Runde 2 · B-4 (Kopf-Gerüst) + B-7 (Overline-Ordnung).
 *
 * Was hier bewiesen wird — die vier Zusagen, die ohne Sonde still zurückfallen:
 *
 *  (1) EIN GERÜST, DREI LESER. Erlass-, Entscheid- und Material-Leser beziehen
 *      denselben `layout/LeserKopfGeruest`; keiner baut seinen `<header>` noch
 *      selbst. Das ist die §5/§10-Zusage: Konsumenten ziehen um, die Kopien
 *      werden gelöscht (nicht angeglichen).
 *  (2) VERHALTENSNEUTRAL AM KANON (§6). Der Erlass-Kopf WAR die Form, aus der
 *      das Gerüst hergeleitet ist — seine Ausgabe bleibt Zeichen für Zeichen
 *      dieselbe. Gemessen 31.8.2026 über fünf Varianten (Bund, nicht
 *      konsolidiert + Kennung + Aktionen, Kanton/Paragraphen, aufgehoben,
 *      Anhang-Dominanz): 6'356 Bytes, `diff` leer. Die Sonde hier hält die
 *      STRUKTUR fest, die diesen Vergleich trug — ein zweiter handgebauter
 *      `<header>` im Kopf würde sie brechen.
 *  (3) B-7 · DIE ORDNUNG IST DREIGLIEDRIG UND EBENEN-NEUTRAL. Herkunft · Art ·
 *      Sachgebiet; ein unbekanntes Glied entfällt ersatzlos (§8) und verdrängt
 *      NIE ein bekanntes. Der Rot-Beweis ist der Kanton: bis zum 31.8.2026 warf
 *      `kopfOverline` sein Sachgebiet weg, sobald eine Art bekannt war
 *      (`typ ?? overlineGebiet`) — mit der alten Zeile ist die Zusicherung
 *      «Kanton BS · Gesetz · Finanzrecht» rot (gesehen, §6.7).
 *  (4) §8 WIRD NICHT LEISER. Der Vorbehalt «massgeblich ist die amtliche
 *      Fassung» steht im Entscheid-Leser jetzt ZUSÄTZLICH im Kopf (vor dem
 *      Lesen) — der volle Absatz im Provenienz-Fuss bleibt unverändert stehen.
 *
 * DOM-Sonden per SSR-Render, Bezugs-Sonden per Quelltext — dieselbe Arbeitsweise
 * wie in `entscheid-leser-b2.test.tsx` (die Fläche ist über mehrere Dateien
 * geschnitten, zugesichert wird die Eigenschaft der Fläche).
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { KopfOverline, LeserKopfGeruest } from '../components/layout/LeserKopfGeruest';
import { kopfGlieder, kopfOverline } from '../pages/gesetz-leser/helpers';
import { MASSGEBLICH_HALBSATZ, MASSGEBLICH_SATZ } from '../lib/benennung';

const quelle = (p: string) => readFileSync(p, 'utf8');

const BUND = { ebene: 'bund', kanton: null, rechtsgebiet: 'privat' } as const;
const KANTON = { ebene: 'kanton', kanton: 'BS', rechtsgebiet: 'oeffentlich' } as const;
const INTL = { ebene: 'bund', kanton: null, rechtsgebiet: 'international' } as const;

// ─── (3) B-7 · die Ordnung ───────────────────────────────────────────────────

describe('B-7 — Herkunft · Art · Sachgebiet, unbekannte Glieder ersatzlos', () => {
  it('ROT-BEWEIS-FALL: der Kanton zeigt Art UND Sachgebiet (früher verwarf `??` das zweite)', () => {
    const glieder = kopfGlieder(KANTON, 'gesetz', 'Finanzrecht');
    expect(glieder.map((g) => g.text)).toEqual(['Kanton BS', 'Gesetz', 'Finanzrecht']);
    expect(glieder.map((g) => g.rolle)).toEqual(['herkunft', 'art', 'sachgebiet']);
    expect(kopfOverline(KANTON, 'gesetz', 'Finanzrecht')).toBe('Kanton BS · Gesetz · Finanzrecht');
  });

  it('§8: ein unbekanntes Glied entfällt ersatzlos — kein Platzhalter, kein doppelter Trenner', () => {
    expect(kopfOverline(KANTON, undefined, null)).toBe('Kanton BS');
    expect(kopfOverline(KANTON, undefined, 'Finanzrecht')).toBe('Kanton BS · Finanzrecht');
    expect(kopfOverline(KANTON, 'verordnung', null)).toBe('Kanton BS · Verordnung');
    for (const s of [
      kopfOverline(KANTON, undefined, null),
      kopfOverline(BUND, undefined, null),
    ]) {
      expect(s).not.toMatch(/(^ · | · $| · · )/);
    }
  });

  it('BUND BLEIBT ZEICHENGLEICH — die Ausspielung ist dieselbe wie vor B-7', () => {
    expect(kopfOverline(BUND, undefined, null)).toBe('Bundesgesetz');
    expect(kopfOverline(BUND, 'verordnung', 'Privatrecht')).toBe('Verordnung · Privatrecht');
    expect(kopfOverline(BUND, 'verfassung', null)).toBe('Bundesverfassung');
    expect(kopfOverline(BUND, 'staatsvertrag', 'Privatrecht')).toBe('Staatsvertrag · Privatrecht');
  });

  it('INTERNATIONAL trägt nur ein Glied — sein Sachgebiet wiederholte die Herkunft', () => {
    expect(kopfOverline(INTL, 'staatsvertrag', 'International / Staatsverträge'))
      .toBe('Staatsvertrag');
    // Ohne Staatsvertrags-Typ bleibt der bisherige Fallback-Vorrang des Gebiets.
    expect(kopfOverline(INTL, undefined, 'International / Staatsverträge'))
      .toBe('International / Staatsverträge');
    expect(kopfOverline(INTL, undefined, null)).toBe('Staatsvertrag');
  });

  it('der Ton folgt der Rolle, und das Wort trägt nie allein (B3/F2)', () => {
    const html = renderToStaticMarkup(
      <KopfOverline glieder={kopfGlieder(KANTON, 'gesetz', 'Finanzrecht')} />,
    );
    expect(html).toContain('Kanton BS');
    expect(html).toContain('class="text-ink-500">Gesetz<');
    expect(html).toContain('class="text-brass-700">Finanzrecht<');
    // Der Trenner ist Satzzeichen, keine Aussage.
    expect(html).toContain('<span class="text-ink-300" aria-hidden="true"> · </span>');
  });

  it('alle drei Leser beziehen DENSELBEN Overline-Baustein (§5)', () => {
    for (const p of [
      'src/pages/gesetz-leser/v3/LeserErlassKopfZone.tsx',
      'src/pages/EntscheidLeser.tsx',
      'src/pages/MaterialLeser.tsx',
    ]) {
      expect(quelle(p), p).toContain('<KopfOverline glieder={');
    }
    // Die handgebaute Entscheid-Overline ist WEG, nicht angeglichen (§5/§10).
    expect(quelle('src/pages/EntscheidLeser.tsx'))
      .not.toContain('<p className="lc-overline">\n          {snap.gerichtName}');
  });
});

// ─── (1) + (2) B-4 · das Gerüst ──────────────────────────────────────────────

describe('B-4 — ein Kopf-Gerüst, fünf Bänder', () => {
  const html = renderToStaticMarkup(
    <LeserKopfGeruest
      overline={<KopfOverline glieder={[{ text: 'Kanton BS', rolle: 'herkunft' }]} />}
      titel={<h1>Titel</h1>}
      fakten={['F1', 'F2']}
      stand={['S1']}
      ehrlichkeit={<p className="ehrl">ehrlich</p>}
      aktionen={<a href="https://x.test">A</a>}
    >
      <div className="banner">B</div>
    </LeserKopfGeruest>,
  );

  it('EIN <header> mit der Kanon-Klassenzeile des Erlass-Kopfs', () => {
    expect((html.match(/<header/g) ?? []).length).toBe(1);
    expect(html).toContain('<header class="space-y-2 border-b border-line pb-5">');
  });

  it('die Bänder stehen in der Rollen-Reihenfolge', () => {
    const ordnung = ['lc-overline', '<h1>', 'F1', 'S1', 'class="ehrl"', 'lc-kopf-aktionen', 'class="banner"'];
    let pos = -1;
    for (const marke of ordnung) {
      const i = html.indexOf(marke);
      expect(i, `${marke} fehlt`).toBeGreaterThan(-1);
      expect(i, `${marke} steht in falscher Reihenfolge`).toBeGreaterThan(pos);
      pos = i;
    }
  });

  it('Fakten und Stand werden mit demselben «·» gefügt — nie führend, nie doppelt', () => {
    expect(html).toContain('<span class="text-ink-300" aria-hidden="true"> · </span>');
    expect(html).not.toMatch(/> · <\/span><\/span><span[^>]*>F1/);
  });

  it('leere Bänder erzeugen keine leeren Kästen (§8: nichts behaupten, was fehlt)', () => {
    const leer = renderToStaticMarkup(
      <LeserKopfGeruest overline="O" titel={<h1>T</h1>} />,
    );
    expect(leer).not.toContain('lc-kopf-aktionen');
    expect(leer).not.toContain('space-y-1');
    expect(leer).not.toContain('text-ink-300');
  });

  it('§15.2: die gemessene Höhen-Reservierung steht NUR, wo sie bestellt ist', () => {
    expect(html).not.toContain('min-h-kopf-stand');
    const mitReserve = renderToStaticMarkup(
      <LeserKopfGeruest overline="O" titel={<h1>T</h1>} standReserve stand={['S']} />,
    );
    expect(mitReserve).toContain('min-h-kopf-stand sm:min-h-kopf-stand-sm md:min-h-kopf-stand-md space-y-1');
  });

  it('alle drei Leser beziehen das Gerüst, keiner baut seinen Kopf noch selbst', () => {
    for (const p of [
      'src/pages/gesetz-leser/parts/ErlassLeserKopf.tsx',
      'src/pages/EntscheidLeser.tsx',
      'src/pages/MaterialLeser.tsx',
    ]) {
      const q = quelle(p);
      expect(q, p).toContain('<LeserKopfGeruest');
      expect(q, `${p}: handgebauter <header> neben dem Gerüst`).not.toMatch(/<header className=/);
    }
    // Der Material-Leser trägt nicht mehr den Kopf der STATISCHEN Seiten.
    // Geprüft wird der BEZUG, nicht das Wort: die Herleitungen im Kopf der
    // Datei zitieren den Vorzustand wörtlich und dürfen es weiter tun (§2b).
    expect(quelle('src/pages/MaterialLeser.tsx'))
      .not.toMatch(/^import .*\bSeitenKopf\b/m);
  });
});

// ─── (4) §8 ──────────────────────────────────────────────────────────────────

describe('B-4/§8 — der Vorbehalt steht VOR dem Lesen und wird nicht leiser', () => {
  const q = quelle('src/pages/EntscheidLeser.tsx');

  it('der Kopf trägt den Vorbehalt aus `lib/benennung` (eine Quelle, §5)', () => {
    expect(q).toContain('{MASSGEBLICH_HALBSATZ}');
    expect(MASSGEBLICH_HALBSATZ).toBe('massgeblich ist die amtliche Fassung');
  });

  it('der Provenienz-Fuss behält seinen vollen Absatz', () => {
    expect(q).toContain('{MASSGEBLICH_SATZ}');
    expect(q).toContain('Diese Wiedergabe ersetzt die amtliche Fassung nicht');
    expect(MASSGEBLICH_SATZ).toBe('Massgeblich ist stets die amtliche Fassung.');
  });

  it('die Kopf-Zeile ist kein zweites Literal — der Vorbehalt wird GEBAUT (§5)', () => {
    // Sonst laufen die beiden Stellen wieder auseinander, wie B-6 es an
    // «Fassung» vs. «Quelle» gemessen hat (Herleitung in `lib/benennung`).
    const kopfZeile = q.match(/Wiedergabe des amtlichen Urteilstexts[^\n]*/)?.[0] ?? '';
    expect(kopfZeile).toContain('{MASSGEBLICH_HALBSATZ}');
    expect(kopfZeile).not.toContain('massgeblich ist die amtliche Fassung');
  });
});
