// ─── Leser-Options-Store (W2·5d G2a) — Darstellungs-Toggles, KEINE Rechtslogik (§3) ─
//
// Persistente, rein visuelle Lese-Umschalter für den Gesetzes-Reader
// (FAHRPLAN-GESETZES-UX.md §3 + V2/A23): «Linien» (Gliederungs-Guide + Einzug),
// «Fussnoten» (Marker-Prominenz), «Verweise» (Link-Unterstreichung) und — seit
// V2·B-1 (David 10.7.2026, überstimmt «genau drei Toggles») — «Entscheide»
// (Leitfall-Zeilen ein/aus). Die Bedien-Oberfläche rendert `LeserAnsichtMenu.tsx`.
//
// Mechanik der vier Toggles = data-*-Attribute + CSS, KEIN React-State-Zweig im
// Artikel-Baum (§15: das Toggeln rendert die Artikelliste NICHT neu). Vorbild ist
// die Theme-Mechanik (components/thema.ts): die Attribute werden IMPERATIV am
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
// Fussnoten/Verweise/Entscheide: Default 'an' = heutige Darstellung → data-*="an"
// ist ein CSS-No-op (R6: Grundzustand byte-gleich). Linien: Default 'auto' (W2·5d
// U-LINIEN/A8) = AUFBAU-abhängig — nicht mehr die grundart-Schublade (K11)
// entscheidet, sondern der tatsächliche Aufbau des Erlasses (linienAufbau.ts:
// Gliederungstiefe + Artikel-Dichte). Der Reader schreibt das Ergebnis als
// data-guide-auto="an|aus" an den `.lc-leser`-Root; CSS zeigt den EINEN Guide bei
// 'an' (flaches/mittleres Gesetz — seine Ebene wird sichtbar) und blendet ihn bei
// 'aus' (tiefe Kodifikation — bleibt ruhig, Einzug bleibt). Ein expliziter Klick
// setzt 'an'/'aus' und übersteuert das global. Alle CSS-Regeln sind auf
// `.lc-leser` gescopt (index.css), damit sie NUR den Reader treffen.
//
// V2·B-2 (David 10.7.2026): der Leitfall-ZEITRAUM «alle · 20 · 10 · 5 J.» ist KEIN
// data-*-Toggle, sondern ein JS-konsumierter Filterwert — die Leitfall-Zeile
// (client-only, nicht prerendert) filtert `r.datum` VOR der Sichtbarkeits-Kappung.
// Er lebt im selben persistenten Store, wird aber über einen PRIMITIV-Selektor
// (`useLeitfallZeitraum`, nur der String) abonniert: so re-rendern die bis zu ~66
// Leitfall-Zeilen NUR bei echter Zeitraum-Änderung, nicht bei jedem anderen Toggle.

import { useSyncExternalStore } from 'react';

export type OptFeld = 'linien' | 'fussnoten' | 'verweise' | 'leitfaelle';
// 'auto' nur für 'linien' sinnvoll (grundart-abhängiger Default, K11); Fussnoten/
// Verweise/Entscheide nutzen nur 'an'/'aus'. Die Union bleibt gemeinsam (ein Store).
export type OptWert = 'an' | 'aus' | 'auto';
export type LeserOptionen = Record<OptFeld, OptWert>;

/** V2·B-2: Zeitraum-Stufen für die Leitfall-Filterung («alle» = ungefiltert). */
export type LeitfallZeitraum = 'alle' | '20' | '10' | '5';

const KEY = 'lm.leser.optionen';
const FELDER: readonly OptFeld[] = ['linien', 'fussnoten', 'verweise', 'leitfaelle'];
const DEFAULT: LeserOptionen = { linien: 'auto', fussnoten: 'an', verweise: 'an', leitfaelle: 'an' };
const ZEITRAEUME: readonly LeitfallZeitraum[] = ['alle', '20', '10', '5'];
const DEFAULT_ZEITRAUM: LeitfallZeitraum = 'alle';

interface GeladenerZustand {
  opt: LeserOptionen;
  zeitraum: LeitfallZeitraum;
}

