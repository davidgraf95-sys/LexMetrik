import { describe, it, expect } from 'vitest';
import {
  keDokumentmappe,
  keVerfallDatum,
  pruefeKeGates,
  KE_DEFAULTS,
  type KeAntworten,
} from '../lib/vorlagen/kapitalerhoehung';

// ─── Akzeptanztests Kapitalerhöhung (Plan 9c, 7.6.2026) ──────────────────────
// Wortlaut-Erwartungen aus bibliothek/recherche/kapitalerhoehung-wortlaute.md.

const AG: KeAntworten = {
  ...KE_DEFAULTS,
  rechtsform: 'ag',
  firma: 'Muster Holding AG',
  sitz: 'Zürich',
  kanton: 'ZH',
  bisherigesKapitalChf: "100'000",
  bisherigeAnzahl: '100',
  nennwertChf: "1'000",
  anzahlNeue: '50',
  ausgabebetragChf: "1'200",     // Agio CHF 200
  statutenArtikelNr: '3',
  gvDatum: '2026-06-01',
  zeichner: [
    { name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '30', bereitsBeteiligt: true },
    { name: 'Beat Beispiel', angaben: 'von Bern, in Bern', anzahl: '20', bereitsBeteiligt: true },
  ],
  bankName: 'Zürcher Kantonalbank',
  bankOrt: 'Zürich',
  berichtUnterzeichner: 'Anna Muster',
  vorsitzName: 'Anna Muster',
  ort: 'Zürich',
  datum: '2026-06-07',
};

const GMBH: KeAntworten = {
  ...AG,
  rechtsform: 'gmbh',
  firma: 'Muster Treuhand GmbH',
  bisherigesKapitalChf: "20'000",
  bisherigeAnzahl: '20',
  anzahlNeue: '10',
  ausgabebetragChf: "1'000",
  zeichner: [
    { name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '5', bereitsBeteiligt: true },
    { name: 'Clara Neu', angaben: 'von Chur, in Chur', anzahl: '5', bereitsBeteiligt: false },
  ],
  statutKlauseln: ['vorkaufsrecht'],
};

const text = (m: ReturnType<typeof keDokumentmappe>, id: string) => {
  const d = m.dokumente.find((x) => x.id === id || x.id.startsWith(id));
  expect(d, `Dokument ${id} fehlt (vorhanden: ${m.dokumente.map((x) => x.id).join(', ')})`).toBeDefined();
  return d!.ergebnis.dokument.absaetze.map((a) => `${a.ueberschrift ?? ''}\n${a.text}`).join('\n');
};

