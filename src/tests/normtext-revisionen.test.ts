import { describe, it, expect } from 'vitest';
import {
  baueRevisionen, roFundstelleAusOc, liveLink, botschaftIndex, serialisiere,
  MARKER_CUTOFF, type ErlassMeta,
} from '../../scripts/normtext/revisionen-generieren';
import { revisionenFuerNorm, revisionTitel, type RevisionBezug } from '../lib/normtext/revisionen';
import type { SparqlBinding } from '../../scripts/fedlex-sparql';

// Paket 5 (W2·6-REV): reine Generator-Logik (dedupe/Sortierung/Determinismus/
// RO-Fundstelle/Botschafts-Join/Sammelerlass-Cross-Check/nichtKonsolidiert) + die
// Lese-Brücken-Projektion. Netz-Kette prüft die Live-Daten separat.

const OC = (s: string) => `https://fedlex.data.admin.ch/eli/oc/${s}`;
const ERLASS: ErlassMeta = { key: 'DSG', sr: '235.1' };

function bind(o: Record<string, string | undefined>): SparqlBinding {
  const b: SparqlBinding = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) b[k] = { value: v };
  return b;
}

describe('roFundstelleAusOc', () => {
  it('leitet die moderne AS-Fundstelle aus der oc-URI ab', () => {
    expect(roFundstelleAusOc(OC('2022/491'))).toBe('AS 2022 491');
  });
  it('behandelt die Alt-AS-Band-Nummerierung (vor 1948)', () => {
    expect(roFundstelleAusOc(OC('63/837_843_843'))).toBe('AS 63 837');
  });
  it('gibt undefined bei unerwarteter URI', () => {
    expect(roFundstelleAusOc('https://example.org/foo')).toBeUndefined();
  });
});

describe('liveLink', () => {
  it('baut den DE-Live-Link auf www.fedlex', () => {
    expect(liveLink(OC('2022/491'))).toBe('https://www.fedlex.admin.ch/eli/oc/2022/491/de');
  });
});

describe('baueRevisionen — Kern-Logik', () => {
  const ocZuBotschaft = new Map([[OC('2022/491'), 'BOTSCHAFT-2017-2057']]);

  it('dedupliziert je oc auf das früheste Inkrafttreten, Sprachen kollabieren', () => {
    const bindings = [
      bind({ oc: OC('2022/491'), dateForce: '2023-09-01', dateDoc: '2020-09-25', titleDe: 'DE', titleFr: 'FR', titleIt: 'IT' }),
      bind({ oc: OC('2022/491'), dateForce: '2024-01-01' }), // späteres Teil-Inkrafttreten
    ];
    const s = baueRevisionen(ERLASS, bindings, [], '2025-01-01', ocZuBotschaft, '2026-07-10');
    const ae = s.revisionen.filter((r) => r.art === 'aenderung');
    expect(ae).toHaveLength(1);
    expect(ae[0].dateEntryInForce).toBe('2023-09-01'); // min
    expect(ae[0].titelDe).toBe('DE');
    expect(ae[0].roFundstelle).toBe('AS 2022 491');
    expect(ae[0].botschaftKey).toBe('BOTSCHAFT-2017-2057');
  });

  it('setzt nichtKonsolidiert gdw. dateEntryInForce > Korpus-Stand', () => {
    const bindings = [
      bind({ oc: OC('2026/500'), dateForce: '2026-10-01', titleDe: 'Künftig' }),
      bind({ oc: OC('2024/100'), dateForce: '2024-05-01', titleDe: 'Alt' }),
    ];
    const s = baueRevisionen(ERLASS, bindings, [], '2025-01-01', new Map(), '2026-07-10');
    const nk = s.revisionen.find((r) => r.ocUri === OC('2026/500'));
    const alt = s.revisionen.find((r) => r.ocUri === OC('2024/100'));
    expect(nk?.nichtKonsolidiert).toBe(true);
    expect(alt?.nichtKonsolidiert).toBeUndefined();
  });

  it('erzeugt Sammelerlass-Marker für Pfad-(a)-Stände ohne (b)-Erlass, ab Cutoff', () => {
    const bindings = [bind({ oc: OC('2020/1'), dateForce: '2020-01-01', titleDe: 'Basis' })];
    // Pfad-(a)-Geltungsstände: einer deckungsgleich (2020-01-01), einer Mantelerlass (2022-06-01),
    // einer VOR dem Cutoff (1998-01-01, muss ignoriert werden).
    const aStaende = ['1998-01-01', '2020-01-01', '2022-06-01'];
    const s = baueRevisionen(ERLASS, bindings, aStaende, '2025-01-01', new Map(), '2026-07-10');
    const marker = s.revisionen.filter((r) => r.art === 'sammelerlass-marker');
    expect(marker).toHaveLength(1);
    expect(marker[0].dateEntryInForce).toBe('2022-06-01');
    expect(marker[0].ocUri).toBeUndefined();
    expect(MARKER_CUTOFF).toBe('2000-01-01');
  });

  it('sortiert Datum absteigend und ist byte-deterministisch', () => {
    const bindings = [
      bind({ oc: OC('2019/111'), dateForce: '2019-03-01', titleDe: 'A' }),
      bind({ oc: OC('2022/491'), dateForce: '2023-09-01', titleDe: 'B' }),
    ];
    const a = serialisiere(baueRevisionen(ERLASS, bindings, [], '2025-01-01', new Map(), '2026-07-10'));
    const b = serialisiere(baueRevisionen(ERLASS, [...bindings].reverse(), [], '2025-01-01', new Map(), '2026-07-10'));
    expect(a).toBe(b); // reihenfolge-unabhängig
    const s = JSON.parse(a) as { revisionen: RevisionBezug[] };
    expect(s.revisionen.map((r) => r.dateEntryInForce)).toEqual(['2023-09-01', '2019-03-01']);
  });
});

describe('botschaftIndex', () => {
  it('baut aus den persistierten ocUris einen ocUri→botschaftKey-Index', () => {
    const idx = botschaftIndex();
    expect(idx.size).toBeGreaterThan(0); // Paket 2 hat ocUris persistiert
  });
});

describe('revisionTitel', () => {
  const r: RevisionBezug = { art: 'aenderung', dateEntryInForce: '2023-09-01', titelDe: 'DE', titelFr: 'FR', titelIt: 'IT', quelleUrl: 'https://x' };
  it('wählt die Locale-Sprache mit DE-Fallback', () => {
    expect(revisionTitel(r, 'fr')).toBe('FR');
    expect(revisionTitel(r, 'it')).toBe('IT');
    expect(revisionTitel(r, 'de')).toBe('DE');
    expect(revisionTitel({ ...r, titelFr: undefined }, 'fr')).toBe('DE');
  });
});

describe('revisionenFuerNorm — Lese-Brücke', () => {
  it('gibt null zurück, wenn ALLE Sidecars nicht ladbar sind (Fetch-Fehler ≠ leer)', async () => {
    const orig = globalThis.fetch;
    globalThis.fetch = (async () => ({ ok: false })) as unknown as typeof fetch;
    try {
      expect(await revisionenFuerNorm(['NICHTVORHANDEN-KEY'])).toBeNull();
    } finally { globalThis.fetch = orig; }
  });
});
