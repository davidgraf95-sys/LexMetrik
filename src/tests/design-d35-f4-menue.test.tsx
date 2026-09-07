/**
 * W2·24-DESIGN-IDENTITAET — D35, Fixer F4 «Menü-Anatomie» (7.9.2026).
 *
 * BEFUND (gemessen 7.9.2026 am gebauten Stand, Ansicht-Menü des Lesers):
 *   (a) Der AUS-Zustand einer Schalter-Zeile rendert nur einen LEEREN
 *       Hakenplatz — einziger sichtbarer Unterschied zum An-Zustand ist die
 *       Tintenstufe der Beschriftung. Davids Bild dazu: «Fussnoten»/«Fassung»
 *       lesen sich wie Rubriken, nicht wie Schalter.
 *   (b) Die vier Zeilen des Menüs massen 38 / 38 / 37 / 52 px — die 37 war die
 *       letzte Zeile (ohne trennende Haarlinie), die 52 der Schriftregler.
 *   (c) Der Schriftregler sass in einem 135 × 35 px grossen Kasten mit eigener
 *       Kante und eigener Fläche (`rounded-lg border border-line bg-surface`).
 *
 * WAS DIESE SONDE BEWACHT — die drei Punkte an ihrer Quelle, nicht am Bild:
 * das PIXEL-Mass prüft `e2e/w224-d35-f4-menue.e2e.ts` am gebauten Stand; hier
 * steht, dass die ANATOMIE es überhaupt hergibt (Form im Aus-Zustand, EINE
 * deklarierte Zeilenhöhe, Regler ohne Kasten).
 *
 * ROT-BEWEIS (§6.7): jeder Fall trägt eine NEGATIV-KONTROLLE mit dem Wortlaut,
 * wie er VOR diesem Bau im Repo stand. Läuft sie grün, prüft der Ausdruck
 * nichts und der Fall ist wertlos.
 *
 * Testtechnik wie im Haus üblich: `renderToString` (Node-Env, kein jsdom) für
 * das Markup, Quelltext-Sonde für die Werte in `src/index.css`.
 *
 * Reine Darstellung (§3) — keine Rechtslogik berührt.
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { join } from 'node:path';
import { APP_WURZEL, liesRoh } from './appDateien';
import { MenueSchalter, MenueTitel } from '../components/ui/Menue';
import { SchriftgroessenRegler } from '../components/ui/SchriftgroessenRegler';

const css = liesRoh(join(APP_WURZEL, 'index.css'));
/** Quelltext OHNE Block-Kommentare — die Herleitungen dürfen den Vorzustand
 *  beim Namen nennen (§2b), ohne die Sonde für immer rot zu färben. */
const cssRegeln = css.replace(/\/\*[\s\S]*?\*\//g, '');

const schalter = (an: boolean, form?: 'kasten' | 'punkt') => renderToString(
  <MenueSchalter an={an} form={form} label="Fussnoten" titel="Fussnoten ein- oder ausblenden"
    onKlick={() => {}} attrs={{ role: 'menuitemcheckbox' }} />,
);

describe('D35-F4 · Der Aus-Zustand einer Menü-Schalterzeile ist sichtbar', () => {
  it('rendert im AUS-Zustand eine Marken-FORM, nicht nur einen leeren Platz', () => {
    const html = schalter(false);
    expect(html).toContain('lc-menu-kasten');
    expect(html).toContain('data-an="aus"');
    // Die Form steht in der Marken-Spalte, nicht irgendwo in der Zeile.
    expect(html).toMatch(/lc-menu-marke[^>]*>\s*<span[^>]*lc-menu-kasten/);
  });

  it('NEGATIV-KONTROLLE: das Markup von VOR dem Bau fällt durch', () => {
    // Wortlaut aus `ui/Menue.tsx` vor D35-F4 (`{an ? '✓' : ''}` in der Marke):
    const vorher = '<span aria-hidden class="lc-menu-marke"></span>';
    expect(vorher).not.toContain('lc-menu-kasten');
    expect(vorher).not.toContain('data-an="aus"');
  });

  it('sagt den AN-Zustand doppelt (Form + Haken), nie über Farbe allein', () => {
    const html = schalter(true);
    expect(html).toContain('data-an="an"');
    expect(html).toContain('✓');
    // `aria-checked` bleibt die Auskunft für Screenreader, das Zeichen ist stumm.
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain('aria-hidden="true"');
  });

  it('trägt für eine Wahl aus mehreren die Punkt-Form (menuitemradio passt ohne Umbau)', () => {
    const aus = schalter(false, 'punkt');
    const an = schalter(true, 'punkt');
    expect(aus).toContain('lc-menu-punkt-form');
    expect(aus).not.toContain('lc-menu-punkt-kern');
    expect(an).toContain('lc-menu-punkt-kern');
  });

  it('CSS: die leere Form ist sichtbar (Kante in --ink-500), der Haken in Tinte', () => {
    const block = cssRegeln.match(/\.lc-menu-kasten\s*\{[^}]*\}/)?.[0] ?? '';
    expect(block).toContain('border: 1px solid var(--ink-500)');
    expect(block).toContain('color: var(--ink-900)');
  });
});

