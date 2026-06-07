import { describe, it, expect } from 'vitest';
import {
  agDokumentmappe,
  pruefeAgDokGates,
  AG_DOK_DEFAULTS,
  type AgDokAntworten,
} from '../lib/vorlagen/gruendungAgDokumente';

// ─── Akzeptanztests AG-Volldokumente (Plan 9b, 7.6.2026) ─────────────────────
// Wortlaut-Erwartungen aus bibliothek/recherche/gruendungsdokumente-wortlaute.md.

const BASIS: AgDokAntworten = {
  einlageArt: 'bar',
  besondereVorteile: false,
  optingOut: true,
  eigeneBueros: true,
  immobilienHauptzweck: false,
  inhaberaktien: false,
  fremdwaehrung: false,
  bankInUrkundeGenannt: true,
  chWohnsitzVertretung: true,
  leistungenChf: undefined,
  ...AG_DOK_DEFAULTS,
  firma: 'Muster Immobilien AG',
  sitz: 'Zürich',
  kanton: 'ZH',
  zweck: 'den Erwerb und die Verwaltung von Beteiligungen',
  aktienkapitalChf: "100'000",
  anzahlAktien: '100',
  nennwertChf: "1'000",
  liberierungProzent: '100',
  gruender: [{ name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '100' }],
  verwaltungsraete: [{ name: 'Anna Muster', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'Musterweg 1, 8000 Zürich', praesident: true, zeichnungsArt: 'einzelunterschrift' }],
  bankName: 'Zürcher Kantonalbank',
  bankOrt: 'Zürich',
  rechtsdomizilAdresse: 'Musterweg 1, 8000 Zürich',
  ort: 'Zürich',
  datum: '2026-06-07',
};

const text = (m: ReturnType<typeof agDokumentmappe>, id: string) => {
  const d = m.dokumente.find((x) => x.id === id || x.id.startsWith(id));
  expect(d, `Dokument ${id} fehlt (vorhanden: ${m.dokumente.map((x) => x.id).join(', ')})`).toBeDefined();
  return d!.ergebnis.dokument.absaetze.map((a) => `${a.ueberschrift ?? ''}\n${a.text}`).join('\n');
};

describe('AG-Dokumentmappe — Zusammensetzung', () => {
  it('Grundfall: Statuten, Errichtungsakt, Wahlannahme, VR-Protokoll, Anmeldung', () => {
    const m = agDokumentmappe(BASIS);
    expect(m.gates.blocker).toEqual([]);
    expect(m.dokumente.map((d) => d.id)).toEqual([
      'statuten', 'errichtungsakt', 'wahlannahme-0', 'vr-protokoll', 'hr-anmeldung',
    ]);
  });

  it('Wahlannahme + VR-Protokoll sind AG-Pflichtbelege (auch ohne besondere Weichen)', () => {
    const m = agDokumentmappe(BASIS);
    expect(text(m, 'wahlannahme-')).toContain(
      'Gerne bestätige ich Ihnen, dass ich die Wahl als Mitglied des Verwaltungsrates der Muster Immobilien AG, in Zürich, annehme.',
    );
    const vp = text(m, 'vr-protokoll');
    expect(vp).toContain('Der Verwaltungsrat konstituiert sich und erteilt seinen Mitgliedern Zeichnungsberechtigungen');
    expect(vp).toContain('Anna Muster, von Basel, in Zürich: Mitglied, Einzelunterschrift');
  });
});

