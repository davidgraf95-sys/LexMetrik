import { describe, it, expect } from 'vitest';
import { docxAbsaetze } from '../lib/vorlagen/vorlagenDocx';
import { BANNER_UNTERSCHREIBEN } from '../lib/vorlagen/vorlagenPdf';
import { pvZusammenstellen, pruefePvGates, PV_DEFAULTS } from '../lib/vorlagen/patientenverfuegung';
import { pv } from './vorlagen.helfer';

// ─── DOCX-Renderer (Teil II «Ausgabe & Export») ──────────────────────────────

describe('Vorlagen-DOCX (eine Quelle, mehrere Renderer)', () => {
  it('deterministisch und inhaltsgleich mit dem Dokumentmodell (inkl. Banner)', () => {
    const e = pvZusammenstellen(pv({ situationen: ['terminal'], ziel: 'palliativ' }));
    const a1 = docxAbsaetze(e, BANNER_UNTERSCHREIBEN);
    const a2 = docxAbsaetze(e, BANNER_UNTERSCHREIBEN);
    expect(JSON.stringify(a1)).toBe(JSON.stringify(a2));
    // Formhinweis sichtbar im Kopf
    expect(a1[0]).toEqual({ typ: 'banner-titel', text: BANNER_UNTERSCHREIBEN.titel });
    // Jeder Modell-Absatz erscheint im DOCX (identischer Inhalt)
    const texte = a1.map((x) => x.text).join('\n');
    e.dokument.absaetze.forEach((abs) => {
      abs.text.split('\n').forEach((zeile) => expect(texte).toContain(zeile));
      if (abs.ueberschrift) expect(texte).toContain(abs.ueberschrift);
    });
    expect(texte).toContain(e.dokument.titel);
    expect(texte).toContain(e.dokument.disclaimer);
    expect(texte).toContain(`Bausteine v${e.dokument.version}`);
  });
});

// ── Formatvorlagen-Renderer (Review-Zusatztests 5.6.2026) ───────────────────

describe('Formatvorlagen (DOCX-Absatzmodell)', () => {
  it('eingabe: kein Dokumenttitel – der fette Betreff trägt ihn; Rollen durchgereicht', async () => {
    const { sgZusammenstellen, SG_DEFAULTS, SG_PERSON_NATUERLICH } = await import('../lib/vorlagen/schlichtungsgesuchBs');
    const r = sgZusammenstellen({
      ...SG_DEFAULTS,
      streitgegenstandTyp: 'geldforderung', baselForumBestaetigt: true,
      klaeger: [{ ...SG_PERSON_NATUERLICH, vorname: 'A', name: 'B', strasse: 'S 1', plz: '4051', ort: 'Basel' }],
      beklagte: [{ ...SG_PERSON_NATUERLICH, vorname: 'C', name: 'D', strasse: 'S 2', plz: '4052', ort: 'Basel' }],
      geld: { betrag: '1000' }, streitgegenstand: 'Forderung', datum: '2026-06-05',
    });
    expect(r.dokument.format).toBe('eingabe');
    const liste = docxAbsaetze(r);
    expect(liste.some((x) => x.typ === 'titel')).toBe(false);
    expect(liste.some((x) => x.typ === 'absatz' && x.rolle === 'betreff')).toBe(true);
    expect(liste.some((x) => x.typ === 'absatz' && x.rolle === 'datumzeile')).toBe(true);
    // langes Datumsformat in der Datumszeile
    expect(liste.find((x) => x.typ === 'absatz' && x.rolle === 'datumzeile')?.text).toContain('5. Juni 2026');
  });

  it('verfuegung: Dokumenttitel vorhanden (Gegenprobe)', () => {
    const r = pvZusammenstellen(pv({}));
    expect(r.dokument.format).toBe('verfuegung');
    expect(docxAbsaetze(r).some((x) => x.typ === 'titel')).toBe(true);
  });
});

// ── Audit-Regressionen 5.6.2026 ─────────────────────────────────────────────

