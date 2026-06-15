import { useMemo, useState } from 'react';
import { BeruehrtRahmen, Field, inputCls } from '../vorlagen/ui';
import { ErgebnisBlock } from '../ErgebnisBlock';
import { PflichtDisclaimer } from '../PflichtDisclaimer';
import { BetragsFeld } from '../BetragsFeld';
import { LinkTeilenButton } from '../LinkTeilenButton';
import { permalinkKodieren, permalinkLesen, einerVon, type PermalinkSpec } from '../../lib/permalink';
import {
  berechneProzesskosten, berechneKostenrisiko, berechneKostenvorschuss, berechneMwstParteientschaedigung,
  vergleichAlleKantone, postenText, MATERIEN, VERFAHRENSPHASEN, VERFAHRENSARTEN, INSTANZEN, KANTONE, WEITERE_KOSTENPOSTEN,
  type KantonCode, type Verfahrensphase, type Materie, type Verfahrensart, type Instanz, type PostenErgebnis,
} from '../../lib/prozesskosten';
import { KANTON_NAMEN } from '../../data/tarif/typen';

// ─── Prozesskosten-Cockpit (Art. 95/96 ZPO) ─────────────────────────────────
// Reine Darstellung (§3): gerechnet wird in lib/prozesskosten.ts über die
// amtlich verifizierte Datenschicht. Matrix Kanton × Verfahren × Verfahrensart ×
// Instanz (inkl. Bundesgericht) × Materie + Kostenrisiko + interkant. Vergleich.

const DISCLAIMER =
  'Prozesskosten = Gerichtskosten + Parteientschädigung (Art. 95 ZPO); die Kantone setzen die Tarife fest (Art. 96 ZPO). ' +
  'Angezeigt werden die Grund-/Entscheidgebühr bzw. das Grundhonorar nach Streitwert. Ermessenstarife erscheinen als Spanne, nie als erfundener Punktwert. ' +
  'Gerichtliche Erhöhungen/Ermässigungen, Auslagen, Beweis-/Übersetzungskosten und MwSt. sind nicht enthalten. Kostenvorschuss i. d. R. bis ½ der mutmasslichen Gerichtskosten (Art. 98 ZPO). Keine Rechtsberatung.';

const PK_LINK_SPEC: PermalinkSpec<Record<string, unknown>> = {
  kanton: { p: 'kt', typ: 'str', gueltig: einerVon(...KANTONE) },
  sw: { p: 'sw', typ: 'num', gueltig: (n) => Number.isFinite(n) && n >= 0 },
  phase: { p: 'ph', typ: 'str', gueltig: einerVon('schlichtung', 'entscheid') },
  materie: { p: 'ma', typ: 'str', gueltig: einerVon(...MATERIEN.map((m) => m.wert)) },
  instanz: { p: 'in', typ: 'str', gueltig: einerVon(...INSTANZEN.map((i) => i.wert)) },
  verfahren: { p: 'vf', typ: 'str', gueltig: einerVon(...VERFAHRENSARTEN.map((v) => v.wert)) },
  quote: { p: 'q', typ: 'num', gueltig: (n) => Number.isInteger(n) && n >= 0 && n <= 100 },
  mwst: { p: 'mw', typ: 'bool' },
};

const zahl = (roh: string): number | undefined => {
  if (roh.trim() === '') return undefined;
  const n = Number(roh);
  return Number.isFinite(n) ? n : undefined;
};

const chf = (n: number): string => `CHF ${Math.round(n).toLocaleString('de-CH')}`;
const spanneText = (s?: { vonChf: number; bisChf: number }): string =>
  !s ? '—' : s.vonChf === s.bisChf ? chf(s.vonChf) : `${chf(s.vonChf)} – ${chf(s.bisChf)}`;

