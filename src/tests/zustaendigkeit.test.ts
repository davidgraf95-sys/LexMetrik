import { describe, it, expect } from 'vitest';
import {
  bestimmeZustaendigkeit, bestimmeRechtsmittel, zustaendigkeitErgebnis, ZPO_SCHWELLEN,
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
  it('gesellschaft ohne HR-Eintrag der Beklagten (Verantwortlichkeitsklage gegen Organe): Art.-6-Abs.-4-lit.-b-Weiche (M-2-Fix Bug-Check 6.6.2026)', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'gesellschaft', vermoegensrechtlich: true, streitwertCHF: 500_000, geschaeftlicheTaetigkeit: true, beklagteImHR: false, klaegerImHR: true });
    expect(r.weichen.some((w) => w.includes('Art. 6 Abs. 4 lit. b'))).toBe(true);
  });
  it('gesellschaft mit erfüllten Abs.-2-Merkmalen: Abs.-2-Weiche, KEINE doppelte Abs.-4-Weiche', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'gesellschaft', vermoegensrechtlich: true, streitwertCHF: 60_000, geschaeftlicheTaetigkeit: true, beklagteImHR: true, klaegerImHR: true });
    expect(r.weichen.some((w) => w.includes('handelsrechtliche Streitigkeit nach Art. 6 ZPO'))).toBe(true);
    expect(r.weichen.some((w) => w.includes('Art. 6 Abs. 4 lit. b'))).toBe(false);
  });
  it('geldforderung ohne HR-Eintrag der Beklagten: weiterhin KEINE HG-Weiche (Abs. 4 lit. b gilt nur für gesellschaft)', () => {
    const r = bestimmeZustaendigkeit(geld({ streitwertCHF: 500_000, geschaeftlicheTaetigkeit: true, beklagteImHR: false, klaegerImHR: true }));
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

// ─── Ausbau 5.6.2026 (Regelwerk bibliothek/normen/zpo-zustaendigkeit-regelwerk.md) ───

describe('Zuständigkeit — Ausbau: Delikt (Art. 36–38 ZPO)', () => {
  const delikt = (patch: Partial<ZustaendigkeitInput> = {}): ZustaendigkeitInput => ({
    streitsache: 'delikt', vermoegensrechtlich: true, streitwertCHF: 20_000, ...patch,
  });
  it('allgemein: vier Anknüpfungen inkl. Geschädigtenforum (Art. 36)', () => {
    const r = bestimmeZustaendigkeit(delikt());
    expect(r.oertlich.gerichtsstand).toContain('geschädigten');
    expect(r.oertlich.gerichtsstand).toContain('Erfolgsort');
    expect(r.oertlich.bindung).toBe('dispositiv');
  });
  it('Verkehrsunfall: Beklagtensitz oder Unfallort (Art. 38)', () => {
    const r = bestimmeZustaendigkeit(delikt({ deliktUnterfall: 'verkehrsunfall' }));
    expect(r.oertlich.gerichtsstand).toContain('Unfallort');
  });
  it('ungerechtfertigte vM: Anordnungsort (Art. 37)', () => {
    const r = bestimmeZustaendigkeit(delikt({ deliktUnterfall: 'ungerechtfertigte_massnahme' }));
    expect(r.oertlich.gerichtsstand).toContain('vorsorgliche Massnahme angeordnet');
  });
  it('Spezialforen-Warnung nur beim allgemeinen Unterfall', () => {
    expect(bestimmeZustaendigkeit(delikt()).warnungen.some((w) => w.includes('Art. 38a'))).toBe(true);
    expect(bestimmeZustaendigkeit(delikt({ deliktUnterfall: 'verkehrsunfall' })).warnungen.some((w) => w.includes('Art. 38a'))).toBe(false);
  });
});

describe('Zuständigkeit — Ausbau: Persönlichkeit/Gewaltschutz (Art. 20 ZPO; 198 lit. abis)', () => {
  it('Persönlichkeitsverletzung: Wahlforum, Schlichtung obligatorisch', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'persoenlichkeit', vermoegensrechtlich: false, streitwertCHF: null, persoenlichkeitUnterfall: 'verletzung' });
    expect(r.oertlich.gerichtsstand).toContain('einer der Parteien');
    expect(r.schlichtung.obligatorisch).toBe(true);
  });
  it('Gewaltschutz: Schlichtung entfällt (lit. abis), vereinfacht streitwertunabhängig, Kostenfreiheits-Hinweis (114 lit. f)', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'persoenlichkeit', vermoegensrechtlich: false, streitwertCHF: null, persoenlichkeitUnterfall: 'gewaltschutz' });
    expect(r.schlichtung.obligatorisch).toBe(false);
    expect(r.schlichtung.entfaelltGrund).toContain('abis');
    expect(r.verfahrensart).toBe('vereinfacht');
    expect(r.eingabeArt).toBe('klage_direkt');
    expect(r.warnungen.some((w) => w.includes('Art. 114 lit. f'))).toBe(true);
  });
});

