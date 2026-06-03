import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { berechneFrist } from '../lib/zpoFristen';
import { berechneSchkgFrist } from '../lib/schkgFristen';
import { berechneLohnfortzahlung } from '../lib/lohnfortzahlung';
import { berechneSperrfristen } from '../lib/sperrfristen';
import { berechneVerzugszins } from '../lib/verzugszins';
import { berechneErbteilung } from '../lib/erbteilung';
import { berechneMietkuendigung } from '../lib/mietrecht';
import { buildPdfModel, modelText, type PdfDocConfig, type PdfModel } from '../lib/pdf/pdfModel';
import { winAnsiSicher, istWinAnsiSicher, typografie, datumNormalisieren } from '../lib/pdf/winansi';
import { zpoPdfCitations, zpoPdfErgebnis } from '../lib/pdf/zpoPdf';
import { normLink } from '../lib/pdf/normLinks';
import type { ZpoInput } from '../types/zpo';

// ─── Repräsentative Konfigurationen je Rechner (wie in den Formularen) ────

const FIX = new Date(2025, 8, 1, 12, 0); // deterministisch für Dateinamen

const zpoInput = (over: Partial<ZpoInput>): ZpoInput => ({
  ereignis: '2025-03-10', einheit: 'tage', laenge: 10,
  verfahren: 'ordentlich', kanton: 'ZH', fristnatur: 'gesetzlich', ...over,
});

function zpoConfig(over: Partial<ZpoInput>): PdfDocConfig {
  const input = zpoInput(over);
  const ergebnis = berechneFrist(input);
  const istTagesfrist = input.einheit === 'tage';
  // dieselben Ableitungen wie im Formular (src/lib/pdf/zpoPdf.ts)
  return {
    title: 'ZPO-Fristberechnung',
    domain: 'zpo-fristen',
    fileBase: 'ZPO-Fristen',
    inputs: { 'Auslösendes Ereignis': input.ereignis, 'Frist': `${input.laenge} ${input.einheit}`, 'Gerichtsort (Kanton)': input.kanton },
    sections: [{ titel: 'ZPO-Fristberechnung (Art. 142 ff. ZPO)', ergebnis: zpoPdfErgebnis(ergebnis, input.einheit) }],
    citations: zpoPdfCitations(ergebnis),
    disclaimer:
      'Dieser Fristenrechner ist eine rechnerische Orientierungshilfe (Art. 142–147 ZPO) – keine Rechtsberatung. ' +
      (istTagesfrist ? '' : 'Die Berechnung folgt der bundesgerichtlichen Praxis (BGer 5A_691/2023). ') +
      'Massgeblich sind die am Gerichtsort anerkannten Feiertage; berechnet wird ausschliesslich das Fristende.',
  };
}

const arbeitsrechtConfig = (): PdfDocConfig => ({
  title: 'Arbeitsrechtliche Orientierungsberechnung (kombiniert)',
  domain: 'arbeitsrecht',
  fileBase: 'Arbeitsrecht-Kombiniert',
  inputs: { 'Vertragsbeginn': '2020-01-01', 'Zugang Kündigung': '2025-03-10', 'Kanton': 'ZH' },
  sections: [
    {
      titel: 'Lohnfortzahlung (Art. 324a OR)',
      ergebnis: berechneLohnfortzahlung({
        vertragsbeginn: '2020-01-01', verhinderungBeginn: '2025-03-10',
        arbeitsunfaehigkeitProzent: 100, kanton: 'ZH', ktgGleichwertigVorhanden: false,
      }),
    },
    {
      titel: 'Kündigung & Sperrfristen (Art. 335c / 336c OR)',
      ergebnis: berechneSperrfristen({
        vertragsbeginn: '2020-01-01', zugangKuendigung: '2025-03-10', kuendigendePartei: 'arbeitgeber',
        probezeitMonate: 1, kuendigungsterminMonatsende: true,
        sperrereignisse: [{ typ: 'krankheit_unfall', von: '2025-03-20', bis: '2025-04-10' }],
      }),
    },
  ],
  disclaimer:
    'Automatisierte Orientierungsberechnung (Art. 324a / 335c / 336c OR) – keine Rechtsberatung. Massgeblich sind ' +
    'GAV, Einzelvertrag und der konkrete Sachverhalt. Die Lohnfortzahlungsskalen sind Gerichtspraxis und vor ' +
    'Produktiveinsatz gegen die aktuelle kantonale Praxis abzugleichen.',
});