describe('AG-Statuten — Rechtsstand', () => {
  it('Mindestinhalt 626: Liberierungsgrad in der Kapitalziffer; Vinkulierung nur auf Weiche', () => {
    const ohne = agDokumentmappe({ ...BASIS, zweckErweiterung: false });
    const t = text(ohne, 'statuten');
    expect(t).toContain('Unter der Firma Muster Immobilien AG besteht mit Sitz in Zürich auf unbestimmte Dauer eine Aktiengesellschaft gemäss Art. 620 ff. OR.');
    expect(t).toContain('Die Aktien sind vollständig liberiert.');
    expect(t).not.toContain('Genehmigung durch den Verwaltungsrat');
    // Etappe 0.5 (D19): Beschlussfassungsarten- und Geschäftsjahr-Artikel
    // gehören zur amtlichen ZH-KURZ-Vorlage.
    const u = ohne.dokumente[0].ergebnis.dokument.absaetze.map((a) => a.ueberschrift).filter(Boolean);
    expect(u).toEqual([
      'Art. 1 – Firma und Sitz', 'Art. 2 – Zweck', 'Art. 3 – Aktienkapital und Aktien',
      'Art. 4 – Beschlussfassungsarten der Aktionäre', 'Art. 5 – Geschäftsjahr und Buchführung',
      'Art. 6 – Mitteilungen',
    ]);

    const mit = agDokumentmappe({ ...BASIS, vinkulierung: true, liberierungProzent: '50' });
    const t2 = text(mit, 'statuten');
    // Review M-2 (7.6.2026): Art. 626 Abs. 1 Ziff. 3 OR verlangt den BETRAG
    // der geleisteten Einlagen — bei Teilliberierung beziffert.
    expect(t2).toContain("Die Aktien sind zu 50 % liberiert (geleistete Einlagen: CHF 50'000.00).");
    expect(t2).toContain('bedarf der Genehmigung durch den Verwaltungsrat');
    expect(t2).toContain('Erbgang, Erbteilung, eheliches Güterrecht oder Zwangsvollstreckung');
  });

  it('Geschäftsjahr-Artikel (ZH-Kurzvorlage verbatim) mit Eingabe-Grenzen', () => {
    const t = text(agDokumentmappe(BASIS), 'statuten');
    expect(t).toContain('Das Geschäftsjahr beginnt am 1. Januar und endet am 31. Dezember.');
    expect(t).toContain('Die Jahresrechnung, bestehend aus Erfolgsrechnung, Bilanz und Anhang, ist gemäss den Vorschriften des Schweizerischen Obligationenrechts, insbesondere der Art. 957 ff., zu erstellen.');
  });

  it('Beschlussfassungsarten: 701-III-Satz immer; Virtuell-Satz nur auf Weiche', () => {
    const ohneVirtuell = text(agDokumentmappe(BASIS), 'statuten');
    expect(ohneVirtuell).toContain('gemäss Art. 701 Abs. 3 OR auch auf schriftlichem Weg fassen');
    expect(ohneVirtuell).not.toContain('virtuell abhalten');

    const mitVirtuell = text(agDokumentmappe({ ...BASIS, virtuelleGv: true }), 'statuten');
    expect(mitVirtuell).toContain('vor Ort oder hybrid (vor Ort und virtuell) oder virtuell abhalten');
    expect(mitVirtuell).toContain('gemäss Art. 701 Abs. 3 OR auch auf schriftlichem Weg fassen');
    expect(mitVirtuell).toContain('im Einzelfall auf die Bezeichnung einer unabhängigen Stimmrechtsvertretung verzichten');
  });
});

