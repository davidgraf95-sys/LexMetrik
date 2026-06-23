// Abschnitts-Metadaten (Titel + Anker) — getrennt von der Komponente, damit die
// Komponentendatei nur Komponenten exportiert (react-refresh).

import type { Abschnittstyp } from './typen';

export const ABSCHNITT_TITEL: Record<Abschnittstyp, string> = {
  regeste: 'Regeste',
  sachverhalt: 'Sachverhalt',
  erwaegung: 'Erwägungen',
  dispositiv: 'Dispositiv',
};

/** Anker-Id eines Abschnitts (für die Sprung-Navigation). */
export function abschnittAnker(typ: Abschnittstyp): string {
  return `abschnitt-${typ}`;
}
