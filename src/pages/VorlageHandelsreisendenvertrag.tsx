import { useMemo, type ReactNode } from 'react';
import {
  HR_DEFAULTS, hrZusammenstellen, pruefeHrGates, type HrAntworten,
} from '../lib/vorlagen/handelsreisendenvertrag';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { BetragsFeld } from '../components/BetragsFeld';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, inputCls } from '../components/vorlagen/ui';
import { SelectionGrid } from '../components/ui/SelectionGrid';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VariantenKopf } from '../components/vorlagen/VariantenKopf';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Handelsreisendenvertrag (Art. 347–350a OR) ────────────
// Sonderregime mit eigenem Schema (lib/vorlagen/handelsreisendenvertrag.ts).

const SPEICHER_KEY = 'lexmetrik.vorlage.handelsreisendenvertrag.v1';

const SCHRITTE = [
  { id: 'parteien', label: 'Parteien' },
  { id: 'taetigkeit', label: 'Tätigkeit & Vollmacht' },
  { id: 'lohn', label: 'Lohn & Auslagen' },
  { id: 'pruefen', label: 'Prüfen & Unterzeichnen' },
] as const;

const BANNER_HR: PdfBanner = {
  titel: 'HANDELSREISENDENVERTRAG – SCHRIFTLICH ZU REGELN (Art. 347a OR)',
  text: 'Zwingend sind die Delkredere-Schranke (¼, nur Privatkunden, Art. 348a OR), der gesonderte Auslagenersatz (Art. 349d OR) und die Saison-Kündigungsregel (Art. 350 OR). Subsidiär gelten die Art. 319 ff. OR.',
};

