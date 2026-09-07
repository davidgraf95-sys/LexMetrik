import { describe, it, expect } from 'vitest';
import {
  agDokumentmappe,
  pruefeAgDokGates,
  type AgDokAntworten,
} from '../lib/vorlagen/gruendungAgDokumente';
import { BASIS, text } from './gruendungAgDokumente.helfer';

describe('AG-Gates — Erstausbau-Grenzen + 632-Arithmetik', () => {
  it('Inhaberaktien/Sacheinlage/Fremdwährung sperren ehrlich', () => {
    // Stufe 2 P2 (deklarierte fachliche Änderung 7.6.2026): Inhaberaktien
    // nicht mehr pauschal gesperrt — ohne Verwahrungsstelle bleibt das
    // 622-Abs.-1bis-Gate ehrlich.
    expect(pruefeAgDokGates({ ...BASIS, inhaberaktien: true }).blocker.join(' ')).toContain('Verwahrungsstelle in der Schweiz bezeichnen');
    // Qualifizierte Gründung (FAHRPLAN-AG-GRUENDUNG Etappe 2): Verrechnung
    // ist nicht mehr pauschal gesperrt (alter BARGRÜNDUNG-Blocker), das Gate
    // bleibt aber ehrlich — ohne erfasste Verrechnungszeile blockt es.
    expect(pruefeAgDokGates({ ...BASIS, einlageArt: 'verrechnung' }).blocker.join(' ')).toContain('Verrechnungsliberierung erfassen');
    // Etappe 3.1: Fremdwährung nicht mehr pauschal gesperrt — ohne gewählte
    // Währung/Kurs/Quelle bleiben die Pflicht-Gates ehrlich.
    expect(pruefeAgDokGates({ ...BASIS, fremdwaehrung: true }).blocker.join(' ')).toContain('GBP, EUR, USD und JPY');
  });

  it('Art. 632: unter 20 % gesperrt; 20 % von 100k = 20k < 50k gesperrt; bei 200k zulässig', () => {
    expect(pruefeAgDokGates({ ...BASIS, liberierungProzent: '19' }).blocker.join(' ')).toContain('20 %');
    expect(pruefeAgDokGates({ ...BASIS, liberierungProzent: '20' }).blocker.join(' ')).toContain("50'000");
    const ok = pruefeAgDokGates({
      ...BASIS,
      aktienkapitalChf: "200'000", anzahlAktien: '200', liberierungProzent: '25',
      gruender: [{ name: 'A', angaben: '', anzahl: '200' }],
    });
    expect(ok.blocker).toEqual([]);
  });

  it('AK unter 100k gesperrt (621 I); mehrgliedriger VR braucht genau eine Präsidentin (712 II)', () => {
    expect(pruefeAgDokGates({ ...BASIS, aktienkapitalChf: "99'000", anzahlAktien: '99' }).blocker.join(' ')).toContain("100'000");
    const zweiOhnePraesident = pruefeAgDokGates({
      ...BASIS,
      verwaltungsraete: [
        { ...BASIS.verwaltungsraete[0], praesident: false },
        { name: 'B', herkunft: 'Bern', wohnort: 'Bern', adresse: 'X', praesident: false, zeichnungsArt: 'kollektivzuzweien' },
      ],
    });
    expect(zweiOhnePraesident.blocker.join(' ')).toContain('Art. 712 Abs. 2');
  });

  it('Formstufen: Statuten/Errichtungsakt = entwurf, übrige = fertig', () => {
    const m = agDokumentmappe(BASIS);
    const art = Object.fromEntries(m.dokumente.map((d) => [d.id, d.ergebnis.dokument.ausgabeArt]));
    expect(art['statuten']).toBe('entwurf');
    expect(art['errichtungsakt']).toBe('entwurf');
    expect(art['vr-protokoll']).toBe('fertig');
    expect(art['hr-anmeldung']).toBe('fertig');
  });
});

