/**
 * Grenz-Tests des reinen ZH-§-Parsers — je eine Fehlerklasse der Gegenprüfung
 * vom 31.8.2026, gegen WÖRTLICHE Ausschnitte der echten Textbasis der amtlichen
 * ZH-PDF (abgerufen 31.8.2026; Fundstelle je Test genannt).
 *
 * Jede Behauptung war vor dem Fix nachweislich falsch — die «VORHER»-Angabe
 * nennt das gemessene alte Ergebnis.
 */
import { describe, it, expect } from 'vitest';
import { extrahiereAlleZhParagraphen } from '../../scripts/normtext/adapter-zh-pdf.ts';

describe('B-3 — ein § im Fliesstext beendet den Artikel nicht', () => {
  it('Querverweis mitten in der Zeile (ZH-212.812 § 8)', () => {
    // Wörtlich aus 212.812_12.4.11_115.pdf, Seite 3.
    const t = [
      '§ 8. Die Entschädigung der unentgeltlichen Rechtsvertretung rich-',
      'tet sich nach § 7.',
      '¶1 ',
      '§ 9. Die Gerichtskasse bezieht die Gebühren, Kosten und Ord-',
      'nungsbussen für das Gericht.',
    ].join('\n');
    const alle = extrahiereAlleZhParagraphen(t);
    // VORHER: «Die Entschädigung der unentgeltlichen Rechtsvertretung rich-»
    // — die Rechtsfolge fehlte, weil «§ 7.» als neuer Kopf gelesen wurde.
    expect(alle['8']!.bloecke[0].text).toBe(
      'Die Entschädigung der unentgeltlichen Rechtsvertretung richtet sich nach § 7.',
    );
    expect(Object.keys(alle).sort()).toEqual(['8', '9']);
  });

  it('Querverweis am ZEILENANFANG auf einen schon gesehenen § (ZH-211.1 § 150 lit. d)', () => {
    // Wörtlich aus 211.1_10.5.10_131.pdf: der Umbruch setzt «§ 31.» an den
    // Zeilenanfang. Nur die Regel «kein Wiedereröffnen eines gesehenen Tokens»
    // rettet hier — der Zeilenanker allein genügt nicht.
    const t = [
      '§ 31. Das Einzelgericht behandelt Rechtshilfebegehren in Zivil-',
      'sachen.',
      '¶1 ',
      '§ 150. Die Strafbehörden können anderen Kantonen in Straf-',
      'sachen des kantonalen Rechts Rechtshilfe gewähren.',
      '¶2 ',
      'Die nationale Rechtshilfe wird von der am Ort der vorzunehmen-',
      'den Verfahrenshandlung zuständigen Strafbehörde geleistet:',
      'd. im Gerichtsverfahren vom Bezirksgericht als Einzelgericht gemäss',
      '§ 31.',
      '¶3 ',
      'Benachrichtigungen gemäss Art. 52 Abs. 2 StPO erfolgen an die Ober-',
      'staatsanwaltschaft.',
    ].join('\n');
    const alle = extrahiereAlleZhParagraphen(t);
    expect(Object.keys(alle).sort()).toEqual(['150', '31']);
    // VORHER: § 150 endete nach lit. d, Absatz 3 fiel weg.
    expect(alle['150']!.bloecke.map((b) => b.absatz)).toEqual(['1', '2', '3']);
    expect(alle['150']!.bloecke[1].items!.at(-1)!.text).toBe(
      'im Gerichtsverfahren vom Bezirksgericht als Einzelgericht gemäss § 31.',
    );
    // Der echte § 31 bleibt unangetastet.
    expect(alle['31']!.bloecke[0].text).toBe(
      'Das Einzelgericht behandelt Rechtshilfebegehren in Zivilsachen.',
    );
  });
});

describe('B-5 — aufgehobene Bestimmungen behalten ihre eId', () => {
  it('nackter Kopf ohne Text wird zum Platzhalter «Aufgehoben» (ZH-175.2 § 18)', () => {
    // Wörtlich aus 175.2_24.5.59_133.pdf. Die amtliche Fussnote 32 zu § 18
    // lautet «Aufgehoben durch G vom 8. Juni 1997 (OS 54, 268).»
    const t = [
      '§ 17. Im Verfahren vor den Verwaltungsbehörden werden keine',
      'Parteientschädigungen zugesprochen.',
      '¶32 ',
      '§ 18.',
      'C. Rekurs',
      '¶50 ',
      '§ 19. Mit Rekurs können angefochten werden:',
      'a. Anordnungen, einschliesslich raumplanungsrechtlicher Festlegun-',
      'gen,',
    ].join('\n');
    const alle = extrahiereAlleZhParagraphen(t);
    // VORHER: § 18 fehlte im Snapshot vollständig (53 eIds korpusweit).
    expect(Object.keys(alle).sort((a, b) => +a - +b)).toEqual(['17', '18', '19']);
    expect(alle['18']!.bloecke).toEqual([{ absatz: null, text: 'Aufgehoben' }]);
    // Der Platzhalter überschreibt nie vorhandenen Text.
    expect(alle['19']!.bloecke[0].items!.map((i) => i.marke)).toEqual(['a']);
  });
});