describe('Zuständigkeit — Ausbau: Gesellschaft (Art. 40) und Art.-5-Materie', () => {
  it('Verantwortlichkeitsklage: Beklagtensitz oder Sitz der Gesellschaft; HG-Weiche möglich', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'gesellschaft', vermoegensrechtlich: true, streitwertCHF: 200_000, geschaeftlicheTaetigkeit: true, beklagteImHR: true, klaegerImHR: true });
    expect(r.oertlich.gerichtsstand).toContain('Sitz der Gesellschaft');
    expect(r.weichen.some((w) => w.includes('Handelsgericht'))).toBe(true);
  });
  it('ip_wettbewerb: einzige kantonale Instanz — Schlichtung entfällt (199 III), ordentlich (243 III), Klage direkt, KEINE Direktklage-Weiche', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 500_000 });
    expect(r.schlichtung.obligatorisch).toBe(false);
    expect(r.schlichtung.entfaelltGrund).toContain('Art. 5');
    expect(r.verfahrensart).toBe('ordentlich');
    expect(r.eingabeArt).toBe('klage_direkt');
    expect(r.weichen.some((w) => w.includes('obere Gericht'))).toBe(false);
    expect(r.rechenweg.some((s) => s.beschreibung.includes('EINZIGE kantonale Instanz'))).toBe(true);
  });
});

describe('Zuständigkeit — Ausbau: Vertrag (Art. 31), AVG (Art. 34 II), GSV (Art. 9/17/35), IPRG (Art. 2)', () => {
  it('Forderung aus Vertrag: zusätzlich Ort der charakteristischen Leistung', () => {
    const r = bestimmeZustaendigkeit(geld({ ausVertrag: true }));
    expect(r.oertlich.gerichtsstand).toContain('charakteristische Leistung');
    // ohne Flag: unverändert nur Beklagtensitz (Bestandsschutz)
    expect(bestimmeZustaendigkeit(geld()).oertlich.gerichtsstand).toBe('Gericht am Wohnsitz/Sitz der beklagten Partei');
  });
  it('Personalverleih: Zusatzforum am Ort der Niederlassung des Verleihers', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'arbeit', vermoegensrechtlich: true, streitwertCHF: 8_000, avgVerleih: true });
    expect(r.oertlich.gerichtsstand).toContain('Art. 34 Abs. 2');
  });
  it('GSV bei zwingendem Forum (Scheidung) → Unwirksamkeits-Warnung', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'scheidung', vermoegensrechtlich: false, streitwertCHF: null, gerichtsstandsvereinbarung: true });
    expect(r.warnungen.some((w) => w.includes('UNWIRKSAM'))).toBe(true);
  });
  it('GSV bei teilzwingendem Forum (Miete) → nur-nach-Streitentstehung-Warnung', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'miete_wohn_geschaeft', vermoegensrechtlich: true, streitwertCHF: 5_000, mieteUnterfall: 'sonstige', gerichtsstandsvereinbarung: true });
    expect(r.warnungen.some((w) => w.includes('NACH Entstehung'))).toBe(true);
  });
  it('dispositives Forum ohne GSV → Art.-17/18-Weiche; mit GSV → Ausschliesslichkeits-Hinweis', () => {
    expect(bestimmeZustaendigkeit(geld()).weichen.some((w) => w.includes('Art. 18'))).toBe(true);
    expect(bestimmeZustaendigkeit(geld({ gerichtsstandsvereinbarung: true })).weichen.some((w) => w.includes('AUSSCHLIESSLICH'))).toBe(true);
  });
  it('Auslandsbezug → IPRG/LugÜ-Warnung (Art. 2)', () => {
    const r = bestimmeZustaendigkeit(geld({ beklagteAuslandOderUnbekannt: true }));
    expect(r.warnungen.some((w) => w.includes('LugÜ'))).toBe(true);
  });
  it('perpetuatio fori überall; Art.-63-Hinweis nur bei offenen Weichen', () => {
    expect(bestimmeZustaendigkeit(geld()).weichen.some((w) => w.includes('perpetuatio'))).toBe(true);
    expect(bestimmeZustaendigkeit(geld()).weichen.some((w) => w.includes('Art. 63'))).toBe(false);
    expect(bestimmeZustaendigkeit(geld({ streitwertCHF: 150_000 })).weichen.some((w) => w.includes('Art. 63'))).toBe(true);
  });
});

