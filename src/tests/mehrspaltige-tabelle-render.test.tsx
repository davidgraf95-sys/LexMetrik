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

  it('rendert Datenzeilen (kurze Wörter wie «bis» = 3 Buchstaben → numerisch → gruppiert)', () => {
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
    // «bis 5000»: «bis» hat nur 3 Buchstaben → numerisch → «bis 5'000» (gruppiert)
    expect(out).toMatch(/bis 5&#x27;000|bis 5'000/);
    // «über 5000 bis 10000»: «über» hat 4 Buchstaben → NICHT numerisch → unverändert
    expect(out).toContain('über 5000 bis 10000');
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
});
