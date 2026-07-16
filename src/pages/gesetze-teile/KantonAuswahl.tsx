// H-10 (§6.6 billig, B27): reiner Move aus Gesetze.tsx — Props/Verhalten unverändert.
import { useMemo, useState } from 'react';
import { usePaneKlasse } from '../../components/layout/PaneKontext';
import { type KantonGruppe } from '../../lib/normtext/browse';
import { GROSSREGIONEN } from '../../data/grossregionen';
// Kanton-Vollnamen: EINE Quelle (§5) — dieselbe Tabelle wie die Tarif-Domäne.
// Codes bleiben die SSoT; der Name macht Raster/Sidebar scannbar. Auf string
// verbreitert, da die Übersicht mit rohen Kanton-Codes (string) indexiert.
import { KANTON_NAMEN as KANTON_NAMEN_TYP } from '../../data/tarif/typen';
const KANTON_NAMEN: Record<string, string> = KANTON_NAMEN_TYP;
import { KantonWappen } from '../../components/KantonWappen';
import { SchweizKarte } from '../../components/SchweizKarte';
import { StufeBadge } from '../../components/normtext/Erfassungsgrad';
import { erfassungsgrad, STUFE_RANG, STUFE_WORT } from '../../lib/normtext/erfassungsgrad';

// Eine Kanton-Kachel des Auswahlrasters (Wappen · Vollname · Erlass-Zähler +
// Erfassungsgrad-Badge, IA-2 §11.2). Mobil-Fix (G5 · §4.3.6): der Vollname wird
// NICHT abgeschnitten (kein `truncate`) — er umbricht auf bis zu zwei Zeilen; der
// Code weicht per flex-wrap aus. So bleibt «Basel-Landschaft»/«Appenzell A.Rh.»
// auf 390px vollständig lesbar. Das Stufen-Wort steht als Text neben der Zahl
// (nie nur Farbe, §11.6.8).
function KantonKachel({ g, name, onWaehle }: { g: KantonGruppe; name: string; onWaehle: (k: string) => void }) {
  return (
    <button type="button" onClick={() => onWaehle(g.kanton)}
      className="lc-card group flex items-center gap-3 p-3.5 text-left transition-colors hover:border-brass-400">
      <KantonWappen kanton={g.kanton} className="h-9 w-8 shrink-0 transition-transform group-hover:scale-105" />
      <span className="flex flex-col min-w-0">
        <span className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-body-s font-medium text-ink-800 group-hover:text-brass-700 transition-colors">{name}</span>
          <span aria-hidden className="num text-xs text-ink-500 shrink-0">{g.kanton}</span>
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-ink-500"><span className="num">{g.erlasse.length}</span> Erlasse</span>
          <StufeBadge kanton={g.kanton} n={g.erlasse.length} />
        </span>
      </span>
    </button>
  );
}

