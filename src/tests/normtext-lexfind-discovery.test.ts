/**
 * Tests für die reine LexFind-Discovery-Klassifikation (kein FS/Netz — §2).
 */

import { describe, it, expect } from 'vitest';
import {
  klassifiziereQuelle,
  tierVerteilung,
  enumeriereKanton,
  LEXFIND_ENTITY,
  type EntdeckterErlass,
} from '../../scripts/normtext/lexfind-discovery.ts';

describe('klassifiziereQuelle', () => {
  it('erkennt einen clex-Strukturhost als Tier A und leitet host/lang/lawId ab', () => {
    const k = klassifiziereQuelle('https://ar.clex.ch/data/146.1/de');
    expect(k.tier).toBe('A-struktur');
    expect(k.struktur).toEqual({ host: 'ar.clex.ch', lang: 'de', lawId: '146.1' });
  });

  it('erkennt die /app/{lang}/texts_of_law/-Form als Tier A mit Bausteinen', () => {
    const k = klassifiziereQuelle('https://ar.clex.ch/app/de/texts_of_law/146.1');
    expect(k.tier).toBe('A-struktur');
    expect(k.struktur).toEqual({ host: 'ar.clex.ch', lang: 'de', lawId: '146.1' });
  });

  it('ist host-AGNOSTISCH: erkennt alle LexWork-Hosts an der Pfad-Signatur (Bug K2/K3)', () => {
    // Hosts, die eine frühere Whitelist verfehlt hätte (bgs.so.ch, gesetze.nw.ch,
    // www.belex.sites.be.ch mit www-Präfix, …) — jetzt über die Pfad-Signatur.
    for (const url of [
      'https://bgs.so.ch/app/de/texts_of_law/614.11',
      'https://gesetze.nw.ch/app/de/texts_of_law/261.2',
      'https://gesetzessammlungen.ag.ch/app/de/texts_of_law/291.150',
      'https://www.belex.sites.be.ch/app/de/texts_of_law/161.12',
      'https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/211.110',
      'https://srl.lu.ch/data/40/de',
      'https://lex.vs.ch/data/170.1/fr',
    ]) {
      expect(klassifiziereQuelle(url).tier).toBe('A-struktur');
      expect(klassifiziereQuelle(url).struktur).toBeDefined();
    }
  });

  it('dekodiert URL-kodierte Systematiknummern im lawId (Bug M1)', () => {
    const k = klassifiziereQuelle('https://gesetze.gl.ch/app/de/texts_of_law/III%20B%2F7%2F1');
    expect(k.struktur?.lawId).toBe('III B/7/1');
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

  it('matcht KEINEN fremden Nicht-.ch-Host als Strukturquelle (Vertrauensgrenze)', () => {
    expect(klassifiziereQuelle('https://evil.com/data/1/de').tier).not.toBe('A-struktur');
    expect(klassifiziereQuelle('https://attacker.org/app/de/texts_of_law/1').tier).not.toBe('A-struktur');
  });

  it('behandelt einen clex-PDF-Pfad NICHT als Tier-A-Struktur', () => {
    // /api/.../versions/N/pdf_file ist der PDF-Link, keine strukturierte Quelle.
    expect(klassifiziereQuelle('https://ar.clex.ch/api/de/versions/1547/pdf_file').tier).not.toBe('A-struktur');
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

describe('enumeriereKanton (Netz-Hülle, fetch injiziert)', () => {
  /** Antwort-Stub mit nur den genutzten Feldern. */
  const json = (body: unknown): Response =>
    ({ ok: true, status: 200, json: async () => body } as unknown as Response);

  it('übersteht einen ETIMEDOUT auf Seite 1 und paginiert vollständig (Crash-Regression GR)', async () => {
    // Reihenfolge: POST start → GET Seite1 (Timeout!) → GET Seite1 (ok, 2 Seiten)
    //              → GET Seite2 (ok). Der Timeout darf den Lauf NICHT killen.
    const calls: string[] = [];
    const fetchImpl = (async (_url: string, init?: RequestInit) => {
      const istPost = init?.method === 'POST';
      calls.push(istPost ? 'POST' : `GET#${calls.filter((c) => c.startsWith('GET')).length + 1}`);
      if (istPost) return json({ id: 1, session_id: 's' });
      const getNr = calls.filter((c) => c.startsWith('GET')).length;
      if (getNr === 1) throw new Error('ETIMEDOUT');
      if (getNr === 2) {
        return json({
          number_of_pages: 2,
          texts_of_law_with_matches: [
            { systematic_number: '146.1', is_active: true, dta_urls: [{ original_url: 'https://ar.clex.ch/data/146.1/de' }], matches: [{ title: 'A' }] },
          ],
        });
      }
      return json({
        number_of_pages: 2,
        texts_of_law_with_matches: [
          { systematic_number: '147.1', is_active: true, dta_urls: [{ original_url: 'https://ar.clex.ch/data/147.1/de' }], matches: [{ title: 'B' }] },
        ],
      });
    }) as unknown as typeof fetch;

    const erlasse = await enumeriereKanton('AR', {
      netz: { fetchImpl, warte: async () => {}, versuche: 3 },
    });

    expect(erlasse.map((e) => e.systematischeNummer)).toEqual(['146.1', '147.1']);
    expect(erlasse.every((e) => e.klassifikation.tier === 'A-struktur')).toBe(true);
    // POST + 1 Timeout-Versuch + Seite1-Erfolg + Seite2 = 4 fetch-Aufrufe
    expect(calls.length).toBe(4);
  });

  it('wirft bei unbekanntem Kanton (vor jedem Netz-Zugriff)', async () => {
    await expect(enumeriereKanton('XX')).rejects.toThrow(/unbekannter Kanton/);
  });
});
