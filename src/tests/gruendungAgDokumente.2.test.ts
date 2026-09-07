import { describe, it, expect } from 'vitest';
import {
  agDokumentmappe,
  pruefeAgDokGates,
  type AgDokAntworten,
} from '../lib/vorlagen/gruendungAgDokumente';
import { BASIS, text } from './gruendungAgDokumente.helfer';

describe('AG — Qualifizierte Gründung (Etappe 2/D3–D5)', () => {
  const SACH_BASIS: AgDokAntworten = {
    ...BASIS,
    einlageArt: 'sacheinlage',
    sacheinlagen: [{
      typ: 'sachgesamtheit', bezeichnung: 'eine Werkstatteinrichtung', belegDatum: '2026-06-01',
      wertChf: "100'000", grundstueck: false, einlegerName: 'Anna Muster', aktienAnzahl: '100',
      gutschriftChf: '', zustand: 'gebraucht, betriebsbereit, regelmässig gewartet',
      imHrEingetragen: false, cheNr: '', aktivenChf: '', passivenChf: '', rueckwirkungDatum: '',
    }],
    revisorName: 'Revisia AG',
  };

  it('Reine Sacheinlage: Vertrag (druckfertig) + Gründungsbericht; Statuten-Klausel 634 IV; Urkunden-Block', () => {
    const m = agDokumentmappe(SACH_BASIS);
    expect(m.gates.blocker).toEqual([]);
    expect(m.dokumente.map((d) => d.id)).toContain('sacheinlagevertrag-0');
    expect(m.dokumente.map((d) => d.id)).toContain('gruendungsbericht');

    const st = text(m, 'statuten');
    expect(st).toContain('eine Werkstatteinrichtung');
    expect(st).toContain("bewertet mit CHF 100'000.00");
    const klausel = m.dokumente[0].ergebnis.protokoll.find((p) => p.bausteinId === 'AS06_sacheinlagen');
    expect(klausel?.norm).toBe('Art. 634 Abs. 4 OR');

    const ea = text(m, 'errichtungsakt');
    expect(ea).toContain('Die in den Statuten angegebenen Sacheinlagen gemäss folgenden, vorliegenden Unterlagen:');
    expect(ea).toContain('sofort als Eigentümerin über die Sacheinlage verfügen kann');
    expect(ea).toContain('Gründungsbericht gemäss Art. 635 OR');
    expect(ea).toContain('Revisors Revisia AG, wonach der Gründungsbericht vollständig und richtig ist');
    expect(ea).not.toContain('Sämtliche Einlagen von gesamthaft');   // Bar-Absatz nur bei nurBar

    const sv = text(m, 'sacheinlagevertrag-0');
    expect(sv).toContain('gemäss beiliegender Inventarliste vom 01.06.2026');
    expect(sv).toContain('100 als voll liberiert geltende Namenaktien');
    expect(sv).toContain('unter Aufhebung jeder Gewährleistung');
    expect(m.dokumente.find((d) => d.id === 'sacheinlagevertrag-0')!.ergebnis.dokument.ausgabeArt).toBe('fertig');

    const gb = text(m, 'gruendungsbericht');
    expect(gb).toContain('Gründungsbericht im Sinne von Art. 635 OR');
    expect(gb).toContain('gebraucht, betriebsbereit');
    expect(gb).toContain("Bewertung der Sacheinlage mit CHF 100'000.00 als angemessen");
  });

  it('Leere Optional-Fragmente verschwinden ersatzlos (Bug-Check E2 Befund 1: Satz/Zeile-Konvention)', () => {
    // Sacheinlage OHNE Gutschrift: kein «________» nach «ausgegeben».
    const ohneGutschrift = agDokumentmappe(SACH_BASIS);
    expect(text(ohneGutschrift, 'statuten')).toContain('Namenaktien zu CHF 1\'000.00 ausgegeben.');
    expect(text(ohneGutschrift, 'statuten')).not.toContain('ausgegeben________');
    // Geschäft OHNE UID: kein «________» hinter der Firma.
    const ohneChe = agDokumentmappe({
      ...SACH_BASIS,
      sacheinlagen: [{ ...SACH_BASIS.sacheinlagen[0], typ: 'geschaeft', imHrEingetragen: false, aktivenChf: "180'000", passivenChf: "80'000" }],
    });
    const sv = text(ohneChe, 'sacheinlagevertrag-0');
    expect(sv).toContain('Einzelunternehmens eine Werkstatteinrichtung gemäss Übernahmebilanz');
    expect(sv).not.toContain('________ gemäss Übernahmebilanz');
  });

  it('Grundstück → Sacheinlagevertrag nur als ENTWURF (§8; Art. 634 Abs. 2 OR/657 ZGB) + Grundbuch-Weiche', () => {
    const m = agDokumentmappe({
      ...SACH_BASIS,
      sacheinlagen: [{ ...SACH_BASIS.sacheinlagen[0], grundstueck: true, bezeichnung: 'das Grundstück Kat.-Nr. 123, Zürich' }],
    });
    expect(m.gates.blocker).toEqual([]);
    expect(m.dokumente.find((d) => d.id === 'sacheinlagevertrag-0')!.ergebnis.dokument.ausgabeArt).toBe('entwurf');
    expect(text(m, 'errichtungsakt')).toContain('einen bedingungslosen Anspruch auf Eintragung in das Grundbuch erhält');
  });

  it('Geschäftsübernahme: Übernahmebilanz + Rückwirkungsklausel + 181-OR-Warnung; Netto-Aktiven-Gate', () => {
    const geschaeft: AgDokAntworten = {
      ...SACH_BASIS,
      sacheinlagen: [{
        typ: 'geschaeft', bezeichnung: 'Schreinerei Muster', belegDatum: '2025-12-31',
        wertChf: "100'000", grundstueck: false, einlegerName: 'Anna Muster', aktienAnzahl: '100',
        gutschriftChf: '', zustand: 'Warenlager: Bestand gemäss Inventur, zu Einstandspreisen bewertet.',
        imHrEingetragen: true, cheNr: 'CHE-123.456.789', aktivenChf: "180'000", passivenChf: "80'000",
        rueckwirkungDatum: '2026-01-01',
      }],
    };
    const m = agDokumentmappe(geschaeft);
    expect(m.gates.blocker).toEqual([]);
    expect(m.gates.warnungen.join(' ')).toContain('Art. 181 Abs. 1 und 2 OR');
    const sv = text(m, 'sacheinlagevertrag-0');
    expect(sv).toContain('alle Aktiven und Passiven des im Handelsregister eingetragenen Einzelunternehmens Schreinerei Muster (CHE-123.456.789) gemäss Übernahmebilanz per 31.12.2025');
    expect(sv).toContain('Die seit dem 01.01.2026 abgeschlossenen Rechtsgeschäfte');

    const zuTeuer = pruefeAgDokGates({
      ...geschaeft,
      sacheinlagen: [{ ...geschaeft.sacheinlagen[0], aktivenChf: "150'000", passivenChf: "80'000" }],
    });
    expect(zuTeuer.blocker.join(' ')).toContain('Netto-Aktiven');
  });

  it('Verrechnung: Statuten-Klausel 634a III + Urkunden-Zeile + Bericht Ziff. 2; Betrags-Gate', () => {
    const verr: AgDokAntworten = {
      ...BASIS,
      einlageArt: 'verrechnung',
      verrechnungen: [{ glaeubigerName: 'Anna Muster', forderungChf: "100'000", aktienAnzahl: '100', begruendungTxt: 'Darlehen vom 1. Februar 2026, valutiert und fällig.' }],
    };
    const m = agDokumentmappe(verr);
    expect(m.gates.blocker).toEqual([]);
    expect(text(m, 'statuten')).toContain("durch Verrechnung mit einer Forderung von Anna Muster im Betrag von CHF 100'000.00");
    expect(text(m, 'errichtungsakt')).toContain('Verrechnungsliberierung');
    expect(text(m, 'gruendungsbericht')).toContain('besteht und ist verrechenbar. Begründung: Darlehen vom 1. Februar 2026');

    const falsch = pruefeAgDokGates({
      ...verr,
      verrechnungen: [{ ...verr.verrechnungen[0], forderungChf: "90'000" }],
    });
    expect(falsch.blocker.join(' ')).toContain('Verrechnung von Anna Muster');
  });

  it('Gemischt: Bar-Absatz mit Restbetrag + qualifizierter Block; rein-qualifiziert verlangt volle Deckung', () => {
    const gemischt: AgDokAntworten = {
      ...SACH_BASIS,
      einlageArt: 'gemischt',
      aktienkapitalChf: "200'000", anzahlAktien: '200',
      gruender: [{ name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '200' }],
    };
    const m = agDokumentmappe(gemischt);
    expect(m.gates.blocker).toEqual([]);
    const ea = text(m, 'errichtungsakt');
    expect(ea).toContain("Auf 100 Namenaktien wurden Einlagen von gesamthaft CHF 100'000.00 in Geld");
    expect(ea).toContain('Die in den Statuten angegebenen Sacheinlagen gemäss folgenden, vorliegenden Unterlagen:');

    const unvollstaendig = pruefeAgDokGates({
      ...SACH_BASIS,
      anzahlAktien: '200', aktienkapitalChf: "200'000",
      gruender: [{ name: 'Anna Muster', angaben: '', anzahl: '200' }],
    });
    expect(unvollstaendig.blocker.join(' ')).toContain('qualifiziert gedeckt');
  });

  it('Besondere Vorteile: Statuten-Klausel 636 + Bericht Ziff. 3; Teilliberierung qualifiziert gesperrt', () => {
    const m = agDokumentmappe({
      ...BASIS,
      besondereVorteile: true,
      vorteile: [{ beguenstigter: 'Beat Beispiel', inhalt: 'lebenslanger Vorzugsbezug von Dienstleistungen', wertChf: "5'000", begruendungTxt: 'Abgeltung der Aufbauarbeit; marktüblich bewertet.' }],
    });
    expect(m.gates.blocker).toEqual([]);
    expect(text(m, 'statuten')).toContain("Beat Beispiel folgender besonderer Vorteil gewährt: lebenslanger Vorzugsbezug von Dienstleistungen (Wert: CHF 5'000.00)");
    expect(text(m, 'gruendungsbericht')).toContain('Begründung und Angemessenheit: Abgeltung der Aufbauarbeit');
    expect(text(m, 'errichtungsakt')).toContain('die in den Statuten umschriebenen besonderen Vorteile gewährt');

    // Stufe 2 P1d (deklarierte fachliche Änderung 7.6.2026): Teilliberierung
    // bei REINER Sacheinlage ist gegenstandslos — alle Aktien gelten als voll
    // liberiert (ZH-Vertragsvorlage), der globale Grad läuft leer.
    const teilQ = agDokumentmappe({ ...SACH_BASIS, liberierungProzent: '50' });
    expect(teilQ.gates.blocker).toEqual([]);
    expect(text(teilQ, 'statuten')).toContain('Die Aktien sind vollständig liberiert.');
    // Individuelle Grade bleiben qualifiziert gesperrt (Zuordnung Bar-/Sach-
    // Aktien je Gründer:in nicht eindeutig).
    expect(pruefeAgDokGates({
      ...SACH_BASIS,
      einlageArt: 'gemischt',
      gruender: [{ name: 'Anna Muster', angaben: '', anzahl: '100', liberierung: '50' }],
    }).blocker.join(' ')).toContain('Individuelle Liberierungsgrade');
  });
});

