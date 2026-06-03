import { useState } from 'react';
import type { Kanton } from '../../types/legal';
import type { ZpoInput, ZpoEinheit, ZpoVerfahren, ZpoFristnatur, ZpoZustellart, ZpoModus, ZpoErgebnis } from '../../types/zpo';
import { berechneFrist, zustellfiktion } from '../../lib/zpoFristen';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { PdfExportButton } from '../PdfExport';

const KANTONE: Kanton[] = ['ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL', 'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU'];

const EINHEITEN: { code: ZpoEinheit; label: string }[] = [
  { code: 'tage', label: 'Tage' },
  { code: 'wochen', label: 'Wochen' },
  { code: 'monate', label: 'Monate' },
  { code: 'jahre', label: 'Jahre' },
];

const VERFAHREN: { code: ZpoVerfahren; label: string; stillstand: boolean }[] = [
  { code: 'ordentlich', label: 'Ordentliches Verfahren', stillstand: true },
  { code: 'vereinfacht', label: 'Vereinfachtes Verfahren', stillstand: true },
  { code: 'familienrecht', label: 'Familienrechtliches Verfahren (nicht summarisch)', stillstand: true },
  { code: 'klagefrist_klagebewilligung', label: 'Klagefrist nach Klagebewilligung (Art. 209)', stillstand: true },
  { code: 'schlichtung', label: 'Schlichtungsverfahren', stillstand: false },
  { code: 'summarisch', label: 'Summarisches Verfahren', stillstand: false },
  { code: 'rechtsmittel_summarisch', label: 'Rechtsmittel gegen summarischen Entscheid', stillstand: false },
];

const DISCLAIMER =
  'Dieser Fristenrechner ist eine rechnerische Orientierungshilfe auf Grundlage der Art. 142–147 ZPO und stellt ' +
  'keine Rechtsberatung und keine verbindliche Fristberechnung dar. Die Berechnung folgt der bundesgerichtlichen ' +
  'Praxis (BGer 5A_691/2023 vom 13.8.2024); einzelne Auslegungsfragen sind in Lehre und Rechtsprechung umstritten. ' +
  'Kantonale und lokale Feiertage sowie die konkrete Verfahrensart sind eigenständig zu prüfen. Massgeblich ist der ' +
  'Sitz des Gerichts (Gerichtsort). Eine verpasste Frist kann nur unter den Voraussetzungen von Art. 148 ZPO ' +
  'wiederhergestellt werden. Für die Fristwahrung im Einzelfall ist allein die nutzende Person verantwortlich.';

