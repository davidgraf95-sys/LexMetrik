/**
 * Tests für die ZH-Absatz-Nummerierung (Bug-Fix 22.6.2026 — Bund-Qualität).
 *
 * Zwei in den realen ZH-PDF beobachtete Defekte werden hier gegen den reinen
 * Parser (extrahiereAlleZhParagraphen, gegen die serialisierte PDF-Textbasis,
 * §2) abgesichert — keine Netz-/pdfjs-Abhängigkeit:
 *
 *   1. VERLORENE «¹» (erster Absatz): die hochgestellte Absatznummer «1» des
 *      ersten Absatzes steht in den ZH-PDF auf einer EIGENEN Zeile DIREKT VOR
 *      der «§ N.»-Kopfzeile (pdfjs liest sie als «¶1» knapp oberhalb der
 *      Überschrift). Ohne Recovery beginnt ein mehrabsätziger § fälschlich mit
 *      «absatz: null», obwohl es Absatz 1 ist → «[null,'2','3']». Nach Fix:
 *      «['1','2','3']» (Bund-Konvention).
 *
 *   2. STREU-HOCHZAHLEN als Fussnoten-Verweise: mitten in einem Absatz/einer
 *      lit.-Aufzählung stehen hochgestellte Fussnoten-Verweise (z. B. «¶10»,
 *      «¶5»), die KEINE Absatznummern sind (sie brechen die monotone Folge). Sie
 *      dürfen weder eine Absatznummer setzen noch leere/Fragment-Blöcke erzeugen
 *      («komische Randziffern»). Ein leerer Streu-Marker entfällt; ein Marker mit
 *      Wort-Fragment (umbrochene Zeile) fliesst als Fortsetzung in den Absatz.
 *
 * Die serialisierten Fixtures unten entsprechen 1:1 der echten pdfjs-Extraktion
 * (verifiziert am 22.6.2026 gegen die Quell-PDF, §7): ZH-211.11 § 3 mit
 * vorangehendem «¶1» und ZH-243 § 4 mit Streu-«¶10»/«¶5».
 */
import { describe, it, expect } from 'vitest';
import {
  extrahiereAlleZhParagraphen,
  extrahiereZhParagraphen,
} from '../../scripts/normtext/adapter-zh-pdf.ts';
import { ZH_GEBVOG_TEXT } from './fixtures/zh-pdf-gebvog.ts';

describe('ZH-Absatz-Nummerierung — verlorene «¹» (Bug 1)', () => {
  it('ZH-211.11 § 3: erster Absatz wird «1» (Marker «¶1» steht VOR «§ 3.»)', () => {
    // Echter Ausschnitt: «B. Schlichtungsverfahren» (Gliederung), dann «¶1» auf
    // eigener Zeile, dann «§3.». Das «¶1» gehört zu § 3.
    const text = [
      'ren enthalten.',
      'B. Schlichtungsverfahren',
      '¶1 ',
      '§3.Bei vermögensrechtlichen Streitigkeiten beträgt die Gebühr',
      'für das Schlichtungsverfahren:',
      '¶2 ',
      'Bei nicht vermögensrechtlichen Streitigkeiten beträgt die Gebühr',
      'Fr. 100 bis Fr. 850.',
      '¶3 ',
      'Entscheidet die Schlichtungsbehörde die Streitigkeit.',
    ].join('\n');
    const a = extrahiereZhParagraphen(text, '3');
    expect(a).not.toBeNull();
    expect(a!.bloecke.map((b) => b.absatz)).toEqual(['1', '2', '3']);
    expect(a!.bloecke[0].text).toContain('Bei vermögensrechtlichen Streitigkeiten');
    expect(a!.bloecke[1].text).toContain('Bei nicht vermögensrechtlichen');
    expect(a!.bloecke[2].text).toContain('Entscheidet die Schlichtungsbehörde');
  });

  it('Backfill: erster Marker ist «¶2», impliziter Absatz 1 wird «1» benummert', () => {
    // Defensiv: selbst wenn die «¶1»-Recovery den Erst-Marker einmal NICHT
    // greift (kein vorangehender «¶1»), darf nie «[null,'2']» übrigbleiben — der
    // implizite erste Absatz ist Nr. 1.
    const text = [
      '§7.Die erste Bestimmung ohne sichtbare Absatz-Eins-Hochzahl.',
      '¶2 ',
      'Die zweite Bestimmung.',
    ].join('\n');
    const a = extrahiereZhParagraphen(text, '7');
    expect(a).not.toBeNull();
    expect(a!.bloecke.map((b) => b.absatz)).toEqual(['1', '2']);
    expect(a!.bloecke[0].text).toContain('Die erste Bestimmung');
  });
});

