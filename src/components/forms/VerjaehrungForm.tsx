import { KANTONE } from '../../lib/kantone';
import { BeispielChips, ErgebnisSprung, Field, LiveHeader, inputCls } from '../vorlagen/ui';
import { useState } from 'react';
import { format } from 'date-fns';
import type { Kanton } from '../../types/legal';
import {
  berechneVerjaehrung, REGIME,
  type VerjaehrungInput, type VerjaehrungRegime, type VerjaehrungErgebnis,
  type Unterbrechung, type UnterbrechungsTyp, type Stillstand,
} from '../../lib/verjaehrung';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { PflichtDisclaimer } from '../PflichtDisclaimer';
import { DatumsFeld } from '../DatumsFeld';
import { PdfExportButton } from '../PdfExport';
import { AktenzeichenFeld } from '../AktenzeichenFeld';
import { LinkTeilenButton } from '../LinkTeilenButton';
import { permalinkKodieren, permalinkLesen, istISO, istKanton, einerVon, type PermalinkSpec } from '../../lib/permalink';
import { IcsExportButton } from '../IcsExportButton';

const VERJ_DISCLAIMER =
  'Automatisierte Orientierungsberechnung der Verjährung (Art. 60, 67, 127 ff. OR, Stand Revision 1.1.2020) – ' +
  'keine Rechtsberatung. Der Kenntniszeitpunkt (Art. 60/67 OR) ist eine Tatfrage und wird als Eingabe übernommen. ' +
  'Nicht abgebildet: strafrechtliche Längerfrist (Art. 60 Abs. 2 OR i.V.m. StGB), Spezialgesetze (z. B. SVG, VG, PrHG), ' +
  'Übergangsrecht für Altfälle vor dem 1.1.2020 (Art. 49 SchlT ZGB) sowie die Wirkung unter Mitverpflichteten ' +
  '(Art. 136 OR). Die Verjährung ist Einrede (Art. 142 OR); der konkrete Fall ist fachlich zu prüfen.';

// UI-Texte und Reihenfolge lokal; die Fristzahlen kommen aus dem Engine-REGIME (§5: eine Quelle).
const REGIMES: { code: VerjaehrungRegime; label: string; hint: string }[] = [
  { code: 'ordentlich', label: 'Ordentliche Forderung – 10 Jahre (Art. 127 OR)', hint: 'Auffangregel für vertragliche Forderungen ohne Sonderfrist' },
  { code: 'kurz', label: 'Katalogforderung – 5 Jahre (Art. 128 OR)', hint: 'Miet-/Pacht-/Kapitalzinse, periodische Leistungen, Handwerk, Arzt, Anwalt, Arbeitsverhältnis' },
  { code: 'delikt', label: 'Unerlaubte Handlung – 3 / 10 Jahre (Art. 60 Abs. 1 OR)', hint: 'Sach- und Vermögensschaden' },
  { code: 'delikt_person', label: 'Unerlaubte Handlung, Personenschaden – 3 / 20 Jahre (Art. 60 Abs. 1bis OR)', hint: 'Tötung oder Körperverletzung' },
  { code: 'vertrag_person', label: 'Vertraglicher Personenschaden – 3 / 20 Jahre (Art. 128a OR)', hint: 'Körperverletzung/Tötung aus Vertragsverletzung' },
  { code: 'bereicherung', label: 'Ungerechtfertigte Bereicherung – 3 / 10 Jahre (Art. 67 OR)', hint: 'Rückforderung grundloser Zuwendungen' },
];

const U_TYPEN: { code: UnterbrechungsTyp; label: string }[] = [
  { code: 'anerkennung', label: 'Anerkennung (z. B. Abschlagszahlung)' },
  { code: 'urkunde_urteil', label: 'Anerkennung durch Urkunde / Urteil (→ 10 Jahre)' },
  { code: 'betreibungsakt', label: 'Betreibungsakt' },
  { code: 'klage_schlichtung', label: 'Schlichtungsgesuch / Klage' },
];

