import { describe, it, expect } from 'vitest';
import {
  MA_DEFAULTS, MA_SCHEMA, maZusammenstellen, maZinsAbFolgetag, pruefeMaGates,
  type MaAntworten,
} from '../lib/vorlagen/mahnung';
import { dokumentAlsText } from '../lib/vorlagen/vorlagenText';

// Akzeptanztests Mahnung & Inverzugsetzung (Spez. or-vertragsvorlagen.md
// §§3–4; OR-Wortlaute Art. 102/104/107/108 verifiziert 11.6.2026 an der
// Konsolidierung 20260101).

const basis = (over: Partial<MaAntworten> = {}): MaAntworten => ({
  ...MA_DEFAULTS,
  absenderName: 'Anna Muster', absenderAdresse: 'Beispielweg 1, 4051 Basel',
  adressatName: 'Schuldner GmbH', adressatAdresse: 'Zahlweg 2, 8000 Zürich',
  betrag: '1250', rechtsgrund: 'Rechnung Nr. 4711 vom 12. Mai 2026',
  vertragBezeichnung: 'Werkvertrag vom 1. Februar 2026',
  leistungBeschrieb: 'Lieferung und Montage der Kücheneinrichtung',
  ort: 'Basel', datum: '2026-06-11',
  ...over,
});

