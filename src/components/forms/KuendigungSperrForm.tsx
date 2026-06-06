import { FehlerBox, Field, LiveHeader, inputCls } from '../vorlagen/ui';
import { PflichtDisclaimer } from '../PflichtDisclaimer';
import { useState } from 'react';
import type { SperrfristenInput } from '../../types/legal';
import { berechneSperrfristen, type SperrfristenErgebnis } from '../../lib/sperrfristen';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { DatumsFeld } from '../DatumsFeld';
import { PdfExportButton } from '../PdfExport';
import { AktenzeichenFeld } from '../AktenzeichenFeld';
import { BegruendungAbsatz } from '../BegruendungAbsatz';
import { begruendungsAbsatz } from '../../lib/begruendung';
import { LinkTeilenButton } from '../LinkTeilenButton';
import { permalinkKodieren, permalinkLesen } from '../../lib/permalink';
import { KSP_LINK_SPEC } from '../../lib/rechnerPermalinks';
import { IcsExportButton } from '../IcsExportButton';
import { KuendigungTimeline } from '../KuendigungTimeline';
import { SperrtageZaehler } from '../SperrtageZaehler';
import { SperrereignisseEditor } from './SperrereignisseEditor';

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

// Typen-Katalog + Editor-Markup leben seit 6.6.2026 im geteilten
// SperrereignisseEditor (§10) — genutzt auch von der Vorlagen-Maske
// «Kündigung durch Arbeitgeber:in».

export function KuendigungSperrForm() {
  const [form, setForm] = useState<SperrfristenInput>(() => {
    try { return { ...DEFAULTS, ...permalinkLesen(KSP_LINK_SPEC, window.location.search) }; }
    catch { return DEFAULTS; }
  });

  const set = <K extends keyof SperrfristenInput>(k: K, v: SperrfristenInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

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
  // FAHRPLAN-PRAXIS 1.2: Mandats-Referenz für den PDF-Kopf (optional).
  const [aktenzeichen, setAktenzeichen] = useState('');
  const pdfConfig: PdfDocConfig = {
    aktenzeichen: aktenzeichen.trim() || undefined,
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
      <PflichtDisclaimer />
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
            type="number" inputMode="decimal" min={0} max={3} step={1}
            value={form.probezeitMonate}
            onChange={(e) => set('probezeitMonate', Number(e.target.value))}
            className={inputCls}
          />
        </Field>

        <Field label="Abweichende Frist (Monate, optional)" hint="§3.2 schriftlich/GAV; ≥ 1 Monat gilt (auch kürzer)">
          <input
            type="number" inputMode="decimal" min={0} step={0.5}
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
              type="number" inputMode="decimal" min={0} step={1}
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

      {/* Sperrereignisse — geteilter Editor (verhaltensneutral extrahiert, §10) */}
      <SperrereignisseEditor
        wert={form.sperrereignisse ?? []}
        onChange={(liste) => set('sperrereignisse', liste)}
        hinweis={form.kuendigendePartei === 'arbeitnehmer' ? 'nur bei Arbeitgeberkündigung relevant' : undefined}
      />

      <FehlerBox fehler={fehler} />

      {gesamt && (
        <div className="space-y-4">
          <LiveHeader />

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
          {gesamt && <BegruendungAbsatz text={begruendungsAbsatz(gesamt)} />}
          <AktenzeichenFeld value={aktenzeichen} onChange={setAktenzeichen} />
          <div className="flex flex-wrap items-center gap-3">
            <PdfExportButton config={pdfConfig} />
            <LinkTeilenButton query={() => permalinkKodieren(KSP_LINK_SPEC, form as SperrfristenInput & Record<string, unknown>)} />
            {gesamt.status === 'nichtig'
              ? <IcsExportButton endISO={gesamt.fruehesteNeueKuendigungISO} titel="Frühestens neu kündbar (Art. 336c OR)"
                  beschreibung={gesamt.ergebnis} dateiName="Neue-Kuendigung-fruehestens.ics" />
              : <IcsExportButton endISO={gesamt.beendigungISO} titel="Beendigung Arbeitsverhältnis"
                  beschreibung={gesamt.ergebnis} dateiName="Beendigung-Arbeitsverhaeltnis.ics" />}
          </div>
        </div>
      )}
    </div>
  );
}
