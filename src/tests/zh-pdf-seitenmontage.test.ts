/**
 * Geometrie-Tests für die ZH-PDF-Seitenmontage (`montiereZhSeite`) — je ein Test
 * pro Fehlerklasse der Gegenprüfung vom 31.8.2026, gegen ECHTE pdfjs-Stücke
 * zweier amtlicher ZH-Seiten (Koordinaten unverändert, s. Fixture-Kopf).
 *
 * Diese Tests sind der Rot-Beweis-Ersatz auf Modul-Ebene: jede Behauptung hier
 * war vor dem Fix nachweislich falsch (die «vorher»-Werte stehen je Test dabei).
 */
import { describe, it, expect } from 'vitest';
import {
  montiereZhSeite,
  serialisiereZhZeilen,
  extrahiereAlleZhParagraphen,
  erkenneZhMarker,
} from '../../scripts/normtext/adapter-zh-pdf.ts';
import {
  ZH_212812_SEITE2,
  ZH_1752_SEITE1,
  ZH_2111_SEITE24,
} from './fixtures/zh-pdf-seiten-stuecke.ts';

const textbasis = (stuecke: typeof ZH_212812_SEITE2): string =>
  serialisiereZhZeilen(montiereZhSeite(stuecke));

describe('B-2 — Fussnoten-Verweis wird nicht zur Absatznummer', () => {
  it('ZH-212.812 § 4: Absatz 2 bleibt EIN Absatz, das Wort bleibt ganz', () => {
    const alle = extrahiereAlleZhParagraphen(
      `§ 4. Zusätzlich zur Gerichtsgebühr werden verrechnet:\n${textbasis(ZH_212812_SEITE2)}`,
    );
    const abs = alle['4']!.bloecke.map((b) => b.absatz);
    // VORHER: ['1','2','3','4'] — die Fussnoten-Verweise ³ und ⁴ galten als
    // Absatznummern. Das PDF hat drei Absätze.
    expect(abs).toEqual(['1', '2', '3']);
    const zwei = alle['4']!.bloecke[1].text;
    // VORHER endete Absatz 2 mit «… nach der Entschädigungsver-», der Rest
    // begann als «Absatz 3» mit «ordnung der obersten …».
    expect(zwei).toContain('Entschädigungsverordnung der obersten kantonalen Gerichte');
    expect(zwei.endsWith('vom 11. Juni 2002.')).toBe(true);
  });

  it('echte Absatz-Hochzahlen bleiben — auch die zwischen «§ 5.» und dem Text', () => {
    const alle = extrahiereAlleZhParagraphen(textbasis(ZH_212812_SEITE2));
    expect(alle['5']!.bloecke.map((b) => b.absatz)).toEqual(['1', '2', '3']);
    expect(alle['6']!.bloecke.map((b) => b.absatz)).toEqual(['1', '2', '3']);
  });
});

describe('B-4 — Wortabstand aus der PDF-Geometrie', () => {
  it('kein Leerzeichen vor anschliessender Interpunktion, keins zu viel im Wort', () => {
    const t = textbasis(ZH_212812_SEITE2);
    expect(t).toContain('Die Gebühr für die Zustellung einer Kopie eines Entscheids');
    expect(t).not.toMatch(/ \./);
    // VORHER klebten Fragmente über die entfernte Hochzahl hinweg zusammen.
    expect(t).not.toMatch(/[a-zäöü][A-ZÄÖÜ]/);
  });

  it('ZH-175.2 § 4 a: Buchstaben-Suffix wird als eigener Paragraph erkannt', () => {
    const alle = extrahiereAlleZhParagraphen(textbasis(ZH_1752_SEITE1));
    // Die Zürcher Sammlung druckt «§ 4 a.» mit Abstand — der Kopf-Regex ist
    // entsprechend tolerant, der Token bleibt die kanonische Form «4_a».
    expect(Object.keys(alle).sort()).toEqual(['1', '2', '3', '4', '4_a', '5']);
    expect(alle['4_a']!.bloecke[0].text).toContain(
      'behandeln die bei ihnen eingeleiteten Verfahren beförderlich',
    );
  });
});

describe('B-6 — Fussnoten-Apparat-Kante liegt hinter dem Marginalien-Filter', () => {
  it('ZH-175.2 Seite 1: Randnoten-Fussnotenziffern kappen die Seite nicht', () => {
    const zeilen = montiereZhSeite(ZH_1752_SEITE1);
    const t = serialisiereZhZeilen(zeilen);
    // Die Randnoten «Grundsatz⁵²» (y 442) und «Prüfung der Zuständigkeit³⁴»
    // (y 129) tragen Ziffern in Apparat-Schriftgrösse. Würde die Kante daraus
    // bestimmt, bliebe von der Seite nichts oder fast nichts übrig.
    expect(t).toContain('Öffentlichrechtliche Angelegenheiten');
    expect(t).toContain('Bevor eine Verwaltungsbehörde auf die Behandlung einer');
    // Marginalien selbst sind kein Normtext.
    expect(t).not.toContain('Grundsatz');
    expect(t).not.toContain('Beschleunigungsgebot');
  });
});

describe('B-6 — Apparat-Kante trennt nicht nach Ziffernhöhe allein', () => {
  it('ZH-211.1 Seite 24: Absatzzahl mit h = 5.04 kappt die Seite nicht', () => {
    const alle = extrahiereAlleZhParagraphen(textbasis(ZH_2111_SEITE24));
    // Die Absatzzahl von § 105 Abs. 2 (y 170.36) ist mit h = 5.04 gesetzt und
    // liegt damit in der Höhenklasse der Fussnoten-Ziffern. Eine Kante allein
    // aus der Ziffernhöhe hätte ab dort alles verworfen.
    expect(alle['105']!.bloecke.map((b) => b.absatz)).toEqual(['1', '2']);
    expect(alle['105']!.bloecke[1].text).toBe(
      'Der Regierungsrat kann ausserordentliche Oberstaatsanwältinnen und -anwälte einsetzen.',
    );
    expect(alle['106']).toBeDefined();
    expect(alle['106']!.bloecke.map((b) => b.absatz)).toEqual(['1', '2']);
  });
});

describe('E2-H1 — Zählweise wird je Erlass erhoben', () => {
  it('ein «§»-Erlass bleibt ein «§»-Erlass, auch mit Art.-Querverweisen', () => {
    expect(erkenneZhMarker(textbasis(ZH_1752_SEITE1))).toBe('paragraf');
  });

  it('«Art. N» ohne Punkt wird als Kopf erkannt (Kantonsverfassung LS 101)', () => {
    // Wörtlicher Anfang der KV (LS 101), so wie ihn die Extraktion liefert.
    const kv =
      '¶1 \nArt. 1 Der Kanton Zürich ist ein souveräner Stand der Schwei-\n' +
      'zerischen Eidgenossenschaft.\n¶2 \n' +
      'Er gründet auf der Eigen- und Mitverantwortung seiner Ein-\nwohnerinnen und Einwohner.\n' +
      '¶1 \nArt. 2 Grundlage und Schranke staatlichen Handelns ist das\nRecht.';
    expect(erkenneZhMarker(kv)).toBe('artikel');
    const alle = extrahiereAlleZhParagraphen(kv);
    expect(Object.keys(alle)).toEqual(['1', '2']);
    expect(alle['1']!.bloecke.map((b) => b.absatz)).toEqual(['1', '2']);
    expect(alle['1']!.bloecke[0].text).toBe(
      'Der Kanton Zürich ist ein souveräner Stand der Schweizerischen Eidgenossenschaft.',
    );
  });
});