describe('AG — Urkunden-Optionen (Etappen 4.1/4.2) + Agio/Liberierung (3.2/3.3) + Nachtrag (4.4)', () => {
  const ZWEI: AgDokAntworten = {
    ...BASIS,
    aktienkapitalChf: "200'000", anzahlAktien: '200',
    gruender: [
      { name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '120' },
      { name: 'Beat Beispiel', angaben: 'von Bern, in Bern', anzahl: '80' },
    ],
    verwaltungsraete: [
      { name: 'Anna Muster', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'W 1', praesident: true, zeichnungsArt: 'einzelunterschrift' },
      { name: 'Beat Beispiel', herkunft: 'Bern', wohnort: 'Bern', adresse: 'W 2', praesident: false, zeichnungsArt: 'kollektivzuzweien' },
    ],
  };

  it('4.1: Annahme in der Urkunde → ZH-Zusatz, keine separate Erklärung; gemischt nur für Übrige', () => {
    const m = agDokumentmappe({
      ...ZWEI,
      verwaltungsraete: [
        { ...ZWEI.verwaltungsraete[0], annahmeInUrkunde: true },
        ZWEI.verwaltungsraete[1],
      ],
    });
    expect(m.gates.blocker).toEqual([]);
    const ea = text(m, 'errichtungsakt');
    expect(ea).toContain('Anna Muster, von Basel, in Zürich, als Präsident/in, welche bzw. welcher hiermit die Annahme erklärt');
    const wahlannahmen = m.dokumente.filter((d) => d.id.startsWith('wahlannahme-') && d.id !== 'wahlannahme-rs');
    expect(wahlannahmen).toHaveLength(1);
    expect(wahlannahmen[0].titel).toContain('Beat Beispiel');

    // ALLE in der Urkunde → Beleg fällt aus der Anmeldungs-Beilagenliste.
    const alle = agDokumentmappe({
      ...ZWEI,
      verwaltungsraete: ZWEI.verwaltungsraete.map((v) => ({ ...v, annahmeInUrkunde: true })),
    });
    expect(alle.dokumente.filter((d) => d.id.startsWith('wahlannahme-') && d.id !== 'wahlannahme-rs')).toHaveLength(0);
    expect(text(alle, 'hr-anmeldung')).not.toContain('Wahlannahmeerklärungen');
  });

  it('4.2: Konstituierung in der Urkunde → Ziffer mit Bedingung + Zeilen + Domizil; VR-Protokoll entfällt', () => {
    const m = agDokumentmappe({ ...ZWEI, konstituierungInUrkunde: true });
    expect(m.gates.blocker).toEqual([]);
    const ea = text(m, 'errichtungsakt');
    expect(ea).toContain('Unter der Bedingung, dass der Verwaltungsrat vollzählig anwesend ist');
    expect(ea).toContain('Anna Muster ist Präsident/in mit Einzelunterschrift.');
    expect(ea).toContain('Beat Beispiel ist Mitglied mit Kollektivunterschrift zu zweien.');
    expect(ea).toContain('Das Rechtsdomizil befindet sich an folgender Adresse: Musterweg 1, 8000 Zürich (eigene Geschäftsräume).');
    expect(ea.match(/Rechtsdomizil/g)!.length).toBeLessThanOrEqual(2); // keine doppelte Domizil-Ziffer
    expect(m.dokumente.map((d) => d.id)).not.toContain('vr-protokoll');
    expect(text(m, 'hr-anmeldung')).not.toContain('Protokoll des Verwaltungsrats');

    // Weitere Zeichnungsberechtigte → ehrlicher Blocker.
    const blockiert = pruefeAgDokGates({
      ...ZWEI,
      konstituierungInUrkunde: true,
      weitereVertretungen: [{ name: 'C', funktion: 'Direktor', zeichnungsArt: 'einzelunterschrift' }],
    });
    expect(blockiert.blocker.join(' ')).toContain('VR-Protokoll');

    // Sammel-Bug-Check Befund 1: Nicht-Gründer-VR kann die Konstituierungs-
    // Erklärung in der Gründerurkunde nicht abgeben → Blocker.
    const fremderVr = pruefeAgDokGates({
      ...ZWEI,
      konstituierungInUrkunde: true,
      verwaltungsraete: [
        ZWEI.verwaltungsraete[0],
        { name: 'Carla Extern', herkunft: 'Chur', wohnort: 'Chur', adresse: 'W 3', praesident: false, zeichnungsArt: 'kollektivzuzweien' },
      ],
    });
    expect(fremderVr.blocker.join(' ')).toContain('Carla Extern');
    expect(fremderVr.blocker.join(' ')).toContain('nicht in der Gründerliste');
  });

  it('4.2: Domizil nur in der Anmeldung → keine Domizil-Ziffer in der Urkunde', () => {
    const m = agDokumentmappe({ ...ZWEI, domizilNurAnmeldung: true });
    expect(m.gates.blocker).toEqual([]);
    expect(text(m, 'errichtungsakt')).not.toContain('Rechtsdomizil');
    expect(text(m, 'hr-anmeldung')).toContain('Musterweg 1, 8000 Zürich');
  });

  it('3.2: Agio — Zeichnung zum Ausgabebetrag, Einlagen-Total über Kapital; unter pari blockt; teil+Agio blockt', () => {
    const m = agDokumentmappe({ ...ZWEI, ausgabebetragChf: "1'200" });
    expect(m.gates.blocker).toEqual([]);
    const ea = text(m, 'errichtungsakt');
    expect(ea).toContain("zum Ausgabebetrag von CHF 1'200.00");
    expect(ea).toContain("Sämtliche Einlagen von gesamthaft CHF 240'000.00");

    expect(pruefeAgDokGates({ ...ZWEI, ausgabebetragChf: '900' }).blocker.join(' ')).toContain('unter pari');

    // Stufe 2 P1b (deklarierte fachliche Änderung 7.6.2026): Agio +
    // Teilliberierung — das Agio ist VOLL zu leisten, teilliberierbar ist
    // nur der Nennwert-Teil (Art. 632 Abs. 1 OR).
    const teilAgio = agDokumentmappe({ ...ZWEI, ausgabebetragChf: "1'200", liberierungProzent: '50' });
    expect(teilAgio.gates.blocker).toEqual([]);
    const eaT = text(teilAgio, 'errichtungsakt');
    // Nennwert-Teil: 200 × 1'000 × 50 % = 100'000; Agio: 200 × 200 = 40'000.
    expect(eaT).toContain("Einlagen von gesamthaft CHF 100'000.00 (50 % des Nennwerts jeder Aktie) in Geld");
    expect(eaT).toContain("Ausgabeagio von gesamthaft CHF 40'000.00 (CHF 200.00 je Aktie) vollständig in Geld geleistet");
    expect(eaT).toContain('im Sinne von Art. 634b OR sofort zu erbringen');
    expect(text(teilAgio, 'statuten')).toContain(
      "zu 50 % liberiert (geleistete Einlagen: CHF 100'000.00); das Ausgabeagio von CHF 40'000.00 ist vollständig geleistet",
    );
  });

  it('3.3: individuelle Liberierungsgrade — ZH-Zeilen je Gründer + effektive Summe; <20 % blockt', () => {
    const m = agDokumentmappe({
      ...ZWEI,
      liberierungProzent: '100',
      gruender: [
        { ...ZWEI.gruender[0], liberierung: '50' },
        ZWEI.gruender[1],   // leer = global 100 %
      ],
    });
    expect(m.gates.blocker).toEqual([]);
    const ea = text(m, 'errichtungsakt');
    // 120 × 1'000 × 50 % + 80 × 1'000 × 100 % = 140'000
    expect(ea).toContain("Einlagen von gesamthaft CHF 140'000.00 in Geld");
    expect(ea).toContain('Dadurch ist das Aktienkapital teilweise liberiert worden, nämlich:');
    expect(ea).toContain('– 120 Aktien von Anna Muster zu 50 %');
    expect(ea).toContain('– 80 Aktien von Beat Beispiel zu 100 %');
    expect(ea).toContain('im Sinne von Art. 634b OR sofort zu erbringen');
    expect(text(m, 'statuten')).toContain("im Umfang der geleisteten Einlagen von CHF 140'000.00 liberiert");

    expect(pruefeAgDokGates({
      ...ZWEI,
      gruender: [{ ...ZWEI.gruender[0], liberierung: '10' }, ZWEI.gruender[1]],
    }).blocker.join(' ')).toContain('Liberierungsgrad von Anna Muster');
  });

  it('4.4: Nachtrag nur auf Wunsch; ZH-3.4-Struktur; ENTWURF; ohne Änderung blockt', () => {
    expect(agDokumentmappe(BASIS).dokumente.map((d) => d.id)).not.toContain('nachtrag');

    const m = agDokumentmappe({
      ...BASIS,
      nachtragAktiv: true,
      nachtragGruendungsdatum: '2026-06-01',
      nachtragStatutenArtikel: '3',
      nachtragStatutenAbsatz: '1',
      nachtragStatutenText: 'Das Aktienkapital beträgt CHF 150\'000.00 und ist eingeteilt in 150 Namenaktien zu CHF 1\'000.00.',
    });
    expect(m.gates.blocker).toEqual([]);
    const nt = m.dokumente.find((d) => d.id === 'nachtrag')!;
    expect(nt.ergebnis.dokument.ausgabeArt).toBe('entwurf');
    const t = text(m, 'nachtrag');
    expect(t).toContain('Nachtrag zur Gründungsurkunde vom 01.06.2026');
    expect(t).toContain('infolge einer Beanstandung durch die Handelsregisterbehörde folgenden Nachtrag');
    expect(t).toContain('Art. 3 Abs. 1 der Statuten der Gesellschaft lautet neu wie folgt:');
    expect(t).toContain('Im Übrigen gilt der ursprüngliche Errichtungsakt (mit Statuten) unverändert weiter.');

    expect(pruefeAgDokGates({ ...BASIS, nachtragAktiv: true }).blocker.join(' ')).toContain('mindestens eine Änderung');
  });
});

