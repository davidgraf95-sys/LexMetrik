import { useMemo, useState } from 'react';
import { BeruehrtRahmen, Checkbox, FehlerBox, Field, GruppenTitel, inputCls } from '../vorlagen/ui';
import { ErgebnisBlock } from '../ErgebnisBlock';
import { PflichtDisclaimer } from '../PflichtDisclaimer';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { BetragsFeld } from '../BetragsFeld';
import { PdfExportButton } from '../PdfExport';
import { AktenzeichenFeld } from '../AktenzeichenFeld';
import { BegruendungSlot } from '../BegruendungSlot';
import { LinkTeilenButton } from '../LinkTeilenButton';
import { permalinkKodieren, permalinkLesen, type PermalinkSpec } from '../../lib/permalink';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import { berechneStreitwert, type Begehren, type BegehrenTyp, type WiederkehrDauer, type StreitwertErgebnis } from '../../lib/streitwert';

// ─── Streitwert-Form (Art. 91–94a ZPO) — Quick-Win B.9 ──────────────────────
// Reine Darstellung (§3): Begehren-Editor + Weichen; gerechnet wird in
// lib/streitwert.ts. Beträge als Roh-Strings (BetragsFeld, CHF-Apostroph).

type BegehrenRoh = {
  typ: BegehrenTyp;
  betrag: string;       // einmalig
  jahresbetrag: string; // wiederkehrend
  dauer: WiederkehrDauer;
  jahre: string;
  barwert: string;      // Leibrente
};

const LEERES_BEGEHREN: BegehrenRoh = { typ: 'einmalig', betrag: '', jahresbetrag: '', dauer: 'unbestimmt', jahre: '', barwert: '' };

const TYP_LABEL: { code: BegehrenTyp; label: string }[] = [
  { code: 'einmalig', label: 'einmalig bezifferte Forderung' },
  { code: 'wiederkehrend', label: 'wiederkehrende Nutzung/Leistung (Art. 92)' },
  { code: 'unbeziffert', label: 'nicht beziffert / Naturalleistung / Verbandsklage' },
];

const zahl = (roh: string): number | undefined => {
  if (roh.trim() === '') return undefined;
  const n = Number(roh);
  return Number.isFinite(n) ? n : undefined;
};

// Hydration-Guard (Pflicht-Konvention für Array-Felder): unbekannte Werte
// aus dem Permalink werden feldweise auf gültige Defaults normalisiert.
function normalisiereBegehren(roh: unknown): BegehrenRoh[] {
  if (!Array.isArray(roh) || roh.length === 0) return [LEERES_BEGEHREN];
  return roh.slice(0, 10).map((b) => {
    const o = (b ?? {}) as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === 'string' && /^\d*(\.\d+)?$/.test(v) ? v : '');
    return {
      typ: ['einmalig', 'wiederkehrend', 'unbeziffert'].includes(o.typ as string) ? (o.typ as BegehrenTyp) : 'einmalig',
      betrag: str(o.betrag), jahresbetrag: str(o.jahresbetrag),
      dauer: ['unbestimmt', 'bestimmt', 'leibrente'].includes(o.dauer as string) ? (o.dauer as WiederkehrDauer) : 'unbestimmt',
      jahre: str(o.jahre), barwert: str(o.barwert),
    };
  });
}

const SW_LINK_SPEC: PermalinkSpec<Record<string, unknown>> = {
  begehren: {
    p: 'b', typ: 'json',
    gueltig: (v): boolean => Array.isArray(v) && v.length >= 1 && v.length <= 10,
  },
  ausschliessend: { p: 'x', typ: 'bool' },
  widerklage: { p: 'w', typ: 'num', gueltig: (n) => Number.isFinite(n) && n >= 0 },
  wkSchliesstAus: { p: 'wx', typ: 'bool' },
  teilklage: { p: 'tk', typ: 'bool' },
};

const SW_DISCLAIMER =
  'Der Rechner bestimmt den Streitwert nach Art. 91–94a ZPO aus den Rechtsbegehren. ' +
  'Nicht bezifferte Begehren, Leibrenten-Barwerte und Verbandsklagen setzt das Gericht nach Ermessen fest — hier wird nichts geschätzt. ' +
  'Vor Bundesgericht gilt die eigene Streitwertordnung der Art. 51–53 BGG.';

