import { describe, it, expect } from 'vitest';
import {
  parseRssItems,
  kurzEli,
  ccAusTaskUri,
  inkraftDatum,
  bewerteStalePending,
  holeFeed,
  erhebe,
  type AsPosten,
} from '../../scripts/fedlex-rss-oc-pruefen';
import { lesePinsVoll, type PinVoll } from '../../scripts/fedlex-pins';
import { istRisikoPfad } from '../../scripts/gegenpruefung/kern';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const FEED_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Fedlex OC</title>
    <item>
      <title>Verordnung über die Sonderchemie (SonderChemV) &amp; Anhang. Änderung</title>
      <description>irrelevant</description>
      <pubDate>Thu, 16 Jul 2026 10:28:14 GMT</pubDate>
      <link>https://fedlex.data.admin.ch/eli/oc/2099/900</link>
      <guid isPermaLink="false">https://fedlex.data.admin.ch/eli/oc/2099/900</guid>
    </item>
    <item>
      <title>Bundesbeschluss ohne ELI-Bezug</title>
      <pubDate>Thu, 16 Jul 2026 10:22:36 GMT</pubDate>
      <link>https://example.org/kein-eli</link>
      <guid isPermaLink="false">https://example.org/kein-eli</guid>
    </item>
  </channel>
