/**
 * Testbindung der pure/testbaren Bausteine aus scripts/normtext/struktur-run.ts
 * (Fund fahrplaene/FAHRPLAN-OFFENE-BEFUNDE.md:34/35, Gegenprüfung #808 B4, 12.9.2026).
 *
 * ROT-BEWEIS 1 (Fund A, Churn): vor `--nur=<KEY>` verarbeitete `struktur-run.ts` immer
 * ALLE Bund-Erlasse — es gab keinen Filter zu testen. `parseNurFilter` ist neu.
 *
 * ROT-BEWEIS 2 (Fund A, Churn-Wurzel): vor `sollSchreiben` schrieb der Runner JEDE
 * Datei neu, sobald `erzeugt` vom Vortag abwich, selbst wenn Struktur/Kopf/Fussnoten
 * byte-gleich blieben — ein Breitband-Lauf riss so 227 reine Datums-Diffs auf.
 *
 * ROT-BEWEIS 3 (Fund B, §17 B4): vor `cacheGueltig` prüfte der Runner nur `existsSync`
 * auf dem /tmp-HTML — ein VOR einem Re-Pin geschriebener, inhaltlich unauffälliger
 * Cache wäre unbemerkt weiterverwendet worden (dieselbe Lücke, die `sicherstelleCaches`
 * in normtext-snapshot.ts seit #808 schliesst).
 *
 * KEIN NETZ. Alle Fixtures sind synthetisch, eigener /tmp-Namensraum, wird nach jedem
 * Test entfernt. Der Import dieser Datei löst KEINEN CLI-Lauf aus (istCliLauf-Guard in
 * struktur-run.ts prüft process.argv[1] gegen den Dateinamen — unter vitest nie wahr).
 */
import { describe, it, expect, afterEach } from 'vitest';
import { writeFileSync, rmSync } from 'node:fs';
import { parseNurFilter, sollSchreiben, cacheGueltig } from '../../scripts/normtext/struktur-run';
import type { FedlexCacheEintrag } from '../../scripts/normtext/inventar-bund';

describe('parseNurFilter', () => {
  it('ohne --nur ⇒ null (Breitband, unverändertes Altverhalten)', () => {
    expect(parseNurFilter(['--datum=2026-09-12'])).toBeNull();
  });
  it('--nur=OR ⇒ Set mit einem Key', () => {
    expect(parseNurFilter(['--datum=2026-09-12', '--nur=OR'])).toEqual(new Set(['OR']));
  });
  it('--nur=OR,ZGB (kommasepariert, mit Leerraum) ⇒ Set mit beiden Keys', () => {
    expect(parseNurFilter(['--nur=OR, ZGB '])).toEqual(new Set(['OR', 'ZGB']));
  });
  it('--nur= (leer) ⇒ null, kein leeres Set', () => {
    expect(parseNurFilter(['--nur='])).toBeNull();
  });
});

describe('sollSchreiben — §17 Churn-Wurzel', () => {
  const alt = JSON.stringify({ erzeugt: '2026-09-01', artikel: { art_1: { blocke: [] } } }, null, 1) + '\n';

  it('Datei existiert noch nicht ⇒ immer schreiben', () => {
    expect(sollSchreiben(null, alt)).toBe(true);
  });
  it('byte-gleich ⇒ nicht schreiben', () => {
    expect(sollSchreiben(alt, alt)).toBe(false);
  });
  it('ROT-BEWEIS: nur `erzeugt` geändert (reiner Datums-Churn) ⇒ NICHT schreiben', () => {
    const neu = alt.replace('2026-09-01', '2026-09-12');
    expect(neu).not.toBe(alt);
    expect(sollSchreiben(alt, neu)).toBe(false);
  });
  it('inhaltliche Änderung NEBEN dem Datum ⇒ schreiben (Substanz bleibt)', () => {
    const neu = alt.replace('2026-09-01', '2026-09-12').replace('art_1', 'art_2');
    expect(sollSchreiben(alt, neu)).toBe(true);
  });
});

describe('cacheGueltig — §17 Gegenprüfung #808 B4 (Pin-Prüfung, nicht nur existsSync)', () => {
  let n = 0;
  const angelegt: string[] = [];
  function fixture(pinMarke?: string): string {
    const key = `LMTESTKEY${process.pid}${n++}`;
    const pfad = `/tmp/${key.toLowerCase()}.html`;
    writeFileSync(pfad, '<html>ok</html>', 'utf8');
    angelegt.push(pfad);
    if (pinMarke !== undefined) {
      const pinPfad = `${pfad}.pin`;
      writeFileSync(pinPfad, pinMarke, 'utf8');
      angelegt.push(pinPfad);
    }
    return key;
  }
  function pinsFuer(key: string, eli: string, kons: string, htmlN: number): Map<string, FedlexCacheEintrag> {
    return new Map([[key.toLowerCase(), { name: key.toLowerCase(), eli, konsolidierung: kons, htmlN, anker: [] }]]);
  }

  afterEach(() => {
    for (const p of angelegt.splice(0)) rmSync(p, { force: true, recursive: true });
  });

  it('Cache fehlt ⇒ ungültig (Altverhalten bleibt)', () => {
    const key = `LMTESTKEY${process.pid}${n++}9999`;
    expect(cacheGueltig(key, new Map())).toBe(false);
  });

  it('kein Pin-Eintrag zum Key bekannt ⇒ gültig (defensiv, existsSync-Altverhalten)', () => {
    const key = fixture();
    expect(cacheGueltig(key, new Map())).toBe(true);
  });

  it('Cache existiert, aber Pin-Marker fehlt ⇒ ungültig (Neuabruf nötig)', () => {
    const key = fixture(); // kein .pin
    expect(cacheGueltig(key, pinsFuer(key, 'cc/2020/1', '20250101', 7))).toBe(false);
  });

  it('ROT-BEWEIS: Marker aus überholter html-Revision (Re-Pin html-6 → html-7) ⇒ ungültig', () => {
    const key = fixture('cc/2020/1|20250101|6');
    // Vor der Pin-Sonde war GENAU DAS die Lücke: nur existsSync geprüft ⇒ true.
    expect(cacheGueltig(key, pinsFuer(key, 'cc/2020/1', '20250101', 7))).toBe(false);
  });

  it('Marker stimmt exakt überein ⇒ gültig', () => {
    const key = fixture('cc/2020/1|20250101|7');
    expect(cacheGueltig(key, pinsFuer(key, 'cc/2020/1', '20250101', 7))).toBe(true);
  });
});
