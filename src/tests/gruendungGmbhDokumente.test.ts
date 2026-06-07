import { describe, it, expect } from 'vitest';
import {
  gmbhDokumentmappe,
  pruefeGmbhDokGates,
  GMBH_DOK_DEFAULTS,
  type GmbhDokAntworten,
} from '../lib/vorlagen/gruendungGmbhDokumente';

// ─── Akzeptanztests GmbH-Volldokumente (Plan 9b, 7.6.2026) ───────────────────
// Wortlaut-Erwartungen aus bibliothek/recherche/gruendungsdokumente-wortlaute.md
// (amtliche Muster ZH 26.7.2024 / SG / GL; Norm-Kerne OR-Cache 1.1.2026).

const BASIS: GmbhDokAntworten = {
  // Checklisten-Weichen (GmbhGruendungEingaben)
  einlageArt: 'bar',
  besondereVorteile: false,
  gfGewaehlt: true,
  mehrereGeschaeftsfuehrer: false,
  weitereVertretungsberechtigte: false,
  optingOut: true,
  eigeneBueros: true,
  immobilienHauptzweck: false,
  auslJurPersonGesellschafter: false,
  fremdwaehrung: false,
  bankInUrkundeGenannt: true,
  chWohnsitzVertretung: true,
  statutKlauseln: [],
  leistungenChf: undefined,
  // Identität
  ...GMBH_DOK_DEFAULTS,
  firma: 'Muster Treuhand GmbH',
  sitz: 'Zürich',
  kanton: 'ZH',
  zweck: 'die Erbringung von Treuhanddienstleistungen',
  stammkapitalChf: "20'000",
  anzahlAnteile: '20',
  nennwertChf: "1'000",
  gruender: [{ name: 'Anna Muster', angaben: 'von Basel, in Zürich, Musterweg 1', anzahl: '20' }],
  geschaeftsfuehrer: [{ name: 'Anna Muster', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'Musterweg 1, 8000 Zürich', vorsitz: true, zeichnungsArt: 'einzelunterschrift' }],
  bankName: 'Zürcher Kantonalbank',
  bankOrt: 'Zürich',
  rechtsdomizilAdresse: 'Musterweg 1, 8000 Zürich',
  ort: 'Zürich',
  datum: '2026-06-07',
};

const text = (m: ReturnType<typeof gmbhDokumentmappe>, id: string) => {
  const d = m.dokumente.find((x) => x.id === id || x.id.startsWith(id));
  expect(d, `Dokument ${id} fehlt (vorhanden: ${m.dokumente.map((x) => x.id).join(', ')})`).toBeDefined();
  return d!.ergebnis.dokument.absaetze.map((a) => `${a.ueberschrift ?? ''}\n${a.text}`).join('\n');
};

describe('GmbH-Dokumentmappe — Zusammensetzung', () => {
  it('Grundfall (1 Person, bar, Opting-out, eigenes Büro): 4 Dokumente', () => {
    const m = gmbhDokumentmappe(BASIS);
    expect(m.gates.blocker).toEqual([]);
    // Wahlannahme-IDs über den Listenindex (Review M-1 7.6.2026: Namens-
    // Kollisionen dürfen keine Dokumente verdecken).
    expect(m.dokumente.map((d) => d.id)).toEqual([
      'statuten', 'errichtungsakt', 'wahlannahme-0', 'hr-anmeldung',
    ]);
  });

  it('c/o-Domizil → Domizilannahme; 2 GF → Vorsitz-Beschluss; RS → keine Opting-out-Feststellung', () => {
    const m = gmbhDokumentmappe({
      ...BASIS,
      eigeneBueros: false,
      domizilhalterName: 'Treuhand AG',
      domizilhalterAdresse: 'Bahnhofstrasse 1, 8001 Zürich',
      optingOut: false,
      revisionsstelleName: 'Revisia AG',
      revisionsstelleSitz: 'Zürich',
      geschaeftsfuehrer: [
        ...BASIS.geschaeftsfuehrer,
        { name: 'Beat Beispiel', herkunft: 'Bern', wohnort: 'Bern', adresse: 'Beispielgasse 2, 3000 Bern', vorsitz: false, zeichnungsArt: 'kollektivzuzweien' },
      ],
    });
    expect(m.gates.blocker).toEqual([]);
    const ids = m.dokumente.map((d) => d.id);
    expect(ids).toContain('domizilannahme');
    expect(ids).toContain('vorsitz-beschluss');
    const ea = text(m, 'errichtungsakt');
    expect(ea).toContain('Als Revisionsstelle wird gewählt: Revisia AG, Zürich.');
    expect(ea).not.toContain('Auf eine Revision wird verzichtet');
    expect(text(m, 'domizilannahme')).toContain(
      'Gerne bestätigen wir Ihnen, dass wir der Muster Treuhand GmbH, mit Sitz in Zürich, an unserer Adresse (Bahnhofstrasse 1, 8001 Zürich) Domizil gewähren.',
    );
    expect(text(m, 'vorsitz-beschluss')).toContain('Der Vorsitz der Geschäftsführung wird Anna Muster übertragen.');
  });
});

