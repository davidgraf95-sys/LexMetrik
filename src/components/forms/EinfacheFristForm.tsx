import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { berechneAllgemeineFrist, type Einheit } from '../../lib/allgemeineFrist';
import { berechneFrist } from '../../lib/zpoFristen';
import { berechneSchkgFrist } from '../../lib/schkgFristen';
import { berechneBggVwvgFrist, bvAusnahmenSatz } from '../../lib/bggVwvgFristen';
import { zpoFristenLink, SCHKG_LINK_SPEC } from '../../lib/rechnerPermalinks';
import { permalinkKodieren } from '../../lib/permalink';
import { KANTONE } from '../../lib/kantone';
import { stillstandsperioden } from '../../data/zpoFeiertage';
import type { Kanton } from '../../types/legal';
import { ErgebnisBlock } from '../ErgebnisBlock';
import type { FristMarkierung } from '../start/FristenKalender';
import { getStandardKanton } from '../../lib/einstellungen';
import { usePaneKlasse } from '../layout/PaneKontext';

// ─── Einfacher Fristenrechner (S-5a FAHRPLAN-STRUKTUR-UMBAU) ────────────────
//
// Auftrag David 10.6.2026 abends: «ein ganz simpler fristenrechner … mit
// datum, frist, auswahl ob der rechner ferien nach schkg und zpo oder
// sonstige ferien (sofern einschlägig) oder keine behandeln soll».
// Reine Kompositions-Schicht (§3): je nach Ferien-Wahl rechnet die
// BESTEHENDE Engine (allgemeineFrist · zpoFristen · schkgFristen) — keine
// eigene Rechtslogik. Die ZPO-/SchKG-Aufrufe nutzen offengelegte
// Standard-Annahmen (Ergebnis zeigt sie); Sonderkonstellationen gehören in
// die Voll-Rechner («verfeinern»-Link mit denselben Werten, §5-Kodierung).

type Ferien = 'keine' | 'zpo' | 'schkg' | 'vwvg' | 'bgg';

const FERIEN_OPTIONEN: { code: Ferien; label: string; sub: string }[] = [
  // Bug-Check §9 (fachliche Lupe, MITTEL): Samstag-Verschiebung folgt dem
  // Fristengesetz (SR 173.110.3, eidg. Recht) — bei reinen Vertragsfristen
  // nicht zwingend; der Rechenweg nennt den Verschiebegrund.
  { code: 'keine', label: 'Keine Ferien', sub: 'Vertrags-/Gesetzesfrist (Art. 77/78 OR) – Verschiebung bei Sa/So/Feiertag (Sa nach Fristengesetz; bei reinen Vertragsfristen nicht zwingend – im Zweifel vorher handeln)' },
  { code: 'zpo', label: 'Gerichtsferien (ZPO)', sub: 'Stillstand nach Art. 145 ZPO – Annahme: ordentliches Verfahren, gesetzliche Frist' },
  // Bug-Check §9 (fachliche Lupe, MITTEL): präzise Art.-63-Kurzform —
  // dritter TAG NACH Ferienende, Sa/So/Feiertage nicht mitgezählt.
  { code: 'schkg', label: 'Betreibungsferien (SchKG)', sub: 'Art. 56/63 SchKG – Fristende in den Ferien → Verlängerung bis zum 3. Tag nach Ferienende (Sa/So/Feiertage zählen nicht)' },
  // Verwaltungs-/BGG-Stillstand (13.6.2026): gleiche drei Perioden wie die ZPO,
  // ABER nur für nach Tagen bestimmte Fristen (Wochen/Monate/Jahre stehen nicht
  // still) – die Engine legt das offen.
  { code: 'vwvg', label: 'Verwaltungs-Stillstand (VwVG)', sub: 'Art. 22a VwVG – Stillstand (Ostern ± 7 · 15.7.–15.8. · 18.12.–2.1.) nur für nach Tagen bestimmte Fristen; nicht bei vorsorglichen Massnahmen / öffentlichen Beschaffungen' },
  { code: 'bgg', label: 'BGG-Stillstand (Bundesgericht)', sub: 'Art. 46 BGG – Stillstand (gleiche drei Perioden) nur für nach Tagen bestimmte Fristen; Ausnahmen nach Abs. 2 (vorsorgliche Massnahmen, Wechselbetreibung, Stimmrecht …)' },
];

const EINHEITEN: { code: Einheit; label: string }[] = [
  { code: 'tage', label: 'Tage' },
  { code: 'wochen', label: 'Wochen' },
  { code: 'monate', label: 'Monate' },
  { code: 'jahre', label: 'Jahre' },
];

const istISOTag = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

