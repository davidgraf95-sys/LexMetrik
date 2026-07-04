import { describe, it, expect } from 'vitest';
import {
  ESTV_MWST_BEREICHE,
  menuUrl, tocUrl, kurzUrl, urlBasis,
  parseMenu, parseTocBaum, normalisiereToc, tocDriftToken,
  parseZifferSeite, fundstelleVonLabel, baueDokUndKanten, istFehlerSeite,
  type MenuEintrag, type ZifferMitBefund,
} from '../../scripts/materialien/adapter-estv-mwst';

// E6a M1: reine Extraktions-/Gate-Funktionen des ESTV-MWST-Adapters (§3 Q1). Kein Netz.
// Die HTML-Snippets sind VERBATIM aus den Live-Proben vom 4.7.2026 abgeleitet
// (taxInfos-Menü, ToC publicationId=1010164, cipherDisplay componentId=1010261).

const TAX = ESTV_MWST_BEREICHE[0]; // taxInfos / MI
const SECTOR = ESTV_MWST_BEREICHE[1]; // sectorInfos / MBI

// ── Menü (linke Navigation, live-Struktur) ────────────────────────────────────
const MENU_HTML = `
<ul class="nav nav-indented nav-bordered" data-provides="activable" role="menubar">
  <li role="presentation"><a href="/mwst-webpublikationen/public/pages/taxInfos/tableOfContent.xhtml?publicationId=1248491"> Abk&#252;rzungen und Akronyme</a></li>
  <li role="presentation"><a href="/mwst-webpublikationen/public/pages/taxInfos/tableOfContent.xhtml?publicationId=1038520">01 MWST in K&#252;rze und &#220;bergangsinfo</a></li>
  <li role="presentation"><a href="/mwst-webpublikationen/public/pages/taxInfos/tableOfContent.xhtml?publicationId=1010164">02 Steuerpflicht</a></li>
  <li role="presentation"><a href="/mwst-webpublikationen/public/pages/taxInfos/tableOfContent.xhtml?publicationId=1014743">09 Vorsteuerabzug</a></li>
</ul>`;

describe('parseMenu', () => {
  const eintraege = parseMenu(MENU_HTML, TAX);
  it('nummerierte Publikationen mit publicationId + Nummer + Titel', () => {
    expect(eintraege).toHaveLength(3);
    expect(eintraege[0]).toEqual({ publicationId: '1038520', nummer: '01', navTitel: 'MWST in Kürze und Übergangsinfo' });
    expect(eintraege[1]).toEqual({ publicationId: '1010164', nummer: '02', navTitel: 'Steuerpflicht' });
  });
  it('nummernloses Glossar («Abkürzungen und Akronyme») bewusst übersprungen', () => {
    expect(eintraege.some((e) => e.publicationId === '1248491')).toBe(false);
  });
  it('falscher Bereich matcht nicht (Pfad-Bindung)', () => {
    expect(parseMenu(MENU_HTML, SECTOR)).toHaveLength(0);
  });
});

// ── ToC-Baum (PrimeFaces-Tree, live-Struktur) ─────────────────────────────────
const VS = '<input type="hidden" name="javax.faces.ViewState" id="javax.faces.ViewState" value="-597050:-84985" autocomplete="off" />';
const TOC_HTML = `<div id="treeBox"><div class="treeBox"><ul class="ui-tree-container">
<li data-nodetype="coverType"><a href="cipherDisplay.xhtml?publicationId=1010164&amp;componentId=1010158" style="text-decoration: none"> MWST-Info 02 Steuerpflicht</a></li>
<li data-nodetype="leadingType"><a href="cipherDisplay.xhtml?publicationId=1010164&amp;componentId=1010170">Vorbemerkungen</a></li>
<li data-nodetype="cipherType"><a href="cipherDisplay.xhtml?publicationId=1010164&amp;componentId=1010261">1.1 Betreiben eines Unternehmens</a></li>
<li data-nodetype="cipherType"><a href="cipherDisplay.xhtml?publicationId=1010164&amp;componentId=1268985">1.3 Sitz, Wohnsitz oder Betriebsst&#228;tte im Inland</a></li>
</ul></div></div>${VS}`;

