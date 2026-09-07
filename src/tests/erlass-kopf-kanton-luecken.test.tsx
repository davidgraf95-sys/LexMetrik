/**
 * §8-Nachzug (Gegenprüfung PR #614): ausgewiesene Kanton-Erlass-Lücken im
 * Erlass-Kopf. `public/normtext/kanton-luecken.json` deklariert je Erlass
 * bewusst ausgelassene Teile (Anhänge, Übergangs-/Schlussbestimmungen) — bis
 * zu diesem Nachzug wurde der Sidecar von `src/**` nirgends gelesen, der Kopf
 * zeigte ZH-Erlasse ohne jeden Hinweis auf die Lücke (§8-Verstoss).
 *
 * Reiner SSR-Render (`renderToString`), kein Browser — die Zusage hängt am
 * Wortlaut/Bedingung, nicht an Layout.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ErlassLeserKopf } from '../pages/gesetz-leser/parts/ErlassLeserKopf';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import type { KantonLueckeEintrag } from '../lib/normtext/browse';

const PUB = join(process.cwd(), 'public');

// F1-Fix (Gegenprüfung Opus, PR #616): KEIN erfundenes `pdfUrl` mehr — real
// tragen 0 von 15 heutigen Lücken-Erlassen eines (unabhängig gemessen), ein
// Fixture mit `pdfUrl` hätte den toten Zweig verdeckt gehalten.
const kantonal: BrowseErlass = {
  key: 'ZH-999', kuerzel: 'TEST', titel: 'Test-Erlass (TEST)', ebene: 'kanton',
  sr: null, stand: '2026-01-01', status: 'snapshot', datei: 'kanton/ZH-999.json',
  quelleUrl: 'https://www.zh.ch/erlass-999.html',
} as BrowseErlass;

const EIN_HINWEIS: KantonLueckeEintrag = {
  quelleUrl: 'https://www.zh.ch/erlass-999.html',
  erlass: 'Test-Erlass (LS 999)',
  hinweise: [
    'Anhang ab «Anhang» vom §-Parser NICHT erfasst — 51 von 1773 Textzeilen (3 %). '
    + 'Grund: der Anhang führt eine eigene, mit dem Haupttext kollidierende Zählung. '
    + 'Massgeblich ist die amtliche Fassung.',
  ],
};

const ZWEI_HINWEISE: KantonLueckeEintrag = {
  ...EIN_HINWEIS,
  hinweise: [
    ...EIN_HINWEIS.hinweise,
    'Übergangs-/Schlussbestimmungen ab «Übergangsbestimmungen» vom §-Parser NICHT erfasst — '
    + '10 von 457 Textzeilen (2 %). Massgeblich ist die amtliche Fassung.',
  ],
};

function kopf(props: Partial<Parameters<typeof ErlassLeserKopf>[0]> = {}) {
  return renderToString(
    <ErlassLeserKopf
      erlass={kantonal} overline="Kanton" artikelAnzahl={12} bestimmungsWort="Paragraphen"
      hinweis="Snapshot — massgeblich ist die amtliche Fassung" {...props}
    />,
  );
}

describe('§8-Nachzug — Kanton-Lücken-Hinweis im Erlass-Kopf', () => {
  it('ohne luecken-Prop: kein Hinweis (§8 — Schweigen ist hier korrekt)', () => {
    const html = kopf();
    expect(html).not.toContain('Nicht vollständig erfasst');
  });

  it('mit EINER Lücke: der Hinweis erscheint wortgleich zur JSON, als Absatz (keine Liste)', () => {
    const html = kopf({ luecken: EIN_HINWEIS });
    expect(html).toContain('Nicht vollständig erfasst');
    expect(html).toContain(EIN_HINWEIS.hinweise[0]);
    expect(html).not.toContain('<ul');
  });

  it('mit ZWEI Lücken: beide Sätze erscheinen wortgleich, als Liste', () => {
    const html = kopf({ luecken: ZWEI_HINWEISE });
    expect(html).toContain('<ul');
    for (const h of ZWEI_HINWEISE.hinweise) expect(html).toContain(h);
  });

  // F1-Fix: die Link-Quelle ist `luecken.quelleUrl` (Sidecar), NICHT
  // `erlass.pdfUrl` — der bisherige Code las das falsche, meist leere Feld
  // (0 von 15 realen Einträgen trugen ein pdfUrl, der Link fehlte live).
  it('F1: quelleUrl vorhanden → Link auf quelleUrl, Kanon-Name «Amtliche Fassung ↗» (Ä110)', () => {
    const html = kopf({ luecken: EIN_HINWEIS });
    expect(html).toContain(`href="${EIN_HINWEIS.quelleUrl}"`);
    expect(html).toContain('Amtliche Fassung ↗');
    expect(html).not.toContain('Amtliches PDF');
  });

  it('F1: kein quelleUrl im Sidecar, aber erlass.pdfUrl vorhanden → Fallback-Link «Amtliches PDF»', () => {
    const ohneQuelle: KantonLueckeEintrag = { ...EIN_HINWEIS, quelleUrl: '' };
    const mitPdf: BrowseErlass = { ...kantonal, pdfUrl: 'https://www.zh.ch/erlass-999.pdf' };
    const html = renderToString(
      <ErlassLeserKopf erlass={mitPdf} overline="Kanton" artikelAnzahl={12} bestimmungsWort="Paragraphen"
        hinweis="H" luecken={ohneQuelle} />,
    );
    expect(html).toContain(`href="${mitPdf.pdfUrl}"`);
    expect(html).toContain('Amtliches PDF');
  });

  it('F1: weder quelleUrl noch pdfUrl → kein toter Link, Hinweis steht trotzdem (§8)', () => {
    const ohneQuelle: KantonLueckeEintrag = { ...EIN_HINWEIS, quelleUrl: '' };
    const html = renderToString(
      <ErlassLeserKopf erlass={kantonal} overline="Kanton" artikelAnzahl={12} bestimmungsWort="Paragraphen"
        hinweis="H" luecken={ohneQuelle} />,
    );
    expect(html).toContain('Nicht vollständig erfasst');
    expect(html).toContain(EIN_HINWEIS.hinweise[0]);
    // Scope auf den Notice-Block (nicht auf den ganzen Kopf — der trägt seinen
    // eigenen «Amtliche Fassung»-Link in der Aktionen-Zeile IMMER, unabhängig
    // von luecken): ohne Link schliesst der Absatz direkt nach dem Text.
    expect(html).toContain('Nicht vollständig erfasst</p>');
  });

  it('leere hinweise-Liste: kein Hinweis (nichts Leeres anzeigen)', () => {
    const html = kopf({ luecken: { ...EIN_HINWEIS, hinweise: [] } });
    expect(html).not.toContain('Nicht vollständig erfasst');
  });
});

// ─── Gegenprüfung (check:gegenpruefung, Risiko-Datei browse.ts) — REALE Daten,
// unabhängig aus dem Sidecar gelesen, nicht aus dem Code abgeleitet: beweist,
// dass der Reader den ECHTEN ZH-700.1-Eintrag (2 Hinweise, vom Auftrag als
// e2e-Probe genannt) byte-gleich zeigt, und dass alle 15 heutigen Kanton-
// Lücken-Keys ohne `pdfUrl` im Register korrekt OHNE toten Link rendern
// (Randfall, unabhängig gemessen: `luecken-Keys OHNE pdfUrl` = alle 15).
describe('Gegenprüfung — echte kanton-luecken.json/register.json-Daten', () => {
  const luecken = JSON.parse(readFileSync(join(PUB, 'normtext/kanton-luecken.json'), 'utf8')).erlasse;
  const erlasse: BrowseErlass[] = JSON.parse(readFileSync(join(PUB, 'normtext/register.json'), 'utf8')).erlasse;

  it('ZH-700.1 (e2e-Probe-Ziel): beide Hinweise stehen byte-gleich zum Sidecar', () => {
    const zh7001 = erlasse.find((e) => e.key === 'ZH-700.1')!;
    const eintrag: KantonLueckeEintrag = luecken['ZH-700.1'];
    expect(eintrag.hinweise).toHaveLength(2);
    const html = renderToString(
      <ErlassLeserKopf erlass={zh7001} overline="Kanton" artikelAnzahl={100} bestimmungsWort="Paragraphen"
        hinweis="Snapshot — massgeblich ist die amtliche Fassung" luecken={eintrag} />,
    );
    for (const h of eintrag.hinweise) expect(html).toContain(h);
    expect(html).toContain('<ul');
    // F1-Fix: ZH-700.1 trägt (wie alle 15) KEIN pdfUrl im Register — aber
    // SEHR WOHL ein quelleUrl im Sidecar (identisch zu erlass.quelleUrl,
    // unabhängig gemessen) — der Link steht jetzt, mit dem Kanon-Namen.
    expect(zh7001.pdfUrl).toBeUndefined();
    expect(eintrag.quelleUrl).toBe(zh7001.quelleUrl);
    expect(html).toContain(`href="${eintrag.quelleUrl}"`);
    expect(html).toContain('Amtliche Fassung ↗');
    expect(html).not.toContain('Amtliches PDF');
  });

  it('jeder heutige kanton-luecken-Key rendert ohne Absturz (alle 15, echte Daten)', () => {
    for (const [key, eintrag] of Object.entries(luecken) as [string, KantonLueckeEintrag][]) {
      const erlass = erlasse.find((e) => e.key === key);
      if (!erlass) continue; // Register kann zwischen Ständen abweichen — kein Testfall dieser Datei.
      const html = renderToString(
        <ErlassLeserKopf erlass={erlass} overline="Kanton" artikelAnzahl={1} bestimmungsWort="Paragraphen"
          hinweis="H" luecken={eintrag} />,
      );
      if (eintrag.hinweise.length > 0) expect(html).toContain('Nicht vollständig erfasst');
    }
  });
});
