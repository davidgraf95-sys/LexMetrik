import { describe, it, expect } from 'vitest';
import {
  bestimmeSchkgZustaendigkeit, gebuehrZahlungsbefehl,
  type SchkgInput,
} from '../lib/schkgZustaendigkeit';

// Akzeptanztests SchKG-Engine (Anordnung David 5.6.2026, «analog Zivilrecht»).
// Grundlage: bibliothek/normen/schkg-zustaendigkeit-regelwerk.md (verbatim am
// Cache Stand 1.1.2025; 20/20 Stichproben substanziell bestätigt) + GebV SchKG
// Art. 16 (Stand 1.1.2022; Vorbehalt AS 2025 630).

const basis = (extra: Partial<SchkgInput> = {}): SchkgInput => ({
  anliegen: 'betreibung_einleiten', schuldnerTyp: 'natuerlich_wohnsitz', ...extra,
});

describe('Betreibungsort-Kaskade (Art. 46–55)', () => {
  it('Grundsatz Wohnsitz/Sitz; Sonderorte 48/49/50', () => {
    expect(bestimmeSchkgZustaendigkeit(basis()).betreibungsort.text).toContain('WOHNSITZ');
    expect(bestimmeSchkgZustaendigkeit(basis({ schuldnerTyp: 'jur_person_hr' })).betreibungsort.text).toContain('SITZ');
    expect(bestimmeSchkgZustaendigkeit(basis({ schuldnerTyp: 'natuerlich_ohne_wohnsitz' })).betreibungsort.text).toContain('AUFENTHALTSORT');
    expect(bestimmeSchkgZustaendigkeit(basis({ schuldnerTyp: 'erbschaft' })).betreibungsort.normen[0].artikel).toBe('Art. 49 SchKG');
    expect(bestimmeSchkgZustaendigkeit(basis({ schuldnerTyp: 'ausland_niederlassung' })).betreibungsort.text).toContain('NIEDERLASSUNG');
    const stwe = bestimmeSchkgZustaendigkeit(basis({ schuldnerTyp: 'stockwerkeigentuemer' }));
    expect(stwe.betreibungsort.text).toContain('GELEGENEN SACHE');
    expect(stwe.betreibungsort.normen[0].artikel).toBe('Art. 46 Abs. 4 SchKG');
    expect(bestimmeSchkgZustaendigkeit(basis({ schuldnerTyp: 'erbschaft' })).warnungen.some((w) => w.includes('Stockwerk'))).toBe(false);
  });
  it('Grundpfand ZWINGEND am Ort des Grundstücks (kein Wahlrecht); Faustpfand mit Wahl', () => {
    const gp = bestimmeSchkgZustaendigkeit(basis({ pfand: 'grundpfand' }));
    expect(gp.betreibungsort.text).toContain('ZWINGEND');
    expect(gp.betreibungsort.normen[0].artikel).toBe('Art. 51 Abs. 2 SchKG');
    const fp = bestimmeSchkgZustaendigkeit(basis({ pfand: 'faustpfand' }));
    expect(fp.betreibungsort.text).toContain('nach Wahl');
  });
  it('Arrest: zusätzlicher Wahl-Ort + Warnung Konkurs nur am ordentlichen Ort (Art. 52 Satz 2)', () => {
    const r = bestimmeSchkgZustaendigkeit(basis({ arrestGelegt: true }));
    expect(r.betreibungsort.text).toContain('Arrestgegenstand');
    expect(r.warnungen.some((w) => w.includes('Art. 52 Satz 2'))).toBe(true);
  });
  it('perpetuatio (Art. 53) steht immer als Weiche', () => {
    expect(bestimmeSchkgZustaendigkeit(basis()).weichen.some((w) => w.includes('Art. 53'))).toBe(true);
  });
});

