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
    expect(t).toContain('Die Gründerin bzw. der Gründer stellt fest, dass:');
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
});

describe('AG-Gates — Erstausbau-Grenzen + 632-Arithmetik', () => {
  it('Inhaberaktien/Sacheinlage/Fremdwährung sperren ehrlich', () => {
    expect(pruefeAgDokGates({ ...BASIS, inhaberaktien: true }).blocker.join(' ')).toContain('NAMENAKTIEN');
    expect(pruefeAgDokGates({ ...BASIS, einlageArt: 'verrechnung' }).blocker.join(' ')).toContain('BARGRÜNDUNG');
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
