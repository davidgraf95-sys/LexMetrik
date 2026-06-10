import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AllgemeineFristForm } from '../components/forms/AllgemeineFristForm';
import { ZpoFristenForm } from '../components/forms/ZpoFristenForm';
import { SchkgFristenForm } from '../components/forms/SchkgFristenForm';
import { RechnerKopf } from '../components/layout/RechnerKopf';
import { Tabs } from '../components/ui/Tabs';
import { getCalculator } from '../lib/calculators';
import { presetSuche, type PresetIndexEintrag } from '../lib/presetIndex';

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
  const { hash, search } = useLocation();
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
  // FE-2 (FAHRPLAN-FRISTEN-EINHEIT): geführte Regime-Frage. Die Weiche
  // FRAGT, sie rät nicht (§2 — keine Erkennung aus Freitext); die Tabs
  // bleiben als Profi-Schnellzugriff, der URL-Hash unverändert.
  const [weicheOffen, setWeicheOffen] = useState(false);
  const weicheWahl = (v: Verfahren) => {
    setWeicheOffen(false);
    wechsle(v);
  };
  // FE-3: EIN Preset-Katalog über alle Regimes (lib/presetIndex.ts) — die
  // Wahl setzt Regime-Tab UND Parameter (Link-Kodierung der Ziel-Form, §5);
  // die Form remountet über den search-Key und hydratisiert daraus.
  const [presetQuery, setPresetQuery] = useState('');
  const treffer = presetSuche(presetQuery);
  const waehlePreset = (e: PresetIndexEintrag) => {
    setPresetQuery('');
    setVerfahren(e.regime);
    navigate({ search: e.query, hash: e.hash }, { replace: true });
  };

  return (
    <div className="space-y-6">
      <RechnerKopf calc={calc} />
      <div className="bg-surface-raised rounded-2xl border border-line p-6 sm:p-8">
        {/* FE-3: Preset-Suche über alle Regimes */}
        <div className="space-y-1.5 mb-5">
          <label htmlFor="preset-suche" className="lc-overline block">
            Frist suchen (alle Verfahren)
          </label>
          <input id="preset-suche" type="search" value={presetQuery}
            onChange={(e) => setPresetQuery(e.target.value)}
            placeholder="z. B. «Berufung», «Rechtsvorschlag», «Art. 256c ZGB»"
            autoComplete="off"
            className="w-full max-w-xl h-10 px-3 rounded-lg border border-line bg-surface text-body-s text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brass-400" />
          {presetQuery.trim() !== '' && (
            treffer.length === 0 ? (
              <p className="text-body-s text-ink-500 max-w-reading">
                Kein Preset gefunden – Frist manuell eingeben oder die Spezialrechner
                der Fristen-Kategorie prüfen (Verjährung, Arbeits-/Mietkündigung, …).
              </p>
            ) : (
              <ul className="border border-line rounded-lg divide-y divide-line bg-surface max-w-xl overflow-hidden">
                {treffer.map((e) => (
                  <li key={e.key}>
                    <button type="button" onClick={() => waehlePreset(e)}
                      className="w-full text-left px-3 py-2 flex items-baseline justify-between gap-3 hover:bg-brass-100/40 transition-colors">
                      <span className="min-w-0">
                        <span className="block text-body-s font-medium text-ink-900 leading-snug">{e.label}</span>
                        {e.norm !== '' && <span className="block text-xs text-ink-500">{e.norm}</span>}
                      </span>
                      <span className="text-xs text-ink-500 whitespace-nowrap shrink-0">{e.regimeLabel}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
        <div className="space-y-1.5">
          <p className="lc-overline">In welchem Verfahren läuft die Frist?</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <Tabs items={VERFAHREN} value={verfahren} onChange={wechsle}
              ariaLabel="Verfahrensart wählen" />
            <button type="button" onClick={() => setWeicheOffen((o) => !o)}
              aria-expanded={weicheOffen}
              className="text-body-s font-medium text-brass-700 hover:text-brass-600 transition-colors">
              Weiss nicht?
            </button>
          </div>
          {weicheOffen && (
            <div className="lc-notice space-y-2 !mt-3">
              <p className="text-body-s text-ink-600 max-w-reading">
                Drei Fragen führen zum Regime – die Wahl bleibt bei Ihnen:
              </p>
              <ol className="space-y-1.5 text-body-s text-ink-600 list-decimal pl-5 max-w-reading">
                <li>
                  Hat ein <span className="font-medium text-ink-900">Gericht oder die ZPO</span> die
                  Frist gesetzt (Klage, Stellungnahme, Berufung, Vorschuss)?{' '}
                  <button type="button" onClick={() => weicheWahl('zpo')}
                    className="font-medium text-brass-700 hover:text-brass-600 whitespace-nowrap">
                    → Zivilprozess (ZPO)
                  </button>
                </li>
                <li>
                  Geht es um eine <span className="font-medium text-ink-900">Betreibungshandlung</span> (Zahlungsbefehl,
                  Rechtsvorschlag, Fortsetzung, Konkursandrohung)?{' '}
                  <button type="button" onClick={() => weicheWahl('schkg')}
                    className="font-medium text-brass-700 hover:text-brass-600 whitespace-nowrap">
                    → Betreibung (SchKG)
                  </button>
                </li>
                <li>
                  Sonst – Vertrags- oder Gesetzesfrist ausserhalb eines solchen Verfahrens:{' '}
                  <button type="button" onClick={() => weicheWahl('allgemein')}
                    className="font-medium text-brass-700 hover:text-brass-600 whitespace-nowrap">
                    → Allgemein (Vertrag/OR)
                  </button>{' '}
                  <span className="text-ink-500">– rechnet ohne Gerichtsferien; die Warnungen im
                  Ergebnis gelten unverändert.</span>
                </li>
              </ol>
            </div>
          )}
          <p className="text-micro text-ink-500">
            {verfahren === 'allgemein' && 'Vertrags- und Verwirkungsfristen nach OR/ZGB – ohne Gerichtsferien; inkl. Rückwärtsrechnung, Tage-zwischen, Zustell-Helfer und Kalenderexport.'}
            {verfahren === 'zpo' && 'Gerichtliche und gesetzliche Fristen mit Stillstand (Art. 145 ZPO), kantonalen Feiertagen und Zustellungsregeln.'}
            {verfahren === 'schkg' && 'Betreibungsferien und Rechtsstillstand (Art. 56 ff. SchKG) – getrennt vom ZPO-Stillstand gerechnet.'}
          </p>
        </div>
        {/* search-Key: Preset-Wahl ändert die Query → Remount → die Form
            hydratisiert aus der URL (dieselbe Mechanik wie Prefill-Brücken). */}
        {verfahren === 'allgemein' && <AllgemeineFristForm key={search} />}
        {verfahren === 'zpo' && <ZpoFristenForm key={search} />}
        {verfahren === 'schkg' && <SchkgFristenForm key={search} />}
      </div>
    </div>
  );
}
