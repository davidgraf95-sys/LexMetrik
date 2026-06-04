import { describe, it, expect } from 'vitest';
import { berechneGewaehrleistung } from '../lib/gewaehrleistung';
import type { GewaehrleistungInput } from '../lib/gewaehrleistung';

const base = (over: Partial<GewaehrleistungInput>): GewaehrleistungInput => ({
  vertragstyp: 'fahrniskauf',
  vertragsdatum: '2025-05-01',
  objekt: 'beweglich',
  uebergabe: '2025-06-02',
  mangelTyp: 'offen',
  kanton: 'ZH',
  stichtag: '2026-06-04',
  ...over,
});

describe('Gewährleistung – Regime-Weiche und Grundfristen', () => {
  it('Fahrniskauf (Altrecht): 2 Jahre ab Ablieferung; Rüge «sofort» mit Richtwerten', () => {
    const r = berechneGewaehrleistung(base({}));
    expect(r.rechtsstand).toBe('alt');
    expect(r.verjaehrung.jahre).toBe(2);
    expect(r.verjaehrung.endeISO).toBe('2027-06-02'); // Mi
    expect(r.ruege.art).toBe('sofort');
    expect(r.ruege.sicherISO).toBe('2025-06-05');
    expect(r.ruege.richtwertISO).toBe('2025-06-09');
    expect(r.ruege.maximalISO).toBe('2025-06-13');
  });

  it('Fahrniskauf neu, integrierte Sache: 60-Tage-Rüge (zwingend) ab Entdeckung; Verjährung 5 Jahre', () => {
    const r = berechneGewaehrleistung(base({
      vertragsdatum: '2026-02-01', objekt: 'integriert',
      uebergabe: '2026-03-02', mangelTyp: 'versteckt', entdeckung: '2026-05-04',
    }));
    expect(r.rechtsstand).toBe('neu');
    expect(r.ruege.art).toBe('tage60');
    expect(r.ruege.zwingend).toBe(true);
    expect(r.ruege.endeISO).toBe('2026-07-03'); // Fr
    expect(r.verjaehrung.jahre).toBe(5);
    expect(r.verjaehrung.endeISO).toBe('2031-03-03'); // 02.03.2031 = So → Mo
  });

  it('Altrecht bleibt für Altverträge massgeblich (keine 60-Tage-Frist)', () => {
    const r = berechneGewaehrleistung(base({
      vertragsdatum: '2025-12-15', objekt: 'integriert', uebergabe: '2026-02-02',
    }));
    expect(r.rechtsstand).toBe('alt');
    expect(r.ruege.art).toBe('sofort');
    expect(r.verjaehrung.jahre).toBe(5); // Art. 210 Abs. 2 galt schon altrechtlich
  });

  it('Werkvertrag, unbewegliches Werk (neu): 60-Tage-Rüge; 5 Jahre ab Abnahme', () => {
    const r = berechneGewaehrleistung(base({
      vertragstyp: 'werkvertrag', vertragsdatum: '2026-01-15', objekt: 'unbeweglich',
      uebergabe: '2026-04-01',
    }));
    expect(r.ruege.art).toBe('tage60');
    expect(r.verjaehrung.jahre).toBe(5);
    expect(r.verjaehrung.teilzwingend).toBe(true);
    expect(r.verjaehrung.endeISO).toBe('2031-04-01'); // Di
  });

  it('Grundstückkauf (alt): Verjährung 5 Jahre ab Eigentumserwerb, Rüge «sofort» analog Art. 201', () => {
    const r = berechneGewaehrleistung(base({
      vertragstyp: 'grundstueckkauf', vertragsdatum: '2025-03-01',
      uebergabe: '2025-04-01', eigentumserwerb: '2025-04-15',
    }));
    expect(r.ruege.art).toBe('sofort');
    expect(r.verjaehrung.endeISO).toBe('2030-04-15'); // Mo
    expect(r.verjaehrung.teilzwingend).toBe(false);
  });

  it('Grundstückkauf (neu): 60-Tage-Rüge zwingend; 5 Jahre teilzwingend', () => {
    const r = berechneGewaehrleistung(base({
      vertragstyp: 'grundstueckkauf', vertragsdatum: '2026-03-01',
      uebergabe: '2026-05-01', eigentumserwerb: '2026-05-15',
    }));
    expect(r.ruege.art).toBe('tage60');
    expect(r.ruege.zwingend).toBe(true);
    expect(r.verjaehrung.teilzwingend).toBe(true);
  });

  it('Grundstückkauf ohne Eigentumserwerbsdatum → unzulässig', () => {
    const r = berechneGewaehrleistung(base({ vertragstyp: 'grundstueckkauf' }));
    expect(r.status).toBe('unzulaessig');
  });

  it('Arglist: Rügeobliegenheit entfällt; Verjährung 10 Jahre', () => {
    const r = berechneGewaehrleistung(base({ arglist: true }));
    expect(r.ruege.art).toBe('entfaellt');
    expect(r.verjaehrung.jahre).toBe(10);
    expect(r.verjaehrung.endeISO).toBe('2035-06-04'); // Mo
  });
});