describe('AG — Stufe 2 P1 (Perfektion 7.6.2026): gemischte Teilliberierung + Agio qualifiziert', () => {
  const SACHZEILE = {
    typ: 'sachgesamtheit' as const, bezeichnung: 'eine Werkstatteinrichtung', belegDatum: '2026-06-01',
    wertChf: "100'000", grundstueck: false, einlegerName: 'Anna Muster', aktienAnzahl: '100',
    gutschriftChf: '', zustand: 'gebraucht, betriebsbereit, regelmässig gewartet',
    imHrEingetragen: false, cheNr: '', aktivenChf: '', passivenChf: '', rueckwirkungDatum: '',
  };

  it('P1d: gemischte Teilliberierung — Bar-Teil 50 %, Sach-Aktien gelten voll; Urkunden-Text trennt', () => {
    const m = agDokumentmappe({
      ...BASIS,
      einlageArt: 'gemischt',
      aktienkapitalChf: "200'000", anzahlAktien: '200', liberierungProzent: '50',
      gruender: [{ name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '200' }],
      sacheinlagen: [SACHZEILE],
      revisorName: 'Revisia AG',
    });
    expect(m.gates.blocker).toEqual([]);
    const ea = text(m, 'errichtungsakt');
    // Bar-Teil: 100 Aktien × 1'000 × 50 % = 50'000; Sach: 100 Aktien voll.
    expect(ea).toContain("Auf 100 Namenaktien wurden Einlagen von gesamthaft CHF 50'000.00 (50 % des Nennwerts jeder dieser Aktien) in Geld");
    expect(ea).toContain('Die Aktien aus Sacheinlage und Verrechnung gelten als voll liberiert.');
    expect(ea).toContain('im Sinne von Art. 634b OR sofort zu erbringen');
    // Statuten 626 I Ziff. 3: Betrag der geleisteten Einlagen gesamt (150'000).
    expect(text(m, 'statuten')).toContain(
      "im Umfang der geleisteten Einlagen von CHF 150'000.00 liberiert (Bareinlage-Aktien zu 50 % des Nennwerts; die Aktien aus Sacheinlage und Verrechnung gelten als voll liberiert)",
    );
  });

  it('P1c: Agio + Sacheinlage — Wert-Gate rechnet auf dem Ausgabebetrag; Statuten legen den Ausgabebetrag offen', () => {
    const SACH_AGIO: AgDokAntworten = {
      ...BASIS,
      einlageArt: 'sacheinlage',
      ausgabebetragChf: "1'200",
      sacheinlagen: [{ ...SACHZEILE, wertChf: "120'000" }],
      revisorName: 'Revisia AG',
    };
    const m = agDokumentmappe(SACH_AGIO);
    expect(m.gates.blocker).toEqual([]);
    // Statuten-Klausel 634 IV legt bei Agio den Ausgabebetrag offen.
    expect(text(m, 'statuten')).toContain("100 Namenaktien zu CHF 1'000.00 (Ausgabebetrag CHF 1'200.00 je Aktie) ausgegeben");
    // Urkunde erklärt die Agio-Deckung durch die Sacheinlage.
    expect(text(m, 'errichtungsakt')).toContain('Das Ausgabeagio ist durch die angerechneten Sacheinlagen bzw. Verrechnungsforderungen gedeckt');
    // Wert-Gate: Bewertung = Aktien × AUSGABEBETRAG (nicht Nennwert).
    expect(pruefeAgDokGates({
      ...SACH_AGIO,
      sacheinlagen: [{ ...SACHZEILE, wertChf: "100'000" }],
    }).blocker.join(' ')).toContain("Bewertung CHF 100'000.00 muss 100 Aktien × CHF 1'200.00 (Ausgabebetrag) entsprechen");
  });
});

