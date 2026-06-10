import { describe, it, expect } from 'vitest';
import { PRESET_INDEX, presetSuche, presetRang } from '../lib/presetIndex';
import { PRESETS as ZPO_PRESETS } from '../lib/zpoPresets';
import { PRESETS_SCHKG } from '../lib/schkgPresets';
import { FAM_STATUS_PRESETS } from '../lib/famStatusPresets';
import { MECHANIK_PRESETS, fristQueryLesen } from '../lib/allgemeineFrist';
import { permalinkLesen } from '../lib/permalink';
import { ZPO_LINK_SPEC, SCHKG_LINK_SPEC } from '../lib/rechnerPermalinks';

// FE-3 (FAHRPLAN-FRISTEN-EINHEIT): Der Such-Index ist dünn — die Wahrheit
// liegt in den Regime-Dateien. Diese Tests erzwingen (1) Vollständigkeit,
// (2) Eindeutigkeit, (3) ROUND-TRIP: jede Index-Query dekodiert in der
// Ziel-Form zu GENAU den Parametern des Quell-Presets (kein Drift zwischen
// Index und Form möglich, §5).

describe('FE-3: Preset-Index Vollständigkeit & Eindeutigkeit', () => {
  it('deckt alle vier Quellen vollständig ab', () => {
    expect(PRESET_INDEX.length).toBe(
      ZPO_PRESETS.length + PRESETS_SCHKG.length + FAM_STATUS_PRESETS.length + MECHANIK_PRESETS.length);
  });

  it('Schlüssel sind global eindeutig', () => {
    const keys = PRESET_INDEX.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('Regime-Hash passt zum Regime (Tagerechner-Tabs)', () => {
    for (const e of PRESET_INDEX) {
      expect(e.hash, e.key).toBe(e.regime === 'allgemein' ? '' : `#${e.regime}`);
    }
  });
});

describe('FE-3: Round-Trip Index-Query → Form-Dekodierung', () => {
  it('ZPO: jede Query stellt presetKey + Fach-Parameter wieder her', () => {
    for (const p of ZPO_PRESETS) {
      const e = PRESET_INDEX.find((x) => x.key === `zpo:${p.key}`)!;
      const aus = permalinkLesen(ZPO_LINK_SPEC, e.query);
      expect(aus.presetKey, p.key).toBe(p.key);
      expect(aus.einheit, p.key).toBe(p.einheit);
      expect(aus.verfahren, p.key).toBe(p.verfahren);
      expect(aus.fristnatur, p.key).toBe(p.fristnatur);
      if (p.laenge != null) expect(aus.laenge, p.key).toBe(p.laenge);
      else expect(aus.laenge, p.key).toBeUndefined();
    }
  });

  it('SchKG: jede Query stellt presetKey/Phase/Modus/Auslöser wieder her', () => {
    for (const p of PRESETS_SCHKG) {
      const e = PRESET_INDEX.find((x) => x.key === `schkg:${p.key}`)!;
      const aus = permalinkLesen(SCHKG_LINK_SPEC, e.query);
      expect(aus.presetKey, p.key).toBe(p.key);
      expect(aus.phase, p.key).toBe(p.phase);
      expect(aus.modus, p.key).toBe(p.modus);
      expect(aus.fristnatur, p.key).toBe(p.fristnatur);
      expect(aus.ausloeser, p.key).toBe(p.ausloeser);
      if (p.laenge != null) expect(aus.laenge, p.key).toBe(p.laenge);
    }
  });

  it('Familienrecht: fp-Query zeigt auf existierenden Preset-Schlüssel', () => {
    for (const p of FAM_STATUS_PRESETS) {
      const e = PRESET_INDEX.find((x) => x.key === `allgemein:${p.key}`)!;
      expect(e.query).toBe(`?fp=${p.key}`);
    }
  });

  it('Mechanik: Query dekodiert via fristQueryLesen zum Patch', () => {
    for (const p of MECHANIK_PRESETS) {
      const e = PRESET_INDEX.find((x) => x.key === `allgemein:${p.key}`)!;
      const aus = fristQueryLesen(e.query.replace(/^\?/, ''));
      expect(aus, p.key).not.toBeNull();
      if (p.patch.einheit) expect(aus!.einheit, p.key).toBe(p.patch.einheit);
      if (p.patch.laenge != null) expect(aus!.laenge, p.key).toBe(p.patch.laenge);
      expect(aus!.wochenendeVerschieben, p.key).toBe(!!p.patch.wochenendeVerschieben);
      expect(aus!.feiertageVerschieben, p.key).toBe(!!p.patch.feiertageVerschieben);
    }
  });
});

describe('FE-3: fristQueryLesen — Teil-Links (deklarierte Erweiterung)', () => {
  it('volle Teilen-Links dekodieren unverändert', () => {
    expect(fristQueryLesen('s=2026-03-02&l=20&e=tage&w=1')).toMatchObject({
      start: '2026-03-02', laenge: 20, einheit: 'tage',
      wochenendeVerschieben: true, feiertageVerschieben: false,
    });
  });
  it('l/e ohne Startdatum hydratisieren (Preset-Index-Links)', () => {
    expect(fristQueryLesen('l=6&e=monate&w=1&f=1')).toMatchObject({
      laenge: 6, einheit: 'monate', wochenendeVerschieben: true, feiertageVerschieben: true,
    });
    expect(fristQueryLesen('l=6&e=monate')!.start).toBeUndefined();
  });
  it('ungültige VORHANDENE Werte verwerfen den ganzen Link (wie bisher)', () => {
    expect(fristQueryLesen('s=böse&l=-3')).toBeNull();
    expect(fristQueryLesen('l=0&e=tage')).toBeNull();
    expect(fristQueryLesen('e=fantasie')).toBeNull();
    expect(fristQueryLesen('')).toBeNull();
    expect(fristQueryLesen('q=foo&kategorie=fristen')).toBeNull();
  });
});

describe('FE-3: Suche (katalogSuche-Muster)', () => {
  it('«Berufung» rankt die ZPO-Berufung zuoberst', () => {
    const t = presetSuche('Berufung');
    expect(t.length).toBeGreaterThan(0);
    expect(t[0].key).toBe('zpo:berufung');
  });
  it('«Rechtsvorschlag» findet den SchKG-Preset', () => {
    expect(presetSuche('Rechtsvorschlag').some((e) => e.key === 'schkg:rechtsvorschlag')).toBe(true);
  });
  it('Norm-Suche kompakt: «256c» und «Art. 256c ZGB» treffen die Anfechtungs-Presets', () => {
    for (const q of ['256c', 'Art. 256c ZGB']) {
      const t = presetSuche(q);
      expect(t.some((e) => e.key === 'allgemein:anfechtung_relativ'), q).toBe(true);
    }
  });
  it('Umlaut-Faltung: «kuendigung» trifft Presets mit «Kündigung» im Label', () => {
    expect(presetSuche('kuendigung').length).toBeGreaterThan(0);
  });
  it('leere Suche liefert nichts; Fantasie-Begriff liefert nichts', () => {
    expect(presetSuche('')).toEqual([]);
    expect(presetSuche('Patentgerichtsgebührenzuschlag')).toEqual([]);
  });
  it('presetRang ist deterministisch: Label-Präfix vor Label-Teil vor Norm', () => {
    const berufung = PRESET_INDEX.find((e) => e.key === 'zpo:berufung')!;
    expect(presetRang(berufung, 'Berufung (ordentlich)')).toBe(0);
    expect(presetRang(berufung, 'ordentlich')).toBe(1);
    expect(presetRang(berufung, '311')).toBe(2);
  });
});
