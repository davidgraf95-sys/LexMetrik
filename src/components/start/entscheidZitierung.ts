/**
 * «BGer 1C_733/2025 vom 17. Juni 2026» → «BGer 1C_733/2025».
 *
 * PRÜFBEFUND R3-F4 (6.9.2026): In dieser Liste stand das Entscheiddatum
 * ZWEIMAL in derselben Zeile — links in der Datumsspalte (17.06.2026) und
 * gleich daneben ausgeschrieben in der Zitierung. Die Spalte ist der Ort des
 * Datums (sie gruppiert danach, J4), also fällt die Wiederholung.
 *
 * KEIN Verstoss gegen «die Fundstelle wird nie gekürzt» (§8): abgeschnitten
 * wird ausschliesslich ein Datums-Suffix, dessen Angabe unverändert eine
 * Handbreit links daneben steht — die Zeile trägt weiter beide Bestandteile.
 * Rein darstellend (§3): die Datenquelle bleibt unangetastet, gekürzt wird
 * nur, was gerendert wird. Der Ausdruck ist eng gefasst und verankert
 * (`\\s+vom\\s+<Tag>. <Monat> <Jahr>` am ZEILENENDE); greift er nicht — etwa
 * bei einer BGE-Zitierung ohne Datum —, bleibt die Zitierung, wie sie ist.
 */
export function ohneDatumsSuffix(zitierung: string): string {
  return zitierung.replace(/\s+vom\s+\d{1,2}\.\s*\p{L}+\s+\d{4}\s*$/u, '');
}
