/**
 * Tests für den ZH-PDF-Adapter (zhlex → notes.zh.ch) — reine Parser- und
 * Hilfsfunktionen gegen echte, gekürzte Quell-Ausschnitte (Fixture aus der
 * realen pdfjs-Extraktion der GebV OG, LS 211.11, abgerufen 16.6.2026).
 *
 * Prüft: §-Grenzen, Absätze, lit.-items, Silbentrennung, Umlaute, Stand-
 * Erkennung, quelleHash (stabil + inhaltssensitiv) sowie die Netz-Mechanik-
 * Helfer (OpenAttachment-URL + JS-Redirect-Auflösung).
 */
import { describe, it, expect } from 'vitest';
import {
  extrahiereZhParagraphen,
  extrahiereAlleZhParagraphen,
  berechneZhQuelleHash,
  leseZhStand,
  leseZhStandAusUrl,
  leseZhPublikationsdatum,
  leseAttachmentUrl,
  loeseRedirect,
} from '../../scripts/normtext/adapter-zh-pdf.ts';
import { ZH_GEBVOG_TEXT, ZH_GEBVOG_RANDTEXT } from './fixtures/zh-pdf-gebvog.ts';

describe('ZH-PDF-Adapter — §-Parser (GebV OG, LS 211.11)', () => {
  it('erkennt alle §-Grenzen § 1–5 als getrennte Artikel', () => {
    const alle = extrahiereAlleZhParagraphen(ZH_GEBVOG_TEXT);
    expect(Object.keys(alle).sort((a, b) => +a - +b)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
    ]);
  });

  it('§ 1: Einleitung + lit. a/b/c als items (Umlaute korrekt)', () => {
    const a = extrahiereZhParagraphen(ZH_GEBVOG_TEXT, '1');
    expect(a).not.toBeNull();
    expect(a!.bloecke[0].text).toBe(
      'Diese Verordnung regelt folgende Kosten eines Zivil- oder Strafverfahrens:',
    );
    const items = a!.bloecke[0].items!;
    expect(items.map((i) => i.marke)).toEqual(['a', 'b', 'c']);
    expect(items[0].text).toBe(
      'Gebühren für das Schlichtungsverfahren (Art. 95 Abs. 2 lit. a ZPO),',
    );
    expect(items[2].text).toContain('Strafgerichte');
  });

  it('§ 2: lit. a–d (Folgetext kleingeschrieben), Absatz 2, Silbentrennung «Gebüh-ren»', () => {
    const a = extrahiereZhParagraphen(ZH_GEBVOG_TEXT, '2');
    expect(a).not.toBeNull();
    expect(a!.bloecke[0].items!.map((i) => i.marke)).toEqual([
      'a',
      'b',
      'c',
      'd',
    ]);
    // Absatz 2 als eigener Block.
    const abs2 = a!.bloecke.find((b) => b.absatz === '2');
    expect(abs2).toBeDefined();
    // Silbentrennung «Gebüh-\nren» korrekt zu «Gebühren» zusammengefügt.
    expect(abs2!.text).toContain('in den Gebühren enthalten');
    expect(abs2!.text).not.toContain('Gebüh-');
    // Gliederungs-Überschrift «B. Schlichtungsverfahren» ist KEIN Normtext.
    expect(abs2!.text).not.toContain('Schlichtungsverfahren');
  });

  it('§ 4: Textanfang «Die Gebühren betragen», Absätze 1/2/3, Tabelle behalten', () => {
    const a = extrahiereZhParagraphen(ZH_GEBVOG_TEXT, '4');
    expect(a).not.toBeNull();
    // Absatz 1/2/3 (Bund-Konvention, Fix 22.6.2026): die «¹»-Hochzahl des ersten
    // Absatzes steht im PDF auf eigener Zeile VOR der «§ 4.»-Kopfzeile und wird
    // dem ersten Absatz zugeordnet → '1' statt früher fälschlich null.
    expect(a!.bloecke.map((b) => b.absatz)).toEqual(['1', '2', '3']);
    expect(a!.bloecke[0].text.startsWith('Die Gebühren betragen:')).toBe(true);
    // Gebührentabelle bleibt im Text (im Snapshot ersetzt die spaltenbewusste
    // Staffel-Extraktion diesen Flachtext, s. extrahiereZhStreitwertStaffel).
    expect(a!.bloecke[0].text).toContain('25% des Streitwertes');
    // Wortabstand aus der PDF-Geometrie (Fix 31.8.2026, WORT_LUECKE_PT): die
    // Tarifzeilen kommen so aus der Extraktion, wie sie gedruckt sind —
    // inklusive Tausender-Zwischenraum. Der frühere nachträgliche «Entkleber»
    // (entglueZhTarif) ist ersatzlos entfallen; er hatte diese Trennung nur
    // näherungsweise rekonstruiert und dabei Abkürzungen zerschnitten.
    expect(a!.bloecke[0].text).toContain('bis 1 000');
    expect(a!.bloecke[0].text).not.toContain('bis1000');
    expect(a!.bloecke[0].text).toContain('über 1 000');
    expect(a!.bloecke[0].text).toContain('zuzügl. 20% des');
    expect(a!.bloecke[0].text).toContain('Fr. 1 000 übersteigenden');
    expect(a!.bloecke[0].text).toContain('120 750');
    expect(a!.bloecke[0].text).toContain('Streitwert Grundgebühr');
    expect(a!.bloecke[0].text).toContain('(in Franken) (in Franken)');
    // Absatz 2: Silbentrennung «Zeitaufwan-\ndes» → «Zeitaufwandes».
    expect(a!.bloecke[1].text).toContain('Zeitaufwandes des Gerichts');
    expect(a!.bloecke[2].text).toContain('wiederkehrende Nutzungen');
  });

  it('§ 5: zwei Absätze, Silbentrennung über Seiten/Zeilen hinweg', () => {
    const a = extrahiereZhParagraphen(ZH_GEBVOG_TEXT, '5');
    expect(a).not.toBeNull();
    // Absatz 1/2 (Bund-Konvention, Fix 22.6.2026): erste «¹» dem 1. Absatz
    // zugeordnet → '1' statt früher null.
    expect(a!.bloecke.map((b) => b.absatz)).toEqual(['1', '2']);
    expect(a!.bloecke[0].text).toContain(
      'nach dem tatsächlichen Streitinteresse',
    );
    expect(a!.bloecke[0].text).toContain('Fr. 300 bis Fr. 13 000');
    // «Ver-\nfahren» und «Rechts-\nbegehren» korrekt zusammengefügt.
    expect(a!.bloecke[1].text).toContain('das Verfahren aufwendig');
    expect(a!.bloecke[1].text).toContain('vermögensrechtlichen Rechtsbegehren');
  });

  it('nicht vorhandener Artikel → null', () => {
    expect(extrahiereZhParagraphen(ZH_GEBVOG_TEXT, '999')).toBeNull();
  });
});

