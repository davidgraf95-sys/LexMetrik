import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { LocaleProvider } from './components/locale';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteMeta } from './components/RouteMeta';

// Code-Splitting auf Routenebene: Jede Seite ist ein eigener Chunk – der
// Erstbesuch lädt nur Shell + angefragte Seite, nicht alle Engines/Wizards.
// Reine Ladezeitpunkt-Änderung (CLAUDE.md §6.4), keine Logik betroffen.
const Startseite = lazy(() => import('./pages/Startseite').then((m) => ({ default: m.Startseite })));
const RechnerKuendigung = lazy(() => import('./pages/RechnerKuendigung').then((m) => ({ default: m.RechnerKuendigung })));
const RechnerZpo = lazy(() => import('./pages/RechnerZpo').then((m) => ({ default: m.RechnerZpo })));
const RechnerVerzugszins = lazy(() => import('./pages/RechnerVerzugszins').then((m) => ({ default: m.RechnerVerzugszins })));
const RechnerSchkg = lazy(() => import('./pages/RechnerSchkg').then((m) => ({ default: m.RechnerSchkg })));
const RechnerErbteilung = lazy(() => import('./pages/RechnerErbteilung').then((m) => ({ default: m.RechnerErbteilung })));
const RechnerErbFristen = lazy(() => import('./pages/RechnerErbFristen').then((m) => ({ default: m.RechnerErbFristen })));
const RechnerMietrecht = lazy(() => import('./pages/RechnerMietrecht').then((m) => ({ default: m.RechnerMietrecht })));
const RechnerVerjaehrung = lazy(() => import('./pages/RechnerVerjaehrung').then((m) => ({ default: m.RechnerVerjaehrung })));
const RechnerGewaehrleistung = lazy(() => import('./pages/RechnerGewaehrleistung').then((m) => ({ default: m.RechnerGewaehrleistung })));
const RechnerTagerechner = lazy(() => import('./pages/RechnerTagerechner').then((m) => ({ default: m.RechnerTagerechner })));
const RechnerTeuerung = lazy(() => import('./pages/RechnerTeuerung').then((m) => ({ default: m.RechnerTeuerung })));
const RechnerZustaendigkeit = lazy(() => import('./pages/RechnerZustaendigkeit').then((m) => ({ default: m.RechnerZustaendigkeit })));
// S-5c: Fristenspiegel AUFGELÖST (Auftrag David 10.6.2026 abends) — Link-Erbe
// alter Teilen-/.ics-Links übernimmt der Redirect auf die Fach-Rechner.
const FristenspiegelRedirect = lazy(() => import('./pages/FristenspiegelRedirect').then((m) => ({ default: m.FristenspiegelRedirect })));
const RechnerStreitwert = lazy(() => import('./pages/RechnerStreitwert').then((m) => ({ default: m.RechnerStreitwert })));
const RechnerGebvKosten = lazy(() => import('./pages/RechnerGebvKosten').then((m) => ({ default: m.RechnerGebvKosten })));
const RechnerBgerRechtsweg = lazy(() => import('./pages/RechnerBgerRechtsweg').then((m) => ({ default: m.RechnerBgerRechtsweg })));
const VorlageTestament = lazy(() => import('./pages/VorlageTestament').then((m) => ({ default: m.VorlageTestament })));
const VorlagePatientenverfuegung = lazy(() => import('./pages/VorlagePatientenverfuegung').then((m) => ({ default: m.VorlagePatientenverfuegung })));
const VorlageVorsorgeauftrag = lazy(() => import('./pages/VorlageVorsorgeauftrag').then((m) => ({ default: m.VorlageVorsorgeauftrag })));
const VorlageSchlichtungsgesuchBs = lazy(() => import('./pages/VorlageSchlichtungsgesuchBs').then((m) => ({ default: m.VorlageSchlichtungsgesuchBs })));
const VorlageArbeitsvertrag = lazy(() => import('./pages/VorlageArbeitsvertrag').then((m) => ({ default: m.VorlageArbeitsvertrag })));
const VorlageMietvertrag = lazy(() => import('./pages/VorlageMietvertrag').then((m) => ({ default: m.VorlageMietvertrag })));
const VorlageVollmacht = lazy(() => import('./pages/VorlageVollmacht').then((m) => ({ default: m.VorlageVollmacht })));
const VorlageKlageVereinfacht = lazy(() => import('./pages/VorlageKlageVereinfacht').then((m) => ({ default: m.VorlageKlageVereinfacht })));
const VorlageKlageOrdentlich = lazy(() => import('./pages/VorlageKlageOrdentlich').then((m) => ({ default: m.VorlageKlageOrdentlich })));
const VorlageKuendigungArbeitnehmer = lazy(() => import('./pages/VorlageKuendigungArbeitnehmer').then((m) => ({ default: m.VorlageKuendigungArbeitnehmer })));
const VorlageKuendigungArbeitgeber = lazy(() => import('./pages/VorlageKuendigungArbeitgeber').then((m) => ({ default: m.VorlageKuendigungArbeitgeber })));
const VorlageKuendigungMieter = lazy(() => import('./pages/VorlageKuendigungMieter').then((m) => ({ default: m.VorlageKuendigungMieter })));
const VorlageKuendigungVertrag = lazy(() => import('./pages/VorlageKuendigungVertrag').then((m) => ({ default: m.VorlageKuendigungVertrag })));
const VorlageKuendigungVermieter = lazy(() => import('./pages/VorlageKuendigungVermieter').then((m) => ({ default: m.VorlageKuendigungVermieter })));
const VorlageMahnung = lazy(() => import('./pages/VorlageMahnung').then((m) => ({ default: m.VorlageMahnung })));
const VorlageVerjaehrungsverzicht = lazy(() => import('./pages/VorlageVerjaehrungsverzicht').then((m) => ({ default: m.VorlageVerjaehrungsverzicht })));
const VorlageScheidungsklage = lazy(() => import('./pages/VorlageScheidungsklage').then((m) => ({ default: m.VorlageScheidungsklage })));
const VorlageGmbhGruendung = lazy(() => import('./pages/VorlageGmbhGruendung').then((m) => ({ default: m.VorlageGmbhGruendung })));
const VorlageAgGruendung = lazy(() => import('./pages/VorlageAgGruendung').then((m) => ({ default: m.VorlageAgGruendung })));
const VorlageKapitalerhoehung = lazy(() => import('./pages/VorlageKapitalerhoehung').then((m) => ({ default: m.VorlageKapitalerhoehung })));
const RechnerStub = lazy(() => import('./pages/RechnerStub').then((m) => ({ default: m.RechnerStub })));
const Methodik = lazy(() => import('./pages/Methodik').then((m) => ({ default: m.Methodik })));
const Ueber = lazy(() => import('./pages/Ueber').then((m) => ({ default: m.Ueber })));
const Kontakt = lazy(() => import('./pages/Kontakt').then((m) => ({ default: m.Kontakt })));
const Datenschutz = lazy(() => import('./pages/Datenschutz').then((m) => ({ default: m.Datenschutz })));
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
      <Routes>
        <Route path="/" element={<Startseite />} />
        {/* Alt-Routen (Free/Pro aufgehoben): alle auf die eine Hauptseite */}
        <Route path="/pro" element={<AltRouteRedirect />} />
        <Route path="/fachpersonen" element={<AltRouteRedirect />} />
        <Route path="/rechner" element={<AltRouteRedirect />} />
        <Route path="/rechner/kuendigung" element={<RechnerKuendigung />} />
        <Route path="/rechner/zpo-fristen" element={<RechnerZpo />} />
        <Route path="/rechner/verzugszins" element={<RechnerVerzugszins />} />
        <Route path="/rechner/schkg-fristen" element={<RechnerSchkg />} />
        <Route path="/rechner/erbteilung" element={<RechnerErbteilung />} />
        <Route path="/rechner/erb-fristen" element={<RechnerErbFristen />} />
        <Route path="/rechner/mietrecht" element={<RechnerMietrecht />} />
        <Route path="/rechner/verjaehrung" element={<RechnerVerjaehrung />} />
        <Route path="/rechner/gewaehrleistung" element={<RechnerGewaehrleistung />} />
        <Route path="/rechner/tagerechner" element={<RechnerTagerechner />} />
        <Route path="/rechner/teuerung" element={<RechnerTeuerung />} />
        <Route path="/rechner/zustaendigkeit" element={<RechnerZustaendigkeit />} />
        <Route path="/rechner/fristenspiegel" element={<FristenspiegelRedirect />} />
        <Route path="/rechner/streitwert" element={<RechnerStreitwert />} />
        <Route path="/rechner/betreibungskosten" element={<RechnerGebvKosten />} />
        <Route path="/rechner/bgg-fristen" element={<RechnerBgerRechtsweg />} />
        {/* Vorlagen (Modus «Vorlagen») */}
        <Route path="/vorlagen/testament" element={<VorlageTestament />} />
        <Route path="/vorlagen/patientenverfuegung" element={<VorlagePatientenverfuegung />} />
        <Route path="/vorlagen/vorsorgeauftrag" element={<VorlageVorsorgeauftrag />} />
        <Route path="/vorlagen/schlichtungsgesuch-bs" element={<VorlageSchlichtungsgesuchBs />} />
        <Route path="/vorlagen/arbeitsvertrag" element={<VorlageArbeitsvertrag />} />
        <Route path="/vorlagen/mietvertrag" element={<VorlageMietvertrag />} />
        <Route path="/vorlagen/vollmacht" element={<VorlageVollmacht />} />
        <Route path="/vorlagen/klage-vereinfacht" element={<VorlageKlageVereinfacht />} />
        <Route path="/vorlagen/klage-ordentlich" element={<VorlageKlageOrdentlich />} />
        <Route path="/vorlagen/kuendigung-arbeitnehmer" element={<VorlageKuendigungArbeitnehmer />} />
        <Route path="/vorlagen/kuendigung-arbeitgeber" element={<VorlageKuendigungArbeitgeber />} />
        <Route path="/vorlagen/kuendigung-mieter" element={<VorlageKuendigungMieter />} />
        <Route path="/vorlagen/kuendigung-vertrag" element={<VorlageKuendigungVertrag />} />
        <Route path="/vorlagen/kuendigung-vermieter" element={<VorlageKuendigungVermieter />} />
        <Route path="/vorlagen/mahnung" element={<VorlageMahnung />} />
        <Route path="/vorlagen/verjaehrungsverzicht" element={<VorlageVerjaehrungsverzicht />} />
        <Route path="/vorlagen/scheidungsklage" element={<VorlageScheidungsklage />} />
        <Route path="/vorlagen/gmbh-gruendung" element={<VorlageGmbhGruendung />} />
        <Route path="/vorlagen/ag-gruendung" element={<VorlageAgGruendung />} />
        <Route path="/vorlagen/kapitalerhoehung" element={<VorlageKapitalerhoehung />} />
        {/* Noch nicht implementierte Rechner (geplant / in Vorbereitung) */}
        <Route path="/rechner/:slug" element={<RechnerStub />} />
        <Route path="/methodik" element={<Methodik />} />
        <Route path="/ueber" element={<Ueber />} />
        <Route path="/kontakt" element={<Kontakt />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      </ErrorBoundary>
    </Shell>
    </LocaleProvider>
  );
}