function PostenKarte({ titel, posten }: { titel: string; posten: PostenErgebnis }) {
  const q = posten.quelle;
  return (
    <div className="lc-tile lc-akzent-brass">
      <p className="text-xs text-ink-500 mb-1">{titel}</p>
      <p key={postenText(posten)} className="lc-wert-puls text-body-l font-semibold text-ink-900 num">{postenText(posten)}</p>
      {posten.kostenlos
        ? <p className="mt-1 text-body-s text-ink-600">{posten.kostenlosGrund}</p>
        : posten.schlichtungspauschale
          ? <p className="mt-1 text-body-s text-ink-600">Art. 95 II lit. a ZPO: eigener, meist reduzierter Tarif (oft ein Bruchteil der Entscheidgebühr) – hier nicht beziffert.</p>
          : posten.ergebnis && !posten.ergebnis.deterministisch
            ? <p className="mt-1 text-body-s text-ink-600">Ermessensrahmen – konkrete Festsetzung durch die Behörde.</p>
            : null}
      <p className="mt-2 text-xs text-ink-500">
        {q.erlassName} ({q.erlassNr}), {q.artikel} · Stand {q.stand}
        {q.verifiziert === 'recherche' ? ' · Erstrecherche' : ''}
        {' · '}
        <a href={q.quelleUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink-800">amtliche Quelle ↗</a>
      </p>
      {q.hinweis && <p className="mt-1 text-xs text-ink-500">{q.hinweis}</p>}
    </div>
  );
}

export function ProzesskostenForm() {
  const ausLink = useMemo(() => {
    try { return permalinkLesen(PK_LINK_SPEC, typeof window === 'undefined' ? '' : window.location.search); }
    catch { return {} as Record<string, unknown>; }
  }, []);

  const [kanton, setKanton] = useState<KantonCode>((ausLink.kanton as KantonCode) ?? 'ZH');
  const [sw, setSw] = useState<string>(ausLink.sw != null ? String(ausLink.sw) : '');
  const [phase, setPhase] = useState<Verfahrensphase>((ausLink.phase as Verfahrensphase) ?? 'entscheid');
  const [materie, setMaterie] = useState<Materie>((ausLink.materie as Materie) ?? 'allgemein');
  const [instanz, setInstanz] = useState<Instanz>((ausLink.instanz as Instanz) ?? 'erstinstanz');
  const [verfahren, setVerfahren] = useState<Verfahrensart>((ausLink.verfahren as Verfahrensart) ?? 'ordentlich');
  const [quote, setQuote] = useState<number>(typeof ausLink.quote === 'number' ? (ausLink.quote as number) : 50);
  const [vergleich, setVergleich] = useState(false);
  const [mwst, setMwst] = useState<boolean>(ausLink.mwst === true);
  // Geteilter Link mit Quote (q=…) öffnet das Kostenrisiko-Panel direkt.
  const [risiko, setRisiko] = useState(typeof ausLink.quote === 'number');

  const bger = instanz === 'bundesgericht';
  const verfahrenRelevant = phase === 'entscheid' && !bger;

  const streitwert = zahl(sw);
  const ergebnis = useMemo(
    () => streitwert === undefined ? null : berechneProzesskosten({ kanton, streitwertCHF: streitwert, phase, materie, instanz, verfahren: verfahrenRelevant ? verfahren : 'ordentlich' }),
    [kanton, streitwert, phase, materie, instanz, verfahren, verfahrenRelevant],
  );
  const vergleichsListe = useMemo(
    () => (vergleich && streitwert !== undefined && !bger) ? vergleichAlleKantone(streitwert, phase, materie, instanz, verfahrenRelevant ? verfahren : 'ordentlich') : null,
    [vergleich, streitwert, phase, materie, instanz, verfahren, verfahrenRelevant, bger],
  );
  const kostenrisiko = useMemo(
    () => (risiko && ergebnis) ? berechneKostenrisiko(ergebnis.gerichtskosten, ergebnis.parteientschaedigung, quote / 100) : null,
    [risiko, ergebnis, quote],
  );
  const vorschuss = useMemo(
    () => ergebnis ? berechneKostenvorschuss(ergebnis.gerichtskosten, phase, instanz, verfahrenRelevant ? verfahren : 'ordentlich') : null,
    [ergebnis, phase, instanz, verfahren, verfahrenRelevant],
  );
  const mwstAufschlag = useMemo(
    () => (mwst && ergebnis) ? berechneMwstParteientschaedigung(ergebnis.parteientschaedigung) : null,
    [mwst, ergebnis],
  );

  return (
    <BeruehrtRahmen>
    <div className="space-y-6">
      <PflichtDisclaimer kurz="Gerichtskosten + Parteientschädigung nach kantonalem Tarif (Art. 95/96 ZPO); Ermessenstarife als Spanne." text={DISCLAIMER} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Kanton">
          <select value={kanton} onChange={(e) => setKanton(e.target.value as KantonCode)} className={inputCls} aria-label="Kanton">
            {KANTONE.map((k) => <option key={k} value={k}>{k} — {KANTON_NAMEN[k]}</option>)}
          </select>
        </Field>
        <Field label="Streitwert (CHF)" hint="vermögensrechtliche Streitigkeit nach Art. 91 ff. ZPO">
          <BetragsFeld value={sw} onChange={setSw} className={inputCls} placeholder="z. B. 50'000" />
        </Field>
        <Field label="Instanz">
          <select value={instanz} onChange={(e) => setInstanz(e.target.value as Instanz)} className={inputCls} aria-label="Instanz">
            {INSTANZEN.map((i) => <option key={i.wert} value={i.wert}>{i.label}</option>)}
          </select>
        </Field>
        {!bger && (
          <Field label="Verfahrensphase">
            <select value={phase} onChange={(e) => setPhase(e.target.value as Verfahrensphase)} className={inputCls} aria-label="Verfahrensphase">
              {VERFAHRENSPHASEN.map((p) => <option key={p.wert} value={p.wert}>{p.label}</option>)}
            </select>
          </Field>
        )}
        {verfahrenRelevant && (
          <Field label="Verfahrensart" hint="Modifikator auf den Basistarif (summarisch/vereinfacht)">
            <select value={verfahren} onChange={(e) => setVerfahren(e.target.value as Verfahrensart)} className={inputCls} aria-label="Verfahrensart">
              {VERFAHRENSARTEN.map((v) => <option key={v.wert} value={v.wert}>{v.label}</option>)}
            </select>
          </Field>
        )}
        <Field label="Materie" hint="für kostenlose Verfahren (Art. 113/114 ZPO)">
          <select value={materie} onChange={(e) => setMaterie(e.target.value as Materie)} className={inputCls} aria-label="Materie">
            {MATERIEN.map((m) => <option key={m.wert} value={m.wert}>{m.label}</option>)}
          </select>
        </Field>
      </div>

      {ergebnis && (
        <ErgebnisBlock>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PostenKarte titel={bger ? 'Gerichtskosten (BGer)' : 'Gerichtskosten (Entscheidgebühr)'} posten={ergebnis.gerichtskosten} />
            <PostenKarte titel="Parteientschädigung" posten={ergebnis.parteientschaedigung} />
          </div>

          {/* Kostenvorschuss (Art. 98 ZPO / Art. 62 BGG) — Liquiditätsposten. */}
          {vorschuss && (
            <div className="mt-3 lc-tile">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <p className="text-xs text-ink-500">Mutmasslicher Kostenvorschuss <span className="text-ink-400">({vorschuss.norm})</span></p>
                <p className="num text-body-l font-semibold text-ink-900">
                  {vorschuss.spanne ? (vorschuss.faktor === 0.5 ? `bis ${spanneText(vorschuss.spanne)}` : spanneText(vorschuss.spanne)) : '—'}
                </p>
              </div>
              <p className="mt-1 text-xs text-ink-500">{vorschuss.hinweis}</p>
            </div>
          )}

          {/* MwSt auf die Parteientschädigung (Art. 95 III lit. b ZPO i.V.m. MWSTG) — fallabhängig. */}
          {!ergebnis.parteientschaedigung.kostenlos && (
            <label className="mt-3 flex items-start gap-2 text-body-s text-ink-700">
              <input type="checkbox" checked={mwst} onChange={(e) => setMwst(e.target.checked)} className="mt-0.5" />
              <span>Berechtigte Partei nicht vorsteuerabzugsberechtigt (z.&nbsp;B. Privatperson) — MwSt auf die Parteientschädigung hinzurechnen</span>
            </label>
          )}
          {mwstAufschlag && (
            <div className="mt-2 lc-tile lc-akzent-brass">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <p className="text-xs text-ink-500">Parteientschädigung inkl. MwSt {mwstAufschlag.satzProzent.toLocaleString('de-CH')} %</p>
                <p className="num text-body-l font-semibold text-ink-900">
                  {mwstAufschlag.bruttoSpanne ? spanneText(mwstAufschlag.bruttoSpanne) : '—'}
                </p>
              </div>
              {mwstAufschlag.betrag && <p className="mt-1 text-xs text-ink-500">MwSt-Anteil: {spanneText(mwstAufschlag.betrag)}.</p>}
              <p className="mt-1 text-xs text-ink-500">{mwstAufschlag.hinweis}</p>
            </div>
          )}

          <ul className="mt-3 space-y-1 text-xs text-ink-500 list-disc pl-5">
            {ergebnis.hinweise.map((h, i) => <li key={i}>{h}</li>)}
          </ul>

          {/* Weitere, nicht bezifferbare Kostenposten (Art. 95 II c–e / III a; UR Art. 117 ff.). */}
          <details className="mt-3 rounded-xl border border-line bg-surface p-3">
            <summary className="cursor-pointer text-body-s text-ink-700 hover:text-ink-900">Weitere Kostenposten (nicht beziffert)</summary>
            <ul className="mt-2 space-y-1 text-xs text-ink-500 list-disc pl-5">
              {WEITERE_KOSTENPOSTEN.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          </details>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setRisiko((v) => !v)}
              className="text-body-s underline text-ink-700 hover:text-ink-900">
              {risiko ? 'Kostenrisiko ausblenden' : 'Kostenrisiko bei Teilobsiegen berechnen →'}
            </button>
            {!bger && (
              <button type="button" onClick={() => setVergleich((v) => !v)}
                className="text-body-s underline text-ink-700 hover:text-ink-900">
                {vergleich ? 'Interkantonalen Vergleich ausblenden' : 'Was würde es in anderen Kantonen kosten? →'}
              </button>
            )}
            <LinkTeilenButton query={() => permalinkKodieren(PK_LINK_SPEC, { kanton, sw: streitwert, phase, materie, instanz, verfahren: verfahrenRelevant ? verfahren : undefined, quote: risiko ? quote : undefined, mwst: mwst ? true : undefined })} />
          </div>

          {risiko && kostenrisiko && (
            <div className="mt-4 rounded-xl border border-line bg-surface p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <label htmlFor="pk-quote" className="text-body-s text-ink-700">Ihre Obsiegensquote</label>
                <input id="pk-quote" type="range" min={0} max={100} step={5} value={quote} onChange={(e) => setQuote(Number(e.target.value))} className="flex-1 min-w-[8rem]" aria-label="Obsiegensquote in Prozent" />
                <span className="num text-body-s font-semibold text-ink-900 w-12 text-right">{quote}%</span>
              </div>
              {kostenrisiko.berechenbar ? (
                <>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="lc-tile">
                      <p className="text-xs text-ink-500 mb-1">Gerichtskosten zu Ihren Lasten</p>
                      <p className="num text-body-l font-semibold text-ink-900">{spanneText(kostenrisiko.gerichtskostenZuLasten)}</p>
                    </div>
                    <div className="lc-tile">
                      <p className="text-xs text-ink-500 mb-1">Parteientschädigung (Saldo)</p>
                      <p className="num text-body-l font-semibold text-ink-900">{spanneText(kostenrisiko.parteientschaedigungSaldo)}</p>
                      <p className="mt-1 text-xs text-ink-500">+ Sie erhalten · − Sie zahlen</p>
                    </div>
                    <div className="lc-tile lc-akzent-brass">
                      <p className="text-xs text-ink-500 mb-1">Geschätzte Netto-Kostenbelastung</p>
                      <p className="num text-body-l font-semibold text-ink-900">{spanneText(kostenrisiko.nettoBelastung)}</p>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1 text-xs text-ink-500 list-disc pl-5">
                    {kostenrisiko.hinweise.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </>
              ) : (
                <p className="mt-3 text-body-s text-ink-600">{kostenrisiko.hinweise[kostenrisiko.hinweise.length - 1]}</p>
              )}
            </div>
          )}

          {vergleichsListe && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[34rem] text-body-s border-collapse">
                <caption className="text-xs text-ink-500 text-left mb-2">
                  Interkantonaler Vergleich bei Streitwert CHF {streitwert?.toLocaleString('de-CH')} ({VERFAHRENSPHASEN.find((p) => p.wert === phase)?.label}{verfahrenRelevant && verfahren !== 'ordentlich' ? `, ${VERFAHRENSARTEN.find((v) => v.wert === verfahren)?.label}` : ''}{instanz === 'rechtsmittel' ? ', Rechtsmittel' : ''}, {MATERIEN.find((m) => m.wert === materie)?.label}) — Gerichtsgebühr / Parteientschädigung. Quelle je Kanton verlinkt.
                </caption>
                <thead>
                  <tr className="lc-overline text-ink-500 border-b border-line">
                    <th className="text-left py-2 pr-3">Kanton</th>
                    <th className="text-right py-2 px-3">Gerichtskosten</th>
                    <th className="text-right py-2 pl-3">Parteientschädigung</th>
                  </tr>
                </thead>
                <tbody>
                  {vergleichsListe.map((r) => (
                    <tr key={r.kanton} className={`border-b border-line/60 ${r.kanton === kanton ? 'bg-surface-raised font-medium' : ''}`}>
                      <td className="py-1.5 pr-3">
                        <a href={r.gerichtskosten.quelle.quelleUrl} target="_blank" rel="noopener noreferrer" className="hover:underline" title={`${r.gerichtskosten.quelle.erlassName} (${r.gerichtskosten.quelle.erlassNr})`}>{r.kanton}</a>
                      </td>
                      <td className="py-1.5 px-3 text-right num text-ink-800">{postenText(r.gerichtskosten)}</td>
                      <td className="py-1.5 pl-3 text-right num text-ink-800">{postenText(r.parteientschaedigung)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ErgebnisBlock>
      )}
    </div>
    </BeruehrtRahmen>
  );
}
