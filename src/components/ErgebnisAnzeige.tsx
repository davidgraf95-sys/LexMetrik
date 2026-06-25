import { useState } from 'react';
import type { Berechnungsergebnis, BerechnungsStatus } from '../types/legal';
import { sansAmp } from './typografie';
import { RechtsprechungAnker } from './RechtsprechungLink';
import { NormText } from './NormText';
// FAHRPLAN-DESIGN 2.6: lokaler NormChip entfernt — NormLink (vorlagen/ui)
// ist die EINE Fedlex-Chip-Komponente (deckt «bemerkung» jetzt mit ab).
import { NormLink } from './vorlagen/ui';

// Status-Badges (Design-Doc 5.8): gesichert→sage · umstritten/kein Anspruch→warn · nichtig/unzulässig→danger.
// «verdikt» färbt den Hauptsatz (Design-Review 6.6.2026): ok bleibt neutrale
// Tinte (das positive Signal trägt das sage-Badge), Problem-Status färben.
// «hint» präzisiert das knappe Badge-Wort per Tooltip (nur wo mehrdeutig).
const STATUS_CONFIG: Record<BerechnungsStatus, { label: string; cls: string; verdikt: string; hint?: string }> = {
  ok:            { label: 'Gültig',        cls: 'lc-badge lc-badge-ok',     verdikt: 'text-ink-900',
                   hint: 'Die Berechnung ergibt keinen Gültigkeits-Vorbehalt – Hinweise und Annahmen unten beachten.' },
  nichtig:       { label: 'NICHTIG',       cls: 'lc-badge lc-badge-danger', verdikt: 'text-danger-700' },
  kein_anspruch: { label: 'Kein Anspruch', cls: 'lc-badge lc-badge-warn',   verdikt: 'text-warn-700' },
  unzulaessig:   { label: 'Unzulässig',    cls: 'lc-badge lc-badge-danger', verdikt: 'text-danger-700' },
  ktg_regime:    { label: 'KTG-Regime',    cls: 'lc-chip',                  verdikt: 'text-ink-900' },
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
  z.push('', 'Orientierungsberechnung – keine Rechtsberatung (LexMetrik).');
  return z.join('\n');
}