describe('Audit-Fixes Vorlagen', () => {
  it('H1: Vorlagen-PDF-Text verdreht KEINE Datums-Muster im Freitext (Betreibungsnummer bleibt)', async () => {
    const { vorlagenPdfText } = await import('../lib/vorlagen/vorlagenPdf');
    expect(vorlagenPdfText('Betreibung Nr. 2025-12-31 des Betreibungsamts')).toContain('2025-12-31');
    expect(vorlagenPdfText('Forderung Nr. 2024-13-99')).toContain('2024-13-99');
  });

  it('M2: PV-R6 erkennt normalisierte Umgehungen (Doppel-Leerzeichen, Bindestrich, Zeilenumbruch, getrennt)', () => {
    const f = (text: string) => pruefePvGates({ ...PV_DEFAULTS, einstellungLeben: text }).blocker.length > 0;
    expect(f('Ich wünsche aktive  Sterbehilfe')).toBe(true);
    expect(f('aktive-sterbehilfe')).toBe(true);
    expect(f('aktive\nSterbehilfe')).toBe(true);
    expect(f('Kontakt zu einer Sterbehilfe Organisation')).toBe(true);
    expect(f('Ich wünsche palliative Begleitung')).toBe(false);
  });

  it('M1: Testament warnt bei Einzelquoten ausserhalb 0–100 % auch wenn die Summe 100 ergibt', async () => {
    const { pruefeGates, TESTAMENT_DEFAULTS } = await import('../lib/vorlagen/testament');
    const r = pruefeGates({
      ...TESTAMENT_DEFAULTS,
      vorname: 'A', nachname: 'B', geburtsdatum: '1960-01-01', heimatort: 'Basel', adresse: 'X 1',
      ortErrichtung: 'Basel', datumErrichtung: '2026-06-05',
      erben: [
        { name: 'E1', angaben: '', quoteProzent: -50 },
        { name: 'E2', angaben: '', quoteProzent: 150 },
      ],
    });
    expect(r.warnungen.join()).toMatch(/ungültig/);
  });
});

// ── Formatvorlagen-SSoT + AusgabeArt (Grundlagen-Berichte 5.6.2026) ─────────

describe('Formatvorlagen (AusgabeArt-Matrix)', () => {
  it('Matrix hart kodiert: abschrift ohne DOCX; entwurf mit Wasserzeichen; Eingabe mit Korrekturrand', async () => {
    const { AUSGABE_REGELN, FORMAT_TYPOGRAFIE } = await import('../lib/vorlagen/formatvorlagen');
    expect(AUSGABE_REGELN.abschrift.docxErlaubt).toBe(false);
    expect(AUSGABE_REGELN.entwurf.wasserzeichen).toBe('ENTWURF');
    expect(AUSGABE_REGELN.fertig.docxErlaubt).toBe(true);
    expect(FORMAT_TYPOGRAFIE.eingabe.randRechts).toBeGreaterThan(FORMAT_TYPOGRAFIE.eingabe.randLinks);
    expect(FORMAT_TYPOGRAFIE.eingabe.docx.randRechtsTwips).toBeGreaterThan(FORMAT_TYPOGRAFIE.eingabe.docx.randLinksTwips);
  });

  it('ausgabeArt je Schema: Testament=abschrift; PV=fertig; VA eigenhändig=abschrift / beurkundet=ENTWURF', async () => {
    const { TESTAMENT_SCHEMA } = await import('../lib/vorlagen/testament');
    expect(TESTAMENT_SCHEMA.ausgabeArt).toBe('abschrift');
    expect(pvZusammenstellen(pv({})).dokument.ausgabeArt).toBe('fertig');
    const { vaZusammenstellen, VA_DEFAULTS } = await import('../lib/vorlagen/vorsorgeauftrag');
    expect(vaZusammenstellen({ ...VA_DEFAULTS, formMode: 'eigenhaendig' }).dokument.ausgabeArt).toBe('abschrift');
    expect(vaZusammenstellen({ ...VA_DEFAULTS, formMode: 'oeffentlich_beurkundet' }).dokument.ausgabeArt).toBe('entwurf');
  });

  it('DOCX-Sperre für Abschreibe-Mustertexte greift hart (Form-Gate-Matrix)', async () => {
    const { vorlagenDocxErzeugen } = await import('../lib/vorlagen/vorlagenDocx');
    const { testamentZusammenstellen, TESTAMENT_DEFAULTS } = await import('../lib/vorlagen/testament');
    const t = testamentZusammenstellen({ ...TESTAMENT_DEFAULTS, vorname: 'A', nachname: 'B' });
    await expect(vorlagenDocxErzeugen(t, { dateiName: 'x.docx' })).rejects.toThrow(/gesperrt/);
  });

  it('Eingabe-Anatomie: Anrede, Schlussformel und Doppel-Vermerk im Schlichtungsgesuch (Usanz-Bausteine)', async () => {
    const { sgZusammenstellen, SG_DEFAULTS, SG_PERSON_NATUERLICH } = await import('../lib/vorlagen/schlichtungsgesuchBs');
    const r = sgZusammenstellen({
      ...SG_DEFAULTS, streitgegenstandTyp: 'geldforderung', baselForumBestaetigt: true,
      klaeger: [{ ...SG_PERSON_NATUERLICH, vorname: 'A', name: 'B', strasse: 'S 1', plz: '4051', ort: 'Basel' }],
      beklagte: [{ ...SG_PERSON_NATUERLICH, vorname: 'C', name: 'D', strasse: 'S 2', plz: '4052', ort: 'Basel' }],
      geld: { betrag: '1000' }, streitgegenstand: 'Forderung', datum: '2026-06-05',
    });
    const rollen = r.dokument.absaetze.map((x) => x.rolle);
    expect(rollen).toContain('anrede');
    expect(rollen).toContain('schlussformel');
    const texte = r.dokument.absaetze.map((x) => x.text).join('\n');
    expect(texte).toMatch(/Sehr geehrte Damen und Herren/);
    expect(texte).toMatch(/Hiermit stelle ich folgende/);
    expect(texte).toMatch(/im Doppel/);
    // Reihenfolge: Anrede VOR den Rechtsbegehren, Schlussformel VOR der Unterschrift
    const ids = r.dokument.absaetze.map((x) => x.bausteinId);
    expect(ids.indexOf('anrede')).toBeLessThan(ids.findIndex((i) => i === 'rechtsbegehren'));
    expect(ids.indexOf('schlussformel')).toBeLessThan(ids.indexOf('unterschrift'));
  });
});