describe('ZH-PDF-Adapter — Stand', () => {
  it('liest den PDF-Kopf-Marker «1. 1. 15 - 87» → 2015-01-01', () => {
    expect(leseZhStand(ZH_GEBVOG_RANDTEXT)).toBe('2015-01-01');
  });

  it('liefert "" ohne Marker', () => {
    expect(leseZhStand('Gebührenverordnung des Obergerichts')).toBe('');
  });

  // FIX 1: stand = In-Kraft-Datum aus dem Registry-URL-Slug (zweites Tripel),
  // NICHT der Loseblatt-Druckstand aus dem PDF-Fussband.
  it('leseZhStandAusUrl: ZH-211.11 → 2011-01-01 (zweites Datum-Tripel = Inkrafttreten)', () => {
    expect(
      leseZhStandAusUrl(
        'https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung/zhlex-ls/erlass-211_11-2010_09_08-2011_01_01-087.html',
      ),
    ).toBe('2011-01-01');
  });

  it('leseZhStandAusUrl: liefert "" wenn das Slug-Muster nicht matcht (defensiv)', () => {
    expect(leseZhStandAusUrl('https://www.zh.ch/de/.../uebersicht.html')).toBe('');
  });

  // FIX 2 (Befund E2-H4, 31.8.2026): `stand` ist das Publikationsdatum der
  // geltenden Nachtragsfassung, nicht das Ur-Inkrafttreten aus dem URL-Slug und
  // nicht die Loseblatt-Ausgabemarke aus dem PDF-Fussband.
  it('leseZhPublikationsdatum: liest das amtliche Feld aus dem Registry-HTML', () => {
    // Wörtliches Markup der Registry-Seite von LS 175.2 (abgerufen 31.8.2026).
    const html =
      '<dl class="mdl-descriptionlist">\n                <dt>Publikationsdatum</dt>\n' +
      '                <dd>01.07.2026</dd>\n            </dl>';
    expect(leseZhPublikationsdatum(html)).toBe('2026-07-01');
  });

  it('leseZhPublikationsdatum: liefert "" ohne das Feld (Fallback greift)', () => {
    expect(leseZhPublikationsdatum('<dt>Erlassdatum</dt><dd>24.05.1959</dd>')).toBe('');
  });
});

