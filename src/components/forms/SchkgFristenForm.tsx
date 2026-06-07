import { KANTONE } from '../../lib/kantone';
import { EckdatenKachel, ErgebnisSprung, FehlerBox, Field, LiveHeader, inputCls } from '../vorlagen/ui';
import { Tabs } from '../ui/Tabs';
import { useState } from 'react';
import type { Kanton } from '../../types/legal';
import type { SchkgInput, SchkgModus, SchkgFristnatur, SchkgEinheit, SchkgErgebnis } from '../../types/schkg';
import { berechneSchkgFrist } from '../../lib/schkgFristen';
import { PHASEN_SCHKG, PRESETS_SCHKG, SCHKG_DISCLAIMER, type SchkgPhase, type SchkgPreset } from '../../lib/schkgPresets';
import { rechtsprechung, VERIFIKATION } from '../../data/verifikation';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { PflichtDisclaimer } from '../PflichtDisclaimer';
import { DatumsFeld } from '../DatumsFeld';
import { sansAmp } from '../typografie';
import { PdfExportButton } from '../PdfExport';
import { AktenzeichenFeld } from '../AktenzeichenFeld';
import { BegruendungAbsatz } from '../BegruendungAbsatz';
import { begruendungsAbsatz, fristbeginnZusatz } from '../../lib/begruendung';
import { LinkTeilenButton } from '../LinkTeilenButton';
import { permalinkKodieren, permalinkLesen, istISO, istKanton, einerVon, type PermalinkSpec } from '../../lib/permalink';
import { IcsExportButton } from '../IcsExportButton';
import { FristenKalender } from '../FristenKalender';


const EINHEITEN: { code: SchkgEinheit; label: string }[] = [
  { code: 'tage', label: 'Tage' },
  { code: 'monate', label: 'Monate' },
  { code: 'jahre', label: 'Jahre' },
];

const MODI: { code: SchkgModus; label: string }[] = [
  { code: 'schkg_betreibungsferien', label: 'SchKG-Betreibungsferien (Art. 56/63) – kein Ruhen' },
  { code: 'zpo_stillstand', label: 'ZPO-Stillstand (gerichtliche Klage, Art. 56 Abs. 2 SchKG)' },
  { code: 'kein', label: 'Kein Stillstand' },
];

const NATUREN: { code: SchkgFristnatur; label: string }[] = [
  { code: 'frist', label: 'Frist' },
  { code: 'verwirkung', label: 'Verwirkungsfrist' },
  { code: 'wartefrist', label: 'Wartefrist (frühestens)' },
  { code: 'beschwerdefrist', label: 'Beschwerdefrist' },
  { code: 'klagefrist', label: 'Klagefrist' },
  { code: 'ordnungsfrist', label: 'Ordnungsfrist' },
];

const NATUR_BADGE: Partial<Record<SchkgFristnatur, { cls: string; label: string }>> = {
  verwirkung: { cls: 'lc-badge-danger', label: 'Verwirkung' },
  wartefrist: { cls: 'lc-badge-warn', label: 'Wartefrist' },
  ordnungsfrist: { cls: 'lc-badge-soft', label: 'Ordnung' },
};

type FormState = {
  ereignis: string;
  einheit: SchkgEinheit;
  laenge: number;
  modus: SchkgModus;
  fristnatur: SchkgFristnatur;
  kanton: Kanton;
  ausloeser: string;
};

const DEFAULTS: FormState = {
  ereignis: '2025-07-15',
  einheit: 'tage',
  laenge: 10,
  modus: 'schkg_betreibungsferien',
  fristnatur: 'frist',
  kanton: 'ZH',
  ausloeser: 'Zustellung Zahlungsbefehl',
};


