import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTabs } from './useTabs';
import { schliesseTab, leereTabs, type TabEintrag } from '../../lib/tabs';
import { verlaufLabel, pfadTeil, erlassVonPfad, type VerlaufManifeste } from '../../lib/verlaufLabel';
import { KantonWappen } from '../KantonWappen';

// ─── In-App-Reiter-Streifen (v2, Auftrag David) ─────────────────────────────
//
// Schmale Reiter-Leiste unter dem Top-Streifen. NEU (Auftrag David): die offenen
// Reiter werden AUTOMATISCH nach Kategorie gruppiert — statt N Einzelreitern
// höchstens ein Sammel-Reiter je Kategorie («Gesetze», «Rechtsprechung»,
// «Vorlagen», «Rechner»), jeder mit kleinem Piktogramm und einem Dropdown zum
// Umschalten zwischen den offenen Elementen dieser Kategorie. Reine Darstellung/
// Navigation (§3): die Reiter-Liste lebt in lib/tabs.ts (localStorage), die
// Labels löst der geteilte verlaufLabel-Resolver auf (§5, kein zweites Register).
//
// GOLDEN/PRERENDER-SCHUTZ: bei SSR (kein window) ODER weniger als 2 Reitern
// rendert der Streifen NICHTS — der prerenderte HTML bleibt byte-gleich.

type TabKat = 'gesetze' | 'rechtsprechung' | 'vorlagen' | 'rechner' | 'sonstiges';

// Kategorie rein aus dem Pfad-Präfix ableiten (deterministisch, kein Register):
// die Tool-Routen sind /rechner/* bzw. /vorlagen/*, die Reader /gesetze/:e/:k
// bzw. /rechtsprechung/:k.
function tabKat(path: string): TabKat {
  const p = pfadTeil(path);
  if (p.startsWith('/gesetze/')) return 'gesetze';
  if (p.startsWith('/rechtsprechung/')) return 'rechtsprechung';
  if (p.startsWith('/vorlagen/')) return 'vorlagen';
  if (p.startsWith('/rechner/')) return 'rechner';
  return 'sonstiges';
}

// Piktogramm + Sammel-Label je Kategorie (Auftrag David: «mit kleinem Piktogramm
// sichtbar, um was es sich handelt»). Glyphen im Messing-Stil der App.
const KAT_META: Record<TabKat, { label: string; pikto: string }> = {
  gesetze: { label: 'Gesetze', pikto: '§' },
  rechtsprechung: { label: 'Rechtsprechung', pikto: '⚖' },
  vorlagen: { label: 'Vorlagen', pikto: '▤' },
  rechner: { label: 'Rechner', pikto: '⊞' },
  sonstiges: { label: 'Weitere', pikto: '◦' },
};
// Feste Reihenfolge der Sammel-Reiter (stabil, unabhängig von Öffnungs-Reihenfolge).
const KAT_ORDER: TabKat[] = ['gesetze', 'rechtsprechung', 'vorlagen', 'rechner', 'sonstiges'];

