// H-10 (§6.6 billig, B27): reiner Move aus Gesetze.tsx — Props/Verhalten unverändert.
import { useMemo, useState } from 'react';
import { usePaneKlasse } from '../../components/layout/PaneKontext';
import { GruppenKopf } from '../../components/ui/GruppenKopf';
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
import { Tabs } from '../../components/ui/Tabs';
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
export function KantonAuswahl({ gruppen, alleKantone, onWaehle, ansicht, onAnsicht }: {
  gruppen: KantonGruppe[]; alleKantone: string[]; onWaehle: (k: string) => void;
  /** Karte/Liste — der Zustand liegt beim Aufrufer, damit er die Kantons-Wahl
   *  überlebt (die Übersicht unmountet dabei; Fehlerbuch-Befund 41). */
  ansicht: 'karte' | 'liste'; onAnsicht: (a: 'karte' | 'liste') => void;
}) {
  const pk = usePaneKlasse();
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
      {/* §4.3.1 — Kontext-Zeile: Mengen-Asymmetrie ehrlich erklären (§8).
          O4 (W2·10-UI-NAV-O): der Satz versprach die Systematik-Gliederung für
          JEDEN Kanton. Sie hängt aber am amtlichen Systematik-Baum
          (public/normtext/kanton-systematik.json), den nicht jeder Kanton
          liefert — wo er fehlt, bündelt KantonSystematik.tsx die Erlasse
          ehrlich unter «Nicht systematisiert». Zwei Versprechen für dieselbe
          Sache waren ein §8-Verstoss; jetzt steht die Einschränkung VOR dem
          Klick, nicht erst danach. */}
      <p className="text-body-s text-ink-500 max-w-reading">
        Erfasst sind die in LexMetrik verwendeten kantonalen Erlasse — nicht die
        vollständige kantonale Gesetzessammlung. Kanton wählen: die Erlasse werden
        dann nach der amtlichen Systematik des Kantons (Sachgebiete) gegliedert,
        soweit sie hinterlegt ist — sonst stehen sie unter «Nicht systematisiert».
      </p>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        {/* §4.3.3 — Karte default sichtbar, gleichwertiger Einstieg neben dem Raster.
            ── LM-054/LM-057 (B15, 4.9.2026) · EIN UMSCHALTER-BILD ──────────────
            Hier stand die vierte Kopie der Segmented-Control — und sie war zum
            Befund geworden, weil die Ebenen-Leiste darüber (`Gesetze.tsx`) mit
            dem E-2-Nachzug (31.8.2026) auf den geteilten Baustein umgezogen ist
            und die Kopie zurückblieb. GEMESSEN @1440 auf `/gesetze?ebene=kanton`
            standen darum ZWEI Gestalten derselben Sache übereinander:
              Ebene    Rahmen 12 px / 1 px Linie / bg-surface, aktiv 8 px, 1 px
                       Linie, bg-surface-raised, Tinte brass-700 (130,98,37)
              Ansicht  Rahmen 8 px / 1 px Linie / paper-sunken/50, aktiv 4 px,
                       OHNE Linie, bg-paper, Tinte ink-900 (28,26,21)
            Die Dedup-Notiz vom 31.7.2026 («dasselbe Bild») war damals richtig
            und ist durch den Umzug überholt — der Stilbruch ist neu, nicht
            widerlegt. Der Baustein kann diese Leiste unverändert: `mode="pressed"`
            liefert `role="group"` + `aria-pressed` wie zuvor, `groesse="m"` die
            bisherige Anatomie (px-3, text-body-s). Kein Zustand, keine
            Bedienlogik berührt (§3); die Kopie fällt weg (§5/§17). */}
        <Tabs
          items={[{ code: 'karte', label: 'Karte' }, { code: 'liste', label: 'Liste' }] as const}
          value={ansicht} onChange={onAnsicht} mode="pressed" ariaLabel="Ansicht" />
        {/* §4.3.2 — Sortierung des 26er-Rasters (nur in der Liste sinnvoll).
            LM-055 (B15, 4.9.2026): Label und Optionen standen im selben
            `gap-1.5` — GEMESSEN 6 px zwischen «SORTIEREN» und der ersten
            Option, exakt so viel wie zwischen zwei Optionen; das Label las sich
            als fünfte Option. Jetzt trennt der Rhythmus: 12 px zum Label, 6 px
            innerhalb der Reihe. Padding auf px-2.5 wie beim Gliederungs-
            Umschalter derselben Seitengruppe (ein Bild, §5). */}
        {ansicht === 'liste' && (
          <div role="group" aria-label="Sortierung" className="inline-flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="lc-overline">Sortieren</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {([['alpha', 'Alphabet'], ['anzahl', 'Erlass-Zahl'], ['erfassung', 'Erfassungsgrad'], ['region', 'Region']] as const).map(([id, label]) => (
                <button key={id} type="button" onClick={() => setSortierung(id)} aria-pressed={sortierung === id}
                  className={`rounded px-2.5 py-0.5 text-body-s font-medium transition-colors ${sortierung === id ? 'bg-brass-100 text-brass-800' : 'text-ink-500 lc-hover-flaeche hover:text-brass-700'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {ansicht === 'karte' ? (
        <div className="lc-card p-4 sm:p-6">
          <SchweizKarte
            onWaehle={onWaehle}
            nameFuer={name}
            verfuegbar={(k) => alleKantone.includes(k)}
            gradFuer={(k) => {
              // Erfassungsgrad für Füllung, Legende, Tooltip UND Bildunterschrift
              // der Karte (§11.2) — EINE Ableitung aus der SSoT erfassungsgrad.ts
              // (§5, dieselbe wie Kachel-Badge und Schnellwechsel-Pill). Der Text
              // trägt Zahl + Zustands-Wort, damit die Aussage nie nur an der Farbe
              // hängt (§11.6.8). Kein Eintrag ⇒ keine erfassten Erlasse.
              const g = proGruppe.get(k);
              if (!g) return null;
              const n = g.erlasse.length;
              return {
                stufe: erfassungsgrad(k, n).stufe,
                text: `${n} ${n === 1 ? 'Erlass' : 'Erlasse'} · ${STUFE_WORT[erfassungsgrad(k, n).stufe]}`,
              };
            }}
          />
        </div>
      ) : sortierung === 'region' ? (
        <div className="space-y-5">
          {nachRegion.map((r) => (
            <section key={r.id} className="space-y-2.5">
              <GruppenKopf titel={r.name} zahl={r.eintraege.length} />
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