const isoLokal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Gerichtsferien-/Stillstand-Perioden rund um das Fristende für die Kalender-
// Markierung (Auftrag David: Stillstand sichtbar machen). DIESELBEN Perioden, die
// die Engine verwendet (§5, data/zpoFeiertage) — Jahr des Fristendes + Vorjahr, weil
// die Weihnachtsperiode über den Jahreswechsel greift. Reine Anzeige (§3).
function stillstandFenster(endeISO: string): { vonISO: string; bisISO: string }[] {
  const jahr = Number(endeISO.slice(0, 4));
  return [jahr - 1, jahr].flatMap((j) => stillstandsperioden(j)).map((p) => ({ vonISO: isoLokal(p.von), bisISO: isoLokal(p.bis) }));
}

// Kalender-Markierung je Ferien-Regime (reine Komposition, §3 — jede Engine liefert
// ein ISO-Enddatum). So zeigt der Kalender das Fristende für ALLE Regimes, nicht nur
// «keine Ferien» (Auftrag David: Kalender immer ersichtlich). null bei Fehleingabe.
function baueMarkierung(start: string, laenge: number, einheit: Einheit, ferien: Ferien, kanton: Kanton): FristMarkierung | null {
  try {
    if (ferien === 'keine') {
      const r = berechneAllgemeineFrist({ start, laenge, einheit, wochenendeVerschieben: true, feiertageVerschieben: true, kanton });
      return { startISO: r.startISO, endeISO: r.endDatumISO, fristbeginnISO: r.fristbeginnISO, verschiebeGruende: r.verschoben ? r.verschiebeGruende : undefined };
    }
    if (ferien === 'zpo') {
      const r = berechneFrist({ ereignis: start, einheit, laenge, verfahren: 'ordentlich', kanton, fristnatur: 'gesetzlich' });
      // ZPO-Gerichtsferien (Art. 145): immer markieren — die Perioden gelten unabhängig
      // davon, ob diese konkrete Frist verschoben wurde (Sichtbarkeit, Auftrag David).
      return { startISO: start, endeISO: r.diesAdQuemISO, hinweis: r.stillstandAktiv ? 'Stillstand (Art. 145 ZPO) berücksichtigt' : undefined, stillstand: stillstandFenster(r.diesAdQuemISO) };
    }
    if (ferien === 'vwvg' || ferien === 'bgg') {
      const r = berechneBggVwvgFrist({ regime: ferien, ereignis: start, einheit, laenge, kanton });
      // VwVG/BGG-Stillstand gilt NUR für nach Tagen bestimmte Fristen → nur dann markieren.
      return { startISO: start, endeISO: r.diesAdQuemISO, hinweis: r.stillstandAktiv ? `Stillstand (${ferien === 'vwvg' ? 'Art. 22a VwVG' : 'Art. 46 BGG'}) berücksichtigt` : undefined, stillstand: r.stillstandAktiv ? stillstandFenster(r.diesAdQuemISO) : undefined };
    }
    const r = berechneSchkgFrist({ ereignis: start, einheit: einheit as 'tage' | 'monate' | 'jahre', laenge, modus: 'schkg_betreibungsferien', fristnatur: 'frist', kanton });
    return { startISO: start, endeISO: r.diesAdQuemISO };
  } catch {
    return null;
  }
}

