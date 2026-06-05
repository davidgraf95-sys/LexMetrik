import { describe, it, expect } from 'vitest';
import {
  bestimmeZustaendigkeit, zustaendigkeitErgebnis, ZPO_SCHWELLEN,
  type ZustaendigkeitInput,
} from '../lib/zustaendigkeit';

// Akzeptanztests Zuständigkeitsengine (Bundesrecht, Phase 1). Schwellen gegen
// das Fedlex-Filestore-HTML SR 272 ZPO (Konsolidierung 20250101) verifiziert.
// Grenzwerte werden beidseits geprüft (Revision 2025: Entscheidvorschlag 10'000).

const geld = (patch: Partial<ZustaendigkeitInput> = {}): ZustaendigkeitInput => ({
  streitsache: 'geldforderung', vermoegensrechtlich: true, streitwertCHF: 5_000, ...patch,
});

describe('Zuständigkeit — Verfahrensart (Art. 243 ZPO)', () => {
  it('Streitwert genau 30 000 → vereinfacht (bis und mit)', () => {
    expect(bestimmeZustaendigkeit(geld({ streitwertCHF: ZPO_SCHWELLEN.VEREINFACHT })).verfahrensart).toBe('vereinfacht');
  });
  it('Streitwert 30 001 → ordentlich', () => {
    expect(bestimmeZustaendigkeit(geld({ streitwertCHF: 30_001 })).verfahrensart).toBe('ordentlich');
  });
  it('Miete-Kündigungsschutz bei 50 000 → trotzdem vereinfacht (streitwertunabhängig)', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'miete_wohn_geschaeft', vermoegensrechtlich: true, streitwertCHF: 50_000, mieteUnterfall: 'kuendigungsschutz' });
    expect(r.verfahrensart).toBe('vereinfacht');
  });
  it('GlG-Streit ohne Streitwert → vereinfacht', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'arbeit', vermoegensrechtlich: false, streitwertCHF: null, glgBetroffen: true });
    expect(r.verfahrensart).toBe('vereinfacht');
  });
  it('nicht vermögensrechtlich, keine Sondermaterie → ordentlich', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'geldforderung', vermoegensrechtlich: false, streitwertCHF: null });
    expect(r.verfahrensart).toBe('ordentlich');
  });
});

describe('Zuständigkeit — Entscheidkompetenz (Art. 210/212 ZPO)', () => {
  it('Entscheid auf Antrag nur bis 2 000', () => {
    expect(bestimmeZustaendigkeit(geld({ streitwertCHF: 2_000 })).entscheidkompetenz.entscheidAufAntrag).toBe(true);
    expect(bestimmeZustaendigkeit(geld({ streitwertCHF: 2_001 })).entscheidkompetenz.entscheidAufAntrag).toBe(false);
  });
  it('Entscheidvorschlag bis 10 000 (Revision 2025, vorher 5 000)', () => {
    expect(bestimmeZustaendigkeit(geld({ streitwertCHF: 10_000 })).entscheidkompetenz.entscheidvorschlag).toBe(true);
    expect(bestimmeZustaendigkeit(geld({ streitwertCHF: 10_001 })).entscheidkompetenz.entscheidvorschlag).toBe(false);
  });
  it('Miete-Schutzmaterie → Entscheidvorschlag unabhängig vom Streitwert', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'miete_wohn_geschaeft', vermoegensrechtlich: true, streitwertCHF: 80_000, mieteUnterfall: 'mietzins_anfechtung' });
    expect(r.entscheidkompetenz.entscheidvorschlag).toBe(true);
  });
});