const verzugszinsConfig = (): PdfDocConfig => ({
  title: 'Verzugszins-Berechnung (Art. 104 OR)',
  domain: 'verzugszins',
  fileBase: 'Verzugszins',
  inputs: { 'Geschuldeter Betrag (CHF)': '10000', 'Verzugsbeginn': '2025-01-15', 'Stichtag': '2025-06-30' },
  sections: [{
    titel: 'Verzugszins (Art. 104 OR)',
    ergebnis: berechneVerzugszins({ kapital: 10000, verzugsbeginn: '2025-01-15', stichtag: '2025-06-30' }),
  }],
  disclaimer:
    'Automatisierte Orientierungsberechnung des Verzugszinses nach Art. 104 OR – keine Rechtsberatung. ' +
    'Ein über den Verzugszins hinausgehender Schaden bleibt vorbehalten (Art. 106 OR).',
});

const schkgConfig = (): PdfDocConfig => ({
  title: 'SchKG-Fristberechnung',
  domain: 'schkg-fristen',
  fileBase: 'SchKG-Fristen',
  inputs: { 'Auslösendes Ereignis': '2025-07-10', 'Auslöser': 'Zustellung Zahlungsbefehl', 'Kanton': 'ZH' },
  sections: [{
    titel: 'Rechtsvorschlag (Art. 74 SchKG)',
    ergebnis: berechneSchkgFrist({
      ereignis: '2025-07-10', einheit: 'tage', laenge: 10,
      modus: 'schkg_betreibungsferien', fristnatur: 'frist', kanton: 'ZH',
    }),
  }],
  disclaimer:
    'Rechnerische Orientierungshilfe zum Schuldbetreibungs- und Konkursrecht (Art. 31, 56, 63 SchKG) – ' +
    'keine Rechtsberatung. Stillstand-Regime und auslösendes Ereignis sind im Einzelfall zu prüfen.',
});

const erbrechtConfig = (): PdfDocConfig => ({
  title: 'Erbteilung & Pflichtteil (ZGB)',
  domain: 'erbrecht',
  fileBase: 'Erbteilung-Pflichtteil',
  inputs: { 'Todesdatum': '2025-06-01', 'Zivilstand': 'Verheiratet', 'Lebende Kinder': '2' },
  sections: [{
    titel: 'Erbteilung & Pflichtteil (Art. 457 ff., 462, 470 ff. ZGB)',
    ergebnis: berechneErbteilung({ todesdatum: '2025-06-01', zivilstand: 'verheiratet', kinderLebend: 2 }),
  }],
  disclaimer:
    'Automatisierte Orientierungsberechnung der gesetzlichen Erbteile, Pflichtteile und der verfügbaren Quote ' +
    '(Art. 457 ff., 470 ff. ZGB) – keine Rechtsberatung. Quoten/Wertansprüche, keine Realteilung.',
});

const mietrechtConfig = (): PdfDocConfig => ({
  title: 'Mietrecht – Kündigungstermin-Berechnung',
  domain: 'mietrecht',
  fileBase: 'Mietrecht-Kuendigung',
  inputs: { 'Mietobjekt': 'Wohnräume', 'Zugang der Kündigung': '2025-06-23', 'Kanton': 'AG' },
  sections: [{
    titel: 'Kündigungstermine und -fristen (Art. 253 ff. OR)',
    ergebnis: berechneMietkuendigung({
      kuendigungsart: 'ordentlich', objekt: 'wohnung', zugang: '2025-06-23', kanton: 'AG', partei: 'mieter',
    }),
  }],
  disclaimer:
    'Automatisierte Orientierungsberechnung der Kündigungstermine im Mietrecht (Art. 253 ff. OR) – keine ' +
    'Rechtsberatung. Ortsübliche Termine sind Tatfrage; verbindlich ist die Schlichtungsbehörde.',
});