describe('lat. Suffix — «§ 183bis» ist nicht «§ 183»', () => {
  it('ZH-230: 183, 183bis, 183ter, 183quater sind vier Bestimmungen', () => {
    // Wörtlich aus 230_2.4.11_133.pdf (Seite 16 f.), nach der Hochstellungs-
    // Zuordnung: der hochgestellte Suffix steht jetzt im Kopf statt auf einer
    // eigenen Zeile. VORHER kollidierten alle vier auf dem Token «183»;
    // «erster Treffer gewinnt» liess nur den leeren § 183 übrig.
    const t = [
      '¶71 ',
      '§ 183.',
      'VII. Enteignungsähnliche Beschränkungen',
      '§ 183bis. Wirkt eine auf dem Grundeigentum lastende öffentlich-',
      'rechtliche Eigentumsbeschränkung ähnlich einer Enteignung, so ist',
      'der Betroffene berechtigt, angemessene Entschädigung zu verlangen.',
      '§ 183ter. Der Betroffene hat seine Ansprüche innert zehn Jahren',
      'seit dem Inkrafttreten der Eigentumsbeschränkung anzumelden.',
      '§ 183quater. Entschädigungen können vom Gemeinwesen innert',
      'fünf Jahren nach ihrer Ausrichtung zurückverlangt werden.',
    ].join('\n');
    const alle = extrahiereAlleZhParagraphen(t);
    expect(Object.keys(alle)).toEqual(['183', '183_bis', '183_ter', '183_quater']);
    expect(alle['183']!.bloecke[0].text).toBe('Aufgehoben');
    expect(alle['183_ter']!.bloecke[0].text).toContain('innert zehn Jahren');
  });
});

describe('B-6 — Schlussapparat wird nicht dem letzten § zugeschlagen', () => {
  it('Übergangsbestimmung beendet die Aufnahme (ZH-851.1 § 55)', () => {
    // Wörtlich aus 851.1_14.6.81_123.pdf, Seite 18.
    const t = [
      '§ 55. Dieses Gesetz untersteht der Volksabstimmung.',
      '¶2 ',
      'Der Regierungsrat bestimmt den Zeitpunkt des Inkrafttretens.',
      '¶3 ',
      'Auf den gleichen Zeitpunkt wird das Gesetz über die Armen-',
      'fürsorge vom 23. Oktober 1927 aufgehoben.',
      'Übergangsbestimmung zur Änderung vom 12. Juli 2010 (OS 66, 839)',
      'Die Informationen nach §§ 47a–47d sowie die Auskünfte auf Er-',
      'suchen nach § 48 können sich auch auf Sachverhalte beziehen.',
    ].join('\n');
    const alle = extrahiereAlleZhParagraphen(t);
    // VORHER: § 55 trug 23 Blöcke, darunter der Übergangstext und 13
    // Pseudo-Absätze aus dem Fussnoten-Apparat.
    expect(alle['55']!.bloecke.map((b) => b.absatz)).toEqual(['1', '2', '3']);
    expect(alle['55']!.bloecke.at(-1)!.text).toContain('Armenfürsorge vom 23. Oktober 1927');
    expect(JSON.stringify(alle)).not.toContain('Übergangsbestimmung');
  });

  it('«Anhang» als Fliesstext-Wort ist keine Grenze (ZH-851.1 § 5 e lit. c)', () => {
    // Wörtlich aus 851.1_14.6.81_123.pdf: die Zeile beginnt mit «Anhang K
    // Anlage 1 zum Übereinkommen …». Eine zu weite Anhang-Erkennung kappte
    // hier den halben Erlass (in dieser Fix-Runde erzeugt und gemessen).
    const t = [
      '§ 5 e. Unter Vorbehalt abweichender Bestimmungen des Bun-',
      'desrechts sind folgende Personen ausgeschlossen:',
      'c. Arbeitssuchende nach Art. 2 Abs. 1 Anhang I zum Abkommen und',
      'Anhang K Anlage 1 zum Übereinkommen vom 4. Januar 1960 zur',
      'Errichtung der Europäischen Freihandelsassoziation.',
      '§ 6. Fürsorgebehörde ist der Gemeindevorstand der politischen',
      'Gemeinde.',
    ].join('\n');
    const alle = extrahiereAlleZhParagraphen(t);
    expect(Object.keys(alle).sort()).toEqual(['5_e', '6']);
    expect(alle['5_e']!.bloecke[0].items![0].text).toContain('Anhang K Anlage 1');
  });
});
