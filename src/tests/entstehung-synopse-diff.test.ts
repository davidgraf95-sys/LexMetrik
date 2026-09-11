// ─── W2·6c-SYNOPSE-LESER · der Fassungsvergleich als reine Funktion ──────────
//
// Geprüft wird `src/lib/entstehung/synopse-diff.ts` — die Auswahl (welcher
// Alt-Block gehört zu welchem Punkt der Fassungsleiste, und was ist sein «Neu»)
// und der Diff (wo genau unterscheiden sich zwei Wortlaute). Beides ist rein
// und deterministisch (§2); die Darstellung steht woanders (§3).
//
// DIE FÄLLE SIND GEMESSEN, NICHT ERFUNDEN: die Wortlaute stammen aus den
// ausgelieferten Shards (`public/materialien/synopse/**`, Stand 11.9.2026) —
// DBG 5 (Grenzgänger-Besteuerung, 1.1.2025), AHVG 21 (Referenzalter, 1.1.2024),
// AHVG 87 (Strafnorm ohne Absatzzählung) und AHVG 103 (Absatzzählung fällt weg).
// Genau an den letzten beiden ist der Bau zweimal falsch gewesen; die Fälle
// stehen hier, damit er es nicht wieder wird.
import { describe, it, expect } from 'vitest';
import {
  geltendeBloecke, lageFuerEreignis, ohneEreignisFuerArtikel, synopseZeilen,
  tokenAusLabel, wortDiff, hatUnterschied, AEHNLICH_MIN,
  type SynopseZeile,
} from '../lib/entstehung/synopse-diff';
import type { SynopseBlock, SynopseShard } from '../lib/entstehung/synopse';

/** Die Verkettung der Stücke je Seite MUSS das Original ergeben (§7: kein Wort geht verloren). */
function verkettet(zeile: SynopseZeile, seite: 'alt' | 'neu'): string {
  return (zeile[seite] ?? []).map((s) => s.text).join('');
}
function markiert(zeile: SynopseZeile, seite: 'alt' | 'neu'): string {
  return (zeile[seite] ?? []).filter((s) => s.marke !== 'gleich').map((s) => s.text.trim()).join('|');
}

const B = (absatz: string, num: string, text: string): SynopseBlock => [absatz, num, text];

/** Minimaler Shard mit zwei Schritten am selben Artikel. */
const SHARD: SynopseShard = {
  erlass: 'TEST', eli: 'cc/2000/1', normProfil: 'entstehung-norm/2', erzeugt: '2026-09-11',
  fensterAb: '2021-01-01', kuenftigeStaende: [],
  staende: [
    { datum: '2021-01-01', xmlUrl: 'x1', liveUrl: 'l1', sha: 's1', bytes: 1, abgerufen: '2026-09-11', artikelZahl: 1 },
    { datum: '2022-01-01', xmlUrl: 'x2', liveUrl: 'l2', sha: 's2', bytes: 1, abgerufen: '2026-09-11', artikelZahl: 1 },
    { datum: '2023-01-01', xmlUrl: 'x3', liveUrl: 'l3', sha: 's3', bytes: 1, abgerufen: '2026-09-11', artikelZahl: 1 },
  ],
  schritte: [
    {
      von: '2021-01-01', bis: '2022-01-01', ereignisOhneAenderung: ['9'],
      artikel: [{
        eId: 'art_5', token: '5', label: 'Art. 5', art: 'geaendert',
        alt: [B('1', '', 'Erste Fassung des Absatzes.')], shaNorm: 'a', zustand: 'belegt', oc: ['oc/2021/1'],
      }],
    },
    {
      von: '2022-01-01', bis: '2023-01-01',
      artikel: [
        {
          eId: 'art_5', token: '5', label: 'Art. 5', art: 'geaendert',
          alt: [B('1', '', 'Zweite Fassung des Absatzes.')], shaNorm: 'b', zustand: 'belegt', oc: ['oc/2022/2'],
        },
        {
          eId: 'art_7', token: '7', label: 'Art. 7', art: 'geaendert',
          alt: [B('1', '', 'Text ohne Fussnoten-Ereignis.')], shaNorm: 'c', zustand: 'ohne_ereignis',
        },
      ],
    },
  ],
};

