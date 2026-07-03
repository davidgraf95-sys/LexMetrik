import { describe, it, expect } from 'vitest';
import {
  verarbeiteKanten,
  aggregiere,
  serialisiereShard,
  baueShardObjekt,
  projiziereRegister,
  SHARD_BYTE_LIMIT,
  type NormRefRow,
  type KorpusInfo,
  type DokMeta,
} from '../../scripts/materialien/soft-law-projektion';
import { wortfeldTreffer, blendeKommentareAus, wortfeldImQuellcode } from '../../scripts/materialien/wortfeld';
import { braucheDowngrade } from '../../scripts/materialien/revisions-cutoff';
import type { BrowseMaterial } from '../lib/materialien/typen';

// E6a Stufe 1: reine Projektions-/Extractor-Funktionen (§2.7/§4). Kein Anfassen bestehender Tests.

function ref(p: Partial<NormRefRow>): NormRefRow {
  return {
    quelldok_id: 'DOK', erlass_key: 'DSG', artikel: '', zitat_key: 'zk', roh_zitat: 'rz',
    konfidenz: 'regex-hoch', quelle: 'amtlich', fundstelle: '', fundstelle_url: null,
    stand: '2025-01-01', abgerufen: '2026-07-03', ...p,
  };
}

const korpus: KorpusInfo = {
  erlassKeys: new Set(['DSG', 'DBG', 'MWSTG']),
  artikelSet(key) {
    if (key === 'DSG') return new Set(['5', '24']);
    if (key === 'DBG') return new Set(['65']);
    if (key === 'MWSTG') return new Set(['21']);
    return null;
  },
};

describe('Revisions-Cutoff (braucheDowngrade)', () => {
  it('DSG vor 2023-09-01 ⇒ Downgrade; danach nicht', () => {
    expect(braucheDowngrade('DSG', '5', '2022-10-09')).toBe(true);
    expect(braucheDowngrade('DSG', '5', '2024-01-01')).toBe(false);
  });
  it('MWSTG konservativ: JEDER Artikel vor 2025-01-01 ⇒ Downgrade', () => {
    expect(braucheDowngrade('MWSTG', '21', '2024-06-01')).toBe(true);
    expect(braucheDowngrade('MWSTG', '21', '2025-06-01')).toBe(false);
  });
  it('kein-cutoff (DBG) ⇒ nie Downgrade', () => {
    expect(braucheDowngrade('DBG', '65', '2000-01-01')).toBe(false);
  });
});

describe('verarbeiteKanten (Invariante §2.4)', () => {
  it('Cutoff-Downgrade DSG-Artikel vor revDSG ⇒ Erlass-Ebene', () => {
    const { proErlass, downgrades } = verarbeiteKanten([ref({ erlass_key: 'DSG', artikel: '5', stand: '2022-10-09' })], korpus);
    expect(proErlass.get('DSG')![0].artikel).toBe('');
    expect(downgrades[0].grund).toMatch(/Revisions-Cutoff/);
  });
  it('kein-cutoff (DBG) ⇒ artikelscharf bleibt', () => {
    const { proErlass, downgrades } = verarbeiteKanten([ref({ erlass_key: 'DBG', artikel: '65', stand: '2000-01-01' })], korpus);
    expect(proErlass.get('DBG')![0].artikel).toBe('65');
    expect(downgrades.length).toBe(0);
  });
  it('Artikel nicht im Korpus ⇒ Downgrade (Geister-Anker)', () => {
    const { proErlass, downgrades } = verarbeiteKanten([ref({ erlass_key: 'DSG', artikel: '99', stand: '2024-01-01' })], korpus);
    expect(proErlass.get('DSG')![0].artikel).toBe('');
    expect(downgrades[0].grund).toMatch(/nicht im Korpus/);
  });
  it('Nicht-Korpus-Erlass ⇒ NICHT projiziert', () => {
    const { proErlass, nichtProjiziert } = verarbeiteKanten([ref({ erlass_key: 'VBGOE', artikel: '', stand: '2024-01-01' })], korpus);
    expect(proErlass.size).toBe(0);
    expect(nichtProjiziert.length).toBe(1);
  });
  it('kein Volltext-Korpus (artikelSet=null) ⇒ Downgrade', () => {
    const leer: KorpusInfo = { erlassKeys: new Set(['DBG']), artikelSet: () => null };
    const { proErlass, downgrades } = verarbeiteKanten([ref({ erlass_key: 'DBG', artikel: '65', stand: '2024-01-01' })], leer);
    expect(proErlass.get('DBG')![0].artikel).toBe('');
    expect(downgrades[0].grund).toMatch(/kein Normtext-Korpus/);
  });
});

