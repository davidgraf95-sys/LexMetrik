import { useState } from 'react';
import { tabSchluessel, type TabEintrag } from '../../lib/tabs';
import { erlassVonPfad, verlaufLabel, type VerlaufManifeste } from '../../lib/verlaufLabel';
import {
  reiterKategorie, herkunftVon, kantonVonPfad, artikelLabelVonPfad,
  KAT_META, KAT_ORDER, HERKUNFT_ORDER, HERKUNFT_LABEL,
  type Herkunft,
} from '../../lib/tabGruppen';
import { HerkunftIcon } from '../HerkunftIcon';

// ─── Vertikales Reiter-Panel (Auftrag David 26.6.2026, P3) ──────────────────
//
// ALLE offenen Reiter UNTEREINANDER, nach Rubrik gruppiert und auf-/zuklappbar
// (Akkordeon). Top-Gruppen = Kategorie (Gesetze, Rechtsprechung, Vorlagen,
// Rechner, Weitere) in fester Reihenfolge; die Gesetze-Gruppe gliedert sich
// darunter nach HERKUNFT (Bund → Kanton → International) — «geht nochmals auf».
// Jede Gesetz-Zeile dreispaltig: Herkunft-Icon · Name/Abkürzung · aktueller
// Artikel. Reine Darstellung/Navigation (§3): die Reiter-Liste lebt in
// lib/tabs.ts, die Gruppierung in lib/tabGruppen.ts (SSoT §5).

export function TabPanel({ tabs, manifeste, aktivSchluessel, onNavigate, onSchliessen }: {
  tabs: TabEintrag[];
  manifeste: VerlaufManifeste;
  aktivSchluessel: string;
  onNavigate: (path: string) => void;
  onSchliessen: (path: string) => void;
}) {
  // Eingeklappte Gruppen-IDs (Default: alles offen → der Nutzer sieht direkt
  // alle Reiter; «geht nochmals auf»). Klick auf den Kopf klappt zu/auf.
  const [zu, setZu] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setZu((o) => ({ ...o, [id]: !o[id] }));
  const offen = (id: string) => !zu[id];

  const gruppen = KAT_ORDER
    .map((kat) => ({ kat, items: tabs.filter((t) => reiterKategorie(t.path) === kat) }))
    .filter((g) => g.items.length > 0);

  if (gruppen.length === 0) return null;

  // Eine Reiter-Zeile: dreispaltig (Icon · Name · Artikel) + Schliessen-Knopf.
  const zeile = (t: TabEintrag, alsGesetz: boolean, kat: typeof KAT_ORDER[number]) => {
    const aktiv = tabSchluessel(t.path) === aktivSchluessel;
    const e = alsGesetz ? erlassVonPfad(t.path, manifeste) : null;
    const name = (alsGesetz && e?.kuerzel) ? e.kuerzel : verlaufLabel(t.path, manifeste);
    const art = alsGesetz ? artikelLabelVonPfad(t.path) : null;
    // herkunft kann null sein, wenn das Manifest noch nicht geladen ist → dann
    // KEIN (falsches) Schweizerkreuz, sondern das neutrale Kategorie-Piktogramm.
    const herkunft = alsGesetz ? herkunftVon(t.path, manifeste) : null;
    const kanton = alsGesetz ? kantonVonPfad(t.path, manifeste) : null;
    return (
      <li key={tabSchluessel(t.path)} className={`flex items-center rounded-md ${aktiv ? 'bg-brass-100/50' : 'hover:bg-brass-100/30'}`}>
        <button type="button" aria-current={aktiv ? 'page' : undefined}
          onClick={() => onNavigate(t.path)}
          className={`grid flex-1 min-w-0 grid-cols-[1rem_1fr_auto] items-center gap-2 text-left px-2 py-1.5 text-body-s ${aktiv ? 'text-brass-800 font-medium' : 'text-ink-700'}`}>
          {/* Spalte 1 — Herkunft/Kategorie-Icon */}
          {alsGesetz && herkunft
            ? <HerkunftIcon herkunft={herkunft} kanton={kanton} className="h-4 w-4" />
            : <span aria-hidden className="text-center text-ink-500">{KAT_META[kat].pikto}</span>}
          {/* Spalte 2 — Name/Abkürzung */}
          <span className="truncate">{name}</span>
          {/* Spalte 3 — aktueller Artikel (nur Gesetze) */}
          {art ? <span className="num shrink-0 text-micro text-ink-500">{art}</span> : <span />}
        </button>
        <button type="button" onClick={() => onSchliessen(t.path)}
          aria-label={`Reiter «${name}» schliessen`}
          className="inline-flex items-center justify-center w-7 h-7 mr-0.5 shrink-0 rounded text-ink-500 hover:text-danger-700 transition-colors">
          <span aria-hidden className="text-body-s leading-none">✕</span>
        </button>
      </li>
    );
  };

  // Klappbarer Gruppen-/Untergruppen-Kopf.
  const kopf = (id: string, label: string, anzahl: number, tief: boolean) => (
    <button type="button" onClick={() => toggle(id)} aria-expanded={offen(id)}
      className={`flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left transition-colors hover:bg-paper-sunken/60 ${tief ? 'text-xs text-ink-500 pl-3' : 'lc-overline'}`}>
      <span aria-hidden className={`text-micro text-ink-400 transition-transform ${offen(id) ? '' : '-rotate-90'}`}>▾</span>
      <span className="flex-1 truncate">{label}</span>
      <span className="num text-micro text-ink-400">{anzahl}</span>
    </button>
  );

  return (
    <div className="space-y-2">
      {gruppen.map(({ kat, items }) => {
        const katId = `kat:${kat}`;
        return (
          <div key={kat}>
            {kopf(katId, KAT_META[kat].label, items.length, false)}
            {offen(katId) && (
              kat === 'gesetze'
                // Gesetze-Gruppe gliedert sich nach Herkunft (Bund→Kanton→International);
                // Reiter ohne auflösbare Herkunft (Manifest noch nicht geladen) hängen
                // wir ans Ende (ohne Untertitel), damit nichts verschwindet.
                ? (() => {
                    const proHerkunft = new Map<Herkunft, TabEintrag[]>();
                    const ungeklaert: TabEintrag[] = [];
                    for (const t of items) {
                      const h = herkunftVon(t.path, manifeste);
                      if (h) (proHerkunft.get(h) ?? proHerkunft.set(h, []).get(h)!).push(t);
                      else ungeklaert.push(t);
                    }
                    return (
                      <div className="mt-0.5 space-y-1 pl-2">
                        {HERKUNFT_ORDER.filter((h) => (proHerkunft.get(h)?.length ?? 0) > 0).map((h) => {
                          const subId = `herk:${h}`;
                          const subItems = proHerkunft.get(h)!;
                          return (
                            <div key={h}>
                              {kopf(subId, HERKUNFT_LABEL[h], subItems.length, true)}
                              {offen(subId) && <ul className="mt-0.5 space-y-0.5">{subItems.map((t) => zeile(t, true, kat))}</ul>}
                            </div>
                          );
                        })}
                        {ungeklaert.length > 0 && <ul className="mt-0.5 space-y-0.5">{ungeklaert.map((t) => zeile(t, true, kat))}</ul>}
                      </div>
                    );
                  })()
                : <ul className="mt-0.5 space-y-0.5 pl-2">{items.map((t) => zeile(t, false, kat))}</ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
