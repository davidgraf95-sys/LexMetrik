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
  it('Anzeige-Nummer «Nr. NN» (Art steckt im doktypLabel — keine Overline-Doppelung)', () => {
    expect(mwstAnzeigeNummer('MI', 9)).toBe('Nr. 09');
    expect(mwstAnzeigeNummer('MI', '09')).toBe('Nr. 09');
    expect(mwstAnzeigeNummer('BI', 27)).toBe('Nr. 27');
  });
  it('keine Kollision mit kuratierten ESTV-Nummern (Dubletten-Tor §2.6)', () => {
    const kuratierteEstvNummern = new Set(
      MATERIAL_REGISTER.filter((r) => r.behoerde === 'ESTV' && r.nummer).map((r) => r.nummer as string),
    );
    for (let n = 1; n <= 27; n++) {
      expect(kuratierteEstvNummern.has(mwstAnzeigeNummer('BI', String(n).padStart(2, '0')))).toBe(false);
    }
  });
});