describe('Zuständigkeit — Praxis-Umbau: Kostenfreiheit (Art. 113 Abs. 2) + Fahrplan + Kosten-Daten', () => {
  it('Schlichtung kostenlos: Miete ✓, GlG ✓, Arbeit ≤30k ✓; Arbeit >30k ✗; Arbeit ohne SW ✗ (nicht subsumierbar); Geldforderung ✗', () => {
    const miete = bestimmeZustaendigkeit({ streitsache: 'miete_wohn_geschaeft', vermoegensrechtlich: true, streitwertCHF: 80_000, mieteUnterfall: 'sonstige' });
    expect(miete.schlichtung.kostenlos).toBe(true);
    expect(miete.schlichtung.kostenlosGrund).toContain('lit. c');
    const glg = bestimmeZustaendigkeit({ streitsache: 'arbeit', vermoegensrechtlich: true, streitwertCHF: 50_000, glgBetroffen: true });
    expect(glg.schlichtung.kostenlosGrund).toContain('lit. a');
    expect(bestimmeZustaendigkeit({ streitsache: 'arbeit', vermoegensrechtlich: true, streitwertCHF: 30_000 }).schlichtung.kostenlos).toBe(true);
    expect(bestimmeZustaendigkeit({ streitsache: 'arbeit', vermoegensrechtlich: true, streitwertCHF: 30_001 }).schlichtung.kostenlos).toBe(false);
    expect(bestimmeZustaendigkeit({ streitsache: 'arbeit', vermoegensrechtlich: false, streitwertCHF: null }).schlichtung.kostenlos).toBe(false);
    expect(bestimmeZustaendigkeit(geld()).schlichtung.kostenlos).toBe(false);
  });
  it('Schlichtung kostenlos: Datenschutz ✓ (Art. 113 Abs. 2 lit. g — Befund B-1, 6.6.2026); übrige Persönlichkeits-Unterfälle ✗; Gewaltschutz ohne Schlichtung', () => {
    const dsg = bestimmeZustaendigkeit({ streitsache: 'persoenlichkeit', vermoegensrechtlich: false, streitwertCHF: null, persoenlichkeitUnterfall: 'datenschutz' });
    expect(dsg.schlichtung.obligatorisch).toBe(true);
    expect(dsg.schlichtung.kostenlos).toBe(true);
    expect(dsg.schlichtung.kostenlosGrund).toContain('lit. g');
    // Spiegelbild Art. 114 lit. g (Entscheidverfahren) bleibt unverändert ausgewiesen:
    expect(dsg.warnungen.some((w) => w.includes('Art. 114 lit. g'))).toBe(true);
    const verletzung = bestimmeZustaendigkeit({ streitsache: 'persoenlichkeit', vermoegensrechtlich: false, streitwertCHF: null, persoenlichkeitUnterfall: 'verletzung' });
    expect(verletzung.schlichtung.kostenlos).toBe(false);
    const gegendarstellung = bestimmeZustaendigkeit({ streitsache: 'persoenlichkeit', vermoegensrechtlich: false, streitwertCHF: null, persoenlichkeitUnterfall: 'gegendarstellung' });
    expect(gegendarstellung.schlichtung.kostenlos).toBe(false);
    // Gewaltschutz: Schlichtung entfällt (198 lit. abis) → lit.-g-Frage stellt sich nicht.
    const gewalt = bestimmeZustaendigkeit({ streitsache: 'persoenlichkeit', vermoegensrechtlich: false, streitwertCHF: null, persoenlichkeitUnterfall: 'gewaltschutz' });
    expect(gewalt.schlichtung.obligatorisch).toBe(false);
    expect(gewalt.schlichtung.kostenlos).toBe(false);
  });
  it('Fahrplan: Schlichtungsweg hat 4 Schritte inkl. Klagebewilligungs-Frist; Direktklage 3; Scheidung eigener Pfad', async () => {
    const { fahrplanSchritte } = await import('../lib/zustaendigkeitFahrplan');
    const sgWeg = fahrplanSchritte(bestimmeZustaendigkeit(geld()), { vorlageVerfuegbar: true, stelleBekannt: true });
    expect(sgWeg.length).toBe(4);
    expect(sgWeg[2].text).toContain('3 Monaten');
    expect(sgWeg[2].text).toContain('30 Tage');
    const direkt = fahrplanSchritte(bestimmeZustaendigkeit({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 100_000 }), { vorlageVerfuegbar: false, stelleBekannt: false });
    expect(direkt.length).toBe(3);
    expect(direkt[0].titel).toContain('Klage verfassen');
    const scheidung = fahrplanSchritte(bestimmeZustaendigkeit({ streitsache: 'scheidung', vermoegensrechtlich: false, streitwertCHF: null }), { vorlageVerfuegbar: false, stelleBekannt: false });
    expect(scheidung[0].titel).toContain('Scheidungsbegehren');
  });
  it('Kosten-Daten: alle 26 Kantone mit Schlichtungs- UND Gerichtsrahmen samt Erlass', async () => {
    const { ZUSTAENDIGKEIT_KOSTEN } = await import('../data/zustaendigkeitKosten');
    const { KANTONE } = await import('../lib/kantone');
    for (const k of KANTONE) {
      const e = ZUSTAENDIGKEIT_KOSTEN[k];
      expect(e, k).toBeDefined();
      expect(e.schlichtung.text.length, k).toBeGreaterThan(3);
      expect(e.schlichtung.erlass, k).toMatch(/§|Art\./);
      expect(e.gericht.erlass, k).toMatch(/§|Art\./);
    }
    // Stichproben gegen die zweifach geprüften Dossiers
    expect(ZUSTAENDIGKEIT_KOSTEN.SZ.schlichtung.text).toContain("100–1'000");
    expect(ZUSTAENDIGKEIT_KOSTEN.AG.schlichtung.erlass).toContain('662.110'); // GebührD, NICHT aufgehobenes VKD
    expect(ZUSTAENDIGKEIT_KOSTEN.SG.schlichtung.hinweis).toContain('30.6.2026');
    expect(ZUSTAENDIGKEIT_KOSTEN.JU.schlichtung.text).toContain('Punkte');
  });
  it('Nicht vermögensrechtlich: alle 26 Kantone haben Rahmen ODER Auffang-Klausel samt Erlass-§ (Dossier 6.6.2026)', async () => {
    const { ZUSTAENDIGKEIT_KOSTEN } = await import('../data/zustaendigkeitKosten');
    const { KANTONE } = await import('../lib/kantone');
    // 26/26 tragen das Feld; die 7 Auffang-Kantone mit Klausel-Text statt erfundenem Rahmen
    const auffang = ['SZ', 'FR', 'SH', 'AR', 'AI', 'SG', 'GR'] as const;
    for (const k of KANTONE) {
      const e = ZUSTAENDIGKEIT_KOSTEN[k].nichtVermoegensrechtlich;
      expect(e, k).toBeDefined();
      expect(e!.text.length, k).toBeGreaterThan(3);
      expect(e!.erlass, k).toMatch(/§|Art\./);
      if ((auffang as readonly string[]).includes(k)) {
        // §8: kein erfundener Zahlenrahmen, sondern Bemessungs-/Auffang-Klausel
        expect(e!.text, k).toContain('kein');
      }
    }
    // Stichproben wörtlich gegen das Dossier
    expect(ZUSTAENDIGKEIT_KOSTEN.ZH.nichtVermoegensrechtlich!.text).toContain("300–13'000");
    expect(ZUSTAENDIGKEIT_KOSTEN.BE.nichtVermoegensrechtlich!.text).toContain("200–10'000");
    expect(ZUSTAENDIGKEIT_KOSTEN.AG.nichtVermoegensrechtlich!.text).toContain("500–10'000");
    expect(ZUSTAENDIGKEIT_KOSTEN.BS.nichtVermoegensrechtlich!.text).toContain("200–250'000");
    expect(ZUSTAENDIGKEIT_KOSTEN.GL.nichtVermoegensrechtlich!.text).toContain("20'000");
    expect(ZUSTAENDIGKEIT_KOSTEN.NE.nichtVermoegensrechtlich!.text).toContain("500–50'000");
    // Auffang-Kantone: Klausel, kein Zahlenrahmen suggeriert
    expect(ZUSTAENDIGKEIT_KOSTEN.SZ.nichtVermoegensrechtlich!.text).toContain('kein eigener Rahmen');
    expect(ZUSTAENDIGKEIT_KOSTEN.SG.nichtVermoegensrechtlich!.hinweis).toContain('30.6.2026');
  });
  it('Familie/Scheidung: eigener Rahmen nur wo das Dossier ihn ausweist; NE als Formel-Text mit %', async () => {
    const { ZUSTAENDIGKEIT_KOSTEN } = await import('../data/zustaendigkeitKosten');
    const { KANTONE } = await import('../lib/kantone');
    // genau die Kantone mit eigenem Familien-/Scheidungsrahmen laut Dossier
    const mitFamilie = ['ZH', 'BE', 'LU', 'UR', 'OW', 'NW', 'ZG', 'BS', 'BL', 'AR', 'GR', 'TI', 'VS', 'NE'] as const;
    for (const k of KANTONE) {
      const hat = ZUSTAENDIGKEIT_KOSTEN[k].familie !== undefined;
      expect(hat, k).toBe((mitFamilie as readonly string[]).includes(k));
      if (hat) expect(ZUSTAENDIGKEIT_KOSTEN[k].familie!.erlass, k).toMatch(/§|Art\./);
    }
    // Stichproben wörtlich
    expect(ZUSTAENDIGKEIT_KOSTEN.BL.familie!.text).toContain("200–15'000"); // Scheidung lit. i
    expect(ZUSTAENDIGKEIT_KOSTEN.NW.familie!.text).toContain("800–4'000"); // Scheidung Art. 7 Abs. 3
    expect(ZUSTAENDIGKEIT_KOSTEN.BE.familie!.text).toContain("600–12'000"); // Art. 41
    expect(ZUSTAENDIGKEIT_KOSTEN.ZG.familie!.text).toContain("1'600–12'000"); // § 13
    expect(ZUSTAENDIGKEIT_KOSTEN.AR.familie!.text).toContain("500–6'000"); // Scheidung Art. 14/16
    // NE: Formel-Text (kein Rahmen — enthält Prozent)
    expect(ZUSTAENDIGKEIT_KOSTEN.NE.familie!.text).toContain('%');
    expect(ZUSTAENDIGKEIT_KOSTEN.NE.familie!.hinweis).toContain('Formel');
  });
});