describe('AG — Stufe 2 P2 (Perfektion 7.6.2026): Inhaberaktien-Weiche', () => {
  const INHABER: AgDokAntworten = {
    ...BASIS,
    inhaberaktien: true,
    verwahrungsstelle: 'SIX SIS AG, Olten',
  };

  it('Bucheffekten-Variante: Texte führen «Inhaberaktien», Statuten-Erklärung 622 1bis, Anmeldung 622 2bis', () => {
    const m = agDokumentmappe(INHABER);
    expect(m.gates.blocker).toEqual([]);
    const st = text(m, 'statuten');
    expect(st).toContain('eingeteilt in 100 Inhaberaktien');
    expect(st).toContain('als Bucheffekten im Sinne des Bucheffektengesetzes vom 3. Oktober 2008 (BEG) ausgestaltet');
    expect(st).toContain('bei SIX SIS AG, Olten, einer von der Gesellschaft bezeichneten Verwahrungsstelle in der Schweiz, hinterlegt');
    const ea = text(m, 'errichtungsakt');
    expect(ea).toContain('Inhaberaktien zu je CHF');
    expect(ea).toContain('– Anna Muster: 100 Inhaberaktien');
    expect(text(m, 'hr-anmeldung')).toContain('Die Gesellschaft hat Inhaberaktien; diese sind als Bucheffekten');
    // Checkliste verlangt den Zusatznachweis (Art. 43 Abs. 1 lit. i HRegV)
  });

  it('Kotierungs-Variante: keine Verwahrungsstelle nötig, eigene Erklärung', () => {
    const m = agDokumentmappe({ ...INHABER, inhaberKotiert: true, verwahrungsstelle: '' });
    expect(m.gates.blocker).toEqual([]);
    expect(text(m, 'statuten')).toContain('Die Gesellschaft hat Beteiligungspapiere an einer Börse kotiert.');
    expect(text(m, 'hr-anmeldung')).toContain('Beteiligungspapiere an einer Börse kotiert');
  });

  it('Gates: Verwahrungsstelle fehlt / Vinkulierung 685a / Teilliberierung 683 / Langfassung blocken', () => {
    expect(pruefeAgDokGates({ ...INHABER, verwahrungsstelle: '' }).blocker.join(' ')).toContain('Verwahrungsstelle in der Schweiz bezeichnen');
    expect(pruefeAgDokGates({ ...INHABER, vinkulierung: true }).blocker.join(' ')).toContain('Vinkulierung gibt es nur für Namenaktien');
    expect(pruefeAgDokGates({ ...INHABER, liberierungProzent: '50' }).blocker.join(' ')).toContain('Art. 683 Abs. 1 und 2 OR');
    expect(pruefeAgDokGates({ ...INHABER, statutenUmfang: 'lang' }).blocker.join(' ')).toContain('Statuten-KURZFASSUNG');
  });

  it('Namenaktien-Regression: ohne Weiche keine Inhaber-Bausteine, Wortlaut unverändert', () => {
    const m = agDokumentmappe(BASIS);
    const st = text(m, 'statuten');
    expect(st).toContain('eingeteilt in 100 Namenaktien');
    expect(st).not.toContain('Inhaber');
    expect(text(m, 'hr-anmeldung')).not.toContain('Inhaberaktien');
  });
});