describe('parseTocBaum', () => {
  const baum = parseTocBaum(TOC_HTML);
  it('alle Knoten in Dokument-Reihenfolge, Volltitel = Cover-Label', () => {
    expect(baum.publicationId).toBe('1010164');
    expect(baum.volltitel).toBe('MWST-Info 02 Steuerpflicht');
    expect(baum.knoten.map((k) => k.componentId)).toEqual(['1010158', '1010170', '1010261', '1268985']);
    expect(baum.knoten[3].label).toBe('1.3 Sitz, Wohnsitz oder Betriebsstätte im Inland');
  });
  it('leerer Baum wirft (Struktur-Bruch, §8)', () => {
    expect(() => parseTocBaum('<html><body>kein Baum</body></html>')).toThrow(/ToC-Baum leer/);
  });
  it('Teil-Kontext im Dokumentfluss (Ziffern-Zählung startet je Teil neu, live MI 06)', () => {
    const html = `<div id="treeBox">
      <a href="cipherDisplay.xhtml?publicationId=9&amp;componentId=1">MWST-Info 06 Ort</a>
      <a href="cipherDisplay.xhtml?publicationId=9&amp;componentId=2">Vorbemerkungen</a>
      <a href="cipherDisplay.xhtml?publicationId=9&amp;componentId=3">Teil I Dienstleistungen</a>
      <a href="cipherDisplay.xhtml?publicationId=9&amp;componentId=4">1 Grundsatz</a>
      <a href="cipherDisplay.xhtml?publicationId=9&amp;componentId=5">Teil II Lieferungen</a>
      <a href="cipherDisplay.xhtml?publicationId=9&amp;componentId=6">1 Grundsatz</a>
    </div>`;
    const b = parseTocBaum(html);
    expect(b.knoten.map((k) => k.teil)).toEqual([
      null, null, null, 'Teil I Dienstleistungen', null, 'Teil II Lieferungen',
    ]);
  });
});

describe('ToC-Drift-Arbiter (§3 Q1): ViewState-Normalisierung', () => {
  it('zwei Fetches mit unterschiedlichem ViewState ⇒ gleicher Token', () => {
    const a = TOC_HTML;
    const b = TOC_HTML.replace('-597050:-84985', '111111:222222');
    expect(a).not.toBe(b);
    expect(tocDriftToken(a)).toBe(tocDriftToken(b));
    expect(normalisiereToc(a)).toBe(normalisiereToc(b));
  });
  it('inhaltliche ToC-Änderung (componentId-Wechsel) kippt den Token', () => {
    const c = TOC_HTML.replace('1268985', '1399999');
    expect(tocDriftToken(TOC_HTML)).not.toBe(tocDriftToken(c));
  });
});

// ── Ziffer-Seite (cipherDisplay, live-Struktur) ───────────────────────────────
const ZIFFER_HTML = `
<div><label>Publiziert am:</label> <div class="divider"></div>12.01.2018 </div>
<p>Als Steuersubjekt gilt, wer ein Unternehmen betreibt
(<a href="https://www.fedlex.admin.ch/eli/cc/2009/615/de#art_10">Art. 10 MWSTG</a>); vgl. auch
<a href="https://www.fedlex.admin.ch/eli/cc/2009/828/de#art_9_a">Art. 9a MWSTV</a> und
<a href="https://www.fedlex.admin.ch/eli/cc/220/de#art_530">Art. 530 OR</a>.</p>`;

describe('parseZifferSeite', () => {
  const befund = parseZifferSeite(ZIFFER_HTML);
  it('«Publiziert am» → ISO', () => {
    expect(befund.publiziertAm).toBe('2018-01-12');
  });
  it('nur MWST-Fedlex-Anker invertiert (OR verworfen)', () => {
    expect(befund.fedlex.map((f) => `${f.erlass}:${f.artikel}`)).toEqual(['MWSTG:10', 'MWSTV:9_a']);
  });
  it('Seite ohne Datum → null (Aufrufer entscheidet fail-closed)', () => {
    expect(parseZifferSeite('<p>nichts</p>').publiziertAm).toBeNull();
  });
});

describe('fundstelleVonLabel', () => {
  it('Ziffern-Label → «Ziff. N.N»', () => {
    expect(fundstelleVonLabel('1.1 Betreiben eines Unternehmens')).toBe('Ziff. 1.1');
    expect(fundstelleVonLabel('6.10 Sonderfall')).toBe('Ziff. 6.10');
  });
  it('Teil-Label → «Teil X»; auch römisch (live MI 06 «Teil II Lieferungen»); sonst verbatim', () => {
    expect(fundstelleVonLabel('Teil A Allgemeine Steuerpflicht')).toBe('Teil A');
    expect(fundstelleVonLabel('Teil II Lieferungen')).toBe('Teil II');
    expect(fundstelleVonLabel('Vorbemerkungen')).toBe('Vorbemerkungen');
  });
});

