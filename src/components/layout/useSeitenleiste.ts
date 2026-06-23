import { useCallback, useEffect, useState } from 'react';

// ─── Seitenleisten-Layout (einklappbar + breitenverstellbar, persistent) ─────
//
// Reiner UI-Zustand der Darstellungsschicht (§3 — KEINE Rechtslogik): Breite und
// Eingeklappt-Status der Desktop-Seitenleiste, gespiegelt in localStorage, damit
// die Wahl über Sitzungen/Reloads erhalten bleibt (Auftrag David: Seitenleiste
// während des Gebrauchs ein-/ausklappbar + verstellbar).
//
// SSR/Prerender-sicher: Initialwerte über typeof-window-Guard (Default = offen,
// Standardbreite). Die App ersetzt beim Mount (createRoot render-then-replace),
// hydratisiert also nicht — der erste Client-Render darf direkt aus localStorage
// lesen, ohne Mismatch-Klasse.

const BREITE_KEY = 'lexmetrik-seitenleiste-breite';
const EIN_KEY = 'lexmetrik-seitenleiste-eingeklappt';

/** Grenzen der ziehbaren Breite (px). Standard entspricht dem früheren `w-64`. */
export const BREITE_MIN = 208;
export const BREITE_MAX = 460;
export const BREITE_STD = 256;
/** Schrittweite der Tastatur-Verstellung (Pfeiltasten auf dem Ziehgriff). */
export const BREITE_SCHRITT = 16;

function klemme(b: number): number {
  return Math.min(BREITE_MAX, Math.max(BREITE_MIN, Math.round(b)));
}

function ladeBreite(): number {
  if (typeof window === 'undefined') return BREITE_STD;
  const v = Number(window.localStorage.getItem(BREITE_KEY));
  return Number.isFinite(v) && v >= BREITE_MIN && v <= BREITE_MAX ? v : BREITE_STD;
}

function ladeEingeklappt(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(EIN_KEY) === '1';
}

export interface SeitenleisteLayout {
  breite: number;
  setBreite: (b: number) => void;
  eingeklappt: boolean;
  umschalten: () => void;
}

export function useSeitenleiste(): SeitenleisteLayout {
  const [breite, setBreiteRoh] = useState(ladeBreite);
  const [eingeklappt, setEingeklappt] = useState(ladeEingeklappt);

  const setBreite = useCallback((b: number) => setBreiteRoh(klemme(b)), []);
  const umschalten = useCallback(() => setEingeklappt((e) => !e), []);

  useEffect(() => {
    try { window.localStorage.setItem(BREITE_KEY, String(breite)); } catch { /* Speicher gesperrt — Zustand bleibt nur für die Sitzung */ }
  }, [breite]);
  useEffect(() => {
    try { window.localStorage.setItem(EIN_KEY, eingeklappt ? '1' : '0'); } catch { /* s. o. */ }
  }, [eingeklappt]);

  return { breite, setBreite, eingeklappt, umschalten };
}
