import { describe, it, expect } from 'vitest';
import { berechneAllgemeineFrist, tageZwischen, type AllgFristInput } from '../lib/allgemeineFrist';
import { ostersonntag } from '../data/zpoFeiertage';
import { berechneFrist } from '../lib/zpoFristen';

// Akzeptanztests des Auftrags «Allgemeiner Fristenrechner» (nachgerechnete
// Goldwerte; Verschiebungstests Kanton ZH). Test 14 ist der Systemtest:
// allgemeineFrist und zpoFristen teilen dieselbe fachneutrale Arithmetik.

const basis = (patch: Partial<AllgFristInput> = {}): AllgFristInput => ({
  start: '2020-10-23', laenge: 30, einheit: 'tage',
  wochenendeVerschieben: false, feiertageVerschieben: false,
  ...patch,
});

describe('Allgemeiner Fristenrechner — Goldwerte', () => {
  it('AF-1 Tagesfrist: 23.10.2020 + 30 Tage = So 22.11.2020 (dies a quo zählt nicht)', () => {
    const r = berechneAllgemeineFrist(basis());
    expect(r.endDatum).toBe('22.11.2020');
    expect(r.endWochentag).toBe('Sonntag');
    expect(r.verschoben).toBe(false);
  });

  it('AF-2 Wochenend-Verschiebung: So 22.11.2020 → Mo 23.11.2020', () => {
    const r = berechneAllgemeineFrist(basis({ wochenendeVerschieben: true }));
    expect(r.endDatum).toBe('23.11.2020');
    expect(r.endWochentag).toBe('Montag');
    expect(r.rohEndDatum).toBe('22.11.2020');
    expect(r.verschiebeGruende).toHaveLength(1);
  });

  it('AF-3 Monatsfrist gleichbezeichneter Tag: 26.1.2022 + 3 Monate = Di 26.4.2022 (BGer 5A_691/2023)', () => {
    const r = berechneAllgemeineFrist(basis({ start: '2022-01-26', laenge: 3, einheit: 'monate' }));
    expect(r.endDatum).toBe('26.04.2022');
    expect(r.endWochentag).toBe('Dienstag');
  });

  it('AF-4 Monatsende-Klemmung: 31.1.2023 + 1 Monat = 28.2.2023', () => {
    const r = berechneAllgemeineFrist(basis({ start: '2023-01-31', laenge: 1, einheit: 'monate' }));
    expect(r.endDatum).toBe('28.02.2023');
    expect(r.schritte.find((s) => s.label.startsWith('Rohes Fristende'))?.grund).toMatch(/letzter Tag des Monats/);
  });

  it('AF-5 Monatsende im Schaltjahr: 31.1.2024 + 1 Monat = 29.2.2024', () => {
    expect(berechneAllgemeineFrist(basis({ start: '2024-01-31', laenge: 1, einheit: 'monate' })).endDatum).toBe('29.02.2024');
  });

  it('AF-6 Jahresfrist über Schaltjahr: 29.2.2024 + 1 Jahr = 28.2.2025', () => {
    expect(berechneAllgemeineFrist(basis({ start: '2024-02-29', laenge: 1, einheit: 'jahre' })).endDatum).toBe('28.02.2025');
  });

  it('AF-7 Klemmung auf 30-Tage-Monat: 31.5.2025 + 1 Monat = 30.6.2025', () => {
    expect(berechneAllgemeineFrist(basis({ start: '2025-05-31', laenge: 1, einheit: 'monate' })).endDatum).toBe('30.06.2025');
  });

  it('AF-8 Karfreitag-Kaskade (ZH): Roh-Ende Fr 18.4.2025 → Di 22.4.2025 (Karfreitag→Sa→So→Ostermontag)', () => {
    // 17.4.2025 + 1 Tag → roh 18.4.2025 (Karfreitag)
    const r = berechneAllgemeineFrist(basis({
      start: '2025-04-17', laenge: 1, einheit: 'tage',
      wochenendeVerschieben: true, feiertageVerschieben: true, kanton: 'ZH',
    }));
    expect(r.rohEndDatum).toBe('18.04.2025');
    expect(r.endDatum).toBe('22.04.2025');
    expect(r.endWochentag).toBe('Dienstag');
    expect(r.verschiebeGruende).toHaveLength(4);
  });

  it('AF-9 Bundesfeier auf Samstag (ZH): Roh-Ende Sa 1.8.2026 → Mo 3.8.2026, keine Doppelzählung', () => {
    const r = berechneAllgemeineFrist(basis({
      start: '2026-07-31', laenge: 1, einheit: 'tage',
      wochenendeVerschieben: true, feiertageVerschieben: true, kanton: 'ZH',
    }));
    expect(r.rohEndDatum).toBe('01.08.2026');
    expect(r.endDatum).toBe('03.08.2026');
    expect(r.endWochentag).toBe('Montag');
    expect(r.verschiebeGruende).toHaveLength(2); // Sa(Feiertag) + So — je genau einmal
  });

  it('AF-10 Weihnacht auf Samstag (ZH): Roh-Ende Sa 25.12.2027 → Mo 27.12.2027 (26.12. So übersprungen)', () => {
    const r = berechneAllgemeineFrist(basis({
      start: '2027-12-24', laenge: 1, einheit: 'tage',
      wochenendeVerschieben: true, feiertageVerschieben: true, kanton: 'ZH',
    }));
    expect(r.rohEndDatum).toBe('25.12.2027');
    expect(r.endDatum).toBe('27.12.2027');
  });

  it('AF-11 Wochenfrist = 14 Kalendertage: Do 5.6.2025 + 2 Wochen = Do 19.6.2025', () => {
    const r = berechneAllgemeineFrist(basis({ start: '2025-06-05', laenge: 2, einheit: 'wochen' }));
    expect(r.endDatum).toBe('19.06.2025');
    expect(r.endWochentag).toBe('Donnerstag');
  });

  it('AF-12 Computus: Osterdaten 2024–2027', () => {
    const fmt = (d: Date) => `${d.getDate()}.${d.getMonth() + 1}.`;
    expect(fmt(ostersonntag(2024))).toBe('31.3.');
    expect(fmt(ostersonntag(2025))).toBe('20.4.');
    expect(fmt(ostersonntag(2026))).toBe('5.4.');
    expect(fmt(ostersonntag(2027))).toBe('28.3.');
  });

  it('AF-13 Tage zwischen 1.2.2024 und 1.3.2024 = 29 (Schaltjahr-Februar)', () => {
    expect(tageZwischen('2024-02-01', '2024-03-01').kalendertage).toBe(29);
  });

  it('AF-14 Systemtest: identisch mit zpoFristen für Tagesfrist ausserhalb der Gerichtsferien', () => {
    // 10 Tage ab Di 3.6.2025: Lauf 4.6.–13.6.2025 — vollständig ausserhalb
    // aller ZPO-Stillstandsperioden (Ostern/Sommer/Weihnachten, Art. 145 ZPO).
    const allg = berechneAllgemeineFrist(basis({
      start: '2025-06-03', laenge: 10, einheit: 'tage',
      wochenendeVerschieben: true, feiertageVerschieben: true, kanton: 'ZH',
    }));
    const zpo = berechneFrist({
      ereignis: '2025-06-03', laenge: 10, einheit: 'tage',
      verfahren: 'ordentlich', kanton: 'ZH', fristnatur: 'gesetzlich',
    });
    expect(allg.endDatumISO).toBe(zpo.diesAdQuemISO);
    // und ein zweiter Fall mit Wochenend-Verschiebung am Ende (Fr 20.6.+8 → So → Mo)
    const allg2 = berechneAllgemeineFrist(basis({
      start: '2025-06-20', laenge: 9, einheit: 'tage',
      wochenendeVerschieben: true, feiertageVerschieben: true, kanton: 'ZH',
    }));
    const zpo2 = berechneFrist({
      ereignis: '2025-06-20', laenge: 9, einheit: 'tage',
      verfahren: 'ordentlich', kanton: 'ZH', fristnatur: 'gesetzlich',
    });
    expect(allg2.endDatumISO).toBe(zpo2.diesAdQuemISO);
  });

  it('AF-15 Eingabe-Validierung: Kanton nötig bei Feiertags-Toggle; Länge ganzzahlig > 0', () => {
    expect(() => berechneAllgemeineFrist(basis({ feiertageVerschieben: true }))).toThrow(/Kanton/);
    expect(() => berechneAllgemeineFrist(basis({ laenge: 0 }))).toThrow(/ganze Zahl/);
    expect(() => berechneAllgemeineFrist(basis({ laenge: 1.5 }))).toThrow(/ganze Zahl/);
  });
});
