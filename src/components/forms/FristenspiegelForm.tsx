import { useMemo, useState } from 'react';
import { Field, inputCls } from '../vorlagen/ui';
import { DatumsFeld } from '../DatumsFeld';
import { BetragsFeld } from '../BetragsFeld';
import { IcsExportButton } from '../IcsExportButton';
import { LinkTeilenButton } from '../LinkTeilenButton';
import { KANTONE } from '../../lib/kantone';
import { fedlexLinkFuerArtikel } from '../../lib/fedlex';
import { useLocale, fedlexLokalisiert } from '../locale';
import { icsSammel } from '../../lib/icsExport';
import { permalinkKodieren, permalinkLesen } from '../../lib/permalink';
import { FSP_LINK_SPEC } from '../../lib/rechnerPermalinks';
import {
  berechneVermieterkuendigungsSpiegel, VK_KUENDIGUNGSARTEN,
  type VermieterkuendigungSpiegelInput,
} from '../../lib/fristenspiegel/vermieterkuendigung';
import { berechneZivilentscheidsSpiegel } from '../../lib/fristenspiegel/zivilentscheid';
import { berechneZahlungsbefehlsSpiegel } from '../../lib/fristenspiegel/zahlungsbefehl';
import { berechneKlagebewilligungsSpiegel } from '../../lib/fristenspiegel/klagebewilligung';
import { berechneErbgangsSpiegel } from '../../lib/fristenspiegel/erbgang';
import { berechneAgKuendigungsSpiegel } from '../../lib/fristenspiegel/agKuendigung';
import type { Fristnatur, FristenspiegelErgebnis, SpiegelZeile } from '../../lib/fristenspiegel/typen';
import type { Kanton } from '../../types/legal';

// ─── Fristenspiegel-Form (FAHRPLAN-PRAXIS 3.1b/3.1c) ────────────────────────
// EIN Ereignis → ALLE parallelen Fristen als Tabelle. Reine Darstellung (§3):
// jede Zeile kommt aus lib/fristenspiegel/* (Orchestrierer über bestehende
// Engines); hier wird nichts gerechnet. Ereignisse gemäss Konzept-Dossier:
// A.4 Vermieter-Kündigung (Pilot) · A.1 Zivilentscheid; weitere folgen.

type Ereignis = 'vermieterkuendigung' | 'zivilentscheid' | 'zahlungsbefehl' | 'klagebewilligung' | 'erbgang' | 'agkuendigung';

const EREIGNISSE: { code: Ereignis; label: string }[] = [
  { code: 'zivilentscheid', label: 'Zustellung eines erstinstanzlichen Zivilentscheids' },
  { code: 'zahlungsbefehl', label: 'Zustellung des Zahlungsbefehls' },
  { code: 'klagebewilligung', label: 'Zustellung der Klagebewilligung' },
  { code: 'vermieterkuendigung', label: 'Zugang einer Vermieter-Kündigung (Wohn-/Geschäftsräume)' },
  { code: 'agkuendigung', label: 'Arbeitgeber-Kündigung: Ende der Kündigungsfrist (Art. 336b OR)' },
  { code: 'erbgang', label: 'Kenntnis des Erbgangs / Todesfall' },
];
const EREIGNIS_CODES = EREIGNISSE.map((e) => e.code);

const NATUR_LABEL: Record<Fristnatur, string> = {
  gesetzlich: 'gesetzliche Frist', gerichtlich: 'gerichtliche Frist',
  verwirkung: 'Verwirkung', verjaehrung: 'Verjährung',
  wartefrist: 'Wartefrist', klagefrist: 'Klagefrist', ordnungsfrist: 'Ordnungsfrist',
};