describe('Vorlage Mahnung & Inverzugsetzung (Art. 102/104/107 OR)', () => {
  it('Variante Zahlung: Verzug ab Zugang (Art. 102 Abs. 1), gesetzlicher Zins 5 % (Art. 104 Abs. 1), Betrag formatiert', () => {
    const text = dokumentAlsText(maZusammenstellen(basis()).ergebnis);
    expect(text).toContain('Mit dem Zugang dieser Mahnung befinden Sie sich in Verzug (Art. 102 Abs. 1 OR)');
    expect(text).toContain('Verzugszins von 5 % pro Jahr (Art. 104 Abs. 1 OR)');
    expect(text).toContain("CHF 1'250.00 aus Rechnung Nr. 4711 vom 12. Mai 2026");
    expect(text).toContain('innert 10 Tagen seit Erhalt dieses Schreibens');
    // Default: Betreibungs-Ankündigung aktiv
    expect(text).toContain('die Betreibung einzuleiten');
  });

  it('Verfalltag (Art. 102 Abs. 2): Verzugs-Satz wechselt, Zins läuft ab FOLGETAG (Konsistenz mit verzugszins.ts)', () => {
    expect(maZinsAbFolgetag('2026-05-31')).toBe('01.06.2026');
    const a = basis({ verfalltagVereinbart: true, verfalltag: '2026-05-31' });
    const { ergebnis, zinsAb } = maZusammenstellen(a);
    const text = dokumentAlsText(ergebnis);
    expect(zinsAb).toBe('01.06.2026');
    expect(text).toContain('seit Ablauf dieses Tages in Verzug (Art. 102 Abs. 2 OR)');
    expect(text).toContain('somit seit dem 01.06.2026');
    expect(ergebnis.aufgenommen).not.toContain('MA_verzug_mahnung');
    // Hinweis-Gate: Mahnung rechtlich nicht nötig
    expect(pruefeMaGates(a).hinweise.some((h) => h.includes('Abs. 2'))).toBe(true);
  });

  it('Vertraglicher Zins (Art. 104 Abs. 2): eigener Baustein, gesetzlicher entfällt', () => {
    const { ergebnis } = maZusammenstellen(basis({ zinsVertraglich: true, zinssatzProzent: '8' }));
    const text = dokumentAlsText(ergebnis);
    expect(text).toContain('8 % pro Jahr (Art. 104 Abs. 2 OR)');
    expect(ergebnis.aufgenommen).not.toContain('MA_zins_gesetzlich');
  });

  it('G-Mahngebühren: ohne vertragliche Grundlage Warnung + NICHT im Brief; mit Grundlage im Brief', () => {
    const ohne = basis({ mahngebuehrErfassen: true, mahngebuehr: '20' });
    expect(pruefeMaGates(ohne).warnungen.some((w) => w.includes('OHNE vertragliche Grundlage'))).toBe(true);
    expect(dokumentAlsText(maZusammenstellen(ohne).ergebnis)).not.toContain('Mahngebühr');
    const mit = basis({ mahngebuehrErfassen: true, mahngebuehr: '20', mahngebuehrVertraglich: true });
    expect(pruefeMaGates(mit).warnungen).toEqual([]);
    expect(dokumentAlsText(maZusammenstellen(mit).ergebnis)).toContain("Mahngebühr von CHF 20.00");
  });

  it('vertraglicher Zins ≤ 5 %: BLOCKER in der Logikschicht (§3-Defense-in-depth, Bug-Check 11.6.2026) — über 5 % kein Blocker', () => {
    const tief = basis({ zinsVertraglich: true, zinssatzProzent: '4' });
    expect(pruefeMaGates(tief).blocker.some((b) => b.includes('ÜBER 5 %'))).toBe(true);
    const leer = basis({ zinsVertraglich: true, zinssatzProzent: '' });
    expect(pruefeMaGates(leer).blocker.length).toBeGreaterThan(0);
    const hoch = basis({ zinsVertraglich: true, zinssatzProzent: '8' });
    expect(pruefeMaGates(hoch).blocker).toEqual([]);
  });

  it('Variante Nachfrist (Art. 107): Mahnung + Nachfrist verbunden, Wahlrechts-Vorbehalt, KEINE Zahlungs-Bausteine', () => {
    const a = basis({ variante: 'nachfrist' });
    const { ergebnis } = maZusammenstellen(a);
    const text = dokumentAlsText(ergebnis);
    expect(text).toContain('Nachfrist von 10 Tagen seit Erhalt dieses Schreibens an (Art. 107 Abs. 1 OR)');
    expect(text).toContain('vom Vertrag zurückzutreten (Art. 107 Abs. 2 OR)');
    expect(text).toContain('Lieferung und Montage der Kücheneinrichtung');
    for (const id of ['MA_forderung', 'MA_verzug_mahnung', 'MA_zins_gesetzlich', 'MA_betreibung', 'MA_betreff_zahlung']) {
      expect(ergebnis.aufgenommen, id).not.toContain(id);
    }
    const gates = pruefeMaGates(a);
    expect(gates.hinweise.some((h) => h.includes('ZWEISEITIGE'))).toBe(true);       // G-Zweiseitigkeit
    expect(gates.hinweise.some((h) => h.includes('UNVERZÜGLICH'))).toBe(true);      // 107 Abs. 2
    expect(gates.hinweise.some((h) => h.includes('Art. 108 OR'))).toBe(true);       // Entbehrlichkeit
    expect(gates.hinweise.some((h) => h.includes('ANGEMESSEN'))).toBe(true);        // Ermessen offengelegt (§2)
  });

  it('G-Fälligkeit: Hinweis immer in der Zahlungs-Variante; fällig-seit-Fragment nur mit Datum', () => {
    expect(pruefeMaGates(basis()).hinweise.some((h) => h.includes('FÄLLIGKEIT'))).toBe(true);
    const ohne = dokumentAlsText(maZusammenstellen(basis()).ergebnis);
    expect(ohne).not.toContain('fällig seit dem');
    const mit = dokumentAlsText(maZusammenstellen(basis({ faelligSeit: '2026-05-15' })).ergebnis);
    expect(mit).toContain('fällig seit dem 15.05.2026');
  });

  it('genau EIN Betreff und EIN Verzugs-Baustein je Konstellation (gegenseitig exklusiv)', () => {
    const betreffe = ['MA_betreff_zahlung', 'MA_betreff_nachfrist'];
    const verzug = ['MA_verzug_mahnung', 'MA_verzug_verfalltag'];
    const zins = ['MA_zins_gesetzlich', 'MA_zins_vertraglich'];
    for (const over of [
      {}, { verfalltagVereinbart: true, verfalltag: '2026-05-31' },
      { zinsVertraglich: true, zinssatzProzent: '8' }, { variante: 'nachfrist' as const },
    ]) {
      const { ergebnis } = maZusammenstellen(basis(over));
      const k = JSON.stringify(over);
      expect(ergebnis.aufgenommen.filter((x) => betreffe.includes(x)).length, k).toBe(1);
      expect(ergebnis.aufgenommen.filter((x) => verzug.includes(x)).length, k).toBeLessThanOrEqual(1);
      expect(ergebnis.aufgenommen.filter((x) => zins.includes(x)).length, k).toBeLessThanOrEqual(1);
    }
  });

  it('Einzahl der Fristen: «innert 1 Tag» statt «innert 1 Tagen»', () => {
    const text = dokumentAlsText(maZusammenstellen(basis({ zahlungsfristTage: 1 })).ergebnis);
    expect(text).toContain('innert 1 Tag seit Erhalt');
    expect(text).not.toContain('1 Tagen');
  });

  it('Schema-Konventionen: Eingabe-Format, fertig, Brief-Anatomie vollständig', () => {
    expect(MA_SCHEMA.format).toBe('eingabe');
    expect(MA_SCHEMA.ausgabeArt).toBe('fertig');
    const rollen = MA_SCHEMA.bausteine.map((b) => b.rolle).filter(Boolean);
    for (const r of ['absender', 'adressat', 'datumzeile', 'betreff', 'anrede', 'schlussformel', 'unterschrift']) {
      expect(rollen, r).toContain(r);
    }
  });
});
