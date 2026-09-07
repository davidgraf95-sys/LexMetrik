import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { ersetzeTab, istReiterPfad, merkeTab } from '../lib/tabs';
import { labelAusMeta } from '../lib/verlaufLabel';
import { kanonisierePfad } from '../lib/normtext/erlassAdresse';

// Unsichtbarer Tracker in App.tsx: öffnet einen Reiter NUR für ein KONKRETES
// Inhalts-Item (Auftrag David) — ein bestimmter Rechner/Engine, ein bestimmtes
// Gesetz, eine bestimmte Vorlage oder ein konkreter Entscheid (zweite Pfadebene
// unter einer Inhalts-Rubrik). Seit D7 tragen auch die fünf Bereichs-Übersichten
// einen Reiter, seit R14 (7.9.2026) die Sammlung «/»; ohne Reiter bleiben allein
// die Info-/Meta-Seiten (/ueber, /methodik, /einstellungen, /kontakt).
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
// ── R14 (Entscheid David 7.9.2026) · ALLES IST EIN REITER ───────────────────
// Die Sammlung «/» ist seit R14 ein gewöhnlicher Reiter (`lib/tabs`, Block bei
// `istReiterPfad`). Hier folgen daraus GENAU ZWEI Sätze:
//   · Wer auf «/» geht, ERSETZT nichts — die Sammlung wird aktiviert oder
//     angelegt (`merkeTab`). Das ist der Fix für Davids «weird»: der Klick auf
//     die Marke lässt das offene Gesetz stehen, statt es zu überschreiben.
//   · Wer eine Nicht-Reiter-Route betritt (/ueber, /kontakt …), verliert den
//     aktiven Reiter als Herkunft (`aktiv.current = null`). Sonst zeigte der Ref
//     weiter auf das verlassene Dokument, und die nächste Navigation träfe
//     DESSEN Reiter — genau die gemessene Wurzel des Verlusts (R14-Prüfung
//     §1.4). Damit erzeugt der Aufrufer endlich den Fall 3, den der Vertrag von
//     `lib/tabs.ersetzeTab` seit dem R2-Nachzug beschreibt.
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
  // Die RICHTUNG der Navigation, deterministisch aus dem Router (§2): 'POP' =
  // Zurück/Vorwärts. Nur eine Vorwärts-Navigation verbraucht einen Reiter und
  // gehört in den Schliess-Ring — Blättern nicht (Herleitung bei `ersetzeTab`).
  const navTyp = useNavigationType();
  // Die Adresse, aus der die nächste Navigation kommt = der aktive Reiter.
  // `null` beim Kaltstart: dort wird nichts ersetzt, sondern der bestehende
  // Reiter aktualisiert bzw. angehängt — die Persistenz bleibt unberührt.
  const aktiv = useRef<string | null>(null);
  useEffect(() => {
    if (!istReiterPfad(pathname)) {
      // R14: Meta-Routen tragen keinen Reiter — und lassen darum auch keinen
      // als Herkunft zurück (Herleitung oben). Bis R14 stand hier der
      // D19-Sonderfall für den leeren «+»-Reiter; er ist ersatzlos weg.
      aktiv.current = null;
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
    // R14: die Sammlung wird AKTIVIERT oder ANGELEGT, nie an die Stelle eines
    // anderen Reiters gesetzt — dieselbe Semantik wie `merkeTab` sie ohnehin
    // trägt (Dublette behält ihre Position, Neues hängt hinten an). Damit ist
    // die «Höchstens EINE Sammlung»-Regel des «+» dieselbe Regel, kein zweiter
    // Ort (§5) — und der Weg zurück ins Gesetz kostet keinen Reiter.
    if ((state as NeuerReiterState | null)?.lmNeuerReiter || pathname === '/') merkeTab(ziel, label);
    else ersetzeTab(aktiv.current, ziel, label, navTyp !== 'POP');
    aktiv.current = ziel;
  }, [pathname, search, hash, state, navTyp]);

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
