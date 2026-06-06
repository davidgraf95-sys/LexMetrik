import { describe, it, expect } from 'vitest';
import {
  KAN_DEFAULTS, KAN_SCHEMA, kanZusammenstellen, kanEngine, pruefeKanGates,
  type KanAntworten,
} from '../lib/vorlagen/kuendigungArbeitnehmer';
import { berechneKuendigungsfrist } from '../lib/kuendigungsfrist';
import { dokumentAlsText } from '../lib/vorlagen/vorlagenText';

// Akzeptanztests Maske 1a (Spez. bibliothek/recherche/kuendigungs-masken.md):
// Engine-Verzahnung §5 (kein Logik-Duplikat), Bausteine, Fragment-Konvention.

const basis = (over: Partial<KanAntworten> = {}): KanAntworten => ({
  ...KAN_DEFAULTS,
  absenderName: 'Anna Muster', absenderAdresse: 'Beispielweg 1, 4051 Basel',
  adressatName: 'Muster AG', adressatAdresse: 'Industriestrasse 9, 4053 Basel',
  vertragsbeginn: '2022-03-01', zugangKuendigung: '2026-06-10',
  ort: 'Basel', datum: '2026-06-06',
  ...over,
});

describe('Vorlage Kündigung Arbeitnehmer:in (Maske 1a)', () => {
  it('Beendigungsdatum stammt 1:1 aus der Live-Engine (§5 — kein Duplikat)', () => {
    const a = basis();
    const { ergebnis, engine } = kanZusammenstellen(a);
    const direkt = berechneKuendigungsfrist({
      vertragsbeginn: a.vertragsbeginn, zugangKuendigung: a.zugangKuendigung,
      kuendigendePartei: 'arbeitnehmer', probezeitMonate: 0,
      kuendigungsterminMonatsende: true,
    });
    expect(engine!.beendigungsdatum!.toISOString()).toBe(direkt.beendigungsdatum!.toISOString());
    // 5. Dienstjahr → 2 Monate, Monatsende: 10.6.2026 + 2 Mte → 31.8.2026
    const text = dokumentAlsText(ergebnis);
    expect(text).toContain('per 31.08.2026');
  });

  it('Probezeit-Baustein erscheint nur, wenn der Zugang in der Probezeit liegt (Engine-Befund)', () => {
    const inProbezeit = kanZusammenstellen(basis({
      vertragsbeginn: '2026-06-01', zugangKuendigung: '2026-06-10', probezeit: 'gesetzlich',
    }));
    expect(inProbezeit.ergebnis.aufgenommen).toContain('K1_probezeit');
    expect(inProbezeit.engine!.istProbezeit).toBe(true);

    const danach = kanZusammenstellen(basis());
    expect(danach.ergebnis.aufgenommen).not.toContain('K1_probezeit');
  });

  it('Zeugnis- und Abrechnungsbitte folgen den Checkboxen', () => {
    const ohne = kanZusammenstellen(basis({ zeugnisVerlangen: false, schlussabrechnungVerlangen: false }));
    expect(ohne.ergebnis.aufgenommen).not.toContain('K1_zeugnis');
    expect(ohne.ergebnis.aufgenommen).not.toContain('K1_abrechnung');
    const mit = kanZusammenstellen(basis());
    expect(mit.ergebnis.aufgenommen).toContain('K1_zeugnis');
    expect(mit.ergebnis.aufgenommen).toContain('K1_abrechnung');
  });

  it('abweichende Frist ohne Schriftform/GAV: Engine-Warnung wird durchgereicht, gesetzliche Frist gilt', () => {
    const a = basis({ fristQuelle: 'abweichend', abweichendeFristMonate: 1, abweichendeFristFormGueltig: false });
    const { engine } = kanZusammenstellen(a);
    const gates = pruefeKanGates(a, engine);
    expect(gates.blocker).toEqual([]); // Spez. 1a/d: keine harten Blocker
    expect(gates.warnungen.some((w) => w.includes('335c Abs. 2'))).toBe(true);
    // gesetzliche Frist (2 Mte im 5. DJ) statt der unwirksamen 1-Monats-Abrede
    expect(engine!.fristMonate).toBe(2);
  });

  it('unvollständige Daten: kein Engine-Lauf, Platzhalter-Strich statt Datum, kein Absturz', () => {
    const { ergebnis, engine } = kanZusammenstellen(basis({ zugangKuendigung: '' }));
    expect(engine).toBeNull();
    expect(dokumentAlsText(ergebnis)).toContain('per ________');
  });

  it('Schema-Konventionen: Eingabe-Format, fertig, Brief-Anatomie-Rollen vorhanden', () => {
    expect(KAN_SCHEMA.format).toBe('eingabe');
    expect(KAN_SCHEMA.ausgabeArt).toBe('fertig');
    const rollen = KAN_SCHEMA.bausteine.map((b) => b.rolle).filter(Boolean);
    for (const r of ['absender', 'adressat', 'datumzeile', 'betreff', 'schlussformel', 'unterschrift']) {
      expect(rollen, r).toContain(r);
    }
  });

  it('kanEngine validiert ISO-Eingaben defensiv (kein NaN-Datum)', () => {
    expect(kanEngine(basis({ vertragsbeginn: 'kein-datum' }))).toBeNull();
    expect(kanEngine(basis())).not.toBeNull();
  });
});
