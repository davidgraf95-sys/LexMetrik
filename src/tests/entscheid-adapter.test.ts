import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { normalisiereRegeste, kuerzeRegeste, bereinigeFliesstext } from '../lib/rechtsprechung/register';
import { filterEntscheide, nachDatum } from '../lib/rechtsprechung/browse';
import type { BrowseEntscheid } from '../lib/rechtsprechung/register';
import { sha256EntscheidBloecke } from '../../scripts/normtext/sha-entscheide';
import { citedRefZuId, mappeEntscheidOCL } from '../../scripts/normtext/adapter-entscheide';
import { statutesZuNormKeys, abteilungZuSachgebiet, legalAreaZuSachgebiet } from '../../scripts/normtext/entscheide-mapping';

const FIX = join(process.cwd(), 'src', 'tests', 'fixtures');
const lade = (f: string) => JSON.parse(readFileSync(join(FIX, f), 'utf8'));

describe('normalisiereRegeste', () => {
  it('wandelt <br> in Zeilenumbruch und strippt Markdown-Links', () => {
    expect(normalisiereRegeste('Regeste.<br>Art. 8 ZGB; vgl. [BGE 145 III 1](https://x/y).'))
      .toBe('Regeste.\nArt. 8 ZGB; vgl. BGE 145 III 1.');
  });
  it('kollabiert 3+ Leerzeilen und trimmt', () => {
    expect(normalisiereRegeste('A\n\n\n\nB\n')).toBe('A\n\nB');
  });
  it('schneidet das OCL-Rechtsgebiet-Suffix " | X" ab', () => {
    expect(normalisiereRegeste('Unfallversicherung (Kausalzusammenhang) | Unfallversicherung'))
      .toBe('Unfallversicherung (Kausalzusammenhang)');
  });
});

describe('bereinigeFliesstext', () => {
  it('strippt Markdown-Links + Zitat-Zeilenumbrüche, erhält echte Absätze', () => {
    const roh = 'Endentscheid (\nArt. 90 BGG\n) vgl.\n[BGE 137 III 47\nE. 1.2.2](https://mcp.opencaselaw.ch/entscheid/x).\n\nZweiter Absatz.';
    expect(bereinigeFliesstext(roh)).toBe('Endentscheid (Art. 90 BGG) vgl. BGE 137 III 47 E. 1.2.2.\n\nZweiter Absatz.');
  });
  it('lässt sauberen Text unverändert', () => {
    expect(bereinigeFliesstext('Ein klarer Satz.')).toBe('Ein klarer Satz.');
  });
  it('heilt Silbentrennung am Umbruch, erhält Komposita-Bindestrich', () => {
    expect(bereinigeFliesstext('wer-\nden')).toBe('werden');
    expect(bereinigeFliesstext('Justiz-\nund Verwaltungsrecht')).toBe('Justiz- und Verwaltungsrecht');
  });
  it('entfernt freistehende <URL>-Autolinks', () => {
    expect(bereinigeFliesstext('Quelle <https://www.gr.ch/x>.')).toBe('Quelle.');
  });
});

describe('kuerzeRegeste', () => {
  it('kappt mit Ellipse', () => {
    const t = kuerzeRegeste('x'.repeat(300), 50);
    expect(t.length).toBe(50);
    expect(t.endsWith('…')).toBe(true);
  });
});

describe('citedRefZuId', () => {
  it('mappt Docket-Aktenzeichen auf OCL-ID (Punkt + Slash)', () => {
    expect(citedRefZuId('4A_444/2022')).toBe('bger_4A_444_2022');
    expect(citedRefZuId('5A.33/2004')).toBe('bger_5A_33_2004');
  });
  it('gibt null für BGE/ATF-Refs (anderes Schema)', () => {
    expect(citedRefZuId('BGE 145 III 72')).toBeNull();
    expect(citedRefZuId('Quatsch')).toBeNull();
  });
});

describe('statutesZuNormKeys', () => {
  it('extrahiert das Gesetz aus der Norm-Nennung und mappt auf Register-key', () => {
    expect(statutesZuNormKeys(['Art. 32 Abs. 2 BGG', 'Art. 8 ZGB', 'Art. 41 OR'])).toEqual(['BGG', 'ZGB', 'OR']);
  });
  it('dedupliziert und ignoriert Unbekanntes', () => {
    expect(statutesZuNormKeys(['Art. 1 OR', 'Art. 2 OR', 'Art. 1 XYZ'])).toEqual(['OR']);
  });
});

