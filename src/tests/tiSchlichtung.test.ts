import { describe, it, expect } from 'vitest';
import { amtFuer } from '../data/schlichtung/amtAufloesung';
import { tiKandidaten, TI_MEHRDEUTIG } from '../data/schlichtung/tiAmt';
import { plzAufloesen, hauptTreffer } from '../data/plz/plzAufloesung';
import aemterKantone from '../data/schlichtung/aemterKantone.json';

// ─── TI-Verdrahtung (11.6.2026, Dossier §38) ─────────────────────────────────
// Quelle: amtliche Località-Suche ti.ch (169/169 Antworten). 97 Gemeinden
// eindeutig je Circolo; Lugano/Lema/Tresa liegen in mehreren Circoli und
// laufen über die Ortsteil-Wahl (tiKandidaten).

const ti = (aemterKantone as Record<string, { aemter: { name: string; strasse: string; plzOrt: string }[]; gemeinden: Record<string, number> }>).TI;

describe('TI: Generator-Stand (38 Circoli, 97 eindeutige Gemeinden)', () => {
  it('38 Giudicature, 97 Gemeinde-Einträge, jedes Amt mit PLZ-Ort', () => {
    expect(ti.aemter.length).toBe(38);
    expect(Object.keys(ti.gemeinden).length).toBe(97);
    for (const a of ti.aemter) expect(a.plzOrt, a.name).toMatch(/^\d{4} /);
  });
  it('Mehr-Circoli-Gemeinden sind bewusst NICHT in der Auto-Zuordnung', () => {
    for (const g of ['Lugano', 'Lema', 'Tresa']) expect(ti.gemeinden[g], g).toBeUndefined();
  });
  it('alle Kandidaten-Amtsnamen der Ortsteil-Wahl existieren im Generator-Stand', () => {
    const namen = new Set(ti.aemter.map((a) => a.name));
    for (const [g, liste] of Object.entries(TI_MEHRDEUTIG)) {
      for (const k of liste) expect(namen.has(k.amtName), `${g}: ${k.amtName}`).toBe(true);
    }
  });
});

describe('TI: Gemeinde → Giudicatura (Empirie, amtliche Antworten 11.6.2026)', () => {
  const faelle: [string, string][] = [
    ['Chiasso', 'Balerna'],            // Chiasso hat KEINE eigene Giudicatura
    ['Mendrisio', 'Mendrisio'],
    ['Bellinzona', 'Bellinzona'],      // konsolidiert (ex Ticino/Giubiasco)
    ['Biasca', 'Riviera'],
    ['Riviera', 'Riviera'],            // Fusionsgemeinde Riviera, eindeutig
    ['Blenio', 'Olivone'],
    ['Quinto', 'Quinto'],
    ['Bosco/Gurin', 'Rovana'],
    ['Verzasca', 'Verzasca'],
    ['Val Mara', 'Ceresio'],
    ['Serravalle', 'Malvaglia'],
    ['Cadenazzo', 'Sant’Antonino'],
    ['Onsernone', 'Onsernone'],
    ['Paradiso', 'Paradiso'],
    ['Ascona', 'Isole'],
    ['Centovalli', 'Melezza'],
  ];
  for (const [gemeinde, circolo] of faelle) {
    it(`${gemeinde} → Circolo di ${circolo}`, async () => {
      const amt = await amtFuer('TI', gemeinde);
      expect(amt?.name.replace(/’/g, "'"), gemeinde).toBe(`Giudicatura di pace del Circolo di ${circolo}`.replace(/’/g, "'"));
    });
  }
  it('Bellinzona: amtliche Korrespondenzadresse Piazza Grande 3, 6512 Giubiasco', async () => {
    const amt = await amtFuer('TI', 'Bellinzona');
    expect(amt?.strasse).toBe('Piazza Grande 3');
    expect(amt?.plzOrt).toBe('6512 Giubiasco');
  });
  it('Verzasca: amtliche Postanschrift (CP 4, 6516 Cugnasco)', async () => {
    const amt = await amtFuer('TI', 'Verzasca');
    expect(amt?.plzOrt).toBe('6516 Cugnasco');
  });
});

describe('TI: Ortsteil-Wahl für Lugano/Lema/Tresa', () => {
  it('Lugano → 3 Kandidaten (Ovest/Est/Nord) mit Quartier-Labels', async () => {
    const k = (await tiKandidaten('Lugano'))!;
    expect(k.map((x) => x.name)).toEqual([
      'Giudicatura di pace del Circolo di Lugano Ovest',
      'Giudicatura di pace del Circolo di Lugano Est',
      'Giudicatura di pace del Circolo di Lugano Nord',
    ]);
    expect(k[0].kreise).toContain('Zentrum');
    expect(k[2].plzOrt).toBe('6968 Sonvico');
  });
  it('Lema → 3 Circoli (Sessa/Magliasina/Breno); Tresa → 2 (Sessa/Magliasina)', async () => {
    expect((await tiKandidaten('Lema'))!.length).toBe(3);
    const tresa = (await tiKandidaten('Tresa'))!;
    expect(tresa.length).toBe(2);
    expect(tresa[1].kreise).toBe('Ponte Tresa');
  });
  it('eindeutige Gemeinden liefern KEINE Kandidaten (amtFuer greift)', async () => {
    expect(await tiKandidaten('Mendrisio')).toBeNull();
    expect(await tiKandidaten('Bellinzona')).toBeNull();
  });
});

describe('TI: PLZ-Ketten', () => {
  it('6830 Chiasso → Gemeinde Chiasso → Circolo di Balerna', async () => {
    const t = (await plzAufloesen('6830'))!.filter((x) => x.kanton === 'TI');
    const haupt = hauptTreffer(t) ?? t[0];
    expect((await amtFuer('TI', haupt.gemeinde))?.name).toContain('Balerna');
  });
  it('6500 Bellinzona → Circolo di Bellinzona (Giubiasco-Adresse)', async () => {
    const t = (await plzAufloesen('6500'))!.filter((x) => x.kanton === 'TI');
    const haupt = hauptTreffer(t) ?? t[0];
    expect((await amtFuer('TI', haupt.gemeinde))?.plzOrt).toBe('6512 Giubiasco');
  });
  it('6900 Lugano → keine Auto-Zuordnung, aber Ortsteil-Kandidaten', async () => {
    const t = (await plzAufloesen('6900'))!.filter((x) => x.kanton === 'TI');
    const haupt = hauptTreffer(t) ?? t[0];
    expect(await amtFuer('TI', haupt.gemeinde)).toBeNull();
    expect((await tiKandidaten(haupt.gemeinde))?.length).toBe(3);
  });
});
