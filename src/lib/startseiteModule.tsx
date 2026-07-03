// ─── Modul-Registry der Startseite (Startseite V3, FAHRPLAN §4) ─────────────
//
// Reine Darstellungs-Deklaration (§3): welche Module in welcher Reihenfolge die
// Startseite komponiert. Katalog bleibt startseiteConfig.ts, Rubriken bleiben
// navigation.ts (§5). OHNE `sichtbar()` — SSR-Determinismus ist nicht
// garantierbar (Council-Auflage 3); Leerzustände gehören INS Modul (jedes Modul
// rendert selbst nichts, wenn es nichts anzuzeigen hat).
//
// Bewusste FUNDAMENT-Vorleistung auf den «Startseiten-Modul-Rahmen»
// (FAHRPLAN-FUNDAMENT-UMBAU), kein Selbstzweck — NICHT weiter abstrahieren
// (keine Sichtbarkeits-/Layout-Logik ins Registry ziehen).
//
// Stand Bausequenz-Schritt 2 (Plumbing): Registry angelegt, aber noch NICHT von
// Startseite.tsx importiert (toter, tsc-geprüfter Code). Aktiv sind nur die
// bereits existierenden Module (Schnellrechner/ZuletztVerwendet/NewsHeader); die
// erst in Schritt 4 entstehenden Module (Hero/Rubrik-Kacheln/Vertrauens-Fuss)
// sind mit `// S4:` auskommentiert — Schritt 4 legt die Komponenten an und
// aktiviert die Zeilen.

import type React from 'react';
import { Schnellrechner } from '../components/start/Schnellrechner';
import { ZuletztVerwendet } from '../components/start/ZuletztVerwendet';
import { NewsHeader } from '../components/start/NewsHeader';
// S4: import { Hero } from '../components/start/Hero';
// S4: import { RubrikKacheln } from '../components/start/RubrikKacheln';
// S4: import { VertrauensFuss } from '../components/start/VertrauensFuss';

export type StartModulId =
  | 'hero' | 'schnellrechner' | 'rubriken' | 'zuletzt' | 'news' | 'vertrauen';

export interface StartModul {
  id: StartModulId;
  /** Sektionstitel (Seclabel/H2); undefined = ohne Rubriktrenner (Hero) */
  titel?: string;
  /** MUSS beim Prerender synchron rendern (prerender.ts verbietet Suspense-Reste) — KEINE Lazy-Loader im Registry */
  Komponente: React.ComponentType;
  /** benanntes CLS-Token für async-/localStorage-Module */
  minHoeheKlasse?: string;
}

// Reihenfolge = §2 (Hero → Schnellrechner → Rubriken → Zuletzt → News → Vertrauen).
export const START_MODULE: readonly StartModul[] = [
  // S4: { id: 'hero', Komponente: Hero },
  { id: 'schnellrechner', titel: 'Schnell rechnen', Komponente: Schnellrechner },
  // S4: { id: 'rubriken', titel: 'Alle Bereiche', Komponente: RubrikKacheln },
  { id: 'zuletzt', titel: 'Zuletzt verwendet', Komponente: ZuletztVerwendet, minHoeheKlasse: 'min-h-modul-zuletzt' },
  { id: 'news', titel: 'Neues vom Bundesgericht', Komponente: NewsHeader, minHoeheKlasse: 'min-h-modul-news' },
  // S4: { id: 'vertrauen', Komponente: VertrauensFuss },
];
