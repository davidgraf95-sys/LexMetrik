import { describe, it, expect } from 'vitest';
import {
  katalogGruppe, presetGruppe, gesetzGruppe, entscheidGruppe, sucheAlles,
} from '../lib/universalSuche';
import type { PresetIndexEintrag } from '../lib/presetIndex';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import type { BrowseEntscheid } from '../lib/rechtsprechung/register';

// Der Aggregator ist reine Abbildung über bestehende Such-/Filter-Funktionen
// (§3/§5). Diese Tests sichern: korrekte href-Bildung je Inhaltsart, Kappung,
// «alle N zeigen»-Schwelle, Lade-Platzhalter (null) und Reihenfolge/Filterung
// der Gesamtgruppen.

describe('universalSuche: Katalog-Gruppe', () => {
  it('findet echte Katalog-Karten und bildet href + Marke', () => {
    const g = katalogGruppe('kündigung');
    expect(g.id).toBe('katalog');
    expect(g.treffer.length).toBeGreaterThan(0);
    for (const t of g.treffer) {
      expect(t.href).toMatch(/^\/(rechner|vorlagen)\//);
      expect(['Rechner', 'Vorlage']).toContain(t.marke?.text);
    }
  });

  it('kappt auf die Kappung; KEIN mehrHref (Katalog ist auf /rechner+/vorlagen aufgeteilt)', () => {
    const g = katalogGruppe('frist', 2);
    expect(g.treffer.length).toBeLessThanOrEqual(2);
    expect(g.mehrHref).toBeUndefined();
  });

  it('leere Suche → keine Treffer', () => {
    expect(katalogGruppe('').treffer.length).toBe(0);
  });
});

describe('universalSuche: Preset-Gruppe', () => {
  const presets: PresetIndexEintrag[] = [
    { key: 'zpo:berufung', regime: 'zpo', regimeLabel: 'Zivilprozess (ZPO)', label: 'Berufung', norm: 'Art. 311 ZPO', query: '?presetKey=berufung', hash: '#zpo' },
    { key: 'allg:x', regime: 'allgemein', regimeLabel: 'Allgemein', label: 'Mahnfrist', norm: '', query: '?fp=x', hash: '' },
  ];

  it('null → Lade-Platzhalter', () => {
    const g = presetGruppe(null);
    expect(g.laedt).toBe(true);
    expect(g.treffer.length).toBe(0);
  });

  it('baut Tagerechner-href aus query + hash', () => {
    const g = presetGruppe(presets);
    expect(g.treffer[0].href).toBe('/rechner/tagerechner?presetKey=berufung#zpo');
    expect(g.treffer[1].href).toBe('/rechner/tagerechner?fp=x');
  });

  it('hat KEINEN «alle zeigen»-Link (Tagerechner kennt keine ?q=-Liste, §8) und zählt ehrlich', () => {
    const g = presetGruppe(presets, 1); // Kappung 1, aber 2 Treffer
    expect(g.mehrHref).toBeUndefined();
    expect(g.gesamt).toBe(2);            // echte Zahl, nicht durch Kappung gedeckelt
    expect(g.treffer.length).toBe(1);
  });
});

describe('universalSuche: Gesetze-Gruppe', () => {
  const erlasse = [
    { key: 'OR', ebene: 'bund', kanton: null, kuerzel: 'OR', titel: 'Obligationenrecht', sr: '220', rechtsgebiet: 'or', sprache: 'de', rang: 1, status: 'snapshot', datei: 'bund/OR.json', artikelAnzahl: 1, stand: '2026', quelleUrl: 'x', fassungsToken: 't' },
    { key: 'ZH-stpo', ebene: 'kanton', kanton: 'ZH', kuerzel: 'EG StPO', titel: 'Einführungsgesetz', sr: null, rechtsgebiet: 'strafrecht', sprache: 'de', rang: 9, status: 'snapshot', datei: 'kanton/ZH.json', artikelAnzahl: 1, stand: '2026', quelleUrl: 'x', fassungsToken: 't' },
  ] as unknown as BrowseErlass[];

  it('null → Lade-Platzhalter', () => {
    expect(gesetzGruppe(null, 'or').laedt).toBe(true);
  });

  it('bildet Leser-href und nie eine Artikel-Granularität', () => {
    const g = gesetzGruppe(erlasse, 'Obligationen');
    expect(g.treffer.length).toBe(1);
    expect(g.treffer[0].href).toBe('/gesetze/bund/OR');
    expect(g.treffer[0].label).toBe('OR · Obligationenrecht');
    // Kein «Art.» im Treffer (register.json hat keinen Artikel-Index):
    expect(g.treffer[0].label).not.toMatch(/Art\./);
  });

  it('kantonale Marke = Kanton', () => {
    const g = gesetzGruppe(erlasse, 'Einführungsgesetz');
    expect(g.treffer[0].marke?.text).toBe('ZH');
  });
});

describe('universalSuche: Rechtsprechung-Gruppe', () => {
  const liste = [
    { key: 'bge-1', gericht: 'bger', gerichtName: 'Bundesgericht', kanton: 'CH', nummer: '5A_1', bgeReferenz: 'BGE 150 III 1', datum: '2024-01-01', zitierung: 'BGE 150 III 1', leitcharakter: 'leitentscheid', regesteVorhanden: true, regesteKurz: 'Regeste', sachgebiet: 'zpo', sprache: 'de', normKeys: ['ZPO'], bestand: 'snapshot', kuratierung: 'maschinell', datei: 'bund/bger/x.json', quelle: 'ocl', quelleUrl: 'x', fassungsToken: 't' },
    { key: 'kg-2', gericht: 'kger-gr', gerichtName: 'Kantonsgericht GR', kanton: 'GR', nummer: 'ZR1', bgeReferenz: null, datum: '2023-06-01', zitierung: 'KGer GR ZR1 2023', leitcharakter: 'normal', regesteVorhanden: false, regesteKurz: null, sachgebiet: 'zpo', sprache: 'de', normKeys: [], bestand: 'snapshot', kuratierung: 'maschinell', datei: 'kanton/gr/x.json', quelle: 'ocl', quelleUrl: 'x', fassungsToken: 't' },
  ] as unknown as BrowseEntscheid[];

  it('sortiert neueste zuerst und markiert Leitentscheide', () => {
    const g = entscheidGruppe(liste, 'ZPO');
    expect(g.treffer[0].id).toBe('bge-1');
    expect(g.treffer[0].marke?.text).toBe('Leitentscheid');
    expect(g.treffer[0].href).toBe('/rechtsprechung/bge-1');
  });
});

describe('universalSuche: Aggregation', () => {
  it('leere Suche → keine Gruppen', () => {
    expect(sucheAlles('', { presets: null, gesetze: null, entscheide: null })).toEqual([]);
  });

  it('lässt geladene leere Gruppen weg, behält ladende als Platzhalter', () => {
    const g = sucheAlles('zzzznogibtsnicht', { presets: [], gesetze: [], entscheide: null });
    // Katalog/Preset/Gesetz geladen+leer → raus; Entscheid lädt noch → bleibt.
    expect(g.map((x) => x.id)).toEqual(['entscheid']);
    expect(g[0].laedt).toBe(true);
  });
});
