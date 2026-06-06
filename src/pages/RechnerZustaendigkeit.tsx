import { useState } from 'react';
import { ZustaendigkeitForm } from '../components/forms/ZustaendigkeitForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { getCalculator } from '../lib/calculators';
import type { Rechtsweg } from '../lib/zustaendigkeit';

// Zuständigkeitsrechner unter /rechner/zustaendigkeit (Phase 3 des Auftrags
// ZUSTAENDIGKEIT-AUFTRAG.md). Pflicht-Disclaimer prominent in der Form.
//
// Hero je Rechtsweg (Fix 6.6.2026, Befund David): Der Kopf zeigte unabhängig
// vom gewählten Rechtsweg immer die ZPO-Chips der Registry — Kategorie,
// Beschrieb und Norm-Chips folgen jetzt der Auswahl (reine Anzeige, §3/§5:
// die Zivil-Werte bleiben einzig in der Registry gepflegt).
const HERO_JE_RECHTSWEG: Record<Exclude<Rechtsweg, 'zivil' | 'verwaltung'>, {
  kategorie: string; kurzbeschrieb: string; normen: string[];
}> = {
  schkg: {
    kategorie: 'SchKG',
    kurzbeschrieb:
      'Betreibungsort, zuständige Stelle (Betreibungsamt, Gericht oder Aufsichtsbehörde) und Fristen je '
      + 'Anliegen — von der Einleitung der Betreibung bis zur Beschwerde gegen das Amt.',
    normen: ['Art. 46–55 SchKG', 'Art. 84 SchKG', 'Art. 272 SchKG', 'Art. 17 SchKG'],
  },
  straf: {
    kategorie: 'Strafprozess',
    kurzbeschrieb:
      'Örtlicher Gerichtsstand und zuständige Strafbehörde (Art. 31–42 StPO), Anzeige-Fahrplan sowie das '
      + 'statthafte Rechtsmittel mit Fristen (Art. 379 ff. StPO).',
    normen: ['Art. 31–42 StPO', 'Art. 301 StPO', 'Art. 379 ff. StPO'],
  },
};

export function RechnerZustaendigkeit() {
  const calc = getCalculator('zustaendigkeit')!;
  const [rechtsweg, setRechtsweg] = useState<Rechtsweg>('zivil');
  const hero = rechtsweg === 'schkg' || rechtsweg === 'straf' ? HERO_JE_RECHTSWEG[rechtsweg] : null;
  return (
    <div className="space-y-6">
      <RechnerKopf
        calc={calc}
        kategorieOverride={hero?.kategorie}
        kurzbeschriebOverride={hero?.kurzbeschrieb}
        normenOverride={hero?.normen}
      />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        <ZustaendigkeitForm onRechtswegChange={setRechtsweg} />
      </div>
    </div>
  );
}
