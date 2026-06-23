// ─── LexWork-Adapter (kantonaler Norm-Volltext) ─────────────────────────────
import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  extrahiereLexWorkArtikel,
  holeLexWork,
  inKraftSeit,
} from '../../scripts/normtext/adapter-lexwork';
import { LEXWORK_XHTML_BEISPIEL } from './fixtures/lexwork-beispiel';
import { LEXWORK_BS_292400_XHTML } from './fixtures/lexwork-bs292400';
import {
  LEXWORK_ZG1617_TABELLE_XHTML,
  LEXWORK_GL_FUSSNOTE_XHTML,
  LEXWORK_BE_ART1A_XHTML,
} from './fixtures/lexwork-zg1617-tabelle';

describe('inKraftSeit — reines Parsing ohne Netz', () => {
  it('extrahiert «in Kraft seit: DD.MM.YYYY» aus echtem LexWork-String und liefert ISO', () => {
    expect(
      inKraftSeit(
        'Aktuelle Version in Kraft seit: 01.01.2026 (Beschlussdatum: 26.11.2025)',
        '2012-01-01',
      ),
    ).toBe('2026-01-01');
  });

  it('verarbeitet «In Kraft seit:» (Grossbuchstabe)', () => {
    expect(inKraftSeit('In Kraft seit: 15.03.2025', '2010-06-01')).toBe('2025-03-15');
  });

  it('liefert enactment als Fallback wenn kein «in Kraft seit» vorhanden', () => {
    expect(inKraftSeit('Keine Datumsinfo', '2012-01-01')).toBe('2012-01-01');
  });

  it('liefert enactment als Fallback bei leerem versionDatesStr', () => {
    expect(inKraftSeit('', '2012-01-01')).toBe('2012-01-01');
  });

  it('liefert enactment als Fallback bei undefined versionDatesStr', () => {
    expect(inKraftSeit(undefined, '2012-01-01')).toBe('2012-01-01');
  });

  it('liefert leeren String wenn beide leer/undefined', () => {
    expect(inKraftSeit(undefined, undefined)).toBe('');
    expect(inKraftSeit('', '')).toBe('');
    expect(inKraftSeit(undefined, '')).toBe('');
  });

  it('liefert leeren String wenn versionDatesStr fehlt und enactment kein ISO-Format hat', () => {
    expect(inKraftSeit(undefined, 'falsch')).toBe('');
  });

  // BUG A4: FR/zweisprachige Erlasse liefern «in Kraft seit 01.12.2025» OHNE
  // Doppelpunkt → früher fiel inKraftSeit auf enactment (2011) zurück.
  it('verarbeitet «in Kraft seit DD.MM.YYYY» OHNE Doppelpunkt (FR 130.11)', () => {
    expect(
      inKraftSeit(
        'Aktuelle Version in Kraft seit 01.12.2025 (Beschluss: 10.11.2025)',
        '2011-01-01',
      ),
    ).toBe('2025-12-01');
  });

  // BUG A4 (Ergänzung): FR-fr und VS-fr APIs liefern ausschliesslich französischen
  // version_dates_str «en vigueur depuis le DD.MM.YYYY» — ohne das fr-Muster
  // fiel inKraftSeit auf enactment zurück (bdlf.fr.ch / lex.vs.ch, 16.6.2026).
  it('verarbeitet «en vigueur depuis le DD.MM.YYYY» (FR-130.11-fr)', () => {
    expect(
      inKraftSeit(
        'Version actuelle en vigueur depuis le 01.12.2025 (décision: 10.11.2025)',
        '2011-01-01',
      ),
    ).toBe('2025-12-01');
  });

  it('verarbeitet «en vigueur dès le DD.MM.YYYY» (alternative fr-Form)', () => {
    expect(
      inKraftSeit(
        'Version actuelle en vigueur dès le 15.03.2024',
        '2010-01-01',
      ),
    ).toBe('2024-03-15');
  });

  it('verarbeitet «en vigueur depuis DD.MM.YYYY» OHNE «le» (fr-Minimalform)', () => {
    expect(
      inKraftSeit(
        'en vigueur depuis 01.01.2023',
        '2010-01-01',
      ),
    ).toBe('2023-01-01');
  });
});

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

  it('erfasst enumeration_item-Buchstaben als items am vorangehenden Absatz', () => {
    const a = extrahiereLexWorkArtikel(LEXWORK_XHTML_BEISPIEL, '3');
    expect(a).not.toBeNull();
    expect(a!.bloecke).toHaveLength(2);
    // § 3 Abs. 1: Einleitungstext + drei Buchstaben-items a)–c).
    expect(a!.bloecke[0].absatz).toBe('1');
    expect(a!.bloecke[0].text).toBe('Grundlage für die Festsetzung der Gebühr bilden:');
    expect(a!.bloecke[0].items).toEqual([
      { marke: 'a', text: 'der Streitwert bzw. das tatsächliche Streitinteresse in Zivilverfahren;' },
      { marke: 'b', text: 'die Bedeutung des Falls;' },
      { marke: 'c', text: 'der Zeitaufwand und die Schwierigkeit des Falls.' },
    ]);
    // Der Folge-Absatz 2 hat KEINE items.
    expect(a!.bloecke[1].absatz).toBe('2');
    expect(a!.bloecke[1].items).toBeUndefined();
    expect(a!.bloecke[1].text).toBe(
      'Der Streitwert gemäss Abs. 1 Bst. a wird nach Art. 91 – 94 ZPO bestimmt.',
    );
  });

  it('liefert null für einen fehlenden Token', () => {
    expect(extrahiereLexWorkArtikel(LEXWORK_XHTML_BEISPIEL, '99')).toBeNull();
  });
});