describe('aggregiere (Ziffern-Liste, Dedupe, Normalisierung)', () => {
  it('gleiche (dok,artikel,quelle,konfidenz,stand) ⇒ eine Kante, Ziffern gesammelt + dedupe + sortiert', () => {
    const kanten = [
      ref({ artikel: '24', fundstelle: 'Ziff. 6.10', fundstelle_url: '#a' }),
      ref({ artikel: '24', fundstelle: 'Ziff. 1.2', fundstelle_url: '#b' }),
      ref({ artikel: '24', fundstelle: 'Ziff. 6.10', fundstelle_url: '#a' }), // Dublette
    ];
    const agg = aggregiere(kanten);
    expect(agg.length).toBe(1);
    expect(agg[0].artikel).toBe('24');
    expect(agg[0].fundstellen.map((f) => f.z)).toEqual(['Ziff. 1.2', 'Ziff. 6.10']);
  });
  it('Erlass-Ebene (artikel="") ⇒ Feld artikel WEGGELASSEN', () => {
    const agg = aggregiere([ref({ artikel: '' })]);
    expect(agg[0].artikel).toBeUndefined();
    expect('artikel' in agg[0]).toBe(false);
  });
  it('fundstelle="" ⇒ keine fundstellen-Einträge', () => {
    const agg = aggregiere([ref({ artikel: '24', fundstelle: '', fundstelle_url: null })]);
    expect(agg[0].fundstellen).toEqual([]);
  });
  it('fundstelle_url=null ⇒ url weggelassen', () => {
    const agg = aggregiere([ref({ artikel: '24', fundstelle: 'Ziff. 3', fundstelle_url: null })]);
    expect(agg[0].fundstellen[0]).toEqual({ z: 'Ziff. 3' });
    expect('url' in agg[0].fundstellen[0]).toBe(false);
  });
});

describe('serialisiereShard (Bucket-Split §0/B5)', () => {
  const dokMeta = new Map<string, DokMeta>([['DOK', { urlBasis: 'https://x/1', stand: '2025-01-01' }]]);

  it('unter Budget ⇒ EINE Datei <KEY>.json mit kanten', () => {
    const shard = baueShardObjekt('2026-07-03', 'DSG', aggregiere([ref({ artikel: '5' })]), dokMeta);
    const dateien = serialisiereShard(shard);
    expect(dateien.length).toBe(1);
    expect(dateien[0].pfad).toBe('DSG.json');
    expect(JSON.parse(dateien[0].inhalt).kanten.length).toBe(1);
  });

  it('über Budget ⇒ Kopf + Buckets; jede Datei ≤ Budget; Kanten vollständig; deterministisch', () => {
    // Viele Kanten (distinkte Artikel, lange URLs) → Roh-Shard > 300 KB; EIN Dokument ⇒ Kopf klein.
    const kanten = aggregiere(
      Array.from({ length: 4000 }, (_, i) =>
        ref({ quelldok_id: 'DOK', artikel: String(i), fundstelle: `Ziff. ${i}`, fundstelle_url: '#' + 'x'.repeat(60) + i }),
      ),
    );
    const meta = new Map<string, DokMeta>([['DOK', { urlBasis: 'https://x/DOK', stand: '2025-01-01' }]]);
    const shard = baueShardObjekt('2026-07-03', 'DSG', kanten, meta);
    const dateien = serialisiereShard(shard);
    expect(dateien.length).toBeGreaterThan(1);
    const kopf = JSON.parse(dateien[0].inhalt);
    expect(dateien[0].pfad).toBe('DSG.json');
    expect(kopf.buckets.length).toBe(dateien.length - 1);
    expect(kopf.kanten).toBeUndefined();
    let summe = 0;
    for (const d of dateien) {
      expect(Buffer.byteLength(d.inhalt, 'utf8')).toBeLessThanOrEqual(SHARD_BYTE_LIMIT);
      if (d.pfad !== 'DSG.json') summe += JSON.parse(d.inhalt).kanten.length;
    }
    expect(summe).toBe(kanten.length);
    expect(JSON.stringify(serialisiereShard(shard))).toBe(JSON.stringify(dateien)); // deterministisch
  });
});

