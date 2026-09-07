import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ersetzeTab, hatLeerenReiter, istReiterPfad, merkeTab } from '../lib/tabs';
import { labelAusMeta } from '../lib/verlaufLabel';
import { kanonisierePfad } from '../lib/normtext/erlassAdresse';

// Unsichtbarer Tracker in App.tsx: öffnet einen Reiter NUR für ein KONKRETES
// Inhalts-Item (Auftrag David) — ein bestimmter Rechner/Engine, ein bestimmtes
// Gesetz, eine bestimmte Vorlage oder ein konkreter Entscheid (zweite Pfadebene
// unter einer Inhalts-Rubrik). Übersichts-/Rubrik-Seiten (`/gesetze`, `/rechner`,
// `/rechtsprechung`, `/vorlagen`), die Startseite und Info-Seiten öffnen KEINEN
// Reiter — ein blosser Seitenleisten-Klick soll nicht jedes Mal einen Tab erzeugen.
// Reines localStorage-Schreiben (§3).
//
// ── W2·24 §5a Ziff. 3 (R2-NACHZUG) · NAVIGATION ERSETZT, SIE HÄUFT NICHT AN ──
// Bis 6.9.2026 hängte JEDE Navigation einen Reiter an (`merkeTab`). GEMESSEN
// (Preview 4335, drei Klicks OR → ZGB → ZPO über die Gesetze-Übersicht): drei
// Reiter, ohne dass jemand einen zweiten gewollt hätte — genau der
// «Reiter-Wildwuchs», den David 6.9.2026 ausgeschlossen hat. Jetzt gilt die
// Browser-Regel: der Klick ersetzt den AKTIVEN Reiter (`ersetzeTab`); ein
// zweiter entsteht nur auf ausdrückliche Geste —
//   · Mittelklick oder Ctrl/⌘-Klick auf einen Inhalts-Link (unten),
//   · ⌘/Ctrl+Enter im Suchfeld (`layout/HeaderSuche.tsx`, Navigations-State
//     `lmNeuerReiter`),
//   · «zweite Instanz» desselben Erlasses (`lib/useErlassOeffnen.ts`,
//     `gesetz-leser/v3/ReiterAktion.tsx` — beide rufen weiterhin `merkeTab`).
//
// ── D7 (David 6.9.2026) · DIE BEREICHS-ÜBERSICHTEN ZÄHLEN MIT ───────────────
// «achte darauf dass der reiter bei gesetz mitzählt». WELCHER Pfad einen Reiter
// trägt, entscheidet seit diesem Nachzug `lib/tabs.ts` (`istReiterPfad`) —
// dort steht auch die Begründung, warum die fünf Bereichs-Übersichten jetzt
// dazugehören und die Startseite «/» weiterhin nicht. Hier bleibt nur der
// Aufruf: das frühere Regex-Literal stand an ZWEI Stellen dieser Datei (Effekt
// und Mittelklick-Geste) und wäre beim ersten Nachjustieren auseinander-
// gelaufen (§5).

/** Navigations-State, mit dem ein Aufrufer «diesmal ein NEUER Reiter» sagt.
 *  Bewusst über `navigate(ziel, { state })` statt über ein Modul-Flag: der
 *  Wunsch gehört zu GENAU dieser Navigation und überlebt sie nicht (§2). */
export interface NeuerReiterState { lmNeuerReiter?: boolean }

