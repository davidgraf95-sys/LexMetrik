import { KANTONE } from '../../lib/kantone';
import { NormText } from '../NormText';
import { Checkbox, Field, inputCls } from '../vorlagen/ui';
import { ErgebnisBlock } from '../ErgebnisBlock';
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
import { PflichtDisclaimer } from '../PflichtDisclaimer';
import { DatumsFeld } from '../DatumsFeld';
import { PdfExportButton } from '../PdfExport';
import { AktenzeichenFeld } from '../AktenzeichenFeld';
import { BegruendungAbsatz } from '../BegruendungAbsatz';
import { begruendungsAbsatz } from '../../lib/begruendung';
import { LinkTeilenButton } from '../LinkTeilenButton';
import { permalinkKodieren, permalinkLesen, istISO, istKanton, einerVon, type PermalinkSpec } from '../../lib/permalink';
import { IcsExportButton } from '../IcsExportButton';
import { getStandardKanton } from '../../lib/einstellungen';

const GW_DISCLAIMER =
  'Automatisierte Orientierungsberechnung zu Gewährleistung und Mängelrüge (Art. 197 ff., 219/219a, 367 ff. OR; ' +
  'Teilrevision «Baumängel» in Kraft seit 1.1.2026) – keine Rechtsberatung. Die «sofort»-Rügefrist ist einzelfallabhängig; ' +
  'alle Tagesangaben sind Näherungen der Rechtsprechung. Nicht abgebildet: Viehkauf, Kulturgüter, Rechtsgewährleistung ' +
  '(Eviktion), SIA-118-Detailregelungen sowie die AT-Verjährungsmechanik (Stillstand/Unterbrechung/Verzicht – dafür der ' +
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


const fmtISO = (s?: string) => (s ? s.split('-').reverse().join('.') : '–');

// Permalink (FAHRPLAN-PRAXIS 1.3)
type GwLink = {
  typ: string; vertragsdatum: string; objekt: string; uebergabe: string;
  eigentumserwerb?: string; mangelTyp: string; entdeckung?: string; ruegeAm?: string;
  arglist?: boolean; konsument?: boolean; gebraucht?: boolean; sia?: boolean;
  vereinbart?: string; kanton: string; stichtag: string;
};
const GW_LINK_SPEC: PermalinkSpec<GwLink & Record<string, unknown>> = {
  typ: { p: 'ty', typ: 'str', gueltig: einerVon('fahrniskauf', 'werkvertrag', 'grundstueckkauf') },
  vertragsdatum: { p: 'vd', typ: 'str', gueltig: istISO },
  objekt: { p: 'ob', typ: 'str', gueltig: einerVon('beweglich', 'integriert', 'unbeweglich') },
  uebergabe: { p: 'ue', typ: 'str', gueltig: istISO },
  eigentumserwerb: { p: 'ee', typ: 'str', gueltig: istISO },
  mangelTyp: { p: 'mt', typ: 'str', gueltig: einerVon('offen', 'versteckt') },
  entdeckung: { p: 'en', typ: 'str', gueltig: istISO },
  ruegeAm: { p: 'ra', typ: 'str', gueltig: istISO },
  arglist: { p: 'ar', typ: 'bool' },
  konsument: { p: 'ko', typ: 'bool' },
  gebraucht: { p: 'ge', typ: 'bool' },
  sia: { p: 'sa', typ: 'bool' },
  vereinbart: { p: 've', typ: 'str', gueltig: (v) => v.length <= 6 },
  kanton: { p: 'k', typ: 'str', gueltig: istKanton },
  stichtag: { p: 's', typ: 'str', gueltig: istISO },
};

