import { useMemo, useState } from 'react';
import { Field, inputCls } from '../vorlagen/ui';
import { DatumsFeld } from '../DatumsFeld';
import { IcsExportButton } from '../IcsExportButton';
import { LinkTeilenButton } from '../LinkTeilenButton';
import { KANTONE } from '../../lib/kantone';
import { fedlexLinkFuerArtikel } from '../../lib/fedlex';
import { icsSammel } from '../../lib/icsExport';
import { permalinkKodieren, permalinkLesen } from '../../lib/permalink';
import { FSP_LINK_SPEC } from '../../lib/rechnerPermalinks';
import {
  berechneVermieterkuendigungsSpiegel, VK_KUENDIGUNGSARTEN,
  type VermieterkuendigungSpiegelInput,
} from '../../lib/fristenspiegel/vermieterkuendigung';
import type { Fristnatur, SpiegelZeile } from '../../lib/fristenspiegel/typen';
import type { Kanton } from '../../types/legal';

// ─── Fristenspiegel-Form (FAHRPLAN-PRAXIS 3.1b, Pilot A.4) ──────────────────
// EIN Ereignis → ALLE parallelen Fristen als Tabelle. Reine Darstellung (§3):
// jede Zeile kommt aus lib/fristenspiegel/* (Orchestrierer über bestehende
// Engines); hier wird nichts gerechnet. Ereignis-Auswahl ist vorbereitet —
// Pilot kennt die Vermieter-Kündigung (A.4), weitere Ereignisse folgen dem
// Konzept-Dossier (A.1 Zivilentscheid, A.2 Zahlungsbefehl, …).

const EREIGNISSE = [
  { code: 'vermieterkuendigung', label: 'Zugang einer Vermieter-Kündigung (Wohn-/Geschäftsräume)' },
] as const;

const NATUR_LABEL: Record<Fristnatur, string> = {
  gesetzlich: 'gesetzliche Frist', gerichtlich: 'gerichtliche Frist',
  verwirkung: 'Verwirkung', verjaehrung: 'Verjährung',
  wartefrist: 'Wartefrist', klagefrist: 'Klagefrist', ordnungsfrist: 'Ordnungsfrist',
};

function NormPill({ normRef }: { normRef: string }) {
  const url = fedlexLinkFuerArtikel(normRef);
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
            <span className="num text-body-l font-semibold text-ink-900 whitespace-nowrap">bis {z.endeText}</span>
            <IcsExportButton endISO={z.endeISO} titel={z.label} className="lc-btn-outline lc-btn-sm"
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

  const [zugang, setZugang] = useState<string>(start.zugang ?? '');
  const [objekt, setObjekt] = useState<VermieterkuendigungSpiegelInput['objekt']>(start.objekt ?? 'wohnung');
  const [kanton, setKanton] = useState<Kanton>((start.kanton as Kanton) ?? 'ZH');
  const [kuendigungsart, setKuendigungsart] = useState<VermieterkuendigungSpiegelInput['kuendigungsart']>(start.kuendigungsart ?? 'ordentlich');

  const ergebnis = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(zugang)) return null;
    try { return berechneVermieterkuendigungsSpiegel({ zugang, objekt, kanton, kuendigungsart }); }
    catch { return null; }
  }, [zugang, objekt, kanton, kuendigungsart]);

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

  return (
    <div className="space-y-6">
      {/* Ereignis-Auswahl (Pilot: ein Ereignis; Liste wächst mit dem Konzept) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Ereignis" hint="Was wurde zugestellt / ist eingetreten?">
          <select value="vermieterkuendigung" onChange={() => {}} className={inputCls} aria-label="Ereignis">
            {EREIGNISSE.map((e) => <option key={e.code} value={e.code}>{e.label}</option>)}
          </select>
        </Field>
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
      </div>

      {ergebnis && (
        <div className="space-y-4">
          {/* Fristen-Tabelle: jede Zeile = ein Engine-Resultat */}
          <div className="border border-line rounded-md overflow-hidden">
            <div className="px-4 py-3 bg-surface border-b border-line flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-body-s font-medium text-ink-700">
                Parallele Fristen ab {ergebnis.ereignisDatumISO.split('-').reverse().join('.')}
              </p>
              <p className="lc-overline text-ink-500"><span className="num">{ergebnis.zeilen.length}</span> Fristen</p>
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
            <LinkTeilenButton query={() => permalinkKodieren(FSP_LINK_SPEC, {
              ereignis: 'vermieterkuendigung', zugang, objekt, kanton, kuendigungsart,
            })} />
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
