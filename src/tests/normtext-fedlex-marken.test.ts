/**
 * Regressionstest zu den zwei Korpus-Befunden des Diskrepanz-Finders vom
 * 4.9.2026 (ROADMAP QS-KORPUS, PR #650) — beide auf dem Fedlex-Adapter:
 *
 *  Klasse 1 «<dl>-Marken werden nachnummeriert statt gelesen»: die
 *  Marken-Regex in `parseDefinitionsListe` schnitt jede <dt>-Marke auf das
 *  erste kanonische lit./Ziff.-Token zurück. Aus «BE:» wurde «b», aus «C1E:»
 *  «c» — die amtliche Bezeichnung war weg UND die Marken waren innerhalb
 *  desselben Absatzes doppelt (VZV Art. 3 Abs. 1: a,b,c,d,b,c,d). Ein Zitat
 *  «Kategorie BE» las sich danach als «lit. b» (§1).
 *
 *  Klasse 2 «zerrissene Wörter / lose Interpunktion»: Fedlex setzt leere
 *  `<tmp:inl …></tmp:inl>`-Marker (legi4ch-XSLT-Rest der Word-Konversion) MITTEN
 *  im Wort. `entferneTags` las den Tag-Namen mit `[a-zA-Z][a-zA-Z0-9]*` und
 *  bekam darum «tmp» statt «tmp:inl» — nicht in der Inline-Liste, also wurde
 *  das Tag durch ein LEERZEICHEN ersetzt: «Zwischen produkten», «Erfah rung»,
 *  «werden ;».
 *
 * Beide Fixtures sind byte-genaue Ausschnitte des gepinnten Filestore-Cache.
 */
import { describe, it, expect } from 'vitest';
import { extrahiereArtikel } from '../../scripts/normtext/extrahiere-fedlex';
import { HTML_VZV, HTML_AMBV } from './normtext-fedlex-marken.helfer';

describe('Fedlex-Adapter — <dt>-Marken werden GELESEN, nicht nachnummeriert', () => {
  it('VZV Art. 3 Abs. 1: amtliche Ausweiskategorien A, B, C, D, BE, CE, DE', () => {
    const r = extrahiereArtikel(HTML_VZV, '3');
    expect(r).not.toBeNull();
    const abs1 = r!.bloecke.find((b) => b.absatz === '1');
    expect(abs1?.items?.map((i) => i.marke)).toEqual(['A', 'B', 'C', 'D', 'BE', 'CE', 'DE']);
  });

  it('VZV Art. 3: keine Marke doppelt innerhalb eines Absatzes', () => {
    const r = extrahiereArtikel(HTML_VZV, '3');
    for (const b of r!.bloecke) {
      const marken = (b.items ?? []).map((i) => i.marke);
      expect(new Set(marken).size).toBe(marken.length);
    }
  });

  it('VZV Art. 3 Abs. 2: Unterkategorien C1E/D1E bleiben vollständig', () => {
    const r = extrahiereArtikel(HTML_VZV, '3');
    const abs2 = r!.bloecke.find((b) => b.absatz === '2');
    expect(abs2?.items?.map((i) => i.marke)).toContain('C1E');
    expect(abs2?.items?.map((i) => i.marke)).toContain('D1E');
  });
});

describe('Fedlex-Adapter — leere <tmp:inl>-Marker zerreissen keine Wörter mehr', () => {
  const texte = (nr: string) => {
    const r = extrahiereArtikel(HTML_AMBV, nr);
    expect(r).not.toBeNull();
    return r!.bloecke.flatMap((b) => [b.text, ...(b.items ?? []).map((i) => i.text)]);
  };

  it('AMBV Art. 6: «Zwischenprodukten», «Erfahrung», «naturwissenschaftliche» ungeteilt', () => {
    const alle = texte('6').join(' ');
    expect(alle).toContain('Zwischenprodukten');
    expect(alle).toContain('Erfahrung');
    expect(alle).toContain('naturwissenschaftliche');
    expect(alle).not.toMatch(/Zwischen produkten|Erfah rung|natur wissenschaftliche/);
  });

  it('AMBV Art. 6 und 11: kein Leerzeichen vor Satzzeichen', () => {
    for (const nr of ['6', '11']) {
      for (const t of texte(nr)) expect(t).not.toMatch(/\s+[;.,]/);
    }
  });
});
