import { describe, expect, it } from 'vitest';
import { bestimmeRechtsmittel, rechtsmittelBericht } from '../lib/zustaendigkeit';
import { bestimmeSchkgZustaendigkeit, schkgZustaendigkeitBericht } from '../lib/schkgZustaendigkeit';
import { bestimmeStrafZustaendigkeit, strafZustaendigkeitBericht } from '../lib/strafZustaendigkeit';
import { bestimmeStrafRechtsmittel, strafRechtsmittelBericht } from '../lib/strafRechtsmittel';

// ─── G3.1 / M-8 (10.6.2026): Berichts-Mapper für den mandatstauglichen
// Output (PDF) der Rechtsmittel-/SchKG-/Straf-Zweige. Die Mapper sind reine
// Abbildungen (§3/§5) — die Tests sichern, dass NICHTS verloren geht:
// Normverweise identisch, Weichen/Warnungen vollständig, Fristen im
// Rechenweg, Verwirkungs-Markierung erhalten.

describe('rechtsmittelBericht (Zivil)', () => {
  it('bildet Weichen+Kognition auf Warnungen, Fristen auf Rechenweg-Schritte ab; Normverweise identisch', () => {
    const r = bestimmeRechtsmittel({
      streitsache: 'geldforderung', vermoegensrechtlich: true, streitwertCHF: 20_000,
      rmObjekt: 'vorsorgliche_massnahme',
    });
    const b = rechtsmittelBericht(r);
    expect(b.normverweise).toEqual(r.normverweise);
    for (const w of r.weichen) expect(b.warnungen).toContain(w);
    if (r.kognitionHinweis) expect(b.warnungen).toContain(r.kognitionHinweis);
    expect(b.annahmen).toEqual([r.fristHinweis]);
    expect(b.rechenweg.some((s) => s.beschreibung === 'Kantonales Rechtsmittel' && s.zwischenergebnis.includes(r.kantonalText))).toBe(true);
    expect(b.rechenweg.some((s) => s.beschreibung === 'Frist (Bundesgericht)' && s.zwischenergebnis.includes(`${r.bgerFrist.tage} Tage`))).toBe(true);
    expect(b.ergebnis).toContain('Berufung');
  });
  it('einzige kantonale Instanz: kein Kantonal-Frist-Schritt, Ergebnis sagt es', () => {
    const r = bestimmeRechtsmittel({ streitsache: 'geldforderung', vermoegensrechtlich: true, streitwertCHF: 50_000, rmVorinstanz: 'handelsgericht' });
    const b = rechtsmittelBericht(r);
    expect(r.kantonalFrist).toBeNull();
    expect(b.rechenweg.some((s) => s.beschreibung === 'Frist (kantonal)')).toBe(false);
    expect(b.ergebnis).toContain('Kein kantonales Rechtsmittel');
  });
});

describe('schkgZustaendigkeitBericht', () => {
  it('Betreibungsort/Forum/Fristen/Fahrplan landen im Rechenweg; Weichen+Warnungen vereint; Normen identisch', () => {
    const r = bestimmeSchkgZustaendigkeit({ anliegen: 'rueckforderung', schuldnerTyp: 'natuerlich_wohnsitz', forderungCHF: 8_000 });
    const b = schkgZustaendigkeitBericht(r);
    expect(b.normverweise).toEqual(r.normverweise);
    expect(b.warnungen).toEqual([...r.weichen, ...r.warnungen]);
    expect(b.rechenweg[0].beschreibung).toBe('Betreibungsort (Wurzelgrösse)');
    expect(b.rechenweg[0].normen).toEqual(r.betreibungsort.normen);
    for (const f of r.fristen) {
      expect(b.rechenweg.some((s) => s.beschreibung.startsWith(`Frist: ${f.label}`) && s.zwischenergebnis.includes(f.frist))).toBe(true);
    }
    const kritische = r.fristen.find((f) => f.kritisch)!;
    expect(b.rechenweg.some((s) => s.beschreibung === `Frist: ${kritische.label} (Verwirkung)`)).toBe(true);
    for (const s of r.fahrplan) {
      expect(b.rechenweg.some((x) => x.beschreibung === s.titel && x.zwischenergebnis === s.text)).toBe(true);
    }
  });
  it('Gebühr Zahlungsbefehl erscheint nur bei Einleitung — mit Art.-16-Norm', () => {
    const mit = schkgZustaendigkeitBericht(bestimmeSchkgZustaendigkeit({ anliegen: 'betreibung_einleiten', schuldnerTyp: 'jur_person_hr', forderungCHF: 50_000 }));
    expect(mit.rechenweg.some((s) => s.beschreibung === 'Gebühr Zahlungsbefehl' && s.normen.some((n) => n.artikel.includes('Art. 16')))).toBe(true);
    const ohne = schkgZustaendigkeitBericht(bestimmeSchkgZustaendigkeit({ anliegen: 'beschwerde_amt', schuldnerTyp: 'natuerlich_wohnsitz' }));
    expect(ohne.rechenweg.some((s) => s.beschreibung === 'Gebühr Zahlungsbefehl')).toBe(false);
  });
});

