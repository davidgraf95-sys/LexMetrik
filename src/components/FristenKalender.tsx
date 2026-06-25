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
  // aQuoISO (erster mitzählender Tag) optional: der Schnellrechner/Startseiten-
  // Kalender kennt ihn nur im «keine Ferien»-Regime. Fehlt er, spannt das Band
  // vom Ereignistag zum Fristende und es gibt keinen Fristbeginn-Marker.
  aQuoISO?: string;
  adQuemISO: string;
  kanton: Kanton;
  stillstandAktiv: boolean;
  // Explizite Stillstand-Perioden (regimeneutral, ISO inkl.): wenn gesetzt,
  // ersetzen sie die interne ZPO-Gerichtsferien-Berechnung — so kann der
  // Startseiten-Kalender SchKG-/andere Ferienregimes korrekt schraffieren.
  // Fehlt der Prop, gilt unverändert die ZPO-interne Berechnung (Default für
  // die sechs Fristen-Formulare — byte-gleiches Verhalten).
  stillstandPerioden?: { vonISO: string; bisISO: string }[];
  feiertage?: boolean;                 // Sa/So/Feiertage abschwächen (default true)
  // kompakt: Startseiten-Schnellrechner-Variante (Auftrag David 25.6.2026) —
  // NUR die relevanten Wochen (Ereignis→Fristende-Band + Marker) statt voller
  // Monate, schmalere Tiles (Monate nebeneinander), engere Abstände. Opt-in;
  // ohne den Prop unverändertes Verhalten für die sechs Fristen-Formulare.
  kompakt?: boolean;
  // band: Beschriftung der Messing-Fläche in der Legende — Standard
  // «laufende Frist»; abweichend, wo das Band keine Frist ist (z. B.
  // Lohnfortzahlung: bezahlter Zeitraum).
  labels?: { ereignis: string; aquo: string; adquem: string; band?: string };
};

