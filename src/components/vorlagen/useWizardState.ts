import { useEffect, useState } from 'react';

// ─── Geteilter Zustands-Rahmen der Vorlagen-Wizards ─────────────────────────
//
// Antworten (optional mit localStorage-Sicherung + Hydration-Normalisierung),
// Schritt-Navigation, Bestätigungs-Gate und Kopier-Feedback – der in allen
// Wizards identische Unterbau. Enthält BEWUSST keine Fachlogik (CLAUDE.md §3).
// Ohne `speicherKey` bleibt der Zustand nur im Speicher (Schlichtungsgesuch:
// Anweisung «keine Browser-Storage-APIs»).

export function useWizardState<T extends object>(opts: {
  defaults: T;
  speicherKey?: string;
  /** Hydration absichern: Array-/Record-Felder aus älteren Speicherständen normalisieren. */
  normalisieren?: (geladen: T) => T;
}) {
  const { defaults, speicherKey, normalisieren } = opts;
  const [a, setA] = useState<T>(() => {
    if (!speicherKey) return defaults;
    try {
      const roh = localStorage.getItem(speicherKey);
      if (roh) {
        const geladen = { ...defaults, ...JSON.parse(roh) } as T;
        return normalisieren ? normalisieren(geladen) : geladen;
      }
    } catch { /* defekter Speicher → Defaults */ }
    return defaults;
  });
  const [schritt, setSchritt] = useState(0);
  const [bestaetigt, setBestaetigt] = useState(false);
  const [kopiert, setKopiert] = useState(false);

  // Eingaben lokal sichern (verlassen den Browser nicht)
  useEffect(() => {
    if (!speicherKey) return;
    try { localStorage.setItem(speicherKey, JSON.stringify(a)); } catch { /* Speicher voll/blockiert */ }
  }, [a, speicherKey]);

  const set = <K extends keyof T>(k: K, v: T[K]) => setA((alt) => ({ ...alt, [k]: v }));

  const zuruecksetzen = () => {
    setA(defaults); setSchritt(0); setBestaetigt(false);
    if (speicherKey) { try { localStorage.removeItem(speicherKey); } catch { /* ignorieren */ } }
  };

  const kopieren = (text: string) => {
    navigator.clipboard?.writeText(text).then(
      () => { setKopiert(true); setTimeout(() => setKopiert(false), 2000); },
      () => {},
    );
  };

  return { a, setA, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen };
}
