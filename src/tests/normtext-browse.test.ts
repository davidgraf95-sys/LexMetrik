import { describe, it, expect } from 'vitest';
import {
  gruppiereNachGebiet, gruppiereNachKanton, filtern, baueBaender, bandFuerToken,
  baueGliederungsbaum, type Sektion, type StrukturMap,
} from '../lib/normtext/browse';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import type { NormSnapshot } from '../lib/normtext/typen';

function be(p: Partial<BrowseErlass>): BrowseErlass {
  return {
    key: 'X', ebene: 'bund', kanton: null, kuerzel: 'X', titel: 'Titel', sr: null,
    rechtsgebiet: 'privat', sprache: 'de', rang: 0, status: 'snapshot',
    datei: 'bund/X.json', artikelAnzahl: 1, stand: '2026-01-01', quelleUrl: 'u', fassungsToken: 't',
    pdfPfad: null,
    ...p,
  };
}

describe('gruppiereNachGebiet', () => {
  it('gruppiert nach Rechtsgebiet, leere Gruppen weg, GEBIETE-Reihenfolge', () => {
    const g = gruppiereNachGebiet([
      be({ key: 'OR', rechtsgebiet: 'privat' }),
      be({ key: 'StGB', rechtsgebiet: 'straf' }),
      be({ key: 'ZGB', rechtsgebiet: 'privat' }),
    ]);
    expect(g.map((x) => x.gebiet)).toEqual(['privat', 'straf']);
    expect(g[0].erlasse.map((e) => e.key)).toEqual(['OR', 'ZGB']);
  });
});

describe('gruppiereNachKanton', () => {
  it('gruppiert alphabetisch nach Kanton', () => {
    const g = gruppiereNachKanton([
      be({ key: 'ZH-1', ebene: 'kanton', kanton: 'ZH' }),
      be({ key: 'BE-1', ebene: 'kanton', kanton: 'BE' }),
    ]);
    expect(g.map((x) => x.kanton)).toEqual(['BE', 'ZH']);
  });
});

describe('filtern', () => {
  const liste = [
    be({ key: 'OR', kuerzel: 'OR', titel: 'Obligationenrecht', sr: '220' }),
    be({ key: 'StGB', kuerzel: 'StGB', titel: 'Strafgesetzbuch', sr: '311.0' }),
  ];
  it('leerer Term → alles', () => { expect(filtern(liste, '  ')).toHaveLength(2); });
  it('matcht Kürzel/Titel/SR (case-insensitiv)', () => {
    expect(filtern(liste, 'oblig').map((e) => e.key)).toEqual(['OR']);
    expect(filtern(liste, '311').map((e) => e.key)).toEqual(['StGB']);
    expect(filtern(liste, 'STGB').map((e) => e.key)).toEqual(['StGB']);
  });
});

const snap = (artikel: string, label: string): NormSnapshot => ({
  id: `bund/X/art_${artikel}`, ebene: 'bund', quelle: 'X', erlass: 'X',
  artikel, artikelLabel: label, bloecke: [{ absatz: null, text: 't' }],
  stand: '2026-01-01', quelleUrl: 'u', abgerufen: '2026-01-01', fassungsToken: 't', sha: 's',
});