describe('Foren + Fristen je Anliegen (Synthese-Tabelle)', () => {
  it('Einleitung → Betreibungsamt; Rechtsvorschlag 10 T; Fortsetzung 20 T/1 J mit Stillstand-Hinweis', () => {
    const r = bestimmeSchkgZustaendigkeit(basis({ forderungCHF: 12_000 }));
    expect(r.forum.stelle).toContain('Betreibungsamt');
    expect(r.fristen.find((f) => f.norm.includes('74'))?.frist).toContain('10 Tage');
    expect(r.fristen.find((f) => f.norm.includes('88'))?.frist).toContain('still');
    expect(r.fahrplan.length).toBeGreaterThanOrEqual(4);
  });
  it('Rechtsöffnung: Gericht des Betreibungsortes, summarisch ohne Stillstand; provisorisch trägt 20-T-Aberkennungs-Weiche', () => {
    const r = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'rechtsoeffnung', rechtsoeffnungArt: 'provisorisch' }));
    expect(r.forum.normen.map((n) => n.artikel)).toContain('Art. 84 SchKG');
    expect(r.eingabe.verfahren).toContain('KEIN Gerichtsferien-Stillstand');
    expect(r.fristen[0]).toMatchObject({ kritisch: true });
    expect(r.fristen[0].frist).toContain('20 Tage');
    const def = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'rechtsoeffnung', rechtsoeffnungArt: 'definitiv' }));
    expect(def.fristen.some((f) => f.norm.includes('83'))).toBe(false);
  });
  it('Aberkennung: Betreibungsort + 20 T kritisch + keine Schlichtung; Anerkennung: ZPO-Forum (KEIN SchKG-Forum)', () => {
    const ab = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'aberkennungsklage' }));
    expect(ab.forum.stelle).toContain('Betreibungsortes');
    expect(ab.eingabe.verfahren).toContain('KEINE Schlichtung');
    const an = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'anerkennungsklage' }));
    expect(an.forum.stelle).toContain('KEIN SchKG-Forum');
    expect(an.forum.normen.map((n) => n.artikel)).toContain('Art. 10 ZPO');
  });
  it('Widerspruch: alle vier Konstellationen mit korrektem Forum (107/108/109)', () => {
    const f = (k: SchkgInput['widerspruchKonstellation']) =>
      bestimmeSchkgZustaendigkeit(basis({ anliegen: 'widerspruch', widerspruchKonstellation: k })).forum.stelle;
    expect(f('gewahrsam_schuldner')).toContain('Betreibungsortes');
    expect(f('gewahrsam_dritter_ch')).toContain('Wohnsitz der beklagten');
    expect(f('gewahrsam_dritter_ausland')).toContain('Betreibungsortes');
    expect(f('grundstueck')).toContain('Grundstück');
  });
  it('Widerspruch: Frist-Norm je Konstellation differenziert — 107 V (Dritter) vs. 108 II (Gläubiger/Schuldner) vs. Grundbuch-Weiche (M-4-Fix Bug-Check 6.6.2026)', () => {
    const fristNorm = (k: SchkgInput['widerspruchKonstellation']) =>
      bestimmeSchkgZustaendigkeit(basis({ anliegen: 'widerspruch', widerspruchKonstellation: k })).fristen[0].norm;
    expect(fristNorm('gewahrsam_schuldner')).toBe('Art. 107 Abs. 5 SchKG');
    expect(fristNorm('gewahrsam_dritter_ch')).toBe('Art. 108 Abs. 2 SchKG');
    expect(fristNorm('gewahrsam_dritter_ausland')).toBe('Art. 108 Abs. 2 SchKG');
    expect(fristNorm('grundstueck')).toContain('je nach Grundbuch-Eintrag');
    // Frist bleibt überall 20 Tage und kritisch (nur die Norm war unpräzis).
    const w = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'widerspruch', widerspruchKonstellation: 'gewahrsam_dritter_ch' }));
    expect(w.fristen[0].frist).toContain('20 Tage');
    expect(w.fristen[0].kritisch).toBe(true);
  });
  it('Kollokation: Pfändung→Betreibungsort (148) / Konkurs→Konkursort (250), je 20 T', () => {
    const pf = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'kollokation', kollokationIn: 'pfaendung' }));
    expect(pf.forum.normen[0].artikel).toBe('Art. 148 SchKG');
    const ko = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'kollokation', kollokationIn: 'konkurs' }));
    expect(ko.forum.normen[0].artikel).toBe('Art. 250 SchKG');
    expect(ko.fristen[0].frist).toContain('Auflage');
  });
  it('Arrest: Wahlforum + Einsprache 10 T + Prosequierung; Konkursbegehren: 20 T/15 Mt. mit Stillstand; Beschwerde: AUFSICHTSBEHÖRDE 10 T + Art.-22-Weiche', () => {
    const ar = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'arrest' }));
    expect(ar.forum.stelle).toContain('Wahl');
    expect(ar.fristen.filter((f) => f.kritisch).length).toBe(4); // 278 + 279 Abs. 1/2/3 (Stufe-2-Fix 6.6.2026)
    const kb = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'konkursbegehren' }));
    expect(kb.fristen.find((f) => f.norm.includes('166 Abs. 2'))?.frist).toContain('15 Monate');
    const be = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'beschwerde_amt' }));
    expect(be.forum.stelle).toContain('AUFSICHTSBEHÖRDE');
    expect(be.weichen.some((w) => w.includes('Art. 22'))).toBe(true);
  });
  it('Konkursbegehren gegen Nicht-HR-Schuldnertypen: Art.-39-Warnung (Pfändung statt Konkurs, Art. 42) — M-5-Fix Bug-Check 6.6.2026', () => {
    // Natürliche Person, Erbschaft, Stockwerkeigentümer etc.: Konkursbetreibung
    // nur bei HR-Eintrag (Art. 39 Abs. 1), sonst Pfändung (Art. 42 Abs. 1).
    for (const typ of ['natuerlich_wohnsitz', 'natuerlich_ohne_wohnsitz', 'jur_person_nicht_hr', 'erbschaft', 'stockwerkeigentuemer', 'ausland_niederlassung'] as const) {
      const r = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'konkursbegehren', schuldnerTyp: typ }));
      expect(r.warnungen.some((w) => w.includes('Art. 39 Abs. 1 SchKG') && w.includes('PFÄNDUNG'))).toBe(true);
    }
    // Im HR eingetragene juristische Person: keine Warnung nötig.
    const hr = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'konkursbegehren', schuldnerTyp: 'jur_person_hr' }));
    expect(hr.warnungen.some((w) => w.includes('Art. 39'))).toBe(false);
  });
});

