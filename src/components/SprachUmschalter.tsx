import { useEffect, useRef, useState } from 'react';
import { LOCALES, useLocale } from './locale';

// Sprachumschalter (Topbar, dezent): de aktiv; en/fr/it funktional, aber
// transparent als «in Bearbeitung» gekennzeichnet (gedämpfte Optik wie
// «In Vorbereitung» im Katalog). Keine maschinelle Übersetzung.

export function SprachUmschalter() {
  const { locale, setLocale } = useLocale();
  const [offen, setOffen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!offen) return;
    const klick = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOffen(false);
    };
    // Escape schliesst und gibt den Fokus an den Auslöser zurück (E13 A11y).
    const taste = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOffen(false); triggerRef.current?.focus(); } };
    document.addEventListener('pointerdown', klick);
    document.addEventListener('keydown', taste);
    return () => {
      document.removeEventListener('pointerdown', klick);
      document.removeEventListener('keydown', taste);
    };
  }, [offen]);

  // Ehrliche Disclosure statt role=menu (E13): das Menü-Muster versprach eine
  // Pfeiltasten-Bedienung, die es nie gab. Jetzt eine schlichte aufklappbare
  // Gruppe normaler Buttons (Tab-Reihenfolge, Escape, Fokus-Rückgabe), der
  // aktive Eintrag wird beim Öffnen fokussiert.
  return (
    <div ref={ref} className="relative">
      <button ref={triggerRef} type="button" onClick={() => setOffen((o) => !o)}
        aria-expanded={offen} aria-label="Sprache wählen"
        className="inline-flex items-center gap-1 h-11 min-w-11 justify-center px-2.5 rounded-lg border border-line bg-surface num text-xs text-ink-600 hover:text-ink-900 hover:border-brass-400 transition-colors uppercase">
        {locale}
        <span aria-hidden className={`text-ink-500 transition-transform ${offen ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {offen && (
        <div role="group" aria-label="Sprache wählen" className="lc-schwebeflaeche absolute right-0 top-full mt-1.5 w-56 p-1 z-dropdown">
          {LOCALES.map((l) => {
            const aktiv = l.code === locale;
            return (
              <button key={l.code} type="button" aria-pressed={aktiv} autoFocus={aktiv}
                onClick={() => { setLocale(l.code); setOffen(false); triggerRef.current?.focus(); }}
                // B-M1 (R9-1, 6.9.2026): DAS EINE MENUE-ITEM-REZEPT. Hier stand ein
                // zweites: 14 px/500 auf einer Messing-Flaeche (`bg-brass-100/70`),
                // Radius `rounded-md`, Hover `bg-brass-100/40` — waehrend jedes andere
                // Menue des Hauses (`ui/Menue`, Verlauf, Reiter-Blatt, Ansicht) die
                // Zeile als `.lc-menu-zeile` fuehrt: 14 px/400, Polster 8/12, Haarlinie
                // nach unten, Hover in `--well`, Radius 0, Fokus als Strich. Zwei
                // Rezepte fuer dieselbe Sache (r9-befunde-b.md B-M1).
                // GEAENDERT WIRD NUR DIE KLASSENZEILE: Struktur, Handler, `aria-pressed`,
                // `autoFocus`, das Haekchen rechts und die «In Vorbereitung»-Marke
                // bleiben Zeichen fuer Zeichen. Der gewaehlte Eintrag traegt seinen
                // Zustand weiterhin doppelt — Tinte statt ink-700 UND das ✓ — also
                // nicht allein ueber die Farbe (F2/F4); nur die Flaeche faellt weg
                // (F0.6 «Linien statt Flaechen»).
                className={`lc-menu-zeile justify-between ${aktiv ? 'text-ink-900' : ''}`}>
                <span className={l.inBearbeitung ? 'text-ink-500' : ''}>
                  <span className="num uppercase text-xs mr-2">{l.code}</span>{l.label}
                </span>
                {l.inBearbeitung
                  ? <span className="lc-badge-geplant shrink-0">In Vorbereitung</span>
                  : aktiv && <span aria-hidden className="text-brass-700">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
