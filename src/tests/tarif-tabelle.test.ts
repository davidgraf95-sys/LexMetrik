import { describe, it, expect } from 'vitest';
import { betragAmAnfang, extrahiereTarifTabelle } from '../../scripts/normtext/tarif-tabelle.ts';

describe('betragAmAnfang', () => {
  it('liest einfache Beträge (em-/en-dash)', () => {
    expect(betragAmAnfang('30.—')).toEqual({ betrag: '30.—', rest: '' });
    expect(betragAmAnfang('150.– bis 2000.–')).toEqual({ betrag: '150.– bis 2000.–', rest: '' });
  });
  it('liest Rappen-Beträge «—.50»', () => {
    expect(betragAmAnfang('—.50')).toEqual({ betrag: '—.50', rest: '' });
  });
  it('liest Rappen-Beträge mit Bindestrich «-.50» (hyphen-rappen)', () => {
    expect(betragAmAnfang('-.50')).toEqual({ betrag: '-.50', rest: '' });
  });
  it('liest «bis»-Spanne und gibt Folgetext als rest', () => {
    expect(betragAmAnfang('100.— bis 1000.— 22.60 Aufsichtsrechtliche Verfügungen'))
      .toEqual({ betrag: '100.— bis 1000.—', rest: '22.60 Aufsichtsrechtliche Verfügungen' });
  });
  it('gibt null bei Nicht-Geld-Anfang', () => {
    expect(betragAmAnfang('Vollmachten und Erklärungen')).toBeNull();
  });
  it('gibt null bei Zahlen ohne Dezimal-Dash (Guard-Test)', () => {
    expect(betragAmAnfang('2 Promille des Erwerbspreises')).toBeNull();
  });
  it('liest reinen Höchstbetrag «bis 500.–» (nur Obergrenze, kein Untergrenzwert)', () => {
    // Vorkommend in SG-Tarifen: «Auskünfte … . . . . bis 500.–»
    expect(betragAmAnfang('bis 500.–')).toEqual({ betrag: 'bis 500.–', rest: '' });
    expect(betragAmAnfang('bis 1000.— Beschreibung Folgezeile')).toEqual({
      betrag: 'bis 1000.—',
      rest: 'Beschreibung Folgezeile',
    });
  });
});