describe('Gebühr Zahlungsbefehl (Art. 16 GebV SchKG, Stand 1.1.2022)', () => {
  it('Staffel wörtlich inkl. Bandgrenzen beidseitig', () => {
    expect(gebuehrZahlungsbefehl(100).gebuehrCHF).toBe(7);
    expect(gebuehrZahlungsbefehl(100.01).gebuehrCHF).toBe(20);
    expect(gebuehrZahlungsbefehl(500).gebuehrCHF).toBe(20);
    expect(gebuehrZahlungsbefehl(1_000).gebuehrCHF).toBe(40);
    expect(gebuehrZahlungsbefehl(10_000).gebuehrCHF).toBe(60);
    expect(gebuehrZahlungsbefehl(100_000).gebuehrCHF).toBe(90);
    expect(gebuehrZahlungsbefehl(1_000_000).gebuehrCHF).toBe(190);
    expect(gebuehrZahlungsbefehl(1_000_001).gebuehrCHF).toBe(400);
    expect(() => gebuehrZahlungsbefehl(-1)).toThrow();
    expect(() => gebuehrZahlungsbefehl(Number.NaN)).toThrow();
  });
  it('Determinismus: identische Eingabe → identisches Ergebnis-Objekt', () => {
    expect(bestimmeSchkgZustaendigkeit(basis({ forderungCHF: 5_000 })))
      .toEqual(bestimmeSchkgZustaendigkeit(basis({ forderungCHF: 5_000 })));
  });
});

describe('SchKG-Teil — SSR-Integration', () => {
  it('Rechner rendert mit aktivem SchKG-Rechtsweg (Smoke deckt die Seite ab)', async () => {
    const { SchkgZustaendigkeitTeil } = await import('../components/forms/SchkgZustaendigkeitTeil');
    const { renderToString } = await import('react-dom/server');
    const { createElement } = await import('react');
    const html = renderToString(createElement(SchkgZustaendigkeitTeil));
    expect(html).toContain('Betreibung einleiten');
    expect(html).toContain('Ihr Fahrplan');
    expect(html).toContain('Betreibungsort');
    // Behörden-Audit 6.6.2026: BJ-eSchKG-Verzeichnis liefert 404 → EasyGov (SECO).
    expect(html).toContain('easygov.swiss');
  });
});

describe('Schlichtungs-Ausnahmen + Verfahren (Abschluss-Review-Fix 6.6.2026)', () => {
  it('korrekte Ziffern des Art. 198 lit. e (Widerspruch Ziff. 3, Kollokation Ziff. 6); kein «beschleunigtes Verfahren»', () => {
    const w = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'widerspruch' }));
    expect(w.eingabe.verfahren).toContain('Ziff. 3');
    expect(w.eingabe.verfahren).not.toContain('eschleunigt');
    const k = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'kollokation' }));
    expect(k.eingabe.verfahren).toContain('Ziff. 6');
    const a = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'arrest' }));
    expect(a.fristen.find((f) => f.norm.includes('279 Abs. 1'))?.frist).toBe('10 Tage ab Zustellung der Arresturkunde');
    expect(a.fristen.some((f) => f.norm.includes('279 Abs. 3'))).toBe(true);
  });
});

describe('Logik-Sweep-Fix 6.6.2026: Konkursbegehren ⊥ Arrest-Wahlort', () => {
  it('Konkursbegehren bietet den Arrest-Wahlort NICHT an (Art. 52 Satz 2), klärt aber auf', () => {
    const r = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'konkursbegehren', arrestGelegt: true }));
    expect(r.betreibungsort.text).not.toContain('WAHLWEISE');
    expect(r.warnungen.some((w) => w.includes('AUSSCHLIESSLICH der ordentliche Betreibungsort'))).toBe(true);
    // andere Anliegen behalten den Wahlort
    const e = bestimmeSchkgZustaendigkeit(basis({ anliegen: 'betreibung_einleiten', arrestGelegt: true }));
    expect(e.betreibungsort.text).toContain('WAHLWEISE');
  });
});
