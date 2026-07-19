import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUniversalSuche } from '../suche/useUniversalSuche';
import { SuchResultate } from '../suche/SuchResultate';
import { SucheLeerzustand } from '../suche/SucheLeerzustand';
import { aktivePosition, flacheTreffer, naechsterKey, vorigerKey, gewaehlterHref } from '../suche/trefferAuswahl';

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

  const { gruppen, allesGeladen, vorschlag, abdeckung } = useUniversalSuche(q);

  // Enter-Puffer (S3/#52): Wird Enter gedrückt, BEVOR Treffer geladen sind (mobil
  // trifft die «Suchen»-Taste sonst ins Leere), merkt sich das Feld die Query und
  // öffnet den obersten Treffer, sobald geladen. `wert.trim()`, weil `q` dem
  // Debounce nachhängt; bei weiterem Tippen wird der Puffer verworfen (onChange).
  const [enterQ, setEnterQ] = useState<string | null>(null);

  // Flache Trefferliste + Pfeil-Auswahl über einen STABILEN Treffer-Key (die
  // oid), NICHT über einen Positions-Index — identisch zum Hero (EIN Suchweg,
  // §5); geteilte Options-IDs via suchOptionId. Wächst die per useDeferredValue
  // entkoppelte Artikelgruppe (§15.3/#183) einen Tick später ein und verschiebt
  // die Positionen, folgt die Auswahl dem SEMANTISCH gleichen Treffer statt auf
  // einen fremden umzuspringen (Race-Fix #210, Logik in trefferAuswahl.ts).
  // flacheTreffer (SSoT, §5) enthält am Gruppenende auch die «alle N Treffer»-
  // Option (mehrHref) — so ist der Sprung auch per Tastatur erreichbar (a11y).
  const flach = flacheTreffer(gruppen, listboxId);
  const [aktivKey, setAktivKey] = useState<string | null>(null);
  // Bei neuer Query zurücksetzen (Render-Phasen-Abgleich statt setState-im-Effekt).
  const [letzteQuery, setLetzteQuery] = useState(q);
  if (q !== letzteQuery) {
    setLetzteQuery(q);
    setAktivKey(null);
  }
  const aktivPos = aktivePosition(flach, aktivKey);
  // UI-NAV O1: das Feld öffnet auch LEER (⌘K/Fokus) → Verlauf + kuratierte
  // Einstiege (SucheLeerzustand). `feldLeer` an `wert` (nicht am nachhängenden `q`),
  // damit der Leerzustand beim ersten Tastendruck sofort den Treffern weicht.
  const feldLeer = wert.trim() === '';
  const zeigtPanel = offen && !feldLeer;
  const zeigtLeer = offen && feldLeer;
  const aktivId = zeigtPanel && aktivPos >= 0 ? flach[aktivPos].oid : undefined;

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
      // UI-NAV O1: immer öffnen — leer erscheint der Verlauf-/Einstieg-Leerzustand.
      setOffen(true);
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

  const auswahl = () => { setOffen(false); setWert(''); setQ(''); setAktivKey(null); setEnterQ(null); };

  // Übernimmt einen «Meinten Sie …?»-Vorschlag als neue Query (S3).
  const uebernehmeVorschlag = (begriff: string) => { setWert(begriff); setQ(begriff); setOffen(true); setAktivKey(null); };

  // Gepufferten Enter auslösen, sobald der Index geladen UND der Debounce
  // eingeholt ist (enterQ === q). Öffnet den obersten Treffer der ersten
  // nicht-leeren Gruppe; gibt es keinen (echte Nulltreffer/BGE nicht im Bestand),
  // bleibt das Panel mit der ehrlichen Auskunft stehen (§8).
  useEffect(() => {
    if (enterQ === null) return;
    if (!allesGeladen || enterQ !== q) return;
    const ziel = gruppen.find((g) => g.treffer.length > 0)?.treffer[0]?.href;
    // Deferred, damit kein synchrones set-state-in-effect kaskadiert (Repo-Muster).
    const id = window.setTimeout(() => {
      setEnterQ(null);
      if (ziel) { navigate(ziel); setOffen(false); setWert(''); setQ(''); setAktivKey(null); }
    }, 0);
    return () => window.clearTimeout(id);
  }, [enterQ, q, allesGeladen, gruppen, navigate]);

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
      setAktivKey((k) => naechsterKey(flach, k));
    } else if (e.key === 'ArrowUp' && flach.length > 0) {
      e.preventDefault();
      setAktivKey((k) => vorigerKey(flach, k));
    } else if (e.key === 'Enter') {
      const ziel = gewaehlterHref(flach, aktivKey)
        ?? gruppen.find((g) => g.treffer.length > 0)?.treffer[0]?.href;
      if (ziel) { navigate(ziel); auswahl(); }
      else if (wert.trim() !== '') { setEnterQ(wert.trim()); setOffen(true); } // Puffer: öffnen, sobald geladen
    }
  };

  return (
    <div ref={huelle} className="relative" role="search">
      <input
        ref={feld}
        type="search"
        value={wert}
        onChange={(e) => { setWert(e.target.value); setOffen(true); setEnterQ(null); }}
        onFocus={() => setOffen(true)}
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
      {(zeigtPanel || zeigtLeer) && (
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
          {zeigtLeer
            // UI-NAV O1: Leerzustand (⌘K/Fokus ohne Eingabe) — Verlauf + Einstiege.
            ? <SucheLeerzustand onAuswahl={auswahl} />
            : <SuchResultate gruppen={gruppen} allesGeladen={allesGeladen} q={q} onAuswahl={auswahl} listboxId={listboxId} aktivId={aktivId}
                vorschlag={vorschlag} abdeckung={abdeckung} onVorschlag={uebernehmeVorschlag}
                onNavigate={(href) => navigate(href)} />}
        </div>
      )}
    </div>
  );
}
