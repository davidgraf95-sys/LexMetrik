import { describe, it, expect } from 'vitest';
import {
  KAG_DEFAULTS, KAG_SCHEMA, kagZusammenstellen, kagEngine, kagIstProbezeit, pruefeKagGates,
  type KagAntworten,
} from '../lib/vorlagen/kuendigungArbeitgeber';
import { berechneSperrfristen } from '../lib/sperrfristen';
import { dokumentAlsText } from '../lib/vorlagen/vorlagenText';

// Akzeptanztests Maske 1b (Spez. bibliothek/recherche/kuendigungs-masken.md):
// Sperrfristen-Engine LIVE (§5), G-NICHTIG-Blocker hart, Hemmung im Datum.

const basis = (over: Partial<KagAntworten> = {}): KagAntworten => ({
  ...KAG_DEFAULTS,
  absenderName: 'Muster AG', absenderAdresse: 'Industriestrasse 9, 4053 Basel',
  unterzeichner: 'P. Muster, Geschäftsführer',
  adressatName: 'Anna Beispiel', adressatAdresse: 'Beispielweg 1, 4051 Basel',
  vertragsbeginn: '2020-01-01', zugangKuendigung: '2025-04-15',
  ort: 'Basel', datum: '2026-06-06',
  ...over,
});

describe('Vorlage Kündigung Arbeitgeber:in (Maske 1b)', () => {
  it('Beendigungsdatum stammt 1:1 aus der Sperrfristen-Engine (§5 — kein Duplikat)', () => {
    const a = basis();
    const { ergebnis, engine } = kagZusammenstellen(a);
    const direkt = berechneSperrfristen({
      vertragsbeginn: a.vertragsbeginn, zugangKuendigung: a.zugangKuendigung,
      kuendigendePartei: 'arbeitgeber', probezeitMonate: 0,
      kuendigungsterminMonatsende: true, sperrereignisse: [],
    });
    expect(engine!.beendigungISO).toBe(direkt.beendigungISO);
    expect(dokumentAlsText(ergebnis)).toContain(`per ${direkt.beendigungISO!.split('-').reverse().join('.')}`);
  });

  it('G-NICHTIG: Zugang in der Sperrfrist → harter Blocker mit frühestem Neu-Kündigungsdatum, kein Datum im Brief', () => {
    const a = basis({
      sperrereignisse: [{ typ: 'krankheit_unfall', von: '2025-04-01', bis: '2025-05-31' }],
    });
    const { ergebnis, engine } = kagZusammenstellen(a);
    expect(engine!.status).toBe('nichtig');
    const gates = pruefeKagGates(a, engine);
    expect(gates.blocker.length).toBe(1);
    expect(gates.blocker[0]).toContain('336c');
    expect(gates.blocker[0]).toContain(engine!.fruehesteNeueKuendigungISO!.split('-').reverse().join('.'));
    expect(dokumentAlsText(ergebnis)).toContain('per ________'); // kein Datum bei Nichtigkeit (§8)
  });

  it('G-GEHEMMT: Sperrfrist nach Zugang hemmt — Warnung + Beendigung aus beendigungISO (nicht ungehemmt)', () => {
    const a = basis({
      // Krankheit beginnt NACH dem Zugang → Kündigung gültig, Frist gehemmt
      sperrereignisse: [{ typ: 'krankheit_unfall', von: '2025-05-01', bis: '2025-05-20' }],
    });
    const { engine } = kagZusammenstellen(a);
    expect(engine!.status).toBe('ok');
    expect(engine!.gehemmtTage ?? 0).toBeGreaterThan(0);
    const gates = pruefeKagGates(a, engine);
    expect(gates.blocker).toEqual([]);
    expect(gates.warnungen.some((w) => w.includes('gehemmt'))).toBe(true);
    // Handrechnung: 6. DJ → 2 Monate (15.4.→15.6., Monatsende 30.6.);
    // 20 Tage Hemmung → 5.7. → Monatsende 31.7.2025.
    expect(engine!.gehemmtTage).toBe(20);
    expect(engine!.beendigungISO).toBe('2025-07-31');
  });

  it('Probezeit-Flag aus der Engine (kein Text-Parsing): Baustein nur bei Zugang in Probezeit', () => {
    const inProbe = basis({ vertragsbeginn: '2025-04-01', zugangKuendigung: '2025-04-15', probezeit: 'gesetzlich' });
    expect(kagIstProbezeit(inProbe)).toBe(true);
    expect(kagZusammenstellen(inProbe).ergebnis.aufgenommen).toContain('K2_probezeit');
    expect(kagZusammenstellen(basis()).ergebnis.aufgenommen).not.toContain('K2_probezeit');
  });

  it('Begründung/Freistellung: Bausteine folgen den Schaltern; Begründungs-Warnung erscheint', () => {
    const ohne = kagZusammenstellen(basis());
    expect(ohne.ergebnis.aufgenommen).not.toContain('K2_begruendung');
    expect(ohne.ergebnis.aufgenommen).not.toContain('K2_freistellung');
    const a = basis({
      begruendungAufnehmen: true, begruendungText: 'Restrukturierung der Abteilung.',
      freistellung: true, freistellungAb: '2025-05-01',
    });
    const mit = kagZusammenstellen(a);
    expect(mit.ergebnis.aufgenommen).toContain('K2_begruendung');
    expect(mit.ergebnis.aufgenommen).toContain('K2_freistellung');
    expect(pruefeKagGates(a, mit.engine).warnungen.some((w) => w.includes('335 Abs. 2'))).toBe(true);
  });

  it('Vaterschaftsurlaub-Resttage verlängern die Frist (Art. 335c Abs. 3 — über die Engine)', () => {
    const ohne = kagEngine(basis())!;
    // 20 Resttage: 15.6. + 20 Tage = 5.7. → Monatsende 31.7. (10 Tage blieben
    // im selben Monatsende-Raster — bewusst über die Monatsgrenze getestet).
    const mit = kagEngine(basis({ vaterschaftsurlaubResttage: 20 }))!;
    expect(ohne.beendigungISO).toBe('2025-06-30');
    expect(mit.beendigungISO).toBe('2025-07-31');
  });

  it('Schema-Konventionen: Eingabe-Format, fertig, Unterschrift mit Unterzeichner', () => {
    expect(KAG_SCHEMA.format).toBe('eingabe');
    expect(KAG_SCHEMA.ausgabeArt).toBe('fertig');
    const text = dokumentAlsText(kagZusammenstellen(basis()).ergebnis);
    expect(text).toContain('P. Muster, Geschäftsführer');
  });

  it('defensive Eingaben: ungültige Daten/inkonsistente Ereignisse → engine null, kein Absturz', () => {
    expect(kagEngine(basis({ zugangKuendigung: '' }))).toBeNull();
    expect(kagEngine(basis({ sperrereignisse: [{ typ: 'krankheit_unfall', von: '2025-05-10', bis: '2025-05-01' }] }))).toBeNull();
  });

  it('Regression (Bug-Check A): fremder Speicherstand mit sperrereignisse=null crasht nicht', () => {
    const kaputt = basis({ sperrereignisse: null as unknown as KagAntworten['sperrereignisse'] });
    expect(kagEngine(kaputt)).not.toBeNull(); // wie leeres Array behandelt
    expect(kagEngine(kaputt)!.status).toBe('ok');
  });
});
