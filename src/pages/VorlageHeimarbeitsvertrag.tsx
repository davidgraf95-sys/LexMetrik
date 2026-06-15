import { useMemo, type ReactNode } from 'react';
import {
  HA_DEFAULTS, haZusammenstellen, pruefeHaGates, type HaAntworten,
} from '../lib/vorlagen/heimarbeitsvertrag';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { BetragsFeld } from '../components/BetragsFeld';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, GruppenTitel, inputCls } from '../components/vorlagen/ui';
import { SelectionGrid } from '../components/ui/SelectionGrid';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VariantenKopf } from '../components/vorlagen/VariantenKopf';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Heimarbeitsvertrag (Art. 351–354 OR) ──────────────────
// Sonderregime mit eigenem Schema (lib/vorlagen/heimarbeitsvertrag.ts).

const SPEICHER_KEY = 'lexmetrik.vorlage.heimarbeitsvertrag.v1';

const SCHRITTE = [
  { id: 'parteien', label: 'Parteien' },
  { id: 'arbeit', label: 'Arbeit & Material' },
  { id: 'lohn', label: 'Lohn & Dienst' },
  { id: 'pruefen', label: 'Prüfen & Unterzeichnen' },
] as const;

const BANNER_HA: PdfBanner = {
  titel: 'HEIMARBEITSVERTRAG (Art. 351 ff. OR)',
  text: 'Lohn und Material-Entschädigung sind vor der Arbeitsausgabe schriftlich anzugeben (Art. 351a OR). Zwingend sind die Wochen-Prüffrist (Art. 353 OR) und die Haftungsschranke auf die Selbstkosten (Art. 352a OR).',
};