describe('AG-Statuten — Lang-Stufe (Etappe 1/D18)', () => {
  it('Lang: vollständige Artikelfolge nach amtlicher ZH-Langvorlage', () => {
    const m = agDokumentmappe({ ...BASIS, statutenUmfang: 'lang', vinkulierung: true });
    const u = m.dokumente[0].ergebnis.dokument.absaetze.map((a) => a.ueberschrift).filter(Boolean);
    expect(u).toEqual([
      'Art. 1 – Firma und Sitz',
      'Art. 2 – Zweck',
      'Art. 3 – Aktienkapital und Aktien',
      'Art. 4 – Aktienzertifikate',
      'Art. 5 – Zerlegung und Zusammenlegung von Aktien',
      'Art. 6 – Aktienbuch',
      'Art. 7 – Übertragung der Aktien',
      'Art. 8 – Befugnisse der Generalversammlung',
      'Art. 9 – Einberufung und Traktandierung',
      'Art. 10 – Beschlussfassungsarten der Aktionäre',
      'Art. 11 – Generalversammlung mit Tagungsort',
      'Art. 12 – Vorsitz und Protokoll',
      'Art. 13 – Protokollierung von schriftlichen Beschlüssen der Aktionäre',
      'Art. 14 – Stimmrecht und Vertretung',
      'Art. 15 – Beschlussfassung',
      'Art. 16 – Wahl und Zusammensetzung des Verwaltungsrates',
      'Art. 17 – Sitzungen und Beschlussfassung des Verwaltungsrates',
      'Art. 18 – Protokollierung von Beschlüssen des Verwaltungsrates',
      'Art. 19 – Recht auf Auskunft und Einsicht',
      'Art. 20 – Aufgaben des Verwaltungsrates',
      'Art. 21 – Übertragung der Geschäftsführung und der Vertretung',
      'Art. 22 – Revision',
      'Art. 23 – Anforderungen an die Revisionsstelle',
      'Art. 24 – Geschäftsjahr und Buchführung',
      'Art. 25 – Reserven und Gewinnverwendung',
      'Art. 26 – Auflösung und Liquidation',
      'Art. 27 – Mitteilungen',
    ]);
  });

  it('Lang: virtueller GV-Artikel nur mit Weiche; Binnenverweise nummerierungsfest', () => {
    const ohne = text(agDokumentmappe({ ...BASIS, statutenUmfang: 'lang' }), 'statuten');
    expect(ohne).not.toContain('Generalversammlung ohne Tagungsort');
    expect(ohne).toContain('gemäss dem vorstehenden Artikel');       // statt ZH «nach Artikel 23»
    expect(ohne).toContain('die Beschlüsse über die Genehmigung der Jahresrechnung'); // statt ZH «Art. 8 Ziff. 3 bis 6»
    expect(ohne).not.toContain('Ziff. 3 bis 6');

    const mit = text(agDokumentmappe({ ...BASIS, statutenUmfang: 'lang', virtuelleGv: true }), 'statuten');
    expect(mit).toContain('Eine Generalversammlung kann mit elektronischen Mitteln ohne Tagungsort durchgeführt werden.');
    expect(mit).toContain('im Einzelfall auf die Bezeichnung einer unabhängigen Stimmrechtsvertretung verzichten');
  });

  it('Lang: 704-Katalog rev. (Währungswechsel, Kapitalband, Schiedsklausel) + Zustimmung ALLER bei Zusammenlegung (623 II)', () => {
    const t = text(agDokumentmappe({ ...BASIS, statutenUmfang: 'lang' }), 'statuten');
    expect(t).toContain('den Wechsel der Währung des Aktienkapitals');
    expect(t).toContain('die Einführung eines bedingten Kapitals oder die Einführung eines Kapitalbands');
    expect(t).toContain('die Einführung einer statutarischen Schiedsklausel');
    expect(t).toContain('die Zusammenlegung bedarf der Zustimmung aller betroffenen Aktionäre');
    expect(t).toContain('die Einreichung eines Gesuchs um Nachlassstundung und die Benachrichtigung des Gerichts im Falle der Überschuldung');
  });

  it('Kurz bleibt Teilmenge: keine Lang-Artikel ohne Schalter', () => {
    const t = text(agDokumentmappe(BASIS), 'statuten');
    expect(t).not.toContain('Aktienzertifikate');
    expect(t).not.toContain('unübertragbare Befugnisse');
    expect(t).not.toContain('Anforderungen an die Revisionsstelle');
  });
});

describe('AG-Statuten — Norm-Anker-Regressionsschutz', () => {
  it('virtuelle GV zitiert Art. 701d OR (Review H-1)', () => {
    const m = agDokumentmappe({ ...BASIS, virtuelleGv: true });
    const st = m.dokumente.find((d) => d.id === 'statuten')!;
    const eintrag = st.ergebnis.protokoll.find((p) => p.bausteinId === 'AS13_beschlussfassung_virtuell');
    expect(eintrag?.norm).toBe('Art. 701d OR');
  });
});

describe('AG-Errichtungsakt — Feststellungen 629 II + Liberierungs-Varianten', () => {
  it('Volliberierung: Verpflichtungssatz (630) + alle 4 Feststellungen + Opting-out', () => {
    const t = text(agDokumentmappe(BASIS), 'errichtungsakt');
    expect(t).toContain('verpflichtet sich hiermit bedingungslos, die dem Ausgabebetrag der gezeichneten Aktien entsprechende Einlage zu leisten');
    expect(t).toContain('sämtliche Aktien gültig gezeichnet sind');
    expect(t).toContain('die versprochenen Einlagen dem gesamten Ausgabebetrag entsprechen');
    expect(t).toContain('keine anderen Sacheinlagen, Verrechnungstatbestände oder besonderen Vorteile bestehen, als die in den Belegen genannten');
    expect(t).toContain('Auf eine Revision wird verzichtet');
    expect(t).toContain('bei der Zürcher Kantonalbank, Zürich');
  });

  it('Teilliberierung 50 %: Einlagen-Variante mit einbezahltem Betrag + 634b-Resteinlagesatz (0.3, ZH verbatim)', () => {
    const t = text(agDokumentmappe({ ...BASIS, liberierungProzent: '50' }), 'errichtungsakt');
    expect(t).toContain("Einlagen von gesamthaft CHF 50'000.00 (50 % des Nennwerts jeder Aktie)");
    expect(t).toContain('auf erstes Verlangen des Verwaltungsrates die restliche und vollständige Leistung der Einlage im Sinne von Art. 634b OR sofort zu erbringen');
    expect(t).not.toContain('sobald er es für nötig erachtet');
  });
});

