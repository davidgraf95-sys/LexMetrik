import { useEffect, useId, useRef, useState } from 'react';
import { VorschauPanel, ExportLeiste } from './wizard';
import { NormText } from '../NormText';
import { BANNER_MAPPE_FERTIG, type PdfBanner } from '../../lib/vorlagen/banner';
import type { AssembleErgebnis } from '../../lib/vorlagen/engine';
import { NOTARIATE, NOTARIAT_SYSTEM_LABEL, NOTARIAT_FREIZUEGIGKEIT } from '../../lib/notariate';
import { HR_AEMTER, HR_AEMTER_STAND } from '../../data/handelsregisteraemter';
import type { Kanton } from '../../types/legal';

// ─── Geteilter Rahmen der Dokumentmappen (/simplify B1, 7.6.2026) ────────────
// Tabs + ExportLeiste + VorschauPanel, Notariats-Hinweis-Box und Gates-Anzeige
// standen zuvor 3× zeichengleich (GmbH-/AG-Mappe, Kapitalerhöhung). Hier lebt
// NUR Darstellung (§3) und fachneutrale Struktur (§4) — die juristisch
// verschiedenen Banner-TEXTE und sämtliche Formularfelder bleiben bei den
// jeweiligen Konsumenten.

/** «Wo beurkunden?» — Stammdaten lib/notariate.ts (Dossier behoerden/notariate-kantone.md). */
export function NotariatsHinweis({ kanton }: { kanton: string }) {
  const n = NOTARIATE[kanton as Kanton];
  if (!n) return null;
  return (
    <div className="rounded-md bg-surface border border-line p-3 space-y-1">
      <p className="text-body-s text-ink-700">
        <span className="font-medium text-ink-900">Beurkundung im Kanton {kanton}:</span>{' '}
        {NOTARIAT_SYSTEM_LABEL[n.system]} —{' '}
        <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-brass-700 hover:text-brass-600">{n.stelle}</a>
        {!n.urlBelegt && <span className="text-warn-700"> (Angabe ohne Gewähr)</span>}
      </p>
      {n.hinweis && <p className="text-xs text-warn-700"><NormText text={n.hinweis} /></p>}
      <p className="text-xs text-ink-500">{NOTARIAT_FREIZUEGIGKEIT}</p>
    </div>
  );
}

/** «Wo anmelden?» — Stammdaten data/handelsregisteraemter.ts (Dossier
 *  behoerden/handelsregisteraemter-kantone.md; G3.4 verdrahtet 10.6.2026). */
export function HrAmtHinweis({ kanton }: { kanton: string }) {
  const a = HR_AEMTER[kanton as Kanton];
  if (!a) return null;
  return (
    <div className="rounded-md bg-surface border border-line p-3 space-y-1">
      <p className="text-body-s text-ink-700">
        <span className="font-medium text-ink-900">Anmeldung beim Handelsregisteramt ({kanton}):</span>{' '}
        <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-brass-700 hover:text-brass-600">{a.name}</a>
        {`, ${a.strasse}, ${a.plzOrt} · ${a.telefon}`}
      </p>
      {a.hinweis && <p className="text-xs text-ink-500"><NormText text={a.hinweis} /></p>}
      <p className="text-xs text-ink-500">
        {`Massgeblich ist der SITZ-Kanton der Gesellschaft (Art. 927 OR). Stand ${HR_AEMTER_STAND} (amtliche Kantonsseiten; zefix-Abgleich offen) – vor Einreichung kurz gegenprüfen.`}
      </p>
    </div>
  );
}

/** Blocker-Box + Warnungs-Hinweise einer Mappe. */
export function MappenGates({ gates }: { gates: { blocker: string[]; warnungen: string[] } }) {
  return (
    <>
      {gates.blocker.length > 0 && (
        <div className="rounded-md bg-danger-bg p-3 space-y-0.5">
          {gates.blocker.map((b, i) => <p key={i} className="text-body-s text-danger-700">• <NormText text={b} /></p>)}
        </div>
      )}
      {gates.warnungen.map((w, i) => (
        <div key={i} className="lc-notice-warn"><p className="text-body-s"><NormText text={w} /></p></div>
      ))}
    </>
  );
}