describe('AG — Lex-Koller-Erklärung (Etappe 4.3/D16)', () => {
  it('Nur bei Immobilien-Haupttätigkeit; Ja/Nein-Antworten; Frage 4 nicht anwendbar; VR-Unterschrift', () => {
    expect(agDokumentmappe(BASIS).dokumente.map((d) => d.id)).not.toContain('lex-koller');

    const m = agDokumentmappe({
      ...BASIS,
      immobilienHauptzweck: true,
      lexKollerAuslandBeteiligt: true,
      lexKollerNeuerwerb: true,
      lexKollerGrundstueckErwerb: false,
    });
    expect(m.gates.blocker).toEqual([]);
    expect(m.dokumente.map((d) => d.id)).toContain('lex-koller');
    const t = text(m, 'lex-koller');
    expect(t).toContain('neu eine Beteiligung: Ja.');
    expect(t).toContain('Nicht-Betriebsstätte-Grundstücke in der Schweiz: Nein.');
    expect(t).toContain('4. Bei Kapitalherabsetzung: nicht anwendbar (Gründung).');
    expect(t).toContain('verweist die Anmeldenden an die zuständige kantonale Bewilligungsbehörde (Art. 18 Abs. 1 und 2 BewG)');
    expect(t).toContain('Persönliche Unterschrift eines Mitglieds des Verwaltungsrates:');
    expect(m.dokumente.find((d) => d.id === 'lex-koller')!.ergebnis.dokument.ausgabeArt).toBe('fertig');
  });
});