describe('Rechtsmittel — obere Instanzen (Ausbau 5.6.2026; Art. 308/319 ZPO + Art. 74 BGG verbatim)', () => {
  const basis = (sw: number | null, extra: Partial<ZustaendigkeitInput> = {}): ZustaendigkeitInput => ({
    streitsache: 'geldforderung', vermoegensrechtlich: true, streitwertCHF: sw, ...extra,
  });
  it('kantonal: ≥10k Berufung · <10k Beschwerde · ohne SW wirft (M1) · nicht vermögensrechtlich Berufung · Art. 5 entfällt', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    expect(bestimmeRechtsmittel(basis(10_000)).kantonal).toBe('berufung');
    expect(bestimmeRechtsmittel(basis(9_999)).kantonal).toBe('beschwerde');
    // M1-Fix 6.6.2026: symmetrische Validierung — fehlender Streitwert wirft
    expect(() => bestimmeRechtsmittel(basis(null))).toThrow();
    expect(bestimmeRechtsmittel({ streitsache: 'scheidung', vermoegensrechtlich: false, streitwertCHF: null }).kantonal).toBe('berufung');
    const ip = bestimmeRechtsmittel(basis(5_000, { streitsache: 'ip_wettbewerb' }));
    expect(ip.kantonal).toBe('entfaellt_einzige_instanz');
    expect(ip.bger).toBe('zulaessig'); // Art. 74 Abs. 2 lit. b BGG — streitwertunabhängig
  });
  // ── Rechtsmittel-Umbau 6.6.2026 (Auftrag David; Normen am Cache verifiziert) ──
  it('Defaults erhalten das bisherige Verhalten: Endentscheid/ordentlich/Erstinstanz, 30 Tage MIT Stillstand', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    const r = bestimmeRechtsmittel(basis(20_000));
    expect(r.kantonal).toBe('berufung');
    expect(r.kantonalFrist!.tage).toBe(30);
    expect(r.kantonalFrist!.stillstand).toBe(true);
    expect(r.bgerFrist.tage).toBe(30);
    expect(r.bgerFrist.stillstand).toBe(true);
    expect(r.weichen).toEqual([]);
    expect(r.kognitionHinweis).toBeNull();
  });
  it('summarisches Verfahren: 10 Tage OHNE Stillstand (Art. 314 Abs. 1/321 Abs. 2/145 Abs. 2 lit. b ZPO)', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    const r = bestimmeRechtsmittel(basis(20_000, { rmVerfahren: 'summarisch' }));
    expect(r.kantonalFrist!.tage).toBe(10);
    expect(r.kantonalFrist!.stillstand).toBe(false);
  });
  it('familienrechtliche Summarsache (Art. 314 Abs. 2 ZPO, Rev. 2025): 30 Tage, aber weiterhin OHNE Stillstand', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    const r = bestimmeRechtsmittel({
      streitsache: 'scheidung', vermoegensrechtlich: false, streitwertCHF: null,
      rmVerfahren: 'summarisch', rmFamilienSummarsache: true,
    });
    expect(r.kantonalFrist!.tage).toBe(30);
    expect(r.kantonalFrist!.stillstand).toBe(false);
    expect(r.kantonalFrist!.text).toContain('Art. 314 Abs. 2');
  });
  it('familienrechtliche Summarsache mit Streitwert unter 10\'000 (BESCHWERDE): 10 Tage, Art. 314 Abs. 2 verlängert NICHT (K-1-Fix Bug-Check 6.6.2026)', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    // Erreichbar z.B. bei vermögensrechtlicher Unterhalts-Abänderung < CHF 10'000:
    // Art. 314 Abs. 2 ZPO steht im Berufungs-Abschnitt; die Beschwerdefrist
    // richtet sich nach Art. 321 Abs. 2 ZPO (10 Tage, keine Familien-Ausnahme).
    const r = bestimmeRechtsmittel(basis(5_000, { rmVerfahren: 'summarisch', rmFamilienSummarsache: true }));
    expect(r.kantonal).toBe('beschwerde');
    expect(r.kantonalFrist!.tage).toBe(10);
    expect(r.kantonalFrist!.text).toContain('Art. 321 Abs. 2');
    expect(r.kantonalFrist!.text).toContain('NUR für die Berufung');
    expect(r.kantonalFrist!.stillstand).toBe(false);
  });
  it('Handelsgericht als Vorinstanz: kein kantonales Rechtsmittel, BGer streitwertUNabhängig (Art. 75 Abs. 2 lit. b/74 Abs. 2 lit. b BGG)', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    const r = bestimmeRechtsmittel(basis(5_000, { rmVorinstanz: 'handelsgericht' }));
    expect(r.kantonal).toBe('entfaellt_einzige_instanz');
    expect(r.kantonalFrist).toBeNull();
    expect(r.bger).toBe('zulaessig');
  });
  it('Direktklage (Art. 8 ZPO): kein kantonales Rechtsmittel; BGer nach Streitwert (≥100k ohnehin über der Grenze)', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    const r = bestimmeRechtsmittel(basis(150_000, { rmVorinstanz: 'direktklage_oberes_gericht' }));
    expect(r.kantonal).toBe('entfaellt_einzige_instanz');
    expect(r.bger).toBe('zulaessig');
  });
  it('Direktklage unter CHF 100\'000: Plausibilitäts-Weiche statt stiller Akzeptanz (N-1-Fix)', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    const r = bestimmeRechtsmittel(basis(5_000, { rmVorinstanz: 'direktklage_oberes_gericht' }));
    expect(r.weichen.some((w) => w.includes("Art. 8 Abs. 1 ZPO"))).toBe(true);
    const ok = bestimmeRechtsmittel(basis(150_000, { rmVorinstanz: 'direktklage_oberes_gericht' }));
    expect(ok.weichen.some((w) => w.includes('Art. 8'))).toBe(false);
  });
  it('vorsorgliche Massnahme: kantonal berufungsfähig (Art. 308 Abs. 1 lit. b); BGer OHNE Stillstand (Art. 46 Abs. 2 lit. a) + Art.-98-Kognition', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    const r = bestimmeRechtsmittel(basis(20_000, { rmObjekt: 'vorsorgliche_massnahme' }));
    expect(r.kantonal).toBe('berufung');
    expect(r.bgerFrist.stillstand).toBe(false);
    expect(r.kognitionHinweis).toContain('Art. 98');
  });
  it('prozessleitende Verfügung: nie Berufung, 10 Tage, Art.-319-lit.-b-Weiche offen ausgewiesen', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    const r = bestimmeRechtsmittel(basis(50_000, { rmObjekt: 'prozessleitende_verfuegung' }));
    expect(r.kantonal).toBe('beschwerde');
    expect(r.kantonalFrist!.tage).toBe(10);
    expect(r.weichen.some((w) => w.includes('319'))).toBe(true);
  });
  it('prozessleitende Verfügung am BGer: Art.-93-Vorbehalt statt unbedingter Zulässigkeit (M-1-Fix Bug-Check 6.6.2026)', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    const r = bestimmeRechtsmittel(basis(50_000, { rmObjekt: 'prozessleitende_verfuegung' }));
    expect(r.weichen.some((w) => w.includes('Art. 93 Abs. 1 BGG'))).toBe(true);
    // Unter der BGer-Schwelle bleibt die Weiche weg (wie beim Zwischenentscheid).
    const unterSchwelle = bestimmeRechtsmittel(basis(5_000, { rmObjekt: 'prozessleitende_verfuegung' }));
    expect(unterSchwelle.weichen.some((w) => w.includes('Art. 93'))).toBe(false);
  });
  it('Zwischenentscheid: kantonal wie Endentscheid (Art. 308 Abs. 1 lit. a); BGer-Weiche Art. 92/93 ausgewiesen', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    const r = bestimmeRechtsmittel(basis(50_000, { rmObjekt: 'zwischenentscheid' }));
    expect(r.kantonal).toBe('berufung');
    expect(r.weichen.some((w) => w.includes('Art. 92'))).toBe(true);
  });
  it('BGer-Schwellen: Miete/Arbeit 15k, übrige 30k (Grenzwerte beidseitig)', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    expect(bestimmeRechtsmittel(basis(15_000, { streitsache: 'arbeit' })).bger).toBe('zulaessig');
    expect(bestimmeRechtsmittel(basis(14_999, { streitsache: 'miete_wohn_geschaeft', mieteUnterfall: 'sonstige' })).bger).toBe('schwelle_verfehlt');
    expect(bestimmeRechtsmittel(basis(30_000)).bger).toBe('zulaessig');
    expect(bestimmeRechtsmittel(basis(29_999)).bger).toBe('schwelle_verfehlt');
    expect(bestimmeRechtsmittel(basis(29_999)).bgerText).toContain('grundsätzlicher Bedeutung');
    expect(bestimmeRechtsmittel({ streitsache: 'persoenlichkeit', vermoegensrechtlich: false, streitwertCHF: null }).bger).toBe('zulaessig');
  });
  it('obere Instanzen: alle 26 Kantone mit voller Adresse; Namenslogik-Falle korrekt (GL/SH/AR Obergericht, SG/AI/BL/LU Kantonsgericht)', async () => {
    const { OBERE_INSTANZEN } = await import('../data/obereInstanzen');
    const { KANTONE } = await import('../lib/kantone');
    for (const k of KANTONE) {
      const e = OBERE_INSTANZEN[k];
      expect(e, k).toBeDefined();
      expect(e.plzOrt, k).toMatch(/^\d{4} /);
      expect(e.strasse.length, k).toBeGreaterThan(3);
    }
    for (const k of ['GL', 'SH', 'AR', 'OW', 'NW'] as const) expect(OBERE_INSTANZEN[k].name).toContain('Obergericht');
    for (const k of ['SG', 'AI', 'BL', 'LU'] as const) expect(OBERE_INSTANZEN[k].name).toContain('Kantonsgericht');
    expect(OBERE_INSTANZEN.BS.name).toContain('Appellationsgericht');
    expect(OBERE_INSTANZEN.BE.plzOrt).toBe('3012 Bern');   // Audit-Korrektur (nicht 3001)
    expect(OBERE_INSTANZEN.LU.plzOrt).toBe('6002 Luzern'); // Re-Audit 6.6.: Postadresse
    expect(OBERE_INSTANZEN.GE.name).toContain('Cour de justice');
  });
  // Deklarierte Anpassung 6.6.2026 (Rechtsmittel-Umbau): Die Normen leben jetzt
  // in den STRUKTURIERTEN Frist-Feldern statt in einer Pauschal-Textwand — der
  // Test prüft die je nach Eingabe einschlägige Norm an ihrer neuen Stelle.
  it('Frist-Normen an der richtigen Stelle: 311 (Berufung), 321 (Beschwerde), 314 (summarisch), 100/46 BGG', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    expect(bestimmeRechtsmittel(basis(50_000)).kantonalFrist!.text).toContain('311');
    expect(bestimmeRechtsmittel(basis(5_000)).kantonalFrist!.text).toContain('321');
    expect(bestimmeRechtsmittel(basis(50_000, { rmVerfahren: 'summarisch' })).kantonalFrist!.text).toContain('314');
    const r = bestimmeRechtsmittel(basis(50_000));
    expect(r.bgerFrist.text).toContain('Art. 100 Abs. 1 BGG');
    expect(r.bgerFrist.stillstandText).toContain('Art. 46');
    expect(r.fristHinweis).toContain('Art. 45 Abs. 1 BGG');
  });
});

