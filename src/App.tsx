import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { LocaleProvider } from './components/locale';

// Code-Splitting auf Routenebene: Jede Seite ist ein eigener Chunk — der
// Erstbesuch lädt nur Shell + angefragte Seite, nicht alle Engines/Wizards.
// Reine Ladezeitpunkt-Änderung (CLAUDE.md §6.4), keine Logik betroffen.
const Startseite = lazy(() => import('./pages/Startseite').then((m) => ({ default: m.Startseite })));
const Fachpersonen = lazy(() => import('./pages/Fachpersonen').then((m) => ({ default: m.Fachpersonen })));
const RechnerKuendigung = lazy(() => import('./pages/RechnerKuendigung').then((m) => ({ default: m.RechnerKuendigung })));
const RechnerZpo = lazy(() => import('./pages/RechnerZpo').then((m) => ({ default: m.RechnerZpo })));
const RechnerVerzugszins = lazy(() => import('./pages/RechnerVerzugszins').then((m) => ({ default: m.RechnerVerzugszins })));
const RechnerSchkg = lazy(() => import('./pages/RechnerSchkg').then((m) => ({ default: m.RechnerSchkg })));
const RechnerErbteilung = lazy(() => import('./pages/RechnerErbteilung').then((m) => ({ default: m.RechnerErbteilung })));
const RechnerMietrecht = lazy(() => import('./pages/RechnerMietrecht').then((m) => ({ default: m.RechnerMietrecht })));
const RechnerVerjaehrung = lazy(() => import('./pages/RechnerVerjaehrung').then((m) => ({ default: m.RechnerVerjaehrung })));
const RechnerGewaehrleistung = lazy(() => import('./pages/RechnerGewaehrleistung').then((m) => ({ default: m.RechnerGewaehrleistung })));
const VorlageTestament = lazy(() => import('./pages/VorlageTestament').then((m) => ({ default: m.VorlageTestament })));
const VorlagePatientenverfuegung = lazy(() => import('./pages/VorlagePatientenverfuegung').then((m) => ({ default: m.VorlagePatientenverfuegung })));
const VorlageVorsorgeauftrag = lazy(() => import('./pages/VorlageVorsorgeauftrag').then((m) => ({ default: m.VorlageVorsorgeauftrag })));
const VorlageSchlichtungsgesuchBs = lazy(() => import('./pages/VorlageSchlichtungsgesuchBs').then((m) => ({ default: m.VorlageSchlichtungsgesuchBs })));
const RechnerStub = lazy(() => import('./pages/RechnerStub').then((m) => ({ default: m.RechnerStub })));
const Methodik = lazy(() => import('./pages/Methodik').then((m) => ({ default: m.Methodik })));
const Ueber = lazy(() => import('./pages/Ueber').then((m) => ({ default: m.Ueber })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

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
  return (
    <LocaleProvider>
    <Shell>
      <ScrollToTop />
      <Suspense fallback={<div className="py-16 text-center text-sm text-ink-500">Wird geladen …</div>}>
      <Routes>
        <Route path="/" element={<Startseite />} />
        <Route path="/fachpersonen" element={<Fachpersonen />} />
        {/* Alt-Route: Übersicht ist im Vollkatalog (/fachpersonen) aufgegangen */}
        <Route path="/rechner" element={<Navigate to="/fachpersonen" replace />} />
        <Route path="/rechner/kuendigung" element={<RechnerKuendigung />} />
        <Route path="/rechner/zpo-fristen" element={<RechnerZpo />} />
        <Route path="/rechner/verzugszins" element={<RechnerVerzugszins />} />
        <Route path="/rechner/schkg-fristen" element={<RechnerSchkg />} />
        <Route path="/rechner/erbteilung" element={<RechnerErbteilung />} />
        <Route path="/rechner/mietrecht" element={<RechnerMietrecht />} />
        <Route path="/rechner/verjaehrung" element={<RechnerVerjaehrung />} />
        <Route path="/rechner/gewaehrleistung" element={<RechnerGewaehrleistung />} />
        {/* Vorlagen (Modus «Vorlagen») */}
        <Route path="/vorlagen/testament" element={<VorlageTestament />} />
        <Route path="/vorlagen/patientenverfuegung" element={<VorlagePatientenverfuegung />} />
        <Route path="/vorlagen/vorsorgeauftrag" element={<VorlageVorsorgeauftrag />} />
        <Route path="/vorlagen/schlichtungsgesuch-bs" element={<VorlageSchlichtungsgesuchBs />} />
        {/* Noch nicht implementierte Rechner (geplant / in Vorbereitung) */}
        <Route path="/rechner/:slug" element={<RechnerStub />} />
        <Route path="/methodik" element={<Methodik />} />
        <Route path="/ueber" element={<Ueber />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </Shell>
    </LocaleProvider>
  );
}
