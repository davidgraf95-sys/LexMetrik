import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { Startseite } from './pages/Startseite';
import { RechnerUebersicht } from './pages/RechnerUebersicht';
import { RechnerKuendigung } from './pages/RechnerKuendigung';
import { RechnerZpo } from './pages/RechnerZpo';
import { RechnerVerzugszins } from './pages/RechnerVerzugszins';
import { RechnerSchkg } from './pages/RechnerSchkg';
import { RechnerErbteilung } from './pages/RechnerErbteilung';
import { RechnerMietrecht } from './pages/RechnerMietrecht';
import { RechnerStub } from './pages/RechnerStub';
import { Methodik } from './pages/Methodik';
import { Ueber } from './pages/Ueber';
import { NotFound } from './pages/NotFound';

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
    <Shell>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Startseite />} />
        <Route path="/rechner" element={<RechnerUebersicht />} />
        <Route path="/rechner/kuendigung" element={<RechnerKuendigung />} />
        <Route path="/rechner/zpo-fristen" element={<RechnerZpo />} />
        <Route path="/rechner/verzugszins" element={<RechnerVerzugszins />} />
        <Route path="/rechner/schkg-fristen" element={<RechnerSchkg />} />
        <Route path="/rechner/erbteilung" element={<RechnerErbteilung />} />
        <Route path="/rechner/mietrecht" element={<RechnerMietrecht />} />
        {/* Noch nicht implementierte Rechner (geplant / in Vorbereitung) */}
        <Route path="/rechner/:slug" element={<RechnerStub />} />
        <Route path="/methodik" element={<Methodik />} />
        <Route path="/ueber" element={<Ueber />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Shell>
  );
}
