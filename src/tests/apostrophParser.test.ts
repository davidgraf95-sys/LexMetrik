import { describe, it, expect } from 'vitest';
import { koStreitwert, KO_DEFAULTS } from '../lib/vorlagen/klageOrdentlich';
import { sgStreitwert, SG_DEFAULTS } from '../lib/vorlagen/schlichtungsgesuchBs';

// Bug-Audit 19.6.2026 (H3b): Dieselbe Bug-Klasse wie H3 (datum.zahl/fmtCHF) in
// den Streitwert-/Betrags-Parsern der Vorlagen-Geschwister: der typografische
// Apostroph U+2019 (Copy-Paste/macOS) wurde nicht erkannt → Streitwert = null
// (NaN), Verfahrens-/Kostenweichen liefen falsch. Parser strippen jetzt /['’\s]/.
describe('Streitwert-Parser erkennen den typografischen Apostroph U+2019 (H3b)', () => {
  it('koStreitwert: gerader und typografischer Apostroph ergeben denselben Wert', () => {
    expect(koStreitwert({ ...KO_DEFAULTS, streitwert: "1'000'000" })).toBe(1_000_000);
    expect(koStreitwert({ ...KO_DEFAULTS, streitwert: '1’000’000' })).toBe(1_000_000);
  });

  it('sgStreitwert: typografischer Apostroph wird korrekt geparst', () => {
    expect(sgStreitwert({ ...SG_DEFAULTS, streitwert: '50’000' })).toBe(50_000);
  });
});
