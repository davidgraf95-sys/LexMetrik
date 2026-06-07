import { describe, it, expect } from 'vitest';
import { pruefeFormulierung, FLOSKELN } from '../lib/konventionen';
import { ALLE_KARTEN } from '../lib/startseiteConfig';

// Stufe-4-Linter des Formulierungs-Auftrags (5.6.2026): prüft die ECHTE
// Textausgabe der Plattform (Vorlagen-Dokumente, Engine-Rechenwege/Hinweise,
// Katalog-Texte) gegen die verbindliche Konvention.

function alleTexte(x: unknown, pfad: string, sammel: [string, string][]): void {
  if (typeof x === 'string') { sammel.push([x, pfad]); return; }
  if (Array.isArray(x)) { x.forEach((v, i) => alleTexte(v, `${pfad}[${i}]`, sammel)); return; }
  if (x && typeof x === 'object') {
    for (const [k, v] of Object.entries(x)) alleTexte(v, `${pfad}.${k}`, sammel);
  }
}

function pruefeAlles(wert: unknown, kontext: string): string[] {
  const texte: [string, string][] = [];
  alleTexte(wert, kontext, texte);
  return texte.flatMap(([t, p]) => pruefeFormulierung(t, p)).map((v) => `${v.regel} @ ${v.fundstelle}`);
}

