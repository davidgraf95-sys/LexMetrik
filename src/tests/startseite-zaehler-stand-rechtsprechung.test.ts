// ─── #691 · standRechtsprechung = max(abgerufen), nicht Register-`erzeugt` ───
//
// FAHRPLAN-OFFENE-BEFUNDE §1: «`standRechtsprechung` = Erzeugungs- statt
// Abrufdatum» — der Generator las bislang `r.erzeugt` (register.json), den
// Zeitstempel des BUILD-LAUFS, statt das jüngste Abrufdatum der Inhalte. Der
// Kern der Berechnung sitzt jetzt in `scripts/startseite-zaehler-stand.ts`
// (Helfer, damit dieser Test das Generator-Skript mit seinen
// Top-Level-Seiteneffekten NIE importieren muss).
import { describe, it, expect } from 'vitest';
import { berechneStandRechtsprechung, juengstes } from '../../scripts/startseite-zaehler-stand';

describe('berechneStandRechtsprechung (#691)', () => {
  it('nimmt das JÜNGSTE Abrufdatum über den Bestand, nicht ein fixes Erzeugungsdatum', () => {
    const registerErzeugtHeute = '2099-01-01'; // fingierter Bau-Zeitstempel — darf im Ergebnis NIRGENDS auftauchen
    const entscheide = [
      { key: 'a', datei: 'bund/bger/a.json' },
      { key: 'b', datei: 'bund/bger/b.json' },
      { key: 'c', datei: 'kanton/ZH/c.json' },
    ];
    const abgerufenProDatei: Record<string, string> = {
      'bund/bger/a.json': '2026-03-10',
      'bund/bger/b.json': '2026-06-27', // das Maximum
      'kanton/ZH/c.json': '2025-11-01',
    };
    const stand = berechneStandRechtsprechung(entscheide, (datei) => abgerufenProDatei[datei] ?? null);
    expect(stand).toBe('2026-06-27');
    expect(stand).not.toBe(registerErzeugtHeute);
  });

  it('überspringt Verweise (Redirect-Stubs ohne eigene Datei)', () => {
    const entscheide = [
      { verweis: { zielKey: 'x' }, datei: null },
      { datei: 'bund/bger/echt.json' },
    ];
    let gelesen = 0;
    const stand = berechneStandRechtsprechung(entscheide, () => {
      gelesen += 1;
      return '2026-05-05';
    });
    expect(stand).toBe('2026-05-05');
    expect(gelesen).toBe(1); // der Verweis-Eintrag wurde NICHT gelesen
  });

  it('überspringt Nicht-Verweise ohne datei-Feld, statt zu werfen', () => {
    const entscheide = [{ datei: null }, { datei: undefined }];
    const stand = berechneStandRechtsprechung(entscheide, () => '2026-01-01');
    expect(stand).toBeNull();
  });

  it('ignoriert ungültige/leere Abrufdaten (§8: nie ein erfundenes Datum)', () => {
    const entscheide = [
      { datei: 'a.json' },
      { datei: 'b.json' },
    ];
    const werte: Record<string, string | null> = { 'a.json': 'kein-datum', 'b.json': '2026-04-04' };
    const stand = berechneStandRechtsprechung(entscheide, (d) => werte[d]);
    expect(stand).toBe('2026-04-04');
  });

  it('liefert null, wenn kein Eintrag ein gültiges Abrufdatum hat', () => {
    const stand = berechneStandRechtsprechung([{ datei: 'x.json' }], () => null);
    expect(stand).toBeNull();
  });

  it('ist deterministisch: gleiche Eingabe → gleiches Ergebnis, kein Date.now() (§2)', () => {
    const entscheide = [{ datei: 'a.json' }, { datei: 'b.json' }];
    const lies = (d: string) => (d === 'a.json' ? '2026-02-02' : '2026-08-08');
    const einmal = berechneStandRechtsprechung(entscheide, lies);
    const zweimal = berechneStandRechtsprechung(entscheide, lies);
    expect(einmal).toBe(zweimal);
    expect(einmal).toBe('2026-08-08');
  });
});

describe('juengstes (Hilfsfunktion, geteilt mit den anderen D8-Stand-Feldern)', () => {
  it('sortiert ISO-Tagesdaten lexikografisch korrekt und filtert Ungültiges', () => {
    expect(juengstes(['2026-01-31', '2026-02-01', null, undefined, 'foo', '2025-12-31'])).toBe('2026-02-01');
    expect(juengstes([])).toBeNull();
    expect(juengstes([null, undefined])).toBeNull();
  });
});
