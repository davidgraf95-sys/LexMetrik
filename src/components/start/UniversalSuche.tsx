import { useEffect, useId, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUniversalSuche } from '../suche/useUniversalSuche';
import { SuchResultate } from '../suche/SuchResultate';
import { suchOptionId } from '../suche/suchOptionId';

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
  const navigate = useNavigate();
  const listboxId = useId();
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

  // Flache Trefferliste in Anzeigereihenfolge — Basis für Pfeil-Navigation und
  // die geteilten Options-IDs (suchOptionId, identisch im Panel gerendert).
  const flach = gruppen.flatMap((g) => g.treffer.map((t) => ({ oid: suchOptionId(listboxId, g.id, t.id), href: t.href })));
  const [aktivIndex, setAktivIndex] = useState(-1);
  // Bei jeder neuen Query die Hervorhebung zurücksetzen (sonst zeigt der Index
  // auf einen Treffer, der nach dem Tippen nicht mehr an gleicher Stelle steht).
  // Anpassung während des Renders (React-Muster statt setState-im-Effekt).
  const [letzteQuery, setLetzteQuery] = useState(q);
  if (q !== letzteQuery) {
    setLetzteQuery(q);
    setAktivIndex(-1);
  }
  const aktivId = aktivIndex >= 0 && aktivIndex < flach.length ? flach[aktivIndex].oid : undefined;

  // Aktiven Treffer in den sichtbaren Bereich rollen (Hero-Liste kann lang sein).
  useEffect(() => {
    if (aktivId) document.getElementById(aktivId)?.scrollIntoView({ block: 'nearest' });
  }, [aktivId]);

  // Pfeil-/Enter-Navigation wie in der Header-Suche (EIN Suchweg, §5): Enter
  // öffnet den hervorgehobenen bzw. — ohne Auswahl — den obersten Treffer.
  const aufTaste = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && flach.length > 0) {
      e.preventDefault();
      setAktivIndex((i) => (i + 1) % flach.length);
    } else if (e.key === 'ArrowUp' && flach.length > 0) {
      e.preventDefault();
      setAktivIndex((i) => (i <= 0 ? flach.length - 1 : i - 1));
    } else if (e.key === 'Enter' && flach.length > 0) {
      e.preventDefault();
      const ziel = aktivIndex >= 0 && aktivIndex < flach.length ? flach[aktivIndex].href : flach[0].href;
      navigate(ziel);
    } else if (e.key === 'Escape') {
      setAktivIndex(-1);
    }
  };

  return (
    <section role="search" aria-label="Universal-Suche" className="space-y-3">
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500">
          <Lupe />
        </span>
        <input
          type="search"
          value={wert}
          onChange={(e) => setze(e.target.value)}
          onKeyDown={aufTaste}
          placeholder="Frist, Rechner, Vorlage, Gesetz oder Entscheid …"
          aria-label="Über Rechner, Vorlagen, Gesetze und Rechtsprechung suchen"
          className="lc-input h-[3.25rem] w-full pl-12 pr-11 text-body-l"
          enterKeyHint="search"
          role="combobox"
          aria-expanded={q !== ''}
          aria-controls={q !== '' ? listboxId : undefined}
          aria-activedescendant={aktivId}
          aria-autocomplete="list"
        />
        {wert && (
          <button type="button" onClick={() => setze('')} aria-label="Suche leeren"
            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-500 transition-colors hover:text-brass-700">
            <span aria-hidden className="text-base leading-none">✕</span>
          </button>
        )}
      </div>

      <SuchResultate gruppen={gruppen} allesGeladen={allesGeladen} q={q} listboxId={listboxId} aktivId={aktivId} />
    </section>
  );
}
