import { describe, it, expect } from 'vitest';
import { egZusammenstellen, EG_DEFAULTS } from '../lib/vorlagen/eheschutzgesuch';
import { skZusammenstellen, SK_DEFAULTS } from '../lib/vorlagen/scheidungsklage';
import { sbZusammenstellen, SB_DEFAULTS } from '../lib/vorlagen/scheidungsbegehren';
import { dokumentAlsText } from '../lib/vorlagen/vorlagenText';

// Bug-Audit 19.6.2026 (H2): Der Kinder-Block wurde an das Partei-Rubrum gehängt;
// die feste Rollenzeile folgte im Schema → sie stand optisch UNTER den Kindern und
// bezeichnete sie als Partei. Korrekt: Rollenzeile zuerst, Kinder-Block danach.
const KIND = { vorname: 'Lea', geburtsdatum: '2015-01-01' };

describe('Rubrum: Rollenzeile steht VOR dem gemeinsame-Kinder-Block (H2)', () => {
  it('Eheschutzgesuch', () => {
    const text = dokumentAlsText(egZusammenstellen({ ...EG_DEFAULTS, kinderErfassen: true, kinder: [KIND] }));
    const iRolle = text.indexOf('(gesuchsgegnerische Partei)');
    const iKinder = text.indexOf('gemeinsame Kinder');
    expect(iRolle).toBeGreaterThan(-1);
    expect(iKinder).toBeGreaterThan(-1);
    expect(iRolle).toBeLessThan(iKinder);
  });

  it('Scheidungsklage', () => {
    const text = dokumentAlsText(skZusammenstellen({ ...SK_DEFAULTS, kinderErfassen: true, kinder: [KIND] }));
    const iRolle = text.indexOf('(beklagte Partei)');
    const iKinder = text.indexOf('gemeinsame Kinder');
    expect(iRolle).toBeGreaterThan(-1);
    expect(iKinder).toBeGreaterThan(-1);
    expect(iRolle).toBeLessThan(iKinder);
  });

  it('Scheidungsbegehren (gemeinsam)', () => {
    const text = dokumentAlsText(sbZusammenstellen({ ...SB_DEFAULTS, kinderErfassen: true, kinder: [KIND] }));
    const iRolle = text.indexOf('(gesuchstellende Parteien)');
    const iKinder = text.indexOf('gemeinsame Kinder');
    expect(iRolle).toBeGreaterThan(-1);
    expect(iKinder).toBeGreaterThan(-1);
    expect(iRolle).toBeLessThan(iKinder);
  });
});
