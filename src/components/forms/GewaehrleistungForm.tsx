import { useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import type { Kanton } from '../../types/legal';
import {
  berechneGewaehrleistung,
  type GewaehrleistungInput, type GewaehrleistungErgebnis,
  type GwVertragstyp, type GwObjekt, type GwMangelTyp,
} from '../../lib/gewaehrleistung';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { DatumsFeld } from '../DatumsFeld';
import { PdfExportButton } from '../PdfExport';

const GW_DISCLAIMER =
  'Automatisierte Orientierungsberechnung zu Gewährleistung und Mängelrüge (Art. 197 ff., 219/219a, 367 ff. OR; ' +
  'Teilrevision «Baumängel» in Kraft seit 1.1.2026) – keine Rechtsberatung. Die «sofort»-Rügefrist ist einzelfallabhängig; ' +
  'alle Tagesangaben sind Näherungen der Rechtsprechung. Nicht abgebildet: Viehkauf, Kulturgüter, Rechtsgewährleistung ' +
  '(Eviktion), SIA-118-Detailregelungen sowie die AT-Verjährungsmechanik (Stillstand/Unterbrechung/Verzicht — dafür der ' +
  'Verjährungsrechner). Umstritten bzw. offen: Beginn bei sukzessiver Ablieferung, Abgrenzung Werkvertrag/Kauf, Reichweite ' +
  'der «Integration» in ein Bauwerk. Der konkrete Fall ist fachlich zu prüfen.';

const TYPEN: { code: GwVertragstyp; label: string }[] = [
  { code: 'fahrniskauf', label: 'Fahrniskauf (Art. 197 ff. OR)' },
  { code: 'werkvertrag', label: 'Werkvertrag (Art. 367 ff. OR)' },
  { code: 'grundstueckkauf', label: 'Grundstückkauf (Art. 219/219a OR)' },
];

const OBJEKTE: Record<GwVertragstyp, { code: GwObjekt; label: string }[]> = {
  fahrniskauf: [
    { code: 'beweglich', label: 'Bewegliche Sache' },
    { code: 'integriert', label: 'In ein unbewegliches Werk integriert (Mangel des Werks verursacht)' },
  ],
  werkvertrag: [
    { code: 'beweglich', label: 'Bewegliches Werk' },
    { code: 'unbeweglich', label: 'Unbewegliches Werk (Baute; inkl. Architekt/Ingenieur)' },
    { code: 'integriert', label: 'Bewegliches Werk, in ein unbewegliches integriert' },
  ],
  grundstueckkauf: [],
};

const KANTONE: Kanton[] = ['ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL', 'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU'];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-body-s font-medium text-ink-700">{label}</label>
      {children}
      {hint && <p className="text-body-s text-ink-500">{hint}</p>}
    </div>
  );
}

const inputCls = 'lc-input';
const fmtISO = (s?: string) => (s ? s.split('-').reverse().join('.') : '–');