export type MappenDokument = { id: string; titel: string; dateiName: string; ergebnis: AssembleErgebnis };

/** Dokument-Tabs + Export + Live-Vorschau (Entwurf-/Fertig-Banner je ausgabeArt). */
export function MappenAnsicht({ dokumente, bannerEntwurf, bannerFertig = BANNER_MAPPE_FERTIG, docxErlaubt, startDokId }: {
  dokumente: MappenDokument[];
  bannerEntwurf: PdfBanner;
  bannerFertig?: PdfBanner;
  docxErlaubt: boolean;
  startDokId?: string;
}) {
  const [aktivesDok, setAktivesDok] = useState<string>(startDokId ?? dokumente[0]?.id ?? '');
  const [kopiert, setKopiert] = useState(false);
  const basisId = useId();
  const dok = dokumente.find((d) => d.id === aktivesDok) ?? dokumente[0];

  // Rücksetz-Timer des «Kopiert ✓»-Häkchens aufräumen (kein vorzeitiges
  // Verschwinden bei Doppel-Kopie, kein setState nach Unmount) — wie useWizardState.
  const kopierTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (kopierTimer.current) clearTimeout(kopierTimer.current); }, []);

  if (!dok) return null;

  const tabId = (id: string) => `${basisId}-tab-${id}`;
  const panelId = `${basisId}-panel`;

  // Clipboard wie useWizardState absichern: Optional-Chaining + then(ok, fail),
  // damit unsicherer Kontext / verweigerte Berechtigung kein Unhandled-Rejection
  // wirft und «Kopiert ✓» nur im Erfolgsfall erscheint (§13/F4).
  const kopieren = (text: string) => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setKopiert(true);
        if (kopierTimer.current) clearTimeout(kopierTimer.current);
        kopierTimer.current = setTimeout(() => setKopiert(false), 1500);
      },
      () => {},
    );
  };

  // APG-Tabs: roving tabindex + Pfeiltasten/Home/End (vgl. ui/Tabs.tsx). Vorher
  // versprach role=tab das Tastaturmodell, ohne es zu liefern.
  const aufTabTaste = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    let ziel: number;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') ziel = (i + 1) % dokumente.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ziel = (i - 1 + dokumente.length) % dokumente.length;
    else if (e.key === 'Home') ziel = 0;
    else if (e.key === 'End') ziel = dokumente.length - 1;
    else return;
    e.preventDefault();
    setAktivesDok(dokumente[ziel].id);
    (e.currentTarget.parentElement?.children[ziel] as HTMLElement | undefined)?.focus();
  };

  const entwurf = dok.ergebnis.dokument.ausgabeArt === 'entwurf';
  const banner = entwurf ? bannerEntwurf : bannerFertig;

  return (
    <>
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Dokumente der Mappe">
        {dokumente.map((d, i) => {
          const aktiv = d.id === dok.id;
          return (
            <button key={d.id} type="button" role="tab" id={tabId(d.id)} aria-selected={aktiv}
              aria-controls={panelId} tabIndex={aktiv ? 0 : -1}
              onClick={() => setAktivesDok(d.id)} onKeyDown={(e) => aufTabTaste(e, i)}
              className={`lc-chip ${aktiv ? 'bg-brass-700 text-paper border-brass-700' : 'hover:text-brass-700'}`}>
              {d.titel}
            </button>
          );
        })}
      </div>
      <ExportLeiste
        ergebnis={dok.ergebnis}
        deaktiviert={false}
        kopiert={kopiert}
        onKopieren={kopieren}
        pdf={{ label: entwurf ? 'Entwurf als PDF' : 'Als PDF', banner, dateiName: `${dok.dateiName}.pdf` }}
        docx={docxErlaubt
          ? { label: entwurf ? 'Entwurf als Word (DOCX)' : 'Als Word (DOCX)', banner, dateiName: `${dok.dateiName}.docx` }
          : undefined}
      />
      <div role="tabpanel" id={panelId} aria-labelledby={tabId(dok.id)} tabIndex={0}>
        <VorschauPanel ergebnis={dok.ergebnis} />
      </div>
    </>
  );
}