describe('AG-Errichtungsakt — Numerus (D1) + Ziffern-Nummerierung (D10)', () => {
  const ZWEI_GRUENDER: AgDokAntworten = {
    ...BASIS,
    gruender: [
      { name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '60' },
      { name: 'Beat Beispiel', angaben: 'von Bern, in Bern', anzahl: '40' },
    ],
  };

  it('Einpersonen-Gründung: Urkunde im Singular (Erläuterung ZH-Vorlage 3.1/3.5)', () => {
    const t = text(agDokumentmappe(BASIS), 'errichtungsakt');
    expect(t).toContain('Vor der unterzeichnenden Urkundsperson ist heute erschienen:');
    expect(t).toContain('Die erschienene Person erklärt,');
    expect(t).toContain('Die Gründerin bzw. der Gründer verpflichtet sich hiermit bedingungslos');
    expect(t).toContain('Die Gründerin bzw. der Gründer stellt fest, dass:');
    // Bug-Check-Befund 1 (7.6.2026): Verzichtsträger bleibt benannt
    // (Art. 62 Abs. 1 lit. c HRegV — «sämtliche Aktionärinnen und Aktionäre»).
    expect(t).toContain('als einzige Aktionärin bzw. einziger Aktionär auf eine eingeschränkte Revision verzichtet');
    expect(t).toContain('Abschliessend erklärt die erschienene Person');
    expect(t).toContain('der Gründerin bzw. dem Gründer vorgelegen haben');
    expect(t).not.toContain('Die erschienenen Personen erklären');
  });

  it('Mehrpersonen-Gründung: Urkunde im Plural', () => {
    const t = text(agDokumentmappe(ZWEI_GRUENDER), 'errichtungsakt');
    expect(t).toContain('Vor der unterzeichnenden Urkundsperson sind heute erschienen:');
    expect(t).toContain('Die erschienenen Personen erklären,');
    expect(t).toContain('Die Gründerinnen und Gründer stellen fest, dass:');
    expect(t).not.toContain('Die erschienene Person erklärt,');
  });

  it('Römische Ziffern lückenlos; Vollmacht nur mit benannter Person; Urkundsperson-Block unnummeriert', () => {
    const ohne = agDokumentmappe(BASIS);
    const ue = (m: ReturnType<typeof agDokumentmappe>) => m.dokumente
      .find((d) => d.id === 'errichtungsakt')!.ergebnis.dokument.absaetze
      .map((a) => a.ueberschrift).filter(Boolean);
    expect(ue(ohne)).toEqual([
      'I. Gründungserklärung und Statuten', 'II. Aktienkapital und Zeichnung', 'III. Einlagen',
      'IV. Feststellungen', 'V. Organe', 'VI. Rechtsdomizil', 'VII. Gründungserklärung',
      'Bestätigung der Urkundsperson',
    ]);
    const mit = agDokumentmappe({ ...BASIS, nachtragsbevollmaechtigter: 'Max Muster, 1.1.1990, von Chur, Weg 1, 7000 Chur' });
    expect(ue(mit)).toEqual([
      'I. Gründungserklärung und Statuten', 'II. Aktienkapital und Zeichnung', 'III. Einlagen',
      'IV. Feststellungen', 'V. Organe', 'VI. Rechtsdomizil', 'VII. Vollmacht',
      'VIII. Gründungserklärung', 'Bestätigung der Urkundsperson',
    ]);
    expect(text(mit, 'errichtungsakt')).toContain('bevollmächtigt Max Muster, 1.1.1990, von Chur, Weg 1, 7000 Chur');
  });

  it('Eingliedriger VR: «Als Mitglied … wird gewählt»; mehrgliedrig Plural', () => {
    expect(text(agDokumentmappe(BASIS), 'errichtungsakt')).toContain('Als Mitglied des Verwaltungsrates wird gewählt:');
    const zweiVr = agDokumentmappe({
      ...ZWEI_GRUENDER,
      verwaltungsraete: [
        { ...BASIS.verwaltungsraete[0], praesident: true },
        { name: 'Beat Beispiel', herkunft: 'Bern', wohnort: 'Bern', adresse: 'W 2', praesident: false, zeichnungsArt: 'kollektivzuzweien' },
      ],
    });
    expect(text(zweiVr, 'errichtungsakt')).toContain('Als Mitglieder des Verwaltungsrates werden gewählt:');
  });
});

