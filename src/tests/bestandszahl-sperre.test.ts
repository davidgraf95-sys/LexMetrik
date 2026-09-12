import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, unlinkSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { schreibeKorpus, ladeBestandSnapshots } from '../../scripts/normtext/entscheide-schreiben';
import type { EntscheidSnapshot } from '../lib/rechtsprechung/typen';
import type { EntscheidManifest } from '../lib/rechtsprechung/register';

// ─── Bestandszahl-Sperre (§17-Wurzel-Fix, fahrplaene/FAHRPLAN-OFFENE-BEFUNDE.md:35, #691) ──
//
// Reproduktion: ein Offline-Refresh lädt den committeten Bestand von der Platte
// (`ladeBestandSnapshots`) und schreibt ihn über denselben Writer (`schreibeKorpus`)
// zurück — additiv/bge-refresh/regeste-refresh/rubrum-refresh/remap/bge-baender in
// scripts/normtext-entscheide.ts schützen dabei nur mit `if (!basis.length)`. Fehlt
// eine Snapshot-Datei auf der Platte (Disk-Fehler, halber Checkout, falscher cwd bei
// relativer `root`), sammelte `ladeBestandSnapshots` bisher stumm eine kleinere Menge
// ein (`continue`), und `schreibeKorpus` löschte (`rmSync`) den gesamten Korpus, um ihn
// mit genau dieser kleineren Menge zu ersetzen — ein Datenverlust ohne jede Meldung,
// solange die Restmenge > 0 blieb.

function snap(o: Partial<EntscheidSnapshot> & Pick<EntscheidSnapshot, 'id'>): EntscheidSnapshot {
  return {
    gericht: 'bge', gerichtName: 'Bundesgericht', gerichtstyp: 'bundesgericht',
    kanton: 'CH', abteilung: null, nummer: '', bgeReferenz: null,
    zitierung: o.id, datum: '2026-01-01', sprache: 'de', leitcharakter: 'leitentscheid',
    sachgebiet: 'privat', legalArea: null, rubrum: null, regeste: null, regesteAmtlich: true,
    abschnitte: [{ typ: 'erwaegung', bloecke: [{ marke: null, text: 'x' }] }],
    dispositivOrders: [], zitierteNormen: [], normKeys: [], zitierteEntscheide: [],
    bestand: 'snapshot', kuratierung: 'maschinell', quelle: 'opencaselaw',
    quelleUrl: 'https://www.bger.ch', abgerufen: '2026-01-01', fassungsToken: 'h', sha: 's',
    ...o,
  } as EntscheidSnapshot;
}
function bge(fundstelle: string, over: Partial<EntscheidSnapshot> = {}): EntscheidSnapshot {
  const slug = fundstelle.replace(/\s+/g, '_');
  return snap({ id: `bund/bge/${slug}`, gericht: 'bge', bgeReferenz: fundstelle, nummer: fundstelle, zitierung: `BGE ${fundstelle}`, ...over });
}

const roots: string[] = [];
function neuerRoot(prefix: string): string {
  const r = mkdtempSync(join(tmpdir(), prefix));
  mkdirSync(join(r, 'src', 'lib', 'rechtsprechung'), { recursive: true });
  roots.push(r);
  return r;
}
afterEach(() => { while (roots.length) rmSync(roots.pop()!, { recursive: true, force: true }); delete process.env.LEXMETRIK_ERLAUBE_ABGANG; });

function korpus(n: number): EntscheidSnapshot[] {
  const out: EntscheidSnapshot[] = [];
  for (let i = 0; i < n; i++) out.push(bge(`150 III ${i}`));
  return out;
}

