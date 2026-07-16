import { describe, it, expect } from 'vitest';
import {
  extrahiereStatutRefs,
  extrahiereEntscheidRefs,
  extrahiereFundstellenRefs,
  normalisiereStatut,
  normalisiereDocket,
  INVALID_LAW_CODES,
} from '../lib/rechtsprechung/zitat-extraktion';

/** Kürzel: nur die deduplizierten Normalformen eines Textes. */
const normen = (t: string): string[] => extrahiereStatutRefs(t).map((r) => r.normalisiert);

describe('extrahiereStatutRefs — Gesetzes-Zitate', () => {
  it('mehrteiliges Zitat: Art. 34 Abs. 2 BV → ART.34.ABS.2.BV', () => {
    const refs = extrahiereStatutRefs('Vgl. Art. 34 Abs. 2 BV zur Meinungsfreiheit.');
    expect(refs.length).toBe(1);
    expect(refs[0]).toMatchObject({
      gesetz: 'BV', artikel: '34', absatz: '2', normalisiert: 'ART.34.ABS.2.BV',
    });
    expect(refs[0].raw).toBe('Art. 34 Abs. 2 BV');
  });

  it('Ordinal-Suffix: Art. 52bis OR → ART.52bis.OR (Artikel-Token bewahrt)', () => {
    const refs = extrahiereStatutRefs('Nach Art. 52bis OR gilt das.');
    expect(refs[0].artikel).toBe('52bis');
    expect(refs[0].absatz).toBeNull();
    expect(refs[0].normalisiert).toBe('ART.52bis.OR');
  });

  it('Buchstaben-Suffix: Art. 8a DSG → ART.8a.DSG', () => {
    const refs = extrahiereStatutRefs('Siehe Art. 8a DSG.');
    expect(refs[0].artikel).toBe('8a');
    expect(refs[0].normalisiert).toBe('ART.8a.DSG');
  });

  it('einteiliges Zitat: Art. 8 EMRK → ART.8.EMRK', () => {
    const refs = extrahiereStatutRefs('Art. 8 EMRK schützt das Privatleben.');
    expect(refs[0].normalisiert).toBe('ART.8.EMRK');
    expect(refs[0].absatz).toBeNull();
  });

  it('FR-Variante: art. 8 al. 2 CEDH → ART.8.ABS.2.CEDH', () => {
    const refs = extrahiereStatutRefs("Selon l'art. 8 al. 2 CEDH, ...");
    expect(refs[0].normalisiert).toBe('ART.8.ABS.2.CEDH');
    expect(refs[0].absatz).toBe('2');
  });

  it('IT-Variante: art. 8 cpv. 2 CP → ART.8.ABS.2.CP', () => {
    const refs = extrahiereStatutRefs("Giusta l'art. 8 cpv. 2 CP, ...");
    expect(refs[0].normalisiert).toBe('ART.8.ABS.2.CP');
  });

  it('dedupliziert über die Normalform (erstes Vorkommen bleibt)', () => {
    const refs = extrahiereStatutRefs('Art. 41 OR und nochmals Art. 41 OR.');
    expect(refs.map((r) => r.normalisiert)).toEqual(['ART.41.OR']);
  });

  it('INVALID_LAW_CODES-Filter: klein geschriebenes Stoppwort ist kein Gesetzes-Code', () => {
    // DE «der» und FR «la» dürfen NICHT als Gesetzes-Code gelten (0 Gross → raus).
    expect(extrahiereStatutRefs('Art. 12 der Verordnung')).toEqual([]);
    expect(extrahiereStatutRefs("art. 5 de la loi")).toEqual([]);
    // Zusätzlich: langes Titlecase-Wort (1 Gross, Länge > 3) fällt ebenfalls raus.
    expect(extrahiereStatutRefs('Art. 5 Verfassung')).toEqual([]);
  });

  it('INVALID_LAW_CODES enthält die getunten Stoppwörter (Blockliste-Sonde)', () => {
    expect(INVALID_LAW_CODES.has('DER')).toBe(true);
    expect(INVALID_LAW_CODES.has('LA')).toBe(true);
    expect(INVALID_LAW_CODES.has('ABS')).toBe(true);
    expect(INVALID_LAW_CODES.has('OR')).toBe(false); // echter Gesetzes-Code
    // F2: +NR/+BGE (Struktur-/Entscheid-Marker) +CHF/EUR/USD/GBP/FR/FRS/SFR (Währung).
    expect(INVALID_LAW_CODES.has('NR')).toBe(true);
    expect(INVALID_LAW_CODES.has('BGE')).toBe(true);
    expect(INVALID_LAW_CODES.has('CHF')).toBe(true);
    expect(INVALID_LAW_CODES.size).toBe(160);
  });

  it('IT-Bundesverfassung «Cost.» bleibt trotz Filter erhalten (Bug-Check Z1)', () => {
    const refs = extrahiereStatutRefs("Giusta l'art. 8 Cost. federale, ...");
    expect(refs[0]).toMatchObject({ gesetz: 'COST', artikel: '8', normalisiert: 'ART.8.COST' });
  });
});

