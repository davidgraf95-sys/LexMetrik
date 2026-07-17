import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  parseClirRegeste, schneideRegesteDiv, schneideAlleRegesteDivs, parseRegesteLabel,
  inlineZuText, bgeRefZuClirId, clirUrl, parseClirUrteilskopf,
} from '../../scripts/normtext/clir-regeste';

const FIX = (n: string) => readFileSync(join(__dirname, 'fixtures', n), 'utf8');

describe('bgeRefZuClirId', () => {
  it('mappt die amtliche BGE-Fundstelle auf das clir-docid-Segment', () => {
    expect(bgeRefZuClirId('152 V 2')).toBe('152-V-2');
    expect(bgeRefZuClirId('151 IV 357')).toBe('151-IV-357');
    expect(bgeRefZuClirId('150 III 137')).toBe('150-III-137');
  });
  it('gibt null bei unerwartetem Format (kein clir-Abruf, §1)', () => {
    expect(bgeRefZuClirId('5A_1100/2025')).toBeNull();
    expect(bgeRefZuClirId('152 V')).toBeNull();
    expect(bgeRefZuClirId('')).toBeNull();
  });
});

describe('clirUrl', () => {
  it('baut die amtliche clir-URL je Sprache (docid url-kodiert)', () => {
    const u = clirUrl('152-V-2', 'fr');
    expect(u).toContain('/live/fr/');
    expect(u).toContain(encodeURIComponent('atf://152-V-2:fr'));
    expect(u).toContain('type=show_document');
  });
});

describe('inlineZuText', () => {
  it('hängt <sup> ohne Trennzeichen an den Vortoken (amtl. Zitierform)', () => {
    expect(inlineZuText('Art. 61 lit. f<sup>bis</sup> ATSG')).toBe('Art. 61 lit. fbis ATSG');
    expect(inlineZuText('Art. 90 Abs. 3<sup>ter</sup> SVG')).toBe('Art. 90 Abs. 3ter SVG');
    expect(inlineZuText('le 1<sup>er</sup> janvier')).toBe('le 1er janvier');
  });
  it('entfernt Tags (Inhalt bleibt) und dekodiert Entities', () => {
    expect(inlineZuText('l&#39;<span class="artref">art. 69</span> LAI')).toBe("l'art. 69 LAI");
    expect(inlineZuText('A &amp; B')).toBe('A & B');
  });
});

describe('schneideRegesteDiv (DIV-Balancierung)', () => {
  it('schneidet den regeste-Teilbaum trotz verschachtelter divs korrekt heraus', () => {
    const html = '<x><div id="regeste" lang="de"><div class="a">K<div class="b">tief</div></div></div><div>danach</div></x>';
    const r = schneideRegesteDiv(html);
    expect(r?.sprache).toBe('de');
    expect(r?.inner).toContain('tief');
    expect(r?.inner).not.toContain('danach');
  });
  it('gibt null, wenn keine Regeste vorhanden ist (§1: nie geraten)', () => {
    expect(schneideRegesteDiv('<html><body>kein regeste</body></html>')).toBeNull();
  });
});

describe('parseClirRegeste (echte amtliche BGE-Seite)', () => {
  const p = parseClirRegeste(FIX('clir-regeste-152-V-2-de.html'));
  it('trennt Regestenkopf und Absätze', () => {
    expect(p).not.toBeNull();
    expect(p!.sprache).toBe('de');
    // Kopf = massgebliche Artikel + Regestentitel (der fette Teil).
    expect(p!.kopf.startsWith('Art. 56 Abs. 2, Art. 61 lit. a und fbis ATSG und Art. 69 Abs. 1bis IVG')).toBe(true);
    expect(p!.kopf).toContain('Gerichtskosten im kantonalen Verfahren');
    expect(p!.absaetze.length).toBe(1);
    expect(p!.absaetze[0]).toContain('Rechtsverweigerungs');
    expect(p!.absaetze[0].trim().endsWith('(E. 4.3.2).')).toBe(true);
  });
  it('erhält Umlaute verbatim (iso-8859-1 korrekt dekodiert)', () => {
    expect(/[äöü]/.test(p!.absaetze[0])).toBe(true);
    expect(p!.kopf + p!.absaetze.join('')).not.toContain('�');
  });
  it('lässt den Regestentitel NICHT in den Kopf-Text lecken (kein sup-Rest)', () => {
    expect(p!.kopf).not.toContain('<');
    expect(p!.absaetze[0]).not.toContain('<');
  });
});

