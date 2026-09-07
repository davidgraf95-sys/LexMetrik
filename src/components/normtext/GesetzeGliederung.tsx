// ─── Gliederungs-Umschalter + Relevanz-/Rechtsgebiet-Sichten der Übersichten ──
//    (A14 + A15, W2·5d) ──────────────────────────────────────────────────────
//
// REINE DARSTELLUNG (§3): drei austauschbare Ordnungen je Säule (Bund / Kantone /
// International). «Systematisch» (amtliche Systematik) und «Rechtsgebiet» (G6-
// Grundgerüst) bestehen bereits im Gesetze-Orchestrator; DIESE Datei liefert die
// NEUE «Relevanz»-Ordnung (A14/A15) + die für den Rechtsgebiet-Modus je Säule
// nötigen Gruppierungen (Kanton nach `rechtsgebiet`, International nach SR-0.*-
// Sachklasse) + den gemeinsamen Umschalter. Kriterium/Beleg: relevanz.ts.

import type { BrowseErlass } from '../../lib/normtext/browse-typen';
import { GEBIETE } from '../../lib/normtext/register';
import type { KantonSystematik } from '../../lib/normtext/systematik';
import {
  nachRelevanz, nachKantonRelevanz, SR0_KLASSEN, intlSachziffer,
} from '../../lib/normtext/relevanz';
import { GLIEDERUNGEN, type Gliederung } from '../../lib/normtext/gliederung';
import { ErlassKarte, ErlassTabelle } from './ErlassKarte';
import { usePaneKlasse } from '../layout/PaneKontext';
import { GruppenKopf } from '../ui/GruppenKopf';
import { Leerzustand } from '../ui/Leerzustand';

// ── Der gemeinsame Umschalter (ein Interaktions-Vokabular, A15/A4) ────────────

// D24 (David 6.9.2026, Sprach-Diät): der dreizeilige Erklärabsatz über der
// Kanton-Relevanz-Liste ist entfallen. Was er sagte, sagt jetzt der Reiter
// selbst — als `title` am Schalter, dort wo die Frage «was ordnet das?»
// entsteht, statt als Fliesstext über der Liste (D24: «als Tooltip am Reiter
// ‹Relevanz› oder weg»). Die §8-Vorbehalte der beiden anderen Sichten
// (kantonale Sach-Achse meist Default, EU-Recht ohne SR-Nummer) bleiben als
// sichtbarer Text stehen: sie berichten eine Lücke, das ist keine Erklärung,
// die man wegkürzt.
const GLIEDERUNG_HINWEIS: Record<Gliederung, string> = {
  relevanz: 'Die Kern-Erlasse zuerst — Verfassung, Einführungs- und Organisationsgesetze, Steuer- und Gebührenrecht; danach die amtliche Ordnung.',
  systematisch: 'Die amtliche Systematik der Sammlung.',
  rechtsgebiet: 'Nach Rechtsgebiet gruppiert (Sach-Achse des Registers).',
};

/** 3-Wege-Umschalter Relevanz · Systematisch · Rechtsgebiet. Echte Buttons mit
 *  role=group + aria-pressed (F3/F4). Gilt für alle drei Säulen gleich. */