// «Alle Kantone»-Auswahl (G5 · §4.3): entrümpelte Kantons-Übersicht. Kontext-Zeile
// (Mengen-Asymmetrie, §8) + gleichwertige Einstiege «Karte | Liste» (Karte default
// sichtbar, §4.3.3) + Sortierung Alphabet/Erlass-Zahl/Region auf dem 26er-Raster
// (§4.3.2). Reine Darstellung (§3), CLS-neutral (Umschalten tauscht Sichten, kein
// asynchron einwachsender Block).
export function KantonAuswahl({ gruppen, alleKantone, onWaehle }: {
  gruppen: KantonGruppe[]; alleKantone: string[]; onWaehle: (k: string) => void;
}) {
  const pk = usePaneKlasse();
  const [ansicht, setAnsicht] = useState<'karte' | 'liste'>('karte');
  // Y-B (David 16.7.2026): Default-Sortierung des 26er-Rasters = «Erlass-Zahl»
  // (Inhalt zuerst); Alphabet ist der Umschalter. A15-neutral (reine Anzeige, §3),
  // client-only — Prerender/Golden unberührt.
  const [sortierung, setSortierung] = useState<'alpha' | 'anzahl' | 'erfassung' | 'region'>('anzahl');
  const name = (k: string) => KANTON_NAMEN[k] ?? k;
  // Kanton → Gruppe (Erlass-Zahl), für die Karten-Bildunterschrift (§11.2).
  const proGruppe = useMemo(() => new Map(gruppen.map((g) => [g.kanton, g])), [gruppen]);

  // Flache Sortierung. Reine Anzeige (§3); die Gruppierung selbst bleibt in
  // gruppiereNachKanton. «Erfassung» (§11.1) sortiert dokumentiert-deterministisch
  // nach Stufe (dicht → dünn), Gleichstand über die Zahl, dann Vollname (A14).
  const sortiert = useMemo(() => {
    const arr = [...gruppen];
    if (sortierung === 'anzahl') {
      arr.sort((a, b) => b.erlasse.length - a.erlasse.length || name(a.kanton).localeCompare(name(b.kanton), 'de'));
    } else if (sortierung === 'erfassung') {
      arr.sort((a, b) =>
        STUFE_RANG[erfassungsgrad(a.kanton, a.erlasse.length).stufe] - STUFE_RANG[erfassungsgrad(b.kanton, b.erlasse.length).stufe]
        || b.erlasse.length - a.erlasse.length
        || name(a.kanton).localeCompare(name(b.kanton), 'de'));
    } else {
      arr.sort((a, b) => name(a.kanton).localeCompare(name(b.kanton), 'de'));
    }
    return arr;
  }, [gruppen, sortierung]);

  // «Region» = amtliche BFS-Grossregionen (grossregionen.ts), Kantone je Region
  // alphabetisch. Nur berechnet, wenn aktiv.
  const nachRegion = useMemo(() => {
    if (sortierung !== 'region') return [];
    const proKanton = new Map(gruppen.map((g) => [g.kanton, g]));
    return GROSSREGIONEN
      .map((r) => ({
        id: r.id, name: r.name,
        eintraege: r.kantone
          .map((k) => proKanton.get(k))
          .filter((g): g is KantonGruppe => !!g)
          .sort((a, b) => name(a.kanton).localeCompare(name(b.kanton), 'de')),
      }))
      .filter((r) => r.eintraege.length > 0);
  }, [gruppen, sortierung]);

  const rasterKlasse = pk(
    'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5',
    'grid grid-cols-2 @xl/pane:grid-cols-3 @4xl/pane:grid-cols-4 gap-2.5',
  );
  const kachel = (g: KantonGruppe) => <KantonKachel key={g.kanton} g={g} name={name(g.kanton)} onWaehle={onWaehle} />;

  return (
    <div className="space-y-5">
      {/* §4.3.1 — Kontext-Zeile: Mengen-Asymmetrie ehrlich erklären (§8). */}
      <p className="text-body-s text-ink-500 max-w-reading">
        Erfasst sind die in LexMetrik verwendeten kantonalen Erlasse — nicht die
        vollständige kantonale Gesetzessammlung. Kanton wählen: die Erlasse werden
        dann nach der amtlichen Systematik des Kantons (Sachgebiete) gegliedert.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        {/* §4.3.3 — Karte default sichtbar, gleichwertiger Einstieg neben dem Raster. */}
        <div role="group" aria-label="Ansicht" className="inline-flex rounded-md border border-line bg-paper-sunken/50 p-0.5 text-body-s">
          {(['karte', 'liste'] as const).map((a) => (
            <button key={a} type="button" onClick={() => setAnsicht(a)} aria-pressed={ansicht === a}
              className={`rounded px-3 py-1 font-medium transition-colors ${ansicht === a ? 'bg-paper text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'}`}>
              {a === 'karte' ? 'Karte' : 'Liste'}
            </button>
          ))}
        </div>
        {/* §4.3.2 — Sortierung des 26er-Rasters (nur in der Liste sinnvoll). */}
        {ansicht === 'liste' && (
          <div role="group" aria-label="Sortierung" className="inline-flex flex-wrap items-center gap-1.5">
            <span className="lc-overline">Sortieren</span>
            {([['alpha', 'Alphabet'], ['anzahl', 'Erlass-Zahl'], ['erfassung', 'Erfassungsgrad'], ['region', 'Region']] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setSortierung(id)} aria-pressed={sortierung === id}
                className={`rounded px-2 py-0.5 text-body-s font-medium transition-colors ${sortierung === id ? 'bg-brass-100 text-brass-800' : 'text-ink-500 hover:bg-paper-sunken hover:text-brass-700'}`}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {ansicht === 'karte' ? (
        <div className="lc-card p-4 sm:p-6">
          <SchweizKarte
            onWaehle={onWaehle}
            nameFuer={name}
            verfuegbar={(k) => alleKantone.includes(k)}
            zusatzFuer={(k) => {
              // Erfassungsgrad in der Karten-Bildunterschrift (§11.2): Zahl + Wort
              // (Text, nicht nur Farbe, §11.6.8). Nur für erfasste Kantone.
              const g = proGruppe.get(k);
              if (!g) return null;
              return (
                <>
                  <span className="num text-xs text-ink-500">{g.erlasse.length}</span>
                  <span className="text-xs text-ink-500">{g.erlasse.length === 1 ? 'Erlass' : 'Erlasse'} · {STUFE_WORT[erfassungsgrad(k, g.erlasse.length).stufe]}</span>
                </>
              );
            }}
          />
        </div>
      ) : sortierung === 'region' ? (
        <div className="space-y-5">
          {nachRegion.map((r) => (
            <section key={r.id} className="space-y-2.5">
              <div className="flex items-center gap-3">
                <h3 className="lc-overline text-brass-700">{r.name}</h3>
                <span className="num text-xs text-ink-500">{r.eintraege.length}</span>
                <span aria-hidden className="flex-1 h-px bg-line" />
              </div>
              <div className={rasterKlasse}>{r.eintraege.map(kachel)}</div>
            </section>
          ))}
        </div>
      ) : (
        <div className={rasterKlasse}>{sortiert.map(kachel)}</div>
      )}
    </div>
  );
}
