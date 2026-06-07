import { Fragment } from 'react';
import { parseISO, isSameDay, isWithinInterval } from 'date-fns';
import type { Kanton } from '../types/legal';
import { stillstandsperiodeFuer, istArbeitsfreierTag } from '../data/zpoFeiertage';

// Grafische Fristen-Antwort: Monatsraster mit durchgehendem Fristband und
// runden Markern für Ereignis / Fristbeginn / Fristende.
//
// Darstellungs-Überarbeitung 7.6.2026 (Auftrag David, reine Optik — Band-
// und Marker-SEMANTIK unverändert): Almanach-Monatsköpfe (Display-Schrift +
// Messing-Jahr über Haarlinie), Fristende als «eingekreister» Termin
// (Doppelring, Fristenkontrollbuch-Geste), Gerichtsstillstand als feine
// Schraffur statt Vollband, ···-Trenner zwischen nicht angrenzenden
// Monaten, Sa/So-Spaltenköpfe abgeschwächt, Kanton der Feiertage offen
// in der Legende (§8).

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const WTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

type Props = {
  ereignisISO: string;
  aQuoISO: string;
  adQuemISO: string;
  kanton: Kanton;
  stillstandAktiv: boolean;
  feiertage?: boolean;                 // Sa/So/Feiertage abschwächen (default true)
  // band: Beschriftung der Messing-Fläche in der Legende — Standard
  // «laufende Frist»; abweichend, wo das Band keine Frist ist (z. B.
  // Lohnfortzahlung: bezahlter Zeitraum).
  labels?: { ereignis: string; aquo: string; adquem: string; band?: string };
};

function monatKey(d: Date) { return d.getFullYear() * 12 + d.getMonth(); }

type BandStatus = 'frist' | 'still' | null;