const GELTEND = [B('1', '', 'Dritte Fassung des Absatzes.')];

describe('Auswahl: welcher Alt-Block gehört zu diesem Punkt?', () => {
  it('«neu» ist die Alt-Fassung des FOLGESTANDS, nicht der geltende Text', () => {
    // Der Kern von §1 an dieser Karte: sonst schriebe die Synopse dem Erlass von
    // 2022 die Wörter zu, die 2023 eingefügt wurden.
    const lage = lageFuerEreignis(SHARD, '5', '2022-01-01', ['oc/2021/1'], GELTEND);
    expect(lage.art).toBe('vergleich');
    if (lage.art !== 'vergleich') return;
    expect(lage.treffer.neuHerkunft).toBe('folgestand');
    expect(lage.treffer.neu?.[0][2]).toBe('Zweite Fassung des Absatzes.');
    expect(lage.treffer.mehrdeutig).toBe(false);
  });

  it('ohne Folgestand ist «neu» der geltende Wortlaut', () => {
    const lage = lageFuerEreignis(SHARD, '5', '2023-01-01', ['oc/2022/2'], GELTEND);
    expect(lage.art).toBe('vergleich');
    if (lage.art !== 'vergleich') return;
    expect(lage.treffer.neuHerkunft).toBe('geltend');
    expect(lage.treffer.neu?.[0][2]).toBe('Dritte Fassung des Absatzes.');
  });

  it('jeder Nicht-Treffer hat einen eigenen, benannten Zustand (§8)', () => {
    expect(lageFuerEreignis(SHARD, '5', null, [], GELTEND).art).toBe('ohne_datum');
    expect(lageFuerEreignis(null, '5', '2022-01-01', [], GELTEND).art).toBe('kein_shard');
    expect(lageFuerEreignis(SHARD, '5', '2013-01-01', [], GELTEND)).toEqual({ art: 'vor_fenster', ab: '2021-01-01' });
    expect(lageFuerEreignis(SHARD, '5', '2026-06-01', [], GELTEND)).toEqual({ art: 'kein_stand', stand: '2026-06-01' });
    // Stand ausgewertet, dieser Artikel darin unverändert — und die Fussnote
    // behauptet trotzdem ein Ereignis: der Widerspruch wird angezeigt (§11.6).
    expect(lageFuerEreignis(SHARD, '9', '2022-01-01', [], GELTEND))
      .toEqual({ art: 'ohne_unterschied', stand: '2022-01-01', konflikt: true });
    expect(lageFuerEreignis(SHARD, '8', '2022-01-01', [], GELTEND))
      .toEqual({ art: 'ohne_unterschied', stand: '2022-01-01', konflikt: false });
  });

  it('mehrere Änderungserlasse am selben Stand werden als mehrdeutig markiert (§8)', () => {
    // Gemessen: 122 Fälle «zwei Erlasse am selben Datum im selben Artikel». Der
    // Unterschied gehört dann dem STAND, nicht sicher diesem einen Erlass.
    const lage = lageFuerEreignis(SHARD, '5', '2022-01-01', ['oc/2099/9'], GELTEND);
    expect(lage.art === 'vergleich' && lage.treffer.mehrdeutig).toBe(true);
  });

  it('Alt-Blöcke ohne Fussnoten-Ereignis hängen an keinem Punkt und werden eigens geliefert', () => {
    // 1175 solcher Blöcke im Bestand, 0 davon auf einem Datum mit Ereignis
    // (Messung 11.9.2026) — ohne diese Liste wäre der Zustand unerreichbar.
    const treffer = ohneEreignisFuerArtikel(SHARD, '7', GELTEND);
    expect(treffer).toHaveLength(1);
    expect(treffer[0].artikel.zustand).toBe('ohne_ereignis');
    expect(ohneEreignisFuerArtikel(SHARD, '5', GELTEND)).toHaveLength(0);
  });
});

