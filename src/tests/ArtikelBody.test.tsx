import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ArtikelBody } from '../components/normtext/ArtikelBody';
import { trenneAenderungshistorie, labelMitBereich, randtitelTeile, randtitelEintraege, absatzMarke } from '../lib/normtext/darstellung';
import type { NormSnapshot } from '../lib/normtext/typen';

// ArtikelBody ist die aus NormPopover extrahierte Render-Komponente. Die
// Byte-Gleichheit gegenüber dem alten Popover-Body sichert NormPopover.test.tsx
// (unverändert). Hier nur die eigenständige Vertrags-Prüfung.

const bloecke: NormSnapshot['bloecke'] = [
  { absatz: '1', text: 'Erster Absatz mit Inhalt.' },
  { absatz: '2', text: 'Zweiter Absatz mit Inhalt.' },
  {
    absatz: '3', text: 'Dritter Absatz mit Liste:',
    items: [
      { marke: 'a', text: 'erster Buchstabe;' },
      { marke: 'b', text: 'zweiter Buchstabe.' },
    ],
  },
];

const render = (
  passus: { absatz: string | null; lit?: string; ziff?: string },
  artikel = '1',
  className?: string,
) => renderToString(<ArtikelBody bloecke={bloecke} artikel={artikel} passus={passus} className={className} />);

describe('ArtikelBody', () => {
  it('rendert alle Blöcke + Items', () => {
    const out = render({ absatz: null });
    expect(out).toContain('Erster Absatz mit Inhalt.');
    expect(out).toContain('Zweiter Absatz mit Inhalt.');
    expect(out).toContain('a.');
    expect(out).toContain('zweiter Buchstabe.');
    expect(out.match(/data-passus=/g)!.length).toBe(3);
  });

  it('Default-className ist das Popover-Padding (Byte-Gleichheit)', () => {
    const out = render({ absatz: null });
    expect(out).toContain('px-5 py-4 space-y-2.5');
  });

  it('eigene className überschreibt das Default-Padding (Lesesicht)', () => {
    const out = render({ absatz: null }, '1', 'space-y-4');
    expect(out).toContain('class="space-y-4"');
    expect(out).not.toContain('px-5 py-4 space-y-2.5');
  });

  it('markiert den zitierten Absatz (data-passus="true")', () => {
    const out = render({ absatz: '2' });
    expect(out.match(/data-passus="true"/g)!.length).toBe(1);
    expect(out.split('data-passus="true"')[1]).toContain('Zweiter Absatz');
  });

  it('markiert genau das zitierte Item (data-passus-item="true")', () => {
    const out = render({ absatz: '3', lit: 'b' });
    expect(out.match(/data-passus-item="true"/g)!.length).toBe(1);
    expect(out.split('data-passus-item="true"')[1]).toContain('zweiter Buchstabe');
  });

  it('aufgehobene Stelle («…») → «aufgehoben»', () => {
    const out = renderToString(
      <ArtikelBody bloecke={[{ absatz: '1', text: '…' }]} artikel="1" passus={{ absatz: null }} />,
    );
    expect(out).toContain('aufgehoben');
    expect(out).not.toContain('>…<');
  });

  // S3 (BS-Audit 23.6.2026): aufgehobene lit. werden mit Marke + LEEREM Text
  // gespeichert (kein fabrizierter «Aufgehoben.»-Text). Die Lesesicht zeigt das
  // leere item gedämpft als «aufgehoben», die Marke (hier «g.») bleibt sichtbar.
  it('lit. mit Marke aber leerem Text → Marke sichtbar, Text «aufgehoben»', () => {
    const out = renderToString(
      <ArtikelBody
        artikel="35"
        passus={{ absatz: null }}
        bloecke={[
          {
            absatz: '1', text: 'Vom Einkommen werden abgezogen:',
            items: [
              { marke: 'f', text: '3300 Franken;' },
              { marke: 'g', text: '' },
              { marke: 'h', text: '18500 Franken.' },
            ],
          },
        ]}
      />,
    );
    expect(out).toContain('g.'); // Marke bleibt sichtbar (Lücke geschlossen)
    expect(out).toContain('aufgehoben'); // leeres item gedämpft
  });

  it('autolink: verlinkt zitierte Normen im Wortlaut, aus = Klartext', () => {
    const bl = [{ absatz: '1', text: 'Der Schuldner haftet nach Art. 41 OR für den Schaden.' }];
    const mitLink = renderToString(<ArtikelBody bloecke={bl} artikel="1" passus={{ absatz: null }} autolink />);
    expect(mitLink).toContain('decoration-dotted'); // NormText-Inline-Anker
    expect(mitLink).toContain('Art. 41 OR');
    const ohneLink = renderToString(<ArtikelBody bloecke={bl} artikel="1" passus={{ absatz: null }} />);
    expect(ohneLink).not.toContain('decoration-dotted');
    expect(ohneLink).toContain('Art. 41 OR');
  });
});

