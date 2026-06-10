import { describe, it, expect } from 'vitest';
import {
  KO_DEFAULTS, koMaengel, koZusammenstellen, koStreitwert, koPrefillKodieren, koPrefillLesen,
  type KoAnswers,
} from '../lib/vorlagen/klageOrdentlich';

// Akzeptanztests Klage ordentliches Verfahren (Auftrag David 10.6.2026).
// Normgrundlage Art. 219–221 ZPO am Fedlex-Cache verifiziert (10.6.2026).

function basis(patch: Partial<KoAnswers> = {}): KoAnswers {
  return {
    ...KO_DEFAULTS,
    gerichtsKanton: 'ZH',
    gerichtAufgeloest: { zeilen: ['Bezirksgericht Zürich', 'Postfach', '8036 Zürich'] },
    streitwert: '80000',
    klaeger: { typ: 'natuerlich', vorname: 'Anna', name: 'Muster', strasse: 'Musterweg 1', plz: '8001', ort: 'Zürich' },
    beklagte: { typ: 'juristisch', firma: 'X AG', sitzStrasse: 'Beispielgasse 2', sitzPlz: '8002', sitzOrt: 'Zürich' },
    streitgegenstand: 'Forderung aus Werkvertrag',
    tatsachen: [
      { text: 'Die Parteien schlossen am 1.2.2026 einen Werkvertrag über CHF 80\'000.', beweise: [{ bezeichnung: 'Werkvertrag vom 1.2.2026 (Urkunde)' }] },
      { text: 'Das Werk wurde am 1.4.2026 abgenommen; die Rechnung blieb unbezahlt.', beweise: [{ bezeichnung: 'Abnahmeprotokoll (Urkunde)' }, { bezeichnung: 'Werkvertrag vom 1.2.2026 (Urkunde)' }] },
    ],
    klagebewilligungVorhanden: true,
    klagebewilligungDatum: '2026-05-04',
    ort: 'Zürich',
    datum: '2026-06-10',
    ...patch,
  };
}

const text = (a: KoAnswers) => koZusammenstellen(a).dokument.absaetze.map((x) => `${x.ueberschrift ?? ''}\n${x.text}`).join('\n');

describe('Klage ordentlich — Mängel-Gate (Art. 221 ZPO)', () => {
  it('Vollfall: keine Mängel', () => {
    expect(koMaengel(basis())).toEqual([]);
  });
  it('Verfahrens-Weiche: Streitwert ≤ 30\'000 → vereinfachtes Verfahren (Art. 243 Abs. 1)', () => {
    const m = koMaengel(basis({ streitwert: '20000' }));
    expect(m.some((x) => x.text.includes('VEREINFACHTE'))).toBe(true);
    expect(koMaengel(basis({ streitwert: '30001' })).some((x) => x.text.includes('VEREINFACHTE'))).toBe(false);
  });
  it('Streitwert ist Pflicht bei vermögensrechtlicher Klage (lit. c); entfällt sonst', () => {
    expect(koMaengel(basis({ streitwert: '', begehrenTyp: 'frei', freieRechtsbegehren: ['Es sei festzustellen …'] }))
      .some((x) => x.text.includes('Streitwert angeben'))).toBe(true);
    expect(koMaengel(basis({ vermoegensrechtlich: false, streitwert: '', begehrenTyp: 'frei', freieRechtsbegehren: ['Es sei festzustellen …'] }))
      .some((x) => x.text.includes('Streitwert angeben'))).toBe(false);
  });
  it('Begründung ist PFLICHT: Tatsache und Beweis je Tatsache (lit. d/e)', () => {
    expect(koMaengel(basis({ tatsachen: [{ text: '', beweise: [] }] }))
      .some((x) => x.text.includes('Tatsachenbehauptung'))).toBe(true);
    expect(koMaengel(basis({ tatsachen: [{ text: 'Behauptung ohne Beweis.', beweise: [] }] }))
      .some((x) => x.text.includes('Beweismittel bezeichnen'))).toBe(true);
  });
  it('Gerichts-Gate: ohne Auflösung/Handeingabe Mangel; BS automatisch', () => {
    expect(koMaengel(basis({ gerichtAufgeloest: undefined }))
      .some((x) => x.text.includes('Kanton ZH'))).toBe(true);
    expect(koMaengel(basis({ gerichtsKanton: 'BS', gerichtAufgeloest: undefined }))
      .some((x) => x.text.includes('Kanton BS'))).toBe(false);
  });
});

describe('Klage ordentlich — Dokument (Assemble)', () => {
  it('Adressat aus kantonaler Auflösung; BS aus abgenommener Stammdate', () => {
    expect(text(basis())).toContain('8036 Zürich');
    expect(text(basis({ gerichtsKanton: 'BS', gerichtAufgeloest: undefined }))).toContain('Bäumleingasse 5');
  });
  it('Tatsachen nummeriert mit Beweis-Zeile; Beweismittelverzeichnis dedupliziert', () => {
    const t = text(basis());
    expect(t).toContain('I. Tatsächliches');
    expect(t).toContain('Beweis: Werkvertrag vom 1.2.2026 (Urkunde)');
    // Nummerierung beginnt in der Begründung bei 1 (nicht engine-fortlaufend)
    expect(t).toMatch(/1\. Die Parteien schlossen/);
    // Dedupe: der Werkvertrag erscheint im Verzeichnis genau einmal
    const verzeichnis = t.split('Beweismittelverzeichnis')[1].split('Beilagen')[0];
    expect(verzeichnis.match(/Werkvertrag vom 1\.2\.2026/g)).toHaveLength(1);
  });
  it('Streitwertangabe im Betreff (lit. c); Klagebewilligung als Beilage 1', () => {
    const t = text(basis());
    expect(t).toContain("Streitwert: CHF 80'000");
    expect(t).toContain('Beilage 1: Klagebewilligung vom 04.05.2026');
  });
  it('rechtliche Begründung nur wenn erfasst (Abs. 3)', () => {
    expect(text(basis())).not.toContain('II. Rechtliches');
    expect(text(basis({ rechtlicheBegruendung: [{ text: 'Anspruch aus Art. 363 OR.' }] }))).toContain('II. Rechtliches');
  });
  it('freie Rechtsbegehren 1:1 übernommen', () => {
    const t = text(basis({ begehrenTyp: 'frei', freieRechtsbegehren: ['Es sei festzustellen, dass …'] }));
    expect(t).toContain('Es sei festzustellen, dass …');
  });
});

describe('Klage ordentlich — Prefill-Brücke', () => {
  it('kodieren/lesen Round-Trip (kanton validiert)', () => {
    const q = koPrefillKodieren({ streitwertCHF: 80000, kanton: 'GR' });
    expect(koPrefillLesen('?' + q)).toMatchObject({ streitwert: '80000', gerichtsKanton: 'GR' });
    expect(koPrefillLesen('?kanton=XX')).toBeNull();
  });
  it('koStreitwert parst Apostroph-Format', () => {
    expect(koStreitwert(basis({ streitwert: "120'500.50" }))).toBe(120500.5);
  });
});
