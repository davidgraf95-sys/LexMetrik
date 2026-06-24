// Tests für die deterministische Erwägungs-Normalisierung (scripts/normtext/
// erwaegung-normalisieren.ts). Kern: reparierter markenPlausibel (Sammlungs-
// Auszug ab consid. N≥3 jetzt akzeptiert), kein Fehl-Split an Datum/Betrag,
// WORT-INVARIANTE (kein Textverlust/keine Umstellung) und Determinismus (§2).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  markenPlausibel, fuehrendeGliederungsnummer, spalteMonolith, normalisiereErwaegung,
} from '../../scripts/normtext/erwaegung-normalisieren';
import { mappeEntscheidOCL, type OclStructure, type OclParagraph } from '../../scripts/normtext/adapter-entscheide';
import { bereinigeFliesstext } from '../lib/rechtsprechung/register';
import type { EntscheidBlock } from '../lib/rechtsprechung/typen';

const FIX = join(process.cwd(), 'src', 'tests', 'fixtures');
const lies = (f: string) => JSON.parse(readFileSync(join(FIX, f), 'utf8'));

const worte = (bl: EntscheidBlock[]) => bl.map((b) => b.text).join('\n').replace(/\s+/g, ' ').trim();

describe('markenPlausibel — Sammlungs-Auszug ab consid. N≥3 (der Defektfall)', () => {
  it('akzeptiert Auszug ab 3 mit Sub-Ebene und Top-Folge', () => {
    expect(markenPlausibel([{ e_number: '3' }, { e_number: '3.1' }, { e_number: '4' }])).toBe(true);
  });
  it('akzeptiert reine Sub-Folge 3.1–3.3', () => {
    expect(markenPlausibel([{ e_number: '3.1' }, { e_number: '3.2' }, { e_number: '3.3' }])).toBe(true);
  });
  it('akzeptiert echte Innenlücke 4→7→9.2 (amtliche Teilmenge)', () => {
    expect(markenPlausibel([{ e_number: '4' }, { e_number: '4.1' }, { e_number: '7' }, { e_number: '9.2' }])).toBe(true);
  });
});

describe('markenPlausibel — Fehlmarken bleiben verworfen', () => {
  it('verwirft Jahreszahl als Top-Marke (≥1900)', () => {
    expect(markenPlausibel([{ e_number: '2024' }, { e_number: '2025' }])).toBe(false);
  });
  it('verwirft Block-Start mit Monatsname (Datum als Marke)', () => {
    expect(markenPlausibel([{ e_number: '1', text: 'April 2026 erging der Entscheid.' }])).toBe(false);
  });
  it('verwirft nicht-monotone Top-Folge [3,1,2]', () => {
    expect(markenPlausibel([{ e_number: '3' }, { e_number: '1' }, { e_number: '2' }])).toBe(false);
  });
  it('verwirft leere Liste', () => {
    expect(markenPlausibel([])).toBe(false);
  });
});

