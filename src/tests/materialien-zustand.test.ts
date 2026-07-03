import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  ladeZustand,
  serialisiereDok,
  serialisiereLauf,
  istPlausiblesDatum,
  type DokZeile,
} from '../../scripts/materialien/soft-law-zustand';
import { dbDokAusZustand, dokZeileNachBrowse } from '../../scripts/materialien/soft-law-projektion';

// E6a M2: Zustands-Manifest-Validator (Karten-Felder + ISO-Plausibilität, §0-Härtung 4c) +
// deterministische JSONL→BrowseMaterial-Rekonstruktion (CI-Rebuild-Fix).

function dok(p: Partial<DokZeile> = {}): DokZeile {
  return {
    typ: 'dok', id: 'SECO-WL-ARG-ART-9', status: 'gelistet', entlistet_am: null,
    drift_token: 'abc123', quell_ids: { dam_token: 'T', url_basis: 'https://x/f.pdf' }, sha: 'sha',
    stand: '2020-01-01', stand_quelle: 'hub-label', quelle_url: 'https://x/f.pdf', abgerufen: '2026-07-03',
    titel: 'ArG Artikel 9', behoerde: 'SECO', doktyp: 'wegleitung', nummer: 'Art. 9',
    rechtsgebiet: 'oeffentlich', sprache: 'de', rang: 1090, normKeys: ['ARG'], hinweis: null, ...p,
  };
}

function schreibeUndLade(zeilen: string[]) {
  const dir = mkdtempSync(join(tmpdir(), 'softlaw-'));
  const pfad = join(dir, 'zustand.jsonl');
  writeFileSync(pfad, zeilen.join('\n') + '\n', 'utf8');
  return ladeZustand(pfad);
}

describe('istPlausiblesDatum', () => {
  it('akzeptiert plausible ISO-Daten', () => {
    expect(istPlausiblesDatum('2023-01-04')).toBe(true);
    expect(istPlausiblesDatum('2025-12-31')).toBe(true);
  });
  it('lehnt unplausible Monate/Tage + Nicht-ISO ab', () => {
    expect(istPlausiblesDatum('2023-13-01')).toBe(false);
    expect(istPlausiblesDatum('2023-00-10')).toBe(false);
    expect(istPlausiblesDatum('2023-05-32')).toBe(false);
    expect(istPlausiblesDatum('2023-5-1')).toBe(false);
    expect(istPlausiblesDatum(42 as unknown)).toBe(false);
  });
});

describe('ladeZustand — Karten-Felder Pflicht + Plausibilität', () => {
  it('valide dok-Zeile lädt', () => {
    const z = schreibeUndLade([serialisiereLauf({ typ: 'lauf', quelle: 'seco', abgerufen: '2026-07-03', indexSha: 'x' }), serialisiereDok(dok())]);
    expect(z.letzterZustand.get('SECO-WL-ARG-ART-9')?.titel).toBe('ArG Artikel 9');
    expect(z.laeufe.length).toBe(1);
  });
  it('fehlender titel ⇒ Error', () => {
    const roh = JSON.stringify({ ...dok(), titel: undefined });
    expect(() => schreibeUndLade([roh])).toThrow(/ohne titel/);
  });
  it('normKeys kein string[] ⇒ Error', () => {
    const roh = JSON.stringify({ ...dok(), normKeys: 'ARG' });
    expect(() => schreibeUndLade([roh])).toThrow(/normKeys/);
  });
  it('unplausibles stand ⇒ Error', () => {
    const roh = JSON.stringify({ ...dok(), stand: '2023-13-40' });
    expect(() => schreibeUndLade([roh])).toThrow(/unplausibel/);
  });
  it('entlistet ohne plausibles entlistet_am ⇒ Error', () => {
    const roh = JSON.stringify({ ...dok(), status: 'entlistet', entlistet_am: '2023-13-01' });
    expect(() => schreibeUndLade([roh])).toThrow(/unplausibel/);
  });
});

describe('dbDokAusZustand / dokZeileNachBrowse (JSONL → BrowseMaterial)', () => {
  it('mappt gelistete Zeile auf schlankes BrowseMaterial', () => {
    const bm = dokZeileNachBrowse(dok());
    expect(bm.key).toBe('SECO-WL-ARG-ART-9');
    expect(bm.behoerdeName).toBe('Staatssekretariat für Wirtschaft');
    expect(bm.doktypLabel).toBe('Wegleitung');
    expect(bm.status).toBe('nur-live-link');
    expect(bm.normKeys).toEqual(['ARG']);
  });
  it('entlistete Dokumente werden NICHT rekonstruiert', () => {
    const z = schreibeUndLade([
      serialisiereDok(dok({ id: 'A' })),
      serialisiereDok(dok({ id: 'B', status: 'entlistet', entlistet_am: '2026-07-03' })),
    ]);
    const docs = dbDokAusZustand(z);
    expect(docs.map((d) => d.key)).toEqual(['A']);
  });
  it('last-write-wins: spätere Zeile ersetzt frühere', () => {
    const z = schreibeUndLade([
      serialisiereDok(dok({ id: 'A', titel: 'alt' })),
      serialisiereDok(dok({ id: 'A', titel: 'neu' })),
    ]);
    expect(dbDokAusZustand(z)[0].titel).toBe('neu');
  });
});
