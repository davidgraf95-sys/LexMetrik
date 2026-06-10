import { useMemo, useState } from 'react';
import { FehlerBox, Field, inputCls } from '../vorlagen/ui';
import { ErgebnisBlock } from '../ErgebnisBlock';
import { PflichtDisclaimer } from '../PflichtDisclaimer';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { BetragsFeld } from '../BetragsFeld';
import { PdfExportButton } from '../PdfExport';
import { AktenzeichenFeld } from '../AktenzeichenFeld';
import { BegruendungAbsatz } from '../BegruendungAbsatz';
import { begruendungsAbsatz } from '../../lib/begruendung';
import { LinkTeilenButton } from '../LinkTeilenButton';
import { permalinkKodieren, permalinkLesen, einerVon, type PermalinkSpec } from '../../lib/permalink';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import { berechneBetreibungskosten, type GebvErgebnis } from '../../lib/gebvKosten';

// ─── Betreibungskosten-Form (GebV SchKG) — Quick-Win B.9 ────────────────────
// Reine Darstellung (§3): Tatbestand-Schalter + Beträge; gerechnet wird in
// lib/gebvKosten.ts (Tarif-Register amtlich verifiziert, Dossier
// gebv-schkg-kostenrechner.md).

const GK_LINK_SPEC: PermalinkSpec<Record<string, unknown>> = {
  forderung: { p: 'f', typ: 'num', gueltig: (n) => Number.isFinite(n) && n >= 0 },
  zb: { p: 'zb', typ: 'bool' },
  zbAusf: { p: 'za', typ: 'num', gueltig: (n) => Number.isInteger(n) && n >= 0 && n <= 20 },
  zbVersuche: { p: 'zv', typ: 'num', gueltig: (n) => Number.isInteger(n) && n >= 0 && n <= 20 },
  pf: { p: 'pf', typ: 'str', gueltig: einerVon('vollzogen', 'fruchtlos', 'erfolglos') },
  vw: { p: 'vw', typ: 'num', gueltig: (n) => Number.isFinite(n) && n >= 0 },
  vwKein: { p: 'vk', typ: 'bool' },
  ez: { p: 'ez', typ: 'num', gueltig: (n) => Number.isFinite(n) && n >= 0 },
  sw: { p: 'sw', typ: 'num', gueltig: (n) => Number.isFinite(n) && n >= 0 },
};

const GK_DISCLAIMER =
  'Amtliche Gebühren nach der GebV SchKG (Stand 1.1.2026): fixe Staffeln als Beträge, Rahmengebühren (z. B. Rechtsöffnung, Art. 48) nur als Bandbreite. ' +
  'Auslagen (Art. 13: Porti, Sachverständige) kommen effektiv hinzu und werden nicht beziffert. Der Schuldner trägt die Kosten; der Gläubiger schiesst sie vor (Art. 68 SchKG).';

const zahl = (roh: string): number | undefined => {
  if (roh.trim() === '') return undefined;
  const n = Number(roh);
  return Number.isFinite(n) ? n : undefined;
};

