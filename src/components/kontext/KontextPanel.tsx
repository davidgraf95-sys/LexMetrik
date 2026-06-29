import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  kontextSync, kontextEntscheide,
  type KontextTyp, type EntscheidRef,
} from '../../lib/kontext';
import { usePaneSteuerung } from '../layout/usePaneLayout';

// ─── Einheitliches «Kontext»-Panel (B3) ─────────────────────────────────────
//
// EIN wiederverwendbares Panel für alle drei Korpus-Reader (Gesetz, Entscheid,
// Material). Es zeigt die fremden Korpora, die über die `normKeys` der Quelle
// verknüpft sind: Norm → Entscheide/Materialien/Werkzeuge; Entscheid →
// Normen/Materialien/Werkzeuge; Material → Normen/Entscheide/Werkzeuge. Reine
// Darstellung (§3) — Auflösung liegt in lib/kontext.ts. Verknüpfungen sind
// maschinell über zitierte Normen (§8 ehrlich gekennzeichnet, keine geprüfte
// Auswahl). Voller Zustands-Bogen inkl. ruhigem Leerzustand (§13/F4).

const MAX_ENTSCHEIDE = 8;

function Gruppe({ titel, anzahl, children, hinweis }: {
  titel: string; anzahl: number; children: ReactNode; hinweis?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="lc-overline text-ink-600">
        {titel} <span className="num text-ink-500">{anzahl}</span>
      </h3>
      {children}
      {hinweis && <p className="text-micro text-ink-500">{hinweis}</p>}
    </div>
  );
}