describe('extrahiereLexWorkArtikel — enumeration_item mit Einrück-Spacer (NW 268.12 §18 lit. a–g)', () => {
  // NW rendert die zweite Verschachtelungsebene (Ziff. → lit.) mit ZWEI
  // td.number: zuerst ein leerer Einrück-Spacer (&nbsp;), dann die echte Marke
  // «a)». Regressionssicherung gegen den Bug, bei dem nur die erste (leere)
  // Zelle gelesen wurde → leere Marke → das ganze item (Promillestaffel) fiel weg.
  const NW_SPACER_XHTML =
    "<div class='article'>" +
    "<div class='article_number'><span class='article_symbol'>§</span><span class='number'>18</span></div>" +
    "<div class='paragraph'><span class='number'>1</span><p><span class='text_content'>Bei der oeffentlichen letztwilligen Verfuegung betraegt die Gebuehr:</span></p></div>" +
    // Standard-Einzelzelle (Ziff. 1) — eine td.number:
    "<table class='enumeration_item'><tr><td class='number' colspan='3'>1.</td><td class='left_col last'>fuer die Errichtung;</td></tr></table>" +
    // Zwei-Zellen-Spacer-Form (lit. a, b) — leerer Spacer ZUERST, dann echte Marke:
    "<table class='enumeration_item'><tr><td class='number'>&nbsp;</td><td class='number'>a)</td><td class='left_col last' colspan='2'>3 Promille bis zu einem Wert von Fr. 200000;</td></tr></table>" +
    "<table class='enumeration_item'><tr><td class='number'>&nbsp;</td><td class='number'>b)</td><td class='left_col last' colspan='2'>die Mindestgebuehr betraegt Fr. 400.</td></tr></table>" +
    '</div>';

  it('erfasst trotz leerem Spacer-td die echte Marke a)/b) (sonst fiele die Staffel weg)', () => {
    const a = extrahiereLexWorkArtikel(NW_SPACER_XHTML, '18');
    expect(a).not.toBeNull();
    expect(a!.bloecke).toHaveLength(1);
    expect(a!.bloecke[0].absatz).toBe('1');
    expect(a!.bloecke[0].items).toEqual([
      { marke: '1', text: 'fuer die Errichtung;' },
      { marke: 'a', text: '3 Promille bis zu einem Wert von Fr. 200000;' },
      { marke: 'b', text: 'die Mindestgebuehr betraegt Fr. 400.' },
    ]);
  });
});

