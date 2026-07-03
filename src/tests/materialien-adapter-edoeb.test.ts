import { describe, it, expect } from 'vitest';
import {
  slugify,
  doktypAusTitel,
  dokKey,
  istKuriertBekannt,
  KURIERT_BEKANNT,
  artikelAusTitel,
  damTokenAusUrl,
  driftToken,
  dokRang,
  ueberschriften,
  sektionsHtml,
  parseAnkerInhalt,
  parseSektion,
  baueDokUndKanten,
  verarbeiteHub,
  EDOEB_HUBS,
} from '../../scripts/materialien/adapter-edoeb';
import { datumslabelNachIso } from '../../scripts/materialien/datum-de';

// E6a M3: reine Extraktions-/Gate-Funktionen des EDÖB-Adapters (§3 Q3). Kein Netz.

describe('datum-de.datumslabelNachIso (deutsche Monatsnamen → ISO)', () => {
  it('mappt inkl. ä-Monat', () => {
    expect(datumslabelNachIso('6. Oktober 2025')).toBe('2025-10-06');
    expect(datumslabelNachIso('31. März 2026')).toBe('2026-03-31');
  });
  it('wirft bei Unbekanntem (§8)', () => {
    expect(() => datumslabelNachIso('6. Foobar 2025')).toThrow(/unbekannter Monatsname/);
    expect(() => datumslabelNachIso('Oktober 2025')).toThrow(/unparsbar/);
  });
});

describe('slugify (§2.6: transliteriert, ohne Stoppwörter, gekürzt, pfadsicher)', () => {
  it('transliteriert Umlaute + entfernt Stoppwörter', () => {
    expect(slugify('Leitfaden zu den technischen und organisatorischen Massnahmen des Datenschutzes (TOM)'))
      .toBe('leitfaden-technischen-organisatorischen-massnahmen-datenschutzes-tom');
  });
  it('nur [a-z0-9-] (KEY-sicher)', () => {
    expect(slugify('Merkblatt: Anmeldeformulare für Mietwohnungen!')).toMatch(/^[a-z0-9-]+$/);
  });
});

describe('doktypAusTitel (nur registrierte DoktypIds, §0/B6)', () => {
  it('erkennt Merkblatt / Leitfaden / Default', () => {
    expect(doktypAusTitel('Merkblatt zu X')).toBe('merkblatt');
    expect(doktypAusTitel('Leitfaden Y')).toBe('leitfaden');
    expect(doktypAusTitel('Fragen- und Antwortenkatalog')).toBe('leitfaden'); // Default
  });
});

describe('dokKey (kein doppeltes Doktyp-Präfix, pfadsicher)', () => {
  it('EDOEB-<INFIX>-<SLUG> ohne EDOEB-MERKBLATT-MERKBLATT-…', () => {
    const k = dokKey('Merkblatt Anmeldeformulare für Mietwohnungen', 'merkblatt');
    expect(k).toBe('EDOEB-MERKBLATT-ANMELDEFORMULARE-MIETWOHNUNGEN');
    expect(k).not.toMatch(/MERKBLATT-MERKBLATT/);
    expect(k).toMatch(/^[A-Z0-9-]+$/);
  });
});

describe('istKuriertBekannt (§2.6 «bestehender Key gewinnt» → skip)', () => {
  it('erkennt die vier kuratiert-bekannten Dokumente', () => {
    expect(istKuriertBekannt('Leitfaden zu den technischen und organisatorischen Massnahmen des Datenschutzes (TOM)')).toBe(true);
    expect(istKuriertBekannt('Leitfaden des EDÖB betreffend die Meldung von Datensicherheitsverletzungen und Information der Betroffenen nach Art. 24 DSG')).toBe(true);
    expect(istKuriertBekannt('Merkblatt Anmeldeformulare für Mietwohnungen')).toBe(false);
  });
  it('jeder Skip-Slug bildet auf einen EDOEB-*-Key ab', () => {
    for (const key of Object.values(KURIERT_BEKANNT)) expect(key.startsWith('EDOEB-')).toBe(true);
  });
});

describe('artikelAusTitel (artikelscharf NUR bei amtlicher Titel-Nennung, §3 Q3)', () => {
  it('«… nach Art. 24 DSG» → [24]', () => {
    expect(artikelAusTitel('Leitfaden … nach Art. 24 DSG', 'DSG')).toEqual(['24']);
  });
  it('«… nach den Art. 22 und 23 DSG» → [22, 23]', () => {
    expect(artikelAusTitel('Merkblatt … nach den Art. 22 und 23 DSG (Stand August 2023)', 'DSG')).toEqual(['22', '23']);
  });
  it('«Art. 49ff» = Bereich → KEIN Einzelartikel (Erlass-Ebene, §1)', () => {
    expect(artikelAusTitel('Untersuchung … (Analyse Art. 49ff)', 'DSG')).toEqual([]);
  });
  it('nur der ZUGEORDNETE Erlass bindet (Art. X KVV ⇒ nicht DSG)', () => {
    expect(artikelAusTitel('Verzeichnis … nach Art 59a 7 KVV', 'DSG')).toEqual([]);
  });
});