// ── URL-Helfer + Fehlerseiten-Arbiter ─────────────────────────────────────────
describe('URL-Helfer', () => {
  it('Kurz-URL je Bereich (live bestätigt: MI/02, MBI/08)', () => {
    expect(kurzUrl(TAX, '02')).toBe('https://www.gate.estv.admin.ch/mwst-webpublikationen/public/MI/02');
    expect(kurzUrl(SECTOR, '08')).toBe('https://www.gate.estv.admin.ch/mwst-webpublikationen/public/MBI/08');
  });
  it('url_basis trägt die publicationId, Kante nur das componentId-Suffix (§0/A11)', () => {
    expect(urlBasis(TAX, '1010164')).toBe(
      'https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/cipherDisplay.xhtml?publicationId=1010164',
    );
  });
  it('menu/toc-URLs', () => {
    expect(menuUrl(TAX)).toContain('/pages/taxInfos/tableOfContent.xhtml?label=true');
    expect(tocUrl(SECTOR, '42')).toContain('/pages/sectorInfos/tableOfContent.xhtml?publicationId=42');
  });
});

describe('istFehlerSeite (Soft-404, §Skill)', () => {
  it('messageKey-error in url_effective ⇒ Fehlerseite', () => {
    expect(istFehlerSeite('https://…/search.xhtml?messageKey=page.not.found.error', '<html>…</html>')).toBe(true);
  });
  it('normale Ziffer-Seite ⇒ ok', () => {
    expect(istFehlerSeite('https://…/cipherDisplay.xhtml?publicationId=1&componentId=2', ZIFFER_HTML)).toBe(false);
  });
});

// ── Dokument + Kanten (baueDokUndKanten) ──────────────────────────────────────
function ziffer(componentId: string, label: string, html: string, teil: string | null = null): ZifferMitBefund {
  return { knoten: { componentId, label, teil }, befund: parseZifferSeite(html) };
}
const EINTRAG: MenuEintrag = { publicationId: '1010164', nummer: '02', navTitel: 'Steuerpflicht' };

