import { useState } from 'react';
import { berechneVerzugszins } from '../../lib/verzugszins';
import type { VerzugszinsInput, VerzugszinsMethode, SatzGrund, VerzugsgrundTyp, VerzugszinsErgebnis } from '../../lib/verzugszins';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { PdfExportButton } from '../PdfExport';
import { PflichtDisclaimer } from '../PflichtDisclaimer';

const METHODEN: { code: VerzugszinsMethode; label: string }[] = [
  { code: 'act360', label: 'Tatsächliche Tage / 360 (Bankusanz)' },
  { code: 'act365', label: 'Tatsächliche Tage / 365' },
  { code: '30E360', label: '30E/360 (kaufmännisch)' },
];

const GRUENDE: { code: SatzGrund; label: string }[] = [
  { code: 'gesetzlich', label: 'Gesetzlich – 5% (Art. 104 Abs. 1)' },
  { code: 'vertraglich', label: 'Vertraglich höher (Art. 104 Abs. 2)' },
  { code: 'kaufmaennisch', label: 'Kaufmännischer Diskonto (Art. 104 Abs. 3)' },
];

const VERZUGSGRUND: { code: VerzugsgrundTyp; label: string }[] = [
  { code: 'mahnung', label: 'Mahnung (ab Erhalt)' },
  { code: 'verfalltag', label: 'Verfalltag / ohne Mahnung (Art. 108 Ziff. 1)' },
  { code: 'klage', label: 'Klageeinleitung (ab Zustellung)' },
];

const DEFAULTS: VerzugszinsInput = {
  kapital: 10000,
  verzugsbeginn: '2024-01-01',
  verzugsende: '2025-01-01',
  zinssatzProzent: 5,
  satzGrund: 'gesetzlich',
  methode: 'act360',
  verzugsgrund: 'mahnung',
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-body-s font-medium text-ink-700">{label}</label>
      {children}
      {hint && <p className="text-body-s text-ink-500">{hint}</p>}
    </div>
  );
}

export function VerzugszinsForm() {
  const [form, setForm] = useState<VerzugszinsInput>(DEFAULTS);
  const [ergebnis, setErgebnis] = useState<VerzugszinsErgebnis | null>(null);

  const set = <K extends keyof VerzugszinsInput>(k: K, v: VerzugszinsInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const berechne = () => setErgebnis(berechneVerzugszins(form));

  const eingaben: Record<string, string> = {
    'Geschuldeter Betrag (CHF)': String(form.kapital),
    'Verzugsbeginn': form.verzugsbeginn,
    'Verzugsende': form.verzugsende,
    'Zinssatz': `${form.zinssatzProzent ?? 5} %`,
    'Grundlage': GRUENDE.find((g) => g.code === form.satzGrund)?.label ?? '',
    'Tageszählung': METHODEN.find((m) => m.code === form.methode)?.label ?? '',
  };

  return (
    <div className="space-y-6">
      <PflichtDisclaimer text="Automatisierte Orientierungsberechnung des Verzugszinses nach Art. 104 OR – keine Rechtsberatung. Art. 104 OR fixiert den Zinssatz, nicht die Tageszählung; die gewählte Methode ist im Einzelfall zu prüfen." />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Geschuldeter Betrag (CHF)" hint="Verzugszins fällt nur auf dem tatsächlich geschuldeten Betrag an">
          <input type="number" min={0} step={100} value={form.kapital}
            onChange={(e) => set('kapital', Number(e.target.value))} className="lc-input num" />
        </Field>

        <Field label="Zinssatz (%)" hint="Default 5% (Art. 104 Abs. 1 OR)">
          <input type="number" min={0} step={0.25} value={form.zinssatzProzent ?? 5}
            onChange={(e) => set('zinssatzProzent', Number(e.target.value))} className="lc-input num" />
        </Field>

        <Field label="Verzugsbeginn" hint="Tag, ab dem der Zins läuft">
          <input type="date" value={form.verzugsbeginn} onChange={(e) => set('verzugsbeginn', e.target.value)} className="lc-input" />
        </Field>

        <Field label="Verzugsende" hint="Zahlung / Urteilstag / Stichtag">
          <input type="date" value={form.verzugsende} onChange={(e) => set('verzugsende', e.target.value)} className="lc-input" />
        </Field>

        <Field label="Grundlage des Zinssatzes">
          <select value={form.satzGrund} onChange={(e) => set('satzGrund', e.target.value as SatzGrund)} className="lc-input">
            {GRUENDE.map((g) => <option key={g.code} value={g.code}>{g.label}</option>)}
          </select>
        </Field>

        <Field label="Beginn des Zinsenlaufs">
          <select value={form.verzugsgrund} onChange={(e) => set('verzugsgrund', e.target.value as VerzugsgrundTyp)} className="lc-input">
            {VERZUGSGRUND.map((g) => <option key={g.code} value={g.code}>{g.label}</option>)}
          </select>
        </Field>

        <Field label="Tageszählung" hint="Methodische Wahl – nicht durch Art. 104 OR fixiert">
          <select value={form.methode} onChange={(e) => set('methode', e.target.value as VerzugszinsMethode)} className="lc-input">
            {METHODEN.map((m) => <option key={m.code} value={m.code}>{m.label}</option>)}
          </select>
        </Field>
      </div>

      <button onClick={berechne} className="lc-btn-primary">Verzugszins berechnen</button>

      {ergebnis && (
        <div className="space-y-4">
          {ergebnis.status === 'ok' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Verzugszins', val: `CHF ${ergebnis.zinsbetragCHF}`, stark: true },
                { label: 'Verzugstage', val: `${ergebnis.tage}` },
                { label: 'Total inkl. Kapital', val: `CHF ${ergebnis.totalCHF}` },
              ].map((c) => (
                <div key={c.label} className="lc-card p-4">
                  <p className="lc-overline mb-1">{c.label}</p>
                  <p className={`num text-ink-900 ${c.stark ? 'text-[1.75rem] leading-none font-medium' : 'text-body-l'}`}>{c.val}</p>
                </div>
              ))}
            </div>
          )}
          <ErgebnisAnzeige titel="Verzugszins (Art. 104 OR)" ergebnis={ergebnis} />
          <PdfExportButton abschnitte={[{ titel: 'Verzugszins (Art. 104 OR)', ergebnis }]} eingaben={eingaben} />
        </div>
      )}
    </div>
  );
}
