import { Fragment, useState } from 'react';
import { SUCH_META } from '../suchHighlight';
import { badgesFuer, type LeserTreffer } from '../leserSuche';

// ═══ Trefferliste der In-Gesetz-Suche (Zone B) ═══════════════════════════════
//
// W2·19-GLIEDERUNG · S8. Bau-Spec fahrplaene/FAHRPLAN-W2-19-SEITENLEISTE.md
// §4.3 (Anatomie), §4.4 (findbar/malbar-Vertrag), Entscheid David (c) 8.8.2026:
// «Suche = Trefferliste in der Seitenleiste mit Textausschnitten, Lesespalte
// bleibt vollständig und springt».
//
// WAS SICH GEGENÜBER DEM BESTAND ÄNDERT. Bis S8 filterte die LESESPALTE: der
// Volltext verschwand, an seiner Stelle standen die Treffer-Artikel. Damit war
// der amtliche Text im Suchmodus unvollständig — man konnte nicht weiterlesen,
// und jeder Sprung zu einem Artikel musste erst die Suche verlassen. Jetzt
// bleibt die Lesespalte vollständig; diese Liste ist das Verzeichnis daneben.
//
// SIE RECHNET NICHTS. Zahlen, Reihenfolge, Ausschnitte und Badges kommen
// fertig aus `leserSuche.ts` (rein, unit-getestet) — hier lebt nur Darstellung
// (§3). Insbesondere ist der Zähler DATENSEITIG (§4.4 Ziff. 1): er zählt, was
// im Erlass steht, nicht was der DOM gerade malt. Deshalb ändert er sich auch
// nicht, wenn der Leser Fussnoten aus- oder einblendet — stattdessen sagt der
// Badge «(ausgeblendet)», statt die Ansicht still umzuschalten (§8).
//
// `data-such-meta` an der Wurzel (SUCH_META): diese Liste ist BEDIENUNG, kein
// Gesetzestext. Der Highlight-Walker überspringt solche Teilbäume vollständig —
// sonst zählte ein Begriff seine eigenen Ausschnitte mit (Bug-Check §9 vom
// 4.8.2026, B1: gemeldet 425, beim Sprung 681).

/** B10: so viele Treffer-Zeilen malt die Leiste auf einmal (Herleitung unten). */
export const TREFFER_DECKEL = 200;

export interface TrefferListeProps {
  treffer: LeserTreffer[];
  /** Gesuchter Begriff (getrimmt) — nur zur Anzeige. */
  begriff: string;
  /** Datenseitige Gesamtzahl der Fundstellen (§4.4 Ziff. 1). */
  fundstellen: number;
  /** `html[data-fussnoten="aus"]` — steuert allein die BADGE-Ehrlichkeit. */
  aenderungenAus: boolean;
  /** 0-basierte laufende Fundstelle der ↑↓-Navigation; -1 = noch keine. */
  position: number;
  /** Artikel-Token der laufenden Fundstelle (markiert die Zeile). */
  aktivToken: string | null;
  onZurueck: () => void;
  onVor: () => void;
  onSprung: (token: string) => void;
}

/** Ausschnitt mit hervorgehobenem Begriff — aus den QUELL-Strings, nie aus dem
 *  DOM (Spec §4.3): deterministisch, kein TreeWalker-Volllauf. */
function Ausschnitt({ t }: { t: LeserTreffer }) {
  const a = t.ausschnitt;
  if (!a) return null;
  return (
    // Zusatzpunkt David 9.8.2026: der Ausschnitt ist echter Fliesstext-Auszug,
    // kein kontrolliertes Label — `[overflow-wrap:anywhere]` schützt den
    // [data-toc]-Scroller vor einem unbrechbaren Lauftext-Fragment.
    <p className="lc-such-ausschnitt mt-0.5 text-micro leading-snug text-ink-600 [overflow-wrap:anywhere]">
      {a.vor}<mark>{a.treffer}</mark>{a.nach}
    </p>
  );
}

