import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { standAusweis, zitatMitAusweis, heuteIso } from '../lib/format';
import { baueZitat } from '../pages/gesetz-leser/helpers';
import { ArtikelBody } from '../components/normtext/ArtikelBody';
import type { NormSnapshot } from '../lib/normtext/typen';

// B-6 (QS-BASIS): jede Zitat-Kopie trägt den Stand-Ausweis (§7 a–d) —
// Fassungs-/Konsolidierungsdatum + Abrufdatum + Permalink. Die Kopie-Handler der
// Komponenten (Reader-Artikel, inline-Marke, Entscheid) setzen den String über
// EINEN Baustein (`zitatMitAusweis`) zusammen; hier die Vertrags-Prüfung je Pfad:
// der kopierte String enthält Stand + Abruf + URL.

const ABRUF = '2026-07-17';
const PERMALINK = 'https://lexmetrik.vercel.app/gesetze/bund/OR#art-7';

describe('standAusweis (fachneutraler Baustein)', () => {
  it('mit Fassung: «Fassung vom … · abgerufen am … · <url>» in fester Reihenfolge', () => {
    const s = standAusweis({ fassung: '2025-01-01', abruf: ABRUF, permalink: PERMALINK });
    expect(s).toBe(`Fassung vom 01.01.2025 · abgerufen am 17.07.2026 · ${PERMALINK}`);
  });

  it('ohne Fassung (Entscheid): Fassung wird ehrlich weggelassen (§8), nichts erfunden', () => {
    const s = standAusweis({ abruf: ABRUF, permalink: PERMALINK });
    expect(s).toBe(`abgerufen am 17.07.2026 · ${PERMALINK}`);
    expect(s).not.toContain('Fassung');
  });

  it('zitatMitAusweis: Fundstelle Zeile 1, Stand-Ausweis Zeile 2', () => {
    const s = zitatMitAusweis('Art. 7 OR', { fassung: '2025-01-01', abruf: ABRUF, permalink: PERMALINK });
    const [z1, z2] = s.split('\n');
    expect(z1).toBe('Art. 7 OR');
    expect(z2).toBe(`Fassung vom 01.01.2025 · abgerufen am 17.07.2026 · ${PERMALINK}`);
  });

  it('heuteIso: Date-Eingabe → strenges ISO (YYYY-MM-DD), §2-konform', () => {
    expect(heuteIso(new Date('2026-07-17T09:30:00Z'))).toBe('2026-07-17');
    expect(heuteIso(new Date())).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('Pfad 1 — Reader-Artikel-Zitat-Kopie (baueZitat + Ausweis)', () => {
  // Reproduziert exakt ArtikelLeser.kopiere('zitat'): baueZitat trägt bereits die
  // Fassung als «(Stand …)» → der Ausweis ergänzt NUR Abruf + Permalink (kein
  // doppeltes Standdatum, §5).
  const erlass = { kuerzel: 'OR', sr: '220', stand: '2025-01-01' };
  const kopie = zitatMitAusweis(baueZitat(erlass, 'Art. 7'), { abruf: ABRUF, permalink: PERMALINK });

  it('enthält Stand + Abruf + URL', () => {
    expect(kopie).toContain('Stand 01.01.2025');       // Fassung (via baueZitat)
    expect(kopie).toContain('abgerufen am 17.07.2026'); // Abruf
    expect(kopie).toContain(PERMALINK);                 // Permalink
  });

  it('Standdatum steht nur EINMAL (kein doppeltes «Fassung vom» neben «(Stand …)»)', () => {
    expect(kopie).not.toContain('Fassung vom');
    expect(kopie.match(/01\.01\.2025/g)).toHaveLength(1);
  });
});

describe('Pfad 3 — inline-Marke (Abs./lit./Ziff.) im Reader', () => {
  // Reproduziert ZitierMarke.kopiere mit Ausweis-Basis: die Fundstelle trägt KEIN
  // Standdatum → der Ausweis liefert die Fassung explizit.
  const kopie = zitatMitAusweis('Art. 7 Abs. 2 OR', {
    fassung: '2025-01-01', abruf: ABRUF, permalink: PERMALINK,
  });
  it('enthält Fassung + Abruf + URL', () => {
    expect(kopie).toContain('Fassung vom 01.01.2025');
    expect(kopie).toContain('abgerufen am 17.07.2026');
    expect(kopie).toContain(PERMALINK);
  });
});

describe('Pfad 4/5 — Entscheid-Fundstellen-Kopie (BGE/BGer)', () => {
  // Reproduziert EntscheidBody.kopiere / EntscheidLeser.kopiereZitat: ein Entscheid
  // hat keine Konsolidierung → keine Fassung, aber Abruf + Permalink.
  const perma = 'https://lexmetrik.vercel.app/rechtsprechung/BGE-146-III-1#erw-2-1';
  const kopie = zitatMitAusweis('BGE 146 III 1, E. 2.1', { abruf: ABRUF, permalink: perma });
  it('enthält Zitierung + Abruf + URL, aber KEINE Fassung (§8)', () => {
    expect(kopie).toContain('BGE 146 III 1, E. 2.1');
    expect(kopie).toContain('abgerufen am 17.07.2026');
    expect(kopie).toContain(perma);
    expect(kopie).not.toContain('Fassung');
  });
});

describe('Client-only-Beweis: die Ausweis-Basis ändert das gerenderte Markup NICHT', () => {
  // «Reader-Zitat-Kopie ist client-only (byte-gleich erwartet — beweisen)»: der
  // Stand-Ausweis entsteht erst im Klick-Handler. Darum muss das SSR-Markup mit und
  // ohne fassung/permalinkBasis in zitierKontext byte-identisch sein.
  const bloecke: NormSnapshot['bloecke'] = [
    { absatz: '1', text: 'Erster Absatz.' },
    { absatz: '2', text: 'Zweiter Absatz mit Liste:', items: [{ marke: 'a', text: 'erster Buchstabe;' }] },
  ];
  const ohne = renderToString(createElement(ArtikelBody, {
    bloecke, artikel: '7', passus: { absatz: null },
    zitierKontext: { artikelLabel: 'Art. 7', kuerzel: 'OR' },
  }));
  const mit = renderToString(createElement(ArtikelBody, {
    bloecke, artikel: '7', passus: { absatz: null },
    zitierKontext: { artikelLabel: 'Art. 7', kuerzel: 'OR', fassung: '2025-01-01', permalinkBasis: '/gesetze/bund/OR#art-7' },
  }));
  it('SSR-Markup byte-identisch (Ausweis ist rein Klick-Zeit)', () => {
    expect(mit).toBe(ohne);
  });
});
