import { useState } from 'react';
import { EckdatenKachel, ErgebnisSprung, Field, LiveHeader, inputCls } from '../vorlagen/ui';
import { SelectionGrid } from '../ui/SelectionGrid';
import { KANTONE } from '../../lib/kantone';
import type { Kanton } from '../../types/legal';
import {
  bestimmeStrafZustaendigkeit,
  type StrafInput, type StrafKaskade32, type StrafSpezialforum, type StrafTatortLage, type StrafBeteiligung,
} from '../../lib/strafZustaendigkeit';
import { staatsanwaltschaftFuer, BUNDESANWALTSCHAFT } from '../../data/staatsanwaltschaften';

// ─── Rechtsweg «Straf» — UI-Teil des Zuständigkeitsrechners ─────────────────
// Task 7b (6.6.2026). Reine Darstellung (§3): Bundesrecht in
// lib/strafZustaendigkeit.ts, Behörden in data/staatsanwaltschaften.ts.
// Gleiche Bausteine wie Zivil/SchKG (einheitliches Design).

const ANLIEGEN = [
  { code: 'anzeige' as const, label: 'Strafanzeige erstatten', sub: 'Wo und wie anzeigen? (Art. 301 StPO)' },
  { code: 'gerichtsstand' as const, label: 'Gerichtsstand prüfen', sub: 'Welcher Kanton verfolgt? (Art. 31–42 StPO)' },
];

const TATORT: { code: StrafTatortLage; label: string }[] = [
  { code: 'bekannt', label: 'Tatort in der Schweiz bekannt (Begehungsort)' },
  { code: 'nur_erfolgsort', label: 'Nur der Erfolg trat in der Schweiz ein' },
  { code: 'mehrere_orte', label: 'Tat/Erfolg an mehreren Orten' },
  { code: 'ausland_oder_ungewiss', label: 'Tat im Ausland oder Tatort ungewiss' },
];

const KASKADE: { code: StrafKaskade32; label: string }[] = [
  { code: 'wohnsitz', label: 'Beschuldigte Person hat Wohnsitz in der Schweiz' },
  { code: 'aufenthalt', label: 'Kein Wohnsitz, aber gewöhnlicher Aufenthalt in der Schweiz' },
  { code: 'heimatort', label: 'Weder Wohnsitz noch gewöhnlicher Aufenthalt — Heimatort in der Schweiz' },
  { code: 'ergreifungsort', label: 'Weder Wohnsitz noch Heimatort — Ort der Ergreifung' },
  { code: 'auslieferung', label: 'Ergreifung im Ausland — Auslieferungskanton' },
];

const SPEZIAL: { code: StrafSpezialforum; label: string }[] = [
  { code: 'kein', label: 'Kein Spezialforum' },
  { code: 'medien', label: 'Medienstraftat (Art. 35 StPO)' },
  { code: 'schkg_delikt', label: 'Konkurs-/Betreibungsdelikt (Art. 36 Abs. 1)' },
  { code: 'unternehmen', label: 'Unternehmensstrafbarkeit (Art. 36 Abs. 2)' },
  { code: 'einziehung', label: 'Selbstständige Einziehung (Art. 37)' },
];

const BETEILIGUNG: { code: StrafBeteiligung; label: string }[] = [
  { code: 'allein', label: 'Einzeltäterschaft' },
  { code: 'teilnehmer', label: 'Anstiftung/Gehilfenschaft (Teilnahme)' },
  { code: 'mittaeter', label: 'Mehrere Mittäter' },
];

