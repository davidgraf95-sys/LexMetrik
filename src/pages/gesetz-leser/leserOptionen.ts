// ─── Leser-Options-Store (W2·5d G2a) — Darstellungs-Toggles, KEINE Rechtslogik (§3) ─
//
// Drei persistente, rein visuelle Lese-Umschalter für den Gesetzes-Reader
// (FAHRPLAN-GESETZES-UX.md §3): «Linien» (Gliederungs-Guide + Einzug),
// «Fussnoten» (Marker-Prominenz), «Verweise» (Link-Unterstreichung). Die Leiste
// selbst rendert `LeserOptionenLeiste.tsx`.
//
// Mechanik = data-*-Attribute + CSS, KEIN React-State-Zweig im Artikel-Baum
// (§15: das Toggeln rendert die Artikelliste NICHT neu). Vorbild ist die
// Theme-Mechanik (components/thema.ts): die Attribute werden IMPERATIV am
// <html> gesetzt — bewusst KEIN Inline-Script im index.html-Head, weil die CSP
// (vercel.json `script-src 'self'`) Inline-Scripte verbietet. Die Anwendung vor
// dem ersten Paint erledigt main.tsx via `wendeLeserOptionenAn()` (analog
// `wendeThemaAn`/`wendeSchriftskalaAn`), das aus dem gebündelten Modul-Script
// läuft (same-origin, CSP-konform) → kein Flackern, kein Hydration-Mismatch.
//
// Beim Umschalten schreibt `setzeOption` das Attribut direkt ans <html> und
// benachrichtigt die Hörer; nur die Switch-Buttons (useLeserOptionen) rendern
// neu — der Normtext bleibt unberührt (CSS greift auf das geänderte Attribut).
// Global (ein Attributsatz am <html>) ⇒ beide Reader-Instanzen (Einzelansicht
// UND jedes Split-View-Pane) folgen derselben Wahl ohne Re-Render.
//
// Default für ALLE drei = 'an' = die heutige Darstellung → data-*="an" ist ein
// CSS-No-op (R6: Grundzustand byte-gleich). Die CSS-Regeln greifen nur bei
// "aus" und sind auf `.lc-leser` gescopt (index.css), damit sie NUR den Reader
// treffen (nicht das Norm-Popover der Rechner o. Ä.).

import { useSyncExternalStore } from 'react';

export type OptFeld = 'linien' | 'fussnoten' | 'verweise';
export type OptWert = 'an' | 'aus';
export type LeserOptionen = Record<OptFeld, OptWert>;

const KEY = 'lm.leser.optionen';
const FELDER: readonly OptFeld[] = ['linien', 'fussnoten', 'verweise'];
const DEFAULT: LeserOptionen = { linien: 'an', fussnoten: 'an', verweise: 'an' };

function lade(): LeserOptionen {
  try {
    const roh = localStorage.getItem(KEY);
    if (!roh) return { ...DEFAULT };
    const o = JSON.parse(roh) as Partial<Record<OptFeld, unknown>>;
    const r: LeserOptionen = { ...DEFAULT };
    for (const f of FELDER) if (o[f] === 'an' || o[f] === 'aus') r[f] = o[f];
    return r;
  } catch {
    // localStorage gesperrt (privater Modus) ODER kaputtes JSON → Default.
    return { ...DEFAULT };
  }
}

// getSnapshot muss eine STABILE Referenz liefern (sonst warnt/looped React).
// `aktuell` wird nur bei echten Änderungen (speichern/Storage-Event) ersetzt.
let aktuell: LeserOptionen =
  typeof window === 'undefined' ? { ...DEFAULT } : lade();

/** Wendet die gespeicherten Optionen VOR dem ersten Render an (Aufruf in
 *  main.tsx, analog `wendeThemaAn`). Setzt data-linien/-fussnoten/-verweise am
 *  <html>; Default 'an' ⇒ CSS-No-op ⇒ byte-gleiche heutige Darstellung. */
export function wendeLeserOptionenAn(): void {
  if (typeof document === 'undefined') return;
  aktuell = lade();
  const el = document.documentElement;
  for (const f of FELDER) el.setAttribute(`data-${f}`, aktuell[f]);
}

const hoerer = new Set<() => void>();

/** Umschalten eines Feldes: localStorage schreiben, Attribut direkt ans <html>
 *  setzen (KEIN Artikel-Re-Render), Hörer (Switch-Buttons) benachrichtigen. */
export function setzeOption(feld: OptFeld, wert: OptWert): void {
  const next: LeserOptionen = { ...aktuell, [feld]: wert };
  aktuell = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Speicher gesperrt — die Wahl gilt dann nur für die Sitzung */
  }
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute(`data-${feld}`, wert);
  }
  hoerer.forEach((f) => f());
}

// Cross-Tab-Synchronisation: ein einziger Storage-Listener am Modul (nicht pro
// Abo, sonst entfernt das erste Unsubscribe ihn für alle). Gleiche-Tab-Sync
// läuft über die `hoerer` (setzeOption benachrichtigt direkt).
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    aktuell = lade();
    wendeLeserOptionenAn();
    hoerer.forEach((f) => f());
  });
}

function abonniere(f: () => void): () => void {
  hoerer.add(f);
  return () => {
    hoerer.delete(f);
  };
}

function getSnapshot(): LeserOptionen {
  return aktuell;
}
function getServerSnapshot(): LeserOptionen {
  return DEFAULT;
}

/** React-Hook auf die aktuellen Optionen (für die Switch-Buttons). */
export function useLeserOptionen(): LeserOptionen {
  return useSyncExternalStore(abonniere, getSnapshot, getServerSnapshot);
}
