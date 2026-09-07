/**
 * Golden-Merge kantonaler Teilläufe (scripts/normtext/golden-kanton-merge.ts).
 *
 * BELEGTER SCHADEN, den diese Tests einsperren. Commit 7a14fa06 (23.6.2026,
 * `npm run normtext -- --nur=kanton --kanton=AR --discovery`) löschte die 59
 * Golden-Schlüssel von public/normtext/kanton/AR-1203.json — «5945 insertions,
 * 59 deletions». Die Snapshot-Datei blieb auf der Platte, der Erlass blieb im
 * Register (artikelAnzahl 59); nur seine Drift-Basis (§7 lit. d) verschwand.
 * Mechanismus: der `--discovery`-Zweig fährt NUR die LexWork-Phase (HTM/ZH/PDF
 * entfallen ausdrücklich, normtext-snapshot.ts ~995-1001), der Golden-Merge
 * verwarf aber ALLE `kanton/AR/*`-Schlüssel, sobald der Kanton IRGENDEINEN
 * frischen Eintrag geliefert hatte. AR-1203 ist ein PDF-Routen-Erlass
 * (olexAt-Profil, ar.clex.ch/api/de/versions/1203/pdf_file) und wurde in diesem
 * Lauf nie angefasst. Wiederhergestellt wurde der Bestand in PR #389 durch
 * Reprojektion — die Ursache blieb dort ausdrücklich offen.
 *
 * Die Tests fahren KEIN Netz und lesen keine Artefakte: sie füttern den reinen
 * Merge mit einem simulierten Teil-Index.
 */
import { describe, it, expect } from 'vitest';
import { erlassPraefix, mischeGoldenKanton } from '../../scripts/normtext/golden-kanton-merge.ts';

// ── Bestand: ein Ausschnitt in der echten Schlüssel-Form ─────────────────────
// kanton/<KT>/<lawIdSafe>/<anker>. AR-111.1 + AR-131.12 sind LexWork-Erlasse,
// AR-1203 ist der PDF-Routen-Erlass (die 59 verlorenen Schlüssel, hier auf drei
// verkürzt), BE-101.1 ein Fremd-Kanton, bund/OR/art_1 ein Bund-Schlüssel.
const BESTAND: Record<string, string> = {
  'bund/OR/art_1': 'sha-bund-1',
  'kanton/AR/111.1/art_1': 'sha-ar-111-1',
  'kanton/AR/111.1/art_2': 'sha-ar-111-2',
  'kanton/AR/131.12/art_1': 'sha-ar-131-1',
  'kanton/AR/1203/art_1': 'sha-ar-1203-1',
  'kanton/AR/1203/art_1.1': 'sha-ar-1203-1.1',
  'kanton/AR/1203/art_2': 'sha-ar-1203-2',
  'kanton/BE/101.1/art_1': 'sha-be-101-1',
};

/**
 * Lauf-Index eines `--kanton=AR --discovery`-Laufs: NUR die LexWork-Erlasse,
 * mit veränderten sha (die Extraktion hat sich verbessert) und einem neu
 * erschlossenen Erlass. AR-1203 (PDF-Route) fehlt — genau wie am 23.6.2026.
 */
const FRISCH_DISCOVERY: Record<string, string> = {
  'kanton/AR/111.1/art_1': 'NEU-ar-111-1',
  'kanton/AR/111.1/art_2': 'NEU-ar-111-2',
  'kanton/AR/131.12/art_1': 'NEU-ar-131-1',
  'kanton/AR/999.9/art_1': 'NEU-ar-999-1',
};

/** Vollauf `--kanton=AR` (alle Routen): AR-1203 ist dabei. */
const FRISCH_VOLLAUF: Record<string, string> = {
  ...FRISCH_DISCOVERY,
  'kanton/AR/1203/art_1': 'NEU-ar-1203-1',
  'kanton/AR/1203/art_1.1': 'NEU-ar-1203-1.1',
  'kanton/AR/1203/art_2': 'NEU-ar-1203-2',
};

/**
 * ALT-Logik, wörtlich wie sie bis zu diesem Fix in normtext-snapshot.ts stand
 * (Zeile ~1042, `istErsetzbar` auf KANTONS-Granularität). Referenz für den
 * Verhaltensneutralitäts-Beweis des Vollauf-Pfads — NICHT die Implementierung
 * unter Test.
 */
