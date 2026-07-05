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
import { ErlassKarte, SysZeile } from './ErlassKarte';
import { usePaneKlasse } from '../layout/PaneKontext';

// ── Der gemeinsame Umschalter (ein Interaktions-Vokabular, A15/A4) ────────────

/** 3-Wege-Umschalter Relevanz · Systematisch · Rechtsgebiet. Echte Buttons mit
 *  role=group + aria-pressed (F3/F4). Gilt für alle drei Säulen gleich. */
export function GliederungUmschalter({ wert, onWahl }: {
  wert: Gliederung; onWahl: (g: Gliederung) => void;
}) {
  return (
    <div role="group" aria-label="Gliederung" className="inline-flex flex-wrap items-center gap-1.5">
      <span className="lc-overline text-ink-500">Gliederung</span>
      {GLIEDERUNGEN.map((g) => (
        <button key={g.id} type="button" onClick={() => onWahl(g.id)} aria-pressed={wert === g.id}
          className={`rounded px-2.5 py-0.5 text-body-s font-medium transition-colors ${
            wert === g.id ? 'bg-brass-100 text-brass-800' : 'text-ink-500 hover:bg-paper-sunken hover:text-brass-700'
          }`}>
          {g.label}
        </button>
      ))}
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
  if (sortiert.length === 0) return <p className="text-body-s text-ink-500">Kein Erlass gefunden.</p>;
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
  const pk = usePaneKlasse();
  const sortiert = nachKantonRelevanz(erlasse, sys);
  if (sortiert.length === 0) return <p className="text-body-s text-ink-500">Kein Erlass gefunden.</p>;
  return (
    <div className="space-y-4">
      <RelevanzHinweis>
        Die Kern-Erlasse zuerst — Kantonsverfassung, Einführungsgesetze,
        Gerichts- und Behördenorganisation, Steuer- und Gebührenrecht —, danach
        nach der amtlichen Systematik des Kantons. Für die volle amtliche
        Gliederung «Systematisch» wählen.
      </RelevanzHinweis>
      <div className={pk('grid grid-cols-1 sm:grid-cols-2 gap-x-5', 'grid grid-cols-1 @lg/pane:grid-cols-2 gap-x-5')}>
        {sortiert.map((e) => <SysZeile key={e.key} e={e} />)}
      </div>
    </div>
  );
}

// ── Rechtsgebiet-Modus je Säule (die G6-Achse in den anderen Säulen) ──────────

/** Kanton: die Erlasse eines Kantons nach der Register-Sach-Achse `rechtsgebiet`
 *  (A15 «Rechtsgebiet» in der Kanton-Säule). Ehrlich (§8): kantonale Erlasse
 *  tragen das Rechtsgebiet meist als Default ('öffentlich') — die feinere
 *  amtliche Ordnung liefert «Systematisch». */
export function KantonGebietGruppen({ erlasse }: { erlasse: BrowseErlass[] }) {
  const pk = usePaneKlasse();
  const proGebiet = new Map<string, BrowseErlass[]>();
  for (const e of erlasse) {
    const arr = proGebiet.get(e.rechtsgebiet) ?? [];
    arr.push(e);
    proGebiet.set(e.rechtsgebiet, arr);
  }
  const gruppen = GEBIETE
    .map((g) => ({ ...g, items: (proGebiet.get(g.id) ?? []).sort((a, b) => a.titel.localeCompare(b.titel, 'de')) }))
    .filter((g) => g.items.length > 0);
  if (gruppen.length === 0) return <p className="text-body-s text-ink-500">Kein Erlass gefunden.</p>;
  return (
    <div className="space-y-6">
      <RelevanzHinweis>
        Nach Rechtsgebiet gruppiert. Kantonale Erlasse tragen die Sach-Achse meist
        als Default — die feinere amtliche Ordnung liefert «Systematisch».
      </RelevanzHinweis>
      {gruppen.map((g) => (
        <section key={g.id} className="space-y-2.5">
          <div className="flex items-baseline gap-3">
            <h3 className="lc-overline text-brass-700">{g.label}</h3>
            <span className="num text-xs text-ink-500">{g.items.length}</span>
            <span aria-hidden className="flex-1 h-px bg-line/70" />
          </div>
          <div className={pk('grid grid-cols-1 sm:grid-cols-2 gap-x-5', 'grid grid-cols-1 @lg/pane:grid-cols-2 gap-x-5')}>
            {g.items.map((e) => <SysZeile key={e.key} e={e} />)}
          </div>
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
    return <p className="text-body-s text-ink-500">Kein Eintrag gefunden.</p>;
  }
  return (
    <div className="space-y-10">
      <RelevanzHinweis>
        Nach der amtlichen Völkerrechts-Sachachse der Systematischen Rechtssammlung
        (SR 0.1–0.9); EU-Verordnungen ohne SR-Nummer bilden eine eigene Gruppe.
      </RelevanzHinweis>
      {gruppen.map((g) => (
        <section key={g.ziffer} className="space-y-3">
          <div className="flex items-center gap-3">
            <span aria-hidden className="num font-display text-h3 leading-none text-brass-700">0.{g.ziffer}</span>
            <h2 className="font-sans font-semibold text-ink-900 text-h3 tracking-tight">{g.label}</h2>
            <span aria-hidden className="flex-1 h-px bg-line" />
            <span className="num text-body-s text-ink-500">{g.items.length}</span>
          </div>
          <div className={gitter}>{g.items.map((e) => <ErlassKarte key={e.key} e={e} />)}</div>
        </section>
      ))}
      {euRecht.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="font-sans font-medium text-ink-700 text-body-l">EU-Recht (EUR-Lex)</h2>
            <span aria-hidden className="flex-1 h-px bg-line" />
            <span className="num text-body-s text-ink-500">{euRecht.length}</span>
          </div>
          <div className={gitter}>{euRecht.map((e) => <ErlassKarte key={e.key} e={e} />)}</div>
        </section>
      )}
    </div>
  );
}