export function TabTracker() {
  const { pathname, search, hash, state } = useLocation();
  // Die Adresse, aus der die nächste Navigation kommt = der aktive Reiter.
  // `null` beim Kaltstart: dort wird nichts ersetzt, sondern der bestehende
  // Reiter aktualisiert bzw. angehängt — die Persistenz bleibt unberührt.
  const aktiv = useRef<string | null>(null);
  useEffect(() => {
    if (!istReiterPfad(pathname)) {
      // ── D19 (David 6.9.2026, «+») · DER LEERE REITER IST DIE EINE AUSNAHME ──
      // Pfad '/' erzeugt sonst KEINEN Reiter (D7-Abweichung oben) und würde
      // hier sonst einfach übersprungen. Existiert aber der eine ausdrücklich
      // angelegte leere Reiter (`lib/tabs.neuerLeererReiter`), gilt ER als
      // aktiver Reiter — sonst ersetzt die nächste Navigation NICHT ihn,
      // sondern den davor aktiven (oder häuft an, §5a Ziff. 3). Nur die exakte
      // Adresse zählt (kein ?search/#hash): genau die, unter der der leere
      // Reiter angelegt wird.
      if (pathname === '/' && !search && !hash && hatLeerenReiter()) aktiv.current = '/';
      return;
    }
    // pathname + ?search: der Instanz-Diskriminator ?r=<n> (dasselbe Gesetz
    // mehrfach offen, Auftrag David) gehört zur Reiter-Identität; merkeTab/
    // tabSchluessel ignorieren übrige Query-Parameter für die Dedup-Identität.
    // KANONISIERT (Gegenprüfung 29.8.2026, Mangel 2): dieser Effekt läuft VOR
    // dem Umzugs-Sprung im Leser — bei einer Alt-Adresse merkte er darum erst
    // `/gesetze/bund/CISG` und gleich danach `/gesetze/international/CISG`, also
    // zwei Reiter für EIN Gesetz, einer davon tot. Gemerkt wird die kanonische
    // Adresse; ein Alt-Link erzeugt damit denselben Reiter wie der neue.
    // ── #hash SEIT DEM R2-NACHZUG DABEI (F5): der GEWÄHLTE Artikel steht in der
    // Adresse und beschriftet den Reiter («Art. 336c OR», §5a Ziff. 2). Die
    // laufende Lesestellung schreibt weiterhin allein `aktualisiereTabArtikel`.
    const ziel = kanonisierePfad(pathname) + search + hash;
    const label = labelAusMeta(pathname) ?? undefined;
    if ((state as NeuerReiterState | null)?.lmNeuerReiter) merkeTab(ziel, label);
    else ersetzeTab(aktiv.current, ziel, label);
    aktiv.current = ziel;
  }, [pathname, search, hash, state]);

  useNeuerReiterGeste();
  return null;
}

/** ── «In neuem Reiter öffnen» ohne Menü: Mittelklick und Ctrl/⌘-Klick ───────
 *
 *  Erkannt wird die GESTE (Maustaste + Modifikator), nicht eine `data-`-Marke:
 *  so gilt sie für jeden Inhalts-Link der App, auch für künftige, ohne dass
 *  irgendwo ein Attribut nachgezogen werden muss.
 *
 *  Wie im Browser öffnet die Geste den Reiter IM HINTERGRUND — die aktuelle
 *  Ansicht bleibt stehen, der neue Reiter erscheint in der Arbeitsleiste. Der
 *  Vorgabe-Weg des Browsers (ein neues BROWSER-Fenster/-Tab) wird dabei
 *  unterdrückt; er bleibt über Shift-Klick und das Kontextmenü des Browsers
 *  erreichbar, und weil die Reiter im localStorage derselben Herkunft liegen,
 *  sieht ein zweites Browser-Fenster dieselbe Liste.
 *
 *  Nur Reiter-Ziele (dieselbe Regel wie oben, `istReiterPfad`): ein Mittelklick
 *  auf «Über uns» hat in der App kein Reiter-Ziel und bleibt darum beim
 *  Browser. Seit D7 gehören die fünf Bereichs-Übersichten dazu — ein
 *  Ctrl-Klick auf «Gesetze» legt jetzt also einen Hintergrund-Reiter an,
 *  genau wie auf einen Erlass. */
function useNeuerReiterGeste(): void {
  useEffect(() => {
    const geste = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      const mittel = e.type === 'auxclick' && e.button === 1;
      const modifiziert = e.type === 'click' && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey;
      if (!mittel && !modifiziert) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') ?? '';
      // Nur app-eigene, absolute Pfade — kein http(s), kein mailto, kein #-Sprung.
      if (!href.startsWith('/')) return;
      const [vorHash, ankerTeil] = href.split('#');
      const pfad = vorHash.split('?')[0];
      if (!istReiterPfad(pfad)) return;
      e.preventDefault();
      e.stopPropagation();
      merkeTab(
        kanonisierePfad(pfad) + (vorHash.includes('?') ? `?${vorHash.split('?')[1]}` : '') + (ankerTeil ? `#${ankerTeil}` : ''),
        labelAusMeta(pfad) ?? undefined,
      );
    };
    // Capture-Phase: der Klick soll nicht erst durch fremde Handler laufen, die
    // ihn (wie React Routers `Link` bei unmodifizierten Klicks) beanspruchen.
    document.addEventListener('click', geste, true);
    document.addEventListener('auxclick', geste, true);
    return () => {
      document.removeEventListener('click', geste, true);
      document.removeEventListener('auxclick', geste, true);
    };
  }, []);
}
