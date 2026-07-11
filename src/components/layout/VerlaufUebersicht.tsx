import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useZuletzt } from './useZuletzt';
import { leereZuletzt } from '../../lib/zuletztVerwendet';
import { gruppiereVerlauf } from '../../lib/verlaufGruppen';
import { VerlaufIcon } from './VerlaufIcon';
import { useDialogFokus } from './useDialogFokus';

// ─── «Verlauf»-Übersicht in der Topbar (UI-NAV O1, Schritt 3) ───────────────
//
// Globaler Zugriff auf den lokalen Verlauf: EIN Uhr-Trigger + Flyout mit den
// zuletzt geöffneten Inhalten, chronologisch nach heute/gestern/früher gruppiert,
// je mit Typ-Icon. Speist sich aus DERSELBEN Quelle wie die Startseiten-Chips und
// der ⌘K-Leerzustand (zuletztVerwendet.ts, §5 — kein Parallel-Store). Reine
// Darstellung/Navigation (§3).
//
// §8: der Verlauf liegt NUR auf diesem Gerät (localStorage) — das steht als
// Fusszeile im Panel, kein Server-Verlauf wird vorgetäuscht.
//
// CLIENT-ONLY: der Trigger erscheint erst, wenn `useZuletzt` nach dem Mount einen
// nicht-leeren Verlauf liest (§15.2: Initialstate auf den Server-Zustand [leer]
// gepinnt, Abweichung erst nach Mount — wie ReiterUebersicht). Das Flyout hängt
// per createPortal an <body> und ist beim ersten Render zu.
export function VerlaufUebersicht() {
  const eintraege = useZuletzt();
  const navigate = useNavigate();
  const [panelOffen, setPanelOffen] = useState(false);
  // Bezugs-«jetzt» für die heute/gestern-Gruppierung — beim Öffnen EINMAL
  // festgehalten (Date.now() ist keine Render-Berechnung: react-hooks/purity).
  const [jetzt, setJetzt] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Flyout am Trigger verankert (gleiches Muster wie ReiterUebersicht).
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const positioniere = () => {
    const t = triggerRef.current;
    if (t == null || typeof window === 'undefined') return;
    const r = t.getBoundingClientRect();
    const breite = Math.min(320, window.innerWidth - 16);
    const left = Math.max(8, Math.min(r.right - breite, window.innerWidth - breite - 8));
    setPos({ top: r.bottom + 4, left });
  };

  // Klick ausserhalb (Trigger ODER portaliertes Panel) schliesst das Flyout.
  useEffect(() => {
    if (!panelOffen) return;
    const zu = (e: MouseEvent) => {
      const ziel = e.target as Node;
      if (triggerRef.current?.contains(ziel) || panelRef.current?.contains(ziel)) return;
      setPanelOffen(false);
    };
    document.addEventListener('mousedown', zu);
    return () => document.removeEventListener('mousedown', zu);
  }, [panelOffen]);

  // Position am Trigger nachführen, solange offen (Scroll/Resize).
  useEffect(() => {
    if (!panelOffen) return;
    const neu = () => positioniere();
    window.addEventListener('scroll', neu, true);
    window.addEventListener('resize', neu);
    return () => {
      window.removeEventListener('scroll', neu, true);
      window.removeEventListener('resize', neu);
    };
  }, [panelOffen]);

  // Dialog-Fokus: beim Öffnen INS Panel, Tab darin halten, beim Schliessen zum
  // Trigger zurück (role="dialog"), identisch zur ReiterUebersicht.
  useDialogFokus(panelOffen, panelRef, () => setPanelOffen(false));

  // Verlauf leer → Trigger ausblenden (nichts zu zeigen). Nach dem Mount kann sich
  // das ändern (useZuletzt); das Panel schliesst dann automatisch mit.
  if (eintraege.length < 1) return null;

  // Gruppierung erst beim Öffnen (der `jetzt`-Zeitpunkt wurde im onClick gesetzt;
  // §2 deterministisch: gleiche Eingabe → gleiche Ausgabe).
  const gruppen = panelOffen ? gruppiereVerlauf(eintraege, jetzt) : [];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="lc-btn lc-btn-ghost lc-btn-sm shrink-0 min-h-11 min-w-11"
        aria-haspopup="dialog"
        aria-expanded={panelOffen}
        aria-label="Verlauf – zuletzt geöffnet"
        title="Verlauf (nur auf diesem Gerät)"
        onClick={() => { if (!panelOffen) { positioniere(); setJetzt(Date.now()); } setPanelOffen((v) => !v); }}
      >
        {/* Uhr-mit-Rücklauf-Glyph (Verlauf/History). */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 9a8 8 0 111.2 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M4 5v4h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {panelOffen && pos && createPortal(
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-label="Verlauf – zuletzt geöffnet"
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-40 w-[20rem] max-w-[calc(100vw-1rem)] rounded-lg border border-line bg-paper-raised shadow-lg p-2 max-h-[70vh] overflow-y-auto focus:outline-none"
        >
          {gruppen.map((g) => (
            <div key={g.id} className="mb-1 last:mb-0">
              <p className="lc-overline px-2 pt-1.5 pb-1 text-ink-500">{g.label}</p>
              <ul className="space-y-0.5">
                {g.eintraege.map((e) => (
                  <li key={e.route}>
                    <button
                      type="button"
                      onClick={() => { navigate(e.route); setPanelOffen(false); }}
                      className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-body-s text-ink-700 transition-colors hover:bg-paper-sunken/60 hover:text-brass-700"
                    >
                      <VerlaufIcon typ={e.typ} className="shrink-0 text-ink-500" />
                      <span className="min-w-0 flex-1 truncate">{e.titel}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-1 flex items-center justify-between gap-2 border-t border-line pt-1.5">
            {/* §8: Ehrlichkeit — der Verlauf ist rein lokal. */}
            <span className="px-2 text-micro leading-snug text-ink-500">Nur auf diesem Gerät</span>
            <button
              type="button"
              onClick={() => { leereZuletzt(); setPanelOffen(false); }}
              className="shrink-0 rounded px-2 py-1 text-body-s text-ink-600 transition-colors hover:bg-paper-sunken/60 hover:text-brass-700"
            >
              Verlauf leeren
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