describe('geltendeBloecke: der Korpus-Wortlaut in Synopse-Gestalt', () => {
  it('macht aus Absatz + Aufzählung die Tupel-Folge, ohne etwas zu erfinden', () => {
    expect(geltendeBloecke([
      { absatz: '1', text: 'Einleitung:', items: [{ marke: 'a', text: 'erstens;' }, { marke: 'b', text: 'zweitens.' }] },
      { absatz: '2', text: 'Zweiter Absatz.' },
      { absatz: null, text: '   ' },
    ])).toEqual([
      ['1', '', 'Einleitung:'], ['1', 'a', 'erstens;'], ['1', 'b', 'zweitens.'], ['2', '', 'Zweiter Absatz.'],
    ]);
    expect(geltendeBloecke(undefined)).toEqual([]);
  });
});

describe('wortDiff', () => {
  it('markiert nur die geänderten Wörter — und verliert kein Zeichen', () => {
    const alt = 'Der Anspruch auf die Altersrente entsteht am ersten Tag.';
    const neu = 'Der Anspruch entsteht am ersten Tag.';
    const d = wortDiff(alt, neu);
    expect(d.alt.map((s) => s.text).join('')).toBe(alt);
    expect(d.neu.map((s) => s.text).join('')).toBe(neu);
    expect(d.alt.filter((s) => s.marke === 'weg').map((s) => s.text.trim()).join('|')).toBe('auf die Altersrente');
    expect(d.neu.every((s) => s.marke === 'gleich')).toBe(true);
  });

  it('eskaliert auf den ganzen Block, wo nichts mehr wiederzuerkennen ist', () => {
    const d = wortDiff('Männer, welche das 65. Altersjahr vollendet haben;', 'Die Kasse erhebt eine Gebühr von zwanzig Franken.');
    expect(d.alt).toHaveLength(1);
    expect(d.alt[0].marke).toBe('weg');
    expect(d.neu).toHaveLength(1);
    expect(d.neu[0].marke).toBe('neu');
    expect(AEHNLICH_MIN).toBeGreaterThan(0);
  });

  it('ist deterministisch (§2): zweimal dieselbe Eingabe, zweimal dasselbe Ergebnis', () => {
    const a = 'Wer durch unwahre Angaben eine Leistung erwirkt, wird bestraft.';
    const b = 'Wer durch unwahre oder unvollständige Angaben eine Leistung erwirkt, wird bestraft.';
    expect(wortDiff(a, b)).toEqual(wortDiff(a, b));
  });
});

