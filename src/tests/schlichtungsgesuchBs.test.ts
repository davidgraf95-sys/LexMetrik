import { describe, it, expect } from 'vitest';
import {
  SG_DEFAULTS, sgZusammenstellen, sgMaengel, sgRouting, sgHinweise,
  type SgAnswers,
} from '../lib/vorlagen/schlichtungsgesuchBs';

// Akzeptanztests 1–12 der Auftrags-Anweisung (Eingabe → erwartetes Ergebnis)

const person = (vorname: string, name: string) => ({
  typ: 'natuerlich' as const, vorname, name, strasse: 'Musterweg 1', plz: '4051', ort: 'Basel',
});

const basis = (over: Partial<SgAnswers>): SgAnswers => ({
  ...SG_DEFAULTS,
  streitgegenstandTyp: 'geldforderung',
  baselForumBestaetigt: true,
  klaeger: [person('Anna', 'Muster')],
  beklagte: [person('Ben', 'Beispiel')],
  streitgegenstand: 'Forderung aus Werkvertrag vom 01.02.2025',
  datum: '2026-06-04',
  ...over,
});

const texte = (r: ReturnType<typeof sgZusammenstellen>) =>
  r.dokument.absaetze.map((x) => `${x.ueberschrift ?? ''}\n${x.text}`).join('\n');