// Permalink (FAHRPLAN-PRAXIS 1.3): Form + Phase/Preset + Hemmung/Rechtsstillstand.
type SchkgLink = {
  ereignis: string; einheit: string; laenge: number; modus: string; fristnatur: string;
  kanton: string; ausloeser?: string; phase?: string; presetKey?: string; override?: string;
  hemmungAn?: boolean; hemmungVon?: string; hemmungBis?: string;
  rsAn?: boolean; rsVon?: string; rsBis?: string;
};
const SCHKG_LINK_SPEC: PermalinkSpec<SchkgLink> = {
  ereignis: { p: 'e', typ: 'str', gueltig: istISO },
  einheit: { p: 'u', typ: 'str', gueltig: einerVon('tage', 'monate', 'jahre') },
  laenge: { p: 'l', typ: 'num', gueltig: (n) => Number.isInteger(n) && n > 0 },
  modus: { p: 'm', typ: 'str', gueltig: einerVon('schkg_betreibungsferien', 'zpo_stillstand', 'kein') },
  fristnatur: { p: 'n', typ: 'str', gueltig: einerVon('verwirkung', 'wartefrist', 'frist') },
  kanton: { p: 'k', typ: 'str', gueltig: istKanton },
  ausloeser: { p: 'a', typ: 'str' },
  phase: { p: 'ph', typ: 'str', gueltig: einerVon(...PHASEN_SCHKG.map((x) => x.code)) },
  presetKey: { p: 'p', typ: 'str', gueltig: einerVon(...PRESETS_SCHKG.map((x) => x.key)) },
  override: { p: 'o', typ: 'str', gueltig: einerVon('schkg_betreibungsferien', 'zpo_stillstand', 'kein') },
  hemmungAn: { p: 'ha', typ: 'bool' },
  hemmungVon: { p: 'hv', typ: 'str', gueltig: istISO },
  hemmungBis: { p: 'hb', typ: 'str', gueltig: istISO },
  rsAn: { p: 'ra', typ: 'bool' },
  rsVon: { p: 'rv', typ: 'str', gueltig: istISO },
  rsBis: { p: 'rb', typ: 'str', gueltig: istISO },
};

