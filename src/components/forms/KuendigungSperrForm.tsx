import { Field, inputCls } from '../vorlagen/ui';
import { useState } from 'react';
import type { SperrfristenInput, Sperrereignis, SperrereignisTyp } from '../../types/legal';
import { berechneSperrfristen, type SperrfristenErgebnis } from '../../lib/sperrfristen';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { DatumsFeld } from '../DatumsFeld';
import { PdfExportButton } from '../PdfExport';
import { KuendigungTimeline } from '../KuendigungTimeline';
import { SperrtageZaehler } from '../SperrtageZaehler';

const fmtISO = (s?: string) => (s ? s.split('-').reverse().join('.') : '–');

const DEFAULTS: SperrfristenInput = {
  vertragsbeginn: '2020-01-01',
  zugangKuendigung: '2025-04-15',
  kuendigendePartei: 'arbeitgeber',
  probezeitMonate: 1,
  kuendigungsterminMonatsende: true,
  abweichendeFristFormGueltig: true,
  sperrereignisse: [],
};

// §6 Eingabevalidierung
function validiere(f: SperrfristenInput): string[] {
  const fehler: string[] = [];
  if (f.zugangKuendigung < f.vertragsbeginn) fehler.push('Zugang der Kündigung liegt vor dem Vertragsbeginn.');
  (f.sperrereignisse ?? []).forEach((e, i) => {
    if (e.bis < e.von) fehler.push(`Sperrereignis ${i + 1}: «Bis» liegt vor «Von».`);
  });
  return fehler;
}

const TYPEN: { code: SperrereignisTyp; label: string }[] = [
  { code: 'krankheit_unfall',  label: 'Krankheit / Unfall (Art. 336c Abs. 1 lit. b)' },
  { code: 'schwangerschaft',   label: 'Schwangerschaft / Niederkunft (lit. c)' },
  { code: 'militaer_zivil',    label: 'Militär / Zivildienst (lit. a)' },
  { code: 'hilfsaktion',       label: 'Hilfsaktion im Ausland (lit. d)' },
  { code: 'betreuungsurlaub',  label: 'Betreuungsurlaub (Art. 329i OR, max. 6 Monate)' },
];


