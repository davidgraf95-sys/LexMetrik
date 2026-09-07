// src/tests/check-schlankheit.test.ts (bis 31.8.2026 scripts/check-schlankheit.test.ts —
// verschoben, weil eine Testdatei nicht in die Tor-Fläche scripts/check-*.ts gehört)
// QS-TOK — Unit-Tests der Kernlogik von check:schlankheit (§6.6 mechanisiert).
// Beweist die drei im Auftrag verlangten Fälle: (1) eine neue Datei über der
// Schwelle ist rot, (2) eine Bestands-Datei +>10% über ihrer Baseline-Zahl ist
// rot, (3) eine stabile Bestands-Datei bleibt grün. Zusätzlich die Rand- und
// Hinweis-Fälle (Toleranz-Grenze, Unterschreitung, gelöschte Baseline-Datei).
import { describe, it, expect } from 'vitest';
import { pruefeSchlankheit, globZuRegex, generiertMusterAusGitattributes, berechneUpdate } from '../../scripts/check-schlankheit';

describe('pruefeSchlankheit — Kernlogik (§6.6 mechanisiert)', () => {
  it('neue Datei über der Schwelle, nicht in der Baseline → rot', () => {
    const aktuell = new Map([['src/lib/neu.ts', 850]]);
    const { rot, hinweise } = pruefeSchlankheit(aktuell, {});
    expect(rot).toHaveLength(1);
    expect(rot[0]).toContain('src/lib/neu.ts');
    expect(rot[0]).toContain('NEU über der Schwelle');
    expect(hinweise).toHaveLength(0);
  });

  it('neue Datei UNTER der Schwelle, nicht in der Baseline → grün (kein Eintrag nötig)', () => {
    const aktuell = new Map([['src/lib/klein.ts', 500]]);
    const { rot, hinweise } = pruefeSchlankheit(aktuell, {});
    expect(rot).toHaveLength(0);
    expect(hinweise).toHaveLength(0);
  });

  it('Bestands-Datei wächst um mehr als 10% über ihre Baseline-Zahl → rot (der Anlass: 781 → 1090 Z. = +39.6%)', () => {
    const aktuell = new Map([['src/pages/gesetz-leser/inhalt.tsx', 1090]]);
    const baseline = { 'src/pages/gesetz-leser/inhalt.tsx': 781 };
    const { rot } = pruefeSchlankheit(aktuell, baseline);
    expect(rot).toHaveLength(1);
    expect(rot[0]).toContain('39.6% über der Baseline');
  });

  it('Bestands-Datei exakt auf der 10%-Toleranzgrenze bleibt grün, ein Zeichen darüber wird rot', () => {
    const baseline = { 'src/lib/x.ts': 1000 };
    const anGrenze = new Map([['src/lib/x.ts', 1100]]); // exakt +10 %
    expect(pruefeSchlankheit(anGrenze, baseline).rot).toHaveLength(0);

    const uebergrenze = new Map([['src/lib/x.ts', 1101]]); // +10.1 %
    expect(pruefeSchlankheit(uebergrenze, baseline).rot).toHaveLength(1);
  });

  it('Bestands-Datei stabil (unverändert oder leicht geschrumpft, weiter über der Schwelle) → grün', () => {
    const baseline = { 'src/lib/stabil.ts': 900 };
    const unveraendert = new Map([['src/lib/stabil.ts', 900]]);
    expect(pruefeSchlankheit(unveraendert, baseline).rot).toHaveLength(0);

    const geschrumpft = new Map([['src/lib/stabil.ts', 850]]);
    const befund = pruefeSchlankheit(geschrumpft, baseline);
    expect(befund.rot).toHaveLength(0);
    expect(befund.hinweise).toHaveLength(0); // weiterhin über der Schwelle (800) → kein Hinweis
  });

  it('Bestands-Datei fällt unter die Schwelle → kein Rot, aber ein Hinweis (kein Auto-Write, §2)', () => {
    const baseline = { 'src/lib/geschrumpft.ts': 900 };
    const aktuell = new Map([['src/lib/geschrumpft.ts', 700]]);
    const { rot, hinweise } = pruefeSchlankheit(aktuell, baseline);
    expect(rot).toHaveLength(0);
    expect(hinweise).toHaveLength(1);
    expect(hinweise[0]).toContain('kann aus der Baseline entfernt werden');
  });

  it('Baseline-Eintrag ohne aktuelle Datei (gelöscht/verschoben) → Hinweis, kein Rot', () => {
    const baseline = { 'src/lib/weg.ts': 900 };
    const { rot, hinweise } = pruefeSchlankheit(new Map(), baseline);
    expect(rot).toHaveLength(0);
    expect(hinweise).toHaveLength(1);
    expect(hinweise[0]).toContain('gelöscht/verschoben');
  });

  it('gemischter Bestand: mehrere Dateien unabhängig bewertet', () => {
    const baseline = { 'a.ts': 900, 'b.ts': 1000 };
    const aktuell = new Map([
      ['a.ts', 905],   // stabil → grün
      ['b.ts', 1200],  // +20% → rot
      ['c.ts', 810],   // neu über Schwelle → rot
    ]);
    const { rot } = pruefeSchlankheit(aktuell, baseline);
    expect(rot).toHaveLength(2);
    expect(rot.some((z) => z.includes('b.ts'))).toBe(true);
    expect(rot.some((z) => z.includes('c.ts'))).toBe(true);
  });
});