describe('Zuständigkeit — Schlichtung (Art. 197–200 ZPO)', () => {
  it('Grundsatz: obligatorisch', () => {
    expect(bestimmeZustaendigkeit(geld()).schlichtung.obligatorisch).toBe(true);
  });
  it('Widerklage/gerichtliche Frist → Schlichtung entfällt', () => {
    const r = bestimmeZustaendigkeit(geld({ widerklageOderGerichtlicheFrist: true }));
    expect(r.schlichtung.obligatorisch).toBe(false);
    expect(r.schlichtung.entfaelltGrund).toContain('Art. 198');
  });
  it('Verzicht gemeinsam ab 100 000', () => {
    expect(bestimmeZustaendigkeit(geld({ streitwertCHF: 99_999 })).schlichtung.verzichtGemeinsam).toBe(false);
    expect(bestimmeZustaendigkeit(geld({ streitwertCHF: 100_000 })).schlichtung.verzichtGemeinsam).toBe(true);
  });
  it('einseitiger Verzicht bei Beklagter im Ausland/unbekannt', () => {
    expect(bestimmeZustaendigkeit(geld({ beklagteAuslandOderUnbekannt: true })).schlichtung.verzichtEinseitig).toBe(true);
  });
  it('Miete → paritätische Schlichtungsbehörde (Miete)', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'miete_wohn_geschaeft', vermoegensrechtlich: true, streitwertCHF: 3_000, mieteUnterfall: 'sonstige' });
    expect(r.schlichtung.behoerdeTyp).toBe('paritaetisch_miete');
  });
  it('GlG → paritätische Schlichtungsbehörde (GlG)', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'arbeit', vermoegensrechtlich: true, streitwertCHF: 3_000, glgBetroffen: true });
    expect(r.schlichtung.behoerdeTyp).toBe('paritaetisch_glg');
  });
  it('gewöhnliche Geldforderung → ordentliche Schlichtungsbehörde', () => {
    expect(bestimmeZustaendigkeit(geld()).schlichtung.behoerdeTyp).toBe('ordentlich');
  });
});

describe('Zuständigkeit — örtlich (Art. 10/32/33/34/35 ZPO)', () => {
  it('Geldforderung (kein Konsum) → Beklagtensitz, dispositiv', () => {
    const r = bestimmeZustaendigkeit(geld());
    expect(r.oertlich.gerichtsstand).toContain('beklagten Partei');
    expect(r.oertlich.teilzwingend).toBe(false);
  });
  it('Konsument klagt → Wohnsitz/Sitz einer Partei, teilzwingend', () => {
    const r = bestimmeZustaendigkeit(geld({ konsumentenvertrag: true, klaegeristGeschuetzt: true }));
    expect(r.oertlich.gerichtsstand).toContain('einer der Parteien');
    expect(r.oertlich.teilzwingend).toBe(true);
  });
  it('Miete → Ort der gelegenen Sache, teilzwingend', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'miete_wohn_geschaeft', vermoegensrechtlich: true, streitwertCHF: 3_000 });
    expect(r.oertlich.gerichtsstand).toContain('gelegenen Sache');
    expect(r.oertlich.teilzwingend).toBe(true);
  });
  it('Arbeit → Beklagtensitz oder Arbeitsort, teilzwingend', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'arbeit', vermoegensrechtlich: true, streitwertCHF: 3_000 });
    expect(r.oertlich.gerichtsstand).toContain('Arbeitsort');
    expect(r.oertlich.teilzwingend).toBe(true);
  });
});

