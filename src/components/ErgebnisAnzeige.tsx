import { useState } from 'react';
import type { Berechnungsergebnis, BerechnungsStatus } from '../types/legal';

// Status-Badges (Design-Doc 5.8): gesichert→sage · umstritten/kein Anspruch→warn · nichtig/unzulässig→danger.
const STATUS_CONFIG: Record<BerechnungsStatus, { label: string; cls: string }> = {
  ok:            { label: 'Gültig',        cls: 'lc-badge-ok' },
  nichtig:       { label: 'NICHTIG',       cls: 'lc-badge-danger' },
  kein_anspruch: { label: 'Kein Anspruch', cls: 'lc-badge-warn' },
  unzulaessig:   { label: 'Unzulässig',    cls: 'lc-badge-danger' },
  ktg_regime:    { label: 'KTG-Regime',    cls: 'lc-chip' },
};

// Domänenneutral – der rechtsgebietsspezifische Disclaimer steht im jeweiligen
// Formular und in der PDF-Konfiguration. Hier darf kein Text eines einzelnen
// Rechtsgebiets stehen (kein Cross-Domain-Bleed am Bildschirm).
const DISCLAIMER =
  'Automatisierte Orientierungsberechnung – keine Rechtsberatung. ' +
  'Massgeblich sind Gesetz, Vertrag und der konkrete Sachverhalt; abweichende Regelungen gehen vor. ' +
  'Norm- und Rechtsprechungsverweise sind im Einzelfall zu prüfen.';

type Props = {
  titel: string;
  ergebnis: Berechnungsergebnis;
};

function ergebnisAlsText(titel: string, e: Berechnungsergebnis): string {
  const z: string[] = [titel, '', e.ergebnis, '', 'Rechenweg:'];
  e.rechenweg.forEach((s, i) => z.push(`${i + 1}. ${s.beschreibung}: ${s.zwischenergebnis}`));
  if (e.normverweise.length) z.push('', 'Normverweise: ' + e.normverweise.map((n) => n.artikel).join(', '));
  if (e.warnungen.length) { z.push('', 'Hinweise / Vorbehalte:'); e.warnungen.forEach((w) => z.push('– ' + w)); }
  z.push('', 'Orientierungsberechnung – keine Rechtsberatung (LegalCalc).');
  return z.join('\n');
}

export function ErgebnisAnzeige({ titel, ergebnis }: Props) {
  const [rechenWegOffen, setRechenWegOffen] = useState(false);
  const [annahmenOffen, setAnnahmenOffen] = useState(false);
  const [warnungenOffen, setWarnungenOffen] = useState(false);
  const [kopiert, setKopiert] = useState(false);
  const cfg = STATUS_CONFIG[ergebnis.status];

  const kopieren = () => {
    navigator.clipboard?.writeText(ergebnisAlsText(titel, ergebnis)).then(
      () => { setKopiert(true); setTimeout(() => setKopiert(false), 2000); },
      () => {},
    );
  };

  return (
    <div className="lc-reveal bg-surface border border-line rounded-lg shadow-md overflow-hidden border-t-[3px] border-t-brass-500">
      {/* Header */}
      <div className="border-b border-line px-6 py-4 flex items-start justify-between gap-3">
        <div>
          <p className="lc-overline">Ergebnis</p>
          <h3 className="text-h3 font-display font-semibold text-ink-900 mt-0.5">{titel}</h3>
        </div>
        <button onClick={kopieren} className="lc-btn-ghost shrink-0" style={{ height: '36px', padding: '0 12px' }}
          aria-label="Ergebnis in die Zwischenablage kopieren">
          {kopiert ? 'Kopiert ✓' : 'Kopieren'}
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Status + Hauptergebnis */}
        <div className="space-y-3">
          <span className={cfg.cls}>{cfg.label}</span>
          <p className="text-ink-900 font-medium text-body-l leading-relaxed num">{ergebnis.ergebnis}</p>
        </div>

        {/* Warnungen / Vorbehalte – einklappbar, um das Ergebnis übersichtlich zu halten */}
        {ergebnis.warnungen.length > 0 && (
          <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--warn-500)' }}>
            <button onClick={() => setWarnungenOffen(!warnungenOffen)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-warn-bg text-left transition-colors">
              <span className="lc-overline text-warn-700">Hinweise / Vorbehalte ({ergebnis.warnungen.length})</span>
              <span className="text-warn-700">{warnungenOffen ? '▲' : '▼'}</span>
            </button>
            {warnungenOffen && (
              <div className="bg-warn-bg px-4 pb-3 space-y-1">
                {ergebnis.warnungen.map((w, i) => <p key={i} className="text-body-s text-warn-700">{w}</p>)}
              </div>
            )}
          </div>
        )}

        {/* Rechenweg (5.6.1) */}
        <div className="border border-line rounded-md overflow-hidden">
          <button
            onClick={() => setRechenWegOffen(!rechenWegOffen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-brass-100 text-left transition-colors"
          >
            <span className="text-body-s font-medium text-ink-700">Rechenweg ({ergebnis.rechenweg.length} Schritte)</span>
            <span className="text-ink-400">{rechenWegOffen ? '▲' : '▼'}</span>
          </button>
          {rechenWegOffen && (
            <div className="divide-y divide-line">
              {ergebnis.rechenweg.map((schritt, i) => (
                <div key={i} className="px-4 py-3 space-y-2">
                  <p className="lc-overline">{schritt.beschreibung}</p>
                  <p className="text-body-s text-ink-700 num">{schritt.zwischenergebnis}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {schritt.normen.map((n, j) => (
                      <span key={j} className="lc-chip">
                        {n.artikel}{n.bemerkung && <span className="opacity-70"> · {n.bemerkung}</span>}
                      </span>
                    ))}
                    {schritt.rechtsprechung?.map((r, j) => (
                      <span key={j} className="lc-badge lc-badge-danger gap-1 font-mono">
                        {r.aktenzeichen}
                        {!r.verifiziert && <span className="font-sans" style={{ fontSize: '10px' }}>· zu verifizieren</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Annahmen */}
        {ergebnis.annahmen.length > 0 && (
          <div className="border border-line rounded-md overflow-hidden">
            <button
              onClick={() => setAnnahmenOffen(!annahmenOffen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-brass-100 text-left transition-colors"
            >
              <span className="text-body-s font-medium text-ink-700">Annahmen ({ergebnis.annahmen.length})</span>
              <span className="text-ink-400">{annahmenOffen ? '▲' : '▼'}</span>
            </button>
            {annahmenOffen && (
              <ul className="px-4 py-3 space-y-1">
                {ergebnis.annahmen.map((a, i) => (
                  <li key={i} className="text-body-s text-ink-600">• {a}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Normverweise */}
        {ergebnis.normverweise.length > 0 && (
          <div>
            <p className="lc-overline mb-2">Normverweise</p>
            <div className="flex flex-wrap gap-1.5">
              {ergebnis.normverweise.map((n, i) => <span key={i} className="lc-chip">{n.artikel}</span>)}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="border-t border-line pt-4">
          <p className="text-body-s text-ink-400 italic leading-relaxed">{DISCLAIMER}</p>
        </div>
      </div>
    </div>
  );
}