export function GewaehrleistungForm() {
  const heute = format(new Date(), 'yyyy-MM-dd');
  const [typ, setTyp] = useState<GwVertragstyp>('fahrniskauf');
  const [vertragsdatum, setVertragsdatum] = useState('2026-02-01');
  const [objekt, setObjekt] = useState<GwObjekt>('beweglich');
  const [uebergabe, setUebergabe] = useState('2026-03-02');
  const [eigentumserwerb, setEigentumserwerb] = useState('');
  const [mangelTyp, setMangelTyp] = useState<GwMangelTyp>('offen');
  const [entdeckung, setEntdeckung] = useState('');
  const [ruegeAm, setRuegeAm] = useState('');
  const [arglist, setArglist] = useState(false);
  const [konsument, setKonsument] = useState(false);
  const [gebraucht, setGebraucht] = useState(false);
  const [sia, setSia] = useState(false);
  const [vereinbart, setVereinbart] = useState('');
  const [kanton, setKanton] = useState<Kanton>('ZH');
  const [stichtag, setStichtag] = useState(heute);

  const istGrundstueck = typ === 'grundstueckkauf';
  const istWerk = typ === 'werkvertrag';
  const uebergabeLabel = istGrundstueck ? 'Besitzesantritt (Übergabe)' : istWerk ? 'Abnahme des Werks' : 'Ablieferung der Sache';
  const objektOptionen = OBJEKTE[typ];
  const objektEff: GwObjekt = istGrundstueck ? 'unbeweglich' : objektOptionen.some((o) => o.code === objekt) ? objekt : 'beweglich';

  const input: GewaehrleistungInput = {
    vertragstyp: typ,
    vertragsdatum,
    objekt: objektEff,
    uebergabe,
    eigentumserwerb: istGrundstueck && eigentumserwerb ? eigentumserwerb : undefined,
    mangelTyp,
    entdeckung: mangelTyp === 'versteckt' && entdeckung ? entdeckung : undefined,
    ruegeErhobenAm: ruegeAm || undefined,
    arglist,
    konsumentenkauf: typ === 'fahrniskauf' ? konsument : undefined,
    gebraucht: typ === 'fahrniskauf' && konsument ? gebraucht : undefined,
    vereinbarteVerjaehrungJahre: vereinbart.trim() === '' ? undefined : Number(vereinbart),
    sia118: istWerk ? sia : undefined,
    kanton,
    stichtag,
  };

  let ergebnis: GewaehrleistungErgebnis | null = null;
  try { ergebnis = vertragsdatum && uebergabe && stichtag ? berechneGewaehrleistung(input) : null; } catch { ergebnis = null; }

  const eingaben: Record<string, string> = {
    'Vertragstyp': TYPEN.find((t) => t.code === typ)!.label,
    'Vertragsschluss': fmtISO(vertragsdatum),
    ...(istGrundstueck ? {} : { 'Objekt': objektOptionen.find((o) => o.code === objektEff)?.label ?? '' }),
    [uebergabeLabel]: fmtISO(uebergabe),
    ...(istGrundstueck && eigentumserwerb ? { 'Eigentumserwerb (Grundbuch)': fmtISO(eigentumserwerb) } : {}),
    'Mangel': mangelTyp === 'versteckt' ? `versteckt, entdeckt am ${fmtISO(entdeckung)}` : 'offen erkennbar',
    ...(arglist ? { 'Absichtliche Täuschung': 'ja' } : {}),
    ...(typ === 'fahrniskauf' && konsument ? { 'Konsumentenkauf (Art. 210 Abs. 4)': gebraucht ? 'ja, gebrauchte Sache' : 'ja' } : {}),
    ...(istWerk && sia ? { 'SIA-Norm 118': 'vereinbart' } : {}),
    ...(vereinbart ? { 'Vereinbarte Verjährungsfrist': `${vereinbart} Jahre` } : {}),
    'Stichtag': fmtISO(stichtag),
    'Kanton (Feiertage)': kanton,
  };

  const pdfConfig: PdfDocConfig = {
    title: 'Gewährleistung & Mängelrüge (OR)',
    domain: 'gewaehrleistung',
    fileBase: 'Gewaehrleistung-Maengelruege',
    inputs: eingaben,
    sections: ergebnis && ergebnis.status === 'ok' ? [{ titel: 'Gewährleistung & Mängelrüge (Art. 197 ff., 367 ff. OR)', ergebnis }] : [],
    disclaimer: GW_DISCLAIMER,
  };

  return (
    <div className="space-y-6">
      {/* Pflicht-Disclaimer */}
      <details className="lc-notice-danger rounded-md" style={{ padding: '10px 14px', borderLeft: '3px solid var(--danger-500)' }}>
        <summary className="text-body-s text-danger-700 cursor-pointer">
          <strong>Keine Rechtsberatung</strong> – Rüge- und Verjährungsfristen der Sachgewährleistung; die «sofort»-Frist ist eine Näherung. <span className="opacity-80">Details</span>
        </summary>
        <p className="text-body-s text-danger-700 mt-2">{GW_DISCLAIMER}</p>
      </details>

      {/* Vertrag */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Vertragstyp">
          <select value={typ} onChange={(e) => setTyp(e.target.value as GwVertragstyp)} className={inputCls}>
            {TYPEN.map((t) => <option key={t.code} value={t.code}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Vertragsschluss" hint="Recht-Schalter: ab 1.1.2026 gilt die Baumängel-Revision (60-Tage-Rüge, teilzwingende Fristen)">
          <DatumsFeld value={vertragsdatum} onChange={setVertragsdatum} className={inputCls} />
        </Field>
        {!istGrundstueck && (
          <Field label="Objekt" hint="bestimmt 2- vs. 5-Jahres-Verjährung und die 60-Tage-Rüge im Baubereich">
            <select value={objektEff} onChange={(e) => setObjekt(e.target.value as GwObjekt)} className={inputCls}>
              {objektOptionen.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
            </select>
          </Field>
        )}
        <Field label={uebergabeLabel} hint={istGrundstueck ? 'löst die Prüf-/Rügeobliegenheit aus' : 'dies a quo von Rüge (offene Mängel) und Verjährung'}>
          <DatumsFeld value={uebergabe} onChange={setUebergabe} className={inputCls} />
        </Field>
        {istGrundstueck && (
          <Field label="Eigentumserwerb (Grundbucheintrag)" hint="dies a quo der Verjährung (Art. 219a Abs. 3 OR)">
            <DatumsFeld value={eigentumserwerb} onChange={setEigentumserwerb} className={inputCls} />
          </Field>
        )}
      </div>

      {/* Mangel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Art des Mangels">
          <div className="flex gap-1 p-1 bg-surface rounded-xl w-fit" role="group" aria-label="Mangeltyp">
            {([['offen', 'offen erkennbar'], ['versteckt', 'versteckt']] as const).map(([code, label]) => (
              <button key={code} type="button" onClick={() => setMangelTyp(code)}
                aria-pressed={mangelTyp === code}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  mangelTyp === code ? 'bg-surface-raised text-brass-700 shadow-sm border border-line' : 'text-ink-600 hover:text-ink-900'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </Field>
        {mangelTyp === 'versteckt' && (
          <Field label="Entdeckung des Mangels" hint="dies a quo der Rügefrist bei versteckten Mängeln">
            <DatumsFeld value={entdeckung} onChange={setEntdeckung} className={inputCls} />
          </Field>
        )}
        <Field label="Rüge erhoben am (optional)" hint="prüft die Rechtzeitigkeit gegen Richtwerte bzw. 60-Tage-Frist">
          <DatumsFeld value={ruegeAm} onChange={setRuegeAm} className={inputCls} />
        </Field>
        <Field label="Vereinbarte Verjährungsfrist (Jahre, optional)" hint="wird gegen Mindest- (Art. 210 Abs. 4, 219a Abs. 3, 371 Abs. 3) und Höchstdauern geprüft">
          <input type="number" min={0} step={0.5} value={vereinbart} onChange={(e) => setVereinbart(e.target.value)}
            placeholder="leer = gesetzliche Frist" className={inputCls} />
        </Field>
      </div>

      {/* Schalter */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer text-ink-700">
          <input type="checkbox" checked={arglist} onChange={(e) => setArglist(e.target.checked)} />
          Absichtliche Täuschung durch Verkäufer/Unternehmer (Art. 203 / 210 Abs. 6 OR)
        </label>
        {typ === 'fahrniskauf' && (
          <>
            <label className="flex items-center gap-2 text-sm cursor-pointer text-ink-700">
              <input type="checkbox" checked={konsument} onChange={(e) => setKonsument(e.target.checked)} />
              Konsumentenkauf (persönlicher/familiärer Gebrauch, gewerblicher Verkäufer — Art. 210 Abs. 4 OR)
            </label>
            {konsument && (
              <label className="flex items-center gap-2 text-sm cursor-pointer text-ink-700 pl-6">
                <input type="checkbox" checked={gebraucht} onChange={(e) => setGebraucht(e.target.checked)} />
                Gebrauchte Sache (Mindestfrist 1 statt 2 Jahre)
              </label>
            )}
          </>
        )}
        {istWerk && (
          <label className="flex items-center gap-2 text-sm cursor-pointer text-ink-700">
            <input type="checkbox" checked={sia} onChange={(e) => setSia(e.target.checked)} />
            SIA-Norm 118 vereinbart (zweijährige Garantiefrist, 5-Jahres-Verjährung — Vertragswerk, zu prüfen)
          </label>
        )}
      </div>

      {/* Stichtag/Kanton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Stichtag (Prüfdatum)">
          <DatumsFeld value={stichtag} onChange={setStichtag} className={inputCls} />
        </Field>
        <Field label="Kanton (Feiertage am Erfüllungsort)" hint="Fristende an Sa/So/Feiertag → nächster Werktag (Art. 78 OR)">
          <select value={kanton} onChange={(e) => setKanton(e.target.value as Kanton)} className={inputCls}>
            {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>
      </div>

      {ergebnis && ergebnis.status === 'ok' && (
        <div className="space-y-4">
          <p className="lc-live lc-overline text-ink-400 normal-case" style={{ letterSpacing: '0.04em' }}>Live-Berechnung – aktualisiert sich automatisch</p>

          {/* Eckdaten: Rügefrist (Verwirkung) und Verjährung (Einrede) strikt getrennt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-surface-raised p-4 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-ink-500">Mängelrüge — Verwirkungsfrist</p>
                {ergebnis.ruege.zwingend && <span className="lc-badge lc-badge-warn shrink-0">zwingend</span>}
              </div>
              {ergebnis.ruege.art === 'entfaellt' ? (
                <p className="text-lg font-semibold text-ink-900">entfällt (Arglist, Art. 203 OR)</p>
              ) : ergebnis.ruege.art === 'sofort' ? (
                <>
                  <p className="text-lg font-semibold text-ink-900 num">«sofort» — Richtwert {fmtISO(ergebnis.ruege.richtwertISO)}</p>
                  <p className="text-xs text-ink-500 num">sicher: {fmtISO(ergebnis.ruege.sicherISO)} · äusserstens: {fmtISO(ergebnis.ruege.maximalISO)} (Einzelfall)</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-ink-900 num">bis {fmtISO(ergebnis.ruege.endeISO)}</p>
                  <p className="text-xs text-ink-500">{ergebnis.ruege.art === 'tage60' ? '60 Tage' : 'SIA-Garantiefrist (2 Jahre)'} ab {fmtISO(ergebnis.ruege.basisISO)}</p>
                </>
              )}
              <p className="text-xs text-ink-400">Versäumnis = Genehmigungsfiktion; keine Unterbrechung/Hemmung</p>
              {ergebnis.ruege.beurteilung && <p className="text-body-s font-medium text-brass-700">{ergebnis.ruege.beurteilung}</p>}
            </div>

            <div className="rounded-xl border border-line bg-surface-raised p-4 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-ink-500">Verjährung — Einrede (Art. 142 OR)</p>
                {ergebnis.verjaehrung.teilzwingend && <span className="lc-badge lc-badge-ok shrink-0">teilzwingend</span>}
              </div>
              <p className="text-lg font-semibold text-ink-900 num">
                {ergebnis.verjaehrung.jahre} Jahre → {fmtISO(ergebnis.verjaehrung.endeISO)}
              </p>
              <p className="text-xs text-ink-500 num">ab {fmtISO(ergebnis.verjaehrung.beginnISO)} · am Stichtag:{' '}
                {ergebnis.verjaehrung.verjaehrtAmStichtag
                  ? <span className="text-danger-700 font-semibold">verjährt</span>
                  : <span className="text-sage-700 font-semibold">nicht verjährt</span>}
              </p>
              <p className="text-xs text-ink-400">
                Stillstand/Unterbrechung/Verzicht: <Link to="/rechner/verjaehrung" className="text-brass-700 no-underline hover:text-brass-600">Verjährungsrechner →</Link>
              </p>
            </div>
          </div>

          <ErgebnisAnzeige titel="Gewährleistung & Mängelrüge (Art. 197 ff., 367 ff. OR)" ergebnis={ergebnis} />
          <PdfExportButton config={pdfConfig} />
        </div>
      )}

      {ergebnis && ergebnis.status !== 'ok' && (
        <div className="rounded-lg border border-line bg-danger-bg p-4">
          <p className="text-sm text-danger-700">{ergebnis.ergebnis}</p>
        </div>
      )}
    </div>
  );
}
