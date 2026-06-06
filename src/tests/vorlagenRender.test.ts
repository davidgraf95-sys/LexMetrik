import { describe, it, expect } from 'vitest';
import { testamentZusammenstellen, TESTAMENT_DEFAULTS } from '../lib/vorlagen/testament';
import { avZusammenstellen, AV_DEFAULTS } from '../lib/vorlagen/arbeitsvertrag';
import { dokumentAlsText } from '../lib/vorlagen/vorlagenText';
import { vorlagenPdfDokument } from '../lib/vorlagen/vorlagenPdf';
import { vorlagenDocxErzeugen } from '../lib/vorlagen/vorlagenDocx';
import { BANNER_ABSCHREIBEN } from '../lib/vorlagen/banner';

// ─── Render-Schicht (Coverage-Audit 6.6.2026) ────────────────────────────────
// §5-Absicherung: Text, PDF und DOCX rendern aus DEMSELBEN AssembleErgebnis.
// Diese Tests sichern, dass die Render-Schicht (vorher 0–31 % Coverage) den
// Dokumentinhalt vollständig und in Assemble-Reihenfolge wiedergibt und die
// Form-Gates (DOCX-Sperre bei Eigenhändigkeit) hart durchsetzt.

const testament = () => testamentZusammenstellen({
  ...TESTAMENT_DEFAULTS,
  vorname: 'Anna', nachname: 'Beispiel', geburtsdatum: '1960-04-12',
  heimatort: 'Basel BS', adresse: 'Musterweg 1, 4051 Basel',
  erben: [
    { name: 'Bruno Beispiel', angaben: 'geb. 01.02.1990', quoteProzent: 60 },
    { name: 'Clara Beispiel', angaben: 'geb. 03.04.1992', quoteProzent: 40 },
  ],
  ortErrichtung: 'Basel', datumErrichtung: '2026-06-15',
});

const arbeitsvertrag = () => avZusammenstellen({
  ...AV_DEFAULTS,
  arbeitgeberName: 'Muster Treuhand AG', arbeitgeberAdresse: 'Musterweg 1, 4051 Basel',
  arbeitnehmerVorname: 'Anna', arbeitnehmerName: 'Beispiel',
  arbeitnehmerAdresse: 'Beispielgasse 2, 4052 Basel', arbeitnehmerGeburtsdatum: '1995-03-01',
  funktion: 'Sachbearbeiterin', arbeitsort: 'Basel', arbeitsortKanton: 'BS',
  beginn: '2026-08-01', lohnBetrag: '6500', ort: 'Basel', datum: '2026-06-15',
});

describe('Render-Schicht: dokumentAlsText (SSoT §5)', () => {
  it('Text enthält alle Assemble-Absätze in Originalreihenfolge', () => {
    const e = testament();
    const text = dokumentAlsText(e);
    // Titel wird in der Text-Ausgabe versal gesetzt (Typografie-Konvention).
    expect(text.toUpperCase()).toContain(e.dokument.titel.toUpperCase());
    // Jeder nicht-leere Absatztext erscheint; Reihenfolge via aufsteigende Fundstellen.
    let pos = -1;
    for (const a of e.dokument.absaetze) {
      const t = (a.text ?? '').trim();
      if (!t) continue;
      const idx = text.indexOf(t.slice(0, 60));
      expect(idx, `Absatz fehlt im Text: ${t.slice(0, 40)}…`).toBeGreaterThan(pos);
      pos = idx;
    }
    expect(text).toContain(e.dokument.disclaimer.slice(0, 40));
  });

  it('Arbeitsvertrag: Vertragsparteien und Disclaimer im Text', () => {
    const e = arbeitsvertrag();
    const text = dokumentAlsText(e);
    expect(text).toContain('Muster Treuhand AG');
    expect(text).toContain('Anna');
    expect(text).toContain(e.dokument.disclaimer.slice(0, 40));
  });
});

describe('Render-Schicht: vorlagenPdfDokument', () => {
  it('Testament-PDF (Abschreibevorlage) wird fehlerfrei erzeugt und ist nicht leer', () => {
    const doc = vorlagenPdfDokument(testament(), { banner: BANNER_ABSCHREIBEN });
    const bytes = doc.output('arraybuffer') as ArrayBuffer;
    expect(bytes.byteLength).toBeGreaterThan(2000);
    expect(new TextDecoder('latin1').decode(bytes.slice(0, 5))).toBe('%PDF-');
  });

  it('Arbeitsvertrag-PDF wird fehlerfrei erzeugt', () => {
    const doc = vorlagenPdfDokument(arbeitsvertrag(), {});
    expect((doc.output('arraybuffer') as ArrayBuffer).byteLength).toBeGreaterThan(2000);
  });
});

describe('Render-Schicht: vorlagenDocxErzeugen + Form-Gate', () => {
  // Der erfolgreiche DOCX-Download braucht das Browser-DOM (createObjectURL);
  // in Node testbar ist die GATE-Matrix beidseitig: Erlaubnis laut Regeln und
  // der harte Throw bei Eigenhändigkeits-Dokumenten.
  it('AUSGABE_REGELN: Vertrag (fertig) erlaubt DOCX, Abschrift sperrt', async () => {
    const { AUSGABE_REGELN } = await import('../lib/vorlagen/formatvorlagen');
    expect(AUSGABE_REGELN[arbeitsvertrag().dokument.ausgabeArt].docxErlaubt).toBe(true);
    expect(AUSGABE_REGELN[testament().dokument.ausgabeArt].docxErlaubt).toBe(false);
  });

  it('Testament (abschrift, Eigenhändigkeit Art. 505 ZGB) → DOCX wirft hart (§8-Gate)', async () => {
    const e = testament();
    expect(e.dokument.ausgabeArt).toBe('abschrift');
    await expect(vorlagenDocxErzeugen(e, { dateiName: 'x.docx' })).rejects.toThrow(/gesperrt/);
  });
});
