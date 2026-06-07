import { FehlerBox, Field, LiveHeader, inputCls } from '../vorlagen/ui';
import { useState } from 'react';
import { BetragsFeld } from '../BetragsFeld';
import type { ErbteilungInput, Zivilstand, Gueterstand, ErbteilungErgebnis } from '../../types/erbrecht';
import { berechneErbteilung } from '../../lib/erbteilung';
import { fmtB, zahl, istNull } from '../../lib/bruch';
import { chf as fmtCHF } from '../../lib/vorlagen/datum';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { PflichtDisclaimer } from '../PflichtDisclaimer';
import { DatumsFeld } from '../DatumsFeld';
import { PdfExportButton } from '../PdfExport';
import { AktenzeichenFeld } from '../AktenzeichenFeld';
import { BegruendungAbsatz } from '../BegruendungAbsatz';
import { begruendungsAbsatz } from '../../lib/begruendung';
import { LinkTeilenButton } from '../LinkTeilenButton';
import { permalinkKodieren, permalinkLesen, istISO, einerVon, type PermalinkSpec } from '../../lib/permalink';

const ERB_DISCLAIMER =
  'Automatisierte Orientierungsberechnung der gesetzlichen Erbteile, Pflichtteile und der verfügbaren Quote ' +
  '(Art. 457 ff., 462, 470 ff. ZGB; Revision in Kraft seit 1.1.2023) – keine Rechtsberatung. Berechnet werden ' +
  'Quoten bzw. Wertansprüche, nicht die Realteilung. Hinzurechnungen zur Pflichtteilsberechnungsmasse ' +
  '(Art. 475/476 ZGB), Ausgleichung (Art. 626 ff. ZGB), Herabsetzung (Art. 522 ff. ZGB) und internationale ' +
  'Sachverhalte (IPRG) sind nicht modelliert. Die güterrechtliche Auseinandersetzung ist vereinfacht abgebildet; ' +
  'Ersatzforderungen und Mehrwertanteile (Art. 206/209 ZGB) bleiben unberücksichtigt. Verbindlich ist der ' +
  'Wortlaut auf Fedlex (SR 210); der konkrete Sachverhalt ist fachlich zu prüfen.';

const ZIVILSTAENDE: { code: Zivilstand; label: string }[] = [
  { code: 'verheiratet', label: 'Verheiratet' },
  { code: 'eingetragene_partnerschaft', label: 'Eingetragene Partnerschaft' },
  { code: 'ledig', label: 'Ledig / verwitwet / geschieden' },
];

const GUETERSTAENDE: { code: Gueterstand; label: string }[] = [
  { code: 'errungenschaftsbeteiligung', label: 'Errungenschaftsbeteiligung (ordentlicher Güterstand)' },
  { code: 'guetertrennung', label: 'Gütertrennung' },
  { code: 'guetergemeinschaft', label: 'Gütergemeinschaft' },
];

type ElternStatus = 'lebt' | 'vorverstorben_mit' | 'vorverstorben_ohne' | 'keine_angabe';

const ELTERN_OPTIONEN: { code: ElternStatus; label: string }[] = [
  { code: 'keine_angabe', label: '– keine Angabe / nicht vorhanden –' },
  { code: 'lebt', label: 'lebt' },
  { code: 'vorverstorben_mit', label: 'vorverstorben, hat Nachkommen (Geschwister des Erblassers)' },
  { code: 'vorverstorben_ohne', label: 'vorverstorben, ohne Nachkommen' },
];