describe('AG — Stufe 2 P3 (Perfektion 7.6.2026): Statuten-Zusatzklauseln', () => {
  it('Schiedsklausel 697n: Statuten-Artikel + HR-Anmeldungs-Verweis (45 I lit. u HRegV); ohne Ort blockt', () => {
    const m = agDokumentmappe({ ...BASIS, schiedsklausel: true, schiedsOrt: 'Zürich' });
    expect(m.gates.blocker).toEqual([]);
    const st = text(m, 'statuten');
    expect(st).toContain('ein Schiedsgericht mit Sitz in Zürich (Schweiz)');
    expect(st).toContain('bindet die Gesellschaft, die Organe der Gesellschaft, die Mitglieder der Organe und die Aktionäre');
    expect(st).toContain('3. Teils der Schweizerischen Zivilprozessordnung');
    expect(st).toContain('über die Einleitung und die Beendigung des Verfahrens zu informieren');
    expect(text(m, 'hr-anmeldung')).toContain('Die Statuten enthalten eine Schiedsklausel');
    expect(pruefeAgDokGates({ ...BASIS, schiedsklausel: true }).blocker.join(' ')).toContain('Sitz des Schiedsgerichts');
  });

  it('Kapitalband 653s: Nur-Erhöhungs-Klausel mit Höchstzahl; Gates ±½, 5 Jahre, Opting-out', () => {
    const KB = {
      ...BASIS,
      kapitalband: true, kbRichtung: 'erhoehen' as const,
      kbUntergrenze: "100'000", kbObergrenze: "150'000", kbEndeDatum: '2031-06-01',
    };
    const m = agDokumentmappe(KB);
    expect(m.gates.blocker).toEqual([]);
    const st = text(m, 'statuten');
    expect(st).toContain("unteren Grenze von CHF 100'000.00 (entspricht dem Aktienkapital) und einer oberen Grenze von CHF 150'000.00 zu erhöhen");
    // (150'000 − 100'000) / 1'000 = 50 neue Aktien
    expect(st).toContain('Ausgabe von höchstens 50 neuen, vollständig zu liberierenden Namenaktien');
    expect(st).toContain('Herabsetzung des Aktienkapitals innerhalb des Kapitalbands ist ausgeschlossen');

    // obere Grenze > 1.5 × AK (Art. 653s Abs. 2 OR)
    expect(pruefeAgDokGates({ ...KB, kbObergrenze: "160'000" }).blocker.join(' ')).toContain('höchstens um die Hälfte übersteigen');
    // Dauer > 5 Jahre ab Beschluss (Art. 653s Abs. 1 OR; datum 2026-06-07)
    expect(pruefeAgDokGates({ ...KB, kbEndeDatum: '2031-06-08' }).blocker.join(' ')).toContain('längstens FÜNF Jahre');
    // Herabsetzungs-Ermächtigung bei Opting-out gesperrt (Art. 653s Abs. 4 OR)
    expect(pruefeAgDokGates({ ...KB, kbRichtung: 'beide' }).blocker.join(' ')).toContain('Art. 653s Abs. 4 OR');
    // nur Erhöhung: Untergrenze muss dem Kapital entsprechen
    expect(pruefeAgDokGates({ ...KB, kbUntergrenze: "80'000" }).blocker.join(' ')).toContain('untere Grenze entspricht dem Aktienkapital');

    // Bug-Check §9 MITTEL-1 (7.6.2026): Grenzen-Abstand muss ein Vielfaches
    // des Nennwerts sein — sonst widerspricht die Höchstzahl-Klausel der
    // Bandgrenze im selben Artikel.
    expect(pruefeAgDokGates({ ...KB, kbObergrenze: "150'500" }).blocker.join(' ')).toContain('Vielfachen des Nennwerts');
    // Bug-Check §9 MITTEL-2: Schalttags-Gründung — setFullYear-Rollover
    // (29.2.2028 + 5 J. = 28.2.2033, NICHT 1.3.2033).
    expect(pruefeAgDokGates({ ...KB, datum: '2028-02-29', kbEndeDatum: '2033-03-01' }).blocker.join(' ')).toContain('längstens FÜNF Jahre');
    expect(pruefeAgDokGates({ ...KB, datum: '2028-02-29', kbEndeDatum: '2033-02-28' }).blocker).toEqual([]);

    // Bug-Check 7.6.2026 HOCH-2: UTC-Parse + lokale Mutation war zeitzonen-
    // abhängig — in Europe/Zurich blockierte die DST-Grenze das exakt
    // 5-jährige Ende (31.3.2024 → 31.3.2029 GÜLTIG), westlich von UTC
    // passierten 5 Jahre + 1 Tag. Erwartungswerte gelten in JEDER Zeitzone.
    expect(pruefeAgDokGates({ ...KB, datum: '2024-03-31', kbEndeDatum: '2029-03-31' }).blocker).toEqual([]);
    expect(pruefeAgDokGates({ ...KB, datum: '2024-03-31', kbEndeDatum: '2029-04-01' }).blocker.join(' ')).toContain('längstens FÜNF Jahre');
  });

  it('Kapitalband beide Richtungen (mit Revisionsstelle): Klausel + Untergrenze-Gate', () => {
    const KB2 = {
      ...BASIS,
      optingOut: false, revisionsstelleName: 'Revisia AG', revisionsstelleSitz: 'Zürich',
      kapitalband: true, kbRichtung: 'beide' as const,
      kbUntergrenze: "50'000", kbObergrenze: "150'000", kbEndeDatum: '2030-12-31',
    };
    const m = agDokumentmappe(KB2);
    expect(m.gates.blocker).toEqual([]);
    const st = text(m, 'statuten');
    expect(st).toContain('zu erhöhen oder herabzusetzen');
    // Vernichtung von höchstens (100'000 − 50'000)/1'000 = 50 Aktien
    expect(st).toContain('Vernichtung von höchstens 50 Namenaktien');
    expect(pruefeAgDokGates({ ...KB2, kbUntergrenze: "40'000" }).blocker.join(' ')).toContain('höchstens um die Hälfte unterschreiten');
  });

  it('Bedingtes Kapital 653/653a/653b: Klausel; Gates ½-Schranke, Teilbarkeit, Kreis', () => {
    const BK = { ...BASIS, bedingtesKapital: true, bkBetrag: "50'000", bkKreis: 'den Arbeitnehmerinnen und Arbeitnehmern der Gesellschaft' };
    const m = agDokumentmappe(BK);
    expect(m.gates.blocker).toEqual([]);
    const st = text(m, 'statuten');
    expect(st).toContain("erhöht sich um höchstens CHF 50'000.00 durch Ausgabe von höchstens 50 vollständig zu liberierenden Namenaktien");
    expect(st).toContain('die den Arbeitnehmerinnen und Arbeitnehmern der Gesellschaft eingeräumt werden (bedingtes Kapital)');
    expect(st).toContain('Bezugsrecht der bisherigen Aktionäre ist ausgeschlossen, soweit');
    expect(pruefeAgDokGates({ ...BK, bkBetrag: "60'000" }).blocker.join(' ')).toContain('Art. 653a Abs. 1 OR');
    expect(pruefeAgDokGates({ ...BK, bkBetrag: "50'500" }).blocker.join(' ')).toContain('Vielfachen des Nennwerts');
    expect(pruefeAgDokGates({ ...BK, bkKreis: '' }).blocker.join(' ')).toContain('Kreis der Wandel- bzw. Optionsberechtigten');
  });

  it('Stichentscheid-Abwahl (Lang) + «erstes Geschäftsjahr endet am»', () => {
    const mitDefault = text(agDokumentmappe({ ...BASIS, statutenUmfang: 'lang' }), 'statuten');
    expect(mitDefault).toContain('Bei Stimmengleichheit hat der Vorsitzende den Stichentscheid.');
    const ohne = text(agDokumentmappe({ ...BASIS, statutenUmfang: 'lang', stichentscheidGv: false }), 'statuten');
    expect(ohne).not.toContain('Bei Stimmengleichheit hat der Vorsitzende den Stichentscheid.');
    // Der 704-Gesetzeskatalog («Einführung des Stichentscheids») bleibt.
    expect(ohne).toContain('die Einführung des Stichentscheids des Vorsitzenden in der Generalversammlung');

    const gj = text(agDokumentmappe({ ...BASIS, gjErstesEnde: '31. Dezember 2026' }), 'statuten');
    expect(gj).toContain('Das Geschäftsjahr beginnt am 1. Januar und endet am 31. Dezember. Das erste Geschäftsjahr endet am 31. Dezember 2026.');
    expect(text(agDokumentmappe(BASIS), 'statuten')).not.toContain('Das erste Geschäftsjahr');
  });
});