describe('globZuRegex — Review-Befund 2 (5.8.2026): slash-lose Muster matchen auf jeder Pfadebene', () => {
  it('ein slash-loses Muster matcht die Datei an der Wurzel UND in Unterordnern (Repro: massendaten.ts)', () => {
    const re = globZuRegex('massendaten.ts');
    expect(re.test('massendaten.ts')).toBe(true);
    expect(re.test('src/lib/massendaten.ts')).toBe(true);
    expect(re.test('src/lib/normtext/massendaten.ts')).toBe(true);
  });

  it('ein slash-loses Muster matcht NICHT als blosser Suffix ohne Verzeichnisgrenze', () => {
    const re = globZuRegex('massendaten.ts');
    expect(re.test('src/lib/andere-massendaten.ts')).toBe(false);
  });

  it('ein Muster MIT Slash bleibt an der Repo-Wurzel verankert (unverändertes Verhalten)', () => {
    const re = globZuRegex('golden/*.json');
    expect(re.test('golden/lexmetrik-golden.json')).toBe(true);
    expect(re.test('src/golden/lexmetrik-golden.json')).toBe(false);
  });

  it('Review-Befund 6: ein slash-loses *.generated.ts matcht auch mehrere Ebenen tief', () => {
    const re = globZuRegex('*.generated.ts');
    expect(re.test('foo.generated.ts')).toBe(true);
    expect(re.test('src/lib/normtext/foo.generated.ts')).toBe(true);
  });

  it('Review-Befund 6: "?" matcht genau ein Zeichen, kein "/" — kein Regex-Quantor-Leck', () => {
    const re = globZuRegex('a?.ts');
    expect(re.test('ab.ts')).toBe(true);
    expect(re.test('a.ts')).toBe(false); // "?" verlangt GENAU ein Zeichen, nicht "kein oder eins"
    expect(re.test('a/x.ts')).toBe(false); // "?" darf keine Verzeichnisgrenze verschlucken
  });
});