describe('baueGliederungsbaum — Randtitel-Promotion (6b)', () => {
  // Hilfen: Gliederung + Marginalie je Artikel-Token.
  const arts = (...toks: string[]) => toks.map((t) => snap(t, `Art. ${t}`));
  const struktur = (m: Record<string, { gliederung?: { ebene: number; label: string }[]; marginalie?: string[] }>): StrukturMap =>
    Object.fromEntries(Object.entries(m).map(([k, v]) => [k, {
      gliederung: v.gliederung ?? [], marginalie: v.marginalie ?? [],
    }]));

  // Knoten im Baum per Label finden (Tiefensuche).
  const finde = (sek: Sektion[], label: string): Sektion | null => {
    for (const s of sek) { if (s.label === label) return s; const t = finde(s.kinder, label); if (t) return t; }
    return null;
  };

  it('promotet geteilte Ahnen-Stufen zu Knoten; das Blatt bleibt am Artikel', () => {
    // art1: …/A. X (blatt «1. a») → liegt direkt in «A. X»
    // art2: …/A. X/2. b (blatt «i. p») → «2. b» ist Kind von «A. X»
    const { sektionen, ohneGliederung } = baueGliederungsbaum(
      arts('1', '2'),
      struktur({
        1: { gliederung: [{ ebene: 0, label: 'T' }], marginalie: ['A. X', '1. a'] },
        2: { gliederung: [{ ebene: 0, label: 'T' }], marginalie: ['A. X', '2. b', 'i. p'] },
      }),
    );
    expect(ohneGliederung).toHaveLength(0);
    const T = sektionen[0];
    expect(T.label).toBe('T'); expect(T.ebene).toBe(0); expect(T.randtitel).toBeFalsy();
    const AX = finde(sektionen, 'A. X')!;
    expect(AX.ebene).toBe(1); expect(AX.randtitel).toBe(true);
    // «A. X» trägt Art. 1 DIREKT und die Untergruppe «2. b».
    expect(AX.artikel.map((e) => e.artikel)).toEqual(['1']);
    const B = finde(sektionen, '2. b')!;
    expect(B.ebene).toBe(2); expect(B.randtitel).toBe(true);
    expect(B.artikel.map((e) => e.artikel)).toEqual(['2']);
    // «1. a» / «i. p» (Blätter) sind KEINE Knoten.
    expect(finde(sektionen, '1. a')).toBeNull();
    expect(finde(sektionen, 'i. p')).toBeNull();
  });

  it('Einzel-Randtitel (Sachüberschrift ohne Ahnen) wird KEIN Knoten', () => {
    const { sektionen } = baueGliederungsbaum(
      arts('3'),
      struktur({ 3: { gliederung: [{ ebene: 0, label: 'T' }], marginalie: ['Nur Titel'] } }),
    );
    expect(finde(sektionen, 'Nur Titel')).toBeNull();
    expect(sektionen[0].artikel.map((e) => e.artikel)).toEqual(['3']); // direkt in der Gliederung
  });

  it('aufgehobenes Blatt («c. …») reisst den Artikel nicht aus der Gruppe', () => {
    // art4 (aufgehoben): …/A. X/2. b mit leerem Blatt → liegt in «2. b», keine eigene Überschrift.
    const { sektionen } = baueGliederungsbaum(
      arts('4'),
      struktur({ 4: { gliederung: [{ ebene: 0, label: 'T' }], marginalie: ['A. X', '2. b', 'c. …'] } }),
    );
    const B = finde(sektionen, '2. b')!;
    expect(B.artikel.map((e) => e.artikel)).toEqual(['4']);
    expect(finde(sektionen, 'c. …')).toBeNull();
  });

  it('ohne amtliche Gliederung promotet die Randtitel-Ahnen ab Ebene 0', () => {
    const { sektionen, ohneGliederung } = baueGliederungsbaum(
      arts('5'),
      struktur({ 5: { gliederung: [], marginalie: ['A. K', 'I. u'] } }),
    );
    expect(ohneGliederung).toHaveLength(0); // landet NICHT mehr flach, sondern unter «A. K»
    const AK = finde(sektionen, 'A. K')!;
    expect(AK.ebene).toBe(0); expect(AK.randtitel).toBe(true);
    expect(AK.artikel.map((e) => e.artikel)).toEqual(['5']);
  });

  it('weder Gliederung noch Ahnen → ohneGliederung (flach)', () => {
    const { sektionen, ohneGliederung } = baueGliederungsbaum(
      arts('6'),
      struktur({ 6: { gliederung: [], marginalie: ['Einzeltitel'] } }),
    );
    expect(sektionen).toHaveLength(0);
    expect(ohneGliederung.map((e) => e.artikel)).toEqual(['6']);
  });
});

describe('baueBaender / bandFuerToken', () => {
  const eintraege = Array.from({ length: 95 }, (_, i) => snap(String(i + 1), `Art. ${i + 1}`));
  it('chunked in Bänder fixer Grösse mit Spannen-Label', () => {
    const b = baueBaender(eintraege, 40);
    expect(b).toHaveLength(3);
    expect(b[0].label).toBe('Art. 1 – Art. 40');
    expect(b[2].eintraege).toHaveLength(15);
  });
  it('leere Liste → keine Bänder', () => { expect(baueBaender([])).toEqual([]); });
  it('bandFuerToken findet das richtige Band', () => {
    const b = baueBaender(eintraege, 40);
    expect(bandFuerToken(b, '45')).toBe(1);
    expect(bandFuerToken(b, '999')).toBe(-1);
  });
});
