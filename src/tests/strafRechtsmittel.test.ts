import { describe, it, expect } from 'vitest';
import { bestimmeStrafRechtsmittel, type StrafRmInput } from '../lib/strafRechtsmittel';

// Akzeptanztests Straf-Rechtsmittel-Engine (Auftrag David 6.6.2026).
// Grundlage: bibliothek/recherche/stpo-rechtsmittel.md (Decision Tree +
// Konstellationstabelle); Wortlaute am StPO-Cache 1.1.2024 verifiziert.

const base = (over: Partial<StrafRmInput>): StrafRmInput => ({
  entscheidTyp: 'urteil_erstinstanz', werFichtAn: 'beschuldigte_person', ...over,
});

const alleTexte = (r: ReturnType<typeof bestimmeStrafRechtsmittel>) =>
  [r.text, r.kognition ?? '', ...r.warnungen, ...r.weichen, ...r.fristen.map((f) => f.label + ' ' + f.frist)].join('\n');

describe('Legitimations-Gates (Stufe 0)', () => {
  it('K-Gate 1: Privatklägerschaft × nur Sanktion → KEIN Rechtsmittel (382 II)', () => {
    const r = bestimmeStrafRechtsmittel(base({ werFichtAn: 'privatklaegerschaft', anfechtungsziel: 'nur_sanktion' }));
    expect(r.statthaft).toBe('keines');
    expect(r.text).toContain('Art. 382 Abs. 2');
  });
  it('K-Gate 2 (rev. 2024): StA × ZMG-Haftentscheid → KEIN Rechtsmittel (222)', () => {
    const r = bestimmeStrafRechtsmittel(base({ werFichtAn: 'staatsanwaltschaft', entscheidTyp: 'zmg_haftentscheid' }));
    expect(r.statthaft).toBe('keines');
    expect(r.text).toContain('EINZIG die verhaftete Person');
    expect(r.normverweise.some((n) => n.artikel === 'Art. 222 StPO')).toBe(true);
  });
  it('Privatklägerschaft umfassend bleibt legitimiert (382 I als Weiche)', () => {
    const r = bestimmeStrafRechtsmittel(base({ werFichtAn: 'privatklaegerschaft' }));
    expect(r.statthaft).toBe('berufung');
    expect(r.weichen.some((w) => w.includes('RECHTLICH GESCHÜTZTES'))).toBe(true);
  });
  it('Angehörige: 382-III-Weiche (nur nach dem Tod, Erbberechtigungs-Reihenfolge)', () => {
    const r = bestimmeStrafRechtsmittel(base({ werFichtAn: 'angehoerige' }));
    expect(r.weichen.some((w) => w.includes('Art. 382 Abs. 3'))).toBe(true);
  });
});

describe('K1/K2 — Berufung (Urteil 1. Instanz)', () => {
  it('zwei getrennte Fristen: 10 T. Anmeldung (Eröffnung) + 20 T. Erklärung (begründetes Urteil)', () => {
    const r = bestimmeStrafRechtsmittel(base({}));
    expect(r.statthaft).toBe('berufung');
    const anm = r.fristen.find((f) => f.label.includes('ANMELDUNG'))!;
    const erk = r.fristen.find((f) => f.label.includes('ERKLÄRUNG'))!;
    expect(anm.frist).toContain('10 Tage');
    expect(anm.frist).toContain('ERSTINSTANZLICHE');
    expect(anm.norm).toBe('Art. 399 Abs. 1 StPO');
    expect(erk.frist).toContain('20 Tage');
    expect(erk.frist).toContain('begründeten Urteils');
    expect(erk.norm).toBe('Art. 399 Abs. 3 StPO');
    expect(r.weichen.some((w) => w.includes('Art. 394 lit. a'))).toBe(true); // verdrängt Beschwerde
    expect(r.warnungen.some((w) => w.includes('Art. 89 Abs. 2'))).toBe(true); // kein Stillstand
  });
  it('Übertretung → Kognitionsbeschränkung 398 IV (kein Novenrecht)', () => {
    const r = bestimmeStrafRechtsmittel(base({ uebertretung: true }));
    expect(r.kognition).toContain('Art. 398 Abs. 4');
    expect(r.kognition).toContain('EINGESCHRÄNKT');
    const voll = bestimmeStrafRechtsmittel(base({}));
    expect(voll.kognition).toContain('Art. 398 Abs. 2/3');
  });
  it('nur zugunsten → reformatio-in-peius-Weiche (391 II)', () => {
    const r = bestimmeStrafRechtsmittel(base({ nurZugunstenBeschuldigte: true }));
    expect(r.weichen.some((w) => w.includes('Art. 391 Abs. 2'))).toBe(true);
    expect(bestimmeStrafRechtsmittel(base({})).weichen.some((w) => w.includes('391'))).toBe(false);
  });
});