// Auftrag David 26.6.2026 (P5/P6/P7): In der Lesesicht (zitierKontext) soll beim
// Hover NUR das angewählte lit./Ziff.-Item dezent reagieren — kein Ganz-Absatz-
// «Rauspoppen» (Scale), kein dadurch abgeschnittener Text (-mx-2/scale), kein
// umrandender Kasten (ring/shadow). Das Popover (kein zitierKontext) bleibt
// byte-gleich (NormPopover.test.tsx golden).
describe('Lesesicht-Hover ohne Pop/Clipping/Rahmen (P5/P6/P7)', () => {
  const zk = { artikelLabel: 'Art. 1', kuerzel: 'ZGB' };
  const out = () => renderToString(
    <ArtikelBody bloecke={bloecke} artikel="1" passus={{ absatz: null }} zitierKontext={zk} className="space-y-3" />,
  );
  it('P5/P6: kein hover:scale / will-change / -mx-2 am Absatz-Block (kein Ganz-Absatz-Pop, kein Clipping)', () => {
    const o = out();
    expect(o).not.toContain('hover:scale-');
    expect(o).not.toContain('will-change-transform');
    expect(o).not.toContain('-mx-2');
  });
  it('P7: kein Rahmen am Item (kein hover:ring / hover:shadow)', () => {
    const o = out();
    expect(o).not.toContain('hover:ring-');
    expect(o).not.toContain('hover:shadow-');
  });
  it('P5/P7: dezenter Hintergrund-Hover am Item bleibt erhalten', () => {
    expect(out()).toContain('hover:bg-brass-200/60');
  });
});

describe('trenneAenderungshistorie (§3 — Extraktions-Artefakt-Trennung)', () => {
  it('in-Kraft-Artikel mit angehängter Fussnote: Wortlaut bleibt, Historie abgetrennt, doppelte Nr weg', () => {
    const t = 'Artikel 20 Absatz 3 ist sinngemäss anwendbar. 53 53 Fassung gemäss Ziff. I des BG vom 20. März 1998 (AS 2000 1569).';
    const { wortlaut, historie } = trenneAenderungshistorie(t);
    expect(wortlaut).toBe('Artikel 20 Absatz 3 ist sinngemäss anwendbar.');
    expect(historie).toBe('Fassung gemäss Ziff. I des BG vom 20. März 1998 (AS 2000 1569).');
    expect(wortlaut).not.toContain('53 53');
  });

  it('Ganzkörper-Aufhebung mit geleaktem Label-Rest: Wortlaut leer, Historie ohne Rest/Doppel-Nr', () => {
    const { wortlaut, historie } = trenneAenderungshistorie('– 274 g 113 113 Aufgehoben durch Anhang 1 Ziff. II 5 der ZPO.');
    expect(wortlaut).toBe('');
    expect(historie).toBe('Aufgehoben durch Anhang 1 Ziff. II 5 der ZPO.');
  });

  it('Buchstaben-Suffix-Leak («g 25 25 Eingefügt …») wird verworfen', () => {
    const { wortlaut, historie } = trenneAenderungshistorie('g 25 25 Eingefügt durch Ziff. I des BG vom 5. Okt. 1990.');
    expect(wortlaut).toBe('');
    expect(historie).toContain('Eingefügt durch');
  });

  it('normaler Normtext bleibt unangetastet (keine Doppel-Nr → keine Trennung)', () => {
    const t = 'Wer einem anderen widerrechtlich Schaden zufügt, wird ihm zum Ersatz verpflichtet.';
    const { wortlaut, historie } = trenneAenderungshistorie(t);
    expect(wortlaut).toBe(t);
    expect(historie).toBeNull();
  });

  it('render: Ganzkörper-Aufhebung → «aufgehoben», KEIN Artefakt im Wortlaut (Historie gehört an den Fuss)', () => {
    const out = renderToString(
      <ArtikelBody bloecke={[{ absatz: null, text: 'g 25 25 Eingefügt durch Ziff. I des BG vom 5. Okt. 1990.' }]}
        artikel="40_g" passus={{ absatz: null }} />,
    );
    expect(out).toContain('aufgehoben');
    expect(out).not.toContain('25 25');
    expect(out).not.toContain('Eingefügt durch'); // Historie nicht im Wortlaut-Block
    expect(out).not.toMatch(/>\s*g 25/);
  });

  it('render: in-Kraft-Artikel mit angehängter Fussnote → Wortlaut bleibt, Artefakt weg', () => {
    const out = renderToString(
      <ArtikelBody bloecke={[{ absatz: null, text: 'Der Arbeitnehmer hat Anspruch auf Ruhezeit. 53 53 Fassung gemäss Ziff. I des BG.' }]}
        artikel="21" passus={{ absatz: null }} />,
    );
    expect(out).toContain('Der Arbeitnehmer hat Anspruch auf Ruhezeit.');
    expect(out).not.toContain('53 53');
    expect(out).not.toContain('Fassung gemäss'); // Historie aus dem Wortlaut entfernt
  });
});

