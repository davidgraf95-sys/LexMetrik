import { describe, it, expect } from 'vitest';
import { hervorhebungsStellen } from '../lib/suche/hervorhebung';
import { normalisiereBegriff } from '../lib/suche/vokabular';

// ─── LM-187: die Hervorhebung muss die TREFFER-Semantik spiegeln ─────────────
//
// Rot-Beweis (Prod, 5.9.2026, `/rechner/zpo-fristen` @1440, «OR 257d» in die
// Kopfsuche): `<mark>` lag auf «or» in «S·or·gfalt» — die alte `markiere()` in
// SuchResultate.tsx baute ein Alternativ-Muster aus den Query-Wörtern ohne
// Wortanfangs-Anker. Der Index trifft aber mit `tokenize: 'forward'` nur ab
// Wortanfang (artikelVolltext.ts `trifftWortgrenze`, artikelRanking.ts
// `trifft`). Diese Tests binden genau diese Deckungsgleichheit.
//
// Ablesehilfe: `markiert()` gibt die hervorgehobenen Stücke als Strings zurück,
// `mitKlammern()` zeigt sie im Kontext — so steht im Fehlerfall die Stelle da,
// nicht nur ein Index.

function markiert(text: string, q: string): string[] {
  return hervorhebungsStellen(text, q).map((s) => text.slice(s.start, s.ende));
}

function mitKlammern(text: string, q: string): string {
  const stellen = hervorhebungsStellen(text, q);
  let aus = '';
  let pos = 0;
  for (const s of stellen) {
    aus += text.slice(pos, s.start) + '[' + text.slice(s.start, s.ende) + ']';
    pos = s.ende;
  }
  return aus + text.slice(pos);
}

describe('hervorhebungsStellen — Wortanfang statt Substring (LM-187)', () => {
  it('markiert «or» NICHT mitten in «Sorgfalt» (der reproduzierte Befund)', () => {
    const text = 'Verpflichtung des Mieters zu Sorgfalt und Rücksichtnahme';
    expect(markiert(text, 'OR 257d')).toEqual([]);
  });

  it('markiert «or» am Wortanfang — als eigenes Wort und als Präfix', () => {
    expect(mitKlammern('Art. 257d OR und die Ordnung', 'OR 257d'))
      .toBe('Art. [257d] [OR] und die [Or]dnung');
  });

  it('markiert «miete» nicht in «Vermieter»/«Untermiete», wohl aber in «Mieter»', () => {
    const text = 'Der Vermieter überlässt dem Mieter die Sache; Untermiete bleibt vorbehalten.';
    expect(markiert(text, 'Miete')).toEqual(['Miete']);
    expect(mitKlammern(text, 'Miete'))
      .toBe('Der Vermieter überlässt dem [Miete]r die Sache; Untermiete bleibt vorbehalten.');
  });

  it('markiert «lohn» nicht in «Jahreslohnes»/«Naturallohn»', () => {
    const text = 'ein Teil des Jahreslohnes, als Naturallohn, ist der Lohn geschuldet';
    expect(markiert(text, 'vaterschaftsurlaub lohn')).toEqual(['Lohn']);
  });
});

