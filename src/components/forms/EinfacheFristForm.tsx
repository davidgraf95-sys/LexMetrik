import { useState } from 'react';
import { Link } from 'react-router-dom';
import { berechneAllgemeineFrist, type Einheit } from '../../lib/allgemeineFrist';
import { berechneFrist } from '../../lib/zpoFristen';
import { berechneSchkgFrist } from '../../lib/schkgFristen';
import { zpoFristenLink, SCHKG_LINK_SPEC } from '../../lib/rechnerPermalinks';
import { permalinkKodieren } from '../../lib/permalink';
import { KANTONE } from '../../lib/kantone';
import type { Kanton } from '../../types/legal';

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

type Ferien = 'keine' | 'zpo' | 'schkg';

const FERIEN_OPTIONEN: { code: Ferien; label: string; sub: string }[] = [
  { code: 'keine', label: 'Keine Ferien', sub: 'Vertrags-/Gesetzesfrist (Art. 77/78 OR) – nur Wochenend-/Feiertags-Verschiebung' },
  { code: 'zpo', label: 'Gerichtsferien (ZPO)', sub: 'Stillstand nach Art. 145 ZPO – Annahme: ordentliches Verfahren, gesetzliche Frist' },
  { code: 'schkg', label: 'Betreibungsferien (SchKG)', sub: 'Art. 56/63 SchKG – Fristende in den Ferien → Verlängerung bis zum 3. Werktag' },
];

const EINHEITEN: { code: Einheit; label: string }[] = [
  { code: 'tage', label: 'Tage' },
  { code: 'wochen', label: 'Wochen' },
  { code: 'monate', label: 'Monate' },
  { code: 'jahre', label: 'Jahre' },
];

const istISOTag = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

export function EinfacheFristForm() {
  // Datum-Default heute (Darstellungsschicht; Konvention der übrigen Forms).
  const heute = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState(heute);
  const [laenge, setLaenge] = useState(10);
  const [einheit, setEinheit] = useState<Einheit>('tage');
  const [ferien, setFerien] = useState<Ferien>('keine');
  const [kanton, setKanton] = useState<Kanton>('ZH');

  // SchKG-Engine kennt keine Wochenfristen (Art. 31 SchKG i. V. m. ZPO;
  // types/schkg.ts) — keine stille Umrechnung (§1), die Option entfällt.
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

  const verfeinernZiel = ferien === 'zpo'
    ? zpoFristenLink({ ereignis: start, einheit: einheitEffektiv, laenge, verfahren: 'ordentlich', kanton, fristnatur: 'gesetzlich' })
    : ferien === 'schkg'
      ? '/rechner/schkg-fristen' + permalinkKodieren(SCHKG_LINK_SPEC, {
        ereignis: start, einheit: einheitEffektiv, laenge,
        modus: 'schkg_betreibungsferien', fristnatur: 'frist', kanton,
      })
      : null;

  const inputCls = 'h-10 px-3 rounded-lg border border-line bg-surface text-body-s text-ink-900 focus:outline-none focus:ring-2 focus:ring-brass-400';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
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

      <fieldset className="space-y-1.5">
        <legend className="lc-overline">Ferien / Stillstand</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-2xl">
          {FERIEN_OPTIONEN.map((o) => (
            <label key={o.code}
              className={`lc-card px-3 py-2 cursor-pointer space-y-0.5 ${ferien === o.code ? 'ring-2 ring-brass-400' : ''}`}>
              <span className="flex items-center gap-2">
                <input type="radio" name="einfache-frist-ferien" value={o.code}
                  checked={ferien === o.code} onChange={() => setFerien(o.code)} />
                <span className="text-body-s font-medium text-ink-900">{o.label}</span>
              </span>
              <span className="block text-xs text-ink-500 leading-snug">{o.sub}</span>
            </label>
          ))}
        </div>
        <p className="text-micro text-ink-500 max-w-reading">
          Sonstige Ferienregeln: Strafprozessuale Fristen kennen KEINE Gerichtsferien
          (Art. 89 Abs. 2 StPO) – «Keine Ferien» wählen; der Verwaltungs-Stillstand
          (Art. 22a VwVG) und der BGG-Stillstand (Art. 46 BGG) sind noch nicht abgebildet.
        </p>
      </fieldset>

      {!gueltig ? (
        <p className="text-body-s text-ink-500">Datum und ganzzahlige Dauer eingeben – das Fristende erscheint sofort.</p>
      ) : fehler !== '' ? (
        <p className="text-body-s text-danger-700">{fehler}</p>
      ) : (
        <div className="lc-notice space-y-1.5">
          <p className="lc-overline text-ink-500">Fristende</p>
          <p className="text-h3 font-semibold text-ink-900 num">{ende}</p>
          {endeZusatz !== '' && <p className="text-body-s text-ink-600">{endeZusatz}</p>}
          {zeilen.length > 0 && (
            <ul className="text-body-s text-ink-500 leading-relaxed list-disc pl-5 space-y-0.5">
              {zeilen.map((z) => <li key={z}>{z}</li>)}
            </ul>
          )}
          {verfeinernZiel && (
            <p className="text-body-s">
              <Link to={verfeinernZiel} className="font-medium text-brass-700 hover:text-brass-600 no-underline">
                Im {ferien === 'zpo' ? 'ZPO' : 'SchKG'}-Rechner verfeinern (Verfahren, Zustellart, Hemmung …) →
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