describe('labelMitBereich (Halbgeviert für Bereichs-Artikel)', () => {
  it('rekonstruiert das Halbgeviert aus der id', () => {
    expect(labelMitBereich('Art. 226a226d', '226_a_226_d')).toBe('Art. 226a–226d');
    expect(labelMitBereich('Art. 6770', '67_70')).toBe('Art. 67–70');
    expect(labelMitBereich('Art. 274274g', '274_274_g')).toBe('Art. 274–274g');
  });
  it('lässt Einzelartikel und Buchstaben-Suffixe unberührt', () => {
    expect(labelMitBereich('Art. 335c', '335_c')).toBe('Art. 335c');
    expect(labelMitBereich('Art. 40g', '40_g')).toBe('Art. 40g');
    expect(labelMitBereich('§ 11', '11')).toBe('§ 11');
  });
  it('erhält den Paragraphen-Präfix (Kanton)', () => {
    expect(labelMitBereich('§ 1215', '12_15')).toBe('§ 12–15');
  });
});

describe('randtitelTeile (Randtitel für die Meta-Spalte)', () => {
  it('strippt Aufzähler, oberste Stufen → ober, unterste → titel', () => {
    expect(randtitelTeile(['A. Abschluss des Vertrages', 'I. Übereinstimmende Willensäusserung', '1. Im Allgemeinen']))
      .toEqual({ ober: ['Abschluss des Vertrages', 'Übereinstimmende Willensäusserung'], titel: 'Im Allgemeinen' });
  });
  it('einzelner Randtitel ist der titel (kein ober)', () => {
    expect(randtitelTeile(['A. Anwendung des Rechts'])).toEqual({ ober: [], titel: 'Anwendung des Rechts' });
  });
  it('leere Marginalie → leer', () => {
    expect(randtitelTeile([])).toEqual({ ober: [], titel: null });
  });
});

describe('randtitelEintraege (schmale Ansicht — Aufzähler erhalten)', () => {
  it('trennt Mark und Titel je Stufe', () => {
    expect(randtitelEintraege(['A. Abschluss des Vertrages', '1. Im Allgemeinen']))
      .toEqual([{ mark: 'A.', titel: 'Abschluss des Vertrages' }, { mark: '1.', titel: 'Im Allgemeinen' }]);
  });
  it('ohne Aufzähler bleibt mark leer', () => {
    expect(randtitelEintraege(['Schlussbestimmung'])).toEqual([{ mark: '', titel: 'Schlussbestimmung' }]);
  });
  it('aufgehobener Randtitel («C. …») erscheint NICHT als Heading', () => {
    expect(randtitelTeile(['C. …'])).toEqual({ ober: [], titel: null });
    expect(randtitelEintraege(['C. …'])).toEqual([]);
  });
  it('kombinierter Aufzähler mit Auslassung («II. und III. …») wird verworfen', () => {
    expect(randtitelTeile(['II. und III. …'])).toEqual({ ober: [], titel: null });
    expect(randtitelEintraege(['II. und III. …'])).toEqual([]);
  });
});