describe('Kapitalerhöhung AG — Dokumente + Beträge', () => {
  it('5 Dokumente; GV-Beschluss mit Beträgen, 6-Monats-Verfall und Bezugsrechts-Satz', () => {
    const m = keDokumentmappe(AG);
    expect(m.gates.blocker).toEqual([]);
    expect(m.dokumente.map((d) => d.id)).toEqual([
      'gv-beschluss', 'zeichnungsschein-0', 'zeichnungsschein-1', 'bericht', 'feststellungen', 'hr-anmeldung',
    ]);
    const gv = text(m, 'gv-beschluss');
    expect(gv).toContain("von bisher CHF 100'000.00 wird um CHF 50'000.00 auf neu CHF 150'000.00 erhöht");
    expect(gv).toContain("Der Ausgabebetrag beträgt CHF 1'200.00 je Aktie");
    expect(gv).toContain('innerhalb von sechs Monaten durchzuführen');
    expect(gv).toContain('so fällt der heutige Beschluss dahin');
    expect(gv).toContain('Bezugsrecht der bisherigen Aktionärinnen und Aktionäre wird weder eingeschränkt noch aufgehoben');
  });

  it('Zeichnungsschein: ZH-Kern + Bezugnahme GV- UND VR-Beschluss + persönliche Einzahlung (Agio)', () => {
    const m = keDokumentmappe(AG);
    const z = text(m, 'zeichnungsschein-0');
    expect(z).toContain('Unter Bezugnahme auf den Beschluss der Generalversammlung der Muster Holding AG');
    expect(z).toContain('vom 1. Juni 2026');
    expect(z).toContain('sowie auf den entsprechenden Beschluss des Verwaltungsrates');
    expect(z).toContain('30 Namenaktien zu CHF 1\'000.00');
    expect(z).toContain("verpflichte mich bedingungslos zur Leistung von insgesamt CHF 36'000.00"); // 30 × 1'200
    expect(z).toContain('endet nach Ablauf von drei Monaten'); // Usanz-Klausel an
    const ohne = keDokumentmappe({ ...AG, befristungsKlausel: false });
    expect(text(ohne, 'zeichnungsschein-0')).not.toContain('drei Monaten');
  });

  it('Bericht: Bar-Rechenschaft mit Gesamt-Ausgabebetrag; Feststellungen: 5 Ziffern + Statutenformel', () => {
    const m = keDokumentmappe(AG);
    const b = text(m, 'bericht');
    expect(b).toContain('im Sinne von Art. 652e OR');
    expect(b).toContain("Der gesamte Ausgabebetrag von CHF 60'000.00"); // 50 × 1'200
    expect(b).toContain('Bezugsrecht wurde weder eingeschränkt noch aufgehoben');
    const f = text(m, 'feststellungen');
    expect(f).toContain('sämtliche neu ausgegebenen Namenaktien gültig gezeichnet sind');
    expect(f).toContain('die Belege, die der Kapitalerhöhung zugrunde liegen, vorgelegen haben');
    expect(f).toContain('Art. 3 der Statuten erhält folgende Fassung');
    expect(f).toContain("«Das Aktienkapital beträgt CHF 150'000.00. Es ist eingeteilt in 150 Namenaktien zu CHF 1'000.00. Die Aktien sind vollständig liberiert.»");
    expect(f).toContain('Im Übrigen gelten die bisherigen Statutenbestimmungen unverändert weiter.');
    expect(f).toContain('bestätigt im Sinne von Art. 652g Abs. 2 OR');
  });

  it('HR-Anmeldung: Belege lit. a–d (Bank in Urkunde → ohne lit. e), mit Bescheinigung bei Abwahl', () => {
    const mit = text(keDokumentmappe(AG), 'hr-anmeldung');
    expect(mit).toContain('Öffentliche Urkunde über den Beschluss der Generalversammlung (lit. a)');
    expect(mit).toContain('Kapitalerhöhungsbericht, unterzeichnet (lit. d)');
    expect(mit).not.toContain('Bankbescheinigung');
    const ohneBank = text(keDokumentmappe({ ...AG, bankInUrkundeGenannt: false }), 'hr-anmeldung');
    expect(ohneBank).toContain('Bankbescheinigung über die Hinterlegung der Einlagen (lit. e)');
  });
});

describe('Kapitalerhöhung GmbH — 781-Kette + 777a-Hinweis', () => {
  it('GmbH-Normketten und Organbezeichnungen', () => {
    const m = keDokumentmappe(GMBH);
    expect(m.gates.blocker).toEqual([]);
    const b = text(m, 'bericht');
    expect(b).toContain('im Sinne von Art. 781 Abs. 5 Ziff. 4 OR i. V. m. Art. 652e OR');
    expect(b).toContain('Die Geschäftsführung der Muster Treuhand GmbH');
    const gv = text(m, 'gv-beschluss');
    expect(gv).toContain('Stammkapital');
    expect(gv).toContain('Stammanteile zu je CHF');
    const f = text(m, 'feststellungen');
    expect(f).toContain('sämtliche neu ausgegebenen Stammanteile gültig gezeichnet sind');
    // GmbH-Statutenformel ohne AG-Liberierungssatz
    expect(f).not.toContain('vollständig liberiert');
  });

  it('777a-II-Hinweis NUR im Zeichnungsschein der NEUEN Gesellschafterin (781 III)', () => {
    const m = keDokumentmappe(GMBH);
    const alt = text(m, 'zeichnungsschein-0');   // Anna, bereits beteiligt
    const neu = text(m, 'zeichnungsschein-1');   // Clara, neu
    expect(alt).not.toContain('Art. 777a Abs. 2 OR');
    expect(neu).toContain('Art. 777a Abs. 2 OR');
    expect(neu).toContain('– Vorhand-, Vorkaufs- und Kaufsrechte');
  });

  it('Warnung, wenn neue Zeichner erfasst, aber keine Klauseln angegeben sind', () => {
    const g = pruefeKeGates({ ...GMBH, statutKlauseln: [] });
    expect(g.blocker).toEqual([]);
    expect(g.warnungen.join(' ')).toContain('Art. 777a Abs. 2');
  });
});

