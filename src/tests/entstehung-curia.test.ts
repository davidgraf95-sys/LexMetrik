// E4 «Entstehung am Artikel» (§11.4/§11.6/§11.8): Parlaments-Etappen aus Curia Vista.
//
// Die drei Sätze, die hier fachlich falsch werden können und darum Tests haben:
//  · Personendaten dürfen weder gespeichert NOCH ABGEFRAGT werden (§11.8, Entscheid
//    David 11.9.2026 Nr. 2) — geprüft wird die $select-Liste des Generators, nicht nur
//    das Ergebnis.
//  · Ein unbekannter Decision-Code darf nie in einen Sammeltopf fallen (§2, Kritik A18).
//  · Für den Ständerat wird nie eine Stimmenzahl behauptet (Entscheid Nr. 3): `Voting`
//    hat kein Council-Feld, der Rat ist nur über die Grösse plausibel.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  odataZeilen, odataDatum, aggregiereStimmen, ratAusGroesse, DECISION_CODES,
  baueKommissionen, baueBeschluesse, bauePublikationen, schlussabstimmungsVotes,
  serialisiereShard, curiaUrl, VERBOTENE_FELDER, SCHLUSSABSTIMMUNG_RE,
  type CuriaShard, type OdataZeile,
} from '../../scripts/entstehung/curia';

describe('OData-Hülle und Datumsform', () => {
  it('akzeptiert beide live belegten Antwortformen', () => {
    expect(odataZeilen({ d: [{ a: 1 }] })).toEqual([{ a: 1 }]);
    expect(odataZeilen({ d: { results: [{ a: 1 }] } })).toEqual([{ a: 1 }]);
  });

  it('wirft bei unerwarteter Form, statt sie als «keine Treffer» zu lesen (§6.7 lit. b)', () => {
    expect(() => odataZeilen({ value: [] })).toThrow(/unerwartete OData-Antwortform/);
    expect(() => odataZeilen({ d: { x: 1 } })).toThrow(/unerwartete OData-Antwortform/);
  });

  it('wandelt /Date(ms)/ nach ISO und rät nie', () => {
    expect(odataDatum('/Date(1505433600000)/')).toBe('2017-09-15');
    expect(odataDatum('/Date(1538092800000)/')).toBe('2018-09-28');
    expect(odataDatum('2017-09-15')).toBeNull();
    expect(odataDatum(null)).toBeNull();
  });
});

