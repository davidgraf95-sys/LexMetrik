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
// geteilten Hook useUniversalSuche (§5).
//
// A5 (David 5.7.2026): der Norm-Sprung («OR 257d» → Deep-Link) sitzt jetzt HIER,
// nicht mehr in einer eigenen ⌘K-Palette — der Hook liefert die Sprung-Gruppe als
// obersten Treffer, Enter springt. «/» UND ⌘K/Ctrl-K fokussieren das Feld global
// (die frühere Befehls-Palette ist entfallen); mobil reicht das sichtbare Feld.
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

  // Globale Fokus-Shortcuts: «/» UND ⌘K/Ctrl-K fokussieren das Feld (A5 — die
  // frühere Palette ist entfallen, der Shortcut bleibt nützlich). In Eingabe-
  // feldern greift «/» nicht (normales Zeichen), ⌘K/Ctrl-K schon (globaler
  // Einstieg von überall). Zusätzlich lauscht das Feld auf «lm:suche-fokus», mit
  // dem der /gesetze-Landeplatz-CTA es fokussiert. Der aktuelle Feldwert wird
  // direkt vom DOM-Element gelesen (kein stale-closure über `wert`), das Panel
  // öffnet nur bei bereits vorhandenem Text (leeres Feld bleibt ruhig).
  useEffect(() => {
    const fokussiere = () => {
      const el = feld.current;
      if (!el) return;
      el.focus();
      el.select();
      if (el.value.trim() !== '') setOffen(true);
    };
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        fokussiere();
        return;
      }
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const ziel = e.target as HTMLElement | null;
      if (ziel && (/^(INPUT|TEXTAREA|SELECT)$/.test(ziel.tagName) || ziel.isContentEditable)) return;
      e.preventDefault();
      fokussiere();
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('lm:suche-fokus', fokussiere);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('lm:suche-fokus', fokussiere);
    };
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
        placeholder="Suchen oder Norm springen (z. B. «OR 257d») …"
        className="lc-input h-11 py-0 text-body-s w-full pr-3 lg:pr-14"
        aria-label="LexMetrik durchsuchen oder zur Norm springen"
        aria-keyshortcuts="/ Meta+K Control+K"
        autoComplete="off"
        role="combobox"
        aria-expanded={zeigtPanel}
        aria-controls={zeigtPanel ? listboxId : undefined}
        aria-activedescendant={aktivId}
        aria-autocomplete="list"
      />
      {/* Dezenter Shortcut-Hinweis (⌘K/Ctrl-K fokussiert das Feld). Nur Desktop,
          nicht interaktiv (pointer-events-none) — die Bedienung ist das Feld
          selbst, mobil reicht es ohne Hinweis (A5). */}
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 num text-micro font-medium tracking-tight text-ink-600 lg:inline">⌘K</kbd>
      {zeigtPanel && (
        // Im Header intern scrollbar (David 28.6.): die geöffnete Trefferfläche
        // wächst sonst unbegrenzt aus dem Top-Streifen heraus. max-h + eigener
        // Scroll + overscroll-contain (kein Durchscrollen auf die Seite). Nur der
        // HEADER-Pfad ist gekappt; der Hero nutzt dieselbe SuchResultate ungekappt.
        //
        // Desktop (sm+): unter dem Feld verankert (absolute, Feldbreite). Mobil
        // (A5 — die Suchleiste trägt jetzt auch den Norm-Sprung): das Feld ist im
        // Top-Streifen schmal, ein feldbreites Dropdown würde die Treffer bis zur
        // Unlesbarkeit kappen. Darum mobil viewport-verankert (fixed, feste
        // Seitenränder inset-x-2) → lesbare Breite OHNE horizontalen Overflow.
        <div className="absolute left-0 right-0 top-full mt-2 z-30 max-h-[70vh] overflow-y-auto overscroll-contain rounded-lg max-sm:fixed max-sm:inset-x-2 max-sm:left-2 max-sm:right-2 max-sm:top-[3.75rem] max-sm:mt-0">
          <SuchResultate gruppen={gruppen} allesGeladen={allesGeladen} q={q} onAuswahl={auswahl} listboxId={listboxId} aktivId={aktivId}
            onNavigate={(href) => navigate(href)} />
        </div>
      )}
    </div>
  );
}
