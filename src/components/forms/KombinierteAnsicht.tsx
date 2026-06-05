import { inputCls } from '../vorlagen/ui';
import { useState } from 'react';
import type { ArbeitsrechtInput, Kanton, SperrereignisTyp, Sperrereignis } from '../../types/legal';
import { berechneLohnfortzahlung } from '../../lib/lohnfortzahlung';
import { berechneSperrfristen, type SperrfristenErgebnis } from '../../lib/sperrfristen';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { DatumsFeld } from '../DatumsFeld';
import { PdfExportButton } from '../PdfExport';
import { FristenKalender } from '../FristenKalender';
import { KuendigungTimeline } from '../KuendigungTimeline';
import { SperrtageZaehler } from '../SperrtageZaehler';

const KANTONE_SELECT: Kanton[] = ['BS','BL','ZH','SH','TG','ZG','GR','BE','AG','SO','LU','SZ','UR','OW','NW','GL','FR','VS','VD','GE','NE','JU','TI','SG','AR','AI'];

const TYPEN: { code: SperrereignisTyp; label: string }[] = [
  { code: 'krankheit_unfall',  label: 'Krankheit / Unfall (lit. b)' },
  { code: 'schwangerschaft',   label: 'Schwangerschaft (lit. c)' },
  { code: 'militaer_zivil',    label: 'Militär / Zivildienst (lit. a)' },
  { code: 'hilfsaktion',       label: 'Hilfsaktion (lit. d)' },
  { code: 'betreuungsurlaub',  label: 'Betreuungsurlaub (Art. 329i)' },
];


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

  // Live-Berechnung – B+C als EIN kohärentes Ergebnis (Sperrfristen integrieren die Kündigungsfrist).
  const ergebnisse: { lohnfortzahlung?: ReturnType<typeof berechneLohnfortzahlung>; kuendigung?: SperrfristenErgebnis } = {};
  try {
    if (form.verhinderungBeginn) {
      ergebnisse.lohnfortzahlung = berechneLohnfortzahlung({
        vertragsbeginn: form.vertragsbeginn,
        verhinderungBeginn: form.verhinderungBeginn,
        arbeitsunfaehigkeitProzent: form.arbeitsunfaehigkeitProzent ?? 100,
        kanton: form.kanton ?? 'BE',
        ktgGleichwertigVorhanden: form.ktgGleichwertigVorhanden ?? false,
        monatslohnBrutto: form.monatslohnBrutto,
      });
    }
    ergebnisse.kuendigung = berechneSperrfristen(form);
  } catch { /* unvollständige Eingabe – Ergebnis ausgelassen */ }

  const abschnitte = [
    ...(ergebnisse.lohnfortzahlung ? [{ titel: 'Lohnfortzahlung (Art. 324a OR)', ergebnis: ergebnisse.lohnfortzahlung }] : []),
    ...(ergebnisse.kuendigung ? [{ titel: 'Kündigung & Sperrfristen (Art. 335c / 336c OR)', ergebnis: ergebnisse.kuendigung }] : []),
  ];

  const eingaben = {
    'Vertragsbeginn': form.vertragsbeginn,
    'Zugang Kündigung': form.zugangKuendigung,
    'Kündigende Partei': form.kuendigendePartei === 'arbeitgeber' ? 'Arbeitgeber' : 'Arbeitnehmer',
    'Beginn Verhinderung': form.verhinderungBeginn ?? '',
    'AUF %': String(form.arbeitsunfaehigkeitProzent ?? 100),
    'Kanton': form.kanton ?? '',
  };

  // PDF: Skalen-Hinweis nur, wenn die Lohnfortzahlung Teil des Berichts ist.
  const pdfConfig: PdfDocConfig = {
    title: 'Arbeitsrechtliche Orientierungsberechnung (kombiniert)',
    domain: 'arbeitsrecht',
    fileBase: 'Arbeitsrecht-Kombiniert',
    inputs: eingaben,
    sections: abschnitte,
    disclaimer:
      'Automatisierte Orientierungsberechnung (Art. 324a / 335c / 336c OR) – keine Rechtsberatung. ' +
      'Massgeblich sind GAV, Einzelvertrag, Versicherungspolice und der konkrete Sachverhalt; abweichende ' +
      'Regelungen gehen vor. Norm- und Rechtsprechungsverweise sind im Einzelfall zu prüfen.' +
      (ergebnisse.lohnfortzahlung
        ? ' Die Lohnfortzahlungsskalen sind Gerichtspraxis und vor Produktiveinsatz gegen die aktuelle kantonale Praxis abzugleichen.'
        : ''),
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-line bg-surface p-4">
        <p className="text-body-s text-ink-600">
          Kombinierte Ansicht: Alle drei Teilberechnungen (A/B/C) mit gemeinsamen Eingaben.
          Stichtage sind je Modul unterschiedlich – details im Rechenweg.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-body-s font-medium text-ink-700">Vertragsbeginn</label>
            <DatumsFeld value={form.vertragsbeginn} onChange={(v) => set('vertragsbeginn', v)} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="block text-body-s font-medium text-ink-700">Zugang Kündigung <span className="text-ink-500 font-normal">(Stichtag B/C)</span></label>
            <DatumsFeld value={form.zugangKuendigung} onChange={(v) => set('zugangKuendigung', v)} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="block text-body-s font-medium text-ink-700">Beginn Verhinderung <span className="text-ink-500 font-normal">(Stichtag A)</span></label>
            <DatumsFeld value={form.verhinderungBeginn ?? ''} onChange={(v) => set('verhinderungBeginn', v)} className={inputCls} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink-700">Kündigende Partei</label>
          <select value={form.kuendigendePartei} onChange={(e) => set('kuendigendePartei', e.target.value as 'arbeitgeber' | 'arbeitnehmer')} className={inputCls}>
            <option value="arbeitgeber">Arbeitgeber</option>
            <option value="arbeitnehmer">Arbeitnehmer</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink-700">Kanton</label>
          <select value={form.kanton ?? 'BE'} onChange={(e) => set('kanton', e.target.value as Kanton)} className={inputCls}>
            {KANTONE_SELECT.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink-700">AUF % (Lohnfortzahlung)</label>
          <input type="number" min={1} max={100} value={form.arbeitsunfaehigkeitProzent ?? 100} onChange={(e) => set('arbeitsunfaehigkeitProzent', Number(e.target.value))} className={inputCls} />
        </div>

        <div className="space-y-1">
          <label className="block text-body-s font-medium text-ink-700">Probezeit (Monate)</label>
          <input type="number" min={0} max={3} value={form.probezeitMonate} onChange={(e) => set('probezeitMonate', Number(e.target.value))} className={inputCls} />
        </div>
      </div>

      {/* Sperrereignisse */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-body-s font-semibold text-ink-700">Sperrereignisse (Art. 336c OR)</h4>
          <button onClick={addEreignis} className="text-body-s px-3 py-1.5 bg-surface hover:bg-brass-100 rounded-lg transition-colors">+ Ereignis</button>
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
              <DatumsFeld value={e.von} onChange={(v) => updateEreignis(i, 'von', v)} className={inputCls + ' text-xs'} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-600">Bis</label>
              <DatumsFeld value={e.bis} onChange={(v) => updateEreignis(i, 'bis', v)} className={inputCls + ' text-xs'} />
            </div>
            <button onClick={() => removeEreignis(i)} className="text-xs text-danger-700 hover:text-danger-700 self-end pb-2">Entfernen</button>
          </div>
        ))}
      </div>

      <p className="lc-live lc-overline text-ink-500 normal-case" style={{ letterSpacing: '0.04em' }}>Live-Berechnung – aktualisiert sich automatisch</p>

      {ergebnisse.kuendigung?.status === 'nichtig' && (
        <div className="lc-notice-danger">
          <p className="lc-overline text-danger-700 mb-1">Kündigung nichtig</p>
          <p className="text-body-s text-danger-700">
            Der Zugang der Kündigung fällt in eine Sperrfrist – die Kündigung ist nichtig und entfaltet keine Wirkung.
            Sie ist nach Ablauf der Sperrfrist/Verhinderung zu wiederholen (Details unten).
          </p>
        </div>
      )}

      {(form.sperrereignisse ?? []).length > 0 && (ergebnisse.lohnfortzahlung || ergebnisse.kuendigung) && (
        <div className="lc-notice">
          <p className="lc-overline mb-1">Querverbindung: Art. 336c ↔ Art. 324a</p>
          <p className="text-body-s text-ink-600">
            Sperrfrist/Hemmung (Art. 336c OR) und Lohnfortzahlung (Art. 324a OR) sind <strong>voneinander unabhängig</strong>:
            Modul A bestimmt die Lohn-Dauer, die Sperrfrist die Gültigkeit/Verlängerung der Kündigung. Für die gehemmte/verlängerte
            Kündigungsfrist besteht <strong>nicht automatisch</strong> ein Lohnanspruch (BGE 115 V 437, zu verifizieren).
          </p>
        </div>
      )}

      <div className="space-y-4">
        {ergebnisse.lohnfortzahlung && (
          <ErgebnisAnzeige titel="A – Lohnfortzahlung (Art. 324a OR)" ergebnis={ergebnisse.lohnfortzahlung} />
        )}
        {ergebnisse.lohnfortzahlung?.status === 'ok' && ergebnisse.lohnfortzahlung.zeitraumVonISO && ergebnisse.lohnfortzahlung.letzterTagISO && (
          <FristenKalender
            ereignisISO={ergebnisse.lohnfortzahlung.zeitraumVonISO}
            aQuoISO={ergebnisse.lohnfortzahlung.zeitraumVonISO}
            adQuemISO={ergebnisse.lohnfortzahlung.letzterTagISO}
            kanton={form.kanton ?? 'BE'}
            stillstandAktiv={false}
            feiertage={false}
            labels={{ ereignis: 'Beginn der Verhinderung', aquo: 'Beginn der Verhinderung', adquem: 'Letzter bezahlter Tag' }}
          />
        )}
        {ergebnisse.kuendigung && (
          <ErgebnisAnzeige titel="B+C – Kündigung & Sperrfristen (Art. 335c / 336c OR)" ergebnis={ergebnisse.kuendigung} />
        )}
        {ergebnisse.kuendigung && <KuendigungTimeline e={ergebnisse.kuendigung} />}
        {ergebnisse.kuendigung?.sperrtage && ergebnisse.kuendigung.sperrtage.length > 0 && (
          <SperrtageZaehler sperrtage={ergebnisse.kuendigung.sperrtage} />
        )}
        <PdfExportButton config={pdfConfig} />
      </div>
    </div>
  );
}