export function StreitwertForm() {
  const ausLink = useMemo(() => {
    try { return permalinkLesen(SW_LINK_SPEC, typeof window === 'undefined' ? '' : window.location.search); }
    catch { return {} as Record<string, unknown>; }
  }, []);

  const [begehren, setBegehren] = useState<BegehrenRoh[]>(() => normalisiereBegehren(ausLink.begehren));
  const [ausschliessend, setAusschliessend] = useState<boolean>((ausLink.ausschliessend as boolean) ?? false);
  const [widerklageRoh, setWiderklageRoh] = useState<string>(ausLink.widerklage != null ? String(ausLink.widerklage) : '');
  const [wkSchliesstAus, setWkSchliesstAus] = useState<boolean>((ausLink.wkSchliesstAus as boolean) ?? false);
  const [teilklage, setTeilklage] = useState<boolean>((ausLink.teilklage as boolean) ?? false);
  const [aktenzeichen, setAktenzeichen] = useState('');

  const setFeld = (i: number, patch: Partial<BegehrenRoh>) =>
    setBegehren((alt) => alt.map((b, j) => (j === i ? { ...b, ...patch } : b)));

  const { ergebnis, fehler } = useMemo((): { ergebnis: StreitwertErgebnis | null; fehler: string | null } => {
    try {
      const eingabe: Begehren[] = begehren.map((b) => ({
        typ: b.typ,
        betragCHF: zahl(b.betrag),
        jahresbetragCHF: zahl(b.jahresbetrag),
        dauer: b.typ === 'wiederkehrend' ? b.dauer : undefined,
        jahre: zahl(b.jahre),
        barwertCHF: zahl(b.barwert),
      }));
      // erst rechnen, wenn jedes bezifferbare Begehren eine Eingabe hat
      const unvollstaendig = eingabe.some((b, i) =>
        (b.typ === 'einmalig' && b.betragCHF === undefined)
        || (b.typ === 'wiederkehrend' && begehren[i].dauer !== 'leibrente' && b.jahresbetragCHF === undefined)
        || (b.typ === 'wiederkehrend' && begehren[i].dauer === 'bestimmt' && b.jahre === undefined));
      if (unvollstaendig) return { ergebnis: null, fehler: null };
      const wk = zahl(widerklageRoh);
      return {
        ergebnis: berechneStreitwert({
          begehren: eingabe,
          begehrenSchliessenSichAus: ausschliessend,
          widerklage: wk !== undefined ? { betragCHF: wk, schliesstAus: wkSchliesstAus } : undefined,
          hauptklageIstTeilklage: teilklage,
        }),
        fehler: null,
      };
    } catch (e) {
      return { ergebnis: null, fehler: e instanceof Error ? e.message : String(e) };
    }
  }, [begehren, ausschliessend, widerklageRoh, wkSchliesstAus, teilklage]);

  const pdfConfig: PdfDocConfig = {
    aktenzeichen: aktenzeichen.trim() || undefined,
    title: 'Streitwert (Art. 91–94a ZPO)',
    domain: 'streitwert',
    fileBase: 'Streitwert',
    inputs: {
      ...Object.fromEntries(begehren.map((b, i) => [
        `Begehren ${i + 1}`,
        b.typ === 'einmalig' ? `einmalig, CHF ${b.betrag || '–'}`
          : b.typ === 'unbeziffert' ? 'nicht beziffert (Ermessen)'
          : `wiederkehrend (${b.dauer}), CHF ${b.dauer === 'leibrente' ? (b.barwert || '–') + ' Barwert' : (b.jahresbetrag || '–') + '/Jahr'}${b.dauer === 'bestimmt' ? `, ${b.jahre || '–'} Jahre` : ''}`,
      ])),
      ...(begehren.length > 1 ? { 'Begehren schliessen sich aus': ausschliessend ? 'ja' : 'nein' } : {}),
      'Widerklage': widerklageRoh ? `CHF ${widerklageRoh}${wkSchliesstAus ? ' (ausschliessend)' : ''}` : 'keine',
      ...(widerklageRoh ? { 'Hauptklage ist Teilklage': teilklage ? 'ja (Art. 94 Abs. 3 ZPO)' : 'nein' } : {}),
    },
    sections: ergebnis ? [{ titel: 'Streitwert (Art. 91–94a ZPO)', ergebnis }] : [],
    disclaimer: SW_DISCLAIMER,
  };

  return (
    <BeruehrtRahmen>
    <div className="space-y-6">
      <PflichtDisclaimer kurz="Streitwert nach Rechtsbegehren (Art. 91 ff. ZPO); Ermessens-Konstellationen setzt das Gericht fest." text={SW_DISCLAIMER} />

      {/* Begehren-Editor */}
      <div className="space-y-4">
        {begehren.map((b, i) => (
          <div key={i} className="border border-line rounded-md p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <GruppenTitel>Begehren {i + 1}</GruppenTitel>
              {begehren.length > 1 && (
                <button type="button" className="text-body-s text-ink-500 hover:text-danger-700"
                  onClick={() => setBegehren((alt) => alt.filter((_, j) => j !== i))}>
                  Entfernen
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Art des Begehrens">
                <select value={b.typ} onChange={(e) => setFeld(i, { typ: e.target.value as BegehrenTyp })} className={inputCls}>
                  {TYP_LABEL.map((t) => <option key={t.code} value={t.code}>{t.label}</option>)}
                </select>
              </Field>
              {b.typ === 'einmalig' && (
                <Field label="Forderungsbetrag (CHF)" hint="ohne Zinsen und Kosten (Art. 91 Abs. 1 ZPO)">
                  <BetragsFeld value={b.betrag} onChange={(v) => setFeld(i, { betrag: v })} className={inputCls}
                    placeholder="z. B. 50'000" aria-label={`Betrag Begehren ${i + 1}`} />
                </Field>
              )}
              {b.typ === 'wiederkehrend' && (
                <>
                  <Field label="Dauer">
                    <select value={b.dauer} onChange={(e) => setFeld(i, { dauer: e.target.value as WiederkehrDauer })} className={inputCls}>
                      <option value="unbestimmt">ungewiss / unbeschränkt (× 20)</option>
                      <option value="bestimmt">bestimmte Dauer</option>
                      <option value="leibrente">Leibrente (Barwert)</option>
                    </select>
                  </Field>
                  {b.dauer !== 'leibrente' && (
                    <Field label="Jahresbetrag (CHF)" hint="Wert der einjährigen Nutzung/Leistung (Art. 92 Abs. 1 ZPO)">
                      <BetragsFeld value={b.jahresbetrag} onChange={(v) => setFeld(i, { jahresbetrag: v })} className={inputCls}
                        placeholder="z. B. 12'000" aria-label={`Jahresbetrag Begehren ${i + 1}`} />
                    </Field>
                  )}
                  {b.dauer === 'bestimmt' && (
                    <Field label="Dauer (Jahre)">
                      <input type="number" min={1} value={b.jahre} onChange={(e) => setFeld(i, { jahre: e.target.value })}
                        className={inputCls} aria-label={`Dauer Begehren ${i + 1}`} />
                    </Field>
                  )}
                  {b.dauer === 'leibrente' && (
                    <Field label="Barwert (CHF)" hint="Art. 92 Abs. 2 ZPO — ohne Eingabe setzt das Gericht fest">
                      <BetragsFeld value={b.barwert} onChange={(v) => setFeld(i, { barwert: v })} className={inputCls}
                        placeholder="versicherungsmathematischer Barwert" aria-label={`Barwert Begehren ${i + 1}`} />
                    </Field>
                  )}
                </>
              )}
              {b.typ === 'unbeziffert' && (
                <p className="text-body-s text-ink-500 self-center">
                  Forderung unbestimmter Höhe, Gestaltungs-/Naturalleistung oder Verbandsklage (Art. 94a ZPO) — das Gericht setzt den Streitwert fest.
                </p>
              )}
            </div>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className="lc-btn-outline lc-btn-sm"
            onClick={() => setBegehren((alt) => (alt.length < 10 ? [...alt, LEERES_BEGEHREN] : alt))}>
            + Begehren hinzufügen
          </button>
          {begehren.length > 1 && (
            <Checkbox checked={ausschliessend} onChange={setAusschliessend}
              label="die Begehren schliessen sich gegenseitig aus (kein Zusammenrechnen, Art. 93 ZPO)" />
          )}
        </div>
      </div>

      {/* Widerklage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Widerklage (CHF)" hint="leer lassen, wenn keine Widerklage (Art. 94 ZPO)">
          <BetragsFeld value={widerklageRoh} onChange={setWiderklageRoh} className={inputCls}
            placeholder="Streitwert der Widerklage" aria-label="Streitwert der Widerklage" />
        </Field>
        {widerklageRoh.trim() !== '' && (
          <Field label="Weichen zur Widerklage">
            <div className="space-y-2">
              <Checkbox checked={wkSchliesstAus} onChange={setWkSchliesstAus}
                label="Klage und Widerklage schliessen sich gegenseitig aus (Art. 94 Abs. 2 ZPO)" />
              <Checkbox checked={teilklage} onChange={setTeilklage}
                label="die Hauptklage ist eine Teilklage (Kosten nur nach Hauptklage, Art. 94 Abs. 3 ZPO)" />
            </div>
          </Field>
        )}
      </div>

      {fehler && <FehlerBox fehler={[fehler]} />}

      {ergebnis && (
        <ErgebnisBlock>
          <ErgebnisAnzeige titel="Streitwert (Art. 91–94a ZPO)" ergebnis={ergebnis} />
          <BegruendungSlot ergebnis={ergebnis} />
          <AktenzeichenFeld value={aktenzeichen} onChange={setAktenzeichen} />
          <div className="flex flex-wrap items-center gap-3">
            <PdfExportButton config={pdfConfig} />
            <LinkTeilenButton query={() => permalinkKodieren(SW_LINK_SPEC, {
              begehren, ausschliessend, widerklage: zahl(widerklageRoh), wkSchliesstAus, teilklage,
            })} />
          </div>
        </ErgebnisBlock>
      )}
    </div>
    </BeruehrtRahmen>
  );
}