describe('GmbH-Statuten — Rechtsstand + Nummerierung', () => {
  it('Mindestinhalt (Art. 776 OR): 4 Pflichtbausteine, Artikel fortlaufend nummeriert', () => {
    const m = gmbhDokumentmappe({ ...BASIS, zweckErweiterung: false });
    const st = m.dokumente.find((d) => d.id === 'statuten')!;
    const ueberschriften = st.ergebnis.dokument.absaetze.map((a) => a.ueberschrift).filter(Boolean);
    expect(ueberschriften).toEqual([
      'Art. 1 – Firma und Sitz',
      'Art. 2 – Zweck',
      'Art. 3 – Stammkapital und Stammanteile',
      'Art. 4 – Mitteilungen',
    ]);
    const t = text(m, 'statuten');
    expect(t).toContain('Unter der Firma Muster Treuhand GmbH besteht mit Sitz in Zürich auf unbestimmte Dauer eine Gesellschaft mit beschränkter Haftung gemäss Art. 772 ff. OR.');
    expect(t).toContain("Das Stammkapital beträgt CHF 20'000.00. Es ist eingeteilt in 20 Stammanteile zu CHF 1'000.00.");
    expect(t).toContain('per Brief oder E-Mail an die im Anteilbuch verzeichneten Adressen');
    // Rechtsstand: keine SHAB-Bekanntmachungs-Pflichtziffer, kein aufgehobener 776a-Bezug
    expect(t).not.toContain('776a');
  });

  it('virtuelle GV: Norm-Anker ist die materielle Grundlage Art. 701d OR (Review H-1 — Regressionsschutz)', () => {
    const m = gmbhDokumentmappe({ ...BASIS, virtuelleGv: true });
    const st = m.dokumente.find((d) => d.id === 'statuten')!;
    const eintrag = st.ergebnis.protokoll.find((p) => p.bausteinId === 'ST19_virtuelle_gv');
    expect(eintrag?.norm).toBe('Art. 701d OR'); // NICHT die blosse Verweisungsnorm 805 V Ziff. 2bis
    expect(eintrag?.begruendung).toContain('Art. 805 Abs. 5 Ziff. 2bis');
  });

  it('bedingte Klauseln schieben die Nummerierung lückenlos (Vorkaufsrecht 30/60-Tage-Fristen)', () => {
    const m = gmbhDokumentmappe({ ...BASIS, statutKlauseln: ['vorkaufsrecht'] });
    const st = m.dokumente.find((d) => d.id === 'statuten')!;
    const u = st.ergebnis.dokument.absaetze.map((a) => a.ueberschrift).filter(Boolean);
    expect(u).toContain('Art. 4 – Vorkaufsrecht: Verfahren');
    expect(u).toContain('Art. 5 – Vorkaufsrecht: Preis');
    expect(u).toContain('Art. 6 – Mitteilungen');
    const t = text(m, 'statuten');
    expect(t).toContain('innerhalb von 30 Tagen seit dessen Eintritt');
    expect(t).toContain('innerhalb einer Frist von 60 Tagen seit Empfang der Mitteilung');
    expect(t).toContain('zugelassenen Revisionsexperten als Schiedsgutachter');
  });

  it('Nachschussklausel trägt den Betrag; Gate sperrt über dem Doppelten des Nennwerts (795 II)', () => {
    const ok = gmbhDokumentmappe({ ...BASIS, statutKlauseln: ['nachschuss'], nachschussBetragChf: "2'000" });
    expect(ok.gates.blocker).toEqual([]);
    expect(text(ok, 'statuten')).toContain("beträgt CHF 2'000.00");
    const zuViel = pruefeGmbhDokGates({ ...BASIS, statutKlauseln: ['nachschuss'], nachschussBetragChf: "2'001" });
    expect(zuViel.blocker.join(' ')).toContain('Doppelte des Nennwerts');
  });
});

