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
});

describe('Rechtsmittel — obere Instanzen (Ausbau 5.6.2026; Art. 308/319 ZPO + Art. 74 BGG verbatim)', () => {
  const basis = (sw: number | null, extra: Partial<ZustaendigkeitInput> = {}): ZustaendigkeitInput => ({
    streitsache: 'geldforderung', vermoegensrechtlich: true, streitwertCHF: sw, ...extra,
  });
  it('kantonal: ≥10k Berufung · <10k Beschwerde · ohne SW offen · nicht vermögensrechtlich Berufung · Art. 5 entfällt', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    expect(bestimmeRechtsmittel(basis(10_000)).kantonal).toBe('berufung');
    expect(bestimmeRechtsmittel(basis(9_999)).kantonal).toBe('beschwerde');
    expect(bestimmeRechtsmittel(basis(null)).kantonal).toBe('offen');
    expect(bestimmeRechtsmittel({ streitsache: 'scheidung', vermoegensrechtlich: false, streitwertCHF: null }).kantonal).toBe('berufung');
    const ip = bestimmeRechtsmittel(basis(5_000, { streitsache: 'ip_wettbewerb' }));
    expect(ip.kantonal).toBe('entfaellt_einzige_instanz');
    expect(ip.bger).toBe('zulaessig'); // Art. 74 Abs. 2 lit. b BGG — streitwertunabhängig
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
    expect(OBERE_INSTANZEN.LU.plzOrt).toBe('6003 Luzern'); // Audit-Korrektur (nicht 6002)
    expect(OBERE_INSTANZEN.GE.name).toContain('Cour de justice');
  });
  it('Fristen-Hinweis trägt die verifizierten Normen (311/314/321 ZPO, 100/46 BGG)', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    const fh = bestimmeRechtsmittel(basis(50_000)).fristHinweis;
    for (const n of ['311', '314', '321', '100', '46']) expect(fh).toContain(n);
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
    expect(HANDELSGERICHTE.AG?.strasse).toContain('Obere Vorstadt 38');
    expect(HANDELSGERICHTE.SG?.strasse).toContain('Klosterhof 1');
    expect(handelsgerichtFuer('LU')).toBeNull();
  });
});

describe('Art.-5-Schwelle (H1-Fix, Semantik-Audit 6.6.2026)', () => {
  it('UWG/Bund ≤30k: KEINE einzige Instanz → Schlichtung + kantonales Rechtsmittel; >30k und unbedingte lit. unverändert', () => {
    const uwgKlein = bestimmeZustaendigkeit({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 20_000, ipUnterfall: 'uwg_oder_bund' });
    expect(uwgKlein.schlichtung.obligatorisch).toBe(true);
    expect(uwgKlein.eingabeArt).toBe('schlichtungsgesuch');
    expect(uwgKlein.warnungen.some((w) => w.includes('KEINE einzige kantonale Instanz'))).toBe(true);
    const rmKlein = bestimmeRechtsmittel({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 20_000, ipUnterfall: 'uwg_oder_bund' });
    expect(rmKlein.kantonal).toBe('berufung');
    expect(rmKlein.bger).toBe('schwelle_verfehlt');
    const uwgGross = bestimmeZustaendigkeit({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 30_001, ipUnterfall: 'uwg_oder_bund' });
    expect(uwgGross.schlichtung.obligatorisch).toBe(false);
    const ip = bestimmeZustaendigkeit({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 5_000 });
    expect(ip.schlichtung.obligatorisch).toBe(false); // lit. a–c unbedingt (Default)
  });
  it('N1: Konsument-Flag wirkt nur bei geldforderung', () => {
    const d = bestimmeZustaendigkeit({ streitsache: 'delikt', vermoegensrechtlich: true, streitwertCHF: 50_000, konsumentenvertrag: true });
    expect(d.oertlich.normen.some((n) => n.artikel.includes('36'))).toBe(true);
  });
});

describe('Erlass-Links (Anordnung 6.6.2026)', () => {
  it('26 Kantone mit geprüfter Schlichtungs-URL; SH-Gericht ehrlich null; nur https', async () => {
    const { ERLASS_LINKS, GEBV_SCHKG_URL } = await import('../data/erlassLinks');
    const { KANTONE } = await import('../lib/kantone');
    for (const k of KANTONE) {
      expect(ERLASS_LINKS[k].schlichtung, k).toMatch(/^https:\/\//);
      if (k !== 'SH') expect(ERLASS_LINKS[k].gericht, k).toMatch(/^https:\/\//);
    }
    expect(ERLASS_LINKS.SH.gericht).toBeNull();
    expect(GEBV_SCHKG_URL).toContain('fedlex.admin.ch');
  });
});
