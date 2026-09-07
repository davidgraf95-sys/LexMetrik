// ─── Detail-Seiten-SEO (W1.1) ──────────────────────────────────────────────
//
// Sichert die reinen Funktionen aus lib/seo-detail.ts gegen ECHTE Manifest- und
// Snapshot-Daten ab: Pfad/Meta/JSON-LD aus Strukturfeldern, und das Volltext-
// HTML gegen die Prerender-Tor-Invarianten (kein <script>, ≥500 Zeichen, kein
// «Wird geladen», sauberes Escaping). §7: kein erfundener Rechtstext.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  entscheidDetailPfad,
  entscheidHatVolltext,
  entscheidVolltextHtml,
  erlassDetailPfad,
  erlassHatVolltext,
  erlassVolltextHtml,
  jsonLdFuerEntscheid,
  jsonLdFuerErlass,
  KEY_UNSICHER,
  metaFuerEntscheid,
  metaFuerErlass,
} from '../lib/seo-detail';
import { SITE_URL } from '../lib/seo';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import type { NormSnapshotDatei } from '../lib/normtext/typen';
import type { BrowseEntscheid } from '../lib/rechtsprechung/register';
import type { EntscheidSnapshotDatei } from '../lib/rechtsprechung/typen';

const PUB = join(process.cwd(), 'public');
const erlasse: BrowseErlass[] = JSON.parse(
  readFileSync(join(PUB, 'normtext/register.json'), 'utf8'),
).erlasse;
const entscheide: BrowseEntscheid[] = JSON.parse(
  readFileSync(join(PUB, 'rechtsprechung/register.json'), 'utf8'),
).entscheide;

const or = erlasse.find((e) => e.key === 'OR')!;

describe('erlassDetailPfad()', () => {
  it('baut /gesetze/:ebene/:key, Bund-Keys unverändert', () => {
    expect(erlassDetailPfad(or)).toBe('/gesetze/bund/OR');
  });
  it('prozentkodiert Sonderzeichen (kantonale Keys mit Leerzeichen)', () => {
    // `rechtsgebiet` gehört seit Befund 45 (Entscheid David 29.8.2026) zur
    // Adress-Ableitung: es entscheidet, ob ein Erlass unter /gesetze/bund/ oder
    // /gesetze/international/ steht. Hier ein kantonaler Erlass, also ein
    // beliebiges Nicht-International-Gebiet.
    expect(erlassDetailPfad({ ebene: 'kanton', rechtsgebiet: 'privat', key: 'BS-BeE 786.100' })).toBe(
      '/gesetze/kanton/BS-BeE%20786.100',
    );
  });
  it('setzt Staatsverträge unter /gesetze/international/ (Befund 45)', () => {
    expect(erlassDetailPfad({ ebene: 'bund', rechtsgebiet: 'international', key: 'CISG' })).toBe(
      '/gesetze/international/CISG',
    );
  });
});

describe('metaFuerErlass()', () => {
  it('liefert mechanischen Titel/Beschreibung/Canonical aus Strukturfeldern', () => {
    const m = metaFuerErlass(or);
    expect(m.canonical).toBe(`${SITE_URL}/gesetze/bund/OR`);
    expect(m.titel).toContain('OR');
    expect(m.titel).toContain('SR 220');
    expect(m.beschreibung).toContain('Stand');
    expect(m.beschreibung.length).toBeGreaterThan(50);
  });
  it('leerer stand → «Stand unbekannt» statt «Stand ,» in der Beschreibung (§9-Bug-Check Fund 1)', () => {
    const m = metaFuerErlass({ ...or, stand: '' });
    expect(m.beschreibung).toContain('Stand unbekannt,');
    expect(m.beschreibung).not.toContain('Stand ,');
  });
  it('hängt das Kürzel nicht doppelt an, wenn der Titel es schon enthält (Fehlerbuch W2·18, EMRK)', () => {
    const emrk = erlasse.find((e) => e.key === 'EMRK')!;
    const m = metaFuerErlass(emrk);
    expect(m.titel).not.toContain('(EMRK (EMRK)');
    expect(m.titel).toContain('(EMRK)');
    expect((m.titel.match(/EMRK/g) ?? []).length).toBe(1);
  });

  // Auflage Gegenprüfung PR #721 (5.9.2026, nicht bestanden): die vorige
  // `titel.includes(kuerzel)`-Bedingung matchte das Kürzel auch als
  // Substring innerhalb eines längeren Titel-Worts — Folge: die
  // Kürzel-Klammer fehlte im <title> komplett, obwohl das Kürzel dort gar
  // kein eigenständiges Wort ist.
  it('hängt das Kürzel an, wenn es im Titel nur als Substring (kein Token) vorkommt — ZEMIS-V', () => {
    const zemis = erlasse.find((e) => e.key === 'ZEMIS_V')!;
    expect(zemis.kuerzel).toBe('ZEMIS-V');
    expect(zemis.titel).toContain('ZEMIS-Verordnung');
    const m = metaFuerErlass(zemis);
    expect(m.titel).toContain('(ZEMIS-V');
  });

  it('hängt das Kürzel an, wenn es im Titel nur als Substring (kein Token) vorkommt — Staatenlose', () => {
    const staatenlose = erlasse.find((e) => e.key === 'STAATENLOSE')!;
    expect(staatenlose.kuerzel).toBe('Staatenlose');
    expect(staatenlose.titel).toContain('der Staatenlosen');
    const m = metaFuerErlass(staatenlose);
    expect(m.titel).toContain('(Staatenlose');
  });

  it('erkennt das Kürzel als Token am Titel-Ende (kein Substring-Fehlschluss)', () => {
    const m = metaFuerErlass({ ...or, titel: 'Bundesgesetz betreffend die Ergänzung des OR', sr: '' });
    // Kürzel ist am Titel-Ende bereits ein eigenständiges Wort → nicht erneut anhängen.
    expect(m.titel).not.toContain('(OR)');
    expect((m.titel.match(/OR/g) ?? []).length).toBe(1);
  });
});

