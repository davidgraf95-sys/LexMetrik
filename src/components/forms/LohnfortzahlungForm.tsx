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
      <label className="block text-body-s font-medium text-ink-700">{label}</label>
      {children}
      {hint && <p className="text-body-s text-ink-500">{hint}</p>}
    </div>
  );
}

const inputCls = 'lc-input';

// §6 Eingabevalidierung
function validiere(f: LohnfortzahlungInput): string[] {
  const fehler: string[] = [];
  if (f.verhinderungBeginn < f.vertragsbeginn) fehler.push('Beginn der Verhinderung liegt vor dem Vertragsbeginn.');
  if (f.verhinderungEnde && f.verhinderungEnde < f.verhinderungBeginn) fehler.push('Ende der Verhinderung liegt vor dem Beginn.');
  if (f.arbeitsunfaehigkeitProzent <= 0 || f.arbeitsunfaehigkeitProzent > 100) fehler.push('Arbeitsunfähigkeit muss zwischen 1 und 100 % liegen.');
  if (f.pensumProzent != null && (f.pensumProzent <= 0 || f.pensumProzent > 100)) fehler.push('Beschäftigungsgrad muss zwischen 1 und 100 % liegen.');
  if (f.monatslohnBrutto != null && f.monatslohnBrutto < 0) fehler.push('Monatslohn darf nicht negativ sein.');
  return fehler;
}