describe('Vorschau ≙ Output (werkgetreuer Renderer, 5.6.2026)', () => {
  it('Vorschau interpretiert dieselben MUSTER wie PDF/DOCX (SSoT) – Anatomie-Stichproben', async () => {
    const { renderToString } = await import('react-dom/server');
    const React = await import('react');
    const { VorschauPanel } = await import('../components/vorlagen/wizard');
    const { sgZusammenstellen, SG_DEFAULTS, SG_PERSON_NATUERLICH } = await import('../lib/vorlagen/schlichtungsgesuchBs');
    const sg = sgZusammenstellen({
      ...SG_DEFAULTS, streitgegenstandTyp: 'geldforderung', baselForumBestaetigt: true,
      klaeger: [{ ...SG_PERSON_NATUERLICH, vorname: 'A', name: 'B', strasse: 'S 1', plz: '4051', ort: 'Basel' }],
      beklagte: [{ typ: 'juristisch', firma: 'X GmbH', sitzStrasse: 'S 2', sitzPlz: '4051', sitzOrt: 'Basel' }],
      geld: { betrag: '1000' }, streitgegenstand: 'F', datum: '2026-06-15', ort: 'Basel',
    });
    const html = renderToString(React.createElement(VorschauPanel, { ergebnis: sg }));
    // Darstellung deklariert angepasst (18.6.2026, Variante A «Dokument-Handwerk»):
    // Vorschau liest die Masse/Stile aus der SSoT (vorschauStil.ts), nicht mehr aus
    // hartkodierten Tailwind-Klassen. Geprüft bleibt die ANATOMIE-Interpretation
    // (dieselben MUSTER wie PDF/DOCX), jetzt am neuen Schriftbild.
    expect(html).toContain('klagende Partei');                       // Parteirolle als Overline
    expect(html).not.toContain('— klagende Partei —');               // Em-Striche nur im Assemble-Text, nicht in der Anzeige
    expect(html).toMatch(/text-transform:uppercase[^>]*>klagende Partei</); // ruhige Versal-Overline
    expect(html).toMatch(/>gegen</);                                 // «gegen» vorhanden
    expect(html).toContain('display:grid');                          // hängender Einzug (Begehren-Grid)
    expect(html).toContain('border-bottom:1px solid var(--ink-600)'); // gezeichnete Unterschriftslinie
    expect(html).toContain('font-variant-numeric:tabular-nums');     // tabellarische Ziffern (Variante A)
    expect(html).not.toContain('___________');                       // kein Roh-Unterstrich
    expect(html).not.toMatch(/text-align:center[^>]*>Schlichtungsgesuch/); // kein Doppeltitel (Eingabe trägt Titel im Betreff)
  });
});