describe('Zuständigkeit — Weichen (Art. 6/8 ZPO)', () => {
  it('Handelsgericht-Weiche bei geschäftlich + beide im HR + > 30 000', () => {
    const r = bestimmeZustaendigkeit(geld({ streitwertCHF: 60_000, geschaeftlicheTaetigkeit: true, beklagteImHR: true, klaegerImHR: true }));
    expect(r.weichen.some((w) => w.includes('Handelsgericht'))).toBe(true);
  });
  it('nur Beklagte im HR → Klägerwahl-Weiche (Art. 6 Abs. 3)', () => {
    const r = bestimmeZustaendigkeit(geld({ streitwertCHF: 60_000, geschaeftlicheTaetigkeit: true, beklagteImHR: true, klaegerImHR: false }));
    expect(r.weichen.some((w) => w.includes('Abs. 3'))).toBe(true);
  });
  it('keine HG-Weiche bei Miete (Art. 6 Abs. 2 lit. d Ausschluss)', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'miete_wohn_geschaeft', vermoegensrechtlich: true, streitwertCHF: 60_000, geschaeftlicheTaetigkeit: true, beklagteImHR: true, klaegerImHR: true });
    expect(r.weichen.some((w) => w.includes('Handelsgericht'))).toBe(false);
  });
  it('direkte Klage ans obere Gericht ab 100 000', () => {
    const r = bestimmeZustaendigkeit(geld({ streitwertCHF: 100_000 }));
    expect(r.weichen.some((w) => w.includes('obere Gericht'))).toBe(true);
  });

  // Art. 243 Abs. 3: vereinfacht gilt NICHT vor HG/Art.-5/8-Instanz — die
  // Kombination «vereinfacht + Weiche» muss den Vorbehalt offenlegen.
  it('Miete-Schutzmaterie 120 000 → vereinfacht + Direktklage-Weiche + Vorbehalt Art. 243 Abs. 3', () => {
    const r = bestimmeZustaendigkeit({
      streitsache: 'miete_wohn_geschaeft', vermoegensrechtlich: true,
      streitwertCHF: 120_000, mieteUnterfall: 'kuendigungsschutz',
    });
    expect(r.verfahrensart).toBe('vereinfacht');
    expect(r.weichen.some((w) => w.includes('obere Gericht'))).toBe(true);
    expect(r.warnungen.some((w) => w.includes('Art. 243 Abs. 3'))).toBe(true);
  });
  it('ordentliches Verfahren + Weiche → KEIN 243-Abs.-3-Vorbehalt (nicht einschlägig)', () => {
    const r = bestimmeZustaendigkeit(geld({ streitwertCHF: 150_000 }));
    expect(r.verfahrensart).toBe('ordentlich');
    expect(r.warnungen.some((w) => w.includes('Art. 243 Abs. 3'))).toBe(false);
  });
});

describe('Zuständigkeit — Scheidung (Umbau 5.6.2026; Art. 23/198 lit. c/274 ZPO)', () => {
  const scheidung = (): ZustaendigkeitInput => ({
    streitsache: 'scheidung', vermoegensrechtlich: false, streitwertCHF: null,
  });
  it('eigenes Scheidungsverfahren; Schlichtung entfällt (Art. 198 lit. c)', () => {
    const r = bestimmeZustaendigkeit(scheidung());
    expect(r.verfahrensart).toBe('scheidungsverfahren');
    expect(r.schlichtung.obligatorisch).toBe(false);
    expect(r.schlichtung.entfaelltGrund).toContain('Art. 198 lit. c');
  });
  it('örtlich: Wohnsitz einer der Parteien, ZWINGEND (Art. 23 Abs. 1)', () => {
    const r = bestimmeZustaendigkeit(scheidung());
    expect(r.oertlich.gerichtsstand).toContain('einer der Parteien');
    expect(r.oertlich.bindung).toBe('zwingend');
    expect(r.oertlich.teilzwingend).toBe(false);
    expect(r.oertlich.normen.some((n) => n.artikel === 'Art. 23 ZPO')).toBe(true);
  });
  it('Eingabe-Art: gemeinsames Begehren oder Klage (Art. 274)', () => {
    expect(bestimmeZustaendigkeit(scheidung()).eingabeArt).toBe('scheidungsbegehren_oder_klage');
  });
});

