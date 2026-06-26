import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUniversalSuche } from '../suche/useUniversalSuche';
import { SuchResultate } from '../suche/SuchResultate';
import { suchOptionId } from '../suche/suchOptionId';

// ─── Globale Suche im Top-Streifen (UI-Welle: Dropdown überall) ─────────────
//
// EIN Feld über Rechner+Vorlagen, Fristen-Vorlagen, Gesetze und Rechtsprechung
// — Treffer erscheinen als Dropdown DIREKT unter dem Feld, auf JEDER Seite
// (Auftrag David: «Resultate überall im Drop-down-Menü»). Kein ?q=-Umweg, kein
// /recherche mehr. Reine Darstellung/Navigation (§3): Trefferlogik liegt im
// geteilten Hook useUniversalSuche (§5). «/» fokussiert das Feld global.
export function HeaderSuche() {
  const navigate = useNavigate();
  const listboxId = useId();
  const [wert, setWert] = useState('');
  const [q, setQ] = useState('');
  const [offen, setOffen] = useState(false);
  const feld = useRef<HTMLInputElement>(null);
  const huelle = useRef<HTMLDivElement>(null);

  // Debounce: Eingabe → Such-Query (~120 ms) — stösst zugleich das Lazy-Laden an.
  useEffect(() => {
    const id = setTimeout(() => setQ(wert.trim()), 120);
    return () => clearTimeout(id);
  }, [wert]);

  const { gruppen, allesGeladen } = useUniversalSuche(q);

  // Flache Trefferliste + Hervorhebungs-Index für Pfeil-Navigation — identisch
  // zum Hero (EIN Suchweg, §5); geteilte Options-IDs via suchOptionId.
  const flach = gruppen.flatMap((g) => g.treffer.map((t) => ({ oid: suchOptionId(listboxId, g.id, t.id), href: t.href })));
  const [aktivIndex, setAktivIndex] = useState(-1);
  // Bei neuer Query zurücksetzen (Render-Phasen-Abgleich statt setState-im-Effekt).
  const [letzteQuery, setLetzteQuery] = useState(q);
  if (q !== letzteQuery) {
    setLetzteQuery(q);
    setAktivIndex(-1);
  }
  const zeigtPanel = offen && q !== '';
  const aktivId = zeigtPanel && aktivIndex >= 0 && aktivIndex < flach.length ? flach[aktivIndex].oid : undefined;

  // «/» fokussiert das Feld global (nicht in Eingabefeldern).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const ziel = e.target as HTMLElement | null;
      if (ziel && (/^(INPUT|TEXTAREA|SELECT)$/.test(ziel.tagName) || ziel.isContentEditable)) return;
      if (feld.current) { e.preventDefault(); feld.current.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Klick ausserhalb / Escape schliesst das Dropdown (Klick auf einen Treffer
  // navigiert via Link und ruft onAuswahl, das hier ebenfalls schliesst).
  useEffect(() => {
    if (!offen) return;
    const aus = (e: PointerEvent) => { if (huelle.current && !huelle.current.contains(e.target as Node)) setOffen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOffen(false); feld.current?.blur(); } };
    window.addEventListener('pointerdown', aus);
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('pointerdown', aus); window.removeEventListener('keydown', esc); };
  }, [offen]);

  const auswahl = () => { setOffen(false); setWert(''); setQ(''); setAktivIndex(-1); };

  // Aktiven Treffer in den sichtbaren Bereich rollen (lange Trefferliste).
  useEffect(() => {
    if (aktivId) document.getElementById(aktivId)?.scrollIntoView({ block: 'nearest' });
  }, [aktivId]);

  // Pfeil-/Enter-Navigation wie im Hero (§5): Enter öffnet den hervorgehobenen
  // bzw. — ohne Auswahl — den obersten Treffer der ersten nicht-leeren Gruppe.
  const aufTaste = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && flach.length > 0) {
      e.preventDefault();
      setOffen(true);
      setAktivIndex((i) => (i + 1) % flach.length);
    } else if (e.key === 'ArrowUp' && flach.length > 0) {
      e.preventDefault();
      setAktivIndex((i) => (i <= 0 ? flach.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      const ziel = aktivIndex >= 0 && aktivIndex < flach.length
        ? flach[aktivIndex].href
        : gruppen.find((g) => g.treffer.length > 0)?.treffer[0]?.href;
      if (ziel) { navigate(ziel); auswahl(); }
    }
  };

  return (
    <div ref={huelle} className="relative" role="search">
      <input
        ref={feld}
        type="search"
        value={wert}
        onChange={(e) => { setWert(e.target.value); setOffen(true); }}
        onFocus={() => { if (wert.trim()) setOffen(true); }}
        onKeyDown={aufTaste}
        placeholder="Suchen …  ( / )"
        className="lc-input h-9 py-0 text-body-s w-full"
        aria-label="LexMetrik durchsuchen"
        aria-keyshortcuts="/"
        autoComplete="off"
        role="combobox"
        aria-expanded={zeigtPanel}
        aria-controls={zeigtPanel ? listboxId : undefined}
        aria-activedescendant={aktivId}
        aria-autocomplete="list"
      />
      {zeigtPanel && (
        <div className="absolute left-0 right-0 top-full mt-2 z-30">
          <SuchResultate gruppen={gruppen} allesGeladen={allesGeladen} q={q} onAuswahl={auswahl} listboxId={listboxId} aktivId={aktivId}
            onNavigate={(href) => navigate(href)} />
        </div>
      )}
    </div>
  );
}
