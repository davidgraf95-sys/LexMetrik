// W3-TARIF-STAND — Verdikt-Regel des Tors `check:tarif-drift` (ohne Netz).
import { describe, it, expect } from 'vitest';
import { beurteile, zaehle, exitCode } from '../../scripts/tarif/drift-logik';
import { standDatum } from '../../scripts/tarif/stand';
import { systematikNummer, inVollzugSeit } from '../../scripts/tarif/tarif-drift';

const hinterlegt = (stand: string, kennung: string | null = null) => ({
  kennung,
  stand: standDatum(stand),
});
const quelle = (kennung: string | null, standIso: string | null) => ({
  kennung, standIso, anzeige: `${kennung ?? '—'}/${standIso ?? '—'}`,
});

describe('beurteile — Verdikt je Tarif-Eintrag', () => {
  it('1. SG-2808-Klasse: gepinnte Fassung ≠ amtlich geltende → DRIFT', () => {
    // sGS 941.12 hing an LexWork-Version 2808 (Stand 1.3.2012), amtlich gilt 3863.
    const b = beurteile(hinterlegt('1.3.2012', '2808'), quelle('3863', '2026-07-01'), null);
    expect(b.verdikt).toBe('DRIFT');
    expect(b.begruendung).toContain('2808');
    expect(b.begruendung).toContain('3863');
  });

  it('2. gleiche Fassungskennung → aktuell', () => {
    expect(beurteile(hinterlegt('1.3.2012', '3863'), quelle('3863', '2026-07-01'), null).verdikt)
      .toBe('aktuell');
  });

  it('3. Fassungskennung schlägt den Datumsvergleich (die Kennung IST die Fassung)', () => {
    // Der Anzeige-Stand liest sich als 1.7.2026 = amtliches Datum; die gepinnte
    // Version ist trotzdem die alte → DRIFT, kein falsches Grün.
    const b = beurteile(
      hinterlegt('1.3.2012 (Folgefassung 1.7.2026 wortgleich)', '2808'),
      quelle('3863', '2026-07-01'), null);
    expect(b.verdikt).toBe('DRIFT');
  });

  it('3b. abrogated:true → immer DRIFT, auch bei sonst fassungsgleichem Stand (Befund M2, 6.9.2026)', () => {
    // Fassungsgleicher Stand — unter der alten Regel (kein Verdikt hing an
    // `abrogated`) wäre das über den Fassungskennungs-Vergleich «aktuell».
    const b = beurteile(
      hinterlegt('1.3.2012', '3863'),
      { kennung: '3863', standIso: '2026-07-01', anzeige: 'Version 3863, seit 2026-07-01, AUFGEHOBEN', abrogated: true },
      null,
    );
    expect(b.verdikt).toBe('DRIFT');
    expect(b.begruendung).toContain('aufgehoben');
  });

  it('4. taggenauer Stand: Quelle später → DRIFT, sonst aktuell', () => {
    expect(beurteile(hinterlegt('1.1.2019'), quelle(null, '2025-01-01'), null).verdikt).toBe('DRIFT');
    expect(beurteile(hinterlegt('1.1.2026'), quelle(null, '2020-06-01'), null).verdikt).toBe('aktuell');
    expect(beurteile(hinterlegt('1.1.2026'), quelle(null, '2026-01-01'), null).verdikt).toBe('aktuell');
  });

  it('5. jahrgenauer Stand: im selben Jahr wird nicht geraten → unklar', () => {
    expect(beurteile(hinterlegt('2026 (konsolidiert)'), quelle(null, '2026-01-01'), null).verdikt).toBe('unklar');
    // Mehrjahres-Strings sind seit M1 (6.9.2026) mehrdeutig → unbekannt → unklar, nie aktuell.
    expect(beurteile(hinterlegt('2012/2013'), quelle(null, '2026-07-01'), null).verdikt).toBe('unklar');
    expect(beurteile(hinterlegt('2019/2025'), quelle(null, '2011-01-01'), null).verdikt).toBe('unklar');
  });

  it('6. Stand ohne Datum → unklar, nie aktuell', () => {
    expect(beurteile(hinterlegt('geltende Fassung'), quelle(null, '2026-01-01'), null).verdikt).toBe('unklar');
  });

  it('7. Netzfehler → unerreichbar; kein Adapter → unklar. Beides nie grün.', () => {
    expect(beurteile(hinterlegt('1.1.2024'), null, 'HTTP 503').verdikt).toBe('unerreichbar');
    expect(beurteile(hinterlegt('1.1.2024'), null, null).verdikt).toBe('unklar');
  });

  it('8. Exit-Code: DRIFT ist hart; unklar/unerreichbar erst mit --streng', () => {
    expect(exitCode(zaehle(['aktuell', 'unklar']), false)).toBe(0);
    expect(exitCode(zaehle(['aktuell', 'unklar']), true)).toBe(1);
    expect(exitCode(zaehle(['aktuell', 'DRIFT']), false)).toBe(1);
    expect(exitCode(zaehle(['aktuell']), true)).toBe(0);
  });
});

describe('Auflösung des Erlasses aus erlassNr (§7 kein Raten)', () => {
  it('9. eindeutige Nummer wird gelesen, mehrdeutige nicht geraten', () => {
    expect(systematikNummer('sGS 941.12')).toEqual({ nr: '941.12' });
    expect(systematikNummer('BR 210.370')).toEqual({ nr: '210.370' });
    expect(systematikNummer('SRL 258')).toEqual({ nr: '258' });
    // SG führt zwei Erlasse in EINEM Feld — die erste zu nehmen ergab ein
    // Verdikt über den falschen Erlass (Befund 6.9.2026).
    expect(systematikNummer('914.5 (GB-GebV); 821.5 (GebT)'))
      .toEqual({ mehrdeutig: ['914.5', '821.5'] });
    expect(systematikNummer('urilaw.ch')).toBeNull();
  });
});

describe('In-Kraft-Datum aus LexWork version_dates_str', () => {
  it('10. deutsche, St. Galler und französische Schreibweise', () => {
    expect(inVollzugSeit('Aktuelle Version in Kraft seit: 01.01.2026 (Beschlussdatum: 26.11.2025)')).toBe('2026-01-01');
    // SG schreibt «in Vollzug seit» — ohne diese Variante fiele der Stand auf
    // das Erlassdatum zurück und ein SG-Erlass sähe ewig aktuell aus.
    expect(inVollzugSeit('Aktuelle Fassung in Vollzug seit: 01.07.2026 (Erlassdatum: 05.12.2025)')).toBe('2026-07-01');
    expect(inVollzugSeit('Version en vigueur depuis le 01.03.2016')).toBe('2016-03-01');
    expect(inVollzugSeit(undefined)).toBeNull();
    expect(inVollzugSeit('ohne Datum')).toBeNull();
  });

  it('9. nurIso: Portal-Fremddatum nur strikt ISO übernehmen, sonst null (Code-Lupe 6.9.2026)', async () => {
    const { nurIso } = await import('../../scripts/tarif/tarif-drift');
    expect(nurIso('2012-03-01')).toBe('2012-03-01');
    expect(nurIso('01.03.2012')).toBeNull();
    expect(nurIso('')).toBeNull();
    expect(nurIso(undefined)).toBeNull();
  });
});