describe('D35-F4 · EINE Zeilenhöhe, EINE Trennlinie zwischen Gruppen', () => {
  it('führt die Höhe als Token, nicht als Zahl je Zeile', () => {
    expect(cssRegeln).toMatch(/--menu-zeile-h:\s*[\d.]+rem;/);
  });

  it('setzt dieselbe Mindesthöhe an Zeile UND Regler', () => {
    const zeile = cssRegeln.match(/\.lc-menu-zeile\s*\{[^}]*\}/)?.[0] ?? '';
    const regler = cssRegeln.match(/\.lc-menu-regler\s*\{[^}]*\}/)?.[0] ?? '';
    expect(zeile).toContain('min-height: var(--menu-zeile-h)');
    expect(regler).toContain('min-height: var(--menu-zeile-h)');
  });

  it('trennt Gruppen, nicht Zeilen — keine Haarlinie unter jeder Zeile', () => {
    const zeile = cssRegeln.match(/\.lc-menu-zeile\s*\{[^}]*\}/)?.[0] ?? '';
    expect(zeile).not.toContain('border-bottom');
    expect(cssRegeln).not.toContain('.lc-menu-zeile:last-child');
    expect(cssRegeln).toContain('.lc-menu-gruppe + .lc-menu-gruppe');
  });

  it('NEGATIV-KONTROLLE: die CSS-Regel von VOR dem Bau fällt durch', () => {
    const vorher = `.lc-menu-zeile {
    @apply flex w-full items-center gap-2.5 px-3 py-2 text-left text-body-s text-ink-700 transition-colors;
    border-bottom: 1px solid var(--rule-soft);
    border-radius: 0;
    white-space: nowrap;
  }`;
    expect(vorher).not.toContain('min-height: var(--menu-zeile-h)');
    expect(vorher).toContain('border-bottom');
  });

  it('Gruppentitel sind die kursive Literata-Zeile des Hauses (GB-2), keine Overline', () => {
    const html = renderToString(<MenueTitel>Ansicht</MenueTitel>);
    expect(html).toContain('lc-randtitel');
    expect(html).toContain('lc-menu-titel');
    expect(html).not.toContain('lc-overline');
  });
});

describe('D35-F4 · Der Schriftregler ist eine Zeile, kein Kasten', () => {
  const werte = { prozent: 108, kannGroesser: true, kannKleiner: true, groesser: () => {}, kleiner: () => {} };
  const html = renderToString(
    <SchriftgroessenRegler schrift={werte}
      kleinerLabel="Gesetzestext verkleinern" kleinerTitle="kleiner"
      groesserLabel="Gesetzestext vergrössern" groesserTitle="grösser" />,
  );
  /** Die KLAMMER um das Knopf-Paar (erstes `<span …>` des Markups). */
  const klammer = html.match(/^<span class="([^"]*)"/)?.[1] ?? '';

  it('hat weder Rahmen noch Eigenfläche um das Knopf-Paar', () => {
    expect(klammer).not.toMatch(/\bborder\b|\bborder-line\b/);
    expect(klammer).not.toMatch(/\bbg-(?:surface|paper|well|brass)/);
    expect(klammer).not.toMatch(/\brounded/);
  });

  it('NEGATIV-KONTROLLE: die Klammer von VOR dem Bau fällt durch', () => {
    const vorher = 'inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5';
    expect(vorher).toMatch(/\bborder-line\b/);
    expect(vorher).toMatch(/\bbg-surface\b/);
  });

  it('nutzt das Haus-Rezept für Mini-Aktionen statt eigener Knopf-Optik', () => {
    expect(html).toContain('lc-btn-mini');
    expect(html).not.toContain('rounded-md px-2.5');
  });

  it('lässt Funktion und Ansage unberührt (Prozentwert bleibt live)', () => {
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('108');
    expect(html).toContain('aria-label="Gesetzestext verkleinern"');
  });
});