describe('berechneUpdate — GEZIELT 5.9.2026 (QS-EFFIZIENZ, Beleg #699): fachliche Änderung des Tors, kein Refactoring', () => {
  it('Fall 1 — --update <pfad>: NUR der genannte Pfad wird gesetzt, alle anderen Baseline-Einträge bleiben byte-gleich (auch bei abweichender aktueller Zeilenzahl)', () => {
    const baseline = { 'a.ts': 900, 'b.ts': 1000 };
    // b.ts ist im Bestand auf 1200 gewachsen, wird aber NICHT als Zielpfad genannt.
    const aktuell = new Map([
      ['a.ts', 905],
      ['b.ts', 1200],
      ['c.ts', 850], // neue Datei, WIRD als Zielpfad genannt
    ]);
    const { neueBaseline, hinzu, entfernt, geaendert, uebersehen } = berechneUpdate(aktuell, baseline, ['c.ts']);
    expect(neueBaseline).toEqual({ 'a.ts': 900, 'b.ts': 1000, 'c.ts': 850 }); // b.ts byte-gleich trotz 1200 Z. im Bestand
    expect(hinzu).toEqual(['c.ts']);
    expect(entfernt).toHaveLength(0);
    expect(geaendert).toHaveLength(0);
    expect(uebersehen).toHaveLength(0);
  });

  it('Fall 1b — --update <pfad>: genannter Pfad jetzt unter der Schwelle → aus der Baseline entfernt, andere Einträge unberührt', () => {
    const baseline = { 'a.ts': 900, 'geschrumpft.ts': 850 };
    const aktuell = new Map([['a.ts', 905], ['geschrumpft.ts', 600]]);
    const { neueBaseline, entfernt } = berechneUpdate(aktuell, baseline, ['geschrumpft.ts']);
    expect(neueBaseline).toEqual({ 'a.ts': 900 });
    expect(entfernt).toEqual(['geschrumpft.ts']);
  });

  it('Fall 2 — --update ohne Pfade: NUR Aufräumen (nachziehen bestehender Zahlen, Entfernen unter Schwelle/fehlender Datei), NIEMALS neue Dateien aufnehmen', () => {
    const baseline = { 'a.ts': 900, 'weg.ts': 950, 'geschrumpft.ts': 850 };
    const aktuell = new Map([
      ['a.ts', 920],           // Bestands-Eintrag, Zahl wird nachgezogen (auch ohne Schwellen-Überschreitung — Aufräumen zieht nach)
      ['geschrumpft.ts', 600], // unter Schwelle → entfernt
      // 'weg.ts' fehlt im Bestand → entfernt
      ['neu.ts', 810],         // NEUE Datei über Schwelle → darf NICHT aufgenommen werden
    ]);
    const { neueBaseline, hinzu, entfernt, geaendert, uebersehen } = berechneUpdate(aktuell, baseline, undefined);
    expect(neueBaseline).toEqual({ 'a.ts': 920 });
    expect(hinzu).toHaveLength(0); // Aufräumen nimmt nie neue Dateien auf
    expect(entfernt.sort()).toEqual(['geschrumpft.ts', 'weg.ts']);
    expect(geaendert).toEqual([{ pfad: 'a.ts', alt: 900, neu: 920 }]);
    expect(uebersehen).toEqual(['neu.ts']); // Aufrufer meldet & beendet mit Exit 1
  });

  it('Fall 3 — leere Zielpfad-Liste verhält sich wie kein Zielpfad (Aufräum-Modus)', () => {
    const baseline = { 'a.ts': 900 };
    const aktuell = new Map([['a.ts', 900], ['neu.ts', 900]]);
    const { neueBaseline, uebersehen } = berechneUpdate(aktuell, baseline, []);
    expect(neueBaseline).toEqual({ 'a.ts': 900 });
    expect(uebersehen).toEqual(['neu.ts']);
  });

  it('Aufräumen ohne Änderungsbedarf: Baseline bleibt inhaltlich identisch, keine Einträge in hinzu/entfernt/geaendert', () => {
    const baseline = { 'a.ts': 900 };
    const aktuell = new Map([['a.ts', 900]]);
    const { neueBaseline, hinzu, entfernt, geaendert, uebersehen } = berechneUpdate(aktuell, baseline, undefined);
    expect(neueBaseline).toEqual(baseline);
    expect(hinzu).toHaveLength(0);
    expect(entfernt).toHaveLength(0);
    expect(geaendert).toHaveLength(0);
    expect(uebersehen).toHaveLength(0);
  });

  it('Fall 4 — gezielter Zielpfad weder im Bestand noch in der Baseline: landet in `unbekannt`, Baseline unverändert', () => {
    const baseline = { 'a.ts': 900 };
    const aktuell = new Map([['a.ts', 900]]);
    const { neueBaseline, hinzu, entfernt, geaendert, unbekannt } = berechneUpdate(aktuell, baseline, ['nie-existiert.ts']);
    expect(unbekannt).toEqual(['nie-existiert.ts']);
    expect(neueBaseline).toEqual(baseline); // keine Baseline-Änderung für den unbekannten Pfad
    expect(hinzu).toHaveLength(0);
    expect(entfernt).toHaveLength(0);
    expect(geaendert).toHaveLength(0);
  });

  it('Fall 5 — Grenzwert-Symmetrie: Bestands-Datei exakt an der Schwelle (800 Z.) bleibt in der Baseline (Tor selbst ist bei genau 800 nicht rot)', () => {
    const baseline = { 'genau.ts': 750 };
    const aktuell = new Map([['genau.ts', 800]]);
    const { neueBaseline, entfernt, geaendert, unbekannt } = berechneUpdate(aktuell, baseline, ['genau.ts']);
    expect(unbekannt).toHaveLength(0);
    expect(entfernt).toHaveLength(0); // vorher fälschlich entfernt (zeilen > schwelle war falsch für den Erhalt)
    expect(geaendert).toEqual([{ pfad: 'genau.ts', alt: 750, neu: 800 }]); // Zahl wird nachgezogen, Eintrag bleibt
    expect(neueBaseline).toEqual({ 'genau.ts': 800 });
  });

  it('Fall 5b — genau an der Schwelle (800 Z.), noch nicht in der Baseline: keine Aufnahme (nur > schwelle rechtfertigt eine NEUE Aufnahme)', () => {
    const baseline = {};
    const aktuell = new Map([['neu-genau.ts', 800]]);
    const { neueBaseline, hinzu, unbekannt } = berechneUpdate(aktuell, baseline, ['neu-genau.ts']);
    expect(unbekannt).toHaveLength(0);
    expect(hinzu).toHaveLength(0);
    expect(neueBaseline).toEqual({});
  });
});

describe('generiertMusterAusGitattributes — Review-Befund 3 (5.8.2026): linguist-generated=true gleichwertig zum nackten Token', () => {
  it('akzeptiert sowohl das nackte Token als auch die explizite =true-Form, lehnt =false ab', () => {
    const inhalt = [
      'a.ts linguist-generated',
      'b.ts linguist-generated=true',
      'c.ts linguist-generated=false',
      'd.ts -diff', // anderes Attribut, kein linguist-generated → kein Muster
    ].join('\n');
    const muster = generiertMusterAusGitattributes(inhalt);
    expect(muster.some((m) => m.test('a.ts'))).toBe(true);
    expect(muster.some((m) => m.test('b.ts'))).toBe(true);
    expect(muster.some((m) => m.test('c.ts'))).toBe(false);
    expect(muster.some((m) => m.test('d.ts'))).toBe(false);
  });
});
