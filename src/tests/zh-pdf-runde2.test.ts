/**
 * Geometrie- und Parser-Tests zur ZH-Fix-Runde 2 — je ein Test pro Befundklasse
 * der zweiten adversarialen Gegenprüfung (31.8.2026), gegen ECHTE pdfjs-Stücke
 * amtlicher ZH-Seiten (Koordinaten unverändert, s. Fixture-Kopf).
 *
 * Jede Behauptung hier war gegen HEAD e4f6bd72d nachweislich falsch; die
 * «vorher»-Werte stehen je Test dabei (Rot-Beweis-Ersatz auf Modul-Ebene, der
 * Lauf gegen den Alt-Stand ist im Bericht protokolliert).
 */
import { describe, it, expect } from 'vitest';
import {
  montiereZhSeite,
  serialisiereZhZeilen,
  extrahiereAlleZhParagraphen,
  SAMMEL_MARKER,
} from '../../scripts/normtext/adapter-zh-pdf.ts';
import { expandiereSammelbereich } from '../../scripts/normtext/zh-sammelkopf.ts';
import {
  ZH_230_SEITE8,
  ZH_6311_SEITE3,
  ZH_331_SEITE4,
  ZH_101_SEITE2,
  type ZhStueckFixture,
} from './fixtures/zh-pdf-seiten-stuecke-runde2.ts';

const textbasis = (stuecke: ZhStueckFixture[]): string =>
  serialisiereZhZeilen(montiereZhSeite(stuecke));

describe('B-1 — hochgestellte Absatznummer mit lateinischem Suffix', () => {
  it('ZH-631.1 S. 3: «1bis»/«1ter» werden Absatznummern, nicht Fliesstext', () => {
    const zeilen = montiereZhSeite(ZH_6311_SEITE3);
    // VORHER: absatz === null, und «1bis» klebte als nackter Text vorne am
    // Absatz («… zusammengerechnet. 1bis Einkommen und Vermögen …»).
    expect(zeilen.map((z) => z.absatz).filter((a) => a === '1bis')).toEqual(['1bis']);
    expect(zeilen.map((z) => z.absatz).filter((a) => a === '1ter')).toEqual(['1ter']);
    // Die Absatznummer steht — wie jede ZH-Absatzzahl — auf der eigenen
    // y-Zeile; ihr Text folgt in der nächsten. Entscheidend ist, dass sie NICHT
    // mehr im Fliesstext auftaucht.
    const basis = textbasis(ZH_6311_SEITE3);
    expect(basis).toContain('¶1bis \nEinkommen und Vermögen von Personen');
    expect(basis).not.toMatch(/[^¶]1bis Einkommen/);
  });

  it('ZH-631.1 § 7: der Suffix-Absatz wird ein eigener Block', () => {
    const alle = extrahiereAlleZhParagraphen(textbasis(ZH_6311_SEITE3));
    const absaetze = alle['7']!.bloecke.map((b) => b.absatz);
    // VORHER: ['1'] — 1bis und 1ter existierten im ganzen ZH-Korpus nicht
    // (0 Blöcke mit lateinischem Suffix im Absatz-Feld).
    expect(absaetze).toContain('1bis');
    expect(absaetze).toContain('1ter');
    const bis = alle['7']!.bloecke.find((b) => b.absatz === '1bis')!;
    expect(bis.text).toContain('eingetragener Partnerschaft leben, werden zusammengerechnet.');
    // Und der Vorgänger-Absatz ist NICHT mehr mit der Absatznummer verklebt.
    const eins = alle['7']!.bloecke.find((b) => b.absatz === '1')!;
    expect(eins.text).not.toContain('1bis');
  });
});

