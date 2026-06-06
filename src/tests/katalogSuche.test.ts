import { describe, it, expect } from 'vitest';
import { ALLE_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';
import { sucheTrifft, kartePasst, LEERER_FILTER } from '../lib/katalogSuche';

// ─── Suchbegriff-Goldliste (Fahrplan Katalog-UI, Etappe 0.1) ────────────────
//
// Misst die AUFFINDBARKEIT: typische Praxis-Suchbegriffe in drei Klassen
// (Laienbegriff / Fachbegriff / Normzitat) müssen die erwartete VERFÜGBARE
// Karte treffen — gegen dieselbe sucheTrifft()-Logik, die auch die Pro-UI
// nutzt (lib/katalogSuche.ts). Erweiterungen der Liste sind erwünscht;
// Begriffe dürfen nur Karten versprechen, deren Tool den Inhalt wirklich
// abdeckt (§8 — vor Aufnahme am Engine-/Preset-Code verifizieren).

type Goldpaar = [suchbegriff: string, erwarteteId: string];

const LAIE: Goldpaar[] = [
  ['gekündigt', 'kuendigung-sperrfristen'],
  ['schwanger', 'kuendigung-sperrfristen'],
  ['krank', 'lohnfortzahlung'],
  ['Mahnung', 'verzugszins'],
  ['Testament', 'eigenhaendiges-testament'],
  ['Zahlungsbefehl', 'schkg-fristen'],
  ['Untermiete', 'untermietvertrag'],
  ['Pflichtteil', 'erbteilung'],
  ['Probezeit', 'arbeitsvertrag'],
  ['Kaution', 'mietvertrag-wohnen'],
  ['Wohnung kündigen', 'mietrecht'],
];

const FACH: Goldpaar[] = [
  ['Rechtsvorschlag', 'schkg-fristen'],
  ['Rechtsöffnung', 'schkg-zustaendigkeit'],
  ['Sperrfrist', 'kuendigung-sperrfristen'],
  ['Gerichtsferien', 'zpo-fristen'],
  ['Stillstand', 'zpo-fristen'],
  ['Schlichtung', 'schlichtungsgesuch'],
  ['Klagebewilligung', 'schlichtungsgesuch'],
  ['Mängelrüge', 'gewaehrleistung'],
  ['Ausschlagung', 'erbrecht-fristen'],
  ['Arrest', 'schkg-zustaendigkeit'],
  ['Gerichtsstand', 'zustaendigkeit'],
];

const NORM: Goldpaar[] = [
  ['Art. 336c', 'kuendigung-sperrfristen'],
  ['336c', 'kuendigung-sperrfristen'],
  ['Art. 257d', 'mietrecht'],
  ['Art. 266l', 'kuendigung-vermieter'],
  ['Art. 271', 'kuendigung-vermieter'],
  ['Art. 335c', 'arbeitsvertrag'],
  ['Art. 367', 'gewaehrleistung'],
  ['Art. 104', 'verzugszins'],
  ['Art. 202', 'schlichtungsgesuch'],
];

const verfuegbar = ALLE_KARTEN.filter(istVerfuegbar);
const treffer = (q: string) => verfuegbar.filter((k) => sucheTrifft(k, q)).map((k) => k.id);

describe.each([
  ['Laienbegriffe', LAIE],
  ['Fachbegriffe', FACH],
  ['Normzitate', NORM],
])('Suchbegriff-Goldliste: %s', (_klasse, paare) => {
  it.each(paare)('«%s» findet %s', (q, erwartet) => {
    expect(treffer(q), `Suche «${q}»`).toContain(erwartet);
  });
});

describe('Such-Semantik (Verhaltens-Anker der Extraktion)', () => {
  it('leere Suche trifft jede Karte; Filter LEERER_FILTER lässt alles durch', () => {
    ALLE_KARTEN.forEach((k) => {
      expect(sucheTrifft(k, '')).toBe(true);
      expect(kartePasst(k, LEERER_FILTER)).toBe(true);
    });
  });

  it('Normzitate treffen leerzeichen-tolerant («Art.336c» = «Art. 336c»)', () => {
    expect(treffer('Art.336c')).toEqual(treffer('Art. 336c'));
  });

  it('Gross-/Kleinschreibung ist egal', () => {
    expect(treffer('RECHTSVORSCHLAG')).toEqual(treffer('rechtsvorschlag'));
  });

  it('nurVerfuegbar blendet Geplantes aus, ändert Verfügbares nicht', () => {
    const f = { ...LEERER_FILTER, nurVerfuegbar: true };
    const gefiltert = ALLE_KARTEN.filter((k) => kartePasst(k, f));
    expect(gefiltert.every((k) => k.status !== 'geplant')).toBe(true);
    expect(gefiltert.length).toBe(ALLE_KARTEN.filter((k) => k.status !== 'geplant').length);
  });
});