function mischeAltKantonsGranular(
  bestand: Record<string, string>,
  frisch: Record<string, string>,
  kantone: ReadonlySet<string>,
): Record<string, string> {
  const erfolgKantone = new Set(Object.keys(frisch).map((k) => k.split('/')[1]));
  const istErsetzbar = (key: string): boolean => {
    const k = key.split('/')[1];
    return kantone.has(k) && erfolgKantone.has(k);
  };
  const gemischt: Record<string, string> = {};
  for (const k of Object.keys(bestand)) if (!istErsetzbar(k)) gemischt[k] = bestand[k];
  for (const k of Object.keys(frisch)) gemischt[k] = frisch[k];
  return gemischt;
}

describe('erlassPraefix', () => {
  it('kantonaler Artikel-Schlüssel → kanton/<KT>/<lawIdSafe>', () => {
    expect(erlassPraefix('kanton/AR/1203/art_1.1')).toBe('kanton/AR/1203');
    expect(erlassPraefix('kanton/VS/142.211.3/art_18')).toBe('kanton/VS/142.211.3');
    expect(erlassPraefix('kanton/JU/ju-20021-34172/art_5')).toBe('kanton/JU/ju-20021-34172');
  });

  it('Bund-Schlüssel und Kurzformen → null (nie von einem Kantonslauf ersetzbar)', () => {
    expect(erlassPraefix('bund/OR/art_1')).toBeNull();
    expect(erlassPraefix('kanton/AR/1203')).toBeNull();
    expect(erlassPraefix('')).toBeNull();
  });
});

describe('mischeGoldenKanton — Teillauf (der 7a14fa06-Schaden)', () => {
  it('Discovery-Teillauf (nur LexWork) LÄSST die PDF-Routen-Schlüssel des Kantons stehen', () => {
    const { gemischt } = mischeGoldenKanton(BESTAND, FRISCH_DISCOVERY, new Set(['AR']));

    // Der Kern: AR-1203 war in diesem Lauf nicht dabei → Altbestand bleibt,
    // byte-gleich (die Datei auf der Platte ist unverändert, ihre Drift-Basis
    // muss es auch sein).
    expect(gemischt['kanton/AR/1203/art_1']).toBe('sha-ar-1203-1');
    expect(gemischt['kanton/AR/1203/art_1.1']).toBe('sha-ar-1203-1.1');
    expect(gemischt['kanton/AR/1203/art_2']).toBe('sha-ar-1203-2');

    // Und die tatsächlich gefahrenen Erlasse sind ersetzt, nicht bewahrt.
    expect(gemischt['kanton/AR/111.1/art_1']).toBe('NEU-ar-111-1');
    expect(gemischt['kanton/AR/131.12/art_1']).toBe('NEU-ar-131-1');
    expect(gemischt['kanton/AR/999.9/art_1']).toBe('NEU-ar-999-1');

    // Fremd-Kanton und Bund unangetastet.
    expect(gemischt['kanton/BE/101.1/art_1']).toBe('sha-be-101-1');
    expect(gemischt['bund/OR/art_1']).toBe('sha-bund-1');
  });

  it('ALT-Logik verlor genau diese Schlüssel — der Defekt ist hier festgenagelt', () => {
    const alt = mischeAltKantonsGranular(BESTAND, FRISCH_DISCOVERY, new Set(['AR']));
    const neu = mischeGoldenKanton(BESTAND, FRISCH_DISCOVERY, new Set(['AR'])).gemischt;

    const verlorenAlt = Object.keys(BESTAND).filter((k) => !(k in alt));
    expect(verlorenAlt).toEqual(['kanton/AR/1203/art_1', 'kanton/AR/1203/art_1.1', 'kanton/AR/1203/art_2']);

    const verlorenNeu = Object.keys(BESTAND).filter((k) => !(k in neu));
    expect(verlorenNeu).toEqual([]);
  });

  it('meldet bewahrte und ersetzte Erlass-Präfixe (§8-Sichtbarkeit)', () => {
    const merge = mischeGoldenKanton(BESTAND, FRISCH_DISCOVERY, new Set(['AR']));
    expect(merge.bewahrt).toEqual(['kanton/AR/1203']);
    expect(merge.ersetzt).toEqual(['kanton/AR/111.1', 'kanton/AR/131.12']);
    expect(merge.fehlgeschlageneKantone).toEqual([]);
  });
});

