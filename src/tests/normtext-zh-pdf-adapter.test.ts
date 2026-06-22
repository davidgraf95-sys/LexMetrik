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
    // Gebührentabelle bleibt im Text (Inhalt vorhanden, wenn auch Zahlen-eng).
    expect(a!.bloecke[0].text).toContain('25% des Streitwertes');
    expect(a!.bloecke[0].text).toContain('120750');
    // Entkleben (Bug-Fix 16.6.2026): Tarif-Tabellen-Fragmente werden an
    // eindeutigen Grenzen getrennt — «bis1000» → «bis 1000», «zuzügl.20%des»
    // → «zuzügl. 20% des», «Fr.1000» → «Fr. 1000», «)(» → «) (», Spaltenkopf
    // «StreitwertGrundgebühr» → «Streitwert Grundgebühr».
    expect(a!.bloecke[0].text).toContain('bis 1000');
    expect(a!.bloecke[0].text).not.toContain('bis1000');
    expect(a!.bloecke[0].text).toContain('über 1000');
    expect(a!.bloecke[0].text).toContain('zuzügl. 20% des');
    expect(a!.bloecke[0].text).toContain('Fr. 1000 übersteigenden');
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

// FIX 1 — 22.6.2026: «St PO» → «StPO» (Spalten-Lücken-Artefakt).
// Der ZH-PDF-Adapter fügt an Spaltengrenz-Lücken ein Leerzeichen ein; bei der
// Abkürzung «StPO» (Strafprozessordnung) in ZH-211.11 ergibt das fälschlich
// «St PO». Die entglueZhTarif-Funktion (über extrahiereAlleZhParagraphen testbar)
// korrigiert dieses Artefakt vor der Snapshot-Speicherung (§1-sicher: «St PO»
// mit Leerzeichen kommt in korrekter ZH-Rechtsprosa nicht vor).
describe('ZH-PDF-Adapter — StPO-Artefakt-Fix (St PO → StPO)', () => {
  it('«St PO» im Fliesstext wird zu «StPO» (Spalten-Artefakt entfernt)', () => {
    // Minimale, parser-kompatible Textbasis mit «§ 1.» Artikel und «St PO».
    const textbasis = '§ 1.\nDieses Gesetz gilt für Verfahren nach der St PO und nach der ZPO.';
    const alle = extrahiereAlleZhParagraphen(textbasis);
    expect(alle['1']).toBeDefined();
    const text = alle['1']!.bloecke[0].text;
    expect(text).toContain('StPO');
    expect(text).not.toContain('St PO');
  });

  it('«St PO» direkt vor Buchstaben («St PObemisst») → «StPO bemisst» (ZH-215.3-Stil)', () => {
    const textbasis = '§ 1.\nVorverfahren nach Art. 299 ff. St PObemisst sich die Gebühr.';
    const alle = extrahiereAlleZhParagraphen(textbasis);
    const text = alle['1']!.bloecke[0].text;
    expect(text).toContain('StPO bemisst');
    expect(text).not.toContain('St PO');
  });

  it('«StPO» (kein Leerzeichen) bleibt unverändert (idempotent)', () => {
    const textbasis = '§ 1.\nRegelung nach der StPO.';
    const alle = extrahiereAlleZhParagraphen(textbasis);
    expect(alle['1']?.bloecke[0].text).toContain('StPO');
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
