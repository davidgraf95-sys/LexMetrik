import { describe, it, expect } from 'vitest';
import {
  mwstDokId,
  mwstDoktyp,
  mwstAnzeigeNummer,
  istKuriertBekannt,
  ESTV_MWST_KURIERT_BEKANNT,
} from '../../scripts/materialien/estv-mwst-ids';
import { MATERIAL_REGISTER, DOKTYP_LABEL } from '../../src/lib/materialien/register';

// E6a M1: ID-Systematik/Key-Abgleich der ESTV-MWST-Publikationen (§2.6). Kein Netz.

describe('mwstDokId — stabile ID aus der Nummern-Systematik', () => {
  it('MWST-Info null-gepolstert', () => {
    expect(mwstDokId('MI', 9)).toBe('ESTV-MWST-INFO-09');
    expect(mwstDokId('MI', '9')).toBe('ESTV-MWST-INFO-09');
    expect(mwstDokId('MI', 20)).toBe('ESTV-MWST-INFO-20');
  });
  it('MWST-Branchen-Info', () => {
    expect(mwstDokId('BI', 27)).toBe('ESTV-MWST-BRANCHEN-INFO-27');
    expect(mwstDokId('BI', 1)).toBe('ESTV-MWST-BRANCHEN-INFO-01');
  });
  it('MI und BI mit gleicher Nummer kollidieren NICHT', () => {
    expect(mwstDokId('MI', 5)).not.toBe(mwstDokId('BI', 5));
  });
  it('IDs sind pfadsicher (keine / \\ # ? Leerzeichen)', () => {
    for (const id of [mwstDokId('MI', 9), mwstDokId('BI', 27)]) {
      expect(id).not.toMatch(/[\\/#?\s]/);
    }
  });
});

describe('Key-Abgleich «bestehender Key gewinnt» (§2.6)', () => {
  it('ESTV-MWST-INFO-09 ist kuratiert-bekannt → skip', () => {
    expect(istKuriertBekannt('MI', 9)).toBe(true);
    expect(istKuriertBekannt('MI', 20)).toBe(false);
  });
  it('jede kuratiert-bekannte ID existiert wirklich im MATERIAL_REGISTER (kein toter Skip)', () => {
    const keys = new Set(MATERIAL_REGISTER.map((r) => r.key));
    for (const id of ESTV_MWST_KURIERT_BEKANNT) {
      expect(keys.has(id)).toBe(true);
    }
  });
});

describe('mwstDoktyp / mwstAnzeigeNummer', () => {
  it('Doktyp je Art (registriert)', () => {
    expect(mwstDoktyp('MI')).toBe('mwst-info');
    expect(mwstDoktyp('BI')).toBe('mwst-branchen-info');
    // beide Doktypen haben ein Anzeige-Label im Register (§0/B6, kein stiller Browse-Drop)
    expect(DOKTYP_LABEL['mwst-info']).toBeTruthy();
    expect(DOKTYP_LABEL['mwst-branchen-info']).toBeTruthy();
  });
  it('Anzeige-Nummer verbatim-nah, ohne Null-Polsterung', () => {
    expect(mwstAnzeigeNummer('MI', 9)).toBe('MWST-Info 9');
    expect(mwstAnzeigeNummer('MI', '09')).toBe('MWST-Info 9');
    expect(mwstAnzeigeNummer('BI', 27)).toBe('MWST-Branchen-Info 27');
  });
});