describe('extrahiereEntscheidRefs — Entscheid-Zitate', () => {
  it('BGE-Zitat mit Erwägungs-Pinpoint wird bewahrt (F2-V1)', () => {
    // Behavior-Change (deklariert): der Pinpoint «E. 3» wird nicht mehr verworfen.
    expect(extrahiereEntscheidRefs('Vgl. BGE 147 I 268 E. 3.')).toEqual(['BGE 147 I 268 E. 3']);
  });

  it('Aktenzeichen-Zitate werden normalisiert (Trenner → _)', () => {
    expect(extrahiereEntscheidRefs('Urteil 4A_123/2020 vom ...')).toEqual(['4A_123_2020']);
    expect(extrahiereEntscheidRefs('Entscheid VB.2018.00411 des VGer')).toEqual(['VB_2018_00411']);
  });

  it('Bare-BGE-Dedup: «BGE 151 I 62» erzeugt NICHT zusätzlich «151 I 62»', () => {
    expect(extrahiereEntscheidRefs('Wie in BGE 151 I 62 entschieden.')).toEqual(['BGE 151 I 62']);
  });

  it('Bare-BGE ohne vorangehendes «BGE» bleibt als Aktenzeichen erhalten', () => {
    expect(extrahiereEntscheidRefs('Der Verweis 151 I 62 steht allein.')).toEqual(['151 I 62']);
  });

  it('historische BGE-Abteilung «Ia»/«Va» wird erkannt (Bug-Check E2)', () => {
    // F2-V1: der Pinpoint «E. 2» wird nun mitgeführt (deklarierte Änderung).
    expect(extrahiereEntscheidRefs('Vgl. BGE 120 Ia 31 E. 2.')).toEqual(['BGE 120 Ia 31 E. 2']);
    expect(extrahiereEntscheidRefs('Siehe BGE 100 Va 5.')).toEqual(['BGE 100 Va 5']);
  });
});

// ─── F2-Muster-Ausbau (Roadmap W2·7-VZUI): bestätigte Varianten + FP-Linse ────
// Jede Positiv-Gruppe hat ihre aus der adversarialen FP-Linse konstruierten
// Fehltreffer als Negativfälle direkt daneben.

describe('F2-V1 — BGE-Pinpoint (E./Erw./consid.)', () => {
  it('erfasst Dezimal-, Slash-, Bereichs- und Erw.-Formen', () => {
    expect(extrahiereEntscheidRefs('BGE 137 I 305 E. 3.2')).toEqual(['BGE 137 I 305 E. 3.2']);
    expect(extrahiereEntscheidRefs('BGE 143 II 283 E. 1.2.2')).toEqual(['BGE 143 II 283 E. 1.2.2']);
    expect(extrahiereEntscheidRefs('BGE 135 III 1 consid. 1b/gg')).toEqual(['BGE 135 III 1 E. 1b/gg']);
    expect(extrahiereEntscheidRefs('BGE 140 V 2 Erw. 2-4')).toEqual(['BGE 140 V 2 E. 2-4']);
  });
  it('ohne Pinpoint bleibt der Kopf unverändert (Basis-Parität)', () => {
    expect(extrahiereEntscheidRefs('BGE 147 I 268 folgt')).toEqual(['BGE 147 I 268']);
  });
  it('FP-Linse: Datum/Seite nach dem Pinpoint wird NICHT geschluckt', () => {
    expect(extrahiereEntscheidRefs('BGE 137 I 305 E. 3.2.2 vom 4. Mai 2011')).toEqual([
      'BGE 137 I 305 E. 3.2.2',
    ]);
    expect(extrahiereEntscheidRefs('BGE 137 I 305, Urteil vom 4. Mai 2011')).toEqual([
      'BGE 137 I 305',
    ]);
    // 5-stellige «Seite» (existiert real nie): der \b nach der Seite fängt sie ab.
    expect(extrahiereEntscheidRefs('CHF 137 I 30500')).toEqual([]);
  });
});