export function KuendigungSperrForm() {
  const [form, setForm] = useState<SperrfristenInput>(DEFAULTS);

  const set = <K extends keyof SperrfristenInput>(k: K, v: SperrfristenInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addEreignis = () =>
    setForm((f) => ({
      ...f,
      sperrereignisse: [
        ...(f.sperrereignisse ?? []),
        { typ: 'krankheit_unfall', von: '2025-04-01', bis: '2025-05-31' },
      ],
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
      // Index-Referenzen («Rückfall wie Ereignis …») nachführen: Verweis auf
      // das entfernte Ereignis zurücksetzen, spätere Indizes verschieben.
      sperrereignisse: (f.sperrereignisse ?? [])
        .filter((_, j) => j !== i)
        .map((e) => {
          const ref = e.gleicheUrsacheWieEreignis;
          if (ref == null) return e;
          if (ref === i) return { ...e, gleicheUrsacheWieEreignis: undefined };
          if (ref > i) return { ...e, gleicheUrsacheWieEreignis: ref - 1 };
          return e;
        }),
    }));

  const updateEreignisNum = (i: number, field: 'gleicheUrsacheWieEreignis', val: number | null) =>
    setForm((f) => {
      const list = [...(f.sperrereignisse ?? [])];
      list[i] = { ...list[i], [field]: val } as Sperrereignis;
      return { ...f, sperrereignisse: list };
    });

  // Live-Berechnung – EIN kohärentes Ergebnis (Kündigungsfrist inkl. Sperrfristen).
  const fehler = validiere(form);
  let gesamt: SperrfristenErgebnis | null = null;
  if (fehler.length === 0) {
    try { gesamt = berechneSperrfristen(form); } catch { gesamt = null; }
  }
  const hatEreignisse = (form.sperrereignisse ?? []).length > 0;

  const eingaben = {
    'Vertragsbeginn': form.vertragsbeginn,
    'Zugang Kündigung': form.zugangKuendigung,
    'Kündigende Partei': form.kuendigendePartei === 'arbeitgeber' ? 'Arbeitgeber' : 'Arbeitnehmer',
    'Probezeit (Monate)': String(form.probezeitMonate),
    'Kündigungstermin Monatsende': form.kuendigungsterminMonatsende ? 'Ja' : 'Nein',
    ...(form.abweichendeFristMonate != null ? { 'Abweichende Frist (Monate)': String(form.abweichendeFristMonate) } : {}),
  };

  // PDF: Kündigungs-/Sperrfristen-Disclaimer (GAV einschlägig, Lohnfortzahlungsskalen NICHT).
  const pdfConfig: PdfDocConfig = {
    title: 'Kündigungs- und Sperrfristen',
    rechtsgrundlage: 'Berechnung nach Art. 335c / 336c OR',
    domain: 'arbeitsrecht',
    fileBase: 'Kuendigung-Sperrfristen',
    inputs: eingaben,
    // Ergebnis-Hero aus bereits berechneten Werten (Generik-Gegenprüfung)
    hero: gesamt ? (gesamt.status === 'nichtig'
      ? {
          hauptlabel: 'Frühestens neu kündbar',
          hauptwert: fmtISO(gesamt.fruehesteNeueKuendigungISO),
          nebenwerte: [{ label: 'Beendigungsdatum', wert: '– (keines)' }],
        }
      : {
          hauptlabel: 'Beendigungsdatum',
          hauptwert: fmtISO(gesamt.beendigungISO),
          nebenwerte: [{ label: 'Hemmung', wert: gesamt.gehemmtTage ? `${gesamt.gehemmtTage} Tage` : 'keine' }],
        }) : undefined,
    sections: gesamt ? [{ titel: 'Kündigung & Sperrfristen (Art. 335c / 336c OR)', ergebnis: gesamt }] : [],
    disclaimer:
      'Automatisierte Orientierungsberechnung zu Kündigungs- und Sperrfristen (Art. 335c / 336c OR) – ' +
      'keine Rechtsberatung. Massgeblich sind GAV, Einzelvertrag und der konkrete Sachverhalt; abweichende ' +
      'Regelungen gehen vor. Norm- und Rechtsprechungsverweise sind im Einzelfall zu prüfen.',
  };

  return (
    <div className="space-y-6">
      <p className="lc-overline">Eingaben</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Vertragsbeginn">
          <DatumsFeld value={form.vertragsbeginn} onChange={(v) => set('vertragsbeginn', v)} className={inputCls} />
        </Field>

        <Field label="Zugang der Kündigung (Empfänger)" hint="Stichtag für Dienstjahr und Sperrfrist-Prüfung">
          <DatumsFeld value={form.zugangKuendigung} onChange={(v) => set('zugangKuendigung', v)} className={inputCls} />
        </Field>

        <Field label="Kündigende Partei">
          <select value={form.kuendigendePartei} onChange={(e) => set('kuendigendePartei', e.target.value as 'arbeitgeber' | 'arbeitnehmer')} className={inputCls}>
            <option value="arbeitgeber">Arbeitgeber</option>
            <option value="arbeitnehmer">Arbeitnehmer</option>
          </select>
        </Field>

        <Field label="Probezeit (Monate)" hint="0 = keine Probezeit, max. 3 Monate">
          <input
            type="number" min={0} max={3} step={1}
            value={form.probezeitMonate}
            onChange={(e) => set('probezeitMonate', Number(e.target.value))}
            className={inputCls}
          />
        </Field>

        <Field label="Abweichende Frist (Monate, optional)" hint="§3.2 schriftlich/GAV; ≥ 1 Monat gilt (auch kürzer)">
          <input
            type="number" min={0} step={0.5}
            value={form.abweichendeFristMonate ?? ''}
            onChange={(e) => set('abweichendeFristMonate', e.target.value ? Number(e.target.value) : undefined)}
            className={inputCls}
            placeholder="Leer = gesetzliche Frist"
          />
        </Field>

        {form.abweichendeFristMonate != null && (
          <Field label="Abweichende Frist – Gültigkeit (§3.2)">
            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-center gap-2 text-body-s cursor-pointer">
                <input type="checkbox" checked={form.abweichendeFristFormGueltig ?? false}
                  onChange={(e) => set('abweichendeFristFormGueltig', e.target.checked)} />
                Schriftlich / GAV / NAV (Gültigkeitsvoraussetzung)
              </label>
              <label className="flex items-center gap-2 text-body-s cursor-pointer">
                <input type="checkbox" checked={form.abweichendeFristQuelleGAV ?? false}
                  onChange={(e) => set('abweichendeFristQuelleGAV', e.target.checked)} />
                Quelle GAV (Verkürzung &lt; 1 Monat nur GAV &amp; 1. DJ)
              </label>
            </div>
          </Field>
        )}

        {form.kuendigendePartei === 'arbeitgeber' && (
          <Field label="Vaterschaftsurlaub – nicht bezogene Tage (optional)" hint="§3.4 Art. 335c Abs. 3 OR, verlängert die Frist">
            <input
              type="number" min={0} step={1}
              value={form.vaterschaftsurlaubResttage ?? ''}
              onChange={(e) => set('vaterschaftsurlaubResttage', e.target.value ? Number(e.target.value) : undefined)}
              className={inputCls}
              placeholder="0"
            />
          </Field>
        )}

        <Field label="Kündigungstermin">
          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-body-s cursor-pointer">
              <input type="radio" name="kterm" checked={form.kuendigungsterminMonatsende} onChange={() => set('kuendigungsterminMonatsende', true)} />
              Monatsende (Standard)
            </label>
            <label className="flex items-center gap-2 text-body-s cursor-pointer">
              <input type="radio" name="kterm" checked={!form.kuendigungsterminMonatsende} onChange={() => set('kuendigungsterminMonatsende', false)} />
              Freies Datum
            </label>
          </div>
        </Field>
      </div>

      {/* Sperrereignisse */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-body-s font-semibold text-ink-700">
            Sperrereignisse (Art. 336c OR)
            {form.kuendigendePartei === 'arbeitnehmer' && (
              <span className="ml-2 text-xs font-normal text-ink-500">(nur bei Arbeitgeberkündigung relevant)</span>
            )}
          </h4>
          <button
            onClick={addEreignis}
            className="text-body-s px-3 py-1.5 bg-surface hover:bg-brass-100 text-ink-700 rounded-lg transition-colors"
          >
            + Ereignis
          </button>
        </div>

        {(form.sperrereignisse ?? []).length === 0 && (
          <p className="text-body-s text-ink-500 italic">Keine Sperrereignisse erfasst.</p>
        )}

        {(form.sperrereignisse ?? []).map((e, i) => (
          <div key={i} className="border border-line rounded-lg p-4 bg-surface space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-600">Ereignis {i + 1}</span>
              <button type="button" onClick={() => removeEreignis(i)} className="text-xs text-danger-700 hover:text-danger-700">Entfernen</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            </div>
            {e.typ === 'schwangerschaft' && (
              <p className="text-xs text-brass-700">«Von»: Beginn der Schwangerschaft. «Bis»: 16 Wochen (112 Tage) nach Niederkunft (Art. 336c Abs. 1 lit. c OR).</p>
            )}
            {e.typ === 'militaer_zivil' && (
              <p className="text-xs text-brass-700">Bei Dauer &gt; 11 Tage wird die Sperrfrist automatisch je 4 Wochen davor und danach erweitert (Art. 336c Abs. 1 lit. a OR).</p>
            )}
            {e.typ === 'krankheit_unfall' && i > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-600">Rückfall derselben Ursache wie … (§1.3)</label>
                <select
                  className={inputCls + ' text-xs'}
                  value={e.gleicheUrsacheWieEreignis ?? ''}
                  onChange={(ev) => updateEreignisNum(i, 'gleicheUrsacheWieEreignis', ev.target.value === '' ? null : Number(ev.target.value))}
                >
                  <option value="">Eigenständige Ursache (eigene Sperrfrist)</option>
                  {(form.sperrereignisse ?? []).slice(0, i).map((_, j) => (
                    <option key={j} value={j}>Rückfall wie Ereignis {j + 1} (keine neue Sperrfrist)</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>

      {fehler.length > 0 && (
        <div className="rounded-lg border border-line bg-danger-bg p-4 space-y-1">
          <p className="text-xs font-semibold text-danger-700 uppercase tracking-wide mb-1">Eingabefehler</p>
          {fehler.map((f, i) => <p key={i} className="text-body-s text-danger-700">• {f}</p>)}
        </div>
      )}

      {gesamt && (
        <div className="space-y-4">
          <p className="lc-live lc-overline text-ink-500 normal-case" style={{ letterSpacing: '0.04em' }}>Live-Berechnung – aktualisiert sich automatisch</p>

          {/* Prominente Eckdaten – ein kohärentes Ergebnis */}
          {gesamt.status === 'nichtig' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="lc-tile border-t-[3px] border-t-danger-500">
                <p className="lc-overline mb-1">Status</p>
                <p className="text-h2 leading-none font-semibold text-danger-700">NICHTIG</p>
              </div>
              <div className="lc-tile">
                <p className="lc-overline mb-1">Beendigungsdatum</p>
                <p className="num text-body-l text-ink-500">– (keines)</p>
              </div>
              <div className="lc-tile">
                <p className="lc-overline mb-1">Frühestens neu kündbar</p>
                <p className="num text-body-l text-ink-900">{fmtISO(gesamt.fruehesteNeueKuendigungISO)}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="lc-tile">
                <p className="lc-overline mb-1">Status</p>
                <p className="text-body-l font-semibold text-sage-700">Gültig</p>
              </div>
              <div className="lc-tile">
                <p className="lc-overline mb-1">Beendigungsdatum</p>
                <p className="num text-h2 leading-none font-medium text-ink-900">{fmtISO(gesamt.beendigungISO)}</p>
              </div>
              <div className="lc-tile">
                <p className="lc-overline mb-1">Hemmung</p>
                <p className="num text-body-l text-ink-900">{gesamt.gehemmtTage ? `${gesamt.gehemmtTage} Tage` : 'keine'}</p>
              </div>
            </div>
          )}

          {/* Querverbindung (nur informativ, bei Sperrereignissen) */}
          {hatEreignisse && (
            <div className="lc-notice">
              <p className="lc-overline mb-1">Querverbindung: Art. 336c ↔ Art. 324a</p>
              <p className="text-body-s text-ink-600">
                Sperrfrist (Art. 336c OR) und Lohnfortzahlung (Art. 324a OR) sind <strong>voneinander unabhängig</strong>:
                Eine Sperrfrist von z.B. 90 Tagen bedeutet nicht 90 Tage Lohnfortzahlung. Beide sind separat zu prüfen (Modul A).
              </p>
            </div>
          )}

          <KuendigungTimeline e={gesamt} />
          {gesamt.sperrtage && gesamt.sperrtage.length > 0 && <SperrtageZaehler sperrtage={gesamt.sperrtage} />}
          <ErgebnisAnzeige titel="Kündigung & Sperrfristen (Art. 335c / 336c OR)" ergebnis={gesamt} />
          <PdfExportButton config={pdfConfig} />
        </div>
      )}
    </div>
  );
}