export function FristenKalender({ ereignisISO, aQuoISO, adQuemISO, kanton, stillstandAktiv, feiertage = true, labels }: Props) {
  const L = labels ?? { ereignis: 'Ereignistag', aquo: 'Fristbeginn', adquem: 'Fristende' };
  const ereignis = parseISO(ereignisISO);
  const aQuo = parseISO(aQuoISO);
  const adQuem = parseISO(adQuemISO);

  // Nur die Schlüssel-Monate zeigen (Ereignis / Fristbeginn / Fristende), dedupliziert.
  const keys = Array.from(new Set([monatKey(ereignis), monatKey(aQuo), monatKey(adQuem)])).sort((a, b) => a - b);
  const monate = keys.map((k) => new Date(Math.floor(k / 12), k % 12, 1));
  const luecken = keys.length > 1 && keys.some((k, i) => i > 0 && k - keys[i - 1] > 1);

  const fristStart = aQuo < adQuem ? aQuo : adQuem;
  const fristEnde = aQuo < adQuem ? adQuem : aQuo;

  // Legende erklärt nur, was in den GEZEIGTEN Monaten wirklich vorkommt
  // (§8): der Stillstand kann ganz in einem ausgelassenen Zwischenmonat
  // liegen (z. B. Ostern zwischen Fristbeginn März und Fristende Mai) —
  // dann entfällt der Schraffur-Eintrag, statt Unsichtbares zu erklären.
  const stillstandSichtbar = stillstandAktiv && monate.some((monat) => {
    const tage = new Date(monat.getFullYear(), monat.getMonth() + 1, 0).getDate();
    for (let t = 1; t <= tage; t++) {
      if (stillstandsperiodeFuer(new Date(monat.getFullYear(), monat.getMonth(), t)) !== null) return true;
    }
    return false;
  });

  // Band-Ebene: laufende Frist (Messing) bzw. Gerichtsstillstand (Schraffur)
  const bandStatus = (d: Date): BandStatus => {
    if (stillstandAktiv && stillstandsperiodeFuer(d) !== null) return 'still';
    if (isWithinInterval(d, { start: fristStart, end: fristEnde })) return 'frist';
    return null;
  };

  return (
    <div className="lc-card p-5 lc-reveal">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 mb-4">
        <p className="lc-overline">Fristenlauf</p>
        {feiertage && (
          <p className="lc-overline text-ink-400">Feiertage <span className="text-ink-600">{kanton}</span></p>
        )}
      </div>
      <div className="flex flex-wrap items-start gap-x-7 gap-y-6">
        {monate.map((monat, idx) => {
          const jahr = monat.getFullYear();
          const m = monat.getMonth();
          const anzahl = new Date(jahr, m + 1, 0).getDate();
          const offset = (new Date(jahr, m, 1).getDay() + 6) % 7; // Mo-first
          const zellen: (Date | null)[] = [...Array(offset).fill(null), ...Array.from({ length: anzahl }, (_, i) => new Date(jahr, m, i + 1))];
          // Nicht angrenzende Monate: ···-Trenner statt nahtlosem Anschluss
          // (die Fussnote unten bleibt als explizite Aussage bestehen).
          const trenner = idx > 0 && keys[idx] - keys[idx - 1] > 1;
          return (
            <Fragment key={`${jahr}-${m}`}>
              {trenner && (
                <div aria-hidden className="hidden sm:flex self-center px-0.5">
                  <span className="lc-overline text-ink-400 tracking-[0.3em]">···</span>
                </div>
              )}
              <div className="w-[min(15.5rem,100%)]">
                {/* Almanach-Monatskopf: Display-Name, Messing-Jahr, Haarlinie */}
                <p className="flex items-baseline justify-between gap-2 border-b border-line pb-1.5 mb-2">
                  <span className="font-display text-body-s font-semibold tracking-[-0.01em] text-ink-900">{MONATE[m]}</span>
                  <span className="lc-overline text-brass-700">{jahr}</span>
                </p>
                <div className="grid grid-cols-7 gap-x-0 gap-y-0.5 text-center">
                  {WTAGE.map((w, wi) => (
                    <div key={w} className={`lc-overline py-1 ${wi >= 5 ? 'text-ink-400' : 'text-ink-500'}`}>{w}</div>
                  ))}
                  {zellen.map((d, i) => {
                    if (!d) return <div key={i} />;
                    const isEreignis = isSameDay(d, ereignis);
                    const isAQuo = isSameDay(d, aQuo);
                    const isAdQuem = isSameDay(d, adQuem);
                    const frei = feiertage && istArbeitsfreierTag(d, kanton);
                    const band = bandStatus(d);

                    // Bandenden abrunden: am Wochen-/Monatsrand und an Statuswechseln
                    const col = i % 7;
                    const vortag = new Date(jahr, m, d.getDate() - 1);
                    const folgetag = new Date(jahr, m, d.getDate() + 1);
                    const rundL = col === 0 || d.getDate() === 1 || bandStatus(vortag) !== band;
                    const rundR = col === 6 || d.getDate() === anzahl || bandStatus(folgetag) !== band;

                    // Marker-Ebene: runde Schlüsseltage über dem Band
                    let marker = frei ? 'text-ink-400' : 'text-ink-700'; // ink-400 statt 300: Kontrast-Kompromiss (FAHRPLAN-DESIGN 3.5)
                    let title = frei ? 'arbeitsfrei (Sa/So/Feiertag)' : '';
                    if (isAdQuem) { marker = 'bg-sage-500 text-paper font-semibold rounded-full lc-termin-ring'; title = L.adquem; }
                    else if (isAQuo) { marker = 'bg-brass-500 text-ink-900 font-semibold rounded-full'; title = L.aquo; }
                    else if (isEreignis) { marker = 'border-2 border-ink-900 text-ink-900 font-semibold rounded-full bg-paper-raised'; title = L.ereignis; }
                    else if (band === 'still') { marker = 'text-warn-700'; title = 'Gerichtsstillstand'; }

                    return (
                      <div key={i} title={title} className="relative h-9 flex items-center justify-center">
                        {band && (
                          <span aria-hidden className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-7 ${
                            band === 'still' ? 'lc-hatch-warn' : 'bg-brass-100'
                          } ${rundL ? 'rounded-l-full' : ''} ${rundR ? 'rounded-r-full' : ''}`} />
                        )}
                        <span className={`num relative w-8 h-8 flex items-center justify-center text-body-s ${marker}`}>
                          {d.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>

      {luecken && <p className="text-body-s text-ink-500 mt-3 italic">Dazwischenliegende Monate sind nicht dargestellt.</p>}

      {/* Legende — Überarbeitung 7.6.2026 (Auftrag David): zwei gelesene
          Gruppen statt einer ungegliederten Reihe — erst die drei
          Schlüsseltage (Kreis-Marker, chronologisch), nach der Haarlinie
          die Flächen (Band/Schraffur) und die abgeschwächten arbeitsfreien
          Tage. Muster sind Miniaturen der echten Zellen-Rezepte. */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-3 border-t border-line text-body-s text-ink-700">
        <span className="lc-overline text-ink-400">Legende</span>
        {ereignisISO !== aQuoISO && <Legende kreis="border-2 border-ink-900 bg-paper-raised" label={L.ereignis} />}
        <Legende kreis="bg-brass-500" label={L.aquo} />
        <Legende kreis="bg-sage-500 lc-termin-ring" label={L.adquem} />
        <span aria-hidden className="hidden sm:inline-block h-4 w-px bg-line" />
        <Legende band="bg-brass-100" label={L.band ?? 'laufende Frist'} />
        {stillstandSichtbar && <Legende band="lc-hatch-warn" label="Gerichtsstillstand" />}
        {/* Arbeitsfreie Tage haben kein eigenes Zeichen im Raster (nur
            abgeschwächte Ziffern) — darum auch keines in der Legende: ein
            Text-Muster («Sa») las sich nach Zeilenumbruch als Wortfragment
            (Befund David 7.6.2026), ein grafisches gäbe es im Kalender
            nicht (§8). Der Eintrag erklärt die Behandlung und ist selbst
            abgeschwächt gesetzt. */}
        {feiertage && <span className="text-ink-500">arbeitsfreie Tage abgeschwächt (Sa/So/Feiertage {kanton})</span>}
      </div>
    </div>
  );
}

function Legende({ kreis, band, label }: { kreis?: string; band?: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      {kreis && <span aria-hidden className={`inline-block w-3.5 h-3.5 rounded-full shrink-0 ${kreis}`} />}
      {band && <span aria-hidden className={`inline-block w-7 h-3.5 rounded-full shrink-0 ${band}`} />}
      {label}
    </span>
  );
}