const STILLSTAND_GRUENDE = [
  'Forderung Kind ↔ Eltern (elterliche Sorge, Ziff. 1)',
  'Forderung ↔ vorsorgebeauftragte Person (Ziff. 2)',
  'Forderung unter Ehegatten (Ziff. 3) / eingetragenen Partnern (Ziff. 3bis)',
  'Arbeitnehmer in Hausgemeinschaft (Ziff. 4)',
  'Nutzniessung des Schuldners (Ziff. 5)',
  'Forderung vor keinem Gericht geltend machbar (Ziff. 6)',
  'Öffentliches Inventar (Ziff. 7)',
  'Vereinbarte aussergerichtliche Streitbeilegung (Ziff. 8, schriftlich)',
];


const fmtISO = (s?: string) => (s ? s.split('-').reverse().join('.') : '–');

// Eckdaten-Karte für eine Verjährungsfrist; die massgebliche (= frühere)
// Frist erhält Goldrand und Badge.
function FristKarte({ label, sub, wert, massgeblich }: { label: string; sub: string; wert: string; massgeblich: boolean }) {
  return (
    <div className={`lc-tile ${massgeblich ? 'border-brass-500 border-t-[3px]' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-xs text-ink-500">{label}</p>
        {massgeblich && <span className="lc-badge lc-badge-ok shrink-0" style={{ background: 'var(--brass-100)', color: 'var(--brass-700)' }}>massgeblich</span>}
      </div>
      <p className="text-body-l font-semibold text-ink-900 num">{wert}</p>
      <p className="text-xs text-ink-500 mt-0.5">{sub}</p>
    </div>
  );
}

// Permalink (FAHRPLAN-PRAXIS 1.3)
type VjLink = {
  regime: string; beginnRelativ: string; beginnAbsolut?: string; stichtag: string;
  kanton: string; strafbar?: boolean; stillstaende?: Stillstand[];
  unterbrechungen?: Unterbrechung[]; verzichtAn?: boolean; verzichtDatum?: string; verzichtJahre?: string;
};
const VJ_LINK_SPEC: PermalinkSpec<VjLink & Record<string, unknown>> = {
  regime: { p: 're', typ: 'str', gueltig: einerVon('ordentlich', 'kurz', 'delikt', 'delikt_person', 'vertrag_person', 'bereicherung') },
  beginnRelativ: { p: 'br', typ: 'str', gueltig: istISO },
  beginnAbsolut: { p: 'ba', typ: 'str', gueltig: istISO },
  stichtag: { p: 's', typ: 'str', gueltig: istISO },
  kanton: { p: 'k', typ: 'str', gueltig: istKanton },
  strafbar: { p: 'st', typ: 'bool' },
  stillstaende: { p: 'si', typ: 'json', gueltig: (v): boolean => Array.isArray(v) && v.length <= 20 && v.every((e) => e && typeof e === 'object' && istISO((e as Stillstand).von ?? '') && istISO((e as Stillstand).bis ?? '')) },
  unterbrechungen: { p: 'un', typ: 'json', gueltig: (v): boolean => Array.isArray(v) && v.length <= 20 && v.every((e) => e && typeof e === 'object' && ['anerkennung', 'urkunde_urteil', 'betreibungsakt', 'klage_schlichtung'].includes((e as Unterbrechung).typ ?? '') && istISO((e as Unterbrechung).datum ?? '')) },
  verzichtAn: { p: 'va', typ: 'bool' },
  verzichtDatum: { p: 'vd', typ: 'str', gueltig: istISO },
  verzichtJahre: { p: 'vj', typ: 'str', gueltig: (v) => /^\d{1,2}$/.test(v) },
};

export function VerjaehrungForm() {
  const [ausLink] = useState<Partial<VjLink>>(() => {
    try { return permalinkLesen(VJ_LINK_SPEC, window.location.search); } catch { return {}; }
  });
  const heute = format(new Date(), 'yyyy-MM-dd');
  const [regime, setRegime] = useState<VerjaehrungRegime>((ausLink.regime as VerjaehrungRegime | undefined) ?? 'ordentlich');
  const [beginnRelativ, setBeginnRelativ] = useState(ausLink.beginnRelativ ?? '2024-03-01');
  const [beginnAbsolut, setBeginnAbsolut] = useState(ausLink.beginnAbsolut ?? '');
  const [stichtag, setStichtag] = useState(ausLink.stichtag ?? heute);
  const [kanton, setKanton] = useState<Kanton>((ausLink.kanton as Kanton | undefined) ?? 'ZH');
  const [strafbar, setStrafbar] = useState(ausLink.strafbar ?? false);
  const [stillstaende, setStillstaende] = useState<Stillstand[]>(ausLink.stillstaende ?? []);
  const [unterbrechungen, setUnterbrechungen] = useState<Unterbrechung[]>(ausLink.unterbrechungen ?? []);
  const [verzichtAn, setVerzichtAn] = useState(ausLink.verzichtAn ?? false);
  const [verzichtDatum, setVerzichtDatum] = useState(ausLink.verzichtDatum ?? '');
  const [verzichtJahre, setVerzichtJahre] = useState(ausLink.verzichtJahre ?? '');

  // UX-Programm B7 (5.6.2026): Presets für den schnellen Einstieg — reine
  // UI-Zustände, keine Engine-Logik. Daten bewusst fix (nachvollziehbar).
  const ladePreset = (regime_: VerjaehrungRegime, relativ: string, absolut: string) => {
    setRegime(regime_); setBeginnRelativ(relativ); setBeginnAbsolut(absolut);
    setStrafbar(false); setStillstaende([]); setUnterbrechungen([]);
    setVerzichtAn(false); setVerzichtDatum(''); setVerzichtJahre('');
  };
  const PRESETS = [
    { label: 'Offene Rechnung (10 J.)', laden: () => ladePreset('ordentlich', '2019-09-15', '') },
    { label: 'Mietzins (5 J.)', laden: () => ladePreset('kurz', '2022-01-01', '') },
    { label: 'Delikt (3/10 J.)', laden: () => ladePreset('delikt', '2024-03-01', '2023-11-20') },
  ];

  const R = REGIMES.find((r) => r.code === regime)!;
  const hatAbsolut = REGIME[regime].absolutJahre !== null;
  const beginnLabel = hatAbsolut
    ? regime === 'bereicherung' ? 'Kenntnis des Anspruchs' : 'Kenntnis von Schaden und Person'
    : 'Fälligkeit der Forderung';
  const absolutLabel = regime === 'bereicherung' ? 'Entstehung des Anspruchs' : 'Schädigendes Verhalten (bzw. dessen Ende)';

  const input: VerjaehrungInput = {
    regime,
    beginnRelativ,
    beginnAbsolut: hatAbsolut && beginnAbsolut ? beginnAbsolut : undefined,
    stichtag,
    kanton,
    strafbareHandlung: hatAbsolut && regime !== 'bereicherung' ? strafbar : undefined,
    stillstaende: stillstaende.filter((s) => s.von && s.bis),
    unterbrechungen: unterbrechungen.filter((u) => u.datum),
    verzicht: verzichtAn && verzichtDatum
      ? { datum: verzichtDatum, jahre: verzichtJahre.trim() === '' ? undefined : Number(verzichtJahre) }
      : undefined,
  };

  let ergebnis: VerjaehrungErgebnis | null;
  try { ergebnis = beginnRelativ && stichtag ? berechneVerjaehrung(input) : null; } catch { ergebnis = null; }

  const eingaben: Record<string, string> = {
    'Anspruchstyp': R.label,
    [beginnLabel]: fmtISO(beginnRelativ),
    ...(hatAbsolut && beginnAbsolut ? { [absolutLabel]: fmtISO(beginnAbsolut) } : {}),
    'Stichtag': fmtISO(stichtag),
    'Kanton (Feiertage, Erfüllungsort)': kanton,
    ...(stillstaende.length ? { 'Stillstand (Art. 134 OR)': stillstaende.map((s) => `${fmtISO(s.von)}–${fmtISO(s.bis)}`).join('; ') } : {}),
    ...(unterbrechungen.length ? { 'Unterbrechungen (Art. 135 OR)': unterbrechungen.map((u) => `${U_TYPEN.find((t) => t.code === u.typ)?.label} am ${fmtISO(u.datum)}`).join('; ') } : {}),
    ...(verzichtAn && verzichtDatum ? { 'Einredeverzicht (Art. 141 OR)': `vom ${fmtISO(verzichtDatum)}` } : {}),
  };

  // FAHRPLAN-PRAXIS 1.2: Mandats-Referenz für den PDF-Kopf (optional).
  const [aktenzeichen, setAktenzeichen] = useState('');
  const pdfConfig: PdfDocConfig = {
    aktenzeichen: aktenzeichen.trim() || undefined,
    title: 'Verjährung (Art. 127 ff. OR)',
    domain: 'verjaehrung',
    fileBase: 'Verjaehrung',
    inputs: eingaben,
    sections: ergebnis ? [{ titel: 'Verjährung (Art. 60, 67, 127 ff. OR)', ergebnis }] : [],
    disclaimer: VERJ_DISCLAIMER,
  };

  const setU = (i: number, patch: Partial<Unterbrechung>) =>
    setUnterbrechungen((arr) => arr.map((u, j) => (j === i ? { ...u, ...patch } : u)));

  return (
    <div className="space-y-6">
      {/* Pflicht-Disclaimer */}
      <PflichtDisclaimer kurz="Verjährungs-Orientierung (Art. 60/67/127 ff. OR). Kenntniszeitpunkt und Sonderfristen sind fachlich zu prüfen." text={VERJ_DISCLAIMER} />

      <BeispielChips items={PRESETS} />

      {/* Anspruchstyp */}
      <Field label="Anspruchstyp / Rechtsgrund" hint={R.hint}>
        <select value={regime} onChange={(e) => setRegime(e.target.value as VerjaehrungRegime)} className={inputCls}>
          {REGIMES.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
        </select>
      </Field>

      {/* Daten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={beginnLabel} hint="Beginn der (relativen) Frist – der Beginntag zählt nicht (Art. 132 OR)">
          <DatumsFeld value={beginnRelativ} onChange={setBeginnRelativ} className={inputCls} />
        </Field>
        {hatAbsolut && (
          <Field label={absolutLabel} hint="Beginn der absoluten Frist – läuft unabhängig von Kenntnis">
            <DatumsFeld value={beginnAbsolut} onChange={setBeginnAbsolut} className={inputCls} />
          </Field>
        )}
        <Field label="Stichtag (Prüfdatum)">
          <DatumsFeld value={stichtag} onChange={setStichtag} className={inputCls} />
        </Field>
        <Field label="Kanton (Feiertage am Erfüllungsort)" hint="Fristende an Sa/So/Feiertag → nächster Werktag (Art. 78 OR)">
          <select value={kanton} onChange={(e) => setKanton(e.target.value as Kanton)} className={inputCls}>
            {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>
      </div>

      {hatAbsolut && regime !== 'bereicherung' && (
        <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
          <input type="checkbox" checked={strafbar} onChange={(e) => setStrafbar(e.target.checked)} />
          Das schädigende Verhalten ist eine strafbare Handlung (Art. 60 Abs. 2 OR – strafrechtliche Längerfrist vorbehalten)
        </label>
      )}

      {/* Unterbrechungen */}
      <div className="space-y-2">
        <p className="lc-overline">Unterbrechungen (Art. 135 OR) – Frist beginnt neu</p>
        {unterbrechungen.map((u, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 pl-1">
            <select value={u.typ} onChange={(e) => setU(i, { typ: e.target.value as UnterbrechungsTyp })} className={inputCls + ' sm:max-w-xs'}>
              {U_TYPEN.map((t) => <option key={t.code} value={t.code}>{t.label}</option>)}
            </select>
            <span className="text-body-s text-ink-500">am</span>
            <DatumsFeld value={u.datum} onChange={(v) => setU(i, { datum: v })} className={inputCls} wrapperClassName="w-full sm:w-44" />
            {u.typ === 'klage_schlichtung' && (
              <>
                <span className="text-body-s text-ink-500">rechtskräftig erledigt am</span>
                <DatumsFeld value={u.prozessEnde ?? ''} onChange={(v) => setU(i, { prozessEnde: v || undefined })} className={inputCls} wrapperClassName="w-full sm:w-44" />
                <label className="flex items-center gap-1.5 text-body-s cursor-pointer text-ink-700">
                  <input type="checkbox" checked={u.mitUrteil ?? false} onChange={(e) => setU(i, { mitUrteil: e.target.checked })} />
                  durch Urteil (→ 10 Jahre)
                </label>
              </>
            )}
            <button type="button" onClick={() => setUnterbrechungen((arr) => arr.filter((_, j) => j !== i))}
              className="text-body-s text-danger-700">Entfernen</button>
          </div>
        ))}
        <button type="button" onClick={() => setUnterbrechungen((arr) => [...arr, { typ: 'anerkennung', datum: '' }])}
          className="lc-btn-outline lc-btn-sm">
          + Unterbrechung hinzufügen
        </button>
      </div>

      {/* Stillstand */}
      <div className="space-y-2">
        <p className="lc-overline">Stillstand / Hemmung (Art. 134 OR) – Uhr pausiert</p>
        {stillstaende.map((s, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 pl-1">
            <select value={s.grund ?? STILLSTAND_GRUENDE[0]} onChange={(e) => setStillstaende((arr) => arr.map((x, j) => (j === i ? { ...x, grund: e.target.value } : x)))} className={inputCls + ' sm:max-w-xs'}>
              {STILLSTAND_GRUENDE.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <span className="text-body-s text-ink-500">von</span>
            <DatumsFeld value={s.von} onChange={(v) => setStillstaende((arr) => arr.map((x, j) => (j === i ? { ...x, von: v } : x)))} className={inputCls} wrapperClassName="w-full sm:w-44" />
            <span className="text-body-s text-ink-500">bis</span>
            <DatumsFeld value={s.bis} onChange={(v) => setStillstaende((arr) => arr.map((x, j) => (j === i ? { ...x, bis: v } : x)))} className={inputCls} wrapperClassName="w-full sm:w-44" />
            <button type="button" onClick={() => setStillstaende((arr) => arr.filter((_, j) => j !== i))}
              className="text-body-s text-danger-700">Entfernen</button>
          </div>
        ))}
        <button type="button" onClick={() => setStillstaende((arr) => [...arr, { von: '', bis: '', grund: STILLSTAND_GRUENDE[0] }])}
          className="lc-btn-outline lc-btn-sm">
          + Stillstandsperiode hinzufügen
        </button>
      </div>

      {/* Verzicht */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
          <input type="checkbox" checked={verzichtAn} onChange={(e) => setVerzichtAn(e.target.checked)} />
          Schriftlicher Verzicht auf die Verjährungseinrede (Art. 141 OR)
        </label>
        {verzichtAn && (
          <div className="flex flex-wrap items-center gap-2 pl-6">
            <span className="text-body-s text-ink-500">erklärt am</span>
            <DatumsFeld value={verzichtDatum} onChange={setVerzichtDatum} className={inputCls} wrapperClassName="w-full sm:w-44" />
            <span className="text-body-s text-ink-500">für</span>
            <input type="number" inputMode="decimal" min={1} max={10} value={verzichtJahre} placeholder="10"
              onChange={(e) => setVerzichtJahre(e.target.value)} className={inputCls + ' w-24'} />
            <span className="text-body-s text-ink-500">Jahre (max. 10, ab Verjährungseintritt)</span>
          </div>
        )}
      </div>

      {ergebnis && (
        <div id="lc-ergebnis" className="space-y-4">
          <ErgebnisSprung zielId="lc-ergebnis" />
          <LiveHeader />

          {/* Eckdaten – relative und absolute Frist getrennt; die massgebliche trägt das Badge */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${hatAbsolut ? 'lg:grid-cols-4' : 'sm:grid-cols-3'} gap-3`}>
            <FristKarte
              label={hatAbsolut ? `Relative Frist – ${REGIME[regime].relativJahre} Jahre` : `Frist – ${REGIME[regime].relativJahre} Jahre`}
              sub={`ab ${beginnLabel}`}
              wert={ergebnis.relativEndeISO ? fmtISO(ergebnis.relativEndeISO) : 'steht still (Art. 138 Abs. 1)'}
              massgeblich={hatAbsolut && ergebnis.massgeblicheFrist === 'relativ'}
            />
            {hatAbsolut && (
              <FristKarte
                label={`Absolute Frist – ${REGIME[regime].absolutJahre} Jahre`}
                sub={`ab ${absolutLabel}`}
                wert={ergebnis.absolutEndeISO ? fmtISO(ergebnis.absolutEndeISO) : '–'}
                massgeblich={ergebnis.massgeblicheFrist === 'absolut'}
              />
            )}
            <div className="lc-tile">
              <p className="text-xs text-ink-500 mb-1">Verjährungseintritt</p>
              <p className="text-body-l font-semibold text-ink-900">{ergebnis.verjaehrungISO ? `${fmtISO(ergebnis.verjaehrungISO)} · 24.00 Uhr` : 'noch offen'}</p>
            </div>
            <div className="lc-tile">
              <p className="text-xs text-ink-500 mb-1">Am Stichtag ({fmtISO(stichtag)})</p>
              <p className="text-body-l font-semibold">
                {ergebnis.status !== 'ok'
                  ? <span className="text-ink-500">Eingaben unvollständig</span>
                  : ergebnis.verjaehrtAmStichtag
                    ? <span className="text-danger-700">verjährt (Einrede, Art. 142 OR)</span>
                    : <span className="text-sage-700">nicht verjährt</span>}
              </p>
            </div>
          </div>
          {ergebnis.verzichtBisISO && (
            <p className="text-body-s text-ink-500 num">Einredeverzicht wirkt bis {fmtISO(ergebnis.verzichtBisISO)} (Art. 141 OR).</p>
          )}

          <ErgebnisAnzeige titel="Verjährung (Art. 60, 67, 127 ff. OR)" ergebnis={ergebnis} />
          <AktenzeichenFeld value={aktenzeichen} onChange={setAktenzeichen} />
          <div className="flex flex-wrap items-center gap-3">
            <PdfExportButton config={pdfConfig} />
            <LinkTeilenButton query={() => permalinkKodieren(VJ_LINK_SPEC, {
              regime, beginnRelativ, beginnAbsolut: beginnAbsolut || undefined, stichtag, kanton,
              strafbar, stillstaende, unterbrechungen, verzichtAn,
              verzichtDatum: verzichtDatum || undefined, verzichtJahre: verzichtJahre || undefined,
            })} />
            <IcsExportButton endISO={ergebnis.verjaehrungISO} titel="Verjährungseintritt"
              beschreibung={ergebnis.ergebnis} dateiName="Verjaehrung.ics" />
          </div>
        </div>
      )}
    </div>
  );
}
