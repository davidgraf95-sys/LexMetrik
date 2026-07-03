import { describe, it, expect, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ladeZustand } from '../../scripts/materialien/soft-law-zustand';

// Parser/Validator des committeten Zustands-Trägers (§2.3). Kein Anfassen bestehender Tests.

const angelegt: string[] = [];
function schreibeTmp(inhalt: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'slz-'));
  angelegt.push(dir);
  const pfad = join(dir, 'soft-law-zustand.jsonl');
  writeFileSync(pfad, inhalt, 'utf8');
  return pfad;
}
afterAll(() => { for (const d of angelegt) rmSync(d, { recursive: true, force: true }); });

const LAUF = { typ: 'lauf', quelle: 'estv-mwst', abgerufen: '2026-07-03', indexSha: 'abc' };
const DOK = {
  typ: 'dok', id: 'ESTV-MWST-MI-04', status: 'gelistet', entlistet_am: null,
  drift_token: 'sha1', quell_ids: { url_basis: 'https://x/1' }, sha: 'sha2',
  stand: '2025-10-31', stand_quelle: 'toc', quelle_url: 'https://x', abgerufen: '2026-07-03',
};

describe('soft-law-zustand: ladeZustand', () => {
  it('leere Datei ⇒ leeres, gültiges Ergebnis', () => {
    const z = ladeZustand(schreibeTmp(''));
    expect(z.laeufe).toEqual([]);
    expect(z.letzterZustand.size).toBe(0);
    expect(z.zeilen).toEqual([]);
  });

  it('fehlende Datei ⇒ leeres Ergebnis (kein Wurf)', () => {
    const z = ladeZustand(join(tmpdir(), 'gibt-es-nicht-xyz.jsonl'));
    expect(z.zeilen).toEqual([]);
  });

  it('gültige Lauf- + Dok-Zeilen parsen; letzterZustand = jüngster', () => {
    const inhalt = [JSON.stringify(LAUF), JSON.stringify(DOK), JSON.stringify({ ...DOK, sha: 'sha3', stand: '2026-01-01' })].join('\n') + '\n';
    const z = ladeZustand(schreibeTmp(inhalt));
    expect(z.laeufe.length).toBe(1);
    expect(z.letzterZustand.size).toBe(1);
    expect(z.letzterZustand.get('ESTV-MWST-MI-04')!.stand).toBe('2026-01-01'); // last-write-wins
    expect(z.zeilen.length).toBe(3);
  });

  it('unbekannter typ ⇒ Error', () => {
    expect(() => ladeZustand(schreibeTmp(JSON.stringify({ typ: 'quatsch', id: 'x' })))).toThrow(/unbekannter typ/);
  });

  it('fehlendes Pflichtfeld (drift_token) ⇒ Error (§0/A8)', () => {
    const { drift_token, ...ohne } = DOK;
    void drift_token;
    expect(() => ladeZustand(schreibeTmp(JSON.stringify(ohne)))).toThrow(/drift_token/);
  });

  it('entlistet ohne entlistet_am ⇒ Error', () => {
    expect(() => ladeZustand(schreibeTmp(JSON.stringify({ ...DOK, status: 'entlistet', entlistet_am: null })))).toThrow(/entlistet_am/);
  });

  it('gelistet mit gesetztem entlistet_am ⇒ Error (keine Geister-Daten)', () => {
    expect(() => ladeZustand(schreibeTmp(JSON.stringify({ ...DOK, status: 'gelistet', entlistet_am: '2025-01-01' })))).toThrow(/entlistet_am gesetzt/);
  });

  it('unbekannte quelle in Lauf-Zeile ⇒ Error', () => {
    expect(() => ladeZustand(schreibeTmp(JSON.stringify({ ...LAUF, quelle: 'bag' })))).toThrow(/quelle/);
  });
});
