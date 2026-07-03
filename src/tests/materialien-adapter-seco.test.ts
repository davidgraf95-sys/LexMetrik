import { describe, it, expect } from 'vitest';
import {
  datumslabelNachIso,
  artikelAusDateiname,
  korpusToken,
  anzeigeNummer,
  dokId,
  dokRang,
  damTokenAusUrl,
  driftToken,
  parseAnkerInhalt,
  parseDownloadItems,
  verarbeiteHub,
  vollstaendigkeitsGate,
  einzelArtikel,
  baueDokUndKante,
  AUSNAHMEN_ARG,
  AUSNAHMEN_ARGV1,
  SECO_QUELLEN,
  type RohDownload,
} from '../../scripts/materialien/adapter-seco';

// E6a M2: reine Extraktions-/Gate-Funktionen des SECO-Adapters (§3 Q2). Kein Netz.

describe('datumslabelNachIso (deutsche Monatsnamen → ISO)', () => {
  it('mappt Tag/Monat/Jahr korrekt inkl. ä-Monat', () => {
    expect(datumslabelNachIso('3. Februar 2012')).toBe('2012-02-03');
    expect(datumslabelNachIso('18. November 2025')).toBe('2025-11-18');
    expect(datumslabelNachIso('13. März 2012')).toBe('2012-03-13');
    expect(datumslabelNachIso('1. April 2022')).toBe('2022-04-01');
  });
  it('wirft bei unbekanntem Monat / unparsbarem Label (§8)', () => {
    expect(() => datumslabelNachIso('3. Foobar 2012')).toThrow(/unbekannter Monatsname/);
    expect(() => datumslabelNachIso('Februar 2012')).toThrow(/unparsbar/);
  });
});

describe('artikelAusDateiname (alle live beobachteten Muster, 3.7.2026)', () => {
  const cases: [string, string, string, string][] = [
    ['ArG-Artikel-01-SECO-AB-2012-DE.pdf', 'ARG', '1', ''],
    ['ArG-Artikel-03a-SECO-AB-2023-DE.pdf', 'ARG', '3', 'a'],
    ['ArG-Artikel-17e-SECO-AB-2014-DE.pdf', 'ARG', '17', 'e'],
    ['ArGV1-Artikel-01-SECO-AB-2012-DE.pdf', 'ARGV1', '1', ''],
    ['ArGV1_art02_de.pdf', 'ARGV1', '2', ''],
    ['ArGV1_art04a_de.pdf', 'ARGV1', '4', 'a'],
    ['ArGV1_Art32a_de.pdf', 'ARGV1', '32', 'a'],
    ['ArGV1-Art60-SECO-AB-2025-DE.pdf', 'ARGV1', '60', ''],
  ];
  for (const [fn, erlass, num, suffix] of cases) {
    it(`${fn} → ${erlass} ${num}${suffix}`, () => {
      expect(artikelAusDateiname(fn)).toEqual({ erlass, num, suffix });
    });
  }
  it('ArGV1 wird VOR ArG erkannt (Präfix-Kollision)', () => {
    expect(artikelAusDateiname('ArGV1-Artikel-05-SECO-AB-2020-DE.pdf')?.erlass).toBe('ARGV1');
  });
  it('Nicht-Artikel-Datei ⇒ null', () => {
    expect(artikelAusDateiname('Wegleitung-Gesamt.pdf')).toBeNull();
    expect(artikelAusDateiname('irgendwas.pdf')).toBeNull();
  });
});

describe('Token-/ID-/Rang-Ableitung', () => {
  it('korpusToken: Buchstabensuffix → «N_x», sonst «N»', () => {
    expect(korpusToken('3', 'a')).toBe('3_a');
    expect(korpusToken('9', '')).toBe('9');
  });
  it('anzeigeNummer verbatim mit Kleinbuchstaben', () => {
    expect(anzeigeNummer('3', 'a')).toBe('Art. 3a');
    expect(anzeigeNummer('9', '')).toBe('Art. 9');
  });
  it('dokId pfadsicher GROSS', () => {
    expect(dokId('ARG', '3', 'a')).toBe('SECO-WL-ARG-ART-3A');
    expect(dokId('ARGV1', '32', 'a')).toBe('SECO-WL-ARGV1-ART-32A');
  });
  it('dokRang natürlich sortierend: 3 < 3a < 4, kollisionsfrei', () => {
    expect(dokRang(1000, '3', '')).toBeLessThan(dokRang(1000, '3', 'a'));
    expect(dokRang(1000, '3', 'a')).toBeLessThan(dokRang(1000, '4', ''));
  });
});

describe('damTokenAusUrl + driftToken', () => {
  const url = 'https://www.seco.admin.ch/dam/de/sd-web/vAhFUAq-8IiX/ArG-Artikel-03a-SECO-AB-2023-DE.pdf';
  it('extrahiert den volatilen DAM-Token', () => {
    expect(damTokenAusUrl(url)).toBe('vAhFUAq-8IiX');
  });
  it('driftToken deterministisch + reagiert auf Datum/URL/Dateiname', () => {
    const a = driftToken('f.pdf', '3. Februar 2012', url);
    expect(a).toBe(driftToken('f.pdf', '3. Februar 2012', url));
    expect(a).not.toBe(driftToken('f.pdf', '4. Februar 2012', url));
    expect(a.length).toBe(16);
  });
});

