import { useMemo, useState } from 'react';
import { BeruehrtRahmen, Field, inputCls } from '../vorlagen/ui';
import { ErgebnisBlock } from '../ErgebnisBlock';
import { PflichtDisclaimer } from '../PflichtDisclaimer';
import { BetragsFeld } from '../BetragsFeld';
import { LinkTeilenButton } from '../LinkTeilenButton';
import { permalinkKodieren, permalinkLesen, einerVon, type PermalinkSpec } from '../../lib/permalink';
import {
  berechneProzesskosten, vergleichAlleKantone, postenText,
  MATERIEN, VERFAHRENSPHASEN, KANTONE,
  type KantonCode, type Verfahrensphase, type Materie, type PostenErgebnis,
} from '../../lib/prozesskosten';
import { KANTON_NAMEN } from '../../data/tarif/typen';

// ─── Prozesskosten-Rechner (Art. 95/96 ZPO) ─────────────────────────────────
// Reine Darstellung (§3): gerechnet wird in lib/prozesskosten.ts über die
// amtlich verifizierte kantonale Datenschicht. Mit interkantonaler
// Vergleichstabelle (Auftrag David).

const DISCLAIMER =
  'Prozesskosten = Gerichtskosten + Parteientschädigung (Art. 95 ZPO); die Kantone setzen die Tarife fest (Art. 96 ZPO). ' +
  'Angezeigt werden die Grund-/Entscheidgebühr bzw. das Grundhonorar nach Streitwert. Ermessenstarife erscheinen als Spanne, nie als erfundener Punktwert. ' +
  'Gerichtliche Erhöhungen/Ermässigungen, Auslagen, Beweis-/Übersetzungskosten und MwSt. sind nicht enthalten. Kostenvorschuss i. d. R. bis ½ der mutmasslichen Gerichtskosten (Art. 98 ZPO). Keine Rechtsberatung.';

const PK_LINK_SPEC: PermalinkSpec<Record<string, unknown>> = {
  kanton: { p: 'kt', typ: 'str', gueltig: einerVon(...KANTONE) },
  sw: { p: 'sw', typ: 'num', gueltig: (n) => Number.isFinite(n) && n >= 0 },
  phase: { p: 'ph', typ: 'str', gueltig: einerVon('schlichtung', 'entscheid') },
  materie: { p: 'ma', typ: 'str', gueltig: einerVon(...MATERIEN.map((m) => m.wert)) },
};

const zahl = (roh: string): number | undefined => {
  if (roh.trim() === '') return undefined;
  const n = Number(roh);
  return Number.isFinite(n) ? n : undefined;
};

/** Ein Kostenposten als Karte (Betrag/Spanne/kostenlos + Rechtsgrundlage + Link). */
function PostenKarte({ titel, posten }: { titel: string; posten: PostenErgebnis }) {
  const q = posten.quelle;
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="text-overline text-ink-500">{titel}</div>
      <div className="mt-1 text-h4 text-ink-900">{postenText(posten)}</div>
      {posten.kostenlos
        ? <div className="mt-1 text-body-s text-ink-600">{posten.kostenlosGrund}</div>
        : posten.ergebnis && !posten.ergebnis.deterministisch
          ? <div className="mt-1 text-body-s text-ink-600">Ermessensrahmen – konkrete Festsetzung durch die Behörde.</div>
          : null}
      <div className="mt-2 text-caption text-ink-500">
        {q.erlassName} ({q.erlassNr}), {q.artikel} · Stand {q.stand}
        {' · '}
        <a href={q.quelleUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink-800">amtliche Quelle ↗</a>
      </div>
      {q.hinweis && <div className="mt-1 text-caption text-ink-400">{q.hinweis}</div>}
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
  const [vergleich, setVergleich] = useState(false);

  const streitwert = zahl(sw);
  const ergebnis = useMemo(
    () => streitwert === undefined ? null : berechneProzesskosten({ kanton, streitwertCHF: streitwert, phase, materie }),
    [kanton, streitwert, phase, materie],
  );
  const vergleichsListe = useMemo(
    () => (vergleich && streitwert !== undefined) ? vergleichAlleKantone(streitwert, phase, materie) : null,
    [vergleich, streitwert, phase, materie],
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
          <BetragsFeld value={sw} onChange={setSw} className={inputCls} placeholder="z. B. 50'000" aria-label="Streitwert in Franken" />
        </Field>
        <Field label="Verfahren">
          <select value={phase} onChange={(e) => setPhase(e.target.value as Verfahrensphase)} className={inputCls} aria-label="Verfahren">
            {VERFAHRENSPHASEN.map((p) => <option key={p.wert} value={p.wert}>{p.label}</option>)}
          </select>
        </Field>
        <Field label="Materie" hint="für kostenlose Verfahren (Art. 113/114 ZPO)">
          <select value={materie} onChange={(e) => setMaterie(e.target.value as Materie)} className={inputCls} aria-label="Materie">
            {MATERIEN.map((m) => <option key={m.wert} value={m.wert}>{m.label}</option>)}
          </select>
        </Field>
      </div>

      {ergebnis && (
        <ErgebnisBlock>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PostenKarte titel="Gerichtskosten (Entscheidgebühr)" posten={ergebnis.gerichtskosten} />
            <PostenKarte titel="Parteientschädigung" posten={ergebnis.parteientschaedigung} />
          </div>

          <ul className="mt-3 space-y-1 text-caption text-ink-500 list-disc pl-5">
            {ergebnis.hinweise.map((h, i) => <li key={i}>{h}</li>)}
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setVergleich((v) => !v)}
              className="text-body-s underline text-ink-700 hover:text-ink-900">
              {vergleich ? 'Interkantonalen Vergleich ausblenden' : 'Was würde es in anderen Kantonen kosten? →'}
            </button>
            <LinkTeilenButton query={() => permalinkKodieren(PK_LINK_SPEC, { kanton, sw: streitwert, phase, materie })} />
          </div>

          {vergleichsListe && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-body-s border-collapse">
                <caption className="text-caption text-ink-500 text-left mb-2">
                  Interkantonaler Vergleich bei Streitwert CHF {streitwert?.toLocaleString('de-CH')} ({VERFAHRENSPHASEN.find((p) => p.wert === phase)?.label}, {MATERIEN.find((m) => m.wert === materie)?.label}) — Gerichtsgebühr / Parteientschädigung. Quelle je Kanton verlinkt.
                </caption>
                <thead>
                  <tr className="text-overline text-ink-500 border-b border-line">
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
                      <td className="py-1.5 px-3 text-right tabular-nums text-ink-800">{postenText(r.gerichtskosten)}</td>
                      <td className="py-1.5 pl-3 text-right tabular-nums text-ink-800">{postenText(r.parteientschaedigung)}</td>
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