export function TabStreifen() {
  const tabs = useTabs();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [manifeste, setManifeste] = useState<VerlaufManifeste>({});
  const [offeneKat, setOffeneKat] = useState<TabKat | null>(null);
  // Dropdown-Position relativ zur nav (das Dropdown wird AUSSERHALB des
  // scrollenden <ul> auf nav-Ebene gerendert, sonst schneidet dessen overflow-x
  // es vertikal ab — Bug David «Tab-Dropdown abgeschnitten»).
  const [menuPos, setMenuPos] = useState<{ left: number; top: number } | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Eigene Höhe als CSS-Variable veröffentlichen, damit in-page-sticky-Leisten
  // (z.B. die Gesetz-Suchleiste) sich UNTER den Reiter-Streifen stapeln statt ihn
  // zu verdecken. 0px, wenn der Streifen nicht rendert (< 2 Reiter).
  useEffect(() => {
    const wurzel = document.documentElement;
    wurzel.style.setProperty('--tabstreifen-h', navRef.current ? `${navRef.current.offsetHeight}px` : '0px');
    return () => wurzel.style.setProperty('--tabstreifen-h', '0px');
  }, [tabs.length]);

  // Reader-Labels (Gesetz/Entscheid) aus den ohnehin lazy ladbaren Manifesten —
  // nur laden, wenn ein Reiter eine solche Route trägt.
  useEffect(() => {
    const brauchtG = tabs.some((t) => tabKat(t.path) === 'gesetze');
    const brauchtE = tabs.some((t) => tabKat(t.path) === 'rechtsprechung');
    if (!brauchtG && !brauchtE) return;
    let lebt = true;
    (async () => {
      const [g, ent] = await Promise.all([
        brauchtG ? import('../../lib/normtext/browse').then((m) => m.ladeBrowseManifest()) : Promise.resolve(null),
        brauchtE ? import('../../lib/rechtsprechung/browse').then((m) => m.ladeEntscheidManifest()) : Promise.resolve(null),
      ]);
      if (lebt) setManifeste({ gesetze: g, entscheide: ent });
    })();
    return () => { lebt = false; };
  }, [tabs]);

  // Klick ausserhalb schliesst ein offenes Dropdown (die Menüpunkte schliessen es
  // bei Auswahl selbst über setOffeneKat(null) → kein State-Set im Effekt nötig).
  useEffect(() => {
    if (!offeneKat) return;
    const zu = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setOffeneKat(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOffeneKat(null); };
    document.addEventListener('mousedown', zu);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', zu); document.removeEventListener('keydown', esc); };
  }, [offeneKat]);

  // Guard: weniger als 2 Reiter → nichts rendern (Optik/golden/prerender
  // byte-gleich). Im Prerender liefert ladeTabs() [] → immer unsichtbar.
  if (tabs.length < 2) return null;

  const aktivTeil = pfadTeil(pathname);
  const aktivKat = tabKat(pathname);

  // Nach Kategorie gruppieren, in fester Reihenfolge; leere Kategorien weglassen.
  const gruppen = KAT_ORDER
    .map((kat) => ({ kat, items: tabs.filter((t) => tabKat(t.path) === kat) }))
    .filter((g) => g.items.length > 0);

  const schliessen = (path: string) => {
    const teil = pfadTeil(path);
    if (aktivTeil === teil) {
      // Aktiven Reiter schliessen → auf den linken Nachbarn (sonst rechten, sonst Start).
      const idx = tabs.findIndex((t) => pfadTeil(t.path) === teil);
      const nachbar = tabs[idx - 1] ?? tabs[idx + 1];
      schliesseTab(path);
      navigate(nachbar ? nachbar.path : '/');
    } else {
      schliesseTab(path);
    }
  };

  const label = (t: TabEintrag) => verlaufLabel(t.path, manifeste);

  // Kantonskürzel eines Reiters, falls er ein KANTONALES Gesetz zeigt (Auftrag
  // David: «der Tab soll anzeigen, wenn man kantonales Gesetz hat, um welchen
  // Kanton es sich handelt, mit Wappen»). Quelle ist der geteilte Resolver
  // erlassVonPfad über das ohnehin geladene Browse-Manifest (SSoT §5, derselbe
  // Lookup wie für das Label — kein doppelter find); der Kanton steht dort je
  // Erlass, nicht aus dem Pfad-Key geraten. null = Bund/kein Gesetz/Manifest
  // noch nicht geladen → Fallback auf das Kategorie-Piktogramm.
  const kantonVon = (t: TabEintrag): string | null => {
    const e = erlassVonPfad(t.path, manifeste);
    return e?.ebene === 'kanton' ? e.kanton ?? null : null;
  };

  return (
    <nav aria-label="Geöffnete Reiter" ref={navRef}
      className="relative sticky top-16 z-10 border-b border-line"
      style={{ background: 'color-mix(in srgb, var(--paper) 96%, transparent)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <div className="flex items-stretch gap-2 px-2 sm:px-4 py-1.5">
        <ul className="flex items-stretch gap-1 overflow-x-auto min-w-0 lc-scroll-x" style={{ scrollSnapType: 'x proximity' }}>
          {gruppen.map(({ kat, items }) => {
            const meta = KAT_META[kat];
            const pikto = <span aria-hidden className="shrink-0 text-ink-400">{meta.pikto}</span>;

            // Einzelnes Element der Kategorie → direkter Reiter (kein Dropdown nötig),
            // zeigt das Piktogramm + den Element-Titel.
            if (items.length === 1) {
              const t = items[0];
              const aktiv = pfadTeil(t.path) === aktivTeil;
              const kanton = kantonVon(t);
              return (
                <li key={kat} className="shrink-0" style={{ scrollSnapAlign: 'start' }}>
                  <span className={`group/tab inline-flex items-center rounded-md border transition-colors ${
                    aktiv ? 'border-brass-400 bg-brass-100/50 text-brass-800' : 'border-line bg-surface text-ink-600 hover:text-ink-900 hover:border-brass-300'
                  }`}>
                    <button type="button" aria-current={aktiv ? 'page' : undefined}
                      onClick={() => navigate(t.path)}
                      className="inline-flex items-center gap-1.5 max-w-[10rem] sm:max-w-[14rem] truncate pl-2.5 pr-1.5 py-1.5 text-body-s font-medium">
                      {/* Kantonales Gesetz: Wappen statt §-Glyph (zeigt den Kanton). */}
                      {kanton ? <KantonWappen kanton={kanton} className="h-4 w-3.5" dekorativ /> : pikto}<span className="truncate">{label(t)}</span>
                    </button>
                    <button type="button" onClick={() => schliessen(t.path)}
                      aria-label={`Reiter «${label(t)}» schliessen`}
                      className="inline-flex items-center justify-center w-7 h-7 mr-0.5 rounded text-ink-500 hover:text-danger-700 transition-colors">
                      <span aria-hidden className="text-body-s leading-none">✕</span>
                    </button>
                  </span>
                </li>
              );
            }

            // Mehrere Elemente → Sammel-Reiter «Kategorie (n) ▾» mit Dropdown zum
            // Umschalten (Auftrag David). Aktiv, wenn die aktuelle Route in dieser
            // Kategorie liegt.
            const katAktiv = kat === aktivKat;
            const offen = offeneKat === kat;
            return (
              <li key={kat} className="shrink-0" style={{ scrollSnapAlign: 'start' }}>
                <button type="button" aria-haspopup="menu" aria-expanded={offen}
                  onClick={(e) => {
                    if (offeneKat === kat) { setOffeneKat(null); return; }
                    const nav = navRef.current?.getBoundingClientRect();
                    const r = e.currentTarget.getBoundingClientRect();
                    if (nav) {
                      const breite = 288; // ~18rem; nicht über den rechten Rand hinaus
                      const left = Math.max(8, Math.min(r.left - nav.left, nav.width - breite - 8));
                      setMenuPos({ left, top: r.bottom - nav.top + 4 });
                    }
                    setOffeneKat(kat);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-md border pl-2.5 pr-2 py-1.5 text-body-s font-medium transition-colors ${
                    katAktiv ? 'border-brass-400 bg-brass-100/50 text-brass-800' : 'border-line bg-surface text-ink-600 hover:text-ink-900 hover:border-brass-300'
                  }`}>
                  {pikto}
                  <span className="truncate">{meta.label}</span>
                  <span className="text-micro text-ink-400 num">{items.length}</span>
                  <span aria-hidden className={`text-ink-400 text-micro transition-transform ${offen ? 'rotate-180' : ''}`}>▾</span>
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={() => { leereTabs(); navigate('/'); }}
          className="ml-auto shrink-0 self-center px-2.5 py-1.5 text-body-s text-ink-600 hover:text-brass-700 transition-colors whitespace-nowrap">
          Alle schliessen
        </button>
      </div>

      {/* Dropdown auf nav-Ebene (absolut zur nav, ausserhalb des scrollenden <ul>)
          → ragt aus dem Streifen heraus statt abgeschnitten zu werden (Bug David). */}
      {offeneKat && menuPos && (
        <div role="menu" style={{ left: menuPos.left, top: menuPos.top }}
          className="absolute z-30 w-[18rem] max-w-[calc(100vw-1rem)] rounded-lg border border-line bg-paper-raised shadow-lg py-1 max-h-[70vh] overflow-y-auto">
          {tabs.filter((t) => tabKat(t.path) === offeneKat).map((t) => {
            const aktiv = pfadTeil(t.path) === aktivTeil;
            const kanton = kantonVon(t);
            return (
              <div key={t.path} className={`flex items-center ${aktiv ? 'bg-brass-100/50' : 'hover:bg-brass-100/30'}`}>
                <button type="button" role="menuitem" aria-current={aktiv ? 'page' : undefined}
                  onClick={() => { navigate(t.path); setOffeneKat(null); }}
                  className={`flex-1 min-w-0 inline-flex items-center gap-1.5 truncate text-left px-3 py-1.5 text-body-s ${aktiv ? 'text-brass-800 font-medium' : 'text-ink-700'}`}>
                  {/* Kantonales Gesetz im Dropdown ebenfalls mit Wappen markieren. */}
                  {kanton && <KantonWappen kanton={kanton} className="h-4 w-3.5" dekorativ />}<span className="truncate">{label(t)}</span>
                </button>
                <button type="button" onClick={() => schliessen(t.path)}
                  aria-label={`Reiter «${label(t)}» schliessen`}
                  className="inline-flex items-center justify-center w-7 h-7 mr-1 shrink-0 rounded text-ink-400 hover:text-danger-700 transition-colors">
                  <span aria-hidden className="text-body-s leading-none">✕</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </nav>
  );
}