describe('Decision-Codes — feste, live belegte Tabelle (Kritik A18)', () => {
  it('deckt genau die acht am 11.9.2026 belegten Codes ab', () => {
    expect(Object.keys(DECISION_CODES).map(Number).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(DECISION_CODES[3].amtlich).toBe('Enthaltung');
    expect(DECISION_CODES[4].amtlich).toBe('Anwesend');
  });

  it('aggregiert die DSG-Schlussabstimmung (25.9.2020) summenrein', () => {
    const z: OdataZeile[] = [
      ...Array.from({ length: 141 }, () => ({ Decision: 1 })),
      ...Array.from({ length: 54 }, () => ({ Decision: 2 })),
      { Decision: 3 }, { Decision: 5 }, { Decision: 5 }, { Decision: 6 }, { Decision: 7 },
    ];
    const a = aggregiereStimmen(z);
    expect(a.ja).toBe(141);
    expect(a.nein).toBe(54);
    expect(a.enthaltung).toBe(1);
    expect(a.total).toBe(200);
    const summe = a.ja + a.nein + a.enthaltung + a.anwesend + a.nichtTeilgenommen
      + a.entschuldigt + a.praesidiumStimmtNicht + a.demissioniert;
    expect(summe).toBe(a.total);
  });

  it('macht einen unbekannten Code ROT, statt ihn zu verbuchen (§2)', () => {
    expect(() => aggregiereStimmen([{ Decision: 9, DecisionText: 'Neu' }]))
      .toThrow(/unbekannter Voting.Decision-Code 9/);
  });
});

describe('Ratszuordnung — nie eine Ständerats-Zahl behaupten (Entscheid Nr. 3)', () => {
  it('nennt den Nationalrat nur bei plausibler NR-Grösse', () => {
    expect(ratAusGroesse(200)).toBe('Nationalrat');
    expect(ratAusGroesse(199)).toBe('Nationalrat');
    expect(ratAusGroesse(46)).toBeNull();
    expect(ratAusGroesse(0)).toBeNull();
    expect(ratAusGroesse(240)).toBeNull();
  });
});

describe('Schlussabstimmung sprachübergreifend erkennen (R4 §2: Subject ist nicht sprachrein)', () => {
  it('trifft DE, FR und IT', () => {
    for (const s of ['Schlussabstimmung', 'Vote final', 'Votazione finale']) {
      expect(SCHLUSSABSTIMMUNG_RE.test(s)).toBe(true);
    }
    expect(SCHLUSSABSTIMMUNG_RE.test('Abstimmung über den Ordnungsantrag')).toBe(false);
  });

  it('dedupliziert und sortiert die Vote-IDs deterministisch', () => {
    const v = schlussabstimmungsVotes([
      { ID: 25260, Subject: 'Vote final', VoteEnd: '/Date(1601026593318)/', BillNumber: 3 },
      { ID: 21464, Subject: 'Schlussabstimmung', VoteEnd: '/Date(1538130211542)/', BillNumber: 1 },
      { ID: 21464, Subject: 'Schlussabstimmung', VoteEnd: '/Date(1538130211542)/', BillNumber: 1 },
      { ID: 30000, Subject: 'Gesamtabstimmung', VoteEnd: '/Date(1538130211542)/', BillNumber: 1 },
    ]);
    expect(v.map((x) => x.id)).toEqual([21464, 25260]);
    expect(v[0].datum).toBe('2018-09-28');
  });
});

describe('Parse-Funktionen — deterministisch und wörtlich (Curia-Auflage)', () => {
  it('Kommissionen: Organ, nie Person; dedupliziert und sortiert', () => {
    const k = baueKommissionen([
      { CommitteeName: 'Staatspolitische Kommission Ständerat', Abbreviation1: 'SPK-S', PreconsultationDate: '/Date(1505433600000)/' },
      { CommitteeName: 'Staatspolitische Kommission Nationalrat', Abbreviation1: 'SPK-N', PreconsultationDate: '/Date(1505433600000)/' },
      { CommitteeName: 'Staatspolitische Kommission Nationalrat', Abbreviation1: 'SPK-N', PreconsultationDate: '/Date(1505433600000)/' },
    ]);
    expect(k.map((x) => x.kuerzel)).toEqual(['SPK-N', 'SPK-S']);
    expect(Object.keys(k[0]).sort()).toEqual(['datum', 'kuerzel', 'name']);
  });

  it('Beschlüsse: ResolutionText wörtlich, Vorlage über die Bill-Zuordnung', () => {
    const b = baueBeschluesse(
      [{ ResolutionText: 'Beschluss abweichend vom Entwurf', ResolutionDate: '/Date(1528761600000)/', CouncilName: 'Nationalrat', CouncilAbbreviation: 'NR', IdBill: 'x' }],
      new Map([['x', 1]]),
    );
    expect(b).toEqual([{ datum: '2018-06-12', rat: 'Nationalrat', ratKuerzel: 'NR', text: 'Beschluss abweichend vom Entwurf', vorlage: 1 }]);
  });

  it('Publikationen: der literale String «null» zählt als fehlender Wert, nie als Text', () => {
    const p = bauePublikationen([{
      PublicationDate: '/Date(1565913600000)/', PublicationTypeName: 'Bundesblatt',
      PublicationYear: 'null', PublicationNumber: 'null', ReferenceText: 'Entwurf der SPK-N',
      ReferendumDeadline: null,
    }]);
    expect(p[0].jahr).toBeNull();
    expect(p[0].nummer).toBeNull();
    expect(p[0].text).toBe('Entwurf der SPK-N');
  });

  it('baut den amtlichen Deep-Link aus der Geschäftsnummer', () => {
    expect(curiaUrl('17.059')).toContain('AffairId=20170059');
    expect(curiaUrl('1999.093')).toContain('AffairId=19990093');
    expect(curiaUrl('kaputt')).toBeNull();
  });
});

describe('Personendaten-Grenze (§11.8) — im Generator, nicht erst im Artefakt', () => {
  const runner = readFileSync('scripts/entstehung/curia-run.ts', 'utf8');

  it('die Voting-Abfrage holt genau IdVote, Decision, DecisionText', () => {
    expect(runner).toContain("'IdVote,Decision,DecisionText'");
  });

  it('nennt kein verbotenes Feld in irgendeiner $select-Liste', () => {
    for (const feld of VERBOTENE_FELDER) {
      expect(runner.includes(`,${feld}`)).toBe(false);
      expect(runner.includes(`'${feld}`)).toBe(false);
    }
  });

  it('der Shard-Typ selbst führt kein Personenfeld', () => {
    const shard: CuriaShard = {
      nummer: '17.059', titel: null, geschaeftstyp: null, status: null, eingereicht: null,
      erstrat: null, quelleUrl: 'x', quellenangabe: 'Parlamentsdienste der Bundesversammlung, Bern',
      abgerufen: '2026-09-11', kommissionen: [], beschluesse: [], publikationen: [], schlussabstimmungen: [],
    };
    const roh = serialisiereShard(shard);
    for (const feld of VERBOTENE_FELDER) expect(roh).not.toContain(`"${feld}"`);
    expect(roh.endsWith('\n')).toBe(true);
  });
});
