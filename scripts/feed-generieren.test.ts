// scripts/feed-generieren.test.ts
// QS-VERWENDEN V5 — Fixture mit 3 Erlassen → exakter erwarteter XML-String.
// Beweist: Filter (nur status 'snapshot' + gültiger stand), stabile Sortierung
// (Datum desc, dann Kürzel asc) und Determinismus (zwei Aufrufe → identisch).
import { describe, it, expect } from 'vitest';
import { baueFeedXml } from './feed-xml.ts';
import type { BrowseErlass } from '../src/lib/normtext/browse-typen.ts';

function erlass(teil: Partial<BrowseErlass> & Pick<BrowseErlass, 'key' | 'kuerzel' | 'titel' | 'stand'>): BrowseErlass {
  return {
    ebene: 'bund',
    kanton: null,
    sr: null,
    rechtsgebiet: 'privat',
    sprache: 'de',
    rang: 1,
    status: 'snapshot',
    datei: `bund/${teil.key}.json`,
    artikelAnzahl: 1,
    quelleUrl: 'https://example.invalid/',
    fassungsToken: '',
    pdfPfad: null,
    ...teil,
  };
}

const ALT = erlass({ key: 'ALT', kuerzel: 'ALT', titel: 'Altes Gesetz', stand: '2026-01-01', sr: '100' });
const NEU_B = erlass({ key: 'NEUB', kuerzel: 'NEU-B', titel: 'Neueres Gesetz B', stand: '2026-06-01' });
const NEU_A = erlass({ key: 'NEUA', kuerzel: 'NEU-A', titel: 'Neueres Gesetz A', stand: '2026-06-01' });
// wird gefiltert: kein Volltext (nur-live-link) — darf NICHT im Feed erscheinen
const AUSSEN_VOR = erlass({ key: 'AUSSEN', kuerzel: 'AUSSEN', titel: 'Ohne Volltext', stand: '2026-09-01', status: 'nur-live-link' });

const ERWARTET = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>https://lexmetrik.vercel.app/feed/erlasse.xml</id>
  <title>LexMetrik — geänderte Erlasse</title>
  <updated>2026-06-01T00:00:00Z</updated>
  <link rel="self" type="application/atom+xml" href="https://lexmetrik.vercel.app/feed/erlasse.xml" />
  <link rel="alternate" type="text/html" href="https://lexmetrik.vercel.app/" />
  <author>
    <name>LexMetrik</name>
  </author>
  <entry>
    <id>https://lexmetrik.vercel.app/gesetze/bund/NEUA</id>
    <title>NEU-A — Neueres Gesetz A</title>
    <link rel="alternate" type="text/html" href="https://lexmetrik.vercel.app/gesetze/bund/NEUA" />
    <updated>2026-06-01T00:00:00Z</updated>
    <summary>Stand 2026-06-01.</summary>
  </entry>
  <entry>
    <id>https://lexmetrik.vercel.app/gesetze/bund/NEUB</id>
    <title>NEU-B — Neueres Gesetz B</title>
    <link rel="alternate" type="text/html" href="https://lexmetrik.vercel.app/gesetze/bund/NEUB" />
    <updated>2026-06-01T00:00:00Z</updated>
    <summary>Stand 2026-06-01.</summary>
  </entry>
  <entry>
    <id>https://lexmetrik.vercel.app/gesetze/bund/ALT</id>
    <title>ALT — Altes Gesetz</title>
    <link rel="alternate" type="text/html" href="https://lexmetrik.vercel.app/gesetze/bund/ALT" />
    <updated>2026-01-01T00:00:00Z</updated>
    <summary>Stand 2026-01-01 (SR 100).</summary>
  </entry>
</feed>
`;

describe('baueFeedXml', () => {
  it('erzeugt exakt das erwartete Atom-XML (Filter + Datum-desc/Kürzel-asc-Sortierung)', () => {
    expect(baueFeedXml([ALT, NEU_B, NEU_A, AUSSEN_VOR])).toBe(ERWARTET);
  });

  it('ist deterministisch: zwei Aufrufe mit denselben Daten → byte-gleich', () => {
    const eins = baueFeedXml([ALT, NEU_B, NEU_A, AUSSEN_VOR]);
    const zwei = baueFeedXml([ALT, NEU_B, NEU_A, AUSSEN_VOR]);
    expect(eins).toBe(zwei);
  });

  it('wirft, wenn kein Erlass mit status "snapshot" + gültigem Stand übrig bleibt', () => {
    expect(() => baueFeedXml([AUSSEN_VOR])).toThrow(/kein Erlass/);
  });
});
