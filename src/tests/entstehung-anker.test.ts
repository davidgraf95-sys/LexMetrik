// E2 «Entstehung am Artikel» (§11.4/§11.6): Botschafts-Anker + Deckungs-Diagnose.
//
// Geprüft wird, was fachlich FALSCH werden kann (§6.7): dass ein mehrdeutiger Anker
// nie ausgeliefert wird (falscher Sprung), dass die Filestore-Shell nicht als Dokument
// durchgeht (Content-Type statt Statuscode), dass die URL nie konstruiert wird, und dass
// die Deckungs-Messung über die committeten Shards deterministisch rechnet.
import { describe, it, expect } from 'vitest';
import {
  extrahiereAnker, reinerText, baueHtmlUrls, oeffentlicheUrl, holeHtml, baueManifestQuery,
  shaSidecar, serialisiereSidecar,
} from '../../scripts/entstehung/anker-sidecars';
import { ocAusHistorie, ocAusRevisionen } from '../../scripts/entstehung/deckung';
import type { AnkerSidecar } from '../lib/entstehung/anker';
import { ankerFuerToken, ankerUrl } from '../lib/entstehung/anker';

describe('extrahiereAnker — amtliche Artikel-Anker im BBl-HTML', () => {
  it('liest die eId vom umschliessenden <article>, nicht von der Überschrift (R3-Falle)', () => {
    const html = '<article id="art_16_c" class="x"><h6>Art. 16c&nbsp;Dauer</h6><p>…</p></article>';
    const { anker } = extrahiereAnker(html);
    expect(anker).toEqual([
      { eId: 'art_16_c', token: '16_c', ueberschrift: 'Art. 16c\u00A0Dauer', quelle: 'amtlich' },
    ]);
  });

  it('liefert eine MEHRFACH vergebene eId NICHT als Anker aus (§1: falscher Sprung)', () => {
    const html = '<article id="art_10"><h2>Art. 10 EOG</h2></article>'
      + '<article id="art_11"><h2>Art. 11</h2></article>'
      + '<article id="art_10"><h2>Art. 10 Abs. 4 (anderer Erlass)</h2></article>';
    const { anker, mehrdeutig } = extrahiereAnker(html);
    expect(mehrdeutig).toEqual(['art_10']);
    expect(anker.map((a) => a.eId)).toEqual(['art_11']);
  });

  it('ignoriert Nicht-Artikel-Anker, statt einen Token zu raten (§2)', () => {
    const { anker } = extrahiereAnker('<article id="art_anhang"><h2>Anhang</h2></article>');
    expect(anker).toEqual([]);
  });

  it('sortiert byte-stabil und ist reihenfolge-unabhängig serialisierbar', () => {
    const html = '<article id="art_9"><h2>Art. 9</h2></article><article id="art_10"><h2>Art. 10</h2></article>';
    expect(extrahiereAnker(html).anker.map((a) => a.eId)).toEqual(['art_10', 'art_9']);
  });

  it('reinerText löst Entities auf und bewahrt das geschützte Leerzeichen (§1, Typografie-Treue)', () => {
    expect(reinerText('<b>Art.&nbsp;5</b>&#160;&amp; mehr')).toBe('Art.\u00A05\u00A0& mehr');
    // Inline-Auszeichnung verschwindet SPURLOS — sonst würde aus Art. 16c ein «Art. 16 c».
    expect(reinerText('Art. 16<sup>c</sup> Abs. 3')).toBe('Art. 16c Abs. 3');
    expect(reinerText('<p>a</p><p>b</p>')).toBe('a b');
    // ASCII-Leerraum wird kollabiert, U+00A0 NIE zu einem gewöhnlichen Leerzeichen gefaltet.
    expect(reinerText('a   b')).toBe('a b');
    expect(reinerText('a&nbsp;&nbsp;b')).toBe('a\u00A0\u00A0b');
  });
});

describe('Manifestations-Auflösung — URL nie konstruieren (§11.6)', () => {
  it('die Query fragt die HTML-Manifestation, nicht einen geratenen Pfad', () => {
    const q = baueManifestQuery('<a>');
    expect(q).toContain('isExemplifiedBy');
    expect(q).toContain('user-format/html');
    expect(q).not.toMatch(/filestore/);
  });

  it('bevorzugt isExemplifiedBy und tauscht sonst nur den Host', () => {
    const m = baueHtmlUrls([
      { b: { value: 'x' }, url: { value: 'https://fedlex.data.admin.ch/a.html' } },
      { b: { value: 'y' }, priv: { value: 'https://intranet.fedlex.admin.ch/casematesbo/filestore/b.html' } },
    ]);
    expect(m.get('x')).toBe('https://fedlex.data.admin.ch/a.html');
    expect(m.get('y')).toBe('https://fedlex.data.admin.ch/filestore/b.html');
  });

  it('oeffentlicheUrl lässt eine bereits öffentliche URL unverändert', () => {
    const u = 'https://fedlex.data.admin.ch/filestore/x.html';
    expect(oeffentlicheUrl(u)).toBe(u);
  });
});

