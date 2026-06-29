import { useCallback, useEffect, useState } from 'react';
import { tabSchluessel } from '../../lib/tabs';

// ─── Pane-Layout (Split-View B-1) ──────────────────────────────────────────
//
// Hält die Pfade der SEKUNDÄREN Panes (das primäre Pane ist immer der bestehende
// BrowserRouter und treibt die URL). Reiner UI-Zustand der Darstellungsschicht
// (§3). Blaupause: useSeitenleiste/useInhaltsbreite (typeof-window-Guard,
// localStorage, SSR/prerender-sicher via render-then-replace, kein Hydrate).
//
// ZUSTANDSLOS (§5, Berufsgeheimnis): es werden AUSSCHLIESSLICH Pfade gespeichert,
// nie Formular-/Falldaten. #hash und ?preset werden abgestreift (wie tabSchluessel),
// sodass nur die Reiter-Identität (Pfad + ?r) persistiert — keine zweite
// Routen-/Reiter-Quelle (eine RouteSwitch, ein Tab-Speicher).
//
// VERHALTENSNEUTRAL: Default = [] (keine sekundären Panes) für jeden Prerender
// (typeof window === 'undefined') UND jeden frischen Client-Load (kein
// localStorage-Key) → Shell nimmt den 1-Pane-Pfad = exakt heute.

const PANES_KEY = 'lexmetrik-panes';
/** Maximal 2 sekundäre Panes (1 primär + 2 = 3 Spalten, FAHRPLAN B-2). */
export const MAX_SEKUNDAER = 2;

/** Normalisiert einen Pfad auf seine Reiter-Identität (Pfad + ?r, ohne Hash/Preset). */
function normPfad(pfad: string): string {
  // tabSchluessel erwartet pathname (+ ?query); es strippt #hash und ?preset und
  // behält ?r= (Mehrfachinstanz). Wir geben den vollen Pfad rein.
  return tabSchluessel(pfad);
}

function ladePanes(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const roh = window.localStorage.getItem(PANES_KEY);
    if (!roh) return [];
    const arr = JSON.parse(roh);
    if (!Array.isArray(arr)) return [];
    // Defensiv: nur Strings, normalisiert, dedupliziert, gekappt.
    const sauber: string[] = [];
    for (const x of arr) {
      if (typeof x !== 'string' || !x.startsWith('/')) continue;
      const n = normPfad(x);
      if (!sauber.includes(n)) sauber.push(n);
      if (sauber.length >= MAX_SEKUNDAER) break;
    }
    return sauber;
  } catch { return []; }
}

export interface PaneLayout {
  /** Pfade der sekundären Panes (ohne das primäre). Länge 0…MAX_SEKUNDAER. */
  sekundaer: string[];
  /** Öffnet einen Pfad als zusätzliches sekundäres Pane (no-op bei voll/Duplikat). */
  oeffneDaneben: (pfad: string) => void;
  /** Schliesst das sekundäre Pane an Index i. */
  schliesse: (i: number) => void;
  /** Schliesst alle sekundären Panes (zurück auf 1-Pane = heute). */
  schliesseAlle: () => void;
}

export function usePaneLayout(): PaneLayout {
  const [sekundaer, setSekundaer] = useState<string[]>(ladePanes);

  useEffect(() => {
    try { window.localStorage.setItem(PANES_KEY, JSON.stringify(sekundaer)); }
    catch { /* Speicher gesperrt — Zustand bleibt nur für die Sitzung */ }
  }, [sekundaer]);

  const oeffneDaneben = useCallback((pfad: string) => {
    const n = normPfad(pfad);
    setSekundaer((s) => (s.length >= MAX_SEKUNDAER || s.includes(n) ? s : [...s, n]));
  }, []);

  const schliesse = useCallback((i: number) => {
    setSekundaer((s) => s.filter((_, idx) => idx !== i));
  }, []);

  const schliesseAlle = useCallback(() => setSekundaer([]), []);

  return { sekundaer, oeffneDaneben, schliesse, schliesseAlle };
}
