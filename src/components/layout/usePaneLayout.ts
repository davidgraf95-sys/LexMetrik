import { createContext, useCallback, useContext, useEffect, useState } from 'react';
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

/** Defensiv säubern: nur absolute Pfade, normalisiert, dedupliziert, gekappt. */
function saeubere(arr: unknown[]): string[] {
  const sauber: string[] = [];
  for (const x of arr) {
    if (typeof x !== 'string' || !x.startsWith('/')) continue;
    const n = normPfad(x);
    if (!sauber.includes(n)) sauber.push(n);
    if (sauber.length >= MAX_SEKUNDAER) break;
  }
  return sauber;
}

function ladePanes(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    // B-5: ein geteilter Layout-Link `?p=pfad||pfad` gewinnt über localStorage —
    // so reproduziert das Öffnen eines geteilten Links den Pane-Satz.
    const geteilt = new URLSearchParams(window.location.search).get('p');
    if (geteilt) return saeubere(geteilt.split('||').map((s) => decodeURIComponent(s)));
    const roh = window.localStorage.getItem(PANES_KEY);
    if (!roh) return [];
    const arr = JSON.parse(roh);
    if (!Array.isArray(arr)) return [];
    return saeubere(arr);
  } catch { return []; }
}

/** Baut den teilbaren Layout-Permalink (aktuelle URL + ?p=sekundär-Pfade). */
export function layoutPermalink(sekundaer: string[]): string {
  if (typeof window === 'undefined') return '';
  const u = new URL(window.location.href);
  // searchParams.set kodiert selbst — NICHT vorab encodeURIComponent (sonst
  // doppelt kodiert). Trenner «||» (| → %7C). ladePanes dekodiert defensiv nach.
  if (sekundaer.length) u.searchParams.set('p', sekundaer.join('||'));
  else u.searchParams.delete('p');
  return u.toString();
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

  // B-5: ?p= war nur Seed (geteilter Link) → nach dem Übernehmen aus der URL
  // entfernen, damit ein Reload den dann lokalen Zustand nutzt (localStorage),
  // nicht erneut den geteilten Satz aufzwingt. Einmalig.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const u = new URL(window.location.href);
    if (u.searchParams.has('p')) {
      u.searchParams.delete('p');
      window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash);
    }
  }, []);

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

// ─── Pane-Steuerung (B-2) ──────────────────────────────────────────────────
//
// Damit tief verschachtelte Stellen (z. B. das KontextPanel «Passende
// Werkzeuge» im Gesetzleser) ein Pane öffnen können, ohne das Layout
// durchzureichen, stellt Shell diese Steuerung als Kontext bereit.
// `kannOeffnen` ist nur ab lg + freier Kapazität true → die «daneben»-Aktion
// erscheint genau dann, wenn ein Pane auch wirklich aufgeht.

export interface PaneSteuerung {
  oeffneDaneben: (pfad: string) => void;
  kannOeffnen: boolean;
}

const PaneSteuerungContext = createContext<PaneSteuerung>({ oeffneDaneben: () => {}, kannOeffnen: false });

export const PaneSteuerungProvider = PaneSteuerungContext.Provider;

export function usePaneSteuerung(): PaneSteuerung {
  return useContext(PaneSteuerungContext);
}
