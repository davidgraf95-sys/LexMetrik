import { Field } from '../vorlagen/ui';
import { useState } from 'react';
import { BetragsFeld } from '../BetragsFeld';
import { berechneVerzugszins, formatCHF } from '../../lib/verzugszins';
import type {
  VerzugszinsInput, VerzugszinsMethode, SatzGrund, VerzugsbeginnTyp, VerzugszinsErgebnis, VzEreignis,
} from '../../lib/verzugszins';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { DatumsFeld } from '../DatumsFeld';
import { PdfExportButton } from '../PdfExport';
import { PflichtDisclaimer } from '../PflichtDisclaimer';
import { VerzugszinsTimeline } from '../VerzugszinsTimeline';

const VERZUGSZINS_DISCLAIMER =
  'Automatisierte Orientierungsberechnung des Verzugszinses nach Art. 104 OR – keine Rechtsberatung. ' +
  'Art. 104 OR fixiert den Zinssatz, nicht die Tageszählung; die gewählte Methode ist im Einzelfall zu prüfen. ' +
  'Ein über den Verzugszins hinausgehender Schaden bleibt vorbehalten (Art. 106 OR).';

const METHODEN: { code: VerzugszinsMethode; label: string }[] = [
  { code: 'act365', label: 'Tatsächliche Tage / 365 (Zürcher Gerichtsrechner)' },
  { code: 'act360', label: 'Tatsächliche Tage / 360 (Bankusanz)' },
  { code: '30E360', label: '30E/360 (kaufmännisch)' },
];
const GRUENDE: { code: SatzGrund; label: string }[] = [
  { code: 'gesetzlich', label: 'Gesetzlich – 5% (Art. 104 Abs. 1)' },
  { code: 'vertraglich', label: 'Vertraglich höher (Art. 104 Abs. 2)' },
  { code: 'kaufmaennisch', label: 'Kaufmännischer Diskonto (Art. 104 Abs. 3)' },
];
const BEGINN: { code: VerzugsbeginnTyp; label: string }[] = [
  { code: 'mahnung', label: 'Mahnung – ab Erhalt (Art. 102 Abs. 1)' },
  { code: 'verfalltag', label: 'Verfalltag – Zins ab Folgetag (Art. 102 Abs. 2)' },
  { code: 'klage', label: 'Klage/Betreibung – ab Zustellung' },
];

type EreignisRow = { typ: 'teilzahlung' | 'satzaenderung'; datum: string; wert: number };

const DEFAULTS: VerzugszinsInput = {
  kapital: 10000, verzugsbeginn: '2024-01-01', beginnTyp: 'mahnung', stichtag: '2025-01-01',
  zinssatzProzent: 5, satzGrund: 'gesetzlich', methode: 'act365',
};

type State = { form: VerzugszinsInput; rows: EreignisRow[]; zinsforderung: boolean };

const BEISPIELE: { label: string; state: State }[] = [
  { label: 'Rechnung offen, 5%', state: { form: { ...DEFAULTS, kapital: 5000, verzugsbeginn: '2025-03-01', stichtag: '2025-09-01' }, rows: [], zinsforderung: false } },
  { label: 'Mit Teilzahlung', state: { form: { ...DEFAULTS, kapital: 10000, verzugsbeginn: '2024-01-01', stichtag: '2025-01-01' }, rows: [{ typ: 'teilzahlung', datum: '2024-07-01', wert: 4000 }], zinsforderung: false } },
  { label: 'Vertraglich 8%', state: { form: { ...DEFAULTS, kapital: 20000, zinssatzProzent: 8, satzGrund: 'vertraglich', verzugsbeginn: '2024-06-01', stichtag: '2025-06-01' }, rows: [], zinsforderung: false } },
  { label: 'Satzwechsel', state: { form: { ...DEFAULTS, kapital: 15000, verzugsbeginn: '2024-01-01', stichtag: '2025-06-30' }, rows: [{ typ: 'satzaenderung', datum: '2025-01-01', wert: 4 }], zinsforderung: false } },
];

function heuteISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}


