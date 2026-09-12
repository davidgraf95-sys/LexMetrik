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
  it('wirft, wenn die neue Eingabe unter den committeten Bestand fällt (kein Prozent-Freibrief)', () => {
    const root = neuerRoot('lexm-sperre-');
    schreibeKorpus(korpus(20), '2026-01-01', root);
    // 2/20 fehlen, simuliert einen fehlenden Shard (physisch gelöscht, Register
    // NICHT angepasst) — genau der #691-Reproduktionsweg über ladeBestandSnapshots.
    // Analyse (Gegenprüfungs-Runde 2, PR #818): JEDER additive Aufrufer liefert bei
    // korrektem Ablauf eine Eingabe ≥ dem vorherigen Bestand — die Sperre lässt
    // darum GAR KEINEN unbegründeten Abgang durch, auch keinen kleinen.
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

  // Regressionstest Gegenprüfungs-Runde 2 (PR #818, Blocker): der Vergleich verglich
  // ursprünglich `auswahl.length` (rohe Snapshots) mit `altManifest.entscheide.length`
  // (Snapshots + abgeleitete `__voll`-Verweis-Einträge, die schreibeKorpus SELBST erst
  // aus genau dieser Eingabe erzeugt) — ein Snapshot mit `azaUrteil` +
  // `auszugAbschnitte` erzeugt GENAU EINEN zusätzlichen Verweis-Eintrag (Deep-Link-
  // Karte, Zeile ~333 ff.). Ein unveränderter Roundtrip derselben Eingabe feuerte
  // damit FÄLSCHLICH, weil das Register (mit Verweisen) grösser zählt als die
  // Eingabe (ohne Verweise) — bei einem vollständigen Bestand mit vielen aza-
  // Urteilen (Ist 12.9.2026: 5093 Snapshots + 1248 Verweise = 6341) hätte JEDER
  // additive Lauf die Sperre ausgelöst.
  it('feuert NICHT auf einem unveränderten Roundtrip, obwohl __voll-Verweis-Einträge das Register grösser zählen', () => {
    const root = neuerRoot('lexm-sperre-verweis-');
    const mitVoll = bge('150 III 1', {
      azaUrteil: { aktenzeichen: '1B_1/2026', key: 'bund/bger/1b_1_2026', quelleUrl: 'https://www.bger.ch/ext/x' },
      auszugAbschnitte: [{ typ: 'erwaegung', bloecke: [{ marke: null, text: 'auszug' }] }],
    });
    const ohneVoll = bge('150 III 2');
    const eingabe = [mitVoll, ohneVoll];

    const res1 = schreibeKorpus(eingabe, '2026-01-01', root);
    expect(res1.anzahl).toBe(3); // 2 Snapshots + 1 __voll-Verweis

    // Unveränderter additiver Roundtrip (wie ladeBestandSnapshots ihn liefern würde):
    // 2 Snapshots gegen ein Register mit 3 Einträgen — darf NICHT werfen.
    expect(() => schreibeKorpus(eingabe, '2026-01-02', root)).not.toThrow();
  });

  it('erlaubt einen Abgang explizit über LEXMETRIK_ERLAUBE_ABGANG=1', () => {
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
      expect((err as Error).message).toMatch(/15 < 20 \(100% von 20/);
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