export function VorlageHandelsreisendenvertrag({ kopf }: { kopf: ReactNode }) {
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<HrAntworten>({ defaults: HR_DEFAULTS, speicherKey: SPEICHER_KEY });

  const { ergebnis } = useMemo(() => hrZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeHrGates(a), [a]);

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0) {
      if (!a.arbeitgeberName.trim()) f.push('Arbeitgeber angeben (Firma bzw. Name).');
      if (!a.arbeitgeberAdresse.trim()) f.push('Adresse des Arbeitgebers angeben.');
      if (!a.reisenderVorname.trim() || !a.reisenderName.trim()) f.push('Vor- und Nachname des Handelsreisenden angeben.');
      if (!a.reisenderAdresse.trim()) f.push('Adresse des Handelsreisenden angeben.');
    }
    if (i === 1) {
      if (!a.gegenstand.trim()) f.push('Gegenstand der Geschäfte angeben (Art. 347 OR).');
      if (!a.reisegebiet.trim()) f.push('Reisegebiet oder Kundenkreis angeben.');
      if (!a.beginn) f.push('Beginn angeben.');
    }
    if (i === 2) {
      if (a.lohnmodell !== 'provision' && !a.fixCHF.trim()) f.push('Festes Gehalt angeben (Art. 349a OR).');
      if (a.lohnmodell !== 'fix' && !a.provisionProzent.trim()) f.push('Provisionssatz angeben.');
      if (a.delkredere && !a.delkredereProvisionProzent.trim()) f.push('Delkredere-Provision angeben (Art. 348a Abs. 2 OR).');
    }
    if (i === 3 && !a.datum) f.push('Vertragsdatum angeben.');
    return f;
  };
  const fehler = fehlerImSchritt(schritt);

  const card = karte('arbeitsvertrag');

  const inhalt = () => {
    switch (SCHRITTE[schritt].id) {
      case 'parteien': return (
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="lc-overline">Arbeitgeber</p>
            <Field label="Firma / Name"><input className={inputCls} value={a.arbeitgeberName} onChange={(e) => set('arbeitgeberName', e.target.value)} placeholder="Muster AG" /></Field>
            <Field label="Adresse"><input className={inputCls} value={a.arbeitgeberAdresse} onChange={(e) => set('arbeitgeberAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" /></Field>
          </div>
          <div className="space-y-3">
            <p className="lc-overline">Handelsreisende/r</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Vorname"><input className={inputCls} value={a.reisenderVorname} onChange={(e) => set('reisenderVorname', e.target.value)} /></Field>
              <Field label="Nachname"><input className={inputCls} value={a.reisenderName} onChange={(e) => set('reisenderName', e.target.value)} /></Field>
            </div>
            <Field label="Adresse"><input className={inputCls} value={a.reisenderAdresse} onChange={(e) => set('reisenderAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" /></Field>
          </div>
        </div>
      );

      case 'taetigkeit': return (
        <div className="space-y-4">
          <Field label="Gegenstand der Geschäfte"><input className={inputCls} value={a.gegenstand} onChange={(e) => set('gegenstand', e.target.value)} placeholder="z. B. Werkzeugmaschinen" /></Field>
          <Field label="Reisegebiet / Kundenkreis"><input className={inputCls} value={a.reisegebiet} onChange={(e) => set('reisegebiet', e.target.value)} placeholder="z. B. Kantone BE und SO" /></Field>
          <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.ausschliesslich} onChange={(e) => set('ausschliesslich', e.target.checked)} />
            <span>Gebiet/Kundenkreis <strong>ausschliesslich</strong> zugewiesen <span className="text-ink-500">(Provision dann auf allen Geschäften im Gebiet, Art. 349/349b OR)</span></span>
          </label>
          <div className="space-y-2">
            <p className="lc-overline">Vollmacht (Art. 348b OR)</p>
            <SelectionGrid
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              items={([
                ['vermittlung', 'Nur Vermittlung', 'gesetzlicher Default'],
                ['abschluss', 'Abschluss', 'ohne Inkasso-/Stundungsbefugnis'],
              ] as const).map(([code, label, sub]) => ({ code, label, sub }))}
              value={a.vollmacht}
              onSelect={(code) => set('vollmacht', code)}
            />
          </div>
          <Field label="Beginn"><DatumsFeld value={a.beginn} onChange={(v) => set('beginn', v)} className={inputCls} /></Field>
        </div>
      );

      case 'lohn': return (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="lc-overline">Lohnmodell (Art. 349a OR)</p>
            <SelectionGrid
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
              items={([
                ['fix', 'Festes Gehalt', 'ohne Provision'],
                ['fix_provision', 'Fix + Provision', 'Gehalt + Provision'],
                ['provision', 'Reine Provision', 'nur wenn angemessen'],
              ] as const).map(([code, label, sub]) => ({ code, label, sub }))}
              value={a.lohnmodell}
              onSelect={(code) => set('lohnmodell', code)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {a.lohnmodell !== 'provision' && (
              <Field label="Festes Gehalt (CHF / Monat)"><BetragsFeld className={inputCls + ' num'} value={a.fixCHF} onChange={(v) => set('fixCHF', v)} placeholder="z. B. 5'000" /></Field>
            )}
            {a.lohnmodell !== 'fix' && (
              <>
                <Field label="Provisionssatz (%)"><input type="number" min={0} step={0.1} className={inputCls + ' num'} value={a.provisionProzent} onChange={(e) => set('provisionProzent', e.target.value)} /></Field>
                <Field label="Bezugsgrösse"><input className={inputCls} value={a.provisionBasis} onChange={(e) => set('provisionBasis', e.target.value)} placeholder="z. B. Nettoumsatz" /></Field>
              </>
            )}
          </div>
          <div className="space-y-2">
            <p className="lc-overline">Auslagenersatz (Art. 349d OR – stets gesondert)</p>
            <SelectionGrid
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              items={([
                ['effektiv', 'Effektiv', 'gegen Beleg'],
                ['pauschal', 'Pauschale', 'gesondert pro Monat'],
              ] as const).map(([code, label, sub]) => ({ code, label, sub }))}
              value={a.auslagen}
              onSelect={(code) => set('auslagen', code)}
            />
            {a.auslagen === 'pauschal' && (
              <Field label="Auslagenpauschale (CHF / Monat)"><BetragsFeld className={inputCls + ' num w-40'} value={a.auslagenPauschaleCHF} onChange={(v) => set('auslagenPauschaleCHF', v)} placeholder="z. B. 600" /></Field>
            )}
          </div>
          <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.saisonschwankung} onChange={(e) => set('saisonschwankung', e.target.checked)} />
            <span>Provision unterliegt erheblichen <strong>saisonalen Schwankungen</strong> <span className="text-ink-500">(Sonder-Kündigungsregel, Art. 350 OR)</span></span>
          </label>
          {a.detailgrad === 'experte' && (
            <div className="lc-card p-4 space-y-3">
              <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-900 font-medium">
                <input type="checkbox" className="mt-0.5" checked={a.delkredere} onChange={(e) => set('delkredere', e.target.checked)} />
                <span><strong>Delkredere</strong> vereinbaren <span className="text-ink-500">(nur Privatkunden, höchstens ¼, Art. 348a OR)</span></span>
              </label>
              {a.delkredere && (
                <Field label="Delkredere-Provision (%)" hint="ohne angemessene Provision ist die Haftungsabrede nichtig (Art. 348a Abs. 2 OR)">
                  <input type="number" min={0} step={0.1} className={inputCls + ' num w-40'} value={a.delkredereProvisionProzent} onChange={(e) => set('delkredereProvisionProzent', e.target.value)} />
                </Field>
              )}
            </div>
          )}
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {gates.blocker.length > 0 && (
            <div className="lc-notice-danger space-y-1">
              <p className="lc-overline text-danger-700 mb-1">Vor der Ausgabe zu beheben</p>
              {gates.blocker.map((b, i) => <p key={i} className="text-body-s text-danger-700">• {b}</p>)}
            </div>
          )}
          {gates.warnungen.map((w, i) => <div key={i} className="lc-notice-warn text-body-s">{w}</div>)}
          {gates.hinweise.map((h, i) => <div key={i} className="lc-notice text-body-s">{h}</div>)}

          <Field label="Ort und Datum des Vertragsschlusses">
            <div className="grid grid-cols-[1fr_11rem] gap-3">
              <input className={inputCls} value={a.ort} onChange={(e) => set('ort', e.target.value)} placeholder="z. B. Zürich" />
              <DatumsFeld value={a.datum} onChange={(v) => set('datum', v)} className={inputCls} />
            </div>
          </Field>

          <section className="lc-highlight space-y-3">
            <p className="lc-overline text-brass-700">Form-Gate</p>
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>Schriftlich regeln</strong> (Art. 347a OR): Soweit nicht schriftlich, gelten Gesetz und übliche Bedingungen.</li>
              <li><strong>Beidseitig unterzeichnen.</strong> Anwendbare GAV/NAV gehen vor.</li>
            </ul>
            <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Dies ist ein Entwurf nach festen Bausteinen; die zwingenden Schranken (348a/349d/350 OR) und der Einzelfall sind gesondert zu prüfen.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Vertrag als PDF', banner: BANNER_HR, dateiName: 'Handelsreisendenvertrag-Entwurf.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Vertrag als Word (DOCX)', banner: BANNER_HR, dateiName: 'Handelsreisendenvertrag-Entwurf.docx' }
              : undefined} />
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Arbeit'} · Vorlage`}
      titel="Handelsreisendenvertrag"
      intro="Stellt einen Handelsreisendenvertrag nach Art. 347 ff. OR aus festen Bausteinen zusammen – mit der Vollmachts-Weiche (Vermittlung/Abschluss), den zwingenden Delkredere- und Auslagenersatz-Schranken und der Saison-Kündigungsregel. Ohne Sprachmodell: gleiche Eingaben, gleiches Dokument."
      norms={card?.norms ?? []}
      badge="Schriftlich zu regeln"
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      kopfSchalter={<div className="space-y-3">
        {kopf}
        <VariantenKopf detailgrad={a.detailgrad} onDetailgrad={(v) => set('detailgrad', v)} />
      </div>}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} direktExport={{
        pdf: { label: 'PDF', banner: BANNER_HR, dateiName: 'Handelsreisendenvertrag-Entwurf.pdf' },
        docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_HR, dateiName: 'Handelsreisendenvertrag-Entwurf.docx' } : undefined,
        blocker: gates.blocker,
      }} />}
    />
  );
}
