import { Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { LocaleProvider } from './components/locale';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteMeta } from './components/RouteMeta';
import { TabTracker } from './components/TabTracker';
import { ZuletztTracker } from './components/ZuletztTracker';
import { RouteSwitch } from './RouteSwitch';
import { prefetchLeser } from './leserPrefetch';
import { tabSchluessel } from './lib/tabs';

// SPA-Scroll-Reset: Beim Routenwechsel nach oben scrollen (sonst behält die
// neue Seite die alte Scrollposition und man «landet unten»). Trägt die Route
// einen Anker (#vorlage-…, #g-…, von der Seitenleiste), übernimmt ScrollZuHash.
// Scroll-Position je Pfad merken und beim Zurückkehren wiederherstellen (Auftrag
// David): ein Tab-Wechsel (insb. zu einem langen Gesetzes-Reader und zurück) soll
// NICHT an den Anfang springen, sondern dort weitermachen, wo man war. Neue,
// noch nie besuchte Pfade starten weiterhin oben (keine gespeicherte Position).
// Trägt die Route einen Anker (#…), übernimmt ScrollZuHash.
// SSR-sicherer Layout-Effekt (Prerender rendert serverseitig — dort gibt es
// keinen Layout-Effekt; useEffect ist der harmlose Fallback).
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function ScrollWiederherstellung() {
  const { pathname, hash, search } = useLocation();
  // Positions-Schlüssel = Reiter-Identität (pathname + ?r), NICHT pathname allein:
  // dasselbe Gesetz kann mehrfach offen sein (?r=<n>), jede Instanz hält ihre
  // eigene Scrollposition. tabSchluessel ignoriert #Anker und ?preset (gehören
  // nicht zur Reiter-Identität) — read-only aus lib/tabs (§5).
  const schluessel = tabSchluessel(pathname + search);
  const positionen = useRef<Map<string, number>>(new Map());
  const aktiv = useRef(hash ? '' : schluessel);
  const wiederherstellend = useRef(false);
  // Native Scroll-Wiederherstellung abschalten — wir verwalten sie selbst (sonst
  // konkurriert der Browser bei Back/Forward mit der manuellen Wiederherstellung).
  useEffect(() => {
    if (!('scrollRestoration' in history)) return;
    const vorher = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    return () => { history.scrollRestoration = vorher; };
  }, []);
  // Laufend die Position des AKTUELLEN Pfads festhalten — NICHT während einer
  // programmatischen Wiederherstellung (Zwischenwerte würden das Ziel überschreiben)
  // und NICHT auf Anker-Routen (#hash → der Anker-Offset gehört nicht als Pfad-
  // Position gespeichert, sonst landet ein späterer hashloser Besuch am Anker).
  useEffect(() => {
    const onScroll = () => {
      if (!wiederherstellend.current && aktiv.current) positionen.current.set(aktiv.current, window.scrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  // ENDGÜLTIGER Fix Scroll-Reset (Auftrag David 25.6.2026): Pfadwechsel + Sperre
  // SYNCHRON im Commit setzen — VOR dem ersten Paint und damit vor dem
  // scroll-Event, das der Browser beim Schrumpfen der Dokumenthöhe (der neue,
  // noch nicht geladene Reader ist kurz) auslöst. Lag das in einem useEffect
  // (nach dem Paint), konnte jenes Clamp-scroll-Event noch mit dem ALTEN
  // aktiv.current feuern und dem VORHERIGEN Gesetz die ~0-Position zuschreiben
  // → beim Zurückwechseln landete man am Anfang («ab und zu», timing-abhängig;
  // das war die Wurzel hinter den früheren Teil-Fixes). useLayoutEffect
  // garantiert die Reihenfolge unabhängig vom Timing.
  useIsoLayoutEffect(() => {
    wiederherstellend.current = true;       // Clamp-/Transient-Scrolls NICHT speichern
    aktiv.current = hash ? '' : schluessel;  // ab sofort gehört jeder Save dem NEUEN Reiter
  }, [schluessel, hash]);
  useEffect(() => {
    if (hash) { wiederherstellend.current = false; return; } // Anker-Sprung übernimmt ScrollZuHash
    const gespeichert = positionen.current.get(schluessel);
    const ziel = gespeichert ?? 0;
    // Neu besuchter Pfad OHNE gespeicherte Position (Ziel = Anfang): EINMALIG nach
    // oben, KEIN beharrlicher Loop. Der 360-Frame-Loop ist nur für das
    // Wiederherstellen einer NICHT-Null-Position durch die lazy Ladephase nötig;
    // für einen frischen Pfad reisst er die Seite nur sichtbar wiederholt an den
    // Anfang (Bug David: «beim Wechsel zwischen Gesetzen wird man an den Anfang
    // geschickt» — der Reader remountet ohnehin oben, das genügt). Ein zweiter
    // raf fängt den Fall, dass der lazy Chunk im selben Frame noch nicht montiert
    // ist und der Browser eine Rest-Scrollposition hält.
    if (gespeichert === undefined || ziel === 0) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      const raf = requestAnimationFrame(() => {
        if (window.scrollY > 0) window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        wiederherstellend.current = false; // Sperre lösen → ab jetzt wird die Position des neuen Pfads gespeichert
      });
      return () => { cancelAnimationFrame(raf); wiederherstellend.current = false; };
    }
    // Gespeicherte NICHT-Null-Position wiederherstellen (Tab verlassen → zurück):
    // Lazy geladene Seiten (Reader-Chunk + Normtext-JSON erst nach dem Routenwechsel)
    // sind anfangs zu kurz → erneut anpeilen, SOLANGE der Inhalt noch wächst — bis
    // das Ziel erreicht ist oder die Höhe ~12 Frames stabil bleibt (Seite fertig,
    // ggf. echt kürzer), höchstens ~360 Frames als Notbremse.
    wiederherstellend.current = true;
    let frames = 0;
    let stabil = 0;
    let letzteHoehe = -1;
    let raf = requestAnimationFrame(function versuche() {
      window.scrollTo({ top: ziel, left: 0, behavior: 'instant' as ScrollBehavior });
      const erreicht = Math.abs(window.scrollY - ziel) <= 2;
      const hoehe = document.documentElement.scrollHeight;
      // «stabil» NUR zählen, wenn überhaupt genug Inhalt da ist. Sonst löst die
      // stabile, aber noch KURZE Höhe der Ladephase (der Reader fetcht das
      // Normtext-JSON erst NACH dem Mount) den Abbruch aus, bevor der Inhalt da
      // ist → man landet oben (Bug David). Erst nach dem Laden gilt eine stabile
      // Höhe als «Seite fertig, Ziel ggf. echt unerreichbar».
      const geladen = hoehe > window.innerHeight * 1.5;
      stabil = (geladen && hoehe === letzteHoehe) ? stabil + 1 : 0;
      letzteHoehe = hoehe;
      if (!erreicht && frames++ < 360 && stabil < 12) raf = requestAnimationFrame(versuche);
      else wiederherstellend.current = false;
    });
    return () => { cancelAnimationFrame(raf); wiederherstellend.current = false; };
  }, [schluessel, hash]);
  return null;
}

// Anker-Sprung für die Seitenleisten-Tieflinks (Vorlagen-Gruppe, Bund-Gebiet).
// react-router scrollt nicht von selbst zum #hash; und das Ziel-Element steckt
// hinter einer lazy()-Seite, die erst einen Tick später montiert — darum mit
// requestAnimationFrame ein paar Frames lang erneut versuchen, dann aufgeben.
function ScrollZuHash() {
  const { hash, pathname, search } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    let frames = 0;
    let raf = requestAnimationFrame(function versuche() {
      const el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' }); return; }
      if (frames++ < 30) raf = requestAnimationFrame(versuche);
    });
    return () => cancelAnimationFrame(raf);
  }, [hash, pathname, search]);
  return null;
}

export default function App() {
  // key={pathname} am Inhalt → dezenter Opacity-Fade beim Routenwechsel
  // (Redesign E8). Der Such-Parameter (?q= der Hero-Suche) ändert den
  // pathname NICHT → kein Remount, der Katalog-Zustand bleibt erhalten.
  const { pathname } = useLocation();
  // Rank 2 (QS-PERF): schwere Leser-Chunks nach dem Erstpaint idle vorwärmen, damit
  // das erste Gesetz/Entscheid ohne Chunk-Parse-Wartezeit öffnet. requestIdleCallback
  // hält es vom kritischen Pfad fern (setTimeout-Fallback, garantiert feuernd, §15/3).
  useEffect(() => {
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | undefined;
    let toId: number | undefined;
    if (w.requestIdleCallback) idleId = w.requestIdleCallback(prefetchLeser);
    else toId = window.setTimeout(prefetchLeser, 1500);
    return () => {
      if (idleId != null) w.cancelIdleCallback?.(idleId);
      if (toId != null) window.clearTimeout(toId);
    };
  }, []);
  return (
    <LocaleProvider>
    <Shell>
      <ScrollWiederherstellung />
      <ScrollZuHash />
      <RouteMeta />
      {/* Öffnet je Inhalts-Route einen Reiter im In-App-Tab-Streifen */}
      <TabTracker />
      {/* Merkt je konkreter Inhalts-Route den «Zuletzt verwendet»-Chip (Startseite) */}
      <ZuletztTracker />
      {/* key={pathname}: ein aufgefangener Fehler (z. B. einmal fehlgeschlagener
          Lazy-Chunk) setzt sich beim nächsten Seitenwechsel von selbst zurück —
          sonst bliebe die Fehlanzeige bis zum manuellen Neuladen stehen. */}
      <ErrorBoundary key={pathname}>
      <Suspense fallback={
        /* Laden ist Aktivität, kein Fehler: Ablesekante + ruhige Zeile (FAHRPLAN-DESIGN 5.3).
           min-h-screen reserviert die Routenhöhe, damit der Lazy-Chunk-Ladeframe das
           Dokument nicht auf eine Zeile kollabiert (CLS, §15/2; Token §13). */
        <div className="min-h-screen py-16 text-center space-y-3">
          <div className="scale-rule max-w-[200px] mx-auto" aria-hidden />
          <p className="text-body-s text-ink-500">Wird geladen …</p>
        </div>}>
      <div key={pathname} className="lc-route">
      {/* Der EINE Routen-Baum (§5) — ausgelagert nach RouteSwitch, damit er
          künftig auch in einem MemoryRouter-Pane laufen kann (Split-View B). */}
      <RouteSwitch />
      </div>
      </Suspense>
      </ErrorBoundary>
    </Shell>
    </LocaleProvider>
  );
}