describe('projiziereRegister (Merge-Modell + Determinismus)', () => {
  const dbDoc: BrowseMaterial = {
    key: 'ESTV-MWST-MI-99', behoerde: 'ESTV', behoerdeName: 'Eidgenössische Steuerverwaltung', behoerdeKuerzel: 'ESTV',
    doktyp: 'mwst-info', doktypLabel: 'MWST-Info', titel: 'DB-Dok', nummer: null, rechtsgebiet: 'sozial-abgaben',
    sprache: 'de', status: 'nur-live-link', quelleUrl: 'https://x', stand: '2025-01-01', rang: 999, normKeys: [], hinweis: null, sha: 'x',
  };
  it('nur kuratiert (kein DB) ⇒ gleich baueMaterialManifest; deterministisch', () => {
    const a = projiziereRegister('2026-07-03');
    const b = projiziereRegister('2026-07-03');
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.materialien.length).toBeGreaterThan(0);
  });
  it('kuratiert + DB-Dokument ⇒ zusammengeführt + sortiert', () => {
    const merged = projiziereRegister('2026-07-03', [dbDoc]);
    const nurKuratiert = projiziereRegister('2026-07-03');
    expect(merged.materialien.length).toBe(nurKuratiert.materialien.length + 1);
    expect(merged.materialien.some((m) => m.key === 'ESTV-MWST-MI-99')).toBe(true);
  });
});

describe('Wortfeld-Extractor (§0/A7 inkl. Negations-Erlaubnis)', () => {
  it('affirmativ ⇒ Treffer', () => {
    expect(wortfeldTreffer('Der Wert ist geprüft.').length).toBe(1);
    expect(wortfeldTreffer('fachlich verifiziert').length).toBe(1);
  });
  it('Negationen ⇒ erlaubt (kein Treffer)', () => {
    expect(wortfeldTreffer('fachlich noch nicht geprüft.')).toEqual([]);
    expect(wortfeldTreffer('nicht geprüft')).toEqual([]);
    expect(wortfeldTreffer('ungeprüft')).toEqual([]);
    expect(wortfeldTreffer('unverifiziert')).toEqual([]);
  });
  it('Zeilenumbruch zwischen «nicht» und «geprüft» (MaterialLeser-Fall) ⇒ erlaubt', () => {
    expect(wortfeldTreffer('Maschinell erfasst, fachlich noch nicht\n          geprüft.')).toEqual([]);
  });
  it('Kommentare werden NICHT geprüft', () => {
    expect(wortfeldImQuellcode('// alles geprüft und verifiziert\nconst x = 1;')).toEqual([]);
    expect(wortfeldImQuellcode('/* geprüft */ const y = 2;')).toEqual([]);
  });
  it('String-Literal mit affirmativem Wortfeld ⇒ Treffer (fail-closed)', () => {
    expect(wortfeldImQuellcode('const t = "amtlich geprüft";').length).toBe(1);
  });
  it('blendeKommentareAus lässt URL mit // im String intakt', () => {
    const src = 'const u = "https://x/geprüft";';
    expect(blendeKommentareAus(src)).toContain('https://x/geprüft');
  });
});