describe('hervorhebungsStellen — Normalisierung deckungsgleich zum Index', () => {
  it('Umlaut: «über» trifft «Über…»/«über…» und die Spanne sitzt zeichengenau', () => {
    const text = 'Ist sie überschuldet, so ist die Übertragung ausgeschlossen';
    expect(mitKlammern(text, 'über'))
      .toBe('Ist sie [über]schuldet, so ist die [Über]tragung ausgeschlossen');
  });

  it('Umlaut, ehrliche Grenze: «Ueber» trifft «Über» NICHT — wie der Index', () => {
    // `normalisiereBegriff` strippt Diakritika («über» → «uber»), schreibt aber
    // keine deutsche Umlaut-Auflösung («ue» → «ü»). Wer «Ueber» tippt, findet
    // «Übertragung» auch in der Trefferliste nicht; die Hervorhebung darf hier
    // nicht grosszügiger sein als die Suche (§5/§8) — sonst wäre sie eine
    // zweite Wahrheit über das, was als Treffer gilt.
    expect(normalisiereBegriff('Über')).toBe('uber');
    expect(normalisiereBegriff('Ueber')).toBe('ueber');
    expect(markiert('so ist die Übertragung ausgeschlossen', 'Ueber')).toEqual([]);
  });

  it('Umlaut in dekomponierter Schreibweise (NFD): Spanne bleibt zeichengenau', () => {
    // «Übertragung» als U + KOMBINIERENDES TREMA (U+0308): der normalisierte
    // Text ist um ein Zeichen kürzer als das Original. Ohne die Rückwärts-Karte
    // in `normalisiereMitKarte` sässe der Marker hier um ein Zeichen verschoben.
    const text = 'die U\u0308bertragung'; // U + U+0308, NICHT vorkomponiert
    expect(hervorhebungsStellen(text, 'über')).toEqual([{ start: 4, ende: 9 }]);
    expect(text.slice(4, 9).normalize('NFC')).toBe('Über');
  });

  it('zeichenweise Karte bleibt deckungsgleich mit normalisiereBegriff', () => {
    // Bindet den ASCII-Schnellpfad UND die Hüll-Technik in `normalisiereMitKarte`
    // an die SSoT-Funktion: markiert man ein Wort mit sich selbst als Query, muss
    // die Spanne genau das ganze Wort decken — auch dort, wo die Normalisierung
    // die Länge ändert (Umlaut, Ligatur «ﬁ» → «fi», freistehendes Trema, «İ»).
    const vorrat = ['A', 'Z', 'a', 'z', '0', '9', 'Ä', 'Ü', 'ö', 'é', 'à', 'ç', 'ñ',
      'İ', 'ﬁ', '\u0308'];
    for (const z of vorrat) {
      const wort = 'a' + z + 'b';
      // Nur Wörter, die normalisiert EIN Token ergeben, sind als Ganzes suchbar
      // (bei «ß», «æ», «ı» bliebe ein Nicht-[a-z0-9]-Zeichen stehen).
      if (!/^[a-z0-9]+$/.test(normalisiereBegriff(wort))) continue;
      expect(markiert(wort, wort), `Zeichen U+${z.codePointAt(0)!.toString(16)}`).toEqual([wort]);
    }
  });
});

describe('hervorhebungsStellen — Wortgrenzen, Mehrwort, Sonderzeichen', () => {
  it('Bindestrich und Klammer sind Wortgrenzen, kein Wortinneres', () => {
    expect(mitKlammern('Miet-Zins und Nebenkosten (Zinsen)', 'zins'))
      .toBe('Miet-[Zins] und Nebenkosten ([Zins]en)');
  });

  it('Mehrwort: jeder Term ab 2 Zeichen markiert, einzelne Zeichen nicht', () => {
    const text = 'Kündigung wegen Zahlungsrückstand des Mieters, Art. 5';
    expect(markiert(text, 'Kündigung Mieter 5')).toEqual(['Kündigung', 'Mieter']);
  });

  it('überlappende Terme verschmelzen zu EINER Spanne (kein mark im mark)', () => {
    expect(hervorhebungsStellen('Mietvertrag', 'miet mietvertrag')).toEqual([{ start: 0, ende: 11 }]);
  });

  it('Sonderzeichen sind Daten, kein Muster: «c++ (or)» wirft nicht und trennt an ihnen', () => {
    // Die alte Implementierung baute aus den Query-Wörtern ein RegExp und musste
    // sie darum escapen. Hier fliesst nie ein Term in ein Muster — die Terme
    // kommen aus `sucherTerme`, das an Nicht-Alphanumerischem trennt.
    expect(() => hervorhebungsStellen('Ordnung der Organisation', 'c++ (or)')).not.toThrow();
    expect(markiert('Ordnung der Organisation', 'c++ (or)')).toEqual(['Or', 'Or']);
    expect(markiert('Text ohne Treffer', '.*')).toEqual([]);
    expect(markiert('Preis (netto) und Kosten', '(netto)')).toEqual(['netto']);
  });

  it('leere Query und leerer Text liefern keine Stellen', () => {
    expect(hervorhebungsStellen('irgendein Text', '   ')).toEqual([]);
    expect(hervorhebungsStellen('', 'Miete')).toEqual([]);
  });
});
