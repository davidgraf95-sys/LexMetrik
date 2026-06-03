import { useState } from 'react';
import type { LohnfortzahlungInput, Kanton } from '../../types/legal';
import { berechneLohnfortzahlung } from '../../lib/lohnfortzahlung';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { PdfExportButton } from '../PdfExport';
import type { Berechnungsergebnis } from '../../types/legal';

const KANTONE: { code: Kanton; name: string }[] = [
  { code: 'BS', name: 'Basel-Stadt' },
  { code: 'BL', name: 'Basel-Landschaft' },
  { code: 'ZH', name: 'Zürich' },
  { code: 'SH', name: 'Schaffhausen' },
  { code: 'TG', name: 'Thurgau' },
  { code: 'ZG', name: 'Zug ⚠' },
  { code: 'GR', name: 'Graubünden ⚠' },
  { code: 'BE', name: 'Bern' },
  { code: 'AG', name: 'Aargau' },
  { code: 'SO', name: 'Solothurn' },
  { code: 'LU', name: 'Luzern' },
  { code: 'SZ', name: 'Schwyz' },
  { code: 'UR', name: 'Uri' },
  { code: 'OW', name: 'Obwalden' },
  { code: 'NW', name: 'Nidwalden' },
  { code: 'GL', name: 'Glarus' },
  { code: 'FR', name: 'Freiburg' },
  { code: 'VS', name: 'Wallis' },
  { code: 'VD', name: 'Waadt' },
  { code: 'GE', name: 'Genf' },
  { code: 'NE', name: 'Neuenburg' },
  { code: 'JU', name: 'Jura' },
  { code: 'TI', name: 'Tessin' },
  { code: 'SG', name: 'St. Gallen' },
  { code: 'AR', name: 'Appenzell AR' },
  { code: 'AI', name: 'Appenzell AI' },
];

const SKALEN_HINWEIS =
  'Die Lohnfortzahlungsskalen sind GERICHTSPRAXIS zur Konkretisierung von Art. 324a Abs. 2 OR ' +
  '(«angemessen längere Zeit») – keine Gesetzesnormen. ' +
  'Quelle: anerkannte kantonale Skalen. Stand: unregelmässig aktualisierte Gerichtspraxis. ' +
  'Vor Produktiveinsatz gegen aktuelle kantonale Praxis abzugleichen.';

const DEFAULTS: LohnfortzahlungInput = {
  vertragsbeginn: '2024-01-01',
  verhinderungBeginn: '2026-01-01',
  arbeitsunfaehigkeitProzent: 100,
  kanton: 'BS',
  ktgGleichwertigVorhanden: false,
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

export function LohnfortzahlungForm() {
  const [form, setForm] = useState<LohnfortzahlungInput>(DEFAULTS);
  const [ergebnis, setErgebnis] = useState<Berechnungsergebnis | null>(null);

  const set = <K extends keyof LohnfortzahlungInput>(k: K, v: LohnfortzahlungInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const berechne = () => {
    try {
      setErgebnis(berechneLohnfortzahlung(form));
    } catch (e) {
      console.error(e);
    }
  };

  const eingaben = {
    'Vertragsbeginn': form.vertragsbeginn,
    'Beginn Verhinderung': form.verhinderungBeginn,
    'Arbeitsunfähigkeit': `${form.arbeitsunfaehigkeitProzent} %`,
    'Kanton': form.kanton,
    'KTG gleichwertig': form.ktgGleichwertigVorhanden ? 'Ja' : 'Nein',
    ...(form.monatslohnBrutto ? { 'Monatslohn brutto (CHF)': String(form.monatslohnBrutto) } : {}),
  };

  return (
    <div className="space-y-6">
      {/* Skalen-Hinweis */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Wichtiger Hinweis zu den Skalen</p>
        <p className="text-sm text-amber-800">{SKALEN_HINWEIS}</p>
      </div>

      {/* Eingaben */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Vertragsbeginn">
          <input type="date" value={form.vertragsbeginn} onChange={(e) => set('vertragsbeginn', e.target.value)} className={inputCls} />
        </Field>

        <Field label="Beginn der Arbeitsverhinderung" hint="Stichtag für Dienstjahr-Berechnung">
          <input type="date" value={form.verhinderungBeginn} onChange={(e) => set('verhinderungBeginn', e.target.value)} className={inputCls} />
        </Field>

        <Field label="Kanton" hint="BS/BL → Basler Skala · ZH/SH/TG → Zürcher Skala · Übrige → Berner Skala">
          <select value={form.kanton} onChange={(e) => set('kanton', e.target.value as Kanton)} className={inputCls}>
            {KANTONE.map((k) => (
              <option key={k.code} value={k.code}>{k.code} – {k.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Arbeitsunfähigkeit (%)" hint="100 = vollständig; z.B. 50 = halb (Budget-Modell)">
          <input
            type="number" min={1} max={100} step={5}
            value={form.arbeitsunfaehigkeitProzent}
            onChange={(e) => set('arbeitsunfaehigkeitProzent', Number(e.target.value))}
            className={inputCls}
          />
        </Field>

        <Field label="Monatslohn brutto (CHF, optional)" hint="Für Betragsangabe; kein Einfluss auf Dauer">
          <input
            type="number" min={0} step={100}
            value={form.monatslohnBrutto ?? ''}
            onChange={(e) => set('monatslohnBrutto', e.target.value ? Number(e.target.value) : undefined)}
            className={inputCls}
            placeholder="Leer = kein Betrag"
          />
        </Field>

        <Field label="KTG-Versicherung gleichwertig?">
          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="ktg" checked={!form.ktgGleichwertigVorhanden} onChange={() => set('ktgGleichwertigVorhanden', false)} />
              Nein (Skala gilt)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="ktg" checked={form.ktgGleichwertigVorhanden} onChange={() => set('ktgGleichwertigVorhanden', true)} />
              Ja (KTG-Regime, Art. 324b OR)
            </label>
          </div>
        </Field>
      </div>

      <button
        onClick={berechne}
        className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Berechnen
      </button>

      {ergebnis && (
        <div className="space-y-4">
          <ErgebnisAnzeige titel="Lohnfortzahlung (Art. 324a OR)" ergebnis={ergebnis} />
          <PdfExportButton abschnitte={[{ titel: 'Lohnfortzahlung (Art. 324a OR)', ergebnis }]} eingaben={eingaben} />
        </div>
      )}
    </div>
  );
}