describe('ZH-PDF-Adapter — quelleHash (Drift-Token)', () => {
  it('ist deterministisch (gleiche Eingabe → gleicher Hash)', () => {
    const a = extrahiereAlleZhParagraphen(ZH_GEBVOG_TEXT);
    const b = extrahiereAlleZhParagraphen(ZH_GEBVOG_TEXT);
    expect(berechneZhQuelleHash(a)).toBe(berechneZhQuelleHash(b));
    expect(berechneZhQuelleHash(a)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('ändert sich, wenn sich der Volltext ändert', () => {
    const original = berechneZhQuelleHash(
      extrahiereAlleZhParagraphen(ZH_GEBVOG_TEXT),
    );
    const verändert = berechneZhQuelleHash({
      ...extrahiereAlleZhParagraphen(ZH_GEBVOG_TEXT),
      '999': { bloecke: [{ absatz: null, text: 'Neuer Artikel' }] },
    });
    expect(verändert).not.toBe(original);
  });
});

// ABKÜRZUNGEN BLEIBEN UNVERSEHRT (31.8.2026, ersetzt den «St PO»-Artefakt-Fix
// vom 22.6.2026).
//
// Der frühere Nachbesserer entglueZhTarif() trennte an jedem Übergang
// Kleinbuchstabe→Grossbuchstabe und zerschnitt damit amtliche Abkürzungen:
// «StGB» → «St GB», «JStPO» → «JSt PO», «SchKG» → «Sch KG», «PartG» →
// «Part G», «BehiG» → «Behi G» (gemessen: 60+ Stellen in 13 ZH-Erlassen). Er
// war nur nötig, weil die Zeilenmontage ein Leerzeichen erst ab 18 pt setzte.
// Beide Ursachen sind weg; dieser Test hält fest, dass der Parser den Wortlaut
// jetzt unangetastet durchreicht (§1).
describe('ZH-PDF-Adapter — amtliche Abkürzungen bleiben unversehrt', () => {
  it('trennt zusammengesetzte Abkürzungen nicht (StGB/JStPO/SchKG/PartG)', () => {
    const textbasis =
      '§ 1.\nDas Gericht wendet StGB, JStPO, SchKG und PartG an.';
    const alle = extrahiereAlleZhParagraphen(textbasis);
    expect(alle['1']).toBeDefined();
    const text = alle['1']!.bloecke[0].text;
    expect(text).toBe('Das Gericht wendet StGB, JStPO, SchKG und PartG an.');
  });

  it('lässt den lat. Suffix am Paragraphen-Bereich zusammen («§§ 137bis–144»)', () => {
    const textbasis = '§ 1.\nAufgehoben sind die §§ 137bis–144 und §§ 235bis–235quater.';
    const alle = extrahiereAlleZhParagraphen(textbasis);
    expect(alle['1']!.bloecke[0].text).toBe(
      'Aufgehoben sind die §§ 137bis–144 und §§ 235bis–235quater.',
    );
  });
});

describe('ZH-PDF-Adapter — Netz-Mechanik-Helfer', () => {
  it('extrahiert die OpenAttachment-PDF-URL aus dem Registry-HTML', () => {
    const html =
      '<a class="x" download href="https://www.notes.zh.ch/appl/zhlex_r.nsf/' +
      'OpenAttachment?Open&amp;docid=ABC123&amp;file=211.11_8.9.10_87.pdf" target="_blank">PDF</a>';
    expect(leseAttachmentUrl(html)).toBe(
      'https://www.notes.zh.ch/appl/zhlex_r.nsf/OpenAttachment?Open&docid=ABC123&file=211.11_8.9.10_87.pdf',
    );
  });

  it('löst den JS-Redirect (window.location) gegen die notes.zh.ch-Basis auf', () => {
    const redirHtml =
      '<html><head><script>window.location="/appl/zhlex_r.nsf/WebView/' +
      'ABC123/$File/211.11_8.9.10_87.pdf"</script></head></html>';
    const basis =
      'https://www.notes.zh.ch/appl/zhlex_r.nsf/OpenAttachment?Open&docid=ABC123&file=211.11_8.9.10_87.pdf';
    expect(loeseRedirect(redirHtml, basis)).toBe(
      'https://www.notes.zh.ch/appl/zhlex_r.nsf/WebView/ABC123/$File/211.11_8.9.10_87.pdf',
    );
  });

  it('liefert null ohne window.location / ohne OpenAttachment', () => {
    expect(loeseRedirect('<html></html>', 'https://www.notes.zh.ch/')).toBeNull();
    expect(leseAttachmentUrl('<a href="https://x.ch/foo.pdf">x</a>')).toBeNull();
  });
});
