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
  entscheidVolltextHtml,
  erlassDetailPfad,
  erlassVolltextHtml,
  jsonLdFuerEntscheid,
  jsonLdFuerErlass,
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
    expect(erlassDetailPfad({ ebene: 'kanton', key: 'BS-BeE 786.100' })).toBe(
      '/gesetze/kanton/BS-BeE%20786.100',
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
});

describe('jsonLdFuerErlass()', () => {
  it('emittiert Legislation (ohne Geltungsaussage) + BreadcrumbList', () => {
    const ld = jsonLdFuerErlass(or) as { '@graph': Array<Record<string, unknown>> };
    const leg = ld['@graph'][0];
    expect(leg['@type']).toBe('Legislation');
    expect(leg.legislationIdentifier).toBe('220');
    expect(leg.name).toBe(or.titel);
    // §7: keine Geltungsaussage
    expect(leg).not.toHaveProperty('legislationLegalForce');
    expect(leg).not.toHaveProperty('legislationDate');
    expect(ld['@graph'][1]['@type']).toBe('BreadcrumbList');
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