export function ErgebnisAnzeige({ titel, ergebnis }: Props) {
  const [rechenWegOffen, setRechenWegOffen] = useState(false);
  const [annahmenOffen, setAnnahmenOffen] = useState(false);
  // UX-Programm A6: Bei nicht-«ok»-Status sind die Vorbehalte das Wichtigste →
  // standardmässig offen (Lazy-Init; Live-Neuberechnungen lassen die manuelle
  // Wahl des Nutzers unangetastet).
  const [warnungenOffen, setWarnungenOffen] = useState(() => ergebnis.status !== 'ok');
  const [kopiert, setKopiert] = useState(false);
  const cfg = STATUS_CONFIG[ergebnis.status];

  const kopieren = () => {
    navigator.clipboard?.writeText(ergebnisAlsText(titel, ergebnis)).then(
      () => { setKopiert(true); setTimeout(() => setKopiert(false), 2000); },
      () => {},
    );
  };

  return (
    // Einblendung + aria-live trägt der umgebende ErgebnisBlock (R4) — eine
    // Live-Region pro Ergebnis statt zwei verschachtelter (D3, 11.6.2026);
    // Screenreader erfahren von Live-Neuberechnungen weiterhin (UX C7).
    <div>
      {/* Messing-Akzentlinie als Ablesekante über dem Readout */}
      <div className="scale-rule" aria-hidden />
      <div className="bg-surface border border-line rounded-b-lg rounded-t-none shadow-md overflow-hidden">
      {/* Header */}
      <div className="border-b border-line px-6 py-4 flex items-start justify-between gap-3">
        <div>
          <p className="lc-overline">Ergebnis</p>
          <h3 className="text-h3 font-display font-semibold text-ink-900 mt-0.5">{sansAmp(titel)}</h3>
        </div>
        <button type="button" onClick={kopieren} className="lc-btn-ghost lc-btn-sm shrink-0"
          aria-label="Ergebnis in die Zwischenablage kopieren">
          {kopiert ? 'Kopiert ✓' : 'Kopieren'}
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Status + Hauptergebnis — das Verdikt ist der typografische Peak
            des Blocks (Display-Schnitt statt Mono-Zeile, Design-Review
            6.6.2026); Tabellenziffern bleiben für Daten im Satz erhalten. */}
        <div className="space-y-3">
          <span className={cfg.cls} title={cfg.hint}>{cfg.label}</span>
          <p className={`font-display font-semibold text-h3 leading-snug ${cfg.verdikt}`}
            style={{ fontVariantNumeric: 'lining-nums tabular-nums' }}>
            {ergebnis.ergebnis}
          </p>
        </div>

        {/* Warnungen / Vorbehalte – einklappbar, um das Ergebnis übersichtlich zu halten */}
        {ergebnis.warnungen.length > 0 && (
          <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--warn-500)' }}>
            <button type="button" onClick={() => setWarnungenOffen(!warnungenOffen)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-warn-bg text-left transition-colors">
              <span className="lc-overline text-warn-700">Hinweise / Vorbehalte ({ergebnis.warnungen.length})</span>
              <span className="text-warn-700">{warnungenOffen ? '▲' : '▼'}</span>
            </button>
            {warnungenOffen && (
              <div className="bg-warn-bg px-4 pb-3 space-y-1">
                {/* Norm- UND Entscheid-Zitate in Warnungen verlinkt (Web-Anzeige; Text unverändert) */}
                {ergebnis.warnungen.map((w, i) => <p key={i} className="text-body-s text-warn-700"><NormText text={w} /></p>)}
              </div>
            )}
          </div>
        )}

        {/* Rechenweg (5.6.1) — geöffnet trägt der Block einen Messing-Tick
            (FAHRPLAN-DESIGN 5.7: Marken-Element am täglichsten Interaktionspunkt) */}
        <div className={`border border-line rounded-md overflow-hidden ${rechenWegOffen ? 'border-l-2 border-l-brass-500' : ''}`}>
          <button type="button"
            onClick={() => setRechenWegOffen(!rechenWegOffen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-brass-100 text-left transition-colors"
          >
            <span className="text-body-s font-medium text-ink-700">Rechenweg ({ergebnis.rechenweg.length} Schritte)</span>
            <span className="text-ink-500">{rechenWegOffen ? '▲' : '▼'}</span>
          </button>
          {rechenWegOffen && (
            <div className="divide-y divide-line">
              {ergebnis.rechenweg.map((schritt, i) => (
                <div key={i} className="px-4 py-3 space-y-2">
                  <p className="lc-overline">{schritt.beschreibung}</p>
                  <p className="text-body-s text-ink-700 num">{schritt.zwischenergebnis}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {schritt.normen.map((n, j) => (
                      <NormLink key={j} artikel={n.artikel} bemerkung={n.bemerkung} />
                    ))}
                    {schritt.rechtsprechung?.map((r, j) => (
                      /* Aktenzeichen → amtlicher bger.ch-Link (Auftrag David 6.6.2026);
                         der Verifikations-Vorbehalt (§8) bleibt unverändert sichtbar */
                      <span key={j} className="lc-badge lc-badge-danger gap-1 font-mono">
                        <RechtsprechungAnker aktenzeichen={r.aktenzeichen}
                          className="no-underline hover:underline" />
                        {!r.verifiziert && <span className="font-sans text-micro">· zu verifizieren</span>}
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
          <div className={`border border-line rounded-md overflow-hidden ${annahmenOffen ? 'border-l-2 border-l-brass-500' : ''}`}>
            <button type="button"
              onClick={() => setAnnahmenOffen(!annahmenOffen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-brass-100 text-left transition-colors"
            >
              <span className="text-body-s font-medium text-ink-700">Annahmen ({ergebnis.annahmen.length})</span>
              <span className="text-ink-500">{annahmenOffen ? '▲' : '▼'}</span>
            </button>
            {annahmenOffen && (
              <ul className="px-4 py-3 space-y-1">
                {ergebnis.annahmen.map((a, i) => (
                  <li key={i} className="text-body-s text-ink-600">• <NormText text={a} /></li>
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
              {ergebnis.normverweise.map((n, i) => <NormLink key={i} artikel={n.artikel} />)}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="border-t border-line pt-4">
          <p className="text-body-s text-ink-500 italic leading-relaxed">{DISCLAIMER}</p>
        </div>
      </div>
      </div>
    </div>
  );
}
