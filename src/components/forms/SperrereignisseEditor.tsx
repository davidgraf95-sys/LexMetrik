import type { Sperrereignis, SperrereignisTyp } from '../../types/legal';
import { DatumsFeld } from '../DatumsFeld';
import { inputCls } from '../vorlagen/ui';

// ─── Geteilter Sperrereignis-Listen-Editor (Art. 336c OR) ───────────────────
//
// Extrahiert aus KuendigungSperrForm (verhaltensneutral, §6/§10, 6.6.2026):
// Markup, Typen-Katalog und die Index-Referenz-Pflege («Rückfall wie
// Ereignis …») leben jetzt genau EINMAL — genutzt vom Sperrfristen-Rechner
// und von der Vorlagen-Maske «Kündigung durch Arbeitgeber:in». Reine
// kontrollierte Darstellung, KEINE Rechtslogik (§3) — gerechnet wird in
// lib/sperrfristen.ts.

export const SPERREREIGNIS_TYPEN: { code: SperrereignisTyp; label: string }[] = [
  { code: 'krankheit_unfall',  label: 'Krankheit / Unfall (Art. 336c Abs. 1 lit. b)' },
  { code: 'schwangerschaft',   label: 'Schwangerschaft / Niederkunft (lit. c)' },
  { code: 'mutterschaftsurlaub_verlaengert', label: 'Verlängerter Mutterschaftsurlaub — Hospitalisierung Neugeborenes (lit. cbis)' },
  { code: 'zusatzurlaub_tod_elternteil',     label: 'Zusatzurlaub der Mutter nach Tod des anderen Elternteils (lit. cter)' },
  { code: 'urlaub_tod_mutter',               label: 'Urlaub des anderen Elternteils nach Tod der Mutter (lit. cquinquies)' },
  { code: 'militaer_zivil',    label: 'Militär / Zivildienst (lit. a)' },
  { code: 'hilfsaktion',       label: 'Hilfsaktion im Ausland (lit. d)' },
  { code: 'betreuungsurlaub',  label: 'Betreuungsurlaub (lit. cquater, Art. 329i OR, max. 6 Monate)' },
];

// Typen mit optionalem Niederkunftsdatum (deterministische Endberechnung lit. c
// bzw. Kappung lit. cter — siehe sperrfristen.ts).
const MIT_NIEDERKUNFT: SperrereignisTyp[] = ['schwangerschaft', 'zusatzurlaub_tod_elternteil'];

/** Beim Entfernen: Index-Referenzen («Rückfall wie Ereignis …») nachführen. */
export function sperrereignisEntfernen(liste: Sperrereignis[], i: number): Sperrereignis[] {
  return liste
    .filter((_, j) => j !== i)
    .map((e) => {
      const ref = e.gleicheUrsacheWieEreignis;
      if (ref == null) return e;
      if (ref === i) return { ...e, gleicheUrsacheWieEreignis: undefined };
      if (ref > i) return { ...e, gleicheUrsacheWieEreignis: ref - 1 };
      return e;
    });
}

export function SperrereignisseEditor({ wert, onChange, hinweis }: {
  wert: Sperrereignis[];
  onChange: (liste: Sperrereignis[]) => void;
  /** Optionaler Zusatz neben dem Titel (z. B. «nur bei Arbeitgeberkündigung relevant»). */
  hinweis?: string;
}) {
  const update = (i: number, patch: Partial<Sperrereignis>) => {
    const list = [...wert];
    list[i] = { ...list[i], ...patch } as Sperrereignis;
    onChange(list);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-body-s font-semibold text-ink-700">
          Sperrereignisse (Art. 336c OR)
          {hinweis && <span className="ml-2 text-xs font-normal text-ink-500">({hinweis})</span>}
        </h4>
        <button
          type="button"
          onClick={() => onChange([...wert, { typ: 'krankheit_unfall', von: '2025-04-01', bis: '2025-05-31' }])}
          className="text-body-s px-3 py-1.5 bg-surface hover:bg-brass-100 text-ink-700 rounded-lg transition-colors"
        >
          + Ereignis
        </button>
      </div>

      {wert.length === 0 && (
        <p className="text-body-s text-ink-500 italic">Keine Sperrereignisse erfasst.</p>
      )}

      {wert.map((e, i) => (
        <div key={i} className="border border-line rounded-lg p-4 bg-surface space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-600">Ereignis {i + 1}</span>
            <button type="button" onClick={() => onChange(sperrereignisEntfernen(wert, i))} className="text-xs text-danger-700 hover:text-danger-700">Entfernen</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-600">Typ</label>
              <select value={e.typ} onChange={(ev) => update(i, { typ: ev.target.value as SperrereignisTyp })} className={inputCls + ' text-xs'}>
                {SPERREREIGNIS_TYPEN.map((t) => <option key={t.code} value={t.code}>{t.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-600">Von</label>
              <DatumsFeld value={e.von} onChange={(v) => update(i, { von: v })} className={inputCls + ' text-xs'} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-600">Bis</label>
              <DatumsFeld value={e.bis} onChange={(v) => update(i, { bis: v })} className={inputCls + ' text-xs'} />
            </div>
          </div>
          {MIT_NIEDERKUNFT.includes(e.typ) && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-600">Niederkunft (optional)</label>
              <DatumsFeld value={e.niederkunft ?? ''} onChange={(v) => update(i, { niederkunft: v })} className={inputCls + ' text-xs'} />
            </div>
          )}
          {e.typ === 'schwangerschaft' && (
            <p className="text-xs text-brass-700">
              «Von»: Beginn der Schwangerschaft. Mit Niederkunftsdatum berechnet der Rechner das Sperrfristende
              selbst (Niederkunft + 112 Tage, Art. 336c Abs. 1 lit. c OR); ohne Datum gilt «Bis» gemäss Eingabe.
            </p>
          )}
          {e.typ === 'mutterschaftsurlaub_verlaengert' && (
            <p className="text-xs text-brass-700">Hospitalisierung des Neugeborenen: Kündigungsschutz bis zum Ende des verlängerten Mutterschaftsurlaubs (Art. 336c Abs. 1 lit. cbis i.V.m. Art. 329f Abs. 2 OR). «Bis» = Ende des verlängerten Urlaubs.</p>
          )}
          {e.typ === 'zusatzurlaub_tod_elternteil' && (
            <p className="text-xs text-brass-700">
              «Von»/«Bis»: Beginn des Urlaubs bis letzter bezogener Urlaubstag (Art. 336c Abs. 1 lit. cter i.V.m.
              Art. 329f Abs. 3 OR). Mit Niederkunftsdatum prüft der Rechner die gesetzliche Kappung
              (längstens 3 Monate ab Ende der lit.-c-Sperrfrist); ohne Datum wird sie nicht geprüft.
            </p>
          )}
          {e.typ === 'urlaub_tod_mutter' && (
            <p className="text-xs text-brass-700">Urlaub des anderen Elternteils nach Tod der Mutter: 14 Wochen ab dem Tag nach dem Tod, an aufeinanderfolgenden Tagen (Art. 336c Abs. 1 lit. cquinquies i.V.m. Art. 329gbis OR).</p>
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
                onChange={(ev) => update(i, { gleicheUrsacheWieEreignis: ev.target.value === '' ? null : Number(ev.target.value) })}
              >
                <option value="">Eigenständige Ursache (eigene Sperrfrist)</option>
                {wert.slice(0, i).map((_, j) => (
                  <option key={j} value={j}>Rückfall wie Ereignis {j + 1} (keine neue Sperrfrist)</option>
                ))}
              </select>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