export function TrefferListe({
  treffer, begriff, fundstellen, aenderungenAus, position, aktivToken, onZurueck, onVor, onSprung,
}: TrefferListeProps) {
  const hatSprung = fundstellen > 0;
  const anzeige = position < 0 ? '–' : String(position + 1);
  // Zwischenkopf des Top-Kapitels (§4.3), EINMAL vorberechnet statt im Render
  // mitgeschleppt. Er erscheint bei JEDEM Wechsel der Gruppe.
  //
  // NACHGEZOGEN MIT S4 (16.8.2026): hier stand, die Liste sei nach Feldgewicht
  // sortiert und ein Kapitel könne darum mehrfach auftauchen — das war der
  // ehrliche Vermerk zur damaligen Rangfolge und ist seit der Umstellung auf
  // Dokument-Reihenfolge (`leserSuche.ts`, S4) schlicht falsch. Da die Treffer
  // jetzt in Erlass-Reihenfolge kommen, erscheint jedes Kapitel genau einmal,
  // und dieselbe Zeile «Kopf bei Gruppenwechsel» leistet ohne Änderung das,
  // wonach sie aussieht: eine einmalige Überschrift über einem
  // zusammenhängenden Abschnitt. Nur der Kommentar wird korrigiert — die
  // Darstellungsregel bleibt Zeile für Zeile dieselbe.
  // ── B10 (Bug-Check §9 zu S8): die Liste ist gedeckelt ──────────────────────
  // «der» im OR ergibt 1146 Treffer-Artikel und damit rund 16'700 DOM-Knoten in
  // demselben Scroller, in dem S1–S7 den Gliederungsbaum gerade auf ~1'300
  // gedrückt haben (Unmount zugeklappter Äste) — und jede ↑↓-Navigation rendert
  // sie neu. Datenseitig ist das harmlos (gemessen ≤ 5 ms) und immer noch klar
  // besser als der Vor-S8-Zustand (voller Lesespalten-Remount), aber es reisst
  // die Knotenzahl-Lehre desselben Slices im selben Scroller.
  //
  // GEDECKELT WIRD DIE ANZEIGE, NICHT DIE SUCHE: der Kopf-Zähler nennt weiter
  // ALLE Artikel und ALLE Fundstellen, und die ↑↓-Navigation läuft unverändert
  // über die volle Folge — sie hängt an `fundstellenFolge`, nicht an dieser
  // Liste. Es verschwindet also keine Information, es wird nur später gemalt
  // (§8: der Knopf sagt, wie viele noch kommen).
  //
  // 200 Zeilen: darüber ist eine Leiste ohnehin kein Verzeichnis mehr, das man
  // überblickt, und der Deckel liegt weit über dem, was eine gezielte
  // Juristen-Suche liefert (BGFA «Berufsregeln»: 6). Der Zustand hängt am
  // BEGRIFF — eine neue Anfrage fängt wieder bei 200 an, sonst bliebe eine
  // einmal aufgeklappte Riesenliste für den Rest der Sitzung stehen.
  // `begriff` ist der GÜLTIGKEITS-SCHLÜSSEL des Deckels — derselbe Kniff, mit
  // dem `nav` in inhalt-suchtreffer.tsx seine Position gültig hält: ein Deckel
  // zu einem FRÜHEREN Begriff wird beim Render verworfen, statt ihn in einem
  // Effekt zurückzusetzen. Das vermeidet den Kaskaden-Render, den
  // `react-hooks/set-state-in-effect` im Haus verbietet.
  const [gemerkt, setGemerkt] = useState<{ begriff: string; n: number }>({ begriff, n: TREFFER_DECKEL });
  const deckel = gemerkt.begriff === begriff ? gemerkt.n : TREFFER_DECKEL;
  const sichtbar = treffer.slice(0, deckel);
  const rest = treffer.length - sichtbar.length;
  const zeilen = sichtbar.map((t, i) => ({
    t, kopf: t.gruppe !== null && t.gruppe !== (sichtbar[i - 1]?.gruppe ?? null) ? t.gruppe : null,
  }));

  return (
    <div {...{ [SUCH_META]: '' }} data-treffer-liste className="pb-2">
      {/* ── Listenkopf (§4.3) — Funktions-Nachfolger der früheren `TrefferLeiste`
          am Kopf der gefilterten Lesespalte. Die `data-treffer-*`-Attribute
          wandern unverändert mit, damit die Bedienung dieselbe bleibt und die
          e2e-Sonden auf denselben Sachverhalt zeigen.
          §15.2 CLS 0: feste Zeilenhöhe, ab dem ersten Render vorhanden; der
          Zähler ist datenseitig und steht sofort — es wächst nichts nach. */}
      {/* ZWEI Zeilen statt einer: in der 18-rem-Leiste (Spec §2) bleiben neben
          zwei 44-px-Tap-Zielen und der Positionsanzeige keine 10 rem für
          «11 Artikel · 17 Fundstellen» — gemessen im Bau brach der Zähler auf
          «17 Fundste…» um. Eine abgekürzte Zahl wäre §8-widrig (der Zähler IST
          die Aussage), ein kleineres Tap-Ziel a11y-widrig (A9-DoD). Also
          bekommt jede der beiden Angaben ihre Zeile. */}
      {/* B6: klebt UNTER Zone A, nicht über ihr. `--toc-deckel` setzt Zone A
          selbst (inhalt-volltext.tsx, gemessen); der Rückfall 0px hält den
          Vorzustand, falls die Marke einmal fehlt. */}
      <div data-treffer-leiste
        style={{ top: 'var(--toc-deckel, 0px)' }}
        className="sticky z-sticky bg-paper pb-1 pt-0.5 text-body-s text-ink-500">
        <p className="min-h-5 truncate">
          <span className="num">{treffer.length}</span> Artikel
          <span aria-hidden className="mx-1 text-ink-300">·</span>
          <span className="num">{fundstellen}</span>
          {fundstellen === 1 ? ' Fundstelle' : ' Fundstellen'}
        </p>
        {hatSprung && (
          <div className="flex items-center justify-end gap-1">
            <span data-treffer-position role="status" aria-live="polite"
              className="text-micro lc-ziffern text-ink-500">
              <span className="num">{anzeige}</span>/<span className="num">{fundstellen}</span>
            </span>
            {/* A9-DoD: 44×44-px-Tap-Ziele, echte <button> (Tastatur), aria-label. */}
            <button type="button" onClick={onZurueck} data-treffer-zurueck
              aria-label="Vorherige Fundstelle" title="Vorherige Fundstelle"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-600 transition-colors lc-hover-flaeche hover:text-brass-700">
              <span aria-hidden className="lc-griff-glyph">↑</span>
            </button>
            <button type="button" onClick={onVor} data-treffer-vor
              aria-label="Nächste Fundstelle" title="Nächste Fundstelle"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-600 transition-colors lc-hover-flaeche hover:text-brass-700">
              <span aria-hidden className="lc-griff-glyph">↓</span>
            </button>
          </div>
        )}
      </div>

      {/* §8: ehrliche Leerzeile statt eines leeren Kastens.
          ── P1-4 (Bug-Check 18.8.2026) · DIE ABSAGE WIRD ANGESAGT ──────────────
          Der Satz war stumm: wer blind sucht, tippt, hört nichts und weiss nicht,
          ob die Suche noch läuft oder nichts gefunden hat. Die Sprung-Absage
          daneben («… gibt es in diesem Erlass nicht») ist seit je eine
          Live-Region — die Such-Absage ist derselbe Sachverhalt und bekommt
          dieselbe Ansage.
          `status`, nicht `alert`: es ist eine Auskunft, keine Störung; `alert`
          unterbricht die laufende Ansage, und das wäre beim Tippen jede Taste.
          IMMER GEMOUNTET, nicht zusammen mit dem Text: eine Live-Region, die erst
          mit ihrem Inhalt entsteht, wird von einem Teil der Screenreader nicht
          vorgelesen — sie muss vor der Änderung dastehen. `empty:hidden` hält sie
          ohne Inhalt aus dem Fluss (kein Leerraum, kein CLS). */}
      <p data-treffer-leer role="status" className="px-1 py-2 text-body-s text-ink-500 empty:hidden">
        {treffer.length === 0 && <>Kein Artikel gefunden für «{begriff}».</>}
      </p>

      <ul className="space-y-0.5">
        {zeilen.map(({ t, kopf }) => {
          const badges = badgesFuer(t, aenderungenAus);
          const aktiv = aktivToken === t.token;
          return (
            <Fragment key={t.token}>
              {kopf !== null && (
                // `lc-overline` trägt die kalibrierte ink-600-Basis; ein
                // Dimm-Override wäre bei 11 px ein AA-Fail (check:design-tokens,
                // D-1.2/E1).
                <li aria-hidden className="lc-overline px-1 pb-0.5 pt-3">
                  <span className="line-clamp-1" title={kopf}>{kopf}</span>
                </li>
              )}
              <li data-treffer-artikel={t.token} data-fundstellen-zahl={t.fundstellen}>
                <button type="button" onClick={() => onSprung(t.token)}
                  data-treffer-aktiv={aktiv ? '1' : undefined}
                  aria-current={aktiv ? 'location' : undefined}
                  className={`w-full rounded px-1.5 py-1.5 text-left transition-colors ${aktiv ? 'bg-paper-sunken/70' : 'lc-hover-flaeche'}`}>
                  <span className="flex items-baseline gap-2">
                    <span className="num shrink-0 text-body-s font-semibold text-ink-800">{t.label}</span>
                    {t.randtitel && (
                      <span className="min-w-0 flex-1 truncate font-serif text-xs text-ink-600" title={t.randtitel}>{t.randtitel}</span>
                    )}
                    <span className="ml-auto shrink-0 text-micro lc-ziffern text-ink-500">{t.fundstellen}</span>
                  </span>
                  <Ausschnitt t={t} />
                  {badges.length > 0 && (
                    // Herkunfts-Badge (§4.3/§4.4 Ziff. 2): SICHTBARER Text, nie
                    // nur `title` — der Leser sieht, warum der Artikel trifft,
                    // auch wenn im Wortlaut nichts leuchtet.
                    <span className="mt-1 flex flex-wrap gap-1">
                      {badges.map((b) => (
                        <span key={b} data-treffer-badge
                          className="rounded border border-line px-1 text-micro leading-4 text-ink-500">{b}</span>
                      ))}
                    </span>
                  )}
                </button>
              </li>
            </Fragment>
          );
        })}
      </ul>

      {rest > 0 && (
        // §8: die Zahl steht dran — der Leser weiss, dass da noch etwas ist,
        // und wie viel. 44-px-Tap-Ziel wie die Navigationsknöpfe (A9-DoD).
        <button type="button" data-treffer-mehr onClick={() => setGemerkt({ begriff, n: deckel + TREFFER_DECKEL })}
          className="mt-2 flex min-h-11 w-full items-center justify-center rounded-md px-2 text-body-s text-ink-600 transition-colors lc-hover-flaeche hover:text-brass-700">
          {rest} weitere anzeigen
        </button>
      )}
    </div>
  );
}
