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

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useDialogFokus } from '../../components/layout/useDialogFokus';
import {
  setzeOption, setzeZeitraum, useLeserOptionen, useLeitfallZeitraum,
  type OptFeld, type LeitfallZeitraum,
} from './leserOptionen';

function OptSwitch({ feld, an, label, titel, ariaLabel, zusatz }: {
  feld: OptFeld;
  an: boolean;
  label: string;
  titel: string;
  /** Expliziter Accessible-Name (überschreibt den Text — z. B. «Fussnoten (12)»). */
  ariaLabel?: string;
  /** Kleines Zusatz-Signal rechts vom Label (z. B. der Fussnoten-Zähler N). */
  zusatz?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={an}
      aria-label={ariaLabel}
      title={titel}
      onClick={() => setzeOption(feld, an ? 'aus' : 'an')}
      className={`flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-body-s transition-colors hover:bg-brass-100/40 ${
        an ? 'text-ink-900' : 'text-ink-600'
      }`}
    >
      <span className="inline-flex items-center gap-1.5">{label}{zusatz}</span>
      <span
        aria-hidden
        className={`shrink-0 inline-flex items-center gap-1 text-xs ${an ? 'text-brass-700' : 'text-ink-400'}`}
      >
        {an ? '✓' : '○'} {an ? 'an' : 'aus'}
      </span>
    </button>
  );
}

/** V2·B-2: Zeitraum-Wahl für die Leitfälle («alle · 20 · 10 · 5 J.»). Kein `role=
 *  menu`/`radiogroup` (die versprächen Pfeiltasten-Bedienung, die es nicht gibt —
 *  dieselbe Ehrlichkeits-Lehre wie das Dropdown selbst): eine `role="group"` mit
 *  einzeln Tab-fokussierbaren Buttons, jeder trägt `aria-pressed` für den aktiven
 *  Stand. Umschalten setzt den JS-Filterwert (setzeZeitraum) — kein Normtext-Re-
 *  Render, nur die Leitfall-Zeilen (Primitiv-Selektor). */
