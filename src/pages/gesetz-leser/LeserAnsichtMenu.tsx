// ─── «Ansicht»-Dropdown im Reader-Kopf (W2·5d U-KOPF/A4) — UI zu leserOptionen.ts ─
//
// David 5.7.2026 (A4): «der kopf … soll funktionaler ausgestaltet werden. also
// die darstellungsoptionen (fussnoten linien verweise) sollen im kopf sein mit
// drop down menu.» Die frühere G2a-Chip-Leiste entfällt und geht in EIN «Ansicht»-
// Dropdown im aktionen-Slot des ErlassLeserKopf auf. Es enthält genau die drei
// Switches Linien/Fussnoten/Verweise (§3.1: keine Wucherung).
//
// A11y (ehrliche Disclosure, NICHT role=menu): Switches sind Formular-Steuerelemente,
// kein Menü — ein role=menu verspräche eine Pfeiltasten-Bedienung, die es nicht
// gibt (dieselbe Lehre wie SprachUmschalter). Der Trigger trägt aria-expanded +
// aria-controls; das Panel ist eine role="group" mit aria-label. Fokus-Falle,
// Escape-Schliessen und Fokus-Rückgabe an den Auslöser übernimmt `useDialogFokus`
// (ARIA-Dialog-Muster); ein zusätzlicher pointerdown-Ausserhalb-Handler schliesst
// beim Klick daneben. Persistenz-/Pre-Paint-Mechanik (localStorage, data-* am
// <html>) bleibt unverändert DARUNTER (leserOptionen.ts) — das Dropdown ist reine
// Bedien-Oberfläche, Umschalten rendert nur die Switches neu, nie den Normtext (§15).

import { useEffect, useId, useRef, useState } from 'react';
import { useDialogFokus } from '../../components/layout/useDialogFokus';
import { setzeOption, useLeserOptionen, type OptFeld } from './leserOptionen';

function OptSwitch({ feld, an, label, titel }: {
  feld: OptFeld;
  an: boolean;
  label: string;
  titel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={an}
      title={titel}
      onClick={() => setzeOption(feld, an ? 'aus' : 'an')}
      className={`flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-body-s transition-colors hover:bg-brass-100/40 ${
        an ? 'text-ink-900' : 'text-ink-600'
      }`}
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={`shrink-0 inline-flex items-center gap-1 text-xs ${an ? 'text-brass-700' : 'text-ink-400'}`}
      >
        {an ? '✓' : '○'} {an ? 'an' : 'aus'}
      </span>
    </button>
  );
}

/** Das «Ansicht»-Dropdown. `zeigeLinien` blendet den Linien-Schalter aus, wo es
 *  keine Gliederungs-Sektion mit Guide gibt (flache Artikelliste) — er wäre sonst
 *  wirkungslos (§2.2④). `linienAutoAn` = ob im AUFBAU-abhängigen Default-Zustand
 *  ('auto', U-LINIEN/A8) der Guide für DIESEN Erlass sichtbar ist, damit der
 *  Schalter den EFFEKTIVEN Zustand ehrlich zeigt (§8). */
export function LeserAnsichtMenu({ zeigeLinien, linienAutoAn = false }: { zeigeLinien: boolean; linienAutoAn?: boolean }) {
  const opt = useLeserOptionen();
  const [offen, setOffen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Fokus-Falle + Escape + Fokus-Rückgabe an den Auslöser (ARIA-Dialog-Muster).
  useDialogFokus(offen, panelRef, () => setOffen(false));

  // Klick ausserhalb (Trigger + Panel) schliesst.
  useEffect(() => {
    if (!offen) return;
    const klick = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOffen(false);
    };
    document.addEventListener('pointerdown', klick);
    return () => document.removeEventListener('pointerdown', klick);
  }, [offen]);

  // Effektiver Linien-Zustand: expliziter Nutzer-Wunsch schlägt den Aufbau-Default;
  // im Default 'auto' folgt er dem Aufbau (linienAutoAn).
  const linienEffektivAn = opt.linien === 'an' || (opt.linien === 'auto' && linienAutoAn);

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOffen((o) => !o)}
        aria-expanded={offen}
        aria-controls={panelId}
        className="lc-chip inline-flex items-center gap-1 hover:text-brass-700"
        title="Darstellung: Linien, Fussnoten, Verweise"
      >
        <span aria-hidden>◧</span>Ansicht
        <span aria-hidden className={`transition-transform ${offen ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {offen && (
        <div
          ref={panelRef}
          id={panelId}
          tabIndex={-1}
          role="group"
          aria-label="Darstellungsoptionen"
          className="absolute left-0 top-full z-40 mt-1.5 flex w-[13rem] max-w-[calc(100vw-2rem)] flex-col gap-0.5 rounded-lg border border-line bg-paper-raised p-1.5 shadow-lg"
        >
          <p className="lc-overline px-2.5 pb-1 pt-0.5">Darstellung</p>
          {zeigeLinien && (
            <OptSwitch
              feld="linien"
              an={linienEffektivAn}
              label="Linien"
              titel="Gliederungslinien und Einzug ein- oder ausblenden"
            />
          )}
          <OptSwitch
            feld="fussnoten"
            an={opt.fussnoten === 'an'}
            label="Fussnoten"
            titel="Fussnoten ein- oder ausblenden — AUS lässt Marker und Apparat verschwinden (der Normtext bleibt durchsuchbar)"
          />
          <OptSwitch
            feld="verweise"
            an={opt.verweise === 'an'}
            label="Verweise"
            titel="Verweis-Links unterstreichen oder schlicht darstellen (der Link bleibt aktiv)"
          />
        </div>
      )}
    </div>
  );
}