export function EinfacheFristForm({ minimal = false, onErgebnis }: {
  minimal?: boolean;
  /** #7: meldet die Kalender-Markierung (Ereignis + Fristende) nach oben — für
   *  ALLE Regimes (jede Engine liefert ein ISO-Enddatum); null bei Fehleingabe. */
  onErgebnis?: (e: { markierung: FristMarkierung; kanton: Kanton } | null) => void;
} = {}) {
  // Datum-Default heute in LOKALER Zeit (Bug-Check §9, NIEDRIG: toISOString
  // wäre UTC — zwischen 00:00 und 02:00 Schweizer Zeit der Vortag). Auftrag David:
  // standardmässig heute, auch auf der Startseite. Die App hydratisiert nicht
  // (main.tsx createRoot render-then-replace) → kein date-input-Hydration-Mismatch.
  const heute = new Date().toLocaleDateString('sv-SE');
  // Split-View: Grids richten sich nach der Pane-Breite (Container-Query) statt
  // nach dem Viewport. Ausserhalb eines Panes liefert pk den Viewport-String.
  const pk = usePaneKlasse();
  const [start, setStart] = useState(heute);
  const [laenge, setLaenge] = useState(10);
  const [einheit, setEinheit] = useState<Einheit>('tage');
  // Auftrag David: Ferien/Stillstand standardmässig ZPO (Gerichtsferien).
  const [ferien, setFerien] = useState<Ferien>('zpo');
  const [kanton, setKanton] = useState<Kanton>(getStandardKanton);

  // Die SchKG-Engine führt keine Wochenfristen (gesetzliche SchKG-Fristen
  // sind tage-/monatsbasiert; types/schkg.ts) — die Option entfällt dort.
  // Bug-Check §9 (Code-Lupe, MITTEL): beim Wechsel auf SchKG wird die
  // Einheit EXPLIZIT auf Tage gestellt (State = Anzeige) statt «N Wochen»
  // still als «N Tage» zu rechnen.
  const waehleFerien = (code: Ferien) => {
    setFerien(code);
    if (code === 'schkg' && einheit === 'wochen') setEinheit('tage');
  };
  const einheiten = ferien === 'schkg' ? EINHEITEN.filter((e) => e.code !== 'wochen') : EINHEITEN;
  const einheitEffektiv = ferien === 'schkg' && einheit === 'wochen' ? 'tage' : einheit;

  const gueltig = istISOTag(start) && Number.isInteger(laenge) && laenge > 0;

  let ende = '';
  let endeZusatz = '';
  let zeilen: string[] = [];
  let fehler = '';
  if (gueltig) {
    try {
      if (ferien === 'keine') {
        const r = berechneAllgemeineFrist({
          start, laenge, einheit: einheitEffektiv,
          wochenendeVerschieben: true, feiertageVerschieben: true, kanton,
        });
        ende = `${r.endWochentag}, ${r.endDatum}`;
        endeZusatz = r.verschoben ? `verschoben: ${r.verschiebeGruende.join(' · ')}` : '';
        zeilen = r.hinweise;
      } else if (ferien === 'zpo') {
        const r = berechneFrist({
          ereignis: start, einheit: einheitEffektiv, laenge,
          verfahren: 'ordentlich', kanton, fristnatur: 'gesetzlich',
        });
        ende = r.diesAdQuem;
        endeZusatz = r.stillstandAktiv ? 'Stillstand (Art. 145 ZPO) berücksichtigt' : '';
        zeilen = [...r.annahmen, ...r.warnungen];
      } else if (ferien === 'vwvg' || ferien === 'bgg') {
        const r = berechneBggVwvgFrist({ regime: ferien, ereignis: start, einheit: einheitEffektiv, laenge, kanton });
        ende = r.diesAdQuem;
        endeZusatz = r.stillstandAktiv
          ? `Stillstand (${ferien === 'vwvg' ? 'Art. 22a VwVG' : 'Art. 46 BGG'}) berücksichtigt`
          : 'Stillstand gilt nur für nach Tagen bestimmte Fristen – hier nicht angewendet';
        zeilen = [...r.annahmen, ...r.warnungen, bvAusnahmenSatz(ferien)];
      } else {
        const r = berechneSchkgFrist({
          ereignis: start, einheit: einheitEffektiv as 'tage' | 'monate' | 'jahre', laenge,
          modus: 'schkg_betreibungsferien', fristnatur: 'frist', kanton,
        });
        ende = r.diesAdQuem;
        zeilen = [...r.annahmen, ...r.warnungen];
      }
    } catch {
      fehler = 'Mit diesen Eingaben lässt sich keine Frist berechnen – bitte Datum und Dauer prüfen.';
    }
  }

  // #7: Kalender-Markierung nach oben melden (Schnellrechner). Für ALLE Regimes,
  // damit der Kalender immer das Fristende zeigt (Auftrag David). Deterministisch.
  useEffect(() => {
    if (!onErgebnis) return;
    const m = gueltig ? baueMarkierung(start, laenge, einheitEffektiv, ferien, kanton) : null;
    onErgebnis(m ? { markierung: m, kanton } : null);
  }, [onErgebnis, gueltig, start, laenge, einheitEffektiv, ferien, kanton]);

  const verfeinernZiel = ferien === 'zpo'
    ? zpoFristenLink({ ereignis: start, einheit: einheitEffektiv, laenge, verfahren: 'ordentlich', kanton, fristnatur: 'gesetzlich' })
    : ferien === 'schkg'
      ? '/rechner/schkg-fristen' + permalinkKodieren(SCHKG_LINK_SPEC, {
        ereignis: start, einheit: einheitEffektiv, laenge,
        modus: 'schkg_betreibungsferien', fristnatur: 'frist', kanton,
      })
      : null;

  // Eingabe-Atome pixelgleich zu den Voll-Rechnern (Redesign E5): das
  // Haus-Primitiv lc-input statt eines eigenen h-10/ring-Rezepts.
  const inputCls = 'lc-input';

  return (
    <div className="space-y-4">
      {/* items-end: bei verschieden hohen Labels (z.B. zweizeilig) bleiben die
          Eingabefelder auf gleicher Höhe (Auftrag David). */}
      <div className={`grid grid-cols-2 ${minimal ? '' : pk('sm:grid-cols-4', '@3xl/pane:grid-cols-4')} gap-3 max-w-2xl items-end`}>
        <label className="block space-y-1">
          <span className="lc-overline block">Datum (Ereignis)</span>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
            className={inputCls + ' w-full'} />
        </label>
        <label className="block space-y-1">
          <span className="lc-overline block">Frist</span>
          <input type="number" min={1} step={1} value={Number.isNaN(laenge) ? '' : laenge}
            onChange={(e) => setLaenge(parseInt(e.target.value, 10))}
            className={inputCls + ' w-full'} />
        </label>
        <label className="block space-y-1">
          <span className="lc-overline block">Einheit</span>
          <select value={einheitEffektiv} onChange={(e) => setEinheit(e.target.value as Einheit)}
            className={inputCls + ' w-full'}>
            {einheiten.map((e) => <option key={e.code} value={e.code}>{e.label}</option>)}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="lc-overline block">Kanton (Feiertage)</span>
          <select value={kanton} onChange={(e) => setKanton(e.target.value as Kanton)}
            className={inputCls + ' w-full'}>
            {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>
      </div>

      {minimal ? (
        // Startseite-Schnellrechner: kompakte Verfahrens-/Ferien-Wahl als
        // Dropdown, ohne die Erläuterungstexte (Auftrag David: möglichst wenig).
        <label className="block space-y-1 max-w-xs">
          <span className="lc-overline block">Ferien / Stillstand</span>
          <select value={ferien} onChange={(e) => waehleFerien(e.target.value as Ferien)} className={inputCls + ' w-full'}>
            {FERIEN_OPTIONEN.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
          </select>
        </label>
      ) : (
        <fieldset className="space-y-1.5">
          <legend className="lc-overline">Ferien / Stillstand</legend>
          <div className={`grid grid-cols-1 ${pk('sm:grid-cols-3', '@xl/pane:grid-cols-3')} gap-2 max-w-2xl`}>
            {FERIEN_OPTIONEN.map((o) => (
              <label key={o.code}
                className={`lc-card px-3 py-2 cursor-pointer space-y-0.5 ${ferien === o.code ? 'ring-2 ring-brass-400' : ''}`}>
                <span className="flex items-center gap-2">
                  <input type="radio" name="einfache-frist-ferien" value={o.code}
                    checked={ferien === o.code} onChange={() => waehleFerien(o.code)} />
                  <span className="text-body-s font-medium text-ink-900">{o.label}</span>
                </span>
                <span className="block text-xs text-ink-500 leading-snug">{o.sub}</span>
              </label>
            ))}
          </div>
          <p className="text-micro text-ink-500 max-w-reading">
            Strafprozessuale Fristen kennen KEINE Gerichtsferien (Art. 89 Abs. 2 StPO) –
            «Keine Ferien» wählen. Der Verwaltungs-Stillstand (Art. 22a VwVG) und der
            BGG-Stillstand (Art. 46 BGG) gelten nur für nach Tagen bestimmte Fristen; in
            den Ausnahmeverfahren nach Abs. 2 (vorsorgliche Massnahmen u. a.) «Keine Ferien»
            wählen.
          </p>
        </fieldset>
      )}

      {!gueltig ? (
        <p className="text-body-s text-ink-500">Datum und ganzzahlige Dauer eingeben – das Fristende erscheint sofort.</p>
      ) : fehler !== '' ? (
        <p className="text-body-s text-danger-700">{fehler}</p>
      ) : (
        /* R12-Schnellrechner: derselbe Ergebnis-Rahmen, aber ohne Sprungmarke
           (steht im ersten Viewport; im Tagerechner lebt darunter ein zweiter
           Ergebnisblock mit eigener Sprungmarke). */
        <ErgebnisBlock id="lc-ergebnis-einfach" sprung={false}>
          <div className="lc-notice space-y-1.5">
            <p className="lc-overline text-ink-500">Fristende</p>
            <p className="text-h3 font-semibold text-ink-900 num">{ende}</p>
            {endeZusatz !== '' && <p className="text-body-s text-ink-600">{endeZusatz}</p>}
            {/* Im Minimal-Modus (Startseite) nur das Fristende — Rechenweg-Zeilen
                und Verfeinern-Links bleiben dem Voll-Rechner überlassen. */}
            {!minimal && zeilen.length > 0 && (
              <ul className="text-body-s text-ink-500 leading-relaxed list-disc pl-5 space-y-0.5">
                {zeilen.map((z) => <li key={z}>{z}</li>)}
              </ul>
            )}
            {!minimal && verfeinernZiel && (
              <p className="text-body-s">
                <Link to={verfeinernZiel} className="font-medium text-brass-700 hover:text-brass-600 no-underline">
                  Im {ferien === 'zpo' ? 'ZPO' : 'SchKG'}-Rechner verfeinern (Verfahren, Zustellart, Hemmung …) →
                </Link>
              </p>
            )}
          </div>
        </ErgebnisBlock>
      )}
    </div>
  );
}