describe('extrahiereTarifTabelle', () => {
  it('Einzelzeile: Beschreibung | Betrag, kein Vortext', () => {
    const r = extrahiereTarifTabelle('Aufsichtsrechtliche Genehmigung . . . . . . . . . 150.— bis 2000.—');
    expect(r).toEqual({
      vortext: '',
      tabelle: [{ beschreibung: 'Aufsichtsrechtliche Genehmigung', betrag: '150.— bis 2000.—' }],
    });
  });

  it('Rappen-Betrag «—.50»', () => {
    const r = extrahiereTarifTabelle('für jede weitere Kopie . . . . . . . . . . —.50');
    expect(r).toEqual({ vortext: '', tabelle: [{ beschreibung: 'für jede weitere Kopie', betrag: '—.50' }] });
  });

  it('Multi-Leader: mehrere verschmolzene Zeilen werden getrennt', () => {
    const r = extrahiereTarifTabelle(
      'Einvernahme . . . . . . . 30.— bis 250.— Augenschein . . . . . . . 150.— bis 3000.—',
    );
    expect(r).toEqual({
      vortext: '',
      tabelle: [
        { beschreibung: 'Einvernahme', betrag: '30.— bis 250.—' },
        { beschreibung: 'Augenschein', betrag: '150.— bis 3000.—' },
      ],
    });
  });

  // DELIBERATE SPEC CHANGE (22.6.2026): Vortext-Heuristik wurde gestrichen.
  // Das «lastIndexOf(":")»-Muster hat 18 Beschreibungen mis-splittet (interne
  // Doppelpunkte wie «Polizeibeamter: je Stunde»). Das keyword-verankerte Muster
  // liefert immer noch 2 Fehlschnitte bei mehrseitigen PDF-Blöcken. Entscheid §1:
  // vortext = '' immer; die Einleitungsphrase bleibt in der ersten beschreibung.
  // Alt: r!.vortext === 'Die Gebühren betragen:' und erster beschr === 'Vorladung'.
  // Neu: vortext === '' und erster beschr === 'Die Gebühren betragen: Vorladung'.
  it('Einleitung mit «:» bleibt ungeteilt in der ersten Beschreibung (kein Vortext mehr)', () => {
    const r = extrahiereTarifTabelle(
      'Die Gebühren betragen: Vorladung . . . . . . . 6.— Mahnung . . . . . . . 10.— bis 50.—',
    );
    expect(r).toEqual({
      vortext: '',
      tabelle: [
        { beschreibung: 'Die Gebühren betragen: Vorladung', betrag: '6.—' },
        { beschreibung: 'Mahnung', betrag: '10.— bis 50.—' },
      ],
    });
  });

  it('kein Leader → null (normaler Absatz unangetastet)', () => {
    expect(extrahiereTarifTabelle('Dieser Erlass regelt die Erhebung der Gebühren.')).toBeNull();
  });

  it('Leader aber kein Betrag danach → null (kein Fehlschnitt)', () => {
    expect(extrahiereTarifTabelle('Siehe Anhang . . . . . . folgende Bestimmungen')).toBeNull();
  });

  // FIX DEFECT 1 (trailing prose, 22.6.2026): Letztes Segment muss reiner Betrag sein.
  // Blocks mit Tarif-Zeilen GEFOLGT VON weiterem Prosatext werden nicht tableisiert
  // (return null) — verhindert stillen Inhaltsverlust (§1).
  it('trailing prose nach letztem Betrag → null (kein stiller Inhaltsverlust)', () => {
    // Realitätsnahes Beispiel: Tarif-Zeile, dann Übergangsbestimmung / nächster Artikel
    expect(
      extrahiereTarifTabelle(
        'Einvernahme . . . . . . 30.— Art. 7 Grundsätze Der Erwerbspreis bestimmt sich nach …',
      ),
    ).toBeNull();
  });

  // FIX DEFECT 2 (interne Doppelpunkte, 22.6.2026): Beschreibungen mit «:» werden
  // nicht mehr gesplittet — kein Mis-Split auf «Polizeibeamter: je Stunde» o.ä.
  it('interner Doppelpunkt in Beschreibung wird NICHT mis-splittet', () => {
    const r = extrahiereTarifTabelle('Polizeibeamter: je Stunde . . . . . . 90.—');
    expect(r).toEqual({
      vortext: '',
      tabelle: [{ beschreibung: 'Polizeibeamter: je Stunde', betrag: '90.—' }],
    });
  });

  // FIX A (22.6.2026): 3-Punkt-Leader «. . .» wird jetzt erkannt (war: ≥4 Punkte).
  // SG-2808 art=10: «122 Prozessleitende Verfügungen (Kollegialgericht) . . . 300.– bis 3000.–»
  // → der 3-Punkt-Leader war bisher unsichtbar, Betrag landete in der Beschreibung.
  it('3-Punkt-Leader «. . .» wird erkannt und splittet korrekt', () => {
    const r = extrahiereTarifTabelle('Vorladung . . . 6.—');
    expect(r).toEqual({
      vortext: '',
      tabelle: [{ beschreibung: 'Vorladung', betrag: '6.—' }],
    });
  });

  // FIX B (22.6.2026): Unvollständig getrennte Blöcke (Betrag gefolgt von Ziffer
  // in der Beschreibung) werden als Plaintext belassen (§1-Safety).
  // Realfall SG-2808 art=10: «112 Prozessleitende Verfügungen 200.– bis 3000.– 12 Kollegialgericht»
  // hat keinen Leader → der Betrag steckt in der Beschreibung. Nach Fix A spaltet
  // das Segment am nächsten 3-Punkt-Leader; die Beschreibung enthält dann
  // «3000.– 12» → INCOMPLETE_SPLIT greift → return null (ganzer Block als Plaintext).
  it('incomplete-split: Betrag gefolgt von Ziffer in beschreibung → null (§1-Safety)', () => {
    const r = extrahiereTarifTabelle(
      '112 Prozessleitende Verfügungen 200.– bis 3000.– 12 Kollegialgericht 121 Endentscheide . . . . 500.– bis 5000.–',
    );
    expect(r).toBeNull();
  });

  // FIX B (22.6.2026): Formel-Beschreibungen mit Betrag gefolgt von BUCHSTABEN
  // («zuzüglich», «im Rahmen von» usw.) dürfen NICHT abgewiesen werden.
  // SG-2935 art=8: «2 Promille des Erwerbspreises bis Fr. 2000000.– zuzüglich 0,5 Promille»
  // → «2000000.–» gefolgt von « zuzüglich» (Buchstabe, kein Digit) → kein INCOMPLETE_SPLIT.
  it('Formel-Beschreibung mit Betrag gefolgt von Buchstabe: NICHT abgewiesen', () => {
    const r = extrahiereTarifTabelle(
      'Eigentum 20.01 2 Promille des Erwerbspreises bis Fr. 2000000.– zuzüglich 0,5 Promille des darüber liegenden Erwerbspreises, im Rahmen von . . . . 200.– bis 10000.–',
    );
    expect(r).not.toBeNull();
    // Der Betrag-Wert muss digits-unverändert sein (§1: Ziffern nie verändern).
    expect(r!.tabelle[r!.tabelle.length - 1].betrag).toBe('200.– bis 10000.–');
  });

  it('interner Doppelpunkt + langer Text bleibt vollständig in beschreibung', () => {
    const r = extrahiereTarifTabelle(
      'Ordnungsdienst bei privaten Veranstaltungen: je Polizeibeamter und halber Tag . . . . . . 200.—',
    );
    expect(r).toEqual({
      vortext: '',
      tabelle: [
        {
          beschreibung: 'Ordnungsdienst bei privaten Veranstaltungen: je Polizeibeamter und halber Tag',
          betrag: '200.—',
        },
      ],
    });
  });

  it('Art.-Verweis mit Doppelpunkt in Beschreibung bleibt ungetrennt', () => {
    // «Errichtung einer Stiftung (Art.81 ZGB): Ansätze …» — war früher Fehlschnitt
    const r = extrahiereTarifTabelle(
      'Errichtung einer Stiftung (Art.81 ZGB): Ansätze je nach Stiftungskapital . . . . . . 500.—',
    );
    expect(r).toEqual({
      vortext: '',
      tabelle: [
        {
          beschreibung: 'Errichtung einer Stiftung (Art.81 ZGB): Ansätze je nach Stiftungskapital',
          betrag: '500.—',
        },
      ],
    });
  });

  // §1-Guard (22.6.2026): Betrag-Wert ohne Dash-Zeichen ist eine Verweis-Nummer,
  // kein CHF-Preis. Solche Blöcke NICHT tableisieren (return null = Plaintext).
  it('§1-Guard: bare-decimal Verweis-Nummer rechts (kein Dash) → null', () => {
    // «1.05» ist eine Positionsnummer / Querverweis-Ziffer, kein Preis.
    expect(
      extrahiereTarifTabelle('Beurkundung von Verträgen siehe Ziffer . . . . . 1.05'),
    ).toBeNull();
  });

  it('§1-Guard: mehrere bare-decimal Verweis-Nummern → null', () => {
    expect(
      extrahiereTarifTabelle('Grundpfandrechte . . . . 3.01 Dienstbarkeiten . . . . 3.02'),
    ).toBeNull();
  });

  it('§1-Guard: echter Dash-Betrag tableisiert weiterhin korrekt', () => {
    const r = extrahiereTarifTabelle('Vorladung . . . 6.—');
    expect(r).toEqual({
      vortext: '',
      tabelle: [{ beschreibung: 'Vorladung', betrag: '6.—' }],
    });
  });
});