describe('Behörden-Grundgerüst für Eingaben (5.6.2026)', () => {
  it('Registry: jede hinterlegte Adresse ist VOLLSTÄNDIG (Strasse mit Hausnummer, PLZ+Ort, Quelle, Stand)', async () => {
    const { BEHOERDEN } = await import('../lib/vorlagen/behoerden');
    for (const [art, kantone] of Object.entries(BEHOERDEN)) {
      for (const [kanton, b] of Object.entries(kantone)) {
        expect(b!.name, `${art}/${kanton}`).toBeTruthy();
        expect(b!.strasse, `${art}/${kanton} Strasse`).toMatch(/\d/);      // Hausnummer!
        expect(b!.plzOrt, `${art}/${kanton} PLZ`).toMatch(/^\d{4} .+/);
        expect(b!.quelle, `${art}/${kanton} Quelle`).toBeTruthy();
        expect(b!.stand, `${art}/${kanton} Stand`).toMatch(/\d{4}/);
      }
    }
  });

  it('SG: BS löst die amtliche Volladresse auf (Bäumleingasse 5); anderer Kanton ohne Handadresse blockiert', async () => {
    const { sgZusammenstellen, sgMaengel, SG_DEFAULTS, SG_PERSON_NATUERLICH } = await import('../lib/vorlagen/schlichtungsgesuchBs');
    const basis = {
      ...SG_DEFAULTS, streitgegenstandTyp: 'geldforderung' as const, baselForumBestaetigt: true,
      klaeger: [{ ...SG_PERSON_NATUERLICH, vorname: 'A', name: 'B', strasse: 'S 1', plz: '4051', ort: 'Basel' }],
      beklagte: [{ ...SG_PERSON_NATUERLICH, vorname: 'C', name: 'D', strasse: 'S 2', plz: '4052', ort: 'Basel' }],
      geld: { betrag: '1000' }, streitgegenstand: 'F', datum: '2026-06-15', ort: 'Basel',
    };
    const t = sgZusammenstellen(basis).dokument.absaetze.map((x) => x.text).join('\n');
    expect(t).toContain('Bäumleingasse 5');
    expect(t).toContain('4001 Basel');
    expect(t).not.toContain('Postfach 964');
    // anderer Kanton: Mangel bis zur Auflösung; mit Hand- ODER aufgelöster Adresse nutzbar
    // (deklarierte Änderung 5.6.2026 — kantonsübergreifender Ausbau)
    expect(sgMaengel({ ...basis, gerichtsKanton: 'ZH' }).map((x) => x.text).join()).toMatch(/bestimmen/);
    const mitAufloesung = { ...basis, gerichtsKanton: 'ZH' as const, behoerdeAufgeloest: { zeilen: ['Friedensrichteramt Adliswil', 'Zürichstrasse 10', '8134 Adliswil'] } };
    expect(sgMaengel(mitAufloesung)).toEqual([]);
    expect(sgZusammenstellen(mitAufloesung).dokument.absaetze.map((x) => x.text).join('\n')).toContain('Zürichstrasse 10');
    const mitHand = { ...basis, gerichtsKanton: 'ZH' as const, behoerdeManuellAktiv: true, behoerdeManuell: { name: 'Friedensrichteramt Zürich, Kreise 1+2', strasse: 'Wengistrasse 30', plzOrt: '8004 Zürich' } };
    expect(sgMaengel(mitHand).map((x) => x.text).join()).not.toMatch(/bestimmen/);
    expect(sgZusammenstellen(mitHand).dokument.absaetze.map((x) => x.text).join('\n')).toContain('Wengistrasse 30');
    // unvollständige Handadresse blockiert
    expect(sgMaengel({ ...mitHand, behoerdeManuell: { name: 'X', strasse: '', plzOrt: '' } }).map((x) => x.text).join()).toMatch(/vollständig erfassen/);
  });
});