export function GebvKostenForm() {
  const ausLink = useMemo(() => {
    try { return permalinkLesen(GK_LINK_SPEC, typeof window === 'undefined' ? '' : window.location.search); }
    catch { return {} as Record<string, unknown>; }
  }, []);

  const [forderung, setForderung] = useState<string>(ausLink.forderung != null ? String(ausLink.forderung) : '');
  const [zb, setZb] = useState<boolean>((ausLink.zb as boolean) ?? true);
  const [zbAusf, setZbAusf] = useState<string>(ausLink.zbAusf != null ? String(ausLink.zbAusf) : '0');
  const [zbVersuche, setZbVersuche] = useState<string>(ausLink.zbVersuche != null ? String(ausLink.zbVersuche) : '0');
  const [pf, setPf] = useState<'' | 'vollzogen' | 'fruchtlos' | 'erfolglos'>((ausLink.pf as 'vollzogen') ?? '');
  const [vw, setVw] = useState<string>(ausLink.vw != null ? String(ausLink.vw) : '');
  const [vwKein, setVwKein] = useState<boolean>((ausLink.vwKein as boolean) ?? false);
  const [ez, setEz] = useState<string>(ausLink.ez != null ? String(ausLink.ez) : '');
  const [sw, setSw] = useState<string>(ausLink.sw != null ? String(ausLink.sw) : '');
  const [aktenzeichen, setAktenzeichen] = useState('');

  const { ergebnis, fehler } = useMemo((): { ergebnis: GebvErgebnis | null; fehler: string | null } => {
    const f = zahl(forderung);
    if (f === undefined) return { ergebnis: null, fehler: null };
    try {
      return {
        ergebnis: berechneBetreibungskosten({
          forderungCHF: f,
          zahlungsbefehl: zb ? { weitereAusfertigungen: zahl(zbAusf) ?? 0, zustellversuche: zahl(zbVersuche) ?? 0 } : undefined,
          pfaendung: pf ? { ausgang: pf } : undefined,
          verwertung: zahl(vw) !== undefined ? { betragCHF: zahl(vw)!, keinErwerber: vwKein } : undefined,
          einzahlung: zahl(ez) !== undefined ? { summeCHF: zahl(ez)! } : undefined,
          entscheidSummarsache: zahl(sw) !== undefined ? { streitwertCHF: zahl(sw)! } : undefined,
        }),
        fehler: null,
      };
    } catch (e) {
      return { ergebnis: null, fehler: e instanceof Error ? e.message : String(e) };
    }
  }, [forderung, zb, zbAusf, zbVersuche, pf, vw, vwKein, ez, sw]);

  const pdfConfig: PdfDocConfig = {
    aktenzeichen: aktenzeichen.trim() || undefined,
    title: 'Betreibungskosten (GebV SchKG)',
    domain: 'gebv-kosten',
    fileBase: 'Betreibungskosten',
    inputs: {
      'Forderung': forderung ? `CHF ${forderung}` : '–',
      'Zahlungsbefehl': zb ? `ja (${zbAusf} weitere Ausf., ${zbVersuche} Zustellversuche)` : 'nein',
      'Pfändung': pf || 'keine',
      'Verwertung': vw ? `CHF ${vw}${vwKein ? ' (Schätzwert, kein Erwerber)' : ' (Erlös)'}` : 'keine',
      'Einzahlung/Überweisung': ez ? `CHF ${ez}` : 'keine',
      'Entscheid Summarsache (Streitwert)': sw ? `CHF ${sw}` : 'keiner',
    },
    sections: ergebnis ? [{ titel: 'Betreibungskosten (GebV SchKG, Stand 1.1.2026)', ergebnis }] : [],
    disclaimer: GK_DISCLAIMER,
  };

  return (
    <div className="space-y-6">
      <PflichtDisclaimer kurz="Amtliche Gebühren je Betreibungsschritt (GebV SchKG); Rahmengebühren nur als Bandbreite, Auslagen effektiv." text={GK_DISCLAIMER} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Forderung in Betreibung (CHF)" hint="bezifferte Forderung — nicht bezifferte Zinsen ausser Betracht (Art. 6 GebV SchKG)">
          <BetragsFeld value={forderung} onChange={setForderung} className={inputCls}
            placeholder="z. B. 5'000" aria-label="Forderung in Franken" />
        </Field>
        <Field label="Zahlungsbefehl (Art. 16)">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" checked={zb} onChange={(e) => setZb(e.target.checked)} />
              Zahlungsbefehl erlassen/zugestellt
            </label>
            {zb && (
              <div className="grid grid-cols-2 gap-3">
                <label className="text-body-s text-ink-700">weitere Ausfertigungen
                  <input type="number" min={0} max={20} value={zbAusf} onChange={(e) => setZbAusf(e.target.value)} className={inputCls} aria-label="Weitere Ausfertigungen" />
                </label>
                <label className="text-body-s text-ink-700">Zustellversuche (Abs. 3)
                  <input type="number" min={0} max={20} value={zbVersuche} onChange={(e) => setZbVersuche(e.target.value)} className={inputCls} aria-label="Zustellversuche" />
                </label>
              </div>
            )}
          </div>
        </Field>
        <Field label="Pfändung (Art. 20)">
          <select value={pf} onChange={(e) => setPf(e.target.value as typeof pf)} className={inputCls} aria-label="Pfändung">
            <option value="">keine</option>
            <option value="vollzogen">vollzogen (inkl. Pfändungsurkunde)</option>
            <option value="fruchtlos">fruchtlos (halbe Gebühr, min. CHF 10)</option>
            <option value="erfolglos">erfolgloser Versuch (CHF 10)</option>
          </select>
        </Field>
        <Field label="Verwertung (Art. 30)" hint="Erlös; ohne Erwerber: Schätzwert">
          <div className="space-y-2">
            <BetragsFeld value={vw} onChange={setVw} className={inputCls}
              placeholder="Erlös/Schätzwert (leer = keine)" aria-label="Verwertungserlös" />
            {vw.trim() !== '' && (
              <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" checked={vwKein} onChange={(e) => setVwKein(e.target.checked)} />
                kein Erwerber gefunden (½, max. CHF 1'000 — Abs. 4)
              </label>
            )}
          </div>
        </Field>
        <Field label="Einzahlung/Überweisung (Art. 19)" hint="Entgegennahme einer Zahlung + Weiterleitung">
          <BetragsFeld value={ez} onChange={setEz} className={inputCls}
            placeholder="Summe (leer = keine)" aria-label="Einzahlungssumme" />
        </Field>
        <Field label="Gerichtsentscheid Summarsache (Art. 48)" hint="z. B. Rechtsöffnung — Ausgabe als RAHMEN, nie als Punktwert">
          <BetragsFeld value={sw} onChange={setSw} className={inputCls}
            placeholder="Streitwert (leer = keiner)" aria-label="Streitwert Entscheidgebühr" />
        </Field>
      </div>

      {fehler && <FehlerBox fehler={[fehler]} />}

      {ergebnis && (
        <ErgebnisBlock>
          <ErgebnisAnzeige titel="Betreibungskosten (GebV SchKG)" ergebnis={ergebnis} />
          <BegruendungAbsatz text={begruendungsAbsatz(ergebnis)} />
          <AktenzeichenFeld value={aktenzeichen} onChange={setAktenzeichen} />
          <div className="flex flex-wrap items-center gap-3">
            <PdfExportButton config={pdfConfig} />
            <LinkTeilenButton query={() => permalinkKodieren(GK_LINK_SPEC, {
              forderung: zahl(forderung), zb, zbAusf: zahl(zbAusf), zbVersuche: zahl(zbVersuche),
              pf: pf || undefined, vw: zahl(vw), vwKein, ez: zahl(ez), sw: zahl(sw),
            })} />
          </div>
        </ErgebnisBlock>
      )}
    </div>
  );
}