describe('keVerfallDatum — 6-Monats-Frist (Monatsfrist-Konvention Art. 77 I Ziff. 3 OR)', () => {
  it('entsprechender Tag im 6. Folgemonat; fehlt er, der Monatsletzte; ungültig → null', () => {
    expect(keVerfallDatum('2026-06-01')).toBe('2026-12-01');
    expect(keVerfallDatum('2026-08-31')).toBe('2027-02-28'); // 31.2. existiert nicht → Monatsletzter
    expect(keVerfallDatum('2027-08-31')).toBe('2028-02-29'); // Schaltjahr
    expect(keVerfallDatum('2026-02-30')).toBeNull();         // kein reales Datum
    expect(keVerfallDatum('')).toBeNull();
  });
  it('zeitzonenfest: rein lokale Arithmetik (Bug-Check 7.6.2026 HOCH-1)', () => {
    // Der frühere Date.UTC→addMonths(lokal)→toISOString(UTC)-Mix ergab in
    // Europe/Zurich für den 15.1. den 14.7. und westlich von UTC für den
    // 31.3. den 1.10. — die Erwartungswerte hier gelten in JEDER Zeitzone.
    expect(keVerfallDatum('2026-01-15')).toBe('2026-07-15');
    expect(keVerfallDatum('2026-03-31')).toBe('2026-09-30'); // 31.9. existiert nicht → Monatsletzter
  });
  it('GV-Beschluss-ENTWURF nennt das berechnete «spätestens»-Datum', () => {
    const t = keDokumentmappe(AG).dokumente.find((d) => d.id === 'gv-beschluss')!
      .ergebnis.dokument.absaetze.map((a) => a.text).join('\n');
    expect(t).toContain('(d. h. spätestens am 1. Dezember 2026)'); // GV 1.6.2026 + 6 Monate
  });
});

describe('Kapitalerhöhung — Gates', () => {
  it('Erstausbau-Sperren: Sacheinlage/EK-Umwandlung/Bezugsrechts-Entzug/Fremdwährung', () => {
    expect(pruefeKeGates({ ...AG, einlageArt: 'sacheinlage' }).blocker.join(' ')).toContain('BAREINLAGE');
    expect(pruefeKeGates({ ...AG, einlageArt: 'eigenkapital' }).blocker.join(' ')).toContain('BAREINLAGE');
    expect(pruefeKeGates({ ...AG, bezugsrechtGewahrt: false }).blocker.join(' ')).toContain('Art. 652b');
    expect(pruefeKeGates({ ...AG, fremdwaehrung: true }).blocker.join(' ')).toContain('CHF');
  });

  it('Einzel-Zeichnungen nur als positive ganze Zahl (Review M-1: keine «3.5 Namenaktien»)', () => {
    const bruch = pruefeKeGates({
      ...AG,
      zeichner: [
        { name: 'A', angaben: '', anzahl: '3.5', bereitsBeteiligt: true },
        { name: 'B', angaben: '', anzahl: '46.5', bereitsBeteiligt: true },
      ],
    });
    expect(bruch.blocker.join(' ')).toContain('positive ganze Zahl');
    const negativ = pruefeKeGates({
      ...AG,
      zeichner: [
        { name: 'A', angaben: '', anzahl: '-5', bereitsBeteiligt: true },
        { name: 'B', angaben: '', anzahl: '55', bereitsBeteiligt: true },
      ],
    });
    expect(negativ.blocker.join(' ')).toContain('positive ganze Zahl');
  });

  it('Arithmetik: Unter-pari gesperrt; Zeichnungs-Summe; bisheriges Kapital konsistent; GV-Datum Pflicht', () => {
    expect(pruefeKeGates({ ...AG, ausgabebetragChf: '999' }).blocker.join(' ')).toContain('Unter-pari');
    expect(pruefeKeGates({ ...AG, zeichner: [{ name: 'A', angaben: '', anzahl: '49', bereitsBeteiligt: true }] }).blocker.join(' ')).toContain('Art. 652g Abs. 1 Ziff. 1');
    expect(pruefeKeGates({ ...AG, bisherigeAnzahl: '99' }).blocker.join(' ')).toContain('Rechnerische Unstimmigkeit');
    expect(pruefeKeGates({ ...AG, gvDatum: '' }).blocker.join(' ')).toContain('SECHS MONATEN');
  });

  it('Formstufen: Beschluss/Feststellungen = entwurf; Schein/Bericht/Anmeldung = fertig', () => {
    const m = keDokumentmappe(AG);
    const art = Object.fromEntries(m.dokumente.map((d) => [d.id, d.ergebnis.dokument.ausgabeArt]));
    expect(art['gv-beschluss']).toBe('entwurf');
    expect(art['feststellungen']).toBe('entwurf');
    expect(art['zeichnungsschein-0']).toBe('fertig');
    expect(art['bericht']).toBe('fertig');
    expect(art['hr-anmeldung']).toBe('fertig');
  });
});
