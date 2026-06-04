import { useState } from 'react';
import type { Kanton } from '../../types/legal';
import type { SchkgInput, SchkgModus, SchkgFristnatur, SchkgEinheit, SchkgErgebnis } from '../../types/schkg';
import { berechneSchkgFrist } from '../../lib/schkgFristen';
import { PHASEN_SCHKG, PRESETS_SCHKG, SCHKG_DISCLAIMER, type SchkgPhase, type SchkgPreset } from '../../lib/schkgPresets';
import { rechtsprechung, VERIFIKATION } from '../../data/verifikation';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { DatumsFeld } from '../DatumsFeld';
import { sansAmp } from '../typografie';
import { PdfExportButton } from '../PdfExport';
import { FristenKalender } from '../FristenKalender';

const KANTONE: Kanton[] = ['ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL', 'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU'];

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

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-ink-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

const inputCls = 'lc-input';

export function SchkgFristenForm() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [phase, setPhase] = useState<SchkgPhase>('einleitung');
  const [aktiv, setAktiv] = useState<SchkgPreset | null>(null);
  const [override, setOverride] = useState<SchkgModus | ''>('');
  const [hemmung, setHemmung] = useState<{ an: boolean; von: string; bis: string }>({ an: false, von: '', bis: '' });
  const [rechtsstillstand, setRechtsstillstand] = useState<{ an: boolean; von: string; bis: string }>({ an: false, von: '', bis: '' });

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
  const basis = (einheit: SchkgEinheit, laenge: number, fristnatur: SchkgFristnatur, mitHemmung: boolean): SchkgInput => ({
    ereignis: form.ereignis,
    einheit,
    laenge,
    modus: form.modus,
    fristnatur,
    kanton: form.kanton,
    ausloeser: form.ausloeser,
    modusOverride: aktiv?.modusUmstritten && override ? override : undefined,
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

  const eingaben: Record<string, string> = {
    'Auslösendes Ereignis': form.ereignis,
    'Auslöser': form.ausloeser,
    'Stillstand-Regime': MODI.find((m) => m.code === (override || form.modus))?.label ?? form.modus,
    'Kanton': form.kanton,
    ...(istDual ? {} : { 'Frist': `${form.laenge} ${form.einheit}`, 'Rechtsnatur': form.fristnatur }),
  };

  const pdfConfig: PdfDocConfig = {
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
      <details className="lc-notice-danger rounded-md" style={{ padding: '10px 14px', borderLeft: '3px solid var(--danger-500)' }}>
        <summary className="text-body-s text-danger-700 cursor-pointer">
          <strong>Keine Rechtsberatung</strong> – rechnerische Orientierung (Art. 31/56/63 SchKG, Schnittstelle Art. 145 ZPO). Betreibungsferien ≠ Gerichtsferien.
        </summary>
        <p className="text-body-s text-danger-700 mt-2">{SCHKG_DISCLAIMER}</p>
      </details>

      {/* Verfahrensphase */}
      <div className="space-y-2">
        <p className="lc-overline">Verfahrensphase wählen</p>
        <div className="flex flex-wrap gap-2">
          {PHASEN_SCHKG.map((p) => (
            <button key={p.code} type="button" onClick={() => wechslePhase(p.code)}
              className={`px-3 py-2 rounded-md text-body-s font-medium transition-colors ${
                phase === p.code ? 'bg-ink-900 text-paper' : 'bg-surface border border-line text-ink-700 hover:bg-brass-100'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Frist-Preset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <Field label="Frist-Vorlage" hint="Setzt Stillstand-Regime, Rechtsnatur, Länge und Auslöser automatisch">
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
              <input type="number" min={1} step={1} value={form.laenge} onChange={(e) => set('laenge', Number(e.target.value))} className={inputCls + ' w-24'} />
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
          <label className="flex items-center gap-2 text-sm cursor-pointer text-ink-700">
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
        <label className="flex items-center gap-2 text-sm cursor-pointer text-ink-700">
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
        <div className="lc-notice-danger rounded-md" style={{ padding: '12px 16px', borderLeft: '3px solid var(--danger-500)' }}>
          <p className="lc-overline text-danger-700 mb-1">Keine berechenbare Frist – {aktiv.norm}</p>
          <p className="text-body-s text-danger-700">{aktiv.hinweis}</p>
        </div>
      )}

      {fehler.length > 0 && (
        <div className="rounded-lg border border-line bg-danger-bg p-4 space-y-1">
          <p className="text-xs font-semibold text-danger-700 uppercase tracking-wide mb-1">Eingabefehler</p>
          {fehler.map((f, i) => <p key={i} className="text-sm text-danger-700">• {f}</p>)}
        </div>
      )}

      {ausgaben.length > 0 && (
        <div className="space-y-6">
          <p className="lc-live lc-overline text-ink-500 normal-case" style={{ letterSpacing: '0.04em' }}>Live-Berechnung – aktualisiert sich automatisch</p>
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
                    <div key={c.label} className="rounded-xl border border-line bg-surface-raised p-4">
                      <p className="text-xs text-ink-500 mb-1">{c.label}</p>
                      <p className="text-lg font-semibold text-ink-900">{c.val}</p>
                    </div>
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
              </div>
            );
          })}
          <PdfExportButton config={pdfConfig} />
        </div>
      )}
    </div>
  );
}
