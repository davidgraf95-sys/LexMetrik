import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  erlassAusFedlexUrl,
  ankerNachToken,
  fedlexHrefNachKante,
  extrahiereFedlexAnker,
  MWST_ERLASSE,
} from '../../scripts/materialien/fedlex-anker';

// E6a M1: reine, offline verifizierbare Invertierung der Fedlex-`#art_N`-Anker der ESTV-MWST-Ziffer-
// Seiten (§3 Q1, «Anker-Invertierung»). Kein Netz. Token-Format gegen den committeten MWST-Korpus.

describe('erlassAusFedlexUrl — ELI-Block bevorzugt', () => {
  it('MWSTG über eli/cc/2009/615', () => {
    expect(erlassAusFedlexUrl('https://www.fedlex.admin.ch/eli/cc/2009/615/de#art_20')).toBe('MWSTG');
  });
  it('MWSTV über eli/cc/2009/828', () => {
    expect(erlassAusFedlexUrl('https://www.fedlex.admin.ch/eli/cc/2009/828/de#art_48_a')).toBe('MWSTV');
  });
  it('anderer Fedlex-Erlass (OR) → null', () => {
    expect(erlassAusFedlexUrl('https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de#art_18')).toBeNull();
  });
});

describe('erlassAusFedlexUrl — SR-Nummer-Fallback + Präfix-Falle 641.20 vs 641.201', () => {
  it('641.20 → MWSTG', () => {
    expect(erlassAusFedlexUrl('https://www.fedlex.admin.ch/de/cc/SR/641.20#art_21')).toBe('MWSTG');
  });
  it('641.201 → MWSTV (nicht fälschlich MWSTG)', () => {
    expect(erlassAusFedlexUrl('https://www.fedlex.admin.ch/de/cc/SR/641.201#art_9_a')).toBe('MWSTV');
  });
  it('641.20 wird NICHT von 641.201 getroffen (Zifferngrenze rechts)', () => {
    // Nur SR 641.201 in der URL → darf NICHT als MWSTG (641.20) matchen.
    expect(erlassAusFedlexUrl('https://www.fedlex.admin.ch/SR/641.201')).toBe('MWSTV');
  });
  it('keine Fedlex-URL → null', () => {
    expect(erlassAusFedlexUrl('https://www.gate.estv.admin.ch/mwst-webpublikationen/public')).toBeNull();
    expect(erlassAusFedlexUrl('https://example.org/641.20')).toBeNull();
  });
});

describe('ankerNachToken — Korpus-Token-Normalisierung', () => {
  it('reine Artikelnummer', () => {
    expect(ankerNachToken('art_45')).toBe('45');
    expect(ankerNachToken('#art_21')).toBe('21');
    expect(ankerNachToken('115')).toBe('115');
  });
  it('Buchstaben-Suffix mit Unterstrich (Fedlex-eId)', () => {
    expect(ankerNachToken('art_20_a')).toBe('20_a');
    expect(ankerNachToken('art_115_b')).toBe('115_b');
  });
  it('Buchstaben-Suffix ohne Unterstrich toleriert', () => {
    expect(ankerNachToken('art_20a')).toBe('20_a');
    expect(ankerNachToken('#art_48c')).toBe('48_c');
  });
  it('Fedlex-Doppelartikel', () => {
    expect(ankerNachToken('art_109_110')).toBe('109_110');
  });
  it('unlesbares Fragment → null', () => {
    expect(ankerNachToken('titel1')).toBeNull();
    expect(ankerNachToken('art_')).toBeNull();
    expect(ankerNachToken('')).toBeNull();
  });
});

