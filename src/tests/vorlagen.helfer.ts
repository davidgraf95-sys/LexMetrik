import { TESTAMENT_DEFAULTS, type TestamentAntworten } from '../lib/vorlagen/testament';
import { PV_DEFAULTS, PV_DEFAULT_MASSNAHMEN, type PvAntworten } from '../lib/vorlagen/patientenverfuegung';
import { VA_DEFAULTS, type VaAntworten } from '../lib/vorlagen/vorsorgeauftrag';

export const basis = (over: Partial<TestamentAntworten>): TestamentAntworten => ({
  ...TESTAMENT_DEFAULTS,
  vorname: 'Anna', nachname: 'Muster', geburtsdatum: '1990-04-12',
  heimatort: 'Basel BS', adresse: 'Musterweg 1, 4051 Basel',
  datumErrichtung: '2026-06-04',
  ...over,
});

export const pv = (over: Partial<PvAntworten>): PvAntworten => ({
  ...PV_DEFAULTS,
  vorname: 'Anna', name: 'Muster', geburtsdatum: '1990-04-12', wohnort: 'Musterweg 1, 4051 Basel',
  massnahmen: { ...PV_DEFAULT_MASSNAHMEN, ...(over.massnahmen ?? {}) },
  ...over,
});

export const va = (over: Partial<VaAntworten>): VaAntworten => ({
  ...VA_DEFAULTS,
  volljaehrig: true, urteilsfaehigBestaetigt: true, keineUmfassendeBeistandschaft: true,
  vorname: 'Anna', nachname: 'Muster', geburtsdatum: '1960-04-12',
  heimatort: 'Basel BS', adresse: 'Musterweg 1, 4051 Basel',
  beauftragte: [{ name: 'Ben Muster', typ: 'natuerlich', angaben: 'geb. 01.01.1985', bereiche: ['personensorge', 'vermoegenssorge', 'rechtsverkehr'] }],
  module: { personensorge: ['wohnsituation'], vermoegenssorge: ['verwaltung'], rechtsverkehr: ['behoerden'] },
  datum: '2026-06-04',
  ...over,
  ...(over.module ? { module: { ...{ personensorge: [], vermoegenssorge: [], rechtsverkehr: [] }, ...over.module } } : {}),
});