describe('extrahiereLexWorkArtikel — INLINE-Aufzählung (BS 292.400 §11, kein enumeration_item)', () => {
  it('erfasst § 11 als EINEN Absatz mit Ziffern-items', () => {
    const a = extrahiereLexWorkArtikel(LEXWORK_BS_292400_XHTML, '11');
    expect(a).not.toBeNull();
    // BS §11 = ein <div class='paragraph'> (Absatz «1»).
    expect(a!.bloecke).toHaveLength(1);
    expect(a!.bloecke[0].absatz).toBe('1');
    expect(a!.bloecke[0].items).toBeDefined();
  });

  it('erfasst Ziff. 1 (Stiftung) inkl. Folge-Tarifzeilen', () => {
    const a = extrahiereLexWorkArtikel(LEXWORK_BS_292400_XHTML, '11');
    const items = a!.bloecke[0].items!;
    const z1 = items.find((i) => i.marke === '1');
    expect(z1).toBeDefined();
    expect(z1!.text).toContain('Stiftung:');
    // Folge-Spans ohne Marke sind an Ziff. 1 angehängt.
    expect(z1!.text).toContain('Errichtung durch lebzeitiges Geschäft');
    expect(z1!.text).toContain('zusätzlich 0,15%.');
  });

  it('erfasst die zitierte Ziff. 17 (Übertragung von Grundeigentum) vollständig', () => {
    const a = extrahiereLexWorkArtikel(LEXWORK_BS_292400_XHTML, '11');
    const items = a!.bloecke[0].items!;
    const z17 = items.find((i) => i.marke === '17');
    expect(z17).toBeDefined();
    expect(z17!.text).toContain('Übertragung von Grundeigentum:');
    expect(z17!.text).toContain('bei Werten bis zu CHF 2 Mio. 0,25%');
    expect(z17!.text).toContain('höchstens jedoch CHF 50’000.');
  });

  it('lässt leere/aufgehobene Ziffern (13.–15.) weg, behält die echten', () => {
    const a = extrahiereLexWorkArtikel(LEXWORK_BS_292400_XHTML, '11');
    const marken = a!.bloecke[0].items!.map((i) => i.marke);
    // 13/14/15 sind leere Marken → nicht als items.
    expect(marken).not.toContain('13');
    expect(marken).not.toContain('14');
    expect(marken).not.toContain('15');
    // Die echten Ziffern sind da.
    expect(marken).toEqual(expect.arrayContaining(['1', '16', '17', '20']));
  });

  it('erfasst Unterpunkte a)/b) (Ziff. 20) als eigene items', () => {
    const a = extrahiereLexWorkArtikel(LEXWORK_BS_292400_XHTML, '11');
    const marken = a!.bloecke[0].items!.map((i) => i.marke);
    expect(marken).toContain('a');
    expect(marken).toContain('b');
  });
});

describe('BUG A1 — Fussnoten-Anker werden inkl. Inhalt entfernt (§7 Treue)', () => {
  it('lässt keinen «[8]»/«8»-Rest aus <a class="footnote"> im Normtext', () => {
    const a = extrahiereLexWorkArtikel(LEXWORK_GL_FUSSNOTE_XHTML, '5');
    expect(a).not.toBeNull();
    const text = a!.bloecke[0].text;
    expect(text).toBe('Vermögensübertragung nach Fusionsgesetz:');
    expect(text).not.toContain('[8]');
    expect(text).not.toMatch(/Fusionsgesetz\s*8/);
  });
});

describe('BUG A2 — Token «1_a» findet Artikelnummer «1a»', () => {
  it('normalisiert Unterstriche beim Matching und findet den Artikel', () => {
    const a = extrahiereLexWorkArtikel(LEXWORK_BE_ART1A_XHTML, '1_a');
    expect(a).not.toBeNull();
    expect(a!.bloecke[0].text).toContain('Schlichtungsverfahren');
  });

  it('matcht weiterhin schlichte Token ohne Unterstrich', () => {
    expect(extrahiereLexWorkArtikel(LEXWORK_XHTML_BEISPIEL, '1')).not.toBeNull();
  });
});