// ─── Mehrteilige Regeste «Regeste a / b / c» (Bug-Fix A29, 16.7.2026) ──────────
// Die amtliche Quelle legt jeden Regeste-Teil als EIGENEN <div id="regeste">-Block
// ab; der alte Einzelschnitt nahm nur den ersten Teil (Regeste b/c gingen verloren
// — Symptom BGE 147 III 121). Fixture = echte bger.ch-DE-Seite (zwei Teile a+b).
describe('mehrteilige Regeste (A29)', () => {
  const H = FIX('clir-regeste-147-III-121-de.html');
  it('schneideAlleRegesteDivs findet ALLE Regeste-Blöcke (nicht nur den ersten)', () => {
    const divs = schneideAlleRegesteDivs(H);
    expect(divs.length).toBe(2);
    expect(divs.every((d) => d.sprache === 'de')).toBe(true);
    expect(divs[0].inner).toContain('alternierende Obhut');
    expect(divs[1].inner).toContain('Erziehungsgutschriften');
    expect(divs[0].inner).not.toContain('Erziehungsgutschriften'); // Blöcke sauber getrennt
  });
  it('parseRegesteLabel liest den Teil-Buchstaben (DE/FR «Regeste x», IT «Regesto x»)', () => {
    expect(parseRegesteLabel('Regeste&nbsp;a')).toBe('a');
    expect(parseRegesteLabel('Regeste&nbsp;b')).toBe('b');
    expect(parseRegesteLabel('Regesto&nbsp;c')).toBe('c');
    expect(parseRegesteLabel('Regeste')).toBeNull();     // Einfach-Regeste
    expect(parseRegesteLabel('Regesto')).toBeNull();
  });
  it('parseClirRegeste liefert weitereRegesten mit Label a+b, Teile inhaltstreu getrennt', () => {
    const p = parseClirRegeste(H);
    expect(p).not.toBeNull();
    // Rückwärtskompat: kopf/absaetze = erster Teil (a).
    expect(p!.kopf.startsWith('Art. 298 Abs. 2 ter ZGB')).toBe(true);
    expect(p!.weitereRegesten?.length).toBe(2);
    expect(p!.weitereRegesten!.map((t) => t.label)).toEqual(['a', 'b']);
    expect(p!.weitereRegesten![0].kopf).toBe(p!.kopf);           // Projektions-Konsistenz (§5)
    expect(p!.weitereRegesten![0].absaetze).toEqual(p!.absaetze);
    // Teil b trägt seinen eigenen Kopf + Absatz (der verlorene Teil).
    expect(p!.weitereRegesten![1].kopf).toContain('AHVV');
    expect(p!.weitereRegesten![1].kopf).toContain('Erziehungsgutschriften');
    expect(p!.weitereRegesten![1].absaetze[0]).toContain('geteilter Betreuung (E. 3.4).');
  });
  it('Einfach-Regeste bleibt ohne weitereRegesten (byte-treu, §6)', () => {
    const p = parseClirRegeste(FIX('clir-regeste-152-V-2-de.html'));
    expect(p!.weitereRegesten).toBeUndefined();
  });
});

// ─── parseClirUrteilskopf (W2·6 BGE-Band-Nachzug; Fix Gegenprüfung 12.7.2026) ──
// Der clir-Urteilskopf ist die AMTLICHE aza↔BGE-Bindung: OCLs docket_number_2 war
// bei BGE 146 II 304 falsch (1C_345/2014 = nur zitiertes Präjudiz); der Kopf nennt
// das eigene Az. + echtes Urteilsdatum. Fixtures = echte bger.ch-Seiten (utf8-
// dekodiert im Cache-Format, wie holeClirHtml sie liefert).
describe('parseClirUrteilskopf', () => {
  it('extrahiert eigenes Az. + Datum, verbundene Verfahren → ERSTES Az. (146 II 304)', () => {
    const k = parseClirUrteilskopf(FIX('clir-urteilskopf-146-II-304-de.html'));
    // Kopf: «… 1C_22/2019 / 1C_476/2019 vom 6. April 2020 …» — NICHT das in den
    // Erwägungen zitierte 1C_345/2014 (das falsche docket_number_2 der Quelle).
    expect(k.aza).toBe('1C_22/2019');
    expect(k.datumIso).toBe('2020-04-06');
  });
  it('parst den französischen Urteilskopf auf der DE-Seite (147 III 463: «du 1er septembre 2021»)', () => {
    const k = parseClirUrteilskopf(FIX('clir-urteilskopf-147-III-463-de.html'));
    expect(k.aza).toBe('4A_606/2020');
    expect(k.datumIso).toBe('2021-09-01');
  });
  it('gibt {null,null} ohne Urteilskopf (nie raten, §1)', () => {
    expect(parseClirUrteilskopf('<html><body>kein Kopf</body></html>')).toEqual({ aza: null, datumIso: null });
  });
});
