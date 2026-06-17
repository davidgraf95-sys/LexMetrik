import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { LocaleProvider } from './components/locale';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteMeta } from './components/RouteMeta';
import { ROUTEN_MANIFEST } from './routesManifest';

// Code-Splitting auf Routenebene: Jede Seite ist ein eigener Chunk – der
// Erstbesuch lädt nur Shell + angefragte Seite, nicht alle Engines/Wizards.
// Reine Ladezeitpunkt-Änderung (CLAUDE.md §6.4), keine Logik betroffen.
// Karten-Routen (Rechner/Vorlagen) kommen datengetrieben aus dem
// ROUTEN_MANIFEST (src/routesManifest.ts), katalog-gegated (FUNDAMENT-UMBAU
// Thema B, §5). Hier stehen nur die Sonderrouten, die bewusst NICHT im
// Katalog sind.
const Startseite = lazy(() => import('./pages/Startseite').then((m) => ({ default: m.Startseite })));
// S-5c: Fristenspiegel AUFGELÖST (Auftrag David 10.6.2026 abends) — Link-Erbe
// alter Teilen-/.ics-Links übernimmt der Redirect auf die Fach-Rechner.
const FristenspiegelRedirect = lazy(() => import('./pages/FristenspiegelRedirect').then((m) => ({ default: m.FristenspiegelRedirect })));
const RechnerStub = lazy(() => import('./pages/RechnerStub').then((m) => ({ default: m.RechnerStub })));
const Methodik = lazy(() => import('./pages/Methodik').then((m) => ({ default: m.Methodik })));
const Ueber = lazy(() => import('./pages/Ueber').then((m) => ({ default: m.Ueber })));
const Kontakt = lazy(() => import('./pages/Kontakt').then((m) => ({ default: m.Kontakt })));
const Datenschutz = lazy(() => import('./pages/Datenschutz').then((m) => ({ default: m.Datenschutz })));
// Rubrik V «Gesetze» (browsbare Rechtssammlung) — eigenständige Nav-Sektion,
// KEINE Katalog-Oberkategorie (oberkategorien.ts unberührt). Übersicht /gesetze
// wird prerendert (seo.ts), die Lesesicht /gesetze/:ebene/:key ist client-lazy
// (SPA-Fallback via vercel.json-Rewrite) — die Routenzahl bleibt stabil bei +1.
const Gesetze = lazy(() => import('./pages/Gesetze').then((m) => ({ default: m.Gesetze })));
const GesetzLeser = lazy(() => import('./pages/GesetzLeser').then((m) => ({ default: m.GesetzLeser })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

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
// neue Seite die alte Scrollposition und man «landet unten»). Sprungmarken
// auf derselben Seite (#fristen etc.) bleiben dem Browser überlassen.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  // key={pathname} am Inhalt → dezenter Opacity-Fade beim Routenwechsel
  // (Redesign E8). Such-/Filter-Parameter (?q=, ?kategorie=) ändern den
  // pathname NICHT → kein Remount, der Katalog-Zustand bleibt erhalten.
  const { pathname } = useLocation();
  return (
    <LocaleProvider>
    <Shell>
      <ScrollToTop />
      <RouteMeta />
      <ErrorBoundary>
      <Suspense fallback={
        /* Laden ist Aktivität, kein Fehler: Ablesekante + ruhige Zeile (FAHRPLAN-DESIGN 5.3) */
        <div className="py-16 text-center space-y-3">
          <div className="scale-rule max-w-[200px] mx-auto" aria-hidden />
          <p className="text-body-s text-ink-500">Wird geladen …</p>
        </div>}>
      <div key={pathname} className="lc-route">
      <Routes>
        <Route path="/" element={<Startseite />} />
        {/* Alt-Routen (Free/Pro aufgehoben): alle auf die eine Hauptseite */}
        <Route path="/pro" element={<AltRouteRedirect />} />
        <Route path="/fachpersonen" element={<AltRouteRedirect />} />
        <Route path="/rechner" element={<AltRouteRedirect />} />
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