describe('parseAnkerInhalt + parseDownloadItems', () => {
  const anker = `<a class="download-item" href="https://www.seco.admin.ch/dam/de/sd-web/TOK/ArG-Artikel-01-SECO-AB-2012-DE.pdf"><div><h4 class="download-item__title">ArG Artikel 1: Geltungsbereich</h4><p class="download-item__meta-info"><span class="meta-info__item">PDF</span><span class="meta-info__item">34.50 kB</span><span class="meta-info__item">3. Februar 2012</span></p></div></a>`;
  it('extrahiert Titel + Datumslabel (Datum robust = das Datumsmuster-Span, nicht Position)', () => {
    const inner = anker.replace(/^<a[^>]*>/, '').replace(/<\/a>$/, '');
    expect(parseAnkerInhalt(inner)).toEqual({ titel: 'ArG Artikel 1: Geltungsbereich', datumLabel: '3. Februar 2012' });
  });
  it('parseDownloadItems liefert href + dateiname', () => {
    const items = parseDownloadItems(anker);
    expect(items.length).toBe(1);
    expect(items[0].dateiname).toBe('ArG-Artikel-01-SECO-AB-2012-DE.pdf');
    expect(items[0].titel).toBe('ArG Artikel 1: Geltungsbereich');
  });
});

describe('baueDokUndKante (§7 a–d + artikelscharfe Kante)', () => {
  const def = SECO_QUELLEN[0]; // ARG
  const roh: RohDownload = {
    href: 'https://www.seco.admin.ch/dam/de/sd-web/TOK/ArG-Artikel-03a-SECO-AB-2023-DE.pdf',
    titel: 'ArG Artikel 3a: Gesundheitsschutz',
    datumLabel: '4. Januar 2023',
    dateiname: 'ArG-Artikel-03a-SECO-AB-2023-DE.pdf',
  };
  it('setzt ID, Stand, Kante-Token, quell_ids, drift_token (nicht leer)', () => {
    const { dok, kante } = baueDokUndKante(roh, def, { num: '3', suffix: 'a' }, '2026-07-03');
    expect(dok.id).toBe('SECO-WL-ARG-ART-3A');
    expect(dok.stand).toBe('2023-01-04');
    expect(dok.stand_quelle).toBe('hub-label');
    expect(dok.drift_token).not.toBe('');
    expect(dok.quell_ids.dam_token).toBe('TOK');
    expect(kante.artikel).toBe('3_a');
    expect(kante.erlass_key).toBe('ARG');
    expect(kante.quelle).toBe('amtlich');
    expect(kante.konfidenz).toBe('regex-hoch');
    expect(kante.fundstelle).toBe('');
  });
});

describe('Vollständigkeits-Gate (§0/A14)', () => {
  const korpus = ['1', '2', '3', '3_a', '4', '5', '67_70']; // 67_70 = Bereich, kein Einzelartikel
  it('einzelArtikel filtert Bereichs-/Anhang-Token', () => {
    expect([...einzelArtikel(['1', '3_a', '67_70', 'annex_u1'])].sort()).toEqual(['1', '3_a']);
  });
  it('grün, wenn (Korpus − Ausnahmen) == PDF', () => {
    // Ausnahme «2» begründet weglassen; PDFs = {1,3,3_a,4,5} (67_70 zählt nicht als Einzelartikel).
    const vb = vollstaendigkeitsGate('ARG', korpus, ['1', '3', '3_a', '4', '5']);
    // «2» fehlt aber ist keine Ausnahme im echten AUSNAHMEN_ARG → rot; hier Test der Mechanik:
    expect(vb.fehlendImPdf).toContain('2');
    expect(vb.ok).toBe(false);
  });
  it('überzähliges PDF (nicht im Korpus, keine Ausnahme) ⇒ rot', () => {
    const vb = vollstaendigkeitsGate('ARG', ['1', '2'], ['1', '2', '9']);
    expect(vb.ueberzaehligImPdf).toContain('9');
    expect(vb.ok).toBe(false);
  });
  it('kuratierte AUSNAHMEN-Listen sind eindeutig + tragen Datum + Grund', () => {
    for (const liste of [AUSNAHMEN_ARG, AUSNAHMEN_ARGV1]) {
      const ids = liste.map((a) => a.artikel);
      expect(new Set(ids).size).toBe(ids.length);
      for (const a of liste) {
        expect(a.datum).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(a.grund.length).toBeGreaterThan(5);
      }
    }
  });
});

describe('verarbeiteHub (Count-Gate + Vollständigkeit)', () => {
  it('wirft bei zu wenigen Artikel-PDFs (< 60)', () => {
    const html = `<a class="download-item" href="https://x/dam/de/sd-web/T/ArG-Artikel-01-SECO-AB-2012-DE.pdf"><h4 class="download-item__title">ArG Artikel 1</h4><span class="meta-info__item">3. Februar 2012</span></a>`;
    expect(() => verarbeiteHub(html, SECO_QUELLEN[0], ['1'], '2026-07-03')).toThrow(/< 60/);
  });
});
