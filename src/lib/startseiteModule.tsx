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
// Stand Bausequenz-Schritt 4 (Layout & Module): Startseite.tsx ist auf diese
// Registry umgestellt; alle sechs Module sind aktiv. Hero liegt in S4 bewusst
// noch auf bg-surface — der Brass-Wash kommt in S5 (nur der HERO_FLAECHE-Tausch,
// s. Hero.tsx).

import type React from 'react';
import { Hero } from '../components/start/Hero';
import { Schnellrechner } from '../components/start/Schnellrechner';
import { RubrikKacheln } from '../components/start/RubrikKacheln';
import { ZuletztVerwendet } from '../components/start/ZuletztVerwendet';
import { NewsHeader } from '../components/start/NewsHeader';
import { VertrauensFuss } from '../components/start/VertrauensFuss';

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
  // Hero: kein Rubriktrenner (self-verwaltend, eigene H1); liegt in S4 auf
  // bg-surface (S5 → Brass-Wash).
  { id: 'hero', Komponente: Hero },
  { id: 'schnellrechner', titel: 'Schnellrechner', Komponente: Schnellrechner },
  { id: 'rubriken', titel: 'Alle Bereiche', Komponente: RubrikKacheln },
  // Zuletzt trägt bewusst KEIN `titel`/`minHoeheKlasse`: Sektionstitel («Zuletzt
  // verwendet»), Höhen-Reservierung UND Vollkollaps bei leerem Speicher liegen INS
  // Modul verlagert (S4, Council «nie Titel über Leerraum», wie NewsHeader in S3).
  { id: 'zuletzt', Komponente: ZuletztVerwendet },
  // News ebenso selbst-verwaltend (S3-Fix Leerzustand-Doppelpfad, §3 #6) — titellos.
  { id: 'news', Komponente: NewsHeader },
  // Vertrauens-Fuss: kein Rubriktrenner, kein async-Zustand → titellos, statisch.
  { id: 'vertrauen', Komponente: VertrauensFuss },
];