export function LohnfortzahlungForm() {
  const [form, setForm] = useState<LohnfortzahlungInput>(DEFAULTS);
  const [ergebnis, setErgebnis] = useState<Berechnungsergebnis | null>(null);
  const [fehler, setFehler] = useState<string[]>([]);
  const [erweitert, setErweitert] = useState(false);

  const set = <K extends keyof LohnfortzahlungInput>(k: K, v: LohnfortzahlungInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setKtg = (k: keyof NonNullable<LohnfortzahlungInput['ktgKriterien']>, v: number | boolean | undefined) =>
    setForm((f) => ({ ...f, ktgKriterien: { ...f.ktgKriterien, [k]: v } }));

  const berechne = () => {
    const v = validiere(form);
    setFehler(v);
    if (v.length > 0) { setErgebnis(null); return; }
    try {
      setErgebnis(berechneLohnfortzahlung(form));
    } catch (e) {
      console.error(e);
    }
  };

  const eingaben = {
    'Vertragsbeginn': form.vertragsbeginn,
    'Beginn Verhinderung': form.verhinderungBeginn,
    ...(form.verhinderungEnde ? { 'Ende Verhinderung': form.verhinderungEnde } : {}),
    'Arbeitsunfähigkeit': `${form.arbeitsunfaehigkeitProzent} %`,
    ...(form.pensumProzent != null && form.pensumProzent !== 100 ? { 'Pensum': `${form.pensumProzent} %` } : {}),
    'Kanton': form.kanton,
    'KTG gleichwertig': form.ktgGleichwertigVorhanden ? 'Ja' : 'Nein',
    ...(form.monatslohnBrutto ? { 'Monatslohn brutto (CHF)': String(form.monatslohnBrutto) } : {}),
  };

  return (
    <div className="space-y-6">
      {/* Skalen-Hinweis */}
      <div className="lc-notice-warn rounded-md" style={{ padding: '12px 16px', borderLeft: '3px solid var(--warn-500)' }}>
        <p className="lc-overline text-warn-700 mb-1">Wichtiger Hinweis zu den Skalen</p>
        <p className="text-body-s text-warn-700">{SKALEN_HINWEIS}</p>
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

        <Field label="Beschäftigungsgrad / Pensum (%)" hint="Teilzeit; getrennt vom AUF-Grad (SHK N 54)">
          <input
            type="number" min={1} max={100} step={5}
            value={form.pensumProzent ?? 100}
            onChange={(e) => set('pensumProzent', Number(e.target.value))}
            className={inputCls}
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

      {/* §2.6 KTG-Gleichwertigkeits-Checkliste */}
      {form.ktgGleichwertigVorhanden && (
        <div className="lc-card p-4 space-y-3">
          <p className="lc-overline">Gleichwertigkeits-Checkliste (Art. 324a Abs. 4 OR, Orientierung)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Taggeld (% des Lohnes)" hint="Richtwert ≥ 80 %">
              <input type="number" min={0} max={100} className={inputCls}
                value={form.ktgKriterien?.taggeldProzent ?? ''} placeholder="z.B. 80"
                onChange={(e) => setKtg('taggeldProzent', e.target.value ? Number(e.target.value) : undefined)} />
            </Field>
            <Field label="Leistungsdauer (Tage)" hint="Richtwert ≥ 720">
              <input type="number" min={0} className={inputCls}
                value={form.ktgKriterien?.leistungsdauerTage ?? ''} placeholder="z.B. 720"
                onChange={(e) => setKtg('leistungsdauerTage', e.target.value ? Number(e.target.value) : undefined)} />
            </Field>
            <Field label="Karenzfrist (Tage)" hint="max. 3 Tage zulässig">
              <input type="number" min={0} className={inputCls}
                value={form.ktgKriterien?.karenzTage ?? ''} placeholder="z.B. 2"
                onChange={(e) => setKtg('karenzTage', e.target.value ? Number(e.target.value) : undefined)} />
            </Field>
            <Field label="Arbeitgeber-Prämienanteil (%)" hint="mind. 50 %">
              <input type="number" min={0} max={100} className={inputCls}
                value={form.ktgKriterien?.praemienAnteilArbeitgeberProzent ?? ''} placeholder="z.B. 50"
                onChange={(e) => setKtg('praemienAnteilArbeitgeberProzent', e.target.value ? Number(e.target.value) : undefined)} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" checked={form.ktgKriterien?.schriftlichVereinbart ?? false}
              onChange={(e) => setKtg('schriftlichVereinbart', e.target.checked)} />
            Schriftlich / in GAV-NAV vereinbart (Gültigkeitsvoraussetzung)
          </label>
        </div>
      )}

      {/* Erweiterte Eingaben */}
      <div className="border border-line rounded-md overflow-hidden">
        <button type="button" onClick={() => setErweitert(!erweitert)}
          className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-brass-100 text-left">
          <span className="text-body-s font-medium text-ink-700">Erweiterte Eingaben (Anspruch, DJ-übergreifend, Lohnbasis)</span>
          <span className="text-ink-400">{erweitert ? '▲' : '▼'}</span>
        </button>
        {erweitert && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Ende der Verhinderung (optional)" hint="§2.1 für DJ-übergreifende Verhinderung (zwei Kredite)">
              <input type="date" value={form.verhinderungEnde ?? ''} className={inputCls}
                onChange={(e) => set('verhinderungEnde', e.target.value || undefined)} />
            </Field>
            <Field label="Vereinbarte Kündigungsfrist (Monate, optional)" hint="§2.2 > 3 Monate → Anspruch ab Tag 1">
              <input type="number" min={0} className={inputCls} placeholder="Leer = Standard"
                value={form.vereinbarteKuendigungsfristMonate ?? ''}
                onChange={(e) => set('vereinbarteKuendigungsfristMonate', e.target.value ? Number(e.target.value) : undefined)} />
            </Field>
            <Field label="Anrechenbare Vordienstzeit (Monate, optional)" hint="§2.2 Lehre/Praktikum/Folge-Befristung (SHK N 44)">
              <input type="number" min={0} className={inputCls} placeholder="0"
                value={form.anrechenbareVordienstzeitMonate ?? ''}
                onChange={(e) => set('anrechenbareVordienstzeitMonate', e.target.value ? Number(e.target.value) : undefined)} />
            </Field>
            <div className="flex flex-col justify-end gap-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.befristetFest ?? false}
                  onChange={(e) => set('befristetFest', e.target.checked)} />
                Befristeter Vertrag fester Dauer &gt; 3 Monate
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.dreizehnterMonatslohn ?? false}
                  onChange={(e) => set('dreizehnterMonatslohn', e.target.checked)} />
                13. Monatslohn (anteilig) berücksichtigen
              </label>
            </div>
          </div>
        )}
      </div>

      {fehler.length > 0 && (
        <div className="lc-notice-danger rounded-md space-y-1" style={{ padding: '12px 16px', borderLeft: '3px solid var(--danger-500)' }}>
          <p className="lc-overline text-danger-700 mb-1">Eingabefehler</p>
          {fehler.map((f, i) => <p key={i} className="text-body-s text-danger-700">• {f}</p>)}
        </div>
      )}

      <button onClick={berechne} className="lc-btn-primary">Berechnen</button>

      {ergebnis && (
        <div className="space-y-4">
          <ErgebnisAnzeige titel="Lohnfortzahlung (Art. 324a OR)" ergebnis={ergebnis} />
          <PdfExportButton abschnitte={[{ titel: 'Lohnfortzahlung (Art. 324a OR)', ergebnis }]} eingaben={eingaben} />
        </div>
      )}
    </div>
  );
}
