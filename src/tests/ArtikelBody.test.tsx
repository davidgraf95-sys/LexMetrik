import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ArtikelBody } from '../components/normtext/ArtikelBody';
import { trenneAenderungshistorie, labelMitBereich } from '../lib/normtext/darstellung';
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