</rss>`;

const pin = (p: Partial<PinVoll>): PinVoll => ({
  name: 'testerlass',
  eli: 'cc/9/900',
  kons: '2026-01-01',
  konsKompakt: '20260101',
  n: 0,
  anker: [],
  sr: '999.9',
  ...p,
});

const posten = (p: Partial<AsPosten>): AsPosten => ({
  eli: 'oc/2026/900',
  titel: 'Test-Änderung',
  inkraft: '2026-07-01',
  ccs: ['cc/9/900'],
  ...p,
});

// ─── Reine Helfer ────────────────────────────────────────────────────────────

describe('parseRssItems', () => {
  it('liest oc-ELI + Titel, entschärft Entities, ignoriert Nicht-eli-Items', () => {
    const items = parseRssItems(FEED_XML);
    expect(items).toHaveLength(1);
    expect(items[0].eli).toBe('oc/2099/900');
    expect(items[0].titel).toBe('Verordnung über die Sonderchemie (SonderChemV) & Anhang. Änderung');
  });
});

describe('kurzEli', () => {
  it('strippt Host + /eli/, entfernt Trailing-Slash', () => {
    expect(kurzEli('https://fedlex.data.admin.ch/eli/oc/2026/394')).toBe('oc/2026/394');
    expect(kurzEli('https://fedlex.data.admin.ch/eli/cc/2005/478/')).toBe('cc/2005/478');
    expect(kurzEli('https://example.org/foo')).toBeNull();
  });
});

describe('ccAusTaskUri', () => {
  it('parst den cc-Erlass aus der PublicationTask-URI (auch alte Unterstrich-ELIs)', () => {
    expect(ccAusTaskUri('https://fedlex.data.admin.ch/eli/pudocc/cc/2005/478/20260716/1/task')).toBe('cc/2005/478');
    expect(ccAusTaskUri('https://fedlex.data.admin.ch/eli/pudocc/cc/63/1377_1378_1381/20260612/2/task')).toBe(
      'cc/63/1377_1378_1381',
    );
    expect(ccAusTaskUri('https://fedlex.data.admin.ch/eli/oc/2026/394')).toBeNull();
  });
});

describe('inkraftDatum', () => {
  it('nimmt das JÜNGSTE Datum ≤ heute (neueste geltende Stufe = am ehesten unkonsolidiert)', () => {
    expect(inkraftDatum(['2026-06-01', '2026-07-01', '2027-01-01'], '2026-07-18')).toBe('2026-07-01');
  });
  it('Ein-Datum-Akt (Normalfall) → dieses Datum', () => {
    expect(inkraftDatum(['2026-07-16'], '2026-07-18')).toBe('2026-07-16');
  });
  it('ohne Datum ≤ heute → frühestes künftiges (wird von Bedingung 1 verworfen)', () => {
    expect(inkraftDatum(['2027-01-01', '2028-01-01'], '2026-07-18')).toBe('2027-01-01');
  });
  it('leer/undefined → null', () => {
    expect(inkraftDatum([], '2026-07-18')).toBeNull();
    expect(inkraftDatum(undefined, '2026-07-18')).toBeNull();
  });
});

// ─── Kern-Entscheidlogik (bewerteStalePending) ───────────────────────────────

const heute = '2026-07-18';

describe('bewerteStalePending', () => {
  it('TRIFFT: AS in Kraft, Pin älter, keine deckende Konsolidierung → STALE-PENDING', () => {
    const b = bewerteStalePending(
      [posten({ inkraft: '2026-07-01' })],
      [pin({ kons: '2026-01-01' })],
      new Map([['cc/9/900', ['2025-06-01', '2026-01-01']]]), // max < AS-Datum
      heute,
    );
    expect(b).toHaveLength(1);
    expect(b[0]).toMatchObject({ sr: '999.9', asEli: 'oc/2026/900', inkraft: '2026-07-01', pinKons: '2026-01-01' });
  });

  it('TRIFFT-NICHT: deckende Konsolidierung ≥ AS-Datum liegt vor (Pin nur überholt → check:fedlex-versionen)', () => {
    const b = bewerteStalePending(
      [posten({ inkraft: '2026-07-01' })],
      [pin({ kons: '2026-01-01' })],
      new Map([['cc/9/900', ['2026-01-01', '2026-07-01']]]), // deckt AS-Datum
      heute,
    );
    expect(b).toHaveLength(0);
  });

  it('TRIFFT-NICHT: Pin-Konsolidierung == AS-Inkraft-Datum (nicht ÄLTER)', () => {
    const b = bewerteStalePending(
      [posten({ inkraft: '2026-07-01' })],
      [pin({ kons: '2026-07-01' })],
      new Map([['cc/9/900', ['2026-07-01']]]),
      heute,
    );
    expect(b).toHaveLength(0);
  });

  it('KÜNFTIG: AS-Inkraft-Datum > heute → keine WARN', () => {
    const b = bewerteStalePending(
      [posten({ inkraft: '2026-12-01' })],
      [pin({ kons: '2026-01-01' })],
      new Map([['cc/9/900', ['2026-01-01']]]),
      heute,
    );
    expect(b).toHaveLength(0);
  });

  it('TRIFFT-NICHT: geänderter cc ist nicht gepinnt', () => {
    const b = bewerteStalePending(
      [posten({ ccs: ['cc/9/fremd'] })],
      [pin({ eli: 'cc/9/900' })],
      new Map(),
      heute,
    );
    expect(b).toHaveLength(0);
  });

  it('Determinismus: zweimal identisch, Reihenfolge stabil (sortiert nach SR/asEli)', () => {
    const pins = [pin({ eli: 'cc/9/900', sr: '999.9' }), pin({ name: 'zweit', eli: 'cc/9/901', sr: '111.1' })];
    const kons = new Map([
      ['cc/9/900', ['2026-01-01']],
      ['cc/9/901', ['2026-01-01']],
    ]);
    const eingabe = [
      posten({ eli: 'oc/2026/900', ccs: ['cc/9/900'], inkraft: '2026-07-01' }),
      posten({ eli: 'oc/2026/901', ccs: ['cc/9/901'], inkraft: '2026-07-01' }),
    ];
    const a = bewerteStalePending(eingabe, pins, kons, heute);
    const b = bewerteStalePending([...eingabe].reverse(), pins, kons, heute);
    expect(a).toEqual(b);
    expect(a.map((x) => x.sr)).toEqual(['111.1', '999.9']); // stabil sortiert
  });
});

// ─── Fehlerpfad: Feed-Beschaffung + Shell-Riegel ─────────────────────────────

function fakeResponse(body: string, contentType: string, ok = true, status = 200): Response {
  return {
    ok,
    status,
    headers: { get: (k: string) => (k.toLowerCase() === 'content-type' ? contentType : null) },
    text: async () => body,
    json: async () => JSON.parse(body),
  } as unknown as Response;
}

describe('holeFeed — Content-Type-/Shell-Riegel (Fakt 3)', () => {
  it('gültiges XML → durchgereicht', async () => {
    const feed = await holeFeed((async () => fakeResponse(FEED_XML, 'application/xml;charset=UTF-8')) as typeof fetch);
    expect(feed).toContain('<item>');
  });
  it('Angular-Shell (text/html, HTTP 200) → Fehler statt Durchgehen', async () => {
    const shell = '<!doctype html>\n<html><head><title>Fedlex</title></head></html>';
    await expect(
      holeFeed((async () => fakeResponse(shell, 'text/html;charset=UTF-8')) as typeof fetch),
    ).rejects.toThrow(/HTML\/Angular-Shell/);
  });
  it('HTTP-Fehler → Fehler', async () => {
    await expect(
      holeFeed((async () => fakeResponse('', 'application/xml', false, 503)) as typeof fetch),
    ).rejects.toThrow(/503/);
  });
  it('XML ohne <rss>/<item> → Fehler (Format geändert)', async () => {
    await expect(
      holeFeed((async () => fakeResponse('<foo/>', 'application/xml')) as typeof fetch),
    ).rejects.toThrow(/ohne <rss>/);
  });
});

// ─── End-to-End-Verdrahtung mit voll gemocktem Netz (Effizienz-Beweis) ───────
// Konstruiertes Fixture gegen einen ECHTEN gepinnten cc-Erlass: heute weit in der
// Zukunft (2099), damit jede reale Pin-Konsolidierung < AS-Inkraft ist — der Beweis
// hängt NICHT an einem konkreten Pin-Datum (repin-robust). Die gemockte SPARQL-
// Antwort enthält bewusst KEINE deckende Konsolidierung → STALE-PENDING muss feuern.

describe('erhebe — volle Netz-Verdrahtung, konstruierter STALE-PENDING gegen echten Pin', () => {
  const echterPin = lesePinsVoll().find((p) => p.eli.startsWith('cc/'))!;
  const heuteZukunft = '2099-06-01';
  const asEli = 'oc/2099/900';

  const feedZukunft = FEED_XML.replace('oc/2099/900', asEli).replace('oc/2099/900', asEli);

  const fakeFetch = (async (url: string, init?: RequestInit) => {
    if (typeof url === 'string' && url.includes('rss-oc')) {
      return fakeResponse(feedZukunft, 'application/xml;charset=UTF-8');
    }
    // SPARQL: nach Query-Inhalt unterscheiden
    const body = decodeURIComponent(String(init?.body ?? '')).replace(/\+/g, ' ');
    let bindings: Array<Record<string, { value: string }>> = [];
    if (body.includes('dateEntryInForce')) {
      bindings = [{ oc: { value: `https://fedlex.data.admin.ch/eli/${asEli}` }, date: { value: '2099-01-01T00:00:00' } }];
    } else if (body.includes('actToTakeIntoAccount')) {
      bindings = [
        {
          oc: { value: `https://fedlex.data.admin.ch/eli/${asEli}` },
          task: { value: `https://fedlex.data.admin.ch/eli/pudocc/${echterPin.eli}/20990101/1/task` },
        },
      ];
    } else if (body.includes('dateApplicability')) {
      // bewusst nur ALTE Konsolidierungen — keine deckt 2099-01-01 ab
      bindings = [{ cc: { value: `https://fedlex.data.admin.ch/eli/${echterPin.eli}` }, date: { value: '2026-01-01T00:00:00' } }];
    }
    return fakeResponse(JSON.stringify({ results: { bindings } }), 'application/sparql-results+json');
  }) as unknown as typeof fetch;

  it('parst Feed → löst Inkraft + cc auf → meldet STALE-PENDING', async () => {
    const { posten: p, befunde, getroffenePins } = await erhebe(heuteZukunft, fakeFetch);
    expect(p).toHaveLength(1);
    expect(p[0].inkraft).toBe('2099-01-01');
    expect(p[0].ccs).toEqual([echterPin.eli]);
    expect(getroffenePins).toBe(1);
    expect(befunde).toHaveLength(1);
    expect(befunde[0]).toMatchObject({ asEli, ccEli: echterPin.eli, inkraft: '2099-01-01' });
  });
});

// ─── Risikopfad-Anker (Gegenprüfungs-Tor greift auf dieser Datei) ────────────

describe('Risikopfad', () => {
  it('scripts/fedlex-rss-oc-pruefen.ts ist Risikopfad', () => {
    expect(istRisikoPfad('scripts/fedlex-rss-oc-pruefen.ts')).toBe(true);
  });
});