function lade(): GeladenerZustand {
  try {
    const roh = localStorage.getItem(KEY);
    if (!roh) return { opt: { ...DEFAULT }, zeitraum: DEFAULT_ZEITRAUM };
    const o = JSON.parse(roh) as Partial<Record<OptFeld, unknown>> & { zeitraum?: unknown };
    const opt: LeserOptionen = { ...DEFAULT };
    for (const f of FELDER) if (o[f] === 'an' || o[f] === 'aus' || o[f] === 'auto') opt[f] = o[f] as OptWert;
    const zeitraum = ZEITRAEUME.includes(o.zeitraum as LeitfallZeitraum)
      ? (o.zeitraum as LeitfallZeitraum)
      : DEFAULT_ZEITRAUM;
    return { opt, zeitraum };
  } catch {
    // localStorage gesperrt (privater Modus) ODER kaputtes JSON → Default.
    return { opt: { ...DEFAULT }, zeitraum: DEFAULT_ZEITRAUM };
  }
}

// getSnapshot muss eine STABILE Referenz liefern (sonst warnt/looped React).
// `aktuell`/`aktuellZeitraum` werden nur bei echten Änderungen ersetzt.
const start = typeof window === 'undefined' ? { opt: { ...DEFAULT }, zeitraum: DEFAULT_ZEITRAUM } : lade();
let aktuell: LeserOptionen = start.opt;
let aktuellZeitraum: LeitfallZeitraum = start.zeitraum;

function speichere(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...aktuell, zeitraum: aktuellZeitraum }));
  } catch {
    /* Speicher gesperrt — die Wahl gilt dann nur für die Sitzung */
  }
}

/** Wendet die gespeicherten Toggle-Optionen VOR dem ersten Render an (Aufruf in
 *  main.tsx, analog `wendeThemaAn`). Setzt data-linien/-fussnoten/-verweise/
 *  -leitfaelle am <html>; Default 'an' ⇒ CSS-No-op ⇒ byte-gleiche heutige
 *  Darstellung. Der Zeitraum ist JS-konsumiert (kein data-*-Attribut). */
export function wendeLeserOptionenAn(): void {
  if (typeof document === 'undefined') return;
  const g = lade();
  aktuell = g.opt;
  aktuellZeitraum = g.zeitraum;
  const el = document.documentElement;
  for (const f of FELDER) el.setAttribute(`data-${f}`, aktuell[f]);
}

const hoerer = new Set<() => void>();

/** Umschalten eines Toggle-Feldes: localStorage schreiben, Attribut direkt ans
 *  <html> setzen (KEIN Artikel-Re-Render), Hörer (Switch-Buttons) benachrichtigen. */
export function setzeOption(feld: OptFeld, wert: OptWert): void {
  aktuell = { ...aktuell, [feld]: wert };
  speichere();
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute(`data-${feld}`, wert);
  }
  hoerer.forEach((f) => f());
}

/** V2·B-2: Leitfall-Zeitraum setzen (JS-Filter, kein data-*-Attribut). Persistiert
 *  + benachrichtigt die Hörer; nur die Zeitraum-Abonnenten (Primitiv-Selektor) und
 *  die Leitfall-Zeilen rendern neu. */
export function setzeZeitraum(z: LeitfallZeitraum): void {
  if (z === aktuellZeitraum) return;
  aktuellZeitraum = z;
  speichere();
  hoerer.forEach((f) => f());
}

// Cross-Tab-Synchronisation: ein einziger Storage-Listener am Modul (nicht pro
// Abo, sonst entfernt das erste Unsubscribe ihn für alle). Gleiche-Tab-Sync
// läuft über die `hoerer` (setzeOption/setzeZeitraum benachrichtigen direkt).
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
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

/** React-Hook auf die aktuellen Toggle-Optionen (für die Switch-Buttons). */
export function useLeserOptionen(): LeserOptionen {
  return useSyncExternalStore(abonniere, getSnapshot, getServerSnapshot);
}

/** V2·B-2: Primitiv-Selektor auf den Leitfall-Zeitraum. `getSnapshot` gibt NUR den
 *  String zurück ⇒ obwohl jeder beliebige Toggle die Hörer benachrichtigt, re-rendert
 *  React die Abonnenten nur, wenn sich der String wirklich ändert (Object.is). So
 *  rendern die bis zu ~66 Leitfall-Zeilen NUR bei echter Zeitraum-Änderung neu
 *  (§15-Zusage — sonst wäre sie falsch). */
function getZeitraumSnapshot(): LeitfallZeitraum {
  return aktuellZeitraum;
}
function getZeitraumServerSnapshot(): LeitfallZeitraum {
  return DEFAULT_ZEITRAUM;
}
export function useLeitfallZeitraum(): LeitfallZeitraum {
  return useSyncExternalStore(abonniere, getZeitraumSnapshot, getZeitraumServerSnapshot);
}
