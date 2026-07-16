import { describe, it, expect } from 'vitest';
import {
  katalogGruppe, presetGruppe, gesetzGruppe, entscheidGruppe, artikelGruppe, sprungGruppe, bgeSprungGruppe, sucheAlles, type SuchTreffer,
} from '../lib/universalSuche';
import type { BgeSprung } from '../lib/suche/bgeQuery';
import type { PresetIndexEintrag } from '../lib/presetIndex';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import type { BrowseEntscheid } from '../lib/rechtsprechung/register';
import type { NormQueryTreffer } from '../lib/suche/normQuery';

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

describe('universalSuche: Treffer-Dedup (IA-1)', () => {
  // Riehen/Bettingen-Doppel: derselbe BS-Erlass unter kantonaler Kern-Nummer und
  // unter Gemeinde-Sammlungs-Präfixen (RiE/BeE) — identischer Titel/Kanton.
  const asyl = (key: string, sr: string): BrowseErlass => ({
    key, ebene: 'kanton', kanton: 'BS', kuerzel: 'Asylvertrag',
    titel: 'Vertrag über die Aufgabenteilung im Bereich Asyl', sr,
    rechtsgebiet: 'staatsrecht', sprache: 'de', rang: 5, status: 'snapshot',
    datei: 'kanton/BS.json', artikelAnzahl: 1, stand: '2026', quelleUrl: 'x', fassungsToken: 't',
  } as unknown as BrowseErlass);
  const echterRiehen: BrowseErlass = {
    key: 'BS-RiE 786.100', ebene: 'kanton', kanton: 'BS', kuerzel: 'Abfallordnung',
    titel: 'Ordnung der Abfallbehandlung in der Gemeinde Riehen', sr: 'RiE 786.100',
    rechtsgebiet: 'umwelt', sprache: 'de', rang: 5, status: 'snapshot',
    datei: 'kanton/BS.json', artikelAnzahl: 1, stand: '2026', quelleUrl: 'x', fassungsToken: 't',
  } as unknown as BrowseErlass;

  it('kollabiert titelgleiche Gemeinde-Doppel auf die kantonale Kern-Nummer', () => {
    const erlasse = [
      asyl('BS-890.800', '890.800'),
      asyl('BS-BeE 890.800', 'BeE 890.800'),
      asyl('BS-RiE 890.800', 'RiE 890.800'),
      echterRiehen,
    ] as unknown as BrowseErlass[];
    const g = gesetzGruppe(erlasse, 'Vertrag');
    // Genau EIN Asylvertrag-Treffer, und zwar die reine Zahl-Nummer (kein Präfix).
    const asylTreffer = g.treffer.filter((t) => t.label.includes('Asylvertrag'));
    expect(asylTreffer).toHaveLength(1);
    expect(asylTreffer[0].href).toBe('/gesetze/kanton/BS-890.800');
    expect(g.gesamt).toBe(1);
  });

  it('lässt echte Riehen-Erlasse (kein kantonales Doppel) unberührt', () => {
    const g = gesetzGruppe([echterRiehen] as unknown as BrowseErlass[], 'Riehen');
    expect(g.treffer).toHaveLength(1);
    expect(g.treffer[0].href).toBe('/gesetze/kanton/BS-RiE%20786.100');
  });

  it('nur Präfix-Varianten (kein reines Zahl-Doppel) → deterministisch kleinster Key', () => {
    const erlasse = [
      asyl('BS-RiE 411.500', 'RiE 411.500'),
      asyl('BS-BeE 411.500', 'BeE 411.500'),
    ] as unknown as BrowseErlass[];
    const g = gesetzGruppe(erlasse, 'Vertrag');
    expect(g.treffer).toHaveLength(1);
    // «BS-BeE …» < «BS-RiE …» lexikografisch → deterministische Wahl.
    expect(g.treffer[0].href).toBe('/gesetze/kanton/BS-BeE%20411.500');
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

describe('universalSuche: Artikel-Volltext-Gruppe', () => {
  const treffer: SuchTreffer[] = Array.from({ length: 9 }, (_, i) => ({
    id: `art:ZPO:${i}`, label: `Art. ${i} ZPO`, untertitel: '… Text …',
    marke: { text: 'Gesetzestext', ton: 'soft' as const }, href: `/gesetze/bund/ZPO#art-${i}`,
  }));
  it('null → Platzhalter (lädt), keine Treffer', () => {
    const g = artikelGruppe(null);
    expect(g.id).toBe('artikel');
    expect(g.laedt).toBe(true);
    expect(g.treffer).toEqual([]);
  });
  it('kappt auf KAPPUNG, gesamt zählt alle', () => {
    const g = artikelGruppe(treffer, 6);
    expect(g.treffer.length).toBe(6);
    expect(g.gesamt).toBe(9);
    expect(g.laedt).toBeUndefined();
  });
  it('sucheAlles fügt die Artikel-Gruppe in fester Reihenfolge ein (nach Gesetze, vor Rechtsprechung)', () => {
    const g = sucheAlles('x', { presets: [], gesetze: [], artikel: treffer, entscheide: [], materialien: [] });
    const ids = g.map((x) => x.id);
    expect(ids).toContain('artikel');
    if (ids.includes('gesetz') && ids.includes('entscheid')) {
      expect(ids.indexOf('artikel')).toBeGreaterThan(ids.indexOf('gesetz'));
      expect(ids.indexOf('artikel')).toBeLessThan(ids.indexOf('entscheid'));
    }
  });
});

describe('universalSuche: Norm-Sprung-Gruppe (A5)', () => {
  const treffer: NormQueryTreffer = {
    erlass: { key: 'OR', ebene: 'bund', kanton: null, kuerzel: 'OR', titel: 'Obligationenrecht', status: 'snapshot' },
    artikelToken: '257_d', artikelAnzeige: '257d', href: '/gesetze/bund/OR#art-257_d',
  };

  it('null → keine Gruppe (Freitext fällt in die normale Suche)', () => {
    expect(sprungGruppe(null)).toBeNull();
  });

  it('baut EINE Sprung-Gruppe: Marke «Sprung», Kürzel + Artikel im Label, amtlicher Titel als Untertitel, Deep-Link', () => {
    const g = sprungGruppe(treffer)!;
    expect(g.id).toBe('sprung');
    expect(g.gesamt).toBe(1);
    expect(g.treffer).toHaveLength(1);
    expect(g.treffer[0].marke).toEqual({ text: 'Sprung', ton: 'ok' });
    expect(g.treffer[0].label).toBe('OR · Art. 257d');
    expect(g.treffer[0].untertitel).toBe('Obligationenrecht');
    expect(g.treffer[0].href).toBe('/gesetze/bund/OR#art-257_d');
  });

  it('reiner Erlass-Sprung (ohne Artikel) → Label ohne «Art.»', () => {
    const g = sprungGruppe({ ...treffer, artikelToken: null, artikelAnzeige: null, href: '/gesetze/bund/OR' })!;
    expect(g.treffer[0].label).toBe('OR');
    expect(g.treffer[0].href).toBe('/gesetze/bund/OR');
  });
});

describe('universalSuche: BGE-Sprung-Gruppe (UI-NAV S2)', () => {
  it('null → keine Gruppe', () => {
    expect(bgeSprungGruppe(null)).toBeNull();
  });

  it('im Bestand → interner Direkt-Sprung als oberster Treffer', () => {
    const bge: BgeSprung = { zitat: 'BGE 152 I 65', imBestand: true, key: 'bge_152_I_65', amtlichHref: 'https://search.bger.ch/x' };
    const g = bgeSprungGruppe(bge)!;
    expect(g.id).toBe('sprung');
    expect(g.treffer).toHaveLength(1);
    expect(g.treffer[0].marke).toEqual({ text: 'Direkt öffnen', ton: 'ok' });
    expect(g.treffer[0].label).toBe('BGE 152 I 65');
    expect(g.treffer[0].href).toBe('/rechtsprechung/bge_152_I_65');
    expect(g.externLink).toBeUndefined();
  });

  it('nicht im Bestand → §8-ehrliche Zeile + amtlicher Extern-Link, KEIN interner Treffer', () => {
    const bge: BgeSprung = { zitat: 'BGE 145 III 63', imBestand: false, key: null, amtlichHref: 'https://search.bger.ch/y' };
    const g = bgeSprungGruppe(bge)!;
    expect(g.treffer).toHaveLength(0);
    expect(g.hinweis).toContain('nicht im Bestand');
    expect(g.externLink).toEqual({ href: 'https://search.bger.ch/y', label: 'BGE 145 III 63 beim Bundesgericht öffnen' });
  });

  it('lädt → Platzhalter-Gruppe (kein voreiliges «nicht im Bestand»)', () => {
    const bge: BgeSprung = { zitat: 'BGE 152 I 65', imBestand: false, key: null, amtlichHref: 'x', laedt: true };
    const g = bgeSprungGruppe(bge)!;
    expect(g.laedt).toBe(true);
    expect(g.treffer).toHaveLength(0);
    expect(g.externLink).toBeUndefined();
  });
});

describe('universalSuche: Aggregation', () => {
  it('leere Suche → keine Gruppen', () => {
    expect(sucheAlles('', { presets: null, gesetze: null, artikel: null, entscheide: null, materialien: null })).toEqual([]);
  });

  it('lässt geladene leere Gruppen weg, behält ladende als Platzhalter', () => {
    const g = sucheAlles('zzzznogibtsnicht', { presets: [], gesetze: [], artikel: [], entscheide: null, materialien: [] });
    // Gesetz/Artikel/Material/Katalog/Preset geladen+leer → raus; Entscheid lädt noch → bleibt.
    expect(g.map((x) => x.id)).toEqual(['entscheid']);
    expect(g[0].laedt).toBe(true);
  });

  it('Relevanz-Reihenfolge (A6): Rechtsinhalte vor Werkzeugen — Gesetz → Artikel → Entscheid → Material → Katalog → Preset', () => {
    const erlasse = [{ key: 'OR', ebene: 'bund', kanton: null, kuerzel: 'OR', titel: 'Frist Obligationenrecht', sr: '220', rechtsgebiet: 'or', sprache: 'de', rang: 1, status: 'snapshot', datei: 'x', artikelAnzahl: 1, stand: '2026', quelleUrl: 'x', fassungsToken: 't' }] as unknown as BrowseErlass[];
    const artikel: SuchTreffer[] = [{ id: 'a', label: 'Art. 1 OR', href: '/gesetze/bund/OR#art-1' }];
    const entscheide = [{ key: 'e', gericht: 'bger', gerichtName: 'BGer', kanton: 'CH', nummer: '1', bgeReferenz: null, datum: '2024-01-01', zitierung: 'Frist BGE', leitcharakter: 'normal', regesteVorhanden: false, regesteKurz: null, sachgebiet: 'x', sprache: 'de', normKeys: [], bestand: 'snapshot', kuratierung: 'maschinell', datei: 'x', quelle: 'ocl', quelleUrl: 'x', fassungsToken: 't' }] as unknown as BrowseEntscheid[];
    const presets: PresetIndexEintrag[] = [{ key: 'p', regime: 'allgemein', regimeLabel: 'Allgemein', label: 'Frist', norm: '', query: '?fp=x', hash: '' }];
    // «Frist» trifft Gesetz (Titel), Entscheid (Zitierung), Preset (Label) und den
    // Katalog (mind. eine Karte); Artikel wird direkt übergeben.
    const g = sucheAlles('frist', { presets, gesetze: erlasse, artikel, entscheide, materialien: [] });
    const ids = g.map((x) => x.id);
    // Rechtsinhalte kommen vor den Werkzeugen (katalog/preset).
    expect(ids.indexOf('gesetz')).toBeLessThan(ids.indexOf('artikel'));
    expect(ids.indexOf('artikel')).toBeLessThan(ids.indexOf('entscheid'));
    if (ids.includes('katalog')) expect(ids.indexOf('entscheid')).toBeLessThan(ids.indexOf('katalog'));
    expect(ids.indexOf('preset')).toBe(ids.length - 1);
  });
});
