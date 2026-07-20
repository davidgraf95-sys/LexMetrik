import { describe, it, expect } from 'vitest';
import { besetzungsTeile } from '../lib/rechtsprechung/besetzung-verlinkung';
import { parseBesetzung } from '../lib/rechtsprechung/besetzung';
import type { RichterRef } from '../lib/rechtsprechung/register';

// Alle Fixtures sind REALE Besetzungs-Freitexte aus dem Korpus. Die `refs` werden
// so gebildet, wie der Generator sie bildet (`parseBesetzung(...).richter.map`) —
// damit prüft der Test genau den Kontrakt, auf dem die Verlinkung beruht.
const refsWie = (t: string, gericht: string): RichterRef[] =>
  parseBesetzung(t, { gericht }).richter.map((r) => ({ s: r.slug, r: r.rolle }));

const wortlaut = (teile: { text: string }[]) => teile.map((t) => t.text).join('');
const links = (teile: { text: string; slug: string | null }[]) =>
  teile.filter((t) => t.slug).map((t) => `${t.text}→${t.slug}`);

describe('besetzungsTeile — Wortlaut-Treue (§8, harte Invariante)', () => {
  const faelle: [string, string][] = [
    ['Dr. G. Thomi (Vorsitz), Dr. T. Fasnacht, Dr. R. Schibli', 'bs_appellationsgericht'],
    ['MM. les Juges fédéraux Seiler, Président, Aubry Girardin, Donzallaz et Beusch, Greffier: M. Dubey', 'bge'],
    ['Bundesrichter Bovey, Präsident, Gerichtsschreiber Zingg', 'bger'],
    ['lic. iur. M. Prack Hoenen, Dr. Olivier Steiner', 'bs_appellationsgericht'],
  ];
  for (const [text, gericht] of faelle) {
    it(`hängt lückenlos zum Original zusammen: «${text.slice(0, 40)}…»`, () => {
      const teile = besetzungsTeile(text, gericht, refsWie(text, gericht));
      expect(wortlaut(teile)).toBe(text);
    });
  }

  it('gilt auch ohne Manifest-Refs (dann gar keine Links)', () => {
    const t = 'Dr. G. Thomi (Vorsitz), Dr. T. Fasnacht';
    expect(besetzungsTeile(t, 'bs_appellationsgericht', undefined)).toEqual(
      [{ text: t, slug: null, rolle: null }],
    );
  });

  it('leerer/fehlender Freitext ergibt nichts (kein erfundener Leerzustand)', () => {
    expect(besetzungsTeile(null, 'bge', [])).toEqual([]);
    expect(besetzungsTeile('   ', 'bge', [])).toEqual([]);
  });
});

describe('besetzungsTeile — Richter verlinken, Gerichtsschreiber nie', () => {
  it('verlinkt die BS-Richter, nicht die Gerichtsschreiberin', () => {
    const t = 'Dr. Olivier Steiner (Vorsitz), Dr. Claudius Gelzer, Gerichtsschreiberin Anja Dillena';
    const teile = besetzungsTeile(t, 'bs_appellationsgericht', refsWie(t, 'bs_appellationsgericht'));
    expect(wortlaut(teile)).toBe(t);
    expect(links(teile)).toEqual([
      'Olivier Steiner→steiner-olivier',
      'Claudius Gelzer→gelzer-claudius',
    ]);
    // Die Gerichtsschreiberin steht im Wortlaut, aber unverlinkt (Facette ?richter=
    // trifft nur richterliche Mitwirkung → ein GS-Link liefe ins Leere).
    expect(teile.some((x) => x.slug && x.text.includes('Dillena'))).toBe(false);
    expect(wortlaut(teile)).toContain('Anja Dillena');
  });

  it('verlinkt die Bundesrichter, nicht den Greffier', () => {
    const t = 'MM. les Juges fédéraux Seiler, Président, Aubry Girardin, Donzallaz et Beusch, Greffier: M. Dubey';
    const teile = besetzungsTeile(t, 'bge', refsWie(t, 'bge'));
    expect(wortlaut(teile)).toBe(t);
    expect(links(teile)).toEqual([
      'Seiler→seiler',
      'Aubry Girardin→aubry-girardin',
      'Donzallaz→donzallaz',
      'Beusch→beusch',
    ]);
    expect(teile.some((x) => x.slug && x.text.includes('Dubey'))).toBe(false);
  });

  it('trägt die Rolle mit (Vorsitz bleibt Vorsitz)', () => {
    const t = 'Dr. G. Thomi (Vorsitz), Dr. T. Fasnacht';
    const teile = besetzungsTeile(t, 'bs_appellationsgericht', refsWie(t, 'bs_appellationsgericht'));
    expect(teile.filter((x) => x.slug).map((x) => x.rolle)).toEqual(['vorsitz', 'mitglied']);
  });
});