function NormPill({ normRef }: { normRef: string }) {
  // Locale-Lokalisierung wie NormLink/RechnerKopf (Deploy-Bug-Check
  // 7.6.2026, MITTEL: war der einzige Rechner ohne fedlexLokalisiert).
  const { locale } = useLocale();
  const roh = fedlexLinkFuerArtikel(normRef);
  const url = roh ? fedlexLokalisiert(roh, locale) : null;
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700"
      title={`${normRef} auf Fedlex öffnen`}>{normRef}</a>
  ) : (
    <span className="lc-chip">{normRef}</span>
  );
}

function ZeileAnzeige({ z }: { z: SpiegelZeile }) {
  return (
    <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-2 sm:items-center">
      <div className="min-w-0 space-y-1">
        <p className="text-body-s font-medium text-ink-900">{z.label}</p>
        <p className="flex flex-wrap items-center gap-1.5">
          <NormPill normRef={z.normRef} />
          <span className="lc-badge lc-badge-soft">{NATUR_LABEL[z.fristnatur]}</span>
        </p>
        {z.bedingung && <p className="text-xs text-ink-500">{z.bedingung}</p>}
      </div>
      <div className="flex items-center gap-3 sm:justify-end">
        {z.status === 'berechnet' || (z.status === 'bedingt' && z.endeText) ? (
          <>
            <span className="num text-body-l font-semibold text-ink-900 whitespace-nowrap">{z.endePraefix ?? 'bis'} {z.endeText}</span>
            {/* Wartefrist («frühestens ab»): keine 3-Tage-VORfrist-Erinnerung —
                Mahnung vor dem frühestmöglichen Termin wäre richtungsverkehrt
                (Deploy-Bug-Check 7.6.2026, NIEDRIG). */}
            <IcsExportButton endISO={z.endeISO} titel={z.label} className="lc-btn-outline lc-btn-sm"
              vorfristTage={z.fristnatur === 'wartefrist' ? 0 : 3}
              dateiName={`${z.key}.ics`} beschreibung={`${z.normRef} — LexMetrik Fristenspiegel`} />
          </>
        ) : (
          <span className="lc-badge lc-badge-warn">
            {z.status === 'ausgeschlossen' ? 'ausgeschlossen' : 'Hinweis'}
          </span>
        )}
      </div>
    </div>
  );
}