describe('F2-V2 — verkettete Sub-Marker (lit. + Ziff.)', () => {
  it('«Art. 81 Abs. 1 lit. b Ziff. 5 BGG» → ART.81.ABS.1.BGG', () => {
    expect(normen('Art. 81 Abs. 1 lit. b Ziff. 5 BGG')).toEqual(['ART.81.ABS.1.BGG']);
  });
  it('FP-Linse: «Nr»-Struktur-Marker landet nie als Norm (NR geblockt)', () => {
    expect(normen('gemäss Art. 5 Nr. 3. Weiter')).toEqual([]);
    // BGE als Entscheid-Referenz hinter einer Sub-Kette ist keine Norm.
    expect(normen('Art. 18 Ziff. 19 lit. e BGE 151 II 2')).toEqual([]);
  });
});

describe('F2-V3 — «Nr.» als Untergliederungs-Marker', () => {
  it('«Art. 34 Nr. 3 LugÜ» → ART.34.LUGÜ (kein bogus NR)', () => {
    expect(normen('Art. 34 Nr. 3 LugÜ')).toEqual(['ART.34.LUGÜ']);
  });
});

describe('F2-V4 — kleingeschriebenes «art.» + FR-Kürzel (bereits erfasst)', () => {
  // §7-Abweichung: der Auftrags-Vorschlag verortete die Lücke in der case-
  // sensitiven norm-zitate-RX (validiert UNSERE dt. Vorlagen). Die Verzahnungs-
  // Erkennung (diese Datei) läuft mit `i` und kennt die FR-Kürzel längst — hier
  // als Regressions-Schloss festgeschrieben; der 40-Zeichen-Gap-Linker wird NICHT
  // gebaut (falsches Modul, FP-erzeugend).
  it('erfasst FR-Kürzel klein geschrieben', () => {
    expect(normen("règles du mandat (art. 398 CO).")).toEqual(['ART.398.CO']);
    expect(normen("art. 190 al. 2 LTF")).toEqual(['ART.190.ABS.2.LTF']);
    expect(normen("art. 8 al. 2 CEDH")).toEqual(['ART.8.ABS.2.CEDH']);
    expect(normen("art. 9 Cst")).toEqual(['ART.9.CST']);
  });
});

describe('F2-V5 — Umlaut-/Sonderzeichen-Endung (LugÜ, EPÜ, SDÜ …)', () => {
  it('erfasst das VOLLE Kürzel statt trunkiert', () => {
    expect(normen('Art. 123 Abs. 2 EPÜ')).toEqual(['ART.123.ABS.2.EPÜ']);
    expect(normen('Art. 1 Abs. 1 LugÜ')).toEqual(['ART.1.ABS.1.LUGÜ']);
    expect(normen('Art. 96 SDÜ')).toEqual(['ART.96.SDÜ']);
    expect(normen('Art. 9 VeÜ')).toEqual(['ART.9.VEÜ']);
  });
  it('FP-Linse: gross geschriebene Umlaut-WÖRTER sind kein Code', () => {
    // Umlaut initial/medial → scheitert (Umlaut nur als END-Buchstabe erlaubt).
    expect(normen('Art. 3 ÖFFENTLICH')).toEqual([]);
    expect(normen('Art. 1 KÜNDIGUNG')).toEqual([]);
    expect(normen('Art. 7 VERGÜTUNG')).toEqual([]);
  });
});

describe('F2-V6 — Aufzählungs-/ff.-Liste mit gemeinsamem Code', () => {
  it('«Art. 39 ff., 82 ff. und 90 ff. ATSG» → drei Refs', () => {
    expect(normen('Art. 39 ff., 82 ff. und 90 ff. ATSG')).toEqual([
      'ART.39.ATSG',
      'ART.82.ATSG',
      'ART.90.ATSG',
    ]);
  });
  it('FP-Linse: nacktes «und <Zahl> <Wort>» ohne Code bleibt leer', () => {
    expect(normen('Art. 8 und 12 Personen')).toEqual([]);
    expect(normen('Art. 5, 2016 wurde erlassen')).toEqual([]);
    expect(normen('Art. 90 ff. und 1’200 Franken CHF')).toEqual([]);
  });
});