export function GewaehrleistungForm() {
  const [ausLink] = useState<Partial<GwLink>>(() => {
    try { return permalinkLesen(GW_LINK_SPEC, window.location.search); } catch { return {}; }
  });
  const heute = format(new Date(), 'yyyy-MM-dd');
  const [typ, setTyp] = useState<GwVertragstyp>((ausLink.typ as GwVertragstyp | undefined) ?? 'fahrniskauf');
  const [vertragsdatum, setVertragsdatum] = useState(ausLink.vertragsdatum ?? '2026-02-01');
  const [objekt, setObjekt] = useState<GwObjekt>((ausLink.objekt as GwObjekt | undefined) ?? 'beweglich');
  const [uebergabe, setUebergabe] = useState(ausLink.uebergabe ?? '2026-03-02');
  const [eigentumserwerb, setEigentumserwerb] = useState(ausLink.eigentumserwerb ?? '');
  const [mangelTyp, setMangelTyp] = useState<GwMangelTyp>((ausLink.mangelTyp as GwMangelTyp | undefined) ?? 'offen');
  const [entdeckung, setEntdeckung] = useState(ausLink.entdeckung ?? '');
  const [ruegeAm, setRuegeAm] = useState(ausLink.ruegeAm ?? '');
  const [arglist, setArglist] = useState(ausLink.arglist ?? false);
  const [konsument, setKonsument] = useState(ausLink.konsument ?? false);
  const [gebraucht, setGebraucht] = useState(ausLink.gebraucht ?? false);
  const [sia, setSia] = useState(ausLink.sia ?? false);
  const [vereinbart, setVereinbart] = useState(ausLink.vereinbart ?? '');
  const [kanton, setKanton] = useState<Kanton>((ausLink.kanton as Kanton | undefined) ?? getStandardKanton());
  const [stichtag, setStichtag] = useState(ausLink.stichtag ?? heute);

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

  let ergebnis: GewaehrleistungErgebnis | null;
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

  // FAHRPLAN-PRAXIS 1.2: Mandats-Referenz für den PDF-Kopf (optional).
  const [aktenzeichen, setAktenzeichen] = useState('');
  // Geteilte Permalink-Closure für «Link teilen» UND Kalender-Eintrag (§5).
  const gwQuery = () => permalinkKodieren(GW_LINK_SPEC, {
    typ, vertragsdatum, objekt, uebergabe, eigentumserwerb: eigentumserwerb || undefined,
    mangelTyp, entdeckung: entdeckung || undefined, ruegeAm: ruegeAm || undefined,
    arglist, konsument, gebraucht, sia, vereinbart: vereinbart || undefined, kanton, stichtag,
  });
  const pdfConfig: PdfDocConfig = {
    aktenzeichen: aktenzeichen.trim() || undefined,
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
      <PflichtDisclaimer kurz="Rüge- und Verjährungsfristen der Sachgewährleistung; die «sofort»-Frist ist eine Näherung." text={GW_DISCLAIMER} />

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
                className={`px-3.5 py-2 rounded-lg text-body-s font-medium transition-all ${
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
          <input type="number" inputMode="decimal" min={0} step={0.5} value={vereinbart} onChange={(e) => setVereinbart(e.target.value)}
            placeholder="leer = gesetzliche Frist" className={inputCls} />
        </Field>
      </div>

      {/* Schalter */}
      <div className="space-y-2">
        <Checkbox checked={arglist} onChange={setArglist} label="Absichtliche Täuschung durch Verkäufer/Unternehmer (Art. 203 / 210 Abs. 6 OR)" />
        {typ === 'fahrniskauf' && (
          <>
            <Checkbox checked={konsument} onChange={setKonsument} label="Konsumentenkauf (persönlicher/familiärer Gebrauch, gewerblicher Verkäufer – Art. 210 Abs. 4 OR)" />
            {konsument && (
              <Checkbox checked={gebraucht} onChange={setGebraucht} label="Gebrauchte Sache (Mindestfrist 1 statt 2 Jahre)" className="pl-6" />
            )}
          </>
        )}
        {istWerk && (
          <Checkbox checked={sia} onChange={setSia} label="SIA-Norm 118 vereinbart (zweijährige Garantiefrist, 5-Jahres-Verjährung – Vertragswerk, zu prüfen)" />
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
        <ErgebnisBlock>
          {/* Eckdaten: Rügefrist (Verwirkung) und Verjährung (Einrede) strikt getrennt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="lc-tile space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-ink-500">Mängelrüge – Verwirkungsfrist</p>
                {ergebnis.ruege.zwingend && <span className="lc-badge lc-badge-warn shrink-0">zwingend</span>}
              </div>
              {ergebnis.ruege.art === 'entfaellt' ? (
                <p className="text-body-l font-semibold text-ink-900"><NormText text={`entfällt (Arglist, Art. 203 OR)`} /></p>
              ) : ergebnis.ruege.art === 'sofort' ? (
                <>
                  <p className="text-body-l font-semibold text-ink-900 num">«sofort» – Richtwert {fmtISO(ergebnis.ruege.richtwertISO)}</p>
                  <p className="text-xs text-ink-500 num">sicher: {fmtISO(ergebnis.ruege.sicherISO)} · äusserstens: {fmtISO(ergebnis.ruege.maximalISO)} (Einzelfall)</p>
                </>
              ) : (
                <>
                  <p className="text-body-l font-semibold text-ink-900 num">bis {fmtISO(ergebnis.ruege.endeISO)}</p>
                  <p className="text-xs text-ink-500">{ergebnis.ruege.art === 'tage60' ? '60 Tage' : 'SIA-Garantiefrist (2 Jahre)'} ab {fmtISO(ergebnis.ruege.basisISO)}</p>
                </>
              )}
              <p className="text-xs text-ink-500">Versäumnis = Genehmigungsfiktion; keine Unterbrechung/Hemmung</p>
              {ergebnis.ruege.beurteilung && <p className="text-body-s font-medium text-brass-700">{ergebnis.ruege.beurteilung}</p>}
            </div>

            <div className="lc-tile space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-ink-500"><NormText text={`Verjährung – Einrede (Art. 142 OR)`} /></p>
                {ergebnis.verjaehrung.teilzwingend && <span className="lc-badge lc-badge-ok shrink-0">teilzwingend</span>}
              </div>
              <p className="text-body-l font-semibold text-ink-900 num">
                {ergebnis.verjaehrung.jahre} Jahre → {fmtISO(ergebnis.verjaehrung.endeISO)}
              </p>
              <p className="text-xs text-ink-500 num">ab {fmtISO(ergebnis.verjaehrung.beginnISO)} · am Stichtag:{' '}
                {ergebnis.verjaehrung.verjaehrtAmStichtag
                  ? <span className="text-danger-700 font-semibold">verjährt</span>
                  : <span className="text-sage-700 font-semibold">nicht verjährt</span>}
              </p>
              <p className="text-xs text-ink-500">
                Stillstand/Unterbrechung/Verzicht: <Link to="/rechner/verjaehrung" className="text-brass-700 no-underline hover:text-brass-600">Verjährungsrechner →</Link>
              </p>
            </div>
          </div>

          <ErgebnisAnzeige titel="Gewährleistung & Mängelrüge (Art. 197 ff., 367 ff. OR)" ergebnis={ergebnis} />
          <BegruendungAbsatz text={begruendungsAbsatz(ergebnis)} />
          <AktenzeichenFeld value={aktenzeichen} onChange={setAktenzeichen} />
          <div className="flex flex-wrap items-center gap-3">
            <PdfExportButton config={pdfConfig} />
            <IcsExportButton endISO={ergebnis.ruege.endeISO} titel="Rügefrist-Ende (Mängelrüge)"
              aktenzeichen={aktenzeichen} query={gwQuery}
              beschreibung={ergebnis.ergebnis} dateiName="Ruegefrist.ics" />
            <IcsExportButton endISO={ergebnis.verjaehrung.endeISO} titel="Verjährung Mängelrechte"
              aktenzeichen={aktenzeichen} query={gwQuery}
              beschreibung={ergebnis.ergebnis} dateiName="Verjaehrung-Maengelrechte.ics" />
            <LinkTeilenButton query={gwQuery} />
          </div>
        </ErgebnisBlock>
      )}

      {ergebnis && ergebnis.status !== 'ok' && (
        <div className="rounded-lg border border-line bg-danger-bg p-4">
          <p className="text-body-s text-danger-700">{ergebnis.ergebnis}</p>
        </div>
      )}
    </div>
  );
}