describe('ZH-Absatz-Nummerierung — Streu-Hochzahlen verwerfen (Bug 2)', () => {
  it('ZH-243 § 4: Streu-«¶10»/«¶5» erzeugen KEINE leeren/Fragment-Blöcke', () => {
    // Echter Ausschnitt: § 4 = Einleitung + lit. a–f, dazwischen die Fussnoten-
    // Verweis-Hochzahlen «¶10» (leer) und «¶5» (Wort-Fragment «zierungs…», der
    // Umbruch von «-finan-» am Zeilenende). Erwartung: ein einziger Block
    // (absatz null), lit. a–f intakt, Fragment an lit. f gefügt, KEINE «¶10»/«¶5».
    const text = [
      '§4.Es werden keine Gebühren erhoben für',
      'a.die Löschung von Registereinträgen und Pfandtiteln, vorbehalten',
      'bleibt Ziff. 2.2.4 des Anhangs,',
      'e.die Anmerkung von Lagefixpunkten und öffentlichen Gewässern,',
      '¶10 ',
      'f.Sicherstellungen von Darlehen und Guthaben infolge Umwandlung',
      'früherer Investitionsbeiträge und Darlehen des Kantons und der',
      'Gemeinden im Sinne von §§28–30 des Spitalplanungs- und -finan-',
      '¶5 ',
      'zierungsgesetzes vom 2. Mai 2011.',
    ].join('\n');
    const a = extrahiereZhParagraphen(text, '4');
    expect(a).not.toBeNull();
    // Genau ein Block (Absatz null — Einleitung mit lit.-items), keine Streu-Absätze.
    expect(a!.bloecke.map((b) => b.absatz)).toEqual([null]);
    // KEINE leeren/Fragment-Blöcke und KEINE Absatznummern «10»/«5».
    expect(a!.bloecke.every((b) => b.text !== '' || (b.items?.length ?? 0) > 0)).toBe(true);
    expect(a!.bloecke.some((b) => b.absatz === '10' || b.absatz === '5')).toBe(false);
    // lit. a–f vorhanden, lit. f mit gefügtem Fragment «finanzierungsgesetzes».
    const items = a!.bloecke[0].items!;
    expect(items.map((i) => i.marke)).toEqual(['a', 'e', 'f']);
    // Silbentrennung «-finan-» + «zierungsgesetzes» → «-finanzierungsgesetzes»;
    // das Fragment ist an lit. f gefügt, nicht als eigener Block übriggeblieben.
    expect(items.find((i) => i.marke === 'f')!.text).toContain('-finanzierungsgesetzes vom 2. Mai 2011.');
    expect(items.find((i) => i.marke === 'f')!.text).not.toContain('-finan- zierungsgesetzes');
  });

  it('ZH-211.11 § 14: echter Abs 5 nach Streu-«¶7» bleibt erhalten, Folgetext an Abs 4', () => {
    // Realer, kniffliger Fall: zwischen Abs 4 und dem echten Abs 5 steht die
    // Fussnoten-Hochzahl «¶7» (bricht die Folge 4→5). Erwartung: «¶7» verworfen,
    // sein Folgetext fliesst in Abs 4, der echte «¶5» wird Absatz 5.
    const text = [
      'D. Strafprozess',
      '¶1 ',
      '§14.Entscheidet das Gericht materiell über die Anklage, beträgt',
      'die Gebühr',
      '¶2 ',
      'In Ausnahmefällen kann die Gebühr ermässigt werden.',
      '¶3 ',
      'Wird das Verfahren ohne materielle Prüfung erledigt.',
      '¶4 ',
      'Wird über eine Zivilklage erst anschliessend an die Beurteilung',
      '¶7 ',
      'von Schuld und Strafpunkt entschieden, bemisst sich die Gebühr.',
      '¶5 ',
      'Muss ein Entscheid nicht schriftlich begründet werden.',
    ].join('\n');
    const a = extrahiereZhParagraphen(text, '14');
    expect(a).not.toBeNull();
    expect(a!.bloecke.map((b) => b.absatz)).toEqual(['1', '2', '3', '4', '5']);
    // Streu-«¶7»-Folgetext an Abs 4 gefügt (kein eigener Block, keine Lücke).
    expect(a!.bloecke[3].text).toContain('von Schuld und Strafpunkt entschieden');
    expect(a!.bloecke[4].text).toContain('Muss ein Entscheid nicht schriftlich');
    expect(a!.bloecke.some((b) => b.absatz === '7')).toBe(false);
  });

  it('Streu-Hochzahl OHNE Resttext wird komplett verworfen (kein leerer Block)', () => {
    const text = [
      '§9.Eine Bestimmung mit nur einem Absatz.',
      '¶12 ',
    ].join('\n');
    const a = extrahiereZhParagraphen(text, '9');
    expect(a).not.toBeNull();
    expect(a!.bloecke.map((b) => b.absatz)).toEqual([null]);
    expect(a!.bloecke).toHaveLength(1);
  });
});

