import { Routes, Route } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { Startseite } from './pages/Startseite';
import { RechnerUebersicht } from './pages/RechnerUebersicht';
import { RechnerKuendigung } from './pages/RechnerKuendigung';
import { RechnerZpo } from './pages/RechnerZpo';
import { RechnerVerzugszins } from './pages/RechnerVerzugszins';
import { RechnerStub } from './pages/RechnerStub';
import { Methodik } from './pages/Methodik';
import { Ueber } from './pages/Ueber';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Startseite />} />
        <Route path="/rechner" element={<RechnerUebersicht />} />
        <Route path="/rechner/kuendigung" element={<RechnerKuendigung />} />
        <Route path="/rechner/zpo-fristen" element={<RechnerZpo />} />
        <Route path="/rechner/verzugszins" element={<RechnerVerzugszins />} />
        {/* Noch nicht implementierte Rechner (geplant / in Vorbereitung) */}
        <Route path="/rechner/:slug" element={<RechnerStub />} />
        <Route path="/methodik" element={<Methodik />} />
        <Route path="/ueber" element={<Ueber />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Shell>
  );
}
