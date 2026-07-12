import type { Kanton } from '../types/legal';

// Kantonsliste in amtlicher Reihenfolge (BV Art. 1) für Auswahl-Dropdowns.
// Bewusst abweichende Listen bleiben lokal: KombinierteAnsicht (BS zuerst),
// LohnfortzahlungForm (Code/Name-Paare), Vorsorgeauftrag (alphabetisch).
export const KANTONE: readonly Kanton[] = Object.freeze<Kanton[]>(['ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL', 'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU']);