describe('ZH-Absatz-Nummerierung — saubere Fälle bleiben unberührt', () => {
  it('Einzel-Absatz-Artikel bleibt ein Block mit absatz null (wie Bund)', () => {
    const text = '§1.Diese Verordnung regelt etwas. Sie hat einen einzigen Absatz.';
    const a = extrahiereZhParagraphen(text, '1');
    expect(a).not.toBeNull();
    expect(a!.bloecke).toHaveLength(1);
    expect(a!.bloecke[0].absatz).toBeNull();
  });

  it('lateinisches Suffix «1bis» folgt korrekt auf «1» (Sequenz 1→1bis→2)', () => {
    const text = [
      '§3.Erster Absatz.',
      '¶1bis ',
      'Eingefügter Absatz eins bis.',
      '¶2 ',
      'Zweiter Absatz.',
    ].join('\n');
    const a = extrahiereZhParagraphen(text, '3');
    expect(a).not.toBeNull();
    // Der implizite erste Absatz ist «1», dann «1bis», dann «2».
    expect(a!.bloecke.map((b) => b.absatz)).toEqual(['1', '1bis', '2']);
  });
});

describe('ZH-Absatz-Nummerierung — Voll-Fixture GebV OG (LS 211.11)', () => {
  it('alle §§ 1–5 tragen Bund-konforme Absatzfolgen (kein [null,2,…])', () => {
    const alle = extrahiereAlleZhParagraphen(ZH_GEBVOG_TEXT);
    expect(alle['1'].bloecke.map((b) => b.absatz)).toEqual([null]); // Einzel-Abs
    expect(alle['2'].bloecke.map((b) => b.absatz)).toEqual(['1', '2']);
    expect(alle['3'].bloecke.map((b) => b.absatz)).toEqual(['1', '2', '3']);
    expect(alle['4'].bloecke.map((b) => b.absatz)).toEqual(['1', '2', '3']);
    expect(alle['5'].bloecke.map((b) => b.absatz)).toEqual(['1', '2']);
    // Kein einziger mehrabsätziger § beginnt mit absatz null gefolgt von '2'.
    for (const art of Object.values(alle)) {
      const seq = art.bloecke.map((b) => b.absatz);
      if (seq.length >= 2 && seq[1] === '2') {
        expect(seq[0]).toBe('1');
      }
    }
  });
});