describe('fedlexHrefNachKante', () => {
  it('artikelscharf', () => {
    expect(fedlexHrefNachKante('https://www.fedlex.admin.ch/eli/cc/2009/615/de#art_24_a')).toEqual({
      erlass: 'MWSTG', artikel: '24_a', href: 'https://www.fedlex.admin.ch/eli/cc/2009/615/de#art_24_a',
    });
  });
  it('ohne Fragment → Erlass-Ebene', () => {
    expect(fedlexHrefNachKante('https://www.fedlex.admin.ch/eli/cc/2009/828/de')).toEqual({
      erlass: 'MWSTV', artikel: '', href: 'https://www.fedlex.admin.ch/eli/cc/2009/828/de',
    });
  });
  it('unlesbares Fragment → Erlass-Ebene (nie stummer Drop)', () => {
    const k = fedlexHrefNachKante('https://www.fedlex.admin.ch/eli/cc/2009/615/de#kapitel3');
    expect(k).toEqual({ erlass: 'MWSTG', artikel: '', href: 'https://www.fedlex.admin.ch/eli/cc/2009/615/de#kapitel3' });
  });
  it('kein MWST-Erlass → null', () => {
    expect(fedlexHrefNachKante('https://www.fedlex.admin.ch/eli/cc/220/de#art_18')).toBeNull();
  });
});

describe('extrahiereFedlexAnker — robust über href-Attribute, dedupliziert, sortiert', () => {
  const html = `
    <div class="cipher">
      <p>Vgl. <a href="https://www.fedlex.admin.ch/eli/cc/2009/615/de#art_21">Art. 21 MWSTG</a>,
      sowie <a href='https://www.fedlex.admin.ch/eli/cc/2009/615/de#art_20_a'>Art. 20a</a>.</p>
      <p>MWSTV: <a href="https://www.fedlex.admin.ch/eli/cc/2009/828/de#art_48_a">Art. 48a</a></p>
      <p>Query-Amp: <a href="https://www.fedlex.admin.ch/eli/cc/2009/615/de?x=1&amp;y=2#art_115">Art. 115</a></p>
      <p>Dublette: <a href="https://www.fedlex.admin.ch/eli/cc/2009/615/de#art_21">nochmals 21</a></p>
      <p>Fremd: <a href="https://www.fedlex.admin.ch/eli/cc/220/de#art_18">OR 18</a>
      und <a href="https://www.estv.admin.ch/irgendwas">intern</a></p>
    </div>`;
  const kanten = extrahiereFedlexAnker(html);

  it('nur MWST-Anker, OR + intern verworfen', () => {
    expect(kanten.every((k) => k.erlass === 'MWSTG' || k.erlass === 'MWSTV')).toBe(true);
    expect(kanten.some((k) => /220/.test(k.href))).toBe(false);
  });
  it('Dubletten zusammengefasst', () => {
    const art21 = kanten.filter((k) => k.erlass === 'MWSTG' && k.artikel === '21');
    expect(art21).toHaveLength(1);
  });
  it('&amp; in der Query dekodiert', () => {
    const a115 = kanten.find((k) => k.artikel === '115');
    expect(a115?.href).toContain('x=1&y=2');
  });
  it('deterministisch sortiert (MWSTG vor MWSTV, artikel numerisch)', () => {
    expect(kanten.map((k) => `${k.erlass}:${k.artikel}`)).toEqual([
      'MWSTG:20_a', 'MWSTG:21', 'MWSTG:115', 'MWSTV:48_a',
    ]);
  });
});

describe('Token-Deckung gegen den committeten MWST-Korpus (§7, doppelt verifiziert)', () => {
  for (const e of MWST_ERLASSE) {
    it(`${e.key}: invertierte Beispiel-Anker existieren im Korpus`, () => {
      const korpus = JSON.parse(
        readFileSync(join('public', 'normtext', 'bund', `${e.key}.json`), 'utf8'),
      ) as { eintraege: { artikel?: string }[] };
      const set = new Set(korpus.eintraege.map((x) => x.artikel));
      // ein paar reale Korpus-Token über die Anker-Route zurückgewinnen
      const proben = e.key === 'MWSTG' ? ['art_21', 'art_20_a', 'art_115_b'] : ['art_4_a', 'art_48_c'];
      for (const anker of proben) {
        const token = ankerNachToken(anker);
        expect(token).not.toBeNull();
        expect(set.has(token!)).toBe(true);
      }
    });
  }
});