export function KontextPanel({ typ, normKeys }: { typ: KontextTyp; normKeys: readonly string[] }) {
  // Synchron (in-Bundle) — billig + deterministisch, daher pro Render berechnet
  // statt memoisiert (kleine Register, kein O(n²); §6.4).
  const { normen, materialien, werkzeuge } = kontextSync(typ, normKeys);
  // B-2 Verzahnung: Rechner direkt NEBEN dem Normtext öffnen (Split-View).
  // Nur ab lg + freier Pane-Kapazität sichtbar (Werkzeuge sind pane-sicher).
  const { oeffneDaneben, kannOeffnen } = usePaneSteuerung();

  // Entscheide lazy aus dem Norm→Entscheid-Index. Stabiler Dep-Key über die
  // join-Signatur (Array-/Objekt-Identität wechselt sonst je Render). Das
  // Ergebnis trägt seinen eigenen Key → der Ladezustand wird daraus ABGELEITET
  // (kein synchrones setState im Effekt-Body, react-hooks-Regel; §6.4).
  const normKeysKey = normKeys.join(',');
  const [geladen, setGeladen] = useState<{ key: string; refs: EntscheidRef[] } | null>(null);
  useEffect(() => {
    if (typ === 'entscheid') return;   // Entscheid-Reader: keine Entscheid-Gruppe
    const keys = normKeysKey ? normKeysKey.split(',') : [];
    let lebt = true;
    kontextEntscheide(typ, keys).then((r) => { if (lebt) setGeladen({ key: normKeysKey, refs: r }); });
    return () => { lebt = false; };
  }, [typ, normKeysKey]);

  // Entscheid-Reader: leer (Selbst-Korpus). Sonst nur das zum AKTUELLEN Key
  // gehörende Resultat zeigen; ein veralteter/fehlender Treffer = «lädt».
  const entscheide: EntscheidRef[] | null =
    typ === 'entscheid' ? [] : (geladen && geladen.key === normKeysKey ? geladen.refs : null);

  const entscheideLaden = entscheide === null;
  const sichtbareEntscheide = entscheide ? entscheide.slice(0, MAX_ENTSCHEIDE) : [];
  const restEntscheide = entscheide ? Math.max(0, entscheide.length - MAX_ENTSCHEIDE) : 0;
  // Ziel für «alle Entscheide»: bei genau einer Norm vorgefiltert, sonst Übersicht.
  const alleEntscheideZiel = normKeys.length === 1
    ? `/rechtsprechung?norm=${encodeURIComponent(normKeys[0])}`
    : '/rechtsprechung';

  const hatSync = normen.length > 0 || materialien.length > 0 || werkzeuge.length > 0;
  const istLeer = !hatSync && !entscheideLaden && (entscheide?.length ?? 0) === 0;

  return (
    <section aria-labelledby="kontext-titel" className="mt-12 border-t border-line pt-6 space-y-5 max-w-reading">
      <div className="flex items-baseline gap-3">
        <h2 id="kontext-titel" className="lc-overline text-brass-700">Kontext</h2>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </div>

      {istLeer ? (
        <p className="text-body-s text-ink-500">
          Noch keine Querverweise zu Entscheiden, Materialien oder Werkzeugen erfasst.
        </p>
      ) : (
        <div className="space-y-5">
          {/* Normen (für Entscheid- und Material-Reader). */}
          {normen.length > 0 && (
            <Gruppe titel="Angewandte Erlasse" anzahl={normen.length}>
              <ul className="flex flex-wrap gap-2">
                {normen.map((n) => (
                  <li key={n.key}>
                    <Link to={n.pfad} title={n.titel}
                      className="lc-chip no-underline hover:text-brass-700 hover:border-brass-400">
                      {n.kuerzel}
                    </Link>
                  </li>
                ))}
              </ul>
            </Gruppe>
          )}

          {/* Entscheide (für Norm- und Material-Reader). */}
          {(entscheideLaden || (entscheide && entscheide.length > 0)) && (
            <Gruppe titel="Bundesgerichtsentscheide" anzahl={entscheide?.length ?? 0}
              hinweis="Maschinell aus den zitierten Normen zugeordnet — keine geprüfte Präjudizienliste.">
              {entscheideLaden ? (
                <p className="text-body-s text-ink-500">Entscheide werden geladen …</p>
              ) : (
                <>
                  <ul className="flex flex-col gap-1.5">
                    {sichtbareEntscheide.map((r) => (
                      <li key={r.key} className="text-body-s">
                        <Link to={`/rechtsprechung/${encodeURIComponent(r.key)}`}
                          className="no-underline hover:text-brass-700">
                          <span className="font-medium">{r.zitierung}</span>
                          {r.leitcharakter === 'leitentscheid' && (
                            <span className="lc-chip ml-2 align-middle text-micro">Leitentscheid</span>
                          )}
                          {r.regesteKurz && <span className="text-ink-500"> — {r.regesteKurz}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {restEntscheide > 0 && (
                    <Link to={alleEntscheideZiel} className="text-body-s text-brass-700 hover:underline">
                      Alle <span className="num">{entscheide?.length}</span> Entscheide ansehen →
                    </Link>
                  )}
                </>
              )}
            </Gruppe>
          )}

          {/* Materialien (für Norm- und Entscheid-Reader). */}
          {materialien.length > 0 && (
            <Gruppe titel="Amtliche Materialien" anzahl={materialien.length}
              hinweis="Behördenpublikationen (Kreisschreiben, Wegleitungen u. a.) — kein Gesetzesrang.">
              <ul className="flex flex-col gap-1.5">
                {materialien.map((m) => (
                  <li key={m.key} className="text-body-s">
                    <Link to={m.pfad} className="no-underline hover:text-brass-700">
                      <span className="text-ink-500">{m.behoerdeKuerzel} · {m.doktypLabel}{m.nummer ? ` ${m.nummer}` : ''}</span>
                      {' — '}<span className="font-medium">{m.titel}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Gruppe>
          )}

          {/* Werkzeuge (für alle drei Reader). */}
          {werkzeuge.length > 0 && (
            <Gruppe titel="Passende Werkzeuge" anzahl={werkzeuge.length}
              hinweis="Aus den verknüpften Normen abgeleitet (grobe Zuordnung, keine kuratierte Empfehlung).">
              {/* Mobil eine scrollbare Chip-Reihe, ab sm normaler Umbruch. */}
              <ul className="flex gap-2 overflow-x-auto pb-1 -mb-1 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mb-0 [scrollbar-width:thin]">
                {werkzeuge.map((w) => (
                  <li key={w.id} className="shrink-0 inline-flex items-center">
                    <Link to={w.href}
                      className="lc-chip whitespace-nowrap no-underline hover:text-brass-700 hover:border-brass-400">
                      <span className="text-ink-500 mr-1" aria-hidden>{w.modus === 'rechner' ? '⊞' : '▤'}</span>{w.titel}
                    </Link>
                    {/* «daneben öffnen»: Norm bleibt links, Werkzeug erscheint
                        rechts im Split-View (B-2). Nur ab lg + freier Kapazität. */}
                    {kannOeffnen && (
                      <button type="button" onClick={() => oeffneDaneben(w.href)}
                        title={`${w.titel} nebeneinander öffnen`} aria-label={`${w.titel} nebeneinander öffnen`}
                        className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md border border-line text-ink-500 hover:text-brass-700 hover:border-brass-400 transition-colors">
                        <span aria-hidden className="text-base leading-none">⧉</span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </Gruppe>
          )}
        </div>
      )}
    </section>
  );
}
