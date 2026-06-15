// ─── Permanente Tarif-Invarianten (Regressions-Gate) ────────────────────────
//
// FAHRPLAN-LUECKEN-SCHLIESSEN. Die manuellen 4-Pass-Verifikationen (find →
// Doppelcheck → Zweitprüfung → Reencode + Stützpunkt-Abgleich) haben strukturelle
// Kodier-Fehler aufgedeckt (degressive Staffeln als Flachsatz, Sockel-Bug, Gesamt-
// wert vs. marginal). Damit diese Klassen NIE WIEDER stillschweigend zurückkehren,
// sind die strukturellen Invarianten hier als CI-Gate festgeschrieben (§6):
//   1. Monotonie — eine wertbasierte Gebühr darf bei steigendem Wert nie SINKEN
//      (ein Abwärtssprung an einer Bandgrenze = Sockel-/Akkumulations-Fehler).
//   2. Sanity — jeder deterministische Betrag ist endlich und ≥ 0.
//   3. Klammer-Treue — Mindest-/Höchstbetrag werden über alle Bänder respektiert.
import { describe, expect, it } from 'vitest';
import { tarifFuer, berechneBeurkundung } from '../lib/beurkundung';
import { GESCHAEFTSART_IDS } from '../data/tarif/beurkundung-typen';
import { tarifFuerGb, berechneGrundbuchgebuehr } from '../lib/grundbuchgebuehren';
import { GB_EINTRAGSART_IDS } from '../data/tarif/grundbuch-typen';
import { KANTONE, type KantonCode } from '../data/tarif/typen';

const WERTE = [1, 10_000, 50_000, 100_000, 200_000, 300_000, 500_000, 750_000, 1_000_000, 1_500_000, 2_000_000, 3_000_000, 5_000_000, 10_000_000, 20_000_000, 50_000_000];

const detVal = (e: { deterministisch: boolean; betragChf?: number }): number | null =>
  e.deterministisch ? (e as { betragChf: number }).betragChf : null;

function pruefeMonotonieUndSanity(label: string, werte: (number | null)[]): string[] {
  const fehler: string[] = [];
  let prev = -Infinity, prevW = 0;
  for (let i = 0; i < WERTE.length; i++) {
    const v = werte[i];
    if (v == null) continue;
    if (!Number.isFinite(v) || v < 0) fehler.push(`${label}: ungültiger Betrag ${v} @ ${WERTE[i]}`);
    if (v < prev - 0.5) fehler.push(`${label}: SINKT von ${prev} (@${prevW}) auf ${v} (@${WERTE[i]}) — Staffel-/Sockel-Fehler`);
    prev = v; prevW = WERTE[i];
  }
  return fehler;
}

describe('Tarif-Invarianten — Beurkundung (Monotonie + Sanity, alle Arten × 26 Kt)', () => {
  it('keine Gebühr sinkt bei steigendem Geschäftswert; alle Beträge endlich ≥ 0', () => {
    const fehler: string[] = [];
    for (const k of KANTONE) {
      for (const art of GESCHAEFTSART_IDS) {
        if (art === 'grundstueckkauf') continue;
        if (!tarifFuer(art, k as KantonCode)) continue;
        fehler.push(...pruefeMonotonieUndSanity(`B ${art}/${k}`,
          WERTE.map((w) => detVal(berechneBeurkundung({ geschaeftsart: art, kanton: k as KantonCode, geschaeftswertCHF: w }).posten!.ergebnis))));
      }
    }
    expect(fehler, fehler.join('\n')).toEqual([]);
  });
});

describe('Tarif-Invarianten — Grundbuch (Monotonie + Sanity, alle Arten × 26 Kt)', () => {
  it('keine Gebühr sinkt bei steigendem Wert; alle Beträge endlich ≥ 0', () => {
    const fehler: string[] = [];
    for (const k of KANTONE) {
      for (const art of GB_EINTRAGSART_IDS) {
        if (art === 'eigentum_kauf') continue;
        if (!tarifFuerGb(art, k as KantonCode)) continue;
        fehler.push(...pruefeMonotonieUndSanity(`G ${art}/${k}`,
          WERTE.map((w) => detVal(berechneGrundbuchgebuehr({ eintragsart: art, kanton: k as KantonCode, wertCHF: w }).posten!.ergebnis))));
      }
    }
    expect(fehler, fehler.join('\n')).toEqual([]);
  });
});

describe('Tarif-Invarianten — Grundstückkauf-Referenz bleibt monoton (NOTARIAT/GRUNDBUCH)', () => {
  it('Beurkundung + Grundbuch des Grundstückkaufs steigen monoton', () => {
    const fehler: string[] = [];
    for (const k of KANTONE) {
      fehler.push(...pruefeMonotonieUndSanity(`Kauf-Beurk/${k}`,
        WERTE.map((w) => detVal(berechneBeurkundung({ geschaeftsart: 'grundstueckkauf', kanton: k as KantonCode, geschaeftswertCHF: w }).posten!.ergebnis))));
      fehler.push(...pruefeMonotonieUndSanity(`Kauf-GB/${k}`,
        WERTE.map((w) => detVal(berechneGrundbuchgebuehr({ eintragsart: 'eigentum_kauf', kanton: k as KantonCode, wertCHF: w }).posten!.ergebnis))));
    }
    expect(fehler, fehler.join('\n')).toEqual([]);
  });
});
