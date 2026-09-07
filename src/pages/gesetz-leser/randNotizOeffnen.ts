// ═══ W2·24-R6 · WOHIN EIN BEZUG AUS DER RANDNOTIZ ÖFFNET ════════════════════
//
// AUFTRAG (David 6.9.2026, R6-Zusatz «auch split view»): «wie öffnet ein Bezug
// in der ANDEREN Hälfte — Ziel: Entscheid aus der Randnotiz landet im zweiten
// Pane, Artikel bleibt links».
//
// DER JURISTISCHE GRUND, nicht bloss der bequeme: Ein Bezug am Rand wird
// GEPRÜFT, nicht besucht. Wer neben Art. 336c OR den Entscheid anklickt, will
// wissen, ob er trägt — und dazu muss der Artikel stehen bleiben, sonst liest
// man den Entscheid ohne die Norm, auf die er sich bezieht. Ein Klick, der den
// Artikel ERSETZT, macht aus einer Prüfung einen Sprung und verlangt danach den
// Rückweg. Das ist der Unterschied zwischen einem Randapparat und einem
// Fussnoten-Link.
//
// DIE REGEL GILT NUR AM RAND. Verweise im Fliesstext, in der Gliederung und im
// Kopf verhalten sich unverändert: sie sind NAVIGATION («bring mich dorthin»),
// die Randnotiz ist APPARAT («zeig es mir daneben»). Zwei verschiedene Absichten
// dürfen nicht dieselbe Geste haben.
//
// UND SIE GILT NUR OHNE MODIFIKATOR. ⌘/Strg-Klick (neuer Reiter),
// Mittelklick, Umschalt (neues Fenster) und Alt gehören dem Browser bzw. der
// Reiter-Mechanik; sie hier abzufangen hiesse, dem Nutzer eine gelernte Geste
// wegzunehmen. Ein Ziel, das schon offen ist, wird nicht ein zweites Mal
// geöffnet (dieselbe Dedup-Regel wie `usePaneSteuerung.istOffen`), und wo keine
// zweite Hälfte möglich ist — schmales Fenster, Pane-Kontingent voll — bleibt
// die gewöhnliche Navigation. Die Randnotiz steht ohnehin nur im vollen
// Satzspiegel, also auf breiten Fenstern.

/** Was der Klick auf einen Randnotiz-Link auslösen soll. */
export type RandNotizZiel = 'daneben' | 'normal';

/** Die Modifikatoren eines Mausklicks, so viel wie diese Regel braucht. */
export interface KlickLage {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

/**
 * Rein und ohne DOM: entscheidet allein aus Klick-Lage, Ziel-Adresse und
 * Pane-Kapazität (§2/§3 — die Darstellung ruft, die Regel steht hier).
 *
 * @param href       `href` des angeklickten Links; `null` oder extern ⇒ normal.
 * @param kannOeffnen Kapazität für eine zweite Hälfte (`usePaneSteuerung`).
 * @param istOffen   Ist das Ziel bereits in einer Hälfte offen?
 */
export function randNotizZiel(
  lage: KlickLage,
  href: string | null | undefined,
  kannOeffnen: boolean,
  istOffen: (pfad: string) => boolean,
): RandNotizZiel {
  if (lage.button !== 0) return 'normal';
  if (lage.metaKey || lage.ctrlKey || lage.shiftKey || lage.altKey) return 'normal';
  if (!kannOeffnen) return 'normal';
  // Nur eigene Adressen: ein amtlicher Live-Link (`https://…`) gehört in den
  // Browser, nicht in ein Pane (§7 — die amtliche Fassung ist die Quelle, nicht
  // ein Ausschnitt unserer Oberfläche).
  if (!href || !href.startsWith('/')) return 'normal';
  return istOffen(href) ? 'normal' : 'daneben';
}