describe('jsonLdFuerErlass()', () => {
  it('emittiert Legislation (mit legislationDateVersion, ohne legislationLegalForce) + BreadcrumbList', () => {
    const ld = jsonLdFuerErlass(or) as { '@graph': Array<Record<string, unknown>> };
    const leg = ld['@graph'][0];
    expect(leg['@type']).toBe('Legislation');
    expect(leg.legislationIdentifier).toBe('220');
    expect(leg.name).toBe(or.titel);
    // V4 (QS-VERWENDEN, 2.9.2026, Bug-Check #630): legislationDateVersion =
    // gepinntes Stand-Datum (schema.org eli:version_date), wenn valides
    // ISO-Datum im Datensatz vorhanden (OR: '2026-01-01').
    expect(leg.legislationDateVersion).toBe(or.stand);
    expect(or.stand).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // §8: kein positiver Geltungsstatus im Datensatz → keine Geltungsaussage
    expect(leg).not.toHaveProperty('legislationLegalForce');
    // legislationDate (Verabschiedungsdatum) wird nie gesetzt — schema.org-
    // Semantik verlangt ein anderes Datenfeld als das gepinnte Stand-Datum.
    expect(leg).not.toHaveProperty('legislationDate');
    expect(ld['@graph'][1]['@type']).toBe('BreadcrumbList');
  });
  it('lässt legislationDateVersion weg, wenn `stand` kein valides ISO-Datum ist (§9-Bug-Check-Fall, zwei VD-Einträge)', () => {
    const ld = jsonLdFuerErlass({ ...or, stand: '' }) as { '@graph': Array<Record<string, unknown>> };
    const leg = ld['@graph'][0];
    expect(leg).not.toHaveProperty('legislationDateVersion');
    expect(leg).not.toHaveProperty('legislationDate');
    expect(leg).not.toHaveProperty('legislationLegalForce');
  });
});

describe('erlassVolltextHtml()', () => {
  const datei: NormSnapshotDatei = JSON.parse(
    readFileSync(join(PUB, 'normtext', or.datei!), 'utf8'),
  );
  const html = erlassVolltextHtml(or, datei);
  it('erfüllt die Prerender-Tor-Invarianten', () => {
    expect(html.length).toBeGreaterThan(500);
    expect(html).not.toContain('<script');
    expect(html).not.toContain('Wird geladen');
    expect(html).not.toContain('404 · Nicht gefunden');
  });
  it('hat genau eine <h1> und den Live-Link zur amtlichen Quelle', () => {
    expect(html.match(/<h1>/g)?.length).toBe(1);
    expect(html).toContain(or.quelleUrl.replace(/&/g, '&amp;'));
  });
  it('enthält echten Artikeltext aus dem Snapshot (kein erfundener Text)', () => {
    const ersterText = datei.eintraege[0].bloecke.find((b) => b.text)?.text;
    expect(ersterText, 'Fixture braucht Artikeltext').toBeTruthy();
    // Beginn des echten Textes muss (escaped) im HTML stehen
    const probe = ersterText!.slice(0, 24).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    expect(html).toContain(probe);
  });
});