describe('bestimmeRechtsmittel — Eingabe-Validierung (Bug-Check-Fix 5.6.2026)', () => {
  it('negativer/nicht-finiter Streitwert wirft (wie bestimmeZustaendigkeit)', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    expect(() => bestimmeRechtsmittel({ streitsache: 'geldforderung', vermoegensrechtlich: true, streitwertCHF: -5 })).toThrow();
    expect(() => bestimmeRechtsmittel({ streitsache: 'geldforderung', vermoegensrechtlich: true, streitwertCHF: Number.NaN })).toThrow();
  });
});

describe('Handelsgerichte (Datenschicht, Anordnung 5.6.2026)', () => {
  it('genau 4 Kantone (ZH/BE/AG/SG) mit auditierten Adressen; übrige null', async () => {
    const { HANDELSGERICHTE, HG_KANTONE, handelsgerichtFuer } = await import('../data/handelsgerichte');
    expect(HG_KANTONE.sort()).toEqual(['AG', 'BE', 'SG', 'ZH']);
    expect(HANDELSGERICHTE.ZH?.strasse).toContain('Hirschengraben 15');
    expect(HANDELSGERICHTE.BE?.plzOrt).toBe('3012 Bern');
    expect(HANDELSGERICHTE.AG?.strasse).toContain('Obere Vorstadt 40'); // Re-Audit 6.6.: Nr. 38 = Obergericht
    expect(HANDELSGERICHTE.SG?.strasse).toContain('Klosterhof 1');
    expect(handelsgerichtFuer('LU')).toBeNull();
  });
});