describe('Gewährleistung – vereinbarte Fristen (Mindest-/Höchstdauern)', () => {
  it('Konsumentenkauf: Verkürzung unter 2 Jahre unwirksam (Neuware)', () => {
    const r = berechneGewaehrleistung(base({ konsumentenkauf: true, vereinbarteVerjaehrungJahre: 1 }));
    expect(r.verjaehrung.vereinbartUnwirksam).toBe(true);
    expect(r.verjaehrung.jahre).toBe(2);
  });

  it('Konsumentenkauf, gebrauchte Sache: 1 Jahr zulässig', () => {
    const r = berechneGewaehrleistung(base({ konsumentenkauf: true, gebraucht: true, vereinbarteVerjaehrungJahre: 1 }));
    expect(r.verjaehrung.vereinbartUnwirksam).toBeFalsy();
    expect(r.verjaehrung.jahre).toBe(1);
  });

  it('Werk unbeweglich (neu): Verkürzung unter 5 Jahre unwirksam (Art. 371 Abs. 3)', () => {
    const r = berechneGewaehrleistung(base({
      vertragstyp: 'werkvertrag', vertragsdatum: '2026-01-15', objekt: 'unbeweglich',
      uebergabe: '2026-04-01', vereinbarteVerjaehrungJahre: 2,
    }));
    expect(r.verjaehrung.vereinbartUnwirksam).toBe(true);
    expect(r.verjaehrung.jahre).toBe(5);
  });

  it('Übergangsrecht: Altvertrag mit kürzerer Frist, die am 1.1.2026 noch lief → 5-Jahres-Mindestdauer greift', () => {
    const r = berechneGewaehrleistung(base({
      vertragstyp: 'werkvertrag', vertragsdatum: '2025-06-01', objekt: 'unbeweglich',
      uebergabe: '2025-07-01', vereinbarteVerjaehrungJahre: 1,
    }));
    expect(r.verjaehrung.vereinbartUnwirksam).toBe(true);
    expect(r.verjaehrung.jahre).toBe(5);
    expect(r.verjaehrung.endeISO).toBe('2030-07-01'); // Mo
    expect(r.warnungen.some((w) => w.includes('Übergangsrecht'))).toBe(true);
  });

  it('Verlängerung über 10 Jahre wird gekappt', () => {
    const r = berechneGewaehrleistung(base({ vereinbarteVerjaehrungJahre: 12 }));
    expect(r.verjaehrung.jahre).toBe(10);
    expect(r.warnungen.some((w) => w.includes('Höchstdauer'))).toBe(true);
  });
});

describe('Gewährleistung – Rüge-Beurteilung und Hinweise', () => {
  it('erhobene Rüge wird gegen die Richtwerte beurteilt', () => {
    const sicher = berechneGewaehrleistung(base({ ruegeErhobenAm: '2025-06-04' }));
    expect(sicher.ruege.beurteilung).toContain('sicher rechtzeitig');
    const spaet = berechneGewaehrleistung(base({ ruegeErhobenAm: '2025-06-20' }));
    expect(spaet.ruege.beurteilung).toContain('verspätet');
  });

  it('60-Tage-Frist: Rüge am letzten Tag rechtzeitig, danach verspätet', () => {
    const cfg = {
      vertragsdatum: '2026-02-01', objekt: 'integriert' as const,
      uebergabe: '2026-03-02', mangelTyp: 'versteckt' as const, entdeckung: '2026-05-04',
    };
    expect(berechneGewaehrleistung(base({ ...cfg, ruegeErhobenAm: '2026-07-03' })).ruege.beurteilung).toContain('rechtzeitig');
    expect(berechneGewaehrleistung(base({ ...cfg, ruegeErhobenAm: '2026-07-06' })).ruege.beurteilung).toContain('verspätet');
  });

  it('Entdeckung nach Verjährungseintritt → Warnung (Art. 210 Abs. 1)', () => {
    const r = berechneGewaehrleistung(base({
      mangelTyp: 'versteckt', entdeckung: '2027-09-01', stichtag: '2027-09-02',
    }));
    expect(r.warnungen.some((w) => w.includes('erst später entdeckt') || w.includes('später entdeckt'))).toBe(true);
    expect(r.verjaehrung.verjaehrtAmStichtag).toBe(true);
  });

  it('SIA 118 (Werkvertrag, offener Mangel): Rüge während zweijähriger Garantiefrist', () => {
    const r = berechneGewaehrleistung(base({
      vertragstyp: 'werkvertrag', objekt: 'beweglich', sia118: true, uebergabe: '2025-06-02',
    }));
    expect(r.ruege.art).toBe('sia');
    expect(r.ruege.endeISO).toBe('2027-06-02');
    expect(r.verjaehrung.jahre).toBe(5); // Art. 180 SIA 118
  });
});