describe('TABELLEN — enumeration_tabular → Stufe 2 mehrspaltig (Task 5)', () => {
  // Task 5 (22.6.2026): reichereMehrspaltig wird in parseSegment aufgerufen und
  // verschiebt ·/—-Tabellen-Text in block.mehrspaltig.
  // S4/T3 (BS-Audit 23.6.2026, deklarierte fachliche Änderung): die
  // enumeration_tabular wird NICHT mehr in den Caption-Absatz hineingemischt,
  // sondern als EIGENER Block emittiert. Dadurch verschmilzt die Caption nicht
  // mehr mit der ersten Tabellenzelle (kein Phantom-Spalten-Versatz, IWB §3) und
  // label-lose Tarif-Tabellen (StG §50/§131) werden positionsbasiert lesbar.
  // Der Caption-Absatz bleibt als vorangehender eigener Block stehen (visuell
  // identisch: Einleitungszeile über der Tabelle).
  it('emittiert Caption-Absatz + Tabellen-Block getrennt (S4/T3)', () => {
    const a = extrahiereLexWorkArtikel(LEXWORK_ZG1617_TABELLE_XHTML, '11');
    expect(a).not.toBeNull();
    expect(a!.bloecke).toHaveLength(2);
    // Block 0: der Caption-Absatz (eigener Absatz, KEINE Tabelle).
    const caption = a!.bloecke[0];
    expect(caption.text).toContain('beträgt die Entscheidgebühr:');
    expect(caption.mehrspaltig).toBeUndefined();
    expect(caption.text).not.toContain('Streitwert in Franken');
    // Block 1: der reine Tabellen-Block (text leer, Zellen in mehrspaltig).
    const tab = a!.bloecke[1];
    expect(tab.text).toBe('');
    expect(tab.mehrspaltig).toBeDefined();
    expect(tab.mehrspaltig!.kopf).toEqual([
      'Streitwert in Franken',
      'Gebühr in Franken',
      'jedoch höchstens % des Streitwerts',
    ]);
    // Erste Zeile: bis 1000, von 100 bis 200, leere 3. Spalte
    expect(tab.mehrspaltig!.zeilen[0]).toEqual(['bis 1000', 'von 100 bis 200', '']);
    // Zweite Zeile: über 1000 bis 3000, von 220 bis 540, 22
    expect(tab.mehrspaltig!.zeilen[1]).toEqual(['über 1000 bis 3000', 'von 220 bis 540', '22']);
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

    const r = await holeLexWork('bgs.zg.ch', 'de', '161.7');
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(r.meta).toEqual({
      titel: 'Kostenverordnung',
      abkuerzung: 'KoV OG',
      versionUid: 'abc123',
      stand: '2026-01-01',
      pdfUrl: 'https://bgs.zg.ch/api/de/versions/2963/pdf_file',
      nurPdf: false,
    });
    // Vollabdeckung (§7): ALLE Artikel des Erlasses, nicht nur die zitierten.
    // Die Beispiel-Fixture enthält § 1, § 2, § 3 → alle drei.
    expect(Object.keys(r.artikel).sort()).toEqual(['1', '2', '3']);
    expect(r.artikel['1'].bloecke[0].text).toContain('amtlichen Kosten');
    // Einheitliches Label aus dem Quell-Designator (article_symbol «§»): «§ N».
    expect(r.labels['1']).toBe('§ 1');
    expect(r.labels['2']).toBe('§ 2');
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

    const r = await holeLexWork('x', 'de', '1.1');
    expect(r.meta.nurPdf).toBe(true);
    expect(r.meta.pdfUrl).toBe('https://x/api/de/versions/1/pdf_file');
    expect(r.artikel).toEqual({});
  });

  it('wirft bei HTTP-Fehler', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 404 }) as unknown as Response),
    );
    await expect(holeLexWork('x', 'de', '1.1')).rejects.toThrow('HTTP 404');
  });
});