describe('schreibeKorpus — Bestandszahl-Sperre gegen stillen Abgang', () => {
  it('wirft, wenn die neue Eingabe > 5 % unter den committeten Bestand fällt', () => {
    const root = neuerRoot('lexm-sperre-');
    schreibeKorpus(korpus(20), '2026-01-01', root);
    // 2/20 = 10 % Abgang, simuliert einen fehlenden Shard (physisch gelöscht, Register
    // NICHT angepasst) — genau der #691-Reproduktionsweg über ladeBestandSnapshots.
    const manifest = JSON.parse(
      readFileSync(join(root, 'public', 'rechtsprechung', 'register.json'), 'utf8'),
    ) as EntscheidManifest;
    for (const e of manifest.entscheide.slice(0, 2)) {
      unlinkSync(join(root, 'public', 'rechtsprechung', e.datei!));
    }
    const basis = ladeBestandSnapshots(root);
    expect(basis.length).toBe(18); // geladen, nicht abgebrochen — die Sperre sitzt im Writer
    expect(() => schreibeKorpus(basis, '2026-01-02', root)).toThrow(/Bestandszahl-Sperre/);
    // Der Bestand auf der Platte ist NACH dem Wurf noch der alte (rmSync lief nicht).
    const manifestNachher = JSON.parse(
      readFileSync(join(root, 'public', 'rechtsprechung', 'register.json'), 'utf8'),
    ) as EntscheidManifest;
    expect(manifestNachher.entscheide.length).toBe(20);
  });

  it('lässt einen Abgang ≤ 5 % durch (normales additives Rauschen)', () => {
    const root = neuerRoot('lexm-sperre-toleranz-');
    schreibeKorpus(korpus(40), '2026-01-01', root);
    const voll = korpus(40);
    const res = schreibeKorpus(voll.slice(0, 39), '2026-01-02', root); // 1/40 = 2.5 %
    expect(res.anzahl).toBe(39);
  });

  it('erlaubt einen grösseren Abgang explizit über LEXMETRIK_ERLAUBE_ABGANG=1', () => {
    const root = neuerRoot('lexm-sperre-flag-');
    schreibeKorpus(korpus(20), '2026-01-01', root);
    process.env.LEXMETRIK_ERLAUBE_ABGANG = '1';
    const res = schreibeKorpus(korpus(20).slice(0, 10), '2026-01-02', root);
    expect(res.anzahl).toBe(10);
  });

  it('meldet den Abgang samt betroffenen Keys, bevor sie geworfen wird', () => {
    const root = neuerRoot('lexm-sperre-abgang-');
    schreibeKorpus(korpus(20), '2026-01-01', root);
    const manifest = JSON.parse(
      readFileSync(join(root, 'public', 'rechtsprechung', 'register.json'), 'utf8'),
    ) as EntscheidManifest;
    for (const e of manifest.entscheide.slice(0, 5)) {
      unlinkSync(join(root, 'public', 'rechtsprechung', e.datei!));
    }
    const basis = ladeBestandSnapshots(root);
    try {
      schreibeKorpus(basis, '2026-01-02', root);
      expect.fail('hätte werfen müssen');
    } catch (err) {
      expect((err as Error).message).toMatch(/15 < \d+ \(95% von 20/);
    }
  });

  it('unbeschriebene Wurzel (kein vorheriges register.json) — Sperre greift nicht', () => {
    const root = neuerRoot('lexm-sperre-frisch-');
    const res = schreibeKorpus(korpus(1), '2026-01-01', root);
    expect(res.anzahl).toBe(1);
  });
});

describe('ladeBestandSnapshots — fehlende Dateien werden gemeldet, nicht stumm übersprungen', () => {
  it('zählt und meldet fehlende Register-Dateien statt sie zu verschweigen', () => {
    const root = neuerRoot('lexm-lade-melden-');
    schreibeKorpus(korpus(5), '2026-01-01', root);
    const manifest = JSON.parse(
      readFileSync(join(root, 'public', 'rechtsprechung', 'register.json'), 'utf8'),
    ) as EntscheidManifest;
    unlinkSync(join(root, 'public', 'rechtsprechung', manifest.entscheide[0].datei!));

    const fehlerZeilen: string[] = [];
    const orig = console.error;
    console.error = (...args: unknown[]) => { fehlerZeilen.push(String(args[0])); };
    try {
      const basis = ladeBestandSnapshots(root);
      expect(basis.length).toBe(4);
    } finally {
      console.error = orig;
    }
    expect(fehlerZeilen.some((z) => z.includes('fehlen auf der Platte'))).toBe(true);
    expect(fehlerZeilen.some((z) => z.includes(manifest.entscheide[0].key))).toBe(true);
  });

  it('resolviert eine relative root absolut (kein cwd-fail-open)', () => {
    const root = neuerRoot('lexm-lade-relativ-');
    schreibeKorpus(korpus(3), '2026-01-01', root);
    const relativ = relative(process.cwd(), root); // z.B. '../../../../var/folders/…'
    const basis = ladeBestandSnapshots(relativ);
    expect(basis.length).toBe(3);
  });
});