// Permalink (FAHRPLAN-PRAXIS 1.3)
type BetraegeLink = { eigengut: string; vorschlagE: string; vorschlagU: string; gesamtgut: string; vermoegen: string; direkt: string };
type EtLink = {
  todesdatum: string; zivilstand: string; scheidung?: boolean; scheidung472?: boolean;
  kinderLebend?: number; staemme?: { enkel: number }[]; vater?: string; mutter?: string;
  dritteParentel?: boolean; gueterrechtAn?: boolean; gueterstand?: string; betraege?: BetraegeLink;
};
const BETRAG_FELDER = ['eigengut', 'vorschlagE', 'vorschlagU', 'gesamtgut', 'vermoegen', 'direkt'] as const;
const ET_LINK_SPEC: PermalinkSpec<EtLink & Record<string, unknown>> = {
  todesdatum: { p: 'td', typ: 'str', gueltig: istISO },
  zivilstand: { p: 'zs', typ: 'str', gueltig: einerVon('verheiratet', 'eingetragene_partnerschaft', 'ledig') },
  scheidung: { p: 'sc', typ: 'bool' },
  scheidung472: { p: 's4', typ: 'bool' },
  kinderLebend: { p: 'kl', typ: 'num', gueltig: (n) => Number.isInteger(n) && n >= 0 && n <= 30 },
  staemme: { p: 'st', typ: 'json', gueltig: (v): boolean => Array.isArray(v) && v.length <= 30 && v.every((e) => e && Number.isInteger((e as { enkel?: number }).enkel) && ((e as { enkel: number }).enkel) >= 0) },
  vater: { p: 'va', typ: 'str', gueltig: einerVon('lebt', 'vorverstorben_mit', 'vorverstorben_ohne', 'keine_angabe') },
  mutter: { p: 'mu', typ: 'str', gueltig: einerVon('lebt', 'vorverstorben_mit', 'vorverstorben_ohne', 'keine_angabe') },
  dritteParentel: { p: 'dp', typ: 'bool' },
  gueterrechtAn: { p: 'ga', typ: 'bool' },
  gueterstand: { p: 'gs', typ: 'str', gueltig: einerVon('errungenschaftsbeteiligung', 'guetertrennung', 'guetergemeinschaft') },
  betraege: { p: 'be', typ: 'json', gueltig: (v): boolean => !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).every((k) => (BETRAG_FELDER as readonly string[]).includes(k)) && Object.values(v).every((x) => typeof x === 'string' && x.length <= 16) },
};