describe('Art.-5-Schwelle (H1-Fix, Semantik-Audit 6.6.2026)', () => {
  it('UWG/Bund ≤30k: KEINE einzige Instanz → Schlichtung + kantonales Rechtsmittel; >30k und unbedingte lit. unverändert', () => {
    const uwgKlein = bestimmeZustaendigkeit({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 20_000, ipUnterfall: 'uwg' });
    expect(uwgKlein.schlichtung.obligatorisch).toBe(true);
    expect(uwgKlein.eingabeArt).toBe('schlichtungsgesuch');
    expect(uwgKlein.warnungen.some((w) => w.includes('KEINE einzige kantonale Instanz'))).toBe(true);
    const rmKlein = bestimmeRechtsmittel({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 20_000, ipUnterfall: 'uwg' });
    expect(rmKlein.kantonal).toBe('berufung');
    expect(rmKlein.bger).toBe('schwelle_verfehlt');
    const uwgGross = bestimmeZustaendigkeit({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 30_001, ipUnterfall: 'uwg' });
    expect(uwgGross.schlichtung.obligatorisch).toBe(false);
    // lit. d Alt. 2: Bund übt Klagerecht aus → einzige Instanz TROTZ ≤30k
    const bundKlage = bestimmeZustaendigkeit({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 5_000, ipUnterfall: 'uwg', bundKlagerecht: true });
    expect(bundKlage.schlichtung.obligatorisch).toBe(false);
    expect(bestimmeRechtsmittel({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 5_000, ipUnterfall: 'uwg', bundKlagerecht: true }).kantonal).toBe('entfaellt_einzige_instanz');
    // lit. f: KEINE Klagerecht-Alternative — bundKlagerecht wirkungslos
    const litF = bestimmeZustaendigkeit({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 5_000, ipUnterfall: 'klage_gegen_bund', bundKlagerecht: true });
    expect(litF.schlichtung.obligatorisch).toBe(true);
    const ip = bestimmeZustaendigkeit({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 5_000 });
    expect(ip.schlichtung.obligatorisch).toBe(false); // lit. a–c unbedingt (Default)
  });
  it('UWG/Bund NICHT vermögensrechtlich: ehrliche Offenlegung statt «Streitwert beziffern» (M-3-Fix Bug-Check 6.6.2026)', () => {
    // Echte nicht vermögensrechtliche Klage (Unterlassung/Beseitigung) hat
    // keinen Streitwert — die Schwellen-Alternative von lit. d/f kann nie
    // erfüllt sein; eine Beziffern-Aufforderung wäre irreführend (§8).
    const uwg = bestimmeZustaendigkeit({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: false, streitwertCHF: null, ipUnterfall: 'uwg' });
    expect(uwg.weichen.some((w) => w.includes('beziffern'))).toBe(false);
    expect(uwg.weichen.some((w) => w.includes('Art. 5 Abs. 1 lit. d') && w.includes('gesondert prüfen'))).toBe(true);
    const bund = bestimmeZustaendigkeit({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: false, streitwertCHF: null, ipUnterfall: 'klage_gegen_bund' });
    expect(bund.weichen.some((w) => w.includes('Art. 5 Abs. 1 lit. f'))).toBe(true);
    expect(bund.weichen.some((w) => w.includes('Klagerecht des Bundes'))).toBe(false); // lit. f kennt keine Bund-Alternative
  });
  it('N1: Konsument-Flag wirkt nur bei geldforderung', () => {
    const d = bestimmeZustaendigkeit({ streitsache: 'delikt', vermoegensrechtlich: true, streitwertCHF: 50_000, konsumentenvertrag: true });
    expect(d.oertlich.normen.some((n) => n.artikel.includes('36'))).toBe(true);
  });
});