describe('AG — Stufe 2 P4 (Perfektion 7.6.2026): Unterschriftenblatt', () => {
  it('je zeichnungsberechtigte Person eine Zeile; «ohne Zeichnungsberechtigung» fehlt; Art.-21-Hinweis', () => {
    const m = agDokumentmappe({
      ...BASIS,
      verwaltungsraete: [
        { name: 'Anna Muster', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'W 1', praesident: true, zeichnungsArt: 'einzelunterschrift' },
        { name: 'Otto Ohne', herkunft: 'Bern', wohnort: 'Bern', adresse: 'W 2', praesident: false, zeichnungsArt: 'ohne' },
      ],
      weitereVertretungen: [{ name: 'Carla Chef', funktion: 'Direktorin', zeichnungsArt: 'kollektivprokura' }],
    });
    expect(m.gates.blocker).toEqual([]);
    const ub = text(m, 'unterschriftenbogen');
    expect(ub).toContain('Anna Muster');
    expect(ub).toContain('Präsident/in des Verwaltungsrates · Einzelunterschrift');
    expect(ub).toContain('Carla Chef');
    expect(ub).toContain('Direktorin · Kollektivprokura zu zweien');
    expect(ub).not.toContain('Otto Ohne');
    expect(ub).toContain('beim Handelsregisteramt zu zeichnen');
    expect(ub).toContain('von einer Urkundsperson beglaubigt');
  });
});