describe('Schlichtungsgesuch BS — Akzeptanztests', () => {
  it('1. Geldforderung mit Zins, unvertreten', () => {
    const r = sgZusammenstellen(basis({ geld: { betrag: '3000', zins: { satz: '5', abDatum: '2026-01-01' } } }));
    const t = texte(r);
    expect(t).toContain("CHF 3'000.00 nebst Zins zu 5% seit 01.01.2026 zu bezahlen");
    expect(t).toContain('Unter Kostenfolge zu Lasten der beklagten Partei.'); // ohne Entschädigung
    expect(t).toContain('Schlichtungsbehörde'); // Adressat Zivilgericht
    expect(t).toContain('Bäumleingasse 5');
    expect(r.exemplare).toBe(2);
  });

  it('2. Geldforderung + Rechtsvorschlag, anwaltlich vertreten (MwSt)', () => {
    const r = sgZusammenstellen(basis({
      geld: { betrag: '3000', rechtsoeffnung: true },
      betreibung: { nummer: '12345', betreibungsamt: 'Basel-Stadt', rechtsvorschlagErhoben: true },
      vertretung: { bezeichnung: 'Adv. X', strasse: 'Gerbergasse 1', plz: '4001', ort: 'Basel', mwstPflichtig: true, vollmachtDatum: '2026-05-01' },
    }));
    const t = texte(r);
    expect(t).toContain('Betreibung Nr. 12345 des Betreibungsamtes Basel-Stadt sei der Rechtsvorschlag zu beseitigen');
    expect(t).toContain('Unter Kosten- und Entschädigungsfolgen (zzgl. MwSt.) zu Lasten der beklagten Partei.');
    expect(t).toContain('Vollmacht vom 01.05.2026');
    expect(t.startsWith('\nAdv. X')).toBe(true); // Absender = Vertretung
  });

  it('3. Antrag auf Entscheid: nur bis CHF 2\'000; Gegentest mit Protokoll-Grund', () => {
    const ja = sgZusammenstellen(basis({ geld: { betrag: '800' }, antragEntscheid: true }));
    expect(ja.aufgenommen).toContain('antrag_entscheid');
    const nein = sgZusammenstellen(basis({ geld: { betrag: '2500' }, antragEntscheid: true }));
    expect(nein.aufgenommen).not.toContain('antrag_entscheid');
    expect(nein.nichtAufgenommen.find((n) => n.label.includes('212'))!.grund).toContain("Streitwert > CHF 2'000");
    expect(sgMaengel(basis({ geld: { betrag: '2500' }, antragEntscheid: true })).some((m) => m.text.includes('212'))).toBe(true);
  });

  it('4. Übrige Zivilsache: freie Begehren 1:1; kein rb_geld; Streitgegenstand Pflicht', () => {
    const r = sgZusammenstellen(basis({
      streitgegenstandTyp: 'uebrige_zivilsache',
      geld: undefined,
      freieRechtsbegehren: ['Die beklagte Partei sei zu verpflichten, die Einfriedung auf Parzelle Nr. 123 zu entfernen.'],
    }));
    const t = texte(r);
    expect(t).toContain('1. Die beklagte Partei sei zu verpflichten, die Einfriedung auf Parzelle Nr. 123 zu entfernen.');
    expect(t).not.toContain('zu bezahlen');
    expect(sgMaengel(basis({ streitgegenstandTyp: 'uebrige_zivilsache', streitgegenstand: '', freieRechtsbegehren: ['x'] }))
      .some((m) => m.text.includes('Streitgegenstand'))).toBe(true);
  });

  it('5. Unbezifferte Forderung (Art. 85 ZPO)', () => {
    const r = sgZusammenstellen(basis({ geld: undefined, unbeziffert: { mindestbetrag: '10000', grund: 'Höhe vom Beweisverfahren abhängig' } }));
    expect(texte(r)).toContain("mindestens jedoch CHF 10'000.00");
    expect(r.protokoll.some((p) => p.bausteinId === 'rechtsbegehren')).toBe(true);
    expect(sgHinweise(basis({ geld: undefined, unbeziffert: { mindestbetrag: '10000', grund: 'x' } }))
      .some((h) => h.includes('Art. 85'))).toBe(true);
  });

  it('6. Arbeitsrecht: kostenlos bis CHF 30\'000 (Hinweis), Adressat Zivilgericht', () => {
    const a = basis({ streitgegenstandTyp: 'arbeitsrecht', geld: { betrag: '6000' } });
    expect(sgRouting(a)).toMatchObject({ dokument: true, arbeitsrecht: true });
    expect(sgHinweise(a).some((h) => h.includes('kostenlos'))).toBe(true);
  });

  it('7. Routing Miete: Stopp-Karte mit Stelle + 30-Tage-Hinweis-Daten', () => {
    const r = sgRouting(basis({ streitgegenstandTyp: 'miete_pacht' }));
    expect(r).toMatchObject({ dokument: false, stopp: 'miete' });
    expect((r as { behoerde: { name: string; postadresse: readonly string[] } }).behoerde.name).toContain('Mietstreitigkeiten');
    expect((r as { behoerde: { postadresse: readonly string[] } }).behoerde.postadresse.join(' ')).toContain('Grenzacherstrasse 62');
  });

  it('8. Routing Gleichstellung: Stopp-Karte Diskriminierungsstelle', () => {
    const r = sgRouting(basis({ streitgegenstandTyp: 'gleichstellung_glg' }));
    expect(r).toMatchObject({ dokument: false, stopp: 'glg' });
    expect((r as { behoerde: { name: string } }).behoerde.name).toContain('Diskriminierungsfragen');
  });

  it('9. Ausnahme Art. 198: kein Dokument', () => {
    expect(sgRouting(basis({ ausnahmeArt198: true }))).toMatchObject({ dokument: false, stopp: 'art198' });
  });

  it('10. Mehrere Beklagte: Rubrum nummeriert, Exemplare = 3', () => {
    const r = sgZusammenstellen(basis({ geld: { betrag: '3000' }, beklagte: [person('Ben', 'Beispiel'), person('Clara', 'Dritt')] }));
    expect(r.exemplare).toBe(3);
    const t = texte(r);
    expect(t).toContain('1. Ben Beispiel');
    expect(t).toContain('2. Clara Dritt');
  });

  it('11. Mediation: Baustein mit Unterschriftszeilen beider Parteien', () => {
    const r = sgZusammenstellen(basis({ geld: { betrag: '3000' }, antragMediation: true }));
    expect(r.aufgenommen).toContain('antrag_mediation');
    const t = texte(r);
    expect(t).toContain('(klagende Partei)');
    expect(t).toContain('(beklagte Partei)');
  });

  it('12. Download-Gate: fremder Kanton / leerer Streitgegenstand sperren mit Mängelliste', () => {
    // Deklarierte Änderung 5.6.2026: Das Forum-Häkchen ist entfallen —
    // die Kantonsauswahl übernimmt (BS hinterlegt, andere blockieren).
    const m1 = sgMaengel(basis({ gerichtsKanton: 'ZH', geld: { betrag: '3000' } }));
    expect(m1.some((m) => m.text.includes('noch nicht hinterlegt'))).toBe(true);
    const m2 = sgMaengel(basis({ streitgegenstand: '', geld: { betrag: '3000' } }));
    expect(m2.some((m) => m.schritt === 4)).toBe(true);
    expect(sgMaengel(basis({ geld: { betrag: '3000' } }))).toEqual([]);
  });
});

describe('Bug-Check-Regressionen', () => {
  it('Dezimal-Komma wird in allen Schichten gleich behandelt', () => {
    const a = basis({ geld: { betrag: '2,500' } });
    expect(sgMaengel(a)).toEqual([]); // kein «beziffern»-Mangel
    const r = sgZusammenstellen(a);
    expect(texte(r)).toContain('CHF 2.50'); // 2,500 = 2.5 — konsistent zu fmtCHF
  });
  it('Antrag auf Entscheid: Mangel auch bei nicht-vermögensrechtlichem Typ (stale state)', () => {
    const m = sgMaengel(basis({ streitgegenstandTyp: 'uebrige_zivilsache', streitwert: '1500', antragEntscheid: true, freieRechtsbegehren: ['x'] }));
    expect(m.some((x) => x.text.includes('212'))).toBe(true);
  });
});