describe('Erlass-Links (Anordnung 6.6.2026)', () => {
  it('26 Kantone mit geprüften Schlichtungs- UND Gerichts-URLs (SH seit 6.6. via JG 173.200)', async () => {
    const { ERLASS_LINKS, GEBV_SCHKG_URL } = await import('../data/erlassLinks');
    const { KANTONE } = await import('../lib/kantone');
    for (const k of KANTONE) {
      expect(ERLASS_LINKS[k].schlichtung, k).toMatch(/^https:\/\//);
      expect(ERLASS_LINKS[k].gericht, k).toMatch(/^https:\/\//);
    }
    expect(GEBV_SCHKG_URL).toContain('fedlex.admin.ch');
  });
});

describe('Art.-5-Nachuntersuchung 6.6.2026 (Auftrag David)', () => {
  it('Abs. 2: vorsorgliche Massnahmen vor Rechtshängigkeit → Weiche bei einziger Instanz', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 50_000 });
    expect(r.weichen.some((w) => w.includes('Art. 5 Abs. 2') && w.includes('Rechtshängigkeit'))).toBe(true);
    // und NICHT im ordentlichen Weg (UWG ≤ 30k):
    const o = bestimmeZustaendigkeit({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 10_000, ipUnterfall: 'uwg' });
    expect(o.weichen.some((w) => w.includes('Art. 5 Abs. 2'))).toBe(false);
  });
  it('Weiche zählt die unbedingten lit. e/g–i auf (Katalog-Vollständigkeit)', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 50_000 });
    const w = r.weichen.join('\n');
    expect(w).toContain('Kernenergiehaftpflicht');
    expect(w).toContain('697c');
    expect(w).toContain('FinfraG');
  });
});