function ZeitraumWahl() {
  const zeitraum = useLeitfallZeitraum();
  const stufen: readonly [LeitfallZeitraum, string][] = [
    ['alle', 'alle'], ['20', '20 J.'], ['10', '10 J.'], ['5', '5 J.'],
  ];
  return (
    <div role="group" aria-label="Zeitraum der Entscheide" className="flex flex-wrap items-center gap-1 px-2.5 pt-1.5 pb-0.5">
      <span className="lc-overline mr-1">Zeitraum</span>
      {stufen.map(([wert, label]) => {
        const aktiv = zeitraum === wert;
        return (
          <button
            key={wert}
            type="button"
            aria-pressed={aktiv}
            onClick={() => setzeZeitraum(wert)}
            title={wert === 'alle' ? 'Alle Entscheide zeigen' : `Nur Entscheide der letzten ${wert} Jahre`}
            className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
              aktiv ? 'bg-brass-100/60 font-medium text-ink-900' : 'text-ink-500 hover:bg-brass-100/40'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Das «Ansicht»-Dropdown. `zeigeLinien` blendet den Linien-Schalter aus, wo es
 *  keine Gliederungs-Sektion mit Guide gibt (flache Artikelliste) — er wäre sonst
 *  wirkungslos (§2.2④). `linienAutoAn` = ob im AUFBAU-abhängigen Default-Zustand
 *  ('auto', U-LINIEN/A8) der Guide für DIESEN Erlass sichtbar ist, damit der
 *  Schalter den EFFEKTIVEN Zustand ehrlich zeigt (§8).
 *
 *  A26 (David 11.7.2026): das Dropdown lebt in der IMMER sichtbaren Positions-/
 *  Kontextleiste (Inhalts-Kopf `Gesetze › Bund › ZPO … Stand … ✕`), damit die
 *  Darstellungsoptionen jederzeit erreichbar sind, während man im Gesetz ist —
 *  nicht nur oben im weggescrollten Erlass-Kopf. Der frühere separate Fussnoten-
 *  Chip (V2·K-2) ist als EINTRAG in dieses Menü gewandert (`fussnotenAnzahl` =
 *  Zähler N am «Fussnoten»-Schalter). `fussnotenAnzahl===null` ⇒ Sidecar noch
 *  nicht geladen ⇒ Zähler erscheint erst danach; da er in einem geschlossenen,
 *  absolut positionierten Panel steckt, wächst im sichtbaren Kopf keine Zahl nach
 *  (CLS 0). */
export function LeserAnsichtMenu({ zeigeLinien, linienAutoAn = false, fussnotenAnzahl = null }: { zeigeLinien: boolean; linienAutoAn?: boolean; fussnotenAnzahl?: number | null }) {
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
        aria-label="Ansicht"
        className="lc-chip inline-flex items-center gap-1 hover:text-brass-700"
        title="Darstellung: Linien, Fussnoten, Verweise, Entscheide (mit Zeitraum)"
      >
        {/* Enger Platz in der Sticky-Positionsleiste (@390): Label nur ≥sm, sonst
            reines Icon (Accessible-Name bleibt über aria-label «Ansicht» erhalten). */}
        <span aria-hidden>◧</span><span className="hidden sm:inline">Ansicht</span>
        <span aria-hidden className={`transition-transform ${offen ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {offen && (
        <div
          ref={panelRef}
          id={panelId}
          tabIndex={-1}
          role="group"
          aria-label="Darstellungsoptionen"
          className="absolute right-0 top-full z-40 mt-1.5 flex w-[13rem] max-w-[calc(100vw-2rem)] flex-col gap-0.5 rounded-lg border border-line bg-paper-raised p-1.5 shadow-lg"
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
          {/* A26 (David 11.7.2026): der frühere separate Fussnoten-Chip ist hier als
              Eintrag aufgegangen — der Zähler N (Sidecar) sitzt als dezentes Signal
              rechts vom Label; der Schalter bleibt derselbe `fussnoten`-Toggle. Kein
              Sprung-zum-Apparat mehr (das Menü ist jetzt DAUERHAFT erreichbar, also
              kann der Klick von überall im Erlass kommen — ein Sprung an den ersten
              Marker wäre desorientierend; Ein-/Ausblenden geschieht an Ort). */}
          <OptSwitch
            feld="fussnoten"
            an={opt.fussnoten === 'an'}
            label="Fussnoten"
            ariaLabel={fussnotenAnzahl != null && fussnotenAnzahl > 0 ? `Fussnoten (${fussnotenAnzahl})` : undefined}
            zusatz={fussnotenAnzahl != null && fussnotenAnzahl > 0
              ? <span aria-hidden className="num tabular-nums rounded bg-brass-100/60 px-1 text-micro font-medium text-ink-600">{fussnotenAnzahl}</span>
              : undefined}
            titel="Fussnoten ein- oder ausblenden — AUS lässt Marker und Apparat verschwinden (der Normtext bleibt durchsuchbar)"
          />
          <OptSwitch
            feld="verweise"
            an={opt.verweise === 'an'}
            label="Verweise"
            titel="Verweis-Links unterstreichen oder schlicht darstellen (der Link bleibt aktiv)"
          />
          {/* V2·B-1 (David 10.7.2026): 4. Schalter «Entscheide» — blendet die
              verlinkten BGE-Leitfall-Zeilen ein/aus (rein CSS via data-leitfaelle,
              Default AN). B-2: darunter der Zeitraum-Filter, nur wenn Entscheide AN
              (sonst wirkungslos → keine toten Steuerelemente, §13 F4). */}
          <OptSwitch
            feld="leitfaelle"
            an={opt.leitfaelle === 'an'}
            label="Entscheide"
            titel="Verlinkte Bundesgerichts-Leitfälle unter den Artikeln ein- oder ausblenden"
          />
          {opt.leitfaelle === 'an' && <ZeitraumWahl />}
        </div>
      )}
    </div>
  );
}
