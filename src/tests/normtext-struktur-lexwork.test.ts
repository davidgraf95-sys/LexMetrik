import { describe, it, expect } from 'vitest';
import {
  extrahiereStrukturLexWork,
  extrahiereKopfLexWork,
  extrahiereLexWorkSidecar,
} from '../../scripts/normtext/struktur-lexwork.ts';

// Reales BS-Markup (gesetzessammlung.bs.ch 154.100, GOG) verdichtet: zwei
// Gliederungs-Ebenen in BEIDEN Klassen-Reihenfolgen (BS «level_N title» + BE
// «title level_N»), Ingress mit law_link + Fussnoten-Marker, ein Artikel mit
// zwei Absätzen und Fussnoten-Marker in Abs. 1, plus der Fussnoten-Apparat.
const XHTML = `
<div class='document'>
  <h1 class='systematic_number'>154.100</h1>
  <h1 class='title'>Gesetz betreffend die Organisation der Gerichte und der Staatsanwaltschaft</h1>
  <div class='enactment'>Vom 3. Juni 2015 (Stand 15. Juni 2025)</div>
  <div class='ingress_author'>Der Grosse Rat des Kantons Basel-Stadt,</div>
  <div class='ingress_foundation'><p>gest&uuml;tzt auf &sect;&sect; 44 der Verfassung des Kantons Basel-Stadt vom 23. M&auml;rz 2005<a class="footnote" name="fn_a" href="#fn_a_c" id="fn_a">[1]</a>,</p></div>
  <div class='ingress_action'>beschliesst:</div>
  <div class='level_1 title'><span class='number'>1.</span> <span class='title_text'>Allgemeine Bestimmungen</span></div>
  <div class='title level_2'><span class='number'>1.5.</span> <span class='title_text'>Gerichte</span></div>
  <div class='article'>
    <div class='article_number'><span class='article_symbol'>&sect;</span> <span class='number'>6</span></div>
    <div class='article_title'><span class='title_text'>&nbsp;</span></div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p><span class='text_content'>Es bestehen die Schlichtungsbeh&ouml;rden (Art. 200 ZPO<a class="footnote" name="fn_b" href="#fn_b_c" id="fn_b">[2]</a>) sowie das Schlichtungsstellengesetz<a class="footnote" name="fn_c" href="#fn_c_c" id="fn_c">[3]</a>.</span></p>
  </div>
  <div class='paragraph'>
    <span class='number'>2</span>
    <p><span class='text_content'>Als Schlichtungsbeh&ouml;rden amten die Pr&auml;sidien.</span></p>
  </div>
  <div class='article'>
    <div class='article_number'><span class='article_symbol'>&sect;</span> <span class='number'>23</span></div>
    <div class='article_title'><span class='title_text'>Bildung von Berufsgruppen</span></div>
  </div>
  <div class='paragraph'><span class='number'>1</span><p><span class='text_content'>Der Rat bildet Gruppen.</span></p></div>
</div>
<div class='footnotes' id=''>
  <div class='footnotes-hr'></div>
  <ol>
    <li><a class='footnote' href='#fn_a' name='fn_a_c' id="fn_a_c">[1]</a> <span class='footnote_text'>SG <a class="law_link" href="https://www.gesetzessammlung.bs.ch/data/111.100/de" target="_blank">111.100</a>.</span></li>
    <li><a class='footnote' href='#fn_b' name='fn_b_c' id="fn_b_c">[2]</a> <span class='footnote_text'>SR <a class="law_link" href="https://db.clex.ch/link/Bund/272/de" target="_blank">272</a></span></li>
    <li><a class='footnote' href='#fn_c' name='fn_c_c' id="fn_c_c">[3]</a> <span class='footnote_text'>SG <a class="law_link" href="https://www.gesetzessammlung.bs.ch/data/215.400/de" target="_blank">215.400</a></span></li>
  </ol>
</div>`;

describe('extrahiereStrukturLexWork — Gliederung (beide Klassen-Reihenfolgen)', () => {
  const artikel = extrahiereStrukturLexWork(XHTML);

  it('erfasst «level_N title» (BS) UND «title level_N» (BE) als Gliederung', () => {
    expect(artikel['6'].gliederung).toEqual([
      { ebene: 1, label: '1. Allgemeine Bestimmungen' },
      { ebene: 2, label: '1.5. Gerichte' },
    ]);
  });

  it('liest den Artikel-Randtitel (Marginalie), leere Titel bleiben leer (§7)', () => {
    expect(artikel['6'].marginalie).toEqual([]); // article_title war &nbsp;
    expect(artikel['23'].marginalie).toEqual(['Bildung von Berufsgruppen']);
  });
});