describe('erlassVolltextHtml() — §5-Gleichlauf mit dem interaktiven Kopf (K-2)', () => {
  const kanton = erlasse.find((e) => e.ebene === 'kanton' && e.datei && e.stand)!;
  const datei: NormSnapshotDatei = JSON.parse(
    readFileSync(join(PUB, 'normtext', kanton.datei!), 'utf8'),
  );
  it('Kantonserlass ohne Currency-Beleg trägt «Geltung ungeprüft» auch prerendert', () => {
    const html = erlassVolltextHtml(kanton, datei);
    expect(html).toContain('Geltung ungeprüft');
  });
  it('Bund ohne Beleg bleibt unverändert (keine Ungeprüft-Zeile)', () => {
    const orDatei: NormSnapshotDatei = JSON.parse(
      readFileSync(join(PUB, 'normtext', or.datei!), 'utf8'),
    );
    expect(erlassVolltextHtml(or, orDatei)).not.toContain('Geltung ungeprüft');
  });
  it('aufgehobener Kantonserlass trägt KEINE Ungeprüft-Zeile (lebt-Gate wie im interaktiven Kopf)', () => {
    const html = erlassVolltextHtml(
      { ...kanton, aufgehoben: { seit: '2020-01-01', quelleUrl: kanton.quelleUrl } as never },
      datei,
    );
    expect(html).not.toContain('Geltung ungeprüft');
  });
  it('aufgehobener Erlass trägt auch KEINEN Standausweis-Satz (lebt-Gate beider Zweige)', () => {
    const html = erlassVolltextHtml(
      { ...kanton, aufgehoben: { seit: '2020-01-01', quelleUrl: kanton.quelleUrl } as never },
      datei,
      { geprueftAm: '2026-08-01' },
    );
    expect(html).not.toContain('geprüft am');
  });
  it('leerer stand wird «Stand unbekannt» statt «Stand » (K-2d)', () => {
    const html = erlassVolltextHtml({ ...kanton, stand: '' }, datei);
    expect(html).toContain('Stand unbekannt');
    expect(html).not.toContain('Stand  ·');
  });
});

describe('Substanz-Prädikate (kein header-only «Volltext», §8)', () => {
  it('erlassHatVolltext: true bei echtem Snapshot, false bei leer', () => {
    const datei = JSON.parse(readFileSync(join(PUB, 'normtext', or.datei!), 'utf8'));
    expect(erlassHatVolltext(datei)).toBe(true);
    expect(erlassHatVolltext({ erzeugt: '', eintraege: [] })).toBe(false);
    expect(
      erlassHatVolltext({ erzeugt: '', eintraege: [{ artikelLabel: 'Art. 1', bloecke: [{ absatz: null, text: '  ' }] }] as never }),
    ).toBe(false);
  });
  it('entscheidHatVolltext: false ohne Regeste und ohne Blöcke', () => {
    expect(entscheidHatVolltext({ regeste: null, abschnitte: [] } as never)).toBe(false);
    expect(entscheidHatVolltext({ regeste: { text: 'x', quelle: 'opencaselaw' }, abschnitte: [] } as never)).toBe(true);
  });
});

describe('KEY_UNSICHER (Pfad-/URL-Sicherheit)', () => {
  it('Leerzeichen ist SICHER (raw-Datei ↔ %20-URL), aber / \\ # ? nicht', () => {
    expect(KEY_UNSICHER.test('BS-BeE 786.100')).toBe(false); // Leerzeichen ok
    expect(KEY_UNSICHER.test('OR')).toBe(false);
    expect(KEY_UNSICHER.test('AG-291.150')).toBe(false);
    expect(KEY_UNSICHER.test('a/b')).toBe(true);
    expect(KEY_UNSICHER.test('a#b')).toBe(true);
    expect(KEY_UNSICHER.test('a?b')).toBe(true);
    expect(KEY_UNSICHER.test('a\\b')).toBe(true);
  });
});

describe('Entscheid: Pfad/Meta/JSON-LD/HTML', () => {
  const mitRegeste = entscheide.find((e) => e.regesteVorhanden && e.datei) ?? entscheide[0];
  it('baut /rechtsprechung/:key', () => {
    expect(entscheidDetailPfad(mitRegeste)).toBe(`/rechtsprechung/${mitRegeste.key}`);
  });
  it('Meta mechanisch aus Gericht/Zitierung/Datum', () => {
    const m = metaFuerEntscheid(mitRegeste);
    expect(m.titel).toContain(mitRegeste.zitierung);
    expect(m.canonical).toBe(`${SITE_URL}/rechtsprechung/${mitRegeste.key}`);
  });
  it('JSON-LD nur BreadcrumbList (kein erfundener Entscheid-Typ)', () => {
    const ld = jsonLdFuerEntscheid(mitRegeste) as { '@graph': Array<Record<string, unknown>> };
    expect(ld['@graph']).toHaveLength(1);
    expect(ld['@graph'][0]['@type']).toBe('BreadcrumbList');
  });
  it('Volltext-HTML erfüllt die Tor-Invarianten', () => {
    const snap: EntscheidSnapshotDatei = JSON.parse(
      readFileSync(join(PUB, 'rechtsprechung', mitRegeste.datei!), 'utf8'),
    );
    const html = entscheidVolltextHtml(mitRegeste, snap.eintraege[0]);
    expect(html.length).toBeGreaterThan(500);
    expect(html).not.toContain('<script');
    expect(html).not.toContain('Wird geladen');
    expect(html.match(/<h1>/g)?.length).toBe(1);
    // & wird im href korrekt zu &amp; escaped → escapte Form prüfen
    expect(html).toContain(mitRegeste.quelleUrl.replace(/&/g, '&amp;'));
  });
});
