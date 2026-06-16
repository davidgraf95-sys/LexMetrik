// ─── LexWork-Adapter (kantonaler Norm-Volltext) ─────────────────────────────
import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  extrahiereLexWorkArtikel,
  holeLexWork,
} from '../../scripts/normtext/adapter-lexwork';
import { LEXWORK_XHTML_BEISPIEL } from './fixtures/lexwork-beispiel';

describe('extrahiereLexWorkArtikel — gegen echte ZG-Fixture', () => {
  it('extrahiert § 1 (ein Absatz)', () => {
    const a = extrahiereLexWorkArtikel(LEXWORK_XHTML_BEISPIEL, '1');
    expect(a).not.toBeNull();
    expect(a!.bloecke).toEqual([
      {
        absatz: '1',
        text: 'Diese Verordnung regelt die amtlichen Kosten in Zivil- und Strafverfahren sowie die ausserprozessualen Gebühren.',
      },
    ]);
  });

  it('extrahiert § 2 mit zwei Absätzen in Reihenfolge', () => {
    const a = extrahiereLexWorkArtikel(LEXWORK_XHTML_BEISPIEL, '2');
    expect(a).not.toBeNull();
    expect(a!.bloecke).toHaveLength(2);
    expect(a!.bloecke[0]).toEqual({
      absatz: '1',
      text: 'Die Kosten setzen sich zusammen aus der Gebühr und allfälligen Auslagen.',
    });
    // Änderungs-Marker «*» ist entfernt, &uuml;/Entities dekodiert.
    expect(a!.bloecke[1]).toEqual({
      absatz: '2',
      text: 'Gebühren sind die Pauschalen zur Deckung des Verfahrensaufwands und für den Entscheid.',
    });
  });

  it('hängt enumeration_item-Buchstaben an den vorangehenden Absatz', () => {
    const a = extrahiereLexWorkArtikel(LEXWORK_XHTML_BEISPIEL, '3');
    expect(a).not.toBeNull();
    expect(a!.bloecke).toHaveLength(2);
    // § 3 Abs. 1 + drei Buchstaben a)–c).
    expect(a!.bloecke[0].absatz).toBe('1');
    expect(a!.bloecke[0].text).toBe(
      'Grundlage für die Festsetzung der Gebühr bilden: ' +
        'a) der Streitwert bzw. das tatsächliche Streitinteresse in Zivilverfahren; ' +
        'b) die Bedeutung des Falls; ' +
        'c) der Zeitaufwand und die Schwierigkeit des Falls.',
    );
    // Der Folge-Absatz 2 hängt NICHT die Aufzählung dran.
    expect(a!.bloecke[1].absatz).toBe('2');
    expect(a!.bloecke[1].text).toBe(
      'Der Streitwert gemäss Abs. 1 Bst. a wird nach Art. 91 – 94 ZPO bestimmt.',
    );
  });

  it('liefert null für einen fehlenden Token', () => {
    expect(extrahiereLexWorkArtikel(LEXWORK_XHTML_BEISPIEL, '99')).toBeNull();
  });
});

describe('holeLexWork — mit gemocktem fetch', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('baut die URL, parst Meta + Artikel', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      expect(url).toBe('https://bgs.zg.ch/api/de/texts_of_law/161.7');
      return {
        ok: true,
        status: 200,
        json: async () => ({
          text_of_law: {
            title: 'Kostenverordnung',
            abbreviation: 'KoV OG',
            enactment: '2012-01-01',
            version_uid: 'abc123',
            current_version: {
              structured_document_id: 30404,
              version_dates_str: 'in Kraft seit: 01.01.2026',
            },
            selected_version: {
              structured_document_id: 30404,
              pdf_link_tol: 'https://bgs.zg.ch/api/de/versions/2963/pdf_file',
              xhtml_tol: LEXWORK_XHTML_BEISPIEL,
            },
          },
        }),
      } as unknown as Response;
    });
    vi.stubGlobal('fetch', fetchMock);

    const r = await holeLexWork('bgs.zg.ch', 'de', '161.7', ['1', '2']);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(r.meta).toEqual({
      titel: 'Kostenverordnung',
      abkuerzung: 'KoV OG',
      versionUid: 'abc123',
      stand: '2012-01-01',
      pdfUrl: 'https://bgs.zg.ch/api/de/versions/2963/pdf_file',
      nurPdf: false,
    });
    expect(Object.keys(r.artikel)).toEqual(['1', '2']);
    expect(r.artikel['1'].bloecke[0].text).toContain('amtlichen Kosten');
  });

  it('erkennt Alt-Erlass ohne xhtml_tol als nurPdf (kein Crash)', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        text_of_law: {
          title: 'Alt-Erlass',
          abbreviation: 'AE',
          version_uid: 'old1',
          enactment: '1980-01-01',
          current_version: { structured_document_id: null },
          selected_version: {
            structured_document_id: null,
            pdf_link_tol: 'https://x/api/de/versions/1/pdf_file',
            xhtml_tol: null,
          },
        },
      }),
    } as unknown as Response));
    vi.stubGlobal('fetch', fetchMock);

    const r = await holeLexWork('x', 'de', '1.1', ['1']);
    expect(r.meta.nurPdf).toBe(true);
    expect(r.meta.pdfUrl).toBe('https://x/api/de/versions/1/pdf_file');
    expect(r.artikel).toEqual({});
  });

  it('wirft bei HTTP-Fehler', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 404 }) as unknown as Response),
    );
    await expect(holeLexWork('x', 'de', '1.1', ['1'])).rejects.toThrow('HTTP 404');
  });
});