describe('synopseZeilen: die Gegenüberstellung', () => {
  it('richtet über die amtlichen Etiketten aus, nicht über Textähnlichkeit', () => {
    // DBG 5 zum Stand 1.1.2025 (gemessen): lit. a geändert, lit. abis eingefügt.
    const alt = [B('1', '', 'Natürliche Personen sind steuerpflichtig, wenn sie:'), B('1', 'a.', 'in der Schweiz eine Erwerbstätigkeit ausüben;'), B('1', 'b.', 'Tantiemen beziehen;')];
    const neu = [B('1', '', 'Natürliche Personen sind steuerpflichtig, wenn sie:'), B('1', 'a', 'in der Schweiz eine selbstständige oder unselbstständige Erwerbstätigkeit ausüben;'), B('1', 'abis', 'eine unselbstständige Erwerbstätigkeit für einen Arbeitgeber ausüben;'), B('1', 'b', 'Tantiemen beziehen;')];
    const z = synopseZeilen(alt, neu);
    expect(z.map((x) => x.art)).toEqual(['gleich', 'geaendert', 'eingefuegt', 'gleich']);
    // «a.» und «a» sind dieselbe amtliche Marke in zwei Schreibweisen — die
    // Normalisierung gilt nur fürs Matching, angezeigt wird der Originalwert.
    expect(markiert(z[1], 'neu')).toBe('selbstständige oder unselbstständige');
    expect(verkettet(z[1], 'alt')).toBe(alt[1][2]);
    expect(z[3].art).toBe('gleich');
  });

  it('verdichtet Blöcke ohne Etikett, statt eine Änderung zu erfinden (AHVG 87)', () => {
    // Die AKN-Konsolidierung hält die Strafnorm als EINEN Block, der
    // Korpus-Adapter als drei. Ohne Verdichtung meldete die Karte zwei
    // Einfügungen, die es nie gegeben hat (§1).
    const alt = [B('', '', 'Wer unwahre Angaben macht,\nwer die Meldepflicht verletzt,\nwird bestraft.')];
    const neu = [B('', '', 'Wer unwahre Angaben macht,'), B('', '', 'wer die Meldepflicht verletzt,'), B('', '', 'wird bestraft.')];
    const z = synopseZeilen(alt, neu);
    expect(z).toHaveLength(1);
    expect(z[0].art).toBe('gleich');
    expect(hatUnterschied(z)).toBe(false);
  });

  it('vergleicht über den ganzen Artikel, wenn eine Seite keine Etiketten führt (AHVG 103)', () => {
    const alt = [B('1', '', 'Der Bundesbeitrag beläuft sich auf 19,55 Prozent der Ausgaben.'), B('1bis', '', 'Der Beitrag wird erhöht.')];
    const neu = [B('', '', 'Der Bundesbeitrag beläuft sich auf 20,2 Prozent der Ausgaben.')];
    const z = synopseZeilen(alt, neu);
    expect(z).toHaveLength(1);
    expect(z[0].ganzerArtikel).toBe(true);
    expect(markiert(z[0], 'alt')).toContain('19,55');
    expect(markiert(z[0], 'neu')).toContain('20,2');
  });

  it('nennt eine Streichung eine Streichung, statt «…» als neuen Wortlaut zu zeigen (ZPO 176)', () => {
    const alt = [B('3', '', 'Werden die Aussagen aufgezeichnet, so kann das Gericht darauf verzichten.')];
    const neu = [B('3', '', '…')];
    const z = synopseZeilen(alt, neu);
    expect(z[0].art).toBe('entfernt');
    expect(z[0].neu).toBeNull();
  });

  it('meldet ehrlich, wenn zwischen zwei Ständen kein Unterschied erkennbar ist (§8)', () => {
    const gleich = [B('1', '', 'Unveränderter Wortlaut.')];
    expect(hatUnterschied(synopseZeilen(gleich, gleich))).toBe(false);
  });
});

describe('tokenAusLabel (Entwurf ↔ Beschluss)', () => {
  it('liest die Artikelnummer aus dem Bundesblatt-Kopf, nie mehr', () => {
    expect(tokenAusLabel('Art. 107 Abs. 3')).toBe('107');
    expect(tokenAusLabel('Art. 25 Betrieb der Zentren des Bundes')).toBe('25');
    expect(tokenAusLabel('Art. 13a Medizinische Massnahmen')).toBe('13_a');
    expect(tokenAusLabel('Art. 68novies Datenerhebung')).toBe('68_novies');
    expect(tokenAusLabel('Art. 16kbis Abs. 3 und 3bis')).toBe('16_kbis');
  });

  it('rät nicht, wo kein Artikelkopf steht (§2)', () => {
    expect(tokenAusLabel('Gliederungstitel nach Art. 24e')).toBeNull();
    expect(tokenAusLabel('8. Kapitel 5. Abschnitt (Art. 59–61)')).toBeNull();
    expect(tokenAusLabel('Va. (Art. 45a)')).toBeNull();
  });
});