describe('besetzungsTeile — kein erfundener Link (§1/§8)', () => {
  it('verlinkt NICHTS, wenn die Manifest-Liste eine andere Länge hat', () => {
    const t = 'Dr. Olivier Steiner, Dr. Claudius Gelzer';
    const teile = besetzungsTeile(t, 'bs_appellationsgericht', [
      { s: 'steiner-olivier', r: 'vorsitz' },
    ]);
    expect(teile).toEqual([{ text: t, slug: null, rolle: null }]);
  });

  it('verlinkt NICHTS, wenn die Rollenfolge abweicht', () => {
    const t = 'Dr. Olivier Steiner, Dr. Claudius Gelzer';
    const refs = refsWie(t, 'bs_appellationsgericht');
    const verdreht: RichterRef[] = refs.map((r, i) => (i === 0 ? { ...r, r: 'gerichtsschreiber' } : r));
    expect(besetzungsTeile(t, 'bs_appellationsgericht', verdreht))
      .toEqual([{ text: t, slug: null, rolle: null }]);
  });

  it('nimmt die Slugs AUS dem Manifest, nie aus eigener Kanonisierung', () => {
    // Der Reader kann «G. Thomi» nicht selbst auf den Vollnamen auflösen — das tut
    // der korpus-globale Kanon-Pass im Generator. Genau dessen Ergebnis muss durchgereicht
    // werden (hier: der Kanon-Slug mit ausgeschriebenem Vornamen).
    const t = 'Dr. G. Thomi (Vorsitz)';
    const refs = refsWie(t, 'bs_appellationsgericht')
      .map((r) => ({ ...r, s: 'thomi-gabriella' }));
    const teile = besetzungsTeile(t, 'bs_appellationsgericht', refs);
    expect(links(teile)).toEqual(['G. Thomi→thomi-gabriella']);
  });

  it('verlinkt auch einen Freitext, der NUR aus einem Namen besteht', () => {
    // Befund Gegenprüfung 20.7.2026: hier ist `teile.length === 1` MIT Slug —
    // eine «length <= 1 ⇒ reiner Text»-Abkürzung hätte den gültigen Link verworfen.
    const t = 'Stephan Wullschleger';
    const teile = besetzungsTeile(t, 'bs_appellationsgericht', refsWie(t, 'bs_appellationsgericht'));
    expect(teile).toHaveLength(1);
    expect(links(teile)).toEqual(['Stephan Wullschleger→wullschleger-stephan']);
  });

  it('setzt den Cursor auch über Gerichtsschreiber-Namen hinweg', () => {
    // Regel: der GS bekommt keinen Link, seine Textstelle wird aber übersprungen.
    // Damit hängt die Korrektheit NICHT daran, dass parseBesetzung die GS ans Ende
    // der Liste hängt. Realfall mit demselben Nachnamen in beiden Rollen (BGE 148 II 285):
    // der RICHTER Seiler wird verlinkt, der GERICHTSSCHREIBER Seiler bleibt Text.
    const t = 'Bundesrichter Seiler, Präsident, Bundesrichter Donzallaz, Gerichtsschreiber Seiler';
    const teile = besetzungsTeile(t, 'bge', refsWie(t, 'bge'));
    expect(wortlaut(teile)).toBe(t);
    expect(links(teile)).toEqual(['Seiler→seiler', 'Donzallaz→donzallaz']);
    // Der GS-Seiler steht am Ende und ist NICHT verlinkt.
    expect(teile[teile.length - 1].slug).toBeNull();
    expect(teile[teile.length - 1].text).toContain('Gerichtsschreiber Seiler');
  });

  it('trifft keinen Namen mitten in einem längeren Wort', () => {
    // Wortgrenzen-Guard: «Meier» darf nicht in «Meierhans» treffen.
    const t = 'Meierhans-Gasse-Vorinstanz, Peter Meier';
    const refs: RichterRef[] = [{ s: 'meier-peter', r: 'vorsitz' }];
    const teile = besetzungsTeile('Peter Meier', 'bs_appellationsgericht', refs);
    expect(links(teile)).toEqual(['Peter Meier→meier-peter']);
    expect(t).toContain('Meierhans'); // Fixture-Dokumentation
  });
});