export function GliederungUmschalter({ wert, onWahl }: {
  wert: Gliederung; onWahl: (g: Gliederung) => void;
}) {
  return (
    /* LM-055 (B15, 4.9.2026): Label und Optionen teilten sich einen einzigen
       `gap-1.5` — GEMESSEN auf `/gesetze?ebene=bund` @1440 lagen 6 px zwischen
       «GLIEDERUNG» und der ersten Option und ebenfalls 6 px zwischen zwei
       Optionen (`margin-right: 0px`). Ohne Rhythmus-Unterschied liest sich das
       Label als vierte Option. Der Fix ist der Abstand, nicht ein zusätzliches
       Bauteil: 12 px zum Label, 6 px innerhalb der Optionsreihe. Die Optionen
       stehen dafür in einer eigenen Reihe — `role="group"` und `aria-pressed`
       bleiben, wo sie waren (keine Zustandssemantik berührt, §3). */
    <div role="group" aria-label="Gliederung" className="inline-flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className="lc-overline">Gliederung</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {GLIEDERUNGEN.map((g) => (
          <button key={g.id} type="button" onClick={() => onWahl(g.id)} aria-pressed={wert === g.id}
            title={GLIEDERUNG_HINWEIS[g.id]}
            className={`rounded px-2.5 py-0.5 text-body-s font-medium transition-colors ${
              wert === g.id ? 'bg-brass-100 text-brass-800' : 'text-ink-500 lc-hover-flaeche hover:text-brass-700'
            }`}>
            {g.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Relevanz-Sichten ─────────────────────────────────────────────────────────

function RelevanzHinweis({ children }: { children: React.ReactNode }) {
  return <p className="text-body-s text-ink-500 max-w-reading">{children}</p>;
}

/** Bund/International: flaches Karten-Gitter nach kuratiertem Leitgesetz-Rang
 *  (relevanz.ts). Die relevantesten Erlasse zuerst (A15). */
export function RelevanzGitter({ erlasse }: { erlasse: BrowseErlass[] }) {
  const pk = usePaneKlasse();
  const sortiert = nachRelevanz(erlasse);
  if (sortiert.length === 0) return <Leerzustand art="bestand" text="Kein Erlass gefunden." />;
  return (
    <div className="space-y-4">
      <RelevanzHinweis>
        Die relevantesten Erlasse zuerst — nach dem kuratierten Leitgesetz-Rang des
        Registers (Verfassung und Kern-Kodifikationen zuoberst), dann nach Sach-Achse.
        Für die amtliche Ordnung «Systematisch» wählen.
      </RelevanzHinweis>
      <div className={pk('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3', 'grid grid-cols-1 @lg/pane:grid-cols-2 @3xl/pane:grid-cols-3 gap-3')}>
        {sortiert.map((e) => <ErlassKarte key={e.key} e={e} />)}
      </div>
    </div>
  );
}

/** Kanton: flache, überlaufsichere Liste nach Kern-Erlass-Kategorie, dann
 *  Systematik (A14). Kern-Erlasse (Verfassung / EG / GOG / Steuer) zuerst. */
export function KantonRelevanzListe({ erlasse, sys }: {
  erlasse: BrowseErlass[]; sys?: KantonSystematik;
}) {
  const sortiert = nachKantonRelevanz(erlasse, sys);
  if (sortiert.length === 0) return <Leerzustand art="bestand" text="Kein Erlass gefunden." />;
  /* ── D24 (David 6.9.2026) · EINE TABELLE STATT ZWEIER SPALTEN-FRAGMENTE ────
     Hier stand `lc-listenspalten columns-1 sm:columns-2` mit je einer
     `SysZeile` je Erlass. CSS-`columns` erzeugt ZWEI UNABHÄNGIGE Fragmente:
     GEMESSEN 6.9.2026 auf `/gesetze?ebene=kanton&kt=BS&gliederung=relevanz`
     (859 Erlasse, Preview `dist`) stand Zeile i links gegen Zeile i rechts
     @1440 um bis zu 105 px versetzt, @1280 um bis zu 126 px — die Zeilen
     «beider spalten» lagen also gerade nicht «auf selber höhe».
     `ui/ListenTabelle` legt EIN Raster über beide Spalten (Zeile i ist links
     und rechts dieselbe Grid-Zeile) und füllt es weiter SPALTENWEISE, damit
     die Leserichtung aus LM-141 (erst links hinunter, dann rechts) bleibt.
     Der Erklärabsatz darüber ist entfallen (Sprach-Diät, D24) — sein Inhalt
     steht als `title` am Reiter «Relevanz», s. GLIEDERUNG_HINWEIS. */
  return (
    <ErlassTabelle
      erlasse={sortiert}
      art="kanton"
      beschriftung="Erlasse nach Relevanz — Nummer, Titel, Umfang"
    />
  );
}

// ── Rechtsgebiet-Modus je Säule (die G6-Achse in den anderen Säulen) ──────────

/** Kanton: die Erlasse eines Kantons nach der Register-Sach-Achse `rechtsgebiet`
 *  (A15 «Rechtsgebiet» in der Kanton-Säule). Ehrlich (§8): kantonale Erlasse
 *  tragen das Rechtsgebiet meist als Default ('öffentlich') — die feinere
 *  amtliche Ordnung liefert «Systematisch». */
export function KantonGebietGruppen({ erlasse }: { erlasse: BrowseErlass[] }) {
  const proGebiet = new Map<string, BrowseErlass[]>();
  for (const e of erlasse) {
    const arr = proGebiet.get(e.rechtsgebiet) ?? [];
    arr.push(e);
    proGebiet.set(e.rechtsgebiet, arr);
  }
  const gruppen = GEBIETE
    .map((g) => ({ ...g, items: (proGebiet.get(g.id) ?? []).sort((a, b) => a.titel.localeCompare(b.titel, 'de')) }))
    .filter((g) => g.items.length > 0);
  if (gruppen.length === 0) return <Leerzustand art="bestand" text="Kein Erlass gefunden." />;
  return (
    <div className="space-y-6">
      <RelevanzHinweis>
        Nach Rechtsgebiet gruppiert. Kantonale Erlasse tragen die Sach-Achse meist
        als Default — die feinere amtliche Ordnung liefert «Systematisch».
      </RelevanzHinweis>
      {gruppen.map((g) => (
        <section key={g.id} className="space-y-2.5">
          {/* C-2 (31.8.2026): Anatomie und Haarlinie liegen jetzt im
              geteilten `GruppenKopf` — mitsamt dem DESIGN-D0-Befund
              (unsuffixiertes `bg-line`, weil Tailwinds Deckkraft-Suffix auf
              dem color-mix-Token `--line` keine CSS-Regel erzeugt). */}
          <GruppenKopf titel={g.label} zahl={g.items.length} />
          {/* D24: dieselbe Umstellung wie in der Relevanz-Sicht — EIN Raster
              über beide Spalten statt zweier `columns`-Fragmente. */}
          <ErlassTabelle erlasse={g.items} art="kanton"
            beschriftung={`${g.label} — Nummer, Titel, Umfang`} />
        </section>
      ))}
    </div>
  );
}

/** International: nach SR-0.*-Sachklasse gruppiert (A15 «Rechtsgebiet» in der
 *  International-Säule) — die amtliche Völkerrechts-Sachachse (Fedlex SR 0.1–0.9);
 *  EU-Verordnungen ohne SR-Nummer bilden ehrlich eine eigene Gruppe (§8). */
export function IntlRechtsgebietSicht({ erlasse }: { erlasse: BrowseErlass[] }) {
  const pk = usePaneKlasse();
  const proZiffer = new Map<string, BrowseErlass[]>();
  const euRecht: BrowseErlass[] = [];
  for (const e of erlasse) {
    const z = intlSachziffer(e.sr);
    if (z == null) { euRecht.push(e); continue; }
    const arr = proZiffer.get(z) ?? [];
    arr.push(e);
    proZiffer.set(z, arr);
  }
  const gruppen = SR0_KLASSEN
    .map((k) => ({ ...k, items: (proZiffer.get(k.ziffer) ?? []).sort((a, b) => (a.sr ?? '').localeCompare(b.sr ?? '', 'de', { numeric: true })) }))
    .filter((k) => k.items.length > 0);
  const gitter = pk('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3', 'grid grid-cols-1 @lg/pane:grid-cols-2 @3xl/pane:grid-cols-3 gap-3');
  if (gruppen.length === 0 && euRecht.length === 0) {
    return <Leerzustand art="bestand" text="Kein Eintrag gefunden." />;
  }
  return (
    <div className="space-y-10">
      <RelevanzHinweis>
        Nach der amtlichen Völkerrechts-Sachachse der Systematischen Rechtssammlung
        (SR 0.1–0.9); EU-Verordnungen ohne SR-Nummer bilden eine eigene Gruppe.
      </RelevanzHinweis>
      {gruppen.map((g) => (
        <section key={g.ziffer} className="space-y-3">
          <GruppenKopf stufe={2} titel={g.label} zahl={g.items.length}
            marke={<span aria-hidden className="num font-display text-h3 leading-none text-brass-700">0.{g.ziffer}</span>} />
          <div className={gitter}>{g.items.map((e) => <ErlassKarte key={e.key} e={e} />)}</div>
        </section>
      ))}
      {euRecht.length > 0 && (
        <section className="space-y-3">
          <GruppenKopf stufe={2} titel="EU-Recht (EUR-Lex)" zahl={euRecht.length} />
          <div className={gitter}>{euRecht.map((e) => <ErlassKarte key={e.key} e={e} />)}</div>
        </section>
      )}
    </div>
  );
}
