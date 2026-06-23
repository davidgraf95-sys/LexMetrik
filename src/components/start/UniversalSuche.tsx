import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUniversalSuche } from '../suche/useUniversalSuche';
import { SuchResultate } from '../suche/SuchResultate';

// ─── Universal-Suche (Held der Startseite) ──────────────────────────────────
//
// Prominentes Feld über Rechner+Vorlagen, Fristen-Vorlagen, Gesetze und
// Rechtsprechung. Teilt seit der UI-Welle Hook (useUniversalSuche) und
// Trefferpanel (SuchResultate) mit der Header-Suche — EIN Suchweg, EIN
// Resultat-Dropdown (Auftrag David, §5). Eigenheit des Hero gegenüber dem
// Header: der Suchwert ist über ?q= teilbar/permalinkfähig und steht prominent.
// SSR/Prerender: kein Autofokus (Mobil-Tastatur verdeckt sonst die Treffer).

function Lupe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path d="M20 20l-3.6-3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function UniversalSuche() {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const [wert, setWert] = useState(initialQ);
  const [q, setQ] = useState(initialQ.trim());

  // Was WIR zuletzt in ?q= geschrieben haben — trennt eigene Writes von echten
  // externen Änderungen (Zurück-Taste, Permalink). Als State, damit der
  // Render-Phasen-Abgleich es lesen darf.
  const [geschrieben, setGeschrieben] = useState(initialQ.trim());
  const qParam = params.get('q') ?? '';
  const [letztesParam, setLetztesParam] = useState(qParam);
  if (qParam !== letztesParam) {
    setLetztesParam(qParam);
    if (qParam !== geschrieben) setWert(qParam);
  }

  // Eingabe: Feldwert setzen UND ?q= sofort schreiben (synchron, kein Effect →
  // kein Tipp-Gefecht). Teilbar/Zurück-Taste; replace, damit Tippen keine
  // History füllt.
  const setze = (v: string) => {
    setWert(v);
    const t = v.trim();
    setGeschrieben(t);
    const p = new URLSearchParams(params);
    if (t) p.set('q', t); else p.delete('q');
    setParams(p, { replace: true });
  };

  // Debounce: Eingabe → Such-Query (~120 ms) — nur für die Trefferberechnung.
  useEffect(() => {
    const id = setTimeout(() => setQ(wert.trim()), 120);
    return () => clearTimeout(id);
  }, [wert]);

  const { gruppen, allesGeladen } = useUniversalSuche(q);

  return (
    <section role="search" aria-label="Universal-Suche" className="space-y-3">
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400">
          <Lupe />
        </span>
        <input
          type="search"
          value={wert}
          onChange={(e) => setze(e.target.value)}
          placeholder="Frist, Rechner, Vorlage, Gesetz oder Entscheid …"
          aria-label="Über Rechner, Vorlagen, Gesetze und Rechtsprechung suchen"
          className="lc-input h-[3.25rem] w-full pl-12 pr-11 text-body-l"
          enterKeyHint="search"
        />
        {wert && (
          <button type="button" onClick={() => setze('')} aria-label="Suche leeren"
            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:text-brass-700">
            <span aria-hidden className="text-base leading-none">✕</span>
          </button>
        )}
      </div>

      <SuchResultate gruppen={gruppen} allesGeladen={allesGeladen} q={q} />
    </section>
  );
}
