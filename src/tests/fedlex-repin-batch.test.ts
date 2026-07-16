import { describe, it, expect } from 'vitest';
import { reSchreibeCacheZeile, type RepinZiel } from '../../scripts/fedlex-repin-batch';
import { istRisikoPfad } from '../../scripts/gegenpruefung/kern';

// O-2.1 Batch-Re-Pin: die sicherheitskritische reine Funktion ist die byte-präzise
// Zeilen-Ersetzung in cache.sh — nur Feld 3 (kons) + Feld 4 (html-N), alles andere
// (name/eli/anker/sr) unangetastet. Netz-Erhebung (erhebeRepin) ist über die
// injizierbare fetchImpl deterministisch, wird aber hier nicht gemockt (das SPARQL-
// Contract deckt fedlex-wiedervorlage.test.ts + fedlex-manifest bereits ab).

const ziel = (p: Partial<RepinZiel>): RepinZiel => ({
  name: 'asylv2', eli: 'cc/1999/360', altKons: '2026-06-12', neuKons: '2026-07-14',
  altN: 0, neuN: 1, ...p,
});

describe('reSchreibeCacheZeile — byte-präzise Feld-3/4-Ersetzung', () => {
  it('ersetzt kons + html-N, lässt Anker/SR/eli unangetastet', () => {
    const sh = '  "asylv2|cc/1999/360|20260612|0|art_1|142.312"\n';
    const out = reSchreibeCacheZeile(sh, ziel({}));
    expect(out).toBe('  "asylv2|cc/1999/360|20260714|1|art_1|142.312"\n');
  });

  it('trifft nur die eine Zeile (andere Pins unberührt)', () => {
    const sh =
      '  "asylv1|cc/1999/358|20260612|0|art_1|142.311"\n' +
      '  "asylv2|cc/1999/360|20260612|0|art_1|142.312"\n' +
      '  "asylv3|cc/1999/361|20260612|0|art_1|142.314"\n';
    const out = reSchreibeCacheZeile(sh, ziel({}));
    expect(out).toContain('"asylv1|cc/1999/358|20260612|0|art_1|142.311"');
    expect(out).toContain('"asylv2|cc/1999/360|20260714|1|art_1|142.312"');
    expect(out).toContain('"asylv3|cc/1999/361|20260612|0|art_1|142.314"');
  });

  it('bewahrt Anker mit Kommas (mehrere Pflicht-Anker)', () => {
    const sh = '  "chemrrv|cc/2005/478|20260101|26|art_1,art_3,anh_1|814.81"\n';
    const out = reSchreibeCacheZeile(sh, ziel({
      name: 'chemrrv', eli: 'cc/2005/478', altKons: '2026-01-01', neuKons: '2026-07-16', altN: 26, neuN: 27,
    }));
    expect(out).toBe('  "chemrrv|cc/2005/478|20260716|27|art_1,art_3,anh_1|814.81"\n');
  });

  it('wirft, wenn die Zeile nicht existiert (kein stiller No-op)', () => {
    const sh = '  "andere|cc/9/9|20200101|0|art_1|1.1"\n';
    expect(() => reSchreibeCacheZeile(sh, ziel({}))).toThrow(/Re-Pin FEHLGESCHLAGEN/);
  });
});

describe('Gegenprüfungs-Klassifikation', () => {
  it('das Batch-Re-Pin-Skript ist Fedlex-/Currency-Risikopfad', () => {
    expect(istRisikoPfad('scripts/fedlex-repin-batch.ts')).toBe(true);
  });
});