export function ErbteilungForm() {
  const [ausLink] = useState<Partial<EtLink>>(() => {
    try { return permalinkLesen(ET_LINK_SPEC, window.location.search); } catch { return {}; }
  });
  const [todesdatum, setTodesdatum] = useState(ausLink.todesdatum ?? '2025-06-01');
  const [zivilstand, setZivilstand] = useState<Zivilstand>((ausLink.zivilstand as Zivilstand | undefined) ?? 'verheiratet');
  const [scheidung, setScheidung] = useState(ausLink.scheidung ?? false);
  const [scheidung472, setScheidung472] = useState(ausLink.scheidung472 ?? false);
  const [kinderLebend, setKinderLebend] = useState(ausLink.kinderLebend ?? 2);
  const [staemme, setStaemme] = useState<{ enkel: number }[]>(ausLink.staemme ?? []);
  const [vater, setVater] = useState<ElternStatus>((ausLink.vater as ElternStatus | undefined) ?? 'keine_angabe');
  const [mutter, setMutter] = useState<ElternStatus>((ausLink.mutter as ElternStatus | undefined) ?? 'keine_angabe');
  const [dritteParentel, setDritteParentel] = useState(ausLink.dritteParentel ?? false);
  const [gueterrechtAn, setGueterrechtAn] = useState(ausLink.gueterrechtAn ?? false);
  const [gueterstand, setGueterstand] = useState<Gueterstand>((ausLink.gueterstand as Gueterstand | undefined) ?? 'errungenschaftsbeteiligung');
  const [betraege, setBetraege] = useState<{ eigengut: string; vorschlagE: string; vorschlagU: string; gesamtgut: string; vermoegen: string; direkt: string }>(() => ({
    eigengut: '', vorschlagE: '', vorschlagU: '', gesamtgut: '', vermoegen: '', direkt: '',
    ...(ausLink.betraege ?? {}),
  }));

  const elternteil = (s: ElternStatus) =>
    s === 'keine_angabe' ? undefined : { lebt: s === 'lebt', stammNachkommen: s === 'vorverstorben_mit' };
  // Transiente Tipp-Zustände («-», «.») nie als NaN weiterreichen (Bug-Check 5.6.2026)
  const num = (s: string) => { const n = Number(s); return s.trim() === '' || !Number.isFinite(n) ? undefined : n; };

  const hatErste = kinderLebend > 0 || staemme.some((s) => s.enkel > 0);

  const input: ErbteilungInput = {
    todesdatum,
    zivilstand,
    scheidungHaengig: zivilstand !== 'ledig' ? scheidung : undefined,
    scheidung472Erfuellt: zivilstand !== 'ledig' && scheidung ? scheidung472 : undefined,
    kinderLebend,
    kinderVorverstorben: staemme.length ? staemme : undefined,
    vater: elternteil(vater),
    mutter: elternteil(mutter),
    dritteParentelVorhanden: dritteParentel,
    // Beträge: güterrechtliche Herleitung (Panel offen) hat Vorrang,
    // sonst zählt der direkt erfasste Nachlass; leer = nur Quoten.
    ...(gueterrechtAn
      ? {
          gueterstand,
          eigengutErblasser: num(betraege.eigengut),
          vorschlagErblasser: num(betraege.vorschlagE),
          vorschlagUeberlebender: num(betraege.vorschlagU),
          gesamtgut: num(betraege.gesamtgut),
          vermoegenErblasser: num(betraege.vermoegen),
        }
      : betraege.direkt.trim() !== ''
        ? { nachlassDirekt: num(betraege.direkt) }
        : {}),
  };

  const fehler: string[] = [];
  if (!todesdatum) fehler.push('Bitte das Todesdatum angeben (Recht-Schalter, Art. 15/16 SchlT ZGB).');
  if (!Number.isInteger(kinderLebend) || kinderLebend < 0) fehler.push('Anzahl lebender Kinder: ganze Zahl ≥ 0.');
  staemme.forEach((s, i) => { if (!Number.isInteger(s.enkel) || s.enkel < 0) fehler.push(`Stamm ${i + 1}: Anzahl Nachkommen als ganze Zahl ≥ 0.`); });

  let ergebnis: ErbteilungErgebnis | null = null;
  if (fehler.length === 0) {
    try { ergebnis = berechneErbteilung(input); } catch (err) { fehler.push((err as Error).message); }
  }

  const eingaben: Record<string, string> = {
    'Todesdatum': todesdatum,
    'Zivilstand': ZIVILSTAENDE.find((z) => z.code === zivilstand)?.label ?? zivilstand,
    ...(zivilstand !== 'ledig' && scheidung ? { 'Scheidungsverfahren hängig': scheidung472 ? 'ja, Voraussetzungen Art. 472 ZGB erfüllt' : 'ja, Voraussetzungen Art. 472 ZGB nicht erfüllt' } : {}),
    'Lebende Kinder': String(kinderLebend),
    ...(staemme.length ? { 'Stämme vorverstorbener Kinder': staemme.map((s, i) => `Stamm ${i + 1}: ${s.enkel} Nachkommen`).join('; ') } : {}),
    ...(vater !== 'keine_angabe' ? { 'Vater': ELTERN_OPTIONEN.find((o) => o.code === vater)!.label } : {}),
    ...(mutter !== 'keine_angabe' ? { 'Mutter': ELTERN_OPTIONEN.find((o) => o.code === mutter)!.label } : {}),
    ...(dritteParentel ? { '3. Parentel vorhanden': 'ja' } : {}),
    ...(ergebnis?.nachlassChf != null ? { 'Nachlass (CHF)': fmtCHF(ergebnis.nachlassChf) } : {}),
  };

  // FAHRPLAN-PRAXIS 1.2: Mandats-Referenz für den PDF-Kopf (optional).
  const [aktenzeichen, setAktenzeichen] = useState('');
  const pdfConfig: PdfDocConfig = {
    aktenzeichen: aktenzeichen.trim() || undefined,
    title: 'Erbteilung & Pflichtteil (ZGB)',
    domain: 'erbrecht',
    fileBase: 'Erbteilung-Pflichtteil',
    inputs: eingaben,
    sections: ergebnis ? [{ titel: 'Erbteilung & Pflichtteil (Art. 457 ff., 462, 470 ff. ZGB)', ergebnis }] : [],
    disclaimer: ERB_DISCLAIMER,
  };

  // CHF-Beträge kommen seit dem Ultra-Review-Fix (7.6.2026, §3) fertig aus
  // der Engine (erbteilChf/pflichtteilChf/verfuegbareQuoteChf) — hier wird
  // nur noch gerendert.
  const nachlass = ergebnis?.nachlassChf;

  return (
    <div className="space-y-6">
      {/* Pflicht-Disclaimer */}
      <PflichtDisclaimer kurz="Quoten-Orientierung (Art. 457 ff., 470 ff. ZGB, Revision 2023). Massgebend ist das Todesdatum." text={ERB_DISCLAIMER} />

      {/* Grundangaben */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Todesdatum" hint="Recht-Schalter: bis 31.12.2022 altes Recht, ab 1.1.2023 neues Recht (Art. 15/16 SchlT ZGB)">
          <DatumsFeld value={todesdatum} onChange={(v) => setTodesdatum(v)} className={inputCls} />
        </Field>
        <Field label="Zivilstand des Erblassers" hint="Eingetragene Partner sind Ehegatten gleichgestellt (Art. 462 ZGB)">
          <select value={zivilstand} onChange={(e) => setZivilstand(e.target.value as Zivilstand)} className={inputCls}>
            {ZIVILSTAENDE.map((z) => <option key={z.code} value={z.code}>{z.label}</option>)}
          </select>
        </Field>
        <Field label="Nachlass (CHF, optional)"
          hint={gueterrechtAn
            ? 'Wird unten güterrechtlich hergeleitet – Direkteingabe ist deaktiviert'
            : 'Leer = nur Quoten; mit Betrag werden Erb- und Pflichtteile in CHF ausgewiesen'}>
          <input type="number" inputMode="decimal" min={0} value={betraege.direkt} disabled={gueterrechtAn}
            onChange={(e) => setBetraege((b) => ({ ...b, direkt: e.target.value }))}
            placeholder="z. B. 500000" className={inputCls + (gueterrechtAn ? ' opacity-50 cursor-not-allowed' : '')} />
        </Field>
      </div>

      {zivilstand !== 'ledig' && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" checked={scheidung} onChange={(e) => setScheidung(e.target.checked)} />
            Scheidungs-/Auflösungsverfahren beim Tod hängig
          </label>
          {scheidung && (
            <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700 pl-6">
              <input type="checkbox" checked={scheidung472} onChange={(e) => setScheidung472(e.target.checked)} />
              Voraussetzungen von Art. 472 ZGB erfüllt (gemeinsames Begehren oder ≥ 2 Jahre getrennt) → Pflichtteilsverlust
            </label>
          )}
        </div>
      )}

      {/* 1. Parentel */}
      <div className="space-y-3">
        <p className="lc-overline">1. Parentel – Nachkommen (Art. 457 ZGB)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Lebende Kinder (Anzahl)">
            <input type="number" inputMode="decimal" min={0} step={1} value={kinderLebend} onChange={(e) => setKinderLebend(Number(e.target.value))} className={inputCls + ' w-28'} />
          </Field>
          <Field label="Vorverstorbene Kinder mit Nachkommen (Stämme)" hint="Deren Nachkommen treten nach Stämmen ein (Art. 457 Abs. 3)">
            <div className="space-y-2">
              {staemme.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-body-s text-ink-500 w-20">Stamm {i + 1}:</span>
                  <input type="number" inputMode="decimal" min={0} step={1} value={s.enkel}
                    onChange={(e) => setStaemme((arr) => arr.map((x, j) => (j === i ? { enkel: Number(e.target.value) } : x)))}
                    className={inputCls + ' w-24'} />
                  <span className="text-body-s text-ink-500">Nachkommen</span>
                  <button type="button" onClick={() => setStaemme((arr) => arr.filter((_, j) => j !== i))}
                    className="text-body-s text-danger-700">Entfernen</button>
                </div>
              ))}
              <button type="button" onClick={() => setStaemme((arr) => [...arr, { enkel: 1 }])}
                className="lc-btn-outline lc-btn-sm">
                + Stamm hinzufügen
              </button>
            </div>
          </Field>
        </div>
      </div>

      {/* 2./3. Parentel – nur relevant ohne Nachkommen */}
      {!hatErste && (
        <div className="space-y-3">
          <p className="lc-overline">2. Parentel – elterlicher Stamm (Art. 458 ZGB)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Vater">
              <select value={vater} onChange={(e) => setVater(e.target.value as ElternStatus)} className={inputCls}>
                {ELTERN_OPTIONEN.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Mutter">
              <select value={mutter} onChange={(e) => setMutter(e.target.value as ElternStatus)} className={inputCls}>
                {ELTERN_OPTIONEN.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
              </select>
            </Field>
          </div>
          {vater === 'keine_angabe' && mutter === 'keine_angabe' && zivilstand === 'ledig' && (
            <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" checked={dritteParentel} onChange={(e) => setDritteParentel(e.target.checked)} />
              3. Parentel vorhanden (Grosseltern oder deren Nachkommen, Art. 459 ZGB)
            </label>
          )}
        </div>
      )}

      {/* Güterrechtliche Herleitung (optional) – übersteuert das Direktfeld oben */}
      <div className="border border-line rounded-lg">
        <button type="button" onClick={() => setGueterrechtAn(!gueterrechtAn)}
          className={`w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-brass-100 text-left rounded-t-lg ${gueterrechtAn ? '' : 'rounded-b-lg'}`}>
          <span className="text-body-s font-medium text-ink-700">Güterrechtliche Vorstufe – Nachlass herleiten (optional)</span>
          <span className="text-ink-500">{gueterrechtAn ? '▲' : '▼'}</span>
        </button>
        {gueterrechtAn && (
          <div className="p-4 space-y-4">
            <Field label="Güterstand">
              <select value={gueterstand} onChange={(e) => setGueterstand(e.target.value as Gueterstand)} className={inputCls}>
                {GUETERSTAENDE.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
              </select>
            </Field>
            {gueterstand === 'errungenschaftsbeteiligung' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Eigengut Erblasser (CHF)"><BetragsFeld erlaubeNegativ value={betraege.eigengut} onChange={(v) => setBetraege((b) => ({ ...b, eigengut: v }))} className={inputCls} /></Field>
                <Field label="Vorschlag Erblasser (CHF)" hint="negativ = Rückschlag (zählt 0, Art. 210 Abs. 2)"><BetragsFeld erlaubeNegativ value={betraege.vorschlagE} onChange={(v) => setBetraege((b) => ({ ...b, vorschlagE: v }))} className={inputCls} /></Field>
                <Field label="Vorschlag Überlebender (CHF)"><BetragsFeld erlaubeNegativ value={betraege.vorschlagU} onChange={(v) => setBetraege((b) => ({ ...b, vorschlagU: v }))} className={inputCls} /></Field>
              </div>
            )}
            {gueterstand === 'guetertrennung' && (
              <Field label="Vermögen des Erblassers (CHF)"><BetragsFeld erlaubeNegativ value={betraege.vermoegen} onChange={(v) => setBetraege((b) => ({ ...b, vermoegen: v }))} className={inputCls + ' w-44'} /></Field>
            )}
            {gueterstand === 'guetergemeinschaft' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Eigengut Erblasser (CHF)"><BetragsFeld erlaubeNegativ value={betraege.eigengut} onChange={(v) => setBetraege((b) => ({ ...b, eigengut: v }))} className={inputCls} /></Field>
                <Field label="Gesamtgut (CHF)"><BetragsFeld erlaubeNegativ value={betraege.gesamtgut} onChange={(v) => setBetraege((b) => ({ ...b, gesamtgut: v }))} className={inputCls} /></Field>
              </div>
            )}
          </div>
        )}
      </div>

      <FehlerBox fehler={fehler} />

      {ergebnis && (
        <div className="space-y-4">
          <LiveHeader />

          {/* Eckdaten */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="lc-tile">
              <p className="text-xs text-ink-500 mb-1">Rechtsstand</p>
              <p className="text-body-l font-semibold text-ink-900">{ergebnis.rechtsstand === 'neu' ? 'Neues Recht (ab 1.1.2023)' : 'Altes Recht (bis 31.12.2022)'}</p>
            </div>
            <div className="lc-tile">
              <p className="text-xs text-ink-500 mb-1">Verfügbare Quote</p>
              <p className="text-body-l font-semibold text-ink-900">{fmtB(ergebnis.verfuegbareQuote)}{ergebnis.verfuegbareQuoteChf != null ? ` · CHF ${fmtCHF(ergebnis.verfuegbareQuoteChf)}` : ''}</p>
            </div>
            <div className="lc-tile">
              <p className="text-xs text-ink-500 mb-1">Nachlass</p>
              <p className="text-body-l font-semibold text-ink-900">{nachlass != null ? `CHF ${fmtCHF(nachlass)}` : 'nur Quoten (keine Beträge erfasst)'}</p>
            </div>
          </div>

          {/* Erben-Tabelle */}
          <div className="lc-card p-5 overflow-x-auto">
            <p className="lc-overline mb-3">Erbteile & Pflichtteile</p>
            <table className="w-full text-body-s">
              <thead>
                <tr className="text-left text-ink-500 border-b border-line">
                  <th className="py-1.5 pr-3 font-medium">Erbe</th>
                  <th className="py-1.5 pr-3 font-medium">Gesetzlicher Erbteil</th>
                  <th className="py-1.5 pr-3 font-medium">Pflichtteil</th>
                  {nachlass != null && <th className="py-1.5 pr-3 font-medium num">Erbteil (CHF)</th>}
                  {nachlass != null && <th className="py-1.5 font-medium num">Pflichtteil (CHF)</th>}
                </tr>
              </thead>
              <tbody>
                {ergebnis.erben.map((e) => (
                  <tr key={e.bezeichnung} className="border-b border-line last:border-0">
                    <td className="py-1.5 pr-3 text-ink-900">{e.bezeichnung}{e.anzahl ? ` – ${e.anzahl} Personen, je:` : ''}</td>
                    <td className="py-1.5 pr-3 num text-ink-900">{fmtB(e.erbteil)}</td>
                    <td className="py-1.5 pr-3 num">{istNull(e.pflichtteil) ? <span className="text-ink-500">– kein PT</span> : <span className="text-ink-900">{fmtB(e.pflichtteil)}</span>}</td>
                    {e.erbteilChf != null && <td className="py-1.5 pr-3 num text-ink-700">{fmtCHF(e.erbteilChf)}</td>}
                    {e.pflichtteilChf != null && <td className="py-1.5 num text-ink-700">{istNull(e.pflichtteil) ? '–' : fmtCHF(e.pflichtteilChf)}</td>}
                  </tr>
                ))}
                <tr className="bg-surface">
                  <td className="py-1.5 pr-3 font-semibold text-ink-900">Verfügbare Quote</td>
                  <td className="py-1.5 pr-3" />
                  <td className="py-1.5 pr-3 num font-semibold text-brass-700">{fmtB(ergebnis.verfuegbareQuote)}</td>
                  {nachlass != null && <td className="py-1.5 pr-3" />}
                  {ergebnis.verfuegbareQuoteChf != null && <td className="py-1.5 num font-semibold text-brass-700">{fmtCHF(ergebnis.verfuegbareQuoteChf)}</td>}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quoten-Balken: gebundener Teil vs. verfügbare Quote */}
          <div className="lc-card p-5">
            <p className="lc-overline mb-3">Gebundene vs. verfügbare Quote</p>
            <div className="flex h-7 rounded-md overflow-hidden border border-line">
              {ergebnis.erben.filter((e) => !istNull(e.pflichtteil)).map((e) => {
                const breite = zahl(e.pflichtteil) * (e.anzahl ?? 1) * 100;
                return (
                  <div key={e.bezeichnung} className="bg-warn-bg border-r border-line flex items-center justify-center"
                    style={{ width: `${breite}%` }} title={`${e.bezeichnung}: Pflichtteil ${fmtB(e.pflichtteil)}${e.anzahl ? ` × ${e.anzahl}` : ''}`}>
                    <span className="text-micro text-warn-700 truncate px-1">{fmtB(e.pflichtteil)}{e.anzahl ? `×${e.anzahl}` : ''}</span>
                  </div>
                );
              })}
              <div className="flex items-center justify-center flex-1" style={{ background: 'var(--brass-100)' }}
                title={`Verfügbare Quote: ${fmtB(ergebnis.verfuegbareQuote)}`}>
                <span className="text-micro text-brass-700 font-semibold">verfügbar {fmtB(ergebnis.verfuegbareQuote)}</span>
              </div>
            </div>
            <p className="text-body-s text-ink-500 mt-2">Gelb: Pflichtteile (gebundene Quote) · Gold: frei verfügbar (Testament/Erbvertrag)</p>
          </div>

          <ErgebnisAnzeige titel="Erbteilung & Pflichtteil (Art. 457 ff., 462, 470 ff. ZGB)" ergebnis={ergebnis} />
          {ergebnis && <BegruendungAbsatz text={begruendungsAbsatz(ergebnis)} />}
          <AktenzeichenFeld value={aktenzeichen} onChange={setAktenzeichen} />
          <div className="flex flex-wrap items-center gap-3">
            <PdfExportButton config={pdfConfig} />
            <LinkTeilenButton query={() => permalinkKodieren(ET_LINK_SPEC, {
              todesdatum, zivilstand, scheidung, scheidung472, kinderLebend, staemme,
              vater, mutter, dritteParentel, gueterrechtAn, gueterstand, betraege,
            })} />
          </div>
        </div>
      )}
    </div>
  );
}