describe('AG-VR-Protokoll — Formalia (D13/D14) + Wahlannahme RS (0.6)', () => {
  it('Protokoll-Kopf mit Beginn/Abwesend; Ende-Zeile vor den Unterschriften', () => {
    const t = text(agDokumentmappe({ ...BASIS, sitzungBeginn: '11.00', sitzungEnde: '11.15' }), 'vr-protokoll');
    expect(t).toContain('Beginn der Sitzung: 11.00 Uhr');
    expect(t).toContain('Abwesend: keine');
    expect(t).toContain('Ende der Sitzung: 11.15 Uhr');
  });

  it('VR ohne Zeichnungsberechtigung: Zeile nach ZH-Muster; alle ohne → Blocker 718 III', () => {
    const m = agDokumentmappe({
      ...BASIS,
      gruender: [
        { name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '60' },
        { name: 'Paul Muster', angaben: 'von Basel, in Zürich', anzahl: '40' },
      ],
      verwaltungsraete: [
        { ...BASIS.verwaltungsraete[0], praesident: true },
        { name: 'Paul Muster', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'W 2', praesident: false, zeichnungsArt: 'ohne' },
      ],
    });
    expect(m.gates.blocker).toEqual([]);
    expect(text(m, 'vr-protokoll')).toContain('Paul Muster, von Basel, in Zürich: Mitglied, ohne Zeichnungsberechtigung');

    const alleOhne = pruefeAgDokGates({
      ...BASIS,
      verwaltungsraete: [{ ...BASIS.verwaltungsraete[0], zeichnungsArt: 'ohne' }],
    });
    expect(alleOhne.blocker.join(' ')).toContain('Art. 718 Abs. 3');
  });

  it('Kollektivprokura zu zweien für weitere Zeichnungsberechtigte', () => {
    const m = agDokumentmappe({
      ...BASIS,
      weitereVertretungen: [{ name: 'Martin Specimen', funktion: 'Prokurist', zeichnungsArt: 'kollektivprokura' }],
    });
    expect(text(m, 'vr-protokoll')).toContain('Martin Specimen, als Prokurist, mit Kollektivprokura zu zweien');
  });

  it('Revisionsstelle bestellt → Wahlannahmeerklärung der Revisionsstelle in der Mappe', () => {
    const m = agDokumentmappe({
      ...BASIS,
      optingOut: false,
      revisionsstelleName: 'Revisia AG',
      revisionsstelleSitz: 'Zürich',
    });
    expect(m.dokumente.map((d) => d.id)).toContain('wahlannahme-rs');
    expect(text(m, 'wahlannahme-rs')).toContain('Gerne bestätigen wir Ihnen, dass wir die Wahl als Revisionsstelle der Muster Immobilien AG, in Zürich, annehmen.');
  });

  it('Revisionsstelle ohne Sitz → Blocker (Bug-Check Agent 1: Beleg-Inhalt Art. 44 lit. f HRegV)', () => {
    const g = pruefeAgDokGates({ ...BASIS, optingOut: false, revisionsstelleName: 'Revisia AG', revisionsstelleSitz: '' });
    expect(g.blocker.join(' ')).toContain('Name und Sitz');
  });
});

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

    expect(pruefeAgDokGates({ ...SACH_BASIS, liberierungProzent: '50' }).blocker.join(' ')).toContain('Teilliberierung nur bei der reinen Bargründung');
  });
});

describe('AG-Gates — Erstausbau-Grenzen + 632-Arithmetik', () => {
  it('Inhaberaktien/Sacheinlage/Fremdwährung sperren ehrlich', () => {
    expect(pruefeAgDokGates({ ...BASIS, inhaberaktien: true }).blocker.join(' ')).toContain('NAMENAKTIEN');
    // Qualifizierte Gründung (FAHRPLAN-AG-GRUENDUNG Etappe 2): Verrechnung
    // ist nicht mehr pauschal gesperrt (alter BARGRÜNDUNG-Blocker), das Gate
    // bleibt aber ehrlich — ohne erfasste Verrechnungszeile blockt es.
    expect(pruefeAgDokGates({ ...BASIS, einlageArt: 'verrechnung' }).blocker.join(' ')).toContain('Verrechnungsliberierung erfassen');
    expect(pruefeAgDokGates({ ...BASIS, fremdwaehrung: true }).blocker.join(' ')).toContain('CHF');
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