function monatKey(d: Date) { return d.getFullYear() * 12 + d.getMonth(); }
// Deterministisches Klartext-Datum für die Screenreader-Zusammenfassung (E9).
const fmtDatum = (d: Date) => `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;

type BandStatus = 'frist' | 'still' | null;

export function FristenKalender({ ereignisISO, aQuoISO, adQuemISO, kanton, stillstandAktiv, stillstandPerioden, feiertage = true, labels, kompakt = false }: Props) {
  const L = labels ?? { ereignis: 'Ereignistag', aquo: 'Fristbeginn', adquem: 'Fristende' };
  const ereignis = parseISO(ereignisISO);
  const aQuo = aQuoISO ? parseISO(aQuoISO) : null;
  const adQuem = parseISO(adQuemISO);

  // Nur die Schlüssel-Monate zeigen (Ereignis / Fristbeginn / Fristende), dedupliziert.
  const keys = Array.from(new Set([monatKey(ereignis), ...(aQuo ? [monatKey(aQuo)] : []), monatKey(adQuem)])).sort((a, b) => a - b);
  const monate = keys.map((k) => new Date(Math.floor(k / 12), k % 12, 1));
  const luecken = keys.length > 1 && keys.some((k, i) => i > 0 && k - keys[i - 1] > 1);

  // Bandrand = Fristbeginn (sofern bekannt), sonst der Ereignistag.
  const bandRand = aQuo ?? ereignis;
  const fristStart = bandRand < adQuem ? bandRand : adQuem;
  const fristEnde = bandRand < adQuem ? adQuem : bandRand;

  // Stillstand: explizite Perioden (regimeneutral) haben Vorrang; sonst die
  // interne ZPO-Berechnung wie bisher (Default für die Fristen-Formulare).
  const istStill = (d: Date): boolean =>
    stillstandPerioden
      ? stillstandPerioden.some((p) => isWithinInterval(d, { start: parseISO(p.vonISO), end: parseISO(p.bisISO) }))
      : stillstandAktiv && stillstandsperiodeFuer(d) !== null;

  // Legende erklärt nur, was in den GEZEIGTEN Monaten wirklich vorkommt
  // (§8): der Stillstand kann ganz in einem ausgelassenen Zwischenmonat
  // liegen (z. B. Ostern zwischen Fristbeginn März und Fristende Mai) —
  // dann entfällt der Schraffur-Eintrag, statt Unsichtbares zu erklären.
  const stillstandSichtbar = monate.some((monat) => {
    const tage = new Date(monat.getFullYear(), monat.getMonth() + 1, 0).getDate();
    for (let t = 1; t <= tage; t++) {
      if (istStill(new Date(monat.getFullYear(), monat.getMonth(), t))) return true;
    }
    return false;
  });

  // Band-Ebene: laufende Frist (Messing) bzw. Gerichtsstillstand (Schraffur)
  const bandStatus = (d: Date): BandStatus => {
    if (istStill(d)) return 'still';
    if (isWithinInterval(d, { start: fristStart, end: fristEnde })) return 'frist';
    return null;
  };

  // kompakt: ein Tag ist «relevant», wenn er ein Schlüsseltag ist oder im Band/
  // Stillstand liegt → nur Wochen mit relevanten Tagen werden gezeigt.
  const istRelevant = (d: Date): boolean =>
    bandStatus(d) !== null || isSameDay(d, ereignis) || (aQuo != null && isSameDay(d, aQuo)) || isSameDay(d, adQuem);

  return (
    <div className={`lc-card lc-reveal ${kompakt ? 'p-3.5' : 'p-5'}`}>
      <div className={`flex flex-wrap items-baseline justify-between gap-x-4 ${kompakt ? 'mb-2.5' : 'mb-4'}`}>
        <p className="lc-overline">Fristenlauf</p>
        {/* Feiertage-Kopf entfernt (Auftrag David 25.6.2026): redundant zur
            Legende unten («arbeitsfreie Tage abgeschwächt (Sa/So/Feiertage
            {kanton})»). Die Abschwächung im Raster bleibt (feiertage-Prop). */}
      </div>
      {/* Die grafische Matrix transportiert ihre Bedeutung nur visuell (Farbe/
          Form/title) — für Screenreader aria-hidden und durch die sr-only-
          Zusammenfassung unten ersetzt (E9, WCAG 1.3.1/1.4.1). */}
      <div className="flex flex-wrap items-start gap-x-7 gap-y-6" aria-hidden>
        {monate.map((monat, idx) => {
          const jahr = monat.getFullYear();
          const m = monat.getMonth();
          const anzahl = new Date(jahr, m + 1, 0).getDate();
          const offset = (new Date(jahr, m, 1).getDay() + 6) % 7; // Mo-first
          const alleZellen: (Date | null)[] = [...Array(offset).fill(null), ...Array.from({ length: anzahl }, (_, i) => new Date(jahr, m, i + 1))];
          // kompakt: nur Wochen (7er-Zeilen) mit einem relevanten Tag zeigen
          // (Ereignis→Fristende-Band + Marker) → leere Vor-/Nachwochen entfallen.
          // i % 7 bleibt korrekt: ganze (volle) Wochen werden gedroppt (Vielfaches 7).
          const zellen: (Date | null)[] = kompakt
            ? (() => {
                const w: (Date | null)[][] = [];
                for (let i = 0; i < alleZellen.length; i += 7) w.push(alleZellen.slice(i, i + 7));
                return w.filter((woche) => woche.some((d) => d && istRelevant(d))).flat();
              })()
            : alleZellen;
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
              <div className={kompakt ? 'w-[min(12.5rem,100%)]' : 'w-[min(15.5rem,100%)]'}>
                {/* Almanach-Monatskopf: Display-Name, Messing-Jahr, Haarlinie */}
                <p className="flex items-baseline justify-between gap-2 border-b border-line pb-1.5 mb-2">
                  <span className="font-display text-body-s font-semibold tracking-[-0.01em] text-ink-900">{MONATE[m]}</span>
                  <span className="lc-overline text-brass-700">{jahr}</span>
                </p>
                <div className="grid grid-cols-7 gap-x-0 gap-y-0.5 text-center">
                  {WTAGE.map((w) => (
                    <div key={w} className="lc-overline py-1 text-ink-500">{w}</div>
                  ))}
                  {zellen.map((d, i) => {
                    if (!d) return <div key={i} />;
                    const isEreignis = isSameDay(d, ereignis);
                    const isAQuo = aQuo ? isSameDay(d, aQuo) : false;
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
                      <div key={i} title={title} className={`relative flex items-center justify-center ${kompakt ? 'h-8' : 'h-9'}`}>
                        {band && (
                          <span aria-hidden className={`absolute inset-x-0 top-1/2 -translate-y-1/2 ${kompakt ? 'h-6' : 'h-7'} ${
                            band === 'still' ? 'lc-hatch-warn' : 'bg-brass-100'
                          } ${rundL ? 'rounded-l-full' : ''} ${rundR ? 'rounded-r-full' : ''}`} />
                        )}
                        <span className={`num relative flex items-center justify-center text-body-s ${kompakt ? 'w-7 h-7' : 'w-8 h-8'} ${marker}`}>
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

      {/* Textgleichwertige Zusammenfassung für Screenreader (die Matrix oben
          ist aria-hidden). Datum deterministisch, keine Logik. */}
      <p className="sr-only">
        {`Fristenlauf: ${L.ereignis} am ${fmtDatum(ereignis)}, ${aQuo ? `${L.aquo} am ${fmtDatum(aQuo)}, ` : ''}${L.adquem} am ${fmtDatum(adQuem)}.${stillstandSichtbar ? ' Im Zeitraum liegt ein Gerichtsstillstand.' : ''}`}
      </p>

      {luecken && <p className="text-body-s text-ink-500 mt-3 italic">Dazwischenliegende Monate sind nicht dargestellt.</p>}

      {/* Legende — Überarbeitung 7.6.2026 (Auftrag David): zwei gelesene
          Gruppen statt einer ungegliederten Reihe — erst die drei
          Schlüsseltage (Kreis-Marker, chronologisch), nach der Haarlinie
          die Flächen (Band/Schraffur) und die abgeschwächten arbeitsfreien
          Tage. Muster sind Miniaturen der echten Zellen-Rezepte. */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-3 border-t border-line text-body-s text-ink-700">
        <span className="lc-overline text-ink-500">Legende</span>
        {ereignisISO !== aQuoISO && <Legende kreis="border-2 border-ink-900 bg-paper-raised" label={L.ereignis} />}
        {aQuoISO && <Legende kreis="bg-brass-500" label={L.aquo} />}
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
