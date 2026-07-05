import { describe, it, expect } from 'vitest';
import { formatiereGerichtszitat, BGE_TEILE } from '../lib/gerichtszitat';
import { pruefeFormulierung } from '../lib/konventionen';

// ─── Amtlicher Gerichts-Zitierer (BGE / BGer) ───────────────────────────────
// Deterministischer Formatierer; die erwarteten Formen folgen der Plattform-
// Zitierkonvention (src/lib/konventionen.ts): «BGE 140 III 409 E. 4.3» ·
// «BGer 5A_691/2023 vom 13. August 2024 E. 2.1».

describe('formatiereGerichtszitat – BGE', () => {
  it('formatiert Band · Teil · Seite mit Erwägung', () => {
    const r = formatiereGerichtszitat({ typ: 'bge', band: '140', teil: 'III', seite: '409', erwaegung: '4.3' });
    expect(r.status).toBe('ok');
    expect(r.zitat).toBe('BGE 140 III 409 E. 4.3');
    expect(r.langform).toBeUndefined();
  });

  it('ohne Erwägung', () => {
    const r = formatiereGerichtszitat({ typ: 'bge', band: '147', teil: 'III', seite: '419' });
    expect(r.zitat).toBe('BGE 147 III 419');
  });

  it('akzeptiert die historischen Teile Ia/Ib', () => {
    expect(formatiereGerichtszitat({ typ: 'bge', band: '99', teil: 'Ia', seite: '1' }).zitat).toBe('BGE 99 Ia 1');
  });

  it('verwirft ungültigen Teil, Band, Seite', () => {
    expect(formatiereGerichtszitat({ typ: 'bge', band: '140', teil: 'VI', seite: '409' }).status).toBe('unzulaessig');
    expect(formatiereGerichtszitat({ typ: 'bge', band: 'abc', teil: 'III', seite: '409' }).status).toBe('unzulaessig');
    expect(formatiereGerichtszitat({ typ: 'bge', band: '140', teil: 'III', seite: '0' }).status).toBe('unzulaessig');
  });

  it('verwirft eine ungültige Erwägungsangabe', () => {
    const r = formatiereGerichtszitat({ typ: 'bge', band: '140', teil: 'III', seite: '409', erwaegung: 'E. 4' });
    expect(r.status).toBe('unzulaessig');
    expect(r.zitat).toBeNull();
  });

  it('deckt alle Sammlungsteile ab', () => {
    for (const t of BGE_TEILE) {
      expect(formatiereGerichtszitat({ typ: 'bge', band: '100', teil: t, seite: '1' }).status).toBe('ok');
    }
  });
});

describe('formatiereGerichtszitat – BGer', () => {
  it('formatiert Geschäftsnummer, ausgeschriebenes Datum, Erwägung + Langform', () => {
    const r = formatiereGerichtszitat({ typ: 'bger', aktenzeichen: '5A_691/2023', datum: '2024-08-13', erwaegung: '2.1' });
    expect(r.status).toBe('ok');
    expect(r.zitat).toBe('BGer 5A_691/2023 vom 13. August 2024 E. 2.1');
    expect(r.langform).toBe('Urteil des Bundesgerichts 5A_691/2023 vom 13. August 2024 E. 2.1');
  });

  it('akzeptiert Abteilungscodes mit einem und zwei Buchstaben', () => {
    expect(formatiereGerichtszitat({ typ: 'bger', aktenzeichen: '4A_123/2025', datum: '2025-03-05' }).zitat)
      .toBe('BGer 4A_123/2025 vom 5. März 2025');
    expect(formatiereGerichtszitat({ typ: 'bger', aktenzeichen: '1C_45/2024', datum: '2024-01-09' }).zitat)
      .toBe('BGer 1C_45/2024 vom 9. Januar 2024');
  });

  it('verwirft ein falsches Aktenzeichen-Muster', () => {
    expect(formatiereGerichtszitat({ typ: 'bger', aktenzeichen: '5A-691-2023', datum: '2024-08-13' }).status).toBe('unzulaessig');
    expect(formatiereGerichtszitat({ typ: 'bger', aktenzeichen: 'X_1/2024', datum: '2024-08-13' }).status).toBe('unzulaessig');
  });

  it('verwirft ein ungültiges Datum (30. Februar)', () => {
    expect(formatiereGerichtszitat({ typ: 'bger', aktenzeichen: '5A_691/2023', datum: '2024-02-30' }).status).toBe('unzulaessig');
  });
});

describe('formatiereGerichtszitat – Konventionskonformität', () => {
  it('die Zitate verletzen die Plattform-Formulierungskonvention nicht', () => {
    const faelle = [
      formatiereGerichtszitat({ typ: 'bge', band: '140', teil: 'III', seite: '409', erwaegung: '4.3' }),
      formatiereGerichtszitat({ typ: 'bger', aktenzeichen: '5A_691/2023', datum: '2024-08-13', erwaegung: '2.1' }),
    ];
    for (const r of faelle) {
      expect(pruefeFormulierung(r.zitat ?? '', 'zitat')).toEqual([]);
      if (r.langform) expect(pruefeFormulierung(r.langform, 'langform')).toEqual([]);
      r.hinweise.forEach((h, i) => expect(pruefeFormulierung(h, `hinweis${i}`)).toEqual([]));
    }
  });
});