export function StrafZustaendigkeitTeil() {
  const [anliegen, setAnliegen] = useState<StrafInput['anliegen']>('anzeige');
  const [tatort, setTatort] = useState<StrafTatortLage>('bekannt');
  const [kaskade, setKaskade] = useState<StrafKaskade32>('wohnsitz');
  const [spezial, setSpezial] = useState<StrafSpezialforum>('kein');
  const [beteiligung, setBeteiligung] = useState<StrafBeteiligung>('allein');
  const [mehrereTaten, setMehrereTaten] = useState(false);
  const [antragsdelikt, setAntragsdelikt] = useState(false);
  const [uebertretung, setUebertretung] = useState(false);
  const [bund, setBund] = useState(false);
  const [kanton, setKanton] = useState<Kanton | ''>('');

  const r = bestimmeStrafZustaendigkeit({
    anliegen, tatort, kaskade32: kaskade, spezialforum: spezial,
    beteiligung, mehrereTatenVerschOrte: mehrereTaten,
    antragsdelikt, uebertretung, moeglichesBundesdelikt: bund,
  });
  const sta = kanton !== '' ? staatsanwaltschaftFuer(kanton) : null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="lc-overline">2 · Worum geht es?</p>
        <SelectionGrid
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          items={ANLIEGEN}
          value={anliegen}
          onSelect={setAnliegen}
        />
      </div>

      <div className="space-y-2">
        <p className="lc-overline">3 · Konstellation</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tatort-Lage" hint="Grundsatz: Behörden des Begehungsortes (Art. 31 StPO)">
            <select className={inputCls} value={tatort} onChange={(e) => setTatort(e.target.value as StrafTatortLage)}>
              {TATORT.map((t) => <option key={t.code} value={t.code}>{t.label}</option>)}
            </select>
          </Field>
          {tatort === 'ausland_oder_ungewiss' && (
            <Field label="Kaskade (Art. 32 StPO)">
              <select className={inputCls} value={kaskade} onChange={(e) => setKaskade(e.target.value as StrafKaskade32)}>
                {KASKADE.map((k) => <option key={k.code} value={k.code}>{k.label}</option>)}
              </select>
            </Field>
          )}
          <Field label="Spezialforum" hint="geht dem Tatort-Grundsatz vor">
            <select className={inputCls} value={spezial} onChange={(e) => setSpezial(e.target.value as StrafSpezialforum)}>
              {SPEZIAL.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Beteiligung">
            <select className={inputCls} value={beteiligung} onChange={(e) => setBeteiligung(e.target.value as StrafBeteiligung)}>
              {BETEILIGUNG.map((b) => <option key={b.code} value={b.code}>{b.label}</option>)}
            </select>
          </Field>
          <Field label="Kanton des Forums (für die konkrete Behörde)" hint="ergibt sich aus dem bestimmten Forum">
            <select className={inputCls} value={kanton} onChange={(e) => setKanton(e.target.value as Kanton | '')}>
              <option value="">– wählen –</option>
              {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" checked={mehrereTaten} onChange={(e) => setMehrereTaten(e.target.checked)} />
            Mehrere Taten an verschiedenen Orten (Art. 34)
          </label>
          <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" checked={antragsdelikt} onChange={(e) => setAntragsdelikt(e.target.checked)} />
            Antragsdelikt (z. B. einfache Körperverletzung, Hausfriedensbruch)
          </label>
          <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" checked={uebertretung} onChange={(e) => setUebertretung(e.target.checked)} />
            Übertretung (Busse)
          </label>
          <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" checked={bund} onChange={(e) => setBund(e.target.checked)} />
            Möglicher Bund-Katalogfall (Art. 23/24)
          </label>
        </div>
      </div>

      <div id="lc-ergebnis" className="lc-reveal space-y-4" aria-live="polite">
        <ErgebnisSprung zielId="lc-ergebnis" />
        <LiveHeader />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <EckdatenKachel label="Forum" wert={r.forum.normen[0]?.artikel ?? '—'} sub="örtliche Anknüpfung" />
          <EckdatenKachel label="Behörde" wert={uebertretung ? 'StA / Übertretungsbehörde' : 'Staatsanwaltschaft'} />
          <EckdatenKachel label="Kritische Fristen" wert={String(r.fristen.filter((f) => f.kritisch).length)} sub={r.fristen.find((f) => f.kritisch)?.frist} />
        </div>

        <div className="lc-card p-5 space-y-3">
          <p className="lc-overline">Ihr Fahrplan</p>
          <ol className="space-y-2.5">
            {r.fahrplan.map((s, i) => (
              <li key={s.titel} className="flex gap-3">
                <span aria-hidden className="shrink-0 w-6 h-6 rounded-full bg-brass-100 text-brass-700 inline-flex items-center justify-center text-xs font-semibold num">{i + 1}</span>
                <span>
                  <span className="block text-body-s font-medium text-ink-900">{s.titel}</span>
                  <span className="block text-body-s text-ink-600">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="lc-card p-5 space-y-3">
          <p className="lc-overline">Örtliches Forum</p>
          <p className="text-body-s text-ink-900">{r.forum.text}.</p>
          <p className="text-body-s text-ink-700">{r.behoerdeTyp}.</p>
          {bund ? (
            <div className="border-t border-line pt-3">
              <p className="lc-overline mb-1.5">Bundesanwaltschaft (bei Bundesgerichtsbarkeit)</p>
              <p className="text-body-s text-ink-900 whitespace-pre-line">{BUNDESANWALTSCHAFT.name}{'\n'}{BUNDESANWALTSCHAFT.strasse}{'\n'}{BUNDESANWALTSCHAFT.plzOrt}</p>
              <p className="text-xs text-ink-500 mt-1">{BUNDESANWALTSCHAFT.hinweis}.</p>
            </div>
          ) : sta ? (
            <div className="border-t border-line pt-3">
              <p className="lc-overline mb-1.5">Zentrale Staatsanwaltschaft ({kanton})</p>
              <p className="text-body-s text-ink-900 whitespace-pre-line">{sta.name}{'\n'}{sta.strasse}{'\n'}{sta.plzOrt}</p>
              {sta.hinweis && <p className="text-xs text-ink-500 mt-1">{sta.hinweis}.</p>}
              <p className="text-xs text-ink-500 mt-1.5">Quelle: zweifach geprüftes Strafbehörden-Dossier (Stand 5.6.2026) — fachliche Abnahme ausstehend; Adresse vor Einreichung kurz gegenprüfen.</p>
            </div>
          ) : (
            <p className="text-body-s text-ink-500">Forum-Kanton wählen, um die zentrale Staatsanwaltschaft mit Adresse anzuzeigen.</p>
          )}
        </div>

        {r.fristen.length > 0 && (
          <div className="lc-card p-5 space-y-2.5">
            <p className="lc-overline">Fristen</p>
            {r.fristen.map((f) => (
              <p key={f.label} className="text-body-s text-ink-800">
                {f.kritisch && <span className="lc-badge lc-badge-danger mr-1.5">Verwirkung</span>}
                <span className="font-medium text-ink-900">{f.label}:</span> {f.frist} <span className="text-ink-500">({f.norm})</span>
              </p>
            ))}
          </div>
        )}

        {r.weichen.map((w) => <div key={w} className="lc-notice text-body-s">{w}</div>)}
        {r.warnungen.map((w) => <div key={w} className="lc-notice-warn text-body-s">{w}</div>)}

        <div className="flex flex-wrap gap-1.5">
          {r.normverweise.map((n, i) => <span key={i} className="lc-chip">{n.artikel}{n.bemerkung ? ` · ${n.bemerkung}` : ''}</span>)}
        </div>

        <p className="text-xs text-ink-500 pt-2 border-t border-line">
          Regelwerk verbatim am StPO-Wortlaut verifiziert (Stand 1.1.2024; Art. 301 StPO/Art. 31 StGB am 6.6.2026) — fachliche Abnahme ausstehend.
        </p>
      </div>
    </div>
  );
}
