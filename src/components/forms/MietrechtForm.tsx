import { KANTONE } from '../../lib/kantone';
import { FehlerBox, Field, LiveHeader, inputCls } from '../vorlagen/ui';
import { useState } from 'react';
import type { Kanton } from '../../types/legal';
import type { MietInput, MietErgebnis, Mietobjekt, Kuendigungsart, TerminQuelle, MietPartei } from '../../types/mietrecht';
import { berechneMietkuendigung } from '../../lib/mietrecht';
import { ORTSUEBLICHE_TERMINE } from '../../data/mietTermine';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { DatumsFeld } from '../DatumsFeld';
import { PdfExportButton } from '../PdfExport';
import { FristenKalender } from '../FristenKalender';

const MIET_DISCLAIMER =
  'Automatisierte Orientierungsberechnung der Kündigungstermine und -fristen im Mietrecht (Art. 253 ff. OR) – ' +
  'keine Rechtsberatung. Die ortsüblichen Kündigungstermine sind eine Tatfrage, variieren teils nach Gemeinde und ' +
  'sind verbindlich nur bei der Schlichtungsbehörde bzw. Gemeinde zu erfragen. Massgeblich für den Zugang ist die ' +
  'absolute Empfangstheorie; für Art. 257d/269d OR gilt die relative Empfangstheorie. Formvorschriften ' +
  '(Art. 266l–266o OR), Vertrag, Rahmenmietverträge und kantonale Usanzen sowie der konkrete Sachverhalt sind eigenständig zu prüfen. ' +
  'Für die Wahrung einer Frist im Einzelfall ist allein die nutzende Person verantwortlich.';


const ARTEN: { code: Kuendigungsart; label: string }[] = [
  { code: 'ordentlich', label: 'Ordentliche Kündigung (Art. 266a–f OR)' },
  { code: 'zahlungsverzug', label: 'Zahlungsverzug (Art. 257d OR)' },
  { code: 'pflichtverletzung', label: 'Schwere Pflichtverletzung (Art. 257f Abs. 3 OR)' },
  { code: 'wichtige_gruende', label: 'Wichtige Gründe (Art. 266g OR)' },
  { code: 'tod_mieter', label: 'Tod des Mieters – Kündigung der Erben (Art. 266i OR)' },
  { code: 'eigenbedarf', label: 'Eigentümerwechsel / dringender Eigenbedarf (Art. 261 Abs. 2 OR)' },
  { code: 'konsumgueter', label: 'Konsumgütermiete (Art. 266k OR)' },
];

const OBJEKTE: { code: Mietobjekt; label: string }[] = [
  { code: 'wohnung', label: 'Wohnräume (3 Monate, Art. 266c)' },
  { code: 'geschaeftsraum', label: 'Geschäftsräume (6 Monate, Art. 266d)' },
  { code: 'unbewegliche_sache', label: 'Unbewegliche Sache / Fahrnisbaute (3 Monate, Art. 266b)' },
  { code: 'moebliertes_zimmer', label: 'Möbliertes Zimmer / Einstellplatz (2 Wochen, Art. 266e)' },
  { code: 'bewegliche_sache', label: 'Bewegliche Sache (3 Tage, Art. 266f)' },
];

const QUELLEN: { code: TerminQuelle; label: string }[] = [
  { code: 'ortsueblich', label: 'Ortsüblicher Termin (kantonale Tabelle, Tatfrage)' },
  { code: 'vertraglich_monate', label: 'Vertraglich vereinbarte Termine (Monatsenden)' },
  { code: 'jedes_monatsende', label: 'Vertragsklausel «auf jedes Monatsende»' },
  { code: 'gesetzlich', label: 'Gesetzliche Auffangregel (Ende einer Mietdauer-Periode)' },
];

const MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];