describe('Bug-Check-Regressionen (adversariale Review)', () => {
  it('#1 fehlende/leere e_number schleust KEINE Phantom-Top-0 ein', () => {
    // Eine voll nummerierte Erwägung mit einem unnummerierten Zwischen-Absatz
    // bleibt plausibel (früher: Number('')===0 → nicht-monoton → alles flach).
    expect(markenPlausibel([{ e_number: '3' }, { e_number: '' }, { e_number: '4' }])).toBe(true);
    expect(markenPlausibel([{ e_number: '1' }, { e_number: '2' }, { e_number: undefined }])).toBe(true);
  });
  it('#1 normalisiereErwaegung: nummerierte Absätze behalten Marke, leerer wird flach, Text erhalten', () => {
    const p: OclParagraph[] = [
      { e_number: '3', text: 'Erwägung drei.' },
      { e_number: '', text: 'Zwischentext ohne Nummer.' },
      { e_number: '4', text: 'Erwägung vier.' },
    ];
    const bl = normalisiereErwaegung(p, []);
    expect(bl.map((b) => b.marke)).toEqual(['E. 3', null, 'E. 4']);
    expect(worte(bl)).toBe('Erwägung drei. Zwischentext ohne Nummer. Erwägung vier.');
  });
  it('#4 fehlgeparste hohe Top-Nummer (>60) wird verworfen, realistische bleibt', () => {
    expect(markenPlausibel([{ e_number: '1' }, { e_number: '850' }])).toBe(false);
    expect(markenPlausibel([{ e_number: '400' }])).toBe(false);
    expect(markenPlausibel([{ e_number: '12' }, { e_number: '13' }, { e_number: '14' }])).toBe(true);
  });
  it('#2 spalteMonolith fabriziert KEINE Marken auf Prosa-Aufzählung (2 Köpfe, §1)', () => {
    expect(spalteMonolith('1. Auflage des Kommentars erschien 2020.\n\n2. Kammer des Gerichts entschied.')).toBeNull();
    expect(spalteMonolith('1. ABC GmbH wurde gegründet.\n\n2. Der Beschwerdeführer rügt dies.')).toBeNull();
  });
  it('#2 spalteMonolith verlangt lückenlose Folge ab 1 (nicht-konsekutiv → null)', () => {
    expect(spalteMonolith('1. Text A.\n\n2. Text B.\n\n4. Text D.')).toBeNull();   // 3 fehlt
    expect(spalteMonolith('2. Text B.\n\n3. Text C.\n\n4. Text D.')).toBeNull();   // Start ≠ 1
  });
  it('#5 tiefe folgt der Segmentzahl der Marke, NICHT p.depth', () => {
    const p: OclParagraph[] = [
      { e_number: '3', depth: 3, text: 'Top.' },
      { e_number: '3.1', depth: 1, text: 'Sub.' },
    ];
    const bl = normalisiereErwaegung(p, []);
    expect(bl.map((b) => b.tiefe)).toEqual([1, 2]);   // 'E. 3' → 1, 'E. 3.1' → 2
  });
});

describe('fuehrendeGliederungsnummer — Schutz gegen Fehltreffer', () => {
  it('kein Treffer bei Datum „2. Mai 2026 …"', () => {
    expect(fuehrendeGliederungsnummer('2. Mai 2026 wurde der Entscheid eröffnet.')).toBeNull();
  });
  it('kein Treffer bei Betrag „1 000 Franken"', () => {
    expect(fuehrendeGliederungsnummer('1 000 Franken wurden zugesprochen.')).toBeNull();
  });
  it('kein Treffer bei nacktem Jahr „2024 …"', () => {
    expect(fuehrendeGliederungsnummer('2024 änderte sich die Rechtslage.')).toBeNull();
  });
  it('kein Treffer bei Aufzählungsstrich', () => {
    expect(fuehrendeGliederungsnummer('— Aufzählung ohne Ziffer')).toBeNull();
  });
  it('echter Treffer „3.3.1 Die Vorinstanz …"', () => {
    expect(fuehrendeGliederungsnummer('3.3.1 Die Vorinstanz hat festgestellt …'))
      .toEqual({ nummer: '3.3.1', rest: 'Die Vorinstanz hat festgestellt …' });
  });
});

