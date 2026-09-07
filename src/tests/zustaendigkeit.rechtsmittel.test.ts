import { describe, it, expect } from 'vitest';
import {
  bestimmeZustaendigkeit, bestimmeRechtsmittel,
  type ZustaendigkeitInput,
} from '../lib/zustaendigkeit';

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
  it('Familien-Flag mit unplausibler Streitsache (Härtung 10.6.2026): Art. 314 Abs. 2 setzt 271/276/302/305 voraus — Flag wird ignoriert (10 Tage) + erklärende Weiche', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    // arbeit/miete & Co. können begrifflich keine familienrechtliche
    // Streitigkeit nach Art. 271/276/302/305 ZPO sein (Wortlaut am Cache).
    for (const streitsache of ['arbeit', 'miete_wohn_geschaeft', 'erbrecht'] as const) {
      const r = bestimmeRechtsmittel(basis(20_000, { streitsache, rmVerfahren: 'summarisch', rmFamilienSummarsache: true }));
      expect(r.kantonalFrist!.tage, streitsache).toBe(10);
      expect(r.kantonalFrist!.text, streitsache).toContain('Art. 314 Abs. 1');
      expect(r.weichen.some((w) => w.includes('Art. 314 Abs. 2') && w.includes('271')), streitsache).toBe(true);
    }
    // Plausible Streitsachen bleiben unverändert bei 30 Tagen:
    // 'scheidung' (Eheschutz 271 / Massnahmen 276) und 'geldforderung'
    // (Unterhalts-/PartG-Geldsachen 302/305).
    const geld = bestimmeRechtsmittel(basis(20_000, { rmVerfahren: 'summarisch', rmFamilienSummarsache: true }));
    expect(geld.kantonalFrist!.tage).toBe(30);
    expect(geld.weichen.some((w) => w.includes('ausgeschlossen'))).toBe(false);
    // Ohne summarisches Verfahren ändert das Flag nichts und löst KEINE Weiche aus.
    const ord = bestimmeRechtsmittel(basis(20_000, { streitsache: 'arbeit', rmFamilienSummarsache: true }));
    expect(ord.kantonalFrist!.tage).toBe(30);
    expect(ord.weichen.some((w) => w.includes('Art. 314 Abs. 2'))).toBe(false);
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

describe('Bug-Check-Fix 10.6.2026: vorsorgliche Massnahme erzwingt summarisches Verfahren (Art. 248 lit. d ZPO)', () => {
  it('Default-Verfahren: 10 Tage OHNE Stillstand statt 30 MIT (Art. 314 Abs. 1 / 145 Abs. 2 lit. b ZPO)', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    const r = bestimmeRechtsmittel({ streitsache: 'geldforderung', vermoegensrechtlich: true, streitwertCHF: 50_000, rmObjekt: 'vorsorgliche_massnahme' });
    expect(r.kantonal).toBe('berufung'); // Art. 308 Abs. 1 lit. b
    expect(r.kantonalFrist!.tage).toBe(10);
    expect(r.kantonalFrist!.stillstand).toBe(false);
    expect(r.bgerFrist.stillstand).toBe(false); // Art. 46 Abs. 2 lit. a BGG — jetzt konsistent
  });
  it('explizit «ordentlich/vereinfacht» gewählt: wird übersteuert + erklärende Weiche', async () => {
    const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
    const r = bestimmeRechtsmittel({ streitsache: 'geldforderung', vermoegensrechtlich: true, streitwertCHF: 50_000, rmObjekt: 'vorsorgliche_massnahme', rmVerfahren: 'ordentlich_vereinfacht' });
    expect(r.kantonalFrist!.tage).toBe(10);
    expect(r.weichen.some((w) => w.includes('Art. 248 lit. d'))).toBe(true);
  });
});
