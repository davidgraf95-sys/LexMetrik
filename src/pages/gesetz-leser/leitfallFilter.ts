// ─── V2·B-2: Leitfall-Zeitraum-Filter (rein, deterministisch, testbar) ──────────
//
// Filtert die per-Artikel-Leitfälle nach dem gewählten Zeitraum «alle · 20 · 10 · 5
// J.» (LeserAnsichtMenu, David 10.7.2026). Rein visuelle Auswahl — KEINE Rechtslogik:
// die Kanten selbst bleiben unverändert; ausgeblendete werden nur nicht gezeigt und
// im Hinweis «n ältere ausgeblendet» angeboten (§8, kein kommentarloses Verschwinden).
//
// Jahr-genau (Q1-sicher): BGE-Bandjahr-Platzhalter (YYYY-01-01) vergleichen
// jahr-genau — deshalb Jahresvergleich statt Tagesdatum. Ein Entscheid ohne
// parsbares Jahr wird KONSERVATIV BEHALTEN (nie eine echte Fundstelle verschweigen).

import type { LeitfallRef } from '../../lib/rechtsprechung/norm-index';
import type { LeitfallZeitraum } from './leserOptionen';

/**
 * @param refs       Leitfälle des Artikels (Reihenfolge = Gewicht, bleibt erhalten).
 * @param zeitraum   'alle' = ungefiltert; sonst die letzten N Jahre (inkl. Grenzjahr).
 * @param jetztJahr  Aktuelles Jahr (injizierbar für deterministische Tests).
 */
export function filtereLeitfaelleNachZeitraum(
  refs: readonly LeitfallRef[],
  zeitraum: LeitfallZeitraum,
  jetztJahr: number,
): LeitfallRef[] {
  if (zeitraum === 'alle') return [...refs];
  const grenzJahr = jetztJahr - Number(zeitraum);
  return refs.filter((r) => {
    const jahr = Number(String(r.datum).slice(0, 4));
    // Unparsbares Jahr ⇒ behalten (konservativ, §8). Sonst: nur die letzten N Jahre.
    return !Number.isFinite(jahr) || jahr >= grenzJahr;
  });
}

/** Menschliches Kurz-Label des aktiven Zeitraums («letzte 10 J.»); 'alle' ⇒ null. */
export function zeitraumLabel(zeitraum: LeitfallZeitraum): string | null {
  return zeitraum === 'alle' ? null : `letzte ${zeitraum} J.`;
}