export function MietrechtForm() {
  const [art, setArt] = useState<Kuendigungsart>('ordentlich');
  const [objekt, setObjekt] = useState<Mietobjekt>('wohnung');
  const [partei, setPartei] = useState<MietPartei>('mieter');
  const [zugang, setZugang] = useState('2025-06-23');
  const [kanton, setKanton] = useState<Kanton>('ZH');
  const [quelle, setQuelle] = useState<TerminQuelle>('ortsueblich');
  const [monate, setMonate] = useState<number[]>([3, 9]);
  const [ohneDez, setOhneDez] = useState(true);
  const [mietbeginn, setMietbeginn] = useState('');
  const [fristMonate, setFristMonate] = useState('');
  const [formular, setFormular] = useState(true);
  const [familienwohnung, setFamilienwohnung] = useState(false);
  const [separat, setSeparat] = useState(true);
  const [zustimmung, setZustimmung] = useState(true);
  const [zaZugang, setZaZugang] = useState('');

  const istRaum = objekt === 'wohnung' || objekt === 'geschaeftsraum';
  const terminsucheAktiv = art === 'ordentlich' && objekt !== 'bewegliche_sache';
  const brauchtMietbeginn =
    art === 'konsumgueter' ||
    (terminsucheAktiv && (quelle === 'gesetzlich' || objekt === 'moebliertes_zimmer' ||
      (quelle === 'ortsueblich' && ['keine', 'unbekannt'].includes(ORTSUEBLICHE_TERMINE[kanton].typ))));

  const input: MietInput = {
    kuendigungsart: art,
    objekt,
    zugang,
    kanton,
    partei,
    terminQuelle: terminsucheAktiv ? quelle : undefined,
    vertragsTermineMonate: quelle === 'vertraglich_monate' ? monate : undefined,
    dezemberAusgeschlossen: quelle === 'jedes_monatsende' ? ohneDez : undefined,
    mietbeginn: mietbeginn || undefined,
    vereinbarteFristMonate: fristMonate.trim() === '' ? undefined : Number(fristMonate),
    amtlichesFormular: istRaum && partei === 'vermieter' ? formular : undefined,
    familienwohnung: istRaum ? familienwohnung : undefined,
    separateZustellung: istRaum && familienwohnung && partei === 'vermieter' ? separat : undefined,
    zustimmungEhegatte: istRaum && familienwohnung && partei === 'mieter' ? zustimmung : undefined,
    zahlungsaufforderungZugang: art === 'zahlungsverzug' && zaZugang ? zaZugang : undefined,
  };

  const fehler: string[] = [];
  if (!zugang) fehler.push('Bitte das Zugangsdatum der Kündigung angeben.');
  if (brauchtMietbeginn && !mietbeginn) fehler.push('Für diese Konstellation wird der Mietbeginn benötigt (Ende einer Mietdauer-Periode).');
  if (quelle === 'vertraglich_monate' && terminsucheAktiv && monate.length === 0) fehler.push('Bitte mindestens einen vertraglichen Kündigungstermin (Monat) wählen.');

  let ergebnis: MietErgebnis | null = null;
  if (fehler.length === 0) {
    try { ergebnis = berechneMietkuendigung(input); } catch (err) { fehler.push((err as Error).message); }
  }

  const eingaben: Record<string, string> = {
    'Kündigungsart': ARTEN.find((a) => a.code === art)?.label ?? art,
    'Mietobjekt': OBJEKTE.find((o) => o.code === objekt)?.label ?? objekt,
    'Kündigende Partei': partei === 'vermieter' ? 'Vermieter' : 'Mieter',
    'Zugang der Kündigung': zugang,
    'Kanton': kanton,
    ...(terminsucheAktiv ? { 'Termin-Quelle': QUELLEN.find((q) => q.code === quelle)?.label ?? quelle } : {}),
    ...(quelle === 'vertraglich_monate' && terminsucheAktiv ? { 'Vertragstermine': monate.map((m) => MONATE[m - 1]).join(', ') } : {}),
    ...(mietbeginn ? { 'Mietbeginn': mietbeginn } : {}),
    ...(fristMonate ? { 'Vereinbarte Frist (Monate)': fristMonate } : {}),
    ...(art === 'zahlungsverzug' && zaZugang ? { 'Zugang Zahlungsaufforderung': zaZugang } : {}),
  };

  const pdfConfig: PdfDocConfig = {
    title: 'Mietrecht – Kündigungstermin-Berechnung',
    domain: 'mietrecht',
    fileBase: 'Mietrecht-Kuendigung',
    inputs: eingaben,
    sections: ergebnis ? [{ titel: 'Kündigungstermine und -fristen (Art. 253 ff. OR)', ergebnis }] : [],
    disclaimer: MIET_DISCLAIMER,
  };

  const ort = ORTSUEBLICHE_TERMINE[kanton];

  return (
    <div className="space-y-6">
      <details className="lc-notice-danger">
        <summary className="text-body-s text-danger-700 cursor-pointer">
          <strong>Keine Rechtsberatung</strong> – Orientierung (Art. 253 ff. OR). Ortsübliche Termine sind Tatfrage; verbindlich ist die Schlichtungsbehörde.
        </summary>
        <p className="text-body-s text-danger-700 mt-2">{MIET_DISCLAIMER}</p>
      </details>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Kündigungsart">
          <select value={art} onChange={(e) => setArt(e.target.value as Kuendigungsart)} className={inputCls}>
            {ARTEN.map((a) => <option key={a.code} value={a.code}>{a.label}</option>)}
          </select>
        </Field>
        <Field label="Mietobjekt" hint="Bestimmt die gesetzliche Mindestfrist">
          <select value={objekt} onChange={(e) => setObjekt(e.target.value as Mietobjekt)} className={inputCls}>
            {OBJEKTE.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Kündigende Partei">
          <select value={partei} onChange={(e) => setPartei(e.target.value as MietPartei)} className={inputCls}>
            <option value="mieter">Mieter</option>
            <option value="vermieter">Vermieter</option>
          </select>
        </Field>
        <Field label="Zugang der Kündigung" hint="Absolute Empfangstheorie; bei Einschreiben i.d.R. Folgetag der Abholungseinladung">
          <DatumsFeld value={zugang} onChange={(v) => setZugang(v)} className={inputCls} />
        </Field>
        <Field label="Kanton" hint={ort.hinweis ?? 'Für ortsübliche Termine und Feiertage (Art. 78 OR)'}>
          <select value={kanton} onChange={(e) => setKanton(e.target.value as Kanton)} className={inputCls}>
            {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>
        {terminsucheAktiv && objekt !== 'moebliertes_zimmer' && (
          <Field label="Kündigungstermine (Quelle)" hint="Hierarchie: Vertrag → Ortsgebrauch → gesetzliche Auffangregel">
            <select value={quelle} onChange={(e) => setQuelle(e.target.value as TerminQuelle)} className={inputCls}>
              {QUELLEN.map((q) => <option key={q.code} value={q.code}>{q.label}</option>)}
            </select>
          </Field>
        )}
      </div>

      {terminsucheAktiv && quelle === 'vertraglich_monate' && (
        <Field label="Vereinbarte Kündigungstermine (Monatsenden)">
          <div className="flex flex-wrap gap-2">
            {MONATE.map((m, i) => (
              <label key={m} className={`px-2.5 py-1.5 rounded-md text-body-s cursor-pointer border ${monate.includes(i + 1) ? 'bg-ink-900 text-paper border-ink-900' : 'bg-surface border-line text-ink-700'}`}>
                <input type="checkbox" className="hidden" checked={monate.includes(i + 1)}
                  onChange={() => setMonate((arr) => (arr.includes(i + 1) ? arr.filter((x) => x !== i + 1) : [...arr, i + 1].sort((a, b) => a - b)))} />
                {m}
              </label>
            ))}
          </div>
        </Field>
      )}
      {terminsucheAktiv && quelle === 'jedes_monatsende' && (
        <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
          <input type="checkbox" checked={ohneDez} onChange={(e) => setOhneDez(e.target.checked)} />
          Ausnahme: nicht auf den 31. Dezember
        </label>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(brauchtMietbeginn || objekt === 'moebliertes_zimmer' || quelle === 'gesetzlich') && (
          <Field label="Mietbeginn" hint="Für die gesetzliche Auffangregel (Ende einer Mietdauer-Periode)">
            <DatumsFeld value={mietbeginn} onChange={(v) => setMietbeginn(v)} className={inputCls} />
          </Field>
        )}
        {art === 'ordentlich' && istRaum && (
          <Field label="Vereinbarte Kündigungsfrist in Monaten (optional)" hint="Länger als das Gesetz zulässig; kürzer wäre nichtig (Art. 266a Abs. 1 OR)">
            <input type="number" inputMode="decimal" min={1} value={fristMonate} onChange={(e) => setFristMonate(e.target.value)} className={inputCls + ' w-28'} />
          </Field>
        )}
        {art === 'zahlungsverzug' && (
          <Field label="Zugang der Zahlungsaufforderung (Stufe 1)" hint="Relative Empfangstheorie (BGE 119 II 147)">
            <DatumsFeld value={zaZugang} onChange={(v) => setZaZugang(v)} className={inputCls} />
          </Field>
        )}
      </div>

      {/* Form-/Nichtigkeitsprüfung */}
      {istRaum && (
        <div className="space-y-2">
          <p className="lc-overline">Form (Art. 266l–266o OR)</p>
          {partei === 'vermieter' && (
            <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" checked={formular} onChange={(e) => setFormular(e.target.checked)} />
              Amtlich genehmigtes Kündigungsformular verwendet (Art. 266l Abs. 2 OR)
            </label>
          )}
          <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" checked={familienwohnung} onChange={(e) => setFamilienwohnung(e.target.checked)} />
            Familienwohnung (Sonderschutz Art. 266m/266n OR)
          </label>
          {familienwohnung && partei === 'vermieter' && (
            <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700 pl-6">
              <input type="checkbox" checked={separat} onChange={(e) => setSeparat(e.target.checked)} />
              Kündigung beiden Ehegatten/Partnern separat zugestellt (Art. 266n OR)
            </label>
          )}
          {familienwohnung && partei === 'mieter' && (
            <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700 pl-6">
              <input type="checkbox" checked={zustimmung} onChange={(e) => setZustimmung(e.target.checked)} />
              Ausdrückliche Zustimmung des Ehegatten/Partners liegt vor (Art. 266m OR)
            </label>
          )}
        </div>
      )}

      <FehlerBox fehler={fehler} />

      {ergebnis && (
        <div className="space-y-4">
          <LiveHeader />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="lc-tile">
              <p className="text-xs text-ink-500 mb-1">{ergebnis.status === 'nichtig' ? 'Form' : 'Mietverhältnis endet am'}</p>
              <p className="text-body-l font-semibold text-ink-900">{ergebnis.status === 'nichtig' ? 'NICHTIG (Art. 266o OR)' : ergebnis.endtermin ?? '–'}</p>
            </div>
            <div className="lc-tile">
              <p className="text-xs text-ink-500 mb-1">Spätester Zugang für diesen Termin</p>
              <p className="text-body-l font-semibold text-ink-900">{ergebnis.spaetesterZugang ?? '–'}</p>
            </div>
            <div className="lc-tile">
              <p className="text-xs text-ink-500 mb-1">{ergebnis.zahlungsfristEnde ? 'Zahlungsfrist läuft bis' : 'Anfechtung/Erstreckung bis'}</p>
              <p className="text-body-l font-semibold text-ink-900">{ergebnis.zahlungsfristEnde ?? ergebnis.anfechtungBis ?? '–'}</p>
            </div>
          </div>

          {ergebnis.endterminISO && (
            <FristenKalender
              ereignisISO={ergebnis.zugangISO}
              aQuoISO={ergebnis.zugangISO}
              adQuemISO={ergebnis.endterminISO}
              kanton={kanton}
              stillstandAktiv={false}
              labels={{ ereignis: 'Zugang der Kündigung', aquo: 'Zugang der Kündigung', adquem: 'Vertragsende' }}
            />
          )}

          <ErgebnisAnzeige titel="Kündigungstermine und -fristen (Art. 253 ff. OR)" ergebnis={ergebnis} />
          <PdfExportButton config={pdfConfig} />
        </div>
      )}
    </div>
  );
}
