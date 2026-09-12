/**
 * Finding 4b, zweite Stufe (W2·18-FEHLERBUCH, Gegenprüfung PR #832, Auflage 1):
 * Fixture-Test für die neue Render-Verzweigung in `RevisionenGruppe.tsx`
 * (`dateInKraftFuerCh` neben `dateEntryInForce`). Haus-Muster `renderToString`
 * wie `kontext-artikel-s7.test.tsx` — hier direkt auf der Komponente, weil sie
 * ein reiner Renderer ohne Router-/Fetch-Abhängigkeit ist (§3, Docstring
 * `RevisionenGruppe.tsx`).
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { RevisionenGruppe } from '../components/kontext/RevisionenGruppe';
import type { RevisionBezug } from '../lib/normtext/revisionen';

const FZA_MUSTER: RevisionBezug = {
  art: 'aenderung',
  dateEntryInForce: '2021-01-01',
  dateInKraftFuerCh: '2020-12-15',
  ocUri: 'https://fedlex.data.admin.ch/eli/oc/2021/12',
  titelDe: 'Beschluss Nr. 1/2020',
  quelleUrl: 'https://www.fedlex.admin.ch/eli/oc/2021/12/de',
};

const OHNE_ZWEITDATUM: RevisionBezug = {
  art: 'aenderung',
  dateEntryInForce: '2023-09-01',
  ocUri: 'https://fedlex.data.admin.ch/eli/oc/2022/491',
  titelDe: 'Gewöhnliche Änderung',
  quelleUrl: 'https://www.fedlex.admin.ch/eli/oc/2022/491/de',
};

function gruppe(revAenderungen: RevisionBezug[]) {
  return renderToString(
    <RevisionenGruppe revFehler={false} revAenderungen={revAenderungen} revMarker={[]}
      botschaftNachKey={new Map()} locale="de" />,
  );
}

describe('RevisionenGruppe — Finding 4b, zweite Stufe (dateInKraftFuerCh)', () => {
  it('zeigt BEIDE Daten in der richtigen Reihenfolge, wenn dateInKraftFuerCh gesetzt ist (FZA-Muster)', () => {
    const html = gruppe([FZA_MUSTER]);
    expect(html).toContain('in Kraft für die Schweiz seit');
    expect(html).toContain('15.12.2020');
    expect(html).toContain('angewendet ab');
    expect(html).toContain('01.01.2021');
    // Reihenfolge: das frühere, amtlich belegte Datum ZUERST.
    expect(html.indexOf('15.12.2020')).toBeLessThan(html.indexOf('01.01.2021'));
    expect(html.indexOf('in Kraft für die Schweiz seit')).toBeLessThan(html.indexOf('angewendet ab'));
  });

  it('zeigt nur EINE Angabe ohne Leer-Separator, wenn dateInKraftFuerCh fehlt (Bestandsverhalten)', () => {
    const html = gruppe([OHNE_ZWEITDATUM]);
    expect(html).toContain('01.09.2023');
    expect(html).not.toContain('angewendet ab');
    expect(html).not.toContain('in Kraft für die Schweiz seit');
    // Kein leerer Trenner («· » ohne zweites Datum davor) — die Zeile beginnt
    // direkt mit dem Datum, kein Artefakt der Verzweigung.
    expect(html).not.toMatch(/·\s*<\/a>/);
  });
});
