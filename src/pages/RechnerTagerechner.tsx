import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AllgemeineFristForm } from '../components/forms/AllgemeineFristForm';
import { ZpoFristenForm } from '../components/forms/ZpoFristenForm';
import { SchkgFristenForm } from '../components/forms/SchkgFristenForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { Tabs } from '../components/ui/Tabs';
import { getCalculator } from '../lib/calculators';

// ─── Kombinierter Fristenrechner (Free) — Auftrag 5.6.2026 ──────────────────
//
// EIN Gratis-Rechner für die meisten Verfahren: Der Verfahrens-Schnitt
// rendert die BESTEHENDEN, getrennten Forms — die Engines (allgemeineFrist,
// zpoFristen, schkgFristen) bleiben nach §4 strikt getrennt; kombiniert
// wird ausschliesslich die Navigation. Die Pro-Karten zpo-fristen/
// schkg-fristen bleiben als Direkteinstiege bestehen (gleiche Engines).

type Verfahren = 'allgemein' | 'zpo' | 'schkg';

const VERFAHREN: { code: Verfahren; label: string }[] = [
  { code: 'allgemein', label: 'Allgemein (Vertrag/OR)' },
  { code: 'zpo', label: 'Zivilprozess (ZPO)' },
  { code: 'schkg', label: 'Betreibung (SchKG)' },
];

// Hash ↔ Verfahrens-Tab (Vereinheitlichung 7.6.2026, Auftrag David):
// geteilte Links/.ics tragen die Weiche im Fragment (Muster Zuständigkeit/
// Kündigung) — ohne ihn landete der Empfänger eines ZPO-Links auf
// «Allgemein» und sah die Parameter nie.
const HASH_VERFAHREN: Record<string, Verfahren> = { '#zpo': 'zpo', '#schkg': 'schkg', '#allgemein': 'allgemein' };

export function RechnerTagerechner() {
  const calc = getCalculator('tagerechner')!;
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [verfahren, setVerfahren] = useState<Verfahren>(HASH_VERFAHREN[hash] ?? 'allgemein');
  // Hash-Navigation: Sync während des Renderns (React-Muster «adjusting
  // state», kein setState-im-Effect — Lint).
  const [letzterHash, setLetzterHash] = useState(hash);
  if (hash !== letzterHash) {
    setLetzterHash(hash);
    if (HASH_VERFAHREN[hash]) setVerfahren(HASH_VERFAHREN[hash]);
  }
  const wechsle = (v: Verfahren) => {
    setVerfahren(v);
    // Such-Parameter gehören zum bisherigen Tab — beim manuellen Wechsel
    // fallen sie weg (die Forms hydratisieren ohnehin nur beim Mount).
    navigate({ search: '', hash: v === 'allgemein' ? '' : `#${v}` }, { replace: true });
  };

  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <div className="space-y-1.5">
          <p className="lc-overline">Verfahren</p>
          <Tabs items={VERFAHREN} value={verfahren} onChange={wechsle}
            ariaLabel="Verfahrensart wählen" />
          <p className="text-micro text-ink-500">
            {verfahren === 'allgemein' && 'Vertrags- und Verwirkungsfristen nach OR/ZGB – ohne Gerichtsferien; inkl. Rückwärtsrechnung, Tage-zwischen, Zustell-Helfer und Kalenderexport.'}
            {verfahren === 'zpo' && 'Gerichtliche und gesetzliche Fristen mit Stillstand (Art. 145 ZPO), kantonalen Feiertagen und Zustellungsregeln.'}
            {verfahren === 'schkg' && 'Betreibungsferien und Rechtsstillstand (Art. 56 ff. SchKG) – getrennt vom ZPO-Stillstand gerechnet.'}
          </p>
        </div>
        {verfahren === 'allgemein' && <AllgemeineFristForm />}
        {verfahren === 'zpo' && <ZpoFristenForm />}
        {verfahren === 'schkg' && <SchkgFristenForm />}
      </div>
    </div>
  );
}