const alleConfigs: [string, PdfDocConfig][] = [
  ['zpo-tagesfrist', zpoConfig({})],
  ['zpo-monatsfrist-sommer', zpoConfig({ ereignis: '2025-07-01', einheit: 'monate', laenge: 1 })],
  ['arbeitsrecht-kombiniert', arbeitsrechtConfig()],
  ['verzugszins', verzugszinsConfig()],
  ['schkg-rechtsvorschlag', schkgConfig()],
  ['erbteilung', erbrechtConfig()],
  ['mietrecht', mietrechtConfig()],
];

const modelle: [string, PdfDocConfig, PdfModel][] = alleConfigs.map(([name, cfg]) => [name, cfg, buildPdfModel(cfg, FIX)]);

// ─── Bausteine: Sanitizer, Typografie, Norm-Links ─────────────────────────

describe('PDF-Bausteine', () => {
  it('winAnsiSicher ersetzt Nicht-CP1252-Zeichen, erhält deutsche Typografie', () => {
    expect(winAnsiSicher('a \u2192 b \u26a0 \u2264 \u2713')).toBe('a -> b ! <= +');
    expect(winAnsiSicher('\u2022 \u2013 \u2014 \u201eTest\u201c')).toBe('\u2022 \u2013 \u2014 \u201eTest\u201c'); // CP1252 bleibt
    expect(winAnsiSicher('\u00ab\u0445\u00bb')).toBe('\u00ab?\u00bb'); // Kyrillisch -> ?
    expect(istWinAnsiSicher('a \u2192 b')).toBe(false);
  });

  it('typografie setzt gesch\u00fctzte Leerzeichen in Normverweisen', () => {
    expect(typografie('Art. 142 Abs. 3 ZPO')).toBe('Art.\u00a0142 Abs.\u00a03 ZPO');
    expect(typografie('SR 272')).toBe('SR\u00a0272');
  });

  it('datumNormalisieren: ISO → DD.MM.YYYY', () => {
    expect(datumNormalisieren('Beginn 2025-01-15, Ende 2025-12-31')).toBe('Beginn 15.01.2025, Ende 31.12.2025');
  });

  it('normLink liefert Fedlex-Link mit korrekter SR-Nummer', () => {
    expect(normLink('Art. 142 Abs. 3 ZPO')).toEqual({ url: 'https://www.fedlex.admin.ch/eli/cc/2010/262/de#art_142', sr: '272', erlass: 'ZPO' });
    expect(normLink('Art. 324a OR')).toEqual({ url: 'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de#art_324_a', sr: '220', erlass: 'OR' });
    expect(normLink('Art. 56 Abs. 2 SchKG')?.sr).toBe('281.1');
    expect(normLink('Unbekanntes Gesetz Art. 5')).toBeNull(); // kein Erfinden von Links
  });
});

// ─── Gemeinsame Vorlage: keine hartcodierten Domäneninhalte ───────────────

describe('Gemeinsame PDF-Vorlage', () => {
  it('rendert ausschliesslich, was übergeben wird (keine Domänen-Bausteine)', () => {
    const neutral = buildPdfModel({
      title: 'T', domain: 'x', fileBase: 'T', inputs: {},
      sections: [{ titel: 'S', ergebnis: { ergebnis: 'E', status: 'ok', rechenweg: [], annahmen: [], warnungen: [], normverweise: [] } }],
      disclaimer: 'D',
    }, FIX);
    const text = modelText(neutral);
    for (const begriff of ['Arbeitsrecht', 'Lohnfortzahlung', 'GAV', 'ZPO', 'SchKG', 'Verzugszins', 'Skala']) {
      expect(text).not.toContain(begriff);
    }
  });

  it('Dateiname: <Rechnername>_YYYY-MM-DD.pdf', () => {
    for (const [, , model] of modelle) {
      expect(model.dateiname).toMatch(/^[A-Za-z-]+_\d{4}-\d{2}-\d{2}\.pdf$/);
    }
    expect(modelle[0][2].dateiname).toBe('ZPO-Fristen_2025-09-01.pdf');
  });
});