describe('K3–K6 — Beschwerde-Fälle', () => {
  it('K3: Einstellung/Nichtanhandnahme (StA) → Beschwerde 10 T., keine aufschiebende Wirkung', () => {
    const r = bestimmeStrafRechtsmittel(base({ entscheidTyp: 'verfuegung_sta_polizei', werFichtAn: 'privatklaegerschaft' }));
    expect(r.statthaft).toBe('beschwerde');
    expect(r.text).toContain('Art. 310');
    expect(r.fristen[0].norm).toBe('Art. 396 Abs. 1 StPO');
    expect(r.warnungen.some((w) => w.includes('Art. 387'))).toBe(true);
    expect(r.weichen.some((w) => w.includes('Art. 394 lit. b'))).toBe(true); // Beweisantrags-Ausschluss
  });
  it('K4: Beschluss erstinstanzl. Gericht → Beschwerde, volle Kognition (393 II)', () => {
    const r = bestimmeStrafRechtsmittel(base({ entscheidTyp: 'anderer_entscheid_gericht' }));
    expect(r.statthaft).toBe('beschwerde');
    expect(r.kognition).toContain('Art. 393 Abs. 2');
  });
  it('K5: verfahrensleitender Entscheid → KEIN Rechtsmittel (393 I lit. b)', () => {
    const r = bestimmeStrafRechtsmittel(base({ entscheidTyp: 'verfahrensleitend_gericht' }));
    expect(r.statthaft).toBe('keines');
    expect(r.text).toContain('Art. 393 Abs. 1 lit. b');
  });
  it('K6: ZMG-Haft, verhaftete Person → Beschwerde mit 222-Warnung', () => {
    const r = bestimmeStrafRechtsmittel(base({ entscheidTyp: 'zmg_haftentscheid' }));
    expect(r.statthaft).toBe('beschwerde');
    expect(r.warnungen.some((w) => w.includes('EINZIG die verhaftete Person'))).toBe(true);
  });
  it('K7: Haftentscheid im Berufungsverfahren (233) → endgültig, nur BGer', () => {
    const r = bestimmeStrafRechtsmittel(base({ entscheidTyp: 'haftentscheid_berufungsverfahren' }));
    expect(r.statthaft).toBe('keines');
    expect(r.text).toContain('Art. 233');
    expect(r.warnungen.some((w) => w.includes('Art. 46 Abs. 2 BGG'))).toBe(true);
  });
  it('K11: Rechtsverweigerung → Beschwerde FRISTLOS (396 II)', () => {
    const r = bestimmeStrafRechtsmittel(base({ entscheidTyp: 'rechtsverweigerung' }));
    expect(r.statthaft).toBe('beschwerde');
    expect(r.fristen[0].frist).toContain('KEINE FRIST');
    expect(r.fristen[0].kritisch).toBe(false);
  });
  it('Bundesgerichtsbarkeit → Beschwerdekammer BStGer als Instanz', () => {
    const r = bestimmeStrafRechtsmittel(base({ entscheidTyp: 'anderer_entscheid_gericht', bundesgerichtsbarkeit: true }));
    expect(r.instanz).toContain('Bundesstrafgericht');
  });
});