describe('Formulierungskonvention – Linter über die echte Textausgabe', () => {
  it('Floskel-Templates entsprechen dem Standard', () => {
    expect(FLOSKELN.zins(5, '1. Januar 2014')).toBe('nebst Zins zu 5 % seit 1. Januar 2014');
    expect(FLOSKELN.kostenfolge()).toContain('zulasten der beklagten Partei');
    expect(pruefeFormulierung('CHF 50\'000 nebst Zins zu 5 % seit 13. August 2024')).toEqual([]);
    expect(pruefeFormulierung('5% Zins')).toHaveLength(1);
    expect(pruefeFormulierung('Art.221 ZPO')).toHaveLength(1);
    expect(pruefeFormulierung('gemäß Vertrag')).toHaveLength(1);
    expect(pruefeFormulierung('Text \u2014 mit Geviertstrich')).toHaveLength(1);
    expect(pruefeFormulierung('— klagende Partei —')).toEqual([]); // Rubrum-Zier bleibt erlaubt
  });

  it('Vorlagen-Dokumente (alle 6) sind konventionskonform', async () => {
    const { testamentZusammenstellen, TESTAMENT_DEFAULTS } = await import('../lib/vorlagen/testament');
    const { pvZusammenstellen, PV_DEFAULTS } = await import('../lib/vorlagen/patientenverfuegung');
    const { vaZusammenstellen, VA_DEFAULTS } = await import('../lib/vorlagen/vorsorgeauftrag');
    const { sgZusammenstellen, SG_DEFAULTS, SG_PERSON_NATUERLICH } = await import('../lib/vorlagen/schlichtungsgesuchBs');
    const { avZusammenstellen, AV_DEFAULTS, pruefeAvGates } = await import('../lib/vorlagen/arbeitsvertrag');
    const { mvZusammenstellen, MV_DEFAULTS, pruefeMvGates } = await import('../lib/vorlagen/mietvertrag');

    const faelle: [string, unknown][] = [
      ['testament', testamentZusammenstellen({ ...TESTAMENT_DEFAULTS, vorname: 'A', nachname: 'B', geburtsdatum: '1960-01-01', heimatort: 'Basel', adresse: 'X 1', erben: [{ name: 'E', angaben: 'g', quoteProzent: 100 }], vermaechtnisse: [], datumErrichtung: '2026-06-05' }).dokument],
      ['pv', pvZusammenstellen({ ...PV_DEFAULTS, vorname: 'A', name: 'B', geburtsdatum: '1960-01-01', wohnort: 'Basel', ziel: 'palliativ', situationen: ['terminal'], organspende: 'ja' }).dokument],
      ['va', vaZusammenstellen({ ...VA_DEFAULTS, volljaehrig: true, urteilsfaehigBestaetigt: true, keineUmfassendeBeistandschaft: true, vorname: 'A', nachname: 'B', geburtsdatum: '1960-01-01', heimatort: 'Basel', adresse: 'X', beauftragte: [{ name: 'C', angaben: 'g', typ: 'natuerlich', bereiche: ['personensorge'] }], datum: '2026-06-05' }).dokument],
      ['sg', sgZusammenstellen({ ...SG_DEFAULTS, streitgegenstandTyp: 'geldforderung', klaeger: [{ ...SG_PERSON_NATUERLICH, vorname: 'A', name: 'B', strasse: 'S 1', plz: '4051', ort: 'Basel' }], beklagte: [{ ...SG_PERSON_NATUERLICH, vorname: 'C', name: 'D', strasse: 'S 2', plz: '4052', ort: 'Basel' }], geld: { betrag: '12000', zins: { satz: '5', abDatum: '2026-01-01' } }, streitgegenstand: 'F', datum: '2026-06-15', ort: 'Basel' }).dokument],
      ['av', avZusammenstellen({ ...AV_DEFAULTS, arbeitgeberName: 'AG', arbeitgeberAdresse: 'X', arbeitnehmerVorname: 'A', arbeitnehmerName: 'B', arbeitnehmerAdresse: 'Y', funktion: 'F', arbeitsort: 'Basel', beginn: '2026-08-01', lohnBetrag: '6500', konkurrenzverbot: true, kvEinblickBestaetigt: true, kvGegenstand: 'T', kvOrt: 'BS', kvDauerMonate: 12, kvKonventionalstrafeCHF: '20000', kvKarenz: true, kvKarenzCHFProMonat: '2000', ort: 'Basel', datum: '2026-06-15' }).dokument],
      ['mv', mvZusammenstellen({ ...MV_DEFAULTS, vermieterName: 'V', vermieterAdresse: 'X', mieterName: 'M', mieterAdresse: 'Y', objektBeschrieb: 'Z', objektAdresse: 'A', beginn: '2026-10-01', mietzinsNettoCHF: '2000', nebenkostenCHF: '250', nkPositionen: ['Heizung'], kautionCHF: '6000', ort: 'Basel', datum: '2026-06-15' }).dokument],
      ['av-gates', pruefeAvGates({ ...AV_DEFAULTS, arbeitgeberName: 'AG', arbeitgeberAdresse: 'X', arbeitnehmerVorname: 'A', arbeitnehmerName: 'B', arbeitnehmerAdresse: 'Y', funktion: 'F', arbeitsort: 'Basel', arbeitsortKanton: 'BS', beginn: '2026-08-01', lohnBetrag: '6500', lohnfortzahlung: 'ktg', ktgWartefristTage: 60, ktgWartefristLohnProzent: 0, ort: 'Basel', datum: '2026-06-15' })],
      ['mv-gates', pruefeMvGates({ ...MV_DEFAULTS, vermieterName: 'V', vermieterAdresse: 'X', mieterName: 'M', mieterAdresse: 'Y', objektBeschrieb: 'Z', objektAdresse: 'A', kanton: 'BE', beginn: '2026-10-01', mietzinsNettoCHF: '2000', nkPositionen: ['Heizung'], kautionCHF: '9000', ort: 'Basel', datum: '2026-06-15' })],
    ];

    // GmbH-Dokumentmappe (9b, 7.6.2026): Maximal-Konfiguration → alle Schemas
    // und alle bedingten Bausteine laufen durch den Linter.
    const { gmbhDokumentmappe, GMBH_DOK_DEFAULTS } = await import('../lib/vorlagen/gruendungGmbhDokumente');
    const gmbhMappe = gmbhDokumentmappe({
      einlageArt: 'bar', besondereVorteile: false, gfGewaehlt: true,
      mehrereGeschaeftsfuehrer: true, weitereVertretungsberechtigte: true,
      optingOut: false, eigeneBueros: false, immobilienHauptzweck: false,
      auslJurPersonGesellschafter: false, fremdwaehrung: false,
      bankInUrkundeGenannt: false, chWohnsitzVertretung: true,
      statutKlauseln: ['nachschuss', 'nebenleistung', 'konkurrenzverbot', 'vorkaufsrecht', 'stimmrechtNachAnteilen', 'vetorecht'],
      leistungenChf: undefined,
      ...GMBH_DOK_DEFAULTS,
      firma: 'Muster GmbH', sitz: 'Zürich', kanton: 'ZH', zweck: 'Treuhand',
      stammkapitalChf: "20'000", anzahlAnteile: '20', nennwertChf: "1'000",
      gruender: [{ name: 'A', angaben: 'von Basel, in Zürich', anzahl: '20' }],
      geschaeftsfuehrer: [
        { name: 'A', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'W 1', vorsitz: true, zeichnungsArt: 'einzelunterschrift' },
        { name: 'B', herkunft: 'Bern', wohnort: 'Bern', adresse: 'W 2', vorsitz: false, zeichnungsArt: 'kollektivzuzweien' },
      ],
      weitereVertretungen: [{ name: 'C', funktion: 'Direktorin', zeichnungsArt: 'kollektivzuzweien' }],
      domizilhalterName: 'D AG', domizilhalterAdresse: 'X 1, 8000 Zürich',
      revisionsstelleName: 'R AG', revisionsstelleSitz: 'Zürich',
      nachschussBetragChf: "1'000", nebenleistungText: 'Lieferpflicht gemäss Reglement',
      vetoBeschluesse: 'Statutenänderungen', virtuelleGv: true,
      ort: 'Zürich', datum: '2026-06-15',
    });
    expect(gmbhMappe.gates.blocker).toEqual([]);
    for (const d of gmbhMappe.dokumente) faelle.push([`gmbh-dok-${d.id}`, d.ergebnis.dokument]);

    // AG-Dokumentmappe (9b + Etappe 0): Teilliberierung + Vinkulierung + c/o +
    // RS (inkl. RS-Wahlannahme) + weitere Zeichnungsberechtigte (Kollektiv-
    // prokura) + VR ohne Zeichnungsberechtigung + Nachtragsvollmacht +
    // Sitzungszeiten → alle Schemas und bedingten PLURAL-Bausteine.
    const { agDokumentmappe, AG_DOK_DEFAULTS } = await import('../lib/vorlagen/gruendungAgDokumente');
    const agMappe = agDokumentmappe({
      einlageArt: 'bar', besondereVorteile: false, optingOut: false,
      eigeneBueros: false, immobilienHauptzweck: false, inhaberaktien: false,
      fremdwaehrung: false, bankInUrkundeGenannt: false, chWohnsitzVertretung: true,
      leistungenChf: undefined,
      ...AG_DOK_DEFAULTS,
      firma: 'Muster AG', sitz: 'Zürich', kanton: 'ZH', zweck: 'Beteiligungen',
      aktienkapitalChf: "200'000", anzahlAktien: '200', nennwertChf: "1'000",
      liberierungProzent: '25',
      gruender: [
        { name: 'A', angaben: 'von Basel, in Zürich', anzahl: '150' },
        { name: 'B', angaben: 'von Bern, in Bern', anzahl: '50' },
      ],
      verwaltungsraete: [
        { name: 'A', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'W 1', praesident: true, zeichnungsArt: 'einzelunterschrift' },
        { name: 'B', herkunft: 'Bern', wohnort: 'Bern', adresse: 'W 2', praesident: false, zeichnungsArt: 'ohne' },
      ],
      weitereVertretungen: [{ name: 'C', funktion: 'Direktor', zeichnungsArt: 'kollektivprokura' }],
      domizilhalterName: 'D AG', domizilhalterAdresse: 'X 1, 8000 Zürich',
      revisionsstelleName: 'R AG', revisionsstelleSitz: 'Zürich',
      vinkulierung: true, virtuelleGv: true, statutenUmfang: 'lang',
      sitzungBeginn: '11.00', sitzungEnde: '11.30',
      nachtragsbevollmaechtigter: 'N. Muster, 1.1.1990, von Chur, Weg 1, 7000 Chur',
      ort: 'Zürich', datum: '2026-06-15',
    });
    expect(agMappe.gates.blocker).toEqual([]);
    for (const d of agMappe.dokumente) faelle.push([`ag-dok-${d.id}`, d.ergebnis.dokument]);

    // AG QUALIFIZIERT (Etappe 2): gemischt mit Sacheinlage (Geschäft mit
    // Grundstück + Sachgesamtheit mit Gutschrift), Verrechnung, besonderen
    // Vorteilen und Bar-Rest → alle neuen Schemas/Bausteine inkl.
    // Statuten-Klauseln 634 IV/634a III/636 und beide Vertrags-Varianten.
    const agQualifiziert = agDokumentmappe({
      einlageArt: 'gemischt', besondereVorteile: true, optingOut: true,
      eigeneBueros: true, immobilienHauptzweck: false, inhaberaktien: false,
      fremdwaehrung: false, bankInUrkundeGenannt: true, chWohnsitzVertretung: true,
      leistungenChf: undefined,
      ...AG_DOK_DEFAULTS,
      firma: 'Qualifia AG', sitz: 'Zürich', kanton: 'ZH', zweck: 'Produktion',
      aktienkapitalChf: "400'000", anzahlAktien: '400', nennwertChf: "1'000",
      gruender: [
        { name: 'A', angaben: 'von Basel, in Zürich', anzahl: '300' },
        { name: 'B', angaben: 'von Bern, in Bern', anzahl: '100' },
      ],
      verwaltungsraete: [
        { name: 'A', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'W 1', praesident: true, zeichnungsArt: 'einzelunterschrift' },
        { name: 'B', herkunft: 'Bern', wohnort: 'Bern', adresse: 'W 2', praesident: false, zeichnungsArt: 'kollektivzuzweien' },
      ],
      bankName: 'Zürcher Kantonalbank', bankOrt: 'Zürich',
      rechtsdomizilAdresse: 'Weg 1, 8000 Zürich',
      sacheinlagen: [
        {
          typ: 'geschaeft', bezeichnung: 'Werkbau Muster', belegDatum: '2025-12-31', wertChf: "100'000",
          grundstueck: true, einlegerName: 'A', aktienAnzahl: '100', gutschriftChf: '',
          zustand: 'Liegenschaft und Maschinenpark gemäss Bilanzpositionen, zu Fortführungswerten.',
          imHrEingetragen: true, cheNr: 'CHE-111.222.333', aktivenChf: "250'000", passivenChf: "120'000",
          rueckwirkungDatum: '2026-01-01',
        },
        {
          typ: 'sachgesamtheit', bezeichnung: 'eine EDV-Anlage', belegDatum: '2026-05-31', wertChf: "60'000",
          grundstueck: false, einlegerName: 'B', aktienAnzahl: '50', gutschriftChf: "10'000",
          zustand: 'neuwertig, unter Herstellergarantie',
          imHrEingetragen: false, cheNr: '', aktivenChf: '', passivenChf: '', rueckwirkungDatum: '',
        },
      ],
      verrechnungen: [{ glaeubigerName: 'A', forderungChf: "100'000", aktienAnzahl: '100', begruendungTxt: 'Darlehen vom 01.02.2026, valutiert und fällig.' }],
      vorteile: [{ beguenstigter: 'B', inhalt: 'Vorzugskonditionen für Beratungsleistungen', wertChf: "5'000", begruendungTxt: 'Abgeltung der Aufbauarbeit, marktüblich.' }],
      revisorName: 'Revisia AG',
      ort: 'Zürich', datum: '2026-06-15',
    });
    expect(agQualifiziert.gates.blocker).toEqual([]);
    for (const d of agQualifiziert.dokumente) faelle.push([`ag-dok-qualifiziert-${d.id}`, d.ergebnis.dokument]);

    // AG SINGULAR-Fassung (D1, Etappe 0.1): Einpersonen-Gründung mit
    // Volliberierung, Bank in der Urkunde, Opting-out, eigenem Büro und
    // Nachtragsvollmacht → alle Singular-Varianten-Bausteine.
    const agSingular = agDokumentmappe({
      einlageArt: 'bar', besondereVorteile: false, optingOut: true,
      eigeneBueros: true, immobilienHauptzweck: false, inhaberaktien: false,
      fremdwaehrung: false, bankInUrkundeGenannt: true, chWohnsitzVertretung: true,
      leistungenChf: undefined,
      ...AG_DOK_DEFAULTS,
      firma: 'Solo AG', sitz: 'Zürich', kanton: 'ZH', zweck: 'Beratung',
      gruender: [{ name: 'A', angaben: 'von Basel, in Zürich', anzahl: '100' }],
      verwaltungsraete: [
        { name: 'A', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'W 1', praesident: true, zeichnungsArt: 'einzelunterschrift' },
      ],
      bankName: 'Zürcher Kantonalbank', bankOrt: 'Zürich',
      rechtsdomizilAdresse: 'Weg 1, 8000 Zürich',
      nachtragsbevollmaechtigter: 'N. Muster, 1.1.1990, von Chur, Weg 1, 7000 Chur',
      ort: 'Zürich', datum: '2026-06-15',
    });
    expect(agSingular.gates.blocker).toEqual([]);
    for (const d of agSingular.dokumente) faelle.push([`ag-dok-singular-${d.id}`, d.ergebnis.dokument]);

    // AG FREMDWÄHRUNG (Etappe 3.1): EUR-Bargründung → Kurs-Satz-Baustein
    // (AE07w) + Währungs-Texte.
    const agFw = agDokumentmappe({
      einlageArt: 'bar', besondereVorteile: false, optingOut: true,
      eigeneBueros: true, immobilienHauptzweck: false, inhaberaktien: false,
      fremdwaehrung: true, bankInUrkundeGenannt: true, chWohnsitzVertretung: true,
      leistungenChf: undefined,
      ...AG_DOK_DEFAULTS,
      firma: 'Euro AG', sitz: 'Zürich', kanton: 'ZH', zweck: 'Handel',
      aktienkapitalChf: "120'000", anzahlAktien: '120',
      waehrung: 'EUR', kursChf: '0.93', kursQuelle: 'Zürcher Kantonalbank',
      gruender: [{ name: 'A', angaben: 'von Basel, in Zürich', anzahl: '120' }],
      verwaltungsraete: [
        { name: 'A', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'W 1', praesident: true, zeichnungsArt: 'einzelunterschrift' },
      ],
      bankName: 'Zürcher Kantonalbank', bankOrt: 'Zürich',
      rechtsdomizilAdresse: 'Weg 1, 8000 Zürich',
      ort: 'Zürich', datum: '2026-06-15',
    });
    expect(agFw.gates.blocker).toEqual([]);
    for (const d of agFw.dokumente) faelle.push([`ag-dok-fw-${d.id}`, d.ergebnis.dokument]);

    // Kapitalerhöhungs-Mappe (9c): GmbH mit neuer Zeichnerin (777a-Hinweis),
    // Agio und separater Bankbescheinigung → alle Schemas + bedingte Bausteine.
    const { keDokumentmappe, KE_DEFAULTS } = await import('../lib/vorlagen/kapitalerhoehung');
    const keMappe = keDokumentmappe({
      ...KE_DEFAULTS,
      rechtsform: 'gmbh', firma: 'Muster GmbH', sitz: 'Zürich', kanton: 'ZH',
      bisherigesKapitalChf: "20'000", bisherigeAnzahl: '20',
      nennwertChf: "1'000", anzahlNeue: '10', ausgabebetragChf: "1'500",
      statutenArtikelNr: '3', gvDatum: '2026-06-01',
      zeichner: [
        { name: 'A', angaben: 'von Basel, in Zürich', anzahl: '5', bereitsBeteiligt: true },
        { name: 'B', angaben: 'von Chur, in Chur', anzahl: '5', bereitsBeteiligt: false },
      ],
      bankInUrkundeGenannt: false,
      berichtUnterzeichner: 'A', vorsitzName: 'A',
      statutKlauseln: ['vorkaufsrecht', 'nachschuss'],
      ort: 'Zürich', datum: '2026-06-15',
    });
    expect(keMappe.gates.blocker).toEqual([]);
    for (const d of keMappe.dokumente) faelle.push([`ke-dok-${d.id}`, d.ergebnis.dokument]);
    const verstoesse = faelle.flatMap(([name, wert]) => pruefeAlles(wert, name));
    expect(verstoesse, verstoesse.join('\n')).toEqual([]);
  });

  it('Engine-Rechenwege/Hinweise (Stichproben aller Engines) sind konventionskonform', async () => {
    const { berechneFrist } = await import('../lib/zpoFristen');
    const { berechneSchkgFrist } = await import('../lib/schkgFristen');
    const { berechneVerzugszins } = await import('../lib/verzugszins');
    const { berechneTeuerung } = await import('../lib/teuerung');
    const { allgemeineFristErgebnis, rueckwaertsErgebnis, zustellHinweis } = await import('../lib/allgemeineFrist');
    const { berechneSperrfristen } = await import('../lib/sperrfristen');
    const { berechneErbteilung } = await import('../lib/erbteilung');
    const { berechneMietkuendigung } = await import('../lib/mietrecht');
    const { berechneVerjaehrung } = await import('../lib/verjaehrung');
    const { berechneLohnfortzahlung } = await import('../lib/lohnfortzahlung');
    const { gmbhGruendungsunterlagen, agGruendungsunterlagen } = await import('../lib/gruendungsunterlagen');

    const faelle: [string, unknown][] = [
      ['zpo', berechneFrist({ ereignis: '2025-12-10', einheit: 'tage', laenge: 30, verfahren: 'ordentlich', kanton: 'ZH', fristnatur: 'gesetzlich' })],
      ['schkg', berechneSchkgFrist({ ereignis: '2026-03-25', einheit: 'tage', laenge: 10, modus: 'schkg_betreibungsferien', fristnatur: 'verwirkung', kanton: 'ZH' })],
      ['verzugszins', berechneVerzugszins({ kapital: 10000, verzugsbeginn: '2025-01-15', stichtag: '2026-02-20' })],
      ['teuerung', berechneTeuerung({ modus: 'indexmiete', betrag: 2500, vonMonat: '2007-10', bisMonat: '2012-03' })],
      ['allg', allgemeineFristErgebnis({ start: '2026-01-31', laenge: 1, einheit: 'monate', wochenendeVerschieben: true, feiertageVerschieben: true, kanton: 'ZH' })],
      ['rueck', rueckwaertsErgebnis({ stichtag: '2026-06-30', laenge: 3, einheit: 'monate', verschiebung: 'vorverlegen', feiertageBeruecksichtigen: true, kanton: 'ZH' })],
      ['zustell', zustellHinweis('einschreiben', '2026-04-01')],
      ['sperr', berechneSperrfristen({ vertragsbeginn: '2020-01-01', zugangKuendigung: '2025-04-20', kuendigendePartei: 'arbeitgeber', probezeitMonate: 1, kuendigungsterminMonatsende: true, sperrereignisse: [{ typ: 'krankheit_unfall', von: '2025-05-01', bis: '2025-05-20' }] })],
      ['erb', berechneErbteilung({ todesdatum: '2026-03-01', zivilstand: 'verheiratet', kinderLebend: 2 } as never)],
      ['miet', berechneMietkuendigung({ kuendigungsart: 'zahlungsverzug', objekt: 'wohnung', zugang: '2026-02-10', kanton: 'ZH', partei: 'vermieter' })],
      ['verj', berechneVerjaehrung({ regime: 'delikt', beginnRelativ: '2024-02-29', beginnAbsolut: '2024-02-29', stichtag: '2026-06-05', kanton: 'ZH' })],
      ['lohn', berechneLohnfortzahlung({ vertragsbeginn: '2020-01-01', verhinderungBeginn: '2026-02-01', verhinderungEnde: '2026-04-15', arbeitsunfaehigkeitProzent: 50, kanton: 'BS', ktgGleichwertigVorhanden: false })],
      // Gründungs-Masken: Maximal-Kombinationen, damit ALLE Hinweis-Texte
      // durch den Linter laufen (Review-Befund 6.6.2026: Engine fehlte hier).
      ['gmbh-gruendung', gmbhGruendungsunterlagen({ einlageArt: 'gemischt', besondereVorteile: true, gfGewaehlt: true, mehrereGeschaeftsfuehrer: true, weitereVertretungsberechtigte: true, optingOut: true, eigeneBueros: false, immobilienHauptzweck: true, auslJurPersonGesellschafter: true, fremdwaehrung: true, bankInUrkundeGenannt: false, chWohnsitzVertretung: false, statutKlauseln: ['nachschuss', 'nebenleistung', 'konkurrenzverbot', 'vorkaufsrecht', 'stimmrechtNachAnteilen', 'vetorecht'], leistungenChf: 2_000_000 })],
      ['gmbh-gruendung-rs', gmbhGruendungsunterlagen({ einlageArt: 'bar', besondereVorteile: false, gfGewaehlt: false, mehrereGeschaeftsfuehrer: false, weitereVertretungsberechtigte: false, optingOut: false, eigeneBueros: true, immobilienHauptzweck: false, auslJurPersonGesellschafter: false, fremdwaehrung: false, bankInUrkundeGenannt: true, chWohnsitzVertretung: true, statutKlauseln: [] })],
      ['ag-gruendung', agGruendungsunterlagen({ einlageArt: 'gemischt', besondereVorteile: true, optingOut: true, eigeneBueros: false, immobilienHauptzweck: true, inhaberaktien: true, fremdwaehrung: true, bankInUrkundeGenannt: false, chWohnsitzVertretung: false, leistungenChf: 2_000_000 })],
      ['ag-gruendung-rs', agGruendungsunterlagen({ einlageArt: 'bar', besondereVorteile: false, optingOut: false, eigeneBueros: true, immobilienHauptzweck: false, inhaberaktien: false, fremdwaehrung: false, bankInUrkundeGenannt: true, chWohnsitzVertretung: true })],
    ];
    const verstoesse = faelle.flatMap(([name, wert]) => pruefeAlles(wert, name));
    expect(verstoesse, verstoesse.join('\n')).toEqual([]);
  });

  it('Katalog-Texte (Titel, Beschreibungen, Pills) sind konventionskonform', () => {
    const verstoesse = ALLE_KARTEN.flatMap((k) =>
      pruefeAlles({ title: k.title, description: k.description, norms: k.norms.map((n) => n.label) }, k.id));
    expect(verstoesse, verstoesse.join('\n')).toEqual([]);
  });
});