describe('B-2 — Sammel-Aufhebungsköpfe «§§ A–B.»', () => {
  it('ZH-230 S. 8: die §§-Zeilen im Kopf-Einzug sind Köpfe, keine Fortsetzung', () => {
    const zeilen = montiereZhSeite(ZH_230_SEITE8);
    const koepfe = zeilen.filter((z) => z.sammelkopf).map((z) => z.text);
    // VORHER: das Feld gab es nicht; jede dieser Zeilen floss als Text in den
    // Vorgänger-§ (ZH-230 § 57 endete auf «… PartG). §§ 58–63.»).
    expect(koepfe).toEqual([
      '§§ 58–63.',
      '§§ 66–69.',
      '§§ 73–75.',
      '§§ 76–81.',
      '§§ 83 und 84.',
      '§§ 85–87.',
      '§§ 88 und 89.',
      '§§ 90 und 91.',
      '§§ 92–101.',
      '§§ 102–107.',
      '§§ 108–116.',
    ]);
    expect(textbasis(ZH_230_SEITE8)).toContain(`${SAMMEL_MARKER}§§ 66–69.`);
  });

  it('ZH-230 S. 8: je genannter § ein «Aufgehoben»-Platzhalter, § 57 bleibt sauber', () => {
    const alle = extrahiereAlleZhParagraphen(textbasis(ZH_230_SEITE8));
    // VORHER: keiner dieser Tokens existierte im Snapshot.
    for (const t of ['58', '59', '60', '61', '62', '63', '66', '67', '68', '69', '116']) {
      expect(alle[t]?.bloecke).toEqual([{ absatz: null, text: 'Aufgehoben' }]);
    }
    // Nackte EINZEL-Köpfe bleiben, wie bisher, ebenfalls Platzhalter.
    expect(alle['64']?.bloecke).toEqual([{ absatz: null, text: 'Aufgehoben' }]);
    // Der Vorgänger-§ trägt keinen Sammelkopf-Rest mehr.
    const letzterBlock = alle['57']!.bloecke.at(-1)!;
    expect(letzterBlock.text).toContain('(Art. 13 und 34 Abs. 4 PartG).');
    expect(letzterBlock.text).not.toContain('§§ 58');
  });

  it('ZH-331 S. 4 (Gegenbeweis): «§§ 23–23 b und 35 b.» ohne Kopf-Einzug bleibt Text', () => {
    const zeilen = montiereZhSeite(ZH_331_SEITE4);
    // Diese Zeile hat exakt die Sammelkopf-GESTALT, steht aber am Body-Rand
    // (x 87.84 = kein Einzug): sie ist das Ende von «… Vorbehalten bleiben».
    // Eine rein textliche Erkennung ersetzte hier drei existierende §§ durch
    // Platzhalter und verwürfe den Normtext.
    expect(zeilen.some((z) => z.sammelkopf)).toBe(false);
    expect(textbasis(ZH_331_SEITE4)).toContain('§§ 23–23 b und 35 b.');
    expect(textbasis(ZH_331_SEITE4)).not.toContain(SAMMEL_MARKER);
  });
});

describe('B-2 — Bereichs-Expansion (rein)', () => {
  it('expandiert die am Bestand belegten Formen lückenlos', () => {
    expect(expandiereSammelbereich('66–69')).toEqual({
      tokens: ['66', '67', '68', '69'],
      exakt: true,
    });
    expect(expandiereSammelbereich('83 und 84')).toEqual({ tokens: ['83', '84'], exakt: true });
    // U+2212 (Minuszeichen) — ZH-700.1 setzt es statt des Halbgeviertstrichs.
    expect(expandiereSammelbereich('27−29')).toEqual({
      tokens: ['27', '28', '29'],
      exakt: true,
    });
    expect(expandiereSammelbereich('117 a–117 m').tokens).toHaveLength(13);
    expect(expandiereSammelbereich('117 a–117 m').tokens[0]).toBe('117_a');
    expect(expandiereSammelbereich('117 a–117 m').exakt).toBe(true);
    expect(expandiereSammelbereich('235bis–235quater')).toEqual({
      tokens: ['235_bis', '235_ter', '235_quater'],
      exakt: true,
    });
    expect(expandiereSammelbereich('45 a und 46')).toEqual({
      tokens: ['45_a', '46'],
      exakt: true,
    });
  });

  it('meldet gemischte Grenzen als NICHT lückenlos, statt Zwischenstufen zu raten', () => {
    // «74–80 d»: ob zwischen § 80 und § 80 d noch §§ 80 a–80 c stehen, sagt der
    // Kopf nicht — sie werden NICHT erfunden (§8).
    const a = expandiereSammelbereich('74–80 d');
    expect(a.exakt).toBe(false);
    expect(a.tokens).toEqual(['74', '75', '76', '77', '78', '79', '80', '80_d']);
    const b = expandiereSammelbereich('137bis–144');
    expect(b.exakt).toBe(false);
    // § 137 selbst liegt VOR § 137bis und gehört nicht in den Bereich.
    expect(b.tokens).not.toContain('137');
    expect(b.tokens).toEqual(['137_bis', '138', '139', '140', '141', '142', '143', '144']);
  });

  it('verweigert eine unplausible Spanne, statt Platzhalter zu fluten', () => {
    expect(expandiereSammelbereich('3–4000')).toEqual({ tokens: [], exakt: false });
  });
});

describe('B-3 — Gliederungstitel der zählenden Form', () => {
  it('ZH-101 S. 2: «2. Kapitel: Grundrechte» landet nicht im Normtext', () => {
    const alle = extrahiereAlleZhParagraphen(textbasis(ZH_101_SEITE2), 'artikel');
    // VORHER: Art. 8 endete auf «… ökologische Innovation. 2. Kapitel:
    // Grundrechte» — korpusweit 103 so kontaminierte Blöcke in 10 Erlassen.
    const art8 = alle['8']!.bloecke.map((b) => b.text).join(' ');
    expect(art8).toContain('ökologische Innovation.');
    expect(art8).not.toContain('Kapitel');
    // Der folgende Artikel beginnt trotzdem korrekt.
    expect(alle['9']!.bloecke[0].text).toBe('Die Würde des Menschen ist unantastbar.');
  });
});
