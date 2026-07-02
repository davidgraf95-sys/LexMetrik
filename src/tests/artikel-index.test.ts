import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  baueArtikelIndex, kanonZitat, schreibeKorpus,
} from '../../scripts/normtext/entscheide-schreiben';
import { normKeyFuerAbk } from '../../scripts/normtext/entscheide-mapping';
import type { EntscheidSnapshot } from '../lib/rechtsprechung/typen';
import type { NormEntscheidIndex } from '../lib/rechtsprechung/norm-index';

// W3 — Artikel-Ebene des Norm→Entscheid-Index. Getestet: Artikel-Bucket-Build,
// die TOPISCH gebundene In-degree-Rangfolge (nicht global!), abbrev→Register-key,
// und dass die bestehende Erlass-Ebene (proNorm) unverändert weiterläuft.

// ── Snapshot-Fabrik (nur die für den Artikel-Index relevanten Felder variabel) ──
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
  };
}

/** BGE-Fall: id/nummer/bgeReferenz aus der Fundstelle, Fabrik-Defaults sonst. */
function bge(fundstelle: string, over: Partial<EntscheidSnapshot> = {}): EntscheidSnapshot {
  const slug = fundstelle.replace(/\s+/g, '_');
  return snap({ id: `bund/bge/${slug}`, gericht: 'bge', bgeReferenz: fundstelle, nummer: fundstelle, zitierung: `BGE ${fundstelle}`, ...over });
}

describe('abbrev → Register-key (bestehender Helfer, keine Neuerfindung)', () => {
  it('mappt bekannte Abkürzungen; Unbekanntes → null (wird verworfen)', () => {
    expect(normKeyFuerAbk('OR')).toBe('OR');
    expect(normKeyFuerAbk('or')).toBe('OR');
    expect(normKeyFuerAbk('StGB')).toBe('STGB');
    expect(normKeyFuerAbk('KV/SH')).toBeNull();   // kantonal, nicht registriert → Drop
    expect(normKeyFuerAbk('GIBTSNICHT')).toBeNull();
  });
});

describe('kanonZitat — beide Seiten auf dieselbe Normalform', () => {
  it('BGE mit/ohne Präfix', () => {
    expect(kanonZitat('BGE 150 I 17')).toBe('BGE:150:I:17');
    expect(kanonZitat('150 I 17')).toBe('BGE:150:I:17');
  });
  it('historische Abteilung «Ia»/«Va» — beide Seiten treffen sich (Bug-Check W3)', () => {
    // Selbst-Identität (ohne Präfix) und Zitat (mit Präfix) → dieselbe Normalform.
    expect(kanonZitat('120 Ia 31')).toBe('BGE:120:IA:31');
    expect(kanonZitat('BGE 120 Ia 31')).toBe('BGE:120:IA:31');
  });
  it('aza-Aktenzeichen in mehreren Schreibweisen', () => {
    expect(kanonZitat('1C_641/2022')).toBe('AZA:1C:641:2022');
    expect(kanonZitat('1P.179/1994')).toBe('AZA:1P:179:1994');
    expect(kanonZitat('5A 33/2004')).toBe('AZA:5A:33:2004');
  });
  it('nicht abgleichbares → null', () => {
    expect(kanonZitat('irgendwas')).toBeNull();
  });
});