describe('TarifTabelle (block.tabelle → 2-Spalten-Tarif)', () => {
  it('rendert tabelle als 2-Spalten-Tarif (Beschreibung + Betrag)', () => {
    const bloeckeTabelle: NormSnapshot['bloecke'] = [{
      absatz: null, text: '',
      tabelle: [
        { beschreibung: 'Vorladung', betrag: '6.—' },
        { beschreibung: 'Mahnung', betrag: '10.— bis 50.—' },
      ],
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bloeckeTabelle} artikel="5" passus={{ absatz: null }} />,
    );
    expect(out).toContain('Vorladung');
    expect(out).toContain('6.—');
    expect(out).toContain('Mahnung');
    expect(out).toContain('10.— bis 50.—');
  });

  it('betrag ≥4 Stellen bekommt Schweizer Apostroph (§3 — Stufe-2-D)', () => {
    const bloeckeTabelle: NormSnapshot['bloecke'] = [{
      absatz: null, text: '',
      tabelle: [{ beschreibung: 'X', betrag: '2000.—' }],
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bloeckeTabelle} artikel="5" passus={{ absatz: null }} />,
    );
    // React SSR escapes U+0027 as &#x27; — check both forms
    expect(out).toMatch(/2&#x27;000\.—|2'000\.—/);
    expect(out).not.toContain('>2000.—<');
  });

  it('beschreibung-Spalte wird NICHT formatiert (§1: nur betrag)', () => {
    const bloeckeTabelle: NormSnapshot['bloecke'] = [{
      absatz: null, text: '',
      tabelle: [{ beschreibung: 'Streitwert bis 10000', betrag: '200.—' }],
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bloeckeTabelle} artikel="5" passus={{ absatz: null }} />,
    );
    // beschreibung bleibt literal (10000 nicht formatiert)
    expect(out).toContain('Streitwert bis 10000');
  });

  it('block ohne tabelle rendert byte-identisch (kein Fragment-Wrapper)', () => {
    // Normaler Block — kein tabelle → Render-Pfad unverändert.
    const bl: NormSnapshot['bloecke'] = [{ absatz: '1', text: 'Normaler Absatz.' }];
    const out = renderToString(<ArtikelBody bloecke={bl} artikel="1" passus={{ absatz: null }} />);
    expect(out).toContain('Normaler Absatz.');
    // Kein Fragment-Marker und keine table-spezifischen Klassen.
    expect(out).not.toContain('tabular-nums');
  });
});

describe('absatzMarke (bis/ter-Rekonstruktion, §3 — Wortlaut unangetastet)', () => {
  it('null-Absatz mit «1bis …» am Textanfang → Marke 1bis, Rest ohne Marke', () => {
    expect(absatzMarke(null, '1bis Wurde in einer Zivilsache …'))
      .toEqual({ marke: '1bis', rest: 'Wurde in einer Zivilsache …' });
  });
  it('geleakter Suffix («absatz=1», Text «bis Erfordert …») → 1bis', () => {
    expect(absatzMarke('1', 'bis Erfordert die Erstellung eines Schriftstücks …'))
      .toEqual({ marke: '1bis', rest: 'Erfordert die Erstellung eines Schriftstücks …' });
  });
  it('echtes Wort «bis» am Satzanfang («bis zum Ablauf …») bleibt UNANGETASTET', () => {
    expect(absatzMarke('1', 'bis zum Ablauf der Frist gilt das alte Recht.'))
      .toEqual({ marke: '1', rest: 'bis zum Ablauf der Frist gilt das alte Recht.' });
  });
  it('normaler Absatz unverändert', () => {
    expect(absatzMarke('2', 'Der Vertrag ist nichtig.')).toEqual({ marke: '2', rest: 'Der Vertrag ist nichtig.' });
  });
});
