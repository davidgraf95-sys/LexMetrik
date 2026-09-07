import { Link } from 'react-router-dom';
import { KANTONE, KANTON_NAMEN } from '../../data/tarif/typen';
import { erfassungsgrad, STUFE_WORT } from '../../lib/normtext/erfassungsgrad';
import { STARTSEITE_ZAEHLER } from '../../data/startseiteZaehler.generated';
import { usePaneKlasse } from '../layout/PaneKontext';
import { ModulFuss } from './PultModul';
import { kantonZiel } from './modulZiele';

// ─── Kantone als Register-Raster (W2·24-R3) ─────────────────────────────────
//
// Dieselben 26 Ziele wie die Chip-Wolke der Startseite V4, in der Rasterform des
// Referenzbildes: Kürzel links, erfasste Zahl rechts, punktierte Grundlinie.
//
// IA-7-Ehrlichkeit unverändert (§8): SICHTBAR sind Kürzel und Zahl, das
// Zustands-Wort («erfasst»/«Auswahl»/«dünn», nie «vollständig» ohne
// Enumerations-Beleg) steht im Accessible Name. Ableitung wie in navigation.ts —
// `erfassungsgrad.ts` ist die eine Quelle, hier wird nur konsumiert (§5).
// ZIEL-URL aus dem Bestand, nicht erfunden: `?ebene=kanton&kt=<KT>`.
// Zahlen aus dem generierten Zähler (kein Register-Import, §15).
// Reine Darstellung (§3).
// W2·24-R10 (Referenzbild `pult-freigegeben.html`): das Modul rendert nur noch
// seinen INHALT. Kopfzeile, Registerstrich und der Schalter «Anzeigen/Ausblenden»
// kommen aus dem EINEN Rahmen `start/PultModul`, Titel und Register aus dem
// Registry (`lib/startseiteModule`) — die frühere Marginalie mit Bereich und
// Bestandszahl ist gestrichen, die Zahl steht einmal in der Bereichs-Reihe.


const z = STARTSEITE_ZAEHLER;
const nf = (n: number) => n.toLocaleString('de-CH');

export function KantoneRaster() {
  const pk = usePaneKlasse();
  return (
    <>
      <div className={`grid gap-x-3 font-sans text-body-s leading-relaxed ${pk(
        'grid-cols-3 sm:grid-cols-6 lg:grid-cols-9',
        'grid-cols-3 @lg/pane:grid-cols-6 @4xl/pane:grid-cols-9',
      )}`}>
        {KANTONE.map((kt) => {
          const n = z.kantonErlassZahlen[kt] ?? 0;
          const wort = STUFE_WORT[erfassungsgrad(kt, n).stufe];
          const mengen = n === 0 ? 'keine Erlasse' : `${n} ${n === 1 ? 'Erlass' : 'Erlasse'}`;
          return (
            <Link key={kt} to={kantonZiel(kt)}
              aria-label={`${KANTON_NAMEN[kt as keyof typeof KANTON_NAMEN]} — ${mengen} erfasst, ${wort}`}
              className="flex justify-between gap-2 border-b border-dotted border-rule-soft no-underline hover:border-solid hover:border-reg-g hover:text-reg-g">
              {kt}
              <span aria-hidden className="num text-ink-500">{n}</span>
            </Link>
          );
        })}
      </div>
      <ModulFuss>
        {nf(z.gesetzeKantonVolltext)} Erlasse im Volltext. Die Zahl ist der Umfang unserer
        Erfassung, nicht die Grösse der kantonalen Sammlung.
      </ModulFuss>
    </>
  );
}