const DEFAULTS: ZpoInput = {
  ereignis: '2025-01-15',
  einheit: 'tage',
  laenge: 30,
  verfahren: 'ordentlich',
  kanton: 'ZH',
  fristnatur: 'gesetzlich',
  zustellart: 'empfangsbestaetigung',
  modus: 'bundesgericht',
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

export function ZpoFristenForm() {
  const [form, setForm] = useState<ZpoInput>(DEFAULTS);
  const [ergebnis, setErgebnis] = useState<ZpoErgebnis | null>(null);
  const [fehler, setFehler] = useState<string[]>([]);
  const [erweitert, setErweitert] = useState(false);
  const [fiktionDatum, setFiktionDatum] = useState('');
  const [erstreckungAn, setErstreckungAn] = useState(false);
  const [erstreckung, setErstreckung] = useState<{ einheit: 'tage' | 'wochen'; laenge: number }>({ einheit: 'tage', laenge: 10 });

  const set = <K extends keyof ZpoInput>(k: K, v: ZpoInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const validiere = (f: ZpoInput): string[] => {
    const e: string[] = [];
    if (!Number.isInteger(f.laenge) || f.laenge <= 0) e.push('Fristlänge muss eine ganze Zahl > 0 sein.');
    if (!f.ereignis) e.push('Bitte ein auslösendes Ereignis (Datum) angeben.');
    return e;
  };

  const berechne = () => {
    const eingabe: ZpoInput = {
      ...form,
      erstreckung: erstreckungAn && form.fristnatur === 'gerichtlich' ? erstreckung : undefined,
    };
    const v = validiere(eingabe);
    setFehler(v);
    if (v.length > 0) { setErgebnis(null); return; }
    try {
      setErgebnis(berechneFrist(eingabe));
    } catch (err) {
      setFehler([(err as Error).message]);
      setErgebnis(null);
    }
  };

  const aktVerfahren = VERFAHREN.find((v) => v.code === form.verfahren)!;

  const eingaben: Record<string, string> = {
    'Auslösendes Ereignis': form.ereignis,
    'Frist': `${form.laenge} ${form.einheit}`,
    'Verfahrensart': aktVerfahren.label,
    'Gerichtsort (Kanton)': form.kanton,
    'Fristnatur': form.fristnatur === 'gesetzlich' ? 'gesetzlich' : 'gerichtlich',
    'Berechnungsmodus': form.modus === 'mindermeinung' ? 'Mindermeinung' : 'bundesgerichtliche Praxis',
  };

  return (
    <div className="space-y-6">
      {/* Pflicht-Disclaimer (Ziff. 9) – immer sichtbar */}
      <div className="rounded-lg border border-line bg-danger-bg p-4">
        <p className="text-xs font-semibold text-danger-700 uppercase tracking-wide mb-1">Wichtiger Hinweis – keine Rechtsberatung</p>
        <p className="text-sm text-danger-700">{DISCLAIMER}</p>
      </div>

      {/* Geltungsbereich-Hinweis */}
      <div className="rounded-lg border border-line bg-surface p-4">
        <p className="text-xs font-semibold text-brass-700 uppercase tracking-wide mb-1">Geltungsbereich</p>
        <p className="text-sm text-ink-700">
          Prozessuale Fristen der ZPO (Art. 142 ff.). <strong>Nicht</strong> anwendbar auf materielle Klage-/Verwirkungsfristen
          des Bundeszivilrechts (z.B. Art. 75, 521/533 ZGB, Art. 706a OR – diese folgen der Rechtshängigkeit, Art. 64 Abs. 2 ZPO).
          Massgeblich ist der <strong>Gerichtsort</strong> (Sitz des Gerichts), nicht der Wohnsitz der Partei/Vertretung.
        </p>
      </div>

      {/* Eingaben */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Auslösendes Ereignis (Datum)" hint="Zustellung/Eröffnung der fristauslösenden Mitteilung">
          <input type="date" value={form.ereignis} onChange={(e) => set('ereignis', e.target.value)} className={inputCls} />
        </Field>

        <Field label="Fristtyp & Länge">
          <div className="flex gap-2">
            <input type="number" min={1} step={1} value={form.laenge}
              onChange={(e) => set('laenge', Number(e.target.value))} className={inputCls + ' w-24'} />
            <select value={form.einheit} onChange={(e) => set('einheit', e.target.value as ZpoEinheit)} className={inputCls}>
              {EINHEITEN.map((u) => <option key={u.code} value={u.code}>{u.label}</option>)}
            </select>
          </div>
        </Field>

        <Field label="Verfahrensart" hint={`Fristenstillstand: ${aktVerfahren.stillstand ? 'gilt' : 'gilt nicht'} (Art. 145 Abs. 2 ZPO)`}>
          <select value={form.verfahren} onChange={(e) => set('verfahren', e.target.value as ZpoVerfahren)} className={inputCls}>
            {VERFAHREN.map((v) => <option key={v.code} value={v.code}>{v.label}</option>)}
          </select>
        </Field>

        <Field label="Gerichtsort (Kanton)" hint="Sitz des Gerichts – massgeblich für Feiertage (Art. 142 Abs. 3)">
          <select value={form.kanton} onChange={(e) => set('kanton', e.target.value as Kanton)} className={inputCls}>
            {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>

        <Field label="Fristnatur" hint="Steuert den Erstreckbarkeits-Hinweis (Art. 144 ZPO)">
          <select value={form.fristnatur} onChange={(e) => set('fristnatur', e.target.value as ZpoFristnatur)} className={inputCls}>
            <option value="gesetzlich">Gesetzliche Frist</option>
            <option value="gerichtlich">Gerichtliche Frist</option>
          </select>
        </Field>

        <Field label="Zustellart (optional)" hint="Art. 142 Abs. 1bis ZPO">
          <select value={form.zustellart} onChange={(e) => set('zustellart', e.target.value as ZpoZustellart)} className={inputCls}>
            <option value="empfangsbestaetigung">Gegen Empfangsbestätigung (eingeschrieben/GU)</option>
            <option value="gewoehnliche_post">Gewöhnliche Post (A-/B-Post)</option>
          </select>
        </Field>
      </div>

      {/* Optionale / erweiterte Funktionen */}
      <div className="border border-line rounded-lg overflow-hidden">
        <button type="button" onClick={() => setErweitert(!erweitert)}
          className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-surface text-left">
          <span className="text-sm font-medium text-ink-700">Optionale Funktionen (Berechnungsmodus, Erstreckung, Zustellfiktion)</span>
          <span className="text-ink-400">{erweitert ? '▲' : '▼'}</span>
        </button>
        {erweitert && (
          <div className="p-4 space-y-4">
            <Field label="Berechnungsmodus (Wochen-/Monats-/Jahresfrist)" hint="[UMSTRITTEN] – Default folgt dem Bundesgericht">
              <select value={form.modus} onChange={(e) => set('modus', e.target.value as ZpoModus)} className={inputCls}>
                <option value="bundesgericht">Bundesgerichtliche Praxis (dies a quo = Ereignistag)</option>
                <option value="mindermeinung">Mindermeinung (dies a quo = Folgetag) – Fristrisiko</option>
              </select>
            </Field>

            {form.fristnatur === 'gerichtlich' && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={erstreckungAn} onChange={(e) => setErstreckungAn(e.target.checked)} />
                  Erstreckung berechnen (Art. 144 Abs. 2 ZPO)
                </label>
                {erstreckungAn && (
                  <div className="flex gap-2 items-center">
                    <input type="number" min={1} value={erstreckung.laenge}
                      onChange={(e) => setErstreckung((s) => ({ ...s, laenge: Number(e.target.value) }))} className={inputCls + ' w-24'} />
                    <select value={erstreckung.einheit}
                      onChange={(e) => setErstreckung((s) => ({ ...s, einheit: e.target.value as 'tage' | 'wochen' }))} className={inputCls + ' w-40'}>
                      <option value="tage">Tage</option>
                      <option value="wochen">Wochen</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <Field label="Zustellfiktion-Helfer (Art. 138 Abs. 3 lit. a, optional)" hint="Datum des erfolglosen Zustellversuchs → fingiertes Zustelldatum (+7 Tage)">
              <div className="flex gap-2 items-center">
                <input type="date" value={fiktionDatum} onChange={(e) => setFiktionDatum(e.target.value)} className={inputCls} />
                <button type="button" disabled={!fiktionDatum}
                  onClick={() => set('ereignis', zustellfiktion(fiktionDatum))}
                  className="text-sm px-3 py-2 bg-surface hover:bg-brass-100 disabled:opacity-50 text-ink-700 rounded-lg whitespace-nowrap">
                  → als Ereignis übernehmen
                </button>
              </div>
            </Field>
          </div>
        )}
      </div>

      {fehler.length > 0 && (
        <div className="rounded-lg border border-line bg-danger-bg p-4 space-y-1">
          <p className="text-xs font-semibold text-danger-700 uppercase tracking-wide mb-1">Eingabefehler</p>
          {fehler.map((f, i) => <p key={i} className="text-sm text-danger-700">• {f}</p>)}
        </div>
      )}

      <button onClick={berechne}
        className="px-6 py-2.5 bg-ink-900 hover:bg-ink-700 text-paper text-sm font-medium rounded-lg transition-colors">
        Frist berechnen
      </button>

      {ergebnis && (
        <div className="space-y-4">
          {/* Prominente Eckdaten */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Massgeblicher Ereignistag', val: ergebnis.massgeblicherEreignistag },
              { label: 'Fristbeginn (dies a quo)', val: ergebnis.diesAQuo },
              { label: 'Fristende (dies ad quem)', val: `${ergebnis.diesAdQuem} · 24.00 Uhr` },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-line bg-surface-raised p-4">
                <p className="text-xs text-ink-500 mb-1">{c.label}</p>
                <p className="text-lg font-semibold text-ink-900">{c.val}</p>
              </div>
            ))}
          </div>
          {ergebnis.erstrecktBis && (
            <div className="rounded-lg border border-line bg-sage-bg p-3 text-sm text-sage-700">
              Nach Erstreckung: <strong>{ergebnis.erstrecktBis}</strong> (24.00 Uhr).
            </div>
          )}
          <ErgebnisAnzeige titel="ZPO-Fristberechnung (Art. 142 ff. ZPO)" ergebnis={ergebnis} />
          <PdfExportButton abschnitte={[{ titel: 'ZPO-Fristberechnung (Art. 142 ff. ZPO)', ergebnis }]} eingaben={eingaben} />
        </div>
      )}
    </div>
  );
}
