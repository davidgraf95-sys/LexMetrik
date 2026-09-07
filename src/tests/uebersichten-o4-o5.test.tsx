// ─── O4 · O5 · Beifang (W2·10-UI-NAV-O) ─────────────────────────────────────
//
// Drei kleine, aber je einzeln nachweisbare Versprechen der Übersichts-Flächen:
//  O4 — der Kantons-Einstieg verspricht die Systematik-Gliederung nur noch
//       bedingt: sie hängt am amtlichen Systematik-Baum, den nicht jeder
//       Kanton liefert (§8, Ehrlichkeit VOR dem Klick).
//  O5 — das lokale Filterfeld auf /materialien erklärt seinen Scope und ist
//       programmatisch damit verknüpft (aria-describedby).
//  Beifang — `.lc-input-sm` löst unter `sm` keinen iOS-Fokus-Zoom mehr aus.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { KantonAuswahl } from '../pages/gesetze-teile/KantonAuswahl';
import { Materialien } from '../pages/Materialien';

const CSS = readFileSync('src/index.css', 'utf8');
// Der Systematik-Baum, an dem die O4-Aussage hängt (Projektion, §5).
const SYSTEMATIK: Record<string, unknown> = JSON.parse(
  readFileSync('public/normtext/kanton-systematik.json', 'utf8'),
);

describe('O4 · Kantons-Einstieg: Abdeckung ehrlich VOR dem Klick', () => {
  it('nicht jeder Kanton hat einen Systematik-Baum — die Aussage muss also bedingt sein', () => {
    // Der Befund, der die Textänderung TRÄGT (§7: verifizieren, nicht vertrauen).
    // Bricht das eines Tages (alle 26 hinterlegt), ist die Einschränkung
    // BEWUSST zu lockern — nicht stillschweigend.
    const mit = Object.keys(SYSTEMATIK).length;
    expect(mit).toBeGreaterThan(0);
    expect(mit, 'alle Kantone hinterlegt → O4-Wortlaut neu bewerten').toBeLessThan(26);
  });

  it('die Kontext-Zeile nennt die Einschränkung und den ehrlichen Rückfall', () => {
    const html = renderToString(
      // ansicht/onAnsicht liegen seit dem Fehlerbuch-41-Fix beim Aufrufer (der
      // Zustand muss die Kantons-Wahl überleben, die Übersicht unmountet dabei).
      // Für diese Prüfung der Kontext-Zeile zählt nur, dass sie überhaupt rendert.
      <MemoryRouter><KantonAuswahl gruppen={[]} alleKantone={[]} onWaehle={() => {}} ansicht="karte" onAnsicht={() => {}} /></MemoryRouter>,
    );
    // Identitäts-Treffer auf den tragenden Halbsätzen, nicht auf einem Stichwort.
    expect(html).toContain('soweit sie hinterlegt ist');
    expect(html).toContain('Nicht systematisiert');
    // Rotprobe: die frühere, unbedingte Zusage steht nicht mehr da.
    expect(html).not.toContain('gegliedert.</p>');
  });
});

describe('O5 · Scope-Label des lokalen Filterfelds (/materialien)', () => {
  // Die Filterzeile hängt am asynchron geladenen Manifest — SSR liefert darum
  // nur den Ladezustand (hier belegt, damit die Prüftechnik begründet ist).
  // Der SICHTBARE Beweis liegt in e2e/uinav-o2-sidebar.e2e.ts (echter Browser);
  // hier wird die Verdrahtung am Quelltext verriegelt: dieselbe id auf beiden
  // Seiten der aria-Beziehung, und der Wortlaut.
  const QUELLE = readFileSync('src/pages/Materialien.tsx', 'utf8');

  it('SSR zeigt (noch) nur den Ladezustand — Prüftechnik begründet', () => {
    const html = renderToString(<MemoryRouter><Materialien /></MemoryRouter>);
    expect(html).toContain('Die Übersicht wird abgerufen');
    expect(html).not.toContain('materialien-filter-scope');
  });

  it('Feld und Scope-Text tragen dieselbe id (aria-describedby aufgelöst)', () => {
    expect(QUELLE).toContain('aria-describedby="materialien-filter-scope"');
    expect(QUELLE).toContain('id="materialien-filter-scope"');
  });

  // DEKLARIERTE ANPASSUNG (R12A/D22, 6.9.2026): die Zusicherung ist unverändert
  // — Scope UND Weg zur grossen Suche stehen in der Zeile. Nur das führende
  // «Nur » ist gefallen: die Zeile sitzt jetzt in der Filterhülle unter dem
  // Feld (`.ub-filter-fuss`), wo sie ohnehin nichts anderes beschreibt als
  // diesen Filter. Der Identitäts-Treffer greift darum die Aufzählung selbst.
  it('der Text nennt den Scope UND den Weg zur grossen Suche', () => {
    expect(QUELLE).toContain('Titel, Nummer, Behörde und Dokumenttyp dieser Rubrik');
    expect(QUELLE).toContain('über die Suche oben');
  });
});

describe('Beifang · kein iOS-Fokus-Zoom an den kompakten Feldern', () => {
  // Safari iOS zoomt beim Fokus jedes Felds unter 16 px. `.lc-input-sm` trug
  // .875rem — dieselbe Falle, die S6 am Kopf-Feld behoben hat.
  const block = CSS.match(/@media not all and \(min-width: theme\('screens\.sm'\)\)\s*\{([\s\S]*?)\n {2}\}/);

  it('es gibt genau eine Unter-sm-Regel, und sie hängt am Breakpoint-Token', () => {
    expect(block, 'Unter-sm-Block fehlt oder benutzt eine rohe Pixelzahl').not.toBeNull();
    // Keine getippte Breakpoint-Zahl (D2 «keine Magic-Numbers»).
    expect(CSS).not.toMatch(/@media[^{]*max-width:\s*6\d\dpx/);
  });

  it('hebt .lc-input-sm — auch in der Select-Variante — auf mindestens 16 px', () => {
    const inhalt = block![1];
    for (const sel of ['.lc-input-sm', 'select.lc-input.lc-input-sm', '.lc-select.lc-input-sm']) {
      expect(inhalt, `${sel} fehlt in der Unter-sm-Regel`).toContain(sel);
    }
    const fs = inhalt.match(/font-size:\s*([0-9.]+)rem/);
    expect(fs, 'kein rem-Wert in der Unter-sm-Regel').not.toBeNull();
    expect(Number(fs![1]) * 16, 'unter 16 px zoomt iOS Safari beim Fokus').toBeGreaterThanOrEqual(16);
  });

  it('Rotprobe: die Basisregel selbst ist weiterhin die kompakte Stufe (ab sm)', () => {
    // Der Fix ist ein Unter-sm-Zusatz, kein globales Aufblähen der Variante —
    // ohne diesen Nachweis könnte die Regel gerissen sein, ohne dass es auffällt.
    expect(CSS).toMatch(/\.lc-input-sm\s*\{[^}]*font-size:\s*\.875rem/);
  });
});
