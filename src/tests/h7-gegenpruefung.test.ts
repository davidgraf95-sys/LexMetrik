import { describe, expect, it } from 'vitest';
import { berechneBeurkundung } from '../lib/beurkundung';

// INDEPENDENT re-derivation of GebT sGS 821.5 Nr. 60.13 (SG), from the amtliche
// Regel in bibliothek/kosten/beurkundungstarife-kantone.md, NOT from the code:
//  Grundgebühr 385 (Kapital unter 200'000); je weitere angefangene 100'000 ab
//  200'000: +0.8‰·100'000 = +80; gedeckelt bei `kappe`. Staffel_exklusiv-Semantik
//  (Band gilt für Wert < Grenze), letztes Band = Kappe. Formel unabhängig vom
//  Generator hergeleitet; muss Bit-genau mit der Engine übereinstimmen.
function sgAmtlich(w: number, kappe: number, tranchen: number): number {
  const oberGrenze = 200_000 + tranchen * 100_000; // Wert, ab dem nur noch Kappe gilt
  if (w >= oberGrenze) return kappe;
  const i = w < 200_000 ? 0 : Math.floor((w - 200_000) / 100_000) + 1;
  return Math.min(385 + i * 80, kappe);
}
type Art = Parameters<typeof berechneBeurkundung>[0]['geschaeftsart'];
const det = (art: Art, w: number): number => {
  const r = berechneBeurkundung({ geschaeftsart: art, kanton: 'SG', geschaeftswertCHF: w });
  const e = r.posten!.ergebnis;
  if (!e.deterministisch) throw new Error(`${art}/SG @${w} nicht deterministisch`);
  return e.betragChf;
};

describe('H-7 gegenpruefung: SG GebT 60.13 Generator == amtliche Formel (unabhängig)', () => {
  it('ag_gruendung/gmbh_gruendung (Kappe 15000, 183 Tranchen): dichter Sweep', () => {
    for (let w = 0; w <= 25_000_000; w += 12_500) {
      const soll = sgAmtlich(w, 15_000, 183);
      expect(det('ag_gruendung', w), `ag @${w}`).toBe(soll);
      expect(det('gmbh_gruendung', w), `gmbh @${w}`).toBe(soll);
    }
  });
  it('stiftung (Kappe 3850, 45 Tranchen): dichter Sweep', () => {
    for (let w = 0; w <= 10_000_000; w += 12_500) {
      expect(det('stiftung', w), `stiftung @${w}`).toBe(sgAmtlich(w, 3_850, 45));
    }
  });
});