describe('baueDokUndKanten', () => {
  const ziffern = [
    ziffer('1010158', 'MWST-Info 02 Steuerpflicht', '<div><label>Publiziert am:</label><div class="divider"></div>05.03.2025</div>'),
    ziffer('1010261', '1.1 Betreiben eines Unternehmens', ZIFFER_HTML),
  ];
  const { dok, kanten } = baueDokUndKanten(EINTRAG, TAX, 'MWST-Info 02 Steuerpflicht', TOC_HTML, ziffern, '2026-07-04');

  it('Dokument: ID/Nummer/Doktyp/Stand/§7-Felder', () => {
    expect(dok.id).toBe('ESTV-MWST-INFO-02');
    expect(dok.doktyp).toBe('mwst-info');
    expect(dok.nummer).toBe('Nr. 02');
    expect(dok.titel).toBe('MWST-Info 02 Steuerpflicht');
    expect(dok.stand).toBe('2025-03-05'); // jüngstes «Publiziert am»
    expect(dok.stand_quelle).toBe('ziffer-datum');
    expect(dok.quelle_url).toBe('https://www.gate.estv.admin.ch/mwst-webpublikationen/public/MI/02');
    expect(dok.drift_token).toBe(tocDriftToken(TOC_HTML));
    expect(dok.quell_ids).toMatchObject({ publication_id: '1010164', bereich: 'taxInfos' });
    expect(dok.normKeys).toEqual(['MWSTG', 'MWSTV']);
  });
  it('Kanten: artikelscharf amtlich, Ziffer-Stand, Suffix-fundstelle_url', () => {
    expect(kanten).toHaveLength(2);
    const k10 = kanten.find((k) => k.artikel === '10')!;
    expect(k10.erlass_key).toBe('MWSTG');
    expect(k10.quelle).toBe('amtlich');
    expect(k10.konfidenz).toBe('regex-hoch');
    expect(k10.stand).toBe('2018-01-12'); // Ziffer-Stand, nicht Dokument-Stand (§2.4 Cutoff-Semantik)
    expect(k10.fundstelle).toBe('Ziff. 1.1');
    expect(k10.fundstelle_url).toBe('&componentId=1010261');
    expect(k10.roh_zitat).toContain('fedlex.admin.ch');
    const k9a = kanten.find((k) => k.erlass_key === 'MWSTV')!;
    expect(k9a.artikel).toBe('9_a');
  });
  it('Publikation ohne Fedlex-Anker → EINE kuratierte Erlass-Ebene-Kante MWSTG', () => {
    const leer = [ziffer('1', 'Nur Text', '<div><label>Publiziert am:</label><div class="divider"></div>01.02.2024</div>')];
    const r = baueDokUndKanten(EINTRAG, TAX, 'T', TOC_HTML, leer, '2026-07-04');
    expect(r.kanten).toHaveLength(1);
    expect(r.kanten[0]).toMatchObject({ erlass_key: 'MWSTG', artikel: '', quelle: 'kuratiert', konfidenz: 'regex-niedrig' });
    expect(r.dok.normKeys).toEqual(['MWSTG']);
  });
  it('Teil-Kontext trennt gleichnamige Ziffern (§2.1, Gegenprüfungs-Befund 4.7.): BEIDE Kanten überleben mit eigenem Stand + URL', () => {
    // Der Wurzelfall des widerlegten Merges: «1 …» unter Teil I (2018) UND Teil II (2025), beide
    // zitieren MWSTG Art. 10. Früher frass der min-stand-Merge den 2025er-Anker (Cutoff-Downgrade
    // = Drop). Jetzt: Teil-Präfix ⇒ zwei distinkte Fundstellen, KEIN Verlust.
    const html = (datum: string) =>
      `<div><label>Publiziert am:</label><div class="divider"></div>${datum}</div>` +
      '<a href="https://www.fedlex.admin.ch/eli/cc/2009/615/de#art_10">Art. 10</a>';
    const zwei = [
      ziffer('100', '1 Allgemeines', html('05.03.2025'), 'Teil I Dienstleistungen'),
      ziffer('200', '1 Allgemeines', html('12.01.2018'), 'Teil II Lieferungen'),
    ];
    const r = baueDokUndKanten(EINTRAG, TAX, 'T', TOC_HTML, zwei, '2026-07-04');
    const a10 = r.kanten.filter((k) => k.artikel === '10');
    expect(a10).toHaveLength(2);
    expect(a10.map((k) => [k.fundstelle, k.stand, k.fundstelle_url])).toEqual([
      ['Teil I · Ziff. 1', '2025-03-05', '&componentId=100'],
      ['Teil II · Ziff. 1', '2018-01-12', '&componentId=200'],
    ]);
    expect(r.disambiguiert).toBe(0);
  });
  it('Rest-Kollision OHNE Teil-Kontext → deterministisches (n)-Suffix statt Merge (kein Verlust)', () => {
    const html = (datum: string) =>
      `<div><label>Publiziert am:</label><div class="divider"></div>${datum}</div>` +
      '<a href="https://www.fedlex.admin.ch/eli/cc/2009/615/de#art_10">Art. 10</a>';
    const zwei = [
      ziffer('100', '2 X', html('05.03.2025')),
      ziffer('200', '2 X', html('12.01.2018')),
    ];
    const r = baueDokUndKanten(EINTRAG, TAX, 'T', TOC_HTML, zwei, '2026-07-04');
    const a10 = r.kanten.filter((k) => k.artikel === '10');
    expect(a10).toHaveLength(2);
    expect(a10.map((k) => [k.fundstelle, k.stand])).toEqual([
      ['Ziff. 2', '2025-03-05'],
      ['Ziff. 2 (2)', '2018-01-12'],
    ]);
    expect(r.disambiguiert).toBe(1);
  });
  it('gleicher Artikel zweimal in derselben Ziffer → dedupe', () => {
    const doppel = [ziffer('7', '2.1 X', ZIFFER_HTML.replace('</p>', ' nochmals <a href="https://www.fedlex.admin.ch/eli/cc/2009/615/de#art_10">Art. 10</a></p>'))];
    const r = baueDokUndKanten(EINTRAG, TAX, 'T', TOC_HTML, doppel, '2026-07-04');
    expect(r.kanten.filter((k) => k.artikel === '10')).toHaveLength(1);
  });
  it('keine Ziffer mit Datum → wirft (kein stilles Falsch-Datum, §8)', () => {
    expect(() => baueDokUndKanten(EINTRAG, TAX, 'T', TOC_HTML, [ziffer('9', 'X', '<p>ohne Datum</p>')], '2026-07-04'))
      .toThrow(/keine Ziffer trägt/);
  });
  it('BI-Rang nach MI-Rang (Register-Sortierung)', () => {
    const bi = baueDokUndKanten({ publicationId: '9', nummer: '08', navTitel: 'X' }, SECTOR, 'MWST-Branchen-Info 08 …', TOC_HTML,
      [ziffer('1', 'Y', '<div><label>Publiziert am:</label><div class="divider"></div>01.01.2025</div>')], '2026-07-04');
    expect(bi.dok.id).toBe('ESTV-MWST-BRANCHEN-INFO-08');
    expect(bi.dok.doktyp).toBe('mwst-branchen-info');
    expect(bi.dok.rang).toBeGreaterThan(dok.rang);
  });
});