describe('strafZustaendigkeitBericht / strafRechtsmittelBericht', () => {
  it('Forum+Fristen+Fahrplan im Rechenweg; Weichen+Warnungen vereint; Normen identisch', () => {
    const r = bestimmeStrafZustaendigkeit({ anliegen: 'anzeige', tatort: 'bekannt', antragsdelikt: true });
    const b = strafZustaendigkeitBericht(r);
    expect(b.normverweise).toEqual(r.normverweise);
    expect(b.warnungen).toEqual([...r.weichen, ...r.warnungen]);
    expect(b.rechenweg[0].normen).toEqual(r.forum.normen);
    for (const f of r.fristen) {
      expect(b.rechenweg.some((s) => s.beschreibung.startsWith(`Frist: ${f.label}`))).toBe(true);
    }
  });
  it('Rechtsmittel: statthaft=keines → status unzulaessig, keine Instanz-/Form-Schritte; BGer-Hinweis immer dabei', () => {
    const keines = bestimmeStrafRechtsmittel({ entscheidTyp: 'verfahrensleitend_gericht', werFichtAn: 'beschuldigte_person', anfechtungsziel: 'umfassend' });
    const b = strafRechtsmittelBericht(keines);
    if (keines.statthaft === 'keines') {
      expect(b.status).toBe('unzulaessig');
      expect(b.rechenweg.some((s) => s.beschreibung === 'Instanz')).toBe(false);
    }
    expect(b.rechenweg.at(-1)!.beschreibung).toBe('Weiterzug ans Bundesgericht');
    const berufung = strafRechtsmittelBericht(bestimmeStrafRechtsmittel({ entscheidTyp: 'urteil_erstinstanz', werFichtAn: 'beschuldigte_person', anfechtungsziel: 'umfassend' }));
    expect(berufung.status).toBe('ok');
    expect(berufung.rechenweg.some((s) => s.beschreibung === 'Instanz')).toBe(true);
  });
});

describe('Permalink-Spec-Invariante der Zuständigkeits-Seite', () => {
  it('Kurzparameter sind über alle vier Specs derselben Seite eindeutig (Ausnahme: tan, bewusst geteilt)', async () => {
    const { ZUST_LINK_SPEC, SCHKG_LINK_SPEC, STRAF_LINK_SPEC, STRAF_RM_LINK_SPEC } =
      await import('../components/forms/zustaendigkeitLinkSpecs');
    const alle = [ZUST_LINK_SPEC, SCHKG_LINK_SPEC, STRAF_LINK_SPEC, STRAF_RM_LINK_SPEC]
      .flatMap((spec) => Object.values(spec as Record<string, { p: string }>).map((f) => f.p));
    const erlaubtDoppelt = new Set(['tan']); // Haupt- und RM-Spec teilen die Anliegen-Weiche bewusst
    const gesehen = new Set<string>();
    for (const p of alle) {
      if (gesehen.has(p)) expect(erlaubtDoppelt.has(p), `Permalink-Schlüssel «${p}» doppelt vergeben`).toBe(true);
      gesehen.add(p);
    }
  });
});