// Gegenprüfungs-Befund PR #694 (5.9.2026): die `dateiExistiert`-Sonde selbst
// (Rückzug vs. Ausfall) war ungetestet — kein Test oben ruft je mit einer
// Sonde auf, die `false` liefert. Belegt hier direkt.
describe('mischeGoldenKanton — dateiExistiert-Sonde unterscheidet Rückzug von Ausfall', () => {
  it('Sonde meldet Datei fehlt → Präfix wird VERWORFEN statt bewahrt; Rest byte-gleich', () => {
    const dateiExistiert = (pfad: string) => pfad !== 'public/normtext/kanton/AR-1203.json';
    const merge = mischeGoldenKanton(BESTAND, FRISCH_DISCOVERY, new Set(['AR']), dateiExistiert);

    expect(merge.verworfen).toEqual(['kanton/AR/1203']);
    expect(merge.bewahrt).toEqual([]);
    expect('kanton/AR/1203/art_1' in merge.gemischt).toBe(false);
    expect('kanton/AR/1203/art_1.1' in merge.gemischt).toBe(false);
    expect('kanton/AR/1203/art_2' in merge.gemischt).toBe(false);

    // Rest unangetastet: gefahrene AR-Erlasse ersetzt, Fremd-Kanton/Bund gleich.
    expect(merge.gemischt['kanton/AR/111.1/art_1']).toBe('NEU-ar-111-1');
    expect(merge.gemischt['kanton/AR/131.12/art_1']).toBe('NEU-ar-131-1');
    expect(merge.gemischt['kanton/BE/101.1/art_1']).toBe('sha-be-101-1');
    expect(merge.gemischt['bund/OR/art_1']).toBe('sha-bund-1');
  });

  it('Default-Sonde (kein Argument) == Altformel: nichts wird je verworfen', () => {
    const merge = mischeGoldenKanton(BESTAND, FRISCH_DISCOVERY, new Set(['AR']));
    expect(merge.verworfen).toEqual([]);
    expect(merge.bewahrt).toEqual(['kanton/AR/1203']);
    expect(merge.gemischt['kanton/AR/1203/art_1']).toBe('sha-ar-1203-1');
  });
});

describe('mischeGoldenKanton — Vollauf: Verhaltensneutralität', () => {
  it('Vollauf-Index (alle Routen) → IDENTISCH zur ALT-Logik', () => {
    const kantone = new Set(['AR']);
    const alt = mischeAltKantonsGranular(BESTAND, FRISCH_VOLLAUF, kantone);
    const neu = mischeGoldenKanton(BESTAND, FRISCH_VOLLAUF, kantone).gemischt;
    expect(neu).toEqual(alt);
    // …und zwar mit dem frischen Stand, nicht mit dem Altbestand.
    expect(neu['kanton/AR/1203/art_1']).toBe('NEU-ar-1203-1');
  });

  it('Vollauf mit WEGGEFALLENEM Artikel purgiert innerhalb des Erlasses weiter', () => {
    // Ein Erlass, der neu weniger Artikel liefert (Anker-Rename, Anhang-Reorg):
    // der Alt-Schlüssel MUSS weg, sonst verwaist er (check:golden-normtext (b)).
    const frisch = { 'kanton/AR/1203/art_1': 'NEU-ar-1203-1' };
    const kantone = new Set(['AR']);
    const neu = mischeGoldenKanton(BESTAND, frisch, kantone).gemischt;
    expect(neu['kanton/AR/1203/art_1']).toBe('NEU-ar-1203-1');
    expect('kanton/AR/1203/art_1.1' in neu).toBe(false);
    expect('kanton/AR/1203/art_2' in neu).toBe(false);
    // Nicht gefahrene Erlasse desselben Kantons bleiben.
    expect(neu['kanton/AR/111.1/art_1']).toBe('sha-ar-111-1');
  });

  it('Ziel-Kanton ohne EINEN frischen Eintrag → Altbestand komplett bewahrt (§8)', () => {
    const merge = mischeGoldenKanton(BESTAND, {}, new Set(['AR']));
    expect(merge.gemischt).toEqual(BESTAND);
    expect(merge.fehlgeschlageneKantone).toEqual(['AR']);
    // Gleiches Ergebnis wie die ALT-Logik (deren erfolgKantone-Wächter griff hier).
    expect(merge.gemischt).toEqual(mischeAltKantonsGranular(BESTAND, {}, new Set(['AR'])));
  });

  it('Mehrere Ziel-Kantone: nur die gefahrenen Erlasse werden ersetzt', () => {
    const frisch = { ...FRISCH_DISCOVERY, 'kanton/BE/101.1/art_1': 'NEU-be-101-1' };
    const merge = mischeGoldenKanton(BESTAND, frisch, new Set(['AR', 'BE']));
    expect(merge.gemischt['kanton/BE/101.1/art_1']).toBe('NEU-be-101-1');
    expect(merge.gemischt['kanton/AR/1203/art_1']).toBe('sha-ar-1203-1');
    expect(merge.bewahrt).toEqual(['kanton/AR/1203']);
  });
});
