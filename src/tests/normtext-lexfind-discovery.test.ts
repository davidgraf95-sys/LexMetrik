/**
 * Tests für die reine LexFind-Discovery-Klassifikation (kein FS/Netz — §2).
 */

import { describe, it, expect } from 'vitest';
import {
  klassifiziereQuelle,
  tierVerteilung,
  LEXFIND_ENTITY,
  type EntdeckterErlass,
} from '../../scripts/normtext/lexfind-discovery.ts';

describe('klassifiziereQuelle', () => {
  it('erkennt einen clex-Strukturhost als Tier A und leitet host/lang/lawId ab', () => {
    const k = klassifiziereQuelle('https://ar.clex.ch/data/146.1/de');
    expect(k.tier).toBe('A-struktur');
    expect(k.struktur).toEqual({ host: 'ar.clex.ch', lang: 'de', lawId: '146.1' });
  });

  it('erkennt die übrigen LexWork-Hosts als Tier A', () => {
    for (const url of [
      'https://www.gr-lex.gr.ch/data/170.100/de',
      'https://srl.lu.ch/data/40/de',
      'https://bdlf.fr.ch/data/10.1/fr',
      'https://lex.vs.ch/data/170.1/fr',
      'https://belex.sites.be.ch/data/161.1/de',
    ]) {
      expect(klassifiziereQuelle(url).tier).toBe('A-struktur');
    }
  });

  it('klassifiziert zhlex/m3.ti/silgeneve als PDF-embed (Tier C)', () => {
    expect(klassifiziereQuelle('https://www.zh.ch/de/.../erlass-700_11.html').tier).toBe('C-pdf-embed');
    expect(klassifiziereQuelle('https://m3.ti.ch/CRPP/pdfatto/atto/123').tier).toBe('C-pdf-embed');
    expect(klassifiziereQuelle('https://silgeneve.ch/legis/data/rsg_e2_05.htm').tier).toBe('C-pdf-embed');
  });

  it('liefert «unbekannt» bei fremdem Host oder kaputter URL', () => {
    expect(klassifiziereQuelle('https://example.com/foo').tier).toBe('unbekannt');
    expect(klassifiziereQuelle('keine-url').tier).toBe('unbekannt');
  });

  it('bleibt Tier A bei Strukturhost mit unerwartetem Pfad, aber ohne Bausteine', () => {
    const k = klassifiziereQuelle('https://ar.clex.ch/app/de/texts_of_law/146.1');
    expect(k.tier).toBe('A-struktur');
    expect(k.struktur).toBeUndefined();
  });
});

describe('tierVerteilung', () => {
  it('zählt die Tiers korrekt', () => {
    const e = (url: string): EntdeckterErlass => ({
      systematischeNummer: 'x', titel: '', inKraft: true, originalUrl: url,
      klassifikation: klassifiziereQuelle(url),
    });
    const v = tierVerteilung([
      e('https://ar.clex.ch/data/1/de'),
      e('https://ar.clex.ch/data/2/de'),
      e('https://www.zh.ch/x/erlass-1.html'),
      e('https://example.com/y'),
    ]);
    expect(v).toEqual({ 'A-struktur': 2, 'B-pdf': 0, 'C-pdf-embed': 1, unbekannt: 1 });
  });
});

describe('LEXFIND_ENTITY', () => {
  it('deckt alle 26 Kantone + Bund ab', () => {
    expect(Object.keys(LEXFIND_ENTITY)).toHaveLength(27);
    expect(LEXFIND_ENTITY.AR).toBe(3);
    expect(LEXFIND_ENTITY.CH).toBe(27);
  });
});