describe('holeHtml — Erfolg am Content-Type, nie am Statuscode', () => {
  const antwort = (body: string, typ: string | null, ok = true) => ({
    ok, status: ok ? 200 : 500,
    headers: { get: (h: string) => (h.toLowerCase() === 'content-type' ? typ : null) },
    text: async () => body,
  }) as unknown as Response;

  it('weist HTTP 200 mit JSON-Content-Type ab', async () => {
    await expect(holeHtml('u', async () => antwort('{}', 'application/json'))).rejects.toThrow(/Content-Type/);
  });

  it('weist die Casemates-Angular-Shell ab, obwohl sie 200 + text/html ist', async () => {
    await expect(holeHtml('u', async () => antwort('<!DOCTYPE html><title>Casemates</title>', 'text/html')))
      .rejects.toThrow(/Casemates-Shell/);
  });

  it('nimmt echtes HTML an und reicht die Currency-Marker durch', async () => {
    const res = {
      ok: true, status: 200,
      headers: { get: (h: string) => ({ 'content-type': 'text/html', 'last-modified': 'Fri, 16 May 2025 05:04:35 GMT', 'content-length': '42' }[h.toLowerCase()] ?? null) },
      text: async () => '<article id="art_1"><h2>Art. 1</h2></article>',
    } as unknown as Response;
    const a = await holeHtml('u', async () => res);
    expect(a.lastModified).toBe('Fri, 16 May 2025 05:04:35 GMT');
    expect(a.contentLength).toBe(42);
  });
});

describe('Sidecar — Kanonik und Lese-Helfer', () => {
  const s: AnkerSidecar = {
    botschaft: 'BOTSCHAFT-2025-1528', fga: 'fga/2025/1528',
    quelleUrl: 'https://www.fedlex.admin.ch/eli/fga/2025/1528/de',
    htmlUrl: 'https://fedlex.data.admin.ch/filestore/x.html',
    sha: 'a'.repeat(64), lastModified: null, contentLength: null, abgerufen: '2026-09-11',
    erlassKeys: ['EOG'], mantel: false, mehrdeutig: [],
    anker: [{ eId: 'art_16_c', token: '16_c', ueberschrift: 'Art. 16c', quelle: 'amtlich' }],
  };

  it('serialisiert byte-deterministisch (gleiche Eingabe → gleicher Hash)', () => {
    expect(shaSidecar(s)).toBe(shaSidecar(JSON.parse(serialisiereSidecar(s)) as AnkerSidecar));
    expect(serialisiereSidecar(s).endsWith('\n')).toBe(true);
  });

  it('findet den Anker über den Korpus-Token und baut den amtlichen Deep-Link', () => {
    expect(ankerFuerToken(s, '16_c')?.eId).toBe('art_16_c');
    expect(ankerFuerToken(s, '99')).toBeNull();
    expect(ankerUrl(s, s.anker[0])).toBe('https://www.fedlex.admin.ch/eli/fga/2025/1528/de#art_16_c');
  });
});

describe('Deckungs-Diagnose — oc-Mengen aus den committeten Shards', () => {
  it('nimmt nur oc-ELIs aus den Fussnoten (BBl-Fundstellen zählen nicht)', () => {
    const menge = ocAusHistorie({
      erlass: 'X',
      artikel: {
        1: { ereignisse: [{ quellen: [
          { url: 'https://fedlex.data.admin.ch/eli/oc/2016/752' },
          { url: 'https://fedlex.data.admin.ch/eli/fga/2014/171' },
          { url: '' },
        ] }] },
        2: { ereignisse: [{ quellen: [{ url: 'https://fedlex.data.admin.ch/eli/oc/2016/752/' }] }] },
      },
    });
    expect([...menge]).toEqual(['https://fedlex.data.admin.ch/eli/oc/2016/752']);
  });

  it('liest die Änderungsliste über ocUri und normalisiert den Schrägstrich am Ende', () => {
    const m = ocAusRevisionen({ revisionen: [{ ocUri: 'https://x/eli/oc/2026/433/' }, { ocUri: 'https://x/eli/oc/2026/433' }, {}] });
    expect([...m]).toEqual(['https://x/eli/oc/2026/433']);
  });
});