describe('extrahiereStrukturLexWork — Artikel-Fussnoten', () => {
  const artikel = extrahiereStrukturLexWork(XHTML);

  it('ordnet die Marker dem Absatz zu und trägt Text + Link', () => {
    const fns = artikel['6'].fussnoten!;
    expect(fns.map((f) => f.nr)).toEqual(['2', '3']);
    expect(fns[0]).toMatchObject({ nr: '2', text: 'SR 272', absatz: '1', item: null });
    expect(fns[0].links[0]).toEqual({ label: '272', url: 'https://db.clex.ch/link/Bund/272/de' });
    expect(fns[1]).toMatchObject({ nr: '3', text: 'SG 215.400', absatz: '1' });
  });

  it('Artikel ohne Marker tragen kein fussnoten-Feld', () => {
    expect(artikel['23'].fussnoten).toBeUndefined();
  });

  it('strippt den Marker-Text aus dem Fliesstext nicht in die Struktur', () => {
    // Der Marker «[2]» darf nirgends als Text auftauchen.
    expect(JSON.stringify(artikel['6'])).not.toContain('[2]');
  });
});

describe('extrahiereKopfLexWork — Ingress/Erlassformel + verlinkte Rechtsgrundlage', () => {
  const kopf = extrahiereKopfLexWork(XHTML)!;

  it('extrahiert Titel + Erlassdatum', () => {
    expect(kopf.titel).toContain('Organisation der Gerichte');
    expect(kopf.erlassdatum).toBe('Vom 3. Juni 2015 (Stand 15. Juni 2025)');
  });

  it('baut die Erlassformel-Zeilen (autor/ingress/verb) in Reihenfolge', () => {
    expect(kopf.praeambel!.map((z) => z.rolle)).toEqual(['autor', 'ingress', 'verb']);
    expect(kopf.praeambel![1].fnNrs).toEqual(['1']);
    // Marker-Text «[1]» ist aus dem Ingress-Text entfernt (kommt via fnNrs/Apparat).
    expect(kopf.praeambel![1].text).not.toContain('[1]');
    expect(kopf.praeambel![1].text.trimEnd().endsWith('2005,')).toBe(true);
  });

  it('sammelt die Ingress-Fussnote mit law_link als Rechtsgrundlage', () => {
    expect(kopf.fussnoten).toHaveLength(1);
    expect(kopf.fussnoten![0]).toMatchObject({ nr: '1', text: 'SG 111.100.', absatz: null, item: null });
    expect(kopf.fussnoten![0].links[0].url).toBe('https://www.gesetzessammlung.bs.ch/data/111.100/de');
  });
});

describe('extrahiereStrukturLexWork — Aufhebungs-/Änderungsmarker (§7, A42-Gegenprüfung)', () => {
  const XH = `
    <div class='level_1 title'><span class='number'>1.</span> <span class='title_text'>Teil</span></div>
    <div class='article'>
      <div class='article_number'><span class='article_symbol'>&sect;</span> <span class='number'>102</span></div>
      <div class='article_title'>&hellip;</div>
    </div>
    <div class='paragraph'><span class='number'>1</span><p><span class='text_content'>x</span></p></div>
    <div class='article'>
      <div class='article_number'><span class='article_symbol'>&sect;</span> <span class='number'>103&nbsp;<strong>*</strong></span></div>
      <div class='article_title'>&nbsp;<strong>*</strong></div>
    </div>
    <div class='paragraph'><span class='number'>1</span><p><span class='text_content'>y</span></p></div>`;

  it('«&hellip;»-Platzhalter erzeugt KEINE fabrizierte Marginalie (§7)', () => {
    const a = extrahiereStrukturLexWork(XH);
    expect(a['102'].marginalie).toEqual([]);
  });

  it('Änderungs-Stern im Nummer-Span reisst den Artikel nicht aus dem Sidecar (Token «103», nicht «103 *»)', () => {
    const a = extrahiereStrukturLexWork(XH);
    expect(a['103']).toBeDefined();
    expect(a['103 *']).toBeUndefined();
    expect(a['103'].marginalie).toEqual([]); // «&nbsp;*» → leer, kein «*»-Randtitel
  });
});

describe('extrahiereLexWorkSidecar — kombinierter Extrakt, ein Apparat-Parse', () => {
  it('liefert kopf + artikel deckungsgleich zu den Einzel-Extraktoren', () => {
    const { kopf, artikel } = extrahiereLexWorkSidecar(XHTML);
    expect(kopf).toEqual(extrahiereKopfLexWork(XHTML));
    expect(artikel).toEqual(extrahiereStrukturLexWork(XHTML));
  });
});