describe('baueArtikelIndex — Bucket-Build + topische In-degree', () => {
  // S_{OR/41} = {A, B, C}. Zitierungen: A→B, A→C, B→C. D zitiert C, gehört aber
  // zu OR/99 (NICHT zu OR/41). E zitiert OR/41 UND C, ist aber kantonal.
  const A = bge('150 III 1', { zitierteNormen: ['Art. 41 OR'], zitierteEntscheide: ['BGE 150 III 2', 'BGE 150 III 3'] });
  const B = bge('150 III 2', { zitierteNormen: ['Art. 41 Abs. 1 OR'], zitierteEntscheide: ['BGE 150 III 3'] });
  const C = bge('150 III 3', { zitierteNormen: ['Art. 41 OR'], zitierteEntscheide: [] });
  const D = bge('150 III 4', { zitierteNormen: ['Art. 99 OR'], zitierteEntscheide: ['BGE 150 III 3'] });
  const E = snap({
    id: 'kanton/ZH/zh_obergericht/LB123', gericht: 'zh_obergericht', gerichtstyp: 'kantonal', kanton: 'ZH',
    nummer: 'LB123', zitierteNormen: ['Art. 41 OR'], zitierteEntscheide: ['BGE 150 III 3'],
  });
  const idx = baueArtikelIndex([A, B, C, D, E]);

  it('bildet den Artikel-Bucket OR/41 aus den zitierten statutes', () => {
    expect(idx['OR/41']).toBeDefined();
    expect(idx['OR/41'].map((r) => r.key).sort()).toEqual(['bge_150_III_1', 'bge_150_III_2', 'bge_150_III_3']);
  });

  it('rangiert nach topischer In-degree: mehr gleichartikel-Zitierungen → höher', () => {
    // C von A und B genannt = gewicht 2; B von A = 1; A = 0.
    expect(idx['OR/41'].map((r) => [r.key, r.gewicht])).toEqual([
      ['bge_150_III_3', 2],
      ['bge_150_III_2', 1],
      ['bge_150_III_1', 0],
    ]);
  });

  it('topisch gebunden: D zitiert C, zählt aber NICHT für OR/41 (D ist OR/99)', () => {
    // Globale In-degree von C wäre 3 (A,B,D); topisch für OR/41 nur 2.
    const c = idx['OR/41'].find((r) => r.key === 'bge_150_III_3')!;
    expect(c.gewicht).toBe(2);
    expect(idx['OR/99'].map((r) => r.key)).toEqual(['bge_150_III_4']);
  });

  it('nur Bundesgericht im Bucket: kantonaler Fall E fehlt und zählt nicht', () => {
    expect(idx['OR/41'].some((r) => r.key.startsWith('zh_'))).toBe(false);
  });

  it('nicht-registrierte Gesetze werden verworfen (kein Bucket)', () => {
    const k = bge('151 I 1', { zitierteNormen: ['Art. 27 KV/SH'] });
    expect(Object.keys(baueArtikelIndex([k]))).toEqual([]);
  });

  it('mehrdeutiges «StG» (föderal/kantonal) kommt NICHT in den Bund-Artikel-Index (OCL-aligned, Gegenprüfung W3)', () => {
    // «StG» = eidg. Stempelsteuergesetz ODER kant. Steuergesetz; pro Zitat nicht
    // trennbar (Suffix nur in der Regeste-Erstnennung). OCLs _SR_NUMBER_MAP lässt
    // StG bewusst weg → wir auch, sonst landen Kantons-Steuerfälle unter Bundesrecht.
    const k = bge('151 II 409', { zitierteNormen: ['Art. 14 StG'] });
    expect(Object.keys(baueArtikelIndex([k])).some((key) => key.startsWith('STG/'))).toBe(false);
  });
});

describe('baueArtikelIndex — aza-Nennung eines BGE-Urteils kreditiert den BGE', () => {
  // C trägt ein azaUrteil; F zitiert dieses aza-Az. → muss C (den BGE) treffen.
  const C = bge('152 IV 1', {
    zitierteNormen: ['Art. 12 StGB'], zitierteEntscheide: [],
    azaUrteil: { aktenzeichen: '6B_100/2025', key: 'bger_6B_100_2025', quelleUrl: 'https://x' },
  });
  const F = bge('152 IV 2', { zitierteNormen: ['Art. 12 StGB'], zitierteEntscheide: ['6B_100/2025'] });
  const idx = baueArtikelIndex([C, F]);

  it('aza-Zitat findet den BGE über selbstTokens', () => {
    const c = idx['STGB/12'].find((r) => r.key === 'bge_152_IV_1')!;
    expect(c.gewicht).toBe(1);
  });
});

describe('Erlass-Ebene (proNorm) bleibt unverändert; Artikel-Ebene additiv', () => {
  it('schreibeKorpus schreibt proNorm wie bisher UND proNormArtikel', () => {
    const root = mkdtempSync(join(tmpdir(), 'lexm-w3-'));
    mkdirSync(join(root, 'src', 'lib', 'rechtsprechung'), { recursive: true });
    try {
      // A trägt zusätzlich den mehrdeutigen normKey 'STG' → darf NICHT in proNorm landen (#12).
      const A = bge('150 III 1', { normKeys: ['OR', 'STG'], zitierteNormen: ['Art. 41 OR'], zitierteEntscheide: ['BGE 150 III 3'] });
      const C = bge('150 III 3', { normKeys: ['OR'], zitierteNormen: ['Art. 41 OR'] });
      const res = schreibeKorpus([A, C], '2026-07-02', root);
      const idx = JSON.parse(readFileSync(join(root, 'public', 'rechtsprechung', 'norm-index.json'), 'utf8')) as NormEntscheidIndex;

      // Erlass-Ebene: proNorm['OR'] enthält beide Fälle, Refs OHNE gewicht-Feld (unverändert).
      expect(idx.proNorm.OR.map((r) => r.key).sort()).toEqual(['bge_150_III_1', 'bge_150_III_3']);
      expect(idx.proNorm.OR.every((r) => !('gewicht' in r))).toBe(true);
      // Mehrdeutiges «StG» erlass-eben ausgeschlossen (OCL-aligned, #12).
      expect(idx.proNorm.STG).toBeUndefined();

      // Artikel-Ebene additiv vorhanden.
      expect(idx.proNormArtikel).toBeDefined();
      expect(idx.proNormArtikel!['OR/41'].map((r) => r.key)).toEqual(['bge_150_III_3', 'bge_150_III_1']);
      expect(idx.proNormArtikel!['OR/41'][0].gewicht).toBe(1);
      expect(res.artikelBuckets).toBe(1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
