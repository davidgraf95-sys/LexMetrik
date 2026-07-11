import { describe, it, expect } from 'vitest';
import { parseBgeZitat, baueBgeIndex, parseBgeSprung, bgerPermalink } from '../lib/suche/bgeQuery';

// Akzeptanztests des BGE-Zitat-Parsers (UI-NAV S2 · FAHRPLAN-UI-NAVIGATION §2).
// Deterministisch, ohne Suchindex. Positivfälle prüfen die Zitat-Zerlegung
// (mit/ohne Präfix, FR/IT-Präfix, Ia-Suffix) und die Bestands-Auflösung
// (intern vs. amtlicher Extern-Link); Negativfälle beweisen, dass Freitext
// KEINEN Fehl-Sprung liefert (→ normale Suche).

describe('parseBgeZitat — Positivfälle', () => {
  const positiv: [string, { band: number; teil: string; seite: number; anzeige: string }][] = [
    ['BGE 152 I 65', { band: 152, teil: 'I', seite: 65, anzeige: 'BGE 152 I 65' }],
    ['152 II 19', { band: 152, teil: 'II', seite: 19, anzeige: 'BGE 152 II 19' }],
    ['bge 145 iii 63', { band: 145, teil: 'III', seite: 63, anzeige: 'BGE 145 III 63' }],
    ['ATF 150 IV 1', { band: 150, teil: 'IV', seite: 1, anzeige: 'BGE 150 IV 1' }],
    ['DTF 149 V 200', { band: 149, teil: 'V', seite: 200, anzeige: 'BGE 149 V 200' }],
    ['BGE 120 Ia 1', { band: 120, teil: 'Ia', seite: 1, anzeige: 'BGE 120 Ia 1' }],
    ['  152   I   65  ', { band: 152, teil: 'I', seite: 65, anzeige: 'BGE 152 I 65' }],
  ];
  it.each(positiv)('%s', (q, erwartet) => {
    const z = parseBgeZitat(q)!;
    expect(z).not.toBeNull();
    expect({ band: z.band, teil: z.teil, seite: z.seite, anzeige: z.anzeige }).toEqual(erwartet);
  });
});

describe('parseBgeZitat — Negativfälle (→ normale Suche)', () => {
  const negativ = [
    '',                 // leer
    'Kündigung',        // Freitext
    'OR 257d',          // Norm-Zitat, kein BGE
    '152 VI 3',         // VI ist keine BGE-Abteilung
    '152 I',            // Seite fehlt
    'II 19',            // Band fehlt
    '152 I 65 Mietrecht', // Fremdwort daneben → kein Fehl-Sprung
    '5A_123/2024',      // Aktenzeichen, kein BGE
    'BGE',              // nur Präfix
  ];
  it.each(negativ)('%j → null', (q) => {
    expect(parseBgeZitat(q)).toBeNull();
  });
});

describe('bgerPermalink — amtliches CLIR-Format', () => {
  it('baut den docid-Permalink identisch zum Snapshot-quelleUrl', () => {
    const z = parseBgeZitat('BGE 152 I 65')!;
    expect(bgerPermalink(z)).toBe(
      'https://search.bger.ch/ext/eurospider/live/de/php/clir/http/index.php?highlight_docid=atf%3A%2F%2F152-I-65%3Ade&lang=de&zoom=&type=show_document',
    );
  });
});

describe('parseBgeSprung — Bestands-Auflösung', () => {
  // Index aus dem Manifest-Format: bgeReferenz OHNE «BGE»-Präfix, wie im Register.
  const index = baueBgeIndex([
    { bgeReferenz: '152 I 65', key: 'bge_152_I_65' },
    { bgeReferenz: '150 IV 1', key: 'bge_150_IV_1' },
    { bgeReferenz: null, key: 'kger_x' }, // ohne BGE-Referenz → ignoriert
  ]);

  it('im Bestand → interner Sprung auf den Register-Key', () => {
    const s = parseBgeSprung('BGE 152 I 65', index)!;
    expect(s.imBestand).toBe(true);
    expect(s.key).toBe('bge_152_I_65');
    expect(s.zitat).toBe('BGE 152 I 65');
    expect(s.laedt).toBeUndefined();
  });

  it('ohne Präfix, im Bestand', () => {
    expect(parseBgeSprung('150 IV 1', index)!.key).toBe('bge_150_IV_1');
  });

  it('nicht im Bestand → §8-ehrlich: kein Key, aber amtlicher Extern-Link', () => {
    const s = parseBgeSprung('BGE 145 III 63', index)!;
    expect(s.imBestand).toBe(false);
    expect(s.key).toBeNull();
    expect(s.amtlichHref).toContain('atf%3A%2F%2F145-III-63%3Ade');
  });

  it('Index lädt noch (null) → laedt, kein voreiliges «nicht im Bestand»', () => {
    const s = parseBgeSprung('BGE 152 I 65', null)!;
    expect(s.laedt).toBe(true);
    expect(s.imBestand).toBe(false);
  });

  it('Freitext → null (kein Sprung)', () => {
    expect(parseBgeSprung('Mietzins', index)).toBeNull();
    expect(parseBgeSprung('OR 257d', index)).toBeNull();
  });
});
