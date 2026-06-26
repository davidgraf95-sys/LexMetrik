import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { merkeTab } from '../lib/tabs';
import { labelAusMeta } from '../lib/verlaufLabel';

// Unsichtbarer Tracker in App.tsx: öffnet einen Reiter NUR für ein KONKRETES
// Inhalts-Item (Auftrag David) — ein bestimmter Rechner/Engine, ein bestimmtes
// Gesetz, eine bestimmte Vorlage oder ein konkreter Entscheid (zweite Pfadebene
// unter einer Inhalts-Rubrik). Übersichts-/Rubrik-Seiten (`/gesetze`, `/rechner`,
// `/rechtsprechung`, `/vorlagen`), die Startseite und Info-Seiten öffnen KEINEN
// Reiter — ein blosser Seitenleisten-Klick soll nicht jedes Mal einen Tab erzeugen.
// Reines localStorage-Schreiben (§3).
const INHALT_ITEM = /^\/(rechner|vorlagen|gesetze|rechtsprechung)\/.+/;

export function TabTracker() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (!INHALT_ITEM.test(pathname)) return;
    // pathname + ?search: der Instanz-Diskriminator ?r=<n> (dasselbe Gesetz
    // mehrfach offen, Auftrag David) gehört zur Reiter-Identität; merkeTab/
    // tabSchluessel ignorieren übrige Query-Parameter für die Dedup-Identität.
    merkeTab(pathname + search, labelAusMeta(pathname) ?? undefined);
  }, [pathname, search]);
  return null;
}
