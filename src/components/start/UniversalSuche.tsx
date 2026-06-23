import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { sucheAlles, type SuchGruppe, type SuchTreffer } from '../../lib/universalSuche';
import type { PresetIndexEintrag } from '../../lib/presetIndex';
import type { BrowseErlass } from '../../lib/normtext/browse-typen';
import type { BrowseEntscheid } from '../../lib/rechtsprechung/register';

// ─── Universal-Suche (Held der Startseite, Überarbeitung) ───────────────────
//
// EIN Feld über Rechner+Vorlagen, Fristen-Vorlagen, Gesetze und Rechtsprechung.
// Reine Darstellung/Navigation (§3): die Trefferlogik liegt in lib/universalSuche
// (das nur bestehende Such-/Filter-Funktionen bündelt, §5). Die schweren Daten
// (Gesetzes-/Entscheid-Manifest, Preset-Index) werden ERST beim ersten
// Tastendruck lazy geladen — der Start-Chunk bleibt schlank (§3/§6.4).
// SSR/Prerender: kein Autofokus (Mobil-Tastatur verdeckt sonst die Treffer),
// der Suchwert kommt aus ?q= und wird teilbar zurückgeschrieben.

function Lupe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path d="M20 20l-3.6-3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function Marke({ text, ton }: NonNullable<SuchTreffer['marke']>) {
  const cls = ton === 'ok' ? 'lc-badge-ok' : ton === 'entwurf' ? 'lc-badge-entwurf' : 'lc-badge-soft';
  return <span className={`lc-badge ${cls} shrink-0`}>{text}</span>;
}

function Zeile({ t }: { t: SuchTreffer }) {
  return (
    <li>
      <Link to={t.href}
        className="group/z flex items-center gap-3 px-4 py-2 no-underline transition-colors hover:bg-brass-100/40">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body-s font-medium text-ink-900 transition-colors group-hover/z:text-brass-800">{t.label}</span>
          {t.untertitel && <span className="block truncate text-body-s text-ink-500">{t.untertitel}</span>}
        </span>
        {t.marke && <Marke {...t.marke} />}
        <span aria-hidden className="text-ink-300 transition-all group-hover/z:translate-x-0.5 group-hover/z:text-brass-500">→</span>
      </Link>
    </li>
  );
}

function Gruppe({ g, index }: { g: SuchGruppe; index: number }) {
  return (
    <div className="lc-reveal border-t border-line first:border-t-0" style={{ animationDelay: `${index * 55}ms` }}>
      <div className="flex items-baseline gap-2 px-4 pt-3 pb-1">
        <span className="lc-overline text-ink-500">{g.titel}</span>
        {!g.laedt && <span className="num text-xs text-ink-400">{g.gesamt}</span>}
        {g.mehrHref && (
          <Link to={g.mehrHref} className="ml-auto text-body-s text-brass-700 no-underline hover:text-brass-600">
            alle {g.gesamt} →
          </Link>
        )}
      </div>
      {g.laedt
        ? <p className="px-4 pb-3 text-body-s text-ink-400">wird durchsucht …</p>
        : <ul className="pb-1.5">{g.treffer.map((t) => <Zeile key={`${g.id}:${t.id}`} t={t} />)}</ul>}
    </div>
  );
}

export function UniversalSuche() {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const [wert, setWert] = useState(initialQ);
  const [q, setQ] = useState(initialQ.trim());

  // Was WIR zuletzt in ?q= geschrieben haben — trennt eigene Writes von echten
  // externen Änderungen (Zurück-Taste, Top-Streifen-Enter, Permalink). Als
  // State (nicht Ref), damit der Render-Phasen-Abgleich es lesen darf.
  const [geschrieben, setGeschrieben] = useState(initialQ.trim());

  // Externer ?q=-Abgleich als Render-Phasen-Anpassung (Muster wie HeaderSuche):
  // nur echte Fremdänderungen übernehmen, laufendes Tippen nie überschreiben.
  const qParam = params.get('q') ?? '';
  const [letztesParam, setLetztesParam] = useState(qParam);
  if (qParam !== letztesParam) {
    setLetztesParam(qParam);
    if (qParam !== geschrieben) setWert(qParam);
  }

  // Eingabe: Feldwert setzen UND ?q= sofort schreiben (synchron im Handler,
  // kein Effect → kein Tipp-Gefecht). Teilbar/Zurück-Taste; replace, damit
  // Tippen keine History füllt.
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

  // Lazy-Daten — erst beim ersten nicht-leeren Tastendruck, dann gecacht.
  const [presetSucheFn, setPresetSucheFn] = useState<((s: string, limit?: number) => PresetIndexEintrag[]) | null>(null);
  const [gesetze, setGesetze] = useState<BrowseErlass[] | null>(null);
  const [entscheide, setEntscheide] = useState<BrowseEntscheid[] | null>(null);
  const gestartet = useRef(false);

  useEffect(() => {
    if (q === '' || gestartet.current) return;
    gestartet.current = true;
    import('../../lib/presetIndex').then((m) => setPresetSucheFn(() => m.presetSuche)).catch(() => setPresetSucheFn(() => () => []));
    import('../../lib/normtext/browse').then((m) => m.ladeBrowseManifest()).then((m) => setGesetze(m?.erlasse ?? [])).catch(() => setGesetze([]));
    import('../../lib/rechtsprechung/browse').then((m) => m.ladeEntscheidManifest()).then((m) => setEntscheide(m?.entscheide ?? [])).catch(() => setEntscheide([]));
  }, [q]);

  const gruppen = useMemo(
    // Presets ungekappt holen (limit 999) — `gesamt` soll die ECHTE Trefferzahl
    // sein, nicht das Default-Suchlimit (§8). Die Anzeige kappt in der Gruppe.
    () => sucheAlles(q, { presets: presetSucheFn ? presetSucheFn(q, 999) : null, gesetze, entscheide }),
    [q, presetSucheFn, gesetze, entscheide],
  );
  const allesGeladen = presetSucheFn !== null && gesetze !== null && entscheide !== null;

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

      {q !== '' && (
        <div className="lc-card overflow-hidden" aria-live="polite">
          {gruppen.length === 0
            ? <p className="px-4 py-4 text-body-s text-ink-500">
                {allesGeladen ? <>Keine Treffer zu «{q}». Versuchen Sie einen Erlass, eine Norm oder ein Stichwort.</> : <>wird durchsucht …</>}
              </p>
            : gruppen.map((g, i) => <Gruppe key={g.id} g={g} index={i} />)}
        </div>
      )}
    </section>
  );
}