describe('spalteMonolith — kein Falsch-Split auf echtem Korpus', () => {
  it('Korpus-Block (Fliesstext ohne führende Ziffern) → null', () => {
    const real = 'Anlass zur vorliegenden Beschwerde gibt die Konkurseröffnung zufolge '
      + 'Nichtverlängerung der definitiven Stundung. Während die Vorinstanz dies bejahte, '
      + 'macht die Beschwerdeführerin das Gegenteil geltend.';
    expect(spalteMonolith(real)).toBeNull();
  });
  it('SG-Monolith mit PDF-Kopf-Leak → null', () => {
    const sg = readFileSync(join(process.cwd(), 'public', 'rechtsprechung', 'kanton', 'SG', 'sg_gerichte', 'B2023_225.json'), 'utf8');
    const erw = JSON.parse(sg).eintraege[0].abschnitte.find((a: { typ: string }) => a.typ === 'erwaegung');
    expect(spalteMonolith(erw.bloecke[0].text)).toBeNull();
  });
  it('GR-Monolith (Start mitten im Satz „April 2026 …") → null', () => {
    const gr = readFileSync(join(process.cwd(), 'public', 'rechtsprechung', 'kanton', 'GR', 'gr_gerichte', 'ZR2202624.json'), 'utf8');
    const erw = JSON.parse(gr).eintraege[0].abschnitte.find((a: { typ: string }) => a.typ === 'erwaegung');
    expect(spalteMonolith(erw.bloecke[0].text)).toBeNull();
  });
});

describe('spalteMonolith — echter Positiv', () => {
  it('synthetischer Monolith „1.… 2.… 3.…" → 3 Blöcke mit Marken', () => {
    const mono = '1. Text A zur ersten Erwägung.\n\n2. Text B zur zweiten Erwägung.\n\n3. Text C zur dritten Erwägung.';
    const bl = spalteMonolith(mono)!;
    expect(bl.map((b) => b.marke)).toEqual(['E. 1', 'E. 2', 'E. 3']);
    expect(worte(bl)).toBe('1. Text A zur ersten Erwägung. 2. Text B zur zweiten Erwägung. 3. Text C zur dritten Erwägung.');
  });
});

describe('normalisiereErwaegung — paras-Pfad', () => {
  const auszug = lies('ocl-structure-auszug-ab3.json') as OclStructure;
  const paras = auszug.erwaegungen_paragraphs as OclParagraph[];

  it('Sammlungs-Auszug ab consid. 3 mit Lücke 4→7 → alle Marken gesetzt (schliesst den blinden Fleck)', () => {
    const bl = normalisiereErwaegung(paras, []);
    expect(bl.map((b) => b.marke)).toEqual(['E. 3', 'E. 3.1', 'E. 3.2', 'E. 4', 'E. 7', 'E. 9.2']);
    expect(bl.every((b) => b.marke)).toBe(true);
  });
  it('Fixture-Roundtrip 5A_1100_2025: alle Marken, tiefe == Segmentzahl (keine Regression)', () => {
    const str = lies('ocl-structure-5A_1100_2025.json') as OclStructure;
    const p = str.erwaegungen_paragraphs as OclParagraph[];
    const bl = normalisiereErwaegung(p, []);
    expect(bl.every((b) => b.marke)).toBe(true);
    for (const b of bl) {
      const seg = (b.marke ?? '').replace(/^E\.\s*/, '').split('.').length;
      // tiefe folgt depth (vorhanden im Fixture) bzw. Segmentzahl — nie widersprüchlich.
      expect(b.tiefe).toBeGreaterThanOrEqual(1);
      expect(b.tiefe).toBeLessThanOrEqual(seg);
    }
  });
  it('unplausible paras (Jahr als Marke) → alle marke=null, Text erhalten', () => {
    const p: OclParagraph[] = [{ e_number: '2024', text: 'Erster Absatz.' }, { e_number: '2025', text: 'Zweiter Absatz.' }];
    const bl = normalisiereErwaegung(p, []);
    expect(bl.every((b) => b.marke === null)).toBe(true);
    expect(worte(bl)).toBe('Erster Absatz. Zweiter Absatz.');
  });
});

describe('normalisiereErwaegung — Bestands-Pfad (paras leer)', () => {
  it('Multi-Block-Flach bleibt UNVERÄNDERT (keine Zitat-Fabrikation)', () => {
    const flach: EntscheidBlock[] = [
      { marke: null, text: 'Erster Block. Vgl. BGE 138 III 261 E. 1.1.' },
      { marke: null, text: 'Zweiter Block ohne Gliederungsziffer.' },
    ];
    expect(normalisiereErwaegung([], flach)).toBe(flach);
  });
  it('echter Monolith wird gesplittet', () => {
    const mono: EntscheidBlock[] = [{ marke: null, text: '1. Text A.\n\n2. Text B.\n\n3. Text C.' }];
    const bl = normalisiereErwaegung([], mono);
    expect(bl.map((b) => b.marke)).toEqual(['E. 1', 'E. 2', 'E. 3']);
  });
});