describe('F2-V7 — ECLI-Zitat', () => {
  it('erfasst EU- und CH-ECLI (Schwanz ohne End-Punkt, keine Doppelung)', () => {
    expect(extrahiereEntscheidRefs('ECLI:EU:C:2019:134')).toEqual(['ECLI:EU:C:2019:134']);
    expect(extrahiereEntscheidRefs('ECLI:EU:C:2019:134. Weiter')).toEqual(['ECLI:EU:C:2019:134']);
    // CH-ECLI: Docket-Schwanz «SK.2025.57» wird NICHT zusätzlich als Aktenzeichen erfasst.
    expect(extrahiereEntscheidRefs('Urteil ECLI:CH:BSTGER:2026:SK.2025.57 vom')).toEqual([
      'ECLI:CH:BSTGER:2026:SK.2025.57',
    ]);
  });
  it('FP-Linse: ohne «ECLI:»-Präfix kein Treffer', () => {
    expect(extrahiereEntscheidRefs('EU:C:2019:134')).toEqual([]);
    expect(extrahiereEntscheidRefs('specli:AB:CDE:2019:134')).toEqual([]);
  });
});

describe('F2-V8 — Mehrfach-Zitat mit gemeinsamem Code (de/fr/it)', () => {
  it('splittet in einen Ref je Artikel', () => {
    expect(normen('Art. 95 und 96 BGG')).toEqual(['ART.95.BGG', 'ART.96.BGG']);
    expect(normen('art. 5 e 9 CO')).toEqual(['ART.5.CO', 'ART.9.CO']);
    expect(normen('art. 34 et 2 CP')).toEqual(['ART.34.CP', 'ART.2.CP']);
    expect(normen('Art. 783 und 854 OR')).toEqual(['ART.783.OR', 'ART.854.OR']);
  });
  it('FP-Linse: Währung/Betrag als Glied+Code wird geblockt', () => {
    expect(normen('Art. 6, 3 CHF 500')).toEqual([]);
    expect(normen('Art. 41 und 500 EUR')).toEqual([]);
    expect(normen('Art. 2 und 3000 CHF')).toEqual([]);
  });
});

describe('F2-V9 — SR-/RS-Fundstellen-Locator', () => {
  it('erfasst SR/RS-Nummern', () => {
    expect(extrahiereFundstellenRefs('gestützt auf SR 830.11')).toEqual(['SR 830.11']);
    expect(extrahiereFundstellenRefs('RS 173.110 et RS 131.231')).toEqual([
      'RS 173.110',
      'RS 131.231',
    ]);
  });
  it('FP-Linse: Ständerat/Datum/Betrag lösen nichts aus', () => {
    expect(extrahiereFundstellenRefs('AB 2007 SR 522 wurde')).toEqual([]);
    expect(extrahiereFundstellenRefs('vom 17. Juni 2016')).toEqual([]);
    // <100 (kein \d{3}-Kern) und Prosa-Kleinschreibung matchen nicht.
    expect(extrahiereFundstellenRefs('sr 12 und die Regel')).toEqual([]);
  });
});

describe('F2-V10 — Bereichs-Zitat (Bindestrich/Halbgeviert)', () => {
  it('bewahrt beide Endpunkte, Norm-Key = Start-Artikel', () => {
    const r = extrahiereStatutRefs('Art. 641-654a ZGB');
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ artikel: '641', artikelBis: '654a', normalisiert: 'ART.641.ZGB' });
    expect(extrahiereStatutRefs('Art. 296–327c ZGB')[0].artikelBis).toBe('327c');
  });
  it('FP-Linse: absteigender «Bereich» (FR-Binnen-Bindestrich) fällt auf Start zurück', () => {
    // «art. 227-23 CP» ist ein FR-Compound-Artikel, kein Bereich 227→23.
    const r = extrahiereStatutRefs('art. 227-23 CP');
    expect(r[0]).toMatchObject({ artikel: '227', artikelBis: null, normalisiert: 'ART.227.CP' });
    expect(extrahiereStatutRefs('Art. 6-1 EMRK')[0].artikelBis).toBeNull();
  });
});

describe('Normalisierungs-Helfer', () => {
  it('normalisiereStatut mit/ohne Absatz', () => {
    expect(normalisiereStatut('34', '2', 'bv')).toBe('ART.34.ABS.2.BV');
    expect(normalisiereStatut('8', null, 'emrk')).toBe('ART.8.EMRK');
  });

  it('normalisiereDocket: BGE-artig behält Spaces, sonst Trenner → _', () => {
    expect(normalisiereDocket('151 I 62')).toBe('151 I 62');
    expect(normalisiereDocket('120 Ia 31')).toBe('120 Ia 31'); // historische Abteilung
    expect(normalisiereDocket('4A_123/2020')).toBe('4A_123_2020');
    expect(normalisiereDocket('1A.122/2005')).toBe('1A_122_2005');
  });
});
