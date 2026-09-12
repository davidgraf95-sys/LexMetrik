import { describe, it, expect } from 'vitest';
import { verlaufLabel, materialPfad } from '../lib/verlaufLabel';
import type { BrowseManifest } from '../lib/normtext/browse-typen';
import type { EntscheidManifest } from '../lib/rechtsprechung/register';
import type { MaterialManifest } from '../lib/materialien/typen';

// R7 F3 (W2·24-DESIGN-IDENTITAET, Session E6, 6./7.9.2026): der Reiter-Titel
// widersprach dem Seiteninhalt — die Tab-Leiste zeigte weiterhin den generischen
// Lade-Platzhalter «Entscheid öffnen», während die Fläche bereits «Entscheid
// nicht gefunden» meldete (Linse 3, Konsistenz). Ursache: `verlaufLabel()`
// unterschied nicht zwischen «Manifest lädt noch» (kein Wert vorhanden) und
// «Manifest geladen, Schlüssel fehlt» (nachweislich nicht gefunden) — beide
// Fälle ergaben denselben `find()`-Fehlschlag. Fix EINHEITLICH für alle drei
// Manifest-Zweige (Gesetz/Entscheid/Material), keine Sonderlösung nur für
// Entscheide.

const LEERES_GESETZE: BrowseManifest = { erzeugt: '2026-01-01', erlasse: [] };
const LEERE_ENTSCHEIDE: EntscheidManifest = { erzeugt: '2026-01-01', entscheide: [] };
const LEERE_MATERIALIEN: MaterialManifest = { erzeugt: '2026-01-01', materialien: [] };

describe('verlaufLabel — F3: Lade-Platzhalter vs. «nicht gefunden»', () => {
  it('Entscheid: Manifest noch nicht geladen → weiterhin der Lade-Platzhalter', () => {
    expect(verlaufLabel('/rechtsprechung/DOES-NOT-EXIST', {})).toBe('Entscheid öffnen');
  });

  it('Entscheid: Manifest geladen, Schlüssel fehlt → «nicht gefunden», kein Platzhalter mehr', () => {
    expect(verlaufLabel('/rechtsprechung/DOES-NOT-EXIST', { entscheide: LEERE_ENTSCHEIDE }))
      .toBe('Entscheid nicht gefunden');
  });

  it('Gesetz: dieselbe Unterscheidung, gleiche Bauform', () => {
    expect(verlaufLabel('/gesetze/bund/does-not-exist', {})).toBe('Gesetz öffnen');
    expect(verlaufLabel('/gesetze/bund/does-not-exist', { gesetze: LEERES_GESETZE }))
      .toBe('Gesetz nicht gefunden');
  });

  it('Material: dieselbe Unterscheidung, gleiche Bauform', () => {
    expect(verlaufLabel('/materialien/does-not-exist', {})).toBe('Material öffnen');
    expect(verlaufLabel('/materialien/does-not-exist', { materialien: LEERE_MATERIALIEN }))
      .toBe('Material nicht gefunden');
  });

  it('unverändert: ein gefundener Entscheid liefert weiterhin seine Zitierung', () => {
    const manifest: EntscheidManifest = {
      erzeugt: '2026-01-01',
      entscheide: [{ key: 'BGE-146-III-1', zitierung: 'BGE 146 III 1' } as EntscheidManifest['entscheide'][number]],
    };
    expect(verlaufLabel('/rechtsprechung/BGE-146-III-1', { entscheide: manifest })).toBe('BGE 146 III 1');
  });
});

// ─── W2·6c-DECKUNGS-SEITE (12.9.2026) · EINE SEITE IST KEIN MATERIAL ─────────
//
// GEMESSEN vor dem Fix (Sonde e2e/deckung-seite (a), gebautes dist/): der Aufruf
// von `/materialien/deckung` holte `/materialien/register.json` — 1,4 MB für eine
// Seite, die genau deshalb eine 78-KB-Projektion bekommen hat. Ursache: die
// statische Unterseite liegt unter `/materialien/`, also gab `materialPfad()`
// `{key:'deckung'}` zurück, und jeder Aufrufer (zuletztTitel, verlaufLabel,
// Reiterleiste) lud das Register, um einen Schlüssel zu suchen, den es nie gab.
//
// Der Wächter ist die REGEL, nicht der eine Pfad: wer einen eigenen Meta-Eintrag
// hat (`metaFuerPfad`), ist eine Seite. Der letzte Fall hier hält genau das fest
// — eine künftige statische Unterseite von /materialien fällt automatisch mit
// darunter, ohne dass jemand diesen Test anfassen muss.

describe('materialPfad() — Detailseite vs. eigene Seite', () => {
  it('löst einen echten Material-Schlüssel weiterhin auf', () => {
    expect(materialPfad('/materialien/ESTV-KS-5')).toEqual({ key: 'ESTV-KS-5' });
    expect(materialPfad('/materialien/BS-GR-24.1692')).toEqual({ key: 'BS-GR-24.1692' });
  });

  it('dekodiert den Schlüssel wie bisher', () => {
    expect(materialPfad('/materialien/A%20B')).toEqual({ key: 'A B' });
  });

  it('gibt für die Deckungs-Seite null zurück — sie ist eine Seite, kein Material', () => {
    expect(materialPfad('/materialien/deckung')).toBeNull();
  });

  it('gibt auch für die Übersicht und fremde Rubriken null zurück', () => {
    expect(materialPfad('/materialien')).toBeNull();
    expect(materialPfad('/gesetze/bund/OR')).toBeNull();
  });

  it('die Deckungs-Seite bekommt darum ihr Seiten-Label, nicht «Material öffnen»', () => {
    // Ohne den Fix stand hier der Lade-Platzhalter des Material-Zweigs — und mit
    // ihm der Register-Abruf, der ihn auflösen sollte.
    expect(verlaufLabel('/materialien/deckung', {})).not.toBe('Material öffnen');
    expect(verlaufLabel('/materialien/deckung', { materialien: LEERE_MATERIALIEN }))
      .not.toBe('Material nicht gefunden');
  });
});
