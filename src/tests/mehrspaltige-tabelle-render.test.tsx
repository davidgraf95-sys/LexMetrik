import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ArtikelBody } from '../components/normtext/ArtikelBody';
import type { NormSnapshot } from '../lib/normtext/typen';

// Task 2: MehrspaltigeTabelle — Render-Komponente
// Sichert: Kopf + Zeilen korrekt; numerische Zellen gruppiert; nicht-numerische
// Zellen unverändert; Blöcke OHNE mehrspaltig byte-identisch.

describe('MehrspaltigeTabelle (block.mehrspaltig → N-Spalten-Tarif)', () => {
  it('rendert Kopfzeile aus kopf[]', () => {
    const bloecke: NormSnapshot['bloecke'] = [{
      absatz: null,
      text: '',
      mehrspaltig: {
        kopf: ['Streitwert', 'Grundgebühr', 'Zuschlag'],
        zeilen: [['bis 5000', '25', '0%']],
      },
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bloecke} artikel="4" passus={{ absatz: null }} />,
    );
    expect(out).toContain('Streitwert');
    expect(out).toContain('Grundgebühr');
    expect(out).toContain('Zuschlag');
  });

  it('rendert Datenzeilen — gruppiereTausender gilt für ALLE Zellen (Issue 2+3, 22.6.2026)', () => {
    // gruppiereTausender wird auf JEDE Zelle angewendet (nicht nur numerische).
    // istNumerischeZelle steuert NUR noch die Rechtsbündigkeit.
    const bloecke: NormSnapshot['bloecke'] = [{
      absatz: null,
      text: '',
      mehrspaltig: {
        kopf: ['A', 'B'],
        zeilen: [
          ['bis 5000', '250'],
          ['über 5000 bis 10000', '1250'],
        ],
      },
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bloecke} artikel="4" passus={{ absatz: null }} />,
    );
    // «bis 5000» → «bis 5'000» (gruppiereTausender auf bare run)
    expect(out).toMatch(/bis 5&#x27;000|bis 5'000/);
    // «über 5000 bis 10000» — TEXT-Zelle, aber gruppiereTausender gilt trotzdem
    // → «über 5'000 bis 10'000»
    expect(out).toMatch(/über 5&#x27;000 bis 10&#x27;000|über 5'000 bis 10'000/);
    // «1250» → «1'250»
    expect(out).toMatch(/1&#x27;250|1'250/);
  });

  it('numerische Zelle «1250» → «1\'250» (gruppiereTausender)', () => {
    const bloecke: NormSnapshot['bloecke'] = [{
      absatz: null,
      text: '',
      mehrspaltig: {
        zeilen: [['1250']],
      },
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bloecke} artikel="4" passus={{ absatz: null }} />,
    );
    // React SSR escapes U+0027 as &#x27; — accept both forms
    expect(out).toMatch(/1&#x27;250|1'250/);
    expect(out).not.toContain('>1250<');
  });

  it('numerische Zelle «bis 10000» → «bis 10\'000» («bis» = 3 Buchstaben → numerisch)', () => {
    const bloecke: NormSnapshot['bloecke'] = [{
      absatz: null,
      text: '',
      mehrspaltig: {
        zeilen: [['bis 10000', '1000']],
      },
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bloecke} artikel="4" passus={{ absatz: null }} />,
    );
    // «bis 10000» — «bis» hat 3 Buchstaben, kein Wort mit ≥4 Buchstaben → numerisch → gruppiert
    expect(out).toMatch(/bis 10&#x27;000|bis 10'000/);
  });

  it('Zelle «über 1 Mio.» bleibt UNVERÄNDERT (hat 4-Buchstaben-Wort «über»)', () => {
    const bloecke: NormSnapshot['bloecke'] = [{
      absatz: null,
      text: '',
      mehrspaltig: {
        zeilen: [['über 1 Mio.', '5000']],
      },
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bloecke} artikel="4" passus={{ absatz: null }} />,
    );
    // «über» hat 4 Buchstaben → kein gruppiereTausender; Zelle bleibt unverändert
    expect(out).toContain('über 1 Mio.');
    // «5000» hat kein 4-Buchstaben-Wort → wird zu «5'000»
    expect(out).toMatch(/5&#x27;000|5'000/);
  });

  it('data-mehrspaltig-Attribut ist gesetzt', () => {
    const bloecke: NormSnapshot['bloecke'] = [{
      absatz: null,
      text: '',
      mehrspaltig: { zeilen: [['A', 'B']] },
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bloecke} artikel="4" passus={{ absatz: null }} />,
    );
    expect(out).toContain('data-mehrspaltig');
  });

  it('Block OHNE mehrspaltig hat KEIN data-mehrspaltig + Normaltext unverändert', () => {
    const bloecke: NormSnapshot['bloecke'] = [
      { absatz: '1', text: 'Normaler Absatz ohne Tabelle.' },
    ];
    const out = renderToString(
      <ArtikelBody bloecke={bloecke} artikel="1" passus={{ absatz: null }} />,
    );
    expect(out).toContain('Normaler Absatz ohne Tabelle.');
    expect(out).not.toContain('data-mehrspaltig');
  });

  it('mehrspaltig ohne kopf: keine Kopfzeile, nur Datenzeilen', () => {
    const bloecke: NormSnapshot['bloecke'] = [{
      absatz: null,
      text: '',
      mehrspaltig: {
        zeilen: [['250', '10%']],
      },
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bloecke} artikel="4" passus={{ absatz: null }} />,
    );
    // Kein bg-paper-sunken Kopf-span falls kein kopf
    expect(out).toContain('data-mehrspaltig');
    // Werte sind vorhanden
    expect(out).toMatch(/250|10%/);
  });

  it('Dash-Betrag «1250.–» enthält Tausender-Apostroph', () => {
    const bloecke: NormSnapshot['bloecke'] = [{
      absatz: null,
      text: '',
      mehrspaltig: {
        zeilen: [['1250.–']],
      },
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bloecke} artikel="4" passus={{ absatz: null }} />,
    );
    // «1250.–» hat Ziffern, kein 4-Buchstaben-Wort → numerisch → 1'250.–
    expect(out).toMatch(/1&#x27;250\.–|1'250\.–/);
  });

  // Issue 2+3 (22.6.2026): gruppiereTausender auf ALLE Zellen — Sicherheitstests

  it('Streitwert-Spalte «über 5 000 bis 10 000» → Apostrophe (Issue 3)', () => {
    // Leerzeichen-getrennte Tausender im Streitwert-Text werden apostrophiert.
    const bloecke: NormSnapshot['bloecke'] = [{
      absatz: null,
      text: '',
      mehrspaltig: {
        kopf: ['Streitwert', 'Grundgebühr', 'Zuschlag'],
        zeilen: [['über 5 000 bis 10 000', '1 250', 'zuzügl. 23%']],
      },
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bloecke} artikel="4" passus={{ absatz: null }} />,
    );
    // Streitwert-Spalte: Leerzeichen-Tausender apostrophiert
    expect(out).toMatch(/über 5&#x27;000 bis 10&#x27;000|über 5'000 bis 10'000/);
    // Grundgebühr: «1 250» → «1'250»
    expect(out).toMatch(/1&#x27;250|1'250/);
  });

  it('Tarif-Nr.-Zelle «1.1.1.1» wird NICHT verändert (keine Tausender-Gruppe)', () => {
    // «1.1.1.1» enthält keine Ziffernfolge der Form digit+space+3digits → unberührt.
    const bloecke: NormSnapshot['bloecke'] = [{
      absatz: null,
      text: '',
      mehrspaltig: {
        zeilen: [['1.1.1.1', 'Beschreibung']],
      },
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bloecke} artikel="4" passus={{ absatz: null }} />,
    );
    expect(out).toContain('1.1.1.1');
  });

  it('«über 10 Mio.» bleibt UNVERÄNDERT (kein digit+space+3digits-Muster)', () => {
    // «10 Mio.» — «Mio.» ist kein 3-Ziffern-Cluster → kein Apostroph gesetzt.
    const bloecke: NormSnapshot['bloecke'] = [{
      absatz: null,
      text: '',
      mehrspaltig: {
        zeilen: [['über 10 Mio.', '106 400']],
      },
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bloecke} artikel="4" passus={{ absatz: null }} />,
    );
    // «über 10 Mio.» unverändert
    expect(out).toContain('über 10 Mio.');
    // «106 400» → «106'400»
    expect(out).toMatch(/106&#x27;400|106'400/);
  });
});
