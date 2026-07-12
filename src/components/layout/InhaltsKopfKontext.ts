import { createContext, useContext, type ReactNode } from 'react';
import { verlaufLabel, type VerlaufManifeste } from '../../lib/verlaufLabel';

// Kontext + Helfer des Inhalts-Kopfs (Einzelansicht «analog Split-View»). Getrennt
// von der Komponente (InhaltsKopf.tsx), damit die Komponenten-Datei nur Komponenten
// exportiert (react-refresh). Reine Daten/Logik (§3).

export interface KopfDaten {
  /** Pfad-Aufteilung; letztes Element = aktuelle Seite. `to` fehlt → nicht klickbar. */
  breadcrumb: { label: string; to?: string }[];
  /** Stand TT.MM.JJJJ (nur wo sinnvoll, z. B. Gesetz). */
  stand?: string | null;
  /** Aktueller Artikel (nur Gesetz, live beim Scrollen), z. B. «Art. 5». */
  artikel?: string | null;
  /** A26 (David 11.7.2026): grundart-spezifisches Bedien-Element, das der Kopf
   *  RECHTS mitführt — beim Gesetzes-Volltext das «Ansicht»-Dropdown
   *  (Darstellungsoptionen), damit es immer sichtbar ist, während man im Gesetz
   *  ist. Der Reader meldet das fertige Element (Layer-Trennung: der Kopf in
   *  components/layout rendert es opak, ohne die Reader-Interna zu kennen); andere
   *  Inhaltstypen lassen es weg → kein Element. */
  ansichtSlot?: ReactNode;
}

// Melde-Funktion: Inhaltsseiten rufen sie (im Effect) mit ihren Kopfdaten bzw.
// null beim Verlassen. Default-No-op, falls kein Provider (Tests/SSR).
const InhaltsKopfContext = createContext<(d: KopfDaten | null) => void>(() => {});
export const InhaltsKopfMeldeProvider = InhaltsKopfContext.Provider;
export function useMeldeInhaltsKopf(): (d: KopfDaten | null) => void {
  return useContext(InhaltsKopfContext);
}

// Detail-Routen, die einen Kopf bekommen (eine GEÖFFNETE Engine/Gesetz/…), nicht
// Katalog-/Meta-Seiten (Start, /gesetze-Übersicht, Einstellungen …).
const INHALT_RE = /^\/(gesetze\/[^/]+\/[^/]+|rechner\/[^/]+|rechtsprechung\/[^/]+|materialien\/[^/]+|vorlagen\/[^/]+)/;
export function istInhaltsPfad(pfad: string): boolean {
  return INHALT_RE.test(pfad);
}

const SEKTION_LABEL: Record<string, string> = {
  gesetze: 'Gesetze', rechner: 'Rechner', vorlagen: 'Vorlagen',
  rechtsprechung: 'Rechtsprechung', materialien: 'Materialien',
};

// Fallback-Kopfdaten aus dem Pfad: Sektion (klickbar zur Übersicht) › Blatt-Label.
export function kopfVonPfad(pfad: string, manifeste: VerlaufManifeste): KopfDaten {
  const seg = pfad.split('?')[0].split('#')[0].split('/').filter(Boolean);
  const sektion = seg[0] ?? '';
  const breadcrumb: KopfDaten['breadcrumb'] = [];
  if (SEKTION_LABEL[sektion]) breadcrumb.push({ label: SEKTION_LABEL[sektion], to: `/${sektion}` });
  breadcrumb.push({ label: verlaufLabel(pfad, manifeste) });
  return { breadcrumb };
}