describe('Zuständigkeit — Erbrecht (Art. 28 ZPO; Spezialbehörden-Hinweise)', () => {
  const erb = (): ZustaendigkeitInput => ({
    streitsache: 'erbrecht', vermoegensrechtlich: true, streitwertCHF: 50_000,
  });
  it('örtlich: letzter Wohnsitz des Erblassers, DISPOSITIV (Art. 28 Abs. 1 — nicht als zwingend bezeichnet)', () => {
    const r = bestimmeZustaendigkeit(erb());
    expect(r.oertlich.gerichtsstand).toContain('letzten Wohnsitz');
    expect(r.oertlich.bindung).toBe('dispositiv');
    expect(r.oertlich.normen.some((n) => n.artikel === 'Art. 28 ZPO')).toBe(true);
  });
  it('Klageweg normal: Schlichtung obligatorisch, ordentliche Behörde, Verfahrensart nach Streitwert', () => {
    const r = bestimmeZustaendigkeit(erb());
    expect(r.schlichtung.obligatorisch).toBe(true);
    expect(r.schlichtung.behoerdeTyp).toBe('ordentlich');
    expect(r.verfahrensart).toBe('ordentlich'); // 50'000 > 30'000
    expect(r.eingabeArt).toBe('schlichtungsgesuch');
  });
  it('Erbgangs-Massnahmen: zwingende Behörde (Art. 28 Abs. 2) als Warnung offengelegt', () => {
    const r = bestimmeZustaendigkeit(erb());
    expect(r.warnungen.some((w) => w.includes('Art. 28 Abs. 2'))).toBe(true);
  });
  it('Arbeit: Hinweis auf kantonale Arbeitsgerichte/eigene Schlichtungsbehörden', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'arbeit', vermoegensrechtlich: true, streitwertCHF: 5_000 });
    expect(r.warnungen.some((w) => w.includes('Arbeitsgerichte'))).toBe(true);
  });
});

describe('Zuständigkeit — Eingabe-Art & Prüfreihenfolge (Umbau 5.6.2026)', () => {
  it('obligatorische Schlichtung → Schlichtungsgesuch; entfallene → Klage direkt', () => {
    expect(bestimmeZustaendigkeit(geld()).eingabeArt).toBe('schlichtungsgesuch');
    expect(bestimmeZustaendigkeit(geld({ widerklageOderGerichtlicheFrist: true })).eingabeArt).toBe('klage_direkt');
  });
  it('Kompetenz-Flags nur bei tatsächlicher Schlichtung (Präzisierung)', () => {
    const r = bestimmeZustaendigkeit(geld({ streitwertCHF: 1_500, widerklageOderGerichtlicheFrist: true }));
    expect(r.entscheidkompetenz.entscheidAufAntrag).toBe(false);
    expect(r.entscheidkompetenz.entscheidvorschlag).toBe(false);
  });
  it('Rechenweg prüft örtlich → sachlich → funktionell → Verfahrensart → Eingabe', () => {
    const b = bestimmeZustaendigkeit(geld()).rechenweg.map((s) => s.beschreibung);
    expect(b[0]).toMatch(/^1 · Örtliche Zuständigkeit/);
    expect(b[1]).toMatch(/^2 · Sachliche Zuständigkeit/);
    expect(b[2]).toMatch(/^3 · Funktionell/);
    expect(b.some((x) => x.startsWith('4 · Verfahrensart'))).toBe(true);
    expect(b[b.length - 1]).toMatch(/^5 · Einleitende Eingabe/);
  });
});

describe('Zuständigkeit — Robustheit & Determinismus', () => {
  it('wirft, wenn vermögensrechtlich ohne Streitwert', () => {
    expect(() => bestimmeZustaendigkeit({ streitsache: 'geldforderung', vermoegensrechtlich: true, streitwertCHF: null })).toThrow();
  });
  it('wirft bei negativem Streitwert', () => {
    expect(() => bestimmeZustaendigkeit(geld({ streitwertCHF: -1 }))).toThrow();
  });
  it('deterministisch: gleiche Eingabe → tief gleiche Ausgabe', () => {
    const i = geld({ streitwertCHF: 12_345, konsumentenvertrag: true, klaegeristGeschuetzt: true });
    expect(bestimmeZustaendigkeit(i)).toEqual(bestimmeZustaendigkeit(i));
  });
  it('Adapter liefert Berechnungsergebnis mit Rechenweg und Normen', () => {
    const e = zustaendigkeitErgebnis(geld({ streitwertCHF: 1_500 }));
    expect(e.status).toBe('ok');
    expect(e.rechenweg.length).toBeGreaterThan(0);
    expect(e.normverweise.some((n) => n.artikel === 'Art. 243 ZPO')).toBe(true);
    expect(e.ergebnis).toContain('Verfahren');
  });
  it('Adapter legt das ausgeklammerte summarische Verfahren als Annahme offen', () => {
    const e = zustaendigkeitErgebnis(geld());
    expect(e.annahmen.some((a) => a.includes('Art. 248'))).toBe(true);
  });
});
