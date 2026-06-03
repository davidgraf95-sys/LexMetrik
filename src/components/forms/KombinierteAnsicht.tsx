import { useState } from 'react';
import type { ArbeitsrechtInput, Kanton, SperrereignisTyp, Sperrereignis } from '../../types/legal';
import { berechneLohnfortzahlung } from '../../lib/lohnfortzahlung';
import { berechneKuendigungsfrist } from '../../lib/kuendigungsfrist';
import { berechneSperrfristen } from '../../lib/sperrfristen';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { PdfExportButton } from '../PdfExport';
import type { Berechnungsergebnis } from '../../types/legal';

const KANTONE_SELECT: Kanton[] = ['BS','BL','ZH','SH','TG','ZG','GR','BE','AG','SO','LU','SZ','UR','OW','NW','GL','FR','VS','VD','GE','NE','JU','TI','SG','AR','AI'];

const TYPEN: { code: SperrereignisTyp; label: string }[] = [
  { code: 'krankheit_unfall',  label: 'Krankheit / Unfall (lit. b)' },
  { code: 'schwangerschaft',   label: 'Schwangerschaft (lit. c)' },
  { code: 'militaer_zivil',    label: 'Militär / Zivildienst (lit. a)' },
  { code: 'hilfsaktion',       label: 'Hilfsaktion (lit. d)' },
];

const inputCls = 'lc-input';

const DEFAULTS: ArbeitsrechtInput = {
  vertragsbeginn: '2020-01-01',
  zugangKuendigung: '2025-04-15',
  kuendigendePartei: 'arbeitgeber',
  probezeitMonate: 1,
  kuendigungsterminMonatsende: true,
  verhinderungBeginn: '2025-04-01',
  arbeitsunfaehigkeitProzent: 100,
  kanton: 'BS',
  ktgGleichwertigVorhanden: false,
  sperrereignisse: [],
};