export function VerzugszinsForm() {
  const [form, setForm] = useState<VerzugszinsInput>(DEFAULTS);
  const [rows, setRows] = useState<EreignisRow[]>([]);
  const [zinsforderung, setZinsforderung] = useState(false);

  const set = <K extends keyof VerzugszinsInput>(k: K, v: VerzugszinsInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const addRow = (typ: EreignisRow['typ']) => setRows((r) => [...r, { typ, datum: form.verzugsbeginn, wert: typ === 'teilzahlung' ? 1000 : 5 }]);
  const updateRow = (i: number, patch: Partial<EreignisRow>) => setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  const removeRow = (i: number) => setRows((r) => r.filter((_, j) => j !== i));
  const ladeBeispiel = (s: State) => { setForm(s.form); setRows(s.rows); setZinsforderung(s.zinsforderung); };

  // Live-Berechnung
  const ereignisse: VzEreignis[] = rows.map((r) =>
    r.typ === 'teilzahlung' ? { typ: 'teilzahlung', datum: r.datum, betrag: r.wert } : { typ: 'satzaenderung', datum: r.datum, satz: r.wert });
  let ergebnis: VerzugszinsErgebnis | null;
  try { ergebnis = berechneVerzugszins({ ...form, ereignisse, rueckstaendigeZinsforderung: zinsforderung }); } catch { ergebnis = null; }

  const eingaben: Record<string, string> = {
    'Geschuldeter Betrag (CHF)': String(form.kapital),
    'Verzugsbeginn': `${form.verzugsbeginn} (${BEGINN.find((b) => b.code === form.beginnTyp)?.label ?? ''})`,
    'Stichtag': form.stichtag,
    'Zinssatz (Start)': `${form.zinssatzProzent ?? 5} %`,
    'Tageszählung': METHODEN.find((m) => m.code === form.methode)?.label ?? '',
    ...(rows.length ? { 'Ereignisse': `${rows.length} (Teilzahlungen/Satzänderungen)` } : {}),
  };
  const inputNum = 'lc-input num';

  const fmtISO = (s: string) => (s ? s.split('-').reverse().join('.') : '–');
  const pdfConfig: PdfDocConfig = {
    title: 'Verzugszins',
    rechtsgrundlage: 'Berechnung nach Art. 104 OR',
    domain: 'verzugszins',
    fileBase: 'Verzugszins',
    inputs: eingaben,
    // Ergebnis-Hero aus bereits berechneten Werten (kein neuer Inhalt)
    hero: ergebnis ? {
      hauptlabel: 'Verzugszins',
      hauptwert: `CHF ${ergebnis.zinsOffenCHF}`,
      nebenwerte: [{ label: 'Total inkl. Kapital', wert: `CHF ${ergebnis.totalOffenCHF}` }],
      kontext: `${form.zinssatzProzent ?? 5} % auf CHF ${form.kapital} für ${ergebnis.tageTotal} Tage (${fmtISO(ergebnis.ersterZinstag)} – ${fmtISO(ergebnis.stichtag)})`,
    } : undefined,
    sections: ergebnis ? [{ titel: 'Verzugszins (Art. 104 OR)', ergebnis }] : [],
    disclaimer: VERZUGSZINS_DISCLAIMER,
  };

  return (
    <div className="space-y-6">
      <PflichtDisclaimer text={VERZUGSZINS_DISCLAIMER} />

      {/* Beispiele */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="lc-overline text-ink-500 normal-case" style={{ letterSpacing: '0.04em' }}>Beispiel laden:</span>
        {BEISPIELE.map((b) => (
          <button type="button" key={b.label} onClick={() => ladeBeispiel(b.state)} className="lc-chip hover:bg-brass-200 transition-colors">{b.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Geschuldeter Betrag (CHF)" hint="Verzugszins fällt nur auf dem tatsächlich geschuldeten Betrag an">
          <BetragsFeld value={form.kapital ? String(form.kapital) : ''} onChange={(v) => set('kapital', Number(v) || 0)} className={inputNum} placeholder="z. B. 10'000" />
        </Field>
        <Field label="Zinssatz (%)" hint="Default 5% (Art. 104 Abs. 1 OR); z.B. ATSG 5%, Steuern variabel">
          <input type="number" min={0} step={0.25} value={form.zinssatzProzent ?? 5} onChange={(e) => set('zinssatzProzent', Number(e.target.value))} className={inputNum} />
        </Field>

        <Field label="Verzugsbeginn">
          <DatumsFeld value={form.verzugsbeginn} onChange={(v) => set('verzugsbeginn', v)} className="lc-input" />
        </Field>
        <Field label="Art des Verzugsbeginns">
          <select value={form.beginnTyp} onChange={(e) => set('beginnTyp', e.target.value as VerzugsbeginnTyp)} className="lc-input">
            {BEGINN.map((b) => <option key={b.code} value={b.code}>{b.label}</option>)}
          </select>
        </Field>

        <Field label="Stichtag (Berechnung bis)" hint="Zahlung / Urteilstag / heute">
          <div className="flex gap-2">
            <DatumsFeld value={form.stichtag} onChange={(v) => set('stichtag', v)} className="lc-input" />
            <button type="button" onClick={() => set('stichtag', heuteISO())} className="lc-btn-ghost whitespace-nowrap">heute</button>
          </div>
        </Field>
        <Field label="Grundlage des Zinssatzes">
          <select value={form.satzGrund} onChange={(e) => set('satzGrund', e.target.value as SatzGrund)} className="lc-input">
            {GRUENDE.map((g) => <option key={g.code} value={g.code}>{g.label}</option>)}
          </select>
        </Field>

        <Field label="Tageszählung" hint="Methodische Wahl – nicht durch Art. 104 OR fixiert">
          <select value={form.methode} onChange={(e) => set('methode', e.target.value as VerzugszinsMethode)} className="lc-input">
            {METHODEN.map((m) => <option key={m.code} value={m.code}>{m.label}</option>)}
          </select>
        </Field>
        <Field label="Rückständige Zins-/Rentenforderung?">
          <label className="flex items-center gap-2 text-body-s cursor-pointer pt-2 text-ink-700">
            <input type="checkbox" checked={zinsforderung} onChange={(e) => setZinsforderung(e.target.checked)} />
            Ja – Verzinsung erst ab Betreibung/Klage (Art. 105 Abs. 1 OR)
          </label>
        </Field>
      </div>

      {/* Teilzahlungen & Satzänderungen */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-body-s font-semibold text-ink-700">Teilzahlungen &amp; Satzänderungen (Art. 85 OR)</h4>
          <div className="flex gap-2">
            <button type="button" onClick={() => addRow('teilzahlung')} className="lc-btn-ghost lc-btn-sm">+ Teilzahlung</button>
            <button type="button" onClick={() => addRow('satzaenderung')} className="lc-btn-ghost lc-btn-sm">+ Satzänderung</button>
          </div>
        </div>
        {rows.length === 0 && <p className="text-body-s text-ink-500 italic">Keine Ereignisse – einfache Berechnung über den ganzen Zeitraum.</p>}
        {rows.map((row, i) => (
          <div key={i} className="border border-line rounded-md p-3 bg-surface grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-body-s font-medium text-ink-600">Typ</label>
              <select value={row.typ} onChange={(e) => updateRow(i, { typ: e.target.value as EreignisRow['typ'] })} className="lc-input">
                <option value="teilzahlung">Teilzahlung (CHF)</option>
                <option value="satzaenderung">Satzänderung (%)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-body-s font-medium text-ink-600">Datum</label>
              <DatumsFeld value={row.datum} onChange={(v) => updateRow(i, { datum: v })} className="lc-input" />
            </div>
            <div className="space-y-1">
              <label className="text-body-s font-medium text-ink-600">{row.typ === 'teilzahlung' ? 'Betrag (CHF)' : 'neuer Satz (%)'}</label>
              {row.typ === 'teilzahlung' ? (
                <BetragsFeld value={row.wert ? String(row.wert) : ''} onChange={(v) => updateRow(i, { wert: Number(v) || 0 })} className={inputNum} />
              ) : (
                <input type="number" min={0} step={0.25} value={row.wert}
                  onChange={(e) => updateRow(i, { wert: Number(e.target.value) })} className={inputNum} />
              )}
            </div>
            <button type="button" onClick={() => removeRow(i)} className="text-body-s text-danger-700 self-end pb-2 text-left">Entfernen</button>
          </div>
        ))}
      </div>

      {ergebnis && (
        <div className="space-y-4">
          <p className="lc-live lc-overline text-ink-500 normal-case" style={{ letterSpacing: '0.04em' }}>Live-Berechnung – aktualisiert sich automatisch</p>
          {ergebnis.status === 'ok' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Verzugszins (gesamt)', val: `CHF ${ergebnis.zinsTotalCHF}`, stark: true },
                  { label: 'Offenes Kapital', val: `CHF ${ergebnis.kapitalOffenCHF}` },
                  { label: 'Total offen', val: `CHF ${ergebnis.totalOffenCHF}`, stark: true },
                ].map((c) => (
                  <div key={c.label} className="lc-card p-4">
                    <p className="lc-overline mb-1">{c.label}</p>
                    <p className={`num text-ink-900 ${c.stark ? 'text-h2 leading-none font-medium' : 'text-body-l'}`}>{c.val}</p>
                  </div>
                ))}
              </div>
              {ergebnis.zinsGetilgt > 0 && (
                <p className="text-body-s text-ink-500 num">
                  Durch Teilzahlungen getilgte Zinsen: CHF {formatCHF(ergebnis.zinsGetilgt)} · offener Verzugszins: CHF {ergebnis.zinsOffenCHF} · {ergebnis.tageTotal} Tage ({ergebnis.ersterZinstag}–{ergebnis.stichtag}).
                </p>
              )}
              <VerzugszinsTimeline e={ergebnis} />
            </>
          )}
          <ErgebnisAnzeige titel="Verzugszins (Art. 104 OR)" ergebnis={ergebnis} />
          <PdfExportButton config={pdfConfig} />
        </div>
      )}
    </div>
  );
}