// ─── Globale Rendering-Anforderungen über alle Rechner ────────────────────

describe('Alle Rechner-PDFs', () => {
  it.each(modelle.map(([n, , m]) => [n, m] as const))('%s: Text vollständig CP1252-sicher (keine &-Artefakte)', (_n, model) => {
    expect(istWinAnsiSicher(modelText(model))).toBe(true);
  });

  it.each(modelle.map(([n, , m]) => [n, m] as const))('%s: Datumsangaben durchgehend DD.MM.YYYY', (_n, model) => {
    expect(modelText(model)).not.toMatch(/\b\d{4}-\d{2}-\d{2}\b/);
    expect(modelText(model)).toMatch(/\b\d{2}\.\d{2}\.\d{4}\b/);
  });

  it.each(modelle.map(([n, , m]) => [n, m] as const))('%s: Ergebnisbox und Disclaimer vorhanden', (_n, model) => {
    expect(model.blocks.some((b) => b.art === 'ergebnisbox')).toBe(true);
    expect(model.blocks.some((b) => b.art === 'disclaimer')).toBe(true);
  });
});

// ─── Cross-Domain-Regressionstests ────────────────────────────────────────

describe('Kein Cross-Domain-Bleed', () => {
  const text = (name: string) => modelText(modelle.find(([n]) => n === name)![2]);

  it('ZPO-Fristen-PDF ohne Arbeitsrecht-Bausteine', () => {
    for (const begriff of ['Lohnfortzahlung', 'GAV', 'Skala', 'Arbeitsrecht', 'KTG']) {
      expect(text('zpo-tagesfrist')).not.toContain(begriff);
      expect(text('zpo-monatsfrist-sommer')).not.toContain(begriff);
    }
  });

  it('Arbeitsrecht-PDF ohne ZPO-Fristen-Bausteine', () => {
    for (const begriff of ['ZPO', 'Gerichtsferien', 'dies a quo', 'Gerichtsort']) {
      expect(text('arbeitsrecht-kombiniert')).not.toContain(begriff);
    }
  });

  it('Verzugszins-PDF ohne fremde Bausteine', () => {
    for (const begriff of ['Lohnfortzahlung', 'GAV', 'ZPO', 'SchKG']) {
      expect(text('verzugszins')).not.toContain(begriff);
    }
  });

  it('SchKG-PDF ohne Arbeitsrecht-Bausteine', () => {
    for (const begriff of ['Lohnfortzahlung', 'GAV', 'Skala']) {
      expect(text('schkg-rechtsvorschlag')).not.toContain(begriff);
    }
  });

  it('Erbrecht-PDF ohne fremde Bausteine', () => {
    for (const begriff of ['Lohnfortzahlung', 'GAV', 'ZPO', 'SchKG', 'Verzugszins', 'Betreibungsferien', 'Gerichtsferien']) {
      expect(text('erbteilung')).not.toContain(begriff);
    }
  });

  it('Mietrecht-PDF ohne fremde Bausteine', () => {
    for (const begriff of ['Lohnfortzahlung', 'SchKG', 'Betreibungsferien', 'Gerichtsferien', 'Pflichtteil']) {
      expect(text('mietrecht')).not.toContain(begriff);
    }
  });
});

// ─── Nur einschlägige Normen/Hinweise ─────────────────────────────────────