export function KombinierteAnsicht() {
  const [form, setForm] = useState<ArbeitsrechtInput>(DEFAULTS);
  const [ergebnisse, setErgebnisse] = useState<{
    lohnfortzahlung?: Berechnungsergebnis;
    kuendigungsfrist?: Berechnungsergebnis;
    sperrfristen?: Berechnungsergebnis;
  }>({});

  const set = <K extends keyof ArbeitsrechtInput>(k: K, v: ArbeitsrechtInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addEreignis = () =>
    setForm((f) => ({
      ...f,
      sperrereignisse: [...(f.sperrereignisse ?? []), { typ: 'krankheit_unfall', von: '2025-04-01', bis: '2025-05-31' }],
    }));

  const updateEreignis = (i: number, field: keyof Sperrereignis, val: string) =>
    setForm((f) => {
      const list = [...(f.sperrereignisse ?? [])];
      list[i] = { ...list[i], [field]: val } as Sperrereignis;
      return { ...f, sperrereignisse: list };
    });

  const removeEreignis = (i: number) =>
    setForm((f) => ({
      ...f,
      sperrereignisse: (f.sperrereignisse ?? []).filter((_, j) => j !== i),
    }));

  const berechne = () => {
    const next: typeof ergebnisse = {};
    if (form.verhinderungBeginn) {
      next.lohnfortzahlung = berechneLohnfortzahlung({
        vertragsbeginn: form.vertragsbeginn,
        verhinderungBeginn: form.verhinderungBeginn,
        arbeitsunfaehigkeitProzent: form.arbeitsunfaehigkeitProzent ?? 100,
        kanton: form.kanton ?? 'BE',
        ktgGleichwertigVorhanden: form.ktgGleichwertigVorhanden ?? false,
        monatslohnBrutto: form.monatslohnBrutto,
      });
    }
    next.kuendigungsfrist = berechneKuendigungsfrist(form).ergebnis;
    next.sperrfristen = berechneSperrfristen(form);
    setErgebnisse(next);
  };

  const abschnitte = [
    ...(ergebnisse.lohnfortzahlung ? [{ titel: 'Lohnfortzahlung (Art. 324a OR)', ergebnis: ergebnisse.lohnfortzahlung }] : []),
    ...(ergebnisse.kuendigungsfrist ? [{ titel: 'Kündigungsfrist (Art. 335c OR)', ergebnis: ergebnisse.kuendigungsfrist }] : []),
    ...((form.sperrereignisse ?? []).length > 0 && ergebnisse.sperrfristen ? [{ titel: 'Sperrfristen (Art. 336c OR)', ergebnis: ergebnisse.sperrfristen }] : []),
  ];

  const eingaben = {
    'Vertragsbeginn': form.vertragsbeginn,
    'Zugang Kündigung': form.zugangKuendigung,
    'Kündigende Partei': form.kuendigendePartei === 'arbeitgeber' ? 'Arbeitgeber' : 'Arbeitnehmer',
    'Beginn Verhinderung': form.verhinderungBeginn ?? '',
    'AUF %': String(form.arbeitsunfaehigkeitProzent ?? 100),
    'Kanton': form.kanton ?? '',
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-line bg-surface p-4">
        <p className="text-sm text-ink-600">
          Kombinierte Ansicht: Alle drei Teilberechnungen (A/B/C) mit gemeinsamen Eingaben.
          Stichtage sind je Modul unterschiedlich – details im Rechenweg.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-ink-700">Vertragsbeginn</label>
            <input type="date" value={form.vertragsbeginn} onChange={(e) => set('vertragsbeginn', e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-ink-700">Zugang Kündigung <span className="text-ink-500 font-normal">(Stichtag B/C)</span></label>
            <input type="date" value={form.zugangKuendigung} onChange={(e) => set('zugangKuendigung', e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-ink-700">Beginn Verhinderung <span className="text-ink-500 font-normal">(Stichtag A)</span></label>
            <input type="date" value={form.verhinderungBeginn ?? ''} onChange={(e) => set('verhinderungBeginn', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-ink-700">Kündigende Partei</label>
          <select value={form.kuendigendePartei} onChange={(e) => set('kuendigendePartei', e.target.value as 'arbeitgeber' | 'arbeitnehmer')} className={inputCls}>
            <option value="arbeitgeber">Arbeitgeber</option>
            <option value="arbeitnehmer">Arbeitnehmer</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-ink-700">Kanton</label>
          <select value={form.kanton ?? 'BE'} onChange={(e) => set('kanton', e.target.value as Kanton)} className={inputCls}>
            {KANTONE_SELECT.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-ink-700">AUF % (Lohnfortzahlung)</label>
          <input type="number" min={1} max={100} value={form.arbeitsunfaehigkeitProzent ?? 100} onChange={(e) => set('arbeitsunfaehigkeitProzent', Number(e.target.value))} className={inputCls} />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-ink-700">Probezeit (Monate)</label>
          <input type="number" min={0} max={3} value={form.probezeitMonate} onChange={(e) => set('probezeitMonate', Number(e.target.value))} className={inputCls} />
        </div>
      </div>

      {/* Sperrereignisse */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-ink-700">Sperrereignisse (Art. 336c OR)</h4>
          <button onClick={addEreignis} className="text-sm px-3 py-1.5 bg-surface hover:bg-brass-100 rounded-lg transition-colors">+ Ereignis</button>
        </div>
        {(form.sperrereignisse ?? []).map((e, i) => (
          <div key={i} className="border border-line rounded-lg p-3 bg-surface grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-600">Typ</label>
              <select value={e.typ} onChange={(ev) => updateEreignis(i, 'typ', ev.target.value)} className={inputCls + ' text-xs'}>
                {TYPEN.map((t) => <option key={t.code} value={t.code}>{t.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-600">Von</label>
              <input type="date" value={e.von} onChange={(ev) => updateEreignis(i, 'von', ev.target.value)} className={inputCls + ' text-xs'} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-600">Bis</label>
              <input type="date" value={e.bis} onChange={(ev) => updateEreignis(i, 'bis', ev.target.value)} className={inputCls + ' text-xs'} />
            </div>
            <button onClick={() => removeEreignis(i)} className="text-xs text-danger-700 hover:text-danger-700 self-end pb-2">Entfernen</button>
          </div>
        ))}
      </div>

      <button onClick={berechne} className="px-6 py-2.5 bg-ink-900 hover:bg-ink-700 text-paper text-sm font-medium rounded-lg transition-colors">
        Alle berechnen
      </button>

      {(form.sperrereignisse ?? []).length > 0 && (ergebnisse.lohnfortzahlung || ergebnisse.sperrfristen) && (
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-semibold text-brass-700 uppercase tracking-wide mb-1">Querverbindung: Art. 336c ↔ Art. 324a</p>
          <p className="text-sm text-ink-600">
            Sperrfrist/Hemmung (Art. 336c OR) und Lohnfortzahlung (Art. 324a OR) sind <strong>voneinander unabhängig</strong>:
            Modul A bestimmt die Lohn-Dauer, Modul C die Verlängerung der Kündigungsfrist (Hemmung).
            Für die Dauer der gehemmten/verlängerten Kündigungsfrist besteht <strong>nicht automatisch</strong> ein Lohnanspruch
            (BGE 115 V 437, zu verifizieren).
          </p>
        </div>
      )}

      <div className="space-y-4">
        {ergebnisse.lohnfortzahlung && (
          <ErgebnisAnzeige titel="A – Lohnfortzahlung (Art. 324a OR)" ergebnis={ergebnisse.lohnfortzahlung} />
        )}
        {ergebnisse.kuendigungsfrist && (
          <ErgebnisAnzeige titel="B – Kündigungsfrist (Art. 335b / 335c OR)" ergebnis={ergebnisse.kuendigungsfrist} />
        )}
        {(form.sperrereignisse ?? []).length > 0 && ergebnisse.sperrfristen && (
          <ErgebnisAnzeige titel="C – Sperrfristen (Art. 336c OR)" ergebnis={ergebnisse.sperrfristen} />
        )}
        {abschnitte.length > 0 && (
          <PdfExportButton abschnitte={abschnitte} eingaben={eingaben} />
        )}
      </div>
    </div>
  );
}
