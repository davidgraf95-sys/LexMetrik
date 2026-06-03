import { useState } from 'react';
import type { Berechnungsergebnis, BerechnungsStatus } from '../types/legal';

const STATUS_CONFIG: Record<BerechnungsStatus, { label: string; cls: string }> = {
  ok:           { label: 'Gültig',              cls: 'bg-green-100 text-green-800 border-green-300' },
  nichtig:      { label: 'NICHTIG',             cls: 'bg-red-100 text-red-800 border-red-300' },
  kein_anspruch:{ label: 'Kein Anspruch',       cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  unzulaessig:  { label: 'Unzulässig',          cls: 'bg-red-100 text-red-800 border-red-300' },
  ktg_regime:   { label: 'KTG-Regime',          cls: 'bg-blue-100 text-blue-800 border-blue-300' },
};

const DISCLAIMER =
  'Automatisierte Orientierungsberechnung, keine Rechtsberatung. ' +
  'Abweichende GAV-/Vertrags-/Versicherungslösungen, der genaue Sachverhalt sowie alle ' +
  'Norm- und Rechtsprechungsverweise sind im Einzelfall zu prüfen. Die ' +
  'Lohnfortzahlungsskalen sind Gerichtspraxis und vor Produktiveinsatz gegen die ' +
  'aktuelle kantonale Praxis abzugleichen.';

type Props = {
  titel: string;
  ergebnis: Berechnungsergebnis;
};

export function ErgebnisAnzeige({ titel, ergebnis }: Props) {
  const [rechenWegOffen, setRechenWegOffen] = useState(false);
  const [annahmenOffen, setAnnahmenOffen] = useState(false);
  const cfg = STATUS_CONFIG[ergebnis.status];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-700">{titel}</h3>
      </div>

      <div className="p-6 space-y-5">
        {/* Status + Hauptergebnis */}
        <div className="space-y-3">
          <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full border ${cfg.cls}`}>
            {cfg.label}
          </span>
          <p className="text-slate-900 font-medium text-base leading-relaxed">
            {ergebnis.ergebnis}
          </p>
        </div>

        {/* Warnungen */}
        {ergebnis.warnungen.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-1">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Hinweise / Vorbehalte</p>
            {ergebnis.warnungen.map((w, i) => (
              <p key={i} className="text-sm text-amber-800">⚠ {w}</p>
            ))}
          </div>
        )}

        {/* Rechenweg */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setRechenWegOffen(!rechenWegOffen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
          >
            <span className="text-sm font-medium text-slate-700">Rechenweg ({ergebnis.rechenweg.length} Schritte)</span>
            <span className="text-slate-400 text-lg">{rechenWegOffen ? '▲' : '▼'}</span>
          </button>
          {rechenWegOffen && (
            <div className="divide-y divide-slate-100">
              {ergebnis.rechenweg.map((schritt, i) => (
                <div key={i} className="px-4 py-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{schritt.beschreibung}</p>
                  <p className="text-sm text-slate-800">{schritt.zwischenergebnis}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {schritt.normen.map((n, j) => (
                      <span key={j} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono">
                        {n.artikel}
                        {n.bemerkung && <span className="text-blue-500"> · {n.bemerkung}</span>}
                      </span>
                    ))}
                    {schritt.rechtsprechung?.map((r, j) => (
                      <span key={j} className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                        {r.aktenzeichen}
                        {!r.verifiziert && (
                          <span className="bg-orange-200 text-orange-800 text-[10px] px-1 rounded font-sans">zu verifizieren</span>
                        )}
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
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setAnnahmenOffen(!annahmenOffen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
            >
              <span className="text-sm font-medium text-slate-700">Annahmen ({ergebnis.annahmen.length})</span>
              <span className="text-slate-400 text-lg">{annahmenOffen ? '▲' : '▼'}</span>
            </button>
            {annahmenOffen && (
              <ul className="px-4 py-3 space-y-1">
                {ergebnis.annahmen.map((a, i) => (
                  <li key={i} className="text-sm text-slate-600">• {a}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Normverweise */}
        {ergebnis.normverweise.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Normverweise</p>
            <div className="flex flex-wrap gap-1.5">
              {ergebnis.normverweise.map((n, i) => (
                <span key={i} className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded font-mono">
                  {n.artikel}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400 italic leading-relaxed">{DISCLAIMER}</p>
        </div>
      </div>
    </div>
  );
}