describe('damTokenAusUrl + driftToken + dokRang', () => {
  const url = 'https://www.edoeb.admin.ch/dam/de/sd-web/T64CAUyvAMcF/x.pdf';
  it('extrahiert den volatilen DAM-Token', () => {
    expect(damTokenAusUrl(url)).toBe('T64CAUyvAMcF');
  });
  it('driftToken 16-stellig + reagiert auf Titel/Datum/URL', () => {
    const a = driftToken('T', '6. Oktober 2025', url);
    expect(a).toBe(driftToken('T', '6. Oktober 2025', url));
    expect(a).not.toBe(driftToken('T', '7. Oktober 2025', url));
    expect(a.length).toBe(16);
  });
  it('dokRang: neuer ⇒ höher (kleiner)', () => {
    expect(dokRang('2026-03-31')).toBeLessThan(dokRang('2022-12-15'));
  });
});

// ── HTML-Segmentierung ────────────────────────────────────────────────────────
const FIXTURE = `
<h2>Verordnungen</h2>
<a class="download-item" href="https://www.edoeb.admin.ch/dam/de/sd-web/AAA/vorher.pdf"><h4 class="download-item__title">Vorher-Dok</h4><span class="meta-info__item">1. Januar 2020</span></a>
<h2>Leitfäden und Merkblätter</h2>
<a class="download-item" href="https://www.edoeb.admin.ch/dam/de/sd-web/BBB/eins.pdf"><h4 class="download-item__title">Merkblatt Eins</h4><span class="meta-info__item">PDF</span><span class="meta-info__item">15. Juli 2025</span></a>
<a class="download-item" href="https://www.edoeb.admin.ch/dam/de/sd-web/CCC/brief.docx"><h4 class="download-item__title">Musterbrief Word</h4><span class="meta-info__item">10. Mai 2023</span></a>
<a class="download-item" href="https://www.edoeb.admin.ch/dam/de/sd-web/DDD/zwei.pdf"><h4 class="download-item__title">Leitfaden nach Art. 24 DSG</h4><span class="meta-info__item">23. April 2025</span></a>
<h2>Musterbriefe</h2>
<a class="download-item" href="https://www.edoeb.admin.ch/dam/de/sd-web/EEE/danach.pdf"><h4 class="download-item__title">Danach-Dok</h4><span class="meta-info__item">1. Januar 2021</span></a>
`;
const DS_DEF = EDOEB_HUBS[0];

describe('ueberschriften + sektionsHtml + parseSektion', () => {
  it('findet echte Überschriften (nicht TOC-<a>)', () => {
    expect(ueberschriften(FIXTURE).map((h) => h.txt)).toContain('Leitfäden und Merkblätter');
  });
  it('schneidet NUR die genannte Sektion (Vorher/Danach ausgeschlossen)', () => {
    const s = sektionsHtml(FIXTURE, 'Leitfäden und Merkblätter');
    expect(s).toContain('Merkblatt Eins');
    expect(s).not.toContain('Vorher-Dok');
    expect(s).not.toContain('Danach-Dok');
  });
  it('parseSektion nimmt nur PDF (Word/Musterbrief raus)', () => {
    const rohs = parseSektion(FIXTURE, DS_DEF);
    expect(rohs.map((r) => r.titel)).toEqual(['Merkblatt Eins', 'Leitfaden nach Art. 24 DSG']);
  });
  it('wirft bei fehlender Sektion (Hub-Redesign)', () => {
    expect(() => sektionsHtml(FIXTURE, 'Gibt-Es-Nicht')).toThrow(/nicht gefunden/);
  });
  it('parseAnkerInhalt wählt das Datumsmuster-Span (robust gegen PDF/Grösse-Spans)', () => {
    const inner = '<h4 class="download-item__title">X</h4><span class="meta-info__item">PDF</span><span class="meta-info__item">15. Juli 2025</span>';
    expect(parseAnkerInhalt(inner)).toEqual({ titel: 'X', datumLabel: '15. Juli 2025' });
  });
});

describe('baueDokUndKanten (§7 a–d + Kanten-Herkunft)', () => {
  const roh = {
    href: 'https://www.edoeb.admin.ch/dam/de/sd-web/DDD/zwei.pdf',
    titel: 'Leitfaden nach Art. 24 DSG',
    datumLabel: '23. April 2025',
    dateiname: 'zwei.pdf',
  };
  it('artikelscharf (quelle=amtlich) wenn Titel den Artikel nennt', () => {
    const { dok, kanten } = baueDokUndKanten(roh, DS_DEF, '2026-07-04');
    expect(dok.behoerde).toBe('EDOEB');
    expect(dok.stand).toBe('2025-04-23');
    expect(dok.stand_quelle).toBe('hub-label');
    expect(dok.drift_token).not.toBe('');
    expect(dok.quell_ids.dam_token).toBe('DDD');
    expect(kanten).toHaveLength(1);
    expect(kanten[0]).toMatchObject({ erlass_key: 'DSG', artikel: '24', quelle: 'amtlich', konfidenz: 'regex-hoch' });
  });
  it('erlass-ebene (quelle=kuratiert) wenn kein Artikel im Titel', () => {
    const { kanten } = baueDokUndKanten({ ...roh, titel: 'Merkblatt Eins' }, DS_DEF, '2026-07-04');
    expect(kanten).toHaveLength(1);
    expect(kanten[0]).toMatchObject({ erlass_key: 'DSG', artikel: '', quelle: 'kuratiert' });
  });
});

describe('verarbeiteHub (skip kuratiert-bekannt + Count-Gate)', () => {
  it('wirft bei zu wenigen PDFs (< min)', () => {
    expect(() => verarbeiteHub(FIXTURE, DS_DEF, '2026-07-04')).toThrow(/< 6/);
  });
});