export function SchkgFristenForm() {
  const [ausLink] = useState<Partial<SchkgLink>>(() => {
    try { return permalinkLesen(SCHKG_LINK_SPEC, window.location.search); } catch { return {}; }
  });
  const [form, setForm] = useState<FormState>(() => ({
    ...DEFAULTS,
    ...(ausLink.ereignis ? { ereignis: ausLink.ereignis } : {}),
    ...(ausLink.einheit ? { einheit: ausLink.einheit as FormState['einheit'] } : {}),
    ...(ausLink.laenge != null ? { laenge: ausLink.laenge } : {}),
    ...(ausLink.modus ? { modus: ausLink.modus as FormState['modus'] } : {}),
    ...(ausLink.fristnatur ? { fristnatur: ausLink.fristnatur as FormState['fristnatur'] } : {}),
    ...(ausLink.kanton ? { kanton: ausLink.kanton as FormState['kanton'] } : {}),
    ...(ausLink.ausloeser != null ? { ausloeser: ausLink.ausloeser } : {}),
  }));
  const [phase, setPhase] = useState<SchkgPhase>(() =>
    (ausLink.phase as SchkgPhase | undefined)
      ?? PRESETS_SCHKG.find((x) => x.key === ausLink.presetKey)?.phase
      ?? 'einleitung');
  const [aktiv, setAktiv] = useState<SchkgPreset | null>(() => PRESETS_SCHKG.find((x) => x.key === ausLink.presetKey) ?? null);
  const [override, setOverride] = useState<SchkgModus | ''>((ausLink.override as SchkgModus | undefined) ?? '');
  const [hemmung, setHemmung] = useState<{ an: boolean; von: string; bis: string }>({ an: ausLink.hemmungAn ?? false, von: ausLink.hemmungVon ?? '', bis: ausLink.hemmungBis ?? '' });
  const [rechtsstillstand, setRechtsstillstand] = useState<{ an: boolean; von: string; bis: string }>({ an: ausLink.rsAn ?? false, von: ausLink.rsVon ?? '', bis: ausLink.rsBis ?? '' });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const presetsDerPhase = PRESETS_SCHKG.filter((p) => p.phase === phase);

  const ladePreset = (p: SchkgPreset) => {
    setAktiv(p);
    setOverride('');
    setHemmung({ an: false, von: '', bis: '' });
    setForm((f) => ({
      ...f,
      modus: p.modus,
      fristnatur: p.fristnatur,
      ausloeser: p.ausloeser,
      ...(p.einheit ? { einheit: p.einheit } : {}),
      ...(p.laenge != null ? { laenge: p.laenge } : {}),
    }));
  };

  const wechslePhase = (code: SchkgPhase) => { setPhase(code); setAktiv(null); setOverride(''); };

  // Gemeinsame Eingabe-Basis
  // EINE Quelle für Engine-Input UND Anzeige (/simplify 7.6.2026: die
  // Bedingung stand zuvor doppelt — die Gleichheit war nur kommentargestützt).
  const aktiverOverride = aktiv?.modusUmstritten && override ? override : undefined;

  const basis = (einheit: SchkgEinheit, laenge: number, fristnatur: SchkgFristnatur, mitHemmung: boolean): SchkgInput => ({
    ereignis: form.ereignis,
    einheit,
    laenge,
    modus: form.modus,
    fristnatur,
    kanton: form.kanton,
    ausloeser: form.ausloeser,
    modusOverride: aktiverOverride,
    hemmungVon: mitHemmung && hemmung.an ? hemmung.von : undefined,
    hemmungBis: mitHemmung && hemmung.an ? hemmung.bis : undefined,
    rechtsstillstandVon: rechtsstillstand.an ? rechtsstillstand.von : undefined,
    rechtsstillstandBis: rechtsstillstand.an ? rechtsstillstand.bis : undefined,
  });

  const fehler: string[] = [];
  if (!form.ereignis) fehler.push('Bitte ein auslösendes Ereignis (Datum) angeben.');
  if (hemmung.an && (!hemmung.von || !hemmung.bis)) fehler.push('Hemmung: Start- und Enddatum des hemmenden Verfahrens angeben.');
  if (rechtsstillstand.an && (!rechtsstillstand.von || !rechtsstillstand.bis)) fehler.push('Rechtsstillstand: Start- und Enddatum angeben.');

  const istDual = !!(aktiv?.wartefrist && aktiv?.verwirkung);
  const istInfo = !!aktiv?.infoOnly;

  // Berechnung
  type Ausgabe = { titel: string; natur: SchkgFristnatur; ergebnis: SchkgErgebnis };
  const ausgaben: Ausgabe[] = [];
  if (fehler.length === 0 && !istInfo) {
    try {
      if (istDual && aktiv) {
        ausgaben.push({ titel: 'Wartefrist (frühestens)', natur: 'wartefrist', ergebnis: berechneSchkgFrist(basis(aktiv.wartefrist!.einheit, aktiv.wartefrist!.laenge, 'wartefrist', false)) });
        ausgaben.push({ titel: 'Verwirkungsfrist (spätestens)', natur: 'verwirkung', ergebnis: berechneSchkgFrist(basis(aktiv.verwirkung!.einheit, aktiv.verwirkung!.laenge, 'verwirkung', true)) });
      } else {
        ausgaben.push({ titel: 'SchKG-Fristberechnung', natur: form.fristnatur, ergebnis: berechneSchkgFrist(basis(form.einheit, form.laenge, form.fristnatur, true)) });
      }
    } catch (err) {
      fehler.push((err as Error).message);
    }
  }

  const verweise = (aktiv?.verweise ?? []).filter((k) => k in VERIFIKATION).map((k) => rechtsprechung(k as keyof typeof VERIFIKATION));

  // Ultra-Review NIEDRIG (7.6.2026): Anzeige/PDF aus DERSELBEN Quelle wie
  // der Engine-Input — strukturell statt per Auge (aktiverOverride oben).
  const effektivesRegime = aktiverOverride ?? form.modus;

  const eingaben: Record<string, string> = {
    'Auslösendes Ereignis': form.ereignis,
    'Auslöser': form.ausloeser,
    'Stillstand-Regime': MODI.find((m) => m.code === effektivesRegime)?.label ?? form.modus,
    'Kanton': form.kanton,
    ...(istDual ? {} : { 'Frist': `${form.laenge} ${form.einheit}`, 'Rechtsnatur': form.fristnatur }),
  };

  // FAHRPLAN-PRAXIS 1.2: Mandats-Referenz für den PDF-Kopf (optional).
  const [aktenzeichen, setAktenzeichen] = useState('');
  const pdfConfig: PdfDocConfig = {
    aktenzeichen: aktenzeichen.trim() || undefined,
    title: 'SchKG-Fristberechnung',
    domain: 'schkg-fristen',
    fileBase: 'SchKG-Fristen',
    inputs: eingaben,
    sections: ausgaben.map((a) => ({ titel: a.titel, ergebnis: a.ergebnis })),
    notes: aktiv?.hinweis ? [`${aktiv.label} (${aktiv.norm}): ${aktiv.hinweis}`] : undefined,
    disclaimer: SCHKG_DISCLAIMER,
  };

  return (
    <div className="space-y-6">
      {/* Pflicht-Disclaimer */}
      <PflichtDisclaimer kurz="Rechnerische Orientierung (Art. 31/56/63 SchKG, Schnittstelle Art. 145 ZPO). Betreibungsferien ≠ Gerichtsferien." text={SCHKG_DISCLAIMER} />

      {/* Verfahrensphase */}
      <div className="space-y-2">
        <p className="lc-overline">Verfahrensphase wählen</p>
        <Tabs items={PHASEN_SCHKG.map((p) => ({ code: p.code, label: p.label }))} value={phase} onChange={wechslePhase} mode="pressed" ariaLabel="Verfahrensphase" />
      </div>

      {/* Frist-Preset — PRIMÄRWEG (UX B11): die Vorlage setzt alle Parameter;
          die manuellen Felder darunter sind der Kontroll-/Sonderfall-Weg. */}
      <div className="rounded-lg border p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end" style={{ borderColor: 'var(--brass-500)', background: 'var(--brass-100)' }}>
        <Field label="Frist-Vorlage (empfohlener Einstieg)" hint="Setzt Stillstand-Regime, Rechtsnatur, Länge und Auslöser automatisch — manuelle Felder unten nur für Sonderfälle">
          <select value={aktiv?.key ?? ''} onChange={(e) => { const p = presetsDerPhase.find((x) => x.key === e.target.value); if (p) ladePreset(p); else setAktiv(null); }} className={inputCls}>
            <option value="">– Vorlage wählen (oder manuell unten) –</option>
            {presetsDerPhase.map((p) => <option key={p.key} value={p.key}>{p.label} · {p.norm}</option>)}
          </select>
        </Field>
        {aktiv?.hinweis && (
          <div className="lc-notice"><p className="text-body-s text-ink-600">{aktiv.hinweis}</p></div>
        )}
      </div>

      {verweise.length > 0 && (
        <div className="rounded-lg border border-line bg-surface p-3 space-y-1">
          <p className="lc-overline text-ink-500">Rechtsprechung (zu verifizieren)</p>
          {verweise.map((r) => (
            <p key={r.aktenzeichen} className="text-body-s text-ink-600">
              <span className="lc-badge lc-badge-warn mr-1.5">{r.verifiziert ? 'verifiziert' : 'zu verifizieren'}</span>
              <strong>{r.aktenzeichen}</strong> – {r.aussage}
            </p>
          ))}
        </div>
      )}

      {/* Eingaben */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Auslösendes Ereignis (Datum)" hint={form.ausloeser}>
          <DatumsFeld value={form.ereignis} onChange={(v) => set('ereignis', v)} className={inputCls} />
        </Field>

        {!istDual && !istInfo && (
          <Field label="Fristtyp & Länge">
            <div className="flex gap-2">
              <input type="number" inputMode="decimal" min={1} step={1} value={form.laenge} onChange={(e) => set('laenge', Number(e.target.value))} className={inputCls + ' w-24'} />
              <select value={form.einheit} onChange={(e) => set('einheit', e.target.value as SchkgEinheit)} className={inputCls}>
                {EINHEITEN.map((u) => <option key={u.code} value={u.code}>{u.label}</option>)}
              </select>
            </div>
          </Field>
        )}

        <Field label="Stillstand-Regime" hint="Betreibungshandlung → SchKG; gerichtliche Klage → ZPO-Stillstand">
          <select value={form.modus} onChange={(e) => set('modus', e.target.value as SchkgModus)} className={inputCls}>
            {MODI.map((m) => <option key={m.code} value={m.code}>{m.label}</option>)}
          </select>
        </Field>

        {!istDual && !istInfo && (
          <Field label="Rechtsnatur" hint="Steuert Anzeige und Warnhinweise">
            <select value={form.fristnatur} onChange={(e) => set('fristnatur', e.target.value as SchkgFristnatur)} className={inputCls}>
              {NATUREN.map((n) => <option key={n.code} value={n.code}>{n.label}</option>)}
            </select>
          </Field>
        )}

        <Field label="Kanton" hint="Staatlich anerkannte Feiertage (Art. 31 i.V.m. Art. 142 Abs. 3 ZPO)">
          <select value={form.kanton} onChange={(e) => set('kanton', e.target.value as Kanton)} className={inputCls}>
            {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>

        {aktiv?.modusUmstritten && (
          <Field label="Override (umstrittene Summarsache, Art. 251 ZPO)" hint="Default folgt der aktuellen kantonalen Praxis (Art. 56 ff. SchKG)">
            <select value={override} onChange={(e) => setOverride(e.target.value as SchkgModus | '')} className={inputCls}>
              <option value="">Kein Override (Default: {form.modus})</option>
              {MODI.map((m) => <option key={m.code} value={m.code}>{m.label}</option>)}
            </select>
          </Field>
        )}
      </div>

      {/* Optionale Sonderlogik */}
      {(aktiv?.hemmungMoeglich || !aktiv) && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" checked={hemmung.an} onChange={(e) => setHemmung((s) => ({ ...s, an: e.target.checked }))} />
            Hemmung der Verwirkungsfrist (Art. 88 Abs. 2 / Art. 166 Abs. 2 SchKG)
          </label>
          {hemmung.an && (
            <div className="flex flex-wrap gap-2 items-center pl-6">
              <span className="text-body-s text-ink-500">Hemmendes Verfahren von</span>
              <DatumsFeld value={hemmung.von} onChange={(v) => setHemmung((s) => ({ ...s, von: v }))} className={inputCls} wrapperClassName="w-full sm:w-44" />
              <span className="text-body-s text-ink-500">bis</span>
              <DatumsFeld value={hemmung.bis} onChange={(v) => setHemmung((s) => ({ ...s, bis: v }))} className={inputCls} wrapperClassName="w-full sm:w-44" />
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
          <input type="checkbox" checked={rechtsstillstand.an} onChange={(e) => setRechtsstillstand((s) => ({ ...s, an: e.target.checked }))} />
          Schuldnerbezogener Rechtsstillstand (Art. 57–62 SchKG)
        </label>
        {rechtsstillstand.an && (
          <div className="flex flex-wrap gap-2 items-center pl-6">
            <span className="text-body-s text-ink-500">von</span>
            <DatumsFeld value={rechtsstillstand.von} onChange={(v) => setRechtsstillstand((s) => ({ ...s, von: v }))} className={inputCls} wrapperClassName="w-full sm:w-44" />
            <span className="text-body-s text-ink-500">bis</span>
            <DatumsFeld value={rechtsstillstand.bis} onChange={(v) => setRechtsstillstand((s) => ({ ...s, bis: v }))} className={inputCls} wrapperClassName="w-full sm:w-44" />
          </div>
        )}
      </div>

      {istInfo && aktiv && (
        <div className="lc-notice-danger">
          <p className="lc-overline text-danger-700 mb-1">Keine berechenbare Frist – {aktiv.norm}</p>
          <p className="text-body-s text-danger-700">{aktiv.hinweis}</p>
        </div>
      )}

      <FehlerBox fehler={fehler} />

      {ausgaben.length > 0 && (
        <div id="lc-ergebnis" className="space-y-6">
          <ErgebnisSprung zielId="lc-ergebnis" />
          <LiveHeader />
          {ausgaben.map((a) => {
            const e = a.ergebnis;
            const badge = NATUR_BADGE[a.natur];
            return (
              <div key={a.titel} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-h3 font-display font-semibold text-ink-900">{sansAmp(a.titel)}</h3>
                  {badge && <span className={`lc-badge ${badge.cls}`}>{badge.label}</span>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Auslösendes Ereignis', val: e.massgeblicherEreignistag },
                    { label: 'Fristbeginn (dies a quo)', val: e.diesAQuo },
                    { label: 'Fristende (dies ad quem)', val: `${e.diesAdQuem} · 24.00 Uhr` },
                  ].map((c) => (
                    <EckdatenKachel key={c.label} label={c.label} wert={c.val} />
                  ))}
                </div>
                <FristenKalender
                  ereignisISO={e.ereignisISO}
                  aQuoISO={e.diesAQuoISO}
                  adQuemISO={e.diesAdQuemISO}
                  kanton={form.kanton}
                  stillstandAktiv={e.ruhenAnzeige}
                  labels={{ ereignis: 'Auslösendes Ereignis', aquo: 'Fristbeginn', adquem: 'Fristende' }}
                />
                <ErgebnisAnzeige titel={a.titel} ergebnis={e} />
                <IcsExportButton endISO={e.diesAdQuemISO} titel={`Fristende – ${a.titel}`}
                  beschreibung={e.ergebnis} dateiName="SchKG-Frist.ics" />
                {/* Fristbeginn-Norm aus der Engine (§5): normverweise[1] ist
                    Art. 142 Abs. 1 (Tagesfrist) bzw. Abs. 2 (Monats-/Jahres-
                    frist). Deploy-Bug-Check 7.6.2026 (HOCH): war hartcodiert. */}
                <BegruendungAbsatz text={begruendungsAbsatz(e, fristbeginnZusatz(e.diesAQuoISO, `Art. 31 SchKG i.V.m. ${e.normverweise[1].artikel}`))} />
              </div>
            );
          })}
          <AktenzeichenFeld value={aktenzeichen} onChange={setAktenzeichen} />
          <div className="flex flex-wrap items-center gap-3">
            <PdfExportButton config={pdfConfig} />
            <LinkTeilenButton query={() => permalinkKodieren(SCHKG_LINK_SPEC, {
              ...form, phase, presetKey: aktiv?.key, override: override || undefined,
              hemmungAn: hemmung.an, hemmungVon: hemmung.von || undefined, hemmungBis: hemmung.bis || undefined,
              rsAn: rechtsstillstand.an, rsVon: rechtsstillstand.von || undefined, rsBis: rechtsstillstand.bis || undefined,
            })} />
          </div>
        </div>
      )}
    </div>
  );
}