describe('Naht-Fix 6.6.2026 — Scheidung × (atypisch) vermögensrechtlich', () => {
  it('keine Art.-8-Direktklage-Weiche im Scheidungsverfahren (Art. 274 ff./23 ZPO)', () => {
    const r = bestimmeZustaendigkeit({ streitsache: 'scheidung', vermoegensrechtlich: true, streitwertCHF: 150_000 });
    expect(r.weichen.some((w) => w.includes('Art. 8 ZPO'))).toBe(false);
    expect(r.verfahrensart).toBe('scheidungsverfahren');
    // Regressionsschutz: bei der Geldforderung feuert sie weiterhin.
    const g = bestimmeZustaendigkeit({ streitsache: 'geldforderung', vermoegensrechtlich: true, streitwertCHF: 150_000 });
    expect(g.weichen.some((w) => w.includes('Art. 8 ZPO'))).toBe(true);
  });
});

describe('Tiefencheck-Fix 6.6.2026 — behoerdeTyp nur bei obligatorischer Schlichtung', () => {
  it('GlG × Scheidung / Miete × Widerklage → behoerdeTyp ordentlich (keine Behörde ohne Schlichtung)', () => {
    const s = bestimmeZustaendigkeit({ streitsache: 'scheidung', vermoegensrechtlich: false, streitwertCHF: null, glgBetroffen: true });
    expect(s.schlichtung.obligatorisch).toBe(false);
    expect(s.schlichtung.behoerdeTyp).toBe('ordentlich');
    const m = bestimmeZustaendigkeit({ streitsache: 'miete_wohn_geschaeft', vermoegensrechtlich: true, streitwertCHF: 5_000, mieteUnterfall: 'kuendigungsschutz', widerklageOderGerichtlicheFrist: true });
    expect(m.schlichtung.behoerdeTyp).toBe('ordentlich');
    // Regressionsschutz: mit obligatorischer Schlichtung bleibt es paritätisch.
    const p = bestimmeZustaendigkeit({ streitsache: 'miete_wohn_geschaeft', vermoegensrechtlich: true, streitwertCHF: 5_000, mieteUnterfall: 'kuendigungsschutz' });
    expect(p.schlichtung.behoerdeTyp).toBe('paritaetisch_miete');
  });
});

describe('Art.-114-Spiegelung 6.6.2026 — Kostenfreiheit Entscheidverfahren (lit. a/c/g)', () => {
  it('GlG → lit. a; Arbeit beidseits der 30k-Schwelle → lit. c; DSG → lit. g; Geldforderung → keine', () => {
    const glg = bestimmeZustaendigkeit({ streitsache: 'geldforderung', vermoegensrechtlich: true, streitwertCHF: 5_000, glgBetroffen: true });
    expect(glg.warnungen.some((w) => w.includes('Art. 114 lit. a'))).toBe(true);
    const a1 = bestimmeZustaendigkeit({ streitsache: 'arbeit', vermoegensrechtlich: true, streitwertCHF: 30_000 });
    expect(a1.warnungen.some((w) => w.includes('Art. 114 lit. c'))).toBe(true);
    const a2 = bestimmeZustaendigkeit({ streitsache: 'arbeit', vermoegensrechtlich: true, streitwertCHF: 30_001 });
    expect(a2.warnungen.some((w) => w.includes('Art. 114 lit. c'))).toBe(false);
    const dsg = bestimmeZustaendigkeit({ streitsache: 'persoenlichkeit', vermoegensrechtlich: false, streitwertCHF: null, persoenlichkeitUnterfall: 'datenschutz' });
    expect(dsg.warnungen.some((w) => w.includes('Art. 114 lit. g'))).toBe(true);
    const g = bestimmeZustaendigkeit({ streitsache: 'geldforderung', vermoegensrechtlich: true, streitwertCHF: 5_000 });
    expect(g.warnungen.some((w) => w.includes('Art. 114'))).toBe(false);
  });
});