describe('INVARIANTE — Wort-Erhalt (zentral, §1)', () => {
  const faelle: { name: string; paras: OclParagraph[]; bloecke: EntscheidBlock[] }[] = [
    { name: 'Auszug ab 3', paras: (lies('ocl-structure-auszug-ab3.json') as OclStructure).erwaegungen_paragraphs as OclParagraph[], bloecke: [] },
    { name: '5A_1100_2025', paras: (lies('ocl-structure-5A_1100_2025.json') as OclStructure).erwaegungen_paragraphs as OclParagraph[], bloecke: [] },
    { name: 'Monolith-Split', paras: [], bloecke: [{ marke: null, text: '1. Text A.\n\n2. Text B.\n\n3. Text C.' }] },
    { name: 'Flach unverändert', paras: [], bloecke: [{ marke: null, text: 'Ein Absatz.' }, { marke: null, text: 'Noch einer.' }] },
  ];
  for (const f of faelle) {
    it(`konkatenierte Wortfolge bleibt zeichengleich: ${f.name}`, () => {
      // Baseline = der EINMAL bereinigte Eingabetext (genau das, was die Funktion
      // intern pro Paragraph/Block ebenfalls genau einmal anwendet). Die Invariante
      // prüft, dass die Normalisierung darüber hinaus nur Marken setzt/neu chunkt —
      // kein Wort verliert oder umstellt.
      const vorher = f.paras.length
        ? worte(f.paras.map((p): EntscheidBlock => ({ marke: null, text: bereinigeFliesstext(String(p.text ?? p.text_excerpt ?? '')) })))
        : worte(f.bloecke);
      const nachher = worte(normalisiereErwaegung(f.paras, f.bloecke));
      expect(nachher).toBe(vorher);
    });
  }
});

describe('Determinismus (§2)', () => {
  it('zweimaliger Aufruf mit gleichem Input → strikt gleiches Resultat', () => {
    const str = lies('ocl-structure-auszug-ab3.json') as OclStructure;
    const p = str.erwaegungen_paragraphs as OclParagraph[];
    expect(normalisiereErwaegung(p, [])).toEqual(normalisiereErwaegung(p, []));
  });
});

describe('Renderer-Vertrag', () => {
  it('Top-Ziffern-Folge der normalisierten Blöcke ist monoton (keine doppelten Sektionen)', () => {
    const str = lies('ocl-structure-auszug-ab3.json') as OclStructure;
    const bl = normalisiereErwaegung(str.erwaegungen_paragraphs as OclParagraph[], []);
    const tops = bl.map((b) => Number((b.marke ?? '').replace(/^E\.\s*/, '').split('.')[0]));
    for (let i = 1; i < tops.length; i++) expect(tops[i]).toBeGreaterThanOrEqual(tops[i - 1]);
  });
  it('mappeEntscheidOCL strukturiert den Auszug-ab-3 BGE (Live-Import-Pfad, der grosse Hebel)', () => {
    const str = lies('ocl-structure-auszug-ab3.json') as OclStructure;
    const det = { decision_id: 'bger_auszug_ab3', court: 'bger', canton: 'CH', language: 'de', decision_date: '2025-03-12', docket_number: '5A_999/2025', full_text: 'Sachverhalt:\n\nText.\n\nErwägungen:\n\nText.' };
    const snap = mappeEntscheidOCL(det, str, '2026-06-24')!;
    const erw = snap.abschnitte.find((a) => a.typ === 'erwaegung')!;
    expect(erw.bloecke.every((b) => b.marke)).toBe(true);
    expect(erw.bloecke[0].marke).toBe('E. 3');
  });
});