describe('K-ZMG: andere Zwangsmassnahme → Beschwerde (393 ff.), 10-Tage-Verwirkung (396 I), keine Gerichtsferien (89 II) — Testlücken-Schliessung 7.6.2026', () => {
  // Herleitung am Cache /tmp/stpo.html (Stand 1.1.2024):
  // Art. 393 Abs. 1 lit. c: Beschwerde zulässig gegen «die Entscheide des
  //   Zwangsmassnahmengerichts in den in diesem Gesetz vorgesehenen Fällen».
  // Art. 393 Abs. 2: Beschwerdegründe umfassend (Rechtsverletzung inkl.
  //   Ermessen, Sachverhalt, Unangemessenheit).
  // Art. 396 Abs. 1: «Die Beschwerde … ist innert 10 Tagen schriftlich und
  //   begründet bei der Beschwerdeinstanz einzureichen.» → 10-Tage-Frist
  //   (Verwirkung: gesetzliche Frist, nicht erstreckbar, Art. 89 Abs. 1).
  // Art. 89 Abs. 2: «Im Strafverfahren gibt es keine Gerichtsferien.»
  it('Grundfall: Beschwerde an die kantonale Beschwerdeinstanz, Frist-Objekt 10 Tage / Art. 396 Abs. 1 / kritisch', () => {
    const r = bestimmeStrafRechtsmittel(base({ entscheidTyp: 'zmg_andere_zwangsmassnahme' }));
    expect(r.statthaft).toBe('beschwerde');
    expect(r.instanz).toContain('kantonale Beschwerdeinstanz');
    // Frist-Objekt-Inhalt (nicht nur Prosa):
    const f = r.fristen.find((x) => x.norm === 'Art. 396 Abs. 1 StPO')!;
    expect(f).toBeDefined();
    expect(f.frist).toContain('10 Tage');
    expect(f.kritisch).toBe(true);
    // Bezugsnorm der Statthaftigkeit (Art. 393 Abs. 1 lit. c) + volle Kognition.
    expect(r.text).toContain('Art. 393 Abs. 1 lit. c StPO');
    expect(r.kognition).toContain('Art. 393 Abs. 2');
    // KEINE Gerichtsferien (Art. 89 Abs. 2) + keine aufschiebende Wirkung (387).
    expect(r.warnungen.some((w) => w.includes('Art. 89 Abs. 2'))).toBe(true);
    expect(r.warnungen.some((w) => w.includes('Art. 387'))).toBe(true);
  });
  it('Reformatio in peius nur bei «nur zugunsten» (391 II); sonst keine 391-Weiche', () => {
    const zug = bestimmeStrafRechtsmittel(base({ entscheidTyp: 'zmg_andere_zwangsmassnahme', nurZugunstenBeschuldigte: true }));
    expect(zug.weichen.some((w) => w.includes('Art. 391 Abs. 2'))).toBe(true);
    const ohne = bestimmeStrafRechtsmittel(base({ entscheidTyp: 'zmg_andere_zwangsmassnahme' }));
    expect(ohne.weichen.some((w) => w.includes('391'))).toBe(false);
    // Anders als beim Haftentscheid (222) trägt die «andere Zwangsmassnahme»
    // KEINE 222-Beschränkung auf die verhaftete Person.
    expect(ohne.warnungen.some((w) => w.includes('Art. 222'))).toBe(false);
    expect(ohne.normverweise.some((n) => n.artikel === 'Art. 222 StPO')).toBe(false);
  });
});