export function VorlageHeimarbeitsvertrag({ kopf }: { kopf: ReactNode }) {
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<HaAntworten>({ defaults: HA_DEFAULTS, speicherKey: SPEICHER_KEY });

  const { ergebnis } = useMemo(() => haZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeHaGates(a), [a]);

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0) {
      if (!a.arbeitgeberName.trim()) f.push('Arbeitgeber angeben (Firma bzw. Name).');
      if (!a.arbeitgeberAdresse.trim()) f.push('Adresse des Arbeitgebers angeben.');
      if (!a.heimarbeiterVorname.trim() || !a.heimarbeiterName.trim()) f.push('Vor- und Nachname des Heimarbeitnehmers angeben.');
      if (!a.heimarbeiterAdresse.trim()) f.push('Adresse des Heimarbeitnehmers angeben.');
    }
    if (i === 1 && !a.arbeitsbeschrieb.trim()) f.push('Auszuführende Arbeiten angeben (Art. 351 OR).');
    if (i === 2 && !a.lohnAngabe.trim()) f.push('Lohn angeben (Art. 351a/353a OR).');
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
            <GruppenTitel>Arbeitgeber</GruppenTitel>
            <Field label="Firma / Name"><input className={inputCls} value={a.arbeitgeberName} onChange={(e) => set('arbeitgeberName', e.target.value)} placeholder="Muster AG" /></Field>
            <Field label="Adresse"><input className={inputCls} value={a.arbeitgeberAdresse} onChange={(e) => set('arbeitgeberAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" /></Field>
          </div>
          <div className="space-y-3">
            <GruppenTitel>Heimarbeitnehmer/in</GruppenTitel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Vorname"><input className={inputCls} value={a.heimarbeiterVorname} onChange={(e) => set('heimarbeiterVorname', e.target.value)} /></Field>
              <Field label="Nachname"><input className={inputCls} value={a.heimarbeiterName} onChange={(e) => set('heimarbeiterName', e.target.value)} /></Field>
            </div>
            <Field label="Adresse"><input className={inputCls} value={a.heimarbeiterAdresse} onChange={(e) => set('heimarbeiterAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" /></Field>
          </div>
        </div>
      );

      case 'arbeit': return (
        <div className="space-y-4">
          <Field label="Auszuführende Arbeiten"><input className={inputCls} value={a.arbeitsbeschrieb} onChange={(e) => set('arbeitsbeschrieb', e.target.value)} placeholder="z. B. Konfektionierung von Verpackungen" /></Field>
          <Field label="Arbeitsraum"><input className={inputCls} value={a.arbeitsraum} onChange={(e) => set('arbeitsraum', e.target.value)} placeholder="in der Wohnung des Heimarbeitnehmers" /></Field>
          <div className="space-y-2">
            <GruppenTitel>Material und Geräte</GruppenTitel>
            <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={a.materialVomArbeitgeber} onChange={(e) => set('materialVomArbeitgeber', e.target.checked)} />
              <span>Material/Geräte werden vom Arbeitgeber gestellt <span className="text-ink-500">(Sorgfalts-/Rückgabepflicht, Haftung höchstens Selbstkosten, Art. 352a OR)</span></span>
            </label>
            <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={a.materialBeschafftHeimarbeiter} onChange={(e) => set('materialBeschafftHeimarbeiter', e.target.checked)} />
              <span>Heimarbeitnehmer/in beschafft (auch) Material selbst <span className="text-ink-500">(Entschädigung schriftlich, Art. 351a OR)</span></span>
            </label>
            {a.materialBeschafftHeimarbeiter && (
              <Field label="Material-Entschädigung"><input className={inputCls} value={a.materialEntschaedigung} onChange={(e) => set('materialEntschaedigung', e.target.value)} placeholder="z. B. CHF 0.20 pro Stück" /></Field>
            )}
          </div>
          <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.probearbeit} onChange={(e) => set('probearbeit', e.target.checked)} />
            <span>Es wird zunächst eine <strong>Probearbeit</strong> übergeben <span className="text-ink-500">(Verhältnis auf bestimmte Zeit zur Probe, Art. 354 Abs. 1 OR)</span></span>
          </label>
        </div>
      );

      case 'lohn': return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_12rem] gap-3">
            <Field label="Lohn"><BetragsFeld className={inputCls + ' num'} value={a.lohnAngabe} onChange={(v) => set('lohnAngabe', v)} placeholder="z. B. 4.50" /></Field>
            <Field label="Einheit"><input className={inputCls} value={a.lohnEinheit} onChange={(e) => set('lohnEinheit', e.target.value)} placeholder="pro Stück" /></Field>
          </div>
          <div className="space-y-2">
            <GruppenTitel>Dienstverhältnis (Art. 353a/353b/354 OR)</GruppenTitel>
            <SelectionGrid
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              items={([
                ['true', 'Ununterbrochen', 'halbmonatlich; 324/324a; unbefristet'],
                ['false', 'Auf Abruf / fallweise', 'Lohn bei Ablieferung; befristet'],
              ] as const).map(([code, label, sub]) => ({ code, label, sub }))}
              value={a.ununterbrochen ? 'true' : 'false'}
              onSelect={(code) => set('ununterbrochen', code === 'true')}
            />
          </div>
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
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
              <li><strong>Lohn und Material-Entschädigung schriftlich</strong> vor der Arbeitsausgabe (Art. 351a OR).</li>
              <li><strong>Beidseitig unterzeichnen.</strong> Vorbehalten bleibt das Heimarbeitsgesetz (SR 822.31).</li>
            </ul>
            <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Dies ist ein Entwurf nach festen Bausteinen; die zwingenden Regeln (351a/352a/353 OR) und der Einzelfall sind gesondert zu prüfen.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Vertrag als PDF', banner: BANNER_HA, dateiName: 'Heimarbeitsvertrag-Entwurf.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Vertrag als Word (DOCX)', banner: BANNER_HA, dateiName: 'Heimarbeitsvertrag-Entwurf.docx' }
              : undefined} />
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Arbeit'} · Vorlage`}
      titel="Heimarbeitsvertrag"
      intro="Stellt einen Heimarbeitsvertrag nach Art. 351 ff. OR aus festen Bausteinen zusammen – mit der schriftlichen Lohn-/Materialangabe vor der Arbeitsausgabe, der Haftungsschranke auf die Selbstkosten und der Wochen-Prüffrist. Ohne Sprachmodell: gleiche Eingaben, gleiches Dokument."
      norms={card?.norms ?? []}
      badge="Lohn/Material schriftlich anzugeben"
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      kopfSchalter={<div className="space-y-3">
        {kopf}
        <VariantenKopf detailgrad={a.detailgrad} onDetailgrad={(v) => set('detailgrad', v)} />
      </div>}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} direktExport={{
        pdf: { label: 'PDF', banner: BANNER_HA, dateiName: 'Heimarbeitsvertrag-Entwurf.pdf' },
        docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_HA, dateiName: 'Heimarbeitsvertrag-Entwurf.docx' } : undefined,
        blocker: gates.blocker,
      }} />}
    />
  );
}