export function FristenspiegelForm() {
  // Vorbefüllung aus dem Permalink (Brücken-Ziel; SSR-sicher).
  const start = useMemo(() => {
    try { return permalinkLesen(FSP_LINK_SPEC, typeof window === 'undefined' ? '' : window.location.search); }
    catch { return {}; }
  }, []);

  const [ereignis, setEreignis] = useState<Ereignis>(
    EREIGNIS_CODES.includes(start.ereignis as Ereignis) ? (start.ereignis as Ereignis) : 'zivilentscheid');
  const [kanton, setKanton] = useState<Kanton>((start.kanton as Kanton) ?? 'ZH');

  // ── A.4 Vermieter-Kündigung ──
  const [zugang, setZugang] = useState<string>(start.zugang ?? '');
  const [objekt, setObjekt] = useState<VermieterkuendigungSpiegelInput['objekt']>(start.objekt ?? 'wohnung');
  const [kuendigungsart, setKuendigungsart] = useState<VermieterkuendigungSpiegelInput['kuendigungsart']>(start.kuendigungsart ?? 'ordentlich');

  // ── A.1 Zivilentscheid ──
  const [zustellung, setZustellung] = useState<string>(start.zustellung ?? '');
  const [vermoegensrechtlich, setVermoegensrechtlich] = useState<boolean>(start.vermoegensrechtlich ?? true);
  const [streitwertRoh, setStreitwertRoh] = useState<string>(start.streitwertCHF != null ? String(start.streitwertCHF) : '');
  const [verfahren, setVerfahren] = useState<'ordentlich_vereinfacht' | 'summarisch'>(start.verfahren ?? 'ordentlich_vereinfacht');
  const [familienSummarsache, setFamilienSummarsache] = useState<boolean>(start.familienSummarsache ?? false);
  const [mietOderArbeit, setMietOderArbeit] = useState<boolean>(start.mietOderArbeit ?? false);
  const [nurDispositiv, setNurDispositiv] = useState<boolean>(start.nurDispositiv ?? false);
  const streitwert = streitwertRoh.trim() === '' ? null : Number(streitwertRoh);

  // ── A.7 Klagebewilligung · A.6 Erbgang ──
  const [mietOderPacht, setMietOderPacht] = useState<boolean>(start.mietOderPacht ?? false);
  const [erbenstellung, setErbenstellung] = useState<'gesetzlich' | 'eingesetzt'>(start.erbenstellung ?? 'gesetzlich');

  const istISO = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

  const ergebnis: FristenspiegelErgebnis | null = useMemo(() => {
    try {
      if (ereignis === 'vermieterkuendigung') {
        if (!istISO(zugang)) return null;
        return berechneVermieterkuendigungsSpiegel({ zugang, objekt, kanton, kuendigungsart });
      }
      if (!istISO(zustellung)) return null;
      if (ereignis === 'zahlungsbefehl') return berechneZahlungsbefehlsSpiegel({ zustellung, kanton });
      if (ereignis === 'klagebewilligung') return berechneKlagebewilligungsSpiegel({ zustellung, kanton, mietOderPacht });
      if (ereignis === 'erbgang') return berechneErbgangsSpiegel({ datum: zustellung, kanton, erbenstellung });
      if (ereignis === 'agkuendigung') return berechneAgKuendigungsSpiegel({ beendigung: zustellung });
      if (vermoegensrechtlich && (streitwert === null || !Number.isFinite(streitwert))) return null;
      return berechneZivilentscheidsSpiegel({
        zustellung, kanton, vermoegensrechtlich,
        streitwertCHF: vermoegensrechtlich ? streitwert : null,
        verfahren, familienSummarsache: verfahren === 'summarisch' ? familienSummarsache : false,
        mietOderArbeit, nurDispositiv,
      });
    } catch { return null; }
  }, [ereignis, zugang, objekt, kanton, kuendigungsart, zustellung, vermoegensrechtlich, streitwert, verfahren, familienSummarsache, mietOderArbeit, nurDispositiv, mietOderPacht, erbenstellung]);

  const sammelIcs = () => {
    if (!ergebnis) return;
    const eintraege = ergebnis.zeilen
      .filter((z) => z.endeISO)
      .map((z) => ({ titel: z.label, endISO: z.endeISO!, beschreibung: `${z.normRef} — LexMetrik Fristenspiegel`, vorfristTage: 3 }));
    const blob = new Blob([icsSammel(eintraege)], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Fristenspiegel.ics'; a.click();
    URL.revokeObjectURL(url);
  };

  const linkWerte = () => {
    switch (ereignis) {
      case 'vermieterkuendigung': return { ereignis, kanton, zugang, objekt, kuendigungsart };
      case 'zahlungsbefehl': return { ereignis, kanton, zustellung };
      case 'klagebewilligung': return { ereignis, kanton, zustellung, mietOderPacht };
      case 'erbgang': return { ereignis, kanton, zustellung, erbenstellung };
      case 'agkuendigung': return { ereignis, zustellung };
      default: return { ereignis, kanton, zustellung, vermoegensrechtlich, streitwertCHF: vermoegensrechtlich ? streitwert ?? undefined : undefined, verfahren, familienSummarsache, mietOderArbeit, nurDispositiv };
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Ereignis" hint="Was wurde zugestellt / ist eingetreten?">
          <select value={ereignis} onChange={(e) => setEreignis(e.target.value as Ereignis)} className={inputCls} aria-label="Ereignis">
            {EREIGNISSE.map((e) => <option key={e.code} value={e.code}>{e.label}</option>)}
          </select>
        </Field>

        {ereignis === 'vermieterkuendigung' ? (
          <>
            <Field label="Ereignisdatum" hint="Empfang der Kündigung (absolute Empfangstheorie)">
              <DatumsFeld value={zugang} onChange={setZugang} aria-label="Empfang der Kündigung" />
            </Field>
            <Field label="Mietobjekt">
              <select value={objekt} onChange={(e) => setObjekt(e.target.value as VermieterkuendigungSpiegelInput['objekt'])} className={inputCls}>
                <option value="wohnung">Wohnräume</option>
                <option value="geschaeftsraum">Geschäftsräume</option>
              </select>
            </Field>
            <Field label="Kündigungsart" hint="Art. 257d/257f schliessen die Erstreckung aus (Art. 272a OR)">
              <select value={kuendigungsart} onChange={(e) => setKuendigungsart(e.target.value as VermieterkuendigungSpiegelInput['kuendigungsart'])} className={inputCls}>
                {VK_KUENDIGUNGSARTEN.map((a) => <option key={a.code} value={a.code}>{a.label}</option>)}
              </select>
            </Field>
            <Field label="Kanton" hint="Feiertage für Art. 78 OR (Werktagsverschiebung)">
              <select value={kanton} onChange={(e) => setKanton(e.target.value as Kanton)} className={inputCls}>
                {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </Field>
          </>
        ) : ereignis === 'zivilentscheid' ? (
          <>
            <Field label="Ereignisdatum" hint={nurDispositiv ? 'Eröffnung des Dispositivs' : 'Zustellung des begründeten Entscheids'}>
              <DatumsFeld value={zustellung} onChange={setZustellung} aria-label="Zustellung des Entscheids" />
            </Field>
            <Field label="Verfahren" hint="summarisch: 10 Tage, kein Stillstand (Art. 145 Abs. 2 lit. b ZPO)">
              <select value={verfahren} onChange={(e) => setVerfahren(e.target.value as 'ordentlich_vereinfacht' | 'summarisch')} className={inputCls}>
                <option value="ordentlich_vereinfacht">ordentlich / vereinfacht</option>
                <option value="summarisch">summarisch</option>
              </select>
            </Field>
            <Field label="Streitwert (CHF)" hint="massgeblich: zuletzt aufrechterhaltene Rechtsbegehren (Art. 308 Abs. 2 ZPO)">
              <div className="space-y-2">
                <BetragsFeld value={streitwertRoh} onChange={setStreitwertRoh} className={inputCls}
                  placeholder="z. B. 12'000" aria-label="Streitwert in Franken" />
                <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
                  <input type="checkbox" checked={!vermoegensrechtlich}
                    onChange={(e) => setVermoegensrechtlich(!e.target.checked)} />
                  nicht vermögensrechtliche Streitigkeit
                </label>
              </div>
            </Field>
            <Field label="Kanton" hint="Gerichtsort — Feiertage für die Endnormalisierung (Art. 142 Abs. 3 ZPO)">
              <select value={kanton} onChange={(e) => setKanton(e.target.value as Kanton)} className={inputCls}>
                {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </Field>
            <Field label="Weichen">
              <div className="space-y-2">
                {verfahren === 'summarisch' && (
                  <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
                    <input type="checkbox" checked={familienSummarsache} onChange={(e) => setFamilienSummarsache(e.target.checked)} />
                    familienrechtliche Summarsache (Art. 271/276/302/305 ZPO — 30 Tage, Art. 314 Abs. 2)
                  </label>
                )}
                <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
                  <input type="checkbox" checked={mietOderArbeit} onChange={(e) => setMietOderArbeit(e.target.checked)} />
                  arbeits- oder mietrechtlicher Fall (BGer-Grenze CHF 15&#8239;000, Art. 74 Abs. 1 lit. a BGG)
                </label>
                <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
                  <input type="checkbox" checked={nurDispositiv} onChange={(e) => setNurDispositiv(e.target.checked)} />
                  nur das Dispositiv wurde eröffnet (Art. 239 ZPO — zuerst Begründung verlangen)
                </label>
              </div>
            </Field>
          </>
        ) : (
          <>
            <Field label={ereignis === 'agkuendigung' ? 'Ende der Kündigungsfrist' : 'Ereignisdatum'}
              hint={ereignis === 'zahlungsbefehl' ? 'Zustellung des Zahlungsbefehls'
                : ereignis === 'klagebewilligung' ? 'Eröffnung/Zustellung der Klagebewilligung'
                : ereignis === 'agkuendigung' ? 'Beendigung des Arbeitsverhältnisses — im Sperrfristen-Rechner berechnen'
                : erbenstellung === 'gesetzlich' ? 'Kenntnis vom Tod des Erblassers (Art. 567 Abs. 2 ZGB)'
                : 'Zugang der amtlichen Mitteilung von der Verfügung (Art. 567 Abs. 2 ZGB)'}>
              <DatumsFeld value={zustellung} onChange={setZustellung} aria-label="Ereignisdatum" />
            </Field>
            {ereignis === 'klagebewilligung' && (
              <Field label="Streitsache">
                <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700 mt-2">
                  <input type="checkbox" checked={mietOderPacht} onChange={(e) => setMietOderPacht(e.target.checked)} />
                  Miete/Pacht von Wohn- und Geschäftsräumen bzw. landw. Pacht (30 Tage, Art. 209 Abs. 4 ZPO)
                </label>
              </Field>
            )}
            {ereignis === 'erbgang' && (
              <Field label="Erbenstellung" hint="bestimmt den Fristbeginn (Art. 567 Abs. 2 ZGB)">
                <select value={erbenstellung} onChange={(e) => setErbenstellung(e.target.value as 'gesetzlich' | 'eingesetzt')} className={inputCls}>
                  <option value="gesetzlich">gesetzliche Erbin / gesetzlicher Erbe</option>
                  <option value="eingesetzt">eingesetzte Erbin / eingesetzter Erbe</option>
                </select>
              </Field>
            )}
            {ereignis !== 'agkuendigung' && (
              <Field label="Kanton"
                hint={ereignis === 'zahlungsbefehl' ? 'staatlich anerkannte Feiertage (Endregel)' : 'Feiertage für die Werktags-/Endregel'}>
                <select value={kanton} onChange={(e) => setKanton(e.target.value as Kanton)} className={inputCls}>
                  {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </Field>
            )}
          </>
        )}
      </div>

      {ergebnis && (
        <div className="space-y-4">
          {/* Fristen-Tabelle: jede Zeile = ein Engine-Resultat */}
          <div className="border border-line rounded-md overflow-hidden">
            <div className="px-4 py-3 bg-surface border-b border-line flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-body-s font-medium text-ink-700">
                Fristen ab {ergebnis.ereignisDatumISO.split('-').reverse().join('.')}
              </p>
              <p className="lc-overline text-ink-500"><span className="num">{ergebnis.zeilen.length}</span> Zeilen</p>
            </div>
            <div className="divide-y divide-line">
              {ergebnis.zeilen.map((z) => <ZeileAnzeige key={z.key} z={z} />)}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" className="lc-btn-primary" onClick={sammelIcs}
              disabled={!ergebnis.zeilen.some((z) => z.endeISO)}>
              Alle Fristen als Kalender (.ics)
            </button>
            <LinkTeilenButton query={() => permalinkKodieren(FSP_LINK_SPEC, linkWerte())} />
          </div>

          {ergebnis.warnungen.length > 0 && (
            <div className="lc-notice-warn">
              <p className="lc-overline mb-1">Hinweise &amp; Weichen</p>
              {ergebnis.warnungen.map((w, i) => <p key={i} className="text-body-s text-warn-700">{w}</p>)}
            </div>
          )}
          <div className="lc-notice">
            <p className="lc-overline mb-1">Annahmen</p>
            {ergebnis.annahmen.map((a, i) => <p key={i} className="text-body-s text-ink-600">• {a}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}
