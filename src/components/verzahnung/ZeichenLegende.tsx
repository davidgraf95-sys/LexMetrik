import { useEffect, useId, useRef, useState } from 'react';
import { usePaneSteuerung } from '../layout/usePaneLayout';
import { GLYPH_LEGENDE } from './statusRezept';

// ─── ZeichenLegende — sichtbare Erklärung der Chip-Glyphen (LM-050) ──────────
//
// W2·17-UI-BEFUNDE-B1. An den Entscheid-Chips der Bezüge-Zeile stehen bis zu
// drei unbeschriftete Zeichen (★ hinter der Zitierung, ↻ dahinter, ⧉ daneben).
// aria-label/title tragen die Erklärung zwar bereits — aber `title` ist auf
// Touch tot und nirgends SICHTBAR (Prod-Befund: das Wort «Legende» kommt auf
// /gesetze/bund/OR nicht vor). Dieses Element schliesst genau diese Lücke nach
// dem verbindlichen Muster von FAHRPLAN-VERZAHNUNG-UI §1.7: NICHT nur `title`,
// sondern ein fokussierbarer <button> mit aria-describedby + Klick/Enter-
// Toggle, Escape und Aussenklick schliessen (Mechanik identisch zu Begriff.tsx
// — nicht Begriff selbst, weil das Glossar EINEN Begriff erklärt, hier aber
// eine Zeichen-LISTE steht).
//
// Die Texte kommen aus GLYPH_LEGENDE (statusRezept.ts) — dieselbe Quelle wie
// die aria-label/title der Glyphen selbst (§5, Magic Moment 4: textgleich).
// Der ⧉-Eintrag erscheint NUR, wenn die Nebeneinander-Buttons überhaupt
// gerendert werden (kannOeffnen, ≥lg + freie Pane-Kapazität) — eine Erklärung
// für ein unsichtbares Element wäre eine Fehlversprechung (§8).
//
// Reine Darstellung (§3), nur bestehende Tokens (§13). Kein Listener, solange
// zu (gleiches Sparsamkeits-Muster wie Begriff.tsx, §15.4).
//
// ── WARUM TOGGLETIP (role="status") UND NICHT aria-expanded ─────────────────
// Der B4-Wächter (bezuege-zeile-b4.test.tsx, David-Vorgabe 28.7.2026: die
// Auflistung steht DIREKT da, ohne Aufklapp-Zwischenzustand) verbietet JEDES
// `aria-expanded` im data-bezuege-zeile-Container — der Test bleibt unangetastet
// (§6.3). Die Legende nutzt darum das Toggletip-Muster: Button ohne
// expanded-Zustand + stets vorhandene role="status"-Live-Region, in die der
// Erklärtext beim Öffnen eingesetzt wird. Screenreader bekommen den Inhalt über
// die Live-Region angesagt (a11y-gleichwertig zur describedby-Variante); Touch
// und Tastatur bedienen denselben Button, Escape/Aussenklick schliessen.

export function ZeichenLegende() {
  const { kannOeffnen } = usePaneSteuerung();
  const [offen, setOffen] = useState(false);
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!offen) return;
    const aufTaste = (e: KeyboardEvent) => { if (e.key === 'Escape') setOffen(false); };
    const aufKlick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOffen(false);
    };
    window.addEventListener('keydown', aufTaste);
    window.addEventListener('mousedown', aufKlick);
    return () => {
      window.removeEventListener('keydown', aufTaste);
      window.removeEventListener('mousedown', aufKlick);
    };
  }, [offen]);

  const eintraege = [
    ...GLYPH_LEGENDE,
    // ⧉ ist KEIN Kopiersymbol (Befundtext-Korrektur): es öffnet den Entscheid
    // in einer zweiten Spalte — Wortlaut wie der Button-title in BezuegeZeile.
    ...(kannOeffnen
      ? [{ glyph: '⧉', ton: 'text-ink-500', label: 'Nebeneinander öffnen', erklaerung: 'Öffnet den Entscheid in einer zweiten Spalte neben dem Gesetzestext.' }]
      : []),
  ];

  return (
    <span ref={wrapRef} className="relative inline-block self-start">
      <button
        type="button"
        aria-controls={id}
        onClick={() => setOffen((v) => !v)}
        className="cursor-help text-micro text-ink-500 underline decoration-dotted decoration-ink-300 underline-offset-2 hover:text-brass-700 hover:decoration-brass-500"
      >
        Zeichenerklärung
      </button>
      {/* Live-Region IMMER im DOM (Toggletip-Muster): leer, bis geöffnet wird —
          erst dann trägt sie Karte + Inhalt und wird von Screenreadern angesagt. */}
      <span
        role="status"
        id={id}
        className={offen
          ? 'lc-popover absolute left-0 top-full z-dropdown mt-1 block w-72 max-w-[80vw] p-3 text-left text-body-s font-normal normal-case tracking-normal text-ink-700'
          : undefined}
      >
        {offen && (
          <>
            <span className="lc-overline mb-1 block text-brass-700">Zeichen an den Entscheid-Verweisen</span>
            {eintraege.map((e) => (
              <span key={e.glyph} className="mt-1 block leading-snug">
                <span aria-hidden className={`mr-1.5 ${e.ton}`}>{e.glyph}</span>
                <span className="font-medium">{e.label}</span>
                <span className="block text-ink-600">{e.erklaerung}</span>
              </span>
            ))}
          </>
        )}
      </span>
    </span>
  );
}