describe('Einschlägigkeit (ZPO)', () => {
  it('Tagesfrist-PDF ohne BGer 5A_691/2023', () => {
    expect(modelText(modelle.find(([n]) => n === 'zpo-tagesfrist')![2])).not.toContain('5A_691');
  });

  it('Monatsfrist-PDF nennt BGer 5A_691/2023', () => {
    expect(modelText(modelle.find(([n]) => n === 'zpo-monatsfrist-sommer')![2])).toContain('5A_691');
  });

  it('Stillstand-Zitat (Art. 145 ZPO) nur bei Überschneidung mit dem Lauf', () => {
    const normBloecke = (name: string) =>
      modelle.find(([n]) => n === name)![2].blocks.filter((b) => b.art === 'norm').map((b) => (b as { text: string }).text);
    // Märzfrist berührt keine Stillstandsperiode → kein Art.-145-Zitat
    expect(normBloecke('zpo-tagesfrist').some((t) => t.includes('Art. 145'))).toBe(false);
    // Sommerfrist läuft durch den Stillstand → Art.-145-Zitat vorhanden
    expect(normBloecke('zpo-monatsfrist-sommer').some((t) => t.includes('Art. 145'))).toBe(true);
  });

  it('Normverweis-Blöcke tragen Fedlex-Links mit SR-Nummer', () => {
    const normen = modelle.find(([n]) => n === 'zpo-tagesfrist')![2].blocks.filter((b) => b.art === 'norm');
    expect(normen.length).toBeGreaterThan(0);
    for (const n of normen) {
      const block = n as { text: string; url?: string };
      expect(block.url).toMatch(/^https:\/\/www\.fedlex\.admin\.ch\/eli\/cc\//);
      expect(block.text).toContain('SR ');
    }
  });
});

// ─── Beispiel-PDFs (Lieferung): PDF_BEISPIELE=1 npm test ──────────────────

describe('Beispiel-PDFs', () => {
  it.runIf(process.env.PDF_BEISPIELE)('erzeugt je Rechner ein Nachher-PDF', async () => {
    const { renderPdf } = await import('../lib/pdf/pdfRender');
    mkdirSync('pdf-beispiele/nachher', { recursive: true });
    for (const [name, , model] of modelle) {
      const doc = renderPdf(model);
      writeFileSync(`pdf-beispiele/nachher/${name}.pdf`, Buffer.from(doc.output('arraybuffer')));
    }
    expect(true).toBe(true);
  });

  it.runIf(process.env.PDF_BEISPIELE)('erzeugt je Rechner ein Vorher-PDF (Alt-Template)', async () => {
    const { jsPDF } = await import('jspdf');
    mkdirSync('pdf-beispiele/vorher', { recursive: true });
    // Originalgetreue Kopie des ALTEN Templates (hartcodierter Titel/Disclaimer,
    // ⚠-Glyphen, keine Fusszeile) – nur zur Vorher-/Nachher-Kontrolle.
    const legacy = (cfg: PdfDocConfig) => {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      let y = 20;
      const ln = (text: string, size = 10, bold = false) => {
        doc.setFontSize(size); doc.setFont('helvetica', bold ? 'bold' : 'normal');
        (doc.splitTextToSize(text, 170) as string[]).forEach((l) => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(l, 20, y); y += size * 0.45;
        });
        y += 2;
      };
      ln('Arbeitsrechtliche Orientierungsberechnung', 16, true);
      ln('Eingaben', 12, true);
      Object.entries(cfg.inputs).forEach(([k, v]) => ln(`${k}: ${v}`, 9));
      cfg.sections.forEach(({ titel, ergebnis }) => {
        ln(titel, 13, true);
        ln(`Status: ${ergebnis.status.toUpperCase()}`, 10, true);
        ln(ergebnis.ergebnis, 10);
        ergebnis.warnungen.forEach((w) => ln(`⚠ ${w}`, 9));
        ergebnis.rechenweg.forEach((s, i) => { ln(`${i + 1}. ${s.beschreibung}`, 9, true); ln(s.zwischenergebnis, 9); });
        ergebnis.annahmen.forEach((a) => ln(`• ${a}`, 9));
      });
      ln('Disclaimer', 10, true);
      ln('Automatisierte Orientierungsberechnung, keine Rechtsberatung. Abweichende GAV-/Vertrags-/Versicherungslösungen sind zu prüfen. Die Lohnfortzahlungsskalen sind Gerichtspraxis.', 8);
      return doc;
    };
    for (const [name, cfg] of alleConfigs) {
      writeFileSync(`pdf-beispiele/vorher/${name}.pdf`, Buffer.from(legacy(cfg).output('arraybuffer')));
    }
    expect(true).toBe(true);
  });
});