describe('K8 — Einsprache Strafbefehl', () => {
  it('beschuldigte Person: 10 T., KEINE Begründungspflicht, Rückzugsfiktionen gewarnt', () => {
    const r = bestimmeStrafRechtsmittel(base({ entscheidTyp: 'strafbefehl' }));
    expect(r.statthaft).toBe('einsprache');
    expect(r.fristen[0]).toMatchObject({ norm: 'Art. 354 Abs. 1 StPO', kritisch: true });
    expect(alleTexte(r)).toContain('NICHT begründet');
    expect(r.warnungen.some((w) => w.includes('RÜCKZUGSFIKTION'))).toBe(true);
    expect(r.weichen.some((w) => w.includes('Devolutiveffekt'))).toBe(true);
  });
  it('übrige Berechtigte: Begründungspflicht (354 II)', () => {
    const r = bestimmeStrafRechtsmittel(base({ entscheidTyp: 'strafbefehl', werFichtAn: 'privatklaegerschaft' }));
    expect(r.weichen.some((w) => w.includes('zu BEGRÜNDEN'))).toBe(true);
  });
  it('Privatklägerschaft × nur Sanktion auch beim Strafbefehl gesperrt (354 Ibis)', () => {
    const r = bestimmeStrafRechtsmittel(base({ entscheidTyp: 'strafbefehl', werFichtAn: 'privatklaegerschaft', anfechtungsziel: 'nur_sanktion' }));
    expect(r.statthaft).toBe('keines');
  });
});

describe('K10 — Revision (410/411)', () => {
  it('Noven/Straftat → unbefristet; Widerspruch/EMRK → 90 Tage', () => {
    const noven = bestimmeStrafRechtsmittel(base({ entscheidTyp: 'rechtskraeftiges_urteil', revisionsgrund: 'noven' }));
    expect(noven.statthaft).toBe('revision');
    expect(noven.fristen[0].frist).toContain('KEINE FRIST');
    const wid = bestimmeStrafRechtsmittel(base({ entscheidTyp: 'rechtskraeftiges_urteil', revisionsgrund: 'widerspruch' }));
    expect(wid.fristen[0].frist).toContain('90 Tage');
    expect(wid.fristen[0].kritisch).toBe(true);
    const emrk = bestimmeStrafRechtsmittel(base({ entscheidTyp: 'rechtskraeftiges_urteil', revisionsgrund: 'emrk' }));
    expect(emrk.fristen[0].frist).toContain('90 Tage');
    expect(noven.warnungen.some((w) => w.includes('Art. 410 Abs. 3'))).toBe(true);
  });
});

describe('K12 — BGer-Weiterzug immer als Hinweis', () => {
  it('jedes Ergebnis trägt den 78-ff.-BGG-Block (30 Tage, keine Streitwertgrenze)', () => {
    for (const typ of ['urteil_erstinstanz', 'strafbefehl', 'verfahrensleitend_gericht', 'rechtskraeftiges_urteil'] as const) {
      const r = bestimmeStrafRechtsmittel(base({ entscheidTyp: typ }));
      expect(r.bger.text, typ).toContain('Art. 78 ff. BGG');
      expect(r.bger.text, typ).toContain('30 Tage');
      expect(r.bger.text, typ).toContain('KEINE Streitwertgrenze');
    }
  });
});

describe('Bug-Check-Fix 10.6.2026: Art.-222-Gate für ALLE Nicht-Verhafteten (Haftentscheide ZMG)', () => {
  it('Privatklägerschaft/weitere Partei/Angehörige: statthaft=keines (vorher fälschlich «BESCHWERDE»)', async () => {
    const { bestimmeStrafRechtsmittel } = await import('../lib/strafRechtsmittel');
    for (const wer of ['privatklaegerschaft', 'weitere_partei', 'angehoerige', 'staatsanwaltschaft'] as const) {
      const r = bestimmeStrafRechtsmittel({ entscheidTyp: 'zmg_haftentscheid', werFichtAn: wer, anfechtungsziel: 'umfassend' });
      expect(r.statthaft, wer).toBe('keines');
      expect(r.text, wer).toContain('EINZIG die verhaftete Person');
    }
    const verhaftete = bestimmeStrafRechtsmittel({ entscheidTyp: 'zmg_haftentscheid', werFichtAn: 'beschuldigte_person', anfechtungsziel: 'umfassend' });
    expect(verhaftete.statthaft).toBe('beschwerde');
  });
});
