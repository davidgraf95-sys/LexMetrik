import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ArtikelBody } from '../components/normtext/ArtikelBody';
import { trenneAenderungshistorie, labelMitBereich, absatzMarke } from '../lib/normtext/darstellung';
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

  // M6 §1: Bei invertierter Verschachtelung (Ziff. → lit.) muss das Zitat der
  // verschachtelten lit. ihre Eltern-Ziff. tragen, und die NACHFOLGENDE Ziff.
  // darf NICHT fälschlich unter die lit. genestet werden. Die explizite tiefe
  // steuert das; die frühere Markentyp-Heuristik hätte hier falsch zitiert.
  it('M6: invertierte Verschachtelung — Zitat lit. a = «Ziff. 1bis lit. a», Ziff. 2 bleibt top-level', () => {
    const out = renderToString(
      <ArtikelBody
        artikel="16"
        zitierKontext={{ artikelLabel: 'Art. 16', kuerzel: 'BankG' }}
        passus={{ absatz: null }}
        bloecke={[{
          absatz: null, text: 'Als Depotwerte gelten:',
          items: [
            { marke: '1', text: 'bewegliche Sachen;' },
            { marke: '1bis', text: 'kryptobasierte Vermögenswerte:' },
            { marke: 'a', text: 'individuell zugeordnet;', tiefe: 1 },
            { marke: 'b', text: 'einer Gemeinschaft zugeordnet;', tiefe: 1 },
            { marke: '2', text: 'fiduziarisch innegehaltene Werte;' },
            { marke: '3', text: 'frei verfügbare Lieferansprüche.' },
          ],
        }]}
      />,
    );
    // Verschachtelte lit. a trägt die Eltern-Ziff.
    expect(out).toContain('Art. 16 Ziff. 1bis lit. a BankG');
    expect(out).toContain('Art. 16 Ziff. 1bis lit. b BankG');
    // Die nachfolgende Ziff. 2 ist KORREKT top-level (nicht «lit. … Ziff. 2»).
    expect(out).toContain('Art. 16 Ziff. 2 BankG');
    expect(out).not.toContain('lit. 1bis Ziff. 2'); // der alte Heuristik-Fehler
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

// Auftrag David 26.6.2026 (H/I/J): In der Lesesicht (zitierKontext) gilt:
//  J — beim Hover «poppt» NUR die angewählte Bestimmung pro Element leicht
//      heraus (<p> bzw. <li> je einzeln, vertikaler Lift hover:-translate-y-0.5) —
//      NICHT der ganze Block-<div> (kein Ganz-Absatz-Pop). Vertikaler Lift statt
//      Breiten-scale, damit am overflow-x-clip-Container NICHTS abgeschnitten wird
//      (P6); OHNE -mx-2/will-change und OHNE Rahmen (kein ring/shadow, P7).
//  I — Marken-Nummern (Absatznr. + lit./Ziff.) kleiner (text-body-s).
//  H — zk-Absatzmarke als feste Rinnen-Box (inline-block w-9, kein mr-3),
//      damit «2bis/2ter» die erste Textzeile nicht verschiebt.
// Das Popover (kein zitierKontext) bleibt byte-gleich (NormPopover.test.tsx golden).
describe('Lesesicht H/I/J — Pop pro Element, kleinere Marken, feste Rinne', () => {
  const zk = { artikelLabel: 'Art. 1', kuerzel: 'ZGB' };
  const out = () => renderToString(
    <ArtikelBody bloecke={bloecke} artikel="1" passus={{ absatz: null }} zitierKontext={zk} className="space-y-3" />,
  );
  it('J: Pop pro Element wieder da — <p>/<li> tragen den vertikalen Lift (hover:-translate-y-0.5)', () => {
    const o = out();
    expect(o).toContain('hover:-translate-y-0.5');
  });
  it('J: der Block-<div> selbst poppt NICHT (kein Pop auf der Block-Klasse)', () => {
    // Bei passus=null sind alle Blöcke nicht zitiert → Block-<div>-Klasse ist
    // exakt «leading-relaxed text-ink-700» (kein Lift/scale/ring/shadow).
    expect(out()).toContain('class="leading-relaxed text-ink-700"');
  });
  it('J/P6: kein Clipping (kein scale, kein -mx-2, kein will-change-transform)', () => {
    const o = out();
    expect(o).not.toContain('hover:scale-');
    expect(o).not.toContain('-mx-2');
    expect(o).not.toContain('will-change-transform');
  });
  it('J/P7: kein Rahmen (kein hover:ring / hover:shadow)', () => {
    const o = out();
    expect(o).not.toContain('hover:ring-');
    expect(o).not.toContain('hover:shadow-');
  });
  it('P5/P7: dezenter Hintergrund-Hover am Item bleibt erhalten', () => {
    expect(out()).toContain('hover:bg-brass-200/60');
  });
  it('I/H: zk-Absatzmarke ist kleiner (text-body-s) und feste Rinnen-Box (inline-block w-9, kein mr-3)', () => {
    const o = renderToString(
      <ArtikelBody bloecke={[{ absatz: '2', text: 'Zweiter Absatz.' }]} artikel="1" passus={{ absatz: null }} zitierKontext={zk} />,
    );
    expect(o).toContain('text-body-s');
    expect(o).toContain('inline-block');
    expect(o).toContain('w-9');
    expect(o).not.toContain('mr-3');
  });
  it('I: zk-Item-Marke ist kleiner (text-body-s) bei erhaltener Rinnen-Breite', () => {
    const o = renderToString(
      <ArtikelBody
        artikel="1"
        passus={{ absatz: null }}
        zitierKontext={zk}
        bloecke={[{ absatz: '1', text: 'Liste:', items: [{ marke: 'a', text: 'erster Buchstabe;' }] }]}
      />,
    );
    expect(o).toContain('w-6 text-right !font-medium !text-ink-500 text-body-s');
  });
  it('non-zk (Popover): kein Pop/Clipping/Rahmen, kein zk-Item-Hover', () => {
    const o = renderToString(
      <ArtikelBody bloecke={bloecke} artikel="1" passus={{ absatz: null }} />,
    );
    expect(o).not.toContain('hover:scale-');
    expect(o).not.toContain('hover:-translate-y-0.5');
    expect(o).not.toContain('hover:bg-brass-200/60');
    expect(o).not.toContain('hover:ring-');
    expect(o).not.toContain('hover:shadow-');
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

// ── M6 (Auftrag David): Fremdgesetz-Chapeau — bare Item-Verweise nicht intern
// fehl-verlinken (ZGB Art. 89a Abs. 6/7 zitieren BVG-Artikel, nicht ZGB). ───────
describe('M6 — Fremdgesetz-Chapeau unterdrückt falsche bare-Self-Links', () => {
  const intern = { tokenMap: new Map([['52', '52'], ['1', '1']]), basisPfad: '/gesetze/bund/ZGB', springeZu: () => {} };
  it('«Art. 52» in einem BVG-Chapeau-Item → KEIN interner #art-52-Sprunglink', () => {
    const bl: NormSnapshot['bloecke'] = [{
      absatz: '6',
      text: 'Für Personalfürsorgestiftungen … gelten überdies die folgenden Bestimmungen des Bundesgesetzes vom 25. Juni 1982 über die berufliche … Vorsorge (BVG) über:',
      items: [{ marke: '3', text: 'die Verantwortlichkeit (Art. 52);' }],
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bl} artikel="89_a" passus={{ absatz: null }} autolink intern={intern}
        zitierKontext={{ artikelLabel: 'Art. 89a', kuerzel: 'ZGB' }} />,
    );
    expect(out).toContain('Art. 52'); // Wortlaut bleibt
    expect(out).not.toContain('#art-52'); // aber kein falscher Self-Link
  });
  it('Kontrolle: dasselbe «Art. 52» in einem NORMALEN Item bleibt intern verlinkt', () => {
    const bl: NormSnapshot['bloecke'] = [{
      absatz: '1', text: 'Es gelten folgende Regeln:',
      items: [{ marke: 'a', text: 'die Sache nach Art. 52;' }],
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bl} artikel="1" passus={{ absatz: null }} autolink intern={intern}
        zitierKontext={{ artikelLabel: 'Art. 1', kuerzel: 'ZGB' }} />,
    );
    expect(out).toContain('#art-52'); // korrekter Self-Link
  });
});
