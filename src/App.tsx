import { Suspense, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { LocaleProvider } from './components/locale';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteMeta } from './components/RouteMeta';
import { TabTracker } from './components/TabTracker';
import { ROUTEN_MANIFEST } from './routesManifest';
import { lazyRetry } from './lazyRetry';

// Code-Splitting auf Routenebene: Jede Seite ist ein eigener Chunk – der
// Erstbesuch lädt nur Shell + angefragte Seite, nicht alle Engines/Wizards.
// Reine Ladezeitpunkt-Änderung (CLAUDE.md §6.4), keine Logik betroffen.
// Karten-Routen (Rechner/Vorlagen) kommen datengetrieben aus dem
// ROUTEN_MANIFEST (src/routesManifest.ts), katalog-gegated (FUNDAMENT-UMBAU
// Thema B, §5). Hier stehen nur die Sonderrouten, die bewusst NICHT im
// Katalog sind.
const Startseite = lazyRetry(() => import('./pages/Startseite').then((m) => ({ default: m.Startseite })));
// Rubrik-Übersichten (UI-Welle): /rechner und /vorlagen lösen die frühere
// /recherche-Such-Seite ab — eigene Browse-Übersichten analog /gesetze; die
// Suche lebt seither im Header-Dropdown.
const RechnerUebersicht = lazyRetry(() => import('./pages/RechnerUebersicht').then((m) => ({ default: m.RechnerUebersicht })));
const VorlagenUebersicht = lazyRetry(() => import('./pages/VorlagenUebersicht').then((m) => ({ default: m.VorlagenUebersicht })));
// S-5c: Fristenspiegel AUFGELÖST (Auftrag David 10.6.2026 abends) — Link-Erbe
// alter Teilen-/.ics-Links übernimmt der Redirect auf die Fach-Rechner.
const FristenspiegelRedirect = lazyRetry(() => import('./pages/FristenspiegelRedirect').then((m) => ({ default: m.FristenspiegelRedirect })));
const RechnerStub = lazyRetry(() => import('./pages/RechnerStub').then((m) => ({ default: m.RechnerStub })));
const Methodik = lazyRetry(() => import('./pages/Methodik').then((m) => ({ default: m.Methodik })));
const Ueber = lazyRetry(() => import('./pages/Ueber').then((m) => ({ default: m.Ueber })));
const Kontakt = lazyRetry(() => import('./pages/Kontakt').then((m) => ({ default: m.Kontakt })));
const Datenschutz = lazyRetry(() => import('./pages/Datenschutz').then((m) => ({ default: m.Datenschutz })));
// Rubrik V «Gesetze» (browsbare Rechtssammlung) — eigenständige Nav-Sektion,
// KEINE Katalog-Oberkategorie (oberkategorien.ts unberührt). Übersicht /gesetze
// wird prerendert (seo.ts), die Lesesicht /gesetze/:ebene/:key ist client-lazy
// (SPA-Fallback via vercel.json-Rewrite) — die Routenzahl bleibt stabil bei +1.
const Gesetze = lazyRetry(() => import('./pages/Gesetze').then((m) => ({ default: m.Gesetze })));
const GesetzLeser = lazyRetry(() => import('./pages/GesetzLeser').then((m) => ({ default: m.GesetzLeser })));
// Rubrik VI «Rechtsprechung» (Bundesgerichtsentscheide) — analog zu Gesetze:
// Übersicht /rechtsprechung wird prerendert (seo.ts), der Reader
// /rechtsprechung/:key ist client-lazy (SPA-Fallback). Routenzahl +1.
const Rechtsprechung = lazyRetry(() => import('./pages/Rechtsprechung').then((m) => ({ default: m.Rechtsprechung })));
const EntscheidLeser = lazyRetry(() => import('./pages/EntscheidLeser').then((m) => ({ default: m.EntscheidLeser })));
const NotFound = lazyRetry(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

// Alt-Routen der aufgehobenen Free/Pro-Zweiteilung (FAHRPLAN-EINE-HAUPTSEITE
// E2, Auftrag David 7.6.2026): /pro, /fachpersonen, /rechner → «/».
// DAUERHAFT, kein Übergangs-Provisorium — alte Permalinks (?gebiet=, ?q=,
// ?modus=) und versendete .ics-Kalenderlinks tragen die alten Pfade; der
// Suchstring bleibt deshalb erhalten.
function AltRouteRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/${search}`} replace />;
}

// SPA-Scroll-Reset: Beim Routenwechsel nach oben scrollen (sonst behält die
// neue Seite die alte Scrollposition und man «landet unten»). Trägt die Route
// einen Anker (#vorlage-…, #g-…, von der Seitenleiste), übernimmt ScrollZuHash.
// Scroll-Position je Pfad merken und beim Zurückkehren wiederherstellen (Auftrag
// David): ein Tab-Wechsel (insb. zu einem langen Gesetzes-Reader und zurück) soll
// NICHT an den Anfang springen, sondern dort weitermachen, wo man war. Neue,
// noch nie besuchte Pfade starten weiterhin oben (keine gespeicherte Position).
// Trägt die Route einen Anker (#…), übernimmt ScrollZuHash.
function ScrollWiederherstellung() {
  const { pathname, hash } = useLocation();
  const positionen = useRef<Map<string, number>>(new Map());
  const aktiv = useRef(hash ? '' : pathname);
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
  useEffect(() => {
    aktiv.current = hash ? '' : pathname;
    if (hash) return; // Anker-Sprung übernimmt ScrollZuHash
    const ziel = positionen.current.get(pathname) ?? 0;
    // Lazy-Seiten sind anfangs zu kurz → über einige Frames erneut anpeilen.
    wiederherstellend.current = true;
    let frames = 0;
    let raf = requestAnimationFrame(function versuche() {
      window.scrollTo({ top: ziel, left: 0, behavior: 'instant' as ScrollBehavior });
      if (Math.abs(window.scrollY - ziel) > 2 && frames++ < 40) raf = requestAnimationFrame(versuche);
      else wiederherstellend.current = false;
    });
    return () => { cancelAnimationFrame(raf); wiederherstellend.current = false; };
  }, [pathname, hash]);
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
  return (
    <LocaleProvider>
    <Shell>
      <ScrollWiederherstellung />
      <ScrollZuHash />
      <RouteMeta />
      {/* Öffnet je Inhalts-Route einen Reiter im In-App-Tab-Streifen */}
      <TabTracker />
      {/* key={pathname}: ein aufgefangener Fehler (z. B. einmal fehlgeschlagener
          Lazy-Chunk) setzt sich beim nächsten Seitenwechsel von selbst zurück —
          sonst bliebe die Fehlanzeige bis zum manuellen Neuladen stehen. */}
      <ErrorBoundary key={pathname}>
      <Suspense fallback={
        /* Laden ist Aktivität, kein Fehler: Ablesekante + ruhige Zeile (FAHRPLAN-DESIGN 5.3) */
        <div className="py-16 text-center space-y-3">
          <div className="scale-rule max-w-[200px] mx-auto" aria-hidden />
          <p className="text-body-s text-ink-500">Wird geladen …</p>
        </div>}>
      <div key={pathname} className="lc-route">
      <Routes>
        <Route path="/" element={<Startseite />} />
        {/* Rubrik-Übersichten (UI-Welle): Rechner + Vorlagen je eigene Seite. */}
        <Route path="/rechner" element={<RechnerUebersicht />} />
        <Route path="/vorlagen" element={<VorlagenUebersicht />} />
        {/* /recherche aufgelöst → auf die Rechner-Übersicht (alte Permalinks). */}
        <Route path="/recherche" element={<Navigate to="/rechner" replace />} />
        {/* Alt-Routen (Free/Pro aufgehoben): alle auf die eine Hauptseite */}
        <Route path="/pro" element={<AltRouteRedirect />} />
        <Route path="/fachpersonen" element={<AltRouteRedirect />} />
        {/* Karten-Routen (Rechner + Vorlagen) datengetrieben aus dem
            katalog-gegateten ROUTEN_MANIFEST — Reihenfolge wie zuvor
            (Rechner, dann Vorlagen); react-router v6 rankt konkrete vor
            dynamischen Pfaden, der Stub /rechner/:slug unten greift erst danach. */}
        {ROUTEN_MANIFEST.map((r) => (
          <Route key={r.pfad} path={r.pfad} element={<r.Comp />} />
        ))}
        {/* Sonderroute (nicht im Katalog): erbt alte Fristenspiegel-/.ics-Links */}
        <Route path="/rechner/fristenspiegel" element={<FristenspiegelRedirect />} />
        {/* Noch nicht implementierte Rechner (geplant / in Vorbereitung) */}
        <Route path="/rechner/:slug" element={<RechnerStub />} />
        {/* Rubrik V «Gesetze»: Übersicht (prerendert) + Lesesicht (SPA-Fallback) */}
        <Route path="/gesetze" element={<Gesetze />} />
        <Route path="/gesetze/:ebene/:key" element={<GesetzLeser />} />
        {/* Rubrik VI «Rechtsprechung»: Übersicht (prerendert) + Reader (SPA-Fallback) */}
        <Route path="/rechtsprechung" element={<Rechtsprechung />} />
        <Route path="/rechtsprechung/:key" element={<EntscheidLeser />} />
        <Route path="/methodik" element={<Methodik />} />
        <Route path="/ueber" element={<Ueber />} />
        <Route path="/kontakt" element={<Kontakt />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </div>
      </Suspense>
      </ErrorBoundary>
    </Shell>
    </LocaleProvider>
  );
}
