import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  parseClirRegeste, schneideRegesteDiv, inlineZuText, bgeRefZuClirId, clirUrl,
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