describe('GmbH-Errichtungsakt — Feststellungen + 777a-Hinweise', () => {
  it('ohne Nachschuss/Nebenleistung: Feststellungs-Ziffer 4 fehlt; Bank in der Urkunde genannt', () => {
    const t = text(gmbhDokumentmappe(BASIS), 'errichtungsakt');
    expect(t).toContain('sämtliche Stammanteile gültig gezeichnet sind');
    expect(t).not.toContain('Nachschuss- oder Nebenleistungspflichten übernehmen');
    expect(t).toContain('keine anderen Sacheinlagen, Verrechnungstatbestände oder besonderen Vorteile bestehen, als die in den Belegen genannten');
    expect(t).toContain('bei der Zürcher Kantonalbank, Zürich');
    expect(t).toContain('Auf eine Revision wird verzichtet');
    expect(t).toContain('nicht mehr als zehn Vollzeitstellen im Jahresdurchschnitt');
  });

  it('mit Nachschussklausel: Ziffer 4 enthalten + 777a-II-Hinweisblock (ohne Stimmrecht/Veto)', () => {
    const m = gmbhDokumentmappe({
      ...BASIS,
      statutKlauseln: ['nachschuss', 'stimmrechtNachAnteilen', 'vetorecht'],
      nachschussBetragChf: "1'000",
      vetoBeschluesse: 'Statutenänderungen',
    });
    const t = text(m, 'errichtungsakt');
    expect(t).toContain('sie die statutarischen Nachschuss- oder Nebenleistungspflichten übernehmen');
    expect(t).toContain('Art. 777a Abs. 2 OR');
    expect(t).toContain('– Nachschusspflichten');
    // Stimmrecht/Vetorecht stehen NICHT im Hinweis-Katalog des Art. 777a Abs. 2
    expect(t).not.toContain('– Stimmrecht');
    expect(t).not.toContain('– Vetorecht');
  });

  it('Bank nicht in der Urkunde → Bescheinigungs-Variante + Beleg in der 777b-Liste', () => {
    const t = text(gmbhDokumentmappe({ ...BASIS, bankInUrkundeGenannt: false }), 'errichtungsakt');
    expect(t).toContain('gemäss separater Bescheinigung');
    expect(t).toContain('die Bestätigung über die Hinterlegung der Einlagen in Geld');
  });
});

describe('GmbH-Erklärungen + HR-Anmeldung', () => {
  it('Wahlannahme: ZH-Kernsatz verbatim', () => {
    const t = text(gmbhDokumentmappe(BASIS), 'wahlannahme-');
    expect(t).toContain('Gerne bestätige ich Ihnen, dass ich die Wahl als Mitglied der Geschäftsführung der Muster Treuhand GmbH, in Zürich, annehme.');
  });

  it('HR-Anmeldung: Adressat aus Kanton, Beilagen ohne Vorbereitungs-Schritte', () => {
    const t = text(gmbhDokumentmappe(BASIS), 'hr-anmeldung');
    expect(t).toContain('Handelsregisteramt des Kantons ZH');
    expect(t).toContain('Anmeldung zur Eintragung der Gründung der Muster Treuhand GmbH');
    expect(t).toContain('Öffentliche Urkunde über den Errichtungsakt');
    expect(t).not.toContain('Statutenentwurf');           // nur die definitive Fassung ist Beleg
    expect(t).not.toContain('Kapitaleinzahlung auf Sperrkonto'); // Vorbereitungsschritt, kein Beleg
  });
});

describe('GmbH-Gates — Erstausbau-Grenzen + Arithmetik', () => {
  it('Sacheinlage/Fremdwährung sperren die Mappe ehrlich (Checkliste bleibt zuständig)', () => {
    expect(gmbhDokumentmappe({ ...BASIS, einlageArt: 'sacheinlage' }).dokumente).toEqual([]);
    expect(pruefeGmbhDokGates({ ...BASIS, einlageArt: 'sacheinlage' }).blocker.join(' ')).toContain('BARGRÜNDUNG');
    expect(pruefeGmbhDokGates({ ...BASIS, fremdwaehrung: true }).blocker.join(' ')).toContain('CHF');
  });

  it('Kapital-Arithmetik: Anzahl × Nennwert = Stammkapital; Zeichnungen decken alle Anteile', () => {
    expect(pruefeGmbhDokGates({ ...BASIS, nennwertChf: '999' }).blocker.join(' ')).toContain('Rechnerische Unstimmigkeit');
    expect(pruefeGmbhDokGates({ ...BASIS, gruender: [{ name: 'A', angaben: '', anzahl: '19' }] }).blocker.join(' ')).toContain('Art. 777 Abs. 2 Ziff. 1');
    expect(pruefeGmbhDokGates({ ...BASIS, stammkapitalChf: "19'000", anzahlAnteile: '19' }).blocker.join(' ')).toContain("CHF 20'000");
  });

  it('Formstufen: Statuten/Errichtungsakt = entwurf, übrige = fertig', () => {
    const m = gmbhDokumentmappe(BASIS);
    const art = Object.fromEntries(m.dokumente.map((d) => [d.id, d.ergebnis.dokument.ausgabeArt]));
    expect(art['statuten']).toBe('entwurf');
    expect(art['errichtungsakt']).toBe('entwurf');
    expect(art['hr-anmeldung']).toBe('fertig');
    expect(art['wahlannahme-0']).toBe('fertig');
  });
});