describe('AG — Fremdwährungs-Gründung (Etappe 3.1/D2)', () => {
  const FW_BASIS: AgDokAntworten = {
    ...BASIS,
    fremdwaehrung: true,
    waehrung: 'EUR',
    aktienkapitalChf: "120'000",
    anzahlAktien: '120',
    kursChf: '0.93',
    kursQuelle: 'Zürcher Kantonalbank',
    gruender: [{ name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '120' }],
  };

  it('EUR-Gründung: Statuten/Urkunde in Währung + Pflicht-Kurs-Satz (ZH 3.2)', () => {
    const m = agDokumentmappe(FW_BASIS);
    expect(m.gates.blocker).toEqual([]);
    expect(text(m, 'statuten')).toContain("Das Aktienkapital beträgt EUR 120'000.00 und ist eingeteilt in 120 Namenaktien zu EUR 1'000.00.");
    const ea = text(m, 'errichtungsakt');
    expect(ea).toContain("Sämtliche Einlagen von gesamthaft EUR 120'000.00 wurden in Geld geleistet");
    expect(ea).toContain("aufgrund des Umrechnungskurses per EUR 1.00 = CHF 0.93, dem Betrag von CHF 111'600.00");
    expect(ea).toContain('Dieser Umrechnungskurs entspricht dem Devisenmittelkurs der Zürcher Kantonalbank.');
  });

  it('Gegenwert-Gates 621 II/632 II + Pflichtfelder + Erstausbau-Sperre qualifiziert', () => {
    // 100'000 EUR × 0.93 = 93'000 < 100'000 → Gegenwert-Blocker (Art. 621 Abs. 2 OR).
    expect(pruefeAgDokGates({ ...FW_BASIS, aktienkapitalChf: "100'000", anzahlAktien: '100', gruender: [{ name: 'A', angaben: '', anzahl: '100' }] })
      .blocker.join(' ')).toContain('Art. 621 Abs. 2');
    // Teilliberierung: 50 % von 120'000 EUR × 0.93 = 55'800 ≥ 50'000 ✓;
    // 20 % × 0.93 = 22'320 < 50'000 → Gegenwert-Blocker (Art. 632 Abs. 2
    // Satz 2 OR). Mathematisch kann der 632-Gegenwert nur unter 50'000
    // fallen, wenn der Liberierungsgrad unter 50 % liegt (621 II garantiert
    // Gegenwert ≥ 100'000).
    expect(pruefeAgDokGates({ ...FW_BASIS, liberierungProzent: '50' }).blocker).toEqual([]);
    expect(pruefeAgDokGates({ ...FW_BASIS, liberierungProzent: '20' })
      .blocker.join(' ')).toContain('Gegenwert von mindestens CHF 50\'000');
    expect(pruefeAgDokGates({ ...FW_BASIS, kursChf: '' }).blocker.join(' ')).toContain('Umrechnungskurs');
    expect(pruefeAgDokGates({ ...FW_BASIS, kursQuelle: '' }).blocker.join(' ')).toContain('Devisenmittelkurs');
  });

  it('Stufe 2 P1a: qualifizierte Gründung in Fremdwährung — Beträge in Kapitalwährung, Kurs-Basis geleistete Einlagen', () => {
    // Deklarierte fachliche Änderung 7.6.2026: Erstausbau-Sperre aufgehoben.
    const FW_SACH: AgDokAntworten = {
      ...FW_BASIS,
      einlageArt: 'sacheinlage',
      sacheinlagen: [{
        typ: 'sachgesamtheit', bezeichnung: 'eine Werkstatteinrichtung', belegDatum: '2026-06-01',
        wertChf: "120'000", grundstueck: false, einlegerName: 'Anna Muster', aktienAnzahl: '120',
        gutschriftChf: '', zustand: 'gebraucht, betriebsbereit, regelmässig gewartet',
        imHrEingetragen: false, cheNr: '', aktivenChf: '', passivenChf: '', rueckwirkungDatum: '',
      }],
      revisorName: 'Revisia AG',
    };
    const m = agDokumentmappe(FW_SACH);
    expect(m.gates.blocker).toEqual([]);
    // Statuten-Klausel 634 IV in der Kapitalwährung
    expect(text(m, 'statuten')).toContain("bewertet mit EUR 120'000.00");
    expect(text(m, 'statuten')).toContain("120 Namenaktien zu EUR 1'000.00 ausgegeben");
    const ea = text(m, 'errichtungsakt');
    expect(ea).toContain("Bewertung EUR 120'000.00 für 120 Namenaktien");
    // Kurs-Satz-Basis = geleistete Einlagen (120'000 EUR × 0.93)
    expect(ea).toContain("dem Betrag von CHF 111'600.00");
    expect(text(m, 'gruendungsbericht')).toContain("Bewertung der Sacheinlage mit EUR 120'000.00");
    // Wert-Gate rechnet in der Kapitalwährung (Bewertung ≠ Aktien × Nennwert)
    expect(pruefeAgDokGates({
      ...FW_SACH,
      sacheinlagen: [{ ...FW_SACH.sacheinlagen[0], wertChf: "100'000" }],
    }).blocker.join(' ')).toContain("Bewertung EUR 100'000.00 muss 120 Aktien × EUR 1'000.00 (Nennwert) entsprechen");
  });

  it('CHF-Regression: ohne Weiche bleibt alles in CHF (kein Kurs-Satz)', () => {
    const m = agDokumentmappe(BASIS);
    expect(text(m, 'statuten')).toContain("Das Aktienkapital beträgt CHF 100'000.00");
    expect(text(m, 'errichtungsakt')).not.toContain('Umrechnungskurs');
  });

  it('Sammel-Bug-Check HOCH-1/MITTEL-1/HOCH-2: keine Stray-Striche; Agio-Gegenwert auf geleisteten Einlagen', () => {
    // HOCH-1: Default-VR-Zeile ohne Annahme-in-Urkunde endet OHNE «________».
    const basisM = agDokumentmappe(BASIS);
    expect(text(basisM, 'errichtungsakt')).toContain('– Anna Muster, von Basel, in Zürich\n');
    expect(text(basisM, 'errichtungsakt')).not.toContain('Zürich________');

    // MITTEL-1: Nachtrag ohne Absatz → «Art. 3 der Statuten», kein Strich.
    const nt = agDokumentmappe({
      ...BASIS, nachtragAktiv: true, nachtragStatutenArtikel: '3', nachtragStatutenText: 'Neu.',
    });
    expect(text(nt, 'nachtrag')).toContain('Art. 3 der Statuten');
    expect(text(nt, 'nachtrag')).not.toContain('3________');

    // HOCH-2: EUR + Agio (100 × Ausgabe 1'200, Kurs 1.05) → Kurs-Satz nennt
    // den Gegenwert der GELEISTETEN Einlagen: 120'000 × 1.05 = 126'000.
    const agioFw = agDokumentmappe({
      ...FW_BASIS,
      aktienkapitalChf: "120'000", anzahlAktien: '120', nennwertChf: "1'000",
      ausgabebetragChf: "1'200", kursChf: '1.05',
      gruender: [{ name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '120' }],
    });
    expect(agioFw.gates.blocker).toEqual([]);
    const ea = text(agioFw, 'errichtungsakt');
    expect(ea).toContain("Sämtliche Einlagen von gesamthaft EUR 144'000.00");
    expect(ea).toContain("dem Betrag von CHF 151'200.00");
  });
});