describe('abteilung/legalArea → Sachgebiet (deklariert)', () => {
  it('Abteilungs-Präfix', () => {
    expect(abteilungZuSachgebiet('5A_1100/2025')).toBe('privat');
    expect(abteilungZuSachgebiet('6B_1/2024')).toBe('straf');
    expect(abteilungZuSachgebiet('2C_1/2024')).toBe('sozial-abgaben');
  });
  it('legal_area-Fragmente', () => {
    expect(legalAreaZuSachgebiet('Civil law')).toBe('privat');
    expect(legalAreaZuSachgebiet('criminal')).toBe('straf');
    expect(legalAreaZuSachgebiet(null)).toBeNull();
  });
});

describe('sha256EntscheidBloecke', () => {
  it('ist deterministisch und reagiert auf Textänderung', () => {
    const a = [{ typ: 'erwaegung' as const, bloecke: [{ marke: 'E. 1', text: 'Hallo' }] }];
    const b = [{ typ: 'erwaegung' as const, bloecke: [{ marke: 'E. 1', text: 'Hallo!' }] }];
    expect(sha256EntscheidBloecke(a)).toBe(sha256EntscheidBloecke(a));
    expect(sha256EntscheidBloecke(a)).not.toBe(sha256EntscheidBloecke(b));
  });
});

describe('mappeEntscheidOCL (echte Fixture)', () => {
  const det = lade('ocl-decision-5A_1100_2025.json');
  const str = lade('ocl-structure-5A_1100_2025.json');
  const snap = mappeEntscheidOCL(det, str, '2026-06-23')!;

  it('mappt Kernfelder korrekt', () => {
    expect(snap).toBeTruthy();
    expect(snap.id).toBe('bund/bger/5A_1100_2025');
    expect(snap.gericht).toBe('bger');
    expect(snap.kanton).toBe('CH');
    expect(snap.nummer).toBe('5A_1100/2025');
    expect(snap.sprache).toBe('fr');
    expect(snap.leitcharakter).toBe('leitentscheid'); // marked_for_publication
    expect(snap.bestand).toBe('snapshot');
    expect(snap.kuratierung).toBe('maschinell');
  });
  it('baut Abschnitte aus der amtlichen Gliederung', () => {
    const typen = snap.abschnitte.map((a) => a.typ);
    expect(typen).toContain('erwaegung');
    expect(snap.abschnitte.flatMap((a) => a.bloecke).length).toBeGreaterThan(0);
  });
  it('sha passt zu den Abschnitten', () => {
    expect(snap.sha).toBe(sha256EntscheidBloecke(snap.abschnitte));
  });
  it('parst cited_decisions (JSON-String) tolerant', () => {
    expect(Array.isArray(snap.zitierteEntscheide)).toBe(true);
    expect(snap.zitierteEntscheide.length).toBeGreaterThan(0);
  });
  it('hat vollständige Provenienz (§7)', () => {
    expect(snap.quelleUrl).toMatch(/^https?:\/\//);
    expect(snap.fassungsToken).toBeTruthy();
    expect(snap.abgerufen).toBe('2026-06-23');
  });
});

describe('filterEntscheide / nachDatum', () => {
  const liste = [
    { key: 'a', sachgebiet: 'privat', gericht: 'bger', kanton: 'CH', sprache: 'de', leitcharakter: 'leitentscheid', datum: '2025-01-01', nummer: '5A_1/2025', bgeReferenz: null, zitierung: 'BGer 5A_1/2025', regesteKurz: 'Mietrecht', normKeys: ['OR'] },
    { key: 'b', sachgebiet: 'straf', gericht: 'bger', kanton: 'CH', sprache: 'de', leitcharakter: 'routine', datum: '2026-01-01', nummer: '6B_2/2026', bgeReferenz: null, zitierung: 'BGer 6B_2/2026', regesteKurz: null, normKeys: ['STGB'] },
  ] as unknown as BrowseEntscheid[];

  it('filtert nach Sachgebiet', () => {
    expect(filterEntscheide(liste, { sachgebiet: 'straf' }).map((e) => e.key)).toEqual(['b']);
  });
  it('filtert nur Leitentscheide', () => {
    expect(filterEntscheide(liste, { nurLeitentscheide: true }).map((e) => e.key)).toEqual(['a']);
  });
  it('Volltext-Heuristik trifft Regeste/normKeys', () => {
    expect(filterEntscheide(liste, { q: 'miet' }).map((e) => e.key)).toEqual(['a']);
  });
  it('nachDatum sortiert neueste zuerst', () => {
    expect(nachDatum(liste).map((e) => e.key)).toEqual(['b', 'a']);
  });
});
